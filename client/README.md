# DG Cluster Assortment Advisor - Frontend Client

Single-page consolidated decision-support dashboard for Dollar General Category Managers for Snacks in Small Town Value Cluster stores.

## Key Features

- **KPI Header Strip**: Displays real-time aggregate store metrics (Sales per Linear Foot, Private Brand %, In-Stock Rate, Shelf Capacity utilization).
- **SKU Performance Table**: Interactive grid listing Snacks SKUs with performance metrics, search/filtering, and color-coded status badges (`GROW`, `MAINTAIN`, `SWAP`, `REDUCE`).
- **Interactive Scenario Selector**: Three side-by-side scenario cards (`Conservative`, `Balanced`, `Aggressive`) with `Balanced` pre-selected by default.
- **Approval Review Panel**: Scenario impact summary, proposed SKU action breakdown, guardrail compliance checklist, and submission action.
- **Inline Confirmation & Audit Trail**: Post-submission modal and banner with generated audit ID, timestamp, and audit trail breakdown.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Lucide React
- Axios
- Vitest & React Testing Library

## Setup & Running

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will run on `http://localhost:5173`.

### Production Build

```bash
npm run build
```

### Running Tests

```bash
npm run test
```

## Environment Variables

- `VITE_API_BASE_URL`: Backend API base URL (defaults to `http://localhost:8000`).
