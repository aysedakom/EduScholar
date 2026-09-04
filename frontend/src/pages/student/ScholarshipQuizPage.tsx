import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, ArrowLeft, Sparkles, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/cn';

interface MatchResult {
  title: string;
  category: string;
  amount: number;
  matchScore: number;
  reasons: string[];
}

export const ScholarshipQuizPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [gwa, setGwa] = useState('1.50');
  const [course, setCourse] = useState('Computer Science');
  const [income, setIncome] = useState('Low (Below ₱250,000/yr)');
  const [barangay, setBarangay] = useState('Novaliches');
  const [specialGroup, setSpecialGroup] = useState<string[]>(['QC Resident']);
  const [results, setResults] = useState<MatchResult[] | null>(null);

  const toggleSpecialGroup = (item: string) => {
    if (specialGroup.includes(item)) {
      setSpecialGroup(specialGroup.filter((g) => g !== item));
    } else {
      setSpecialGroup([...specialGroup, item]);
    }
  };

  const handleCalculateMatch = () => {
    const mockMatches: MatchResult[] = [
      {
        title: 'QC Excel Academic Scholarship',
        category: 'STEM / Academic',
        amount: 110000,
        matchScore: 98,
        reasons: ['Your GWA of ' + gwa + ' meets the top honor threshold', 'Registered Quezon City resident in ' + barangay],
      },
      {
        title: 'Dean’s Excellence in Technology Grant',
        category: 'STEM',
        amount: 7500,
        matchScore: 94,
        reasons: ['Direct field alignment with ' + course, 'High academic standing'],
      },
      {
        title: 'QC Economic Aid Assistance Bursary',
        category: 'Need-Based',
        amount: 40000,
        matchScore: 88,
        reasons: ['Matches income bracket: ' + income, 'Eligible for direct tuition offset'],
      },
    ];

    setResults(mockMatches);
    setStep(4);
  };

  const resetQuiz = () => {
    setStep(1);
    setResults(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl text-slate-900">Scholarship Matching Quiz</h1>
            <Badge variant="primary">AI Matcher</Badge>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Answer 3 quick questions to discover your highest matching scholarship & bursary opportunities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetQuiz} leftIcon={<RefreshCw className="h-4 w-4" />}>
            Restart Quiz
          </Button>
        </div>
      </div>

      {/* Quiz Card */}
      <Card className="bg-white border border-slate-200 shadow-soft max-w-3xl mx-auto">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Step {step} of 3
            </span>
            <div className="flex gap-1.5">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all ${
                    s <= step ? 'w-8 bg-primary' : 'w-2 bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
          <CardTitle className="text-lg font-bold text-slate-900 mt-2">
            {step === 1 && 'Academic Profile & Course'}
            {step === 2 && 'Financial & Household Status'}
            {step === 3 && 'Residency & Special Designations'}
            {step === 4 && 'Your AI Scholarship Recommendations'}
          </CardTitle>
        </CardHeader>

        <CardContent className="py-6 space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Cumulative GWA / GPA</label>
                <input
                  type="text"
                  value={gwa}
                  onChange={(e) => setGwa(e.target.value)}
                  placeholder="e.g. 1.50"
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Field of Study / Course</label>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary font-medium"
                >
                  <option value="Computer Science">BS Computer Science & IT</option>
                  <option value="Engineering">BS Civil / Industrial Engineering</option>
                  <option value="Business">BS Business Administration</option>
                  <option value="Education">BS Education</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Annual Household Income</label>
                <select
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary font-medium"
                >
                  <option value="Low (Below ₱250,000/yr)">Low (Below ₱250,000 / year)</option>
                  <option value="Middle (₱250,000 - ₱500,000/yr)">Middle (₱250,000 - ₱500,000 / year)</option>
                  <option value="High (Above ₱500,000/yr)">High (Above ₱500,000 / year)</option>
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Quezon City Barangay</label>
                <input
                  type="text"
                  value={barangay}
                  onChange={(e) => setBarangay(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">Special Criteria Designations</label>
                <div className="grid grid-cols-2 gap-2">
                  {['QC Resident', 'First-Gen Student', 'PWD Student', 'Solo Parent Dependent'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleSpecialGroup(tag)}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                        specialGroup.includes(tag)
                          ? 'bg-blue-50 border-primary text-primary'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{tag}</span>
                      {specialGroup.includes(tag) && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && results && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-emerald-600 shrink-0" />
                <p className="text-xs text-emerald-900 font-semibold">
                  Found <strong className="font-bold">{results.length} matched grant opportunities</strong> based on your academic & financial profile.
                </p>
              </div>

              <div className="space-y-3">
                {results.map((res, i) => (
                  <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="primary">{res.category}</Badge>
                      <span className="text-xs font-black text-emerald-600 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        {res.matchScore}% Match
                      </span>
                    </div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{res.title}</h4>
                        <span className="text-xs font-heading font-extrabold text-primary block mt-0.5">
                          {formatCurrency(res.amount)}
                        </span>
                      </div>
                      <Link to="/scholar-prog-available">
                        <Button variant="primary" size="sm" className="font-bold text-xs" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                          Apply Now
                        </Button>
                      </Link>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 space-y-1">
                      {res.reasons.map((r, idx) => (
                        <p key={idx} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> {r}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t border-slate-100 pt-4">
          {step > 1 && step < 4 && (
            <Button variant="outline" size="sm" onClick={() => setStep(step - 1)} leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back
            </Button>
          )}

          {step < 3 && (
            <Button variant="primary" size="sm" onClick={() => setStep(step + 1)} className="ml-auto font-bold" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Next Step
            </Button>
          )}

          {step === 3 && (
            <Button variant="primary" size="sm" onClick={handleCalculateMatch} className="ml-auto font-bold bg-emerald-600 hover:bg-emerald-700" leftIcon={<Sparkles className="h-4 w-4" />}>
              Calculate Matches
            </Button>
          )}

          {step === 4 && (
            <Button variant="outline" size="sm" onClick={resetQuiz} className="ml-auto font-bold">
              Take Quiz Again
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ScholarshipQuizPage;
