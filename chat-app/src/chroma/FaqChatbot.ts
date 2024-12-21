// generate information about Singapore string in 100 words

import { ChromaClient, OpenAIEmbeddingFunction } from "chromadb";
import OpenAI from "openai";

const chroma = new ChromaClient({
    path: 'http://localhost:8000',
});


const faqSingaporeInfo = `Singapore is a city-state in Southeast Asia. It is the capital of Singapore and is located in the southern tip of the island of Southeast Asia. It is a multi-cultural city-state with a rich history and a diverse population.It's Land area is 640 sq.km. It is the largest city-state in the world. It is a member of the Southeast Asian Union and is the third largest country in the world by population annd have population 5.88 million.`;

const faqIndiaInfo = `India is a country in South Asia. It is the seventh largest country in the world by area and the second largest in terms of population. It is a member of the Indian Union and is an independent country. India is a multi-cultural country with a rich history and a diverse population. It is a member of the South Asian Union and is the third largest country in the world by population.`;

const faqAustraliaInfo = `Australia, officially the Commonwealth of Australia, is a country comprising the mainland of the Australian continent, the island of Tasmania and numerous smaller islands. Australia has a total area of 7,688,287 sq km (2,968,464 sq mi), making it the sixth-largest country in the world and the largest country by area in Oceania.`

if(!process.env.OPENAI_API_KEY){
    throw new Error("OPENAI_API_KEY is not set");
}

const embeddingFunction: OpenAIEmbeddingFunction = new OpenAIEmbeddingFunction({
    openai_api_key: process.env.OPENAI_API_KEY,
    openai_model: "text-embedding-3-small",
})

const  collectionName = "faq-singapore"

const createCollection = async () => {
    await chroma.createCollection({
        name: collectionName,
        embeddingFunction
    })
}
const getCollection = async () => {
    const collection = await chroma.getCollection({
        name: collectionName,
        embeddingFunction
    });
    return collection;
} 

const populateCollection = async () =>{
    const collection = await getCollection();
    await collection.add({
        ids: ["id1","id2","id3"],
        documents:[faqSingaporeInfo,faqIndiaInfo,faqAustraliaInfo]
    })
}

const askQuestions = async () => {
    const question = "What's the ranking of India Population wise?"
    const collection = await getCollection();
    const response = await collection.query({
        queryTexts: question,
        nResults: 1,
    });
    const relevantInfo = response.documents[0][0];
    if(relevantInfo){
        const openai = new OpenAI()
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0,
            messages: [
                {
                    role: "assistant",
                    content: `Answer the question using the information provided:${relevantInfo}`,
                },
                {
                    role: "user",
                    content: question
                }
            ]
        })
        const responseMsg = response.choices[0].message;
        console.log(responseMsg.content)
        
        
    }
else{
    console.log("No relevant information found");

}
    
}


const main = async () => {
    // ONly need to run First time
    // await createCollection();
    // await populateCollection();
    await askQuestions();
}
main();