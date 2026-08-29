# EduScholar: Complete Technical Specifications & Architecture Diagrams (Sections 1 – 16)

This document contains the complete, comprehensive technical diagrams and architectural specifications for the **EduScholar System**, tailored to the Quezon City Youth Development Office (QCYDO) scholarship management and institutional reconciliation platform.

---

## 1. System Architecture

### 1.1 Microservices Diagram
```mermaid
graph TB
    subgraph ClientLayer["💻 Presentation & Client Layer"]
        SPA["React 18 SPA (TypeScript + Vite)"]
        MobileClient["Mobile Responsive Web Portal"]
    end

    subgraph APIGatewayLayer["🛡️ API Gateway & Security Reverse Proxy"]
        Gateway["Express API Gateway & Reverse Proxy"]
        CORSModule["CORS Whitelist & Rate Limiting"]
        AuthGuard["JWT & 2FA OTP Token Validator"]
        Gateway --- CORSModule
        Gateway --- AuthGuard
    end

    subgraph ServiceMesh["⚙️ Modular Backend Services"]
        AuthService["🔐 Auth & Identity Service<br/>(Bcrypt, 2FA OTP, Sessions)"]
        AppService["📄 Application Intake Service<br/>(Forms, Eligibility Engine, Tracking)"]
        DocService["📁 Document Vault Service<br/>(AES-256 Encryption, Storage)"]
        SchoolSyncService["🏫 School Coordinator & Sync Service<br/>(ID Pattern Matcher, CSV Batch Parser)"]
        TreasuryService["💰 Treasury & Disbursement Service<br/>(Budget Pools, Bank Settlement Engine)"]
        CommsService["💬 Communications & Messaging Service<br/>(WebSockets, Announcements, Desks)"]
        AuditService["📋 System Audit & Log Service<br/>(Event Tracker, Maintenance Mode)"]
    end

    subgraph DataStorageLayer["🐘 Persistence & Data Layer"]
        PGDB[("Central PostgreSQL Database Cluster<br/>(Relational Integrity, Cascades, Indexes)")]
    end

    ClientLayer -->|"HTTPS / TLS 1.3"| Gateway
    ClientLayer -->|"WSS (WebSockets)"| CommsService
    Gateway --> AuthService
    Gateway --> AppService
    Gateway --> DocService
    Gateway --> SchoolSyncService
    Gateway --> TreasuryService
    Gateway --> AuditService
    ServiceMesh -->|"Connection Pool (node-pg)"| PGDB
```

---

### 1.2 Communication Pattern Design
```mermaid
sequenceDiagram
    autonumber
    actor Client as 💻 User Client (Browser)
    participant Gateway as 🛡️ API Gateway
    participant SyncService as ⚙️ Sync REST Controller
    participant AsyncEvents as ⚡ WebSocket Push Server
    participant DB as 🐘 PostgreSQL Database

    Note over Client,Gateway: 1. Synchronous Request-Response (HTTPS)
    Client->>Gateway: POST /api/applications (Payload with COR/TOR)
    Gateway->>SyncService: Authenticated Route Dispatch (Bearer JWT)
    SyncService->>DB: INSERT INTO applications & documents
    DB-->>SyncService: Application Stored (ID: 2026-QC-089)
    SyncService-->>Gateway: HTTP 201 Created { success: true }
    Gateway-->>Client: Success Toast & Application Number

    Note over Client,AsyncEvents: 2. Asynchronous Real-Time Event Notification (WSS)
    SyncService->>AsyncEvents: Trigger Event: "APPLICATION_SUBMITTED"
    AsyncEvents-->>Client: Push Notification: "Application Endorsed to Coordinator Queue"
```

---

### 1.3 Data Flow Diagram for Microservices
```mermaid
graph TD
    User["👨‍🎓 Student Applicant"] -->|"1. Submits Application"| Ingestion["App Ingestion Service"]
    Ingestion -->|"2. Stores Application"| DB_Apps[("applications Table")]
    Ingestion -->|"3. Transmits Files"| DocVault["Document Vault Service"]
    DocVault -->|"4. Encrypts & Stores"| DB_Docs[("documents Table")]
    
    DB_Apps -->|"5. Reads Student Roster"| SchoolSync["School Coordinator Service"]
    SchoolSync -->|"6. Inspects & Endorses"| DB_Apps
    
    DB_Apps -->|"7. Admin Approval"| AdminCore["Admin Evaluation Service"]
    AdminCore -->|"8. Enrolls Scholar"| DB_Reg[("student_registry Table")]
    
    DB_Reg -->|"9. Queues Payout"| Treasury["Treasury Service"]
    Treasury -->|"10. Deducts & Reconciles"| DB_Budgets[("treasury_budgets Table")]
```

