export default async function handler(req, res) {
  res.setHeader("cache-control", "no-store");
  res.setHeader("content-type", "application/json");

  const query = req.query.q || "";
  const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=8&newsCount=0&enableFuzzyQuery=true`;

  try {
    const response = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0 ADR local comparator" }
    });
    const body = await response.text();
    return res.status(response.status).send(body);
  } catch {
    return res.status(502).json({ error: "market_data_unavailable" });
  }
}
