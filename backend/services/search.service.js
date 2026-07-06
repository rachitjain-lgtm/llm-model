const axios = require('axios');

/**
 * Clean conversational phrasing to extract primary search keywords
 */
const cleanSearchQuery = (query) => {
  if (!query || typeof query !== 'string') return "";
  
  return query
    .replace(/\bang\b/gi, 'and')
    .replace(/\b(tell|give|show|find|search)\s+(me|us|about)\b/gi, '')
    .replace(/\b(what|where|who|how)\s+(is|are|the|a|an)\b/gi, '')
    .replace(/\b(can i know|i want to know|please tell me|tell me)\b/gi, '')
    .replace(/\b(website\s+to\s+shop\s+online|shop\s+online|online\s+website)\b/gi, 'website')
    .replace(/[^\w\s\-\.]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * 1. Dedicated Live Weather Provider (Open-Meteo API)
 * 100% Free, No API Key, Live global weather & forecast
 */
const fetchLiveWeather = async (query) => {
  const isWeather = /weather|temperat|temprat|temp\b|climate|rain|forecast|sunny|cloudy|degree/i.test(query);
  if (!isWeather) return null;

  let city = "Indore";
  const cityMatch = query.match(/(?:weather|temperat|temprat|temp|climate)\s+(?:in|at|for|of)\s+([a-zA-Z\s]+)/i);
  if (cityMatch && cityMatch[1]) {
    city = cityMatch[1].trim();
  }

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const geoRes = await axios.get(geoUrl, { timeout: 4000 });

    if (geoRes.data?.results?.[0]) {
      const location = geoRes.data.results[0];
      const { latitude, longitude, name, country, admin1 } = location;

      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relative_humidity_2m&timezone=auto`;
      const wRes = await axios.get(weatherUrl, { timeout: 4000 });

      if (wRes.data?.current_weather) {
        const cur = wRes.data.current_weather;
        const weatherCodes = {
          0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
          45: "Foggy", 51: "Light drizzle", 61: "Slight rain", 63: "Moderate rain",
          80: "Rain showers", 95: "Thunderstorm"
        };
        const condition = weatherCodes[cur.weathercode] || "Clear / Mild";

        return {
          title: `Live Weather Report for ${name}, ${admin1 || ''} ${country}`,
          snippet: `Live Current Temperature: ${cur.temperature}°C, Condition: ${condition}, Wind Speed: ${cur.windspeed} km/h, Date/Time: ${cur.time}`,
          url: `https://open-meteo.com/`
        };
      }
    }
  } catch (e) {
    console.warn("Weather API Notice:", e.message);
  }
  return null;
};

/**
 * 2. Dedicated Live Web Search Engine using Native Node Fetch
 */
const fetchDuckDuckGo = async (searchKeywords) => {
  if (!searchKeywords) return [];
  const results = [];

  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchKeywords)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (response.ok) {
      const text = await response.text();
      const regex = /<a[^>]*class="result__url"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
      let match;

      while ((match = regex.exec(text)) !== null && results.length < 5) {
        let rawUrl = match[1];
        let title = match[2].replace(/<[^>]+>/g, '').trim();
        let snippet = match[3].replace(/<[^>]+>/g, '').trim();

        if (rawUrl.includes('uddg=')) {
          try {
            const urlParams = new URLSearchParams(rawUrl.split('?')[1]);
            rawUrl = decodeURIComponent(urlParams.get('uddg') || rawUrl);
          } catch (e) {}
        }

        if (rawUrl.startsWith('//')) rawUrl = 'https:' + rawUrl;

        if (title && rawUrl.startsWith('http') && !rawUrl.includes('duckduckgo.com')) {
          results.push({
            title,
            snippet,
            url: rawUrl
          });
        }
      }
    }
  } catch (e) {
    console.warn("DuckDuckGo fetch notice:", e.message);
  }
  return results;
};

/**
 * Main Web Search Grounding Router
 */
const searchWeb = async (query) => {
  if (!query || typeof query !== 'string') return [];

  // A. Check Weather API first if user query is about weather
  const weatherResult = await fetchLiveWeather(query);
  if (weatherResult) {
    return [weatherResult];
  }

  // B. Clean search query
  const cleanKeywords = cleanSearchQuery(query) || query;

  // C. Execute Live Web Search
  let results = await fetchDuckDuckGo(cleanKeywords);

  // Fallback to core subject words if conversational query yielded 0 results
  if (results.length === 0) {
    const simplified = cleanKeywords.replace(/\b(and|or|it|its|s|the|a|an|in|on|at|for|to|of|with|website|shop|online)\b/gi, ' ').replace(/\s+/g, ' ').trim();
    if (simplified && simplified !== cleanKeywords) {
      results = await fetchDuckDuckGo(simplified);
    }
  }

  return results;
};

module.exports = { searchWeb };