---

### 1.4 API Gateway
```mermaid
graph LR
    Incoming["Incoming Client Request"] --> RouteMatcher{"Route Matcher"}
    
    RouteMatcher -->|"/api/auth/*"| AuthPipeline["Auth Pipeline<br/>• Rate Limiter<br/>• Email Verification Guard"]
    RouteMatcher -->|"/api/applications/*"| AppPipeline["Application Pipeline<br/>• Bearer JWT Verification<br/>• Payload Sanitizer"]
    RouteMatcher -->|"/api/schools-sync/*"| SchoolPipeline["School Sync Pipeline<br/>• Coordinator RBAC Guard<br/>• CSV Size Validator"]
    RouteMatcher -->|"/api/treasury/*"| TreasuryPipeline["Treasury Pipeline<br/>• Treasury RBAC Guard<br/>• Hash Checksum Validator"]
    
    AuthPipeline --> Downstream["Dispatches to Service Controllers"]
    AppPipeline --> Downstream
    SchoolPipeline --> Downstream
    TreasuryPipeline --> Downstream
```

---

### 1.5 Application Architecture
```mermaid
graph TB
    subgraph UIComponents["Presentation Components (React 18)"]
        Pages["Pages (Public, Student, School, Admin, Treasury)"]
        SharedUI["UI Atoms (Button, Card, Badge, Modal, Input)"]
        Contexts["State Contexts (AuthContext, WebSocketContext)"]
    end

    subgraph APILayer["API Gateway & Controllers (Express.js)"]
        Middlewares["Middlewares (auth.js, roleGuard.js, errorHandler.js)"]
        Routes["Routes (auth, applications, documents, schoolSync, treasury)"]
    end

    subgraph ServiceLayer["Business Logic Layer"]
        SchoolService["schoolSyncService.js"]
        EmailService["emailService.js"]
        AppModel["applicationModel.js"]
    end

    subgraph PersistenceLayer["Data Layer (PostgreSQL)"]
        PGPool["pg.Pool Connection Client"]
        DBSchema["Relational Tables & Seed Data"]
    end

    UIComponents --> APILayer
    APILayer --> ServiceLayer
    ServiceLayer --> PersistenceLayer
```

---

### 1.6 Architecture Diagram
```mermaid
graph TD
    UserDevice["User Devices<br/>(Desktop, Tablet, Mobile)"]
    
    subgraph EdgeCloud["Cloudflare Edge & Security"]
        SSL["SSL/TLS 1.3 Termination"]
        DDoS["DDoS & Firewall Mitigation"]
    end

    subgraph AppHost["Railway PaaS Container Infrastructure"]
        WebServer["Node.js + Express Web Server (Port 5000)"]
        StaticAssets["Vite SPA Static Asset Server"]
    end

    subgraph DatabaseCloud["Managed Database Infrastructure"]
        PostgresCluster["Managed PostgreSQL 16 Enterprise Cluster"]
    end

    UserDevice --> EdgeCloud
    EdgeCloud --> AppHost
    AppHost --> DatabaseCloud
```

---

### 1.7 Physical View of the Architecture of a Web Application
```mermaid
graph LR
    subgraph ClientNodes["Client Hardware"]
        PC["User Desktop / Laptop Browser"]
        Phone["Mobile Smartphone Browser"]
    end

    subgraph CloudNetwork["Public Cloud Infrastructure (Railway Cloud)"]
        LoadBalancer["Cloud Load Balancer / Reverse Proxy"]
        AppNode["App Server Container (Linux x86_64, 512MB RAM, Node 20.x)"]
        DBNode["Database Server Container (PostgreSQL 16 Dedicated Volume)"]
    end

    subgraph ExternalNodes["External Service Nodes"]
        SMTPNode["SMTP Mail Server (Port 587)"]
        BankNode["Landbank / GCash Clearing Endpoint"]
    end

    ClientNodes -->|"HTTPS (Port 443)"| LoadBalancer
    LoadBalancer -->|"Internal TCP"| AppNode
    AppNode -->|"Encrypted TCP (Port 5432)"| DBNode
    AppNode -.->|"TLS SMTP"| SMTPNode
    AppNode -.->|"Settlement API/File"| BankNode
```

---

