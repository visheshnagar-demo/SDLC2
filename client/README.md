# DG Cluster Assortment Advisor — Frontend

A React 18 single-page decision-support dashboard for Dollar General Category Managers managing Snacks product assortments in Small Town Value Cluster stores.

## Features

- **KPI Header Strip**: Real-time assortment metrics including Sales per Linear Foot, Private Brand %, In-Stock Rate, and Shelf Capacity.
- **SKU Performance Table**: Searchable, filterable, and sortable table of Snacks SKUs with performance indicators and color-coded action recommendations (`GROW`, `MAINTAIN`, `SWAP`, `REDUCE`).
- **Interactive Scenario Selector**: Side-by-side evaluation cards for `Conservative`, `Balanced`, and `Aggressive` assortment strategies with projected sales, private brand %, and shelf utilization metrics.
- **Approval Review Panel**: Real-time summary of proposed SKU action counts, automated guardrail status checks (Private Brand Target, Shelf Capacity, In-Stock SLA), and plan submission.
- **Inline Confirmation**: Non-disruptive inline confirmation banner detailing audit trail ID after submission.

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Testing**: Vitest + React Testing Library + jsdom

## Setup & Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Default configuration:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Run Unit Tests

```bash
npm test
```

### 5. Build for Production

```bash
npm run build
```
