# Workspace Rules for EduScholar

## Strict No-Fake-Data & Database Continuity Policy
- Fake or dummy hardcoded data objects/fallback arrays MUST NEVER be hardcoded into frontend pages or backend fallback responses. All student registry records, applications, scholarships, and tickets MUST be 100% database-driven.
- The system MUST implement environment-flexible database connectivity (`DATABASE_URL`, `POSTGRES_URL`, `NEON_DATABASE_URL`, etc.) across all hosting platforms (Railway, Vercel, Localhost, Render, etc.).
- When hosting shifts (e.g. Railway to Vercel), the application connects seamlessly to the persistent cloud database so that all previously stored REAL student registrations, applications, and documents are immediately read on the new host without data loss.
- Official governance accounts (`support.edu2026@gmail.com`, `treasury.edu2026@gmail.com`, etc., with password `January10` and OTP `123456`) MUST always work across all hosting platforms.
