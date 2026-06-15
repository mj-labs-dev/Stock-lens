# Technical Design Document

## Overview

This design document specifies the technical architecture for enhancing the ADR vs Primary Listing cost comparison tool to production-ready status. The application is a client-side web application with a Node.js proxy server that helps US investors compare the all-in cost of buying American Depositary Receipts (ADRs) versus buying equivalent exposure through primary listings on foreign exchanges.

### Design Goals

1. **Automation**: Eliminate manual button clicks by auto-fetching prices and FX rates when tickers are selected
2. **Reliability**: Implement fallback API chains to handle service failures gracefully
3. **User Experience**: Provide clear error states, read-only field management, and manual override capabilities
4. **Maintainability**: Preserve vanilla JavaScript architecture with clean separation of concerns
5. **Production Readiness**: Add comprehensive error handling, state management, and responsive design

### Key Architectural Principles

- **Vanilla JavaScript**: No frameworks or heavy dependencies
- **Event-Driven Architecture**: Auto-fetch triggered by user interactions
- **Fallback Chains**: Primary → Secondary → Manual entry for all external data
- **State Transitions**: Read-only fields unlock only when APIs fail
- **Lightweight Rendering**: Minimal dependencies for charts and visualizations
- **localStorage Persistence**: User inputs saved automatically

## Architecture

### High-Level Component Structure

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    UI Layer (index.html)                │ │
│  │  - Ticker Search Fields                                 │ │
│  │  - Price/Currency Input Fields                          │ │
│  │  - Trade Setup Controls                                 │ │
│  │  - Analysis Cards & Charts                              │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Application Logic (app.js)                 │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │ Price_Fetcher│  │  FX_Fetcher  │  │ Ticker_Search│ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │State_Manager │  │Field_Manager │  │Chart_Renderer│ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP Requests
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Node.js Server (server.js)                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    Proxy Endpoints                      │ │
│  │  - /api/search   (Ticker autocomplete)                  │ │
│  │  - /api/price    (Stock price lookup)                   │ │
│  │  - /api/fx       (FX rate lookup)                       │ │
│  │  - /api/fx-history (6-month FX trend)                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ External API Calls
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      External APIs                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │Yahoo Finance │  │ Twelve Data  │  │ Frankfurter  │     │
│  │  (Primary)   │  │  (Fallback)  │  │(FX Fallback) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

#### Auto-Fetch Flow (Ticker Selection)

```
User selects ticker
       │
       ▼
Ticker_Search updates field
       │
       ▼
Event listener detects change
       │
       ├─→ Price_Fetcher.autoFetch(ticker, side)
       │         │
       │         ├─→ Try Yahoo Finance API
       │         │         │
       │         │         ├─→ Success: Update field (read-only)
       │         │         │             Show timestamp
       │         │         │
       │         │         └─→ Fail: Try Twelve Data API
       │         │                   │
       │         │                   ├─→ Success: Update field (read-only)
       │         │                   │             Show timestamp
       │         │                   │
       │         │                   └─→ Fail: Unlock field (editable)
       │         │                             Show error message
       │         │
       │         └─→ Extract currency (if primary listing)
       │
       └─→ FX_Fetcher.autoFetch(currency)
                 │
                 ├─→ Try Yahoo Finance API
                 │         │
                 │         ├─→ Success: Update FX field (read-only)
                 │         │             Show timestamp
                 │         │
                 │         └─→ Fail: Try Frankfurter API
                 │                   │
                 │                   ├─→ Success: Update FX field (read-only)
                 │                   │             Show timestamp
                 │                   │
                 │                   └─→ Fail: Unlock FX field (editable)
                 │                             Show error message
                 │
                 └─→ Update calculations and charts
```

#### Refresh Flow

```
User clicks Refresh button
       │
       ▼
Validate all ticker fields populated
       │
       ├─→ Price_Fetcher.fetch(adrTicker)
       │
       ├─→ Price_Fetcher.fetch(primaryTicker)
       │
       └─→ FX_Fetcher.fetch(currency)
              │
              └─→ Update all fields and recalculate
```

#### Reset Flow

```
User clicks Reset button
       │
       ├─→ Clear all input fields
       │
       ├─→ Clear localStorage
       │
       ├─→ Reset all fields to editable state
       │
       └─→ Clear all status messages
```



## Components and Interfaces

### Client-Side Components

#### 1. Price_Fetcher

**Responsibility**: Fetch stock prices from APIs with fallback logic

**Interface**:
```javascript
class PriceFetcher {
  /**
   * Auto-fetch price when ticker is selected
   * @param {string} ticker - Stock ticker symbol
   * @param {string} side - 'adr' or 'local'
   * @returns {Promise<PriceResult>}
   */
  async autoFetch(ticker, side)

  /**
   * Manual refresh of price data
   * @param {string} ticker - Stock ticker symbol
   * @param {string} side - 'adr' or 'local'
   * @returns {Promise<PriceResult>}
   */
  async refresh(ticker, side)

  /**
   * Fetch from Yahoo Finance (primary source)
   * @param {string} ticker
   * @returns {Promise<number>}
   */
  async fetchFromYahoo(ticker)

  /**
   * Fetch from Twelve Data (fallback source)
   * @param {string} ticker
   * @returns {Promise<number>}
   */
  async fetchFromTwelveData(ticker)
}

// PriceResult type
{
  success: boolean,
  price: number | null,
  currency: string | null,
  timestamp: number | string | null,
  source: 'yahoo' | 'twelve_data' | 'manual',
  error: string | null
}
```

**Key Behaviors**:
- Try Yahoo Finance first (no API key required)
- Fall back to Twelve Data on Yahoo failure (requires API key)
- Trigger Manual_Entry_Mode if both fail
- Extract currency from API response for primary listings
- Update field state (read-only vs editable)
- Display timestamp or error message

#### 2. FX_Fetcher

**Responsibility**: Fetch foreign exchange rates with fallback logic

