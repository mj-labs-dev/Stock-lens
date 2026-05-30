const defaults = {
  adrTicker: "TM",
  adrName: "Toyota Motor Corporation",
  localTicker: "7203.T",
  localName: "Toyota Motor Corporation",
  adrPrice: 215.40,
  localPrice: 3125,
  ratio: 0.1,
  localQuantity: 250,
  adrCommission: 0,
  localCommission: 0,
  localToUsdRate: 0.00638,
  localCurrency: "JPY",
  fxStatus: ""
};

// FieldManager class for managing read-only field states
class FieldManager {
  lockField(fieldId) {
    const field = document.querySelector(`#${fieldId}`);
    if (field) {
      field.setAttribute('readonly', 'readonly');
    }
  }

  unlockField(fieldId) {
    const field = document.querySelector(`#${fieldId}`);
    if (field) {
      field.removeAttribute('readonly');
    }
  }

  updateAndLock(fieldId, value) {
    const field = document.querySelector(`#${fieldId}`);
    if (field) {
      field.value = value;
      field.setAttribute('readonly', 'readonly');
    }
  }

  showSuccess(statusId, timestamp) {
    const statusEl = document.querySelector(`#${statusId}`);
    if (statusEl) {
      statusEl.textContent = `Updated ${timestamp}`;
      statusEl.dataset.tone = 'good';
    }
  }

  showError(statusId, fieldId, errorMessage) {
    const statusEl = document.querySelector(`#${statusId}`);
    if (statusEl) {
      statusEl.textContent = errorMessage;
      statusEl.dataset.tone = 'bad';
    }
    this.unlockField(fieldId);
  }

  clearStatus(statusId) {
    const statusEl = document.querySelector(`#${statusId}`);
    if (statusEl) {
      statusEl.textContent = '';
      delete statusEl.dataset.tone;
    }
  }
}

const fieldManager = new FieldManager();

// PriceFetcher class with fallback chain
class PriceFetcher {
  async autoFetch(ticker, side) {
    if (!ticker) return { success: false, error: 'No ticker provided' };
    
    const fieldId = side === 'adr' ? 'adrPrice' : 'localPrice';
    const statusId = side === 'adr' ? 'adrLookupStatus' : 'localLookupStatus';
    
    fieldManager.clearStatus(statusId);
    
    // Try Yahoo Finance first
    try {
      const result = await this.fetchFromYahoo(ticker);
      if (result.success) {
        fieldManager.updateAndLock(fieldId, result.price.toFixed(4));
        fieldManager.showSuccess(statusId, formatLookupTime());
        return result;
      }
    } catch (error) {
      console.warn('Yahoo Finance failed:', error.message);
    }
    
    // Fallback to Twelve Data
    try {
      const result = await this.fetchFromTwelveData(ticker);
      if (result.success) {
        fieldManager.updateAndLock(fieldId, result.price.toFixed(4));
        fieldManager.showSuccess(statusId, formatLookupTime());
        return result;
      }
    } catch (error) {
      console.warn('Twelve Data failed:', error.message);
    }
    
    // Both failed - trigger manual entry mode
    fieldManager.showError(statusId, fieldId, 'Unable to fetch price. Enter manually');
    return { success: false, error: 'All APIs failed' };
  }

  async refresh(ticker, side) {
    return this.autoFetch(ticker, side);
  }

  async fetchFromYahoo(ticker) {
    const response = await fetchJson(`/api/price?symbol=${encodeURIComponent(ticker)}`);
    const meta = response.chart?.result?.[0]?.meta;
    const price = meta?.regularMarketPrice ?? meta?.previousClose ?? meta?.chartPreviousClose;
    
    if (!Number.isFinite(price)) {
      throw new Error('Invalid price data');
    }
    
    const currency = meta.currency || 'USD';
    
    // Normalize currency subunits (GBp -> GBP, etc.)
    const normalized = normalizeCurrencyAndPrice(currency, price);
    
    return {
      success: true,
      price: normalized.price,
      currency: normalized.currency,
      originalCurrency: normalized.wasConverted ? normalized.originalCurrency : currency,
      wasConverted: normalized.wasConverted,
      timestamp: meta.regularMarketTime,
      source: 'yahoo'
    };
  }

