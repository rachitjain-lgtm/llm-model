require('dotenv').config({ path: './.env' });
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function test() {
  const apiKey = process.env.NVIDIA_API_KEY;
  console.log("NVIDIA API Key:", apiKey ? "Loaded (Starts with " + apiKey.substring(0, 8) + ")" : "Not loaded");
  
  try {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-70b-instruct',
        messages: [{ role: 'user', content: 'Say hello!' }],
        max_tokens: 50
      }),
    });

    const payload = await response.json();
    console.log("Status:", response.status);
    console.log("Payload:", JSON.stringify(payload, null, 2));
  } catch (err) {
    console.error("Error during test:", err);
  }
}

test();
