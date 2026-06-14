# Stock Lens — Design & API Spec

_Last updated: 2026-06-14. Sources: `styles.css`, `index.html`, `app.js`, `server.js`._

---

## 1. Brand & Identity

| | |
|---|---|
| **Product name** | Stock Lens |
| **Suite** | Financial Fortress |
| **Company** | MJ Labs LLC |
| **Tagline** | ADR vs. Primary Listing — true cost comparison |
| **Audience** | US retail investors buying foreign equities |

---

## 2. Color Tokens

Defined in `:root` in `styles.css`.

| Token | Hex | Usage |
|---|---|---|
| `--navy` | `#12141C` | Primary text, chart labels, BEV value, recommendation card bg |
| `--gold` | `#C9A840` | Winner bar fill, accent highlights |
| `--gold-dark` | `#B8960B` | Card titles, eyebrows ("POWERED BY", "DISCLAIMER"), dot bullets, hover links |
| `--ink` | `#1a1a24` | Body text |
| `--ink-secondary` | `#5a564e` | Secondary body text |
| `--muted` | `#a09880` | Field notes, sub-labels, disclaimer text |
| `--cream` | `#F5F1EB` | Page background |
| `--card-bg` | `#ffffff` | Card backgrounds |
| `--surface-soft` | `#F9F7F3` | Input focus background, readonly inputs |
| `--border` | `#E8E4DC` | Card borders, dividers |
| `--border-strong` | `rgba(26,26,36,0.2)` | Focused input borders |
| `--adr-red` | `#b6532b` | ADR loser bar, unsponsored badge |
| `--shadow` | `0 16px 42px rgba(26,26,36,0.09)` | Card drop shadow |

**Aliases:** `--accent` = `--gold` · `--accent-strong` = `--gold-dark` · `--surface` = `--card-bg` · `--page` = `--cream` · `--line` = `--border`

---

## 3. Typography

**Font:** Inter · Fallback: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

**Display font:** Playfair Display (used for h1, sub-headings, breakdown column headings)

| Role | Size | Weight | Color |
|---|---|---|---|
| Eyebrow / caps ("DISCLAIMER", "POWERED BY") | 11px | 700 | `#B8960B` |
| Butler dot list body | 13px | 500 | `#3a3830` |
| Field labels (uppercase) | 0.78rem | 700 | `--navy` |
| Sub-headings ("PRIMARY LISTING", "ADR") | 0.82rem | 700 | `--navy` (Playfair Display) |
| Card section titles ("SECURITIES", "TRADE SETUP") | 0.78rem | 950 uppercase | `--gold-dark` |
| Metric labels (FX, BEV labels) | 0.78rem | 950 uppercase | `--muted` |
| Metric values (BEV, totals) | 1.3rem | 700 | `--navy` |
| Winner label (recommendation card) | 1.4rem | 900 | `--gold` |
| Muted sub-text (field notes, status) | 0.72rem | 500 | `--muted` |
| Input / output values | 0.98rem | 700 | `--ink` |
| Body / breakdown rows | 0.78rem | 600 | `--ink` / `--muted` |

---

## 4. Layout

```
┌─────────────────────────────────────────────────────┐
│  Header (Stock Lens wordmark + Financial Fortress)  │
├──────────────────────────┬──────────────────────────┤
│  Left column (1fr)       │  Right column (340px)    │
│  • Securities card       │  • Recommendation card   │
│  • Trade Setup card      │  • FX Sensitivity card   │
│    └ Cost Breakdown      │  • Historical Trend card  │
└──────────────────────────┴──────────────────────────┘
  Withholding Tax callout (full width, hidden by default)
  Powered By bar (bare, Butler-style separator)
  Disclaimer (Butler-style dot bullets)
──────────────────────────────────────────────────────  ← full-width footer border
  Footer
```

| Property | Value |
|---|---|
| Grid | `grid-template-columns: 1fr 340px` |
| Column gap | `14px` |
| Inner column gap | `14px` |
| App shell max-width | `min(1180px, calc(100% - 28px))` |
| Breakpoint (stack) | `860px` → single column |
| Narrow breakpoint | `640px` → tighter padding, smaller text |
| Footer | Outside `app-shell` — full-width border-top |

---

## 5. Component Patterns

### Entry Card (`.entry-card`)
White card, `border: 1px solid --border`, `padding: 16px`. Section title in `--gold-dark`, uppercase, 0.78rem, weight 950.

