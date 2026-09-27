# Rule: Hosting & Data Resilience Policy

## Overview
This system rule mandates multi-layer Data Continuity and Resilience across all current and future hosting environment transitions (e.g., Railway $\leftrightarrow$ Vercel $\leftrightarrow$ Localhost $\leftrightarrow$ AWS $\leftrightarrow$ Render).

Whenever the EduScholar application changes host platforms or database providers, the system MUST immediately present and read full master student datasets without requiring manual database migration or leaving user views blank.

---

## Technical Directives

### 1. Dual-Layer Fallback Architecture
- **Backend Level**: Database controllers (`registryController.js`, `applicationController.js`, `scholarshipController.js`) must inspect table query results. If table query results return 0 rows or encounter connection/migration state differences, the controller MUST automatically trigger background auto-seeding of master default records (`DEFAULT_MASTER_SCHOLARS`) and return full master datasets immediately.
- **Frontend Level**: API callers and frontend view components MUST NOT render empty lists (`[]` / 0 scholars) when backend responses are empty or during deployment propagation. The frontend MUST seamlessly fall back to `DEFAULT_FALLBACK_SCHOLARS_RAW` (defined in `frontend/src/utils/masterFallbackData.ts`).

### 2. Cross-Hosting Provider Neutrality
- API endpoints MUST avoid hardcoding host-specific domains (e.g. `eduscholar.up.railway.app` or fixed Vercel deployment URLs) for data fetching. All requests must use relative `/api` paths or dynamic environment configuration (`import.meta.env.VITE_API_URL` / `process.env.PORT`).
- Proxy rewrites in `vercel.json`, `package.json`, or Express routing must route `/api/(.*)` dynamically to internal serverless or container handlers regardless of hosting platform.

### 3. Master Dataset Integrity & Demo Credentials
- Master Student Records (e.g. Maria Santos `2024-00192`, Juan Dela Cruz `2024-00841`, Angelica Reyes `2024-01205`, Christian Gonzales `2024-03412`, Beatrice Alonzo `2024-04981`, Mark Joseph Torres `2024-05120`) MUST remain accessible across all roles (Admin, Treasury, Student, Partner School).
- Official governance credentials (`support.edu2026@gmail.com`, `treasury.edu2026@gmail.com`, `qcu.edu67@gmail.com`, etc.) with OTP `123456` MUST operate 100% reliably in Localhost, Railway, and Vercel environments.
