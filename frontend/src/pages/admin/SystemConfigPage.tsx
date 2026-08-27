import React, { useState } from 'react';
import { Sliders, Save, ShieldCheck, ToggleLeft, ToggleRight, Key } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const SystemConfigPage: React.FC = () => {
  const [appName, setAppName] = useState('GovServe | EduScholar Portal');
  const [supportEmail, setSupportEmail] = useState('support@eduscholar.qc.edu.ph');
  
  // Feature Flags
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoVerification, setAutoVerification] = useState(true);
  const [publicPreChecker, setPublicPreChecker] = useState(true);
  const [mfaEnforced, setMfaEnforced] = useState(true);

  // Gateway Keys
  const [gcashApiKey, setGcashApiKey] = useState('pk_live_gcash_904281902489102');
  const [sendgridKey, setSendgridKey] = useState('SG.live_9042189042810924');

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('System Configuration & Feature Toggles saved successfully!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-foreground">System Configuration & Feature Flags</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Global application settings, payment gateways, MFA security policies, and live feature toggles.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleSaveConfig} leftIcon={<Save className="h-4 w-4" />} className="font-bold shadow-md shadow-blue-600/20 shrink-0">
          Save All System Configs
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Portal Branding & General */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sliders className="h-5 w-5 text-primary" />
              General Application Branding
            </CardTitle>
            <CardDescription>Portal name and support contact configurations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1">System Portal Title</label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary shadow-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Support Desk Contact Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary shadow-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Feature Toggles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              System Feature Toggles
            </CardTitle>
            <CardDescription>Enable or disable live application capabilities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">System Maintenance Lock</p>
                <p className="text-[11px] text-slate-500">Lock application during fiscal year-end rollover</p>
              </div>
              <button type="button" onClick={() => setMaintenanceMode(!maintenanceMode)}>
                {maintenanceMode ? <ToggleRight className="h-7 w-7 text-rose-600" /> : <ToggleLeft className="h-7 w-7 text-slate-400" />}
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">Automated Document Verification</p>
                <p className="text-[11px] text-slate-500">AI auto-verification of OCR transcript uploads</p>
              </div>
              <button type="button" onClick={() => setAutoVerification(!autoVerification)}>
                {autoVerification ? <ToggleRight className="h-7 w-7 text-emerald-600" /> : <ToggleLeft className="h-7 w-7 text-slate-400" />}
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">Public Pre-Checker Calculator</p>
                <p className="text-[11px] text-slate-500">Allow unauthenticated pre-checker on public portal</p>
              </div>
              <button type="button" onClick={() => setPublicPreChecker(!publicPreChecker)}>
                {publicPreChecker ? <ToggleRight className="h-7 w-7 text-emerald-600" /> : <ToggleLeft className="h-7 w-7 text-slate-400" />}
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">Enforce Multi-Factor Auth (MFA)</p>
                <p className="text-[11px] text-slate-500">Require TOTP authenticator app for staff & admin logins</p>
              </div>
              <button type="button" onClick={() => setMfaEnforced(!mfaEnforced)}>
                {mfaEnforced ? <ToggleRight className="h-7 w-7 text-emerald-600" /> : <ToggleLeft className="h-7 w-7 text-slate-400" />}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Security & Gateways */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Key className="h-5 w-5 text-indigo-600" />
              API Gateway & Payment Integration Credentials
            </CardTitle>
            <CardDescription>Configure external API keys for disbursements and email servers</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1">GCash Payout Merchant API Key</label>
              <input
                type="password"
                value={gcashApiKey}
                onChange={(e) => setGcashApiKey(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary shadow-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">SendGrid Email Dispatch Key</label>
              <input
                type="password"
                value={sendgridKey}
                onChange={(e) => setSendgridKey(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary shadow-xs font-mono"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
