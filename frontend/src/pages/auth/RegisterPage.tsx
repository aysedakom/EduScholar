import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, UserRound, ArrowLeft, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { AuthBrandPanel } from '../../components/shared/AuthBrandPanel';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || form.password !== form.confirm) {
      setError(form.password !== form.confirm ? 'Passwords do not match.' : 'Please complete all required fields.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const res = await register(form.name, form.email, form.password, 'student');
      if (res.success) {
        toast.success('Registration successful! Activating your account...');
        if (res.devVerifyUrl) {
          const pathOnly = res.devVerifyUrl.replace(/^https?:\/\/[^\/]+/, '');
          navigate(pathOnly, { replace: true });
        } else {
          const verifyUrl = `/verify-email?email=${encodeURIComponent(form.email)}${
            redirectParam ? `&redirect=${encodeURIComponent(redirectParam)}` : ''
          }`;
          navigate(verifyUrl, { replace: true });
        }
      } else {
        setError(res.message || 'Unable to create your account.');
      }
    } catch {
      setError('Unable to create your account. Email may already be in use.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans relative">
      <AuthBrandPanel />
      
      {/* Right Side Container */}
      <div className="flex w-full flex-col items-center justify-center p-4 md:w-1/2 md:p-10">
        
        {/* Top Back to Home Navigation */}
        <div className="w-full max-w-md mb-3 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-slate-700 hover:text-blue-600 hover:bg-blue-50 text-xs font-extrabold shadow-sm border border-slate-200/80 transition-all cursor-pointer group"
          >
            <ArrowLeft className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Card */}
        <div className="w-full max-w-md rounded-2xl bg-white p-8 md:p-10 shadow-xl border border-slate-100/50 space-y-6">
          
          {/* Header */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Sparkles className="h-3 w-3" />
              <span>Student Registration</span>
            </div>
            <h2 className="font-heading text-2xl font-bold text-slate-900">Create Account</h2>
            <p className="text-xs text-slate-500">
              Register your student applicant portal account. A verification link will be sent to your email to activate your account.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700 space-y-1.5 leading-relaxed">
              <p>{error}</p>
              {(error.includes('already') || error.includes('exists') || error.includes('sign in')) && (
                <div className="pt-1 flex items-center gap-3">
                  <Link
                    to={`/login?email=${encodeURIComponent(form.email)}`}
                    className="font-bold underline text-blue-700 hover:text-blue-900 cursor-pointer"
                  >
                    Go to Sign In →
                  </Link>
                  {(error.includes('awaiting') || error.includes('authorization') || error.includes('verification')) && (
                    <Link
                      to={`/verify-email?email=${encodeURIComponent(form.email)}`}
                      className="font-bold underline text-indigo-700 hover:text-indigo-900 cursor-pointer"
                    >
                      Verify Email →
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit} className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-[10px] font-bold tracking-wider uppercase text-slate-400">
                Full Name
              </label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="e.g. Juan Dela Cruz"
                leftIcon={<UserRound className="h-4 w-4 text-slate-400" />}
                className="bg-[#EEF2F6] border-none shadow-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-slate-800 rounded-xl h-11"
                required
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-[10px] font-bold tracking-wider uppercase text-slate-400">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="student@university.edu"
                leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
                className="bg-[#EEF2F6] border-none shadow-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-slate-800 rounded-xl h-11"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-[10px] font-bold tracking-wider uppercase text-slate-400">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={show ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="••••••••••••"
                  leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                  className="bg-[#EEF2F6] border-none shadow-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-slate-800 rounded-xl h-11 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                  title={show ? 'Hide Password' : 'Show Password'}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirm" className="block text-[10px] font-bold tracking-wider uppercase text-slate-400">
                Confirm Password
              </label>
              <Input
                id="confirm"
                type="password"
                value={form.confirm}
                onChange={(e) => update('confirm', e.target.value)}
                placeholder="••••••••••••"
                className="bg-[#EEF2F6] border-none shadow-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-slate-800 rounded-xl h-11"
                required
              />
            </div>

            {/* Terms Agreement Checkbox */}
            <label className="flex items-start gap-2 text-xs font-semibold text-slate-650 cursor-pointer select-none py-1">
              <input
                type="checkbox"
                required
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
              />
              <span>I agree to Campus Aid Hub terms of service and privacy policy.</span>
            </label>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold border-none shadow-xs transition-all cursor-pointer flex items-center justify-center"
              >
                Register & Proceed to Sign In
              </Button>
            </div>
          </form>
        </div>

        {/* Subtle Sign In link below card */}
        <div className="text-center text-xs text-slate-400 mt-5">
          Already have an account?{' '}
          <Link
            to={redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : '/login'}
            className="font-bold text-blue-600 hover:text-blue-750 hover:underline"
          >
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
