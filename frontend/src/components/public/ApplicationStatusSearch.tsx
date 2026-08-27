import React, { useState } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { formatCurrency } from '../../utils/cn';

interface StatusResult {
  refId: string;
  studentName: string;
  program: string;
  submissionDate: string;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Paid';
  currentStep: number;
  estimatedPayoutDate?: string;
  amount?: number;
}

const MOCK_PUBLIC_RECORDS: Record<string, StatusResult> = {};

export const ApplicationStatusSearch: React.FC = () => {
  const [refIdInput, setRefIdInput] = useState('');
  const [result, setResult] = useState<StatusResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleaned = refIdInput.trim().toUpperCase();
    if (!cleaned) {
      setErrorMsg('Please enter a valid Application Reference ID (e.g. APP-8821)');
      return;
    }

    const found = MOCK_PUBLIC_RECORDS[cleaned];
    if (found) {
      setResult(found);
    } else {
      setResult(null);
      setErrorMsg(`No record found for Reference ID "${cleaned}". Try APP-8821 or APP-4090.`);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white border border-slate-200 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Track Application Status
          </CardTitle>
          <CardDescription>Enter your reference number to view real-time evaluation status</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1">Application Reference ID</label>
              <input
                type="text"
                placeholder="e.g. APP-8821"
                value={refIdInput}
                onChange={(e) => setRefIdInput(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary shadow-xs"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" variant="primary" size="md" leftIcon={<Search className="h-4 w-4" />} className="w-full font-bold">
                Check Status
              </Button>
            </div>
          </form>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {result && (
            <div className="mt-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="font-mono text-xs font-bold text-primary">{result.refId}</span>
                  <h4 className="font-extrabold text-base text-slate-900">{result.program}</h4>
                  <p className="text-xs text-slate-500">Applicant Initials: {result.studentName}</p>
                </div>
                <Badge variant={result.status === 'Paid' ? 'success' : result.status === 'Submitted' ? 'info' : 'warning'} size="md">
                  {result.status}
                </Badge>
              </div>

              {/* Progress Tracker Steps */}
              <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                {['Submitted', 'Under Review', 'Approved', 'Disbursed'].map((stepName, idx) => {
                  const stepNum = idx + 1;
                  const isDone = stepNum <= result.currentStep;
                  return (
                    <div key={idx} className="space-y-1">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isDone ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                      />
                      <span className={`font-semibold block ${isDone ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {stepName}
                      </span>
                    </div>
                  );
                })}
              </div>

              {result.amount && (
                <div className="p-3 bg-white border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                  <span className="text-slate-600">Grant Award Value:</span>
                  <span className="font-bold text-emerald-600 text-sm">{formatCurrency(result.amount)}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
