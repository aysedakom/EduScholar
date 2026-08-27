import React, { useState } from 'react';
import { Wrench, ShieldAlert, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const MaintenanceModePage: React.FC = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcement, setAnnouncement] = useState(
    'Scheduled Portal Maintenance: Campus Aid Hub will be undergoing financial year-end rollover maintenance on August 25 from 12:00 AM to 04:00 AM.'
  );

  const handleToggleMaintenance = () => {
    const nextState = !maintenanceMode;
    setMaintenanceMode(nextState);
    if (nextState) {
      toast.warning('MAINTENANCE MODE ACTIVATED! Unauthenticated and student logins are currently locked.');
    } else {
      toast.success('Maintenance mode deactivated. Portal is now fully operational!');
    }
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Scheduled maintenance announcement broadcast saved!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl text-foreground">Maintenance Mode & Portal Rollover Lock</h1>
            <Badge variant={maintenanceMode ? 'destructive' : 'success'}>
              {maintenanceMode ? 'Portal Locked' : 'System Live'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Lock application access during fiscal year-end financial rollovers and schedule maintenance announcements.
          </p>
        </div>

        <Button
          variant={maintenanceMode ? 'destructive' : 'primary'}
          size="md"
          onClick={handleToggleMaintenance}
          leftIcon={<Wrench className="h-4 w-4" />}
          className="font-bold shadow-md shrink-0"
        >
          {maintenanceMode ? 'Deactivate Maintenance Mode' : 'Activate Maintenance Lock'}
        </Button>
      </div>

      {/* Announcement Broadcast Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            Scheduled Maintenance Public Banner Broadcast
          </CardTitle>
          <CardDescription>Broadcast banner displayed to all students and applicants on the portal header</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Public Maintenance Announcement Text</label>
              <textarea
                rows={4}
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-primary resize-none shadow-xs"
              />
            </div>

            <Button type="submit" variant="primary" size="md" leftIcon={<Save className="h-4 w-4" />} className="font-bold">
              Save & Broadcast Announcement
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
