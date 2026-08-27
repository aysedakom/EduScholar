import React from 'react';
import { ShieldAlert, Home, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-medium animate-in fade-in duration-300">
        <div className="h-16 w-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200 shadow-xs">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs font-bold text-rose-600 uppercase tracking-widest">Error 404</span>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">Page Not Found</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            The requested financial aid portal page or document resource does not exist or has been relocated.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <Link to="/dashboard" className="w-full sm:w-auto">
            <Button variant="primary" size="md" leftIcon={<Home className="h-4 w-4" />} className="w-full font-bold shadow-md shadow-blue-600/20">
              Go to Dashboard
            </Button>
          </Link>
          <Link to="/public" className="w-full sm:w-auto">
            <Button variant="outline" size="md" leftIcon={<Search className="h-4 w-4" />} className="w-full font-semibold">
              Public Services
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
