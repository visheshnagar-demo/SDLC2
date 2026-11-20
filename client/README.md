# Customer Registration & Auth Portal Client

React 18 + Vite + Tailwind CSS frontend application for Customer Registration, Authentication, and Identity Onboarding Management (SCRUM-491).

## Features
- **Customer Registration**: Self-service registration form with interactive password complexity scoring and validation.
- **Secure Login**: Authentication form with pre-filled test credentials (`test@example.com` / `testpassword`) and quick-switch buttons.
- **Profile & Identity Dashboard**: Live identity status, customer role details, and account creation dates.
- **Onboarding Progress Stepper**: 4-stage visual milestone stepper for tracking digital verification (KYC).
- **Session Lifecycle & Token Card**: Live countdown timer for active JWT access tokens with sliding refresh controls.
- **Protected Routing & Error Boundaries**: Secure route guards with graceful error boundary fallbacks.

## Tech Stack
- **Framework**: React 18.3.1
- **Bundler / Dev Server**: Vite 5.2.8
- **Styling**: Tailwind CSS 3.4.1 + Plus Jakarta Sans typography
- **HTTP Client**: Axios with interceptors for JWT token lifecycle management
- **Icons**: Lucide React
- **Routing**: React Router DOM 6.22.3
- **Testing**: Vitest + React Testing Library + JSDOM

## Setup & Running Locally

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### Installation
```bash
npm install
```

### Environment Configuration
Create a `.env` file in the `client/` directory (or use `.env.example`):
```env
VITE_API_BASE_URL=http://localhost:8080
```

### Development Server
```bash
npm run dev
# Starts Vite dev server on http://localhost:5173
```

### Production Build
```bash
npm run build
```

### Unit Tests
```bash
npm test
```
