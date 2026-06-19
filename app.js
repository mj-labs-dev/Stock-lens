const defaults = {
  adrTicker: "TM",
  adrName: "Toyota Motor Corporation",
  localTicker: "7203.T",
  localName: "Toyota Motor Corporation",
  adrPrice: "",
  localPrice: "",
  ratio: 0.1,
  localQuantity: 250,
  adrCommission: 0,
  adrPassThroughFee: 0.03,
  localCommission: 0,
  localToUsdRate: "",
  localCurrency: "JPY",
  fxStatus: ""
};

const knownPairs = {
  'TM:7203.T':         { ratio:0.1,    adr:'TM',     primary:'7203.T',       currency:'JPY', exchange:'TSE',                level:'III', market:'NYSE',    sponsored:true,  depositary:'BNY Mellon',    name:'Toyota Motor' },
  'HMC:7267.T':        { ratio:0.3333, adr:'HMC',    primary:'7267.T',       currency:'JPY', exchange:'TSE',                level:'II',  market:'NYSE',    sponsored:true,  depositary:'JPMorgan',      name:'Honda Motor' },
  'SONY:6758.T':       { ratio:1,      adr:'SONY',   primary:'6758.T',       currency:'JPY', exchange:'TSE',                level:'II',  market:'NYSE',    sponsored:true,  depositary:'JPMorgan',      name:'Sony Group' },
  'MUFG:8306.T':       { ratio:1,      adr:'MUFG',   primary:'8306.T',       currency:'JPY', exchange:'TSE',                level:'II',  market:'NYSE',    sponsored:true,  depositary:'BNY Mellon',    name:'Mitsubishi UFJ Financial' },
  'SMFG:8316.T':       { ratio:1.6667, adr:'SMFG',   primary:'8316.T',       currency:'JPY', exchange:'TSE',                level:'II',  market:'NYSE',    sponsored:true,  depositary:'Citi',          name:'Sumitomo Mitsui Financial' },
  'MFG:8411.T':        { ratio:5,      adr:'MFG',    primary:'8411.T',       currency:'JPY', exchange:'TSE',                level:'II',  market:'NYSE',    sponsored:true,  depositary:'BNY Mellon',    name:'Mizuho Financial' },
  'NTDOY:7974.T':      { ratio:4,      adr:'NTDOY',  primary:'7974.T',       currency:'JPY', exchange:'TSE',                level:'I',   market:'OTC',     sponsored:false, depositary:'Multiple',      name:'Nintendo',                  note:'Level I OTC — wider spreads than exchange-listed ADRs.' },
  'GSK:GSK.L':         { ratio:0.5,    adr:'GSK',    primary:'GSK.L',        currency:'GBP', exchange:'LSE',                level:'II',  market:'NYSE',    sponsored:true,  depositary:'JPMorgan',      name:'GSK plc' },
  'UL:ULVR.L':         { ratio:1,      adr:'UL',     primary:'ULVR.L',       currency:'GBP', exchange:'LSE',                level:'II',  market:'NYSE',    sponsored:true,  depositary:'Deutsche Bank', name:'Unilever' },
  'BP:BP.L':           { ratio:0.1667, adr:'BP',     primary:'BP.L',         currency:'GBP', exchange:'LSE',                level:'II',  market:'NYSE',    sponsored:true,  depositary:'JPMorgan',      name:'BP plc' },
  'RIO:RIO.L':         { ratio:1,      adr:'RIO',    primary:'RIO.L',        currency:'GBP', exchange:'LSE',                level:'II',  market:'NYSE',    sponsored:true,  depositary:'JPMorgan',      name:'Rio Tinto' },
  'SHEL:SHEL.L':       { ratio:0.5,    adr:'SHEL',   primary:'SHEL.L',       currency:'GBP', exchange:'LSE',                level:'III', market:'NYSE',    sponsored:true,  depositary:'JPMorgan',      name:'Shell plc' },
  'HSBC:HSBA.L':       { ratio:0.2,    adr:'HSBC',   primary:'HSBA.L',       currency:'GBP', exchange:'LSE',                level:'II',  market:'NYSE',    sponsored:true,  depositary:'BNY Mellon',    name:'HSBC Holdings' },
  'ASML:ASML.AS':      { ratio:1,      adr:'ASML',   primary:'ASML.AS',      currency:'EUR', exchange:'Euronext Amsterdam', level:'II',  market:'NASDAQ',  sponsored:true,  depositary:'JPMorgan',      name:'ASML Holding' },
  'PHG:PHIA.AS':       { ratio:1,      adr:'PHG',    primary:'PHIA.AS',      currency:'EUR', exchange:'Euronext Amsterdam', level:'II',  market:'NYSE',    sponsored:true,  depositary:'Deutsche Bank', name:'Philips' },
  'EADSY:AIR.PA':      { ratio:4,      adr:'EADSY',  primary:'AIR.PA',       currency:'EUR', exchange:'Euronext Paris',     level:'I',   market:'OTC',     sponsored:false, depositary:'Multiple',      name:'Airbus SE',                 note:'Unsponsored OTC ADR. Consider buying AIR.PA directly on Euronext for tighter spreads.' },
  'SNY:SAN.PA':        { ratio:2,      adr:'SNY',    primary:'SAN.PA',       currency:'EUR', exchange:'Euronext Paris',     level:'II',  market:'NASDAQ',  sponsored:true,  depositary:'JPMorgan',      name:'Sanofi' },
  'LVMUY:MC.PA':       { ratio:5,      adr:'LVMUY',  primary:'MC.PA',        currency:'EUR', exchange:'Euronext Paris',     level:'I',   market:'OTC',     sponsored:false, depositary:'Multiple',      name:'LVMH' },
  'SAP:SAP.DE':        { ratio:1,      adr:'SAP',    primary:'SAP.DE',       currency:'EUR', exchange:'XETRA',              level:'II',  market:'NYSE',    sponsored:true,  depositary:'Deutsche Bank', name:'SAP SE' },
  'SIEGY:SIE.DE':      { ratio:2,      adr:'SIEGY',  primary:'SIE.DE',       currency:'EUR', exchange:'XETRA',              level:'I',   market:'OTC',     sponsored:true,  depositary:'Deutsche Bank', name:'Siemens AG' },
  'BMWKY:BMW.DE':      { ratio:3,      adr:'BMWKY',  primary:'BMW.DE',       currency:'EUR', exchange:'XETRA',              level:'I',   market:'OTC',     sponsored:false, depositary:'Multiple',      name:'BMW AG' },
  'NVS:NOVN.SW':       { ratio:1,      adr:'NVS',    primary:'NOVN.SW',      currency:'CHF', exchange:'SIX',                level:'II',  market:'NYSE',    sponsored:true,  depositary:'JPMorgan',      name:'Novartis' },
  'RHHBY:ROP.SW':      { ratio:8,      adr:'RHHBY',  primary:'ROP.SW',       currency:'CHF', exchange:'SIX',                level:'I',   market:'OTC',     sponsored:true,  depositary:'JPMorgan',      name:'Roche Holding',             note:'RHHBY = non-voting bearer shares. RHHVF = voting registered shares — different share classes with different ratios.' },
  'NSRGY:NESN.SW':     { ratio:1,      adr:'NSRGY',  primary:'NESN.SW',      currency:'CHF', exchange:'SIX',                level:'I',   market:'OTC',     sponsored:true,  depositary:'Citi',          name:'Nestlé',                    note:'Level I OTC. Consider buying NESN.SW directly via IBKR for tighter spreads.' },
  'NVO:NOVO-B.CO':     { ratio:1,      adr:'NVO',    primary:'NOVO-B.CO',    currency:'DKK', exchange:'Nasdaq Copenhagen',  level:'III', market:'NYSE',    sponsored:true,  depositary:'JPMorgan',      name:'Novo Nordisk' },
  'TSM:2330.TW':       { ratio:0.2,    adr:'TSM',    primary:'2330.TW',      currency:'TWD', exchange:'TWSE',               level:'III', market:'NYSE',    sponsored:true,  depositary:'Citi',          name:'TSMC',                      note:'Foreign ownership caps mean TSM ADR frequently trades at a 10–26% premium to the primary listing. Check live premium before buying.' },
  'TCEHY:0700.HK':     { ratio:1,      adr:'TCEHY',  primary:'0700.HK',      currency:'HKD', exchange:'HKEX',               level:'I',   market:'OTC',     sponsored:false, depositary:'Multiple',      name:'Tencent Holdings' },
  'BABA:9988.HK':      { ratio:0.125,  adr:'BABA',   primary:'9988.HK',      currency:'HKD', exchange:'HKEX',               level:'III', market:'NYSE',    sponsored:true,  depositary:'Citi',          name:'Alibaba Group',             note:'Monitor PCAOB/HFCAA delisting risk quarterly.' },
  'JD:9618.HK':        { ratio:0.5,    adr:'JD',     primary:'9618.HK',      currency:'HKD', exchange:'HKEX',               level:'III', market:'NASDAQ',  sponsored:true,  depositary:'Deutsche Bank', name:'JD.com',                    note:'Monitor PCAOB/HFCAA delisting risk quarterly.' },
  'VALE:VALE3.SA':     { ratio:1,      adr:'VALE',   primary:'VALE3.SA',     currency:'BRL', exchange:'B3',                 level:'III', market:'NYSE',    sponsored:true,  depositary:'JPMorgan',      name:'Vale SA' },
  'PBR:PETR3.SA':      { ratio:0.5,    adr:'PBR',    primary:'PETR3.SA',     currency:'BRL', exchange:'B3',                 level:'III', market:'NYSE',    sponsored:true,  depositary:'JPMorgan',      name:'Petrobras',                 note:'PBR = common shares (PETR3). PBR.A = preferred shares (PETR4). Ensure share class matches.' },
  'PBR.A:PETR4.SA':    { ratio:0.5,    adr:'PBR.A',  primary:'PETR4.SA',     currency:'BRL', exchange:'B3',                 level:'II',  market:'NYSE',    sponsored:true,  depositary:'JPMorgan',      name:'Petrobras (Preferred)',      note:'PBR.A = preferred shares (PETR4). PBR = common shares (PETR3). Ensure share class matches.' },
  'ITUB:ITUB4.SA':     { ratio:1,      adr:'ITUB',   primary:'ITUB4.SA',     currency:'BRL', exchange:'B3',                 level:'II',  market:'NYSE',    sponsored:true,  depositary:'JPMorgan',      name:'Itaú Unibanco' },
  'HDB:HDFCBANK.BO':   { ratio:0.3333, adr:'HDB',    primary:'HDFCBANK.BO',  currency:'INR', exchange:'BSE',                level:'III', market:'NYSE',    sponsored:true,  depositary:'JPMorgan',      name:'HDFC Bank' },
  'IBN:ICICIBANK.NS':  { ratio:0.5,    adr:'IBN',    primary:'ICICIBANK.NS', currency:'INR', exchange:'NSE',                level:'III', market:'NYSE',    sponsored:true,  depositary:'Deutsche Bank', name:'ICICI Bank' },
  'WIT:WIPRO.NS':      { ratio:1,      adr:'WIT',    primary:'WIPRO.NS',     currency:'INR', exchange:'NSE',                level:'III', market:'NYSE',    sponsored:true,  depositary:'JPMorgan',      name:'Wipro' },
  'INFY:INFY.NS':      { ratio:1,      adr:'INFY',   primary:'INFY.NS',      currency:'INR', exchange:'NSE',                level:'III', market:'NYSE',    sponsored:true,  depositary:'Deutsche Bank', name:'Infosys' },
  'BHP:BHP.AX':        { ratio:0.5,    adr:'BHP',    primary:'BHP.AX',       currency:'AUD', exchange:'ASX',                level:'III', market:'NYSE',    sponsored:true,  depositary:'Citi',          name:'BHP Group' },
};

