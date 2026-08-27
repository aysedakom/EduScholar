import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Lock, Globe, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const SecurityManagementPage: React.FC = () => {
  const [ipBlocklist, setIpBlocklist] = useState<string[]>([
    '110.54.21.90',
    '185.220.101.4',
    '45.142.120.9',
  ]);
  const [newIp, setNewIp] = useState('');

  const handleRunVulnerabilityScan = () => {
    toast.info('Initiating security vulnerability audit scanner...');
    setTimeout(() => toast.success('Security Vulnerability Scan Complete: 0 High/Critical Vulnerabilities Found!'), 1500);
  };

  const handleAddBlockedIp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp.trim()) return;

    setIpBlocklist([...ipBlocklist, newIp.trim()]);
    toast.success(`IP address ${newIp.trim()} added to firewall blocklist!`);
    setNewIp('');
  };

  const handleRemoveBlockedIp = (ip: string) => {
    setIpBlocklist(ipBlocklist.filter((i) => i !== ip));
    toast.info(`Removed IP ${ip} from firewall blocklist.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-foreground">Security, SSL & Firewall Management</h1>
          <p className="text-xs text-muted-foreground mt-1">
            SSL/TLS certificates, Web Application Firewall (WAF) rules, IP blocklists, and vulnerability scanners.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleRunVulnerabilityScan} leftIcon={<ShieldCheck className="h-4 w-4" />} className="font-bold shadow-md shadow-blue-600/20 shrink-0">
          Run Security Vulnerability Audit
        </Button>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card hoverEffect>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-emerald-600" />
                <CardTitle className="text-base">SSL / TLS 1.3 Encryption</CardTitle>
              </div>
              <Badge variant="success">Active (Valid)</Badge>
            </div>
            <CardDescription>Wildcard SSL Certificate (*.eduscholar.qc.edu.ph)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-xs pt-0">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 font-mono">
              <p><span className="text-slate-400">Issuer:</span> DigiCert Global TLS RSA SHA256</p>
              <p><span className="text-slate-400">Expiration:</span> 2027-05-15 (Automated Renewal)</p>
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-base">Cloudflare Web Application Firewall</CardTitle>
              </div>
              <Badge variant="success">WAF Active</Badge>
            </div>
            <CardDescription>DDoS mitigation and automated bot protection active.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-xs pt-0">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 font-mono">
              <p><span className="text-slate-400">DDoS Mitigation:</span> Enabled (Under Attack Mode Ready)</p>
              <p><span className="text-slate-400">Blocked Requests Today:</span> 14 Threat Events</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* IP Blocklist Manager */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-500" />
            Firewall IP Blocklist Manager
          </CardTitle>
          <CardDescription>Block specific IP addresses from accessing the portal</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-xs">
          <form onSubmit={handleAddBlockedIp} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 192.168.1.1"
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
              className="flex-1 h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary shadow-xs font-mono"
            />
            <Button type="submit" variant="primary" size="md" leftIcon={<Plus className="h-4 w-4" />} className="font-bold">
              Block IP Address
            </Button>
          </form>

          <div className="space-y-2">
            {ipBlocklist.map((ip) => (
              <div key={ip} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between font-mono">
                <span className="font-bold text-slate-800">{ip}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveBlockedIp(ip)}
                  leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                >
                  Unblock
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
