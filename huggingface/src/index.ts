import { HfInference } from "@huggingface/inference";
import { writeFile } from "fs";

if (!process.env.HUGGING_FACE_TOKEN) {
    throw new Error("HUGGING_FACE_TOKEN is not set");
}

const inference = new HfInference(process.env.HUGGING_FACE_TOKEN);

const generateEmbedding = async () => {
    const result = await inference.featureExtraction({
      inputs: "Hello world",
      model: "BAAI/bge-small-en-v1.5",
    });
    console.log(result);
  };

// generateEmbedding();


const translate = async () => {
    const result = await inference.translation({
      inputs: "Hello world",
      model: "Helsinki-NLP/opus-mt-en-ro",
    })

    console.log(result);
}

  
// translate();

const translateWithParam = async () => {
    const result = await inference.translation({
      inputs: "Hello world",
      model: "facebook/nllb-200-distilled-600M",
      // @ts-ignore
      parameters:{
        src_lang: "en_XX",
        tgt_lang: "fr_XX",
      }
      
    })

    console.log(result);
}

// translateWithParam();


const questionAnswering = async () =>{
    const result = await inference.questionAnswering({
        inputs:{
            // give context on apollo program in more than 60 words
            context: "The Apollo program was the second human spaceflight program carried out by NASA, with the first manned mission, Apollo 7, launching on October 11, 1968.",
            question:"What is the goal of the Apollo program?"
        }

    })
    console.log(result);
}

// questionAnswering();

const textToImage = async () => {

    // this will be a blob
    const result = await inference.textToImage({
        inputs: "Squirrel eating a nut",
        model: "stabilityai/stable-diffusion-2",
        parameters: {
            negative_prompt: "blurry" // don't blur
        }
        });

    // transfer blob

    const buffer = Buffer.from(await result.arrayBuffer());
    writeFile("image.jpg", buffer, () => {
        console.log("Image saved");
    })
}

// textToImage();