### 1.8 Understanding the Architecture 3-Tier
```mermaid
graph TB
    subgraph Tier1["🖥️ TIER 1: PRESENTATION TIER"]
        T1_Desc["• React 18 User Interface<br/>• Client-side Route Navigation<br/>• Form Input Validation & UX Skeletons<br/>• Responsive Tailwind CSS"]
    end

    subgraph Tier2["⚙️ TIER 2: BUSINESS LOGIC TIER"]
        T2_Desc["• Express.js REST API Controllers<br/>• Institutional Student ID Pattern Matching<br/>• Automated GWA & Unit Load Evaluation<br/>• Multi-tier Role Authorization Guards<br/>• Treasury Payout Batch Reconciliation"]
    end

    subgraph Tier3["🐘 TIER 3: DATA STORAGE TIER"]
        T3_Desc["• PostgreSQL Relational Database<br/>• ACID Transaction Guarantees<br/>• Foreign Key Constraints & Cascades<br/>• Encrypted Document Metadata Vault"]
    end

    Tier1 -->|"HTTP Requests / JSON Payloads"| Tier2
    Tier2 -->|"Parameterized SQL Queries"| Tier3
```

---

## 2. Information Systems Integration

### 2.1 Web Application Data Flow
```mermaid
graph LR
    User["User Action (Submit / Approve)"] --> Form["React Form Component"]
    Form --> Axios["Axios API Client (Token Interceptor)"]
    Axios --> Route["Express Router (/api/...)"]
    Route --> AuthMid["Auth & RBAC Middleware"]
    AuthMid --> Controller["Business Controller Method"]
    Controller --> Model["Database Model Query ($1, $2)"]
    Model --> PG[("PostgreSQL DB")]
    PG -->> Model -->> Controller -->> Axios -->> Form -->> User
```

---

### 2.2 REST API Architecture
```mermaid
graph TD
    subgraph HTTPMethods["RESTful Verbs & Endpoints"]
        POST["POST /api/applications (Create Submission)"]
        GET["GET /api/applications (Retrieve Application List)"]
        PATCH["PATCH /api/applications/:id/status (Endorse / Approve / Reject)"]
        DELETE["DELETE /api/documents/:id (Revoke Document)"]
    end

    subgraph Middlewares["Express Middleware Pipeline"]
        CORS["1. cors() Middleware"]
        JSON["2. express.json() Body Parser"]
        JWT["3. authenticateToken Middleware"]
        RBAC["4. requireRoleGuard Middleware"]
    end

    subgraph Responses["Standardized JSON Responses"]
        Success["HTTP 200/201: { success: true, data: [...], message: '...' }"]
        ClientErr["HTTP 400/401/403: { success: false, error: '...' }"]
        ServerErr["HTTP 500: { success: false, error: 'Internal Server Error' }"]
    end

    HTTPMethods --> Middlewares
    Middlewares --> Responses
```

---

### 2.3 Business Process Architecture 1: Application Intake & Institutional Verification
```mermaid
sequenceDiagram
    autonumber
    actor Student as 👨‍🎓 Student Applicant
    participant Portal as 💻 Student Portal
    participant SyncService as 🏫 School Sync Adapter
    actor Coordinator as 👨‍🏫 School Coordinator
    participant DB as 🐘 PostgreSQL Database

    Student->>Portal: Enters Personal Info, Student ID, Course, GWA
    Student->>Portal: Uploads Official COR & TOR/COG Documents
    Portal->>SyncService: Validates ID Format (e.g., 2024-QC-XXXX for QCU)
    Portal->>DB: Saves Application with Status "Submitted"
    
    Coordinator->>Portal: Opens Batch Verification & Inspection Viewer
    Portal->>DB: Loads Enrolled Students for Coordinator's University
    Coordinator->>Portal: Inspects COR/TOR and Cross-audits GWA
    Coordinator->>Portal: Clicks "Endorse to Admin"
    Portal->>DB: Updates Application Status to "School Endorsed"
```

---

### 2.4 Business Process Architecture 2: Approval, Disbursement & Treasury Reconciliation
```mermaid
sequenceDiagram
    autonumber
    actor Admin as 💼 QCYDO Admin
    actor Treasury as 💰 City Treasury Officer
    participant System as ⚙️ EduScholar Backend
    participant DB as 🐘 PostgreSQL Database
    participant Bank as 🏦 Landbank / GCash Disburser

    Admin->>System: Evaluates Endorsed List (sees "✓ School Endorsed" Badge)
    Admin->>System: Clicks "Approve"
    System->>DB: Updates Status to "Approved" & Inserts to student_registry
    
    Treasury->>System: Opens Treasury Portal & Generates Payroll Batch
    Treasury->>Bank: Transmits Electronic Payout Batch
    Bank-->>Treasury: Issues Bank Settlement Reference File
    Treasury->>System: Uploads Reference File for Automated Reconciliation
    System->>DB: Reconciles Amounts, Deducts Budget Pool & Marks "Liquidated"
```

---

## 3. Application Design and Development

