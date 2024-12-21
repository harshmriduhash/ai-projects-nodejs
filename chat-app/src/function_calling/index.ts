import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})
// Configure the function calling

const getCurrentTimeAndDate = () => {
    const date = new Date();
    return date.toLocaleString();
}


const getTaskStatus = (taskId: string) => {
    console.log("Getting task status for task id : ", taskId);
    if(parseInt(taskId) % 2 === 0){
        return "Task is completed";
    }else{
        return "Task is pending";
    }
}

const callOpenAIWithFunctionCalling = async () => {
    const context : OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
            role:"system",
            content: "Act cool like gen alpha. You are an assistant who can also give current time and date and status of a task."
        },
        // {
        //     role: "user",
        //     content: "What's the date and time right now?"
        // },
        // {
        //     role: "user",
        //     content: "What is the status of task 1234?"
        // },
        {
            role: "user",
            content: "What is the status of task 1234?"
        }
    ]

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: context,
        tools: [
            {
                type: "function",
                function:{
                    name: "getCurrentTimeAndDate",
                    description: "Get the current time and date",

                }
            },
            {
                type: "function",
                function:{
                    name: "getTaskStatus",
                    description: "Get the status of a task",
                    parameters:{
                        type: "object",
                        properties: {
                            taskId:{
                                type: "string",
                                description: "The Task ID",
                            },
                        },
                        required: ["taskId"],
                    },
                }
            }
        ],
        tool_choice: "auto" //openai will decide which function to use
    })

    console.log("First OpenAI response : ",response.choices[0].message.content);
// Call the function with the response from OpenAI

    const shouldInvokeFunction = 
    response.choices[0].finish_reason === "tool_calls";
    const toolCall = response.choices[0].message.tool_calls?.[0];
    if(!toolCall){
        return;
    }
    if (shouldInvokeFunction) {
        const functionName = toolCall.function.name;

        if (functionName === "getCurrentTimeAndDate") {
            const functionResponse = getCurrentTimeAndDate();
            context.push(response.choices[0].message);
            context.push({
              role: "tool",
              content: functionResponse,
              tool_call_id: toolCall.id,
            });
          }
        if (functionName === "getTaskStatus") {
            //extract parameters from tool call
            const argRaw = toolCall.function.arguments;
            const parsedArgs = JSON.parse(argRaw);
            const functionResponse = getTaskStatus(parsedArgs.taskId);
            context.push(response.choices[0].message);
            context.push({
              role: "tool",
              content: functionResponse,
              tool_call_id: toolCall.id,
            });
          }
    }

    const finalResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: context,
    })

    console.log("Final response : ",finalResponse.choices[0].message.content);

}

callOpenAIWithFunctionCalling();



//Decide which function to call based on the message received
// Call the function and pass the message to the function
// call openAI with the function response
