import {ChatOpenAI} from '@langchain/openai'
import { ChatPromptTemplate } from "@langchain/core/prompts";

const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0.8,
})


const fromTemplate = async () =>{
    const prompt = ChatPromptTemplate.fromTemplate(
        "Write a summary of the movie {movieName}."
    );

    // const completePrompt = await prompt.format({
    //     movieName:"Inception",
    // })

    // console.log(completePrompt);

    // creating chain: connecting model with the prompt
    const chain = prompt.pipe(model);
    const response = await chain.invoke({
        movieName: "Inception",
    })

    console.log(response.content);



}
const fromMessage = async () =>{
// drawback is fromMessage does not have type checking
// but it will throw error

    const prompt = ChatPromptTemplate.fromMessages([
        ["system","Write a summary of the movie {movieName}."],
        ["user","{movieName}"],
    ])

    const chain = prompt.pipe(model);
    const response = await chain.invoke({
        movieName: "Inception",
    })

    console.log(response.content);
}

// fromTemplate();

fromMessage();