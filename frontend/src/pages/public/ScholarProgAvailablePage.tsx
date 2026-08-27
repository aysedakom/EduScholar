import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  ChevronDown,
  Sun,
  Moon,
  FileText,
  CheckCircle2,
  BookOpen,
  ArrowLeft,
  AlertTriangle,
  X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { getActiveStudentApplication } from '../../utils/scholarshipPrograms';

interface SubCategoryInfo {
  id: string;
  title: string;
  tuitionGrant: string;
  stipend: string;
  totalMax: string;
  qualifications: string[];
  documents: string[];
}

interface ScholarshipProgramCategory {
  id: string;
  title: string;
  shortTitle: string;
  level: string;
  badge: string;
  summary: string;
  subCategories: SubCategoryInfo[];
}

const SCHOLARSHIP_DATA: ScholarshipProgramCategory[] = [
  {
    id: 'shs',
    title: 'Scholarship for Senior High School Students',
    shortTitle: 'Senior High School',
    level: 'Grades 11 & 12',
    badge: 'SHS Level',
    summary: 'Financial support for deserving junior high school completers transitioning into Senior High School academic or technical-vocational tracks.',
    subCategories: [
      {
        id: 'shs-academic',
        title: 'Academic Scholarship',
        tuitionGrant: 'PHP 20,000',
        stipend: 'PHP 10,000',
        totalMax: 'PHP 30,000 / school year',
        qualifications: [
          'Must graduate from junior high school with Academic Honors (Rank 1-10) or with top 10 highest overall GWA.',
          'Must have a General Weighted Average (GWA) of at least 89% or its equivalent.',
          'Bona fide Quezon City resident with valid QCitizen ID.',
          'Enrolled in a recognized private or public Senior High School.',
        ],
        documents: [
          'Proof of academic honors received or certification that GWA is within the top 10 highest overall.',
          'Copy of Form 137 / 138 (Report Card) showing GWA >= 89%.',
          'Certificate of Enrollment / Registration in Senior High School.',
          'Proof of QC Residency (Barangay Clearance / QCitizen ID).',
        ],
      },
      {
        id: 'shs-specialized',
        title: 'Specialized Track Scholarship',
        tuitionGrant: 'PHP 20,000',
        stipend: 'PHP 10,000',
        totalMax: 'PHP 30,000 / school year',
        qualifications: [
          'Must be enrolled at a Specialized Public Senior High School located outside of his/her district of residence.',
          'Must have a General Weighted Average (GWA) of at least 89% or its equivalent.',
          'QC resident with active enrollment credentials.',
        ],
        documents: [
          'Certification of Enrollment from the specialized public Senior High School.',
          'Official Report Card with GWA >= 89%.',
          'Proof of QC residency.',
        ],
      },
      {
        id: 'shs-athletic',
        title: 'Athletic and Arts Scholarship',
        tuitionGrant: 'PHP 20,000',
        stipend: 'PHP 10,000',
        totalMax: 'PHP 30,000 / school year',
        qualifications: [
          'Must be a recent recipient of a major award for sports or arts, or a current member of a sports/arts program recognized by the city.',
          'Must have a General Weighted Average (GWA) of at least 85% or its equivalent.',
        ],
        documents: [
          'Proof of recent major sports or arts award/recognition, or official certificate of membership in recognized sports/arts varsity or troupe.',
          'Official Report Card with GWA >= 85%.',
          'Endorsement from sports/arts trainer or school head.',
        ],
      },
      {
        id: 'shs-youth-leaders',
        title: 'Youth Leaders Scholarship',
        tuitionGrant: 'PHP 20,000',
        stipend: 'PHP 10,000',
        totalMax: 'PHP 30,000 / school year',
        qualifications: [
          'Must be a recent recipient of a recognized leadership award or currently serve as an official of Sangguniang Kabataan (SK), Supreme Student Government (SSG), or QC-registered Youth Organizations.',
          'Must have a General Weighted Average (GWA) of at least 85% or its equivalent.',
        ],
        documents: [
          'Proof of leadership award received or Certificate of Incumbency / Oath of Office (SK / SSG / Youth Org).',
          'Official Report Card with GWA >= 85%.',
          'Barangay or Youth Affairs certification.',
        ],
      },
    ],
  },
  {
    id: 'tertiary',
    title: 'Scholarship for Tertiary (College) Students',
    shortTitle: 'Tertiary / College',
    level: 'Undergraduate Degrees',
    badge: 'Undergraduate',
    summary: 'Comprehensive financial assistance and allowances for Quezon City undergraduate students enrolled in state, local, or private universities.',
    subCategories: [
      {
        id: 'tertiary-excel',
        title: 'QC Excel Scholarship',
        tuitionGrant: 'PHP 110,000',
        stipend: 'PHP 50,000',
        totalMax: 'PHP 160,000 / school year',
        qualifications: [
          'Must be an incoming freshman / 1st year tertiary student at time of application.',
          'Enrolled or accepted in priority courses/specializations identified by QC Government (STEM, Data Science, Urban Planning, Allied Health).',
          'Must pass interviews and aptitude / psychological tests administered by QC Government.',
          'Must show proof of leadership / volunteer work / socio-civic engagements.',
          'Must maintain a General Weighted Average (GWA) of at least 1.75 (or 90%).',
        ],
        documents: [
          'Proof of leadership position held / volunteer work / social civic engagement.',
          'At least two (2) written endorsement letters from academic mentors or community heads.',
          'Certificate of Enrollment in an approved priority course.',
          'Senior High School Report Card (GWA >= 1.75 equivalent).',
        ],
      },
      {
        id: 'tertiary-academic',
        title: 'Academic Scholarship (Tertiary)',
        tuitionGrant: 'PHP 80,000',
        stipend: 'PHP 25,000',
        totalMax: 'PHP 105,000 / school year',
        qualifications: [
          'Must graduate from senior high school with Academic Honors (Rank 1-10) or top 10 highest overall GWA.',
          'Must have a General Weighted Average (GWA) of at least 1.75 or its equivalent.',
          'Enrolled in an accredited tertiary institution in Metro Manila.',
        ],
        documents: [
          'Official certification of graduating with Academic Honors (Rank 1-10) or top 10 GWA.',
          'Certified True Copy of Grades / Official Transcript of Records (GWA >= 1.75).',
          'Certificate of Registration (COR).',
        ],
      },
      {
        id: 'tertiary-athletic',
        title: 'Athletic and Arts Scholarship (Tertiary)',
        tuitionGrant: 'PHP 55,000',
        stipend: 'PHP 25,000',
        totalMax: 'PHP 80,000 / school year',
        qualifications: [
          'Must be a recent recipient of a major individual award for sports or arts, or a current member of a recognized varsity or arts team.',
          'Must have a General Weighted Average (GWA) of at least 2.5 or its equivalent (no failing marks).',
        ],
        documents: [
          'Proof of major individual award/recognition in regional, national, or collegiate sports/arts competitions.',
          'Official certificate of active varsity/arts membership from the university athletics/culture office.',
          'Transcript of Records / Semestral grades (GWA >= 2.5).',
        ],
      },
      {
        id: 'tertiary-youth-leaders',
        title: 'Youth Leaders Scholarship (Tertiary)',
        tuitionGrant: 'PHP 55,000',
        stipend: 'PHP 25,000',
        totalMax: 'PHP 80,000 / school year',
        qualifications: [
          'Must be a recent recipient of a city leadership award or current official of Sangguniang Kabataan (SK), University Student Council (USC/SSG), or QC-registered youth organization.',
          'Must maintain a General Weighted Average (GWA) of at least 2.5 or its equivalent.',
        ],
        documents: [
          'Certificate of Appointment/Election or Incumbency for SK, Student Council, or Youth Organization.',
          'Transcript of Records with GWA >= 2.5.',
          'Socio-civic leadership accomplishment portfolio.',
        ],
      },
      {
        id: 'tertiary-economic',
        title: 'Economic Scholarship (Need-Based)',
        tuitionGrant: 'PHP 5,000 / semester (PHP 10,000 / school year)',
        stipend: 'PHP 5,000 / semester (PHP 10,000 / school year)',
        totalMax: 'PHP 10,000 / semester (PHP 20,000 / school year)',
        qualifications: [
          'Must belong to a household within low-middle income to poverty threshold levels, OR belong to vulnerable sectors: displaced families in QC, PWDs, Kasambahays/household helpers, ALS graduates, solo parents, children of incarcerated parents, children of tricycle drivers/operators.',
          'Must maintain a passing General Weighted Average (GWA >= 3.0 / 75%).',
        ],
        documents: [
          'Certificate of Indigency from Barangay or QC Social Services Development Department (SSDD).',
          'Sectoral proof: SSS Kasambahay registration, Solo Parent ID, PWD ID, ALS Certificate of Equivalency, or Driver/Operator franchise certification.',
          'Latest Income Tax Return (ITR), BIR Certificate of Tax Exemption, or Affidavit of Low/No Income.',
          'Latest Certificate of Registration (COR) and grades.',
        ],
      },
      {
        id: 'tertiary-filipino',
        title: 'Manuel L. Quezon Filipino Language and Literature Scholarship',
        tuitionGrant: 'PHP 80,000',
        stipend: 'PHP 25,000',
        totalMax: 'PHP 105,000 / school year',
        qualifications: [
          'Incoming freshman / first-year college student enrolled in a degree related to Filipino Language, Literature, or Panitikan.',
          'Must pass interview/aptitude assessment (may be waived upon proof of published literary work, campus journal, or national awards).',
          'Must maintain a GWA of at least 1.75 or equivalent.',
        ],
        documents: [
          'Writing portfolio in Filipino (published articles, school publications, poems, or essays).',
          'Certificates from literary workshops or competition awards.',
          'Transcript of Records / High school grades.',
        ],
      },
    ],
  },
  {
    id: 'postgrad',
    title: 'Scholarship for Postgraduate Students',
    shortTitle: 'Postgraduate',
    level: 'Master’s / Doctorate Degrees',
    badge: 'Postgraduate / LGU Staff',
    summary: 'Continuing higher education grants for Quezon City Government personnel and partner civil servants pursuing masteral or doctoral studies.',
    subCategories: [
      {
        id: 'postgrad-thesis',
        title: 'Postgraduate Educational & Thesis Grant',
        tuitionGrant: 'PHP 55,000',
        stipend: 'PHP 50,000**',
        totalMax: 'PHP 105,000 / school year',
        qualifications: [
          'Must be employed within the Quezon City Government or with offices/units working with QC Government for at least 1 year.',
          'Must maintain a General Weighted Average (GWA) of at least 2.5 or its postgraduate equivalent.',
          'Enrolled in an accredited master’s or doctoral degree program in Metro Manila.',
        ],
        documents: [
          'Proof of Employment indicating salary grade level and permanent/contractual position held.',
          'Official recommendation letter from Department/Office/Unit Head.',
          'Official proof stating duties, responsibilities, and study alignment.',
          'Certificate of Enrollment / Registration in postgraduate school.',
        ],
      },
    ],
  },
  {
    id: 'continuing-vocational',
    title: 'Scholarship for Continuing Education & Vocational Courses',
    shortTitle: 'Vocational & Licensure',
    level: 'Short Courses & Review Aid',
    badge: 'Tech-Voc & Board Review',
    summary: 'Targeted financial assistance for Quezon City students taking technical-vocational modules, TESDA courses, or board/bar exam reviews.',
    subCategories: [
      {
        id: 'continuing-vocational',
        title: 'Continuing Education & Vocational Grant',
        tuitionGrant: '— (Direct Aid)',
        stipend: 'PHP 10,000',
        totalMax: 'PHP 10,000 stipend',
        qualifications: [
          'Must be enrolled in short courses, technical-vocational training, or licensure/board/bar exam review courses.',
          'Training institution or review center must be accredited and recognized by the city.',
          'QC resident with active enrollment status.',
        ],
        documents: [
          'Course or Training Curriculum outline from the accredited center.',
          'Certification of Enrollment from training center or review academy.',
          'Bounded QC ID and proof of residence.',
          '2-Minute Application Video explaining study goals and civic commitment.',
        ],
      },
    ],
  },
  {
    id: 'creative-writing',
    title: 'Scholarship for Filipino Language & Creative Writing Practitioners',
    shortTitle: 'Creative Writing & Literary',
    level: 'Specialized Cultural Grant',
    badge: 'Literary & Arts',
    summary: 'Stipends and publication subsidies for students, educators, and creative writers advancing the national language and Philippine literature.',
    subCategories: [
      {
        id: 'creative-writing',
        title: 'Creative Writing and Literary Grant',
        tuitionGrant: '— (Direct Grant)',
        stipend: '₱10,000 + ₱30,000 (Pub. Aid)',
        totalMax: 'Up to PHP 40,000',
        qualifications: [
          'Must be a student, educator, or practitioner of Filipino language, literature, or creative writing.',
          'Must show proof of acceptance or certification of publication from a recognized publisher or literary institution.',
          'Must demonstrate active involvement and portfolio in Filipino literary works (poetry, fiction, essay, drama).',
        ],
        documents: [
          'Writing Portfolio written in Filipino (school publications, campus journals, original creative literary work).',
          'Writing plan and manuscript related to the work to be published.',
          'Certification from authorized book publisher recognized by National Book Development Board (NBDB) or Komisyon sa Wikang Filipino (KWF).',
          'Publisher details (title, date, publisher, ISBN/ISSN if available).',
        ],
      },
    ],
  },
];

