const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY || null;

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "Mozilla/5.0 ADR local comparator" }
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export default async function handler(req, res) {
  res.setHeader("cache-control", "no-store");
  res.setHeader("content-type", "application/json");

  const symbol = req.query.symbol || "";
  if (!symbol) {
    return res.status(400).json({ error: "symbol parameter required" });
  }

  // Try Yahoo Finance first
  try {
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`;
    const data = await fetchJson(yahooUrl);
    const meta = data.chart?.result?.[0]?.meta;
    if (meta && (meta.regularMarketPrice || meta.previousClose)) {
      return res.status(200).json(data);
    }
  } catch {
    // Fall through to Twelve Data
  }

  // Fallback to Twelve Data
  if (TWELVE_DATA_API_KEY) {
    try {
      const url = `https://api.twelvedata.com/price?symbol=${encodeURIComponent(symbol)}&apikey=${TWELVE_DATA_API_KEY}`;
      const data = await fetchJson(url);
      if (data.status === "error" || data.code) {
        throw new Error(data.message || "Twelve Data API error");
      }
      return res.status(200).json({
        chart: {
          result: [{
            meta: {
              regularMarketPrice: parseFloat(data.price),
              regularMarketTime: Math.floor(Date.now() / 1000),
              currency: "USD",
              symbol,
              source: "Twelve Data"
            }
          }]
        }
      });
    } catch {
      // Fall through
    }
  }

  return res.status(502).json({ error: "market_data_unavailable" });
}
