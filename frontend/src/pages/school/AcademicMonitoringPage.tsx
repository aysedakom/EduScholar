import React, { useState } from 'react';
import { Star, AlertTriangle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

interface AcademicRecord {
  id: string;
  studentName: string;
  studentId: string;
  course: string;
  gpa: number;
  scholarshipName: string;
  status: 'Regular' | 'Probation' | 'Underload';
  gradeSubmitted: boolean;
}

const INITIAL_SCHOLARS: AcademicRecord[] = [
  {
    id: 'SCH-101',
    studentName: 'Alexandra Chen',
    studentId: 'STU-884920',
    course: 'B.S. Software Engineering',
    gpa: 3.85,
    scholarshipName: 'Quezon City Presidential Scholarship',
    status: 'Regular',
    gradeSubmitted: true,
  },
  {
    id: 'SCH-102',
    studentName: 'Julian Alvarez',
    studentId: 'STU-492810',
    course: 'B.S. Electronics Engineering',
    gpa: 2.15,
    scholarshipName: 'QCYDO Need-Based College Aid',
    status: 'Probation',
    gradeSubmitted: false,
  },
  {
    id: 'SCH-103',
    studentName: 'Maria Leonila',
    studentId: 'STU-992014',
    course: 'B.S. Accountancy',
    gpa: 3.10,
    scholarshipName: 'QCYDO Need-Based College Aid',
    status: 'Underload',
    gradeSubmitted: true,
  },
];

export const AcademicMonitoringPage: React.FC = () => {
  const [scholars, setScholars] = useState<AcademicRecord[]>(INITIAL_SCHOLARS);
  const [selectedScholar, setSelectedScholar] = useState<AcademicRecord | null>(null);
  const [status, setStatus] = useState<'Regular' | 'Probation' | 'Underload'>('Regular');
  const [newGpa, setNewGpa] = useState('3.0');
  const [hasAlert, setHasAlert] = useState(false);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScholar) return;

    setScholars(
      scholars.map(s =>
        s.id === selectedScholar.id
          ? { ...s, status, gpa: Number(newGpa), gradeSubmitted: true }
          : s
      )
    );
    toast.success(`Academic record for ${selectedScholar.studentName} updated successfully!`);
    if (hasAlert) {
      toast.warning(`Academic alert flag dispatched for low GPA/Standing.`);
    }
    setSelectedScholar(null);
    setHasAlert(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0">
            <Star className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-foreground">Academic Monitoring Portal</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Submit grades, track GPA requirements, and flag warning states for City scholars.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Scholars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {scholars.map((s) => (
          <Card key={s.id} hoverEffect className="flex flex-col justify-between">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge
                  variant={
                    s.status === 'Regular'
                      ? 'success'
                      : s.status === 'Probation'
                      ? 'destructive'
                      : 'warning'
                  }
                >
                  {s.status}
                </Badge>
                <Badge variant={s.gradeSubmitted ? 'success' : 'outline'}>
                  {s.gradeSubmitted ? 'Grade Verified' : 'Pending Grades'}
                </Badge>
              </div>
              <CardTitle className="text-base">{s.studentName}</CardTitle>
              <CardDescription>{s.course}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student ID:</span>
                  <span className="font-bold text-slate-800">{s.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Active GPA:</span>
                  <span className="font-extrabold text-primary">{s.gpa.toFixed(2)}</span>
                </div>
              </div>
              <div>
                <span className="font-bold text-slate-700 block mb-1">Scholarship:</span>
                <p className="text-slate-500 font-semibold">{s.scholarshipName}</p>
              </div>
            </CardContent>

            <CardFooter className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setSelectedScholar(s);
                  setStatus(s.status);
                  setNewGpa(String(s.gpa));
                }}
                className="w-full font-bold"
                leftIcon={<FileText className="h-4 w-4" />}
              >
                Submit Grade Report
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Grade Report Modal */}
      {selectedScholar && (
        <Modal
          isOpen={!!selectedScholar}
          onClose={() => setSelectedScholar(null)}
          title="Submit Academic Record & Grades"
          description={`Update standing for ${selectedScholar.studentName}`}
          footer={
            <div className="flex gap-2 w-full justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedScholar(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleUpdate} className="font-bold">
                Save Changes
              </Button>
            </div>
          }
        >
          <form onSubmit={handleUpdate} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="gpa-input"
                label="Latest Semester GPA"
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={newGpa}
                onChange={(e) => setNewGpa(e.target.value)}
                required
              />
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">Academic Standing</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
                >
                  <option value="Regular">Regular Status</option>
                  <option value="Probation">Academic Probation</option>
                  <option value="Underload">Credit Underload</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-rose-50/50 border border-rose-100 rounded-xl">
              <input
                id="alert-checkbox"
                type="checkbox"
                checked={hasAlert}
                onChange={(e) => setHasAlert(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <label htmlFor="alert-checkbox" className="text-[11px] font-bold text-rose-800 flex items-center gap-1 cursor-pointer">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                Dispatch Academic Warning/Alert to QCYDO Office
              </label>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
