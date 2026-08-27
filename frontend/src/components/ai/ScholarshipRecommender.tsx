import React, { useState } from 'react';
import { Sparkles, Award } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../utils/cn';

interface RecommendationResult {
  id: string;
  title: string;
  provider: string;
  matchScore: number;
  awardValue: number;
  reason: string;
}

export const ScholarshipRecommender: React.FC = () => {
  const [gpa, setGpa] = useState('3.75');
  const [course, setCourse] = useState('Computer Science');
  const [income, setIncome] = useState('250000');
  const [recommendations, setRecommendations] = useState<RecommendationResult[] | null>(null);

  const handleCalculateMatch = (e: React.FormEvent) => {
    e.preventDefault();
    const gpaNum = parseFloat(gpa) || 0;
    const incNum = parseFloat(income) || 999999;

    const results: RecommendationResult[] = [];

    if (gpaNum >= 3.5) {
      results.push({
        id: 'REC-01',
        title: 'DOST-SEI STEM National Excellence Grant',
        provider: 'DOST Philippines',
        matchScore: 98,
        awardValue: 40000,
        reason: 'Outstanding GPA 3.75+ matches STEM National Priority Requirement',
      });
    }

    if (incNum <= 300000) {
      results.push({
        id: 'REC-02',
        title: 'CHED UniFAST Tertiary Education Subsidy',
        provider: 'CHED UniFAST',
        matchScore: 94,
        awardValue: 30000,
        reason: 'Household Income under ₱300k threshold qualifies for priority subsidy',
      });
    }

    results.push({
      id: 'REC-03',
      title: 'Quezon City Honor Scholar Award',
      provider: 'QC Local Government',
      matchScore: 89,
      awardValue: 20000,
      reason: 'Resident scholar enrolled in Quezon City accredited university',
    });

    setRecommendations(results);
  };

  return (
    <Card className="bg-white shadow-soft">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          AI Smart Scholarship Match Recommender
        </CardTitle>
        <CardDescription>Simulated AI engine calculating eligibility match scores</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 text-xs">
        <form onSubmit={handleCalculateMatch} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Student GPA</label>
            <input
              type="number"
              step="0.01"
              value={gpa}
              onChange={(e) => setGpa(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Academic Major</label>
            <input
              type="text"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Annual Household Income (₱)</label>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xs"
            />
          </div>

          <div className="flex items-end">
            <Button type="submit" variant="primary" size="md" leftIcon={<Sparkles className="h-4 w-4" />} className="w-full font-bold shadow-md shadow-blue-600/20">
              Calculate AI Matches
            </Button>
          </div>
        </form>

        {recommendations && (
          <div className="mt-4 space-y-2 animate-in fade-in duration-200">
            <p className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Award className="h-4 w-4 text-primary" /> Top AI Scholarship Match Recommendations:
            </p>
            <div className="space-y-2">
              {recommendations.map((rec) => (
                <div key={rec.id} className="p-3.5 bg-slate-50 rounded-2xl flex items-center justify-between gap-3 shadow-xs hover:shadow-soft transition-all">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{rec.title}</span>
                      <Badge variant="success" size="sm">{rec.matchScore}% Match</Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{rec.reason}</p>
                  </div>
                  <span className="font-extrabold text-emerald-600 text-sm whitespace-nowrap">{formatCurrency(rec.awardValue)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
