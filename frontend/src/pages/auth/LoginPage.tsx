import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowLeft, ShieldCheck, RefreshCw, CheckCircle2, ArrowRight, Sparkles, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { AuthBrandPanel } from '../../components/shared/AuthBrandPanel';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import type { UserRole } from '../../types';

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const registeredParam = searchParams.get('registered') === 'true';
  const emailParam = searchParams.get('email') || '';

  // Stages: 'credentials' | 'otp'
  const [stage, setStage] = useState<'credentials' | 'otp'>('credentials');
  
  const [email, setEmail] = useState(emailParam || 'student@university.edu');
  const [password, setPassword] = useState(emailParam ? '' : 'password123');
  const [show, setShow] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 6-digit OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [countdown, setCountdown] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const { loginRequest, verifyOtp, resendOtp, login } = useAuth();
  const navigate = useNavigate();

  // Handle prefilled email and role deduction
  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
      handleEmailChange(emailParam);
    }
  }, [emailParam]);

  // Countdown timer for Resend OTP
  useEffect(() => {
    let timer: any;
    if (stage === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [stage, countdown]);

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    const emailLower = newEmail.toLowerCase().trim();
    if (emailLower.includes('sysadmin') || emailLower.startsWith('sysadmin@')) {
      setSelectedRole('system_admin');
    } else if (emailLower === 'support.edu2026@gmail.com' || emailLower.includes('admin') || emailLower.startsWith('admin@')) {
      setSelectedRole('admin');
    } else if (emailLower.includes('supervisor') || emailLower.startsWith('supervisor@')) {
      setSelectedRole('supervisor');
    } else if (emailLower.includes('school') || emailLower.startsWith('school@')) {
      setSelectedRole('school_coordinator');
    } else if (emailLower.includes('treasury') || emailLower.startsWith('treasury@')) {
      setSelectedRole('treasury');
    } else {
      setSelectedRole('student');
    }
  };

  const getRoleFromEmail = (targetEmail: string): UserRole => {
    const emailLower = targetEmail.toLowerCase().trim();
    if (emailLower.includes('sysadmin') || emailLower.startsWith('sysadmin@')) return 'system_admin';
    if (emailLower === 'support.edu2026@gmail.com' || emailLower.includes('admin') || emailLower.startsWith('admin@')) return 'admin';
    if (emailLower.includes('supervisor') || emailLower.startsWith('supervisor@')) return 'supervisor';
    if (emailLower.includes('school') || emailLower.startsWith('school@')) return 'school_coordinator';
    if (emailLower.includes('treasury') || emailLower.startsWith('treasury@')) return 'treasury';
    return selectedRole || 'student';
  };

  const navigateAfterLogin = (roleToUse: UserRole) => {
    if (roleToUse === 'admin') {
      navigate('/dashboard', { replace: true });
    } else if (roleToUse === 'system_admin') {
      navigate('/admin/super', { replace: true });
    } else if (roleToUse === 'supervisor' || roleToUse === 'school_coordinator' || roleToUse === 'treasury') {
      navigate('/dashboard', { replace: true });
    } else if (redirectParam && redirectParam !== '/education-scholarship') {
      navigate(redirectParam, { replace: true });
    } else {
      navigate('/education-scholarship', { replace: true });
    }
  };

  // Stage 1: Validate credentials & request OTP
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email address and password.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const result = await loginRequest(email, password);
      if (result.requireOtp) {
        setStage('otp');
        if (result.devOtp) {
          setDevOtp(result.devOtp);
        }
        setOtpDigits(['', '', '', '', '', '']);
        setCountdown(60);
        setCanResend(false);
        toast.success(`Verification code dispatched to ${email}!`);
        // Focus first OTP digit
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      } else {
        // Fallback or direct token issued
        const roleToUse = getRoleFromEmail(email);
        toast.success(`Signed in successfully as ${roleToUse.toUpperCase().replace('_', ' ')}!`);
        navigateAfterLogin(roleToUse);
      }
    } catch (err: any) {
      const isUnverified = err.message?.includes('verify') || err.message?.includes('verification') || err.message?.includes('not yet authorized') || err.message?.includes('authorize') || err?.response?.data?.requireEmailVerification;
      if (isUnverified) {
        setError('Your account is not verified yet. Please click the verification button in the email we sent you before signing in.');
        toast.error('Email not verified yet.', {
          action: {
            label: 'Verify Email',
            onClick: () => navigate(`/verify-email?email=${encodeURIComponent(email)}`),
          },
        });
        return;
      }
      const roleToUse = getRoleFromEmail(email);
      const isDemoAccount = email.includes('student@') || email.includes('admin@') || email.includes('demo');
      if (isDemoAccount && (err.message?.includes('connect') || err.message?.includes('Network Error'))) {
        await login(email, password, roleToUse);
        toast.info('Signed in using demo offline mode.');
        navigateAfterLogin(roleToUse);
        return;
      }
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  // Stage 2: OTP Digit Handling
  const handleOtpDigitChange = (index: number, value: string) => {
    // Check if user pasted multiple digits
    if (value.length > 1) {
      const cleanDigits = value.replace(/\D/g, '').slice(0, 6).split('');
      if (cleanDigits.length > 0) {
        const nextOtp = [...otpDigits];
        cleanDigits.forEach((digit, i) => {
          if (i < 6) nextOtp[i] = digit;
        });
        setOtpDigits(nextOtp);
        const nextFocusIndex = Math.min(cleanDigits.length, 5);
        otpInputRefs.current[nextFocusIndex]?.focus();
        return;
      }
    }

    const digit = value.replace(/\D/g, '').slice(-1);
    const nextOtp = [...otpDigits];
    nextOtp[index] = digit;
    setOtpDigits(nextOtp);

    // Auto-advance to next input
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const nextOtp = [...otpDigits];
    pasted.split('').forEach((char, i) => {
      if (i < 6) nextOtp[i] = char;
    });
    setOtpDigits(nextOtp);
    const nextFocusIndex = Math.min(pasted.length, 5);
    otpInputRefs.current[nextFocusIndex]?.focus();
  };

  // Submit OTP Verification
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const roleToUse = getRoleFromEmail(email);
      await verifyOtp(email, fullOtp, roleToUse);
      toast.success(`Verification successful! Welcome back.`);
      navigateAfterLogin(roleToUse);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoFillOtp = (code: string) => {
    const clean = String(code || '').replace(/\D/g, '').slice(0, 6);
    if (clean.length === 6) {
      setOtpDigits(clean.split(''));
      setError('');
      toast.success('Verification code auto-filled! Click "Verify & Sign In".');
    }
  };

  const handleResendCode = async () => {
    if (!canResend || isResending) return;
    setIsResending(true);
    setError('');
    try {
      const res = await resendOtp(email, 'login');
      if (res.success) {
        setCountdown(60);
        setCanResend(false);
        if (res.devOtp) {
          setDevOtp(res.devOtp);
        }
        setOtpDigits(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
      }
    } finally {
      setIsResending(false);
    }
  };

  // Mask email for display in OTP stage (e.g. j***n@gmail.com)
  const maskEmail = (str: string) => {
    const [namePart, domainPart] = str.split('@');
    if (!domainPart) return str;
    if (namePart.length <= 2) return `${namePart[0]}*@${domainPart}`;
    return `${namePart[0]}${'*'.repeat(Math.max(namePart.length - 2, 2))}${namePart[namePart.length - 1]}@${domainPart}`;
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
          
          {/* Post-Registration Banner */}
          {registeredParam && stage === 'credentials' && (
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs flex items-start gap-2.5 shadow-xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Account created successfully!</p>
                <p className="text-emerald-700 text-[11px] mt-0.5">
                  Please enter your password to receive and verify your one-time email code.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 1: CREDENTIALS ENTRY */}
          {/* ========================================================================= */}
          {stage === 'credentials' && (
            <>
              {/* Header */}
              <div className="space-y-1">
                <h2 className="font-heading text-2xl font-bold text-slate-900">Welcome Back</h2>
                <p className="text-xs text-slate-500">
                  Sign in to access your student portal or coordinator workspace
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700 space-y-1.5">
                  <p>{error}</p>
                  {(error.includes('verified') || error.includes('authorized') || error.includes('verification')) && (
                    <button
                      type="button"
                      onClick={() => navigate(`/verify-email?email=${encodeURIComponent(email)}`)}
                      className="text-xs font-bold underline text-rose-800 hover:text-rose-950 cursor-pointer block pt-1"
                    >
                      Click here to Verify Email / Resend Link →
                    </button>
                  )}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                
                {/* Email Address */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-[10px] font-bold tracking-wider uppercase text-slate-400">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="student@university.edu"
                    leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
                    className="bg-[#EEF2F6] border-none shadow-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-slate-800 rounded-xl h-11"
                    required
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-[10px] font-bold tracking-wider uppercase text-slate-400">
                      Password
                    </label>
                    <Link to="/forgot-password" className="text-[11px] font-bold text-blue-600 hover:text-blue-750 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={show ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold border-none shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Verification</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>

              </form>
            </>
          )}

          {/* ========================================================================= */}
          {/* STAGE 2: 6-DIGIT EMAIL OTP VERIFICATION */}
          {/* ========================================================================= */}
          {stage === 'otp' && (
            <>
              {/* Header */}
              <div className="space-y-2 text-center">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200/60 shadow-xs">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h2 className="font-heading text-2xl font-bold text-slate-900">Enter Verification Code</h2>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  We sent a 6-digit OTP code to <strong className="text-slate-700">{maskEmail(email)}</strong>
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700 text-center">
                  {error}
                </div>
              )}

              {/* Instant Verification Code Helper Card */}
              {devOtp && (
                <div className="p-3.5 rounded-xl border border-blue-200 bg-linear-to-r from-blue-50/90 to-indigo-50/90 text-xs flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-blue-900">Your Verification Code:</p>
                      <p className="font-mono font-extrabold text-lg tracking-widest text-blue-700">{devOtp}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAutoFillOtp(devOtp)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Auto-fill</span>
                  </button>
                </div>
              )}

              {/* OTP Input Form */}
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                
                {/* 6 Digit Input Boxes */}
                <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={idx === 0 ? 6 : 1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={idx === 0 ? handleOtpPaste : undefined}
                      className="h-12 w-11 sm:w-12 text-center text-xl font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 outline-none transition-all"
                      autoComplete="one-time-code"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                {/* Resend OTP & Change Email info */}
                <div className="flex flex-col items-center gap-2 text-xs">
                  <div className="text-slate-400">
                    {countdown > 0 ? (
                      <span>Resend code in <strong className="text-slate-600">{countdown}s</strong></span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={isResending}
                        className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-750 hover:underline cursor-pointer"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${isResending ? 'animate-spin' : ''}`} />
                        <span>Resend verification code</span>
                      </button>
                    )}
                  </div>

                  <Link
                    to={`/forgot-password?email=${encodeURIComponent(email)}`}
                    className="text-blue-600 hover:text-blue-750 text-xs font-bold hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setStage('credentials');
                      setError('');
                    }}
                    className="text-slate-400 hover:text-slate-600 text-[11px] hover:underline cursor-pointer"
                  >
                    ← Use a different email address
                  </button>
                </div>

                {/* Verify Button */}
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold border-none shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Verify & Sign In</span>
                </Button>
              </form>
            </>
          )}

        </div>

        {/* Sign Up Link */}
        {stage === 'credentials' && (
          <div className="text-center text-xs text-slate-500 mt-4">
            Don't have an account yet?{' '}
            <Link
              to={redirectParam ? `/signup?redirect=${encodeURIComponent(redirectParam)}` : '/signup'}
              className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Create Account
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