### 3.1 Data Flow Diagram Level 0 (Context Diagram)
```mermaid
graph TD
    Student["👨‍🎓 Student Applicant"]
    SchoolCoor["👨‍🏫 School Coordinator"]
    Admin["💼 QCYDO Administrator"]
    Treasury["💰 City Treasury Officer"]
    Bank["🏦 Bank / Payout Disburser"]
    SMTP["✉️ SMTP Notification Server"]

    System["(( 0. EduScholar Scholarship Management System ))"]

    Student -->|"Submits Credentials & Documents"| System
    System -->|"Application Status & Award Letter"| Student

    SchoolCoor -->|"Inspects COR/TOR & Endorses Roster"| System
    System -->|"Enrolled Student Applications"| SchoolCoor

    Admin -->|"Reviews Queue & Approves Grants"| System
    System -->|"Endorsed Scholars & Compliance Metrics"| Admin

    Treasury -->|"Reconciliation Files & Payout Batches"| System
    System -->|"Audited Payroll Ledgers & Vouchers"| Treasury

    System -->|"Electronic Payout Records"| Bank
    System -->|"OTP Codes & System Alerts"| SMTP
```

---

### 3.2 Data Flow Diagram Level 1
```mermaid
graph TD
    Student["Student"] -->|"1.1 Register / Login"| P1["1.0 Authentication & User Management"]
    P1 --> D1[("users")]

    Student -->|"2.1 Submit Application"| P2["2.0 Application Intake & Vault"]
    P2 --> D2[("applications")]
    P2 --> D3[("documents")]

    D2 -->|"3.1 Fetch Roster"| P3["3.0 Institutional School Verification"]
    Coordinator["School Coordinator"] -->|"3.2 Endorse Scholar"| P3
    P3 --> D2

    D2 -->|"4.1 Review Endorsed"| P4["4.0 QCYDO Admin Review & Enrollment"]
    Admin["QCYDO Admin"] -->|"4.2 Approve Application"| P4
    P4 --> D4[("student_registry")]

    D4 -->|"5.1 Generate Payroll"| P5["5.0 Treasury Budgeting & Reconciliation"]
    Treasury["City Treasury"] -->|"5.2 Reconcile Hashes"| P5
    P5 --> D5[("treasury_budgets")]
    P5 --> D6[("disbursements")]
```

---

### 3.3 Use Case Diagram
```mermaid
graph LR
    subgraph Actors
        A1["👨‍🎓 Student Applicant"]
        A2["👨‍🏫 School Coordinator"]
        A3["💼 QCYDO Admin"]
        A4["💰 City Treasury"]
    end

    subgraph UseCases["EduScholar System Use Cases"]
        UC1["Apply for Scholarship Track"]
        UC2["Upload COR & TOR to Vault"]
        UC3["Track Application & Take Quiz"]
        UC4["Verify Batch Roster & CSV Upload"]
        UC5["Inspect Original COR/TOR Proof"]
        UC6["Endorse Qualified Scholars to Admin"]
        UC7["Review Queue & Final Approval"]
        UC8["Manage Registry & Student Profiles"]
        UC9["Allocate Funds & Disburse Payroll"]
        UC10["Reconcile Bank Payout References"]
    end

    A1 --- UC1
    A1 --- UC2
    A1 --- UC3

    A2 --- UC4
    A2 --- UC5
    A2 --- UC6

    A3 --- UC7
    A3 --- UC8

    A4 --- UC9
    A4 --- UC10
```

---

### 3.4 Applicant Sequence Diagram
```mermaid
sequenceDiagram
    autonumber
    actor Student as 👨‍🎓 Student Applicant
    participant UI as 💻 Application Form UI
    participant Backend as ⚙️ Express Backend
    participant DB as 🐘 PostgreSQL DB

    Student->>UI: Selects Scholarship Program (e.g. Tertiary Merit)
    Student->>UI: Fills Academic & Socioeconomic Details
    Student->>UI: Uploads Certificate of Registration (COR) & Grade Slip (TOR)
    Student->>UI: Clicks "Submit Application"
    UI->>Backend: POST /api/applications (JSON + Multi-part Files)
    Backend->>DB: INSERT INTO applications, documents, notifications
    DB-->>Backend: Success Confirmation
    Backend-->>UI: Returns Tracking Number (e.g. APP-2026-089)
    UI-->>Student: Displays Application Confirmation & Live Progress Tracker
```

---