**Interface**:
```javascript
class FXFetcher {
  /**
   * Auto-fetch FX rate when currency changes
   * @param {string} fromCurrency - Source currency code
   * @param {string} toCurrency - Target currency code (default: 'USD')
   * @returns {Promise<FXResult>}
   */
  async autoFetch(fromCurrency, toCurrency = 'USD')

  /**
   * Manual refresh of FX rate
   * @param {string} fromCurrency
   * @param {string} toCurrency
   * @returns {Promise<FXResult>}
   */
  async refresh(fromCurrency, toCurrency = 'USD')

  /**
   * Fetch 6-month historical FX data for sparkline
   * @param {string} fromCurrency
   * @param {string} toCurrency
   * @returns {Promise<FXHistoryResult>}
   */
  async fetchHistory(fromCurrency, toCurrency = 'USD')

  /**
   * Fetch from Yahoo Finance (primary source)
   * @param {string} fromCurrency
   * @param {string} toCurrency
   * @returns {Promise<number>}
   */
  async fetchFromYahoo(fromCurrency, toCurrency)

  /**
   * Fetch from Frankfurter (fallback source)
   * @param {string} fromCurrency
   * @param {string} toCurrency
   * @returns {Promise<number>}
   */
  async fetchFromFrankfurter(fromCurrency, toCurrency)
}

// FXResult type
{
  success: boolean,
  rate: number | null,
  timestamp: number | string | null,
  source: 'yahoo' | 'frankfurter' | 'manual',
  error: string | null
}

// FXHistoryResult type
{
  success: boolean,
  data: Array<{date: string, rate: number}>,
  error: string | null
}
```

**Key Behaviors**:
- Try Yahoo Finance first (format: `{FROM}{TO}=X`)
- Fall back to Frankfurter API on Yahoo failure (ECB data, no key)
- Handle USD-to-USD as rate 1.0 without API call
- Trigger Manual_Entry_Mode if both fail
- Fetch 6-month historical data from Frankfurter for sparkline
- Update field state and display status

#### 3. Ticker_Search

**Responsibility**: Provide autocomplete search with exchange filtering

**Interface**:
```javascript
class TickerSearch {
  /**
   * Search for tickers with debouncing
   * @param {string} query - Search query
   * @param {string} side - 'adr' or 'local'
   * @returns {Promise<Array<TickerResult>>}
   */
  async search(query, side)

  /**
   * Filter results by exchange type
   * @param {Array<TickerResult>} results
   * @param {string} side - 'adr' or 'local'
   * @returns {Array<TickerResult>}
   */
  filterByExchange(results, side)

  /**
   * Render suggestions dropdown
   * @param {Array<TickerResult>} results
   * @param {string} side
   */
  renderSuggestions(results, side)

  /**
   * Hide suggestions dropdown
   * @param {string} side
   */
  hideSuggestions(side)
}

// TickerResult type
{
  symbol: string,
  name: string,
  exchange: string,
  currency: string,
  flag: string,  // Country flag emoji or icon
  isUSExchange: boolean
}
```

**Key Behaviors**:
- Debounce search input (250ms)
- Filter ADR field to US exchanges only (NYSE, NASDAQ, AMEX)
- Filter primary listing field to non-US exchanges
- Display flag icon and exchange badge in dropdown
- Cache results to avoid redundant API calls
- Trigger auto-fetch when ticker is selected

#### 4. Field_Manager

**Responsibility**: Manage field state transitions (read-only ↔ editable)

**Interface**:
```javascript
class FieldManager {
  /**
   * Set field to read-only state
   * @param {string} fieldId - DOM element ID
   */
  lockField(fieldId)

  /**
   * Set field to editable state
   * @param {string} fieldId - DOM element ID
   */
  unlockField(fieldId)

  /**
   * Update field value and lock
   * @param {string} fieldId
   * @param {number} value
   */
  updateAndLock(fieldId, value)

  /**
   * Display success status with timestamp
   * @param {string} statusId - Status element ID
   * @param {string} timestamp
   */
  showSuccess(statusId, timestamp)

  /**
   * Display error status and unlock field
   * @param {string} statusId
   * @param {string} fieldId
   * @param {string} errorMessage
   */
  showError(statusId, fieldId, errorMessage)

  /**
   * Clear status message
   * @param {string} statusId
   */
  clearStatus(statusId)
}
```

**Key Behaviors**:
- Fields start as read-only by default
- Unlock only when all APIs fail
- Lock again when successful fetch occurs
- Display timestamp in status area on success
- Display error message in status area on failure
- Preserve visual distinction between locked/unlocked states

#### 5. State_Manager

**Responsibility**: Manage application state and localStorage persistence

**Interface**:
```javascript
class StateManager {
  /**
   * Save current state to localStorage
   */
  save()

  /**
   * Load state from localStorage
   * @returns {Object} - Saved state or defaults
   */
  load()

  /**
   * Clear all saved state
   */
  clear()

  /**
   * Get current input values
   * @returns {Object} - Current state
   */
  getCurrentState()

  /**
   * Update state and trigger recalculation
   * @param {Object} updates - Partial state updates
   */
  updateState(updates)
}

// State structure
{
  adrTicker: string,
  adrName: string,
  localTicker: string,
  localName: string,
  localCurrency: string,
  ratio: number,
  localQuantity: number,
  adrCommission: number,
  localCommission: number,
  // Note: Prices and FX rates are NOT persisted
}
```

**Key Behaviors**:
- Auto-save on every input change
- Restore state on page load
- Clear state on Reset button click
- Do NOT persist API-fetched prices or FX rates
- Persist user-entered values (tickers, quantities, commissions, ratio)

#### 6. Chart_Renderer

**Responsibility**: Render cost comparison chart and FX sparkline

**Interface**:
```javascript
class ChartRenderer {
  /**
   * Update cost comparison bar chart
   * @param {number} adrCost
   * @param {number} primaryCost
   */
  updateCostChart(adrCost, primaryCost)

  /**
   * Render FX sparkline chart
   * @param {Array<{date: string, rate: number}>} data
   * @param {string} containerId
   */
  renderSparkline(data, containerId)

  /**
   * Update analysis cards
   * @param {Object} calculations
   */
  updateAnalysisCards(calculations)
}
```

**Key Behaviors**:
- Use CSS-based bar chart (no heavy libraries)
- Render sparkline using SVG or Canvas (lightweight)
- Update winner indicator based on cost comparison
- Display ADR premium/discount percentage
- Show break-even FX rate
- Update all cards in real-time on input change

### Server-Side Components

#### 1. Proxy Server (server.js)

**Responsibility**: Proxy external API requests to avoid CORS issues

**Endpoints**:

```javascript
// Ticker search autocomplete
GET /api/search?q={query}
Response: {
  quotes: Array<{
    symbol: string,
    shortname: string,
    longname: string,
    exchange: string,
    currency: string
  }>
}

// Stock price lookup
GET /api/price?symbol={ticker}
Response: {
  chart: {
    result: [{
      meta: {
        regularMarketPrice: number,
        previousClose: number,
        currency: string,
        regularMarketTime: number
      }
    }]
  }
}

// FX rate lookup
GET /api/fx?from={currency}&to=USD
Response: {
  rate: number,
  source: 'yahoo' | 'frankfurter',
  timestamp: number | null,
  date: string | null
}

// FX historical data (6 months)
GET /api/fx-history?from={currency}&to=USD
Response: {
  rates: Array<{
    date: string,
    rate: number
  }>,
  source: 'frankfurter'
}
```

