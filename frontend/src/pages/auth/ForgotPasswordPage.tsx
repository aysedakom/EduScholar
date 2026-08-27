import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';

export function ForgotPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { forgotPassword, resetPassword } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const tokenFromUrl = searchParams.get('token') || '';
  const emailFromUrl = searchParams.get('email') || '';

  // Request Reset Link State
  const [email, setEmail] = useState(emailFromUrl);
  const [isRequesting, setIsRequesting] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  // Set New Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');

  useEffect(() => {
    let timer: any;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Handler: Request Password Reset Authorization Email
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your registered email address.');
      return;
    }

    setIsRequesting(true);
    try {
      const res = await forgotPassword(email.trim());
      setLinkSent(true);
      if (res?.devResetUrl) {
        setDevResetUrl(res.devResetUrl);
      }
      setResendCountdown(60);
    } catch (err: any) {
      // Toast already fired in AuthContext
    } finally {
      setIsRequesting(false);
    }
  };

  // Handler: Resend Authorization Email
  const handleResend = async () => {
    if (resendCountdown > 0 || isRequesting) return;
    setIsRequesting(true);
    try {
      const res = await forgotPassword(email.trim());
      if (res?.devResetUrl) {
        setDevResetUrl(res.devResetUrl);
      }
      setResendCountdown(60);
      toast.success(`A fresh verification link has been sent to ${email}.`);
    } catch (err: any) {
      // Error handled
    } finally {
      setIsRequesting(false);
    }
  };

  // Handler: Submit New Password with Token
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (!newPassword) {
      setResetError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsResetting(true);
    try {
      await resetPassword(tokenFromUrl, newPassword, emailFromUrl || email);
      setResetSuccess(true);
      toast.success('Your password has been successfully updated! 🎉');
    } catch (err: any) {
      setResetError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsResetting(false);
    }
  };

  const isResetMode = Boolean(tokenFromUrl);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4 font-sans selection:bg-blue-500 selection:text-white">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 sm:p-9 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Navigation & Header Badges */}
        <div className="flex items-center justify-between pb-1">
          <Link to="/login">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              className="font-bold text-xs rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Back to Login
            </Button>
          </Link>
          <Badge variant="primary" className="bg-blue-50 text-blue-700 font-bold border border-blue-200">
            {isResetMode ? 'Identity Verified' : 'Security Verification'}
          </Badge>
        </div>

        {/* ========================================================================= */}
        {/* SCENARIO A: RESET PASSWORD FORM (User clicked verification link in email) */}
        {/* ========================================================================= */}
        {isResetMode ? (
          resetSuccess ? (
            <div className="text-center space-y-5 py-4">
              <div className="h-16 w-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-md animate-in zoom-in-50 duration-300">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <div className="space-y-2">
                <h2 className="font-heading text-2xl font-extrabold text-slate-900">
                  Password Reset Complete!
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  Your account password has been successfully updated in our system. You can now sign in with your new credentials.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => navigate('/login')}
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-lg shadow-blue-600/30 rounded-xl"
                >
                  Proceed to Sign In
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200 shadow-sm">
                  <KeyRound className="h-6 w-6" />
                </div>
                <h1 className="font-heading text-2xl font-extrabold text-slate-900">
                  Set New Password
                </h1>
                <p className="text-xs text-slate-500">
                  {emailFromUrl ? (
                    <>Identity verified for <strong className="text-slate-800">{emailFromUrl}</strong>. Enter your new password below.</>
                  ) : (
                    'Enter your new password below to update your account credentials.'
                  )}
                </p>
              </div>

              {resetError && (
                <div className="p-3.5 rounded-2xl border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700 flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p>{resetError}</p>
                    <Link
                      to="/forgot-password"
                      className="text-rose-800 underline font-bold mt-1 inline-block"
                    >
                      Request a fresh reset link →
                    </Link>
                  </div>
                </div>
              )}

              <form onSubmit={handleResetSubmit} className="space-y-4">
                {/* New Password */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Confirm New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Validation Hints */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] space-y-1">
                  <div className={`flex items-center gap-1.5 ${newPassword.length >= 6 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    <span className="text-xs">{newPassword.length >= 6 ? '✓' : '○'}</span>
                    <span>At least 6 characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${confirmPassword && newPassword === confirmPassword ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    <span className="text-xs">{confirmPassword && newPassword === confirmPassword ? '✓' : '○'}</span>
                    <span>Passwords match</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  isLoading={isResetting}
                  variant="primary"
                  size="lg"
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-lg shadow-blue-600/30 rounded-xl"
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Confirm & Update Password
                </Button>
              </form>
            </div>
          )
        ) : (
          /* ========================================================================= */
          /* SCENARIO B: REQUEST PASSWORD RESET EMAIL                                 */
          /* ========================================================================= */
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200 shadow-sm">
                <Mail className="h-6 w-6" />
              </div>
              <h1 className="font-heading text-2xl font-extrabold text-slate-900">
                Forgot Password?
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter your registered email address. For security, we will send an <strong>authorization verification link</strong> to your email before resetting your password.
              </p>
            </div>

            {linkSent ? (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/80 text-xs text-slate-700 space-y-3">
                  <div className="flex items-center gap-2 text-blue-800 font-extrabold text-sm">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
                    <span>Verification Email Sent!</span>
                  </div>
                  <p className="leading-relaxed">
                    We sent a password reset authorization link to:
                    <br />
                    <strong className="text-slate-900 font-bold">{email}</strong>
                  </p>
                  <p className="text-slate-600 bg-white/70 p-3 rounded-xl border border-blue-100 leading-relaxed font-medium">
                    📩 Please check your inbox and click the <strong>"Verify & Reset My Password"</strong> button to confirm your identity and choose a new password.
                  </p>
                </div>

                {devResetUrl && (
                  <Button
                    onClick={() => {
                      const pathOnly = devResetUrl.replace(/^https?:\/\/[^\/]+/, '');
                      navigate(pathOnly);
                    }}
                    variant="primary"
                    size="lg"
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-lg shadow-blue-600/30 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Proceed to Set New Password →</span>
                  </Button>
                )}

                <div className="flex flex-col items-center gap-3 pt-2">
                  {resendCountdown > 0 ? (
                    <span className="text-xs text-slate-400 font-medium">
                      Resend link in <strong className="text-slate-600 font-bold">{resendCountdown}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isRequesting}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isRequesting ? 'animate-spin' : ''}`} />
                      <span>Didn't receive email? Send another link</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setLinkSent(false);
                      setEmail('');
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
                  >
                    ← Try a different email address
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <Input
                  label="Registered Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
                  required
                  autoFocus
                />

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    A secure verification link will be dispatched to your inbox to ensure you are the authorized owner of this account.
                  </p>
                </div>

                <Button
                  type="submit"
                  isLoading={isRequesting}
                  variant="primary"
                  size="lg"
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-lg shadow-blue-600/30 rounded-xl"
                >
                  Send Verification & Reset Link
                </Button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
