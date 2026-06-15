# Implementation Plan: ADR Comparator Production-Ready Enhancements

## Overview

This implementation plan transforms the ADR vs Primary Listing cost comparison tool into a production-ready application. The enhancements focus on automation (auto-fetch on ticker selection), reliability (API fallback chains), improved error handling (manual override mode), and enhanced user experience (read-only fields, refresh/reset controls, analysis reorganization).

The implementation follows a phased approach: first establishing core infrastructure (API integration, field management), then implementing auto-fetch behavior, followed by UI enhancements, and finally analysis section improvements.

## Tasks

- [x] 1. Set up Twelve Data API integration and rate limiting
  - [x] 1.1 Add Twelve Data API configuration and environment variable support
    - Add `TWELVE_DATA_API_KEY` environment variable support to server.js
    - Create configuration object for API keys and rate limits
    - Add validation to ensure API key is present when needed
    - _Requirements: 2.6, 14.1_
  
  - [x] 1.2 Implement rate limiter class for Twelve Data API
    - Create `RateLimiter` class with configurable max calls and time window
    - Implement throttle method with queue management
    - Configure for 800 calls per 24-hour window
    - Add logging for rate limit warnings
    - _Requirements: 2.7, 14.4_
  
  - [x] 1.3 Create Twelve Data price endpoint in server.js
    - Add `/api/twelve-data/price` endpoint
    - Implement request to Twelve Data API with proper headers
    - Parse response and extract price, currency, timestamp
    - Handle errors and return consistent format
    - _Requirements: 14.2, 14.3, 14.5_

- [x] 2. Implement server-side API fallback chains
  - [x] 2.1 Enhance `/api/price` endpoint with fallback logic
    - Modify existing `/api/price` to try Yahoo Finance first
    - Add fallback to Twelve Data API on Yahoo failure
    - Return source indicator in response (yahoo/twelve_data)
    - Preserve timestamp from original source
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [x] 2.2 Add FX historical data endpoint
    - Create `/api/fx-history` endpoint
    - Fetch 6-month historical FX data from Frankfurter API
    - Calculate date range (today minus 6 months)
    - Parse and return array of {date, rate} objects
    - Handle errors gracefully
    - _Requirements: 11.2_

- [x] 3. Create client-side field management system
  - [x] 3.1 Implement FieldManager class
    - Create `FieldManager` class with lockField/unlockField methods
    - Implement updateAndLock method for successful API fetches
    - Add showSuccess method to display timestamp
    - Add showError method to display error and unlock field
    - Add clearStatus method
    - Apply visual styling for locked vs unlocked states (readonly attribute, CSS classes)
    - _Requirements: 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [x] 3.2 Set price and currency fields to read-only by default
    - Add `readonly` attribute to adrPrice, localPrice, localCurrency, localToUsdRate fields in HTML
    - Update CSS to style readonly fields distinctly
    - Ensure fields can be programmatically unlocked when needed
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 4. Implement client-side API fetcher classes with fallback logic
  - [x] 4.1 Create PriceFetcher class with fallback chain
    - Implement `PriceFetcher` class with autoFetch and refresh methods
    - Add fetchFromYahoo method (existing `/api/price` endpoint)
    - Add fetchFromTwelveData method (new `/api/twelve-data/price` endpoint)
    - Implement fallback pattern: Yahoo → Twelve Data → Manual Entry Mode
    - Integrate with FieldManager to lock/unlock fields
    - Extract currency from API response for primary listings
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 14.2, 14.3, 14.5_
  
  - [x] 4.2 Create FXFetcher class with fallback chain
    - Implement `FXFetcher` class with autoFetch and refresh methods
    - Add fetchFromYahoo method (existing `/api/price` with FX pair format)
    - Add fetchFromFrankfurter method (existing `/api/fx` endpoint)
    - Implement fallback pattern: Yahoo → Frankfurter → Manual Entry Mode
    - Handle USD-to-USD as rate 1.0 without API call
    - Add fetchHistory method for 6-month FX data
    - Integrate with FieldManager
    - _Requirements: 2.5, 6.3, 6.4, 6.5, 11.2_

