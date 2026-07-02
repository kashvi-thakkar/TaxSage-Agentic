require("dotenv").config();

async function test() {
  try {

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            {
              role: "user",
              content: "Reply ONLY with VISION_OK"
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log(JSON.stringify(data, null, 2));

  } catch (err) {

    console.error(err);

  }
}

test();