# ADR Cost Comparator

**Make smarter investment decisions** by comparing the true all-in cost of buying ADRs versus their primary listings.

## Why Use This Tool?

When investing in foreign companies through US markets, you have two choices:
1. Buy the **ADR** (American Depositary Receipt) on a US exchange
2. Buy the **primary listing** on the foreign exchange

The ADR might seem convenient, but is it actually cheaper? This tool helps you answer that question by factoring in:
- Current market prices for both securities
- Foreign exchange rates and trends
- Trading commissions on both sides
- ADR conversion ratios

**The result?** A clear, data-driven answer on which route saves you money.

## Key Benefits

### 🎯 **Instant Cost Comparison**
Select your tickers and see immediately which option is cheaper. No spreadsheets, no manual calculations.

### 📊 **FX Trend Analysis**
Visualize 6-month currency trends with break-even markers. Understand if FX movements favor buying now or waiting.

### 💡 **Smart Decision Zones**
Clear visual indicators show you whether current FX rates favor buying the ADR or the primary listing.

### 🔄 **Always Up-to-Date**
Real-time price and FX data from multiple reliable sources. One-click refresh keeps everything current.

### 🌍 **Global Coverage**
Supports major exchanges worldwide: London (LSE), Tokyo (TSE), Paris (Euronext), São Paulo (B3), Copenhagen, and more.

### 🛡️ **Currency Precision**
Automatically handles currency subunits (British pence, South African cents, Israeli agorot) for accurate calculations.

## Quick Start

```bash
npm start
```

Open your browser to `http://localhost:4173`

## How to Use

1. **Enter tickers**: Search for your ADR and primary listing
2. **Set trade details**: Quantity, commissions, and ADR ratio
3. **Review analysis**: See which option is cheaper and by how much
4. **Check FX trends**: Use the historical chart to understand currency movements
5. **Make your decision**: Buy with confidence knowing the true cost

## Example Scenarios

| Company | ADR | Primary | Exchange | Ratio | Use Case |
|---------|-----|---------|----------|-------|----------|
| GlaxoSmithKline | GSK | GSK.L | London (LSE) | 0.5 | Test GBP pence conversion |
| Novo Nordisk | NVO | NOVO-B.CO | Copenhagen | 1 | Nordic pharma investment |
| Sanofi | SNY | SAN.PA | Paris | 2 | European healthcare |
| Toyota | TM | 7203.T | Tokyo | 0.1 | Japanese auto sector |
| Vale | VALE | VALE3.SA | São Paulo | 1 | Brazilian commodities |
| Unilever | UL | ULVR.L | London (LSE) | 1 | UK consumer goods |

## Optional Configuration

For enhanced reliability, add a Twelve Data API key (free tier: 800 calls/day):

```bash
cp .env.example .env
# Edit .env and add: TWELVE_DATA_API_KEY=your_key_here
```

Get your free key at [twelvedata.com](https://twelvedata.com/)

## Data Sources

- **Stock Prices**: Yahoo Finance (primary) → Twelve Data (backup)
- **FX Rates**: Yahoo Finance → Frankfurter/ECB
- **FX History**: Frankfurter API (6-month trends)

All data is fetched in real-time through a local proxy server for privacy and reliability.

## Who Is This For?

- **Individual investors** comparing ADR vs primary listing costs
- **Financial advisors** helping clients make informed decisions
- **Portfolio managers** optimizing international equity purchases
- **Anyone** who wants transparency in cross-border investing costs

## Disclaimer

This tool is designed for investors in US stock markets. It provides cost comparison data to inform your decisions but should not be used as the sole basis for trading. Always conduct your own research and consult with financial professionals when needed.

---

**Built with ♥ in the Pacific Northwest**

*Powered by [Yahoo Finance](https://finance.yahoo.com), [Frankfurter](https://frankfurter.dev), and [Twelve Data](https://twelvedata.com)*
