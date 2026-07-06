require('dotenv').config({ path: './.env' });
const { GoogleGenAI } = require('@google/genai');

async function test() {
  const apiKey = process.env.GOOGLE_AI_KEY;
  try {
    const ai = new GoogleGenAI({ apiKey });
    console.log("Listing models...");
    const response = await ai.models.list();
    console.log("Response:", JSON.stringify(response, null, 2));
  } catch (err) {
    console.error("Failed to list models:", err);
  }
}

test();
