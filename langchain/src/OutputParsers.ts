import {ChatOpenAI} from '@langchain/openai'
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser, CommaSeparatedListOutputParser, StructuredOutputParser } from '@langchain/core/output_parsers';

const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0.8,
})


const stringOutputParse = async () =>{
    const prompt = ChatPromptTemplate.fromTemplate(
        "Write a summary of the movie {movieName}."
    );

const parser = new StringOutputParser();

    const chain = prompt.pipe(model).pipe(parser);
    const response = await chain.invoke({
        movieName: "Inception",
    })

    console.log(response);

}


// stringOutputParse();

const commaSeparatedListOutputparser = async () =>{
    const prompt = ChatPromptTemplate.fromTemplate(
        "Provide a list of movies, sepatated by commas for the genre: {genre}."
    );

const parser = new CommaSeparatedListOutputParser();

    const chain = prompt.pipe(model).pipe(parser);
    const response = await chain.invoke({
        genre: "comedy",
    })

    console.log(response);

}


// commaSeparatedListOutputparser();

const structuredOutputParser = async () =>{
    const prompt = ChatPromptTemplate.fromTemplate(
     `Extract imformation from the following text.
     Formatting instruction: {formattingInstructions}
     Text: {text} 
     `
    );
const parser = StructuredOutputParser.fromNamesAndDescriptions({
    name:"the name of the user",
    age: "the age of the user",
    interests: "what the user is interested in",
});

    const chain = prompt.pipe(model).pipe(parser);
    const result = await chain.invoke({
        text: "Sohan is 32 years old and is interested in Full Stack Development",
        formattingInstructions: parser.getFormatInstructions(),
    })

    console.log(result);

}

structuredOutputParser();