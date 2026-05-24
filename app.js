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

const form = document.querySelector("#calculatorForm");
const fields = Array.from(form.elements).filter((field) => field.name);
const storageKey = "adr-local-comparator-inputs-v6";
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
  ZAR: "South African Rand"
};

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
  return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(2)}%`;
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
  document.querySelector("#fxInsight").textContent = primaryWins
    ? `Primary remains cheaper until FX rises ${pct(fxDistance)} from current.`
    : `Primary needs FX about ${pct(fxDistance)} from current to break even.`;
  document.querySelector("#commissionImpact").textContent = moneyUsd.format(Math.abs(commissionDifference));
  document.querySelector("#commissionInsight").textContent = Math.abs(commissionDifference) < 0.005
    ? "Commissions are equal on these inputs."
    : commissionDifference > 0
      ? `ADR commission is higher by ${moneyUsd.format(Math.abs(commissionDifference))}.`
      : `Primary commission is higher by ${moneyUsd.format(Math.abs(commissionDifference))}.`;
  document.querySelector("#shareEquivalence").textContent = `${numberFmt.format(result.adrQuantity)} ADR = ${numberFmt.format(result.localQuantity)} primary shares`;
  document.querySelector("#impliedAdr").textContent = moneyUsd.format(result.impliedAdrMid);

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
    button.innerHTML = `<strong>${quote.symbol}</strong><span>${quote.name}${quote.venue ? ` - ${quote.venue}` : ""}</span>`;
    button.addEventListener("click", () => {
      document.querySelector(`#${side}Ticker`).value = quote.symbol;
      document.querySelector(`#${side}Name`).textContent = quote.name;
      if (side === "local" && quote.currency) form.elements.localCurrency.value = quote.currency;
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
    const quotes = (data.quotes || []).filter((quote) => quote.symbol).map(normalizeQuote);
    renderSuggestions(side, quotes);
    if (quotes.length) setLookupStatus(side, `${quotes.length} matches`, "good");
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
    setLookupStatus("fx", `${data.source || "FX"} ${formatSourceTime(data.timestamp || data.date)}`, "good");
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
});

form.addEventListener("change", (event) => {
  if (event.target.id === "adrTicker") updateTickerMetadata("adr");
  if (event.target.id === "localTicker") updateTickerMetadata("local");
  if (event.target.id === "localCurrency") lookupFx();
  updateView();
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".ticker-cell")) {
    hideSuggestions("adr");
    hideSuggestions("local");
  }
});

document.querySelector("#adrLookupButton").addEventListener("click", () => lookupPrice("adr"));
document.querySelector("#localLookupButton").addEventListener("click", () => lookupPrice("local"));
document.querySelector("#fxLookupButton").addEventListener("click", lookupFx);

writeInputs({ ...defaults, ...getSavedInputs() });
document.querySelector("#adrQuantityOut").classList.add("computed-output");
populateCurrencies();
updateView();
