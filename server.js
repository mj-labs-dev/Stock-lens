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
    const body = await fs.readFile(filePath);
    send(res, 200, body, contentTypes[path.extname(filePath)] || "application/octet-stream");
  } catch {
    send(res, 404, "Not found", "text/plain; charset=utf-8");
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
    await proxyJson(res, `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`);
    return;
  }

  if (url.pathname === "/api/fx") {
    const from = url.searchParams.get("from") || "";
    const to = url.searchParams.get("to") || "USD";
    await sendFx(res, from, to);
    return;
  }

  await serveStatic(req, res);
});

server.listen(port, () => {
  console.log(`ADR comparator running at http://localhost:${port}/`);
});
