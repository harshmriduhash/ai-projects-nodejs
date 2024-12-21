import OpenAI from "openai";
import { encoding_for_model } from "tiktoken";
const openai = new OpenAI({

    apiKey: process.env.OPENAI_API_KEY
})
const encoder = encoding_for_model("gpt-4o-mini");

const MAX_TOKENS = 500

const context : OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
        role:"system",
        content: "Act cool like gen alpha"
    }
]

const createChat = async () => {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: context,
    })
    const responseMessage = response.choices[0].message;
    context.push(responseMessage)
    console.log(response.choices[0].message.content)

    if(response.usage && response.usage.total_tokens > MAX_TOKENS) {
        removeOlderTokens();
    }
}

// process.stdin.addListener is a way to listen to the user input from command line
process.stdin.addListener("data", async (input) => {
    const userInput = input.toString().trim();
    context.push({
        role: "user",
        content: userInput,
    })
    await createChat();
})

const getContextLength = () => {
    let length = 0;
    context.forEach((message:OpenAI.Chat.Completions.ChatCompletionMessageParam) => {
        if(typeof message.content === "string") {
            length += encoder.encode(message.content).length;
        }
        else if (Array.isArray(message.content)) {
            message.content.forEach((content) => {
                if(content.type === "text") {
                    length += encoder.encode(content.text).length
                }
            })
        }
    })
    return length

}

const removeOlderTokens = () => {
    let contextLength = getContextLength();
    while(contextLength > MAX_TOKENS) {{
        for(let i = 0; i < context.length; i++) {
            const message = context[i];
            if(message.role !== "system") {
                context.splice(i, 1);
                contextLength = getContextLength();
                console.log("Updated context length : ", contextLength)
                break;
                }
    }}
    }
}