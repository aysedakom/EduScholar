import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  Sun,
  Moon,
  ChevronDown,
  Menu,
  Car,
  Building2,
  ArrowRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'sonner';
import { PublicFooter } from '../../components/layout/PublicFooter';

export const QCeServicesHomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, isTagalog } = useLanguage();
  const navigate = useNavigate();
  const [eservicesOpen, setEservicesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (eservicesOpen && !target.closest('.home-eservices-dropdown')) {
        setEservicesOpen(false);
      }
      if (userDropdownOpen && !target.closest('.home-user-dropdown')) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [eservicesOpen, userDropdownOpen]);

  const handleCardClick = (title: string, path?: string, externalUrl?: string) => {
    if (externalUrl) {
      window.open(externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    if (path) {
      if (!user && (path === '/education-scholarship' || path === '/dashboard' || path.startsWith('/admin') || path.startsWith('/supervisor'))) {
        navigate(`/login?redirect=${encodeURIComponent(path)}`);
      } else {
        navigate(path);
      }
    } else {
      toast.info(
        isTagalog
          ? `Ang ${title} ay nakatakda para sa susunod na bersyon. I-access ang Pamamahala ng Edukasyon at Iskolarship para sa mga aktibong serbisyo.`
          : `${title} is scheduled for next release. Access Education & Scholarship Management for active services.`
      );
    }
  };

  const serviceCards = [
    {
      title: t('service.edu.title'),
      description: t('service.edu.desc'),
      path: '/education-scholarship',
      active: true,
      featured: true, // Signature EduScholar card with ScholarHat image
      bgImage: '/ScholarHat.webp',
      fallbackImage: '/ScholarHat.png',
      kicker: 'Quezon City Campus Aid',
      subText: isTagalog ? 'Mag-aplay & Sumangguni' : 'Student Grants & Aid',
      actionText: isTagalog ? 'Buksan ang Portal' : 'Access Portal',
      themeColor: 'blue',
    },
    {
      title: t('service.drrm.title'),
      description: t('service.drrm.desc'),
      active: true,
      featured: true, // Signature DRRM card with DRRM background image
      externalUrl: 'https://govservedrrm.up.railway.app/',
      bgImage: '/DRRM.png',
      kicker: 'Quezon City Disaster Risk Reduction',
      subText: isTagalog ? 'Opisyal na DRRM Hub' : 'Emergency & Disaster Hub',
      actionText: isTagalog ? 'Buksan ang Live Portal' : 'Live DRRM Portal',
      themeColor: 'amber',
    },
    {
      title: t('service.citizen.title'),
      description: t('service.citizen.desc'),
      active: true,
      featured: true, // Signature Citizen Engagement card with official signing artwork
      externalUrl: 'https://govservecitizen.eprovider.site/',
      bgImage: '/Citizen.png',
      fallbackImage: '/Citizen.jpg',
      kicker: 'Quezon City Citizen Engagement',
      subText: isTagalog ? 'Opisyal na Citizen Portal' : 'Community & Feedback Hub',
      actionText: isTagalog ? 'Buksan ang Live Portal' : 'Live Citizen Portal',
      themeColor: 'rose',
    },
    {
      title: t('service.permits.title'),
      description: t('service.permits.desc'),
      active: true,
      featured: true, // Signature Permits & Licensing card with official stamping artwork
      externalUrl: 'https://govserve.up.railway.app/',
      bgImage: '/Permits.png',
      fallbackImage: '/Permits.jpg',
      kicker: 'Quezon City Permits & Licensing',
      subText: isTagalog ? 'Opisyal na Licensing Portal' : 'Clearance & Licensing Hub',
      actionText: isTagalog ? 'Buksan ang Live Portal' : 'Live Licensing Portal',
      themeColor: 'indigo',
    },
    {
      title: t('service.social.title'),
      description: t('service.social.desc'),
      active: false,
      featured: true, // Signature Social Services & Welfare card
      bgImage: '/Social.png',
      fallbackImage: '/Social.jpg',
      kicker: 'Quezon City Social Welfare',
      subText: isTagalog ? 'Kagalingang Panlipunan' : 'Community & Family Aid',
      actionText: isTagalog ? 'Nakatakdang Ilabas' : 'Coming Soon',
      themeColor: 'rose',
    },
    {
      title: t('service.health.title'),
      description: t('service.health.desc'),
      active: false,
      featured: true, // Signature Health & Sanitation Management card
      bgImage: '/Health.png',
      fallbackImage: '/Health.jpg',
      kicker: 'Quezon City Health & Sanitation',
      subText: isTagalog ? 'Kalusugan at Sanitasyon' : 'Clinical & Sanitation Network',
      actionText: isTagalog ? 'Nakatakdang Ilabas' : 'Coming Soon',
      themeColor: 'emerald',
    },
    {
      title: t('service.urban.title'),
      description: t('service.urban.desc'),
      active: false,
      featured: true, // Signature Urban Planning, Zoning & Housing card
      bgImage: '/Urban.png',
      fallbackImage: '/Urban.jpg',
      kicker: 'Quezon City Urban Planning & Housing',
      subText: isTagalog ? 'Pagpaplanong Panglungsod' : 'Zoning, Housing & Masterplan',
      actionText: isTagalog ? 'Nakatakdang Ilabas' : 'Coming Soon',
      themeColor: 'sky',
    },
    {
      title: t('service.treasury.title'),
      description: t('service.treasury.desc'),
      active: false,
      featured: true, // Signature Revenue Collection & Treasury Services card
      bgImage: '/Treasury.png',
      fallbackImage: '/Treasury.jpg',
      kicker: 'Quezon City Treasury & Revenue',
      subText: isTagalog ? 'Koleksyon ng Buwis at Ingat-yaman' : 'Tax Assessment & Treasury',
      actionText: isTagalog ? 'Nakatakdang Ilabas' : 'Coming Soon',
      themeColor: 'emerald',
    },
    {
      title: t('service.transport.title'),
      description: t('service.transport.desc'),
      icon: Car,
      color: 'bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400',
      active: false,
    },
    {
      title: t('service.assets.title'),
      description: t('service.assets.desc'),
      icon: Building2,
      color: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400',
      active: false,
    },
  ];

  return (
    <div className={`min-h-screen font-sans selection:bg-primary/20 transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}>
      {/* Top Navbar with Elevation Shadow */}
      <header className={`w-full shadow-lg relative z-30 transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title="Toggle Menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <img src="/logo-system.webp" alt="GovServe Logo" className={`h-9 w-9 object-contain p-1 rounded-full shadow-sm shrink-0 ${isDark ? 'bg-slate-800' : 'bg-blue-50'}`} />
              <div className="min-w-0">
                <span className={`font-heading font-extrabold text-base sm:text-lg leading-none block truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>GovServe</span>
                <span className={`text-[10px] font-semibold truncate block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>QC eServices Hub</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 sm:gap-2">
              <Link
                to="/"
                className={`flex items-center px-3 py-2 rounded-xl text-xs font-extrabold shadow-sm transition-all ${isDark ? 'bg-blue-950/80 text-blue-300' : 'bg-blue-50 text-blue-600'}`}
              >
                <span>{t('nav.home')}</span>
              </Link>

              {/* eSERVICES Dropdown - Only show when NOT logged in */}
              {!user && (
                <div className="relative home-eservices-dropdown">
                  <button
                    onClick={() => setEservicesOpen(!eservicesOpen)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${isDark ? 'text-slate-300 hover:text-blue-400 hover:bg-slate-800' : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100'}`}
                  >
                    <span>{t('nav.eservices')}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  </button>

                  {eservicesOpen && (
                    <div className={`absolute left-0 top-11 w-80 rounded-2xl shadow-2xl overflow-hidden z-50 p-2 animate-in fade-in duration-150 border border-slate-200 dark:border-slate-800 ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
                      <div className={`px-3 py-2 rounded-xl mb-1 ${isDark ? 'bg-slate-800/80' : 'bg-slate-50/80'}`}>
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{t('nav.available')}</p>
                      </div>

                      <Link
                        to="/login?redirect=%2Feducation-scholarship"
                        onClick={() => setEservicesOpen(false)}
                        className={`block p-2.5 rounded-xl shadow-sm transition-all group ${isDark ? 'bg-blue-950/50 hover:bg-blue-900/60' : 'bg-blue-50/80 hover:bg-blue-100/80'}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <p className={`text-xs font-extrabold group-hover:text-blue-600 ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>{t('nav.eduScholarTitle')}</p>
                          <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">{t('nav.primary')}</span>
                        </div>
                        <p className={`text-[10px] font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t('nav.eduScholarDesc')}</p>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <a
                href="/citizens_charter.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${isDark ? 'text-slate-300 hover:text-blue-400 hover:bg-slate-800' : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100'}`}
              >
                <span className="hidden md:inline">{t('nav.charter')}</span>
                <span className="md:hidden">{isTagalog ? 'KARTA' : 'CHARTER'}</span>
              </a>

              <Link
                to="/contact"
                className={`flex items-center px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${isDark ? 'text-slate-300 hover:text-blue-400 hover:bg-slate-800' : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100'}`}
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
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className={`rounded-xl p-2.5 shadow-md transition-all cursor-pointer ${isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </button>

            {user ? (
              <div className="relative home-user-dropdown">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 rounded-2xl p-1.5 pl-2.5 pr-2 transition-all cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group"
                >
                  <div className="text-right hidden md:block leading-tight">
                    <p className="text-xs font-black tracking-tight text-slate-900 dark:text-white uppercase font-heading">
                      {user.name || 'PIA MARIE FANER'}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      {user.role === 'student'
                        ? (user.application_code || user.reference_id || user.applicationId || user.application_id || (user.id ? `APP-2026-${String(user.id).padStart(4, '0')}` : 'APP-2026-0001'))
                        : (user.role ? user.role.replace('_', ' ') : 'Administrator')}
                    </p>
                  </div>

                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 font-extrabold text-xs text-white shadow-xs ring-2 ring-blue-600/20 shrink-0">
                    {user.name ? (user.name.split(/\s+/).filter(w => !w.endsWith('.')).length >= 2 ? (user.name.split(/\s+/).filter(w => !w.endsWith('.'))[0][0] + user.name.split(/\s+/).filter(w => !w.endsWith('.'))[1][0]).toUpperCase() : user.name.substring(0, 2).toUpperCase()) : 'PM'}
                  </div>

                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors shrink-0" />
                </button>
                {userDropdownOpen && (
                  <div className={`absolute right-0 top-12 w-56 rounded-2xl border shadow-xl z-50 p-2 animate-in fade-in duration-150 ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}>
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <p className="text-xs font-black uppercase truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold font-mono">
                        {user.role === 'student'
                          ? `Application ID: ${user.application_code || user.reference_id || user.applicationId || user.application_id || (user.id ? `APP-2026-${String(user.id).padStart(4, '0')}` : 'APP-2026-0001')}`
                          : user.role.replace('_', ' ')}
                      </p>
                      {user.email && (
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
                      )}
                    </div>
                    <Link
                      to="/education-scholarship"
                      onClick={() => setUserDropdownOpen(false)}
                      className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors ${
                        isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span>{t('nav.eduScholarTitle')}</span>
                    </Link>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-extrabold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer border-t border-slate-100 dark:border-slate-800 mt-1 pt-2"
                    >
                      <span>{t('nav.signout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/signup" className="hidden sm:inline-flex">
                  <Button variant="outline" size="sm" className="font-bold border-slate-300 dark:border-slate-700">
                    {t('nav.signup')}
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="primary" size="sm" className="font-extrabold shadow-lg shadow-blue-600/30">
                    {t('nav.signin')}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150 shadow-xl">
            <div className="flex flex-col space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60"
              >
                {t('nav.home')}
              </Link>
              {!user && (
                <Link
                  to="/login?redirect=%2Feducation-scholarship"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                >
                  <span>{t('nav.eduScholarTitle')}</span>
                  <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{t('nav.primary')}</span>
                </Link>
              )}
              <a
                href="/citizens_charter.pdf"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t('nav.charter')}
              </a>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t('nav.contact')}
              </Link>
            </div>

            {!user && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                  <Button variant="primary" size="sm" className="w-full font-bold">
                    {t('nav.signin')}
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full font-bold border-slate-300 dark:border-slate-700">
                    {t('nav.signup')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Hero Section: umaga.webp in Light Mode, gabi.webp in Dark Mode */}
      <section
        className="w-full relative overflow-hidden bg-center bg-cover bg-no-repeat shadow-2xl py-16 sm:py-24 text-center transition-all duration-500 animate-fade-in-up"
        style={{
          backgroundImage: isDark ? "url('/gabi.webp')" : "url('/umaga.webp')",
        }}
      >
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${isDark ? 'bg-slate-950/45' : 'bg-slate-950/20'}`} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          <h1 className="font-heading font-extrabold text-4xl sm:text-6xl tracking-tight text-white leading-tight max-w-4xl mx-auto drop-shadow-md animate-scale-in">
            {t('home.heroTitle')}
          </h1>
          <p className="text-slate-100 text-base sm:text-xl font-semibold max-w-3xl mx-auto leading-relaxed italic drop-shadow-sm">
            {t('home.heroSubtitle')}
          </p>
        </div>
      </section>

      {/* About the Platform Section: PURE WHITE in Light Mode, Slate-900 in Dark Mode */}
      <section className={`w-full py-12 px-4 sm:px-6 relative z-10 shadow-xl transition-colors duration-300 ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
        <div className="max-w-7xl mx-auto space-y-4">
          <div className={`font-extrabold text-xs uppercase tracking-widest ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            {t('home.aboutTag')}
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl">
            {t('home.aboutTitle')}
          </h2>
          <p className={`text-sm sm:text-base leading-relaxed font-medium max-w-5xl ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {t('home.aboutBody')}
          </p>
        </div>
      </section>

      {/* 10 eServices Cards Grid: PURE WHITE in Light Mode, Slate-950 in Dark Mode */}
      <section className={`py-16 px-4 sm:px-6 max-w-7xl mx-auto space-y-8 transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
        <div className="text-center space-y-2">
          <Badge variant="primary" size="sm" className={`font-bold shadow-md ${isDark ? 'bg-blue-950 text-amber-300' : 'bg-slate-900 text-amber-300'}`}>{t('home.dirTag')}</Badge>
          <h2 className={`font-heading font-extrabold text-2xl sm:text-4xl ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('home.dirTitle')}</h2>
          <p className={`text-xs sm:text-sm max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('home.dirSubtitle')}</p>
        </div>

        {/* 10 eServices Directory Grid: EduScholar Signature Card + Other QC Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceCards.map((card, idx) => {
            const IconComponent = (card as any).icon;
            const isExternal = !!(card as any).externalUrl;
            const isFeatured = (card as any).featured;

            // Featured Cards with custom background artwork (Education & Scholarship, DRRM, Citizen Engagement, Permits & Licensing, Health & Sanitation, Social Services, Urban Planning)
            if (isFeatured) {
              const theme = (card as any).themeColor || 'blue';
              const isAmber = theme === 'amber';
              const isRose = theme === 'rose';
              const isIndigo = theme === 'indigo';
              const isEmerald = theme === 'emerald';
              const isSky = theme === 'sky';

              const borderHoverClass = isRose
                ? 'border-rose-200/80 dark:border-rose-900/50 hover:shadow-rose-500/25 hover:ring-2 hover:ring-rose-500'
                : isAmber
                ? 'border-amber-200/80 dark:border-amber-900/50 hover:shadow-amber-500/25 hover:ring-2 hover:ring-amber-500'
                : isIndigo
                ? 'border-indigo-200/80 dark:border-indigo-900/50 hover:shadow-indigo-500/25 hover:ring-2 hover:ring-indigo-500'
                : isEmerald
                ? 'border-emerald-200/80 dark:border-emerald-900/50 hover:shadow-emerald-500/25 hover:ring-2 hover:ring-emerald-500'
                : isSky
                ? 'border-sky-200/80 dark:border-sky-900/50 hover:shadow-sky-500/25 hover:ring-2 hover:ring-sky-500'
                : 'border-blue-200/80 dark:border-blue-900/50 hover:shadow-blue-500/25 hover:ring-2 hover:ring-blue-500';

              const kickerColorClass = isRose
                ? 'text-rose-600 dark:text-rose-400'
                : isAmber
                ? 'text-amber-600 dark:text-amber-400'
                : isIndigo
                ? 'text-indigo-600 dark:text-indigo-400'
                : isEmerald
                ? 'text-emerald-600 dark:text-emerald-400'
                : isSky
                ? 'text-sky-600 dark:text-sky-400'
                : 'text-blue-600 dark:text-blue-400';

              const pulseDotClass = isRose
                ? 'bg-rose-500'
                : isAmber
                ? 'bg-amber-500'
                : isIndigo
                ? 'bg-indigo-500'
                : isEmerald
                ? 'bg-emerald-500'
                : isSky
                ? 'bg-sky-500'
                : 'bg-blue-500';

              const titleHoverColor = isDark
                ? (isRose ? 'group-hover:text-rose-400' : isAmber ? 'group-hover:text-amber-400' : isIndigo ? 'group-hover:text-indigo-400' : isEmerald ? 'group-hover:text-emerald-400' : isSky ? 'group-hover:text-sky-400' : 'group-hover:text-blue-400')
                : (isRose ? 'group-hover:text-rose-600' : isAmber ? 'group-hover:text-amber-600' : isIndigo ? 'group-hover:text-indigo-600' : isEmerald ? 'group-hover:text-emerald-600' : isSky ? 'group-hover:text-sky-600' : 'group-hover:text-blue-600');

              const actionColorClass = isRose
                ? 'text-rose-600 dark:text-rose-400'
                : isAmber
                ? 'text-amber-600 dark:text-amber-400'
                : isIndigo
                ? 'text-indigo-600 dark:text-indigo-400'
                : isEmerald
                ? 'text-emerald-600 dark:text-emerald-400'
                : isSky
                ? 'text-sky-600 dark:text-sky-400'
                : 'text-blue-600 dark:text-blue-400';

              return (
                <div
                  key={idx}
                  onClick={() => handleCardClick(card.title, card.path, (card as any).externalUrl)}
                  className={`group relative overflow-hidden rounded-2xl cursor-pointer shadow-lg transition-all duration-300 p-6 flex flex-col justify-between border ${borderHoverClass} ${
                    isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
                  } hover:shadow-2xl hover:scale-[1.02] min-h-[230px]`}
                >
                  {/* Full card background cover with artwork clearly visible across entire card */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950">
                    <img
                      src={(card as any).bgImage}
                      alt={card.title}
                      onError={(e) => {
                        const target = e.currentTarget;
                        const fallback = (card as any).fallbackImage;
                        if (fallback && target.src.includes((card as any).bgImage)) {
                          target.src = fallback;
                        } else {
                          target.style.display = 'none';
                        }
                      }}
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Sophisticated frosted gradient overlay ensuring crystal clear text readability while showcasing the artwork */}
                    <div
                      className={`absolute inset-0 transition-all duration-300 ${
                        isDark
                          ? 'bg-gradient-to-br from-slate-950/92 via-slate-950/80 to-slate-900/50 backdrop-blur-[0.5px]'
                          : 'bg-gradient-to-br from-white/95 via-white/85 to-white/45 backdrop-blur-[0.5px]'
                      }`}
                    />
                  </div>

                  {/* Top content area with subtle category kicker and clear typography */}
                  <div className="space-y-2 relative z-10">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest ${kickerColorClass}`}
                      >
                        {(card as any).kicker}
                      </span>
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          card.active ? `animate-pulse ${pulseDotClass}` : 'bg-slate-400 dark:bg-slate-500'
                        }`}
                      />
                    </div>
                    <h3
                      className={`text-lg sm:text-xl font-heading font-black tracking-tight leading-snug transition-colors ${
                        isDark ? 'text-white' : 'text-slate-900'
                      } ${titleHoverColor}`}
                    >
                      {card.title}
                    </h3>
                    <p
                      className={`text-xs leading-relaxed font-semibold ${
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      {card.description}
                    </p>
                  </div>

                  {/* Bottom anchored action bar balancing card height */}
                  <div className="pt-4 mt-auto relative z-10 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {(card as any).subText}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-black group-hover:gap-2.5 transition-all ${
                        card.active ? actionColorClass : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <span>{(card as any).actionText}</span>
                      {isExternal ? (
                        <ExternalLink className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowRight className="h-3.5 w-3.5" />
                      )}
                    </span>
                  </div>
                </div>
              );
            }

            // Other 9 Standard eServices Cards
            return (
              <div
                key={idx}
                onClick={() => handleCardClick(card.title, card.path, (card as any).externalUrl)}
                className={`group p-6 rounded-2xl transition-all duration-300 cursor-pointer shadow-lg flex flex-col justify-between border border-slate-200/80 dark:border-slate-800 ${
                  isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
                } ${
                  isExternal
                    ? 'hover:shadow-2xl hover:shadow-amber-500/20 hover:ring-2 hover:ring-amber-500 hover:scale-[1.02]'
                    : card.active
                    ? 'hover:shadow-2xl hover:shadow-blue-500/20 hover:ring-2 hover:ring-blue-500 hover:scale-[1.02]'
                    : 'hover:shadow-2xl hover:scale-[1.01]'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold shrink-0 shadow-md ${
                        card.active ? (isExternal ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-blue-600 text-white shadow-lg') : (card as any).color
                      }`}
                    >
                      {IconComponent && <IconComponent className="h-6 w-6" />}
                    </div>
                    {isExternal ? (
                      <Badge variant="primary" size="sm" className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[10px] px-2.5 py-1 shadow-md flex items-center gap-1">
                        <span>Live DRRM Portal</span>
                        <ExternalLink className="h-3 w-3" />
                      </Badge>
                    ) : card.active ? (
                      <Badge variant="primary" size="sm" className="bg-blue-600 text-white font-extrabold text-[10px] px-2.5 py-1 shadow-md">
                        {t('home.activePortal')}
                      </Badge>
                    ) : (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                        {t('home.qcService')}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className={`text-base font-extrabold transition-colors flex items-center gap-1.5 ${isDark ? 'text-white group-hover:text-amber-400' : 'text-slate-900 group-hover:text-blue-600'}`}>
                      <span>{card.title}</span>
                      {isExternal && <ExternalLink className="h-4 w-4 opacity-75 group-hover:opacity-100 text-amber-500 shrink-0" />}
                    </h3>
                    <p className={`text-xs leading-relaxed mt-2 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {card.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stay Connected Banner */}
      <section className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 text-white py-16 sm:py-20 shadow-2xl relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-3xl">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-300 block">
              {isTagalog ? 'Manatiling Konektado' : 'Stay Connected'}
            </span>
            <h3 className="font-heading font-extrabold text-2xl sm:text-4xl text-white leading-tight">
              {isTagalog ? 'Sundan ang QC eServices sa Social Media' : 'Follow QC eServices on Social Media'}
            </h3>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              {isTagalog
                ? 'Sundan ang QC eServices sa social media para sa pinakabagong balita at anunsyo:'
                : 'Follow the QC eServices on social media for the latest updates and announcements:'}
            </p>
          </div>
          <a
            href="https://www.facebook.com/share/1AibfJmCmh/"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ExternalLink className="h-5 w-5" />}
              className="font-extrabold bg-white text-blue-900 hover:bg-blue-50 shadow-xl text-base px-8 py-4 rounded-2xl"
            >
              📱 Facebook: QC eServices Page
            </Button>
          </a>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default QCeServicesHomePage;
