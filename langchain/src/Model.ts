import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.8,
  maxTokens: 900,
//   verbose: true,
});

const main = async () => {

//1. invoke
//   const responseFirst = await model.invoke(
//     "What is the capital of France?"
// );
// console.log(responseFirst);

//2. batch
// const responseFirst = await model.batch([
//     "Hi", "How are you?",
// ])
// console.log(responseFirst);

//3. stream
const response = await model.stream(
    "hi give me recmmendations for four movies"
)

for await (const res of response) {
    console.log(res.content);
}

};
 main();