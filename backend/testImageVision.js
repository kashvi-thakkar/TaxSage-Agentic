require("dotenv").config();

const fs = require("fs");

async function run() {

  const imageBase64 = fs.readFileSync(
    "./temp/form16.1.png",
    {
      encoding: "base64"
    }
  );

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model:
          "meta-llama/llama-4-scout-17b-16e-instruct",

        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  "What document is this?"
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
      })
    }
  );

  const data = await response.json();

  console.log(
    JSON.stringify(data, null, 2)
  );
}

run();