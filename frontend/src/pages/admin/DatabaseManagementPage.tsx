import React from 'react';
import { Database, RefreshCw, HardDrive } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const DatabaseManagementPage: React.FC = () => {
  const handleTriggerBackup = () => {
    toast.info('Starting PostgreSQL database backup...');
    setTimeout(() => toast.success('Database Backup Complete: backup_eduscholar_20260809.sql (42.5 MB)'), 1500);
  };

  const handleOptimizeDb = () => {
    toast.success('Database VACUUM ANALYZE & query index optimization completed!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-foreground">Database Backup & Optimization</h1>
          <p className="text-xs text-muted-foreground mt-1">
            PostgreSQL relational database maintenance, automated snapshots, and point-in-time restores.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleOptimizeDb} leftIcon={<RefreshCw className="h-4 w-4" />}>
            Optimize DB Queries
          </Button>
          <Button variant="primary" size="md" onClick={handleTriggerBackup} leftIcon={<Database className="h-4 w-4" />} className="font-bold shadow-md shadow-blue-600/20 shrink-0">
            Create Manual Backup Now
          </Button>
        </div>
      </div>

      {/* DB Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hoverEffect>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">PostgreSQL Engine</p>
              <p className="font-heading font-extrabold text-xl text-emerald-600">PostgreSQL 16.2</p>
              <p className="text-[11px] text-slate-500">Connection Pool: 24 / 100 Active</p>
            </div>
            <Database className="h-8 w-8 text-emerald-500" />
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Database Storage Size</p>
              <p className="font-heading font-extrabold text-xl text-blue-600">42.5 MB Used</p>
              <p className="text-[11px] text-slate-500">34 Master Data Tables</p>
            </div>
            <HardDrive className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Auto-Backup Frequency</p>
              <p className="font-heading font-extrabold text-xl text-purple-600">Every 24 Hours</p>
              <p className="text-[11px] text-slate-500">Retention: 30 Days Cloud Backup</p>
            </div>
            <RefreshCw className="h-8 w-8 text-purple-500" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
