require("dotenv").config();

const Groq = require("groq-sdk");

async function run() {
  try {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    const response =
      await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: "Reply only with OK"
          }
        ]
      });

    console.log(response.choices[0].message);

  } catch (err) {

    console.error("FULL ERROR:");
    console.error(err);

  }
}

run();