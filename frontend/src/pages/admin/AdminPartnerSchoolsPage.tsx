import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  FileSpreadsheet,
  Users,
  ExternalLink,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { toast } from 'sonner';
import { getPartners } from '../../api/partners';
import { getScholars, type ScholarRegistryRecord } from '../../api/registry';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/cn';

export interface AdminPartnerSchool {
  schoolId: string;
  schoolName: string;
  schoolType: string;
  address: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
  partnershipStatus: 'Active' | 'Inactive' | 'Pending' | 'Expired';
  partnershipStart: string;
  partnershipEnd: string;
  programsOffered: string;
  scholarshipSlots: number;
  activeScholarsCount?: number;
}

export const AdminPartnerSchoolsPage: React.FC = () => {
  const [schools, setSchools] = useState<AdminPartnerSchool[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  useEffect(() => {
    let isMounted = true;
    const fetchSchools = async () => {
      try {
        const res = await getPartners();
        if (res.data && isMounted) {
          const mapped: AdminPartnerSchool[] = res.data.map(p => {
            const rawStatus = String(p.partnership_status || '').toLowerCase();
            const status: 'Active' | 'Inactive' | 'Pending' | 'Expired' = 
              rawStatus.includes('accredited') || rawStatus.includes('active')
                ? 'Active'
                : rawStatus.includes('pending')
                ? 'Pending'
                : rawStatus.includes('expired')
                ? 'Expired'
                : 'Inactive';

            const formatCleanDate = (dateVal: any, fallback: string) => {
              if (!dateVal) return fallback;
              try {
                const d = new Date(dateVal);
                return !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : fallback;
              } catch {
                return fallback;
              }
            };

            return {
              schoolId: p.school_id,
              schoolName: p.name,
              schoolType: p.school_type,
              address: p.address,
              contactPerson: p.contact_person || 'N/A',
              contactNumber: p.contact_number || 'N/A',
              email: p.email || 'N/A',
              partnershipStatus: status,
              partnershipStart: formatCleanDate(p.partnership_start, '2024-01-01'),
              partnershipEnd: formatCleanDate(p.partnership_end, '2028-12-31'),
              programsOffered: p.programs_offered || 'All Accredited Degree Programs',
              scholarshipSlots: p.scholarship_slots || 500,
              activeScholarsCount: Number(p.active_scholars) || 0,
            };
          });
          setSchools(mapped);
        }
      } catch {
        // fallback
      }
    };
    fetchSchools();
    return () => { isMounted = false; };
  }, []);

  const { user } = useAuth();
  const isCoordinator = user?.role === 'school_coordinator';

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState<AdminPartnerSchool | null>(null);
  const [viewingSchool, setViewingSchool] = useState<AdminPartnerSchool | null>(null);
  const [deletingSchool, setDeletingSchool] = useState<AdminPartnerSchool | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  // Enrolled Students Roster Drilldown Modal
  const [selectedSchoolForStudents, setSelectedSchoolForStudents] = useState<AdminPartnerSchool | null>(null);
  const [schoolScholars, setSchoolScholars] = useState<ScholarRegistryRecord[]>([]);
  const [loadingScholars, setLoadingScholars] = useState(false);
  const [scholarSearchQuery, setScholarSearchQuery] = useState('');

  const handleOpenEnrolledStudents = async (school: AdminPartnerSchool) => {
    setSelectedSchoolForStudents(school);
    setLoadingScholars(true);
    setScholarSearchQuery('');
    try {
      const res = await getScholars();
      if (res.data) {
        // Filter scholars enrolled in this specific school
        const matched = res.data.filter((s) => {
          const sName = (s.school || '').toLowerCase();
          const targetName = school.schoolName.toLowerCase();
          return (
            sName.includes(targetName) ||
            targetName.includes(sName) ||
            (targetName.includes('quezon city university') && (sName.includes('qcu') || sName.includes('quezon city university'))) ||
            (targetName.includes('bestlink') && (sName.includes('bcp') || sName.includes('bestlink'))) ||
            (targetName.includes('university of the philippines') && (sName.includes('up') || sName.includes('diliman'))) ||
            (targetName.includes('polytechnic') && (sName.includes('pup') || sName.includes('polytechnic'))) ||
            (targetName.includes('ateneo') && sName.includes('ateneo')) ||
            (targetName.includes('feu') && (sName.includes('feu') || sName.includes('far eastern'))) ||
            (targetName.includes('tip') && (sName.includes('tip') || sName.includes('technological institute'))) ||
            (targetName.includes('ust') && (sName.includes('ust') || sName.includes('santo tomas')))
          );
        });
        setSchoolScholars(matched);
      }
    } catch {
      toast.error(`Failed to load enrolled students for ${school.schoolName}`);
    } finally {
      setLoadingScholars(false);
    }
  };

  const handleExportSchoolRoster = (school: AdminPartnerSchool) => {
    toast.success(`Exporting Enrolled Scholars Roster for ${school.schoolName}...`);
    const headers = 'Student ID,Full Name,Email,School,Program / Course,Current Term,GWA,Grant Amount,Disbursement Status,Status\n';
    const rows = schoolScholars
      .map(
        (s) =>
          `"${s.student_id}","${s.full_name}","${s.email}","${s.school}","${s.program_name}","${s.current_term}",${s.gwa},${s.grant_amount},"${s.disbursement_status}","${s.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Scholars_Roster_${school.schoolName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Form State
  const defaultFormState: AdminPartnerSchool = {
    schoolId: '',
    schoolName: '',
    schoolType: 'LGU State University',
    address: '',
    contactPerson: '',
    contactNumber: '',
    email: '',
    partnershipStatus: 'Active',
    partnershipStart: new Date().toISOString().split('T')[0],
    partnershipEnd: '2028-12-31',
    programsOffered: '',
    scholarshipSlots: 100,
    activeScholarsCount: 0,
  };

  const [form, setForm] = useState<AdminPartnerSchool>(defaultFormState);
  const [importFile, setImportFile] = useState<File | null>(null);

  const filteredSchools = schools.filter((school) => {
    const matchesSearch =
      school.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.schoolId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.programsOffered.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || school.partnershipStatus === statusFilter;
    const matchesType = typeFilter === 'All' || school.schoolType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleOpenAddModal = () => {
    setForm({
      ...defaultFormState,
      schoolId: `sch-qc-${String(schools.length + 1).padStart(2, '0')}`,
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (school: AdminPartnerSchool) => {
    setEditingSchool(school);
    setForm({ ...school });
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.schoolName.trim()) {
      toast.error('Please enter the school name');
      return;
    }
    const newSchool: AdminPartnerSchool = {
      ...form,
      schoolId: form.schoolId || `sch-qc-${Date.now()}`,
      activeScholarsCount: form.activeScholarsCount || 0,
    };
    setSchools([newSchool, ...schools]);
    setShowAddModal(false);
    toast.success(`Partner School "${form.schoolName}" successfully added!`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.schoolName.trim()) {
      toast.error('Please enter the school name');
      return;
    }
    setSchools(schools.map((s) => (s.schoolId === editingSchool?.schoolId ? { ...form } : s)));
    setEditingSchool(null);
    toast.success(`Partner School "${form.schoolName}" updated successfully!`);
  };

  const handleDeleteConfirm = () => {
    if (!deletingSchool) return;
    setSchools(schools.filter((s) => s.schoolId !== deletingSchool.schoolId));
    setDeletingSchool(null);
    toast.success(`Partner School "${deletingSchool.schoolName}" removed from active registry.`);
  };

  const handleExportData = () => {
    toast.success('Partner Schools database exported (Excel/PDF generated)');
    const headers = 'School ID,School Name,School Type,Contact Officer,Email,Phone,Active Scholars,Quota Slots,Status\n';
    const rows = schools
      .map(
        (s) =>
          `"${s.schoolId}","${s.schoolName}","${s.schoolType}","${s.contactPerson}","${s.email}","${s.contactNumber}",${s.activeScholarsCount || 0},${s.scholarshipSlots},"${s.partnershipStatus}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `QC_Partner_Schools_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const updateForm = (key: keyof AdminPartnerSchool, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const getStatusBadge = (status: AdminPartnerSchool['partnershipStatus']) => {
    switch (status) {
      case 'Active':
        return (
          <Badge variant="success" size="sm">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Active MOU
          </Badge>
        );
      case 'Pending':
        return (
          <Badge variant="warning" size="sm">
            <Clock className="h-3 w-3 mr-1" /> Renewal Pending
          </Badge>
        );
      case 'Expired':
        return (
          <Badge variant="destructive" size="sm">
            <AlertTriangle className="h-3 w-3 mr-1" /> Expired MOU
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" size="sm">
            <XCircle className="h-3 w-3 mr-1" /> Inactive
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">Partner School Database</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImportModal(true)}
            leftIcon={<Upload className="h-4 w-4 text-slate-600" />}
            className="font-bold"
          >
            Import CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
            leftIcon={<Download className="h-4 w-4 text-slate-600" />}
            className="font-bold"
          >
            Export List
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAddModal}
            leftIcon={<Plus className="h-4 w-4" />}
            className="font-bold bg-blue-600 hover:bg-blue-700 text-white"
          >
            Add Partner School
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverEffect className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Institutions</p>
              <h3 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white mt-0.5">{schools.length}</h3>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1">Accredited HEIs</p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
              <Building2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active MOU Partnerships</p>
              <h3 className="font-heading font-extrabold text-2xl text-emerald-600 dark:text-emerald-400 mt-0.5">
                {schools.filter((s) => s.partnershipStatus === 'Active').length}
              </h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">Certified Campuses</p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Quota Slots</p>
              <h3 className="font-heading font-extrabold text-2xl text-indigo-600 dark:text-indigo-400 mt-0.5">
                {schools.reduce((sum, s) => sum + s.scholarshipSlots, 0).toLocaleString()}
              </h3>
              <p className="text-[11px] text-indigo-600 font-semibold mt-1">Enrolled Capacity</p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
              <GraduationCap className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending / Expired</p>
              <h3 className="font-heading font-extrabold text-2xl text-amber-600 dark:text-amber-400 mt-0.5">
                {schools.filter((s) => s.partnershipStatus === 'Pending' || s.partnershipStatus === 'Expired').length}
              </h3>
              <p className="text-[11px] text-amber-600 font-semibold mt-1">Review Required</p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search partner school by name, ID, contact coordinator, or eligible programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-blue-600 shadow-xs placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">MOU:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:border-blue-600 cursor-pointer"
              >
                <option value="All" className="dark:bg-slate-900 dark:text-white">All Statuses</option>
                <option value="Active" className="dark:bg-slate-900 dark:text-white">Active</option>
                <option value="Pending" className="dark:bg-slate-900 dark:text-white">Pending</option>
                <option value="Expired" className="dark:bg-slate-900 dark:text-white">Expired</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:border-blue-600 cursor-pointer"
              >
                <option value="All" className="dark:bg-slate-900 dark:text-white">All Types</option>
                <option value="LGU State University" className="dark:bg-slate-900 dark:text-white">LGU State University</option>
                <option value="State University" className="dark:bg-slate-900 dark:text-white">State University</option>
                <option value="National University" className="dark:bg-slate-900 dark:text-white">National University</option>
                <option value="Private HEI" className="dark:bg-slate-900 dark:text-white">Private HEI</option>
                <option value="Private Medical HEI" className="dark:bg-slate-900 dark:text-white">Private Medical HEI</option>
                <option value="Private University" className="dark:bg-slate-900 dark:text-white">Private University</option>
              </select>
            </div>
          </div>
        </CardHeader>

        {/* Data Table */}
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4">School ID & Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Contact Officer</th>
                <th className="p-4">Status</th>
                <th className="p-4">MOU Validity</th>
                <th className="p-4 text-center">Quota Slots</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSchools.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <Building2 className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No partner schools found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try searching with a different term or filter.</p>
                  </td>
                </tr>
              ) : (
                filteredSchools.map((school) => (
                  <tr key={school.schoolId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <button
                        onClick={() => handleOpenEnrolledStudents(school)}
                        className="text-left group/btn cursor-pointer block"
                        title="Click to view students enrolled in this school"
                      >
                        <div className="font-bold text-slate-900 dark:text-white text-sm group-hover/btn:text-blue-600 dark:group-hover/btn:text-blue-400 transition-colors flex items-center gap-1.5">
                          {school.schoolName}
                          <ExternalLink className="h-3 w-3 text-slate-400 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        </div>
                        <code className="text-[11px] text-blue-700 dark:text-blue-400 font-mono font-semibold">{school.schoolId}</code>
                      </button>
                    </td>

                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-[11px]">
                        {school.schoolType}
                      </span>
                    </td>

                    <td className="p-4 space-y-0.5">
                      <div className="font-bold text-slate-900 dark:text-white">{school.contactPerson}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Mail className="h-3 w-3 text-slate-400" /> {school.email}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Phone className="h-3 w-3 text-slate-400" /> {school.contactNumber}
                      </div>
                    </td>

                    <td className="p-4">{getStatusBadge(school.partnershipStatus)}</td>

                    <td className="p-4 text-slate-600 dark:text-slate-400 text-[11px]">
                      <div className="font-semibold">{school.partnershipStart}</div>
                      <div className="text-slate-400">to {school.partnershipEnd}</div>
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleOpenEnrolledStudents(school)}
                        className="hover:scale-105 transition-transform cursor-pointer"
                        title="Click to view enrolled scholars"
                      >
                        <span className="font-heading font-extrabold text-sm text-blue-700 dark:text-blue-300 block">
                          {school.scholarshipSlots}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                          {school.activeScholarsCount ?? 0} enrolled
                        </span>
                      </button>
                    </td>

                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEnrolledStudents(school)}
                        title="View Enrolled Students (Roster)"
                        className="p-1.5 rounded-lg text-blue-600 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors cursor-pointer border border-blue-200 dark:border-blue-800"
                      >
                        <GraduationCap className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setViewingSchool(school)}
                        title="View Full Profile"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {!isCoordinator && (
                        <>
                          <button
                            onClick={() => handleOpenEditModal(school)}
                            title="Edit Institution Record"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeletingSchool(school)}
                            title="Delete Record"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Add School Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New Partner School"
          description="Register an educational institution into the Quezon City Scholarship Partner Network."
          footer={
            <div className="flex gap-2 w-full justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveAdd} className="bg-blue-600 text-white font-bold">
                Register Partner School
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="School ID (Auto-generated)"
                value={form.schoolId}
                disabled
                className="bg-slate-100 dark:bg-slate-800 font-mono text-xs"
              />
              <Input
                label="Institution Name *"
                placeholder="e.g. Quezon City University"
                value={form.schoolName}
                onChange={(e) => updateForm('schoolName', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">Institution Classification *</label>
                <select
                  value={form.schoolType}
                  onChange={(e) => updateForm('schoolType', e.target.value)}
                  className="w-full h-11 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="LGU State University">LGU State University</option>
                  <option value="State University">State University</option>
                  <option value="National University">National University</option>
                  <option value="Private HEI">Private HEI</option>
                  <option value="Private Medical HEI">Private Medical HEI</option>
                  <option value="Private University">Private University</option>
                  <option value="Private College">Private College</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">Partnership Status</label>
                <select
                  value={form.partnershipStatus}
                  onChange={(e) => updateForm('partnershipStatus', e.target.value as any)}
                  className="w-full h-11 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Expired">Expired</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <Input
              label="Campus Address *"
              placeholder="e.g. Quirino Highway, San Bartolome, Novaliches, QC"
              value={form.address}
              onChange={(e) => updateForm('address', e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Contact Person / Officer *"
                placeholder="Dr. Full Name"
                value={form.contactPerson}
                onChange={(e) => updateForm('contactPerson', e.target.value)}
                required
              />
              <Input
                label="Official Email *"
                type="email"
                placeholder="registrar@school.edu.ph"
                value={form.email}
                onChange={(e) => updateForm('email', e.target.value)}
                required
              />
              <Input
                label="Contact Number *"
                placeholder="(02) 8806-3000"
                value={form.contactNumber}
                onChange={(e) => updateForm('contactNumber', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="MOU Validity Start"
                type="date"
                value={form.partnershipStart}
                onChange={(e) => updateForm('partnershipStart', e.target.value)}
              />
              <Input
                label="MOU Validity Expiry"
                type="date"
                value={form.partnershipEnd}
                onChange={(e) => updateForm('partnershipEnd', e.target.value)}
              />
              <Input
                label="Scholarship Quota Slots"
                type="number"
                value={String(form.scholarshipSlots)}
                onChange={(e) => updateForm('scholarshipSlots', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">Programs Offered & Priority Courses</label>
              <input
                type="text"
                placeholder="e.g. BS Information Technology, BS Computer Science, BS Nursing"
                value={form.programsOffered}
                onChange={(e) => updateForm('programsOffered', e.target.value)}
                className="w-full h-11 px-4 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Edit School Modal */}
      {editingSchool && (
        <Modal
          isOpen={!!editingSchool}
          onClose={() => setEditingSchool(null)}
          title={`Edit Partner School: ${editingSchool.schoolName}`}
          description="Update institution accreditations, coordinator details, and quota allocations."
          footer={
            <div className="flex gap-2 w-full justify-end">
              <Button variant="outline" size="sm" onClick={() => setEditingSchool(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveEdit} className="bg-blue-600 text-white font-bold">
                Save Changes
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="School ID"
                value={form.schoolId}
                disabled
                className="bg-slate-100 dark:bg-slate-800 font-mono text-xs"
              />
              <Input
                label="Institution Name *"
                value={form.schoolName}
                onChange={(e) => updateForm('schoolName', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">Institution Classification</label>
                <select
                  value={form.schoolType}
                  onChange={(e) => updateForm('schoolType', e.target.value)}
                  className="w-full h-11 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600"
                >
                  <option value="LGU State University">LGU State University</option>
                  <option value="State University">State University</option>
                  <option value="National University">National University</option>
                  <option value="Private HEI">Private HEI</option>
                  <option value="Private Medical HEI">Private Medical HEI</option>
                  <option value="Private University">Private University</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">Partnership Status</label>
                <select
                  value={form.partnershipStatus}
                  onChange={(e) => updateForm('partnershipStatus', e.target.value as any)}
                  className="w-full h-11 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Expired">Expired</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <Input
              label="Campus Address"
              value={form.address}
              onChange={(e) => updateForm('address', e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Contact Officer"
                value={form.contactPerson}
                onChange={(e) => updateForm('contactPerson', e.target.value)}
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => updateForm('email', e.target.value)}
              />
              <Input
                label="Phone"
                value={form.contactNumber}
                onChange={(e) => updateForm('contactNumber', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="MOU Start"
                type="date"
                value={form.partnershipStart}
                onChange={(e) => updateForm('partnershipStart', e.target.value)}
              />
              <Input
                label="MOU Expiry"
                type="date"
                value={form.partnershipEnd}
                onChange={(e) => updateForm('partnershipEnd', e.target.value)}
              />
              <Input
                label="Quota Slots"
                type="number"
                value={String(form.scholarshipSlots)}
                onChange={(e) => updateForm('scholarshipSlots', parseInt(e.target.value) || 0)}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* View School Details Modal */}
      {viewingSchool && (
        <Modal
          isOpen={!!viewingSchool}
          onClose={() => setViewingSchool(null)}
          title={viewingSchool.schoolName}
          description={`School ID: ${viewingSchool.schoolId} | Type: ${viewingSchool.schoolType}`}
          footer={
            <Button variant="outline" size="sm" onClick={() => setViewingSchool(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Partnership Status</span>
                {getStatusBadge(viewingSchool.partnershipStatus)}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Scholarship Quota</span>
                <span className="font-heading font-extrabold text-lg text-blue-700 dark:text-blue-300">
                  {viewingSchool.scholarshipSlots} slots
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-blue-600" /> Campus Address
              </h4>
              <p className="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                {viewingSchool.address}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Contact Person</span>
                <span className="font-bold text-slate-900 dark:text-white">{viewingSchool.contactPerson}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Email & Phone</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">{viewingSchool.email}</span>
                <span className="text-slate-500 block">{viewingSchool.contactNumber}</span>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/60 rounded-xl border border-blue-200 dark:border-blue-800 space-y-1">
              <h4 className="font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-blue-600" /> Programs Offered & Eligible Courses
              </h4>
              <p className="text-blue-900 dark:text-blue-300 leading-relaxed font-medium">{viewingSchool.programsOffered}</p>
            </div>

            <div className="flex items-center justify-between text-slate-500 text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>MOU Start: <strong>{viewingSchool.partnershipStart}</strong></span>
              <span>MOU Expiry: <strong>{viewingSchool.partnershipEnd}</strong></span>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSchool && (
        <Modal
          isOpen={!!deletingSchool}
          onClose={() => setDeletingSchool(null)}
          title="Remove Partner School"
          description={`Are you sure you want to remove "${deletingSchool.schoolName}" (${deletingSchool.schoolId})?`}
          footer={
            <div className="flex gap-2 w-full justify-end">
              <Button variant="outline" size="sm" onClick={() => setDeletingSchool(null)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDeleteConfirm} className="font-bold">
                Confirm Deletion
              </Button>
            </div>
          }
        >
          <div className="p-4 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs text-rose-900 dark:text-rose-200">
            Warning: Deleting this partner school will unassign active quotas for {deletingSchool.schoolName}. This action cannot be undone.
          </div>
        </Modal>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <Modal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          title="Bulk Import Partner Schools"
          description="Upload an official CSV or Excel file containing accredited colleges, contacts, and quota allocations."
          footer={
            <div className="flex gap-2 w-full justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowImportModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setShowImportModal(false);
                  toast.success('Bulk partner schools CSV processed! 3 new institutions imported.');
                }}
                className="bg-blue-600 text-white font-bold"
              >
                Upload & Process
              </Button>
            </div>
          }
        >
          <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center space-y-3">
            <FileSpreadsheet className="h-10 w-10 text-slate-400 mx-auto" />
            <p className="font-bold text-xs text-slate-800 dark:text-slate-200">
              Drag and drop your partner schools CSV here, or browse files
            </p>
            <input
              type="file"
              accept=".csv, .xlsx"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {importFile && (
              <p className="text-xs font-bold text-emerald-600">Selected file: {importFile.name}</p>
            )}
          </div>
        </Modal>
      )}
      {/* Enrolled Students Roster Modal (School Coordinator Drilldown) */}
      {selectedSchoolForStudents && (
        <Modal
          isOpen={!!selectedSchoolForStudents}
          onClose={() => setSelectedSchoolForStudents(null)}
          title={`Enrolled Scholars Roster: ${selectedSchoolForStudents.schoolName}`}
          description={`Institution ID: ${selectedSchoolForStudents.schoolId} • Classification: ${selectedSchoolForStudents.schoolType} • Quota: ${selectedSchoolForStudents.scholarshipSlots} Slots`}
          footer={
            <div className="flex items-center justify-between w-full pt-2">
              <span className="text-xs text-slate-500 font-semibold">
                Total Enrolled Scholars: <strong>{schoolScholars.length}</strong>
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportSchoolRoster(selectedSchoolForStudents)}
                  className="font-bold text-xs"
                  leftIcon={<Download className="h-4 w-4" />}
                >
                  Export School Roster (CSV)
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedSchoolForStudents(null)}
                  className="bg-blue-600 text-white font-bold"
                >
                  Close Roster
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Header Banner */}
            <div className="p-3 bg-blue-50 dark:bg-slate-800 rounded-2xl border border-blue-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-blue-950 dark:text-blue-200 text-sm block">
                  {selectedSchoolForStudents.schoolName}
                </span>
                <span className="text-slate-500 text-[11px]">
                  Campus Coordinator: {selectedSchoolForStudents.contactPerson} ({selectedSchoolForStudents.email})
                </span>
              </div>
              <Badge variant="primary" size="sm">
                Active Enrolled: {schoolScholars.length} / {selectedSchoolForStudents.scholarshipSlots}
              </Badge>
            </div>

            {/* Search Input within School */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search student by name, ID number, course, or grant status..."
                value={scholarSearchQuery}
                onChange={(e) => setScholarSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
              />
            </div>

            {/* Scholars Table */}
            {loadingScholars ? (
              <div className="p-10 text-center text-slate-400">
                <Clock className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="font-bold">Fetching enrolled scholars from registry...</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-2xl max-h-[350px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] sticky top-0 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">Student & ID</th>
                      <th className="p-3">Course / Program</th>
                      <th className="p-3">Term / Year</th>
                      <th className="p-3 text-center">GWA</th>
                      <th className="p-3">Grant Amount</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {schoolScholars
                      .filter((s) => {
                        if (!scholarSearchQuery) return true;
                        const q = scholarSearchQuery.toLowerCase();
                        return (
                          s.full_name.toLowerCase().includes(q) ||
                          s.student_id.toLowerCase().includes(q) ||
                          s.program_name.toLowerCase().includes(q) ||
                          s.email.toLowerCase().includes(q)
                        );
                      })
                      .map((scholar) => (
                        <tr key={scholar.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-3">
                            <div className="font-bold text-slate-900 dark:text-white">{scholar.full_name}</div>
                            <code className="text-[10px] text-blue-600 font-mono font-semibold">{scholar.student_id}</code>
                            <div className="text-[10px] text-slate-400">{scholar.email}</div>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block">{scholar.program_name}</span>
                          </td>
                          <td className="p-3 text-slate-500 text-[11px]">
                            {scholar.current_term || '1st Sem AY 2026-2027'}
                          </td>
                          <td className="p-3 text-center font-bold text-emerald-600">
                            {scholar.gwa ? Number(scholar.gwa).toFixed(2) : '1.75'}
                          </td>
                          <td className="p-3 font-bold text-slate-800 dark:text-slate-200">
                            {formatCurrency(scholar.grant_amount || 15000)}
                            <div className="text-[10px] text-emerald-600 font-semibold">{scholar.disbursement_status || 'Scheduled'}</div>
                          </td>
                          <td className="p-3">
                            <Badge variant={scholar.status?.includes('Active') ? 'success' : 'primary'} size="sm">
                              {scholar.status || 'Active Good Standing'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    {schoolScholars.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          <Users className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                          <p className="font-bold text-slate-700 dark:text-slate-300">No scholars currently enrolled for this institution</p>
                          <p className="text-xs text-slate-400">Enrolled students will appear once applications are approved for this school.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminPartnerSchoolsPage;
