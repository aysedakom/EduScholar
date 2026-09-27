# Workspace Rules for EduScholar

## Hosting & Data Resilience Policy
- The system MUST implement multi-layer Data Continuity across all hosting platforms (Railway, Vercel, Localhost, Render, etc.).
- The Student Registry, Applications, Scholarships, and Payroll modules must NEVER display empty tables (`[]` or 0 records) when hosting environments or database instances shift.
- Both backend controllers (`backend/controllers/registryController.js`) and frontend components (`frontend/src/utils/masterFallbackData.ts`) MUST automatically provide master default scholar datasets if database tables are empty or initializing.
- Standard governance demo accounts (`support.edu2026@gmail.com`, `treasury.edu2026@gmail.com`, etc., with password `January10` and OTP `123456`) MUST always work across all hosting platforms.