  async fetchFromTwelveData(ticker) {
    const response = await fetchJson(`/api/twelve-data/price?symbol=${encodeURIComponent(ticker)}`);
    
    if (!Number.isFinite(response.price)) {
      throw new Error('Invalid price data');
    }
    
    return {
      success: true,
      price: response.price,
      currency: 'USD',
      timestamp: response.timestamp,
      source: 'twelve_data'
    };
  }
}

const priceFetcher = new PriceFetcher();

// FXFetcher class with fallback chain
class FXFetcher {
  async autoFetch(fromCurrency, toCurrency = 'USD') {
    if (!fromCurrency) return { success: false, error: 'No currency provided' };
    
    const upperFrom = fromCurrency.toUpperCase();
    const upperTo = toCurrency.toUpperCase();
    
    // Handle USD to USD
    if (upperFrom === upperTo) {
      fieldManager.updateAndLock('localToUsdRate', '1.000000');
      fieldManager.showSuccess('fxLookupStatus', 'USD base');
      return { success: true, rate: 1, source: 'direct' };
    }
    
    fieldManager.clearStatus('fxLookupStatus');
    
    // Try Yahoo Finance first
    try {
      const result = await this.fetchFromYahoo(upperFrom, upperTo);
      if (result.success) {
        fieldManager.updateAndLock('localToUsdRate', result.rate.toFixed(8));
        fieldManager.showSuccess('fxLookupStatus', formatLookupTime());
        return result;
      }
    } catch (error) {
      console.warn('Yahoo FX failed:', error.message);
    }
    
    // Fallback to Frankfurter
    try {
      const result = await this.fetchFromFrankfurter(upperFrom, upperTo);
      if (result.success) {
        fieldManager.updateAndLock('localToUsdRate', result.rate.toFixed(8));
        fieldManager.showSuccess('fxLookupStatus', formatLookupTime());
        return result;
      }
    } catch (error) {
      console.warn('Frankfurter failed:', error.message);
    }
    
    // Both failed - trigger manual entry mode
    fieldManager.showError('fxLookupStatus', 'localToUsdRate', 'Unable to fetch FX rate. Enter manually');
    return { success: false, error: 'All APIs failed' };
  }

  async refresh(fromCurrency, toCurrency = 'USD') {
    return this.autoFetch(fromCurrency, toCurrency);
  }

