# Facultative Reinsurance Web Client

React 18 + Vite + Tailwind CSS frontend for the Facultative Reinsurance Web Portal supporting Cyber & D&O placement intake and underwriter scoring queue workflows.

## Features

- **Carrier Submission Form (`/carrier/submit`)**: Multi-step risk specification intake for Cyber and D&O placements with limits, attachment points, loss history, and file uploads.
- **Carrier Submissions Dashboard (`/carrier/dashboard`)**: Centralized tracking table for carriers to monitor placements across lifecycle states (`SUBMITTED`, `UNDER_REVIEW`, `QUOTED`, `DECLINED`).
- **Underwriter Review Queue (`/underwriter/queue`)**: Workbench for underwriters to filter, search, sort by risk score, acquire concurrency locks, and open deep review console.
- **Underwriting Review & Decision Console (`/underwriter/submissions/:id`)**: Detailed risk score breakdown, missing document detector, and decision management console to issue binding quote terms or standardized decline notices.

## Setup & Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   # Ensure VITE_API_BASE_URL points to the backend (default: http://localhost:8000/api)
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

5. Run test suite:
   ```bash
   npm run test
   ```
