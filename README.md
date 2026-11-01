# CitiDirect Cash Statement Reports: Account Statement – Comprehensive

This repository contains the enterprise **CitiDirect Account Statement – Comprehensive** application for cash statement reporting, reconciliation, recurring scheduling, and multi-format exports.

## Technology Stack

- **Backend**: Java 21, Spring Boot 3.3.x, Spring Data JPA, Spring Security (BCrypt), Quartz Scheduler 2.3.x, Flyway Migrations, OpenPDF, Apache POI SXSSF, OpenCSV.
- **Frontend**: Angular 17+, TypeScript, RxJS, Citigroup ICGDS (Lumen Theme) SCSS design system.
- **Database**: PostgreSQL 16 (production/docker-compose) / In-Memory H2 (test profile).
- **Delivery Simulator**: MailHog SMTP server.

---

## Remediated Architecture & Features

1. **Secure Authentication & Password Verification**:
   - Enforces `BCryptPasswordEncoder` for credential validation.
   - All shared-password backdoor mechanisms (`testpassword`, `adminpassword`, hash equality bypasses) have been removed from runtime profiles.
   - Test seed credentials:
     - Maker User: `test@example.com` (`maker_user`) / `testpassword`
     - Checker User: `admin@example.com` (`checker_user`) / `adminpassword`

2. **Strict Account Entitlement Scoping**:
   - Account lookups (`/api/v1/lookups/accounts`) and statement executions (`/api/v1/reports/execution/run`) enforce server-side user entitlements.
   - Unentitled account selections explicitly return HTTP `403 Forbidden`.
   - Empty criteria queries scope safely to the authenticated user's authorized accounts without sample data fallbacks.

3. **Synchronized API Contracts**:
   - REST endpoints aligned with Angular services for execution (`POST /api/v1/reports/execution/run`), criteria management (`POST /api/v1/reports/criteria`), and binary export streaming (`POST /api/v1/reports/export`).
   - Binary blob response handling for XLSX, PDF, CSV, DHTML, and RTF downloads.

4. **Authoritative Statement Period Balances**:
   - Dynamic timezone-aware date range evaluation.
   - Opening, Running, and Closing balance calculations adhere to authoritative statement period invariants, maintaining mathematical consistency regardless of applied search filters.

5. **Persistent Recurring Scheduling & Maker-Checker Dual Control**:
   - Quartz Scheduler triggers configured for persistent execution of saved derived report criteria.
   - Delivery errors transparently propagate to execution history logs without swallowing exceptions.
   - Segregation of duties enforced: Makers cannot approve their own delivery options or schedules.

6. **Multi-Format Streaming Exports**:
   - Verified 64-column layout for Excel (`.xlsx`) via Apache POI SXSSF and CSV via OpenCSV.
   - Formatted PDF via OpenPDF, DHTML via responsive CSS templates, and RTF documents with subtotals and grand totals.

7. **Integration Status Transparency**:
   - `GET /api/v1/system/integrations/status` clearly differentiates local database sources from unconfigured live external banking connectors.

---

## Local Development & Setup

### 1. Backend (Spring Boot)
```bash
cd backend
mvn clean test
mvn spring-boot:run
```
- Backend runs on `http://localhost:8080`.
- Swagger UI / OpenAPI available at `http://localhost:8080/swagger-ui.html`.

### 2. Frontend (Angular)
```bash
cd client
npm install
npm start
```
- Frontend dev server runs on `http://localhost:4200`.

### 3. Docker Compose Deployment
```bash
docker-compose up --build
```
- **Nginx Frontend (SPA)**: `http://localhost` (Port 80)
- **Spring Boot Backend**: `http://localhost:8080` (Port 8080)
- **PostgreSQL Database**: `localhost:5432`
- **MailHog UI**: `http://localhost:8025`
