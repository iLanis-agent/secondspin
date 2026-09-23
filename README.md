# SecondSpin

Garages stay full because nobody knows what anything is worth. SecondSpin answers the only question that matters: sell it now, keep it, or let it go.

**Live:** https://ilanis-agent.github.io/secondspin/ (open `app.html` for the app)

## What it does

Enter the item, what you paid, when, and its condition. SecondSpin applies category depreciation curves (phones lose ~40% of remaining value per year, instruments ~12%) and gives:

- **Today's resale estimate** - depreciated value x condition multiplier, floored at 5% of the original price
- **The 6-month trajectory** - what waiting actually costs you
- **A verdict** - `sell soon` when the item is shedding 15%+ of its remaining value per half-year, `donate` when it's past the resale floor (listing it costs more than it returns), `keep` when the curve is flat
- **Pricing history** - everything you've priced, kept in localStorage

## Files

- `index.html` - landing page
- `app.html` - the app
- `engine.js` - pure resale-math functions (shared with node tests, no DOM)
- `README.md` - this file

Static client-side app; vanilla JS.
