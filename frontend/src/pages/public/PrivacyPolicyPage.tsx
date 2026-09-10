import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Eye, FileText, ArrowLeft, Building2, Mail, Phone } from 'lucide-react';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export const PrivacyPolicyPage: React.FC = () => {
  const { theme } = useTheme();
  const { isTagalog } = useLanguage();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Navigation Header */}
      <header className={`w-full shadow-md border-b sticky top-0 z-30 transition-colors duration-200 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo-system.png" alt="GovServe Logo" className="h-9 w-9 object-contain bg-blue-50 dark:bg-slate-800 p-1 rounded-xl border border-blue-200 dark:border-slate-700 shadow-xs" />
            <div>
              <span className="font-heading font-extrabold text-lg text-slate-900 dark:text-white leading-none block">GovServe</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Privacy & Data Governance</span>
            </div>
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
            <ArrowLeft className="h-4 w-4" />
            <span>{isTagalog ? 'Bumalik sa Home' : 'Back to Home'}</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="space-y-3 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight">
            {isTagalog ? 'Kebatasang Patakaran sa Pribasya' : 'Privacy Policy & Data Notice'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Effective Date: September 11, 2026 | Quezon City Local Government Unit (LGU) Education & Scholarship Secretariat
          </p>
        </div>

        <div className="space-y-8">
          <section className="space-y-3">
            <h2 className="text-xl font-extrabold font-heading flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Lock className="h-5 w-5" />
              1. Declaration of Data Policy & Legal Mandate
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              The Quezon City Local Government Unit (QCLGU), through the EduScholar Platform, is fully committed to protecting your personal data in accordance with Republic Act No. 10173, otherwise known as the <strong>Data Privacy Act of 2012 (DPA)</strong> of the Philippines, its Implementing Rules and Regulations (IRR), and relevant National Privacy Commission (NPC) issuances.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-6">
            <h2 className="text-xl font-extrabold font-heading flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Eye className="h-5 w-5" />
              2. Personal Data Collected
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              To evaluate scholarship eligibility, process disbursements, and conduct academic verification, EduScholar collects the following information:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 text-slate-600 dark:text-slate-300 pl-2">
              <li><strong>Applicant Profile Data:</strong> Full name, date of birth, residential address in Quezon City, email address, mobile number, QCitizen ID number.</li>
              <li><strong>Academic Records:</strong> School name, course/degree program, general weighted average (GWA), Certificate of Grades (COG), Certificate of Enrollment (COR), Statement of Account (SOA).</li>
              <li><strong>Financial & Household Information:</strong> Household income bracket, tax status disclosures, indigent classification (if applicable).</li>
              <li><strong>System Logs:</strong> IP address, browser metadata, timestamped action logs for security auditing.</li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-6">
            <h2 className="text-xl font-extrabold font-heading flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <FileText className="h-5 w-5" />
              3. Purpose of Processing
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Your personal data is collected and processed exclusively for legitimate educational assistance purposes:
            </p>
            <ol className="list-decimal list-inside text-sm space-y-1 text-slate-600 dark:text-slate-300 pl-2">
              <li>Verification of residency, QCitizen status, and academic standing with partner educational institutions.</li>
              <li>Scoring and ranking scholarship applications against official municipal selection criteria.</li>
              <li>Treasury authorization, allowance payroll distribution, and audit reporting.</li>
              <li>Direct communications regarding application updates, document re-submission, or renewal schedules.</li>
            </ol>
          </section>

          <section className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-6">
            <h2 className="text-xl font-extrabold font-heading text-blue-600 dark:text-blue-400">
              4. Data Retention & Erasure
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Personal records of active scholars are retained for the duration of the grant plus five (5) years for statutory municipal auditing. Non-qualifying applicant profiles are securely purged after two (2) years unless requested earlier under your Right to Erasure under RA 10173.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-6">
            <h2 className="text-xl font-extrabold font-heading text-blue-600 dark:text-blue-400">
              5. Data Privacy Rights of Applicants
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Under RA 10173, as a data subject you possess the following rights:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 text-slate-600 dark:text-slate-300 pl-2">
              <li>Right to be informed of how your data is processed.</li>
              <li>Right to access your stored personal information.</li>
              <li>Right to object to unauthorized processing.</li>
              <li>Right to rectification of incorrect or outdated records.</li>
              <li>Right to data portability and right to file complaints before the National Privacy Commission (NPC).</li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-6">
            <h2 className="text-xl font-extrabold font-heading text-blue-600 dark:text-blue-400">
              6. Data Protection Officer (DPO) Contact Details
            </h2>
            <div className={`p-4 rounded-2xl border text-sm space-y-2 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <p className="font-bold text-slate-900 dark:text-white">Quezon City Government Data Privacy Office</p>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs">
                <Building2 className="h-4 w-4 text-blue-500 shrink-0" />
                <span>Quezon City Hall Complex, Elliptical Road, Diliman, Quezon City, Metro Manila</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs">
                <Mail className="h-4 w-4 text-blue-500 shrink-0" />
                <span>dpo@quezoncity.gov.ph | support.edu2026@gmail.com</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs">
                <Phone className="h-4 w-4 text-blue-500 shrink-0" />
                <span>QC Helpline 122 / (02) 8988-4242</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default PrivacyPolicyPage;
