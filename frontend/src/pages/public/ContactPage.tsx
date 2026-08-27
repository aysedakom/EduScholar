import React, { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Building2,
  ChevronDown,
  Sun,
  Moon,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'sonner';

export const ContactPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, isTagalog } = useLanguage();
  const [eservicesOpen, setEservicesOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Scholarship Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (eservicesOpen && !target.closest('.contact-eservices-dropdown')) {
        setEservicesOpen(false);
      }
      if (userDropdownOpen && !target.closest('.contact-user-dropdown')) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [eservicesOpen, userDropdownOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error('Please complete all required fields.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success('Your message has been sent to QC Youth Development Office (QCYDO)!');
      setIsSubmitting(false);
      setIsSubmittedSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    }, 700);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/20 transition-colors duration-200">
      {/* Top Header Navbar - Edge to Edge like Home & E-Scholar */}
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
              <div className="relative contact-eservices-dropdown">
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
                <span className="hidden sm:inline">{t('nav.charter')}</span>
                <span className="sm:hidden">{isTagalog ? 'KARTA' : 'CHARTER'}</span>
              </a>

              {/* CONTACT US Link */}
              <Link
                to="/contact"
                className="flex items-center px-3 py-2 rounded-xl text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 transition-all cursor-pointer"
              >
                <span className="hidden sm:inline">{t('nav.contact')}</span>
                <span className="sm:hidden">{isTagalog ? 'KONTAK' : 'CONTACT'}</span>
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
              <div className="relative contact-user-dropdown">
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
                  <div className="absolute right-0 top-11 w-44 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 shadow-medium z-50">
                    <button
                      onClick={logout}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
                    >
                      {t('nav.signout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <Button variant="primary" size="sm" className="font-extrabold shadow-md shadow-blue-600/30">
                  {t('nav.signin')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Title Section */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-14 px-4 sm:px-6 shadow-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <Badge variant="primary" className="bg-blue-500/20 text-blue-200 border-blue-400/30 font-extrabold text-xs px-3 py-1">
            Quezon City Government • Assistance & Inquiries
          </Badge>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Contact & Support Center
          </h1>
          <p className="text-sm sm:text-base text-blue-100 max-w-3xl leading-relaxed font-medium">
            Have questions about your scholarship application, semestral grant disbursement, eligibility criteria, or citizen residency verification? We're here to assist you.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Direct Contact Info & Office Locations */}
          <div className="space-y-6 lg:col-span-1">
            <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-6">
              <h2 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                QC Youth Development Office
              </h2>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white block">Main Office Location</span>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      4th Floor, Civic Center Building A, Quezon City Hall Complex, Diliman, Quezon City 1100
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white block">Hotline & Phone Lines</span>
                    <p className="text-slate-600 dark:text-slate-400 font-mono">
                      QC Hotline: 122<br />
                      QCYDO Office: (02) 8988-4242 loc. 8175
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white block">Official Email</span>
                    <p className="text-blue-600 dark:text-blue-400 font-medium">
                      qcyouthdevelopment@quezoncity.gov.ph<br />
                      scholarships@quezoncity.gov.ph
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white block">Operating Hours</span>
                    <p className="text-slate-600 dark:text-slate-400">
                      Monday to Friday: 8:00 AM – 5:00 PM<br />
                      (Closed on official national & QC local holidays)
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 shadow-soft space-y-3">
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-bold text-sm">
                <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span>Frequently Asked Questions (FAQ)</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Check our Citizen's Charter and Guidelines for quick answers regarding renewal requirements, Landbank disbursement timelines, and GWA grade retention rules.
              </p>
              <a
                href="/citizens_charter.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs font-extrabold text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 underline underline-offset-4"
              >
                View Citizen's Charter Guidelines →
              </a>
            </Card>
          </div>

          {/* Right Column: Send a Message Form */}
          <div className="lg:col-span-2">
            <Card className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-6">
              <div>
                <h2 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
                  Send an Inquiry / Ticket
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Fill out the form below and our QCYDO Student Assistance Helpdesk will respond within 24–48 business hours.
                </p>
              </div>

              {isSubmittedSuccess ? (
                <div className="p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="font-heading font-black text-xl text-emerald-950 dark:text-emerald-200">
                    Message Successfully Sent!
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out. Your inquiry has been registered in the QCYDO ticketing system. An officer will review your ticket and email you back soon.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsSubmittedSuccess(false)}
                    className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name *"
                      placeholder="e.g. Juan Dela Cruz"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <Input
                      label="Email Address *"
                      type="email"
                      placeholder="e.g. juan.delacruz@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Contact Number (Mobile) *"
                      placeholder="e.g. 0917 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-900 dark:text-slate-200 tracking-wide">
                        Inquiry Category / Topic *
                      </label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full h-11 px-4 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl font-sans text-slate-900 dark:text-slate-100 shadow-xs focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="Scholarship Inquiry">Scholarship Application & Requirements</option>
                        <option value="Semestral Renewal">One-Click Semestral Renewal Status</option>
                        <option value="Disbursement Status">Stipend / Cash Card Disbursement Timeline</option>
                        <option value="QCU Student Portal">Quezon City University (QCU) Sync Issue</option>
                        <option value="Educational Grants">Educational & Academic Grants</option>
                        <option value="QC Citizen Residency">QCitizen ID & Residency Verification</option>
                        <option value="Other Concerns">General Inquiries / Other Concerns</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-900 dark:text-slate-200 tracking-wide">
                      Message / Concern Details *
                    </label>
                    <textarea
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please explain your question or issue in detail. Include your Student Application Reference Number if applicable..."
                      required
                      className="w-full p-4 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl font-sans text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-xs focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isSubmitting}
                    leftIcon={<Send className="h-4 w-4" />}
                    className="font-extrabold w-full sm:w-auto px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/30"
                  >
                    {isSubmitting ? 'Submitting Message...' : 'Submit Inquiry Message'}
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
        Quezon City Youth Development Office (QCYDO) • GovServe E-SCHOLAR Portal
      </footer>
    </div>
  );
};

export default ContactPage;
