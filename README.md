# Identity Service (SCRUM-498)

Customer Registration and Authentication Service built with Spring Boot 3, Spring Security, Spring Data JPA, and PostgreSQL.

## Backend (Java / Spring Boot)

### Prerequisites
- Java 21 (or Java 17+)
- Maven 3.9+

### Setup & Running Tests
```bash
# Run unit and integration tests
mvn clean test
```

### Starting the Backend Application
```bash
# Run with default profile (H2 in-memory DB fallback)
mvn spring-boot:run

# Or package and run the JAR
mvn clean package -DskipTests
java -jar target/identity-service-1.0.0.jar --server.port=8080
```

The API will be available at `http://localhost:8080`
Swagger UI / OpenAPI documentation: `http://localhost:8080/swagger-ui.html` or `/v3/api-docs`

## Full-Stack Local Development

To run both backend and frontend together locally:

### 1. Environment Setup
```bash
# Copy the example environment file
cp .env.example .env
```

### 2. Start the Backend (Terminal 1)
```bash
mvn spring-boot:run
```
Backend API: `http://localhost:8080` | Health Check: `http://localhost:8080/api/health`

### 3. Start the Frontend (Terminal 2)
```bash
cd client
npm install
npm run dev
```
Frontend: `http://localhost:5173`

The frontend connects to the backend API at `http://localhost:8080` (or `http://localhost:8000`) via the `VITE_API_BASE_URL` environment variable.

### 4. Test Credentials
The backend automatically seeds pre-configured, active test accounts on startup:
- **Regular Customer** — Email: `test@example.com`, Password: `testpassword`, Role: `ROLE_CUSTOMER`
- **System Admin** — Email: `admin@example.com`, Password: `adminpassword`, Role: `ROLE_ADMIN`
- **Compliance Officer** — Email: `compliance@example.com`, Password: `compliancepassword`, Role: `ROLE_COMPLIANCE_OFFICER`

### API Endpoints
- `POST /api/v1/auth/register` - Register a new customer account
- `POST /api/v1/auth/login` - Authenticate with email and password, returns JWT tokens
- `POST /api/v1/auth/refresh` - Refresh access token using a valid refresh token
- `GET /api/v1/auth/me` - Retrieve current user profile (requires `Authorization: Bearer <token>`)
- `GET /api/health` - Service health status
