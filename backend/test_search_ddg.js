const axios = require('axios');

async function testDDG(query) {
  try {
    const clean = query
      .replace(/\bang\b/gi, 'and')
      .replace(/\b(tell|give|show|find|search)\s+(me|us|about)\b/gi, '')
      .replace(/\b(what|where|who|how|is|are)\s+(is|are|the|a|an)\b/gi, '')
      .replace(/\b(website\s+to\s+shop\s+online|shop\s+online|online\s+website)\b/gi, 'website')
      .replace(/[^\w\s\-\.]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    console.log("Cleaned search query:", clean);

    const res = await axios.post('https://html.duckduckgo.com/html/', `q=${encodeURIComponent(clean)}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    const html = res.data;
    console.log("HTML response length:", html.length);

    const resultRegex = /<a class="result__url"[^>]*href="([^"]+)"[^>]*>\s*([\s\S]*?)\s*<\/a>[\s\S]*?<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    let count = 0;

    while ((match = resultRegex.exec(html)) !== null && count < 5) {
      count++;
      let rawUrl = match[1];
      if (rawUrl.includes('uddg=')) {
        const urlParams = new URLSearchParams(rawUrl.split('?')[1]);
        rawUrl = decodeURIComponent(urlParams.get('uddg') || rawUrl);
      }
      console.log(`\nResult #${count}:`);
      console.log("URL:", rawUrl);
      console.log("Snippet:", match[3].replace(/<[^>]+>/g, '').trim());
    }

    if (count === 0) {
      console.log("No regex matches found in HTML.");
      console.log("Sample HTML snippet:", html.slice(0, 1500));
    }
  } catch (e) {
    console.error("Test error:", e.message);
  }
}

testDDG("tell me souled store in indore ang give me it's website to shop online");
