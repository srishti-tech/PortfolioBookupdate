# Portfolio Book — repaired and responsive

## Run locally
1. Extract the ZIP.
2. Open `index.html` in a browser, or serve the folder with VS Code Live Server.
3. For best results, use Live Server because external fonts/icons and EmailJS require internet access.

## What was fixed
- Removed the undefined `pages` / `coverLeft` references that stopped the original JavaScript from running.
- Preserved the original HTML content, assets, page IDs, PDFs, and styling.
- The first content leaf is now on top when the cover opens; next/previous arrows toggle the correct leaf using its existing `data-page` attribute.
- Added a single-page mobile reading layout with Previous/Next navigation for phone widths, while retaining the two-page flipbook layout on desktop/tablet.
- Kept the existing EmailJS IDs and made the send callback report errors safely.

## Note
Email sending still depends on the original EmailJS service/template credentials and their configuration. All remote fonts, icons, and external services need an internet connection.