  async fetchHistory(fromCurrency, toCurrency = 'USD') {
    try {
      const response = await fetchJson(`/api/fx-history?from=${encodeURIComponent(fromCurrency)}&to=${encodeURIComponent(toCurrency)}`);
      return {
        success: true,
        data: response.rates || [],
        error: null
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  async fetchFromYahoo(fromCurrency, toCurrency) {
    const pair = `${fromCurrency}${toCurrency}=X`;
    const response = await fetchJson(`/api/price?symbol=${encodeURIComponent(pair)}`);
    const meta = response.chart?.result?.[0]?.meta;
    const rate = meta?.regularMarketPrice ?? meta?.previousClose ?? meta?.chartPreviousClose;
    
    if (!Number.isFinite(rate)) {
      throw new Error('Invalid FX rate');
    }
    
    return {
      success: true,
      rate,
      timestamp: meta.regularMarketTime,
      source: 'yahoo'
    };
  }

  async fetchFromFrankfurter(fromCurrency, toCurrency) {
    const response = await fetchJson(`/api/fx?from=${encodeURIComponent(fromCurrency)}&to=${encodeURIComponent(toCurrency)}`);
    
    if (!Number.isFinite(response.rate)) {
      throw new Error('Invalid FX rate');
    }
    
    return {
      success: true,
      rate: response.rate,
      date: response.date,
      source: 'frankfurter'
    };
  }
}

const fxFetcher = new FXFetcher();

const form = document.querySelector("#calculatorForm");
const fields = Array.from(form.elements).filter((field) => field.name);
const storageKey = "adr-local-comparator-inputs-v7";
const suggestionCache = {
  adr: new Map(),
  local: new Map()
};
const debounceTimers = {};
const currencyNames = {
  USD: "US Dollar",
  EUR: "Euro",
  JPY: "Japanese Yen",
  GBP: "British Pound Sterling",
  GBp: "British Pence",
  GBX: "British Pence",
  HKD: "Hong Kong Dollar",
  CNY: "Chinese Yuan",
  CNH: "Chinese Yuan Offshore",
  INR: "Indian Rupee",
  CAD: "Canadian Dollar",
  AUD: "Australian Dollar",
  CHF: "Swiss Franc",
  SEK: "Swedish Krona",
  NOK: "Norwegian Krone",
  DKK: "Danish Krone",
  SGD: "Singapore Dollar",
  KRW: "South Korean Won",
  TWD: "New Taiwan Dollar",
  BRL: "Brazilian Real",
  MXN: "Mexican Peso",
  ZAR: "South African Rand",
  ZAc: "South African Cents",
  ILS: "Israeli Shekel",
  ILA: "Israeli Agorot"
};

// Currency subunits that need conversion to main currency
// These are subunit codes that APIs return (case-sensitive detection)
const currencySubunits = {
  'GBp': { mainCurrency: 'GBP', divisor: 100 },  // British Pence -> Pounds
  'GBX': { mainCurrency: 'GBP', divisor: 100 },  // British Pence (alternative) -> Pounds
  'ZAc': { mainCurrency: 'ZAR', divisor: 100 },  // South African Cents -> Rand
  'ILA': { mainCurrency: 'ILS', divisor: 100 }   // Israeli Agorot -> Shekel
};

// Helper function to normalize currency and price
function normalizeCurrencyAndPrice(currency, price) {
  // Check if this is a known subunit (case-sensitive check)
  const subunit = currencySubunits[currency];
  
  if (subunit) {
    // This is a subunit - convert to main currency
    return {
      currency: subunit.mainCurrency,
      price: price / subunit.divisor,
      wasConverted: true,
      originalCurrency: currency
    };
  }
  
  // Not a subunit - return as-is with uppercase currency
  return {
    currency: currency.toUpperCase(),
    price: price,
    wasConverted: false
  };
}

const moneyUsd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2
});

const numberFmt = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 4
});

const fxFmt = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 6,
  maximumFractionDigits: 8
});

function getSavedInputs() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || {};
  } catch {
    return {};
  }
}

function coerceNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function readInputs() {
  return fields.reduce((values, field) => {
    values[field.name] = field.type === "number" ? coerceNumber(field.value) : field.value.trim();
    return values;
  }, {
    adrName: document.querySelector("#adrName").textContent.trim(),
    localName: document.querySelector("#localName").textContent.trim(),
    fxStatus: document.querySelector("#fxLookupStatus").textContent.trim()
  });
}

function writeInputs(values) {
  fields.forEach((field) => {
    if (Object.hasOwn(values, field.name)) field.value = values[field.name];
  });
  if (Object.hasOwn(values, "adrName")) document.querySelector("#adrName").textContent = values.adrName;
  if (Object.hasOwn(values, "localName")) document.querySelector("#localName").textContent = values.localName;
  if (Object.hasOwn(values, "fxStatus")) document.querySelector("#fxLookupStatus").textContent = values.fxStatus;
}

function setFieldValue(id, value) {
  const field = document.querySelector(`#${id}`);
  field.value = Number.isFinite(value) ? Number(value.toFixed(6)) : 0;
}

