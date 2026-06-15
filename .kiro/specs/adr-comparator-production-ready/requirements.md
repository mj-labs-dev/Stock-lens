# Requirements Document

## Introduction

This document specifies requirements for enhancing the ADR vs Primary Listing cost comparison tool to production-ready status. The tool helps US investors compare the all-in cost of buying American Depositary Receipts (ADRs) versus buying equivalent exposure through primary listings on foreign exchanges. The enhancements focus on automation, reliability, error handling, and improved user experience.

## Glossary

- **ADR_Comparator**: The web application that compares ADR and primary listing costs
- **Ticker_Search**: The autocomplete search functionality for stock tickers
- **Price_Fetcher**: The component that retrieves stock prices from APIs
- **FX_Fetcher**: The component that retrieves foreign exchange rates from APIs
- **Yahoo_Finance_API**: Primary API for stock prices and FX rates (unofficial)
- **Twelve_Data_API**: Backup API for stock prices and FX rates (800 free calls/day)
- **Frankfurter_API**: Backup API for FX rates (ECB data, no key required)
- **Analysis_Panel**: The section displaying cost comparison charts and insights
- **Manual_Entry_Mode**: State where price/currency fields become editable after API failures
- **ADR_Ratio**: The conversion ratio between ADR units and primary listing shares
- **FX_Rate**: Foreign exchange rate converting primary listing currency to USD
- **Cost_Comparison_Chart**: Visual bar chart showing total costs for ADR vs primary listing
- **FX_Sensitivity_Chart**: Sparkline chart showing 6-month historical FX trend
- **US_Exchange**: Stock exchanges in the United States (NYSE, NASDAQ, AMEX)
- **Foreign_Exchange**: Stock exchanges outside the United States (TSE, LSE, HKEX, etc.)

## Requirements

### Requirement 1: Auto-Fetch on Ticker Selection

**User Story:** As a user, I want prices and currencies to be fetched automatically when I select a ticker from the dropdown, so that I don't need to click manual "Pull" buttons.

#### Acceptance Criteria

1. WHEN a user selects an ADR ticker from THE Ticker_Search dropdown, THE Price_Fetcher SHALL automatically fetch the ADR price without requiring button interaction
2. WHEN a user selects a primary listing ticker from THE Ticker_Search dropdown, THE Price_Fetcher SHALL automatically fetch the primary listing price and currency without requiring button interaction
3. WHEN a primary listing ticker is selected, THE FX_Fetcher SHALL automatically fetch the FX rate after retrieving the currency
4. THE ADR_Comparator SHALL display the timestamp of the last successful data fetch for each ticker
5. THE ADR_Comparator SHALL remove the manual "Pull" buttons for ADR ticker and primary listing ticker
6. THE ADR_Comparator SHALL preserve the timestamp display showing when data was last fetched

### Requirement 2: API Reliability with Backup Sources

**User Story:** As a user, I want the application to use backup APIs when the primary API fails, so that I can reliably get price data.

#### Acceptance Criteria

1. WHEN THE Yahoo_Finance_API fails to return a stock price, THE Price_Fetcher SHALL attempt to fetch the price from THE Twelve_Data_API
2. WHEN both THE Yahoo_Finance_API and THE Twelve_Data_API fail to return a stock price, THE Price_Fetcher SHALL trigger Manual_Entry_Mode for that price field
3. THE Price_Fetcher SHALL use THE Yahoo_Finance_API as the primary source for stock prices
4. THE Price_Fetcher SHALL use THE Twelve_Data_API as the secondary source for stock prices
5. THE FX_Fetcher SHALL maintain THE Frankfurter_API as the existing fallback for FX rates
6. THE ADR_Comparator SHALL require a Twelve Data API key for THE Twelve_Data_API integration
7. THE ADR_Comparator SHALL respect the 800 calls per day limit for THE Twelve_Data_API free tier

### Requirement 3: Error Handling and Manual Override

**User Story:** As a user, I want to manually enter prices when APIs fail, so that I can still use the tool when data sources are unavailable.

#### Acceptance Criteria

1. WHEN all APIs fail to fetch a price, THE ADR_Comparator SHALL display an inline error message "Unable to fetch price. Enter manually"
2. WHEN all APIs fail to fetch a price, THE ADR_Comparator SHALL display the error message where the timestamp normally appears
3. WHEN all APIs fail to fetch a price, THE ADR_Comparator SHALL unlock the corresponding price field for manual entry
4. WHEN all APIs fail to fetch a currency, THE ADR_Comparator SHALL unlock the currency field for manual entry
5. WHILE APIs are functioning successfully, THE ADR_Comparator SHALL keep price and currency fields read-only
6. THE ADR_Comparator SHALL preserve the update timestamp display when data is successfully fetched