### 3.5 School Coordinator Sequence Diagram
```mermaid
sequenceDiagram
    autonumber
    actor Coordinator as 👨‍🏫 School Coordinator (e.g. QCU / UP Registrar)
    participant UI as 💻 Batch Verification UI
    participant Backend as ⚙️ Express Backend
    participant DB as 🐘 PostgreSQL DB

    Coordinator->>UI: Opens Batch Verification & Monitoring Page
    UI->>Backend: GET /api/applications?school=QCU
    Backend->>DB: SELECT * FROM applications WHERE school = 'QCU'
    DB-->>Backend: Student Records List
    Backend-->>UI: Displays Batch Matrix with GWA & Unit Loads
    Coordinator->>UI: Clicks "Inspect COR & TOR" on Student Record
    UI->>UI: Opens Expanded Document Inspection Modal
    Coordinator->>UI: Confirms Registrar Watermark & Clicks "Endorse to Admin"
    UI->>Backend: PATCH /api/applications/:id/status { status: 'School Endorsed' }
    Backend->>DB: UPDATE applications SET status = 'School Endorsed'
    DB-->>Backend: Updated Successfully
    Backend-->>UI: Displays Success Notification & Updates Row Status
```

---

### 3.6 Treasury Officer Sequence Diagram
```mermaid
sequenceDiagram
    autonumber
    actor Treasury as 💰 City Treasury Officer
    participant UI as 💻 Treasury Portal UI
    participant Backend as ⚙️ Express Backend
    participant DB as 🐘 PostgreSQL DB
    participant Bank as 🏦 Landbank / GCash Server

    Treasury->>UI: Navigates to Budget & Reconciliation Module
    UI->>Backend: GET /api/treasury/budgets
    Backend->>DB: SELECT * FROM treasury_budgets
    DB-->>UI: Active Fund Balances (QCSP Fund ₱150M)
    Treasury->>UI: Selects Approved Payroll Batch & Clicks "Execute Disbursement"
    UI->>Bank: Transmits Payout Batch File
    Bank-->>Treasury: Returns Bank Clearance Reference Ledger
    Treasury->>UI: Uploads Reference Ledger for Hash Reconciliation
    UI->>Backend: POST /api/treasury/reconciliation
    Backend->>DB: Updates Payout Status to "Liquidated" & Logs COA Voucher
    DB-->>UI: Reconciliation Complete (0 Discrepancies)
```

---

### 3.7 Admin Sequence Diagram
```mermaid
sequenceDiagram
    autonumber
    actor Admin as 💼 QCYDO Administrator
    participant UI as 💻 Review Queue UI
    participant Backend as ⚙️ Express Backend
    participant DB as 🐘 PostgreSQL DB

    Admin->>UI: Opens Application Review Queue
    UI->>Backend: GET /api/applications
    Backend->>DB: SELECT * FROM applications
    DB-->>UI: Applications Table with "✓ School Endorsed" Badges
    Admin->>UI: Reviews Endorsement Remarks and Clicks "Approve"
    UI->>Backend: PATCH /api/applications/:id/status { status: 'Approved' }
    Backend->>DB: INSERT INTO student_registry & UPDATE applications
    Backend->>DB: INSERT INTO notifications (Alert Student of Approval)
    DB-->>UI: Approval Committed
    UI-->>Admin: Generates Official Scholarship Award Certificate
```

---

### 3.8 Master System Flowchart
```mermaid
flowchart TD
    Start([Start: User Enters EduScholar]) --> RoleCheck{User Role?}

    RoleCheck -->|Student| S1[Browse Scholarships / Take Quiz]
    S1 --> S2[Fill Form & Upload COR/TOR]
    S2 --> S3[Submit Application]
    S3 --> S4[Wait for Verification]

    RoleCheck -->|School Coordinator| C1[Open Batch Verification]
    C1 --> C2[Inspect Student COR/TOR Documents]
    C2 --> C3{Valid & Compliant?}
    C3 -->|No| C4[Flag Academic Deficiency]
    C3 -->|Yes| C5[Click 'Endorse to Admin']
    C5 --> A1

    S4 --> C1

    RoleCheck -->|QCYDO Admin| A1[Open Review Queue]
    A1 --> A2{Coordinator Endorsed?}
    A2 -->|No| A3[Hold for Registrar Verification]
    A2 -->|Yes| A4[Click 'Approve']
    A4 --> A5[Enroll to student_registry]
    A5 --> T1

    RoleCheck -->|City Treasury| T1[Open Treasury Reconciliation]
    T1 --> T2[Generate Payout Payroll Batch]
    T2 --> T3[Transmit to Landbank / GCash]
    T3 --> T4[Reconcile Bank Reference Hashes]
    T4 --> End([End: Funds Disbursed & Account Liquidated])
```

---

## 4. Database Schema and Data Management

