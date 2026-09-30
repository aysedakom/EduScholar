# 📘 EduScholar — Bursary & Work-Study Implementation Plan

## Thesis Title
> **"Design and Implementation of Campus Aid Hub: A Unified Scholarship, Bursary and Work-Study Opportunity Portal for Diverse Student Populations"**

---

## 1. System Overview — The Unified Campus Aid Hub

The EduScholar portal unifies **three distinct financial aid programs** under one governance platform. Each program serves a different student need but shares the same infrastructure.

```mermaid
graph TB
    subgraph EDUSCHOLAR["🏫 EduScholar Campus Aid Hub"]
        direction TB
        subgraph S["🎓 Scholarship Module"]
            S1["Merit-Based Grants"]
            S2["GWA Eligibility Check"]
            S3["Fixed Stipend Disbursement"]
        end
        subgraph B["💰 Bursary Module"]
            B1["Need-Based Financial Aid"]
            B2["Income Tier Classification"]
            B3["Flexible Grant by Tier"]
        end
        subgraph W["💼 Work-Study Module"]
            W1["Campus Job Postings"]
            W2["Student Hour Logging"]
            W3["Payroll Computation"]
        end
    end

    STUDENT["👤 Student"] --> EDUSCHOLAR
    ADMIN["🛡️ Admin / Support"] --> EDUSCHOLAR
    COORD["🏛️ School Coordinator"] --> EDUSCHOLAR
    TREASURY["💳 Treasury Officer"] --> EDUSCHOLAR
    SUPERVISOR["👔 Supervisor"] --> W
```

---

## 2. How the Three Programs Compare

| Feature | 🎓 Scholarship | 💰 Bursary | 💼 Work-Study |
|---|---|---|---|
| **Basis** | Academic merit (GWA) | Financial need (family income) | Earning through campus work |
| **Eligibility** | GWA ≥ 1.75 | Household income ≤ ₱250,000/yr | Enrolled ≥ 15 units + available schedule |
| **Key Documents** | Grade sheets, Good Moral | Certificate of Indigency, ITR | Class schedule, Enrollment cert |
| **Who Reviews** | School Coordinator | Treasury Officer | Admin + Supervisor |
| **Payout Model** | Fixed amount per semester | Tiered amount by income bracket | Hourly rate × hours worked |
| **Example Amount** | ₱25,000 / Sem | ₱8,000–₱20,000 / Sem (by tier) | ₱120/hr × 60 hrs = ₱7,200/mo |
| **Already Built?** | ✅ Yes | 🟡 90% reusable | 🟡 70% reusable + new features |

---

## 3. Unified Application Flow — All Three Programs

This is the key insight: **all three programs share the same core application pipeline**. Work-Study just adds extra steps after approval.

```mermaid
flowchart TD
    A["👤 Student Opens Portal"] --> B{"Selects Aid Program Type"}
    
    B -->|Scholarship| C1["📝 Apply for Scholarship"]
    B -->|Bursary| C2["📝 Apply for Bursary"]
    B -->|Work-Study| C3["📝 Apply for Campus Job"]
    
    C1 --> D["📎 Upload Required Documents"]
    C2 --> D
    C3 --> D
    
    D --> E["⏳ Application Status: Pending"]
    
    E --> F{"Governance Review"}
    
    F -->|Scholarship| G1["🏛️ School Coordinator verifies GWA"]
    F -->|Bursary| G2["💳 Treasury verifies income tier"]
    F -->|Work-Study| G3["🛡️ Admin checks schedule + eligibility"]
    
    G1 --> H{"Decision"}
    G2 --> H
    G3 --> H
    
    H -->|Rejected| I["❌ Rejected with Reason"]
    H -->|Approved| J{"Program Type?"}
    
    J -->|Scholarship or Bursary| K["💵 Direct Disbursement to Student"]
    J -->|Work-Study| L["💼 Student Starts Working"]
    
    L --> M["⏱️ Supervisor Logs Hours Weekly"]
    M --> N["📊 Monthly Hours Computation"]
    N --> O["💵 Payroll Disbursement"]
    
    I --> P["🔔 Student Notified"]
    K --> P
    O --> P

    style A fill:#e0f2fe,stroke:#0284c7
    style K fill:#d1fae5,stroke:#059669
    style O fill:#d1fae5,stroke:#059669
    style I fill:#fee2e2,stroke:#dc2626
```

> [!IMPORTANT]
> Notice how steps A → D → E → F → H are **identical** for all three programs. The only difference is **who reviews** and **what happens after approval**.

---

## 4. Bursary Module — Detailed Breakdown

### 4.1 What Makes Bursary Different from Scholarship?

