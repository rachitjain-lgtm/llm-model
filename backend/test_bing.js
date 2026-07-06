const axios = require('axios');

async function testBing(query) {
  try {
    console.log("Searching Bing for:", query);

    const res = await axios.get('https://www.bing.com/search', {
      params: { q: query },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 6000
    });

    const html = res.data;
    const blocks = html.split(/<li class="b_algo"/gi);
    const results = [];

    for (let i = 1; i < blocks.length && results.length < 5; i++) {
      const block = blocks[i];
      const linkMatch = block.match(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
      const snippetMatch = block.match(/<p[^>]*>([\s\S]*?)<\/p>|<div class="b_caption"[^>]*>([\s\S]*?)<\/div>/i);

      if (linkMatch) {
        const url = linkMatch[1];
        const title = linkMatch[2].replace(/<[^>]+>/g, '').trim();
        let snippet = snippetMatch ? (snippetMatch[1] || snippetMatch[2]).replace(/<[^>]+>/g, '').trim() : title;

        if (title && url.startsWith('http') && !url.includes('bing.com')) {
          results.push({ title, snippet, url });
        }
      }
    }

    console.log("\nPARSED BING RESULTS COUNT:", results.length);
    console.log(JSON.stringify(results, null, 2));
  } catch (e) {
    console.error("Bing search error:", e.message);
  }
}

testBing("souled store indore");