**Key Behaviors**:
- Implement fallback chain for each endpoint
- Handle rate limiting gracefully
- Return consistent error format
- Add appropriate headers (User-Agent, Cache-Control)
- Log API usage for monitoring



## Data Models

### TickerData

Represents a stock ticker with metadata

```javascript
{
  symbol: string,           // Ticker symbol (e.g., "TM", "7203.T")
  name: string,             // Company name
  exchange: string,         // Exchange code (e.g., "NYSE", "TSE")
  currency: string,         // Trading currency (e.g., "USD", "JPY")
  flag: string,             // Country flag emoji/icon
  isUSExchange: boolean     // True if NYSE/NASDAQ/AMEX
}
```

### PriceData

Represents fetched price information

```javascript
{
  price: number,            // Stock price
  currency: string,         // Price currency
  timestamp: number,        // Unix timestamp or ISO string
  source: string,           // 'yahoo' | 'twelve_data' | 'manual'
  regularMarketTime: number // Market data timestamp
}
```

### FXData

Represents foreign exchange rate information

```javascript
{
  rate: number,             // Exchange rate (1 FROM = X USD)
  fromCurrency: string,     // Source currency
  toCurrency: string,       // Target currency (usually USD)
  timestamp: number,        // Unix timestamp
  date: string,             // ISO date string
  source: string            // 'yahoo' | 'frankfurter' | 'manual'
}
```

### FXHistoricalData

Represents 6-month FX trend data

```javascript
{
  rates: Array<{
    date: string,           // ISO date (YYYY-MM-DD)
    rate: number            // Exchange rate on that date
  }>,
  fromCurrency: string,
  toCurrency: string,
  source: string            // 'frankfurter'
}
```

### CalculationResult

Represents cost comparison calculations

```javascript
{
  adrQuantity: number,          // Derived ADR quantity
  adrGrossUsd: number,          // ADR gross cost
  adrCommissionUsd: number,     // ADR commission
  adrTotalUsd: number,          // ADR total cost
  
  localQuantity: number,        // Primary listing quantity
  localGross: number,           // Primary gross cost (local currency)
  localCommission: number,      // Primary commission (local currency)
  localTotal: number,           // Primary total cost (local currency)
  localTotalUsd: number,        // Primary total cost (USD)
  localCommissionUsd: number,   // Primary commission (USD)
  
  impliedAdrMid: number,        // Implied ADR price from primary
  premium: number,              // ADR premium/discount (decimal)
  difference: number,           // Cost difference (ADR - Primary)
  breakEvenFx: number,          // FX rate where costs are equal
  
  winner: string,               // 'ADR' | 'Primary Listing' | 'Tie'
  cheaperBy: number             // Absolute cost difference
}
```

### ApplicationState

Represents persisted application state

```javascript
{
  // User inputs (persisted)
  adrTicker: string,
  adrName: string,
  localTicker: string,
  localName: string,
  localCurrency: string,
  ratio: number,
  localQuantity: number,
  adrCommission: number,
  localCommission: number,
  
  // API-fetched values (NOT persisted)
  adrPrice: number,
  localPrice: number,
  localToUsdRate: number,
  
  // Field states
  fieldStates: {
    adrPrice: 'locked' | 'unlocked',
    localPrice: 'locked' | 'unlocked',
    localCurrency: 'locked' | 'unlocked',
    localToUsdRate: 'locked' | 'unlocked'
  },
  
  // Status messages
  statusMessages: {
    adr: string,
    local: string,
    fx: string
  }
}
```

## API Integration Patterns

### Fallback Chain Pattern

All external data fetching follows a consistent fallback pattern:

```javascript
async function fetchWithFallback(primaryFn, fallbackFn, fieldId) {
  try {
    const result = await primaryFn();
    if (result.success) {
      fieldManager.updateAndLock(fieldId, result.value);
      fieldManager.showSuccess(`${fieldId}Status`, result.timestamp);
      return result;
    }
  } catch (error) {
    console.warn('Primary API failed:', error);
  }
  
  try {
    const result = await fallbackFn();
    if (result.success) {
      fieldManager.updateAndLock(fieldId, result.value);
      fieldManager.showSuccess(`${fieldId}Status`, result.timestamp);
      return result;
    }
  } catch (error) {
    console.warn('Fallback API failed:', error);
  }
  
  // Both failed - trigger manual entry mode
  fieldManager.unlockField(fieldId);
  fieldManager.showError(`${fieldId}Status`, fieldId, 'Unable to fetch. Enter manually');
  return { success: false, error: 'All APIs failed' };
}
```

### Price Fetching Flow

```javascript
// Yahoo Finance (Primary)
async function fetchPriceFromYahoo(ticker) {
  const response = await fetch(`/api/price?symbol=${encodeURIComponent(ticker)}`);
  const data = await response.json();
  const meta = data.chart?.result?.[0]?.meta;
  
  return {
    success: true,
    price: meta.regularMarketPrice ?? meta.previousClose,
    currency: meta.currency,
    timestamp: meta.regularMarketTime,
    source: 'yahoo'
  };
}

// Twelve Data (Fallback)
async function fetchPriceFromTwelveData(ticker) {
  const apiKey = getTwelveDataApiKey(); // From env or config
  const response = await fetch(
    `/api/twelve-data/price?symbol=${encodeURIComponent(ticker)}&apikey=${apiKey}`
  );
  const data = await response.json();
  
  return {
    success: true,
    price: parseFloat(data.price),
    currency: data.currency,
    timestamp: data.timestamp,
    source: 'twelve_data'
  };
}
```

### FX Fetching Flow

```javascript
// Yahoo Finance (Primary)
async function fetchFXFromYahoo(from, to) {
  const pair = `${from}${to}=X`;
  const response = await fetch(`/api/price?symbol=${encodeURIComponent(pair)}`);
  const data = await response.json();
  const meta = data.chart?.result?.[0]?.meta;
  
  return {
    success: true,
    rate: meta.regularMarketPrice ?? meta.previousClose,
    timestamp: meta.regularMarketTime,
    source: 'yahoo'
  };
}

// Frankfurter (Fallback)
async function fetchFXFromFrankfurter(from, to) {
  const response = await fetch(`/api/fx?from=${from}&to=${to}`);
  const data = await response.json();
  
  return {
    success: true,
    rate: data.rate,
    date: data.date,
    source: 'frankfurter'
  };
}
```

