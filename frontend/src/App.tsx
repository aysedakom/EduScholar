import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Public Phase 6 Pages
import { LandingPage } from './pages/public/LandingPage';
import { QCeServicesHomePage } from './pages/public/QCeServicesHomePage';
import { PublicServicesPortalPage } from './pages/public/PublicServicesPortalPage';
import { EScholarPage } from './pages/public/EScholarPage';
import { ScholarEguidePage } from './pages/public/ScholarEguidePage';
import { ScholarProgAvailablePage } from './pages/public/ScholarProgAvailablePage';
import { ContactPage } from './pages/public/ContactPage';
import { NotFoundPage } from './pages/public/NotFoundPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';

import { DashboardPage } from './pages/DashboardPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { ScholarshipsPage } from './pages/ScholarshipsPage';
import { BursariesPage } from './pages/BursariesPage';
import { ScholarshipApplyPage } from './pages/ScholarshipApplyPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { DocumentVaultPage } from './pages/DocumentVaultPage';
import { MessagesPage } from './pages/MessagesPage';
import { CalendarPage } from './pages/CalendarPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SupportPage } from './pages/SupportPage';
import { AdminPartnerSchoolsPage } from './pages/admin/AdminPartnerSchoolsPage';

import { ReportsModulePage } from './pages/admin/ReportsModulePage';
import { StudentProfilesSearchPage } from './pages/admin/StudentProfilesSearchPage';

// Supervisor & Staff Phase 5 Pages
import { StudentEvaluationsPage } from './pages/supervisor/StudentEvaluationsPage';
import { EnrollmentVerificationPage } from './pages/supervisor/EnrollmentVerificationPage';
import { MyAssignedStudentsPage } from './pages/supervisor/MyAssignedStudentsPage';

// New Role-Aware Pages
import { AcademicMonitoringPage } from './pages/school/AcademicMonitoringPage';
import { BudgetPage } from './pages/treasury/BudgetPage';
import { ReconciliationPage } from './pages/treasury/ReconciliationPage';

// Student TODO.md Specific Pages
import { BasicFormPage } from './pages/student/BasicFormPage';
import { ApplicationForm } from './pages/student/ApplicationForm';
import { SchoolAidDistributionPage } from './pages/student/SchoolAidDistributionPage';
import { StudentRegistryPage } from './pages/student/StudentRegistryPage';
import { EducationMonitoringReportsPage } from './pages/student/EducationMonitoringReportsPage';

// AI & Interaction Features Pages
import { ScholarshipQuizPage } from './pages/student/ScholarshipQuizPage';
import { SmartRecommendationsPage } from './pages/student/SmartRecommendationsPage';
import { OneClickRenewalPage } from './pages/student/OneClickRenewalPage';
import { SurveysPage } from './pages/student/SurveysPage';
import { BatchVerificationPage } from './pages/school/BatchVerificationPage';

// System Administration Phase 7 Pages
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { SuperAdminPage } from './pages/admin/SuperAdminPage';
import { RolePermissionManagementPage } from './pages/admin/RolePermissionManagementPage';
import { SystemConfigPage } from './pages/admin/SystemConfigPage';
import { MasterStudentDatabasePage } from './pages/admin/MasterStudentDatabasePage';
import { EmployerManagementPage } from './pages/admin/EmployerManagementPage';
import { FundPoolsManagementPage } from './pages/admin/FundPoolsManagementPage';
import { SystemWorkflowsPage } from './pages/admin/SystemWorkflowsPage';
import { ApiIntegrationsPage } from './pages/admin/ApiIntegrationsPage';
import { SystemLogsPage } from './pages/admin/SystemLogsPage';
import { DatabaseManagementPage } from './pages/admin/DatabaseManagementPage';
import { MaintenanceModePage } from './pages/admin/MaintenanceModePage';
import { SecurityManagementPage } from './pages/admin/SecurityManagementPage';

// Phase 8 Analytics Page
import { AdvancedAnalyticsPage } from './pages/admin/AdvancedAnalyticsPage';