- [x] 5. Implement auto-fetch on ticker selection
  - [x] 5.1 Add auto-fetch for ADR ticker selection
    - Listen for ADR ticker selection/change events
    - Call PriceFetcher.autoFetch when ADR ticker is selected
    - Update adrPrice field and status message
    - Display timestamp on success
    - Remove manual "Pull" button for ADR ticker
    - _Requirements: 1.1, 1.4, 1.5_
  
  - [x] 5.2 Add auto-fetch for primary listing ticker selection
    - Listen for primary listing ticker selection/change events
    - Call PriceFetcher.autoFetch when primary ticker is selected
    - Extract and populate currency field from API response
    - Trigger FXFetcher.autoFetch when currency is populated
    - Update localPrice, localCurrency, and localToUsdRate fields
    - Display timestamps on success
    - Remove manual "Pull" buttons for primary ticker and FX rate
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 6.1, 6.2_

- [x] 6. Implement error handling and manual override mode
  - [x] 6.1 Add inline error messages for API failures
    - Display "Unable to fetch price. Enter manually" when price APIs fail
    - Display "Unable to fetch FX rate. Enter manually" when FX APIs fail
    - Show error messages in the status area (where timestamp normally appears)
    - Clear error messages when successful fetch occurs
    - _Requirements: 3.1, 3.2, 6.4_
  
  - [x] 6.2 Implement field unlock on API failure
    - Unlock adrPrice field when both Yahoo and Twelve Data fail
    - Unlock localPrice field when both APIs fail
    - Unlock localCurrency field when currency extraction fails
    - Unlock localToUsdRate field when both FX APIs fail
    - Re-lock fields when successful API fetch occurs after failure
    - _Requirements: 3.3, 3.4, 3.5, 4.4, 4.5_

- [x] 7. Add Refresh and Reset controls
  - [x] 7.1 Implement Refresh button functionality
    - Add "Refresh" button to header/utility bar in HTML
    - Validate that all ticker fields are populated before refreshing
    - Call PriceFetcher.refresh for both ADR and primary tickers
    - Call FXFetcher.refresh for current currency
    - Update all fields and recalculate analysis
    - Show loading states during refresh
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.7_
  
  - [x] 7.2 Implement Reset button functionality
    - Add "Reset" button to header/utility bar in HTML
    - Clear all ticker fields, price fields, quantity fields, commission fields, ratio field
    - Clear localStorage values
    - Reset all fields to default editable state
    - Clear all status messages and timestamps
    - Reset analysis cards to empty state
    - _Requirements: 5.5, 5.6, 5.7, 15.4_

- [x] 8. Implement localStorage persistence
  - [x] 8.1 Create StateManager class for localStorage
    - Implement `StateManager` class with save, load, clear methods
    - Define state structure (tickers, quantities, commissions, ratio)
    - Exclude API-fetched values (prices, FX rates) from persistence
    - Auto-save on every user input change
    - Restore saved state on page load
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 9. Add ADR Ratio discovery helper
  - [x] 9.1 Implement Google search helper for ADR Ratio
    - Add Google search icon button next to ADR Ratio field in HTML
    - Implement click handler to open new browser tab
    - Pre-populate search query with "ADR ratio [ADR ticker] [primary ticker]"
    - Use current ticker values from form
    - Maintain manual entry capability for ratio field
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6_

