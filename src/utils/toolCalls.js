const tools = [
    {
        type: "function",
        function: {
            name: "getSimilarNotes",
            description: "Get similar notes from the vector database after running similarity check.",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "The question of the user to get relevant notes to.",
                    },
                },
                required: ["query"],
            },
        },
    },
];

module.exports = tools;

