export const INSTALLED_DEPARTMENTS = [
  'College of Computer Studies & Information Technology (CCSIT)',
  'College of Engineering & Architecture (CEA)',
  'College of Business Administration & Accountancy (CBAA)',
  'College of Education & Teacher Training (COED)',
  'College of Arts, Letters and Sciences (CAS)',
  'College of Nursing & Health Sciences (CNHS)',
  'College of Criminology & Public Safety (CCPS)',
  'College of Hospitality & Tourism Management (CHTM)',
  'College of Media, Communication & Fine Arts (CMCFA)',
  'College of Law & Public Governance (CLPG)',
] as const;

export type InstalledDepartment = typeof INSTALLED_DEPARTMENTS[number];
