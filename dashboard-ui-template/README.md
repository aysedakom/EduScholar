# Modern Dashboard UI Template

A clean, standalone React + Vite + Tailwind CSS dashboard UI template cloned from GovServe / EduScholar.

## Features
- **5-in-1 Role-Based Views**: Student, Admin, System Admin, Supervisor, School Coordinator, and Treasury views built-in.
- **Role Switcher**: Real-time dropdown selector in the top bar to preview any dashboard view instantly.
- **Light & Dark Mode**: Built-in 1-click theme switcher with full dark mode variables.
- **Responsive Navigation**: Desktop sidebar + mobile slide-over drawer with touch support.
- **Reusable UI Components**:
  - `Card`, `CardHeader`, `CardTitle`, `CardContent`
  - `Badge` (primary, success, warning, destructive, outline)
  - `Button` (primary, secondary, outline, ghost, destructive)
  - `DashboardHeroBanner` (ambient glow, role-specific titles, live date)
  - `ApplicationProgressTracker` (step-by-step qualification pipeline)

---

## Quick Start (How to Run Locally)

1. Make sure you have **Node.js** installed (v18 or higher recommended).
2. Open your terminal in this directory:
   ```bash
   cd dashboard-ui-template
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start development server:
   ```bash
   npm run dev
   ```
5. Open your browser at `http://localhost:3000`.

---

## Project Structure
```
dashboard-ui-template/
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   └── DashboardHeroBanner.tsx
│   │   ├── layout/
│   │   │   ├── AppHeader.tsx
│   │   │   ├── AppLayout.tsx
│   │   │   └── AppSidebar.tsx
│   │   ├── student/
│   │   │   └── ApplicationProgressTracker.tsx
│   │   └── ui/
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       └── Card.tsx
│   ├── pages/
│   │   └── DashboardPage.tsx
│   ├── utils/
│   │   └── cn.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## How to Customize
- **Change Brand / Colors**: Open `src/index.css` and adjust `--primary`, `--background`, and Tailwind tokens.
- **Add New Pages / Widgets**: Check `src/pages/DashboardPage.tsx` and duplicate cards or grid sections.
