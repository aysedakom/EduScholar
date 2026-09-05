import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, User, GraduationCap, MapPin, PhoneCall, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { INSTALLED_DEPARTMENTS } from '../../utils/departments';
import { ACADEMIC_COURSES_BY_CATEGORY } from '../../utils/courses';
import { PhoneInput } from '../../components/ui/PhoneInput';
import { formatPHMobile, isValidPHMobile } from '../../utils/phoneFormatter';
import { toast } from 'sonner';
import type { BasicProfile } from '../../types';

export const BasicFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, saveBasicProfile } = useAuth();

  const existingProfile = user?.basicProfile;

  const [form, setForm] = useState<BasicProfile>({
    studentId: existingProfile?.studentId || user?.studentId || '',
    fullName: existingProfile?.fullName || user?.name || '',
    email: existingProfile?.email || user?.email || '',
    phone: formatPHMobile(existingProfile?.phone || user?.phone || ''),
    department: existingProfile?.department || user?.department || '',
    major: existingProfile?.major || user?.major || '',
    yearLevel: existingProfile?.yearLevel || '',
    gpa: existingProfile?.gpa || (user?.gpa ? String(user.gpa) : ''),
    barangay: existingProfile?.barangay || user?.barangay || '',
    address: existingProfile?.address || user?.address || '',
    householdIncome: existingProfile?.householdIncome || '',
    emergencyContactName: existingProfile?.emergencyContactName || '',
    emergencyContactPhone: formatPHMobile(existingProfile?.emergencyContactPhone || ''),
  });

  const [isLoading, setIsLoading] = useState(false);

  const update = (key: keyof BasicProfile, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidPHMobile(form.phone)) {
      toast.error('Please enter a valid 10-digit Philippine mobile number (e.g. +63 917 123 4567).');
      return;
    }

    if (form.emergencyContactPhone && !isValidPHMobile(form.emergencyContactPhone)) {
      toast.error('Emergency contact number must be a valid 10-digit Philippine phone number.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      saveBasicProfile({
        ...form,
        completedAt: new Date().toISOString(),
      });
      setIsLoading(false);
      navigate('/dashboard');
    }, 500);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-6 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-64 h-64" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="md" className="bg-blue-500/20 text-blue-200 border-blue-400/30">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" /> New Applicant Onboarding
            </Badge>
            <Badge variant="warning" size="md" className="bg-amber-500/20 text-amber-200 border-amber-400/30">
              Fill Once Only
            </Badge>
          </div>
          <h1 className="font-heading text-3xl font-extrabold text-white tracking-tight">
            Student Basic Profile Onboarding
          </h1>
          <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
            Fill in your basic information once. EduScholar AI will automatically link these details to all your future <strong>Scholarship</strong> and <strong>Educational Grant</strong> applications so you won't need to re-type them!
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal & Identification */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" /> Personal Details
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Your legal name and contact details as registered in the university system.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="fullName"
                label="Full Legal Name"
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                placeholder="Juan Dela Cruz"
                required
              />
              <Input
                id="studentId"
                label="Student ID Number"
                value={form.studentId}
                onChange={(e) => update('studentId', e.target.value)}
                placeholder="e.g. 2026-10492 / Student ID"
                required
              />
              <Input
                id="email"
                label="Primary Email Address"
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="student@university.edu.ph"
                required
              />
              <PhoneInput
                id="phone"
                label="Mobile Phone Number"
                value={form.phone}
                onChange={(val) => update('phone', val)}
                required
                helperText="Limits to 10 digits after +63 (e.g. +63 9XX XXX XXXX)"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Academic Record */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
              <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Academic Details
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Your current course, department, and academic standing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Beneficiary College / Department *</label>
                <select
                  value={form.department}
                  onChange={(e) => update('department', e.target.value)}
                  className="w-full h-11 px-4 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 cursor-pointer"
                  required
                >
                  <option value="">-- Select Beneficiary Department / College --</option>
                  {INSTALLED_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept} className="dark:bg-slate-900 dark:text-white">
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Course / Academic Strand *</label>
                <select
                  id="major"
                  value={form.major}
                  onChange={(e) => update('major', e.target.value)}
                  className="w-full h-11 px-4 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 cursor-pointer"
                  required
                >
                  <option value="">-- Select Course / Academic Strand --</option>
                  {ACADEMIC_COURSES_BY_CATEGORY.map((group) => (
                    <optgroup key={group.category} label={group.category}>
                      {group.courses.map((c) => (
                        <option key={c} value={c} className="dark:bg-slate-900 dark:text-white">
                          {c}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Year Level</label>
                <select
                  value={form.yearLevel}
                  onChange={(e) => update('yearLevel', e.target.value)}
                  className="w-full h-11 px-4 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900"
                >
                  <option value="">-- Select Year Level --</option>
                  <option value="1st Year" className="dark:bg-slate-900 dark:text-white">1st Year (Freshman)</option>
                  <option value="2nd Year" className="dark:bg-slate-900 dark:text-white">2nd Year (Sophomore)</option>
                  <option value="3rd Year" className="dark:bg-slate-900 dark:text-white">3rd Year (Junior)</option>
                  <option value="4th Year" className="dark:bg-slate-900 dark:text-white">4th Year (Senior)</option>
                  <option value="Graduate / Post-Grad" className="dark:bg-slate-900 dark:text-white">Graduate / Post-Grad</option>
                </select>
              </div>
              <Input
                id="gpa"
                label="Cumulative GWA / GPA"
                value={form.gpa}
                onChange={(e) => update('gpa', e.target.value)}
                placeholder="e.g. 1.50 or 92.5"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Socioeconomic & Emergency */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
              <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> Residency & Emergency Contact
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Barangay residency details for Quezon City school aid distribution.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="barangay"
                label="QC Barangay"
                value={form.barangay}
                onChange={(e) => update('barangay', e.target.value)}
                placeholder="e.g. Barangay Batasan Hills"
                required
              />
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Household Annual Income</label>
                <select
                  value={form.householdIncome}
                  onChange={(e) => update('householdIncome', e.target.value)}
                  className="w-full h-11 px-4 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900"
                >
                  <option value="">-- Select Household Income Bracket --</option>
                  <option value="Under ₱150,000 / year" className="dark:bg-slate-900 dark:text-white">Under ₱150,000 / year (Priority Need)</option>
                  <option value="₱150,000 - ₱300,000 / year" className="dark:bg-slate-900 dark:text-white">₱150,000 - ₱300,000 / year</option>
                  <option value="₱300,000 - ₱500,000 / year" className="dark:bg-slate-900 dark:text-white">₱300,000 - ₱500,000 / year</option>
                  <option value="Above ₱500,000 / year" className="dark:bg-slate-900 dark:text-white">Above ₱500,000 / year</option>
                </select>
              </div>
            </div>

            <Input
              id="address"
              label="Complete Home Address"
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              placeholder="e.g. 142 Commonwealth Avenue, Barangay Batasan Hills, Quezon City"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <Input
                id="emergencyContactName"
                label="Emergency Contact Person & Relationship"
                value={form.emergencyContactName}
                onChange={(e) => update('emergencyContactName', e.target.value)}
                placeholder="e.g. Elena Santos (Mother)"
                leftIcon={<PhoneCall className="h-4 w-4 text-slate-400" />}
              />
              <PhoneInput
                id="emergencyContactPhone"
                label="Emergency Contact Phone"
                value={form.emergencyContactPhone}
                onChange={(val) => update('emergencyContactPhone', val)}
                helperText="Limits to 10 digits after +63"
              />
            </div>
          </CardContent>
          <CardFooter className="justify-between bg-slate-50/50 p-6 rounded-b-3xl">
            <p className="text-xs text-slate-500 font-medium">
              ✨ Linked automatically to all scholarship and educational grant application forms.
            </p>
            <Button type="submit" size="lg" isLoading={isLoading} className="font-bold bg-blue-600 hover:bg-blue-700">
              <CheckCircle2 className="h-4 w-4 mr-2" /> Save & Proceed to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default BasicFormPage;
