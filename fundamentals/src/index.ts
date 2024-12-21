import { OpenAI } from 'openai'
import { encoding_for_model } from 'tiktoken';

// Create an instance of the OpenAI class
if(!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY");
}


const openai = new OpenAI({
// there is no need to pass the key here if it is already present as an environment variable OPENAI_API_KEY
    apiKey: process.env.OPENAI_API_KEY
});

const main = async () => {

    // Define the prompt
    const prompt = "What is the capital of France?";

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages:[
            {
                role:"user",
                content: prompt,
            },
            {
                role: "system",
                content: "You are a conversational AI assistant.",
            },
        ],
        max_tokens: 100,
        n: 2,
        frequency_penalty: 1.5,
        temperature: 0.5,
    });

    console.log(response.choices[0].message);
    console.log(response.choices[1].message);
}

const encodePrompt = async (prompt: string) => {
    // create an encoder for the model
    const encoder = encoding_for_model("gpt-4o-mini");
    // encode the prompt
    const tokens = encoder.encode(prompt);

    console.log(tokens);
}

encodePrompt("What is the capital of France?");

main();