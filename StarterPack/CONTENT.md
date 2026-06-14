# Stock Lens — Content & Data Reference

_Last updated: 2026-06-14. Source of truth: `app.js`. All values mirror the live codebase._

---

## 1. Defaults (on page load)

| Field | Value | Notes |
|---|---|---|
| `adrTicker` | `TM` | Toyota Motor (NYSE) |
| `adrName` | Toyota Motor Corporation | |
| `localTicker` | `7203.T` | Tokyo Stock Exchange |
| `localName` | Toyota Motor Corporation | |
| `adrPrice` | _(empty)_ | Auto-fetched via Yahoo Finance |
| `localPrice` | _(empty)_ | Auto-fetched via Yahoo Finance |
| `ratio` | `0.1` | ADR shares per 1 primary share |
| `localQuantity` | `250` | Shares to purchase |
| `adrCommission` | `0` | Auto-filled to `$0.10/share × qty` |
| `adrPassThroughFee` | `0.03` | $0.03/share/yr (ADR custody fee) |
| `localCommission` | `0` | User-entered |
| `localToUsdRate` | _(empty)_ | Auto-fetched via Yahoo Finance / Frankfurter |
| `localCurrency` | `JPY` | |

> **Ratio direction:** `ratio = ADR shares per 1 primary share`. Toyota: 0.1 → buy 250 primary → 25 ADR. Airbus (EADSY): 4 → buy 250 primary → 1000 ADR.

---

## 2. Known Pairs Registry (40 entries)

| ADR | Primary | Name | Ratio | Currency | Exchange | Level | Market | Sponsored | Depositary | Notes / Alternatives |
|---|---|---|---|---|---|---|---|---|---|---|
| TM | 7203.T | Toyota Motor | 0.1 | JPY | TSE | II | NYSE | ✓ | BNY Mellon | |
| HMC | 7267.T | Honda Motor | 0.1 | JPY | TSE | II | NYSE | ✓ | JPMorgan | |
| SONY | 6758.T | Sony Group | 1 | JPY | TSE | II | NYSE | ✓ | JPMorgan | |
| MUFG | 8306.T | Mitsubishi UFJ Financial | 1 | JPY | TSE | II | NYSE | ✓ | JPMorgan | |
| SMFG | 8316.T | Sumitomo Mitsui Financial | 1 | JPY | TSE | II | NYSE | ✓ | Citibank | |
| MFG | 8411.T | Mizuho Financial | 1 | JPY | TSE | II | NYSE | ✓ | JPMorgan | |
| NTDOY | 7974.T | Nintendo | 1 | JPY | TSE | I | OTC | ✓ | JPMorgan | Level I OTC — wider spreads |
| GSK | GSK.L | GSK plc | 2 | GBP | LSE | II | NYSE | ✓ | JPMorgan | |
| UL | ULVR.L | Unilever | 1 | GBP | LSE | II | NYSE | ✓ | Deutsche Bank | Alt: UNLYF |
| BP | BP.L | BP plc | 2 | GBP | LSE | II | NYSE | ✓ | JPMorgan | Alt: BPAQF |
| AZN | AZN.L | AstraZeneca | 1 | GBP | LSE | II | NASDAQ | ✓ | JPMorgan | |
| RIO | RIO.L | Rio Tinto | 1 | GBP | LSE | II | NYSE | ✓ | JPMorgan | Alt: RTNTF |
| SHEL | SHEL.L | Shell plc | 5 | GBP | LSE | II | NYSE | ✓ | JPMorgan | Alt: SHLLF |
| HSBC | 0005.HK | HSBC Holdings | 1 | HKD | HKEX | II | NYSE | ✓ | JPMorgan | Also listed on LSE as HSBA.L |
| ASML | ASML.AS | ASML Holding | 1 | EUR | Euronext Amsterdam | II | NASDAQ | ✓ | Citibank | |
| PHG | PHIA.AS | Philips | 1 | EUR | Euronext Amsterdam | II | NYSE | ✓ | JPMorgan | |
| EADSY | AIR.PA | Airbus SE | 4 | EUR | Euronext Paris | I | OTC | ✗ | Multiple | Unsponsored OTC ADR. Consider buying AIR.PA directly |
| SNY | SAN.PA | Sanofi | 2 | EUR | Euronext Paris | III | NASDAQ | ✓ | BNY Mellon | |
| LVMUY | MC.PA | LVMH | 5 | EUR | Euronext Paris | I | OTC | ✓ | BNY Mellon | |
| TTEHY | TTE.PA | TotalEnergies | 2 | EUR | Euronext Paris | I | OTC | ✓ | JPMorgan | |
| SAP | SAP.DE | SAP SE | 1 | EUR | XETRA | II | NYSE | ✓ | Deutsche Bank | |
| SIEGY | SIE.DE | Siemens AG | 2 | EUR | XETRA | I | OTC | ✓ | JPMorgan | |
| BMWYY | BMW.DE | BMW AG | 5 | EUR | XETRA | I | OTC | ✓ | Citibank | |
| NVS | NOVN.SW | Novartis | 1 | CHF | SIX | II | NYSE | ✓ | JPMorgan | |
| RHHBY | ROG.SW | Roche Holding | 1 | CHF | SIX | I | OTC | ✓ | JPMorgan | RHHBY = non-voting bearer; RHHVF = voting registered. Alt: RHHVF |
| NSRGY | NESN.SW | Nestlé | 1 | CHF | SIX | I | OTC | ✓ | Citibank | Level I OTC. Consider NESN.SW directly via IBKR |
| NVO | NOVO-B.CO | Novo Nordisk | 1 | DKK | Nasdaq Copenhagen | III | NYSE | ✓ | JPMorgan | |
| TSM | 2330.TW | TSMC | 0.2 | TWD | TWSE | II | NYSE | ✓ | Citibank | ADR frequently trades 10–26% premium — verify before buying |
| BABA | 9988.HK | Alibaba Group | 0.125 | HKD | HKEX | II | NYSE | ✓ | Citibank | Monitor PCAOB/HFCAA delisting risk quarterly |
| JD | 9618.HK | JD.com | 0.5 | HKD | HKEX | II | NASDAQ | ✓ | JPMorgan | Monitor PCAOB/HFCAA delisting risk quarterly |
| VALE | VALE3.SA | Vale SA | 1 | BRL | B3 | III | NYSE | ✓ | Citibank | |
| PBR | PETR4.SA | Petrobras | 1 | BRL | B3 | III | NYSE | ✓ | JPMorgan | PBR = preferred (PETR4). PBR.A = common (PETR3). Verify share class |
| ITUB | ITUB4.SA | Itaú Unibanco | 1 | BRL | B3 | III | NYSE | ✓ | JPMorgan | |
| HDB | HDFCBANK.NS | HDFC Bank | 0.3333 | INR | NSE | II | NYSE | ✓ | JPMorgan | |
| IBN | ICICIBANK.NS | ICICI Bank | 0.5 | INR | NSE | II | NYSE | ✓ | Deutsche Bank | |
| WIT | WIPRO.NS | Wipro | 1 | INR | NSE | II | NYSE | ✓ | Deutsche Bank | |
| INFY | INFY.NS | Infosys | 1 | INR | NSE | II | NYSE | ✓ | Deutsche Bank | |
| BHP | BHP.AX | BHP Group | 1 | AUD | ASX | II | NYSE | ✓ | JPMorgan | |
| SSNLF | 005930.KS | Samsung Electronics | 1 | KRW | KRX | I | OTC | ✗ | None | **Not a true ADR** — OTC foreign ordinary. Thinly traded. Consider 005930.KS on KRX via IBKR |

