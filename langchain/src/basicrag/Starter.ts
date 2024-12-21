import {ChatOpenAI, OpenAIEmbeddings} from '@langchain/openai'
import {MemoryVectorStore} from 'langchain/vectorstores/memory'
import {Document} from '@langchain/core/documents'
import { ChatPromptTemplate } from '@langchain/core/prompts';

const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0.8,
});

// console.log("model:",model);

const hardCodedData = [
    "My full name is John Doe",
    "I am a software engineer",
    "My favorite programming language is JavaScript",
    "My favorite programming language is also Python",
    "My favorite programming language is also Rust",
    "I love to play the guitar",
]

const question = "What is my favorite programming language?"

const main = async () =>{
    // Create an embedding instance
    const embeddings = new OpenAIEmbeddings();
    // console.log("embeddings:",embeddings);

    // Create a vector store (in memory for this example)
    const vectorStore = new MemoryVectorStore(embeddings);

    // console.log("vectorStore:",vectorStore);
    // Add documents to the vector store
    await vectorStore.addDocuments(
        hardCodedData.map((text) => new Document({ pageContent: text }))
      );

    // console.log("vectorStore:",vectorStore);

      // Retrieve the top 2 most similar documents
    
    const retriver = vectorStore.asRetriever({
        k: 3,
    });

    // console.log("retriver:",retriver);

    const result = await retriver.invoke(question);
    // console.log("result:",result)
    const resultDocuments = result.map((doc) => doc.pageContent);
    console.log("resultDocuments:",resultDocuments);
    // build template for chat
    const template = ChatPromptTemplate.fromMessages([
        [
            "system",
            "Answer to users question based on the following context: {context}"
        ],
        [
            "user",
            "{query}",
        ]
    ]);

    // console.log("template:",template);

    const chain = template.pipe(model);
    // console.log("chain:",chain);
    const response = await chain.invoke({
        query: question,
        context: resultDocuments,
    })
    // console.log("response:",response);
    console.log(response.content);

}

main();