import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, CheckCircle2, ArrowLeft, Building2, Scale } from 'lucide-react';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export const TermsConditionsPage: React.FC = () => {
  const { theme } = useTheme();
  const { isTagalog } = useLanguage();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <header className={`w-full shadow-md border-b sticky top-0 z-30 transition-colors duration-200 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo-system.png" alt="GovServe Logo" className="h-9 w-9 object-contain bg-blue-50 dark:bg-slate-800 p-1 rounded-xl border border-blue-200 dark:border-slate-700 shadow-xs" />
            <div>
              <span className="font-heading font-extrabold text-lg text-slate-900 dark:text-white leading-none block">GovServe</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Terms of Service & Rules</span>
            </div>
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
            <ArrowLeft className="h-4 w-4" />
            <span>{isTagalog ? 'Bumalik sa Home' : 'Back to Home'}</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
            <Scale className="h-4 w-4" />
            <span>Official Government Portal Service Terms</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight">
            {isTagalog ? 'Mga Alituntunin at Kondisyon' : 'Terms & Conditions of Service'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Last Updated: September 11, 2026 | Quezon City Local Government Unit
          </p>
        </div>

        <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <section className="space-y-3">
            <h2 className="text-xl font-extrabold font-heading text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              1. Acceptance & Authorization
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              By registering an account, submitting documents, or accessing services on EduScholar (`eduscholar.up.railway.app`), you explicitly agree to comply with and be bound by these Terms and Conditions. This portal is maintained by the Local Government Unit of Quezon City for qualified resident applicants.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-6">
            <h2 className="text-xl font-extrabold font-heading text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              2. Applicant Eligibility & Accuracy Declaration
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Applicants must be bona fide residents of Quezon City possessing a valid QCitizen ID or verified residency proof. All uploaded documents (COG, COR, SOA, ID credentials) must be authentic. Submitting falsified documents constitutes fraud punishable under Revised Penal Code Art. 172 and leads to immediate disqualification and grant recovery.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-6">
            <h2 className="text-xl font-extrabold font-heading text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              3. Account Security & OTP Credentials
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Users are responsible for maintaining the confidentiality of their 2FA One-Time Passwords (OTP) and login credentials. Any activity conducted under your registered email account will be attributed to you.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-6">
            <h2 className="text-xl font-extrabold font-heading text-blue-600 dark:text-blue-400">
              4. Termination & Disqualification
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              The QC LGU Education Secretariat reserves the right to suspend or revoke scholarship grants upon failure to meet semestral grade retention requirements (GWA standards), failure to submit periodic COG renewals, or violation of municipal codes.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default TermsConditionsPage;
