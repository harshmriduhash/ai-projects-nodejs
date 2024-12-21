import { DataWithEmbeddings, generateEmbeddings, loadInputJson } from "./main";

const dotProduct = (a: number[], b: number[]) => {
  // multiply each element of a with the corresponding element of b and sum them up
  return a.map((val, index) => val * b[index]).reduce((a, b) => a + b, 0);
};


// angle between two vectors
export const cosineSimilarity = (a: number[], b: number[]) =>{
  const dot = dotProduct(a, b);
  // normA = sqrt(a1^2 + a2^2 + a3^2 + ... + an^2) or magnitude of vector a
  const normA = Math.sqrt(dotProduct(a, a));
  //normB = sqrt(b1^2 + b2^2 + b3^2 + ... + bn^2) or magnitude of vector b
  const normB = Math.sqrt(dotProduct(b, b));
 return dot / (normA * normB);
}

const main = async () => {
  const dataWithEmbeddings = loadInputJson<DataWithEmbeddings[]>("dataWithembeddings2.json");
  // case sensitive // may affect results
  // it only uses the word similarity
const input = 'Number of kangaroos in Australia';

const inputEmbeddings = await generateEmbeddings(input);

const similarities: {
  input: string;
  similarity: number;
}[] = dataWithEmbeddings.map((data) => ({
  input: data.input,
  similarity: cosineSimilarity(data.embeddings, inputEmbeddings.data[0].embedding),
}))

const sortedSimilarites = similarities.sort((a, b) => b.similarity - a.similarity);

console.log(`Similarity of ${input}`,sortedSimilarites);
}

main();