### Rate Limiting Strategy

```javascript
class RateLimiter {
  constructor(maxCalls, windowMs) {
    this.maxCalls = maxCalls;
    this.windowMs = windowMs;
    this.calls = [];
  }
  
  async throttle(fn) {
    const now = Date.now();
    this.calls = this.calls.filter(time => now - time < this.windowMs);
    
    if (this.calls.length >= this.maxCalls) {
      const oldestCall = this.calls[0];
      const waitTime = this.windowMs - (now - oldestCall);
      console.warn(`Rate limit reached. Waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.calls.push(now);
    return fn();
  }
}

// Usage for Twelve Data (800 calls/day)
const twelveDataLimiter = new RateLimiter(800, 24 * 60 * 60 * 1000);

async function fetchFromTwelveData(ticker) {
  return twelveDataLimiter.throttle(() => fetchPriceFromTwelveData(ticker));
}
```

### Error Handling Strategy

```javascript
class APIError extends Error {
  constructor(message, source, statusCode) {
    super(message);
    this.name = 'APIError';
    this.source = source;
    this.statusCode = statusCode;
  }
}

async function safeAPICall(fn, source) {
  try {
    const response = await fn();
    
    if (!response.ok) {
      throw new APIError(
        `HTTP ${response.status}`,
        source,
        response.status
      );
    }
    
    const data = await response.json();
    return { success: true, data };
    
  } catch (error) {
    console.error(`${source} API error:`, error);
    
    if (error instanceof APIError) {
      return { success: false, error: error.message, source: error.source };
    }
    
    return { success: false, error: 'Network error', source };
  }
}
```



## UI Component Structure

### Header Section

```html
<header class="masthead">
  <div>
    <p class="eyebrow">ADR vs primary listing</p>
    <h1>Cost comparison</h1>
  </div>
  <div class="utility-bar">
    <button id="refreshButton" class="utility-button">
      <span class="icon">↻</span>
      Refresh
    </button>
    <button id="resetButton" class="utility-button">
      <span class="icon">✕</span>
      Reset
    </button>
  </div>
  <div class="data-source">
    <span class="yahoo-mark">Y!</span>
    <span>Powered by Yahoo Finance</span>
  </div>
</header>
```

**Behaviors**:
- Refresh button: Re-fetch all prices and FX rates
- Reset button: Clear all inputs and localStorage
- Data source badge: Indicate primary API provider

### Ticker Input Cards

```html
<article class="entry-card adr-panel">
  <h2>ADR</h2>
  <div class="field-stack">
    <label class="field ticker-cell">
      <span>Ticker</span>
      <input id="adrTicker" type="text" autocomplete="off">
      <div class="suggestions" id="adrSuggestions" role="listbox">
        <!-- Autocomplete suggestions -->
        <button class="suggestion-option" role="option">
          <span class="flag">🇺🇸</span>
          <strong>TM</strong>
          <span>Toyota Motor Corporation - NYSE</span>
        </button>
      </div>
      <small class="security-name" id="adrName"></small>
    </label>
    
    <label class="field">
      <span>Price (USD)</span>
      <input id="adrPrice" type="number" readonly>
      <small class="lookup-status" id="adrLookupStatus" role="status">
        <!-- "Updated 3:45 PM" or "Unable to fetch. Enter manually" -->
      </small>
    </label>
    
    <label class="field">
      <span>Commission (USD)</span>
      <input id="adrCommission" type="number">
    </label>
  </div>
</article>
```

**Behaviors**:
- Ticker field triggers autocomplete search (debounced 250ms)
- Suggestions filtered to US exchanges only for ADR
- Price field starts as readonly, unlocks on API failure
- Status shows timestamp on success, error message on failure
- No "Pull" button - auto-fetch on ticker selection

### Primary Listing Card

```html
<article class="entry-card primary-panel">
  <h2>Primary Listing</h2>
  <div class="field-stack">
    <label class="field ticker-cell">
      <span>Ticker</span>
      <input id="localTicker" type="text" autocomplete="off">
      <div class="suggestions" id="localSuggestions" role="listbox">
        <button class="suggestion-option" role="option">
          <span class="flag">🇯🇵</span>
          <strong>7203.T</strong>
          <span>Toyota Motor Corporation - TSE</span>
        </button>
      </div>
      <small class="security-name" id="localName"></small>
    </label>
    
    <label class="field">
      <span id="localPriceLabel">Price (JPY)</span>
      <input id="localPrice" type="number" readonly>
      <small class="lookup-status" id="localLookupStatus" role="status"></small>
    </label>
    
    <label class="field currency-cell">
      <span>Currency</span>
      <input id="localCurrency" type="text" readonly list="currencySuggestions">
      <datalist id="currencySuggestions">
        <!-- Currency options -->
      </datalist>
      <small class="security-name" id="currencyName"></small>
    </label>
    
    <label class="field">
      <span id="localCommissionLabel">Commission (JPY)</span>
      <input id="localCommission" type="number">
    </label>
  </div>
</article>
```

**Behaviors**:
- Suggestions filtered to non-US exchanges
- Price and currency fields readonly by default
- Currency auto-populated from API response
- Currency change triggers FX auto-fetch
- Labels update dynamically with currency code

### Trade Setup Card

```html
<article class="entry-card setup-card">
  <h2>Trade Setup</h2>
  <div class="setup-grid">
    <label class="field">
      <span>Primary Qty</span>
      <input id="localQuantity" type="number">
    </label>
    
    <label class="field">
      <span>ADR Ratio</span>
      <div class="input-with-helper">
        <input id="ratio" type="number">
        <button class="helper-button" id="ratioSearchButton" title="Search for ADR ratio">
          <span class="icon">🔍</span>
        </button>
      </div>
    </label>
    
    <label class="field">
      <span>ADR Qty (Derived)</span>
      <output id="adrQuantityOut" class="computed-output"></output>
    </label>
    
    <label class="field fx-cell">
      <span id="fxRateLabel">FX Rate (1 JPY = $)</span>
      <input id="localToUsdRate" type="number" readonly>
      <small class="lookup-status" id="fxLookupStatus" role="status"></small>
    </label>
  </div>
