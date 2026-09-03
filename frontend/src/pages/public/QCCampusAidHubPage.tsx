import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Sun, Moon, ArrowRight, ExternalLink, Calendar, ShieldCheck, BookOpen } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { useTheme } from '../../context/ThemeContext';

export const QCCampusAidHubPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [eservicesOpen, setEservicesOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header Navigation (No Sidebar) */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-2 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center">
                <img src="/logo-system.png" alt="QC Logo" className="h-7 w-7 object-contain brightness-200" />
              </div>
              <div>
                <span className="font-heading font-black text-lg tracking-tight text-slate-900 dark:text-white block leading-tight">
                  GOVSERVE
                </span>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase block">
                  Quezon City LGU
                </span>
              </div>
            </Link>

            {/* Main Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                to="/"
                className="px-3.5 py-2 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                HOME
              </Link>

              {/* eSERVICES Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setEservicesOpen(!eservicesOpen)}
                  className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <span>eSERVICES</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {eservicesOpen && (
                  <div className="absolute left-0 top-12 w-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden z-50 p-2 animate-in fade-in duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 rounded-xl mb-1">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Available eServices</p>
                    </div>

                    <Link
                      to="/e-scholar"
                      onClick={() => setEservicesOpen(false)}
                      className="block p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all mb-1 group"
                    >
                      <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">E-SCHOLAR</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">LGU QC Scholarship Program & Directory</p>
                    </Link>

                    <Link
                      to="/login"
                      onClick={() => setEservicesOpen(false)}
                      className="block p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
                    >
                      <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Student E-Portal</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Scholar Sign-In & Applications</p>
                    </Link>
                  </div>
                )}
              </div>

              {/* CITIZEN'S CHARTER Link */}
              <a
                href="/citizens_charter.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                CITIZEN'S CHARTER
              </a>

              {/* CONTACT US Link */}
              <Link
                to="/contact"
                className="px-3.5 py-2 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                CONTACT US
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </button>

            {/* Direct Link to E-Scholar Page */}
            <Link to="/e-scholar">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />} className="font-extrabold text-xs shadow-md shadow-blue-600/20">
                Go to E-SCHOLAR Portal
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white py-14 px-4 sm:px-6 shadow-xl relative overflow-hidden">
          <div className="max-w-5xl mx-auto space-y-4 relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary" className="bg-blue-500/20 text-blue-200 border-blue-400/30 font-extrabold text-xs px-3 py-1">
                <ShieldCheck className="h-3.5 w-3.5 mr-1 text-blue-400" /> Quezon City Official LGU Program
              </Badge>
              <Badge variant="warning" className="bg-amber-500/20 text-amber-300 border-amber-400/30 font-extrabold text-xs px-3 py-1">
                <Calendar className="h-3.5 w-3.5 mr-1" /> Applications: July 27 to 31, 2026
              </Badge>
            </div>

            <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
              QC Campus Aid Hub - LGU Scholarship Program
            </h1>

            <p className="text-sm sm:text-base text-blue-100 max-w-3xl leading-relaxed">
              Official guidelines, documentary requirements, application dates, and updates for Quezon City Tertiary Scholars.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link to="/e-scholar">
                <Button variant="primary" size="md" rightIcon={<ArrowRight className="h-4 w-4" />} className="font-extrabold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30">
                  Access E-SCHOLAR Portal
                </Button>
              </Link>
              <Link to="/student/application-form">
                <Button variant="outline" size="md" className="font-bold border-white/30 text-white hover:bg-white/10 dark:hover:bg-slate-800">
                  New Applicant Form
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 space-y-8">
          {/* Section 1: About the Program */}
          <Card className="border border-slate-200 dark:border-slate-800 shadow-soft bg-white dark:bg-slate-900">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" /> About LGU QC Scholarship Program
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Essential program details, ₱5,000 educational grant + ₱5,000 stipend allowance coverage
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-6">
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                The <strong className="text-slate-900 dark:text-white font-extrabold">QC Campus Aid Hub - LGU Scholarship Program</strong> is a limited-time opportunity for qualified students of Quezon City to receive financial support for their education. Applications are accepted only from <strong className="text-blue-700 dark:text-blue-400 font-extrabold">July 27 to 31, 2026</strong>, so make sure to prepare your requirements early. Don't miss this chance to continue your academic journey with the help of the Quezon City local government!
              </p>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 flex items-start gap-3 text-xs sm:text-sm text-amber-900 dark:text-amber-200">
                <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block">Important Deadline Notice:</span>
                  Official application filing period runs strictly from <strong>July 27 to July 31, 2026</strong>. Late submissions or incomplete documentary attachments will not be processed.
                </div>
              </div>

              {/* 4 Feature Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xl shrink-0">
                    🎓
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">LGU QC Educational Grant</h4>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                    ₱5,000 semestral financial support covering tuition, book allowances, and university project fees.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xl shrink-0">
                    💵
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Direct Scholar Stipend</h4>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                    ₱5,000 direct semestral stipend remitted directly to scholar Landbank / electronic wallets.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
                  <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xl shrink-0">
                    📄
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">One-Click Semestral Renewal</h4>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                    Instant renewal for continuous scholars maintaining a 2.50 GWA minimum passing standard.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2 hover:border-purple-300 dark:hover:border-purple-700 transition-all">
                  <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xl shrink-0">
                    🏛️
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">QCU Direct Integration</h4>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                    Automated grades sync and certificate verification for Quezon City University scholars.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Requirements for New Applicants */}
          <Card className="border border-slate-200 dark:border-slate-800 shadow-soft bg-white dark:bg-slate-900">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="text-xl">📋</span> Requirements for New Applicants
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Mandatory document packet for first-time Quezon City scholarship applicants
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="py-3 flex items-start gap-3">
                  <span className="h-7 w-7 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">1</span>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Certificate of Grades (COG)</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Official semestral transcript with minimum General Weighted Average (GWA) of 2.50 or better.</p>
                  </div>
                </div>

                <div className="py-3 flex items-start gap-3">
                  <span className="h-7 w-7 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">2</span>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Statement of Account (SOA)</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Official tuition and miscellaneous fee assessment issued by your accredited HEI.</p>
                  </div>
                </div>

                <div className="py-3 flex items-start gap-3">
                  <span className="h-7 w-7 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">3</span>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Certificate of Registration (COR)</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Valid proof of active semestral enrollment carrying at least 15 academic units.</p>
                  </div>
                </div>

                <div className="py-3 flex items-start gap-3">
                  <span className="h-7 w-7 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">4</span>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">QC Citizen ID & Barangay Certificate of Residency</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Verified QCitizen ID card confirming at least 3 years residency in Quezon City.</p>
                  </div>
                </div>

                <div className="py-3 flex items-start gap-3">
                  <span className="h-7 w-7 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">5</span>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">1-Minute Applicant Video Presentation</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Short intro video outlining your career goals, community advocacy, and QC roots.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link to="/student/application-form">
                  <Button variant="primary" size="md" rightIcon={<ArrowRight className="h-4 w-4" />} className="font-extrabold">
                    Start New Application Form
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Requirements for Renewal */}
          <Card className="border border-slate-200 dark:border-slate-800 shadow-soft bg-white dark:bg-slate-900">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="text-xl">🔄</span> Requirements for Existing Scholar Renewal
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Streamlined semestral renewal process for active QC scholarship beneficiaries
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="py-3 flex items-start gap-3">
                  <span className="h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">1</span>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Statement of Account (SOA)</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Updated breakdown of current academic term fees.</p>
                  </div>
                </div>

                <div className="py-3 flex items-start gap-3">
                  <span className="h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">2</span>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Certificate of Grades (COG)</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Previous term grade slip confirming no failing or incomplete grades.</p>
                  </div>
                </div>

                <div className="py-3 flex items-start gap-3">
                  <span className="h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">3</span>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Certificate of Registration (COR)</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Officially stamped registration form for the active semester.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link to="/renewal">
                  <Button variant="primary" size="md" rightIcon={<ArrowRight className="h-4 w-4" />} className="font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white">
                    Submit Semestral Renewal
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Stay Connected */}
          <Card className="border border-slate-200 dark:border-slate-800 shadow-soft bg-white dark:bg-slate-900">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="text-xl">📱</span> Stay Connected
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                Follow the QC Campus Aid Hub on Facebook for updates, live status announcements, and scholarship news:
              </p>

              <div className="p-4 bg-blue-50/80 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">QC Campus Aid Hub Official Facebook Page</h4>
                    <p className="text-xs text-blue-700 dark:text-blue-400 font-mono">@QCCampusAidHub</p>
                  </div>
                </div>

                <a
                  href="https://www.facebook.com/share/1AibfJmCmh/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0"
                >
                  <Button variant="primary" size="sm" rightIcon={<ExternalLink className="h-4 w-4" />} className="font-extrabold bg-blue-600 hover:bg-blue-700 text-white">
                    Visit Facebook Page
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default QCCampusAidHubPage;
