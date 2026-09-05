// frontend/src/utils/courses.ts

export interface CourseCategoryGroup {
  category: string;
  courses: string[];
}

export const ACADEMIC_COURSES_BY_CATEGORY: CourseCategoryGroup[] = [
  {
    category: 'Senior High School (SHS) Strands',
    courses: [
      'STEM - Science, Technology, Engineering & Mathematics',
      'ABM - Accountancy, Business & Management',
      'HUMSS - Humanities & Social Sciences',
      'GAS - General Academic Strand',
      'TVL - Information & Communications Technology (ICT)',
      'TVL - Home Economics (HE)',
      'TVL - Industrial Arts (IA)',
      'TVL - Agri-Fishery Arts (AFA)',
      'Arts and Design Track',
      'Sports Track',
    ],
  },
  {
    category: 'Computer Studies & Information Technology',
    courses: [
      'B.S. Information Technology (BSIT)',
      'B.S. Computer Science (BSCS)',
      'B.S. Information Systems (BSIS)',
      'Associate in Computer Technology (ACT)',
      'B.S. Data Science & Analytics',
    ],
  },
  {
    category: 'Engineering & Architecture',
    courses: [
      'B.S. Civil Engineering (BSCE)',
      'B.S. Computer Engineering (BSCpE)',
      'B.S. Electrical Engineering (BSEE)',
      'B.S. Electronics Engineering (BSECE)',
      'B.S. Mechanical Engineering (BSME)',
      'B.S. Industrial Engineering (BSIE)',
      'B.S. Architecture (BSArch)',
      'B.S. Chemical Engineering (BSChE)',
    ],
  },
  {
    category: 'Business, Accountancy & Management',
    courses: [
      'B.S. Accountancy (BSA)',
      'B.S. Management Accounting (BSMA)',
      'B.S. Business Administration - Financial Management',
      'B.S. Business Administration - Marketing Management',
      'B.S. Business Administration - Human Resource Management',
      'B.S. Business Administration - Operations Management',
      'B.S. Entrepreneurship',
      'B.S. Customs Administration',
      'B.S. Real Estate Management',
    ],
  },
  {
    category: 'Education & Teacher Training',
    courses: [
      'Bachelor of Elementary Education (BEEd)',
      'Bachelor of Secondary Education - Major in English (BSEd-English)',
      'Bachelor of Secondary Education - Major in Mathematics (BSEd-Math)',
      'Bachelor of Secondary Education - Major in Science (BSEd-Science)',
      'Bachelor of Secondary Education - Major in Filipino (BSEd-Filipino)',
      'Bachelor of Secondary Education - Major in Social Studies (BSEd-Social Studies)',
      'Bachelor of Early Childhood Education (BECEd)',
      'Bachelor of Special Needs Education (BSNEd)',
      'Bachelor of Physical Education (BPEd)',
      'Bachelor of Technical-Vocational Teacher Education (BTVTEd)',
    ],
  },
  {
    category: 'Nursing, Medicine & Health Sciences',
    courses: [
      'B.S. Nursing (BSN)',
      'B.S. Pharmacy',
      'B.S. Medical Technology / Medical Laboratory Science (BSMT/BSMLS)',
      'B.S. Radiologic Technology',
      'B.S. Physical Therapy',
      'B.S. Occupational Therapy',
      'B.S. Nutrition and Dietetics',
    ],
  },
  {
    category: 'Arts, Letters, Humanities & Social Sciences',
    courses: [
      'B.A. Communication',
      'B.A. Journalism',
      'B.A. Broadcasting',
      'B.A. Political Science',
      'B.A. / B.S. Psychology',
      'B.A. Filipino / Panitikan',
      'B.A. English Language Studies',
      'B.A. Philosophy',
      'B.A. Sociology',
      'B.S. Social Work',
    ],
  },
  {
    category: 'Criminology & Public Safety',
    courses: [
      'B.S. Criminology (BSCrim)',
      'B.S. Forensic Science',
      'B.S. Industrial Security Management',
    ],
  },
  {
    category: 'Hospitality & Tourism Management',
    courses: [
      'B.S. Hospitality Management (BSHM)',
      'B.S. Tourism Management (BSTM)',
      'B.S. Culinary Arts',
    ],
  },
  {
    category: 'Natural & Applied Sciences',
    courses: [
      'B.S. Biology',
      'B.S. Applied Mathematics',
      'B.S. Chemistry',
      'B.S. Environmental Science',
    ],
  },
  {
    category: 'Postgraduate, Law & Vocational',
    courses: [
      'Bachelor of Laws (LLB) / Juris Doctor (JD)',
      'Master of Public Administration (MPA)',
      'Master in Business Administration (MBA)',
      'Master of Arts in Education (MAEd)',
      'Master of Science in Information Technology (MSIT)',
      'Vocational / Technical Skills Certificate Course',
      'Other / Course or Strand Not Listed',
    ],
  },
];

