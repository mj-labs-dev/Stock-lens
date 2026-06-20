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

  // Try Frankfurter first (ECB-based, major currencies only)
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);

    const startStr = startDate.toISOString().split("T")[0];
    const endStr = endDate.toISOString().split("T")[0];

    const url = `https://api.frankfurter.app/${startStr}..${endStr}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    const data = await fetchJson(url);

    const rates = Object.entries(data.rates || {}).map(([date, rateObj]) => ({
      date,
      rate: rateObj[to]
    }));

    if (rates.length > 0) {
      return res.status(200).json({ rates, source: "Frankfurter/ECB", fromCurrency: from, toCurrency: to });
    }
  } catch {
    // Fall through to Yahoo
  }

  // Fallback: Yahoo Finance 6mo daily chart
  try {
    const symbol = `${from}${to}=X`;
    const data = await fetchJson(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=6mo&interval=1d`);
    const result = data.chart?.result?.[0];
    const timestamps = result?.timestamp || [];
    const closes = result?.indicators?.quote?.[0]?.close || [];

    const rates = timestamps
      .map((ts, i) => ({
        date: new Date(ts * 1000).toISOString().split("T")[0],
        rate: closes[i]
      }))
      .filter(d => d.rate != null && Number.isFinite(d.rate));

    if (rates.length > 0) {
      return res.status(200).json({ rates, source: "Yahoo Finance", fromCurrency: from, toCurrency: to });
    }
  } catch {
    // Fall through
  }

  return res.status(502).json({ error: "fx_history_unavailable" });
}