const tickerIndex = {};
Object.entries(knownPairs).forEach(([key, pair]) => {
  tickerIndex[pair.adr.toUpperCase()] = key;
  tickerIndex[pair.primary.toUpperCase()] = key;
});

const adrRegistry = {
  'TM':     { level:'III', market:'NYSE',    sponsored:true },
  'HMC':    { level:'II',  market:'NYSE',    sponsored:true },
  'SONY':   { level:'II',  market:'NYSE',    sponsored:true },
  'MUFG':   { level:'II',  market:'NYSE',    sponsored:true },
  'SMFG':   { level:'II',  market:'NYSE',    sponsored:true },
  'MFG':    { level:'II',  market:'NYSE',    sponsored:true },
  'NTDOY':  { level:'I',   market:'OTC',     sponsored:false },
  'GSK':    { level:'II',  market:'NYSE',    sponsored:true },
  'UL':     { level:'II',  market:'NYSE',    sponsored:true },
  'BP':     { level:'II',  market:'NYSE',    sponsored:true },
  'RIO':    { level:'II',  market:'NYSE',    sponsored:true },
  'SHEL':   { level:'III', market:'NYSE',    sponsored:true },
  'HSBC':   { level:'II',  market:'NYSE',    sponsored:true },
  'ASML':   { level:'II',  market:'NASDAQ',  sponsored:true },
  'PHG':    { level:'II',  market:'NYSE',    sponsored:true },
  'EADSY':  { level:'I',   market:'OTC',     sponsored:false },
  'SNY':    { level:'II',  market:'NASDAQ',  sponsored:true },
  'LVMUY':  { level:'I',   market:'OTC',     sponsored:false },
  'SAP':    { level:'II',  market:'NYSE',    sponsored:true },
  'SIEGY':  { level:'I',   market:'OTC',     sponsored:true },
  'BMWKY':  { level:'I',   market:'OTC',     sponsored:false },
  'NVS':    { level:'II',  market:'NYSE',    sponsored:true },
  'RHHBY':  { level:'I',   market:'OTC',     sponsored:true },
  'NSRGY':  { level:'I',   market:'OTC',     sponsored:true },
  'NVO':    { level:'III', market:'NYSE',    sponsored:true },
  'TSM':    { level:'III', market:'NYSE',    sponsored:true },
  'TCEHY':  { level:'I',   market:'OTC',     sponsored:false },
  'BABA':   { level:'III', market:'NYSE',    sponsored:true },
  'JD':     { level:'III', market:'NASDAQ',  sponsored:true },
  'VALE':   { level:'III', market:'NYSE',    sponsored:true },
  'PBR':    { level:'III', market:'NYSE',    sponsored:true },
  'PBR.A':  { level:'II',  market:'NYSE',    sponsored:true },
  'ITUB':   { level:'II',  market:'NYSE',    sponsored:true },
  'HDB':    { level:'III', market:'NYSE',    sponsored:true },
  'IBN':    { level:'III', market:'NYSE',    sponsored:true },
  'WIT':    { level:'III', market:'NYSE',    sponsored:true },
  'INFY':   { level:'III', market:'NYSE',    sponsored:true },
  'BHP':    { level:'III', market:'NYSE',    sponsored:true },
};

