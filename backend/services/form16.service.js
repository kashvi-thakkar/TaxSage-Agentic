const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");
const Groq = require("groq-sdk");
const { fromPath } = require("pdf2pic");
const { ChatGroq } = require("@langchain/groq");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY,});

const { StructuredOutputParser } = require("@langchain/core/output_parsers");
const { form16Schema } = require("../parsers/form16.parser");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { FORM16_SYSTEM_PROMPT, FORM16_USER_PROMPT } = require("../prompts/form16.prompt");
function repairMalformedJson(rawJson) {
  let repaired = rawJson;

  // Remove trailing commas before object/array endings
  repaired = repaired.replace(/,\s*([}\]])/g, '$1');

  // Replace single quotes with double quotes for JSON strings
  repaired = repaired.replace(/'/g, '"');

  // Ensure object keys are quoted
  repaired = repaired.replace(/([{,]\s*)([A-Za-z0-9_]+)\s*:/g, '$1"$2":');

  // Remove unprintable control characters
  repaired = repaired.replace(/[\u0000-\u001F]+/g, '');

  // FIX: malformed nested object ending
  repaired = repaired.replace( /\}\}",\s*"employment"/g,'},"employment"' );

  return repaired;
}
console.log(
  "USING MODEL:",
  "llama-3.3-70b-versatile"
);

async function parseForm16(filePath) {
  try {
    const pdfBuffer = fs.readFileSync(filePath);

    const pdfData = await pdf(pdfBuffer);

    let formText = pdfData.text || "";

    console.log("PDF PAGES:", pdfData.numpages);
    console.log("TEXT LENGTH:", formText.length);

    // OCR fallback for scanned/image PDFs
    if (formText.trim().length < 100) {

      console.log(
        "No text found. Using Groq Vision..."
      );

      return await parseWithVision(
        filePath
      );

    }

    console.log("FORM TEXT SAMPLE:");
    console.log(
      formText.substring(0, 5000)
    );

    const parser =
      StructuredOutputParser.fromZodSchema(
        form16Schema
      );

    const promptTemplate =
      ChatPromptTemplate.fromMessages([
        ["system", FORM16_SYSTEM_PROMPT],
        ["human", FORM16_USER_PROMPT]
      ]);

    const model = new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        model: "llama-3.3-70b-versatile",
        temperature: 0
      }).withStructuredOutput(form16Schema);

      const chain = promptTemplate.pipe(model);

      const result = await chain.invoke({
        formText,
        formatInstructions:
          parser.getFormatInstructions()
      });

      console.log(
        "STRUCTURED RESULT:"
      );

      console.log(
        JSON.stringify(
          result,
          null,
          2
        )
      );

      return result;

      } catch (error) {

        console.error(
          "FORM16 SERVICE ERROR:",
          error
        );

        throw error;
      }
    }

async function parseWithVision(
  filePath
) {

  try {

    const convert =
      fromPath(filePath, {
        density: 200,
        saveFilename: "page",
        savePath: "./temp",
        format: "png",
        width: 1500,
        height: 2000,
      });
      
    const page =
      await convert(1);

    const imageBase64 =
      fs.readFileSync(
        page.path,
        {
          encoding: "base64"
        }
      );

    const completion =
      await groq.chat.completions.create({

        model:
          "meta-llama/llama-4-scout-17b-16e-instruct",

        temperature: 0,

        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `
Extract all tax relevant information
from this Form16.

Return ONLY valid JSON.
`
              },
              {
                type: "image_url",
                image_url: {
                  url:
                    `data:image/png;base64,${imageBase64}`
                }
              }
            ]
          }
        ]

      });

    const content =
      completion.choices[0]
        .message.content;

    const jsonMatch =
      content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error(
        "No JSON returned by Vision Model"
      );
    }

    const extracted = jsonMatch[0];
    const repaired = repairMalformedJson(extracted);

    try {
      return JSON.parse(repaired);
    } catch (error) {
      console.log("Vision parser repair failed:", error.message || error);
      console.log("Raw response:", content);
      console.log("Repaired response:", repaired);
      throw new Error(
        "Failed to parse Vision model JSON after repair"
      );
    }

  } catch (err) {

    console.error(
      "VISION PARSER ERROR:",
      err
    );

    throw err;

  }

}

module.exports = {
  parseForm16
};