export const ScholarProgAvailablePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, isTagalog } = useLanguage();
  const [eservicesOpen, setEservicesOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const [openCategoryAccordion, setOpenCategoryAccordion] = useState<string>('shs');
  const [blockedModalOpen, setBlockedModalOpen] = useState(false);

  const activeApp = getActiveStudentApplication();

  const handleApply = (programId: string) => {
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent('/student/application-form?program=' + programId));
      return;
    }
    if (activeApp) {
      setBlockedModalOpen(true);
      return;
    }
    navigate('/student/application-form?program=' + programId);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (eservicesOpen && !target.closest('.prog-eservices-dropdown')) {
        setEservicesOpen(false);
      }
      if (userDropdownOpen && !target.closest('.prog-user-dropdown')) {
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
              <div className="relative prog-eservices-dropdown">
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
              <div className="relative prog-user-dropdown">
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
                      <p className="text-[10px] text-slate-400 capitalize">{user.role?.replace('_', ' ')}</p>
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
              {t('prog.breadcrumb')}
            </span>
          </div>

          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-snug drop-shadow-md">
            {t('prog.heroTitle')}
          </h1>
          <p className="text-base sm:text-lg text-slate-100 leading-relaxed font-semibold max-w-3xl drop-shadow-sm">
            {t('prog.heroSubtitle')}
          </p>
        </div>
      </div>

      {/* Main Page Container */}
      <main className="max-w-7xl mx-auto space-y-8 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300 pb-16 flex-1 w-full">
        {/* Section 1: Detailed Category Accordion Cards */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white">
                {t('prog.accordionTitle')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('prog.accordionSubtitle')}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {SCHOLARSHIP_DATA.map((cat) => {
              const isOpen = openCategoryAccordion === cat.id;

              return (
                <Card
                  key={cat.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft overflow-hidden transition-all"
                >
                  {/* Category Drawer Header */}
                  <button
                    type="button"
                    onClick={() => setOpenCategoryAccordion(isOpen ? '' : cat.id)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800 font-extrabold">
                        <GraduationCap className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                            {cat.title}
                          </h3>
                          <Badge variant="primary" size="sm" className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-bold">
                            {cat.badge}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                          {cat.summary}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 hidden sm:inline">
                        {isOpen ? 'Collapse Track Info' : `View ${cat.subCategories.length} Sub-Categories`}
                      </span>
                      <div className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </div>
                  </button>

                  {/* Expanded Content Drawer */}
                  {isOpen && (
                    <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-6 animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
                        {cat.subCategories.map((sub, idx) => (
                          <Card
                            key={idx}
                            className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between space-y-4"
                          >
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
                                  {sub.title}
                                </h4>
                                <Badge variant="success" size="sm" className="font-bold shrink-0">
                                  {sub.totalMax}
                                </Badge>
                              </div>

                              {/* Grant Breakdown Chips */}
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                  <span className="text-[10px] text-slate-400 font-semibold block">Tuition Fee Grant</span>
                                  <span className="font-extrabold text-blue-600 dark:text-blue-400">{sub.tuitionGrant}</span>
                                </div>
                                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                  <span className="text-[10px] text-slate-400 font-semibold block">Living Stipend</span>
                                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{sub.stipend}</span>
                                </div>
                              </div>

                              {/* Qualifications Box */}
                              <div className="space-y-1.5 pt-1">
                                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /> Qualifications & GWA
                                </span>
                                <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 pl-1">
                                  {sub.qualifications.map((q, qIdx) => (
                                    <li key={qIdx} className="flex items-start gap-2">
                                      <span className="text-blue-500 font-bold">•</span>
                                      <span>{q}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Required Documents */}
                              <div className="space-y-1.5 pt-1 border-t border-slate-200 dark:border-slate-700">
                                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                  <FileText className="h-3.5 w-3.5 text-amber-600" /> Documentary Attachments
                                </span>
                                <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pl-1">
                                  {sub.documents.map((d, dIdx) => (
                                    <li key={dIdx} className="flex items-start gap-2">
                                      <span className="text-amber-500 font-bold">•</span>
                                      <span>{d}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <div className="pt-2">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleApply(sub.id)}
                                className="w-full font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs hover:shadow-md transition-all"
                              >
                                Apply for {sub.title} →
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </section>

        {/* Section 2: Reference to Scholar E-Guide & Application Portal */}
        <section className="pt-4 space-y-6">
          <Card className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-blue-800 text-white rounded-3xl p-8 shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-blue-200">
                  <BookOpen className="h-4 w-4 text-amber-300" />
                  <span>QCSP Policy Handbook & Step-by-Step Guide</span>
                </div>
                <h3 className="font-heading font-black text-2xl sm:text-3xl text-white">
                  Looking for the Official Grant Matrix & Procedures?
                </h3>
                <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                  Review the complete tuition fee and living stipend breakdown table, 10-step new applicant procedure, semestral renewal guide, and Scholarship Screening Committee (SSC) governance.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <Link to="/scholar-eguide">
                  <Button variant="secondary" size="md" className="bg-white text-blue-900 font-extrabold hover:bg-blue-50 shadow-md">
                    Open Scholar E-Guide →
                  </Button>
                </Link>
                <button
                  type="button"
                  onClick={() => handleApply('shs-academic')}
                  className="font-extrabold px-5 py-2.5 rounded-xl text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                >
                  Start New Application →
                </button>
              </div>
            </div>
          </Card>
        </section>
      </main>

      {/* Active Application Modal / Single Application Limit Warning */}
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

      {/* Public Footer */}
      <footer className="bg-slate-900 text-slate-300 py-10 px-4 sm:px-6 border-t border-slate-800 text-xs mt-12">
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

export default ScholarProgAvailablePage;
