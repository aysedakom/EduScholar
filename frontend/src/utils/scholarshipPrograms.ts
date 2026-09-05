// frontend/src/utils/scholarshipPrograms.ts

export interface ProgramDocumentSpec {
  id: string;
  label: string;
  description: string;
  isRequired: boolean;
  accept?: string;
  category: 'academic' | 'identity' | 'financial' | 'endorsement' | 'portfolio' | 'employment';
}

export interface ScholarshipProgramSpec {
  id: string;
  categoryId: 'shs' | 'tertiary' | 'postgrad' | 'continuing-vocational' | 'creative-writing';
  categoryTitle: string;
  title: string;
  shortTitle: string;
  level: string;
  badge: string;
  summary: string;
  tuitionGrant: string;
  stipend: string;
  totalMax: string;
  termGrantAmount: number; // Official single-term / semester grant value
  tuitionPerTerm: number;
  stipendPerTerm: number;
  minGwaText: string;
  minGwaNumber?: number; // for validation
  qualifications: string[];
  requiredDocuments: ProgramDocumentSpec[];
}

export const ALL_SCHOLARSHIP_PROGRAMS: ScholarshipProgramSpec[] = [
  // ===================== SENIOR HIGH SCHOOL (SHS) =====================
  {
    id: 'shs-academic',
    categoryId: 'shs',
    categoryTitle: 'Scholarship for Senior High School Students',
    title: 'Academic Scholarship (Senior High School)',
    shortTitle: 'SHS Academic',
    level: 'Grades 11 & 12',
    badge: 'SHS Level',
    summary: 'Financial support for junior high school graduates who finished with honors or high academic distinction.',
    tuitionGrant: 'PHP 10,000 / semester (PHP 20,000 / school year)',
    stipend: 'PHP 5,000 / semester (PHP 10,000 / school year)',
    totalMax: 'PHP 15,000 / semester (PHP 30,000 / school year)',
    termGrantAmount: 15000,
    tuitionPerTerm: 10000,
    stipendPerTerm: 5000,
    minGwaText: '89% GWA (Rank 1-10 or Top 10 Overall)',
    minGwaNumber: 89,
    qualifications: [
      'Must graduate from junior high school with Academic Honors (Rank 1-10) or with top 10 highest overall GWA.',
      'Must have a General Weighted Average (GWA) of at least 89% or its equivalent.',
      'Bona fide Quezon City resident with valid QCitizen ID.',
      'Enrolled in a recognized private or public Senior High School.',
    ],
    requiredDocuments: [
      {
        id: 'proof_honors',
        label: '1. Proof of Academic Honors / Top 10 Ranking *',
        description: 'Official school certificate proving graduation with Academic Honors (Rank 1-10) or within top 10 highest GWA.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'academic',
      },
      {
        id: 'report_card_shs',
        label: '2. Form 137 / 138 (Junior High School Report Card) *',
        description: 'Certified true copy of Form 137 or 138 showing an overall General Weighted Average (GWA) >= 89%.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'academic',
      },
      {
        id: 'cor_shs',
        label: '3. Senior High School Certificate of Enrollment (COR / Registration) *',
        description: 'Official proof of registration or Certificate of Enrollment in Grade 11 or 12 for the current school year.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'academic',
      },
      {
        id: 'residency_qc',
        label: '4. Proof of QC Residency (Barangay Clearance / QCitizen ID) *',
        description: 'Valid QCitizen ID card or Barangay Certificate of Residency in Quezon City.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'identity',
      },
    ],
  },
  {
    id: 'shs-specialized',
    categoryId: 'shs',
    categoryTitle: 'Scholarship for Senior High School Students',
    title: 'Specialized Track Scholarship (Senior High School)',
    shortTitle: 'SHS Specialized Track',
    level: 'Grades 11 & 12',
    badge: 'SHS Level',
    summary: 'Assistance for students enrolled at specialized public high schools outside their home district.',
    tuitionGrant: 'PHP 10,000 / semester (PHP 20,000 / school year)',
    stipend: 'PHP 5,000 / semester (PHP 10,000 / school year)',
    totalMax: 'PHP 15,000 / semester (PHP 30,000 / school year)',
    termGrantAmount: 15000,
    tuitionPerTerm: 10000,
    stipendPerTerm: 5000,
    minGwaText: '89% GWA (Specialized Public SHS Track)',
    minGwaNumber: 89,
    qualifications: [
      'Must be enrolled at a Specialized Public Senior High School located outside of his/her district of residence.',
      'Must have a General Weighted Average (GWA) of at least 89% or its equivalent.',
      'QC resident with active enrollment credentials.',
    ],
    requiredDocuments: [
      {
        id: 'specialized_enrollment_cert',
        label: '1. Specialized Public SHS Enrollment Certification *',
        description: 'Official Certificate of Enrollment from the specialized public Senior High School indicating campus location.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'academic',
      },
      {
        id: 'specialized_report_card',
        label: '2. Official Report Card with GWA >= 89% *',
        description: 'Form 137 / 138 with certified GWA of at least 89% or equivalent.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'academic',
      },
      {
        id: 'residency_qc',
        label: '3. Proof of QC Residency (Barangay Clearance / QCitizen ID) *',
        description: 'Valid QCitizen ID card or Barangay Certificate of Residency.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'identity',
      },
    ],
  },
  {
    id: 'shs-athletic',
    categoryId: 'shs',
    categoryTitle: 'Scholarship for Senior High School Students',
    title: 'Athletic and Arts Scholarship (Senior High School)',
    shortTitle: 'SHS Athletic & Arts',
    level: 'Grades 11 & 12',
    badge: 'SHS Level',
    summary: 'Grants recognizing outstanding student athletes and creative artists competing or performing for the city/school.',
    tuitionGrant: 'PHP 10,000 / semester (PHP 20,000 / school year)',
    stipend: 'PHP 5,000 / semester (PHP 10,000 / school year)',
    totalMax: 'PHP 15,000 / semester (PHP 30,000 / school year)',
    termGrantAmount: 15000,
    tuitionPerTerm: 10000,
    stipendPerTerm: 5000,
    minGwaText: '85% GWA (Athletic/Arts Varsity or Awardee)',
    minGwaNumber: 85,
    qualifications: [
      'Must be a recent recipient of a major award for sports or arts, or a current member of a sports/arts program recognized by the city.',
      'Must have a General Weighted Average (GWA) of at least 85% or its equivalent.',
      'Bona fide Quezon City resident enrolled in Senior High School.',
    ],
    requiredDocuments: [
      {
        id: 'sports_arts_proof',
        label: '1. Proof of Major Sports / Arts Award or Varsity Membership *',
        description: 'Certificate of award/recognition in recognized tournaments or official certificate of varsity/arts troupe membership.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'portfolio',
      },
      {
        id: 'report_card_athletic',
        label: '2. Official Report Card (GWA >= 85%) *',
        description: 'Form 137 / 138 showing GWA of at least 85% with no failing marks.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'academic',
      },
      {
        id: 'coach_endorsement',
        label: '3. Endorsement Letter from Sports/Arts Trainer or Principal *',
        description: 'Formal recommendation signed by the varsity coach, arts director, or school principal.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'endorsement',
      },
      {
        id: 'residency_qc',
        label: '4. Proof of QC Residency (Barangay Clearance / QCitizen ID) *',
        description: 'Valid QCitizen ID card or Barangay Certificate of Residency in Quezon City.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'identity',
      },
    ],
  },
  {
    id: 'shs-youth-leaders',
    categoryId: 'shs',
    categoryTitle: 'Scholarship for Senior High School Students',
    title: 'Youth Leaders Scholarship (Senior High School)',
    shortTitle: 'SHS Youth Leaders',
    level: 'Grades 11 & 12',
    badge: 'SHS Level',
    summary: 'Recognizing student leaders serving in SK, SSG, or accredited youth civic organizations in Quezon City.',
    tuitionGrant: 'PHP 10,000 / semester (PHP 20,000 / school year)',
    stipend: 'PHP 5,000 / semester (PHP 10,000 / school year)',
    totalMax: 'PHP 15,000 / semester (PHP 30,000 / school year)',
    termGrantAmount: 15000,
    tuitionPerTerm: 10000,
    stipendPerTerm: 5000,
    minGwaText: '85% GWA (SK / SSG / Youth Org Leader)',
    minGwaNumber: 85,
    qualifications: [
      'Must be a recent recipient of a recognized leadership award or currently serve as an official of Sangguniang Kabataan (SK), Supreme Student Government (SSG), or QC-registered Youth Organizations.',
      'Must have a General Weighted Average (GWA) of at least 85% or its equivalent.',
      'Bona fide Quezon City resident.',
    ],
    requiredDocuments: [
      {
        id: 'leadership_cert',
        label: '1. Certificate of Incumbency / Oath of Office / Leadership Award *',
        description: 'Official proof of holding office in SK, SSG/Student Council, or QC Youth Organization.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'portfolio',
      },
      {
        id: 'report_card_leader',
        label: '2. Official Report Card (GWA >= 85%) *',
        description: 'Form 137 / 138 with certified GWA >= 85%.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'academic',
      },
      {
        id: 'barangay_youth_cert',
        label: '3. Barangay / QC Youth Development Office (QCYDO) Endorsement *',
        description: 'Certification from Barangay Chairman or QCYDO affirming civic engagement and youth service.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'endorsement',
      },
      {
        id: 'residency_qc',
        label: '4. Proof of QC Residency (Barangay Clearance / QCitizen ID) *',
        description: 'Valid QCitizen ID card or Barangay Certificate of Residency in Quezon City.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'identity',
      },
    ],
  },

  // ===================== TERTIARY (COLLEGE) =====================
  {
    id: 'tertiary-excel',
    categoryId: 'tertiary',
    categoryTitle: 'Scholarship for Tertiary (College) Students',
    title: 'QC Excel Scholarship (Tertiary / College)',
    shortTitle: 'QC Excel Grant',
    level: 'Undergraduate Degrees',
    badge: 'Flagship Tertiary',
    summary: 'The premiere QC scholarship for high-achieving freshmen in priority sectors: STEM, Data Science, Urban Planning, and Allied Health.',
    tuitionGrant: 'PHP 55,000 / semester (PHP 110,000 / school year)',
    stipend: 'PHP 25,000 / semester (PHP 50,000 / school year)',
    totalMax: 'PHP 80,000 / semester (PHP 160,000 / school year)',
    termGrantAmount: 80000,
    tuitionPerTerm: 55000,
    stipendPerTerm: 25000,
    minGwaText: '1.75 GWA (or 90% in SHS)',
    minGwaNumber: 1.75,
    qualifications: [
      'Must be an incoming freshman / 1st year tertiary student at time of application.',
      'Enrolled or accepted in priority courses/specializations identified by QC Government (STEM, Data Science, Urban Planning, Allied Health).',
      'Must pass interviews and aptitude / psychological tests administered by QC Government.',
      'Must show proof of leadership / volunteer work / socio-civic engagements.',
      'Must maintain a General Weighted Average (GWA) of at least 1.75 (or 90%).',
    ],
    requiredDocuments: [
      {
        id: 'excel_priority_cor',
        label: '1. Certificate of Enrollment in an Approved Priority Course *',
        description: 'COR or Certificate of Admission in STEM, Data Science, Urban Planning, or Allied Health program.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'academic',
      },
      {
        id: 'excel_shs_grades',
        label: '2. Senior High School Report Card / Official Transcript (GWA >= 1.75 / 90%) *',
        description: 'Official SHS Grade 12 Transcript or Form 137 showing GWA equivalent of at least 90% (1.75).',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'academic',
      },
      {
        id: 'excel_endorsement_letters',
        label: '3. Two (2) Written Recommendation / Endorsement Letters *',
        description: 'Endorsement letters from academic mentors, school deans, or community leaders attesting to character.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'endorsement',
      },
      {
        id: 'excel_leadership_portfolio',
        label: '4. Proof of Leadership / Socio-Civic Volunteer Engagements *',
        description: 'Certificates of volunteerism, leadership position held, or community project documentation.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'portfolio',
      },
      {
        id: 'residency_qc',
        label: '5. Proof of QC Residency (QCitizen ID / Barangay Clearance) *',
        description: 'Valid QCitizen ID card or Barangay Certificate of Residency in Quezon City.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'identity',
      },
    ],
  },
  {
    id: 'tertiary-academic',
    categoryId: 'tertiary',
    categoryTitle: 'Scholarship for Tertiary (College) Students',
    title: 'Academic Scholarship (Tertiary / College)',
    shortTitle: 'Tertiary Academic',
    level: 'Undergraduate Degrees',
    badge: 'Undergraduate',
    summary: 'Merit-based tuition assistance and living stipend for college students with outstanding academic records.',
    tuitionGrant: 'PHP 40,000 / semester (PHP 80,000 / school year)',
    stipend: 'PHP 12,500 / semester (PHP 25,000 / school year)',
    totalMax: 'PHP 52,500 / semester (PHP 105,000 / school year)',
    termGrantAmount: 52500,
    tuitionPerTerm: 40000,
    stipendPerTerm: 12500,
    minGwaText: '1.75 GWA (Rank 1-10 or Top 10 Honors)',
    minGwaNumber: 1.75,
    qualifications: [
      'Must graduate from senior high school with Academic Honors (Rank 1-10) or top 10 highest overall GWA.',
      'Must have a General Weighted Average (GWA) of at least 1.75 or its equivalent.',
      'Enrolled in an accredited tertiary institution in Metro Manila.',
      'Bona fide Quezon City resident.',
    ],
    requiredDocuments: [
      {
        id: 'tertiary_honors_cert',
        label: '1. Certification of Graduating with Academic Honors (Rank 1-10) *',
        description: 'Official school certification indicating Rank 1-10 or Top 10 GWA in Senior High School.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'academic',
      },
      {
        id: 'tertiary_transcript',
        label: '2. Certified True Copy of Grades / Transcript (GWA >= 1.75) *',
        description: 'Official Transcript of Records (TOR) or semestral grade sheet with GWA of at least 1.75.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'academic',
      },
      {
        id: 'tertiary_cor',
        label: '3. College Certificate of Registration (COR / COE) *',
        description: 'Official Certificate of Registration for the current academic semester with course and units.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'academic',
      },
      {
        id: 'residency_qc',
        label: '4. Proof of QC Residency (QCitizen ID / Barangay Clearance) *',
        description: 'Valid QCitizen ID card or Barangay Certificate of Residency.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'identity',
      },
    ],
  },
  {
    id: 'tertiary-athletic',
    categoryId: 'tertiary',
    categoryTitle: 'Scholarship for Tertiary (College) Students',
    title: 'Athletic and Arts Scholarship (Tertiary / College)',
    shortTitle: 'Tertiary Athletic & Arts',
    level: 'Undergraduate Degrees',
    badge: 'Undergraduate',
    summary: 'Financial grant for university student-athletes and performing artists with active competition or performance portfolios.',
    tuitionGrant: 'PHP 27,500 / semester (PHP 55,000 / school year)',
    stipend: 'PHP 12,500 / semester (PHP 25,000 / school year)',
    totalMax: 'PHP 40,000 / semester (PHP 80,000 / school year)',
    termGrantAmount: 40000,
    tuitionPerTerm: 27500,
    stipendPerTerm: 12500,
    minGwaText: '2.50 GWA (Active Varsity / Troupe Member)',
    minGwaNumber: 2.50,
    qualifications: [
      'Must be a recent recipient of a major individual award for sports or arts, or a current member of a recognized varsity or arts team.',
      'Must have a General Weighted Average (GWA) of at least 2.5 or its equivalent (no failing marks).',
      'Enrolled in an accredited university or college.',
    ],
    requiredDocuments: [
      {
        id: 'tertiary_varsity_proof',
        label: '1. Certificate of Active Varsity / Arts Membership or Major Award *',
        description: 'Official university certification from the Athletics/Culture Department or competition award certificates.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'portfolio',
      },
      {
        id: 'tertiary_athletic_grades',
        label: '2. Official Transcript of Records / Semestral Grades (GWA >= 2.5) *',
        description: 'Certified True Copy of Grades demonstrating passing status with GWA of 2.5 or better.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'academic',
      },
      {
        id: 'tertiary_cor',
        label: '3. Certificate of Registration (COR) *',
        description: 'Current semester Certificate of Registration.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'academic',
      },
      {
        id: 'residency_qc',
        label: '4. Proof of QC Residency (QCitizen ID / Barangay Clearance) *',
        description: 'Valid QCitizen ID card or Barangay Certificate of Residency in Quezon City.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'identity',
      },
    ],
  },
  {
    id: 'tertiary-youth-leaders',
    categoryId: 'tertiary',
    categoryTitle: 'Scholarship for Tertiary (College) Students',
    title: 'Youth Leaders Scholarship (Tertiary / College)',
    shortTitle: 'Tertiary Youth Leaders',
    level: 'Undergraduate Degrees',
    badge: 'Undergraduate',
    summary: 'Tuition and living stipend for college students serving in leadership positions across QC student councils, SK, and youth organizations.',
    tuitionGrant: 'PHP 27,500 / semester (PHP 55,000 / school year)',
    stipend: 'PHP 12,500 / semester (PHP 25,000 / school year)',
    totalMax: 'PHP 40,000 / semester (PHP 80,000 / school year)',
    termGrantAmount: 40000,
    tuitionPerTerm: 27500,
    stipendPerTerm: 12500,
    minGwaText: '2.50 GWA (Student Council / SK / Org Leader)',
    minGwaNumber: 2.50,
    qualifications: [
      'Must be a recent recipient of a city leadership award or current official of Sangguniang Kabataan (SK), University Student Council (USC/SSG), or QC-registered youth organization.',
      'Must maintain a General Weighted Average (GWA) of at least 2.5 or its equivalent.',
      'Enrolled in an accredited tertiary institution.',
    ],
    requiredDocuments: [
      {
        id: 'tertiary_incumbency_cert',
        label: '1. Certificate of Incumbency / Appointment (SK / USC / Youth Org) *',
        description: 'Official Certificate of Election or Incumbency signed by DILG/SK or University Student Affairs.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'portfolio',
      },
      {
        id: 'tertiary_leader_grades',
        label: '2. Transcript of Records with GWA >= 2.5 *',
        description: 'Certified True Copy of Grades showing GWA >= 2.5 with no failing marks.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'academic',
      },
      {
        id: 'leadership_portfolio_tertiary',
        label: '3. Socio-Civic Leadership Portfolio & Project Summary *',
        description: 'Summary of community projects, youth initiatives, or resolutions led by the applicant.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'portfolio',
      },
      {
        id: 'tertiary_cor',
        label: '4. Certificate of Registration (COR) *',
        description: 'Current semester Certificate of Registration.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'academic',
      },
      {
        id: 'residency_qc',
        label: '5. Proof of QC Residency (QCitizen ID / Barangay Clearance) *',
        description: 'Valid QCitizen ID card or Barangay Certificate of Residency in Quezon City.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'identity',
      },
    ],
  },
  {
    id: 'tertiary-economic',
    categoryId: 'tertiary',
    categoryTitle: 'Scholarship for Tertiary (College) Students',
    title: 'Economic Scholarship (Need-Based Financial Assistance)',
    shortTitle: 'Need-Based Economic Aid',
    level: 'Undergraduate Degrees',
    badge: 'Undergraduate',
    summary: 'Dedicated financial aid for students from low-income households, displaced families, solo parents, PWDs, ALS graduates, and transport workers.',
    tuitionGrant: 'PHP 5,000 / semester (PHP 10,000 / school year)',
    stipend: 'PHP 5,000 / semester (PHP 10,000 / school year)',
    totalMax: 'PHP 10,000 / semester (PHP 20,000 / school year)',
    termGrantAmount: 10000,
    tuitionPerTerm: 5000,
    stipendPerTerm: 5000,
    minGwaText: '3.00 GWA / 75% (Passing Grade)',
    minGwaNumber: 3.00,
    qualifications: [
      'Must belong to a household within low-middle income to poverty threshold levels, OR belong to vulnerable sectors: displaced families in QC, PWDs, Kasambahays/household helpers, ALS graduates, solo parents, children of incarcerated parents, children of tricycle drivers/operators.',
      'Must maintain a passing General Weighted Average (GWA >= 3.0 / 75%).',
      'Enrolled in an accredited college or university.',
    ],
    requiredDocuments: [
      {
        id: 'indigency_cert',
        label: '1. Certificate of Indigency from Barangay or QC SSDD *',
        description: 'Official Certificate of Indigency issued by the Barangay or Social Services Development Department.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'financial',
      },
      {
        id: 'sectoral_proof',
        label: '2. Sectoral Verification Proof (Solo Parent, PWD, Kasambahay, ALS, TODA) *',
        description: 'Solo Parent ID, PWD ID, SSS Kasambahay registration, ALS Equivalency Certificate, or Driver/Operator franchise certification.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'financial',
      },
      {
        id: 'itr_affidavit',
        label: '3. Latest Income Tax Return (ITR), BIR Exemption, or Affidavit of Low Income *',
        description: 'Proof of family income or notarized Affidavit of Low/No Income.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'financial',
      },
      {
        id: 'tertiary_cor_grades',
        label: '4. Latest Certificate of Registration (COR) and Passing Grades *',
        description: 'COR for current term and report card / grade sheet (GWA >= 3.0 / 75%).',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'academic',
      },
      {
        id: 'residency_qc',
        label: '5. Proof of QC Residency (QCitizen ID / Barangay Clearance) *',
        description: 'Valid QCitizen ID card or Barangay Certificate of Residency.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'identity',
      },
    ],
  },
  {
    id: 'tertiary-filipino',
    categoryId: 'tertiary',
    categoryTitle: 'Scholarship for Tertiary (College) Students',
    title: 'Manuel L. Quezon Filipino Language & Literature Scholarship',
    shortTitle: 'MLQ Panitikan Grant',
    level: 'Undergraduate Degrees',
    badge: 'Undergraduate',
    summary: 'Specialized grant for incoming freshmen pursuing degrees in Filipino Language, Philippine Literature, or Panitikan.',
    tuitionGrant: 'PHP 40,000 / semester (PHP 80,000 / school year)',
    stipend: 'PHP 12,500 / semester (PHP 25,000 / school year)',
    totalMax: 'PHP 52,500 / semester (PHP 105,000 / school year)',
    termGrantAmount: 52500,
    tuitionPerTerm: 40000,
    stipendPerTerm: 12500,
    minGwaText: '1.75 GWA (Filipino / Panitikan Major)',
    minGwaNumber: 1.75,
    qualifications: [
      'Incoming freshman / first-year college student enrolled in a degree related to Filipino Language, Literature, or Panitikan.',
      'Must pass interview/aptitude assessment (may be waived upon proof of published literary work, campus journal, or national awards).',
      'Must maintain a GWA of at least 1.75 or equivalent.',
    ],
    requiredDocuments: [
      {
        id: 'filipino_portfolio',
        label: '1. Writing Portfolio in Filipino (Published Works, Poems, Essays) *',
        description: 'Collection of original creative writing or campus journal articles written in the Filipino language.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'portfolio',
      },
      {
        id: 'literary_certificates',
        label: '2. Certificates from Literary Workshops or National Awards',
        description: 'Certificates of participation in writing fellowships, journalism contests, or literary awards (if available).',
        isRequired: false,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'portfolio',
      },
      {
        id: 'filipino_grades',
        label: '3. Transcript of Records / High School Report Card (GWA >= 1.75) *',
        description: 'Certified true copy of grades showing an average of at least 1.75 / 90%.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'academic',
      },
      {
        id: 'tertiary_cor',
        label: '4. Certificate of Registration (COR in Filipino Major) *',
        description: 'College COR proving enrollment in AB/BSEd Filipino, Panitikan, or Literature program.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'academic',
      },
      {
        id: 'residency_qc',
        label: '5. Proof of QC Residency (QCitizen ID / Barangay Clearance) *',
        description: 'Valid QCitizen ID card or Barangay Certificate of Residency in Quezon City.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'identity',
      },
    ],
  },

  // ===================== POSTGRADUATE =====================
  {
    id: 'postgrad-thesis',
    categoryId: 'postgrad',
    categoryTitle: 'Scholarship for Postgraduate Students',
    title: 'Postgraduate Educational & Thesis Grant',
    shortTitle: 'Postgraduate & Thesis',
    level: 'Master’s / Doctorate Degrees',
    badge: 'Postgraduate / LGU Staff',
    summary: 'Continuing higher education grants for Quezon City Government personnel and partner civil servants pursuing masteral or doctoral degrees.',
    tuitionGrant: 'PHP 27,500 / semester (PHP 55,000 / school year)',
    stipend: 'PHP 25,000 / semester (PHP 50,000 / school year)',
    totalMax: 'PHP 52,500 / semester (PHP 105,000 / school year)',
    termGrantAmount: 52500,
    tuitionPerTerm: 27500,
    stipendPerTerm: 25000,
    minGwaText: '2.50 GWA (Postgraduate Equivalent)',
    minGwaNumber: 2.50,
    qualifications: [
      'Must be employed within the Quezon City Government or with offices/units working with QC Government for at least 1 year.',
      'Must maintain a General Weighted Average (GWA) of at least 2.5 or its postgraduate equivalent.',
      'Enrolled in an accredited master’s or doctoral degree program in Metro Manila.',
    ],
    requiredDocuments: [
      {
        id: 'postgrad_employment_proof',
        label: '1. Proof of QC LGU Employment & Salary Grade Certification *',
        description: 'Official Certificate of Employment indicating tenure (>= 1 yr), salary grade, and appointment status.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'employment',
      },
      {
        id: 'postgrad_dept_endorsement',
        label: '2. Official Recommendation Letter from Department / Office Head *',
        description: 'Formal recommendation from Department Head stating that degree aligns with city development priorities.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'endorsement',
      },
      {
        id: 'postgrad_study_alignment',
        label: '3. Duties & Study Alignment Statement / Thesis Outline *',
        description: 'Document outlining duties, responsibilities, and proposed masteral/doctoral thesis topic.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'portfolio',
      },
      {
        id: 'postgrad_cor',
        label: '4. Certificate of Enrollment / Registration in Postgraduate School *',
        description: 'Official postgraduate registration in an accredited university in Metro Manila.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'academic',
      },
      {
        id: 'residency_qc',
        label: '5. Government ID / Proof of QC Residency *',
        description: 'Valid QCitizen ID or Government-issued ID card.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'identity',
      },
    ],
  },

  // ===================== CONTINUING EDUCATION & VOCATIONAL =====================
  {
    id: 'continuing-vocational',
    categoryId: 'continuing-vocational',
    categoryTitle: 'Scholarship for Continuing Education & Vocational Courses',
    title: 'Continuing Education & Vocational Training Grant',
    shortTitle: 'Vocational & Licensure',
    level: 'Short Courses & Review Aid',
    badge: 'Tech-Voc & Board Review',
    summary: 'Targeted financial assistance for QC students in technical-vocational courses (TESDA) or board/bar exam review programs.',
    tuitionGrant: '— (Direct Aid)',
    stipend: 'PHP 10,000',
    totalMax: 'PHP 10,000 stipend',
    termGrantAmount: 10000,
    tuitionPerTerm: 0,
    stipendPerTerm: 10000,
    minGwaText: 'Active Enrollment in Accredited Center',
    qualifications: [
      'Must be enrolled in short courses, technical-vocational training, or licensure/board/bar exam review courses.',
      'Training institution or review center must be accredited and recognized by the city.',
      'QC resident with active enrollment status.',
    ],
    requiredDocuments: [
      {
        id: 'voc_curriculum',
        label: '1. Training Course Curriculum / Review Outline *',
        description: 'Official course curriculum outline from the accredited TESDA or board review center.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'academic',
      },
      {
        id: 'voc_enrollment_cert',
        label: '2. Certification of Enrollment from Training Center / Academy *',
        description: 'Official proof of registration/enrollment in the vocational module or review program.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'academic',
      },
      {
        id: 'residency_qc',
        label: '3. QCitizen ID / Barangay Proof of Residence *',
        description: 'Valid QCitizen ID card or Barangay Certificate of Residency in Quezon City.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'identity',
      },
      {
        id: 'voc_video_doc',
        label: '4. 2-Minute Application Video Explaining Career Goals *',
        description: 'Brief 2-minute video sharing your study goals, skills development track, and civic commitment.',
        isRequired: true,
        accept: 'video/mp4,video/webm,.mp4,.webm',
        category: 'portfolio',
      },
    ],
  },

  // ===================== FILIPINO LANGUAGE & CREATIVE WRITING =====================
  {
    id: 'creative-writing',
    categoryId: 'creative-writing',
    categoryTitle: 'Scholarship for Filipino Language & Creative Writing Practitioners',
    title: 'Creative Writing & Literary Practitioner Grant',
    shortTitle: 'Creative Writing Grant',
    level: 'Specialized Cultural Grant',
    badge: 'Literary & Arts',
    summary: 'Stipends and publication subsidies for students, educators, and creative writers advancing Philippine literature in Filipino.',
    tuitionGrant: '— (Direct Grant)',
    stipend: '₱10,000 + ₱30,000 (Pub. Aid)',
    totalMax: 'Up to PHP 40,000',
    termGrantAmount: 40000,
    tuitionPerTerm: 0,
    stipendPerTerm: 40000,
    minGwaText: 'Published Work / Recognized Manuscript',
    qualifications: [
      'Must be a student, educator, or practitioner of Filipino language, literature, or creative writing.',
      'Must show proof of acceptance or certification of publication from a recognized publisher or literary institution.',
      'Must demonstrate active involvement and portfolio in Filipino literary works (poetry, fiction, essay, drama).',
    ],
    requiredDocuments: [
      {
        id: 'creative_portfolio',
        label: '1. Writing Portfolio in Filipino (Original Literary Works) *',
        description: 'Anthology of published articles, school journals, short stories, poems, or dramatic pieces in Filipino.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'portfolio',
      },
      {
        id: 'writing_plan_manuscript',
        label: '2. Writing Plan and Book Manuscript to be Published *',
        description: 'Detailed writing timeline, book abstract, and complete/draft manuscript to be published.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'portfolio',
      },
      {
        id: 'publisher_cert',
        label: '3. Publisher Certification (NBDB / KWF Recognized Publisher) *',
        description: 'Contract or formal certification of publication from a book publisher registered with NBDB or KWF.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'portfolio',
      },
      {
        id: 'publisher_details_doc',
        label: '4. Publication Metadata Sheet (Title, Date, ISBN/ISSN) *',
        description: 'Official sheet detailing book title, expected release date, and assigned ISBN/ISSN.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'portfolio',
      },
      {
        id: 'residency_qc',
        label: '5. QCitizen ID / Government Proof of Identity *',
        description: 'Valid QCitizen ID card or government-issued ID proof.',
        isRequired: true,
        accept: '.pdf,.jpg,.jpeg,.png',
        category: 'identity',
      },
    ],
  },
];

