# Project Features

## SCRUM-1 - Brownfield Library Management System — Core Operations & Advanced Digital Extensions

### Feature Summary
# User Story: Brownfield Library Management System — Core Operations & Advanced Digital Extensions

**Objective:**
Provide a comprehensive, full-stack library management system that automates physical book cataloging, member borrowing workflows, and overdue fine handling.
Enable librarians and members to manage digital reservations, automated fine calculations, and real-time inventory tracking with secure role-based access control.

**Key Features:**
- Physical & Digital Book Catalog Management (CRUD operations with ISBN lookup)
- Member Account & Role-Based Access Control (Admin, Librarian, Member roles via JWT)
- Circulation Workflow: Checkout, Renewals, Returns, and Overdue Tracking
- Automated Fine Processing & Reservation Queue System
- Real-time Dashboard Analytics for Inventory & Active Loans

**Description:**
As a Library Administrator and Library Member,
I want a centralized, full-stack Library Management System with automated circulation, reservation queues, and fine tracking,
So that administrative overhead is reduced, book availability is maximized, and members enjoy a seamless borrowing experience.

----

### **Acceptance Criteria:**

- **EXISTING Core Book Cataloging & Inventory Management:**
  - **Explanation:** The system maintains a searchable catalog of physical books including Title, Author, ISBN, Publisher, Genre, Publication Year, Total Copies, and Available Copies. Librarians can add, edit, view, and soft-delete book records.
  - **Example:** A librarian adds "The Pragmatic Programmer" with ISBN `978-0135957059` and 5 copies. The catalog reflects 5 available copies in real time.
  - **Edge Cases:** Attempting to delete a book with active loans is blocked with HTTP 400 (`{"detail": "Cannot delete book with active loans"}`).

- **EXISTING Member Registration & Authentication:**
  - **Explanation:** The system provides user registration, login, and profile management with Role-Based Access Control (Admin, Librarian, Member) secured via JWT tokens.
  - **Example:** A new user registers as a Member and logs in. Upon successful authentication, a JWT token containing `sub`, `role`, and expiration timestamp is returned.
  - **Edge Cases:** Unauthenticated requests to protected endpoints return HTTP 401 Unauthorized; unauthorized roles attempting admin operations return HTTP 403 Forbidden.

- **EXISTING Basic Book Checkout & Return Workflow:**
  - **Explanation:** Members can borrow up to 5 available books simultaneously for a standard loan period of 14 days. Returning a book increments available inventory and closes the loan record.
  - **Example:** A member borrows "Clean Code". The system records `checkout_date` as current timestamp, `due_date` as +14 days, and decreases available copies from 3 to 2.
  - **Edge Cases:** If `available_copies` is 0, checkout is denied with HTTP 400 (`{"detail": "Book unavailable for checkout"}`).

- **NEW Automated Fine Calculation & Overdue Processing:**
  - **Explanation:** The system automatically calculates daily overdue fines of $0.50 per day per book for loans returned past `due_date`, capping maximum fine per loan at $25.00. Members with outstanding unpaid fines exceeding $10.00 are blocked from new checkouts.
  - **Example:** A book due on Day 1 is returned on Day 5 (4 days overdue). The system records an overdue fine of $2.00 ($0.50 × 4 days).
  - **Edge Cases:** Fines accrue only up to the $25.00 cap even if returned 60 days late. Partial fine payments are logged and update the remaining balance.

- **NEW Reservation Queue & Waitlist System:**
  - **Explanation:** When all physical copies of a book are checked out, members can place a hold (reservation). When a borrowed copy is returned, the system automatically assigns the returned copy to the next member in the reservation queue and notifies them.
  - **Example:** Member A reserves a book with 0 available copies (Queue Position #1). When Member B returns a copy, Member A's reservation status changes to `READY_FOR_PICKUP` with a 3-day hold window.
  - **Edge Cases:** If Member A does not collect the book within 3 days (72 hours), the hold expires and automatically transfers to Queue Position #2.

- **MODIFIED Full-Stack Responsive UI & Circulation Dashboard:**
  - **Explanation:** *(Upgraded from basic list view)* A responsive React 18 / Tailwind CSS frontend providing distinct role-tailored dashboards for Members (Catalog Search, My Loans, Reservations, Fine Payment) and Librarians (Circulation Desk, Overdue Reports, Inventory Management).
  - **Example:** Librarians view an interactive dashboard showing total active loans, overdue items, pending queue reservations, and total collected fines.
  - **Edge Cases:** Temporary network disconnects trigger non-intrusive toast notifications with retry logic without wiping form entries.

----

### **Technical Requirements:**

- **Constitution Compliance:** Aligned with Project Constitution Version `1.0.0`.
- **Backend Stack:** Python 3.11, FastAPI (`/api/v1/...`), SQLAlchemy 2.x, PostgreSQL (production) / SQLite in-memory (tests), pytest.
- **Frontend Stack:** React 18, Vite, Tailwind CSS, Axios, Lucide React icons, React Router DOM.
- **Database Schema Entities:**
  - `users` (id UUID, email, password_hash, role, is_active, created_at, updated_at)
  - `books` (id UUID, title, author, isbn, publisher, genre, total_copies, available_copies, created_at, updated_at)
  - `loans` (id UUID, user_id, book_id, checkout_date, due_date, return_date, status, created_at)
  - `fines` (id UUID, loan_id, user_id, amount, paid_amount, status, created_at)
  - `reservations` (id UUID, user_id, book_id, queue_position, status, reserved_at)
- **API Endpoints:**
  - Authentication: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`
  - Books Catalog: `GET /api/v1/books`, `POST /api/v1/books`, `GET /api/v1/books/{id}`, `PUT /api/v1/books/{id}`, `DELETE /api/v1/books/{id}`
  - Circulation: `POST /api/v1/loans/checkout`, `POST /api/v1/loans/return`, `GET /api/v1/loans/my-loans`
  - Reservations: `POST /api/v1/reservations`, `DELETE /api/v1/reservations/{id}`
  - Fines: `GET /api/v1/fines/my-fines`, `POST /api/v1/fines/pay`
- **Security & Standards:**
  - CORS Middleware enabled for `http://localhost:5173` and `http://localhost:3000`.
  - Passwords hashed using bcrypt; JWT authorization via `Authorization: Bearer <token>`.
  - Standardized error payload schema `{"detail": "<error_message>"}`.

### Key Features
- Physical & Digital Book Catalog Management (CRUD operations with ISBN lookup)
- Member Account & Role-Based Access Control (Admin, Librarian, Member roles via JWT)
- Circulation Workflow: Checkout, Renewals, Returns, and Overdue Tracking
- Automated Fine Processing & Reservation Queue System
- Real-time Dashboard Analytics for Inventory & Active Loans
