import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, ShieldCheck, X } from 'lucide-react';

export const CookieConsentBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('eduscholar_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('eduscholar_cookie_consent', 'accepted_all');
    localStorage.setItem('eduscholar_cookie_date', new Date().toISOString());
    setVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('eduscholar_cookie_consent', 'essential_only');
    localStorage.setItem('eduscholar_cookie_date', new Date().toISOString());
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-lg z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-2xl border border-slate-800 space-y-4 font-sans text-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-2xl bg-blue-600/20 text-blue-400 shrink-0">
            <Cookie className="h-5 w-5" />
          </div>
          <div className="space-y-1 pr-4">
            <h3 className="font-heading font-extrabold text-sm text-white flex items-center gap-1.5">
              Cookie & Data Privacy Notice
            </h3>
            <p className="text-slate-300 leading-relaxed">
              We use essential cookies and local storage to maintain your login session, security tokens, and language preferences in compliance with Republic Act No. 10173 (Data Privacy Act of 2012).
            </p>
          </div>
          <button
            onClick={handleAcceptEssential}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800 text-[11px]">
          <Link to="/privacy" className="text-blue-400 hover:underline font-semibold flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Read Privacy Policy</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAcceptEssential}
              className="h-8 px-3 text-[11px] font-bold rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer shadow-sm"
            >
              Essential Only
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="h-8 px-3 text-[11px] font-extrabold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer shadow-md"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