function formatLocal(value, currency) {
  return `${numberFmt.format(value)} ${currency || "local"}`;
}

function getCurrencyName(code) {
  return currencyNames[(code || "").trim().toUpperCase()] || "Unknown currency";
}

function pct(value) {
  if (!Number.isFinite(value)) return "0.00%";
  const sign = value < 0 ? "" : "";  // No sign for positive, keep minus for negative
  return `${sign}${Math.abs(value * 100).toFixed(2)}%`;
}

function formatLookupTime() {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date());
}

function formatSourceTime(timestamp) {
  if (!timestamp) return formatLookupTime();
  const date = typeof timestamp === "number" ? new Date(timestamp * 1000) : new Date(timestamp);
  if (Number.isNaN(date.getTime())) return formatLookupTime();
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function calculate(values) {
  const ratio = Math.max(values.ratio, 0);
  const localQuantity = Math.max(values.localQuantity, 0);
  const adrQuantity = localQuantity * ratio;
  const localToUsdRate = Math.max(values.localToUsdRate, 0);

  const adrGrossUsd = adrQuantity * Math.max(values.adrPrice, 0);
  const adrCommissionUsd = Math.max(values.adrCommission, 0);
  const adrTotalUsd = adrGrossUsd + adrCommissionUsd;

  const localGross = localQuantity * Math.max(values.localPrice, 0);
  const localCommission = Math.max(values.localCommission, 0);
  const localTotal = localGross + localCommission;
  const localTotalUsd = localTotal * localToUsdRate;
  const localCommissionUsd = localCommission * localToUsdRate;

  const impliedAdrMid = ratio > 0 ? (Math.max(values.localPrice, 0) * localToUsdRate) / ratio : 0;
  const premium = impliedAdrMid > 0 ? Math.max(values.adrPrice, 0) / impliedAdrMid - 1 : 0;
  const difference = adrTotalUsd - localTotalUsd;
  const breakEvenFx = localTotal > 0 ? adrTotalUsd / localTotal : 0;

  return {
    adrQuantity,
    adrGrossUsd,
    adrCommissionUsd,
    adrTotalUsd,
    localQuantity,
    localGross,
    localCommission,
    localCommissionUsd,
    localTotal,
    localTotalUsd,
    impliedAdrMid,
    premium,
    difference,
    breakEvenFx
  };
}

function updateView() {
  const values = readInputs();
  const result = calculate(values);
  const currency = (values.localCurrency || "local").toUpperCase();
  const primaryWins = result.localTotalUsd < result.adrTotalUsd;
  const tie = Math.abs(result.difference) < 0.005;
  const winner = tie ? "Tie" : primaryWins ? "Primary Listing" : "ADR";
  const cheaperBy = Math.abs(result.difference);
  const maxCost = Math.max(result.adrTotalUsd, result.localTotalUsd, 1);
  const commissionDifference = result.adrCommissionUsd - result.localCommissionUsd;
  const fxDistance = values.localToUsdRate > 0 ? (result.breakEvenFx / values.localToUsdRate) - 1 : 0;

  document.querySelector("#winner").textContent = winner;
  document.querySelector("#summaryLine").textContent = tie
    ? "Both routes are effectively equal on these inputs."
    : `${winner} is cheaper by ${moneyUsd.format(cheaperBy)}.`;

  document.querySelector("#localPriceLabel").textContent = `Price (${currency})`;
  document.querySelector("#localCommissionLabel").textContent = `Commission (${currency})`;
  document.querySelector("#fxRateLabel").textContent = `FX Rate (1 ${currency} = $)`;
  document.querySelector("#currencyName").textContent = getCurrencyName(currency);
  document.querySelector("#adrQuantityOut").textContent = numberFmt.format(result.adrQuantity);

  document.querySelector("#adrChartValue").textContent = moneyUsd.format(result.adrTotalUsd);
  document.querySelector("#localChartValue").textContent = moneyUsd.format(result.localTotalUsd);
  document.querySelector("#adrCostBar").style.width = `${Math.max((result.adrTotalUsd / maxCost) * 100, 2)}%`;
  document.querySelector("#localCostBar").style.width = `${Math.max((result.localTotalUsd / maxCost) * 100, 2)}%`;

  document.querySelector("#premium").textContent = pct(result.premium);
  document.querySelector("#premiumDetail").textContent = `ADR price vs ${moneyUsd.format(result.impliedAdrMid)} primary equivalent`;
  document.querySelector("#breakEvenFx").textContent = fxFmt.format(result.breakEvenFx);
  
  // Simplified FX insight text
  // When FX rate needs to rise (positive fxDistance), the foreign currency strengthens
  // When FX rate needs to drop (negative fxDistance), the foreign currency weakens
  const absFxDistance = Math.abs(fxDistance);
  const currencyStrengthDirection = fxDistance > 0 ? "strengthen" : "weaken";
  
  const fxInsightText = `${currency} needs to ${currencyStrengthDirection} against USD by at least ${pct(absFxDistance)}.`;
  
  document.querySelector("#fxInsight").textContent = fxInsightText;

  localStorage.setItem(storageKey, JSON.stringify(values));
}

function setLookupStatus(side, message, tone = "") {
  const node = document.querySelector(`#${side}LookupStatus`);
  node.textContent = message;
  node.dataset.tone = tone;
}

function normalizeQuote(quote) {
  return {
    symbol: quote.symbol,
    name: quote.shortname || quote.longname || quote.displayName || quote.symbol,
    venue: quote.exchange || quote.exchDisp || "",
    currency: quote.currency || ""
  };
}

function populateCurrencies() {
  const list = document.querySelector("#currencySuggestions");
  if (!list) return;

  Object.entries(currencyNames).forEach(([code, name]) => {
    const option = document.createElement("option");
    option.value = code;
    option.label = name;
    list.append(option);
  });
}

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.timeout = 9000;
    request.onload = () => {
      if (request.status < 200 || request.status >= 300) {
        reject(new Error(`HTTP ${request.status}`));
        return;
      }

      try {
        resolve(JSON.parse(request.responseText));
      } catch (error) {
        reject(error);
      }
    };
    request.onerror = () => reject(new Error("Network error"));
    request.ontimeout = () => reject(new Error("Request timed out"));
    request.send();
  });
}