Think of it this way:
- **Scholarship** asks: *"How smart are you?"* (checks GWA)
- **Bursary** asks: *"How much does your family earn?"* (checks income)

The **application form is the same**. The **review criteria is different**.

### 4.2 Income Tier Classification System

Students are classified into income tiers based on their family's **Annual Household Income**. Each tier receives a different grant amount:

```mermaid
graph LR
    subgraph TIER_SYSTEM["💰 Bursary Income Tier Classification"]
        direction TB
        T1["🔴 TIER 1 — Indigent\n₱0 – ₱100,000 annual\nGrant: ₱20,000 / Sem"]
        T2["🟠 TIER 2 — Low Income\n₱100,001 – ₱180,000 annual\nGrant: ₱15,000 / Sem"]
        T3["🟡 TIER 3 — Lower Middle\n₱180,001 – ₱250,000 annual\nGrant: ₱10,000 / Sem"]
        T4["⚪ TIER 4 — Above Threshold\n₱250,001 and above\nGrant: ❌ Not Eligible"]
    end

    T1 --- T2 --- T3 --- T4

    style T1 fill:#fef2f2,stroke:#dc2626
    style T2 fill:#fff7ed,stroke:#ea580c
    style T3 fill:#fefce8,stroke:#ca8a04
    style T4 fill:#f8fafc,stroke:#94a3b8
```

### 4.3 Bursary Document Requirements

| Document | Purpose | Who Verifies |
|---|---|---|
| Certificate of Indigency | Proves low-income status from barangay | Treasury Officer |
| Latest ITR (Income Tax Return) | Shows actual family annual income | Treasury Officer |
| Proof of Residency (Barangay ID) | Confirms QC residency | School Coordinator |
| Student Enrollment Certificate | Confirms active enrollment | System (auto-check) |

### 4.4 How Treasury Reviews a Bursary Application

```mermaid
flowchart TD
    A["📋 Treasury Opens Bursary Application"] --> B["📎 Reviews Uploaded Documents"]
    B --> C{"Certificate of Indigency present?"}
    
    C -->|No| D["❌ Reject: Missing Indigency Certificate"]
    C -->|Yes| E{"ITR / Income Proof present?"}
    
    E -->|No| F["❌ Reject: Missing Income Documentation"]
    E -->|Yes| G["📊 Check Annual Household Income"]
    
    G --> H{"Income Amount?"}
    
    H -->|"₱0 – ₱100K"| I1["Assign TIER 1 → ₱20,000 Grant"]
    H -->|"₱100K – ₱180K"| I2["Assign TIER 2 → ₱15,000 Grant"]
    H -->|"₱180K – ₱250K"| I3["Assign TIER 3 → ₱10,000 Grant"]
    H -->|"Above ₱250K"| I4["❌ Reject: Income above threshold"]
    
    I1 --> J["✅ Approve & Queue for Disbursement"]
    I2 --> J
    I3 --> J
    
    J --> K["🔔 Notify Student of Approval + Tier + Amount"]

    style I1 fill:#dcfce7,stroke:#16a34a
    style I2 fill:#dcfce7,stroke:#16a34a
    style I3 fill:#dcfce7,stroke:#16a34a
    style I4 fill:#fee2e2,stroke:#dc2626
    style D fill:#fee2e2,stroke:#dc2626
    style F fill:#fee2e2,stroke:#dc2626
```

### 4.5 Bursary Student Dashboard View (UI Concept)

What the student would see on their dashboard after applying for a bursary:

```
┌──────────────────────────────────────────────────────────────┐
│  💰 Bursary Application — QCU Need-Based Financial Aid 2026 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Program Code:   QCU-BUR-2026                                │
│  Applied On:     Sep 28, 2026                                │
│  Status:         ✅ APPROVED — Tier 2                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐      │
│  │  Income Classification:  Tier 2 (Low Income)       │      │
│  │  Annual Household Income: ₱142,000                 │      │
│  │  Grant Amount Awarded:   ₱15,000 / Semester        │      │
│  └────────────────────────────────────────────────────┘      │
│                                                              │
│  Documents Status:                                           │
│   ✅ Certificate of Indigency     — Verified                 │
│   ✅ Income Tax Return (ITR)      — Verified                 │
│   ✅ Barangay Residency ID        — Verified                 │
│   ✅ Enrollment Certificate       — Auto-verified            │
│                                                              │
│  Progress: ████████████████████████████████████████ 100%     │
│                                                              │
│  Disbursement: Queued for Oct 15, 2026 payout cycle          │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Work-Study Module — Detailed Breakdown

### 5.1 What Makes Work-Study Unique?

Unlike scholarships and bursaries (where you apply and receive money), work-study has an **ongoing cycle**:

1. Student **applies** for a campus job
2. Gets **approved/hired**
3. **Works** on campus (library, lab, admin office)
4. Supervisor **logs their hours** each week
5. At end of month, system **calculates pay**
6. Treasury **disburses** the payroll

### 5.2 Work-Study Complete Lifecycle

```mermaid
flowchart TD
    subgraph PHASE1["📋 Phase 1: Job Posting & Application"]
        A1["Admin creates campus job posting"] --> A2["Students browse available positions"]
        A2 --> A3["Student applies + uploads class schedule"]
        A3 --> A4["Admin reviews for schedule conflicts"]
        A4 --> A5{"Approved?"}
        A5 -->|No| A6["❌ Not Hired"]
        A5 -->|Yes| A7["✅ Student Hired — assigned to position"]
    end

    subgraph PHASE2["⏱️ Phase 2: Active Work Period"]
        B1["Student reports to work per schedule"] --> B2["Supervisor logs daily hours"]
        B2 --> B3["Hours appear in student's portal"]
        B3 --> B4["Weekly summary auto-generated"]
        B4 --> B1
    end

    subgraph PHASE3["💵 Phase 3: Monthly Payroll"]
        C1["System computes: Total Hours × Rate"] --> C2["Supervisor reviews & approves monthly total"]
        C2 --> C3["Treasury processes payroll disbursement"]
        C3 --> C4["🔔 Student notified: ₱X,XXX deposited"]
    end

    A7 --> B1
    B4 -->|End of Month| C1

    style A7 fill:#dcfce7,stroke:#16a34a
    style A6 fill:#fee2e2,stroke:#dc2626
    style C4 fill:#dcfce7,stroke:#16a34a
```

### 5.3 Campus Job Posting — What It Looks Like

When an admin creates a work-study position:

```
┌──────────────────────────────────────────────────────────────┐
│  💼 Campus Job Posting                                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Position:        Library Student Assistant                  │
│  Department:      University Main Library                    │
│  Job Code:        WS-LIB-2026-001                            │
│  Supervisor:      Ms. Rosario Mercado (Librarian III)        │
│                                                              │
│  ┌──────────────────────────────────────────────┐            │
│  │  💰 Rate:       ₱120 / hour                  │            │
│  │  ⏰ Hours:      12–20 hrs/week               │            │
│  │  📅 Schedule:   Mon-Wed-Fri, 1:00–5:00 PM    │            │
│  │  👥 Slots:      3 positions available         │            │
│  │  📆 Duration:   Sep 2026 – Jan 2027 (1 Sem)  │            │
│  └──────────────────────────────────────────────┘            │
│                                                              │
│  Duties:                                                     │
│   • Assist students in book returns and shelving             │
│   • Maintain library catalog and digital records             │
│   • Monitor reading area during assigned shifts              │
│                                                              │
│  Requirements:                                               │
│   ✦ Enrolled at least 15 units                               │
│   ✦ No class conflict with work schedule                     │
│   ✦ Good academic standing (no failing grades)               │
│                                                              │
│              ┌─────────────────────┐                         │
│              │   📝 Apply for Job  │                         │
│              └─────────────────────┘                         │
└──────────────────────────────────────────────────────────────┘
```

### 5.4 Work-Study Hours Logging — The Supervisor View

This is the **key new feature** that doesn't exist in scholarships or bursaries. Here's exactly what it would look like:

```
┌──────────────────────────────────────────────────────────────┐
│  ⏱️ Work-Study Hours Log — September 2026                    │
│  Supervisor: Ms. Rosario Mercado | Library Department        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Student: Juan Dela Cruz (2026-10492)                        │
│  Position: Library Assistant | Rate: ₱120/hr                 │
│                                                              │
│  ┌──────────┬──────────┬──────────┬───────┬─────────┐       │
│  │   Date   │ Time In  │ Time Out │ Hours │ Status  │       │
│  ├──────────┼──────────┼──────────┼───────┼─────────┤       │
│  │ Sep 23   │ 1:00 PM  │ 5:00 PM  │  4.0  │ ✅ Apvd │       │
│  │ Sep 25   │ 1:00 PM  │ 5:00 PM  │  4.0  │ ✅ Apvd │       │
│  │ Sep 27   │ 1:00 PM  │ 4:30 PM  │  3.5  │ ✅ Apvd │       │
│  │ Sep 29   │ 1:00 PM  │ 5:00 PM  │  4.0  │ ⏳ Pend │       │
│  │ Sep 30   │  — —     │  — —     │  — —  │ 📝 Log  │       │
│  └──────────┴──────────┴──────────┴───────┴─────────┘       │
│                                                              │
│  ┌──────────────────────────────────────────────┐            │
│  │  📊 September Summary                        │            │
│  │                                               │            │
│  │  Total Hours Logged:     55.5 hrs             │            │
│  │  Hours Approved:         51.5 hrs             │            │
│  │  Hours Pending:           4.0 hrs             │            │
│  │                                               │            │
│  │  💰 Estimated Payout:    ₱6,180               │            │
│  │     (51.5 approved hrs × ₱120/hr)             │            │
│  └──────────────────────────────────────────────┘            │
│                                                              │
│  [ ✅ Approve All Pending ]  [ 📤 Submit to Treasury ]       │
└──────────────────────────────────────────────────────────────┘
```

### 5.5 Work-Study Student View — Monthly Earnings

What the **student** sees on their dashboard:

```
┌──────────────────────────────────────────────────────────────┐
│  💼 My Work-Study — Library Assistant                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Position:     Library Student Assistant                     │
│  Supervisor:   Ms. Rosario Mercado                           │
│  Status:       🟢 Currently Active                           │
│                                                              │
│  ┌──────────────────────────────────────────────┐            │
│  │   This Month (September 2026)                 │            │
│  │                                               │            │
│  │   Hours Worked:   55.5 hrs                    │            │
│  │   Hours Approved: 51.5 hrs                    │            │
│  │   Hourly Rate:    ₱120                        │            │
│  │   ─────────────────────────────               │            │
│  │   💰 Estimated Pay: ₱6,180                    │            │
│  │   📅 Payout Date:   Oct 5, 2026               │            │
│  └──────────────────────────────────────────────┘            │
│                                                              │
│  📈 Earnings History:                                        │
│  ┌─────────────┬────────┬──────────┬───────────┐            │
│  │    Month    │ Hours  │  Amount  │  Status   │            │
│  ├─────────────┼────────┼──────────┼───────────┤            │
│  │ August 2026 │ 60 hrs │ ₱7,200   │ ✅ Paid   │            │
│  │ July 2026   │ 48 hrs │ ₱5,760   │ ✅ Paid   │            │
│  └─────────────┴────────┴──────────┴───────────┘            │
│                                                              │
│  Total Earned This Semester: ₱19,140                         │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. Database Design — What Tables You Need

