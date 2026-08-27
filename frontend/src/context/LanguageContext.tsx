import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

export type Language = 'en' | 'tl';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, defaultText?: string) => string;
  isTagalog: boolean;
}

export const DICTIONARY: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'HOME',
    'nav.eservices': 'eSERVICES',
    'nav.charter': "CITIZEN'S CHARTER",
    'nav.contact': 'CONTACT US',
    'nav.signup': 'Sign Up',
    'nav.signin': 'Sign In →',
    'nav.signout': 'Sign out',
    'nav.dashboard': 'Scholar Dashboard',
    'nav.landing': 'EduScholar Landing',
    'nav.hub': 'E-SCHOLAR Hub Services',
    'nav.eguide': 'Scholarship Policy E-Guide',
    'nav.programs': 'Available Programs Catalog',
    'nav.portal': 'Student E-Portal',
    'nav.primary': 'Primary',
    'nav.available': 'Available eServices',
    'nav.tagline': 'QC eServices Hub',
    'nav.eduScholarTitle': 'Education and Scholarship',
    'nav.eduScholarDesc': 'QC Campus Aid Hub & Student Grants',

    // Language Toggle
    'lang.name': 'English',
    'lang.switchPrompt': 'Palitan sa Tagalog (Filipino)',
    'lang.switchedToast': 'Switched system language to English',

    // Home Page (QCeServicesHomePage)
    'home.heroTitle': 'Welcome to QC eServices',
    'home.heroSubtitle': '"Empowering QCitizens with seamless, intelligent, and accessible city services."',
    'home.aboutTag': 'About the Platform',
    'home.aboutTitle': 'QC eServices Unified Digital Portal',
    'home.aboutBody': "QC eServices is the Quezon City Government's unified digital platform designed to bring government services closer to the people. Through this portal, QCitizens can access a wide range of city services from applying for permits and scholarships to monitoring health programs and disaster responses all in one convenient online hub. The platform is built to streamline processes, reduce paperwork, and provide real-time updates, ensuring that every QCitizen enjoys a seamless and efficient experience.",
    'home.dirTag': 'City Services Directory',
    'home.dirTitle': 'Explore QC eServices',
    'home.dirSubtitle': 'Select a city service category below to access digital applications, municipal permits, and public assistance hubs.',
    'home.activePortal': 'Active Portal →',
    'home.qcService': 'QC eService',
    'home.viewServices': 'View Active Portal',

    // Service Cards
    'service.citizen.title': 'Citizen Information & Engagement',
    'service.citizen.desc': 'Public announcements, community consultations, citizen feedback & city hall engagement portal.',
    'service.permits.title': 'Permits & Licensing Management',
    'service.permits.desc': 'Business permits, occupational clearances, municipal licensing & automated application processing.',
    'service.social.title': 'Social Services Management',
    'service.social.desc': 'Social welfare assistance, senior citizen support, solo parent aid & emergency financial relief.',
    'service.health.title': 'Health & Sanitation Management',
    'service.health.desc': 'City health center appointments, medical programs, sanitation permits & digital health records.',
    'service.edu.title': 'Education & Scholarship Management',
    'service.edu.desc': 'QC Campus Aid Hub: Tertiary scholarships, school aid distribution, educational subsidies & student grants.',
    'service.drrm.title': 'Disaster Risk Reduction & Emergency Response (DRRM)',
    'service.drrm.desc': 'QC Disaster risk reduction, emergency dispatch, weather advisories & evacuation center monitoring.',
    'service.urban.title': 'Urban Planning, Zoning & Housing',
    'service.urban.desc': 'Zoning clearance applications, urban planning, land use permits & socialized housing registration.',
    'service.treasury.title': 'Revenue Collection & Treasury Services',
    'service.treasury.desc': 'Real property tax online payments, municipal treasury settlement, RPT receipts & tax assessments.',
    'service.transport.title': 'Transport & Mobility Management',
    'service.transport.desc': 'QC Bus augmentation routes, TODA tricycle permits, traffic advisories & municipal parking.',
    'service.assets.title': 'Public Assets & Facilities Management',
    'service.assets.desc': 'City hall venue reservations, public parks, municipal hall facility bookings & asset tracking.',

    // EduScholar Landing Page
    'landing.heroTitle': 'Quezon City Scholarship Program (QCSP)',
    'landing.heroSubtitle': 'Empowering Quezon City youth through accessible tertiary and vocational education grants, automated disbursements, and merit recognitions.',
    'landing.step1Title': '1. Create & Verify Account',
    'landing.step1Desc': 'Register using your QC Citizen ID or student portal login credentials.',
    'landing.step2Title': '2. Complete Application',
    'landing.step2Desc': 'Fill in your academic profile, attach documents, and submit your application.',
    'landing.step3Title': '3. Track & Receive Aid',
    'landing.step3Desc': 'Monitor application review in real-time and receive direct stipend disbursements.',
    'landing.drawer1': 'How Campus Aid Hub Works (3-Step Digital Process)',
    'landing.drawer2': 'Who Can Apply? (Eligibility Criteria)',
    'landing.drawer3': 'Scholarship Categories at a Glance',
    'landing.eguideBannerTitle': 'Looking for the Complete Scholarship E-Guide?',
    'landing.eguideBannerDesc': 'Explore comprehensive criteria breakdowns, grade requirements, submission dates, and stipend rules.',
    'landing.eguideBannerBtn': 'View Scholar E-Guide',
    'landing.progBannerTitle': 'Discover All Available Scholarship Programs',
    'landing.progBannerDesc': 'Browse the live catalog of open scholarship tracks, slot quotas, and institutional grants.',
    'landing.progBannerBtn': 'View Available Programs',
    'landing.stayUpdated': 'Stay Updated',
    'landing.stayUpdatedSubtitle': 'Subscribe to official announcements, deadlines, and intake schedules directly from QC Youth Development Office.',

    // E-Scholar Page
    'escholar.heroTag': 'QC CAMPUS AID HUB',
    'escholar.heroTitle': 'QC E-SCHOLAR SERVICES HUB',
    'escholar.heroSubtitle': 'Unified digital services portal for Quezon City scholars, applicants, and educational partners. Access self-service tools, check eligibility, apply for aid, and manage scholarship renewals.',
    'escholar.sec1Tag': 'Online Self-Services',
    'escholar.sec1Title': 'Available E-Scholar Services',
    'escholar.sec1Subtitle': 'Choose an interactive service module below to start your scholarship application or manage your profile.',

    // E-Guide Page
    'eguide.heroTitle': 'Scholarship E-Guide & Policy Handbook',
    'eguide.heroSubtitle': 'Official guidelines on the QCSP Grant Matrix, 10-Step New Applicant procedure, Semestral Renewal requirements, retention rules, and Scholarship Screening Committee (SSC) governance.',
    'eguide.breadcrumb': 'Scholarship E-Guide & Policy Handbook',
    'eguide.tabMatrix': 'Official Grant Matrix',
    'eguide.tabProcedures': 'Application & Renewal Procedures',
    'eguide.tabGovernance': 'SSC Committee Governance',
    'eguide.tabPolicies': 'General Policies & Retention',

    // Available Programs Page
    'prog.breadcrumb': 'QC Scholars’ Guide & Available Programs',
    'prog.heroTitle': 'QC Scholars’ Guide & Available Programs',
    'prog.heroSubtitle': 'The Quezon City Scholarship Program (QCSP) aims to provide financial assistance in the form of tuition fee grants and living stipends to deserving and underprivileged students across Senior High School, Tertiary, Postgraduate, and Vocational levels.',
    'prog.accordionTitle': 'Scholarship Categories & Track Details',
    'prog.accordionSubtitle': 'Click each category drawer to view specific sub-tracks, grant values, eligibility requirements, and documentary attachments.',

    // Footer
    'footer.rights': 'All rights reserved. Quezon City Government.',
    'footer.disclaimer': 'Official eServices platform of Quezon City Local Government Unit.',
    'footer.privacy': 'Data Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.accessibility': 'Accessibility Statement',
  },

  tl: {
    // Navigation
    'nav.home': 'TAHANAN',
    'nav.eservices': 'MGA eSERBISYO',
    'nav.charter': 'KARTA NG MAMAMAYAN',
    'nav.contact': 'MAKIPAG-UGNAYAN',
    'nav.signup': 'Mag-rehistro',
    'nav.signin': 'Mag-sign In →',
    'nav.signout': 'Mag-sign out',
    'nav.dashboard': 'Dashboard ng Iskolar',
    'nav.landing': 'EduScholar Landing',
    'nav.hub': 'Hub ng Serbisyo sa E-SCHOLAR',
    'nav.eguide': 'E-Gabay sa Patakaran ng Iskolarship',
    'nav.programs': 'Katalogo ng mga Bukas na Programa',
    'nav.portal': 'Portal ng Mag-aaral',
    'nav.primary': 'Pangunahin',
    'nav.available': 'Magagamit na mga eSerbisyo',
    'nav.tagline': 'Hub ng eServices ng QC',
    'nav.eduScholarTitle': 'Edukasyon at Iskolarship',
    'nav.eduScholarDesc': 'QC Campus Aid Hub at Tulong-Pinansyal',

    // Language Toggle
    'lang.name': 'Tagalog',
    'lang.switchPrompt': 'Switch to English',
    'lang.switchedToast': 'Inilipat ang wika ng sistema sa Tagalog (Filipino)',

    // Home Page (QCeServicesHomePage)
    'home.heroTitle': 'Maligayang Pagdating sa QC eServices',
    'home.heroSubtitle': '"Pinapalakas ang mga QCitizen sa pamamagitan ng maayos, matalino, at madaling ma-access na mga serbisyo ng lungsod."',
    'home.aboutTag': 'Tungkol sa Plataporma',
    'home.aboutTitle': 'Pinag-isang Digital Portal ng QC eServices',
    'home.aboutBody': 'Ang QC eServices ay ang pinag-isang digital na plataporma ng Pamahalaang Lungsod Quezon na binuo upang ilapit ang mga serbisyo ng pamahalaan sa mga mamamayan. Sa pamamagitan ng portal na ito, maaaring ma-access ng mga QCitizen ang iba’t ibang serbisyo ng lungsod mula sa pag-aaplay para sa mga permit at iskolarship hanggang sa pagsubaybay sa mga programang pangkalusugan at pagresponde sa kalamidad sa iisang maginhawang online hub. Ang plataporma ay idinisenyo upang pabilisin ang mga proseso, bawasan ang mga papeles, at magbigay ng real-time na mga update, na tinitiyak na ang bawat QCitizen ay may maayos at episyenteng karanasan.',
    'home.dirTag': 'Direktoryo ng Serbisyo ng Lungsod',
    'home.dirTitle': 'Tuklasin ang mga Serbisyo ng QC',
    'home.dirSubtitle': 'Pumili ng kategorya ng serbisyo ng lungsod sa ibaba upang ma-access ang mga digital na aplikasyon, permit ng munisipyo, at public assistance hubs.',
    'home.activePortal': 'Aktibong Portal →',
    'home.qcService': 'Serbisyo ng QC',
    'home.viewServices': 'Tingnan ang Aktibong Portal',

    // Service Cards
    'service.citizen.title': 'Impormasyon at Pakikipag-ugnayan ng Mamamayan',
    'service.citizen.desc': 'Mga pampublikong anunsyo, konsultasyon sa komunidad, feedback ng mamamayan at portal ng pakikipag-ugnayan sa city hall.',
    'service.permits.title': 'Pamamahala ng mga Permit at Lisensya',
    'service.permits.desc': 'Mga permit sa negosyo, occupational clearance, lisensya ng munisipyo at automated na pagproseso ng aplikasyon.',
    'service.social.title': 'Pamamahala ng mga Serbisyong Panlipunan',
    'service.social.desc': 'Tulong sa kapakanang panlipunan, suporta sa senior citizen, tulong sa solo parent at pangkagipitang tulong pinansyal.',
    'service.health.title': 'Pamamahala ng Kalusugan at Sanitasyon',
    'service.health.desc': 'Mga appointment sa health center ng lungsod, mga programang medikal, permit sa sanitasyon at digital health records.',
    'service.edu.title': 'Pamamahala ng Edukasyon at Iskolarship',
    'service.edu.desc': 'QC Campus Aid Hub: Iskolarship sa kolehiyo, pamamahagi ng tulong sa paaralan, subsidyo sa edukasyon at tulong sa mag-aaral.',
    'service.drrm.title': 'Pagbawas ng Panganib sa Sakuna at Pagtugon sa Kagipitan (DRRM)',
    'service.drrm.desc': 'QC Disaster risk reduction, emergency dispatch, weather advisories at pagsubaybay sa evacuation center.',
    'service.urban.title': 'Pagpaplano ng Lungsod, Zoning at Pabahay',
    'service.urban.desc': 'Aplikasyon sa zoning clearance, pagpaplano ng lungsod, permit sa paggamit ng lupa at rehistrasyon sa socialized housing.',
    'service.treasury.title': 'Pangongolekta ng Kita at Serbisyong Ingat-Yaman',
    'service.treasury.desc': 'Online na pagbabayad ng real property tax, municipal treasury settlement, resibo ng RPT at tax assessments.',
    'service.transport.title': 'Pamamahala ng Transportasyon at Mobilidad',
    'service.transport.desc': 'Mga ruta ng QC Bus augmentation, permit sa tricycle ng TODA, payo sa trapiko at paradahan ng lungsod.',
    'service.assets.title': 'Pamamahala ng mga Ari-arian at Pasilidad ng Bayan',
    'service.assets.desc': 'Reserbasyon sa city hall venue, mga pampublikong parke, pagpapareserba ng pasilidad sa munisipyo at pagsubaybay sa ari-arian.',

    // EduScholar Landing Page
    'landing.heroTitle': 'Programa sa Iskolarship ng Lungsod Quezon (QCSP)',
    'landing.heroSubtitle': 'Pagpapalakas sa kabataang Lungsod Quezon sa pamamagitan ng abot-kamay na tulong-pinansyal sa kolehiyo at bokasyonal na edukasyon, automated na disbursement, at pagkilala sa kahusayan.',
    'landing.step1Title': '1. Gumawa at I-verify ang Account',
    'landing.step1Desc': 'Magrehistro gamit ang iyong QC Citizen ID o credentials sa student portal.',
    'landing.step2Title': '2. Kumpletuhin ang Aplikasyon',
    'landing.step2Desc': 'Punan ang iyong akademikong profile, ilakip ang mga dokumento, at isumite ang iyong aplikasyon.',
    'landing.step3Title': '3. Subaybayan at Tanggapin ang Tulong',
    'landing.step3Desc': 'Subaybayan ang pagsusuri ng aplikasyon sa real-time at direktang tanggapin ang disbursement ng stipend.',
    'landing.drawer1': 'Paano Gumagana ang Campus Aid Hub (3-Hakbang na Digital na Proseso)',
    'landing.drawer2': 'Sino ang Maaaring Mag-apply? (Pamantayan sa Kwalipikasyon)',
    'landing.drawer3': 'Mga Kategorya ng Iskolarship sa Isang Tingin',
    'landing.eguideBannerTitle': 'Naghahanap ng Kumpletong E-Gabay sa Iskolarship?',
    'landing.eguideBannerDesc': 'Tuklasin ang kumpletong pamantayan, kinakailangang marka, petsa ng pagsusumite, at patakaran sa stipend.',
    'landing.eguideBannerBtn': 'Tingnan ang Scholar E-Guide',
    'landing.progBannerTitle': 'Tuklasin ang Lahat ng Bukas na Programang Iskolarship',
    'landing.progBannerDesc': 'Tingnan ang opisyal na katalogo ng mga bukas na track, quota ng slots, at tulong-institusyonal.',
    'landing.progBannerBtn': 'Tingnan ang Bukas na Programa',
    'landing.stayUpdated': 'Manatiling Maalam at Updated',
    'landing.stayUpdatedSubtitle': 'Mag-subscribe sa mga opisyal na anunsyo, takdang petsa, at iskedyul ng intake direkta mula sa QC Youth Development Office.',

    // E-Scholar Page
    'escholar.heroTag': 'QC CAMPUS AID HUB',
    'escholar.heroTitle': 'HUB NG MGA SERBISYO SA E-SCHOLAR NG QC',
    'escholar.heroSubtitle': 'Pinag-isang portal ng mga digital na serbisyo para sa mga iskolar, aplikante, at katuwang na institusyon ng Lungsod Quezon. Gamitin ang self-service tools, alamin ang kwalipikasyon, mag-apply para sa tulong, at pamahalaan ang renewal.',
    'escholar.sec1Tag': 'Online na mga Serbisyo',
    'escholar.sec1Title': 'Magagamit na Serbisyo ng E-Scholar',
    'escholar.sec1Subtitle': 'Pumili ng interactive service module sa ibaba upang simulan ang iyong aplikasyon o pamahalaan ang iyong profile.',

    // E-Guide Page
    'eguide.heroTitle': 'E-Gabay sa Iskolarship at Hanbuk ng Patakaran',
    'eguide.heroSubtitle': 'Opisyal na mga patakaran sa QCSP Grant Matrix, 10-Hakbang na pamamaraan para sa Bagong Aplikante, mga kinakailangan sa Semestral Renewal, patakaran sa pagpapanatili, at pamamahala ng Scholarship Screening Committee (SSC).',
    'eguide.breadcrumb': 'E-Gabay sa Iskolarship at Handbook ng Patakaran',
    'eguide.tabMatrix': 'Opisyal na Matrix ng Grant',
    'eguide.tabProcedures': 'Pamamaraan ng Aplikasyon at Renewal',
    'eguide.tabGovernance': 'Pamamahala ng Komite ng SSC',
    'eguide.tabPolicies': 'Pangkalahatang Patakaran at Pagpapanatili',

    // Available Programs Page
    'prog.breadcrumb': 'Gabay sa mga Iskolar ng QC at mga Bukas na Programa',
    'prog.heroTitle': 'Gabay sa mga Iskolar ng QC at mga Bukas na Programa',
    'prog.heroSubtitle': 'Ang Quezon City Scholarship Program (QCSP) ay naglalayong magkaloob ng tulong-pinansyal sa anyo ng tulong sa matrikula at living stipend sa mga karapat-dapat at kapus-palad na mag-aaral sa Senior High School, Kolehiyo, Postgraduate, at Vocational na antas.',
    'prog.accordionTitle': 'Mga Kategorya ng Iskolarship at Detalye ng Track',
    'prog.accordionSubtitle': 'I-click ang bawat drawer upang makita ang mga tiyak na sub-track, halaga ng grant, mga kwalipikasyon, at kinakailangang dokumento.',

    // Footer
    'footer.rights': 'Lahat ng karapatan ay nakalaan. Pamahalaang Lungsod Quezon.',
    'footer.disclaimer': 'Opisyal na platapormang eServices ng Pamahalaang Lungsod Quezon.',
    'footer.privacy': 'Patakaran sa Privacy ng Data',
    'footer.terms': 'Mga Tuntunin ng Serbisyo',
    'footer.accessibility': 'Pahayag sa Accessibility',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('edu_scholar_lang') as Language | null;
    return saved === 'tl' ? 'tl' : 'en';
  });

  useEffect(() => {
    localStorage.setItem('edu_scholar_lang', language);
    document.documentElement.lang = language === 'tl' ? 'tl-PH' : 'en';
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    toast.dismiss();
    toast.info(lang === 'tl' ? DICTIONARY.tl['lang.switchedToast'] : DICTIONARY.en['lang.switchedToast']);
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'tl' : 'en';
    setLanguage(nextLang);
  };

  const t = (key: string, defaultText?: string): string => {
    return DICTIONARY[language]?.[key] ?? DICTIONARY.en?.[key] ?? defaultText ?? key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isTagalog: language === 'tl',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