### Requirement 4: Read-Only Price and Currency Fields

**User Story:** As a user, I want price and currency fields to be read-only by default, so that I don't accidentally edit API-fetched values.

#### Acceptance Criteria

1. THE ADR_Comparator SHALL set the ADR price field to read-only by default
2. THE ADR_Comparator SHALL set the primary listing price field to read-only by default
3. THE ADR_Comparator SHALL set the primary listing currency field to read-only by default
4. WHEN API fetch fails for a specific field, THE ADR_Comparator SHALL change that field from read-only to editable
5. WHEN a successful API fetch occurs after a failure, THE ADR_Comparator SHALL change the field back to read-only
6. THE ADR_Comparator SHALL preserve the timestamp display for all successfully fetched values

### Requirement 5: Refresh and Reset Controls

**User Story:** As a user, I want refresh and reset buttons, so that I can easily update all data or clear all inputs.

#### Acceptance Criteria

1. THE ADR_Comparator SHALL provide a "Refresh" button that fetches latest values for all tickers based on current inputs
2. WHEN the "Refresh" button is clicked, THE Price_Fetcher SHALL fetch the latest ADR price
3. WHEN the "Refresh" button is clicked, THE Price_Fetcher SHALL fetch the latest primary listing price
4. WHEN the "Refresh" button is clicked, THE FX_Fetcher SHALL fetch the latest FX rate
5. THE ADR_Comparator SHALL provide a "Reset" button that clears all inputs to empty state
6. WHEN the "Reset" button is clicked, THE ADR_Comparator SHALL clear all ticker fields, price fields, quantity fields, commission fields, and ratio fields to empty values
7. THE ADR_Comparator SHALL place the "Refresh" and "Reset" buttons in the header area or utility bar

### Requirement 6: FX Rate Auto-Population

**User Story:** As a user, I want FX rates to be fetched automatically when the currency changes, so that I don't need to manually trigger FX lookups.

#### Acceptance Criteria

1. THE ADR_Comparator SHALL remove the manual "Pull" button for FX rate
2. WHEN the primary listing currency changes, THE FX_Fetcher SHALL automatically fetch the FX rate
3. WHEN THE FX_Fetcher fails to fetch an FX rate, THE ADR_Comparator SHALL unlock the FX rate field for manual entry
4. WHEN THE FX_Fetcher fails to fetch an FX rate, THE ADR_Comparator SHALL display an error message where the timestamp normally appears
5. WHILE THE FX_Fetcher successfully fetches FX rates, THE ADR_Comparator SHALL keep the FX rate field read-only

### Requirement 7: ADR Ratio Discovery Helper

**User Story:** As a user, I want a quick way to search for ADR ratios online, so that I can find the correct ratio without leaving the application context.

#### Acceptance Criteria

1. THE ADR_Comparator SHALL display a Google search icon next to the ADR Ratio field
2. WHEN the Google search icon is clicked, THE ADR_Comparator SHALL open a new browser tab with a Google search
3. THE ADR_Comparator SHALL pre-populate the Google search query with "ADR ratio [ADR ticker] [primary ticker]" using the current ticker values
4. THE ADR_Comparator SHALL maintain manual entry capability for the ADR Ratio field
5. THE ADR_Comparator SHALL persist the ADR Ratio value in localStorage
6. THE ADR_Comparator SHALL not build or maintain a lookup table for ADR ratios

### Requirement 8: Analysis Section Reorganization

**User Story:** As a user, I want a streamlined analysis section with relevant insights, so that I can focus on the most important cost comparison factors.

#### Acceptance Criteria

1. THE ADR_Comparator SHALL remove the "Commission Impact" card from THE Analysis_Panel
2. THE ADR_Comparator SHALL remove the "Primary Equivalent / ADR" card from THE Analysis_Panel
3. THE ADR_Comparator SHALL display THE Cost_Comparison_Chart spanning 2 rows showing winner, bar chart, and total costs
4. THE ADR_Comparator SHALL display an "ADR Premium/Discount" card showing percentage versus primary equivalent
5. THE ADR_Comparator SHALL display an "FX Sensitivity & Historical Trend" card showing break-even FX rate
6. THE ADR_Comparator SHALL display a mini sparkline chart showing 6-month FX historical trend using THE Frankfurter_API
7. THE ADR_Comparator SHALL provide an "FX Projections" button that opens a Google search with pre-populated query for FX forecasts
8. WHEN any input value changes, THE ADR_Comparator SHALL update all analysis cards in real-time

### Requirement 9: Ticker Filtering by Exchange

**User Story:** As a user, I want ticker search results filtered by exchange type, so that I see only relevant tickers for each field.