export const ALL_COURSES_FLAT: string[] = ACADEMIC_COURSES_BY_CATEGORY.flatMap(
  (group) => group.courses
);

export interface YearLevelOption {
  value: string;
  label: string;
}

export const getYearLevelsForCourse = (courseName?: string, programCategory?: string): YearLevelOption[] => {
  if (!courseName) {
    if (programCategory === 'shs') {
      return [
        { value: 'Grade 11', label: 'Grade 11 (SHS)' },
        { value: 'Grade 12', label: 'Grade 12 (SHS)' },
      ];
    }
    if (programCategory === 'vocational') {
      return [
        { value: '1st Year', label: '1st Year / Level 1 (Vocational / Tech-Voc)' },
        { value: '2nd Year', label: '2nd Year / Level 2 (Vocational / Tech-Voc)' },
      ];
    }
    // Default / All
    return [
      { value: 'Grade 11', label: 'Grade 11 (SHS)' },
      { value: 'Grade 12', label: 'Grade 12 (SHS)' },
      { value: '1st Year', label: '1st Year College' },
      { value: '2nd Year', label: '2nd Year College' },
      { value: '3rd Year', label: '3rd Year College' },
      { value: '4th Year', label: '4th Year College' },
      { value: '5th Year', label: '5th Year College' },
      { value: 'Postgraduate / Reviewee', label: 'Postgraduate / Reviewee' },
    ];
  }

  // 1. Senior High School (SHS) Strands
  const shsGroup = ACADEMIC_COURSES_BY_CATEGORY.find((g) => g.category.includes('Senior High School'));
  const isShsCourse =
    shsGroup?.courses.includes(courseName) ||
    courseName.startsWith('STEM') ||
    courseName.startsWith('ABM') ||
    courseName.startsWith('HUMSS') ||
    courseName.startsWith('GAS') ||
    courseName.startsWith('TVL') ||
    courseName.includes('Arts and Design') ||
    courseName.includes('Sports Track') ||
    courseName.includes('(SHS)');

  if (isShsCourse) {
    return [
      { value: 'Grade 11', label: 'Grade 11 (SHS)' },
      { value: 'Grade 12', label: 'Grade 12 (SHS)' },
    ];
  }

  // 2. Vocational / Technical Skills
  if (courseName.includes('Vocational') || courseName.includes('Technical Skills')) {
    return [
      { value: '1st Year', label: '1st Year / Level 1 (Vocational / Tech-Voc)' },
      { value: '2nd Year', label: '2nd Year / Level 2 (Vocational / Tech-Voc)' },
    ];
  }

  // 3. Postgraduate / Master's / Law
  const isPostgradOrLaw =
    courseName.includes('Juris Doctor') ||
    courseName.includes('Bachelor of Laws') ||
    courseName.includes('Master') ||
    courseName.includes('Postgraduate');

  if (isPostgradOrLaw) {
    return [
      { value: '1st Year', label: '1st Year Postgrad / Law' },
      { value: '2nd Year', label: '2nd Year Postgrad / Law' },
      { value: '3rd Year', label: '3rd Year Postgrad / Law' },
      { value: '4th Year', label: '4th Year Postgrad / Law' },
      { value: 'Postgraduate / Reviewee', label: 'Postgraduate / Reviewee' },
    ];
  }

  // 4. Undergraduate College Degree Courses (e.g. BSIT, BSCS, Engineering, Business, Nursing, etc.)
  return [
    { value: '1st Year', label: '1st Year College' },
    { value: '2nd Year', label: '2nd Year College' },
    { value: '3rd Year', label: '3rd Year College' },
    { value: '4th Year', label: '4th Year College' },
    { value: '5th Year', label: '5th Year College' },
  ];
};
