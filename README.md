# CitiDirect Cash Statement Reports

Full-stack application for liquidity and cash management reporting.

| Layer | Technology |
|-------|-----------|
| Backend | Java 17 · Spring Boot 3.2.5 · Maven |
| Frontend | Angular 17 · TypeScript · Tailwind CSS |
| Database (dev) | H2 in-memory (PostgreSQL-compatible mode) |
| Container runtime | Docker · nginx (frontend) · Tomcat embedded (backend) |

---

## Prerequisites

| Tool | Minimum version |
|------|----------------|
| JDK | 17 |
| Maven | 3.9 |
| Node.js | 20 |
| npm | 10 |
| Docker Desktop | any recent |

---

## Local Development

### Backend (Spring Boot)

```bash
# From repo root
./mvnw spring-boot:run
# Or with Maven installed globally:
mvn spring-boot:run
```

API available at `http://localhost:8080`  
H2 console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:citidirect`)  
Actuator health: `http://localhost:8080/actuator/health`

### Frontend (Angular)

```bash
cd client
npm install
npm start          # ng serve — dev server with live reload
```

Frontend available at `http://localhost:4200`

The dev server proxies API calls to `http://localhost:8080` by default.

---

## Running Both Together

```bash
# Terminal 1 — backend
mvn spring-boot:run

# Terminal 2 — frontend
cd client && npm install && npm start
```

### Port reference

| Service | Port | URL |
|---------|------|-----|
| Backend API | 8080 | http://localhost:8080 |
| Frontend | 4200 | http://localhost:4200 |
| H2 console | 8080 | http://localhost:8080/h2-console |
| Actuator | 8080 | http://localhost:8080/actuator/health |

---

## Docker Builds

Build context for both images is the **repo root**.

```bash
# Backend (Maven multi-stage → eclipse-temurin:17-jre-alpine)
docker build -f src/Dockerfile -t citidirect-backend .
docker run -p 8080:8080 citidirect-backend

# Frontend (Node 20 build → nginx:alpine, port 8080)
docker build -f client/Dockerfile -t citidirect-frontend .
docker run -p 8081:8080 citidirect-frontend
```

> **Angular 17 output path:** `ng build` emits browser assets to
> `dist/citidirect/browser/`. The frontend Dockerfile copies from that path
> into nginx's document root — do not change it to `dist/` or
> `dist/citidirect/` or nginx will serve its default welcome page.

---

## Tests

```bash
# Backend unit + integration tests
mvn test

# Frontend (runs vitest in CI-safe mode)
cd client && npm test
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SPRING_PROFILES_ACTIVE` | `default` | Set to `prod` in containers |
| `PORT` | `8080` | Listening port (Cloud Run compatible) |
| `DATABASE_URL` | H2 in-memory | Override with a JDBC URL for PostgreSQL |

Copy `.env.example` to `.env` for local overrides.
