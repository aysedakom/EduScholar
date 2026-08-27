import React from 'react';
import { BarChart3, Download, PieChart, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ScholarshipRecommender } from '../../components/ai/ScholarshipRecommender';
import { formatCurrency } from '../../utils/cn';

export const AdvancedAnalyticsPage: React.FC = () => {

  const handleExportPDF = () => {
    toast.success('Generated Executive Financial & Demographics PDF Analytics Report');
  };

  const handleExportExcel = () => {
    toast.success('Exported Analytics Master Data (Excel .xlsx workbook)');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-foreground">Advanced System Analytics & AI Insights</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Executive financial metrics, demographic breakdowns, and AI scholarship recommendation calculator.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel} leftIcon={<Download className="h-4 w-4" />}>
            Export Excel
          </Button>
          <Button variant="primary" size="sm" onClick={handleExportPDF} leftIcon={<Download className="h-4 w-4" />} className="font-bold shadow-md shadow-blue-600/20">
            Export PDF Report
          </Button>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card hoverEffect>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Total Applications Submitted</p>
              <p className="font-heading font-extrabold text-2xl text-slate-900 mt-0.5">1,428 Apps</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">↑ +14% vs last quarter</p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
              <TrendingUp className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Average Approval Rate</p>
              <p className="font-heading font-extrabold text-2xl text-emerald-600 mt-0.5">78.4%</p>
              <p className="text-[11px] text-slate-500 mt-1">1,120 Approved Grants</p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
              <BarChart3 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Total Disbursed Payouts</p>
              <p className="font-heading font-extrabold text-2xl text-indigo-600 mt-0.5">{formatCurrency(42000000)}</p>
              <p className="text-[11px] text-slate-500 mt-1">84% of Allocated Budget</p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Demographic Retention Rate</p>
              <p className="font-heading font-extrabold text-2xl text-purple-600 mt-0.5">94.2%</p>
              <p className="text-[11px] text-slate-500 mt-1">Active Scholars</p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200">
              <PieChart className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Program Approval & Demographic Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Program Approval Metrics Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Program Approval & Utilization Breakdown
            </CardTitle>
            <CardDescription>Grant metrics per scholarship program</CardDescription>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase group-label border-b border-border">
                  <tr>
                    <th className="p-3">Program Name</th>
                    <th className="p-3 text-center">Applied</th>
                    <th className="p-3 text-center">Approved</th>
                    <th className="p-3 text-right">Disbursed ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {[
                    { name: 'DOST-SEI STEM National Grant', applied: 450, approved: 380, disbursed: 15200000 },
                    { name: 'CHED UniFAST TES Assistance', applied: 520, approved: 420, disbursed: 12600000 },
                    { name: 'QC Local Youth Development Bursary', applied: 310, approved: 260, disbursed: 5200000 },
                    { name: 'GrabScholar Higher Education Award', applied: 148, approved: 60, disbursed: 1500000 },
                  ].map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="p-3 font-bold text-slate-900">{p.name}</td>
                      <td className="p-3 text-center text-slate-600">{p.applied}</td>
                      <td className="p-3 text-center font-bold text-emerald-600">{p.approved}</td>
                      <td className="p-3 text-right font-extrabold text-slate-900">{formatCurrency(p.disbursed)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Scholar Demographics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-600" />
              Scholar Department & Year Breakdown
            </CardTitle>
            <CardDescription>Academic department demographic representation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0 text-xs">
            <div className="space-y-2">
              {[
                { dept: 'Computer Science & IT', pct: 42, count: 520, color: 'bg-primary' },
                { dept: 'Engineering & Architecture', pct: 28, count: 350, color: 'bg-indigo-600' },
                { dept: 'Business & Finance', pct: 18, count: 220, color: 'bg-emerald-500' },
                { dept: 'Education & Humanities', pct: 12, count: 150, color: 'bg-purple-500' },
              ].map((d, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-800">{d.dept}</span>
                    <span className="text-slate-600">{d.count} Scholars ({d.pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                    <div className={`${d.color} h-full rounded-full`} style={{ width: `${d.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Smart Tools Grid */}
      <div>
        <ScholarshipRecommender />
      </div>
    </div>
  );
};