- [x] 10. Implement ticker filtering by exchange
  - [x] 10.1 Add exchange filtering to TickerSearch
    - Modify searchTickers function to accept side parameter
    - Filter ADR ticker results to US exchanges only (NYSE, NASDAQ, AMEX)
    - Filter primary listing results to exclude US exchanges
    - Add exchange badge display in dropdown suggestions
    - Add flag icon display in dropdown suggestions
    - Update suggestion rendering to show exchange name
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 11. Reorganize analysis section
  - [x] 11.1 Remove deprecated analysis cards
    - Remove "Commission Impact" card from HTML
    - Remove "Primary Equivalent / ADR" card from HTML
    - Remove associated calculation and rendering code
    - _Requirements: 8.1, 8.2_
  
  - [x] 11.2 Enhance Cost Comparison Chart
    - Modify chart card to span 2 rows in grid layout
    - Update winner display logic
    - Enhance bar chart visualization
    - Display total costs for both ADR and primary listing
    - Update chart in real-time on input changes
    - _Requirements: 8.3, 8.8_
  
  - [x] 11.3 Add ADR Premium/Discount card
    - Create new insight card for ADR premium/discount
    - Calculate percentage versus primary equivalent
    - Display positive values as premium, negative as discount
    - Show comparison against implied ADR price
    - Update in real-time on input changes
    - _Requirements: 8.4, 8.8_
  
  - [x] 11.4 Create FX Sensitivity card with historical trend
    - Create new insight card for FX sensitivity
    - Display break-even FX rate calculation
    - Add 6-month FX historical trend sparkline using Canvas
    - Fetch historical data from `/api/fx-history` endpoint
    - Render sparkline chart with lightweight Canvas implementation
    - Display fallback message if historical data unavailable
    - Update when primary listing currency changes
    - _Requirements: 8.5, 8.6, 11.1, 11.3, 11.4, 11.5_
  
  - [x] 11.5 Add FX Projections search helper
    - Add "FX Projections" button to FX Sensitivity card
    - Implement click handler to open new browser tab
    - Pre-populate search query with "[primary currency] to USD forecast"
    - Use current currency value from form
    - Maintain button visibility when currency is set
    - _Requirements: 8.7, 12.1, 12.2, 12.3, 12.4_

- [x] 12. Add target audience disclaimer
  - [x] 12.1 Implement disclaimer footer
    - Add disclaimer section at bottom of page in HTML
    - Display text: "For investors in US stock markets only"
    - Style for visibility across all viewport sizes
    - Ensure responsive design on mobile devices
    - _Requirements: 10.1, 10.2, 10.3_

- [x] 13. Ensure responsive design preservation
  - [x] 13.1 Test and fix responsive layout for new components
    - Test all new buttons and controls on mobile devices (< 640px)
    - Test all new buttons and controls on tablets (< 760px)
    - Ensure FX sparkline chart renders appropriately on small screens
    - Verify dropdown filters work correctly on touch devices
    - Test search helpers (ratio, FX projections) on mobile
    - Adjust CSS media queries as needed
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 14. Checkpoint - Verify all functionality and run tests
  - Ensure all auto-fetch behaviors work correctly
  - Verify API fallback chains function as expected
  - Test manual override mode for all fields
  - Confirm localStorage persistence works
  - Test refresh and reset controls
  - Verify analysis section updates in real-time
  - Test responsive design on multiple devices
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks build incrementally on previous work
- Each task references specific requirements for traceability
- The implementation preserves the vanilla JavaScript architecture
- API integration tasks come first to establish reliable data fetching
- Field management and auto-fetch are core features that enable other enhancements
- Analysis section reorganization comes after core functionality is stable
- Responsive design verification is the final step before completion
- No property-based tests are included as this is a UI-focused enhancement without universal correctness properties

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "3.2"] },
    { "id": 1, "tasks": ["1.2", "2.2", "3.1"] },
    { "id": 2, "tasks": ["1.3", "8.1", "10.1"] },
    { "id": 3, "tasks": ["2.1", "4.1", "9.1"] },
    { "id": 4, "tasks": ["4.2"] },
    { "id": 5, "tasks": ["5.1", "5.2"] },
    { "id": 6, "tasks": ["6.1", "6.2"] },
    { "id": 7, "tasks": ["7.1", "7.2", "11.1"] },
    { "id": 8, "tasks": ["11.2", "11.3", "12.1"] },
    { "id": 9, "tasks": ["11.4"] },
    { "id": 10, "tasks": ["11.5"] },
    { "id": 11, "tasks": ["13.1"] }
  ]
}
```
