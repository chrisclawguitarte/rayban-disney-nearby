# Disney Nearby

A fixed 600x600 Meta Ray-Ban Display web app for Disneyland Resort wait times sorted by your live GPS location in the park.

## What It Shows

- Nearby Disneyland and Disney California Adventure attractions sorted by distance from the glasses' paired phone GPS.
- Current wait, park, land, distance, and bearing for each visible attraction.
- Filters for both parks, Disneyland only, DCA only, open attractions, and all attractions.
- Queue-Times.com source attribution inside the app.

The wait data is unofficial Queue-Times.com public API data and can differ from the Disneyland app. Attraction coordinates are an app-local approximate catalog with land-level fallbacks.

## Why There Is A Data Snapshot

Queue-Times serves the data used by the existing OpenClaw Disneyland skill, but its park endpoints do not include browser CORS headers. The glasses app fetches same-origin `waits.json` instead. `scripts/refresh-waits.js` generates that file server-side, and `.github/workflows/refresh-waits.yml` refreshes it with GitHub-hosted runners every 5 minutes.

## Local Development

```bash
npm run refresh-waits
npm run favicon
npm run check
npm start
```

Open `http://localhost:8096/` with a 600x600 browser viewport. Arrow keys move focus and Enter activates the focused control.

## Deployment Notes

The device needs a public HTTPS URL, so deploy this repo with GitHub Pages using the included GitHub Actions workflow. After the repo is published and Pages is enabled, add it in:

`Meta AI app > Display Glasses settings > App connections > Web apps`

The scheduled refresh workflow runs every 5 minutes. Each run regenerates `waits.json`, validates the app bundle, and deploys the refreshed static site to GitHub Pages without committing a new wait snapshot every time.