import { WebSocketProvider } from './context/WebSocketContext';

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <WebSocketProvider>
            <Toaster position="top-right" richColors />
            <BrowserRouter>
          <Routes>
          {/* Public Unauthenticated Routes */}
          <Route path="/" element={<QCeServicesHomePage />} />
          <Route path="/home" element={<QCeServicesHomePage />} />
          <Route path="/education-scholarship" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/scholar-eguide" element={<ScholarEguidePage />} />
          <Route path="/scholarship-eguide" element={<ScholarEguidePage />} />
          <Route path="/scholar-prog-available" element={<ScholarProgAvailablePage />} />
          <Route path="/campus-aid-hub" element={<PublicServicesPortalPage />} />
          <Route path="/public" element={<PublicServicesPortalPage />} />
          <Route path="/e-scholar" element={<EScholarPage />} />
          <Route path="/eservices/education-scholarship" element={<EScholarPage />} />
          <Route path="/student/application-form" element={<ApplicationForm />} />
          <Route path="/application-form" element={<ApplicationForm />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/404" element={<NotFoundPage />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<RegisterPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route path="/renewal" element={<OneClickRenewalPage />} />
          <Route path="/student/renewal" element={<OneClickRenewalPage />} />

          {/* Protected Application Shell */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/basic-form" element={<BasicFormPage />} />
              <Route path="/apply" element={<OpportunitiesPage />} />
              <Route path="/apply/scholarship" element={<ScholarshipApplyPage />} />
              <Route path="/scholarships" element={<ScholarshipsPage />} />
              <Route path="/bursaries" element={<BursariesPage />} />
              <Route path="/reports" element={<ReportsModulePage />} />
              <Route path="/applications" element={<ApplicationsPage />} />
              <Route path="/documents" element={<DocumentVaultPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/calendar" element={<CalendarPage />} />

              {/* Student Interactive Features Routes */}
              <Route path="/quiz" element={<ScholarshipQuizPage />} />
              <Route path="/recommendations" element={<SmartRecommendationsPage />} />
              <Route path="/surveys" element={<SurveysPage />} />

              {/* Admin & Staff Phase 4 & 8 Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'system_admin']} />}>
                <Route path="/admin/partner-schools" element={<AdminPartnerSchoolsPage />} />
                <Route path="/admin/partners" element={<AdminPartnerSchoolsPage />} />
                <Route path="/admin/scholarships" element={<ScholarshipsPage />} />
                <Route path="/admin/school-aid-distribution" element={<SchoolAidDistributionPage />} />
                <Route path="/school-aid-distribution" element={<SchoolAidDistributionPage />} />
                <Route path="/admin/student-registry" element={<StudentRegistryPage />} />
                <Route path="/student-registry" element={<StudentRegistryPage />} />
                <Route path="/admin/education-reports" element={<EducationMonitoringReportsPage />} />
                <Route path="/education-reports" element={<EducationMonitoringReportsPage />} />
                <Route path="/admin/reports" element={<ReportsModulePage />} />
                <Route path="/admin/student-profiles" element={<StudentProfilesSearchPage />} />
                <Route path="/analytics" element={<AdvancedAnalyticsPage />} />
              </Route>

              {/* Supervisor Routes */}
              <Route element={<ProtectedRoute allowedRoles={['supervisor', 'admin', 'system_admin']} />}>
                <Route path="/supervisor/evaluations" element={<StudentEvaluationsPage />} />
                <Route path="/supervisor/assigned-students" element={<MyAssignedStudentsPage />} />
              </Route>

              {/* School Coordinator Routes */}
              <Route element={<ProtectedRoute allowedRoles={['school_coordinator', 'admin', 'system_admin']} />}>
                <Route path="/school/enrollment" element={<EnrollmentVerificationPage />} />
                <Route path="/school/batch-verification" element={<BatchVerificationPage />} />
                <Route path="/school/academic" element={<AcademicMonitoringPage />} />
                <Route path="/school/academic-monitoring" element={<AcademicMonitoringPage />} />
                <Route path="/school/reports" element={<ReportsModulePage />} />
              </Route>

              {/* Treasury Routes */}
              <Route element={<ProtectedRoute allowedRoles={['treasury', 'admin', 'system_admin']} />}>
                <Route path="/treasury/budget" element={<BudgetPage />} />
                <Route path="/treasury/reports" element={<ReportsModulePage />} />
                <Route path="/treasury/reconciliation" element={<ReconciliationPage />} />
              </Route>
              
              {/* Phase 7 System Administration Routes */}
              <Route element={<ProtectedRoute allowedRoles={['system_admin', 'admin']} />}>
                <Route path="/admin/super" element={<SuperAdminPage />} />
                <Route path="/admin/users" element={<UserManagementPage />} />
                <Route path="/admin/roles" element={<RolePermissionManagementPage />} />
                <Route path="/admin/config" element={<SystemConfigPage />} />
                <Route path="/admin/students" element={<MasterStudentDatabasePage />} />
                <Route path="/admin/employers" element={<EmployerManagementPage />} />
                <Route path="/admin/funds" element={<FundPoolsManagementPage />} />
                <Route path="/admin/workflows" element={<SystemWorkflowsPage />} />
                <Route path="/admin/integrations" element={<ApiIntegrationsPage />} />
                <Route path="/admin/logs" element={<SystemLogsPage />} />
                <Route path="/admin/database" element={<DatabaseManagementPage />} />
                <Route path="/admin/maintenance" element={<MaintenanceModePage />} />
                <Route path="/admin/security" element={<SecurityManagementPage />} />
                <Route path="/admin/backups" element={<DatabaseManagementPage />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback Catch-all Route to 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
          </WebSocketProvider>
        </AuthProvider>
    </LanguageProvider>
  </ThemeProvider>
  );
}

export default App;