const levelTooltips = {
  'I':   { title: 'Level I ADR', detail: 'Trades OTC only. Minimal SEC reporting and no exchange listing.' },
  'II':  { title: 'Level II ADR', detail: 'Exchange-listed. Full SEC registration, annual Form 20-F filing.' },
  'III': { title: 'Level III ADR', detail: 'Exchange-listed. Strictest SEC requirements. Can raise capital in US markets.' },
};

const localCommissionRate = 0.10;
const commissionNoteHtml = '<a href="https://www.ibkr.com/commissions" target="_blank" rel="noopener noreferrer">IBKR</a> · <a href="https://robinhood.com/us/en/support/articles/trading-fees-on-robinhood/" target="_blank" rel="noopener noreferrer">Robinhood</a> · <a href="https://www.schwab.com/pricing" target="_blank" rel="noopener noreferrer">Schwab</a>';

function calculateLocalCommission(localQuantity) {
  return localQuantity * localCommissionRate;
}

let lastAutoLocalCommission = null;
let lastAutoAdrCommission = null;
let ibkrAdrOverridden = false;
let ibkrLocalOverridden = false;

const withholdingInfo = {
  KRW: { rate:'15% (US treaty)',   note:'Korea withholds 15% on dividends for US investors (treaty rate; domestic rate is 22%). Note: since 2024, some payers withhold at the full 22% first — an after-the-fact refund claim may be required. Claim the foreign tax credit via IRS Form 1116. Hold in a taxable account, not an IRA, to use the credit.' },
  JPY: { rate:'10% (US treaty)',   note:'Japan withholds 10% on dividends for US investors (treaty rate; domestic rate is 20.315%). Claim via IRS Form 1116.' },
  EUR: { rate:'Varies by country', note:'EU withholding varies: France 12.8%, Germany 15% (US treaty), Netherlands 15%. Check the country-specific treaty rate. Claim via IRS Form 1116.' },
  GBP: { rate:'0%',               note:'UK pays dividends gross — no withholding tax for US investors.' },
  TWD: { rate:'21%',              note:'Taiwan withholds 21% on dividends. Limited treaty benefit for US investors. Claim what is eligible via IRS Form 1116.' },
  BRL: { rate:'10%',              note:'Brazil withholds 10% on dividends for US investors. Claim via IRS Form 1116.' },
  INR: { rate:'25% (US treaty)',  note:'India withholds 25% on dividends for US investors (treaty rate). Claim via IRS Form 1116.' },
  HKD: { rate:'0%',              note:'Hong Kong pays dividends gross — no withholding tax at source for US investors.' },
  AUD: { rate:'15% (US treaty)',  note:'Australia withholds 15% on dividends for US investors (treaty rate; domestic is 30%). Claim via IRS Form 1116.' },
  CHF: { rate:'35% (refundable)', note:'Switzerland withholds 35% on dividends but the US-Switzerland treaty reduces this to 15%. Excess is refundable via Swiss tax authority. Claim net via IRS Form 1116.' },
  DKK: { rate:'15% (US treaty)',  note:'Denmark withholds 15% on dividends for US investors (treaty rate). Claim via IRS Form 1116.' },
};

// FieldManager class for managing read-only field states
class FieldManager {
  lockField(fieldId) {
    const field = document.querySelector(`#${fieldId}`);
    if (field) field.setAttribute('readonly', 'readonly');
  }

