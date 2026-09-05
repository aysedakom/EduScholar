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