### 6.1 Current Tables (Already Exist)

These tables already power your scholarship module and will be **reused**:

```mermaid
erDiagram
    users {
        int id PK
        string name
        string email
        string role
        string student_id
        string department
        string major
    }
    
    scholarships {
        int id PK
        string code
        string title
        string category
        string program_type
        decimal amount
        date deadline
        int slots
    }
    
    applications {
        int id PK
        int user_id FK
        int scholarship_id FK
        string status
        jsonb documents
        timestamp applied_at
    }

    users ||--o{ applications : submits
    scholarships ||--o{ applications : receives
```

### 6.2 New Tables Needed

Only **3 new tables** for the complete work-study module:

```mermaid
erDiagram
    work_study_positions {
        int id PK
        string job_code
        string title
        string department
        int supervisor_id FK
        decimal hourly_rate
        int max_hours_week
        int total_slots
        int filled_slots
        string schedule_description
        string duties
        string status
        date start_date
        date end_date
    }

    work_study_assignments {
        int id PK
        int position_id FK
        int student_id FK
        string status
        date assigned_date
        date end_date
    }

    work_study_hours {
        int id PK
        int assignment_id FK
        date work_date
        time time_in
        time time_out
        decimal hours_worked
        string approval_status
        int approved_by FK
        text notes
    }

    work_study_positions ||--o{ work_study_assignments : "hires into"
    work_study_assignments ||--o{ work_study_hours : "logs hours for"
    users ||--o{ work_study_assignments : "assigned as student"
    users ||--o{ work_study_positions : "supervises"
```

### 6.3 Bursary — No New Tables Needed!

For bursary, you just add **2 columns** to your existing `applications` table:

| New Column | Type | Purpose |
|---|---|---|
| `income_tier` | `varchar` | `'Tier 1'`, `'Tier 2'`, `'Tier 3'` or `null` |
| `annual_household_income` | `decimal` | The verified family income amount |

And add `'bursary'` as a valid option in your `scholarships.program_type` column.

**That's it.** No new tables for bursary.

---

## 7. Role Responsibilities Across All Three Programs