function hideSuggestions(side) {
  document.querySelector(`#${side}Suggestions`).replaceChildren();
}

function renderSuggestions(side, quotes) {
  const list = document.querySelector(`#${side}Suggestions`);
  const cache = suggestionCache[side];
  list.replaceChildren();
  cache.clear();

  quotes.forEach((quote) => {
    cache.set(quote.symbol.toUpperCase(), quote);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "suggestion-option";
    button.setAttribute("role", "option");
    
    // Build display with exchange name
    const exchangeInfo = quote.venue ? ` • ${quote.venue}` : '';
    button.innerHTML = `<strong>${quote.symbol}</strong><span>${quote.name}${exchangeInfo}</span>`;
    
    button.addEventListener("click", async () => {
      document.querySelector(`#${side}Ticker`).value = quote.symbol;
      
      // Show name and exchange
      const nameEl = document.querySelector(`#${side}Name`);
      nameEl.textContent = `${quote.name}${exchangeInfo}`;
      
      // Auto-fetch price when ticker is selected
      if (side === 'adr') {
        await priceFetcher.autoFetch(quote.symbol, 'adr');
      } else {
        const result = await priceFetcher.autoFetch(quote.symbol, 'local');
        
        // Auto-populate currency and fetch FX
        if (result.success && result.currency) {
          fieldManager.updateAndLock('localCurrency', result.currency);
          document.querySelector("#currencyName").textContent = getCurrencyName(result.currency);
          
          await fxFetcher.autoFetch(result.currency, 'USD');
          await loadFXHistory();
        }
      }
      
      hideSuggestions(side);
      updateView();
    });
    list.append(button);
  });
}

