import React, { useState } from 'react';
import { Plus, GraduationCap, Calendar, Edit3, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { formatCurrency } from '../../utils/cn';

interface ScholarshipProgram {
  id: string;
  name: string;
  description: string;
  eligibility: string;
  amount: number;
  period: string;
  category: 'Need-Based' | 'Merit-Based' | 'STEM' | 'Athletic';
  status: 'Active' | 'Inactive' | 'Upcoming';
}

const INITIAL_PROGRAMS: ScholarshipProgram[] = [
  {
    id: 'PROG-01',
    name: 'Quezon City Presidential Scholarship',
    description: 'Premier scholarship for top-ranking students residing in Quezon City enrolled in priority courses.',
    eligibility: 'GPA 3.75+, QC Resident, enrolled in STEM or Business fields.',
    amount: 25000,
    period: 'Aug 1, 2026 - Sep 15, 2026',
    category: 'Merit-Based',
    status: 'Active',
  },
  {
    id: 'PROG-02',
    name: 'QCYDO Need-Based College Aid',
    description: 'Financial assistance program for underprivileged college students to support tuition and living expenses.',
    eligibility: 'Family income below ₱250,000/year, QC Resident.',
    amount: 15000,
    period: 'Aug 10, 2026 - Sep 30, 2026',
    category: 'Need-Based',
    status: 'Active',
  },
  {
    id: 'PROG-03',
    name: 'QC Science & Tech Scholar Grant',
    description: 'Support program for outstanding students pursuing specialized STEM degrees at partner universities.',
    eligibility: 'GPA 3.0+, enrolled in approved BS Science/Engineering program.',
    amount: 30000,
    period: 'Sep 1, 2026 - Oct 15, 2026',
    category: 'STEM',
    status: 'Upcoming',
  },
];

export const ProgramsPage: React.FC = () => {
  const [programs, setPrograms] = useState<ScholarshipProgram[]>(INITIAL_PROGRAMS);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [amount, setAmount] = useState('20000');
  const [period, setPeriod] = useState('Aug 15, 2026 - Sep 30, 2026');
  const [category, setCategory] = useState<'Need-Based' | 'Merit-Based' | 'STEM' | 'Athletic'>('Need-Based');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !desc || !eligibility) {
      toast.error('Please fill in all required fields.');
      return;
    }
    const newProg: ScholarshipProgram = {
      id: `PROG-0${programs.length + 1}`,
      name,
      description: desc,
      eligibility,
      amount: Number(amount),
      period,
      category,
      status: 'Active',
    };
    setPrograms([...programs, newProg]);
    setShowModal(false);
    setName('');
    setDesc('');
    setEligibility('');
    toast.success('Scholarship Program created successfully!');
  };

  const handleDelete = (id: string) => {
    setPrograms(programs.filter(p => p.id !== id));
    toast.info('Program deleted.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-2xl text-foreground">Scholarship Program Management</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Create, monitor, and configure city-sponsored scholarship and bursary programs.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowModal(true)}
            leftIcon={<Plus className="h-4 w-4" />}
            className="font-bold shrink-0"
          >
            Create New Program
          </Button>
        </div>
      </div>

      {/* Grid of Programs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {programs.map((prog) => (
          <Card key={prog.id} hoverEffect className="flex flex-col justify-between">
            <CardHeader className="space-y-2">
              <div className="flex items-start justify-between">
                <Badge
                  variant={
                    prog.category === 'STEM'
                      ? 'success'
                      : prog.category === 'Merit-Based'
                      ? 'primary'
                      : 'info'
                  }
                >
                  {prog.category}
                </Badge>
                <Badge variant={prog.status === 'Active' ? 'success' : 'warning'}>
                  {prog.status}
                </Badge>
              </div>
              <CardTitle className="text-base">{prog.name}</CardTitle>
              <CardDescription className="line-clamp-3">{prog.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Grant Amount:</span>
                  <span className="font-bold text-primary">{formatCurrency(prog.amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Period:</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" /> {prog.period.split(' - ')[1]}
                  </span>
                </div>
              </div>
              <div>
                <span className="font-bold text-slate-700 block mb-1">Eligibility Criteria:</span>
                <p className="p-2.5 bg-blue-50/50 border border-blue-100 rounded-lg text-blue-900 leading-relaxed font-medium">
                  {prog.eligibility}
                </p>
              </div>
            </CardContent>

            <CardFooter className="pt-2 gap-2">
              <Button variant="outline" size="sm" className="flex-1 font-bold" leftIcon={<Edit3 className="h-3.5 w-3.5" />}>
                Edit Details
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(prog.id)}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Creation Form Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Create Scholarship Program"
          description="Define the specifications, eligibility, and funding details for the new program."
          footer={
            <div className="flex gap-2 w-full justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleCreate} className="font-bold">
                Submit & Create
              </Button>
            </div>
          }
        >
          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <Input
              id="prog-name"
              label="Program Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Quezon City PWD Educational Assistance"
              required
            />
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">Program Description</label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Describe the purpose and goals of the scholarship..."
                className="w-full h-20 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
                required
              />
            </div>
            <Input
              id="prog-eligibility"
              label="Eligibility Requirements"
              value={eligibility}
              onChange={(e) => setEligibility(e.target.value)}
              placeholder="e.g. QC resident, family income below ₱300,000, PWD ID cardholder"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="prog-amount"
                label="Grant Amount (PHP)"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
                >
                  <option value="Need-Based">Need-Based Assistance</option>
                  <option value="Merit-Based">Merit-Based Scholarship</option>
                  <option value="STEM">STEM Special Grant</option>
                  <option value="Athletic">Athletic Grant</option>
                </select>
              </div>
            </div>
            <Input
              id="prog-period"
              label="Application Period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="e.g. Aug 15, 2026 - Sep 30, 2026"
              required
            />
          </form>
        </Modal>
      )}
    </div>
  );
};
