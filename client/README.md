# Facultative Reinsurance Portal (Client)

Frontend web portal for insurance carriers and facultative underwriters covering Cyber and D&O risks.

## Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Unit Testing**: Vitest + @testing-library/react + jsdom

## Environment Variables

Create a `.env` file in the `client/` root (or copy from `.env.example`):

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Available Scripts

### Run Development Server

```bash
npm install
npm run dev
```

Starts the Vite local server on `http://localhost:5173`.

### Run Test Suite

```bash
npm test
```

Executes all unit tests with Vitest.

### Build Production Bundle

```bash
npm run build
```

Generates production assets in `client/dist/`.