### 4.1 Master Entity-Relationship Diagram (ERD)
```mermaid
erDiagram
    USERS ||--o{ APPLICATIONS : submits
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ AUDIT_LOGS : performs
    APPLICATIONS ||--o{ DOCUMENTS : contains
    APPLICATIONS ||--o| STUDENT_REGISTRY : enlists
    PROGRAMS ||--o{ APPLICATIONS : categorizes
    TREASURY_BUDGETS ||--o{ DISBURSEMENTS : finances
    CONVERSATIONS ||--o{ CHAT_MESSAGES : contains

    USERS {
        int id PK
        string full_name
        string email
        string password_hash
        string role
        boolean is_verified
        timestamp created_at
    }

    APPLICATIONS {
        int id PK
        int user_id FK
        string application_no
        string program_id FK
        string applicant_name
        string school
        string course
        int year_level
        decimal gwa
        int units_enrolled
        string status
        timestamp submitted_at
    }

    DOCUMENTS {
        int id PK
        int application_id FK
        string doc_type
        string file_name
        string file_url
        string verification_status
        timestamp uploaded_at
    }

    STUDENT_REGISTRY {
        string student_id PK
        int user_id FK
        string full_name
        string school
        string program_name
        decimal grant_amount
        string disbursement_status
    }

    TREASURY_BUDGETS {
        int id PK
        string fund_name
        string fiscal_year
        decimal total_allocation
        decimal disbursed_amount
        string status
    }

    DISBURSEMENTS {
        int id PK
        int budget_id FK
        string batch_no
        string payout_channel
        decimal total_amount
        string reconciliation_status
    }
```

---

## 5. Network Configuration

### 5.1 Network Topology Diagram
```mermaid
graph TD
    subgraph PublicInternet["🌍 Public Internet"]
        Users["Student & Coordinator Devices"]
    end

    subgraph EdgeSecurityZone["🛡️ Edge Security Zone (Cloudflare / SSL)"]
        WAF["Web Application Firewall (WAF)"]
        SSLTermination["TLS 1.3 Encryption Termination"]
        WAF --- SSLTermination
    end

    subgraph ApplicationZone["⚙️ Private Application VPC (Railway Cloud)"]
        ReverseProxy["Nginx / Internal Reverse Proxy"]
        NodeApp["Express.js Application Server (Port 5000)"]
        WSServer["WebSocket Push Daemon (Port 5000)"]
        ReverseProxy --> NodeApp
        ReverseProxy --> WSServer
    end

    subgraph DataZone["🔒 Isolated Data Subnet (No Public IP)"]
        PGDB[("PostgreSQL 16 Database Cluster (Port 5432)")]
    end

    PublicInternet -->|"HTTPS (Port 443)"| EdgeSecurityZone
    EdgeSecurityZone -->|"Encrypted Tunnel"| ApplicationZone
    ApplicationZone -->|"Internal Private IP (10.0.x.x)"| DataZone
```

---

## 6. Deployment and Infrastructure

### 6.1 Infrastructure as Code (IaC) Architecture
```mermaid
graph LR
    subgraph SourceControl["1. Git Repository"]
        Code["Source Code (React + Express)"]
        NixpacksConfig["nixpacks.toml (Build Specifications)"]
        DockerConfig["Dockerfile (Container Runtime)"]
        RailwayConfig["railway.json (Deployment Manifest)"]
    end

    subgraph OrchestrationEngine["2. Automated IaC Builder"]
        Builder["Railway Nixpacks Engine<br/>• Installs Node 20.x<br/>• Executes 'npm run build'<br/>• Generates Production Dist"]
    end

    subgraph ProductionCluster["3. Container Runtime Environment"]
        AppPod["Production Web Pod (Auto-restart, Health Check)"]
        PostgresPod["PostgreSQL Managed Pod (Automatic Backups, WAL)"]
        AppPod --> PostgresPod
    end

    SourceControl -->|"Git Push Webhook"| OrchestrationEngine
    OrchestrationEngine -->|"Provisions Container Image"| ProductionCluster
```

---

## 7. Security Measures

### 7.1 Security Architecture Diagram
```mermaid
graph TD
    Request["Incoming User Request"]

    subgraph PerimeterDefense["1. Perimeter & Transport Security"]
        TLS["HTTPS TLS 1.3 Transport Encryption"]
        CORS["Strict CORS Origin Whitelist"]
        RateLimit["IP Rate Limiting & DoS Protection"]
    end

    subgraph IdentitySecurity["2. Identity & Access Management (IAM)"]
        Bcrypt["Bcrypt Password Salt & Hash (Cost Factor 10)"]
        OTP["6-Digit One-Time Password (2FA Email OTP)"]
        JWTTokens["Signed JSON Web Tokens (HMAC-SHA256)"]
    end

    subgraph ApplicationSecurity["3. Application & Data Security"]
        RBAC["Role-Based Route Guards (Student, School, Admin, Treasury)"]
        SQLParam["Parameterized SQL Queries (100% Anti-SQL Injection)"]
        AES["AES-256 Document Encryption at Rest"]
    end

    Request --> PerimeterDefense
    PerimeterDefense --> IdentitySecurity
    IdentitySecurity --> ApplicationSecurity
    ApplicationSecurity --> AuthorizedAccess["✅ Authorized Operation Executed"]
```

