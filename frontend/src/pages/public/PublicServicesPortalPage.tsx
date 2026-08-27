import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ExternalLink,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
  BookOpen,
  FileText,
  BadgeCheck,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const PublicServicesPortalPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [eservicesOpen, setEservicesOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (eservicesOpen && !target.closest('.public-eservices-dropdown')) {
        setEservicesOpen(false);
      }
      if (userDropdownOpen && !target.closest('.public-user-dropdown')) {
        setUserDropdownOpen(false);
      }
    };

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 250);
    };

    document.addEventListener('mousedown', handleClick);
    window.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [eservicesOpen, userDropdownOpen]);

  const scrollToEscholarBtn = () => {
    const heroBtn = document.getElementById('e-scholar-hero-section');
    if (heroBtn) {
      heroBtn.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const newRequirements = [
    { code: 'COG', title: 'Certificate of Grades', description: 'Latest school year or semester official grade transcript' },
    { code: 'SOA', title: 'Statement of Account', description: 'Official tuition breakdown / assessment sheet from university' },
    { code: 'COR', title: 'Certificate of Registration', description: 'Current semester officially enrolled subject matrix' },
    { code: 'QC ID (verified)', title: 'Verified QCitizen ID', description: 'Verified QCitizen digital or physical card copy' },
    { code: 'Video Presentation', title: '3-Minute Video Presentation', description: '3-minute self-recorded video explaining why you deserve the scholarship' },
  ];

  const renewalRequirements = [
    { code: 'SOA', title: 'Statement of Account', description: 'Official semestral tuition fee breakdown' },
    { code: 'COG', title: 'Certificate of Grades', description: 'Previous semester passing grade report' },
    { code: 'COR', title: 'Certificate of Registration', description: 'Newly enrolled term subject list' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-600/20 transition-colors duration-200">
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

            <nav className="flex items-center gap-1 sm:gap-2">
              <Link to="/" className="flex items-center px-3 py-2 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <span>HOME</span>
              </Link>
              <div className="relative public-eservices-dropdown">
                <button
                  onClick={() => setEservicesOpen(!eservicesOpen)}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <span>eSERVICES</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>
                {eservicesOpen && (
                  <div className="absolute left-0 top-11 w-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden z-50 p-2 animate-in fade-in duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 rounded-xl mb-1">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Available eServices</p>
                    </div>
                    <Link to="/education-scholarship" onClick={() => setEservicesOpen(false)} className="flex items-start gap-3 p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 hover:bg-blue-100/80 dark:hover:bg-blue-900/40 transition-all mb-1 group">
                      <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">🎓</div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-extrabold text-blue-900 dark:text-blue-200 group-hover:text-blue-700 dark:group-hover:text-blue-300">Education and Scholarship</p>
                          <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">Primary</span>
                        </div>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">QC Campus Aid Hub & Student Grants</p>
                      </div>
                    </Link>
                    <Link to="/e-scholar" onClick={() => setEservicesOpen(false)} className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                      <span className="text-sm">⚡</span> E-SCHOLAR Hub & Grants
                    </Link>
                    <Link to="/scholar-prog-available" onClick={() => setEservicesOpen(false)} className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                      <span className="text-sm">🎓</span> Available Programs
                    </Link>
                    <Link to="/scholar-eguide" onClick={() => setEservicesOpen(false)} className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                      <span className="text-sm">📖</span> Scholar E-Guide
                    </Link>
                    <Link to={user ? "/dashboard" : "/login"} onClick={() => setEservicesOpen(false)} className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border-t border-slate-100 dark:border-slate-800 mt-1 pt-2">
                      <span className="text-sm">⚡</span> Portal {user ? '(Dashboard)' : '(Sign In)'}
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </button>
            {user ? (
              <div className="relative public-user-dropdown">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 px-2.5 text-slate-800 dark:text-slate-200 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-extrabold text-white shadow-xs">{user.name?.charAt(0).toUpperCase() ?? 'U'}</div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white hidden sm:inline">{user.name}</span>
                </button>
                {userDropdownOpen && (
                  <div className="absolute right-0 top-11 w-44 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 shadow-medium z-50">
                    <button onClick={logout} className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer">Sign out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <Button variant="primary" size="sm" className="font-extrabold shadow-md shadow-blue-600/30">Sign In →</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div
        id="e-scholar-hero-section"
        className="w-full relative overflow-hidden bg-center bg-no-repeat shadow-lg border-b border-slate-700/40 text-white py-14 sm:py-20 transition-all duration-300"
        style={{
          backgroundImage: theme === 'dark' ? "url('/Darkmode.jpg')" : "url('/Lightmode.jpg')",
          backgroundSize: '100% 100%',
        }}
      >
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${theme === 'dark' ? 'bg-slate-950/40' : 'bg-slate-950/20'}`} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <Badge variant="primary" className="bg-slate-900/70 text-amber-300 border-amber-400/40 text-xs px-3.5 py-1.5 font-extrabold rounded-full backdrop-blur-md">
            ⏰ Limited-Time Application Window: July 27 – 31, 2026
          </Badge>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-snug drop-shadow-md">
            QC Campus Aid Hub – LGU Scholarship Program
          </h1>
          <p className="text-base sm:text-lg text-slate-100 leading-relaxed font-semibold max-w-4xl drop-shadow-sm">
            Official Quezon City Local Government Unit scholarship assistance portal. Empowering Quezon City youth through direct tertiary financial grants, enrollment support, and semestral aid distribution.
          </p>
          <div className="pt-2">
            <Link to="/e-scholar">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="font-extrabold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-amber-500/30 text-sm px-6 py-3 rounded-2xl cursor-pointer"
              >
                E-Scholar Portal
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <main className="w-full space-y-0 animate-in fade-in duration-300">
        <section className="w-full bg-white dark:bg-slate-900 py-12 sm:py-14 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white flex items-center gap-3">
                <BookOpen className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                About the Program
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">QC Campus Aid Hub – Quezon City LGU Scholarship Program Overview</p>
            </div>
            <div className="p-6 sm:p-8 bg-blue-50/80 dark:bg-blue-950/40 border-l-4 border-blue-600 rounded-r-3xl text-slate-900 dark:text-slate-100 space-y-4">
              <p className="text-base sm:text-lg leading-relaxed text-blue-950 dark:text-blue-200 font-medium">
                The <strong className="text-blue-950 dark:text-white">QC Campus Aid Hub - LGU Scholarship Program</strong> is a limited-time opportunity for qualified students of Quezon City to receive financial support for their education. Applications are accepted only from <strong className="text-blue-700 dark:text-blue-300">July 27 to 31, 2026</strong>, so make sure to prepare your requirements early. Don't miss this chance to continue your academic journey with the help of the Quezon City local government!
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div className="p-6 bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl space-y-2">
                <div className="h-10 w-10 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-lg">📅</div>
                <span className="text-xs font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Application Dates</span>
                <p className="font-extrabold text-blue-700 dark:text-blue-400 text-xl">July 27 – 31, 2026</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Strict 5-day filing window enforced by QCYDO</p>
              </div>
              <div className="p-6 bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl space-y-2">
                <div className="h-10 w-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-lg">🎓</div>
                <span className="text-xs font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Target Beneficiaries</span>
                <p className="font-extrabold text-emerald-700 dark:text-emerald-400 text-xl">Quezon City Students</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Resident tertiary & vocational students</p>
              </div>
              <div className="p-6 bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl space-y-2">
                <div className="h-10 w-10 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-lg">💳</div>
                <span className="text-xs font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Disbursement Method</span>
                <p className="font-extrabold text-purple-700 dark:text-purple-400 text-xl">Direct E-Wallet / GCash</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Automated electronic stipend payouts</p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full bg-white dark:bg-slate-900 py-12 sm:py-14 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white flex items-center gap-3">
                <FileText className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                Requirements for New Applicants
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">Mandatory document submission checklist for fresh applicant verification</p>
            </div>
            <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="p-4 pl-6 sm:pl-8">Requirement</th>
                      <th className="p-4">Document Title</th>
                      <th className="p-4">Specific Description & Guidelines</th>
                      <th className="p-4 text-right pr-6 sm:pr-8">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 dark:divide-slate-700/80 font-medium text-slate-800 dark:text-slate-200">
                    {newRequirements.map((req, i) => (
                      <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors">
                        <td className="p-4 pl-6 sm:pl-8"><span className="font-extrabold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 border border-blue-200/80 dark:border-blue-800 px-3 py-1.5 rounded-xl text-xs inline-block shadow-2xs">{req.code}</span></td>
                        <td className="p-4 font-extrabold text-slate-900 dark:text-white">{req.title}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-300 leading-relaxed">{req.description}</td>
                        <td className="p-4 text-right pr-6 sm:pr-8"><Badge variant="info" size="md" className="font-extrabold bg-blue-600 text-white">Required</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full bg-white dark:bg-slate-900 py-12 sm:py-14 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white flex items-center gap-3">
                <BadgeCheck className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                Requirements for Renewal
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">Semestral continuation requirements for existing QC scholars</p>
            </div>
            <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="p-4 pl-6 sm:pl-8">Requirement</th>
                      <th className="p-4">Document Title</th>
                      <th className="p-4">Specific Description & Guidelines</th>
                      <th className="p-4 text-right pr-6 sm:pr-8">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 dark:divide-slate-700/80 font-medium text-slate-800 dark:text-slate-200">
                    {renewalRequirements.map((req, i) => (
                      <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors">
                        <td className="p-4 pl-6 sm:pl-8"><span className="font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/80 dark:border-emerald-800 px-3 py-1.5 rounded-xl text-xs inline-block shadow-2xs">{req.code}</span></td>
                        <td className="p-4 font-extrabold text-slate-900 dark:text-white">{req.title}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-300 leading-relaxed">{req.description}</td>
                        <td className="p-4 text-right pr-6 sm:pr-8"><Badge variant="success" size="md" className="font-extrabold bg-emerald-600 text-white">Renewal</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 text-white py-16 sm:py-20 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-3 max-w-3xl">
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-300 block">Stay Connected</span>
              <h3 className="font-heading font-extrabold text-2xl sm:text-4xl text-white leading-tight">Follow QC Campus Aid Hub on Facebook</h3>
              <p className="text-blue-100 text-sm sm:text-base leading-relaxed">Follow the QC Campus Aid Hub on Facebook for updates, announcements, status release schedules, and batch disbursement notices.</p>
            </div>
            <a href="https://www.facebook.com/share/1AibfJmCmh/" target="_blank" rel="noopener noreferrer" className="shrink-0">
              <Button variant="primary" size="lg" rightIcon={<ExternalLink className="h-5 w-5" />} className="font-extrabold bg-white text-blue-900 hover:bg-blue-50 shadow-lg text-base px-8 py-4 rounded-2xl">👉 Visit Official Facebook Page</Button>
            </a>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-300 py-12 px-4 sm:px-6 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo-system.png" alt="GovServe" className="h-8 w-8 object-contain" />
            <div>
              <span className="font-heading font-extrabold text-white text-sm block">GovServe – QC Campus Aid Hub</span>
              <span className="text-slate-500 text-[11px]">Quezon City Youth Development Office (QCYDO)</span>
            </div>
          </div>
          <p className="text-slate-400 text-center sm:text-right">Applications open July 27 – 31, 2026. Official LGU Educational Assistance Portal.</p>
        </div>
      </footer>

      {/* Floating Scroll-Up Toggle Button to E-Scholar Portal */}
      {showScrollTop && (
        <button
          onClick={scrollToEscholarBtn}
          title="Scroll up to E-Scholar Portal"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 px-4 py-3 rounded-full font-extrabold shadow-2xl shadow-amber-500/50 border border-amber-300/60 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 cursor-pointer group"
        >
          <ChevronUp className="h-5 w-5 text-slate-950 group-hover:-translate-y-0.5 transition-transform" />
          <span className="text-xs font-black tracking-wide uppercase">E-Scholar Portal ↑</span>
        </button>
      )}
    </div>
  );
};

export default PublicServicesPortalPage;
