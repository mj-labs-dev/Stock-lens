---
title: "Stock Lens: ADR vs Primary Listing for the Global Investor"
slug: "adr-vs-primary-listing-global-investor"
date: "2026-06-08"
author: "Puneet Jindal"
tags: ["Financial Fortress", "Investing", "Global Markets", "ADR", "Tools"]
description: "Most US investors don't realize they can buy Samsung, Airbus, or SK Hynix directly on foreign exchanges — often cheaper than the US-listed version. Here's what I learned, and the free tool I built to help you decide."
---

I've had a full-time job for most of my adult life. Like a lot of people in that situation, I treat the stock market as a long game — a way to build wealth steadily, without handing 1–2% of everything I own to a financial advisor every year.

Over the years I've used most of the major platforms — Fidelity, Schwab, Robinhood, and others. I've relied on their screeners, curated themes, and analyst ratings to find stocks. They're good for what they're built for. But they're mostly built for the US market.

This is my first post on Financial Fortress. It's about a gap I ran into, didn't fully understand for longer than I'd like to admit, and eventually solved. I built a tool to go with it. Both are free.

---

## The Question I Couldn't Answer

A few years in, I started getting curious about companies outside the US. I searched for SK Hynix. Samsung. Airbus. What I found was confusing — OTC listings, Pink Sheet tickers, prices that didn't make sense, volumes that were nearly zero. Some of it felt like the kind of thing you'd see in *The Wolf of Wall Street*. I didn't buy any of it, and I moved on.

So I stayed in the ecosystem — ETFs with ratings, pre-built themes, analyst recommendations. It's not a bad way to invest. But it meant I was never really answering the question: **how do I buy Samsung stock?**

Samsung is one of the most valuable companies in the world. I wanted direct exposure, not a Korea-focused ETF that bundles in dozens of other holdings I didn't ask for. I searched. I found something called SSNLF on the OTC markets. The price looked off. Volume was thin. Bid-ask spreads were wide. Something felt wrong. I left it alone.

What I didn't know then: Samsung has no US-listed ADR. Never has. If you want Samsung equity, you either take a bundle inside a Korea ETF, or you buy the primary listing directly on the Korea Exchange (KRX) in Korean Won. That's it. SSNLF exists, but it's thinly traded, largely unregulated, and not appropriate for a meaningful position.

I eventually figured this out. Opened an Interactive Brokers account. Bought 005930.KS directly on KRX — Samsung common shares, in KRW. Did the same with SK Hynix (000660.KS). Later bought Airbus (AIR.PA) on Euronext in Euros. The FX conversions were efficient, close to mid-market rates. The spreads were tighter than I expected. The process was less intimidating than it sounds.

What surprised me most: in some cases, buying the primary listing was actually *cheaper* than the US-listed equivalent — even after currency conversion. That wasn't intuitive. It sent me down a research rabbit hole, and eventually led to the tool at the bottom of this post.

But first — let me explain what's actually going on, because the terminology alone is enough to make most people give up.

---

## The Landscape: ADR, OTC, Primary Listing — What's the Difference?

When a non-US company wants US investors to access its stock, it has a few options. Understanding them is the first step to making smarter decisions.

### Primary Listing

Every publicly traded company has a home market — the exchange where it primarily trades, regulated under local law, denominated in local currency. Samsung's is the Korea Exchange (KRX). Airbus's is Euronext Paris. Novo Nordisk's is Nasdaq Copenhagen. Toyota's is the Tokyo Stock Exchange (TSE).

This is where price discovery actually happens. The deepest liquidity, tightest spreads, and most accurate pricing all live here. For most of investing history, US retail investors couldn't easily access these markets. That's changed significantly — Korea, for example, abolished its foreign investor registration requirement in December 2023, opening direct KRX access to anyone with a capable broker.

### ADR — American Depositary Receipt

An ADR is a US-listed certificate that represents ownership in a foreign company's shares. A US depositary bank — typically JPMorgan, Citibank, or Deutsche Bank — physically holds the underlying foreign shares in custody and issues ADR certificates that trade on US exchanges in US dollars.

