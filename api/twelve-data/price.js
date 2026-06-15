const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY || null;

export default async function handler(req, res) {
  res.setHeader("cache-control", "no-store");
  res.setHeader("content-type", "application/json");

  const symbol = req.query.symbol || "";
  if (!symbol) {
    return res.status(400).json({ error: "symbol parameter required" });
  }

  if (!TWELVE_DATA_API_KEY) {
    return res.status(503).json({ error: "TWELVE_DATA_API_KEY not configured" });
  }

  try {
    const url = `https://api.twelvedata.com/price?symbol=${encodeURIComponent(symbol)}&apikey=${TWELVE_DATA_API_KEY}`;
    const response = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0 ADR local comparator" }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    if (data.status === "error" || data.code) {
      throw new Error(data.message || "Twelve Data API error");
    }

    return res.status(200).json({
      price: parseFloat(data.price),
      timestamp: Math.floor(Date.now() / 1000),
      source: "Twelve Data"
    });
  } catch (error) {
    return res.status(502).json({ error: error.message });
  }
}