export const SCHOLARSHIP_PROGRAMS_MAP: Record<string, ScholarshipProgramSpec> = ALL_SCHOLARSHIP_PROGRAMS.reduce(
  (acc, prog) => {
    acc[prog.id] = prog;
    return acc;
  },
  {} as Record<string, ScholarshipProgramSpec>
);

export function getProgramById(id?: string | null): ScholarshipProgramSpec {
  if (!id) return ALL_SCHOLARSHIP_PROGRAMS[0];
  return SCHOLARSHIP_PROGRAMS_MAP[id] || ALL_SCHOLARSHIP_PROGRAMS.find(p => p.categoryId === id) || ALL_SCHOLARSHIP_PROGRAMS[0];
}

/**
 * Returns the official single-term (per semester) grant package for any program ID or title.
 */
export function getProgramTermGrant(programIdOrTitle?: string | null): number {
  if (!programIdOrTitle) return 10000;
  const p = programIdOrTitle.toLowerCase().trim();

  // 1. Direct ID lookup in map
  const byId = SCHOLARSHIP_PROGRAMS_MAP[programIdOrTitle];
  if (byId && typeof byId.termGrantAmount === 'number') {
    return byId.termGrantAmount;
  }

  // 2. Search by title / shortTitle in list
  const found = ALL_SCHOLARSHIP_PROGRAMS.find(
    (item) =>
      item.id.toLowerCase() === p ||
      item.title.toLowerCase() === p ||
      item.shortTitle.toLowerCase() === p ||
      p.includes(item.id.toLowerCase()) ||
      item.title.toLowerCase().includes(p)
  );
  if (found && typeof found.termGrantAmount === 'number') {
    return found.termGrantAmount;
  }

  // 3. Track keyword matching
  if (p.includes('economic') || p.includes('need-based')) return 10000;
  if (p.includes('excel')) return 80000;
  if (p.includes('academic') && (p.includes('tertiary') || p.includes('college'))) return 52500;
  if (p.includes('filipino') || p.includes('panitikan')) return 52500;
  if (p.includes('postgrad') || p.includes('thesis')) return 52500;
  if (p.includes('athletic') && (p.includes('tertiary') || p.includes('college'))) return 40000;
  if (p.includes('youth') && (p.includes('tertiary') || p.includes('college'))) return 40000;
  if (p.includes('creative') || p.includes('writing') || p.includes('literary')) return 40000;
  if (p.includes('vocational') || p.includes('continuing') || p.includes('tesda')) return 10000;
  if (p.includes('shs') || p.includes('senior high')) return 15000;

  return 10000;
}

