import React, { useState } from 'react';
import { X, GraduationCap, Award, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/Button';

interface QCSPAlumniModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QCSPAlumniModal: React.FC<QCSPAlumniModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    batchYear: '2024',
    course: '',
    university: 'Quezon City University (QCU)',
    employmentStatus: 'Employed',
    employer: '',
    jobTitle: '',
    monthlyIncome: '₱25,000 - ₱40,000',
    email: '',
    phone: '',
    testimonial: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success('QCSP Alumni Information Sheet submitted successfully!');
    }, 1000);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center font-bold">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white leading-tight">
                QCSP Alumni Information Sheet
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Quezon City Scholarship Program — Graduate Tracer Form
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
          {submitted ? (
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white">
                  Thank You, QCSP Alumnus!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Your Alumni Information Sheet has been officially recorded in the Quezon City Scholar Tracer Database. We appreciate your continuous support as a QC Pride Alumni.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-left text-xs space-y-1 max-w-md mx-auto">
                <p className="font-bold text-slate-800 dark:text-slate-200">Submission Summary:</p>
                <p className="text-slate-600 dark:text-slate-400"><span className="font-semibold text-slate-800 dark:text-slate-200">Name:</span> {formData.fullName || 'Registered Scholar'}</p>
                <p className="text-slate-600 dark:text-slate-400"><span className="font-semibold text-slate-800 dark:text-slate-200">Batch:</span> {formData.batchYear} • {formData.course}</p>
                <p className="text-slate-600 dark:text-slate-400"><span className="font-semibold text-slate-800 dark:text-slate-200">Status:</span> {formData.employmentStatus} at {formData.employer || 'N/A'}</p>
              </div>

              <div className="pt-2">
                <Button variant="primary" size="md" onClick={handleReset} className="font-bold px-6">
                  Close & Return
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 rounded-2xl text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
                <Award className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  This Information Sheet helps the Quezon City Local Government monitor alumni career trajectories, measure scholarship impact, and invite graduates to QCSP networking events.
                </p>
              </div>

              {/* Personal & Academic Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">1. Personal & Academic Info</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Maria Santos"
                      className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Graduation / Batch Year *</label>
                    <select
                      value={formData.batchYear}
                      onChange={(e) => setFormData({ ...formData, batchYear: e.target.value })}
                      className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 shadow-xs"
                    >
                      {['2025', '2024', '2023', '2022', '2021', '2020', 'Prior to 2020'].map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Course / Degree Completed *</label>
                    <input
                      type="text"
                      required
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      placeholder="e.g. BS Information Technology"
                      className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Graduating University *</label>
                    <select
                      value={formData.university}
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                      className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 shadow-xs"
                    >
                      <option value="Quezon City University (QCU)">Quezon City University (QCU)</option>
                      <option value="University of the Philippines Diliman">University of the Philippines Diliman</option>
                      <option value="Polytechnic University of the Philippines">Polytechnic University of the Philippines</option>
                      <option value="Technological University of the Philippines">Technological University of the Philippines</option>
                      <option value="Other Quezon City College/University">Other QC Institution</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Employment Tracer Details */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">2. Current Employment Tracer</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Employment Status *</label>
                    <select
                      value={formData.employmentStatus}
                      onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                      className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 shadow-xs"
                    >
                      <option value="Employed">Employed (Full-Time / Part-Time)</option>
                      <option value="Self-Employed / Entrepreneur">Self-Employed / Business Owner</option>
                      <option value="Pursuing Higher Studies">Pursuing Master's / Law / Higher Studies</option>
                      <option value="Seeking Employment">Seeking Job Opportunities</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Current Job Title / Position</label>
                    <input
                      type="text"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      placeholder="e.g. Software Engineer / Data Analyst"
                      className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Employer / Company Name</label>
                    <input
                      type="text"
                      value={formData.employer}
                      onChange={(e) => setFormData({ ...formData, employer: e.target.value })}
                      placeholder="e.g. Globe Telecom / QC LGU"
                      className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Monthly Salary Range</label>
                    <select
                      value={formData.monthlyIncome}
                      onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                      className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 shadow-xs"
                    >
                      <option value="Below ₱20,000">Below ₱20,000</option>
                      <option value="₱20,000 - ₱35,000">₱20,000 - ₱35,000</option>
                      <option value="₱35,000 - ₱50,000">₱35,000 - ₱50,000</option>
                      <option value="Above ₱50,000">Above ₱50,000</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">3. Contact Updates & Testimonial</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="alumni@gmail.com"
                      className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0917 123 4567"
                      className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 text-xs mb-1">QCSP Message / Feedback for Future Scholars</label>
                  <textarea
                    rows={2}
                    value={formData.testimonial}
                    onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                    placeholder="Share how QCSP supported your college journey..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 shadow-xs resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" size="md" onClick={onClose} className="font-bold">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md" disabled={isSubmitting} className="font-extrabold px-6">
                  {isSubmitting ? 'Submitting...' : 'Submit Information Sheet →'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
