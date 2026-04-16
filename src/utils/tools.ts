export const chatTools = [
    {
        name: "calculator",
        description: "Perform basic mathematical calculations when requested by the user.",
        parameters: {
            type: "OBJECT",
            properties: {
                expression: {
                    type: "STRING",
                    description: "The mathematical expression to evaluate (e.g., '12 * 5 + 10')"
                }
            },
            required: ["expression"]
        }
    },
    {
        name: "get_current_time",
        description: "Get the current time in a specific timezone.",
        parameters: {
            type: "OBJECT",
            properties: {
                timezone: {
                    type: "STRING",
                    description: "The timezone to get the time for (e.g., 'America/New_York', 'UTC')"
                }
            },
            required: ["timezone"]
        }
    }
];
