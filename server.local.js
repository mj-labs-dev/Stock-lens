const http = require("http");
const fs = require("fs/promises");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".png": "image/png"
};

// API Configuration
const config = {
  twelveData: {
    apiKey: process.env.TWELVE_DATA_API_KEY || null,
    baseUrl: "https://api.twelvedata.com",
    rateLimit: {
      maxCalls: 800,
      windowMs: 24 * 60 * 60 * 1000 // 24 hours
    }
  }
};

// Rate limiter for Twelve Data API
class RateLimiter {
  constructor(maxCalls, windowMs) {
    this.maxCalls = maxCalls;
    this.windowMs = windowMs;
    this.calls = [];
  }

  canMakeCall() {
    const now = Date.now();
    this.calls = this.calls.filter(time => now - time < this.windowMs);
    return this.calls.length < this.maxCalls;
  }

  recordCall() {
    this.calls.push(Date.now());
  }

  getRemainingCalls() {
    const now = Date.now();
    this.calls = this.calls.filter(time => now - time < this.windowMs);
    return this.maxCalls - this.calls.length;
  }
}

const twelveDataLimiter = new RateLimiter(
  config.twelveData.rateLimit.maxCalls,
  config.twelveData.rateLimit.windowMs
);

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, {
    "content-type": type,
    "cache-control": "no-store"
  });
  res.end(body);
}

async function proxyJson(res, url) {
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 ADR local comparator"
      }
    });
    const body = await response.text();
    send(res, response.status, body);
  } catch {
    send(res, 502, JSON.stringify({ error: "market_data_unavailable" }));
  }
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 ADR local comparator"
    }
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function sendFx(res, from, to) {
  const upperFrom = from.toUpperCase();
  const upperTo = to.toUpperCase();

  if (upperFrom === upperTo) {
    send(res, 200, JSON.stringify({ rate: 1, source: "Yahoo Finance", timestamp: Math.floor(Date.now() / 1000) }));
    return;
  }

  try {
    const yahoo = await fetchJson(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(`${upperFrom}${upperTo}=X`)}?range=1d&interval=1d`);
    const meta = yahoo.chart?.result?.[0]?.meta;
    const rate = meta?.regularMarketPrice ?? meta?.previousClose ?? meta?.chartPreviousClose;
    if (Number.isFinite(rate)) {
      send(res, 200, JSON.stringify({
        rate,
        source: "Yahoo Finance",
        timestamp: meta.regularMarketTime || Math.floor(Date.now() / 1000)
      }));
      return;
    }
  } catch {
    // Fall through to no-key daily ECB source.
  }

  try {
    const frankfurter = await fetchJson(`https://api.frankfurter.app/latest?from=${encodeURIComponent(upperFrom)}&to=${encodeURIComponent(upperTo)}`);
    const rate = frankfurter.rates?.[upperTo];
    if (Number.isFinite(rate)) {
      send(res, 200, JSON.stringify({
        rate,
        source: "Frankfurter/ECB",
        date: frankfurter.date
      }));
      return;
    }
  } catch {
    // Handled below.
  }

  send(res, 502, JSON.stringify({ error: "fx_unavailable" }));
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const requested = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.join(root, path.normalize(requested));

  if (!filePath.startsWith(root)) {
    send(res, 403, "Forbidden", "text/plain; charset=utf-8");
    return;
  }

  try {
    let body = await fs.readFile(filePath);
    if (path.extname(filePath) === ".html") {
      body = body.toString()
        .replace(/https:\/\/stock-lens-beta\.vercel\.app\/app\.js/g, "/app.js")
        .replace(/https:\/\/stock-lens-beta\.vercel\.app\/styles\.css/g, "/styles.css");
    }
    send(res, 200, body, contentTypes[path.extname(filePath)] || "application/octet-stream");
  } catch {
    send(res, 404, "Not found", "text/plain; charset=utf-8");
  }
}