---

## 8. Testing and Quality Assurance

### 8.1 Testing Process Flowchart
```mermaid
flowchart LR
    DevCommit["Developer Code Modification"] --> StaticAnalysis["1. TypeScript Static Analysis (tsc -b)"]
    StaticAnalysis --> TypeCheck{Passes Types?}
    TypeCheck -->|No| FixType["Fix TypeScript Typing Error"] --> StaticAnalysis
    TypeCheck -->|Yes| BundlerTest["2. Vite Tree-Shaking & Minification Build"]
    BundlerTest --> BuildCheck{Build Exit Code 0?}
    BuildCheck -->|No| FixBuild["Resolve Module Conflict"] --> BundlerTest
    BuildCheck -->|Yes| E2EVerification["3. Multi-Tier End-to-End Test<br/>(Student ➔ Coordinator ➔ Admin ➔ Treasury)"]
    E2EVerification --> DeployStaging["4. Continuous Staging & Release Deployment"]
```

---

## 9. System Monitoring and Maintenance

### 9.1 Monitoring & Alerting Architecture
```mermaid
graph TD
    subgraph OperationalMonitors["System Monitors"]
        HealthProbe["Server Health Heartbeat (Uptime, Memory)"]
        QueryMonitor["PostgreSQL Connection Pool Status"]
        AuditCollector["Audit Trail Collector (audit_logs Table)"]
    end

    subgraph ProcessingEngine["Event Evaluation Engine"]
        Thresholds{"Resource or Error Alert Triggered?"}
    end

    subgraph MaintenanceControls["Admin Control Actions"]
        MaintToggle["Maintenance Mode Switch<br/>(Displays User Banner, Allows Admin Access)"]
        LogViewer["Live Audit & Error Log Explorer"]
        AdminAlert["Dispatch High Priority Admin Alert"]
    end

    OperationalMonitors --> ProcessingEngine
    ProcessingEngine --> Thresholds
    Thresholds -->|Normal| LogViewer
    Thresholds -->|Critical| AdminAlert
    Thresholds -->|Maintenance Scheduled| MaintToggle
```

---

## 10. APIs and Integration Points

### 10.1 API Integration Topology
```mermaid
graph TD
    Core["EduScholar API Core Gateway"]

    subgraph InternalAPIs["Internal REST Routes"]
        AuthRoute["/api/auth (Login, Register, 2FA OTP)"]
        AppRoute["/api/applications (Intake, Status, Filter)"]
        DocRoute["/api/documents (Upload, Encrypt, Retrieve)"]
        AdminRoute["/api/admin (Registry, Users, Logs, Config)"]
    end

    subgraph ExternalIntegrationAPIs["External & Interoperability Adapters"]
        SchoolSyncRoute["/api/schools-sync/verify/:schoolCode/:studentId (SIS Adapter)"]
        TreasuryRoute["/api/treasury/reconciliation (Bank Settlement Hashes)"]
        CommsRoute["/api/communication (Announcements, Chat, Messages)"]
    end

    Core --- InternalAPIs
    Core --- ExternalIntegrationAPIs
```

---

## 11. User Documentation

### 11.1 User Documentation Structure
```mermaid
graph TD
    UserDocs["EduScholar User Documentation Portal"]

    UserDocs --> StudentDocs["1. Student & Applicant Guides<br/>• Online Application Step-by-step Guide<br/>• Document Vault Upload & Format Requirements<br/>• Tracking Status & Renewal Procedures"]
    
    UserDocs --> CoorDocs["2. School Coordinator Guides<br/>• Batch CSV Enrollment Roster Upload Guide<br/>• Original COR/TOR Inspection Manual<br/>• Academic Endorsement Workflow"]

    UserDocs --> AdminDocs["3. QCYDO Admin Manual<br/>• Application Review Queue & Approval Criteria<br/>• Student Registry Management<br/>• Program & Quota Configuration"]

    UserDocs --> TreasuryDocs["4. City Treasury Manual<br/>• Fund Allocation & Budget Pool Liquidation<br/>• Landbank & GCash Automated Reconciliation Engine"]
```

---

## 12. Known Issues and Troubleshooting

