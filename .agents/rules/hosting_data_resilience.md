# Rule: Hosting Flexibility & Strict Real Database Continuity Policy

## Overview
This system rule mandates multi-layer Real Data Continuity and Database Flexibility across all current and future hosting environment transitions (e.g., Railway $\leftrightarrow$ Vercel $\leftrightarrow$ Localhost $\leftrightarrow$ AWS $\leftrightarrow$ Render).

Fake or synthetic hardcoded mock data arrays are strictly forbidden. All student records, applications, scholarships, and system logs are 100% database-driven.

---

## Technical Directives

### 1. Unified Cloud PostgreSQL Connection
- Database connection configuration (`backend/config/db.js`) inspects standard environment variables (`DATABASE_PRIVATE_URL`, `DATABASE_URL_PRIVATE`, `DATABASE_URL`, `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `NEON_DATABASE_URL`).
- When deploying to Vercel, Railway, or Localhost, providing the database URL automatically links all host deployments to the shared persistent PostgreSQL database.

### 2. No Synthetic Fake Data Injections
- Frontend components and backend controllers MUST NOT return or hardcoded fake student lists or mock fallback arrays (`masterFallbackData.ts`).
- If no records exist in a table, the UI presents a clean, responsive empty state ("No student records found").
- Real registered students (from `users` table where role = 'student') and submitted `applications` are dynamically queried by backend controllers.

### 3. Governance Accounts & Security
- Primary governance credentials (`support.edu2026@gmail.com`, `treasury.edu2026@gmail.com`, `sr.edu2026@gmail.com`, `sv.edu2026@gmail.com`, `sysadmin.edu2026@gmail.com`, `student.edu2026@gmail.com`) with password `January10` and OTP `123456` operate 100% reliably in Localhost, Railway, and Vercel environments.