  unlockField(fieldId) {
    const field = document.querySelector(`#${fieldId}`);
    if (field) field.removeAttribute('readonly');
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

    if (!Number.isFinite(price)) throw new Error('Invalid price data');

    const currency = meta.currency || 'USD';
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

    if (!Number.isFinite(response.price)) throw new Error('Invalid price data');

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

    if (upperFrom === upperTo) {
      fieldManager.updateAndLock('localToUsdRate', '1.000000');
      fieldManager.showSuccess('fxLookupStatus', 'USD base');
      return { success: true, rate: 1, source: 'direct' };
    }

    fieldManager.clearStatus('fxLookupStatus');

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

    fieldManager.showError('fxLookupStatus', 'localToUsdRate', 'Unable to fetch FX rate. Enter manually');
    return { success: false, error: 'All APIs failed' };
  }

  async refresh(fromCurrency, toCurrency = 'USD') {
    return this.autoFetch(fromCurrency, toCurrency);
  }

  async fetchHistory(fromCurrency, toCurrency = 'USD') {
    try {
      const response = await fetchJson(`/api/fx-history?from=${encodeURIComponent(fromCurrency)}&to=${encodeURIComponent(toCurrency)}`);
      return { success: true, data: response.rates || [], error: null };
    } catch (error) {
      return { success: false, data: [], error: error.message };
    }
  }

  async fetchFromYahoo(fromCurrency, toCurrency) {
    const pair = `${fromCurrency}${toCurrency}=X`;
    const response = await fetchJson(`/api/price?symbol=${encodeURIComponent(pair)}`);
    const meta = response.chart?.result?.[0]?.meta;
    const rate = meta?.regularMarketPrice ?? meta?.previousClose ?? meta?.chartPreviousClose;

    if (!Number.isFinite(rate)) throw new Error('Invalid FX rate');

    return { success: true, rate, timestamp: meta.regularMarketTime, source: 'yahoo' };
  }

  async fetchFromFrankfurter(fromCurrency, toCurrency) {
    const response = await fetchJson(`/api/fx?from=${encodeURIComponent(fromCurrency)}&to=${encodeURIComponent(toCurrency)}`);

    if (!Number.isFinite(response.rate)) throw new Error('Invalid FX rate');

    return { success: true, rate: response.rate, date: response.date, source: 'frankfurter' };
  }
}

const fxFetcher = new FXFetcher();


async function tryAutoPopulatePair(enteredTicker, enteredSide) {
  if (!enteredTicker) return;

  const pairKey = tickerIndex[enteredTicker.toUpperCase()];
  if (!pairKey) {
    // Not a known pair — leave both sides alone so the user can fill them manually.
    // Only remove stale auto-pair artifacts that would be misleading.
    document.querySelectorAll('.auto-match-note').forEach(el => el.remove());
    document.querySelector('#adrTicker')?.closest('label')?.querySelector('.adr-badge-wrapper')?.remove();
    const ratioWarning = document.querySelector('#ratioWarning');
    if (ratioWarning) delete ratioWarning.dataset.source;
    return;
  }

  const pair = knownPairs[pairKey];
  const otherSide = enteredSide === 'adr' ? 'local' : 'adr';
  const otherTicker = enteredSide === 'adr' ? pair.primary : pair.adr;

  // Always set ratio (leave editable)
  const ratioField = document.querySelector('#ratio');
  if (ratioField) ratioField.value = pair.ratio;

  // Set ratioWarning — tag as pair-sourced so updateView doesn't overwrite with generic warning
  const ratioWarning = document.querySelector('#ratioWarning');
  if (ratioWarning) {
    ratioWarning.textContent = `ⓘ Verify ratio`;
    delete ratioWarning.dataset.tone;
    ratioWarning.dataset.source = 'pair';
  }

  // Always apply the known currency and name for this pair — more reliable than the price API response
  fieldManager.updateAndLock('localCurrency', pair.currency);
  document.querySelector('#currencyName').textContent = '';
  document.querySelector('#localName').textContent = pair.name;
  document.querySelector('#adrName').textContent = pair.name;
  renderAdrBadge(pair.adr);

  // Always populate the other side ticker + fetch its price (whether empty or mismatched)
  const otherField = document.querySelector(`#${otherSide === 'adr' ? 'adr' : 'local'}Ticker`);
  if (otherField) {
    otherField.value = otherTicker;

    // Remove stale auto-match notes from both sides, then add fresh one on the other side
    document.querySelectorAll('.auto-match-note').forEach(el => el.remove());
    const otherLabel = otherField.closest('label');
    if (otherLabel) {
      const matchNote = document.createElement('small');
      matchNote.className = 'auto-match-note';
      matchNote.textContent = `ⓘ Auto-matched from ${enteredTicker}`;
      otherLabel.appendChild(matchNote);
    }

    await priceFetcher.autoFetch(otherTicker, otherSide);
  }

  // Always fetch FX for the pair's known currency
  await fxFetcher.autoFetch(pair.currency, 'USD');
  await loadFXHistory();

  updateView();
}

