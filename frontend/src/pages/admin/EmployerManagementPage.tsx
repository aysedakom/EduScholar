import React, { useState } from 'react';
import { Building2, Plus, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

interface EmployerPartner {
  id: string;
  name: string;
  industry: string;
  contactEmail: string;
  activePositions: number;
  contractStatus: 'Active Contract' | 'Pending Renewal' | 'Terminated';
  expiryDate: string;
}

const INITIAL_EMPLOYERS: EmployerPartner[] = [
  {
    id: 'EMP-01',
    name: 'Quezon City Public Library System',
    industry: 'Government & Literacy',
    contactEmail: 'partners@qc.gov.ph',
    activePositions: 8,
    contractStatus: 'Active Contract',
    expiryDate: '2027-12-31',
  },
  {
    id: 'EMP-02',
    name: 'Accenture Philippines Tech Hub',
    industry: 'Information Technology',
    contactEmail: 'campus.aid@accenture.com',
    activePositions: 15,
    contractStatus: 'Active Contract',
    expiryDate: '2026-11-30',
  },
  {
    id: 'EMP-03',
    name: 'Grab Philippines Corporate Operations',
    industry: 'Logistics & Tech',
    contactEmail: 'scholarships@grab.com',
    activePositions: 5,
    contractStatus: 'Pending Renewal',
    expiryDate: '2026-08-31',
  },
];

export const EmployerManagementPage: React.FC = () => {
  const [employers, setEmployers] = useState<EmployerPartner[]>(INITIAL_EMPLOYERS);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [email, setEmail] = useState('');

  const handleAddEmployer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const newEmp: EmployerPartner = {
      id: `EMP-0${employers.length + 1}`,
      name,
      industry: industry || 'Corporate Partner',
      contactEmail: email,
      activePositions: 0,
      contractStatus: 'Active Contract',
      expiryDate: '2027-08-31',
    };

    setEmployers([newEmp, ...employers]);
    setShowModal(false);
    setName('');
    setIndustry('');
    setEmail('');
    toast.success(`Registered new workplace partner: ${name}!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-foreground">Corporate & Industry Grant Partners</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage corporate scholarship partner agreements, foundation sponsors, and grant allocations.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setShowModal(true)} leftIcon={<Plus className="h-4 w-4" />} className="font-bold shadow-md shadow-blue-600/20 shrink-0">
          Add Grant Partner
        </Button>
      </div>

      {/* Grid of Employer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {employers.map((emp) => (
          <Card key={emp.id} hoverEffect className="flex flex-col justify-between">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200 font-extrabold">
                  <Building2 className="h-5 w-5" />
                </div>
                <Badge variant={emp.contractStatus === 'Active Contract' ? 'success' : 'warning'}>
                  {emp.contractStatus}
                </Badge>
              </div>
              <CardTitle className="text-base">{emp.name}</CardTitle>
              <CardDescription>{emp.industry}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-2 text-xs pt-0">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact Email:</span>
                  <span className="font-bold text-slate-800">{emp.contactEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Funded Grant Slots:</span>
                  <span className="font-bold text-primary">{emp.activePositions} Slots</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Agreement Expiry:</span>
                  <span className="font-medium text-slate-700">{emp.expiryDate}</span>
                </div>
              </div>
            </CardContent>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <Button variant="outline" size="sm" leftIcon={<FileText className="h-3.5 w-3.5" />}>
                View Agreement
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Add New Grant Partner"
          description="Register corporate sponsor or foundation grant partner"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleAddEmployer} className="font-bold">
                Save Partner
              </Button>
            </>
          }
        >
          <form onSubmit={handleAddEmployer} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Company / Organization Name</label>
              <input
                type="text"
                placeholder="e.g. Globe Telecom Corp"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary shadow-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Industry Sector</label>
              <input
                type="text"
                placeholder="Telecommunications"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary shadow-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Contact Email Address</label>
              <input
                type="email"
                placeholder="hr@globe.com.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary shadow-xs"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
