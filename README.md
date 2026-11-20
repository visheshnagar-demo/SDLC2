# Digital Identity Verification Platform (SCRUM-492)

Document Upload & Optical Character Recognition (OCR) Processing Service.

## Architecture
- **Backend**: Java 17, Spring Boot 3, Spring Security 6 (JWT), Spring Data JPA, PostgreSQL / H2 In-Memory
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons
- **Document Processing**: Apache PDFBox, Multipart Streaming, Malware Signature & Magic Bytes Inspection, Regex OCR Engine

---

## Server (Java Spring Boot 3 Backend)

### Prerequisites
- Java 17+ (e.g. Eclipse Temurin 17)
- Apache Maven 3.8+

### Build & Run
```bash
# Build with Maven
mvn clean package -DskipTests

# Run the Spring Boot application
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`.
H2 Console (in development): `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:authdb`)

### Running Backend Tests
```bash
mvn test
```

---

## Full-Stack Local Development

### 1. Environment Configuration
```bash
# Copy example environment configuration
cp .env.example .env
```

### 2. Start the Backend (Terminal 1)
```bash
mvn spring-boot:run
```
Backend API: `http://localhost:8080`

### 3. Start the Frontend (Terminal 2)
```bash
cd client
npm install
npm run dev
```
Frontend Web App: `http://localhost:5173`

### 4. Test Credentials
The backend seeds test accounts automatically on startup:
- **Standard User**: `test@example.com` / `testpassword`
- **Admin User**: `admin@example.com` / `adminpassword`

---

## API Endpoints (SCRUM-492 Increments)

| Method | Path | Description | Access |
|---|---|---|---|
| `POST` | `/api/v1/documents/upload` | Multipart document upload (PNG/JPEG/PDF max 10MB) with malware scan & OCR | Authenticated (JWT) |
| `GET` | `/api/v1/documents/{id}` | Retrieve document details, OCR results, and status by Document ID | Authenticated (Owner / Admin) |
| `GET` | `/api/v1/documents/me` | List all uploaded documents for authenticated user | Authenticated (JWT) |

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