The key mechanics:

- **Conversion ratio:** One ADR doesn't always equal one share. Toyota's ADR (TM) represents 1/10th of one Tokyo-listed share (7203.T). Novo Nordisk's ADR (NVO) represents one Copenhagen-listed share. The ratio is set by the depositary bank to price the ADR attractively for US investors — typically in the $10–$100 range.
- **Currency:** ADRs trade in USD. The underlying shares trade in local currency. FX rates affect the relationship between the two prices constantly — and your currency exposure doesn't disappear just because your brokerage account shows dollars.
- **ADR fees:** Depositary banks charge custody and administration fees — typically $0.01–$0.03 per share per year — passed through to holders, sometimes invisibly as a deduction from dividends. For a diversified EAFE ADR portfolio, Fidelity estimates these fees run roughly 0.20% of beginning balance per year.

Not all ADRs are created equal. There are three levels, and the level tells you a lot about how much you can trust the instrument:

| Level | Where it trades | SEC requirements | Capital raising |
|---|---|---|---|
| Level I | OTC markets only | Minimal — no GAAP, no annual reports | No |
| Level II | NYSE or Nasdaq | Full SEC registration, annual Form 20-F | No |
| Level III | NYSE or Nasdaq | Strictest — same as Level II | Yes — can issue new shares |

A Level II or III ADR on NYSE or Nasdaq is a well-regulated, fully disclosed instrument. A Level I ADR on the OTC markets is a different beast — minimal reporting requirements, thinner liquidity, wider spreads.

