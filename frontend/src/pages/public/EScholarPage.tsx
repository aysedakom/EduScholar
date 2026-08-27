import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  ExternalLink,
  UserCheck,
  RotateCw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  LayoutDashboard,
  Users,
  Sun,
  Moon,
  ChevronDown,
  X,
  AlertTriangle
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { QCSPAlumniModal } from '../../components/public/QCSPAlumniModal';
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { getActiveStudentApplication } from '../../utils/scholarshipPrograms';
import { toast } from 'sonner';

export const EScholarPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, isTagalog } = useLanguage();
  const location = useLocation();
  const [isAlumniModalOpen, setIsAlumniModalOpen] = useState(false);
  const [eservicesOpen, setEservicesOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [blockedModalOpen, setBlockedModalOpen] = useState(false);
  // Auto pop-up announcement modal state
  const [showPopup, setShowPopup] = useState(true);

  const activeApp = getActiveStudentApplication();

  const handleStartNewApplication = () => {
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent('/student/application-form'));
      return;
    }
    if (activeApp) {
      setBlockedModalOpen(true);
      return;
    }
    navigate('/student/application-form');
  };

  useEffect(() => {
    if (location.state?.openPopup) {
      setShowPopup(true);
    }
  }, [location]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (eservicesOpen && !target.closest('.escholar-eservices-dropdown')) {
        setEservicesOpen(false);
      }
      if (userDropdownOpen && !target.closest('.escholar-user-dropdown')) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [eservicesOpen, userDropdownOpen]);

  const handleOpenQcuPortal = () => {
    toast.info('Opening Quezon City University (QCU) Portal...');
    window.open('https://qcu.edu.ph', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/20 transition-colors duration-200">
      {/* Top Header Navbar - Edge to Edge like Home */}
      <header className="w-full bg-white dark:bg-slate-900 shadow-md shadow-slate-200/80 dark:shadow-slate-950/50 border-b border-slate-200 dark:border-slate-800 relative z-30 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo-system.png" alt="GovServe Logo" className="h-9 w-9 object-contain bg-blue-50 dark:bg-slate-800 p-1 rounded-xl border border-blue-200 dark:border-slate-700 shadow-xs" />
              <div>
                <span className="font-heading font-extrabold text-lg text-slate-900 dark:text-white leading-none block">GovServe</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Campus Aid Hub Portal</span>
              </div>
            </Link>

            {/* Header Navigation: HOME, eSERVICES, CITIZEN'S CHARTER, CONTACT US */}
            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                to="/"
                className="flex items-center px-3 py-2 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <span>{t('nav.home')}</span>
              </Link>

              {/* eSERVICES Dropdown */}
              <div className="relative escholar-eservices-dropdown">
                <button
                  onClick={() => setEservicesOpen(!eservicesOpen)}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <span>{t('nav.eservices')}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {eservicesOpen && (
                  <div className="absolute left-0 top-11 w-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden z-50 p-2 animate-in fade-in duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 rounded-xl mb-1">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{t('nav.available')}</p>
                    </div>

                    {/* FIRST OPTION: Education and Scholarship */}
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

              {/* CITIZEN'S CHARTER Link */}
              <a
                href="/citizens_charter.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-2 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <span className="hidden md:inline">{t('nav.charter')}</span>
                <span className="md:hidden">{isTagalog ? 'KARTA' : 'CHARTER'}</span>
              </a>

              {/* CONTACT US Link */}
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
              <div className="relative escholar-user-dropdown">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 rounded-2xl p-1.5 pl-2.5 pr-2 transition-all cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group"
                >
                  <div className="text-right hidden md:block leading-tight">
                    <p className="text-xs font-black tracking-tight text-slate-900 dark:text-white uppercase font-heading">
                      {user.name || 'PIA MARIE FANER'}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 capitalize mt-0.5">
                      {user.role === 'student' ? 'Citizen' : (user.role ? user.role.replace('_', ' ') : 'Citizen')}
                    </p>
                  </div>

                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 font-extrabold text-xs text-white shadow-xs ring-2 ring-blue-600/20 shrink-0">
                    {user.name ? (user.name.split(/\s+/).filter(w => !w.endsWith('.')).length >= 2 ? (user.name.split(/\s+/).filter(w => !w.endsWith('.'))[0][0] + user.name.split(/\s+/).filter(w => !w.endsWith('.'))[1][0]).toUpperCase() : user.name.substring(0, 2).toUpperCase()) : 'PM'}
                  </div>

                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors shrink-0" />
                </button>
                {userDropdownOpen && (
                  <div className="absolute right-0 top-12 w-52 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 shadow-xl z-50 animate-in fade-in duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <p className="text-xs font-black uppercase truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold capitalize">{user.role === 'student' ? 'Citizen' : user.role?.replace('_', ' ')}</p>
                      {user.email && (
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
                      )}
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors"
                    >
                      <span>📊</span> {t('nav.dashboard')}
                    </Link>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-extrabold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer border-t border-slate-100 dark:border-slate-800 mt-1 pt-2"
                    >
                      <span>🚪</span> {t('nav.signout')}
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

      {/* Full-Width Hero Banner Section */}
      <div
        className="w-full relative overflow-hidden bg-center bg-no-repeat shadow-lg border-b border-slate-700/40 text-white py-12 sm:py-16 lg:py-20 transition-all duration-300"
        style={{
          backgroundImage: theme === 'dark' ? "url('/Darkmode.jpg')" : "url('/Lightmode.jpg')",
          backgroundSize: '100% 100%'
        }}
      >
        {/* Subtle overlay for optimal text contrast across theme modes */}
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
              E-SCHOLAR Hub
            </span>
          </div>

          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-snug drop-shadow-md">
            E-SCHOLAR: Education & Scholarship Services
          </h1>

          <p className="text-base sm:text-lg text-slate-100 leading-relaxed font-semibold max-w-3xl drop-shadow-sm">
            The Quezon City Local Government Unit (LGU QC) Scholarship Program provides ₱5,000 educational fund grant along with ₱5,000 semestral stipend allowance for eligible Quezon City resident scholars.
          </p>
        </div>
      </div>

      {/* Main Page Container */}
      <main className="max-w-7xl mx-auto space-y-8 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300 pb-16">
        {/* Main E-Services Action Grid (6 Modules from TODO) */}
        <section className="space-y-6 pt-4">
          <div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white flex items-center gap-3">
              E-SCHOLAR Core Services & Applications
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              Select a service to start your scholarship journey, submit tracer forms, or link university accounts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Scholar Dashboard */}
            <Card hoverEffect className="bg-gradient-to-br from-blue-50/90 via-slate-50 to-indigo-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/40 border border-blue-200 dark:border-blue-900/60 shadow-soft flex flex-col justify-between p-2 rounded-3xl">
              <CardHeader className="space-y-3 p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                    <LayoutDashboard className="h-6 w-6" />
                  </div>
                  <Badge variant="primary" className="bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-bold px-3 py-1 text-xs">Scholar Portal</Badge>
                </div>
                <CardTitle className="text-xl font-extrabold">Scholar Dashboard</CardTitle>
                <CardDescription className="text-xs sm:text-sm leading-relaxed font-medium">
                  Access your personal scholar dashboard to track application status, view disbursement schedules, and manage student profile.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                <Link to="/dashboard">
                  <Button
                    variant="primary"
                    size="lg"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                    className="w-full font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 py-3 text-sm cursor-pointer"
                  >
                    Go to Scholar Dashboard →
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Card 2: New Application */}
            <Card hoverEffect className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-soft flex flex-col justify-between p-2 rounded-3xl">
              <CardHeader className="space-y-3 p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <Badge variant="primary" className="bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-bold px-3 py-1 text-xs">First-Time Applicants</Badge>
                </div>
                <CardTitle className="text-xl font-extrabold">New Application</CardTitle>
                <CardDescription className="text-xs sm:text-sm leading-relaxed font-medium">
                  Start a fresh scholarship application for Academic Year 2026-2027. Fill out personal details and COR.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleStartNewApplication}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="w-full font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 py-3 text-sm cursor-pointer"
                >
                  Start New Application
                </Button>
                <div className="text-center pt-2">
                  <Link
                    to="/scholar-prog-available"
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Need to choose a track? Browse Available Programs</span>
                    <span>→</span>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Renewal Application */}
            <Card hoverEffect className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-soft flex flex-col justify-between p-2 rounded-3xl">
              <CardHeader className="space-y-3 p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                    <RotateCw className="h-6 w-6" />
                  </div>
                  <Badge variant="primary" className="bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-bold px-3 py-1 text-xs">Existing Scholars</Badge>
                </div>
                <CardTitle className="text-xl font-extrabold">Renewal Application</CardTitle>
                <CardDescription className="text-xs sm:text-sm leading-relaxed font-medium">
                  One-click semestral renewal for existing QCSP scholars. Submit latest GWA transcript and enrollment COR.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                <Link to="/renewal">
                  <Button variant="primary" size="lg" leftIcon={<RotateCw className="h-4 w-4" />} className="w-full font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 py-3 text-sm cursor-pointer">
                    Submit Renewal Application
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Card 4: QCSP Alumni Information Sheet */}
            <Card hoverEffect className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-soft flex flex-col justify-between p-2 rounded-3xl">
              <CardHeader className="space-y-3 p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                    <Users className="h-6 w-6" />
                  </div>
                  <Badge variant="primary" className="bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-bold px-3 py-1 text-xs">Graduates & Alumni</Badge>
                </div>
                <CardTitle className="text-xl font-extrabold">QCSP Alumni Info Sheet</CardTitle>
                <CardDescription className="text-xs sm:text-sm leading-relaxed font-medium">
                  Official graduate tracer sheet for QCSP alumni to record current employment, career updates, and testimonials.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setIsAlumniModalOpen(true)}
                  leftIcon={<UserCheck className="h-4 w-4" />}
                  className="w-full font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 py-3 text-sm cursor-pointer"
                >
                  Fill Out Alumni Info Sheet
                </Button>
              </CardContent>
            </Card>

            {/* Card 5: QCU Portal */}
            <Card hoverEffect className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-soft flex flex-col justify-between p-2 rounded-3xl">
              <CardHeader className="space-y-3 p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <Badge variant="primary" className="bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-bold px-3 py-1 text-xs">University Portal</Badge>
                </div>
                <CardTitle className="text-xl font-extrabold">QCU Portal</CardTitle>
                <CardDescription className="text-xs sm:text-sm leading-relaxed font-medium">
                  Direct integration with Quezon City University (QCU) student system, academic verification, and grades lookup.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleOpenQcuPortal}
                  rightIcon={<ExternalLink className="h-4 w-4" />}
                  className="w-full font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 py-3 text-sm cursor-pointer"
                >
                  Access QCU Portal →
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Auto Pop-up Announcement Modal (Frameless Overlay) */}
      {showPopup && (
        <div
          onClick={() => setShowPopup(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[92vh] flex items-center justify-center cursor-default animate-in zoom-in-95 duration-200"
          >
            {/* Floating Close Button */}
            <button
              onClick={() => setShowPopup(false)}
              className="absolute -top-3 -right-3 z-10 p-2.5 rounded-full bg-slate-900/90 text-white hover:bg-red-600 border-2 border-white shadow-xl transition-all cursor-pointer transform hover:scale-110"
              title="Close Announcement"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Frameless Announcement Image */}
            <img
              src="/pop-up.jpg"
              alt="QCSP Scholarship Announcement"
              className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-2xl shadow-2xl border-0"
            />
          </div>
        </div>
      )}

      {/* QCSP Alumni Tracer Modal Component */}
      <QCSPAlumniModal
        isOpen={isAlumniModalOpen}
        onClose={() => setIsAlumniModalOpen(false)}
      />

      {/* Active Application Warning Modal */}
      {blockedModalOpen && activeApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0 border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white leading-snug">
                    Active Scholarship Application Detected
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Quezon City Scholarship Program (QCSP) Policy
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBlockedModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl space-y-2 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              <p className="font-bold">
                You currently have an active submitted application on record:
              </p>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-200/80 dark:border-amber-800/80 space-y-1">
                <p className="font-extrabold text-slate-900 dark:text-white text-xs">
                  {activeApp.program_name || activeApp.scholarshipTitle || 'Quezon City Scholarship Program (QCSP)'}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Status:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 capitalize">
                    {activeApp.status || 'Under Review'}
                  </span>
                  <span>•</span>
                  <span>ID: {activeApp.id || activeApp.scholarshipId || 'QCSP-2026-REF'}</span>
                </div>
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-300">
                *In accordance with QCSP Committee Governance, applicants may only hold <strong>one (1) active scholarship program application</strong> at a time. Duplicate submissions to other programs are disabled while this application is in process.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBlockedModalOpen(false)}
                className="font-bold"
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-md"
              >
                Track My Application →
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EScholarPage;
