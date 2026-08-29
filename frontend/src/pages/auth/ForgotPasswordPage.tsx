import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { LoginPage } from './LoginPage';

export function ForgotPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const tokenFromUrl = searchParams.get('token') || '';
  const emailFromUrl = searchParams.get('email') || '';

  // If user navigated to /forgot-password without a reset token, render the integrated LoginPage in forgot-password view!
  if (!tokenFromUrl) {
    return <LoginPage defaultView="forgot-password" />;
  }

  // Set New Password State (Token from Email Reset Link)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');

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
      await resetPassword(tokenFromUrl, newPassword, emailFromUrl);
      setResetSuccess(true);
      toast.success('Your password has been successfully updated! 🎉');
    } catch (err: any) {
      setResetError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsResetting(false);
    }
  };

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
              className="font-bold text-xs rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Back to Login
            </Button>
          </Link>
          <Badge variant="primary" className="bg-blue-50 text-blue-700 font-bold border border-blue-200">
            Identity Verified
          </Badge>
        </div>

        {/* SET NEW PASSWORD FORM (User clicked verification link in email) */}
        {resetSuccess ? (
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
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-lg shadow-blue-600/30 rounded-xl cursor-pointer"
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
                    to="/login?view=forgot-password"
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
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
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
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
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
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-lg shadow-blue-600/30 rounded-xl cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4 mr-2" />
                Confirm & Update Password
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