</article>
```

**Behaviors**:
- ADR Ratio has Google search helper button
- Search opens: "ADR ratio {adrTicker} {primaryTicker}"
- FX rate field readonly by default, unlocks on API failure
- ADR quantity auto-calculated from primary quantity × ratio
- No "Pull" button for FX - auto-fetch on currency change

### Analysis Section

```html
<section class="results-grid">
  <!-- Cost Comparison Chart (spans 2 rows) -->
  <article class="chart-card chart-card-large">
    <div class="recommendation">
      <span class="kicker">Lower all-in cost</span>
      <strong id="winner">Primary Listing</strong>
      <span id="summaryLine">Primary Listing is cheaper by $0.00.</span>
    </div>
    
    <div class="chart-bars">
      <div class="chart-row">
        <span>ADR</span>
        <div class="bar-track">
          <div class="bar-fill adr-fill" id="adrCostBar"></div>
        </div>
        <strong id="adrChartValue">$0.00</strong>
      </div>
      <div class="chart-row">
        <span>Primary</span>
        <div class="bar-track">
          <div class="bar-fill primary-fill" id="localCostBar"></div>
        </div>
        <strong id="localChartValue">$0.00</strong>
      </div>
    </div>
  </article>
  
  <!-- ADR Premium/Discount Card -->
  <article class="insight-card">
    <span>ADR Premium / Discount</span>
    <strong id="premium">+0.00%</strong>
    <small id="premiumDetail">Versus primary listing equivalent</small>
  </article>
  
  <!-- FX Sensitivity & Historical Trend Card -->
  <article class="insight-card fx-insight-card">
    <span>FX Sensitivity & Historical Trend</span>
    <div class="fx-metrics">
      <div class="metric">
        <label>Break-even FX</label>
        <strong id="breakEvenFx">0.000000</strong>
      </div>
      <small id="fxInsight">Primary listing viability is most sensitive to FX.</small>
    </div>
    
    <!-- Sparkline Chart -->
    <div class="sparkline-container">
      <canvas id="fxSparkline" width="200" height="40"></canvas>
      <small class="sparkline-label">6-month trend</small>
    </div>
    
    <button class="helper-button" id="fxProjectionsButton">
      <span class="icon">📈</span>
      FX Projections
    </button>
  </article>
</section>
```

**Behaviors**:
- Cost chart updates in real-time on input change
- Winner indicator highlights cheaper option
- ADR premium shows percentage vs implied price
- Break-even FX shows rate where costs are equal
- Sparkline renders 6-month FX historical trend
- FX Projections button opens Google search: "{currency} to USD forecast"

### Footer Disclaimer

```html
<footer class="disclaimer">
  <p>For investors in US stock markets only</p>
</footer>
```

**Behaviors**:
- Fixed at bottom of page
- Visible across all viewport sizes

## Event Handling

### Auto-Fetch Events

```javascript
// Ticker selection triggers auto-fetch
document.getElementById('adrTicker').addEventListener('change', async (e) => {
  const ticker = e.target.value.trim();
  if (!ticker) return;
  
  await priceFetcher.autoFetch(ticker, 'adr');
  stateManager.save();
});

document.getElementById('localTicker').addEventListener('change', async (e) => {
  const ticker = e.target.value.trim();
  if (!ticker) return;
  
  const result = await priceFetcher.autoFetch(ticker, 'local');
  
  // Auto-fetch FX if currency was extracted
  if (result.currency) {
    await fxFetcher.autoFetch(result.currency, 'USD');
  }
  
  stateManager.save();
});

// Currency change triggers FX auto-fetch
document.getElementById('localCurrency').addEventListener('change', async (e) => {
  const currency = e.target.value.trim();
  if (!currency) return;
  
  await fxFetcher.autoFetch(currency, 'USD');
  stateManager.save();
});
```

### Autocomplete Search Events

```javascript
let searchDebounceTimer;

document.getElementById('adrTicker').addEventListener('input', (e) => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    tickerSearch.search(e.target.value, 'adr');
  }, 250);
});

document.getElementById('localTicker').addEventListener('input', (e) => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    tickerSearch.search(e.target.value, 'local');
  }, 250);
});

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.ticker-cell')) {
    tickerSearch.hideSuggestions('adr');
    tickerSearch.hideSuggestions('local');
  }
});
```

### Refresh and Reset Events

```javascript
document.getElementById('refreshButton').addEventListener('click', async () => {
  const state = stateManager.getCurrentState();
  
  // Validate required fields
  if (!state.adrTicker || !state.localTicker) {
    alert('Please enter both tickers before refreshing');
    return;
  }
  
  // Disable button during refresh
  const button = document.getElementById('refreshButton');
  button.disabled = true;
  button.textContent = 'Refreshing...';
  
  try {
    // Fetch all data in parallel
    await Promise.all([
      priceFetcher.refresh(state.adrTicker, 'adr'),
      priceFetcher.refresh(state.localTicker, 'local'),
      fxFetcher.refresh(state.localCurrency, 'USD')
    ]);
    
    // Fetch FX history for sparkline
    await fxFetcher.fetchHistory(state.localCurrency, 'USD');
    
  } finally {
    button.disabled = false;
    button.textContent = 'Refresh';
  }
});

document.getElementById('resetButton').addEventListener('click', () => {
  if (!confirm('Clear all inputs and reset the calculator?')) {
    return;
  }
  
  // Clear all input fields
  document.querySelectorAll('input[type="text"], input[type="number"]').forEach(input => {
    input.value = '';
  });
  
  // Clear all status messages
  document.querySelectorAll('.lookup-status').forEach(status => {
    status.textContent = '';
  });
  
  // Clear localStorage
  stateManager.clear();
  
  // Reset all fields to unlocked state
  fieldManager.unlockField('adrPrice');
  fieldManager.unlockField('localPrice');
  fieldManager.unlockField('localCurrency');
  fieldManager.unlockField('localToUsdRate');
  
  // Clear charts
  chartRenderer.updateCostChart(0, 0);
  document.getElementById('fxSparkline').getContext('2d').clearRect(0, 0, 200, 40);
});
```

### Helper Button Events

```javascript
// ADR Ratio search helper
document.getElementById('ratioSearchButton').addEventListener('click', () => {
  const adrTicker = document.getElementById('adrTicker').value.trim();
  const localTicker = document.getElementById('localTicker').value.trim();
  
  if (!adrTicker || !localTicker) {
    alert('Please enter both tickers first');
    return;
  }
  
  const query = `ADR ratio ${adrTicker} ${localTicker}`;
  window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
});

