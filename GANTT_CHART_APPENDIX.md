# Appendix B.4: Gantt Chart and Project Timeline

> **Manuscript Section:** Appendix B — Project Management Artifacts  
> **Subsection:** B.4 Gantt Chart or Project Timeline  
> **Target Date of Pre-Oral Defense:** September 19, 2026  
> **Development Framework:** Adapted Agile Scrum (2-Week Iterations)

---

## 1. Visual Gantt Chart (Mermaid Diagram)

```mermaid
gantt
    title Campus Aid Hub (EduScholar) Development Lifecycle & Milestone Timeline
    dateFormat  YYYY-MM-DD
    axisFormat  %b %d

    section Inception & Research
    Project Charter & QC LGU Consultation     :done, m1, 2026-06-01, 2026-06-12
    Problem Formulation & Legal RA 10173 Scope :done, m2, 2026-06-10, 2026-06-20

    section System Architecture
    Database ERD & PostgreSQL Schema Design    :done, a1, 2026-06-21, 2026-06-30
    Traefik API Gateway & Vite Scaffolding     :done, a2, 2026-06-28, 2026-07-05

    section Sprint Cycles
    Sprint 1: Student Portal & Whitelist Logic :done, s1, 2026-07-06, 2026-07-19
    Sprint 2: Coordinator 72hr Token Sync     :done, s2, 2026-07-20, 2026-08-02
    Sprint 3: Admin Queue & Audit Trails       :done, s3, 2026-08-03, 2026-08-16
    Sprint 4: Treasury Two-Person Disbursement :done, s4, 2026-08-17, 2026-08-30
    Sprint 5: Work-Study & QC Interop Mesh     :done, s5, 2026-08-28, 2026-09-08

    section QA & Evaluation
    ISO/IEC 25010 Software Quality Testing     :done, q1, 2026-09-05, 2026-09-12
    User Acceptance Testing (UAT Sign-off)     :done, q2, 2026-09-10, 2026-09-15

    section Final Milestones
    Railway Cloud Production Deployment        :done, d1, 2026-09-15, 2026-09-18
    Pre-Oral Defense Presentation              :crit, active, d2, 2026-09-19, 1d
```

---

## 2. Master Project Timeline Table (Word / Manuscript Format)

| Phase / Sprint | Deliverables & Work Breakdown | Duration | Start Date | End Date | Accountable Team Members | Deliverable Status |
| :--- | :--- | :---: | :---: | :---: | :--- | :---: |
| **Phase 1: Project Inception & Research** | Formulation of problem statement, consultation with QCYDO and QC ITDD, formulation of un-prechecked Data Privacy Consent (RA 10173). | 3 Weeks | June 01, 2026 | June 20, 2026 | Pia Marie Faner (Lead), Ferdinand Emil Alair | **Completed** |
| **Phase 2: Architectural Design** | Entity-Relationship Diagram (ERD), PostgreSQL 16 schema modeling, REST API endpoints specification, Traefik reverse proxy configuration. | 2 Weeks | June 21, 2026 | July 05, 2026 | Rojid S. Mendoza (DBA), Pia Marie Faner | **Completed** |
| **Sprint 1: Student Application Module** | Interactive applicant form, upload validation, school whitelist (BCP, QCU, St. Claire), and automated Brevo email confirmation. | 2 Weeks | July 06, 2026 | July 19, 2026 | Pia Marie Faner, Ar-Jay Tabangin (UI/UX) | **Completed** |
| **Sprint 2: School Coordinator Sync** | 72-hour cryptographic token URLs (`/verify-school/:token`), candidate GWA inspection, coordinator verdict controls (Approve/Reject). | 2 Weeks | July 20, 2026 | Aug 02, 2026 | John Steaven Balansag (Security), Rojid Mendoza | **Completed** |
| **Sprint 3: Admin Review & Compliance** | Central evaluation queue, Segregation of Duties (mandatory override written rationale), immutable audit logging, sitewide legal routes. | 2 Weeks | Aug 03, 2026 | Aug 16, 2026 | Ferdinand Emil Alair (QA), Pia Marie Faner | **Completed** |
| **Sprint 4: Treasury Disbursement Module** | Model A milestone state machine (`PENDING` $\rightarrow$ `RELEASED`), Two-Person Approval enforcement (`initiator !== approvedBy`), Landbank/GCash settlement. | 2 Weeks | Aug 17, 2026 | Aug 30, 2026 | John Steaven Balansag, Rojid Mendoza | **Completed** |
| **Sprint 5: Bursary & Work-Study Mesh** | Need-based Bursary income tiers, Work-Study campus job postings, student time logs, supervisor sign-offs, and QC EIS Interoperability Gateway. | 1.5 Weeks | Aug 28, 2026 | Sep 08, 2026 | All Developers (Pia Faner, Rojid Mendoza, Ar-Jay Tabangin) | **Completed** |
| **Phase 3: QA & Testing Strategy** | ISO/IEC 25010 evaluation across 8 quality characteristics, automated build & lint checks, security scanning, and UAT sign-off sheets. | 1.5 Weeks | Sep 05, 2026 | Sep 14, 2026 | Ferdinand Emil Alair (QA), Ar-Jay Tabangin | **Completed** |
| **Phase 4: Cloud Deployment & Defense** | Production deployment on Railway PaaS (`eduscholar.up.railway.app`), Turnitin plagiarism clearance, and Pre-Oral Defense presentation. | 1 Week | Sep 15, 2026 | Sep 19, 2026 | Entire Team & Adviser Jorge B. Lucero | **Pre-Oral Defense (Sept 19, 2026)** |

---

## 3. How to Insert This into the Manuscript

1. Open your manuscript document in Microsoft Word or Google Docs.
2. Navigate to **Appendix B: Project Management Artifacts** (right after Appendix B.3 Meeting Minutes, approximately page 148 / 149).
3. Insert the title: **`B.4 Gantt Chart or Project Timeline`**.
4. You can either:
   - Copy the table above and paste directly into Word.
   - Open [`gantt_chart.html`](file:///c:/Users/piama/EduScholar%20Revise/gantt_chart.html) in your browser, take a screenshot of the graphic chart, and insert it above the table!
