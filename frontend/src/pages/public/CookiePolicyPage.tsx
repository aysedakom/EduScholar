import React from 'react';
import { Link } from 'react-router-dom';
import { Cookie, ShieldCheck, ArrowLeft, Info, Settings } from 'lucide-react';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export const CookiePolicyPage: React.FC = () => {
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
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Cookie Governance</span>
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
            <Cookie className="h-4 w-4" />
            <span>Data Transparency & Cookie Disclosure</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight">
            {isTagalog ? 'Patakaran sa Cookie at Local Storage' : 'Cookie & Browser Storage Policy'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Quezon City Local Government Unit | Updated: September 11, 2026
          </p>
        </div>

        <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <section className="space-y-3">
            <h2 className="text-xl font-extrabold font-heading text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <Info className="h-5 w-5" />
              1. What Are Cookies & Local Storage?
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Cookies and local browser storage are small text files placed on your device when visiting EduScholar. They allow the platform to remember your active session, language preference (English/Tagalog), and theme mode (Dark/Light) without requiring re-authentication on every page.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-6">
            <h2 className="text-xl font-extrabold font-heading text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              2. Categories of Storage We Use
            </h2>
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Strictly Necessary Cookies (Essential)</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Required for user authentication, JSON Web Tokens (JWT), 2FA session tokens, and security CSRF protection. Cannot be disabled.
                </p>
              </div>
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Preference Cookies (Functional)</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Remembers your chosen language (`qc_lang`), visual theme preference (`qc_theme`), and notification drawer state.
                </p>
              </div>
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">No Advertising / No Third-Party Tracking</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  EduScholar does <strong>NOT</strong> place third-party advertising cookies, behavioral tracking scripts, or sell user data to ad networks.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-6">
            <h2 className="text-xl font-extrabold font-heading text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              3. How to Control Your Cookie Settings
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              You can clear or block cookies at any time through your web browser settings (Chrome, Edge, Firefox, Safari). Note that clearing essential authentication cookies will sign you out of your EduScholar dashboard.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default CookiePolicyPage;
