import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Clock, CheckCircle2, XCircle, AlertCircle, 
  Search, Plus, MapPin
} from 'lucide-react';
import { 
  getWorkStudyJobs, getWorkStudyLogs, submitWorkStudyLog, 
  updateWorkStudyLogStatus 
} from '../api/workStudy';
import type { WorkStudyJob, WorkStudyLog } from '../api/workStudy';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { formatCurrency, formatDate } from '../utils/cn';

export const WorkStudyPage: React.FC = () => {
  const { user } = useAuth();
  const isSupervisor = user?.role === 'supervisor' || user?.role === 'admin' || user?.role === 'system_admin';

  const [activeTab, setActiveTab] = useState<'jobs' | 'logs'>('jobs');
  const [jobs, setJobs] = useState<WorkStudyJob[]>([]);
  const [logs, setLogs] = useState<WorkStudyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  // Job Detail & Application Modal
  const [selectedJob, setSelectedJob] = useState<WorkStudyJob | null>(null);
  
  // New Time Log Modal
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logForm, setLogForm] = useState({
    job_id: '',
    work_date: new Date().toISOString().split('T')[0],
    clock_in: '08:00',
    clock_out: '12:00',
    hours_logged: 4,
    tasks_completed: '',
  });
  const [submittingLog, setSubmittingLog] = useState(false);
  const [logSuccessMessage, setLogSuccessMessage] = useState('');

  // Supervisor Action Modal
  const [selectedLog, setSelectedLog] = useState<WorkStudyLog | null>(null);
  const [supervisorRemarks, setSupervisorRemarks] = useState('');
  const [updatingLog, setUpdatingLog] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobsData, logsData] = await Promise.all([
        getWorkStudyJobs(),
        getWorkStudyLogs(),
      ]);
      setJobs(jobsData || []);
      setLogs(logsData || []);
    } catch (err) {
      console.error('Failed to load work-study data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Compute calculated hours automatically when clock_in or clock_out changes
  const handleTimeChange = (field: 'clock_in' | 'clock_out', value: string) => {
    const updated = { ...logForm, [field]: value };
    if (updated.clock_in && updated.clock_out) {
      const [h1, m1] = updated.clock_in.split(':').map(Number);
      const [h2, m2] = updated.clock_out.split(':').map(Number);
      const start = h1 * 60 + m1;
      const end = h2 * 60 + m2;
      if (end > start) {
        const diff = (end - start) / 60;
        updated.hours_logged = Number(diff.toFixed(2));
      }
    }
    setLogForm(updated);
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logForm.job_id || !logForm.tasks_completed) return;
    setSubmittingLog(true);
    setLogSuccessMessage('');
    try {
      await submitWorkStudyLog({
        job_id: logForm.job_id,
        work_date: logForm.work_date,
        clock_in: logForm.clock_in,
        clock_out: logForm.clock_out,
        hours_logged: logForm.hours_logged,
        tasks_completed: logForm.tasks_completed,
      });
      setLogSuccessMessage('Work-study time log submitted successfully for supervisor approval!');
      setIsLogModalOpen(false);
      setLogForm({
        job_id: '',
        work_date: new Date().toISOString().split('T')[0],
        clock_in: '08:00',
        clock_out: '12:00',
        hours_logged: 4,
        tasks_completed: '',
      });
      loadData();
    } catch (err) {
      console.error('Failed to submit log:', err);
    } finally {
      setSubmittingLog(false);
    }
  };

  const handleStatusUpdate = async (status: 'Approved' | 'Rejected') => {
    if (!selectedLog) return;
    setUpdatingLog(true);
    try {
      await updateWorkStudyLogStatus(selectedLog.id, status, supervisorRemarks);
      setSelectedLog(null);
      setSupervisorRemarks('');
      loadData();
    } catch (err) {
      console.error('Failed to update log status:', err);
    } finally {
      setUpdatingLog(false);
    }
  };

  const departments = ['All', ...Array.from(new Set(jobs.map((j) => j.department)))];

  const filteredJobs = jobs.filter((j) => {
    const matchesDept = selectedDept === 'All' || j.department === selectedDept;
    const matchesSearch =
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const totalApprovedHours = logs
    .filter((l) => l.status === 'Approved')
    .reduce((sum, l) => sum + Number(l.hours_logged || 0), 0);

  const totalApprovedPayroll = logs
    .filter((l) => l.status === 'Approved')
    .reduce((sum, l) => sum + Number(l.hours_logged || 0) * Number(l.hourly_rate || 120), 0);

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold mb-2">
              <Briefcase className="w-3.5 h-3.5" /> QC Campus Aid Work-Study Program
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Work-Study Opportunities & Time Logs</h1>
            <p className="text-blue-100/80 text-sm mt-1 max-w-2xl">
              Earn competitive hourly stipends while building hands-on professional experience on campus. Log your daily work hours for supervisor verification.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsLogModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg hover:shadow-emerald-900/40"
            >
              <Plus className="w-4 h-4 mr-2" /> Log Work Hours
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
            <div className="text-xs text-blue-200 font-medium">Available Positions</div>
            <div className="text-2xl font-bold text-white mt-1">{jobs.length} Positions</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
            <div className="text-xs text-blue-200 font-medium">Avg Hourly Rate</div>
            <div className="text-2xl font-bold text-amber-300 mt-1">₱120.00 / hr</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
            <div className="text-xs text-blue-200 font-medium">Approved Student Hours</div>
            <div className="text-2xl font-bold text-emerald-300 mt-1">{totalApprovedHours.toFixed(1)} hrs</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
            <div className="text-xs text-blue-200 font-medium">Total Earned Payroll</div>
            <div className="text-2xl font-bold text-cyan-300 mt-1">{formatCurrency(totalApprovedPayroll)}</div>
          </div>
        </div>
      </div>

      {logSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-medium">{logSuccessMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-xl p-1 shadow-sm">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'jobs'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Briefcase className="w-4 h-4" /> Available Campus Jobs ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'logs'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Clock className="w-4 h-4" /> Time Logs & Payroll Verification ({logs.length})
        </button>
      </div>

      {/* TAB 1: AVAILABLE JOBS */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search job title, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-gray-500 uppercase">Department:</span>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="py-2 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Job Grid */}
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading available positions...</div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-gray-100">
              <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm font-medium">No work-study positions found matching your filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow border-gray-200 flex flex-col justify-between">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Badge variant="outline" className="mb-2 bg-blue-50 text-blue-700 border-blue-200">
                          {job.department}
                        </Badge>
                        <CardTitle className="text-lg font-bold text-gray-900">{job.title}</CardTitle>
                      </div>
                      <span className="text-lg font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                        ₱{Number(job.hourly_rate).toFixed(2)}/hr
                      </span>
                    </div>
                    <CardDescription className="text-xs text-gray-500 flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" /> Max {job.max_hours_per_week} hrs/wk
                      </span>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">{job.description}</p>
                    
                    <div className="pt-2 border-t border-gray-100 text-xs flex items-center justify-between text-gray-500">
                      <span>Supervisor: <strong className="text-gray-700">{job.supervisor_name}</strong></span>
                      <span className="font-semibold text-blue-600">
                        {job.slots_filled} / {job.slots_available} Slots Filled
                      </span>
                    </div>
                  </CardContent>

                  <div className="p-4 bg-gray-50 border-t border-gray-100 rounded-b-xl flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedJob(job)}
                    >
                      View Position Details
                    </Button>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-500 text-white"
                      onClick={() => {
                        setLogForm({ ...logForm, job_id: String(job.id) });
                        setIsLogModalOpen(true);
                      }}
                    >
                      Log Hours for this Job
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TIME LOGS & PAYROLL VERIFICATION */}
      {activeTab === 'logs' && (
        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">Student Work Hours Audit Trail</CardTitle>
                <CardDescription className="text-xs text-gray-500 mt-0.5">
                  Real-time clock-in records verified by department supervisors for bi-weekly stipend payout.
                </CardDescription>
              </div>
              <Button
                onClick={() => setIsLogModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Submit New Time Log
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center text-gray-500 text-sm">Loading work logs...</div>
            ) : logs.length === 0 ? (
              <div className="p-12 text-center text-gray-500 text-sm">
                No time logs recorded yet. Click "Submit New Time Log" above to record your work hours.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600 border-collapse">
                  <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Log Ref</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Job Title & Dept</th>
                      <th className="py-3 px-4">Work Date</th>
                      <th className="py-3 px-4">Hours</th>
                      <th className="py-3 px-4">Est. Pay</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {logs.map((log) => {
                      const pay = Number(log.hours_logged || 0) * Number(log.hourly_rate || 120);
                      return (
                        <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-blue-700">{log.log_code || `#${log.id}`}</td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-gray-900">{log.student_name || user?.name}</div>
                            <div className="text-[10px] text-gray-400">{log.student_email || user?.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-800">{log.job_title || 'Campus Technical Assistant'}</div>
                            <div className="text-[10px] text-gray-400">{log.job_department || 'University Library'}</div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-medium">{formatDate(log.work_date)}</div>
                            <div className="text-[10px] text-gray-400">{log.clock_in} - {log.clock_out}</div>
                          </td>
                          <td className="py-3 px-4 font-bold text-gray-900">{log.hours_logged} hrs</td>
                          <td className="py-3 px-4 font-extrabold text-emerald-700">{formatCurrency(pay)}</td>
                          <td className="py-3 px-4">
                            {log.status === 'Approved' ? (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
                              </Badge>
                            ) : log.status === 'Rejected' ? (
                              <Badge className="bg-rose-100 text-rose-800 border-rose-300">
                                <XCircle className="w-3 h-3 mr-1" /> Rejected
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                                <AlertCircle className="w-3 h-3 mr-1" /> Pending Verification
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {isSupervisor && log.status === 'Pending Approval' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
                                onClick={() => setSelectedLog(log)}
                              >
                                Verify & Approve
                              </Button>
                            ) : (
                              <span className="text-[11px] text-gray-400 italic">
                                {log.status === 'Approved' ? 'Verified' : 'Under Review'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* MODAL 1: SUBMIT TIME LOG */}
      {isLogModalOpen && (
        <Modal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} title="Log Work-Study Hours">
          <form onSubmit={handleLogSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Select Work Position</label>
              <select
                required
                value={logForm.job_id}
                onChange={(e) => setLogForm({ ...logForm, job_id: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose Job --</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.department}) — ₱{j.hourly_rate}/hr
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={logForm.work_date}
                  onChange={(e) => setLogForm({ ...logForm, work_date: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Clock In</label>
                <input
                  type="time"
                  required
                  value={logForm.clock_in}
                  onChange={(e) => handleTimeChange('clock_in', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Clock Out</label>
                <input
                  type="time"
                  required
                  value={logForm.clock_out}
                  onChange={(e) => handleTimeChange('clock_out', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs flex justify-between items-center text-blue-900 font-medium">
              <span>Calculated Net Hours: <strong>{logForm.hours_logged} hrs</strong></span>
              <span>Est. Payout: <strong>₱{(logForm.hours_logged * 120).toFixed(2)}</strong></span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Tasks Completed / Deliverables</label>
              <textarea
                required
                rows={3}
                placeholder="Describe work completed (e.g. cataloged 45 new library reference books, assisted lab students with C++ setup)..."
                value={logForm.tasks_completed}
                onChange={(e) => setLogForm({ ...logForm, tasks_completed: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" type="button" onClick={() => setIsLogModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submittingLog} className="bg-blue-600 hover:bg-blue-500 text-white">
                {submittingLog ? 'Submitting...' : 'Submit Log for Verification'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: JOB DETAILS */}
      {selectedJob && (
        <Modal isOpen={Boolean(selectedJob)} onClose={() => setSelectedJob(null)} title={selectedJob.title}>
          <div className="space-y-4 text-xs text-gray-700">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex justify-between items-center">
              <div>
                <span className="font-semibold text-gray-900">{selectedJob.department}</span>
                <div className="text-gray-500">{selectedJob.location}</div>
              </div>
              <div className="text-right">
                <span className="text-lg font-extrabold text-emerald-600">₱{selectedJob.hourly_rate}/hr</span>
                <div className="text-gray-500">Max {selectedJob.max_hours_per_week} hrs/wk</div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 uppercase tracking-wider mb-1 text-[11px]">Position Description</h4>
              <p className="leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">{selectedJob.description}</p>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 uppercase tracking-wider mb-1 text-[11px]">Supervisor Contact</h4>
              <p className="font-medium text-gray-800">{selectedJob.supervisor_name} ({selectedJob.supervisor_email})</p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button variant="outline" onClick={() => setSelectedJob(null)}>
                Close
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-500 text-white"
                onClick={() => {
                  const jobToLog = selectedJob;
                  setSelectedJob(null);
                  setLogForm({ ...logForm, job_id: String(jobToLog.id) });
                  setIsLogModalOpen(true);
                }}
              >
                Log Work Hours
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: SUPERVISOR APPROVAL */}
      {selectedLog && (
        <Modal isOpen={Boolean(selectedLog)} onClose={() => setSelectedLog(null)} title="Supervisor Time Log Verification">
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="font-bold text-gray-900 text-sm">{selectedLog.student_name || 'Student'}</div>
              <div className="text-gray-500">{selectedLog.job_title} — {selectedLog.job_department}</div>
              <div className="mt-2 text-blue-700 font-semibold">
                Date: {formatDate(selectedLog.work_date)} ({selectedLog.clock_in} - {selectedLog.clock_out}) — <strong>{selectedLog.hours_logged} hrs</strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Tasks Completed</label>
              <p className="p-2.5 bg-white border border-gray-200 rounded-lg text-gray-700">{selectedLog.tasks_completed}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Supervisor Remarks / Verification Notes</label>
              <textarea
                rows={2}
                placeholder="Optional comments for student or payroll record..."
                value={supervisorRemarks}
                onChange={(e) => setSupervisorRemarks(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button
                variant="outline"
                className="border-rose-300 text-rose-700 hover:bg-rose-50"
                disabled={updatingLog}
                onClick={() => handleStatusUpdate('Rejected')}
              >
                Reject Log
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                disabled={updatingLog}
                onClick={() => handleStatusUpdate('Approved')}
              >
                Approve Hours & Payout
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default WorkStudyPage;
