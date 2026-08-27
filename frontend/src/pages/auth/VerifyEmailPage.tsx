import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { AuthBrandPanel } from '../../components/shared/AuthBrandPanel';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || searchParams.get('code') || '';
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>(token ? 'verifying' : 'idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  const { verifyEmailToken, resendVerification } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      handleAutoVerify(token, initialEmail);
    }
  }, [token, initialEmail]);

  const handleAutoVerify = async (verifyToken: string, userEmail?: string) => {
    setStatus('verifying');
    setErrorMessage('');
    try {
      const ok = await verifyEmailToken(verifyToken, userEmail);
      if (ok) {
        setStatus('success');
        toast.success('Account verified successfully! You can now sign in.');
      } else {
        setStatus('error');
        setErrorMessage('Verification link is invalid or has expired.');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Verification link is invalid or has expired.');
    }
  };

  const handleResend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address to receive a verification link.');
      return;
    }
    setIsResending(true);
    try {
      const ok = await resendVerification(email);
      if (ok) {
        toast.success('A fresh verification link has been sent to your email.');
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans relative">
      <AuthBrandPanel />

      <div className="flex w-full flex-col items-center justify-center p-4 md:w-1/2 md:p-10">
        <div className="w-full max-w-md mb-3 flex items-center justify-between">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-slate-700 hover:text-blue-600 hover:bg-blue-50 text-xs font-extrabold shadow-sm border border-slate-200/80 transition-all cursor-pointer group"
          >
            <ArrowLeft className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            <span>Back to Sign In</span>
          </Link>
        </div>

        <div className="w-full max-w-md rounded-2xl bg-white p-8 md:p-10 shadow-xl border border-slate-100/50 space-y-6">
          
          {/* VERIFYING STATE */}
          {status === 'verifying' && (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
              <div className="space-y-1.5">
                <h2 className="font-heading text-2xl font-bold text-slate-900">Verifying Account...</h2>
                <p className="text-xs text-slate-500">
                  Please wait while we verify your email address with the system.
                </p>
              </div>
            </div>
          )}

          {/* SUCCESS STATE */}
          {status === 'success' && (
            <div className="text-center py-4 space-y-5">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <div className="space-y-2">
                <h2 className="font-heading text-2xl font-bold text-slate-900">Account Verified! 🎉</h2>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                  Your email address has been successfully verified in the Quezon City Campus Aid Hub. Your student account is now active!
                </p>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-left text-xs text-slate-600 space-y-1.5">
                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-blue-600" /> Sign In with OTP Security
                </div>
                <p>When you log in with your email & password, a unique 6-digit OTP code will be sent to your email to verify your identity.</p>
              </div>

              <Button
                onClick={() => navigate(`/login?email=${encodeURIComponent(email)}`)}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold border-none shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                Proceed to Sign In →
              </Button>
            </div>
          )}

          {/* ERROR STATE */}
          {status === 'error' && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className="mx-auto w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                  <AlertCircle className="h-7 w-7" />
                </div>
                <h2 className="font-heading text-xl font-bold text-slate-900">Verification Link Expired</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {errorMessage || 'This verification link is invalid, expired, or has already been used.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <p className="text-xs font-bold text-slate-700">Need a new verification link?</p>
                <form onSubmit={handleResend} className="space-y-2.5">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
                    className="bg-white text-slate-800 rounded-xl h-10 text-xs"
                    required
                  />
                  <Button
                    type="submit"
                    isLoading={isResending}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Resend Verification Link
                  </Button>
                </form>
              </div>

              <div className="text-center pt-2">
                <Link to="/login" className="text-xs font-bold text-slate-500 hover:text-slate-800">
                  Return to Sign In
                </Link>
              </div>
            </div>
          )}

          {/* IDLE / DEFAULT STATE (e.g. redirected from register without clicking link yet) */}
          {status === 'idle' && (
            <div className="text-center py-4 space-y-5">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
                <Mail className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h2 className="font-heading text-2xl font-bold text-slate-900">Verify Your Email</h2>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                  We've sent a verification link to {email ? <strong className="text-slate-800">{email}</strong> : 'your email address'}.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-left text-xs text-slate-600 space-y-2">
                <p className="font-bold text-blue-900">How to activate your account:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600">
                  <li>Check your email inbox or spam folder.</li>
                  <li>Click the <strong>Verify My Account</strong> button in the email.</li>
                  <li>Your account will be activated and ready for sign-in.</li>
                </ol>
              </div>

              <div className="pt-2 space-y-2">
                <Button
                  onClick={() => handleResend()}
                  isLoading={isResending}
                  className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-200 transition-all cursor-pointer flex items-center justify-center gap-2 text-xs"
                >
                  <Send className="h-3.5 w-3.5" />
                  Resend Verification Link
                </Button>
                
                <Link
                  to="/login"
                  className="block w-full py-2.5 rounded-xl text-center text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  Go to Sign In →
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