function renderAdrBadge(ticker) {
  const tickerLabel = document.querySelector('#adrTicker')?.closest('label');
  if (!tickerLabel) return;

  const existing = tickerLabel.querySelector('.adr-badge-wrapper');
  if (existing) existing.remove();

  const entry = adrRegistry[ticker.toUpperCase()];
  if (!entry) return;

  // Look up depositary from knownPairs
  const pairKey = tickerIndex[ticker.toUpperCase()];
  const pair = pairKey ? knownPairs[pairKey] : null;
  const depositary = pair?.depositary || entry.depositary || '';

  const levelText = entry.level === 'I' ? 'Level I · OTC' :
                    entry.level === 'II' ? `Level II · ${entry.market}` :
                    `Level III · ${entry.market}`;
  const sponsoredText = entry.sponsored ? ' · Sponsored' : ' · Unsponsored';
  const depositaryText = depositary && depositary !== 'None' && depositary !== 'Multiple' ? ` · ${depositary}` : '';

  const wrapper = document.createElement('div');
  wrapper.className = 'adr-badge-wrapper';

  const badge = document.createElement('span');
  badge.className = 'adr-badge';
  badge.dataset.level = entry.level;
  badge.dataset.sponsored = String(entry.sponsored);
  badge.setAttribute('aria-label', 'ADR level info — hover for details');
  badge.textContent = levelText + sponsoredText + depositaryText;

  // Tooltip: structured rows per scenario
  const tooltip = document.createElement('div');
  tooltip.className = 'badge-tooltip';
  const lvl = levelTooltips[entry.level];

  const rows = [];
  // Row 1: Level title + detail
  rows.push(`<div class="tt-row tt-title">${lvl.title}</div>`);
  rows.push(`<div class="tt-row tt-detail">${lvl.detail}</div>`);
  // Row 2: Sponsorship
  if (entry.sponsored) {
    rows.push(`<div class="tt-meta"><span class="tt-label">Sponsored</span> Issuer-backed, formal SEC registration.</div>`);
  } else {
    rows.push(`<div class="tt-meta tt-warn"><span class="tt-label">Unsponsored</span> No issuer involvement — higher termination risk.</div>`);
  }
  // Row 3: Depositary (if known)
  if (depositary && depositary !== 'None' && depositary !== 'Multiple') {
    rows.push(`<div class="tt-meta"><span class="tt-label">Depositary</span> ${depositary}</div>`);
  }
  tooltip.innerHTML = rows.join('');

  wrapper.appendChild(badge);
  wrapper.appendChild(tooltip);

  if (entry.warning) {
    const warn = document.createElement('span');
    warn.className = 'badge-warning';
    warn.textContent = entry.warning;
    wrapper.appendChild(warn);
  }

  // Insert inside the label span so it stays in the same grid row
  const labelSpan = tickerLabel.querySelector('span');
  if (labelSpan) {
    labelSpan.appendChild(wrapper);
  } else {
    tickerLabel.prepend(wrapper);
  }
}

const form = document.querySelector("#calculatorForm");
const fields = Array.from(form.elements).filter((field) => field.name);
const storageKey = "adr-local-comparator-inputs-v8";
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

const currencySubunits = {
  'GBp': { mainCurrency: 'GBP', divisor: 100 },
  'GBX': { mainCurrency: 'GBP', divisor: 100 },
  'ZAc': { mainCurrency: 'ZAR', divisor: 100 },
  'ILA': { mainCurrency: 'ILS', divisor: 100 }
};

function normalizeCurrencyAndPrice(currency, price) {
  const subunit = currencySubunits[currency];
  if (subunit) {
    return { currency: subunit.mainCurrency, price: price / subunit.divisor, wasConverted: true, originalCurrency: currency };
  }
  return { currency: currency.toUpperCase(), price: price, wasConverted: false };
}

const moneyUsd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2
});

const numberFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 });
const plainUsd = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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