### Recommendation Card (`.recommendation`)
- Background: `--navy` (#12141C)
- Winner label: `--gold` (#C9A840), 1.4rem, weight 900
- Body text: cream / light

### Cost Breakdown (inside Trade Setup card)
- 2-column grid below `<hr class="card-divider">`
- Heading: "Cost Breakdown" in `--navy` (Playfair Display)
- Columns: Primary Listing / ADR — rows for Shares, Gross cost, Commission, (ADR fee), Total (USD)

### Cost Bar Chart
- **Primary always on top**, ADR below
- Labels: `--navy`, 0.86rem, weight 700
- Winner bar fill: `--gold` · Loser bar fill: `--adr-red`

### FX Sensitivity Card
- BEV: `"${currency} / USD = X.XXXXXXXX"` — `--navy`, 1.3rem, weight 700
- Label: "Break-even FX for ADR to be cheaper"
- Insight: `"${currency} needs to strengthen/weaken against USD by at least X%"`
- Sparkline: 6-month canvas chart, dashed BEV line, navy zone labels
- Caption: "When ${currency}/USD is above the BEV line, ADR is cheaper. Below it, Primary is cheaper."

### Withholding Tax Callout (`.withholding-callout`)
- Hidden by default (`display:none`), shown when currency has withholding data
- Title: `--gold-dark`, uppercase, weight 700
- White bg, `border: 1px solid --border`, `border-radius: 12px`

### Butler-Style Dot List
Used for **Disclaimer** and **Powered By** sections. No container card.

```
border-top: 0.5px solid rgba(26, 26, 36, 0.15)
gap between rows: 7px
dot: 5×5px · border-radius: 50% · background: #B8960B
text: Inter 13px · color: #3a3830
eyebrow: Inter 11px · weight 700 · uppercase · letter-spacing: 0.06em · color: #B8960B
```

### ADR Level Badge
Format: `"Level II · NYSE · Sponsored"` · Warning note shown for unsponsored / OTC / non-ADR pairs.

---

## 6. API Architecture

The app runs a Node.js proxy server (`server.js`) on **port 4173**. All external API calls go through this proxy — the browser never calls external APIs directly. No npm dependencies; uses Node.js built-in `http` and `fs` modules.

**Run:** `npm start` → `node server.js`

**Environment variables:**
| Variable | Required | Default | Purpose |
|---|---|---|---|
| `PORT` | No | `4173` | Server port |
| `TWELVE_DATA_API_KEY` | Yes (for fallback) | — | Twelve Data API key |

---

## 7. Proxy API Routes

### `GET /api/price?symbol={ticker}`
Fetches real-time stock price.

**Primary:** Yahoo Finance
```
GET https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?range=1d&interval=1d
Headers: user-agent: "Mozilla/5.0 ADR local comparator"
```
Response shape used:
```json
{ "chart": { "result": [{ "meta": { "regularMarketPrice": 215.40, "regularMarketTime": 1718300000, "currency": "USD", "symbol": "TM" } }] } }
```

**Fallback:** Twelve Data (if Yahoo fails)
```
GET https://api.twelvedata.com/price?symbol={symbol}&apikey={TWELVE_DATA_API_KEY}
```
Response transformed to match Yahoo shape. `source: "Twelve Data"` added.

**Error:** `502` if both sources fail.

---

### `GET /api/search?q={query}`
Ticker search / autocomplete.

```
GET https://query2.finance.yahoo.com/v1/finance/search?q={query}&quotesCount=8&newsCount=0&enableFuzzyQuery=true
Headers: user-agent: "Mozilla/5.0 ADR local comparator"
```
Returns Yahoo Finance search results directly.

---

### `GET /api/fx?from={currency}&to={currency}`
Fetches FX spot rate. `to` defaults to `USD`.

**Primary:** Yahoo Finance
```
GET https://query1.finance.yahoo.com/v8/finance/chart/{FROM}{TO=X}?range=1d&interval=1d
```
Same currency (e.g. USD→USD): returns `{ rate: 1, source: "Yahoo Finance" }` immediately.

**Fallback:** Frankfurter/ECB
```
GET https://api.frankfurter.app/latest?from={from}&to={to}
```

Response:
```json
{ "rate": 1.15730, "source": "Yahoo Finance" | "Frankfurter/ECB", "timestamp": 1718300000 }
```

**Error:** `{ "error": "fx_unavailable" }` with status `502`.

---

### `GET /api/fx-history?from={currency}&to={currency}`
Fetches 6-month daily FX history for the sparkline chart. `to` defaults to `USD`.

```
GET https://api.frankfurter.app/{YYYY-MM-DD}..{YYYY-MM-DD}?from={from}&to={to}
```
Date range: today − 6 months → today (calculated server-side).

Response:
```json
{
  "rates": [{ "date": "2025-12-14", "rate": 1.14820 }, ...],
  "source": "Frankfurter/ECB",
  "fromCurrency": "EUR",
  "toCurrency": "USD"
}
```

**Error:** `{ "error": "fx_history_unavailable" }` with status `502`.

---

### `GET /api/twelve-data/price?symbol={ticker}`
Direct Twelve Data price endpoint (separate from the `/api/price` fallback path).

```
GET https://api.twelvedata.com/price?symbol={symbol}&apikey={TWELVE_DATA_API_KEY}
```

Response:
```json
{ "price": 215.40, "timestamp": 1718300000, "source": "Twelve Data", "remainingCalls": 742 }
```

**Rate limit:** 800 calls / 24 hours (tracked server-side in memory).
**Errors:** `400` (missing symbol) · `502` (API error) · `503` (API key not configured).

---

## 8. Response Headers (All API Routes)

```
cache-control: no-store
content-type: application/json
```

---

## 9. External API Summary

| Service | Auth | Rate Limit | Used For |
|---|---|---|---|
| Yahoo Finance (chart) | None | Unofficial — no guarantee | Stock prices (primary), FX spot (primary) |
| Yahoo Finance (search) | None | Unofficial — no guarantee | Ticker search / autocomplete |
| Frankfurter / ECB | None | None documented | FX spot (fallback), FX 6-month history |
| Twelve Data | API key (`TWELVE_DATA_API_KEY`) | 800 calls / 24 hrs | Stock price fallback |

> Yahoo Finance is an unofficial/undocumented endpoint. No SLA or uptime guarantee. The proxy adds a `user-agent` header to reduce blocking risk.

---

## 10. Responsive Breakpoints

| Breakpoint | Change |
|---|---|
| `≤ 860px` | Two-column layout collapses to single column |
| `≤ 640px` | Tighter padding, smaller font sizes, data-sources bar wraps |
| `prefers-color-scheme: dark` | Partial dark mode overrides (minimal) |