// FX Projections search helper
document.getElementById('fxProjectionsButton').addEventListener('click', () => {
  const currency = document.getElementById('localCurrency').value.trim();
  
  if (!currency) {
    alert('Please enter a currency first');
    return;
  }
  
  const query = `${currency} to USD forecast`;
  window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
});
```

### Real-Time Calculation Events

```javascript
// Recalculate on any input change
document.getElementById('calculatorForm').addEventListener('input', () => {
  const state = stateManager.getCurrentState();
  const calculations = calculate(state);
  chartRenderer.updateCostChart(calculations.adrTotalUsd, calculations.localTotalUsd);
  chartRenderer.updateAnalysisCards(calculations);
  stateManager.save();
});
```



## Sparkline Chart Rendering

### Lightweight SVG Approach

```javascript
class SparklineRenderer {
  /**
   * Render FX sparkline chart
   * @param {Array<{date: string, rate: number}>} data - Historical FX data
   * @param {string} containerId - Container element ID
   */
  render(data, containerId) {
    const container = document.getElementById(containerId);
    const width = 200;
    const height = 40;
    const padding = 2;
    
    // Calculate scales
    const rates = data.map(d => d.rate);
    const minRate = Math.min(...rates);
    const maxRate = Math.max(...rates);
    const range = maxRate - minRate || 1;
    
    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    
    // Generate path
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * (width - 2 * padding) + padding;
      const y = height - padding - ((d.rate - minRate) / range) * (height - 2 * padding);
      return `${x},${y}`;
    });
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${points.join(' L ')}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#4a90e2');
    path.setAttribute('stroke-width', '1.5');
    
    svg.appendChild(path);
    container.innerHTML = '';
    container.appendChild(svg);
  }
  
  /**
   * Show error message when data unavailable
   * @param {string} containerId
   */
  showError(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<small class="error-text">Historical data unavailable</small>';
  }
}
```

**Design Rationale**:
- Use native SVG (no Chart.js or heavy libraries)
- Minimal DOM manipulation
- Responsive to container size
- Graceful error handling

## Error Handling

### Error Types and Responses

```javascript
class ErrorHandler {
  /**
   * Handle API errors with appropriate user feedback
   * @param {Error} error
   * @param {string} context - 'price' | 'fx' | 'search' | 'history'
   * @returns {ErrorResponse}
   */
  handle(error, context) {
    if (error.name === 'APIError') {
      return this.handleAPIError(error, context);
    }
    
    if (error.name === 'NetworkError') {
      return this.handleNetworkError(error, context);
    }
    
    if (error.name === 'RateLimitError') {
      return this.handleRateLimitError(error, context);
    }
    
    return this.handleUnknownError(error, context);
  }
  
  handleAPIError(error, context) {
    const messages = {
      price: 'Unable to fetch price. Enter manually',
      fx: 'Unable to fetch FX rate. Enter manually',
      search: 'Search unavailable',
      history: 'Historical data unavailable'
    };
    
    return {
      userMessage: messages[context] || 'An error occurred',
      shouldUnlockField: context === 'price' || context === 'fx',
      shouldLog: true
    };
  }
  
  handleNetworkError(error, context) {
    return {
      userMessage: 'Network error. Check connection',
      shouldUnlockField: true,
      shouldLog: true
    };
  }
  
  handleRateLimitError(error, context) {
    return {
      userMessage: 'Rate limit reached. Try again later',
      shouldUnlockField: false,
      shouldLog: true
    };
  }
  
  handleUnknownError(error, context) {
    console.error('Unexpected error:', error);
    return {
      userMessage: 'An unexpected error occurred',
      shouldUnlockField: true,
      shouldLog: true
    };
  }
}
```

### Error Recovery Strategies

1. **Automatic Retry**: Not implemented to avoid API quota waste
2. **Fallback Chain**: Primary → Secondary → Manual entry
3. **Field Unlocking**: Allow manual entry when all APIs fail
4. **Status Messages**: Clear communication of error state
5. **Graceful Degradation**: App remains functional with manual input

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

**Property Reflection**

After analyzing all acceptance criteria, I identified the following properties that are suitable for property-based testing:

**Identified Properties**:
1. ADR Ratio search query format (7.3)
2. FX Projections search query format (12.3)
3. ADR ticker filtering (9.1)
4. Primary ticker filtering (9.2)
5. Twelve Data response parsing (14.3)
6. localStorage persistence (15.1)
7. localStorage restoration (15.2)

**Redundancy Analysis**:
- Properties 1 and 2 (search query formats) are similar but test different query templates - keep both
- Properties 3 and 4 (ticker filtering) are complementary (US vs non-US) - keep both
- Properties 6 and 7 (persistence and restoration) are inverses of each other and can be combined into a round-trip property

**Final Properties** (after removing redundancy):
1. Search query format correctness
2. Ticker filtering correctness
3. API response parsing correctness
4. localStorage round-trip correctness

### Property 1: Search Query Format Correctness

*For any* pair of valid ticker symbols (ADR ticker and primary ticker), the ADR ratio search query SHALL be formatted as "ADR ratio {adrTicker} {primaryTicker}" and the FX projections query SHALL be formatted as "{currency} to USD forecast"

**Validates: Requirements 7.3, 12.3**

### Property 2: Ticker Filtering Correctness

*For any* set of ticker search results, when filtering for the ADR field, all results SHALL be from US exchanges (NYSE, NASDAQ, AMEX), and when filtering for the primary listing field, no results SHALL be from US exchanges

**Validates: Requirements 9.1, 9.2**

### Property 3: API Response Parsing Correctness

*For any* valid Twelve Data API response containing a price field, the Price_Fetcher SHALL successfully extract the numeric price value

**Validates: Requirements 14.3**

### Property 4: localStorage Round-Trip Correctness

*For any* valid application state containing user inputs (tickers, quantities, commissions, ratio), saving to localStorage and then restoring SHALL produce an equivalent state, excluding API-fetched values (prices, FX rates)

**Validates: Requirements 15.1, 15.2, 15.3, 15.5**

## Testing Strategy

### Testing Approach

This feature requires a **dual testing approach** combining unit tests and property-based tests:

**Unit Tests**: Focus on specific examples, integration points, error conditions, and UI behavior
**Property Tests**: Verify universal properties across randomized inputs

### Property-Based Testing

**Library Selection**: Use **fast-check** for JavaScript property-based testing

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with feature name and property reference
- Tag format: `Feature: adr-comparator-production-ready, Property {number}: {property_text}`

**Property Test Implementation**:

```javascript
// Property 1: Search Query Format Correctness
test('Feature: adr-comparator-production-ready, Property 1: Search query format correctness', () => {
  fc.assert(
    fc.property(
      fc.string({ minLength: 1, maxLength: 10 }), // adrTicker
      fc.string({ minLength: 1, maxLength: 10 }), // primaryTicker
      fc.string({ minLength: 3, maxLength: 3 }),  // currency
      (adrTicker, primaryTicker, currency) => {
        const ratioQuery = buildRatioSearchQuery(adrTicker, primaryTicker);
        const fxQuery = buildFXProjectionsQuery(currency);
        
        expect(ratioQuery).toBe(`ADR ratio ${adrTicker} ${primaryTicker}`);
        expect(fxQuery).toBe(`${currency} to USD forecast`);
      }
    ),
    { numRuns: 100 }
  );
});

