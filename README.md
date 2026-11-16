

## Frontend (client/)

### Prerequisites
- Node.js 18+ and npm 8+

### Setup

1. Install dependencies:
```bash
cd client
npm install
cd ..
```

### Available Commands

**Development Server:**
```bash
cd client
npm run dev
cd ..
```
Opens the app at `http://localhost:5173`

**Production Build:**
```bash
cd client
npm run build
cd ..
```
Creates optimized build in `client/dist/`

**Run Tests:**
```bash
cd client
npm test
cd ..
```

**Build & Preview:**
```bash
cd client
npm run preview
cd ..
```
Preview production build locally

### Environment Variables

**React / Vite frontends:**
The frontend reads `VITE_API_BASE_URL` at build time (baked into the JS bundle):
```
VITE_API_BASE_URL=http://localhost:8080/api
```
For production, pass `--build-arg VITE_API_BASE_URL=https://<backend>.run.app/api` when building the Docker image.

**Angular frontends:**
The backend URL is injected at container startup via `API_BASE_URL` env var (runtime, not build time):
```
API_BASE_URL=http://localhost:8080/api
```
For production, set `API_BASE_URL=https://<backend>.run.app/api` as a Cloud Run env var on the frontend service.

### Running with the Backend

The frontend requires the backend server to be running. See the **Full-Stack Local Development** section in this README for complete setup instructions.

