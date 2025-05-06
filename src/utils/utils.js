const { pipeline } = require('@huggingface/transformers');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// This function fetches similar notes from the database using a query embedding
async function getSimilarNotes(query) {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

    const { data, error } = await supabase.rpc('match_documents', {
        query_embedding: query,
        match_threshold: 0.50,
        match_count: 10,
    });

    if (error) {
        console.error('Error fetching similar notes:', error);
        return null;
    }

    const content = data.map((item) => item.content).join('\n\n');
    return content;
}

// This function creates embeddings for a single item
async function createEmbeddings(item) {
    const pipe = await pipeline('feature-extraction', 'jinaai/jina-embeddings-v2-base-code');

    try {
        const result = await pipe(item, {
            return_tensors: true,
            padding: true,
            truncation: true,
            max_length: 512,
        });
        const embedding = Array.from(result[0][0].ort_tensor.cpuData);
        return embedding;
    } catch (error) {
        console.error('Error creating embeddings:', error);
    }
}

// This function creates and stores embeddings in the database
async function createAndStoreEmbeddings(input, content) {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const pipe = await pipeline('feature-extraction', 'jinaai/jina-embeddings-v2-base-code');

    await Promise.all(
        input.map(async (item) => {
            const result = await pipe(item[content], {
                return_tensors: true,
                padding: true,
                truncation: true,
                max_length: 512,
            });

            const embedding = Array.from(result[0][0].ort_tensor.cpuData);

            const { error } = await supabase
                .from('documents')
                .insert([
                    {
                        content: item[content],
                        embedding: embedding,
                    },
                ]);

            if (error) {
                console.error('Error inserting:', error);
            }
        })
    );
}

module.exports = {
    getSimilarNotes,
    createAndStoreEmbeddings,
    createEmbeddings
};