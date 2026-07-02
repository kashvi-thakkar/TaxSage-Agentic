const Groq = require("groq-sdk");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { RunnableLambda } = require("@langchain/core/runnables");
const { StructuredOutputParser } = require("@langchain/core/output_parsers");
const { filingReviewSchema } = require("../parsers/filingReview.parser");
const {
  FILING_REVIEW_SYSTEM_PROMPT,
  FILING_REVIEW_USER_PROMPT
} = require("../prompts/filingReview.prompt");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function reviewFiling(input) {
  try {
    const parser = StructuredOutputParser.fromZodSchema(
      filingReviewSchema
    );

    const promptTemplate = ChatPromptTemplate.fromMessages([
      ["system", FILING_REVIEW_SYSTEM_PROMPT],
      ["human", FILING_REVIEW_USER_PROMPT]
    ]);

    const modelRunnable = RunnableLambda.from(
      async (formattedMessages) => {
        const messages = formattedMessages
          .toChatMessages()
          .map((msg) => ({
            role:
              msg.constructor.name === "HumanMessage"
                ? "user"
                : msg.constructor.name === "AIMessage"
                ? "assistant"
                : "system",
            content: msg.content
          }));

        const completion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          temperature: 0.2,
          max_tokens: 1024,
          messages
        });

        return completion.choices[0].message.content;
      }
    );

    const parserRunnable = RunnableLambda.from(async (content) => {
      try {
        return await parser.parse(content);
      } catch (error) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw error;
        }
        const repaired =
        JSON.parse(jsonMatch[0]);

        return filingReviewSchema.parse(
        repaired
        );
      }
    });

    const chain = promptTemplate.pipe(modelRunnable).pipe(parserRunnable);

    const result =
    await chain.invoke({
          reviewInputJson:
          JSON.stringify(input, null, 2),
          formatInstructions:
          parser.getFormatInstructions()
      });

    console.log(
    "AI REVIEW OUTPUT:",
    result
    );

    return result;
  } catch (error) {
    console.error("FILING REVIEW SERVICE ERROR:", error);
    throw error;
  }
}

module.exports = {
  reviewFiling
};
