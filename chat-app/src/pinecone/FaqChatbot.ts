import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

if (!process.env.PINECONE_API_KEY) {
  throw new Error("PINECONE_API_KEY is not set");
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const faqSingaporeInfo = `Singapore is a city-state in Southeast Asia. It is the capital of Singapore and is located in the southern tip of the island of Southeast Asia. It is a multi-cultural city-state with a rich history and a diverse population.It's Land area is 640 sq.km. It is the largest city-state in the world. It is a member of the Southeast Asian Union and is the third largest country in the world by population annd have population 5.88 million.`;

const faqIndiaInfo = `India is a country in South Asia. It is the seventh largest country in the world by area and the second largest in terms of population with population 1 billion. It is a member of the Indian Union and is an independent country. India is a multi-cultural country with a rich history and a diverse population. It is a member of the South Asian Union and is the third largest country in the world by population.`;

const faqAustraliaInfo = `Australia, officially the Commonwealth of Australia, is a country comprising the mainland of the Australian continent, the island of Tasmania and numerous smaller islands. Australia has a total area of 7,688,287 sq km (2,968,464 sq mi), making it the sixth-largest country in the world and the largest country by area in Oceania.`;


// metadata
type FaqData = {
  faqInfo: string;
  reference: string;
  relevance: number;
};

const dataToEmbed: FaqData[] = [
  {
    faqInfo: faqSingaporeInfo,
    reference: "Singapore",
    relevance: 0.93,
  },
  {
    faqInfo: faqIndiaInfo,
    reference: "India",
    relevance: 0.77,
  },
  {
    faqInfo: faqAustraliaInfo,
    reference: "Australia",
    relevance: 0.88,
  },
];

const pineconeIndex = pinecone.index<FaqData>("quickstart");

const storeEmbeddings = async () => {
  await Promise.all(
    dataToEmbed.map(async (data, index) => {
      const embeddingResult = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: [data.faqInfo],
      });
      const embedding = embeddingResult.data[0].embedding;
      await pineconeIndex.upsert([
        {
          id: `id-${index}`,
          values: embedding,
          metadata: data,
        },
      ]);
    })
  );
};

const queryEmbeddings = async (question: string) => {
  const queryEmbeddingResult = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: question,
  });
  const questionEmbedding = queryEmbeddingResult.data[0].embedding;
  const results = await pineconeIndex.query({
    vector: questionEmbedding,
    topK: 1,
    includeMetadata: true,
    includeValues: true,
  });
  console.log(results);
  return results;
};

const askOpneAI = async (question: string, relevantInfo: string) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      {
        role: "assistant",
        content: `Answer the next question using this information: ${relevantInfo}`,
      },
      {
        role: "user",
        content: question,
      },
    ],
  });

  const responseMsg = response.choices[0].message;
  console.log(responseMsg.content);
};

const main = async () => {
//   await storeEmbeddings();
//   console.log("Embeddings stored in Pinecone")


  const question = "What is the population of India?";
  const result = await queryEmbeddings(question);

  const relevantInfo = result.matches[0].metadata;

  if (relevantInfo) {
    await askOpneAI(question, relevantInfo.faqInfo);
  }
};

main();