export function getActiveStudentApplication(): any | null {
  try {
    const userRaw = localStorage.getItem('user_profile');
    if (!userRaw) return null;
    const currentUser = JSON.parse(userRaw);
    if (!currentUser || !currentUser.email) return null;

    const userKey = `active_app_${currentUser.email.toLowerCase()}`;
    const userAppRaw = localStorage.getItem(userKey);
    if (userAppRaw) {
      const app = JSON.parse(userAppRaw);
      if (app && app.status !== 'rejected' && app.status !== 'cancelled') {
        return app;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function saveActiveStudentApplication(applicationData: any) {
  try {
    const userRaw = localStorage.getItem('user_profile');
    const currentUser = userRaw ? JSON.parse(userRaw) : null;
    const userKey = currentUser?.email ? `active_app_${currentUser.email.toLowerCase()}` : 'active_scholarship_application';
    localStorage.setItem(userKey, JSON.stringify(applicationData));
  } catch (err) {
    console.error('Failed to save active application:', err);
  }
}

export function clearActiveStudentApplication(email?: string) {
  try {
    let targetEmail = email;
    if (!targetEmail) {
      const userRaw = localStorage.getItem('user_profile');
      if (userRaw) {
        try {
          const currentUser = JSON.parse(userRaw);
          targetEmail = currentUser?.email;
        } catch (_) {}
      }
    }
    if (targetEmail) {
      localStorage.removeItem(`active_app_${targetEmail.toLowerCase()}`);
    }
    localStorage.removeItem('active_scholarship_application');
    localStorage.removeItem('qc_active_student_application');
    localStorage.removeItem('student_submitted_application');
    localStorage.removeItem('qc_scholarship_status_overrides');
  } catch (err) {
    console.error('Failed to clear active application:', err);
  }
}
