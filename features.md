# Project Features

## SCRUM-476 - Implement CitiDirect Cash Statement Reports: Account Statement – Comprehensive (Brownfield Remediation)

### Feature Summary
As a developer working on the CitiDirect Account Statement – Comprehensive application, I need to remediate the existing functional prototype in the current repository so that the application meets security, functional, and operational standards, preserving its architecture, conventions, and working behavior.

### Key Features
- Secure password verification removing shared-password authentication and backdoor profiles
- Strict account entitlement authorization scoped to authenticated user identity
- Frontend-backend API contract alignment for execution, save, and export endpoints
- Dynamic timezone-aware date criteria and authoritative statement period balance calculations
- Persistent recurring scheduling with saved criteria and transparent delivery error propagation
- Verified export column layouts, XLSX format consistency, and total calculations across PDF, Excel, CSV, DHTML, and RTF
- Integration status transparency distinguishing live data from local prototype sources
- Local deployment port reconciliation (Spring Boot on 8080, Nginx on 80) and database setup documentation
