import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  KeyRound,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import * as authApi from '../../api/auth';
import { AuthBrandPanel } from '../../components/shared/AuthBrandPanel';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PasswordStrengthIndicator } from '../../components/common/PasswordStrengthIndicator';
import { validateStandardPassword } from '../../utils/passwordValidation';
import type { UserRole } from '../../types';

interface LoginPageProps {
  defaultView?: 'credentials' | 'forgot-password' | 'must-reset-password' | 'set-new-password';
}

export function LoginPage({ defaultView }: LoginPageProps = {}) {
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const registeredParam = searchParams.get('registered') === 'true';
  const emailParam = searchParams.get('email') || '';
  const tokenParam = searchParams.get('token') || '';
  const viewParam = searchParams.get('view');

  // Stages:
  // - 'credentials': Email & Password login
  // - 'otp': 6-digit OTP verification
  // - 'must-reset-password': Legacy password format redo prompt
  // - 'forgot-password': Request reset link
  // - 'forgot-success': Reset link email confirmation
  // - 'set-new-password': Set new password with token
  // - 'reset-success': Password update confirmation
  const [stage, setStage] = useState<
    'credentials' | 'otp' | 'must-reset-password' | 'forgot-password' | 'forgot-success' | 'set-new-password' | 'reset-success'
  >(() => {
    if (tokenParam || viewParam === 'reset-password' || viewParam === 'set-new-password') {
      return 'set-new-password';
    }
    if (defaultView) return defaultView;
    if (viewParam === 'forgot-password') return 'forgot-password';
    return 'credentials';
  });
  
  const [email, setEmail] = useState(emailParam || '');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [policyReason, setPolicyReason] = useState('');

  // Password Redo / Token Reset State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetError, setResetError] = useState('');

  // 6-digit OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [countdown, setCountdown] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);

  const { loginRequest, verifyOtp, resendOtp, updateLegacyPassword, resetPassword, login } = useAuth();
  const navigate = useNavigate();

  // Handle prefilled email and role deduction
  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
      handleEmailChange(emailParam);
    }
  }, [emailParam]);

  useEffect(() => {
    const tokenInUrl = searchParams.get('token');
    const viewInUrl = searchParams.get('view');
    if (tokenInUrl || viewInUrl === 'reset-password' || viewInUrl === 'set-new-password') {
      setStage('set-new-password');
    } else if (viewInUrl === 'forgot-password' || defaultView === 'forgot-password') {
      setStage('forgot-password');
    }
  }, [searchParams, defaultView]);

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
    } else if (emailLower === 'sv.edu2026@gmail.com' || emailLower.includes('supervisor') || emailLower.startsWith('supervisor@') || emailLower.startsWith('sv.')) {
      setSelectedRole('supervisor');
    } else if (emailLower === 'sr.edu2026@gmail.com' || emailLower.includes('school') || emailLower.startsWith('school@') || emailLower.startsWith('sr.')) {
      setSelectedRole('school_coordinator');
    } else if (emailLower === 'treasury.edu2026@gmail.com' || emailLower.includes('treasury') || emailLower.startsWith('treasury@')) {
      setSelectedRole('treasury');
    } else {
      setSelectedRole('student');
    }
  };

  const getRoleFromEmail = (targetEmail: string): UserRole => {
    const emailLower = targetEmail.toLowerCase().trim();
    if (emailLower.includes('sysadmin') || emailLower.startsWith('sysadmin@')) return 'system_admin';
    if (emailLower === 'support.edu2026@gmail.com' || emailLower.includes('admin') || emailLower.startsWith('admin@')) return 'admin';
    if (emailLower === 'sv.edu2026@gmail.com' || emailLower.includes('supervisor') || emailLower.startsWith('supervisor@') || emailLower.startsWith('sv.')) return 'supervisor';
    if (emailLower === 'sr.edu2026@gmail.com' || emailLower.includes('school') || emailLower.startsWith('school@') || emailLower.startsWith('sr.')) return 'school_coordinator';
    if (emailLower === 'treasury.edu2026@gmail.com' || emailLower.includes('treasury') || emailLower.startsWith('treasury@')) return 'treasury';
    return selectedRole || 'student';
  };

  const navigateAfterLogin = (roleToUse: UserRole) => {
    if (roleToUse === 'admin' || roleToUse === 'supervisor') {
      navigate('/admin/review-queue', { replace: true });
    } else if (roleToUse === 'system_admin') {
      navigate('/admin/super', { replace: true });
    } else if (roleToUse === 'treasury') {
      navigate('/treasury/reconciliation', { replace: true });
    } else if (roleToUse === 'school_coordinator') {
      navigate('/school/portal', { replace: true });
    } else if (redirectParam && redirectParam !== '/education-scholarship') {
      navigate(redirectParam, { replace: true });
    } else {
      navigate('/education-scholarship', { replace: true });
    }
  };

  // Stage 1: Validate credentials & request OTP or intercept legacy password format
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

      // Check if user has an old format password that needs to be redone
      if (result.requirePasswordReset || result.mustResetPassword) {
        setStage('must-reset-password');
        setPolicyReason(result.reason || 'Password must be at least 12 characters and include uppercase, lowercase, numeric, and symbol characters.');
        setResetError('');
        setNewPassword('');
        setConfirmPassword('');
        toast.info(result.message || 'Security Policy Update: Please create a new password meeting the updated security standard.', {
          duration: 7000,
        });
        return;
      }

      if (result.requireOtp) {
        setStage('otp');
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

  // Handler: Submit Legacy Password Redo (Update to new secure format & sign in)
  const handleLegacyPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (!newPassword) {
      setResetError('Please enter a new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    const validation = validateStandardPassword(newPassword, { email });
    if (!validation.isValid) {
      setResetError('Password must satisfy all standard security requirements (min 12 characters, uppercase, lowercase, numeric digit, and symbol).');
      return;
    }

    setIsLoading(true);
    try {
      await updateLegacyPassword(email, password, newPassword);
      const roleToUse = getRoleFromEmail(email);
      navigateAfterLogin(roleToUse);
    } catch (err: any) {
      setResetError(err.message || 'Failed to update password. Please check security requirements.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Submit Token Reset Password (from email reset link)
  const handleTokenResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    const tokenToUse = tokenParam || searchParams.get('token') || '';
    const emailToUse = email || searchParams.get('email') || '';

    if (!tokenToUse) {
      setResetError('Password reset token is missing. Please request a fresh reset link.');
      return;
    }

    if (!newPassword) {
      setResetError('Please enter your new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match. Please re-enter.');
      return;
    }

    const validation = validateStandardPassword(newPassword, { email: emailToUse });
    if (!validation.isValid) {
      setResetError('Password must satisfy all standard security requirements (min 12 characters, uppercase, lowercase, number, symbol).');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(tokenToUse, newPassword, emailToUse);
      setStage('reset-success');
    } catch (err: any) {
      setResetError(err.message || 'Failed to reset password. The link may be expired.');
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

  // Submit Forgot Password
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your registered email address.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await authApi.forgotPassword(email.toLowerCase().trim());
      toast.success('Password reset link has been dispatched to your email.');
      setStage('forgot-success');
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to send reset link. Please verify your email.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
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

  const handleResendCode = async () => {
    if (!canResend || isResending) return;
    setIsResending(true);
    setError('');
    try {
      const res = await resendOtp(email, 'login');
      if (res.success) {
        setCountdown(60);
        setCanResend(false);
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
      <div className="flex w-full flex-col items-center justify-center p-4 sm:p-6 md:w-1/2 md:p-10">
        
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
        <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 md:p-10 shadow-xl border border-slate-100/50 space-y-6">
          
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
              <form onSubmit={handleCredentialsSubmit} className="space-y-4" autoComplete="off">
                
                {/* Email Address */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-[10px] font-bold tracking-wider uppercase text-slate-400">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="login_email"
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="Enter your email address"
                    autoComplete="off"
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
                    <button
                      type="button"
                      onClick={() => {
                        setStage('forgot-password');
                        setError('');
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-750 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="login_password"
                      type={show ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="new-password"
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
                    <span>Sign In to Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </>
          )}

          {/* ========================================================================= */}
          {/* STAGE 2: INLINE FORGOT PASSWORD VIEW */}
          {/* ========================================================================= */}
          {stage === 'forgot-password' && (
            <>
              {/* Header */}
              <div className="space-y-1">
                <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60 shadow-xs mb-2">
                  <KeyRound className="h-5 w-5" />
                </div>
                <h2 className="font-heading text-2xl font-bold text-slate-900">Reset Password</h2>
                <p className="text-xs text-slate-500">
                  Enter your account email and we will send a password reset link to your inbox.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="forgot_email" className="block text-[10px] font-bold tracking-wider uppercase text-slate-400">
                    Registered Email Address
                  </label>
                  <Input
                    id="forgot_email"
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="e.g. yourname@example.com"
                    leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
                    className="bg-[#EEF2F6] border-none shadow-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-slate-800 rounded-xl h-11"
                    required
                    autoFocus
                  />
                </div>

                <div className="pt-2 space-y-3">
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold border-none shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Send Password Reset Link</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setStage('credentials');
                      setError('');
                    }}
                    className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-700 hover:underline cursor-pointer py-1 block"
                  >
                    ← Return to Sign In
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ========================================================================= */}
          {/* STAGE 3: FORGOT PASSWORD SUCCESS VIEW */}
          {/* ========================================================================= */}
          {stage === 'forgot-success' && (
            <div className="space-y-5 text-center py-2">
              <div className="h-14 w-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200/60 shadow-xs">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div className="space-y-1.5">
                <h2 className="font-heading text-2xl font-bold text-slate-900">Check Your Email</h2>
                <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                  We've dispatched a password reset link to <strong className="text-slate-900">{email}</strong>. Please check your inbox (and spam folder) to set your new password.
                </p>
              </div>

              <div className="pt-3">
                <Button
                  type="button"
                  onClick={() => {
                    setStage('credentials');
                    setError('');
                  }}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold border-none shadow-xs transition-all cursor-pointer"
                >
                  ← Return to Sign In
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 4: 6-DIGIT EMAIL OTP VERIFICATION */}
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

                  <button
                    type="button"
                    onClick={() => {
                      setStage('forgot-password');
                      setError('');
                    }}
                    className="text-blue-600 hover:text-blue-750 text-xs font-bold hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>

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

          {/* ========================================================================= */}
          {/* STAGE 5: INLINE LEGACY PASSWORD REDO / UPGRADE VIEW */}
          {/* ========================================================================= */}
          {stage === 'must-reset-password' && (
            <>
              {/* Header */}
              <div className="space-y-1.5">
                <div className="h-11 w-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60 shadow-xs mb-1">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="h-3 w-3" />
                  <span>Security Standard Update</span>
                </div>
                <h2 className="font-heading text-2xl font-bold text-slate-900">Create New Password</h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your account was created before our enhanced password security policy was enforced. Please create a new password meeting the updated standard to secure your profile and proceed.
                </p>
                {policyReason && (
                  <div className="mt-1 p-2.5 rounded-xl bg-amber-100/70 border border-amber-200 text-[11px] font-medium text-amber-900 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{policyReason}</span>
                  </div>
                )}
              </div>

              {resetError && (
                <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700 space-y-1">
                  <p>{resetError}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLegacyPasswordSubmit} className="space-y-4">
                
                {/* New Password */}
                <div className="space-y-1.5">
                  <label htmlFor="new_password" className="block text-[10px] font-bold tracking-wider uppercase text-slate-400">
                    New Standard Password
                  </label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new strong password"
                      leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                      className="bg-[#EEF2F6] border-none shadow-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-slate-800 rounded-xl h-11 pr-11"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Live Password Strength Indicator & Checklist */}
                <PasswordStrengthIndicator
                  password={newPassword}
                  userContext={{ name: email.split('@')[0], email }}
                  showChecklist={true}
                />

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <label htmlFor="confirm_password" className="block text-[10px] font-bold tracking-wider uppercase text-slate-400">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                      className="bg-[#EEF2F6] border-none shadow-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-slate-800 rounded-xl h-11 pr-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit & Return buttons */}
                <div className="pt-2 space-y-2.5">
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold border-none shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Update Password & Sign In</span>
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setStage('credentials');
                      setResetError('');
                      setPassword('');
                    }}
                    className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-700 hover:underline cursor-pointer py-1 block"
                  >
                    ← Cancel & Return to Sign In
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ========================================================================= */}
          {/* STAGE 6: INLINE SET NEW PASSWORD (FROM RESET TOKEN) */}
          {/* ========================================================================= */}
          {stage === 'set-new-password' && (
            <>
              {/* Header */}
              <div className="space-y-1.5">
                <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60 shadow-xs mb-1">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Identity Verified</span>
                </div>
                <h2 className="font-heading text-2xl font-bold text-slate-900">Set New Password</h2>
                <p className="text-xs text-slate-500">
                  {email || searchParams.get('email') ? (
                    <>Creating new password for <strong className="text-slate-800">{email || searchParams.get('email')}</strong>.</>
                  ) : (
                    'Enter your new password below to update your account credentials.'
                  )}
                </p>
              </div>

              {resetError && (
                <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <p>{resetError}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setStage('forgot-password');
                          setResetError('');
                        }}
                        className="text-rose-800 underline font-bold mt-1 inline-block"
                      >
                        Request a fresh reset link →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleTokenResetSubmit} className="space-y-4">
                
                {/* New Password */}
                <div className="space-y-1.5">
                  <label htmlFor="token_new_password" className="block text-[10px] font-bold tracking-wider uppercase text-slate-400">
                    New Standard Password
                  </label>
                  <div className="relative">
                    <Input
                      id="token_new_password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new strong password"
                      leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                      className="bg-[#EEF2F6] border-none shadow-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-slate-800 rounded-xl h-11 pr-11"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Live Password Strength Indicator & Checklist */}
                <PasswordStrengthIndicator
                  password={newPassword}
                  userContext={{ email: email || searchParams.get('email') || '' }}
                  showChecklist={true}
                />

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <label htmlFor="token_confirm_password" className="block text-[10px] font-bold tracking-wider uppercase text-slate-400">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Input
                      id="token_confirm_password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                      className="bg-[#EEF2F6] border-none shadow-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-slate-800 rounded-xl h-11 pr-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit & Return buttons */}
                <div className="pt-2 space-y-2.5">
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold border-none shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Save New Password & Sign In</span>
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setStage('credentials');
                      setResetError('');
                    }}
                    className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-700 hover:underline cursor-pointer py-1 block"
                  >
                    ← Return to Sign In
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ========================================================================= */}
          {/* STAGE 7: INLINE PASSWORD RESET SUCCESS CONFIRMATION */}
          {/* ========================================================================= */}
          {stage === 'reset-success' && (
            <div className="text-center space-y-5 py-3 animate-in fade-in">
              <div className="h-16 w-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-md">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <div className="space-y-2">
                <h2 className="font-heading text-2xl font-extrabold text-slate-900">
                  Password Reset Complete!
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  Your account password has been successfully updated in our system to the new standard security format.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  onClick={() => {
                    setStage('credentials');
                    setPassword('');
                    setError('');
                  }}
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-md rounded-xl cursor-pointer"
                >
                  Proceed to Sign In
                </Button>
              </div>
            </div>
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

