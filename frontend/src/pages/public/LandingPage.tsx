import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  WalletCards,
  Sun,
  Moon,
  ChevronDown,
  ShieldCheck,
  FolderLock,
  Globe,
  Award,
  BookOpen,
  Phone,
  ArrowUpRight,
  Compass,
  ShieldAlert,
  ExternalLink
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher';

export const LandingPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const [eservicesOpen, setEservicesOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Automatically direct logged-in administrators and staff to their command center dashboard
  useEffect(() => {
    if (user && user.role !== 'student') {
      if (user.role === 'system_admin') {
        navigate('/admin/super', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  // Typewriter Tagline Animation Effect matching photo
  const TYPE_TEXTS = [
    'Every Scholar.',
    'Every Dream.',
    'Every Future.',
    'Every Scholar. Every Dream. Every Future.'
  ];
  const [textIndex, setTextIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Accordion Dropdowns state for How to Apply workflow
  const [openDrawers, setOpenDrawers] = useState<{ [key: string]: boolean }>({
    howToApply: true,
  });

  const toggleDrawer = (key: string) => {
    setOpenDrawers((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (eservicesOpen && !target.closest('.landing-eservices-dropdown')) {
        setEservicesOpen(false);
      }
      if (userDropdownOpen && !target.closest('.landing-user-dropdown')) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [eservicesOpen, userDropdownOpen]);

  useEffect(() => {
    const currentFullText = TYPE_TEXTS[textIndex];

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setDisplayedText(currentFullText.slice(0, displayedText.length + 1));
        if (displayedText.length + 1 === currentFullText.length) {
          setTimeout(() => setIsDeleting(true), 1600);
        }
      } else {
        setDisplayedText(currentFullText.slice(0, displayedText.length - 1));
        if (displayedText.length === 0) {
          setIsDeleting(false);
          setTextIndex((prev) => (prev + 1) % TYPE_TEXTS.length);
        }
      }
    }, isDeleting ? 45 : 95);

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, textIndex]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-600/20 transition-colors duration-200">
      {/* Top Navbar */}
      <header className="w-full bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-40 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo-system.png" alt="GovServe Logo" className="h-9 w-9 object-contain bg-blue-50 dark:bg-slate-800 p-1 rounded-xl border border-blue-200/80 dark:border-slate-700 shadow-xs" />
              <div>
                <span className="font-heading font-extrabold text-lg text-slate-900 dark:text-white leading-none block">GovServe</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Campus Aid Hub Portal</span>
              </div>
            </Link>

            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                to="/"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <span>{t('nav.home')}</span>
              </Link>

              {/* eSERVICES Dropdown */}
              <div className="relative landing-eservices-dropdown">
                <button
                  onClick={() => setEservicesOpen(!eservicesOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 transition-all cursor-pointer"
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
                          <p className="text-xs font-extrabold text-blue-900 dark:text-blue-200 group-hover:text-blue-700 dark:group-hover:text-blue-300">{t('nav.eduScholarTitle')}</p>
                          <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">{t('nav.primary')}</span>
                        </div>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">E-SCHOLAR Hub, LGU QC Grants, Alumni Sheet, QCU Portal</p>
                      </div>
                    </Link>

                    <a
                      href="https://govservedrrm.up.railway.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setEservicesOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 hover:bg-amber-100/80 dark:hover:bg-amber-900/40 transition-all mb-1 group"
                    >
                      <div className="h-8 w-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        <ShieldAlert className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-extrabold text-amber-900 dark:text-amber-300 group-hover:text-amber-700 dark:group-hover:text-amber-200">Disaster Risk Reduction (DRRM)</p>
                          <ExternalLink className="h-3 w-3 text-amber-500 shrink-0" />
                        </div>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Emergency Response, Weather & Evacuation Center Monitoring</p>
                      </div>
                    </a>

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
                className="hidden md:flex items-center px-3 py-2 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <span>{t('nav.charter')}</span>
              </a>

              <Link
                to="/contact"
                className="hidden sm:flex items-center px-3 py-2 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <span>{t('nav.contact')}</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />

            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </button>

            {user ? (
              <div className="relative landing-user-dropdown">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 px-3 text-slate-800 dark:text-slate-200 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-extrabold text-white shadow-xs">
                    {user.name?.charAt(0).toUpperCase() ?? 'U'}
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white hidden sm:inline">{user.name}</span>
                </button>
                {userDropdownOpen && (
                  <div className="absolute right-0 top-11 w-44 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 shadow-medium z-50">
                    <Link
                      to="/dashboard"
                      className="w-full block rounded-xl px-3 py-2 text-left text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                    >
                      {t('nav.dashboard')}
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full rounded-xl px-3 py-2 text-left text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-600 dark:text-rose-400 cursor-pointer"
                    >
                      {t('nav.signout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/signup" className="hidden sm:inline-flex">
                  <button className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer">
                    {t('nav.signup')}
                  </button>
                </Link>
                <Link to="/login">
                  <button className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-xs font-extrabold text-white shadow-sm transition-all cursor-pointer">
                    {t('nav.signin')}
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section matching design photo */}
      <section className="relative pt-16 pb-16 px-4 sm:px-6 max-w-7xl mx-auto text-center space-y-7 animate-in fade-in duration-300">
        <h1 className="font-heading font-extrabold text-4xl sm:text-6xl lg:text-[3.5rem] tracking-tight text-slate-900 dark:text-white leading-[1.15] max-w-4xl mx-auto">
          Education and Scholarship
        </h1>

        {/* Animated Typewriter line */}
        <p className="text-2xl sm:text-3xl font-mono font-bold text-blue-600 dark:text-blue-400 h-9 flex items-center justify-center">
          <span>{displayedText}</span>
          <span className="animate-pulse ml-0.5 font-sans font-normal">|</span>
        </p>

        {/* User-friendly concise paragraph */}
        <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed font-normal">
          Education is the great equalizer and in Quezon City, we're making sure every young QCitizen has a fair shot at their future. The Quezon City Scholarship Program (QCSP) isn't just about tuition assistance; it's about unlocking potential, breaking cycles of poverty, and building a generation of leaders who will shape our city and nation.
        </p>
      </section>

      {/* Stats Counter Row matching photo */}
      {/* Stats Counter Row */}
      <section className="py-10 bg-white dark:bg-slate-900 border-y border-slate-200/90 dark:border-slate-800 transition-colors duration-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
          <div>
            <p className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">50,000+</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Scholars Empowered Since 2019</p>
          </div>
          <div>
            <p className="font-heading font-extrabold text-3xl sm:text-4xl text-emerald-600 dark:text-emerald-400">₱160,000</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Max Annual Grant per Scholar</p>
          </div>
          <div>
            <p className="font-heading font-extrabold text-3xl sm:text-4xl text-purple-600 dark:text-purple-400">100%</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Digital Processing</p>
          </div>
        </div>
      </section>

      {/* Core Scholarship Services & Portals Gateway */}
      <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-1.5">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Official QC Scholarship Hub
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Access Education & Scholarship Services
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Choose an active portal below to explore grant programs, submit applications, or read official guidelines
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Gateway 1: E-SCHOLAR Hub */}
          <Link
            to="/e-scholar"
            className="group p-6 rounded-3xl bg-gradient-to-br from-blue-50/90 via-white to-blue-100/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 shadow-soft hover:shadow-xl hover:border-blue-500 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                  Online Services
                </span>
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  E-SCHOLAR Hub
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Start a new application, submit semestral renewal, record alumni tracer sheet, or access QCU student portal.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-3 border-t border-blue-100 dark:border-slate-800 flex items-center justify-between text-xs font-extrabold text-blue-600 dark:text-blue-400">
              <span>Open E-SCHOLAR Hub</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          {/* Gateway 2: Available Scholarship Programs */}
          <Link
            to="/scholar-prog-available"
            className="group p-6 rounded-3xl bg-gradient-to-br from-indigo-50/90 via-white to-indigo-100/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 shadow-soft hover:shadow-xl hover:border-indigo-500 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                  <BookOpen className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                  4 Levels • 12 Tracks
                </span>
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Available Programs
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Browse Senior High School, Tertiary (College), Postgraduate, and Vocational scholarship tracks and requirements.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-3 border-t border-indigo-100 dark:border-slate-800 flex items-center justify-between text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
              <span>Explore Programs & Apply</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          {/* Gateway 3: Scholar E-Guide */}
          <Link
            to="/scholar-eguide"
            className="group p-6 rounded-3xl bg-gradient-to-br from-emerald-50/90 via-white to-emerald-100/30 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 shadow-soft hover:shadow-xl hover:border-emerald-500 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Official Handbook
                </span>
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Scholar E-Guide
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Review complete grant amounts, semestral stipends, GWA grade qualifications, and Screening Committee guidelines.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-3 border-t border-emerald-100 dark:border-slate-800 flex items-center justify-between text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
              <span>Read Scholar Handbook</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Comprehensive Financial Assistance Features */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-slate-900 dark:text-white">
            Comprehensive Financial Assistance Features
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-xl mx-auto font-medium">
            Designed for students, financial aid officers, and educational coordinators.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Beyond Tuition */}
          <Link to="/scholar-prog-available" className="block">
            <Card hoverEffect className="bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-soft h-full cursor-pointer">
              <CardHeader className="p-6 space-y-3">
                <div className="h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                  <WalletCards className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white">Financial Support Beyond Tuition</CardTitle>
                <CardDescription className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 font-normal">
                  Tuition fee grants alongside regular stipends for living expenses, supplies, and transport. Specialized tracks reach up to ₱160,000/yr.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* Card 2: Recognition for Every Excellence */}
          <Link to="/scholar-prog-available" className="block">
            <Card hoverEffect className="bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-soft h-full cursor-pointer">
              <CardHeader className="p-6 space-y-3">
                <div className="h-11 w-11 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-800">
                  <Award className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white">Recognition for Every Excellence</CardTitle>
                <CardDescription className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 font-normal">
                  Dedicated tracks for academic achievers, talented artists, athletes, youth leaders, and literature enthusiasts. Greatness in all forms.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* Card 3: Real-Time Status Tracker */}
          <Link to={user ? "/dashboard" : "/login"} className="block">
            <Card hoverEffect className="bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-soft h-full cursor-pointer">
              <CardHeader className="p-6 space-y-3">
                <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white">Real-Time Status Tracker</CardTitle>
                <CardDescription className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 font-normal">
                  Track your application milestone progress in real-time from digital submission directly to electronic GCash disbursement.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* Card 4: Secure Document Vault */}
          <Link to="/documents" className="block">
            <Card hoverEffect className="bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-soft h-full cursor-pointer">
              <CardHeader className="p-6 space-y-3">
                <div className="h-11 w-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                  <FolderLock className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white">Secure Document Vault</CardTitle>
                <CardDescription className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 font-normal">
                  Encrypted storage for official university CORs, tax affidavits, indigent certificates, and transcripts across renewal cycles.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </section>

      {/* Interactive Section: How Campus Aid Hub Works */}
      <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200/90 dark:border-slate-800 px-4 sm:px-6 transition-colors duration-200">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-4">
            {/* ============================================================== */}
            {/* DROPDOWN 1: How Campus Aid Hub Works (3-Step Digital Workflow) */}
            {/* ============================================================== */}
            <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 overflow-hidden shadow-xs transition-all duration-300">
              <button
                onClick={() => toggleDrawer('howToApply')}
                className="w-full p-6 sm:p-7 flex items-center justify-between gap-4 text-left hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                aria-expanded={openDrawers.howToApply}
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 shrink-0">
                    <Compass className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white">
                        How Campus Aid Hub Works (3-Step Digital Process)
                      </h3>
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        How to Apply
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">
                      Simple 3-step digital application process through the QC eServices website.
                    </p>
                  </div>
                </div>

                <div className={`p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-transform duration-300 ${openDrawers.howToApply ? 'rotate-180' : ''}`}>
                  <ChevronDown className="h-5 w-5" />
                </div>
              </button>

              {openDrawers.howToApply && (
                <div className="p-6 sm:p-8 pt-2 space-y-8 border-t border-slate-200/70 dark:border-slate-800/80 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Step 1 */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-600 text-white">
                          Step 01
                        </span>
                        <Compass className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">
                        Explore & Check Eligibility
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                        Run our Eligibility Pre-Checker to find grants matching your course, GPA, and residency criteria.
                      </p>
                    </div>

                    {/* Step 2 */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-600 text-white">
                          Step 02
                        </span>
                        <FolderLock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">
                        Upload Vault Documents
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                        Upload your university COR, QCitizen ID, and income forms directly to your encrypted Document Vault.
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-600 text-white">
                          Step 03
                        </span>
                        <WalletCards className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">
                        Get Approved & Disbursed
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                        Receive real-time milestone notifications and automatic electronic payouts via GCash or Landbank.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Stay Updated & Support Channels (Vibrant Multichannel Hub) */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
            Stay Updated
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            For the latest announcements on application periods, requirements, and deadlines:
          </p>
        </div>

        {/* 3 Distinct Creative Channel Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Channel 1: Facebook */}
          <a
            href="https://www.facebook.com/share/1AibfJmCmh/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative p-8 rounded-3xl bg-gradient-to-b from-blue-50/80 to-white dark:from-slate-900 dark:to-slate-900 border border-blue-200/80 dark:border-slate-800 shadow-soft hover:shadow-2xl hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-110 transition-transform">
                  <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">Social Channel</span>
                <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  QC Campus Aid Hub on Facebook
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-normal">
                  Follow official announcements, application opening dates, and community live Q&A sessions.
                </p>
              </div>
            </div>
            <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
              <span>Follow Official Page</span>
              <span>→</span>
            </div>
          </a>

          {/* Channel 2: GovServe Website */}
          <Link
            to="/"
            className="group relative p-8 rounded-3xl bg-gradient-to-b from-indigo-50/80 to-white dark:from-slate-900 dark:to-slate-900 border border-indigo-200/80 dark:border-slate-800 shadow-soft hover:shadow-2xl hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-110 transition-transform">
                  <Globe className="h-6 w-6" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Official Portal</span>
                <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white mt-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  QC Government GovServe
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-normal">
                  Visit the Quezon City Government portal for unified access to permits, city registries, and citizen programs.
                </p>
              </div>
            </div>
            <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span>Visit GovServe Portal</span>
              <span>→</span>
            </div>
          </Link>

          {/* Channel 3: Helpline 122 */}
          <a
            href="tel:122"
            className="group relative p-8 rounded-3xl bg-gradient-to-b from-emerald-50/80 to-white dark:from-slate-900 dark:to-slate-900 border border-emerald-200/80 dark:border-slate-800 shadow-soft hover:shadow-2xl hover:border-emerald-400 dark:hover:border-emerald-600 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 group-hover:scale-110 transition-transform">
                  <Phone className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>24/7 Hotline</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Citizen Hotline</span>
                <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white mt-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Call Helpline 122
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-normal">
                  Connect directly with City Hall assistance officers for scholarship inquiries, follow-ups, and urgent concerns.
                </p>
              </div>
            </div>
            <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span>Dial 122 for Inquiries</span>
              <span>→</span>
            </div>
          </a>
        </div>
      </section>

      {/* Public Footer matching photo */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-4 sm:px-6 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <img src="/logo-system.png" alt="GovServe" className="h-8 w-8 object-contain" />
              <span className="font-heading font-extrabold text-white text-base">GovServe</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Unified Scholarship & Financial Aid Platform for Quezon City Scholars.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-2">Quick Navigation</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><Link to="/campus-aid-hub" className="hover:text-white transition-colors">Public Services Portal</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Student Login</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Staff & Officer Portal</Link></li>
              <li><Link to="/scholar-eguide" className="hover:text-white transition-colors">Scholar E-Guide</Link></li>
              <li><Link to="/scholar-prog-available" className="hover:text-white transition-colors">Available Programs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-2">Public Services</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><Link to="/campus-aid-hub" className="hover:text-white transition-colors">Check Application Status</Link></li>
              <li><Link to="/e-scholar" className="hover:text-white transition-colors">Eligibility Pre-Checker</Link></li>
              <li><a href="https://govservedrrm.up.railway.app/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors flex items-center gap-1">DRRM Emergency Portal <ExternalLink className="h-3 w-3 inline text-amber-400" /></a></li>
              <li><a href="/citizens_charter.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Citizen's Charter PDF</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-2">Contact & Office</h4>
            <p className="text-slate-400 leading-relaxed text-xs">
              Quezon City Hall Complex, Elliptical Road, QC<br />
              Mon–Fri 8:00 AM – 5:00 PM<br />
              Helpline: 122
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
