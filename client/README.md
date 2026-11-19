# Digital Identity Verification - Frontend Client

React 18 single-page application built with Vite and Tailwind CSS for the Digital Identity Verification platform.

## Features
- **User Authentication**: Secure Login and Registration forms with email validation and error feedback.
- **Session Management**: JWT access & refresh token handling via React Context (`AuthContext`).
- **Dashboard & Verification Tracker**: Real-time customer session status and multi-stage verification roadmap.
- **Defensive API Client**: Axios client with interceptors for token injection and automatic token refresh.

## Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and configure the backend URL:
```bash
cp .env.example .env
```
Default configuration:
```env
VITE_API_BASE_URL=http://localhost:8080
```

### 3. Start Development Server
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```

### 5. Run Unit Tests
```bash
npm run test
```

## Test Accounts
- **Customer User**: `test@example.com` / `testpassword`
