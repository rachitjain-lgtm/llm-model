async function test() {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models");
    const data = await response.json();
    if (data && data.data) {
      const imgModels = data.data.filter(m => 
        m.id.toLowerCase().includes("diffusion") || 
        m.id.toLowerCase().includes("flux") || 
        m.id.toLowerCase().includes("stability") ||
        m.id.toLowerCase().includes("dall") ||
        m.id.toLowerCase().includes("midjourney") ||
        m.id.toLowerCase().includes("sdxl")
      );
      console.log("Image models on OpenRouter:", imgModels.length);
      imgModels.forEach(m => {
        console.log(`- ${m.id} (Prompt cost: ${m.pricing.prompt}, Completion cost: ${m.pricing.completion})`);
      });
    }
  } catch (err) {
    console.error("Failed to query OpenRouter:", err);
  }
}

test();