async function searchTickers(side, query) {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    hideSuggestions(side);
    return;
  }

  try {
    const data = await fetchJson(`/api/search?q=${encodeURIComponent(trimmed)}`);
    let quotes = (data.quotes || []).filter((quote) => quote.symbol).map(normalizeQuote);
    
    // Filter by exchange
    const usExchanges = ['NYSE', 'NASDAQ', 'AMEX', 'NYQ', 'NMS', 'NGM', 'NCM', 'PNK'];
    if (side === 'adr') {
      // ADR field: only US exchanges (including Pink Sheets/OTC)
      quotes = quotes.filter(q => usExchanges.includes(q.venue.toUpperCase()));
    } else {
      // Primary listing: exclude US exchanges
      quotes = quotes.filter(q => !usExchanges.includes(q.venue.toUpperCase()));
    }
    
    renderSuggestions(side, quotes);
  } catch {
    setLookupStatus(side, "Search unavailable", "bad");
  }
}

function updateTickerMetadata(side) {
  const input = document.querySelector(`#${side}Ticker`);
  const quote = suggestionCache[side].get(input.value.trim().toUpperCase());
  if (!quote) return;

  document.querySelector(`#${side}Name`).textContent = quote.name;
  if (side === "local" && quote.currency) form.elements.localCurrency.value = quote.currency;
  updateView();
}

async function lookupPrice(side) {
  const ticker = document.querySelector(`#${side}Ticker`).value.trim();
  if (!ticker) {
    setLookupStatus(side, "Enter ticker", "bad");
    return;
  }

  setLookupStatus(side, "Pulling...");
  try {
    const data = await fetchJson(`/api/price?symbol=${encodeURIComponent(ticker)}`);
    const result = data.chart?.result?.[0];
    const meta = result?.meta;
    const price = meta?.regularMarketPrice ?? meta?.previousClose ?? meta?.chartPreviousClose;
    if (!Number.isFinite(price)) throw new Error("missing price");

    if (side === "adr") {
      form.elements.adrPrice.value = Number(price.toFixed(4));
    } else {
      form.elements.localPrice.value = Number(price.toFixed(4));
      if (meta.currency) form.elements.localCurrency.value = meta.currency;
      await lookupFx();
    }

    const quote = suggestionCache[side].get(ticker.toUpperCase());
    if (quote) document.querySelector(`#${side}Name`).textContent = quote.name;
    setLookupStatus(side, `Updated ${formatSourceTime(meta?.regularMarketTime)}`, "good");
    updateView();
  } catch {
    setLookupStatus(side, "Pull failed", "bad");
  }
}

async function lookupFx() {
  const currency = form.elements.localCurrency.value.trim().toUpperCase();
  if (!currency) {
    setLookupStatus("fx", "Enter currency", "bad");
    return;
  }
  if (currency === "USD") {
    form.elements.localToUsdRate.value = 1;
    setLookupStatus("fx", "USD base", "good");
    updateView();
    return;
  }

  setLookupStatus("fx", "Pulling...");
  try {
    const data = await fetchJson(`/api/fx?from=${encodeURIComponent(currency)}&to=USD`);
    if (!Number.isFinite(data.rate)) throw new Error("missing rate");
    form.elements.localToUsdRate.value = data.rate.toFixed(8);
    setLookupStatus("fx", `Updated ${formatSourceTime(data.timestamp || data.date)}`, "good");
    updateView();
  } catch {
    setLookupStatus("fx", "FX pull failed", "bad");
  }
}

function queueTickerSearch(side) {
  window.clearTimeout(debounceTimers[side]);
  debounceTimers[side] = window.setTimeout(() => {
    searchTickers(side, document.querySelector(`#${side}Ticker`).value);
  }, 250);
}

