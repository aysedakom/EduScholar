import React from 'react';
import { PieChart, Download, FileSpreadsheet, BarChart3, TrendingUp, DollarSign, Users, Award } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/cn';

export const ReportsModulePage: React.FC = () => {
  const handleExportPDF = () => {
    toast.info('Generating PDF Financial & Scholar Analytics Report...');
    setTimeout(() => toast.success('Downloaded EduScholar_Analytics_Report_2026.pdf'), 1000);
  };

  const handleExportExcel = () => {
    toast.info('Exporting Excel Workbook dataset...');
    setTimeout(() => toast.success('Downloaded EduScholar_Metrics_2026.xlsx'), 1000);
  };

  const handleExportCSV = () => {
    toast.info('Exporting raw CSV data...');
    setTimeout(() => toast.success('Downloaded EduScholar_Demographics_2026.csv'), 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-foreground">Reports & Financial Analytics Hub</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Generate executive summaries, export scholar demographics, monitor program metrics, and download audit sheets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} leftIcon={<FileSpreadsheet className="h-4 w-4" />}>
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel} leftIcon={<FileSpreadsheet className="h-4 w-4" />}>
            Export Excel
          </Button>
          <Button variant="primary" size="sm" onClick={handleExportPDF} leftIcon={<Download className="h-4 w-4" />} className="font-bold">
            Export PDF Report
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card hoverEffect>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Total Budget Allocated</p>
              <p className="font-heading font-extrabold text-2xl text-slate-900 mt-0.5">{formatCurrency(500000)}</p>
              <p className="text-[11px] text-slate-500 mt-1">Fiscal Year 2026</p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Disbursed Funds</p>
              <p className="font-heading font-extrabold text-2xl text-emerald-600 mt-0.5">{formatCurrency(420000)}</p>
              <p className="text-[11px] text-emerald-600 font-bold mt-1">84% Utilized</p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Total Beneficiaries</p>
              <p className="font-heading font-extrabold text-2xl text-slate-900 mt-0.5">1,248 Scholars</p>
              <p className="text-[11px] text-slate-500 mt-1">Scholarships & Grants</p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Approval Conversion</p>
              <p className="font-heading font-extrabold text-2xl text-purple-600 mt-0.5">94.2%</p>
              <p className="text-[11px] text-slate-500 mt-1">High Scholar Retention</p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200">
              <Award className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Program Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Financial Aid Disbursement by Program
            </CardTitle>
            <CardDescription>Fund distribution across active financial grants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {[
              { program: 'QC Tech Giants STEM Scholarship', amount: 180000, percent: 43 },
              { program: 'Dean’s Excellence Merit Scholarship', amount: 140000, percent: 33 },
              { program: 'QC Tertiary Continuing Education Grant', amount: 60000, percent: 14 },
              { program: 'First-Gen Hardship Emergency Grant', amount: 40000, percent: 10 },
            ].map((p, i) => (
              <div key={i} className="space-y-1 text-xs">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>{p.program}</span>
                  <span className="font-bold text-slate-900">{formatCurrency(p.amount)} ({p.percent}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${p.percent}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Scholar Demographics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              Scholar Demographic Breakdown
            </CardTitle>
            <CardDescription>Beneficiary distribution by department</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {[
              { dept: 'Computer Science & Information Tech', count: 480, percent: 38 },
              { dept: 'Business & Financial Management', count: 320, percent: 26 },
              { dept: 'Engineering & Architecture', count: 260, percent: 21 },
              { dept: 'Arts, Humanities & Education', count: 188, percent: 15 },
            ].map((d, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>{d.dept}</span>
                  <span className="font-bold text-emerald-600">{d.count} Scholars ({d.percent}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${d.percent}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
