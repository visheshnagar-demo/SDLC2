# CitiDirect Online Banking — Cash Statement Reports Module

Enterprise web application for searching, generating, scheduling, and authorizing cash statement reports with maker-checker dual-control workflows and multi-format exports (PDF, Excel, CSV).

---

## Tech Stack
- **Backend**: Java 17+, Spring Boot 3.x, Spring Data JPA, Spring Security, OpenPDF, Apache POI, H2 / PostgreSQL
- **Frontend**: Angular 17+ (SCSS), Citigroup ICGDS design tokens

---

## Full-Stack Local Development

### 1. Backend Service (Spring Boot)
Ensure Java 17+ and Maven 3.9+ are installed.

```bash
# Build the project
mvn clean install

# Run tests
mvn test

# Start the Spring Boot application (Default Port: 8080)
mvn spring-boot:run
```

### 2. Frontend Application (Angular 17+)
Ensure Node.js 18+ and npm are installed.

```bash
cd client
npm install
npm start
```
The frontend dev server runs on `http://localhost:4200` (or `http://localhost:5173`).

---

## Seeded Test Accounts
| Username / Email | Password | Role | Description |
| :--- | :--- | :--- | :--- |
| `test@example.com` / `testuser` | `testpassword` | `ROLE_MAKER` | Corporate Maker (creates criteria, generates reports, submits schedules) |
| `admin@example.com` / `adminuser` | `adminpassword` | `ROLE_CHECKER` | Corporate Checker / Admin (reviews and authorizes/rejects pending actions) |
| `maker@citi.com` / `makeruser` | `makerpassword` | `ROLE_MAKER` | Corporate Operations Maker |
| `checker@citi.com` / `checkeruser` | `checkerpassword` | `ROLE_CHECKER` | Dual-Control Authorizer |

---

## REST API Endpoints
- `GET /api/reports` - Search and filter cash statement reports
- `POST /api/reports/{id}/generate` - Generate on-demand cash statement report
- `GET /api/reports/{id}/export?format=PDF|EXCEL|CSV` - Export report
- `POST /api/reports/schedule` - Create recurring statement schedule (enters `PENDING_AUTHORIZATION`)
- `GET /api/reports/schedule` - List schedules
- `POST /api/delivery-options` - Configure delivery channels (Email, SFTP, Vault)
- `GET /api/delivery-options/pending` - Fetch pending authorization queue for Checker ribbon
- `POST /api/delivery-options/{id}/authorize` - Checker authorizes pending schedule/delivery
- `POST /api/delivery-options/{id}/reject` - Checker rejects pending schedule/delivery with mandatory reason
- `GET /api/lookup/branches` - Branch master data lookup
- `GET /api/lookup/customers` - Customer corporate profiles lookup
- `GET /api/lookup/accounts` - Entitled accounts lookup
- `GET /api/lookup/report-names` - Base report names and templates lookup

## Server

### Prerequisites
- Python 3.9+
- pip and venv

### Setup

1. Create and activate virtual environment:
```bash
python -m venv server/.venv
# On Windows:
server\.venv\Scripts\activate
# On macOS/Linux:
source server/.venv/bin/activate
```

2. Install dependencies:
```bash
cd server
pip install -r requirements.txt
cd ..
```

### Running Tests
```bash
cd server
python -m pytest -v
cd ..
```

### Starting the Development Server
```bash
# Run from the repo root so that `from server.X` imports resolve correctly
python -m uvicorn server.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

## Full-Stack Local Development

To run both backend and frontend together locally:

### 1. Environment Setup
```bash
# Copy the example environment file
cp .env.example .env
```

### 2. Start the Backend (Terminal 1)
```bash
python -m venv server/.venv
source server/.venv/bin/activate  # On Windows: server\.venv\Scripts\activate
pip install -r server/requirements.txt
python -m uvicorn server.main:app --reload --host 0.0.0.0 --port 8000
```
Backend API: `http://localhost:8000` | API Docs: `http://localhost:8000/docs`

### 3. Start the Frontend (Terminal 2)
```bash
cd client
npm install
npm run dev
```
Frontend: `http://localhost:5173`

The frontend connects to the backend API at `http://localhost:8000` by default via the `VITE_API_BASE_URL` environment variable.

### 4. Test Credentials
If the app has authentication, the backend seeds ready-to-use accounts on startup
(idempotent). These are guaranteed logged-in-able — every activation/verification
gate (`is_active`, `is_verified`, `email_verified`, `disabled`) is set to the
permissive value, so no manual DB step is needed:
- **Regular user** — Email: `test@example.com`, Password: `testpassword`
- **Admin user** (only when the app has roles/RBAC) — Email: `admin@example.com`, Password: `adminpassword`, role: `admin`

Passwords are stored hashed with the app's own hashing utility (never in plaintext).

### Port Reference
| Service  | Port | URL                        |
|----------|------|----------------------------|
| Backend  | 8000 | http://localhost:8000      |
| Frontend | 5173 | http://localhost:5173      |
| API Docs | 8000 | http://localhost:8000/docs |