```mermaid
graph TB
    subgraph STUDENT["👤 Student"]
        S1["Browse all 3 program types"]
        S2["Apply + upload documents"]
        S3["Track application status"]
        S4["View work-study schedule & hours"]
        S5["Check earnings & disbursement history"]
    end

    subgraph ADMIN["🛡️ Admin / Support Officer"]
        A1["Create scholarship & bursary programs"]
        A2["Create work-study job postings"]
        A3["Review & approve applications"]
        A4["Handle support tickets"]
    end

    subgraph COORDINATOR["🏛️ School Coordinator"]
        C1["Verify GWA for scholarships"]
        C2["Verify residency for bursaries"]
        C3["Check schedule conflicts for work-study"]
    end

    subgraph TREASURY["💳 Treasury Officer"]
        T1["Verify income for bursary tier assignment"]
        T2["Process scholarship disbursements"]
        T3["Process bursary disbursements"]
        T4["Process work-study monthly payroll"]
    end

    subgraph SUPERVISOR["👔 Supervisor"]
        V1["Log student work hours daily/weekly"]
        V2["Approve monthly hour summaries"]
        V3["Evaluate student work performance"]
    end

    style SUPERVISOR fill:#fef3c7,stroke:#d97706
```

> [!NOTE]
> The **Supervisor** role is the only truly new governance actor, and it already exists in your database schema (`role = 'supervisor'`). They are department heads or office managers who oversee work-study students (e.g., the Head Librarian, Lab Director, etc.).

---

## 8. Implementation Phases & Timeline

### Phase 1: Bursary Module (Week 1–2)
> **Effort: Low** — 90% code reuse from scholarships

| Task | Days | Details |
|---|---|---|
| Add `program_type` column to scholarships table | 0.5 | `'scholarship'`, `'bursary'`, `'work_study'` |
| Add `income_tier` + `annual_household_income` to applications | 0.5 | New columns for bursary classification |
| Create bursary program listings in admin panel | 1 | Reuse scholarship creation form with bursary fields |
| Build Bursary browse page for students | 1 | Reuse `ScholarshipsPage.tsx` layout with "Bursary" filter |
| Build bursary application form | 1 | Reuse scholarship apply form, change document checklist |
| Add income tier assignment in Treasury review | 1 | Dropdown: Tier 1/2/3 based on submitted ITR |
| Update dashboard to show bursary applications | 1 | Add "Bursary" tab alongside scholarships |
| **Testing & Polish** | 2 | End-to-end flow testing |
| **Total** | **~8 days** | |

### Phase 2: Work-Study Module (Week 3–5)
> **Effort: Medium** — 70% reuse + new hours logging features

| Task | Days | Details |
|---|---|---|
| Create 3 new database tables | 1 | `work_study_positions`, `assignments`, `hours` |
| Build Work-Study job postings page (student view) | 2 | Card layout with position details, rate, schedule |
| Build Work-Study application flow | 1 | Reuse scholarship apply form + class schedule upload |
| Build Admin: Create/manage job postings | 2 | Form: title, department, rate, hours, slots, supervisor |
| Build Supervisor: Hours logging dashboard | 3 | Time-in/time-out entries, weekly view, approve buttons |
| Build Student: My work-study hours view | 2 | View logged hours, monthly summary, earnings history |
| Build Treasury: Monthly payroll computation | 2 | Auto-calculate: approved hours × rate = payout |
| Notification integration | 1 | Shift reminders, approval notices, payout alerts |
| **Testing & Polish** | 3 | Full lifecycle testing with all roles |
| **Total** | **~17 days** | |

### Phase 3: Integration & Unified Dashboard (Week 6)
> **Effort: Low** — Connecting everything together

| Task | Days | Details |
|---|---|---|
| Unified "My Aid Programs" student dashboard | 2 | Shows all 3 types in one view |
| Combined admin analytics | 1 | Total disbursements across all programs |
| Final QA & demo preparation | 2 | Governance account testing, edge cases |
| **Total** | **~5 days** | |

---

## 9. Summary: Total Effort Breakdown

```mermaid
pie title Development Effort Distribution
    "Bursary Module (reuse existing)" : 8
    "Work-Study Module (new features)" : 17
    "Integration & Polish" : 5
```

| Module | Effort | New Code | Reused Code |
|---|---|---|---|
| 💰 Bursary | ~8 days | ~10% | ~90% |
| 💼 Work-Study | ~17 days | ~30% | ~70% |
| 🔗 Integration | ~5 days | ~20% | ~80% |
| **TOTAL** | **~30 days (6 weeks)** | | |

> [!TIP]
> The **Bursary module is your quick win** — it can be demo-ready in 1–2 weeks since it reuses almost everything from scholarships. Start there to show immediate progress, then build Work-Study.
