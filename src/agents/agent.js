const { InferenceClient } = require("@huggingface/inference");
const { getSimilarNotes, createEmbeddings } = require("../utils/utils.js");
const tools = require("../utils/toolCalls.js");
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const availableFunctions = {
    getSimilarNotes,
};

const client = new InferenceClient(process.env.HUGGINGFACE_API_KEY);

async function askAgent(question) {
    const MAX_ITERATIONS = 5;

    const messages = [
        {
            role: "system",
            content:
                "You are a helpful assistant that can answer questions. If the user asks any question regarding their own notes, you can call the getSimilarNotes function to get the most relevant notes to provide the right context.",
        },
        {
            role: "user",
            content: question,
        },
    ];

    for (let i = 0; i < MAX_ITERATIONS; i++) {
        const chatCompletion = await client.chatCompletion({
            provider: "novita",
            model: "deepseek-ai/DeepSeek-V3-0324",
            messages,
            tool_choice: "auto",
            tools,
        });

        const ResponseChoice = chatCompletion.choices[0];
        const FinishReason = ResponseChoice.finish_reason;

        if (FinishReason === "stop") {
            return ResponseChoice.message.content;
        } else if (FinishReason === "tool_calls") {
            const toolCalls = ResponseChoice.message.tool_calls;

            for (const toolCall of toolCalls) {
                const toolName = toolCall.function.name;
                let toolArgs = JSON.parse(toolCall.function.arguments);

                if (toolName === "getSimilarNotes") {
                    toolArgs = await createEmbeddings(toolArgs.query);
                }

                const toolResult = await availableFunctions[toolName](toolArgs);

                messages.push({
                    role: "tool",
                    name: toolName,
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(toolResult),
                });

                messages.push({
                    role: "assistant",
                    tool_calls: [toolCall],
                    content: null,
                });
            }
        }
    }

    return "Please try again, something went wrong.";
}

module.exports = { askAgent };