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

  const from = (req.query.from || "").toUpperCase();
  const to = (req.query.to || "USD").toUpperCase();

  if (!from) {
    return res.status(400).json({ error: "from parameter required" });
  }

  if (from === to) {
    return res.status(200).json({ rate: 1, source: "Yahoo Finance", timestamp: Math.floor(Date.now() / 1000) });
  }

  // Try Yahoo Finance first
  try {
    const yahoo = await fetchJson(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(`${from}${to}=X`)}?range=1d&interval=1d`
    );
    const meta = yahoo.chart?.result?.[0]?.meta;
    const rate = meta?.regularMarketPrice ?? meta?.previousClose ?? meta?.chartPreviousClose;
    if (Number.isFinite(rate)) {
      return res.status(200).json({
        rate,
        source: "Yahoo Finance",
        timestamp: meta.regularMarketTime || Math.floor(Date.now() / 1000)
      });
    }
  } catch {
    // Fall through to Frankfurter
  }

  // Fallback to Frankfurter/ECB
  try {
    const frankfurter = await fetchJson(
      `https://api.frankfurter.app/latest?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    );
    const rate = frankfurter.rates?.[to];
    if (Number.isFinite(rate)) {
      return res.status(200).json({ rate, source: "Frankfurter/ECB", date: frankfurter.date });
    }
  } catch {
    // Fall through
  }

  return res.status(502).json({ error: "fx_unavailable" });
}
