// backend/services/aiMatchingService.js

/**
 * AI Matching Algorithm - Matches student applications to active scholarship programs
 */
const matchStudentToScholarships = async (studentData, programs = []) => {
  const defaultPrograms = [
    {
      id: 'sch-qc-01',
      name: 'Quezon City Tertiary Education Subsidy',
      code: 'QCTES-2026',
      category: 'Economic',
      eligibility_criteria: {
        gwa: 2.5,
        income: 250000,
        residency: true,
        city: 'Quezon City',
        yearLevel: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
        isPWD: false,
        isSoloParent: false,
        is4Ps: true,
      },
    },
    {
      id: 'sch-qc-02',
      name: 'QC Tech Giants STEM Excellence Grant',
      code: 'STEM-EXC-2026',
      category: 'Merit',
      eligibility_criteria: {
        gwa: 1.75,
        income: 350000,
        courses: ['BS Information Technology', 'BS Computer Science', 'BS Software Engineering', 'BS Industrial Engineering'],
        residency: true,
        city: 'Quezon City',
        yearLevel: ['2nd Year', '3rd Year', '4th Year'],
      },
    },
    {
      id: 'sch-qc-03',
      name: 'Quezon City Honor & Leadership Bursary',
      code: 'HONOR-BUR-2026',
      category: 'Merit',
      eligibility_criteria: {
        gwa: 2.0,
        income: 300000,
        residency: true,
        city: 'Quezon City',
        isPWD: true,
        isSoloParent: true,
      },
    },
  ];

  const targetPrograms = programs.length > 0 ? programs : defaultPrograms;
  const matches = [];

  for (const program of targetPrograms) {
    let score = 0;
    const reasons = [];
    let isEligible = true;
    const criteria = program.eligibility_criteria || {};

    // 1. GWA Check
    if (criteria.gwa !== undefined) {
      const requiredGWA = criteria.gwa;
      const studentGWA = Number(studentData.gwa) || 2.0;
      if (studentGWA <= requiredGWA) {
        score += 25;
        reasons.push(`GWA ${studentGWA} meets the ${requiredGWA} requirement`);
      } else {
        isEligible = false;
        reasons.push(`GWA ${studentGWA} does not meet the ${requiredGWA} requirement`);
      }
    }

    // 2. Income Check
    if (program.category === 'Economic' || criteria.income !== undefined) {
      const maxIncome = criteria.income || 250000;
      const studentIncome = Number(studentData.annualIncome) || 120000;
      if (studentIncome <= maxIncome) {
        score += 20;
        reasons.push(`Annual income ₱${studentIncome.toLocaleString()} meets requirement`);
      } else {
        isEligible = false;
        reasons.push(`Annual income ₱${studentIncome.toLocaleString()} exceeds ₱${maxIncome.toLocaleString()} limit`);
      }
    }

    // 3. Residency Check
    if (criteria.residency) {
      const isQC =
        studentData.city === 'Quezon City' ||
        studentData.city === 'QC' ||
        (studentData.barangay && studentData.barangay.toLowerCase().includes('quezon'));
      if (isQC) {
        score += 15;
        reasons.push('You are a verified Quezon City resident');
      } else {
        isEligible = false;
        reasons.push('You must be a Quezon City resident');
      }
    }

    // 4. Course Match
    if (criteria.courses && Array.isArray(criteria.courses)) {
      if (criteria.courses.some((c) => studentData.course && studentData.course.toLowerCase().includes(c.toLowerCase()))) {
        score += 20;
        reasons.push(`Your course ${studentData.course} is a priority course`);
      }
    }

    // 5. Year Level Match
    if (criteria.yearLevel && Array.isArray(criteria.yearLevel)) {
      if (criteria.yearLevel.includes(studentData.yearLevel)) {
        score += 10;
        reasons.push(`You are a ${studentData.yearLevel} student`);
      }
    }

    // 6. Special Categories (PWD, Solo Parent, 4Ps)
    if (criteria.isPWD && studentData.isPWD) {
      score += 10;
      reasons.push('You qualify as a PWD scholar');
    }
    if (criteria.isSoloParent && studentData.isSoloParent) {
      score += 10;
      reasons.push('You qualify as a Solo Parent scholar');
    }
    if (criteria.is4Ps && studentData.is4Ps) {
      score += 10;
      reasons.push('You qualify as a 4Ps beneficiary');
    }

    const recommendation =
      score >= 70
        ? 'Highly Recommended'
        : score >= 50
        ? 'Recommended'
        : 'Consider Other Options';

    matches.push({
      program_id: program.id,
      program_name: program.name,
      program_code: program.code,
      match_score: score,
      match_reason: reasons.join(', '),
      is_eligible: isEligible,
      recommendation,
    });
  }

  // Sort by match score descending
  matches.sort((a, b) => b.match_score - a.match_score);

  return matches;
};

module.exports = {
  matchStudentToScholarships,
};
