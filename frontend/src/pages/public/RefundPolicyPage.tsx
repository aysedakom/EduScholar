import React from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, ArrowLeft, CheckCircle2, ShieldCheck, HeartHandshake } from 'lucide-react';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export const RefundPolicyPage: React.FC = () => {
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
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Fee Disclosure & Guarantee</span>
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            <BadgeCheck className="h-4 w-4" />
            <span>100% Free Public Government Service</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight">
            {isTagalog ? 'Polisiya sa Bayad at Libreng Serbisyo' : 'Fee Disclosure & Refund Policy'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Official Municipal Statement | Quezon City Local Government Unit
          </p>
        </div>

        <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <section className="space-y-3">
            <h2 className="text-xl font-extrabold font-heading text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <HeartHandshake className="h-5 w-5" />
              1. Absolutely Zero Application Fees
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              The Quezon City Local Government Unit explicitly mandates that all educational aid programs, scholarship applications, evaluations, certificates, and student portal services provided through EduScholar are <strong>100% FREE OF CHARGE</strong> to all QCitizens.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-6">
            <h2 className="text-xl font-extrabold font-heading text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              2. Anti-Fixer & Anti-Extortion Protection
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Under RA 11032 (Ease of Doing Business and Efficient Government Service Delivery Act of 2018), soliciting, collecting, or accepting any processing fees, "assistance charges", or illegal payments by any employee, fixer, or third party is strictly prohibited. Report any extortion attempts immediately to QC Anti-Fixing Hotline 122.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-6">
            <h2 className="text-xl font-extrabold font-heading text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              3. Refund Non-Applicability Statement
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Because no monetary transactions or fees are ever collected from applicants or scholars, financial refunds are non-applicable. All grant disbursements released via Treasury are direct non-repayable municipal financial assistance.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default RefundPolicyPage;
