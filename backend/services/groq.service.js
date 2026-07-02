const Groq = require("groq-sdk");
const { InMemoryChatMessageHistory } =
  require("@langchain/core/chat_history");
const {
  RunnableWithMessageHistory
} = require("@langchain/core/runnables");
const { ChatPromptTemplate } =
  require("@langchain/core/prompts");
const { RunnableLambda } =
  require("@langchain/core/runnables");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const {
  compareRegimesTool
} = require("../tools/taxCalculator.tool");

const {
  TAX_ASSISTANT_PROMPT
} = require("../prompts/taxAssistant.prompt");

// Session-based message history storage
const sessionHistories =
  new Map();

// Get or create history for a session
const getSessionHistory = (
  sessionId
) => {
  if (
    !sessionHistories.has(sessionId)
  ) {
    sessionHistories.set(
      sessionId,
      new InMemoryChatMessageHistory()
    );
  }
  return sessionHistories.get(sessionId);
};

const askTaxAI = async (
  userMessage,
  sessionId = "default"
) => {

  try {

    // Build the chat chain
    const promptTemplate =
      ChatPromptTemplate.fromMessages([
        ["system", TAX_ASSISTANT_PROMPT],
        ["placeholder", "{history}"],
        ["human", "{input}"]
      ]);

    const modelRunnable =
    RunnableLambda.from(
      async (input) => {

        console.log(
          "INPUT TYPE:",
          input.constructor.name
        );

        const messages =
          input
            .toChatMessages()
            .map(msg => ({

              role:
                msg.constructor.name === "HumanMessage"
                  ? "user"
                  : msg.constructor.name === "AIMessage"
                  ? "assistant"
                  : "system",

              content:
                msg.content

            }));

        const completion =
          await groq.chat.completions.create({

            model:
              "llama-3.3-70b-versatile",

            temperature: 0.7,

            max_tokens: 1024,

            messages

          });

        return (
          completion.choices[0]?.message
            ?.content ||
          "I couldn't process your request. Please try again."
        );

      }
    );

    const chain = promptTemplate.pipe(
      modelRunnable
    );

    // Tool Integration: Check for tax regime query
    if (
      userMessage
        .toLowerCase()
        .includes("regime")
      &&
      userMessage.match(/\d+/)
    ) {

      console.log("TOOL EXECUTED");

      const income =
        Number(
          userMessage.match(/\d+/)[0]
        );

      const result =
        await compareRegimesTool.invoke({
          income,
          deductions: 0
        });

      return `
    Recommended Regime: ${result.recommended.toUpperCase()}

    Old Regime Tax: ₹${result.oldRegime.toLocaleString()}

    New Regime Tax: ₹${result.newRegime.toLocaleString()}

    Potential Savings: ₹${result.savings.toLocaleString()}
    `;

    }

    // Get session history
    const sessionHistory =
      getSessionHistory(sessionId);

    // Use RunnableWithMessageHistory
    const chainWithHistory =
      new RunnableWithMessageHistory({
        runnable: chain,
        getMessageHistory: async () =>
          sessionHistory,
        inputMessagesKey: "input",
        historyMessagesKey: "history"
      });

    const response =
      await chainWithHistory.invoke(
        {
          input: userMessage
        },
        {
          configurable: {
            sessionId: sessionId
          }
        }
      );

    return response;

  } catch (error) {

    console.error(
      "Groq API Error:",
      error
    );

    throw new Error(
      "AI service temporarily unavailable"
    );

  }

};

module.exports = {
  askTaxAI
};