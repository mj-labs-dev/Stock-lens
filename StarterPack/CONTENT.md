# Stock Lens — Content & Data Reference

_Last updated: 2026-06-15. Source of truth: `app.js`. All values mirror the live codebase._

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
| `adrCommission` | `0` | Auto-filled to `$0` (ADR) |
| `adrPassThroughFee` | `0.03` | $0.03/share/yr (ADR custody fee) |
| `localCommission` | `0` | Auto-filled to `$0.10/share × qty`; user can override |
| `localToUsdRate` | _(empty)_ | Auto-fetched via Yahoo Finance / Frankfurter |
| `localCurrency` | `JPY` | |

> **Ratio direction:** `ratio = ADR shares per 1 primary share`. Toyota: 0.1 → buy 250 primary → 25 ADR. Airbus (EADSY): 4 → buy 250 primary → 1000 ADR.

---

## 2. Known Pairs Registry (38 entries)

| ADR | Primary | Name | Ratio | Currency | Exchange | Level | Market | Sponsored | Depositary | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| TM | 7203.T | Toyota Motor | 0.1 | JPY | TSE | III | NYSE | ✓ | BNY Mellon | |
| HMC | 7267.T | Honda Motor | 0.3333 | JPY | TSE | II | NYSE | ✓ | JPMorgan | 1 ADR = 3 Primary |
| SONY | 6758.T | Sony Group | 1 | JPY | TSE | II | NYSE | ✓ | JPMorgan | |
| MUFG | 8306.T | Mitsubishi UFJ Financial | 1 | JPY | TSE | II | NYSE | ✓ | BNY Mellon | |
| SMFG | 8316.T | Sumitomo Mitsui Financial | 1.6667 | JPY | TSE | II | NYSE | ✓ | Citi | 5 ADR = 3 Primary |
| MFG | 8411.T | Mizuho Financial | 5 | JPY | TSE | II | NYSE | ✓ | BNY Mellon | 5 ADR = 1 Primary |
| NTDOY | 7974.T | Nintendo | 4 | JPY | TSE | I | OTC | ✗ | Multiple | 4 ADR = 1 Primary; Level I OTC — wider spreads |
| GSK | GSK.L | GSK plc | 0.5 | GBP | LSE | II | NYSE | ✓ | JPMorgan | 1 ADR = 2 Primary |
| UL | ULVR.L | Unilever | 1 | GBP | LSE | II | NYSE | ✓ | Deutsche Bank | |
| BP | BP.L | BP plc | 0.1667 | GBP | LSE | II | NYSE | ✓ | JPMorgan | 1 ADR = 6 Primary |
| RIO | RIO.L | Rio Tinto | 1 | GBP | LSE | II | NYSE | ✓ | JPMorgan | |
| SHEL | SHEL.L | Shell plc | 0.5 | GBP | LSE | III | NYSE | ✓ | JPMorgan | 1 ADR = 2 Primary |
| HSBC | HSBA.L | HSBC Holdings | 0.2 | GBP | LSE | II | NYSE | ✓ | BNY Mellon | 1 ADR = 5 Primary |
| ASML | ASML.AS | ASML Holding | 1 | EUR | Euronext Amsterdam | II | NASDAQ | ✓ | JPMorgan | |
| PHG | PHIA.AS | Philips | 1 | EUR | Euronext Amsterdam | II | NYSE | ✓ | Deutsche Bank | |
| EADSY | AIR.PA | Airbus SE | 4 | EUR | Euronext Paris | I | OTC | ✗ | Multiple | Unsponsored OTC ADR |
| SNY | SAN.PA | Sanofi | 2 | EUR | Euronext Paris | II | NASDAQ | ✓ | JPMorgan | |
| LVMUY | MC.PA | LVMH | 5 | EUR | Euronext Paris | I | OTC | ✗ | Multiple | Unsponsored OTC ADR |
| SAP | SAP.DE | SAP SE | 1 | EUR | XETRA | II | NYSE | ✓ | Deutsche Bank | |
| SIEGY | SIE.DE | Siemens AG | 2 | EUR | XETRA | I | OTC | ✓ | Deutsche Bank | 2 ADR = 1 Primary |
| BMWKY | BMW.DE | BMW AG | 3 | EUR | XETRA | I | OTC | ✗ | Multiple | 3 ADR = 1 Primary; Unsponsored |
| NVS | NOVN.SW | Novartis | 1 | CHF | SIX | II | NYSE | ✓ | JPMorgan | |
| RHHBY | ROP.SW | Roche Holding | 8 | CHF | SIX | I | OTC | ✓ | JPMorgan | 8 ADR = 1 Primary; RHHBY = non-voting bearer; RHHVF = voting registered shares |
| NSRGY | NESN.SW | Nestlé | 1 | CHF | SIX | I | OTC | ✓ | Citi | Level I OTC |
| NVO | NOVO-B.CO | Novo Nordisk | 1 | DKK | Nasdaq Copenhagen | III | NYSE | ✓ | JPMorgan | |
| TSM | 2330.TW | TSMC | 0.2 | TWD | TWSE | III | NYSE | ✓ | Citi | ADR frequently trades 10–26% premium — verify before buying |
| TCEHY | 0700.HK | Tencent Holdings | 1 | HKD | HKEX | I | OTC | ✗ | Multiple | Unsponsored OTC ADR |
| BABA | 9988.HK | Alibaba Group | 0.125 | HKD | HKEX | III | NYSE | ✓ | Citi | 1 ADR = 8 Primary; Monitor PCAOB/HFCAA delisting risk quarterly |
| JD | 9618.HK | JD.com | 0.5 | HKD | HKEX | III | NASDAQ | ✓ | Deutsche Bank | 1 ADR = 2 Primary; Monitor PCAOB/HFCAA delisting risk quarterly |
| VALE | VALE3.SA | Vale SA | 1 | BRL | B3 | III | NYSE | ✓ | JPMorgan | |
| PBR | PETR3.SA | Petrobras (Common) | 0.5 | BRL | B3 | III | NYSE | ✓ | JPMorgan | 1 ADR = 2 Primary. PBR = common (PETR3). PBR.A = preferred (PETR4). Verify share class |
| PBR.A | PETR4.SA | Petrobras (Preferred) | 0.5 | BRL | B3 | II | NYSE | ✓ | JPMorgan | 1 ADR = 2 Primary. PBR.A = preferred (PETR4). PBR = common (PETR3). Verify share class |
| ITUB | ITUB4.SA | Itaú Unibanco | 1 | BRL | B3 | II | NYSE | ✓ | JPMorgan | |
| HDB | HDFCBANK.BO | HDFC Bank | 0.3333 | INR | BSE | III | NYSE | ✓ | JPMorgan | 3 ADR = 1 Primary |
| IBN | ICICIBANK.NS | ICICI Bank | 0.5 | INR | NSE | III | NYSE | ✓ | Deutsche Bank | |
| WIT | WIPRO.NS | Wipro | 1 | INR | NSE | III | NYSE | ✓ | JPMorgan | |
| INFY | INFY.NS | Infosys | 1 | INR | NSE | III | NYSE | ✓ | Deutsche Bank | |
| BHP | BHP.AX | BHP Group | 0.5 | AUD | ASX | III | NYSE | ✓ | Citi | 1 ADR = 2 Primary |


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
| Primary (local) | $0.10/share | `qty × $0.10` — auto-filled; user can override |
| ADR (US) | $0 | Auto-filled to zero; user can override |

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
| KRW | 15% (US treaty) | Domestic 22%. Since 2024, some payers withhold at full 22% first — after-the-fact refund claim may be required. Hold in taxable account for Form 1116 credit. |
| EUR | Varies by country | France 12.8%, Germany 15% (US treaty), Netherlands 15%. Check country treaty rate. Claim via IRS Form 1116. |
| GBP | 0% | UK pays gross — no withholding for US investors. |
| TWD | 21% | Limited treaty benefit. Claim eligible amount via IRS Form 1116. |
| BRL | 10% | Claim via IRS Form 1116. |
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
