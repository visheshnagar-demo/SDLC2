# IdentiVerify Frontend (React + Vite + Tailwind CSS)

Enterprise digital identity verification, document OCR intake, biometric 3D anti-spoofing, compliance adjudication, and audit logging frontend application.

## Tech Stack
- **Framework**: React 18 SPA
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (v6)
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Testing**: Vitest + React Testing Library + JSDOM

## Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm 9+

### Installation & Local Development
```bash
cd client
npm install
npm run dev
```
The development server will start on `http://localhost:5173`.

### Environment Configuration
Copy `.env.example` to `.env` and set the backend API base URL:
```ini
VITE_API_BASE_URL=http://localhost:8080
```

### Production Build
```bash
npm run build
```
Outputs static assets to `dist/`.

### Running Unit Tests
```bash
npm test
```
Runs Vitest unit and smoke test suites.
