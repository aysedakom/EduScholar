import React, { useState, useEffect } from 'react';
import { Sliders, Save, ShieldCheck, ToggleLeft, ToggleRight, Key, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getPortalSettings, updatePortalSettings, type PortalSettingsData } from '../../api/portalSettings';

export const SystemConfigPage: React.FC = () => {
  const [appName, setAppName] = useState('GovServe | EduScholar Portal');
  const [supportEmail, setSupportEmail] = useState('support@eduscholar.qc.edu.ph');
  
  // Portal Intake Settings (Synced with PostgreSQL database)
  const [portalSettings, setPortalSettings] = useState<PortalSettingsData>({
    isOpen: true,
    academicYear: 'AY 2026-2027',
    term: '1st Semester',
    openingDate: '2026-08-01',
    closingDate: '2026-09-30',
    closedMessage: 'The Quezon City Scholarship Application Portal is currently closed for new submissions. Evaluators are processing active candidate review queues.',
    nextCycleOpening: 'October 15, 2026',
  });
  
  // Feature Flags
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoVerification, setAutoVerification] = useState(true);
  const [publicPreChecker, setPublicPreChecker] = useState(true);
  const [mfaEnforced, setMfaEnforced] = useState(true);

  // Gateway Keys
  const [gcashApiKey, setGcashApiKey] = useState('pk_live_gcash_904281902489102');
  const [sendgridKey, setSendgridKey] = useState('SG.live_9042189042810924');

  useEffect(() => {
    getPortalSettings()
      .then((res: any) => {
        if (res.data?.data) {
          setPortalSettings(res.data.data);
        }
      })
      .catch((err: any) => {
        console.warn('Failed to load portal settings in config:', err);
      });
  }, []);

  const handleTogglePortalIntake = async () => {
    const nextState = !portalSettings.isOpen;
    setPortalSettings((prev) => ({ ...prev, isOpen: nextState }));
    try {
      const res = await updatePortalSettings({ isOpen: nextState });
      if (res.data?.data) {
        setPortalSettings(res.data.data);
      }
      toast.success(
        nextState
          ? 'Application Portal Intake is now OPEN (Accepting Applications)'
          : 'Application Portal Intake is now CLOSED (Submissions Locked in DB)'
      );
    } catch (err: any) {
      toast.error('Failed to update portal setting: ' + err.message);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePortalSettings(portalSettings);
      toast.success('System Configuration & Portal Settings saved successfully in database!');
    } catch (err: any) {
      toast.error('Failed to save configuration: ' + err.message);
    }
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
        {/* Application Portal Intake Enforcer */}
        <Card className="border-blue-200 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/40 via-white to-white dark:from-slate-900 dark:to-slate-900">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Application Portal Intake Control
              </span>
              <button
                type="button"
                onClick={handleTogglePortalIntake}
                className="cursor-pointer"
                title="Toggle Application Intake"
              >
                {portalSettings.isOpen ? (
                  <ToggleRight className="h-8 w-8 text-emerald-600" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-rose-500" />
                )}
              </button>
            </CardTitle>
            <CardDescription>
              Status: <strong className={portalSettings.isOpen ? 'text-emerald-600' : 'text-rose-600'}>
                {portalSettings.isOpen ? 'OPEN (Accepting Applications)' : 'CLOSED (Submissions Locked)'}
              </strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={portalSettings.academicYear}
                  onChange={(e) => setPortalSettings({ ...portalSettings, academicYear: e.target.value })}
                  className="w-full h-9 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Academic Term</label>
                <input
                  type="text"
                  value={portalSettings.term}
                  onChange={(e) => setPortalSettings({ ...portalSettings, term: e.target.value })}
                  className="w-full h-9 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Next Cycle Expected Opening Date</label>
              <input
                type="text"
                value={portalSettings.nextCycleOpening}
                onChange={(e) => setPortalSettings({ ...portalSettings, nextCycleOpening: e.target.value })}
                placeholder="e.g. October 15, 2026"
                className="w-full h-9 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Intake Closed Notice to Students</label>
              <textarea
                rows={2}
                value={portalSettings.closedMessage}
                onChange={(e) => setPortalSettings({ ...portalSettings, closedMessage: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
              />
            </div>
          </CardContent>
        </Card>

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
        <Card className="md:col-span-2">
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
