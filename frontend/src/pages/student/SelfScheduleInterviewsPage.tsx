import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

interface Slot {
  id: string;
  date: string;
  time: string;
  interviewer: string;
  available: boolean;
}

const AVAILABLE_SLOTS: Slot[] = [
  { id: 'slot-1', date: '2026-08-25', time: '09:00 AM - 09:30 AM', interviewer: 'Dr. Marcus Vance (QC YDO Board)', available: true },
  { id: 'slot-2', date: '2026-08-25', time: '10:00 AM - 10:30 AM', interviewer: 'Dr. Marcus Vance (QC YDO Board)', available: true },
  { id: 'slot-3', date: '2026-08-25', time: '02:00 PM - 02:30 PM', interviewer: 'Prof. Julian Cruz (School Coordinator)', available: true },
  { id: 'slot-4', date: '2026-08-26', time: '11:00 AM - 11:30 AM', interviewer: 'Maria Santos (HRMD Officer)', available: true },
  { id: 'slot-5', date: '2026-08-26', time: '03:00 PM - 03:30 PM', interviewer: 'Maria Santos (HRMD Officer)', available: false },
];

export const SelfScheduleInterviewsPage: React.FC = () => {
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [bookedSlot, setBookedSlot] = useState<Slot | null>({
    id: 'booked-01',
    date: '2026-08-25',
    time: '09:00 AM - 09:30 AM',
    interviewer: 'Dr. Marcus Vance (QC YDO Board)',
    available: false,
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleBook = () => {
    if (selectedSlot) {
      setBookedSlot(selectedSlot);
      setShowConfirmModal(false);
      setSelectedSlot(null);
      toast.success('Interview successfully booked! Confirmation notification sent.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl text-slate-900">Self-Schedule Program Interview</h1>
            <Badge variant="success">Shortlisted Applicant</Badge>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Choose your preferred interview session for the QC Excel Academic Scholarship.
          </p>
        </div>
      </div>

      {/* Booked Confirmation Card */}
      {bookedSlot && (
        <Card className="bg-emerald-50/60 border border-emerald-200 shadow-soft">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="success">Interview Scheduled</Badge>
              <span className="text-xs font-bold text-emerald-800">Confirmed Booking</span>
            </div>
            <CardTitle className="text-base font-bold text-emerald-950 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              QC Excel Academic Scholarship Panel Interview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white/80 rounded-xl border border-emerald-100 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Date</span>
                <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <CalendarIcon className="h-3.5 w-3.5 text-primary" /> {bookedSlot.date}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Time Slot</span>
                <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Clock className="h-3.5 w-3.5 text-primary" /> {bookedSlot.time}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Panel Lead</span>
                <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <User className="h-3.5 w-3.5 text-primary" /> {bookedSlot.interviewer}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Slots Grid */}
      <Card className="bg-white border border-slate-200 shadow-soft">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900">Available Interview Time Slots</CardTitle>
          <CardDescription>Select an open slot to schedule or reschedule your evaluation session</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AVAILABLE_SLOTS.map((slot) => (
              <div
                key={slot.id}
                onClick={() => slot.available && setSelectedSlot(slot)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  selectedSlot?.id === slot.id
                    ? 'bg-blue-50/70 border-primary shadow-md'
                    : slot.available
                    ? 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                    : 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CalendarIcon className="h-4 w-4 text-primary" /> {slot.date}
                  </span>
                  <Badge variant={slot.available ? 'info' : 'warning'}>
                    {slot.available ? 'Available' : 'Booked'}
                  </Badge>
                </div>

                <div>
                  <span className="text-xs font-extrabold text-primary flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {slot.time}
                  </span>
                  <p className="text-[11px] text-slate-600 font-medium mt-1">Interviewer: {slot.interviewer}</p>
                </div>

                <Button
                  variant={selectedSlot?.id === slot.id ? 'primary' : 'outline'}
                  size="sm"
                  disabled={!slot.available}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (slot.available) {
                      setSelectedSlot(slot);
                      setShowConfirmModal(true);
                    }
                  }}
                  className="w-full font-bold text-xs"
                >
                  {selectedSlot?.id === slot.id ? 'Selected' : slot.available ? 'Select Slot' : 'Slot Full'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedSlot && (
        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Confirm Interview Booking"
          description="Please review your session details before locking in the slot."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleBook} className="font-bold bg-emerald-600 hover:bg-emerald-700">
                Confirm & Book Slot
              </Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
              <p className="font-bold text-blue-900">Session Details:</p>
              <p className="text-blue-800">Date: {selectedSlot.date}</p>
              <p className="text-blue-800">Time: {selectedSlot.time}</p>
              <p className="text-blue-800">Panel Lead: {selectedSlot.interviewer}</p>
            </div>
            <p className="text-slate-600">
              An automated notification calendar invite will be sent to your registered email upon confirmation.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SelfScheduleInterviewsPage;
