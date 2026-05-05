# Aluminum Tolerance Lookup

ANSI H35.2-2024 dimensional tolerance calculator for aluminum sheet, plate, and coil.

## What it does

Returns all applicable tolerances from the published standard given alloy, temper, form, cut method, thickness, width, and length:

- **Thickness (gauge)** — H35.2 Tables 7.7a (standard alloys) and 7.7b (aerospace alloys: 2014, 2024, 2219, 7050, 7075, 7475). Both tables use metric-derived width bands (39.37", 59.06", 78.74"...). All values symmetric ±.
- **Width** — Table 7.8 (sheared), Table 7.10 (sawed), Table 7.11 (slit coil). Sheet is ±; plate is plus-only.
- **Length** — Table 7.9 (sheared), Table 7.10 (sawed). Sheet is ±; plate is plus-only. N/A for coil.
- **Squareness** — Table 7.14. Formula-based: factor × width (ft), rounded up to nearest 1/16".
- **Flatness** — Table 7.17 (sheet, by alloy group and buckle distance) / Table 7.18 (plate, by temper class).
- **Lateral bow** — Table 7.12 (coil) / Table 7.13 (flat sheet and plate).

## Stack

- React 18 + Vite
- Tailwind CSS
- lucide-react icons
- Vercel Analytics

## Development

```bash
npm install
npm run dev
```

## Deployment

Push to GitHub. Vercel auto-deploys on push to main.

## Standard reference

ANSI H35.2-2024 — *Dimensional Tolerances for Aluminum Mill Products*  
Published by The Aluminum Association. ASTM B209 incorporates these tolerances by reference.

All tolerance values in this tool were verified cell-by-cell against the 2024 edition of the standard.