ADRs can also be **sponsored** (the foreign company participates and maintains the program) or **unsponsored** (created by a US bank without the company's direct involvement). Unsponsored ADRs tend to have less reliable information flow and can be terminated with little notice — more on that below.

### OTC — Over-the-Counter

OTC markets are where securities trade directly between parties, not on a formal exchange. This includes Level I ADRs but also "foreign ordinaries" — direct shares of foreign companies deposited with a US custodian and trading on US OTC markets.

The OTC market has tiers: OTCQX (highest standards), OTCQB (venture stage), and Pink Sheets (minimal requirements). Many foreign company OTC listings are on the Pink Sheets. This is where you find SSNLF (Samsung's OTC quote) — technically tradeable, but with wide spreads, low volume, and limited investor protections.

> The practical takeaway: If a company has a Level II or III ADR on NYSE or Nasdaq, that's a legitimate, well-regulated way to get exposure. If you're looking at an OTC or Pink Sheet listing, understand what you're getting into. And if there's no US listing at all — like Samsung — the primary exchange is often the better answer.

---

## Why ADRs Trade at a Premium or Discount

Here's where it gets interesting — and where most investors are leaving money on the table without knowing it.

You'd expect an ADR and its underlying primary listing to trade at exactly the same price (adjusted for the conversion ratio and FX). In efficient markets, arbitrageurs should close any gap instantly. In practice, persistent premiums and discounts exist, for several reasons:

1. **Liquidity differences** — Where volume concentrates, price leads. If US investors are actively trading an ADR while the home market has lower foreign participation, the ADR can trade at a premium simply because demand is higher there.

2. **Trading hour mismatches** — The Tokyo Stock Exchange closes before US markets open. Toyota's ADR (TM) on the NYSE reflects US investor sentiment about news that happened after Tokyo closed. By the time Tokyo opens the next day, the gap may have closed — or widened. This timing mismatch is a persistent source of premium/discount.

3. **Emerging market risk premium** — In markets where settling trades is more complex, custody is less reliable, or capital controls exist, investors pay a premium for the ADR's US-regulated wrapper. The convenience has real value.

4. **Capital flow restrictions** — Some countries restrict how much capital can flow in or out. ADRs in those markets can trade at significant premiums because they're the only accessible route for foreign investors.

5. **FX momentum** — If a currency is strengthening, local shares become more valuable in USD terms. ADR prices may not adjust instantly, creating a temporary discount relative to the primary listing.

The numbers on this are striking. An MSCI study analyzing roughly 715 ADRs monthly across January 2020 to March 2025 found that the average price divergence from the underlying local share is essentially zero — but the *standard deviation* of that divergence is 3.26% across the broad universe, and 1.81% even among liquid EAFE index names. That means meaningful premiums and discounts are common, even if they average out over time. For a large position, 3% is real money.

TSMC is a sharp example: TSM (the US ADR) traded at an average **26% premium** to the Taiwan primary listing in December 2024, falling to 13.7% by May 2025. Investors paying that premium were paying for US-market convenience. Whether that's worth it depends on your situation — but you should know you're paying it.

---

## The FX Factor — The Variable Most Investors Underestimate

This is the part that surprised me most when I actually ran the numbers.

When you buy an ADR, you're buying in USD. Simple. But here's what most investors miss: **buying an ADR does not remove your currency exposure.** The ADR's price is fundamentally linked to the local share price at the current FX rate. If you buy a Japanese ADR today and the yen weakens 5% against the dollar over the next year, your ADR will underperform the underlying Tokyo shares by roughly 5% — even if the company itself does exactly the same.

The FX impact isn't hypothetical. WisdomTree analyzed Toyota's primary listing versus its ADR from late 2012 to late 2014: the Tokyo-listed shares rose 74.6% in yen terms, but the US ADR (TM) returned only 33.7% — because the yen depreciated roughly 24% over that period. Same company, same business results, nearly 41 percentage points of difference.

More recently: in 2022, MSCI EAFE fell more than 20% in USD terms but only about 7.5% in local currency terms — a 13 percentage-point currency drag. In 2025, it flipped: EAFE returned 23.7% locally but 31.2% in USD, a 7.5-point currency tailwind.

Currency exposure is embedded in your ADR whether you see it or not.

When you buy the primary listing directly, you own the currency exposure explicitly. You can see it, track it, and if you choose to, hedge it. With an ADR, it's invisible — but it's there.

There's also the question of FX conversion costs. When your broker converts dollars to yen or won to execute a trade, what rate are you getting? IBKR converts at rates very close to mid-market — typically 0.20 basis points (that's $0.02 per $100 converted, with a $2 minimum). On a $20,000 conversion, that's roughly $6. Some retail brokers offering "commission-free" international trading embed FX spreads of 1.0% or higher — on that same $20,000 conversion, that's $200. The headline commission savings disappear fast.

| Broker | FX spread | Cost on $20K conversion |
|---|---|---|
| IBKR | 0.20 bps (manual) | ~$6 |
| Schwab | 1.0% (<$100K) | ~$200 |
| Fidelity | Spread-based, less disclosed | Varies |

The break-even FX rate — the exchange rate at which the ADR and primary listing cost exactly the same — is one of the most useful numbers you can calculate before deciding. It tells you not just which is cheaper today, but how sensitive that answer is to currency movement.

---

## A Word on ADR Termination Risk

This is something most investors don't think about until it's too late.

ADR programs can be terminated — by the depositary bank, by the foreign company, or in some cases by US regulatory action. When that happens, you generally have a few options: receive cash for your shares, convert into the underlying foreign shares within a window (typically six months), or have the shares sold automatically with proceeds in cash.

The China ADR delisting wave made this concrete. China Mobile's ADRs were cash-settled at roughly $30.20 per ADR in November 2021. Didi Global dropped more than 80% during its delisting process. Goldman Sachs estimated roughly $250 billion in Chinese ADRs were at risk at peak uncertainty.

This doesn't mean avoiding ADRs categorically — Level II and III ADRs with long-established programs on major US exchanges carry low termination risk. But it's one more reason to understand what you own, especially with unsponsored or Level I OTC-listed instruments.

---

## What I Built, and Why

After doing these calculations manually in a spreadsheet a few times, I built a tool. It started as something purely for my own use — a way to pull live prices for both the ADR and primary listing, convert everything to a common currency, factor in commissions and the conversion ratio, and tell me which option was actually cheaper.

I'm sharing it here because this decision — ADR vs. primary listing — is one that a lot of self-directed investors face without good tooling. The answer isn't always obvious. Sometimes the ADR is cheaper. Sometimes the primary listing is. FX plays a big role. Commission structures matter. The conversion ratio makes the math non-trivial.

Stock Lens pulls live price and FX data, handles currency subunit conversions (British pence, Japanese yen, Korean won), lets you set your actual commission structure, and shows you the break-even FX rate alongside a 6-month FX trend so you can see whether the current rate is historically high or low.

It works for any company with both an ADR and a primary listing. No login. No data shared. Just enter the tickers and your trade details — it does the rest.

[Try Stock Lens →](/products/financial-fortress/stock-lens)

---

## The Practical Checklist Before You Decide

Before you buy an international company through a US-listed instrument, ask yourself:

- **Is it an ADR or an OTC foreign ordinary?** If OTC, what tier? Pink Sheet listings deserve extra caution.
- **Is the ADR sponsored or unsponsored?** Unsponsored ADRs carry more termination risk and less reliable information flow.
- **What's the conversion ratio?** A 1:10 ratio means the math is less intuitive — model it out.
- **What's the current premium or discount?** Run the FX-adjusted numbers. A 3–5% ADR premium means you're paying more for the convenience wrapper than you might realize.
- **What FX rate is your broker using?** For large positions, the difference between mid-market and a retail spread can easily exceed your commission savings.
- **Does the company even have a US ADR?** Samsung doesn't. In those cases, the primary exchange isn't exotic — it's the only real option.
- **What's the break-even FX rate?** Understanding the FX sensitivity of your decision gives you context for whether now is actually the right time to buy either way.

---

## A Note on IBKR

I don't have a financial relationship with Interactive Brokers beyond being a customer. I mention them because they're the platform that made direct primary listing access practical for me — the FX rates are competitive, KRX access works, Euronext access works, and the infrastructure for international trading is genuinely solid. Other brokers support international trading; IBKR is the one I have firsthand experience with.

If you'd like to explore opening an account: [Open an IBKR account →](https://ibkr.com/referral/puneet374) — I may earn a referral fee if you sign up.

---

## What's Next on Financial Fortress

Stock Lens is the first tool I'm publishing. It focuses on the entry decision — which way to buy. Future tools will cover what happens after: tax exposure tracking on international holdings, lot-based sell decisions for tax optimization, quarterly estimate pre-payment, and tax-loss harvesting logic. The decisions that get complicated when you have a real portfolio and no advisor on retainer.

The goal is a set of sharp, free tools for self-directed investors who are capable of making their own decisions — and just need the right information to make them well.

If this was useful, bookmark it. Try Stock Lens at [mj-labs.dev/products/financial-fortress/stock-lens](https://www.mj-labs.dev/products/financial-fortress/stock-lens). Questions or feedback: hello@mj-labs.dev.

---

*Puneet Jindal is the founder of MJ Labs, based in Seattle. Financial Fortress is MJ Labs' personal finance product — sharp tools for the self-directed investor.*

*This post is for informational purposes only and does not constitute financial advice.*

---

**References**

- MSCI: [The Cost of Access: Understanding Price Efficiency of ADRs](https://www.msci.com/research-and-insights/blog-post/the-cost-of-access-understanding-price-efficiency-of-adrs) (July 2025)
- WisdomTree: [Clarifying Confusion: ADRs Have Currency Risk](https://www.wisdomtree.com/investments/blog/2014/11/03/clarifying-confusion-american-depository-receipts-(adrs)-have-currency-risk)
- Robinhood Support: [American Depositary Receipts](https://robinhood.com/us/en/support/articles/american-depositary-receipts/)
- SEC Office of Investor Education: [Trading Prohibitions on Foreign Companies Under the HFCAA](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/trading-prohibitions-foreign-companies-under-hfcaa-updated-investor-bulletin)
- Interactive Brokers: [Referral link](https://ibkr.com/referral/puneet374)