// Property 2: Ticker Filtering Correctness
test('Feature: adr-comparator-production-ready, Property 2: Ticker filtering correctness', () => {
  fc.assert(
    fc.property(
      fc.array(fc.record({
        symbol: fc.string(),
        name: fc.string(),
        exchange: fc.oneof(
          fc.constant('NYSE'),
          fc.constant('NASDAQ'),
          fc.constant('AMEX'),
          fc.constant('TSE'),
          fc.constant('LSE'),
          fc.constant('HKEX')
        )
      })),
      (tickers) => {
        const adrFiltered = filterTickersForADR(tickers);
        const primaryFiltered = filterTickersForPrimary(tickers);
        
        // All ADR results must be US exchanges
        expect(adrFiltered.every(t => 
          ['NYSE', 'NASDAQ', 'AMEX'].includes(t.exchange)
        )).toBe(true);
        
        // No primary results should be US exchanges
        expect(primaryFiltered.every(t => 
          !['NYSE', 'NASDAQ', 'AMEX'].includes(t.exchange)
        )).toBe(true);
      }
    ),
    { numRuns: 100 }
  );
});

// Property 3: API Response Parsing Correctness
test('Feature: adr-comparator-production-ready, Property 3: API response parsing correctness', () => {
  fc.assert(
    fc.property(
      fc.double({ min: 0.01, max: 10000 }), // price
      fc.string({ minLength: 3, maxLength: 3 }), // currency
      fc.integer({ min: 1000000000, max: 2000000000 }), // timestamp
      (price, currency, timestamp) => {
        const response = {
          price: price.toString(),
          currency: currency,
          timestamp: timestamp
        };
        
        const parsed = parseTwelveDataResponse(response);
        
        expect(parsed.success).toBe(true);
        expect(parsed.price).toBeCloseTo(price, 2);
        expect(parsed.currency).toBe(currency);
      }
    ),
    { numRuns: 100 }
  );
});