form.addEventListener("input", (event) => {
  if (event.target.id === "adrTicker") queueTickerSearch("adr");
  if (event.target.id === "localTicker") queueTickerSearch("local");
  updateView();
  
  // Reload FX chart when values that affect breakeven change
  if (['localQuantity', 'ratio', 'adrPrice', 'localPrice', 'adrCommission', 'localCommission', 'localToUsdRate'].includes(event.target.id)) {
    const currency = document.querySelector("#localCurrency").value.trim();
    if (currency && currency !== 'USD') {
      loadFXHistory();
    }
  }
});

form.addEventListener("change", async (event) => {
  if (event.target.id === "adrTicker") updateTickerMetadata("adr");
  if (event.target.id === "localTicker") updateTickerMetadata("local");
  if (event.target.id === "localCurrency") {
    // Auto-fetch FX when currency changes
    const currency = event.target.value.trim();
    if (currency) {
      await fxFetcher.autoFetch(currency, 'USD');
      await loadFXHistory(); // Load FX history when currency changes
    }
  }
  updateView();
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".ticker-cell")) {
    hideSuggestions("adr");
    hideSuggestions("local");
  }
});

// Refresh button - refetch all data
document.querySelector("#refreshButton").addEventListener("click", async () => {
  const adrTicker = document.querySelector("#adrTicker").value.trim();
  const localTicker = document.querySelector("#localTicker").value.trim();
  const currency = document.querySelector("#localCurrency").value.trim();
  
  if (!adrTicker || !localTicker) {
    alert("Please enter both tickers before refreshing");
    return;
  }
  
  const button = document.querySelector("#refreshButton");
  button.disabled = true;
  button.textContent = "Refreshing...";
  
  try {
    await Promise.all([
      priceFetcher.refresh(adrTicker, 'adr'),
      priceFetcher.refresh(localTicker, 'local'),
      currency ? fxFetcher.refresh(currency, 'USD') : Promise.resolve()
    ]);
    updateView();
  } finally {
    button.disabled = false;
    button.innerHTML = '<span class="icon">↻</span> Refresh';
  }
});

// Reset button - clear all inputs
document.querySelector("#resetButton").addEventListener("click", () => {
  if (!confirm("Clear all inputs and reset the calculator?")) {
    return;
  }
  
  // Clear all input fields
  document.querySelectorAll('input[type="text"], input[type="number"]').forEach(input => {
    if (input.id !== 'adrQuantityOut') {
      input.value = '';
      input.removeAttribute('readonly');
    }
  });
  
  // Clear all status messages
  document.querySelectorAll('.lookup-status, .security-name').forEach(el => {
    el.textContent = '';
    delete el.dataset.tone;
  });
  
  // Clear localStorage
  localStorage.removeItem(storageKey);
  
  // Reset analysis
  updateView();
});

// ADR Ratio search helper
document.querySelector("#ratioSearchButton").addEventListener("click", () => {
  const adrTicker = document.querySelector("#adrTicker").value.trim();
  const localTicker = document.querySelector("#localTicker").value.trim();
  
  if (!adrTicker || !localTicker) {
    alert("Please enter both tickers first");
    return;
  }
  
  const query = `what is the primary listing to ADR ratio for ${localTicker} and ${adrTicker}`;
  window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
});

// FX Projections search helper
document.querySelector("#fxProjectionsButton").addEventListener("click", () => {
  const currency = document.querySelector("#localCurrency").value.trim();
  
  if (!currency) {
    alert("Please enter a currency first");
    return;
  }
  
  const query = `${currency} to USD forecast`;
  window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
});

