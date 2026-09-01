import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  Sun,
  Moon,
  DollarSign,
  FileText,
  CheckCircle2,
  Layers,
  RefreshCw,
  Scale,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export const ScholarEguidePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, isTagalog } = useLanguage();
  const [eservicesOpen, setEservicesOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'matrix' | 'procedures' | 'governance' | 'policies'>('matrix');

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (eservicesOpen && !target.closest('.eguide-eservices-dropdown')) {
        setEservicesOpen(false);
      }
      if (userDropdownOpen && !target.closest('.eguide-user-dropdown')) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [eservicesOpen, userDropdownOpen]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/20 transition-colors duration-200 flex flex-col justify-between">
      {/* Top Header Navbar */}
      <header className="w-full bg-white dark:bg-slate-900 shadow-md shadow-slate-200/80 dark:shadow-slate-950/50 border-b border-slate-200 dark:border-slate-800 relative z-30 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/logo-system.png"
                alt="GovServe Logo"
                className="h-9 w-9 object-contain bg-blue-50 dark:bg-slate-800 p-1 rounded-xl border border-blue-200 dark:border-slate-700 shadow-xs"
              />
              <div>
                <span className="font-heading font-extrabold text-lg text-slate-900 dark:text-white leading-none block">GovServe</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Campus Aid Hub Portal</span>
              </div>
            </Link>

            {/* Header Navigation */}
            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                to="/"
                className="flex items-center px-3 py-2 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <span>{t('nav.home')}</span>
              </Link>

              {/* eSERVICES Dropdown */}
              <div className="relative eguide-eservices-dropdown">
                <button
                  onClick={() => setEservicesOpen(!eservicesOpen)}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 transition-all cursor-pointer"
                >
                  <span>{t('nav.eservices')}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-blue-500" />
                </button>

                {eservicesOpen && (
                  <div className="absolute left-0 top-11 w-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden z-50 p-2 animate-in fade-in duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 rounded-xl mb-1">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{t('nav.available')}</p>
                    </div>

                    <Link
                      to="/education-scholarship"
                      onClick={() => setEservicesOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 hover:bg-blue-100/80 dark:hover:bg-blue-900/40 transition-all mb-1 group"
                    >
                      <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        🎓
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-extrabold text-blue-900 dark:text-blue-200 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                            {t('nav.eduScholarTitle')}
                          </p>
                          <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">{t('nav.primary')}</span>
                        </div>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                          E-SCHOLAR Hub, LGU QC Grants, Alumni Sheet, QCU Portal
                        </p>
                      </div>
                    </Link>

                    <Link
                      to="/e-scholar"
                      onClick={() => setEservicesOpen(false)}
                      className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                      <span className="text-sm">⚡</span> {t('nav.hub')}
                    </Link>

                    <Link
                      to="/scholar-prog-available"
                      onClick={() => setEservicesOpen(false)}
                      className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                      <span className="text-sm">🎓</span> {t('nav.programs')}
                    </Link>

                    <Link
                      to="/scholar-eguide"
                      onClick={() => setEservicesOpen(false)}
                      className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                      <span className="text-sm">📖</span> {t('nav.eguide')}
                    </Link>

                    <Link
                      to={user ? '/dashboard' : '/login'}
                      onClick={() => setEservicesOpen(false)}
                      className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border-t border-slate-100 dark:border-slate-800 mt-1 pt-2"
                    >
                      <span className="text-sm">⚡</span> {t('nav.portal')} {user ? `(${t('nav.dashboard')})` : `(${t('nav.signin')})`}
                    </Link>
                  </div>
                )}
              </div>

              <a
                href="/citizens_charter.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-2 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <span className="hidden md:inline">{t('nav.charter')}</span>
                <span className="md:hidden">{isTagalog ? 'KARTA' : 'CHARTER'}</span>
              </a>

              <Link
                to="/contact"
                className="flex items-center px-3 py-2 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <span className="hidden md:inline">{t('nav.contact')}</span>
                <span className="md:hidden">{isTagalog ? 'KONTAK' : 'CONTACT'}</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <LanguageSwitcher />

            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </button>

            {user ? (
              <div className="relative eguide-user-dropdown">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 px-2.5 text-slate-800 dark:text-slate-200 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-extrabold text-white shadow-xs">
                    {user.name?.charAt(0).toUpperCase() ?? 'U'}
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white hidden sm:inline">{user.name}</span>
                </button>
                {userDropdownOpen && (
                  <div className="absolute right-0 top-11 w-48 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 shadow-xl z-50">
                    <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <p className="text-xs font-bold truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-400 capitalize font-mono">
                        {user.role === 'student'
                          ? `Application ID: ${user.application_code || user.reference_id || user.applicationId || user.application_id || (user.id ? `APP-2026-${String(user.id).padStart(4, '0')}` : 'APP-2026-0001')}`
                          : user.role?.replace('_', ' ')}
                      </p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full block rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                    >
                      {t('nav.dashboard')}
                    </Link>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer border-t border-slate-100 dark:border-slate-800 mt-1 pt-1.5"
                    >
                      {t('nav.signout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/signup" className="hidden sm:inline-flex">
                  <Button variant="outline" size="sm" className="font-bold border-slate-300 dark:border-slate-700 text-xs">
                    {t('nav.signup')}
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="primary" size="sm" className="font-extrabold shadow-md shadow-blue-600/30 text-xs">
                    {t('nav.signin')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Full-Width Hero Banner Section - Matching E-Scholar */}
      <div
        className="w-full relative overflow-hidden bg-center bg-no-repeat shadow-lg border-b border-slate-700/40 text-white py-12 sm:py-16 lg:py-20 transition-all duration-300"
        style={{
          backgroundImage: theme === 'dark' ? "url('/Darkmode.jpg')" : "url('/Lightmode.jpg')",
          backgroundSize: '100% 100%'
        }}
      >
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${theme === 'dark' ? 'bg-slate-950/40' : 'bg-slate-950/20'}`} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2">
            <Link
              to="/education-scholarship"
              className="text-xs font-extrabold text-blue-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {t('nav.eduScholarTitle')}
            </Link>
            <span className="text-slate-400 text-xs">/</span>
            <span className="text-xs font-bold text-slate-200">
              {t('eguide.breadcrumb')}
            </span>
          </div>

          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-snug drop-shadow-md">
            {t('eguide.heroTitle')}
          </h1>

          <p className="text-base sm:text-lg text-slate-100 leading-relaxed font-semibold max-w-3xl drop-shadow-sm">
            {t('eguide.heroSubtitle')}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto space-y-8 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300 pb-16 flex-1 w-full">
        {/* Navigation Tabs for E-Guide Sections */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3.5">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'matrix'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-sm'
            }`}
          >
            <DollarSign className="h-4 w-4 text-current shrink-0" />
            <span>{t('eguide.tabMatrix')}</span>
          </button>

          <button
            onClick={() => setActiveTab('procedures')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'procedures'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-sm'
            }`}
          >
            <RefreshCw className="h-4 w-4 text-current shrink-0" />
            <span>{t('eguide.tabProcedures')}</span>
          </button>

          <button
            onClick={() => setActiveTab('governance')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'governance'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-sm'
            }`}
          >
            <Scale className="h-4 w-4 text-current shrink-0" />
            <span>{t('eguide.tabGovernance')}</span>
          </button>

          <button
            onClick={() => setActiveTab('policies')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'policies'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-sm'
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-current shrink-0" />
            <span>{t('eguide.tabPolicies')}</span>
          </button>
        </div>

        {/* TAB 1: Official Benefits & Grant Matrix */}
        {activeTab === 'matrix' && (
          <section className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white">
                Official Benefits & Grant Matrix
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Complete schedule of maximum tuition fee grants and living stipends per school year authorized under QC Ordinance No. SP-3283, S-2024.
              </p>
            </div>

            <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-extrabold border-b border-slate-200 dark:border-slate-700">
                      <th className="p-4 pl-6">Scholarship Category</th>
                      <th className="p-4">Sub-Category / Track</th>
                      <th className="p-4">Tuition Fee Grant / Year (Max)</th>
                      <th className="p-4 pr-6">Stipend Per School Year</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {/* Senior High School */}
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td rowSpan={4} className="p-4 pl-6 font-bold text-slate-900 dark:text-white align-top border-r border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900">
                        Scholarship for Senior High School Students
                      </td>
                      <td className="p-4 font-semibold">Academic Scholarship</td>
                      <td className="p-4 font-bold text-blue-600 dark:text-blue-400">PHP 20,000</td>
                      <td className="p-4 pr-6 font-bold text-emerald-600 dark:text-emerald-400">PHP 10,000</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-4 font-semibold">Specialized Track Scholarship</td>
                      <td className="p-4 font-bold text-blue-600 dark:text-blue-400">PHP 20,000</td>
                      <td className="p-4 pr-6 font-bold text-emerald-600 dark:text-emerald-400">PHP 10,000</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-4 font-semibold">Athletic and Arts Scholarship</td>
                      <td className="p-4 font-bold text-blue-600 dark:text-blue-400">PHP 20,000</td>
                      <td className="p-4 pr-6 font-bold text-emerald-600 dark:text-emerald-400">PHP 10,000</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-4 font-semibold">Youth Leaders Scholarship</td>
                      <td className="p-4 font-bold text-blue-600 dark:text-blue-400">PHP 20,000</td>
                      <td className="p-4 pr-6 font-bold text-emerald-600 dark:text-emerald-400">PHP 10,000</td>
                    </tr>

                    {/* Tertiary */}
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 border-t-2 border-slate-200 dark:border-slate-700">
                      <td rowSpan={5} className="p-4 pl-6 font-bold text-slate-900 dark:text-white align-top border-r border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900">
                        Scholarship for Tertiary (College) Students
                      </td>
                      <td className="p-4 font-semibold">QC Excel Scholarship*</td>
                      <td className="p-4 font-bold text-blue-600 dark:text-blue-400">PHP 110,000</td>
                      <td className="p-4 pr-6 font-bold text-emerald-600 dark:text-emerald-400">PHP 50,000</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-4 font-semibold">Academic Scholarship</td>
                      <td className="p-4 font-bold text-blue-600 dark:text-blue-400">PHP 80,000</td>
                      <td className="p-4 pr-6 font-bold text-emerald-600 dark:text-emerald-400">PHP 25,000</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-4 font-semibold">Athletic and Arts Scholarship</td>
                      <td className="p-4 font-bold text-blue-600 dark:text-blue-400">PHP 55,000</td>
                      <td className="p-4 pr-6 font-bold text-emerald-600 dark:text-emerald-400">PHP 25,000</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-4 font-semibold">Youth Leaders Scholarship</td>
                      <td className="p-4 font-bold text-blue-600 dark:text-blue-400">PHP 55,000</td>
                      <td className="p-4 pr-6 font-bold text-emerald-600 dark:text-emerald-400">PHP 25,000</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-4 font-semibold">Economic Scholarship (Need-Based)</td>
                      <td className="p-4 font-bold text-blue-600 dark:text-blue-400">PHP 5,000 / sem <span className="text-[11px] font-normal block text-slate-500">(PHP 10,000 / yr)</span></td>
                      <td className="p-4 pr-6 font-bold text-emerald-600 dark:text-emerald-400">PHP 5,000 / sem <span className="text-[11px] font-normal block text-slate-500">(PHP 10,000 / yr)</span></td>
                    </tr>

                    {/* Postgraduate */}
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 border-t-2 border-slate-200 dark:border-slate-700">
                      <td className="p-4 pl-6 font-bold text-slate-900 dark:text-white">
                        Scholarship for Postgraduate Students**
                      </td>
                      <td className="p-4 font-semibold">Postgraduate / Thesis Grant</td>
                      <td className="p-4 font-bold text-blue-600 dark:text-blue-400">PHP 55,000</td>
                      <td className="p-4 pr-6 font-bold text-emerald-600 dark:text-emerald-400">PHP 50,000**</td>
                    </tr>

                    {/* Continuing Education / Tech-Voc */}
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-4 pl-6 font-bold text-slate-900 dark:text-white">
                        Continuing Education / Vocational Courses
                      </td>
                      <td className="p-4 font-semibold">Short Courses & Board/Bar Review</td>
                      <td className="p-4 text-slate-400 font-medium">—</td>
                      <td className="p-4 pr-6 font-bold text-emerald-600 dark:text-emerald-400">PHP 10,000</td>
                    </tr>

                    {/* Creative Writing */}
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-4 pl-6 font-bold text-slate-900 dark:text-white">
                        Filipino Language & Creative Writing
                      </td>
                      <td className="p-4 font-semibold">Creative Writing and Literary Grant</td>
                      <td className="p-4 text-slate-400 font-medium">—</td>
                      <td className="p-4 pr-6 font-bold text-emerald-600 dark:text-emerald-400">
                        ₱10,000 (Fixed) + ₱30,000 (Pub. Aid)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 space-y-1.5 leading-relaxed">
                <p>
                  <strong>*QC Excel Scholarship:</strong> Requires Top 10 High School GWA or Top 5% in University, subject to enrollment in priority CHED/LGU identified programs.
                </p>
                <p>
                  <strong>**Postgraduate Grant Note:</strong> Base financial stipend is ₱20,000. An additional ₱30,000 is released upon formal approval and submission of Thesis/Dissertation defense proposals.
                </p>
                <p>
                  <strong>Disbursement Frequency:</strong> Tuition fee grants are credited directly to partner schools upon SOA submission; living stipends are disbursed semestrally (or annually for SHS) to the scholar's registered digital cash account.
                </p>
              </div>
            </Card>
          </section>
        )}

        {/* TAB 2: Application & Renewal Procedures */}
        {activeTab === 'procedures' && (
          <section className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white">
                Step-by-Step Application & Renewal Procedures
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Official guide for onboarding new QC scholars and renewing active scholarship accounts each term.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Procedure 1: New Applicants */}
              <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-soft space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="h-11 w-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
                      Procedure for New Applicants
                    </h3>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">10-Step Digital Onboarding</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                  {[
                    { step: '01', title: 'QCitizen ID Registration', desc: 'Secure an active QCitizen ID through the QC eServices Portal.' },
                    { step: '02', title: 'Portal Sign-in', desc: 'Log in to QC eServices website using your verified QCitizen ID credentials.' },
                    { step: '03', title: 'Form & General Requirements', desc: 'Fill out online application form and upload certified GWA grades, Certificate of Registration (COR), and Enrollment Proof.' },
                    { step: '04', title: 'Evaluator Interview', desc: 'Undergo online or in-person evaluation interview with QCYDO scholarship officers.' },
                    { step: '05', title: 'Track Document Submission', desc: 'Upload track-specific documents (e.g., coach endorsement for athletic, barangay need cert for economic).' },
                    { step: '06', title: 'Approval Notification', desc: 'Receive official eligibility and committee approval notice via SMS and portal inbox.' },
                    { step: '07', title: 'Certificate of Scholarship', desc: 'Download your official digital Certificate of Scholarship directly from the portal.' },
                    { step: '08', title: 'Sworn Attestation & Contract', desc: 'Claim and sign the Sworn Attestation and Scholarship Agreement at the QCYDO office.' },
                    { step: '09', title: 'Statement of Account (SOA)', desc: 'Upload certified Statement of Account (SOA) issued by your educational institution.' },
                    { step: '10', title: 'Electronic Disbursement', desc: 'Receive stipend and tuition electronic release notice via registered GCash / QCitizen Cash Card.' }
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="h-6 w-6 rounded-lg bg-blue-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0">
                        {item.step}
                      </span>
                      <div>
                        <p className="font-extrabold text-slate-900 dark:text-white text-xs">{item.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Procedure 2: Existing Scholars Renewal */}
              <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-soft space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="h-11 w-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <RefreshCw className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
                      Scholarship Renewal (Existing Scholars)
                    </h3>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">6-Step Term Validation</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                  {[
                    { step: '01', title: 'Portal Login', desc: 'Log in to QC eServices using registered QCitizen email account during the announced renewal window.' },
                    { step: '02', title: 'Upload Academic Credentials', desc: 'Submit previous term Transcript of Records (TOR) or Form 137/138 and current semester Certificate of Registration (COR).' },
                    { step: '03', title: 'Special Case Documents (If applicable)', desc: 'Attach Appeal Form if GWA is slightly below threshold due to valid medical/family reason, or submit LOA notice if deferring.' },
                    { step: '04', title: 'Automated Evaluation Check', desc: 'QCYDO automated system checks grade threshold and verifies school standing for continued eligibility.' },
                    { step: '05', title: 'Upload New Statement of Account (SOA)', desc: 'Submit updated school billing statement for the new academic semester.' },
                    { step: '06', title: 'Stipend Release & Confirmation', desc: 'Receive electronic stipend and tuition remittance confirmation via QCitizen Cash Card.' }
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="h-6 w-6 rounded-lg bg-emerald-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0">
                        {item.step}
                      </span>
                      <div>
                        <p className="font-extrabold text-slate-900 dark:text-white text-xs">{item.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 text-[11px] text-emerald-900 dark:text-emerald-200">
                  <strong>Important Renewal Schedule:</strong> Senior High School scholars renew annually at the end of each school year. Tertiary and Postgraduate scholars renew every semester.
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* TAB 3: SSC Governance */}
        {activeTab === 'governance' && (
          <section className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white">
                Scholarship Screening Committee (SSC) Governance
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Statutory functions, committee representation, and oversight mandates under Quezon City Ordinance No. SP-3283, S-2024.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-soft space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                    <Scale className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
                      Key SSC Mandates & Powers
                    </h3>
                    <span className="text-xs text-slate-400 font-semibold">City-Wide Scholarship Oversight</span>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <span className="text-purple-600 font-extrabold">✓</span>
                    <span><strong>Policy & Ordinance Execution:</strong> Directs and supervises city-wide implementation of Ordinance SP-3283 across all 6 districts.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-purple-600 font-extrabold">✓</span>
                    <span><strong>Rules & Regulation Formulation:</strong> Standardizes application procedures, eligibility guidelines, and termination protocols.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-purple-600 font-extrabold">✓</span>
                    <span><strong>Roster of Scholars Approval:</strong> Reviews and formally adopts the certified Roster of Scholars formulated by QCYDO.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-purple-600 font-extrabold">✓</span>
                    <span><strong>Appeals & Special Cases:</strong> Adjudicates scholar appeal petitions regarding GWA exemptions, grade retention, and leave of absence requests.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-purple-600 font-extrabold">✓</span>
                    <span><strong>Fund Allocation Advisory:</strong> Recommends scholarship budget appropriations to the City Council and Local Finance Committee.</span>
                  </li>
                </ul>
              </Card>

              <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-soft space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
                      Committee Composition
                    </h3>
                    <span className="text-xs text-slate-400 font-semibold">Representation & Voting Members</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                    <strong className="text-slate-900 dark:text-white block">Head of Committee:</strong>
                    <span className="text-slate-600 dark:text-slate-400">City Mayor of Quezon City</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                    <strong className="text-slate-900 dark:text-white block">Chairperson:</strong>
                    <span className="text-slate-600 dark:text-slate-400">City Administrator</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                    <strong className="text-slate-900 dark:text-white block">Institutional Members:</strong>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                      Sangguniang Panlungsod Chairperson on Education • Head, Quezon City Youth Development Office (QCYDO) • Schools Division Superintendent, DepEd QC • President, Quezon City University (QCU) • SK Federation President • City Treasurer • City Budget Officer • Head, Social Services Development Department (SSDD).
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* TAB 4: General Policies & Retention */}
        {activeTab === 'policies' && (
          <section className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white">
                General Eligibility & Retention Policies
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Core academic, residency, and civic participation guidelines for maintaining active scholarship status.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-soft space-y-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white">
                  Residency & Identity
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Applicants must be bona fide residents of Quezon City for at least 1 to 3 years (depending on category) with a registered, verified QCitizen ID card.
                </p>
              </Card>

              <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-soft space-y-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white">
                  Grade Retention Threshold
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Scholars must maintain the minimum General Weighted Average (GWA) required per track (85% to 90% for Academic/Excel; passing for Need-Based) with no unexcused failing grades.
                </p>
              </Card>

              <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-soft space-y-3">
                <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white">
                  Community & Civic Service
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Scholars are encouraged to actively participate in QCYDO youth engagement programs, civic initiatives, and community service activities across Quezon City.
                </p>
              </Card>
            </div>
          </section>
        )}

        {/* Bottom CTA Actions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-soft">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mx-auto border border-blue-200 dark:border-blue-800">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h3 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
            Ready to View Tracks or Apply?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Explore the available scholarship tracks and documentary requirements, or sign in to submit your scholarship application.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to="/scholar-prog-available">
              <Button variant="primary" size="md" className="font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/30">
                Explore Available Programs →
              </Button>
            </Link>
            <Link to="/apply">
              <Button variant="outline" size="md" className="font-bold border-slate-300 dark:border-slate-700">
                Start Scholarship Application
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Public Footer */}
      <footer className="bg-slate-900 text-slate-300 py-10 px-4 sm:px-6 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo-system.png" alt="GovServe" className="h-7 w-7 object-contain" />
            <span className="font-heading font-extrabold text-white text-sm">GovServe — Campus Aid Hub</span>
          </div>
          <p className="text-slate-400 text-center sm:text-right">
            Quezon City Youth Development Office (QCYDO) • Ordinance No. SP-3283, S-2024
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ScholarEguidePage;