### 12.1 Known Issues and Troubleshooting Lifecycle
```mermaid
graph TD
    IssueTrigger["Issue Encountered by User"] --> Category{"Issue Category"}

    Category -->|Forgot Password / Locked Account| Sol1["Self-Service Password Reset via Email OTP"]
    Category -->|COR/TOR File Too Large / Corrupted| Sol2["Document Vault Re-upload (Max 10MB PDF/PNG/JPG)"]
    Category -->|Coordinator Roster CSV Format Error| Sol3["Download Official CSV Template from Batch Verification Portal"]
    Category -->|Bank Reference Number Hash Mismatch| Sol4["Treasury Manual Exception Review Panel"]

    Sol1 --> TicketDesk["If unresolved: Submit Ticket at /support"]
    Sol2 --> TicketDesk
    Sol3 --> TicketDesk
    Sol4 --> TicketDesk
    TicketDesk --> HelpdeskResolved["QCYDO Technical Team Resolution"]
```

---

## 13. Version Control and Source Code Repository

### 13.1 Version Control Workflow
```mermaid
graph LR
    subgraph LocalDev["Developer Workspace"]
        LocalBranch["Feature Branches<br/>(feat/school-coor, feat/treasury)"]
        LocalTest["Local Build Verification (npm run build)"]
        LocalBranch --> LocalTest
    end

    subgraph RemoteRepo["GitHub Remote Repository (aysedakom/EduScholar)"]
        MainBranch["main Branch (Production Ready)"]
    end

    subgraph CI_Deployment["Automated Deployment Pipeline"]
        Webhook["Railway GitHub Webhook"]
        LiveProd["Live Production App"]
    end

    LocalTest -->|"git push origin main"| MainBranch
    MainBranch -->|"Automatic Trigger"| Webhook
    Webhook --> LiveProd
```

---

## 14. DevOps and Continuous Integration/Continuous Deployment (CI/CD)

### 14.1 Complete CI/CD Pipeline
```mermaid
flowchart TD
    A["Developer Commits Code"] --> B["Git Push to GitHub (main)"]
    B --> C["Railway CI Webhook Triggers"]
    C --> D["Nixpacks Builds Node.js 20 Environment"]
    D --> E["Dependency Resolution: npm install"]
    E --> F["Compile & Bundle: npm run build (tsc -b + Vite)"]
    F --> G{Build Succeeded?}
    G -->|No| H["Build Fails & Alert Sent to Developer"]
    G -->|Yes| I["Deploy Container to Production Cluster"]
    I --> J["Zero-Downtime Traffic Switch"]
    J --> K["System Live on Railway HTTPS Domain"]
```

---

## 15. Licensing and Open-Source Libraries

### 15.1 Open-Source Stack & License Hierarchy
```mermaid
graph TD
    EduScholar["EduScholar Platform (Proprietary to QCYDO / QC LGU)"]

    subgraph FrontendLibraries["Frontend Open Source Dependencies"]
        React["React 18 & ReactDOM (MIT License)"]
        TS["TypeScript (Apache 2.0 License)"]
        Tailwind["Tailwind CSS (MIT License)"]
        Lucide["Lucide React Icons (ISC License)"]
        Vite["Vite Build Tool (MIT License)"]
        Sonner["Sonner Toast Engine (MIT License)"]
    end

    subgraph BackendLibraries["Backend Open Source Dependencies"]
        NodeJS["Node.js Runtime (MIT License)"]
        Express["Express.js Framework (MIT License)"]
        PG["node-postgres (MIT License)"]
        Bcrypt["bcryptjs (MIT License)"]
        JWT["jsonwebtoken (MIT License)"]
        WS["ws WebSocket Library (MIT License)"]
    end

    EduScholar --- FrontendLibraries
    EduScholar --- BackendLibraries
```

---

## 16. Performance Metrics and Monitoring

### 16.1 Performance Metrics & Telemetry Loop
```mermaid
graph TD
    subgraph ClientOptimization["Client-Side Metrics"]
        BundleSize["Vite Code Splitting (<500 kB per chunk)"]
        AssetCompress["Gzip Compression (~20 kB CSS)"]
        FirstPaint["First Contentful Paint (FCP) < 1.0s"]
    end

    subgraph ServerOptimization["Server & Database Metrics"]
        QueryIndex["B-Tree Indexes on student_id, user_id, application_no"]
        PoolReuse["Connection Pooling (Low latency reuse)"]
        AsyncIO["Non-blocking Async I/O Controllers"]
    end

    subgraph TelemetryAnalytics["Live Analytics & Dashboard (/admin/analytics)"]
        AppThroughput["Application Processing Throughput"]
        ApprovalVelocity["Endorsement to Approval Velocity (in Days)"]
        BudgetUtil["Real-time Treasury Budget Utilization Gauge"]
    end

    ClientOptimization --> TelemetryAnalytics
    ServerOptimization --> TelemetryAnalytics
```
