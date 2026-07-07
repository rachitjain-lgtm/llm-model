require('dotenv').config({ path: './.env' });

async function test() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const url = process.env.OPENROUTER_API_URL || "https://openrouter.ai/api/v1/chat/completions";
  console.log("Using API Key:", apiKey ? apiKey.substring(0, 15) + "..." : "undefined");
  console.log("Using URL:", url);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1",
        messages: [{ role: "user", content: "Hello" }],
        max_tokens: 4096
      })
    });

    const text = await response.text();
    console.log("Status:", response.status);
    console.log("Response text:", text);
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

test();
