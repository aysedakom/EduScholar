import React, { useState } from 'react';
import { Star, Search, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

interface StudentEvaluation {
  id: string;
  studentName: string;
  studentId: string;
  jobTitle: string;
  department: string;
  lastEvaluationDate?: string;
  overallScore?: number;
  status: 'Pending' | 'Completed';
}

const ASSIGNED_STUDENTS_EVAL: StudentEvaluation[] = [
  {
    id: 'EVAL-101',
    studentName: 'Maria Santos',
    studentId: '2024-00192',
    jobTitle: 'Computer Lab Assistant',
    department: 'Computer Science Lab',
    status: 'Pending',
  },
  {
    id: 'EVAL-102',
    studentName: 'Joshua Reyes',
    studentId: '2023-11048',
    jobTitle: 'Library Archive Cataloger',
    department: 'University Library',
    status: 'Pending',
  },
  {
    id: 'EVAL-100',
    studentName: 'Samantha Tan',
    studentId: '2024-00912',
    jobTitle: 'Library Assistant',
    department: 'University Library',
    lastEvaluationDate: '2026-08-01',
    overallScore: 4.8,
    status: 'Completed',
  },
];

export const StudentEvaluationsPage: React.FC = () => {
  const [students, setStudents] = useState<StudentEvaluation[]>(ASSIGNED_STUDENTS_EVAL);
  const [searchQuery, setSearchQuery] = useState('');

  // Evaluation Form Modal State
  const [evalTarget, setEvalTarget] = useState<StudentEvaluation | null>(null);

  // 5-Star Ratings
  const [professionalism, setProfessionalism] = useState(5);
  const [punctuality, setPunctuality] = useState(5);
  const [qualityOfWork, setQualityOfWork] = useState(4);
  const [communication, setCommunication] = useState(5);
  const [teamwork, setTeamwork] = useState(5);
  const [comments, setComments] = useState('');

  const filteredStudents = students.filter(
    (s) =>
      s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalTarget) return;

    const avg = ((professionalism + punctuality + qualityOfWork + communication + teamwork) / 5).toFixed(1);

    setStudents((prev) =>
      prev.map((s) =>
        s.id === evalTarget.id
          ? {
              ...s,
              status: 'Completed',
              lastEvaluationDate: new Date().toISOString().split('T')[0],
              overallScore: parseFloat(avg),
            }
          : s
      )
    );

    toast.success(`Performance Evaluation submitted for ${evalTarget.studentName}! Overall Score: ${avg}/5.0`);
    setEvalTarget(null);
    setComments('');
  };

  const handleGenerateReport = (s: StudentEvaluation) => {
    toast.info(`Generating official evaluation report PDF for ${s.studentName}...`);
    setTimeout(() => toast.success(`Downloaded Evaluation_Report_${s.studentId}.pdf`), 1000);
  };

  const renderStars = (rating: number, setRatingFunc: (r: number) => void) => (
    <div className="flex items-center gap-1 cursor-pointer">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          onClick={() => setRatingFunc(star)}
          className={`h-5 w-5 transition-transform hover:scale-110 ${
            star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-foreground">Scholar Academic & Service Evaluations</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Evaluate assigned scholars on academic engagement, punctuality, community service quality, communication, and teamwork.
          </p>
        </div>
        <Badge variant="primary" size="md">
          {students.filter((s) => s.status === 'Pending').length} Pending Mid-Semester Reviews
        </Badge>
      </div>

      {/* Roster & Evaluation Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search scholar or program..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary shadow-xs"
            />
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase group-label border-b border-border">
                <tr>
                  <th className="p-3">Student Name & ID</th>
                  <th className="p-3">Scholarship / Program</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Evaluation Status</th>
                  <th className="p-3">Overall Score</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70">
                    <td className="p-3">
                      <div>
                        <span className="font-bold text-slate-900 block">{s.studentName}</span>
                        <span className="font-mono text-[11px] text-slate-400">{s.studentId}</span>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-slate-800">{s.jobTitle}</td>
                    <td className="p-3 text-slate-600">{s.department}</td>
                    <td className="p-3">
                      <Badge variant={s.status === 'Completed' ? 'success' : 'warning'}>
                        {s.status}
                      </Badge>
                      {s.lastEvaluationDate && (
                        <p className="text-[10px] text-slate-400 mt-1">Submitted: {s.lastEvaluationDate}</p>
                      )}
                    </td>
                    <td className="p-3">
                      {s.overallScore ? (
                        <div className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 w-fit">
                          <Star className="h-3.5 w-3.5 fill-amber-400" /> {s.overallScore} / 5.0
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Not Evaluated</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {s.status === 'Completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerateReport(s)}
                            leftIcon={<Download className="h-3.5 w-3.5" />}
                          >
                            PDF Report
                          </Button>
                        )}
                        <Button
                          variant={s.status === 'Pending' ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => setEvalTarget(s)}
                          leftIcon={<Star className="h-3.5 w-3.5" />}
                          className={s.status === 'Pending' ? 'font-bold' : ''}
                        >
                          {s.status === 'Pending' ? 'Evaluate Scholar' : 'Re-Evaluate'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 5-Star Rubric Evaluation Form Modal */}
      {evalTarget && (
        <Modal
          isOpen={!!evalTarget}
          onClose={() => setEvalTarget(null)}
          title={`Performance Evaluation: ${evalTarget.studentName}`}
          description={`Position: ${evalTarget.jobTitle} (${evalTarget.department})`}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setEvalTarget(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSubmitEvaluation} className="font-bold">
                Submit Formal Evaluation
              </Button>
            </>
          }
        >
          <form onSubmit={handleSubmitEvaluation} className="space-y-4 text-xs">
            {/* 5 Rating Criteria */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">1. Professionalism & Conduct</p>
                  <p className="text-[11px] text-slate-500">Adheres to department workplace policies</p>
                </div>
                {renderStars(professionalism, setProfessionalism)}
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                <div>
                  <p className="font-bold text-slate-800">2. Punctuality & Time Management</p>
                  <p className="text-[11px] text-slate-500">Arrives promptly for scheduled shifts</p>
                </div>
                {renderStars(punctuality, setPunctuality)}
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                <div>
                  <p className="font-bold text-slate-800">3. Quality of Work Output</p>
                  <p className="text-[11px] text-slate-500">Completes assigned tasks thoroughly</p>
                </div>
                {renderStars(qualityOfWork, setQualityOfWork)}
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                <div>
                  <p className="font-bold text-slate-800">4. Communication Skills</p>
                  <p className="text-[11px] text-slate-500">Interacts effectively with staff & peers</p>
                </div>
                {renderStars(communication, setCommunication)}
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                <div>
                  <p className="font-bold text-slate-800">5. Teamwork & Initiative</p>
                  <p className="text-[11px] text-slate-500">Demonstrates helpful initiative</p>
                </div>
                {renderStars(teamwork, setTeamwork)}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Supervisor Feedback & Comments</label>
              <textarea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Provide constructive feedback or highlight key accomplishments..."
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary resize-none shadow-xs"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
