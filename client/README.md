# Motor Insurance Premium Calculator - Client

Modern, responsive React 18 Single-Page Application (SPA) powered by Vite and Tailwind CSS for insurance agents to instantly calculate motor insurance premium quotes with detailed actuarial factor breakdowns.

## Features

- **Instant Rating Engine Form**: Real-time parameter inputs for vehicle make, year, value, driver age, experience, and coverage tiers.
- **Underwriting Guardrails**: Real-time validation preventing invalid inputs (e.g., driver age < 16, experience exceeding age minus 16, negative vehicle values).
- **Hero Premium Summary**: Real-time annual quote calculation, monthly payment estimate, and policy binding workflow.
- **Itemized Factor Breakdown**: Transparent cost impact breakdown showing Base Tariff, Vehicle Value Loading, Driver Age adjustments, Experience discounts, and Coverage surcharges.
- **Audit Ledger & Drawer**: Complete historical quote log with full telemetry inspection and JSON export.

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Testing**: Vitest + @testing-library/react + JSDOM

## Setup & Local Development

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env
```

Ensure `VITE_API_BASE_URL` points to your backend instance (`http://localhost:8000` by default).

3. Start development server:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

4. Run unit tests:

```bash
npm test
```

5. Build for production:

```bash
npm run build
```