async function fetchTwelveDataPrice(symbol) {
  // Validate API key is present
  if (!config.twelveData.apiKey) {
    throw new Error("TWELVE_DATA_API_KEY not configured");
  }

  // Check rate limit
  if (!twelveDataLimiter.canMakeCall()) {
    throw new Error("Twelve Data API rate limit exceeded");
  }

  const url = `${config.twelveData.baseUrl}/price?symbol=${encodeURIComponent(symbol)}&apikey=${config.twelveData.apiKey}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 ADR local comparator"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    // Check for API error responses
    if (data.status === "error" || data.code) {
      throw new Error(data.message || "Twelve Data API error");
    }

    // Record successful call for rate limiting
    twelveDataLimiter.recordCall();
    
    console.log(`Twelve Data API call successful. Remaining calls: ${twelveDataLimiter.getRemainingCalls()}`);

    return {
      price: parseFloat(data.price),
      timestamp: Math.floor(Date.now() / 1000),
      source: "Twelve Data"
    };
  } catch (error) {
    console.error("Twelve Data API error:", error.message);
    throw error;
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/api/search") {
    const query = url.searchParams.get("q") || "";
    await proxyJson(res, `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=8&newsCount=0&enableFuzzyQuery=true`);
    return;
  }

  if (url.pathname === "/api/price") {
    const symbol = url.searchParams.get("symbol") || "";
    
    // Try Yahoo Finance first
    try {
      const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`;
      const response = await fetch(yahooUrl, {
        headers: { "user-agent": "Mozilla/5.0 ADR local comparator" }
      });
      
      if (response.ok) {
        const body = await response.text();
        const data = JSON.parse(body);
        const meta = data.chart?.result?.[0]?.meta;
        
        if (meta && (meta.regularMarketPrice || meta.previousClose)) {
          send(res, 200, body);
          return;
        }
      }
    } catch (error) {
      console.log("Yahoo Finance failed, trying Twelve Data fallback");
    }
    
    // Fallback to Twelve Data
    if (config.twelveData.apiKey) {
      try {
        const result = await fetchTwelveDataPrice(symbol);
        // Transform to Yahoo-like format for compatibility
        const yahooFormat = {
          chart: {
            result: [{
              meta: {
                regularMarketPrice: result.price,
                regularMarketTime: result.timestamp,
                currency: "USD",
                symbol: symbol
              }
            }]
          }
        };
        send(res, 200, JSON.stringify(yahooFormat));
        return;
      } catch (error) {
        console.error("Twelve Data fallback failed:", error.message);
      }
    }
    
    // Both failed
    send(res, 502, JSON.stringify({ error: "market_data_unavailable" }));
    return;
  }

  if (url.pathname === "/api/twelve-data/price") {
    const symbol = url.searchParams.get("symbol") || "";
    
    if (!symbol) {
      send(res, 400, JSON.stringify({ error: "symbol parameter required" }));
      return;
    }

    try {
      const result = await fetchTwelveDataPrice(symbol);
      send(res, 200, JSON.stringify(result));
    } catch (error) {
      const statusCode = error.message.includes("not configured") ? 503 : 502;
      send(res, statusCode, JSON.stringify({ 
        error: error.message,
        remainingCalls: twelveDataLimiter.getRemainingCalls()
      }));
    }
    return;
  }

  if (url.pathname === "/api/fx") {
    const from = url.searchParams.get("from") || "";
    const to = url.searchParams.get("to") || "USD";
    await sendFx(res, from, to);
    return;
  }

  if (url.pathname === "/api/fx-history") {
    const from = url.searchParams.get("from") || "";
    const to = url.searchParams.get("to") || "USD";
    
    if (!from) {
      send(res, 400, JSON.stringify({ error: "from parameter required" }));
      return;
    }

    try {
      // Calculate date range (6 months ago to today)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
      
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];
      
      const frankfurterUrl = `https://api.frankfurter.app/${startStr}..${endStr}?from=${encodeURIComponent(from.toUpperCase())}&to=${encodeURIComponent(to.toUpperCase())}`;
      const response = await fetchJson(frankfurterUrl);
      
      // Transform response into array of {date, rate} objects
      const rates = Object.entries(response.rates || {}).map(([date, rateObj]) => ({
        date,
        rate: rateObj[to.toUpperCase()]
      }));
      
      send(res, 200, JSON.stringify({
        rates,
        source: "Frankfurter/ECB",
        fromCurrency: from.toUpperCase(),
        toCurrency: to.toUpperCase()
      }));
    } catch (error) {
      console.error("FX history error:", error.message);
      send(res, 502, JSON.stringify({ error: "fx_history_unavailable" }));
    }
    return;
  }

  await serveStatic(req, res);
});

server.listen(port, () => {
  console.log(`ADR comparator running at http://localhost:${port}/`);
});