#### Acceptance Criteria

1. WHEN searching in the ADR ticker field, THE Ticker_Search SHALL filter results to show only tickers from US_Exchange venues
2. WHEN searching in the primary listing ticker field, THE Ticker_Search SHALL filter results to exclude tickers from US_Exchange venues
3. THE Ticker_Search SHALL display a flag icon in the dropdown for each ticker result
4. THE Ticker_Search SHALL display an exchange badge in the dropdown for each ticker result
5. THE Ticker_Search SHALL display the exchange name alongside the company name in the dropdown
6. THE Ticker_Search SHALL accept approximate filtering where some edge cases may not be perfectly categorized

### Requirement 10: Target Audience Disclaimer

**User Story:** As a US investor, I want to see a clear disclaimer about the tool's target audience, so that I understand the tool is designed for my market.

#### Acceptance Criteria

1. THE ADR_Comparator SHALL display a disclaimer at the bottom of the page stating "For investors in US stock markets only"
2. THE ADR_Comparator SHALL clarify that the application is primarily designed for US consumers
3. THE ADR_Comparator SHALL maintain the disclaimer visibility across all viewport sizes

### Requirement 11: FX Historical Trend Visualization

**User Story:** As a user, I want to see historical FX trends, so that I can understand recent currency movements when evaluating cost comparisons.

#### Acceptance Criteria

1. THE FX_Sensitivity_Chart SHALL display a 6-month historical FX trend as a sparkline chart
2. THE FX_Sensitivity_Chart SHALL fetch historical FX data from THE Frankfurter_API
3. THE FX_Sensitivity_Chart SHALL update when the primary listing currency changes
4. WHEN THE Frankfurter_API fails to return historical data, THE FX_Sensitivity_Chart SHALL display a fallback message
5. THE FX_Sensitivity_Chart SHALL render the sparkline within the "FX Sensitivity & Historical Trend" card

### Requirement 12: FX Projection Search Helper

**User Story:** As a user, I want a quick way to search for FX forecasts online, so that I can research future currency movements.

#### Acceptance Criteria

1. THE ADR_Comparator SHALL display an "FX Projections" button within the "FX Sensitivity & Historical Trend" card
2. WHEN the "FX Projections" button is clicked, THE ADR_Comparator SHALL open a new browser tab with a Google search
3. THE ADR_Comparator SHALL pre-populate the Google search query with "[primary currency] to USD forecast" using the current currency value
4. THE ADR_Comparator SHALL maintain the button visibility when the primary listing currency is set

### Requirement 13: Responsive Design Preservation

**User Story:** As a user on mobile or tablet devices, I want the enhanced application to remain fully functional and visually appropriate, so that I can use the tool on any device.

#### Acceptance Criteria

1. THE ADR_Comparator SHALL maintain responsive layout behavior for viewport widths below 760px
2. THE ADR_Comparator SHALL maintain responsive layout behavior for viewport widths below 640px
3. THE ADR_Comparator SHALL ensure all new buttons and controls are accessible on mobile devices
4. THE ADR_Comparator SHALL ensure THE FX_Sensitivity_Chart renders appropriately on small screens
5. THE ADR_Comparator SHALL ensure dropdown filters and search helpers function correctly on touch devices

### Requirement 14: Twelve Data API Integration

**User Story:** As a developer, I want to integrate the Twelve Data API as a backup price source, so that the application has improved reliability.

#### Acceptance Criteria

1. THE ADR_Comparator SHALL accept a Twelve Data API key through environment configuration
2. THE Price_Fetcher SHALL construct valid Twelve Data API requests for stock prices
3. THE Price_Fetcher SHALL parse Twelve Data API responses to extract stock prices
4. THE Price_Fetcher SHALL handle Twelve Data API rate limiting gracefully
5. WHEN THE Twelve_Data_API returns an error, THE Price_Fetcher SHALL trigger Manual_Entry_Mode
6. THE ADR_Comparator SHALL log API usage to help monitor the 800 calls per day limit

### Requirement 15: LocalStorage Persistence

**User Story:** As a user, I want my inputs to be saved automatically, so that I can return to my previous comparison when I reload the page.

#### Acceptance Criteria

1. THE ADR_Comparator SHALL persist all user inputs to localStorage after each change
2. THE ADR_Comparator SHALL restore saved inputs from localStorage when the page loads
3. THE ADR_Comparator SHALL persist ADR ticker, primary listing ticker, quantities, commissions, and ADR ratio
4. WHEN the "Reset" button is clicked, THE ADR_Comparator SHALL clear the localStorage values
5. THE ADR_Comparator SHALL not persist API-fetched prices or FX rates in localStorage
