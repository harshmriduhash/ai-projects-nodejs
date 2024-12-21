// Requires additional configuration in tsconfig.json and package.json
// "type": "module","target": "ESNext" ,"module": "NodeNext"
import { pipeline, round } from "@xenova/transformers";
import wavefile from "wavefile";

// console.log(round(0.5, 2));

const generateEmbedding = async () => {
  const embedder = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  );
  const result = await embedder("Hello world", {
    pooling: "mean",
    normalize: true,
  });
  console.log(result);
};

// generateEmbedding();

const genText = async () => {
  const textGenerator = await pipeline(
    "text2text-generation",
    "Xenova/LaMini-Flan-T5-783M"
  );
  const result = await textGenerator("Please suggest some indian dishes", {
    max_new_tokens: 100,
    temperature: 0.8,
    repetition_penalty: 2.0,
  });
  console.log(result);
};

// genText();

const speechRecognition = async () => {
  // creating a transcriber
  let transcriber = await pipeline(
    "automatic-speech-recognition",
    "Xenova/whisper-small.en"
  );
  let url =
    "https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/jfk.wav";

  // converting the audio file to a buffer
  let buffer = Buffer.from(await fetch(url).then((item) => item.arrayBuffer()));

  // Processing our audio file
  let wav = new wavefile.WaveFile(buffer);

  wav.toBitDepth("32f"); // convert to 32 bit float as pipeline expects it
  wav.toSampleRate(16000); // convert to 16khz as the whisper-small.en model expects it

  let audioData = wav.getSamples();
  if (Array.isArray(audioData)) {
    if (audioData.length > 1) {
      const SCALING_FACTOR = Math.sqrt(2);
      // Merge all the channels into one channel

      for (let i = 0; i < audioData[0].length; i++) {
        audioData[0][i] = (SCALING_FACTOR * (audioData[0][i]) + audioData[1][i]) / 2;
      }
    }

    audioData = audioData[0];
  }

  // Transcribe the audio
  let result = await transcriber(audioData);
  console.log(result);
};

// speechRecognition();