import React, { useState } from 'react';
import { Calendar, Clock, Plus, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

interface SlotItem {
  id: string;
  program: string;
  date: string;
  time: string;
  interviewer: string;
  maxStudents: number;
  bookedCount: number;
  status: 'Open' | 'Full' | 'Completed';
}

const INITIAL_SLOTS: SlotItem[] = [
  {
    id: 'SLOT-501',
    program: 'QC Excel Academic Scholarship',
    date: '2026-08-25',
    time: '09:00 AM - 12:00 PM',
    interviewer: 'Dr. Marcus Vance (QC YDO Board)',
    maxStudents: 6,
    bookedCount: 4,
    status: 'Open',
  },
  {
    id: 'SLOT-502',
    program: 'QC Economic Assistance Bursary',
    date: '2026-08-26',
    time: '01:00 PM - 04:00 PM',
    interviewer: 'Maria Santos (HRMD Officer)',
    maxStudents: 5,
    bookedCount: 5,
    status: 'Full',
  },
];

export const InterviewSlotManagementPage: React.FC = () => {
  const [slots, setSlots] = useState<SlotItem[]>(INITIAL_SLOTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScorecardModal, setShowScorecardModal] = useState(false);
  const [selectedSlotForScorecard, setSelectedSlotForScorecard] = useState<SlotItem | null>(null);

  // Form states
  const [program, setProgram] = useState('QC Excel Academic Scholarship');
  const [date, setDate] = useState('2026-08-27');
  const [time, setTime] = useState('09:00 AM - 11:00 AM');
  const [interviewer, setInterviewer] = useState('Dr. Marcus Vance');
  const [maxStudents, setMaxStudents] = useState('5');

  // Scorecard state
  const [commScore, setCommScore] = useState('4.5');
  const [knowledgeScore, setKnowledgeScore] = useState('4.8');
  const [attitudeScore, setAttitudeScore] = useState('5.0');
  const [evalNotes, setEvalNotes] = useState('');

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const newSlot: SlotItem = {
      id: `SLOT-${Math.floor(500 + Math.random() * 400)}`,
      program,
      date,
      time,
      interviewer,
      maxStudents: parseInt(maxStudents) || 5,
      bookedCount: 0,
      status: 'Open',
    };
    setSlots([newSlot, ...slots]);
    setShowAddModal(false);
    toast.success('Interview schedule slot published successfully!');
  };

  const handleSaveScorecard = (e: React.FormEvent) => {
    e.preventDefault();
    setShowScorecardModal(false);
    toast.success('Digital Interview Scorecard recorded!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl text-slate-900">Interview Slot & Evaluation Management</h1>
            <Badge variant="primary">Interview Hub</Badge>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Publish self-scheduling interview time blocks, track applicant bookings, and submit digital scorecards.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="md" onClick={() => setShowAddModal(true)} leftIcon={<Plus className="h-4 w-4" />} className="font-bold">
            Create Interview Time Slot
          </Button>
        </div>
      </div>

      {/* Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {slots.map((s) => (
          <Card key={s.id} hoverEffect className="bg-white border-slate-200">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <Badge variant={s.status === 'Full' ? 'warning' : 'info'}>{s.status}</Badge>
                <span className="text-xs font-bold text-slate-500">{s.id}</span>
              </div>
              <CardTitle className="text-base font-bold text-slate-900">{s.program}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" /> Date: {s.date}
                  </span>
                  <span className="font-bold text-primary flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {s.time}
                  </span>
                </div>
                <p className="text-slate-600 font-medium">Interviewer: {s.interviewer}</p>
                <p className="text-slate-500 font-medium">
                  Booked Capacity: <strong className="text-slate-900">{s.bookedCount} / {s.maxStudents}</strong> Students
                </p>
              </div>
            </CardContent>
            <CardContent className="pt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedSlotForScorecard(s);
                  setShowScorecardModal(true);
                }}
                className="w-full font-bold text-xs"
                leftIcon={<Star className="h-3.5 w-3.5 text-amber-500" />}
              >
                Evaluate & Submit Digital Scorecard
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Slot Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Publish Interview Slot"
          description="Set program, interviewer, date, time window, and student slot limit."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleAddSlot} className="font-bold">
                Publish Slot
              </Button>
            </>
          }
        >
          <form onSubmit={handleAddSlot} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Scholarship Program</label>
              <select
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary font-medium"
              >
                <option value="QC Excel Academic Scholarship">QC Excel Academic Scholarship</option>
                <option value="QC Economic Assistance Bursary">QC Economic Assistance Bursary</option>
                <option value="Dean’s Technology Innovation Grant">Dean’s Technology Innovation Grant</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Session Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Time Range</label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="09:00 AM - 11:00 AM"
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Interviewer Lead</label>
                <input
                  type="text"
                  value={interviewer}
                  onChange={(e) => setInterviewer(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Max Student Limit</label>
                <input
                  type="number"
                  value={maxStudents}
                  onChange={(e) => setMaxStudents(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Scorecard Modal */}
      {showScorecardModal && selectedSlotForScorecard && (
        <Modal
          isOpen={showScorecardModal}
          onClose={() => setShowScorecardModal(false)}
          title={`Digital Scorecard: ${selectedSlotForScorecard.program}`}
          description="Rate communication, program knowledge, and attitude (1.0 to 5.0 scale)."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setShowScorecardModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveScorecard} className="font-bold bg-emerald-600 hover:bg-emerald-700">
                Save Evaluation Scorecard
              </Button>
            </>
          }
        >
          <form onSubmit={handleSaveScorecard} className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Communication</label>
                <input
                  type="number"
                  step="0.1"
                  value={commScore}
                  onChange={(e) => setCommScore(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Knowledge</label>
                <input
                  type="number"
                  step="0.1"
                  value={knowledgeScore}
                  onChange={(e) => setKnowledgeScore(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Attitude</label>
                <input
                  type="number"
                  step="0.1"
                  value={attitudeScore}
                  onChange={(e) => setAttitudeScore(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Overall Interview Remarks</label>
              <textarea
                rows={3}
                placeholder="Applicant demonstrated exemplary leadership and articulates academic goals..."
                value={evalNotes}
                onChange={(e) => setEvalNotes(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default InterviewSlotManagementPage;
