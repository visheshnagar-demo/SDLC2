# CitiDirect Online Banking — Cash Statement Reports Module

Enterprise corporate treasury web application for generating, managing, and authorizing cash statement reports with maker-checker dual-control workflows, PDF/Excel/CSV exports, scheduling, and delivery options.

## Tech Stack
- **Backend**: Java 17+, Spring Boot 3.x, Spring Data JPA, Spring Security, Apache POI, OpenCSV, H2/PostgreSQL
- **Frontend**: Angular 17+, SCSS, Citigroup ICGDS design tokens
- **Architecture**: REST API (`/api/v1/cash-statements`), Maker-Checker Dual-Control Workflow

## Backend (Spring Boot 3.x)

### Prerequisites
- Java 17+ (JDK 17)
- Maven 3.8+

### Build & Run Tests
```bash
mvn clean test
```

### Start Backend Application
```bash
mvn spring-boot:run
```
The API server runs on `http://localhost:8080` (or `http://localhost:8000`).

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/cash-statements/generate` | Generate intraday or historical cash statement preview |
| POST | `/api/v1/cash-statements/export` | Export statement in PDF, Excel (.xlsx), or CSV |
| GET | `/api/v1/cash-statements/export-jobs/{jobId}` | Poll async export job status |
| GET | `/api/v1/cash-statements/schedules` | List recurring report schedules |
| POST | `/api/v1/cash-statements/schedules` | Create recurring report schedule (transitions to PENDING_APPROVAL) |
| PUT | `/api/v1/cash-statements/schedules/{id}` | Update recurring report schedule |
| DELETE | `/api/v1/cash-statements/schedules/{id}` | Deactivate recurring report schedule |
| GET | `/api/v1/cash-statements/authorizations/pending` | List pending maker-checker authorization requests |
| POST | `/api/v1/cash-statements/authorizations/{id}/approve` | Approve report/schedule (Checker != Maker) |
| POST | `/api/v1/cash-statements/authorizations/{id}/reject` | Reject report/schedule |
| GET | `/api/v1/cash-statements/lookups/accounts` | Retrieve entitled corporate bank accounts |
| GET | `/api/v1/cash-statements/lookups/report-templates` | Retrieve base report templates |
| GET | `/api/v1/cash-statements/audit-logs` | Query immutable audit log events |

## Full-Stack Local Development

### 1. Environment Setup
```bash
cp .env.example .env
```

### 2. Start Backend (Terminal 1)
```bash
mvn spring-boot:run
```
Backend API: `http://localhost:8080`

### 3. Start Frontend (Terminal 2)
```bash
cd client
npm install
npm run start
```
Frontend Web UI: `http://localhost:4200` (or `http://localhost:5173`)

### 4. Test Credentials & Dual-Control Roles
- **Maker User**: `usr_maker_101` (Role: `ROLE_MAKER`)
- **Checker User**: `usr_checker_202` (Role: `ROLE_CHECKER`)
- Dual-control rule: A Maker cannot authorize their own submissions (HTTP 403 Forbidden).
