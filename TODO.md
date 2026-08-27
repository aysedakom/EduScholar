# School Aid CLI Implementation

The School Aid CLI script has been implemented and moved to: `backend/src/cli/schoolAid.ts`
The backend has been configured with TypeScript to run these commands.

/*
Usage Examples:

1. Populate eligible students:
   npx tsx src/cli/schoolAid.ts populate-eligibles --program "Scholarship2026"

2. Allocate funds:
   npx tsx src/cli/schoolAid.ts allocate-funds --program "Scholarship2026" --budget 50000

3. Distribute aid and send notifications:
   npx tsx src/cli/schoolAid.ts distribute --program "Scholarship2026"

4. Generate aid report:
   npx tsx src/cli/schoolAid.ts report --program "Scholarship2026"
*/

/* Notes:
- Backend modules (studentRegistry, aidManager, notificationSystem) should implement proper DB interaction (PostgreSQL, MongoDB, etc.) and business logic.
- Frontend React (Vite + Tailwind CSS) can consume REST/GraphQL APIs to visualize students, fund allocation, and reports.
- Tailwind CSS provides responsive UI styling.
- Typescript ensures type safety across modules.
*/