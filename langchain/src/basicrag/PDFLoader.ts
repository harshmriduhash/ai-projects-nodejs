import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';  

const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.8,
});

// console.log("model:",model);


const question = "What is Somatosensory System consited of?";

const main = async () => {
  //  create a web loader
  const loader = new PDFLoader("sample_pdfs/somatosensory.pdf",{
    splitPages: false,
  })
  // load the document
  const docs = await loader.load();
  // console.log("docs:",docs);

  const splitter = new RecursiveCharacterTextSplitter({
    separators: [`\n`, `\n\n`],
    });

  const splittedDocs = await splitter.splitDocuments(docs);

//   console.log("splittedDocs:",splittedDocs);


  // Create an embedding instance
  const embeddings = new OpenAIEmbeddings();
  // console.log("embeddings:",embeddings);

  // Create a vector store (in memory for this example)
  const vectorStore = new MemoryVectorStore(embeddings);

  // console.log("vectorStore:",vectorStore);
  // Add documents to the vector store
  await vectorStore.addDocuments(splittedDocs);

  // console.log("vectorStore:",vectorStore);

  // Retrieve the top 2 most similar documents

  const retriver = vectorStore.asRetriever({
    k: 3,
  });

  // console.log("retriver:",retriver);

  const result = await retriver.invoke(question);
  // console.log("result:",result)
  const resultDocuments = result.map((doc) => doc.pageContent);
  console.log("resultDocuments:", resultDocuments);
  // build template for chat
  const template = ChatPromptTemplate.fromMessages([
    [
      "system",
      "Answer to users question based on the following context: {context}",
    ],
    ["user", "{query}"],
  ]);

  // console.log("template:",template);

  const chain = template.pipe(model);
  // console.log("chain:",chain);
  const response = await chain.invoke({
    query: question,
    context: resultDocuments,
  });
  // console.log("response:",response);
  console.log(response.content);
};

main();