// Sparkline renderer with breakeven line
function renderSparkline(data, breakEvenRate, currency) {
  const canvas = document.querySelector("#fxSparkline");
  
  if (!canvas) {
    return;
  }
  
  if (!data || data.length === 0) {
    return;
  }
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const padding = 8;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Extract rates
  const rates = data.map(d => d.rate);
  const currentRate = rates[rates.length - 1];
  
  // Include breakeven in range calculation if provided
  const allValues = breakEvenRate && Number.isFinite(breakEvenRate) ? [...rates, breakEvenRate] : rates;
  const minRate = Math.min(...allValues);
  const maxRate = Math.max(...allValues);
  const range = maxRate - minRate || 1;
  
  // Helper to convert rate to Y coordinate
  const rateToY = (rate) => height - padding - ((rate - minRate) / range) * (height - 2 * padding);
  
  // Draw breakeven line if provided
  if (breakEvenRate && Number.isFinite(breakEvenRate)) {
    const breakEvenY = rateToY(breakEvenRate);
    
    // Measure "BEV" text width to create gap in dashed line
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    const bevText = 'BEV';
    const bevWidth = ctx.measureText(bevText).width;
    const bevLeftMargin = 2; // Small margin from container edge
    const gapEnd = bevLeftMargin + bevWidth + 4;
    
    // Draw dashed line with gap for "BEV" label
    ctx.beginPath();
    ctx.strokeStyle = '#374151'; // Neutral gray color
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    
    // Draw line from gap end to right edge
    ctx.moveTo(gapEnd, breakEvenY);
    ctx.lineTo(width - padding, breakEvenY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw "BEV" label at the left edge of container
    ctx.fillStyle = '#374151';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(bevText, bevLeftMargin, breakEvenY);
    
    // Update HTML labels for top and bottom zones
    const topLabel = document.querySelector('.sparkline-label-top');
    const bottomLabel = document.querySelector('.sparkline-label-bottom');
    
    if (topLabel && bottomLabel) {
      if (currentRate > breakEvenRate) {
        // Current rate is above breakeven
        topLabel.textContent = 'Buy ADR';
        bottomLabel.textContent = 'Buy Primary';
      } else {
        // Current rate is below breakeven
        topLabel.textContent = 'Buy Primary';
        bottomLabel.textContent = 'Buy ADR';
      }
    }
  }
  
  // Draw historical line
  ctx.beginPath();
  ctx.strokeStyle = '#0f766e';
  ctx.lineWidth = 2;
  
  data.forEach((d, i) => {
    const x = (i / (data.length - 1)) * (width - 2 * padding) + padding;
    const y = rateToY(d.rate);
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  
  ctx.stroke();
  
  // Draw current rate marker
  const lastX = width - padding;
  const lastY = rateToY(currentRate);
  ctx.beginPath();
  ctx.fillStyle = '#0f766e';
  ctx.arc(lastX, lastY, 3, 0, 2 * Math.PI);
  ctx.fill();
  
  // Update chart label with currency pair
  const labelEl = document.querySelector('.sparkline-label');
  if (labelEl && currency) {
    labelEl.textContent = `6-month FX rate history (${currency} to USD)`;
  }
}

// Load FX history on currency change
async function loadFXHistory() {
  const currency = document.querySelector("#localCurrency").value.trim();
  
  if (!currency || currency === 'USD') {
    return;
  }
  
  const result = await fxFetcher.fetchHistory(currency, 'USD');
  
  if (result.success && result.data.length > 0) {
    const values = readInputs();
    const calc = calculate(values);
    
    renderSparkline(result.data, calc.breakEvenFx, currency);
  }
}

writeInputs({ ...defaults, ...getSavedInputs() });
document.querySelector("#adrQuantityOut").classList.add("computed-output");
populateCurrencies();
updateView();

// Load FX history on page load if currency is set
window.addEventListener('load', () => {
  const initialCurrency = document.querySelector("#localCurrency").value.trim();
  if (initialCurrency && initialCurrency !== 'USD') {
    setTimeout(() => {
      loadFXHistory();
    }, 200);
  }
});