function getCurrencyName(code) {
  return currencyNames[(code || "").trim().toUpperCase()] || "Unknown currency";
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
  // ratio = ADR shares per 1 primary share
  const adrQuantity = localQuantity * ratio;
  const localToUsdRate = Math.max(values.localToUsdRate, 0);

  const adrGrossUsd = adrQuantity * Math.max(values.adrPrice, 0);
  const adrCommissionUsd = Math.max(values.adrCommission, 0);
  const adrPassThroughFeeUsd = adrQuantity * Math.max(values.adrPassThroughFee, 0);
  const adrTotalUsd = adrGrossUsd + adrCommissionUsd + adrPassThroughFeeUsd;

  const localGross = localQuantity * Math.max(values.localPrice, 0);
  const localCommission = Math.max(values.localCommission, 0);
  const localTotal = localGross + localCommission;
  const localTotalUsd = localTotal * localToUsdRate;
  const localCommissionUsd = localCommission * localToUsdRate;

  const impliedAdrMid = ratio > 0
    ? (Math.max(values.localPrice, 0) * localToUsdRate) / ratio
    : 0;
  const premium = impliedAdrMid > 0 ? Math.max(values.adrPrice, 0) / impliedAdrMid - 1 : 0;
  const difference = adrTotalUsd - localTotalUsd;
  const breakEvenFx = localTotal > 0 ? adrTotalUsd / localTotal : 0;

  return {
    adrQuantity,
    adrGrossUsd,
    adrCommissionUsd,
    adrPassThroughFeeUsd,
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

  // Apply commission auto-fill to values before calculating
  if (!ibkrLocalOverridden) {
    const autoLocalComm = calculateLocalCommission(values.localQuantity);
    const currentLocalComm = parseFloat(document.querySelector('#localCommission').value) || 0;
    if (currentLocalComm === 0 || currentLocalComm === lastAutoLocalCommission) {
      values.localCommission = autoLocalComm;
      document.querySelector('#localCommission').value = autoLocalComm.toFixed(2);
      lastAutoLocalCommission = autoLocalComm;
    }
  }
  if (!ibkrAdrOverridden) {
    values.adrCommission = 0;
    document.querySelector('#adrCommission').value = '0';
  }

  const result = calculate(values);
  const currency = (values.localCurrency || "local").toUpperCase();
  const primaryWins = result.localTotalUsd < result.adrTotalUsd;
  const tie = Math.abs(result.difference) < 0.005;
  const winner = tie ? "Tie" : primaryWins ? "Primary Listing" : "ADR";
  const cheaperBy = Math.abs(result.difference);
  const maxCost = Math.max(result.adrTotalUsd, result.localTotalUsd, 1);
  const fxDistance = values.localToUsdRate > 0 ? (result.breakEvenFx / values.localToUsdRate) - 1 : 0;

  document.querySelector("#winner").textContent = winner;

  // TASK 7 — summaryLine format
  if (tie) {
    document.querySelector("#summaryLine").textContent = "Both routes are effectively equal on these inputs.";
  } else {
    const loser = primaryWins ? "ADR" : "Primary Listing";
    const savingPct = (cheaperBy / Math.max(result.adrTotalUsd, result.localTotalUsd) * 100).toFixed(2);
    document.querySelector("#summaryLine").textContent = `Cheaper than ${loser} by ${moneyUsd.format(cheaperBy)} (${savingPct}%)`;
  }

  document.querySelector("#localPriceLabel").textContent = `Price (${currency} - ${getCurrencyName(currency)})`;
  document.querySelector("#localCommissionLabel").innerHTML = `Commission (${currency})<a class="comm-link" href="https://www.ibkr.com/commissions" target="_blank" rel="noopener noreferrer">IBKR&#8599;</a>`;
  document.querySelector("#fxRateLabel").textContent = `FX Rate (1 ${currency} = USD)`;
  document.querySelector("#currencyName").textContent = '';
  document.querySelector("#adrQuantityOut").textContent = numberFmt.format(result.adrQuantity);

  document.querySelector("#adrChartValue").textContent = moneyUsd.format(result.adrTotalUsd);
  document.querySelector("#localChartValue").textContent = moneyUsd.format(result.localTotalUsd);

  const adrBar = document.querySelector("#adrCostBar");
  const localBar = document.querySelector("#localCostBar");

  if (result.adrTotalUsd < result.localTotalUsd) {
    adrBar.className = 'bar-fill primary-fill';
    localBar.className = 'bar-fill adr-fill';
  } else {
    adrBar.className = 'bar-fill adr-fill';
    localBar.className = 'bar-fill primary-fill';
  }

  adrBar.style.width = `${Math.max((result.adrTotalUsd / maxCost) * 100, 2)}%`;
  localBar.style.width = `${Math.max((result.localTotalUsd / maxCost) * 100, 2)}%`;

  // ratioWarning: only set large-premium warning if not set by tryAutoPopulatePair (pair-sourced)
  const ratioWarning = document.querySelector("#ratioWarning");
  const absPremium = Math.abs(result.premium);
  if (ratioWarning && ratioWarning.dataset.source !== 'pair') {
    if (absPremium > 0.10) {
      ratioWarning.textContent = "⚠️ Large premium/discount detected. Please verify ratio is correct.";
      ratioWarning.dataset.tone = 'warning';
    } else if (ratioWarning.dataset.tone === 'warning') {
      ratioWarning.textContent = '';
      delete ratioWarning.dataset.tone;
    }
  }
  document.querySelector("#breakEvenFx").textContent = `${currency} / USD = ${fxFmt.format(result.breakEvenFx)}`;
  document.querySelector("#breakEvenLabel").textContent = primaryWins
    ? `Break-even FX for ADR to be cheaper`
    : `Break-even FX for Primary to be cheaper`;

  // Cost breakdown card
  const bdLocalQty = document.querySelector('#bdLocalQty');
  if (bdLocalQty) {
    const localCcy = currency;
    const localNumFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 });
    document.querySelector('#bdLocalQty').textContent = numberFmt.format(result.localQuantity);
    document.querySelector('#bdLocalGross').textContent = `${localNumFmt.format(result.localGross)} ${localCcy}`;
    document.querySelector('#bdLocalComm').textContent = `${localNumFmt.format(result.localCommission)} ${localCcy}`;
    document.querySelector('#bdLocalFxLabel').textContent = `1 ${localCcy} = USD`;
    document.querySelector('#bdLocalFxRate').textContent = values.localToUsdRate ? Number(values.localToUsdRate).toFixed(6) : '—';
    document.querySelector('#bdLocalTotal').textContent = moneyUsd.format(result.localTotalUsd);
    document.querySelector('#bdAdrQty').textContent = numberFmt.format(result.adrQuantity);
    document.querySelector('#bdAdrGross').textContent = `${plainUsd.format(result.adrGrossUsd)} USD`;
    document.querySelector('#bdAdrComm').textContent = `${plainUsd.format(result.adrCommissionUsd)} USD`;
    document.querySelector('#bdAdrFee').textContent = `${plainUsd.format(result.adrPassThroughFeeUsd)} USD/yr`;
    document.querySelector('#bdAdrTotal').textContent = moneyUsd.format(result.adrTotalUsd);
  }

  const absFxDistance = Math.abs(fxDistance);
  // fxDistance > 0: BEV > current rate → primary currently cheaper → EUR must strengthen (rise) to cross BEV for ADR to compete
  // fxDistance < 0: BEV < current rate → ADR currently cheaper → EUR must weaken (fall) to cross BEV for primary to compete
  const direction = fxDistance > 0 ? "strengthen" : "weaken";
  const distancePct = `${(absFxDistance * 100).toFixed(2)}%`;
  document.querySelector("#fxInsight").textContent =
    `${currency} needs to ${direction} against USD by at least ${distancePct}`;


  // TASK 12 — Withholding tax callout
  const info = withholdingInfo[currency];
  const withholdingEl = document.querySelector('#withholdingCallout');
  if (withholdingEl) {
    if (info) {
      document.querySelector('#withholdingNote').textContent = `${currency}: ${info.rate} — ${info.note}`;
      withholdingEl.style.display = 'block';
    } else {
      withholdingEl.style.display = 'none';
    }
  }

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

    const exchangeInfo = quote.venue ? ` • ${quote.venue}` : '';
    button.innerHTML = `<strong>${quote.symbol}</strong><span>${quote.name}${exchangeInfo}</span>`;

    button.addEventListener("click", async () => {
      document.querySelector(`#${side}Ticker`).value = quote.symbol;

      const nameEl = document.querySelector(`#${side}Name`);
      nameEl.textContent = `${quote.name}${exchangeInfo}`;

      if (side === 'adr') {
        await priceFetcher.autoFetch(quote.symbol, 'adr');
        renderAdrBadge(quote.symbol);
      } else {
        const result = await priceFetcher.autoFetch(quote.symbol, 'local');
        if (result.success && result.currency) {
          fieldManager.updateAndLock('localCurrency', result.currency);
          document.querySelector("#currencyName").textContent = '';
          await fxFetcher.autoFetch(result.currency, 'USD');
          await loadFXHistory();
        }
      }

      await tryAutoPopulatePair(quote.symbol, side);

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

    const usExchanges = ['NYSE', 'NASDAQ', 'AMEX', 'NYQ', 'NMS', 'NGM', 'NCM', 'PNK', 'OTC', 'OTCBB', 'OTCMKTS'];
    if (side === 'adr') {
      quotes = quotes.filter(q => usExchanges.includes(q.venue.toUpperCase()));
    } else {
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

document.querySelector('#localCommission').addEventListener('focus', () => {
  ibkrLocalOverridden = true;
});
document.querySelector('#localCommission').addEventListener('input', () => {
  const val = document.querySelector('#localCommission').value;
  if (val === '') {
    ibkrLocalOverridden = false;
    lastAutoLocalCommission = null;
  }
});
document.querySelector('#adrCommission').addEventListener('focus', () => {
  ibkrAdrOverridden = true;
});
document.querySelector('#adrCommission').addEventListener('input', () => {
  const val = document.querySelector('#adrCommission').value;
  if (val === '') {
    ibkrAdrOverridden = false;
    lastAutoAdrCommission = null;
  }
});

form.addEventListener("input", (event) => {
  if (event.target.id === "adrTicker") queueTickerSearch("adr");
  if (event.target.id === "localTicker") queueTickerSearch("local");
  updateView();

  if (['localQuantity', 'ratio', 'adrPrice', 'localPrice', 'adrCommission', 'localCommission', 'localToUsdRate'].includes(event.target.id)) {
    const currency = document.querySelector("#localCurrency").value.trim();
    if (currency && currency !== 'USD') loadFXHistory();
  }
});

form.addEventListener("change", async (event) => {
  if (event.target.id === "adrTicker") {
    updateTickerMetadata("adr");
    const ticker = event.target.value.trim();
    if (ticker.length > 2) {
      renderAdrBadge(ticker);
      await tryAutoPopulatePair(ticker, 'adr');
    }
  }
  if (event.target.id === "localTicker") {
    updateTickerMetadata("local");
    const ticker = event.target.value.trim();
    if (ticker.length > 2) await tryAutoPopulatePair(ticker, 'local');
  }
  if (event.target.id === "localCurrency") {
    const currency = event.target.value.trim();
    if (currency) {
      await fxFetcher.autoFetch(currency, 'USD');
      await loadFXHistory();
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

document.querySelector("#refreshButton").addEventListener("click", async () => {
  const adrTicker = document.querySelector("#adrTicker").value.trim();
  const localTicker = document.querySelector("#localTicker").value.trim();
  const currency = document.querySelector("#localCurrency").value.trim();

  if (!adrTicker || !localTicker) {
    const flashError = (id) => {
      const el = document.querySelector(`#${id}`);
      el.classList.add('input-error');
      setTimeout(() => el.classList.remove('input-error'), 1500);
    };
    flashError('adrTicker');
    flashError('localTicker');
    return;
  }

  const button = document.querySelector("#refreshButton");
  button.disabled = true;
  button.textContent = "Updating...";

  try {
    await Promise.all([
      priceFetcher.refresh(adrTicker, 'adr'),
      priceFetcher.refresh(localTicker, 'local'),
      currency ? fxFetcher.refresh(currency, 'USD') : Promise.resolve()
    ]);
    updateView();
  } finally {
    button.disabled = false;
    button.innerHTML = '<span class="icon">↻</span> Update Prices';
  }
});

// ADR Ratio search helper
document.querySelector("#ratioSearchButton").addEventListener("click", () => {
  const adrTicker = document.querySelector("#adrTicker").value.trim();
  const localTicker = document.querySelector("#localTicker").value.trim();

  if (!adrTicker || !localTicker) {
    const flashError = (id) => {
      const el = document.querySelector(`#${id}`);
      el.classList.add('input-error');
      setTimeout(() => el.classList.remove('input-error'), 1500);
    };
    flashError('adrTicker');
    flashError('localTicker');
    return;
  }

  const query = `how many shares of ${adrTicker} ADR per a share of ${localTicker} primary listing`;
  window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
});

// FX Projections search helper
document.querySelector("#fxProjectionsButton").addEventListener("click", () => {
  const currency = document.querySelector("#localCurrency").value.trim();

  if (!currency) {
    const el = document.querySelector('#localCurrency');
    el.classList.add('input-error');
    setTimeout(() => el.classList.remove('input-error'), 1500);
    return;
  }

  const query = `${currency} to dollar forecast for next 6-12 months`;
  window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
});

const REACTION_SLUG = 'stock-lens';
const REACTION_KEY = `reaction:${REACTION_SLUG}`;

(function initReactions() {
  const stored = localStorage.getItem(REACTION_KEY);
  if (stored === 'like' || stored === 'dislike') {
    document.getElementById('reactionBtns').style.display = 'none';
    document.getElementById('reactionThanks').classList.add('visible');
    return;
  }

  function vote(type) {
    localStorage.setItem(REACTION_KEY, type);
    document.getElementById('reactionBtns').style.display = 'none';
    document.getElementById('reactionThanks').classList.add('visible');
    fetch('/api/react', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: REACTION_SLUG, type }),
    }).catch(() => {});
  }

  document.getElementById('likeBtn').addEventListener('click', () => vote('like'));
  document.getElementById('dislikeBtn').addEventListener('click', () => vote('dislike'));
})();

document.querySelector("#shareButton").addEventListener("click", async () => {
  const fullUrl = window.location.origin + encodeStateToUrl();
  const adr = document.querySelector('#adrTicker').value.trim();
  const primary = document.querySelector('#localTicker').value.trim();
  const title = adr && primary ? `Stock Lens — ${adr} vs ${primary}` : 'Stock Lens';
  const btn = document.querySelector("#shareButton");

  if (navigator.share) {
    try {
      await navigator.share({ title, text: 'Compare ADR vs primary listing cost', url: fullUrl });
    } catch (e) {
      if (e.name !== 'AbortError') {
        navigator.clipboard.writeText(fullUrl);
      }
    }
  } else {
    navigator.clipboard.writeText(fullUrl).then(() => {
      btn.innerHTML = '<span class="icon">✓</span> Copied!';
      setTimeout(() => { btn.innerHTML = '<span class="icon">⎘</span> Share'; }, 1500);
    });
  }
});

function encodeStateToUrl() {
  const params = new URLSearchParams({
    adr: document.querySelector('#adrTicker').value.trim(),
    primary: document.querySelector('#localTicker').value.trim(),
    ratio: document.querySelector('#ratio').value,
    qty: document.querySelector('#localQuantity').value,
    adrFee: document.querySelector('#adrPassThroughFee').value,
    adrComm: document.querySelector('#adrCommission').value,
    localComm: document.querySelector('#localCommission').value,
  });
  return window.location.pathname + '?' + params.toString();
}

function renderSparkline(data, breakEvenRate, currency) {
  const canvas = document.querySelector("#fxSparkline");
  if (!canvas || !data || data.length === 0) return;

  const container = canvas.parentElement;
  canvas.width = container.clientWidth || 280;
  canvas.height = 120;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const padding = 8;

  ctx.clearRect(0, 0, width, height);

  const rates = data.map(d => d.rate);
  const currentRate = rates[rates.length - 1];

  const allValues = breakEvenRate && Number.isFinite(breakEvenRate) ? [...rates, breakEvenRate] : rates;
  const minRate = Math.min(...allValues);
  const maxRate = Math.max(...allValues);
  const range = maxRate - minRate || 1;

  const rateToY = (rate) => height - padding - ((rate - minRate) / range) * (height - 2 * padding);

  if (breakEvenRate && Number.isFinite(breakEvenRate)) {
    const breakEvenY = rateToY(breakEvenRate);

    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    const bevText = 'BEV';
    const bevLeftMargin = 2;
    const gapEnd = bevLeftMargin + ctx.measureText(bevText).width + 4;

    ctx.beginPath();
    ctx.strokeStyle = '#a09880';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.moveTo(gapEnd, breakEvenY);
    ctx.lineTo(width - padding, breakEvenY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#a09880';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(bevText, bevLeftMargin, breakEvenY);

    const topLabel = document.querySelector('.sparkline-label-top');
    const bottomLabel = document.querySelector('.sparkline-label-bottom');

    if (topLabel && bottomLabel) {
      // Top = high FX rates = above BEV = ADR cheaper. Always fixed.
      topLabel.textContent = 'Buy ADR';
      bottomLabel.textContent = 'Buy Primary';

      const zoneNote = document.querySelector('.sparkline-zone-note');
      if (zoneNote) {
        zoneNote.textContent = `When ${currency}/USD is above the BEV line, ADR is cheaper. Below it, Primary is cheaper.`;
      }
    }
  }

  ctx.beginPath();
  ctx.strokeStyle = '#C9A840';
  ctx.lineWidth = 2;

  data.forEach((d, i) => {
    const x = (i / (data.length - 1)) * (width - 2 * padding) + padding;
    const y = rateToY(d.rate);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();

  const lastX = width - padding;
  const lastY = rateToY(currentRate);
  ctx.beginPath();
  ctx.fillStyle = '#C9A840';
  ctx.arc(lastX, lastY, 3, 0, 2 * Math.PI);
  ctx.fill();

  const labelEl = document.querySelector('.sparkline-label');
  if (labelEl && currency) {
    labelEl.textContent = `6-month FX rate history for ${currency} / USD`;
  }
}

async function loadFXHistory() {
  const currency = document.querySelector("#localCurrency").value.trim();
  if (!currency || currency === 'USD') return;

  const result = await fxFetcher.fetchHistory(currency, 'USD');
  if (result.success && result.data.length > 0) {
    const values = readInputs();
    const calc = calculate(values);
    renderSparkline(result.data, calc.breakEvenFx, currency);
  }
}

let resizeDebounceTimer = null;
let lastWindowWidth = window.innerWidth;
window.addEventListener('resize', () => {
  const currentWidth = window.innerWidth;
  if (Math.abs(currentWidth - lastWindowWidth) > 20) {
    clearTimeout(resizeDebounceTimer);
    resizeDebounceTimer = setTimeout(() => {
      lastWindowWidth = currentWidth;
      loadFXHistory();
    }, 200);
  }
});

// Initialise — strip saved commission values so auto-fill always runs on load
const savedInputs = getSavedInputs();
delete savedInputs.adrCommission;
delete savedInputs.localCommission;
writeInputs({ ...defaults, ...savedInputs });
document.querySelector("#adrQuantityOut").classList.add("computed-output");
populateCurrencies();
// Trigger auto-populate and price fetch for default/saved tickers on load (skip if URL params present)
const _hasUrlParams = new URLSearchParams(window.location.search).has('adr');
if (!_hasUrlParams) {
  (async () => {
    const adr = document.querySelector('#adrTicker').value.trim();
    const primary = document.querySelector('#localTicker').value.trim();
    if (adr && primary) {
      await Promise.all([
        priceFetcher.autoFetch(adr, 'adr'),
        priceFetcher.autoFetch(primary, 'local'),
      ]);
      await tryAutoPopulatePair(adr, 'adr');
      renderAdrBadge(adr);
      const currency = document.querySelector('#localCurrency').value.trim();
      if (currency && currency !== 'USD') await loadFXHistory();
      updateView();
    }
  })();
}

(async () => {
  const params = new URLSearchParams(window.location.search);
  if (params.has('adr') && params.has('primary')) {
    document.querySelector('#adrTicker').value = params.get('adr');
    document.querySelector('#localTicker').value = params.get('primary');
    if (params.has('ratio')) document.querySelector('#ratio').value = params.get('ratio');
    if (params.has('qty')) document.querySelector('#localQuantity').value = params.get('qty');
    if (params.has('adrFee')) document.querySelector('#adrPassThroughFee').value = params.get('adrFee');
    if (params.has('adrComm')) {
      document.querySelector('#adrCommission').value = params.get('adrComm');
      ibkrAdrOverridden = true;
    }
    if (params.has('localComm')) {
      document.querySelector('#localCommission').value = params.get('localComm');
      ibkrLocalOverridden = true;
    }
    await Promise.all([
      priceFetcher.autoFetch(params.get('adr'), 'adr'),
      priceFetcher.autoFetch(params.get('primary'), 'local'),
    ]);
    // tryAutoPopulatePair sets the correct currency/name from knownPairs (more reliable than API response)
    await tryAutoPopulatePair(params.get('adr'), 'adr');
    renderAdrBadge(params.get('adr'));
    const currency = document.querySelector('#localCurrency').value.trim();
    if (currency) {
      await fxFetcher.autoFetch(currency, 'USD');
      await loadFXHistory();
    }
    updateView();
  } else {
    updateView();
  }
})();

