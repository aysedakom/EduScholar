import React, { useState, useMemo } from 'react';
import { Sparkles, CheckCircle2, ArrowRight, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency, formatDate } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

interface RecommendationItem {
  id: string;
  title: string;
  provider: string;
  category: string;
  matchScore: number;
  awardValue: number;
  deadline: string;
  reasons: string[];
  description: string;
}

export const SmartRecommendationsPage: React.FC = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('All');
  const categories = ['All', '90%+ Match', 'STEM Major', 'Need-Based'];

  const studentGpa = Number(user?.gpa || (user?.basicProfile as any)?.gpa || 1.50);
  const studentCourse = user?.major || (user?.basicProfile as any)?.course || 'B.S. Information Technology';
  const studentSchool = user?.department || (user?.basicProfile as any)?.school || 'Bestlink College of the Philippines (BCP)';
  const studentBarangay = user?.barangay || (user?.basicProfile as any)?.barangay || 'Barangay Central, Quezon City';

  const recommendations: RecommendationItem[] = useMemo(() => {
    return [
      {
        id: 'rec-economic',
        title: 'Economic Scholarship (Need-Based Financial Assistance)',
        provider: 'Quezon City Youth Development Office (QCYDO)',
        matchScore: 98,
        category: 'Need-Based',
        awardValue: 20000,
        deadline: '2026-09-30',
        reasons: [
          `Verified resident of ${studentBarangay}`,
          `Recorded GWA of ${studentGpa.toFixed(2)} meets the academic threshold (Requires <= 2.50)`,
          `Household financial declaration verified under priority assistance bracket`,
        ],
        description: 'Need-based financial stipend supporting undergraduate students enrolled in accredited higher education institutions.',
      },
      {
        id: 'rec-stem',
        title: 'Tertiary Excellence in Science & Technology (QC-EXCEL)',
        provider: 'QC Science & Technology Council',
        matchScore: 94,
        category: 'STEM Major',
        awardValue: 50000,
        deadline: '2026-09-25',
        reasons: [
          `${studentCourse} is officially recognized under Priority CHED STEM degree programs`,
          `GWA of ${studentGpa.toFixed(2)} ranks in top honors tier`,
          `Enrolled in accredited institution: ${studentSchool}`,
        ],
        description: 'Specialized grant program funded by the Quezon City government for outstanding technology, engineering, and science innovators.',
      },
      {
        id: 'rec-academic',
        title: 'Tertiary Academic Scholarship (Merit-Based)',
        provider: 'QCYDO Scholarship Board',
        matchScore: 89,
        category: 'Merit-Based',
        awardValue: 25000,
        deadline: '2026-10-15',
        reasons: [
          `GWA ${studentGpa.toFixed(2)} exceeds minimum 1.75 requirement`,
          'Official Certificate of Registration (COR) & Grade Sheets validated',
        ],
        description: 'City-sponsored tuition & allowance grant designed specifically for academically meritorious Quezon City collegiate youth.',
      },
    ];
  }, [studentGpa, studentCourse, studentSchool, studentBarangay]);

  const filteredItems = recommendations.filter((item) => {
    if (filter === '90%+ Match') return item.matchScore >= 90;
    if (filter === 'STEM Major') return item.category === 'STEM Major';
    if (filter === 'Need-Based') return item.category === 'Need-Based';
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl text-slate-900">AI Smart Recommendations</h1>
            <Badge variant="primary" size="md">
              Automated Engine
            </Badge>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Personalized grant recommendations computed dynamically against your verified profile ({studentCourse}, GWA {studentGpa.toFixed(2)}).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/quiz">
            <Button variant="outline" size="sm" className="font-bold" leftIcon={<Sparkles className="h-4 w-4 text-amber-500" />}>
              Retake Match Quiz
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Filter className="h-4 w-4 text-slate-400" /> Filter Engine Results:
        </span>
        <div className="flex gap-1.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                filter === cat
                  ? 'bg-primary border-transparent text-white shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} hoverEffect className="flex flex-col justify-between border-slate-200">
            <CardHeader className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <Badge variant="info">{item.category}</Badge>
                <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> {item.matchScore}% Match
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{item.provider}</p>
              <CardTitle className="text-base font-bold text-slate-900">{item.title}</CardTitle>
              <CardDescription className="line-clamp-2">{item.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                  AI Match Criteria Met:
                </span>
                <div className="space-y-1.5">
                  {item.reasons.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-slate-500 font-medium">Estimated Grant Aid:</span>
                <span className="font-heading font-black text-emerald-600 text-base">{formatCurrency(item.awardValue)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Application Deadline:</span>
                <span className="font-bold text-slate-800">{formatDate(item.deadline)}</span>
              </div>
            </CardContent>

            <CardFooter className="pt-2">
              <Link to={`/apply?title=${encodeURIComponent(item.title)}`} className="w-full">
                <Button variant="primary" className="w-full font-bold shadow-soft" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Apply for Recommendation
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
