# ADR-Compare

ADR-Compare is a local web tool for comparing the all-in cost of buying an ADR versus buying the same exposure through the primary listing.

## Features

- Compare ADR and primary listing costs side by side
- Pull ticker prices through Yahoo Finance public endpoints
- Pull primary listing currency to USD FX rates
- Calculate ADR count from primary listing count and ADR ratio
- Show total cost in native currency and USD
- Visualize the cheaper route and break-even FX

## Run locally

```bash
npm start
```

Then open:

```text
http://localhost:4173
```

## Data sources

Market data is proxied by the local Node server.

- Ticker search: Yahoo Finance search endpoint
- Stock prices: Yahoo Finance chart endpoint
- FX rates: Yahoo Finance first, Frankfurter/ECB fallback

This is a prototype and should not be used as the sole source for trading decisions.
