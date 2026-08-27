import React, { useState } from 'react';
import { Calendar as CalendarIcon, MapPin, Video, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

export const PublicAppointmentCalendar: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [purpose, setPurpose] = useState('Application Guidance');
  const [mode, setMode] = useState<'virtual' | 'in_person'>('virtual');
  const [date, setDate] = useState('2026-08-15');
  const [timeSlot, setTimeSlot] = useState('10:00 AM');

  const TIME_SLOTS = ['09:00 AM', '10:30 AM', '01:30 PM', '03:00 PM', '04:15 PM'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error('Please enter your name and email');
      return;
    }

    toast.success(
      `Appointment booked for ${name} on ${date} at ${timeSlot}! Confirmation sent to ${email}.`
    );
    setName('');
    setEmail('');
    setPhone('');
  };

  return (
    <Card className="bg-white border border-slate-200 shadow-soft">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Book Financial Aid Advisory Appointment
        </CardTitle>
        <CardDescription>Schedule a consultation with a Financial Aid Officer (No login required)</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Maria Santos"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary shadow-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="maria.santos@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary shadow-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Contact Phone</label>
              <input
                type="tel"
                placeholder="+63 917 882 9901"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary shadow-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Consultation Purpose</label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary shadow-xs"
              >
                <option value="Application Guidance">Application Guidance & Requirements</option>
                <option value="Document Verification">Document & COR Verification Help</option>
                <option value="Eligibility Consultation">Scholarship Eligibility Consultation</option>
                <option value="Grants Consultation">Educational Grants & Bursaries Consultation</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Consultation Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('virtual')}
                  className={`h-10 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-bold transition-all ${
                    mode === 'virtual'
                      ? 'bg-primary text-white border-transparent shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 shadow-xs hover:bg-slate-50'
                  }`}
                >
                  <Video className="h-4 w-4" /> Virtual (Meet)
                </button>
                <button
                  type="button"
                  onClick={() => setMode('in_person')}
                  className={`h-10 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-bold transition-all ${
                    mode === 'in_person'
                      ? 'bg-primary text-white border-transparent shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 shadow-xs hover:bg-slate-50'
                  }`}
                >
                  <MapPin className="h-4 w-4" /> In-Person Desk
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Preferred Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary shadow-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Available Time Slot</label>
              <div className="flex flex-wrap gap-1.5">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                      timeSlot === slot
                        ? 'bg-primary border-transparent text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 shadow-xs hover:bg-slate-50'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button type="submit" variant="primary" size="md" leftIcon={<CheckCircle2 className="h-4 w-4" />} className="w-full font-bold">
            Confirm & Schedule Appointment
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