// Property 4: localStorage Round-Trip Correctness
test('Feature: adr-comparator-production-ready, Property 4: localStorage round-trip correctness', () => {
  fc.assert(
    fc.property(
      fc.record({
        adrTicker: fc.string({ minLength: 1, maxLength: 10 }),
        localTicker: fc.string({ minLength: 1, maxLength: 10 }),
        localCurrency: fc.string({ minLength: 3, maxLength: 3 }),
        ratio: fc.double({ min: 0.01, max: 10 }),
        localQuantity: fc.integer({ min: 1, max: 10000 }),
        adrCommission: fc.double({ min: 0, max: 100 }),
        localCommission: fc.double({ min: 0, max: 1000 })
      }),
      (state) => {
        // Save state
        stateManager.saveState(state);
        
        // Clear in-memory state
        stateManager.clearMemory();
        
        // Restore from localStorage
        const restored = stateManager.loadState();
        
        // Verify all user inputs are restored
        expect(restored.adrTicker).toBe(state.adrTicker);
        expect(restored.localTicker).toBe(state.localTicker);
        expect(restored.localCurrency).toBe(state.localCurrency);
        expect(restored.ratio).toBeCloseTo(state.ratio, 4);
        expect(restored.localQuantity).toBe(state.localQuantity);
        expect(restored.adrCommission).toBeCloseTo(state.adrCommission, 2);
        expect(restored.localCommission).toBeCloseTo(state.localCommission, 2);
        
        // Verify API-fetched values are NOT restored
        expect(restored.adrPrice).toBeUndefined();
        expect(restored.localPrice).toBeUndefined();
        expect(restored.localToUsdRate).toBeUndefined();
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Testing Strategy

**Test Categories**:

1. **API Integration Tests** (with mocks):
   - Fallback chain behavior (Yahoo → Twelve Data → Manual)
   - FX fallback chain (Yahoo → Frankfurter → Manual)
   - Rate limiting enforcement
   - Error handling for each API

2. **UI State Management Tests**:
   - Field locking/unlocking on API success/failure
   - Status message display (timestamp vs error)
   - Button enable/disable states
   - Dropdown visibility and filtering

3. **Event Handler Tests**:
   - Auto-fetch on ticker selection
   - Auto-fetch on currency change
   - Refresh button behavior
   - Reset button behavior
   - Helper button behavior (search links)

4. **Calculation Tests**:
   - Cost comparison calculations
   - ADR premium/discount calculations
   - Break-even FX calculations
   - Real-time updates on input change

5. **Responsive Design Tests**:
   - Layout at 760px breakpoint
   - Layout at 640px breakpoint
   - Touch interaction on mobile
   - Sparkline rendering on small screens

6. **localStorage Tests**:
   - Persistence of user inputs
   - Non-persistence of API-fetched values
   - Clear on reset
   - Restoration on page load

### Integration Testing

**End-to-End Scenarios**:

1. **Happy Path**: Select tickers → Auto-fetch prices → Auto-fetch FX → View analysis
2. **Fallback Path**: Yahoo fails → Twelve Data succeeds → View analysis
3. **Manual Entry Path**: All APIs fail → Manual entry → View analysis
4. **Refresh Path**: Change inputs → Click refresh → All data updates
5. **Reset Path**: Fill form → Click reset → All cleared
6. **Persistence Path**: Fill form → Reload page → Data restored

### Test Coverage Goals

- **Unit Tests**: 80%+ code coverage
- **Property Tests**: 100% of identified properties
- **Integration Tests**: All critical user flows
- **Responsive Tests**: All breakpoints (640px, 760px, 1024px)

### Mocking Strategy

**Mock External APIs**:
- Yahoo Finance API responses
- Twelve Data API responses
- Frankfurter API responses

**Mock Browser APIs**:
- localStorage
- window.open (for search helpers)
- fetch API

**Test Doubles**:
- Use dependency injection for API clients
- Mock rate limiter for testing
- Mock error handler for testing



## Implementation Considerations

### Code Organization

```
/
├── index.html              # Main HTML structure
├── styles.css              # Styling and responsive design
├── app.js                  # Main application entry point
├── server.js               # Node.js proxy server
├── package.json            # Dependencies and scripts
└── src/
    ├── fetchers/
    │   ├── PriceFetcher.js     # Price fetching with fallback
    │   ├── FXFetcher.js        # FX rate fetching with fallback
    │   └── TickerSearch.js     # Ticker autocomplete
    ├── managers/
    │   ├── FieldManager.js     # Field state management
    │   ├── StateManager.js     # Application state and localStorage
    │   └── ErrorHandler.js     # Centralized error handling
    ├── renderers/
    │   ├── ChartRenderer.js    # Cost comparison chart
    │   └── SparklineRenderer.js # FX sparkline chart
    ├── utils/
    │   ├── RateLimiter.js      # API rate limiting
    │   ├── formatters.js       # Number and currency formatting
    │   └── validators.js       # Input validation
    └── config/
        └── constants.js        # API endpoints, exchange lists, etc.
```

### Dependency Management

**Production Dependencies**:
- None (vanilla JavaScript)

**Development Dependencies**:
- `fast-check`: Property-based testing
- `jest`: Test runner
- `@testing-library/dom`: DOM testing utilities
- `node-fetch`: Server-side fetch polyfill (if needed)

**Server Dependencies**:
- Node.js built-in modules only (`http`, `fs/promises`, `path`)

### Environment Configuration

```javascript
// .env file (not committed to version control)
TWELVE_DATA_API_KEY=your_api_key_here
PORT=4173

// config.js
const config = {
  twelveDataApiKey: process.env.TWELVE_DATA_API_KEY || '',
  port: process.env.PORT || 4173,
  apis: {
    yahoo: {
      search: 'https://query2.finance.yahoo.com/v1/finance/search',
      price: 'https://query1.finance.yahoo.com/v8/finance/chart',
    },
    twelveData: {
      price: 'https://api.twelvedata.com/price',
      timeSeries: 'https://api.twelvedata.com/time_series',
    },
    frankfurter: {
      latest: 'https://api.frankfurter.app/latest',
      timeSeries: 'https://api.frankfurter.app',
    }
  },
  rateLimits: {
    twelveData: {
      maxCalls: 800,
      windowMs: 24 * 60 * 60 * 1000 // 24 hours
    }
  },
  exchanges: {
    us: ['NYSE', 'NASDAQ', 'AMEX', 'NYQ', 'NMS', 'NGM', 'NCM'],
    nonUs: ['TSE', 'LSE', 'HKEX', 'FRA', 'PAR', 'AMS', 'SWX', 'TSX', 'ASX']
  }
};
```

### Performance Considerations

1. **Debouncing**: 250ms debounce on ticker search to reduce API calls
2. **Caching**: Cache ticker search results in memory
3. **Lazy Loading**: Load sparkline data only when FX sensitivity card is visible
4. **Throttling**: Rate limit Twelve Data API calls to respect quota
5. **Parallel Fetching**: Fetch ADR price, primary price, and FX rate in parallel during refresh

### Security Considerations

1. **API Key Protection**: Store Twelve Data API key in environment variables, never in client code
2. **Input Sanitization**: Sanitize all user inputs before using in API requests
3. **CORS Handling**: Use server-side proxy to avoid exposing API keys
4. **XSS Prevention**: Use textContent instead of innerHTML for user-provided data
5. **Rate Limiting**: Prevent abuse by limiting API calls

### Accessibility Considerations

1. **ARIA Labels**: All form fields have descriptive aria-label attributes
2. **Role Attributes**: Suggestions dropdown uses role="listbox" and role="option"
3. **Status Messages**: Use role="status" for live status updates
4. **Keyboard Navigation**: All interactive elements accessible via keyboard
5. **Focus Management**: Maintain logical focus order through form
6. **Color Contrast**: Ensure sufficient contrast for all text and UI elements
7. **Screen Reader Support**: Provide meaningful labels and status updates

### Browser Compatibility

**Target Browsers**:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari 14+
- Chrome Android 90+

**Polyfills** (if needed):
- None required for target browsers

**Progressive Enhancement**:
- Core functionality works without JavaScript (form inputs)
- Enhanced with JavaScript for auto-fetch and real-time updates
- Graceful degradation for older browsers

### Deployment Considerations

1. **Build Process**: No build step required (vanilla JavaScript)
2. **Static Assets**: Serve HTML, CSS, JS directly
3. **Server Deployment**: Deploy Node.js server to any Node.js hosting platform
4. **Environment Variables**: Configure API keys via environment variables
5. **Monitoring**: Log API usage to track Twelve Data quota
6. **Error Tracking**: Log errors to console (consider adding error tracking service)

### Future Enhancements (Out of Scope)

1. **Historical Cost Comparison**: Show cost trends over time
2. **Multiple Currency Support**: Compare costs in different base currencies
3. **Portfolio Mode**: Compare multiple ADR/primary pairs simultaneously
4. **Export Functionality**: Export comparison results to CSV/PDF
5. **User Accounts**: Save multiple comparisons
6. **Advanced Charting**: Interactive charts with zoom and pan
7. **Real-Time Updates**: WebSocket connection for live price updates
8. **Tax Implications**: Calculate tax differences between ADR and primary
9. **Dividend Comparison**: Compare dividend yields and withholding taxes
10. **Mobile App**: Native iOS/Android applications

## Summary

This design document specifies a production-ready enhancement to the ADR vs Primary Listing cost comparison tool. The architecture maintains the existing vanilla JavaScript approach while adding:

1. **Automation**: Auto-fetch on ticker selection eliminates manual button clicks
2. **Reliability**: Fallback API chains (Yahoo → Twelve Data → Manual) ensure data availability
3. **User Experience**: Read-only fields with manual override, clear error states, and helper buttons
4. **Maintainability**: Clean separation of concerns with dedicated components for fetching, state management, and rendering
5. **Production Readiness**: Comprehensive error handling, rate limiting, localStorage persistence, and responsive design

The implementation follows established patterns from the existing codebase while introducing new capabilities that enhance reliability and user experience. All enhancements are designed to work seamlessly with the existing vanilla JavaScript architecture without introducing heavy dependencies or frameworks.

