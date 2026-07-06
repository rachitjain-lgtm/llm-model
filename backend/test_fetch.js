async function run() {
  try {
    const res = await fetch('https://html.duckduckgo.com/html/?q=souled+store+indore');
    const text = await res.text();
    console.log("Response status:", res.status);
    console.log("Length:", text.length);

    // Regex to match result URLs and snippets
    const regex = /<a[^>]*class="result__url"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    let count = 0;

    while ((match = regex.exec(text)) !== null && count < 5) {
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
      console.log("Sample html:", text.slice(0, 1000));
    }
  } catch (e) {
    console.error("Error:", e.message);
  }
}

run();