---

## 3. ADR Level Descriptions

| Level | Title | Description |
|---|---|---|
| I | Level I ADR | Trades OTC only. Minimal SEC reporting, no exchange listing. |
| II | Level II ADR | Exchange-listed. Full SEC registration, annual Form 20-F filing. |
| III | Level III ADR | Exchange-listed. Strictest SEC requirements. Can raise capital in US markets. |

---

## 4. Commission Model

| Route | Rate | Formula |
|---|---|---|
| ADR (US) | $0.10/share | `qty × $0.10` — auto-filled; user can override |
| Primary (local) | User-entered | Not auto-filled |

Broker links shown in UI: IBKR · Robinhood · Schwab

---

## 5. ADR Pass-Through Fee

Default: **$0.03/share/yr** (depositary custody fee). Industry range: $0.01–$0.05/share/yr. User-editable.

---

## 6. Withholding Tax

Shown in the "Dividend Withholding Tax" callout when a supported currency is detected.

| Currency | Rate | Note |
|---|---|---|
| JPY | 10% (US treaty) | Domestic 20.315%. Claim via IRS Form 1116. |
| KRW | 15% (US treaty) | Domestic 22%. Hold in taxable account for Form 1116 credit. |
| EUR | Varies by country | France 12.8%, Germany 25%, Netherlands 15%. Check country treaty rate. Claim via IRS Form 1116. |
| GBP | 0% | UK pays gross — no withholding for US investors. |
| TWD | 21% | Limited treaty benefit. Claim eligible amount via IRS Form 1116. |
| BRL | 15% | Claim via IRS Form 1116. |
| INR | 25% (US treaty) | Claim via IRS Form 1116. |
| HKD | 0% | No withholding at source. |
| AUD | 15% (US treaty) | Domestic 30%. Claim via IRS Form 1116. |
| CHF | 35% (refundable) | Treaty reduces to 15%. Excess refundable via Swiss tax authority. Claim net via IRS Form 1116. |
| DKK | 15% (US treaty) | Claim via IRS Form 1116. |

---

## 7. Supported Currencies

`USD · EUR · JPY · GBP · HKD · CNY · CNH · INR · CAD · AUD · CHF · SEK · NOK · DKK · SGD · KRW · TWD · BRL · MXN · ZAR · ILS`

**Subunits** (auto-converted to base): `GBp · GBX · ZAc · ILA`

---

## 8. Key UI Strings

| Element | String |
|---|---|
| FX insight | `"${currency} needs to strengthen/weaken against USD by at least X%"` |
| BEV value | `"${currency} / USD = 1.15824409"` |
| Sparkline subtitle | `"6-month FX rate history for ${currency} / USD"` |
| Zone caption | `"When ${currency}/USD is above the BEV line, ADR is cheaper. Below it, Primary is cheaper."` |
| Zone labels | `"Buy ADR"` (top/high FX) · `"Buy Primary"` (bottom/low FX) |
| Google forecast link | `"${currency} to dollar forecast for next 6-12 months"` |
| Share button | `"⎘ Share"` → `"✓ Copied!"` |
| ADR badge | `"Level II · NYSE · Sponsored"` |
| Summary line | `"Cheaper than ADR by $X.XX (Y%)"` or `"Cheaper than Primary Listing by $X.XX (Y%)"` |
| localStorage key | `"adr-local-comparator-inputs-v8"` |

---

## 9. Disclaimer Text

- Prices and FX rates sourced from Yahoo Finance, Frankfurter/ECB, and Twelve Data and may be delayed.
- ADR ratios are pre-seeded from depositary bank records and subject to change — always verify with your broker before trading.
- Auto-matched tickers are suggestions only. Multiple ADR listings may exist for the same company with different ratios and fee structures.
- Not financial advice. For US market investors only.
- MJ Labs LLC makes no representations as to the accuracy or completeness of this data.
