import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Search,
  Plus,
  Edit2,
  Trash2,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Mail,
  GraduationCap,
  Users,
  ExternalLink,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { toast } from 'sonner';
import { getPartners } from '../../api/partners';
import { getScholars, type ScholarRegistryRecord } from '../../api/registry';
import { getMyApplications } from '../../api/applications';
import type { Application } from '../../types';
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

export const DEFAULT_PARTNER_SCHOOLS: AdminPartnerSchool[] = [
  {
    schoolId: 'SCH-QC-001',
    schoolName: 'Bestlink College of the Philippines (BCP)',
    schoolType: 'Private',
    address: '1071 Quirino Highway, Brgy. Kaligayahan, Novaliches, Quezon City',
    contactPerson: 'Engr. Charlie I. Cariño (Registrar / Dean)',
    contactNumber: '(02) 8417-4355',
    email: 'registrar@bcp.edu.ph',
    partnershipStatus: 'Active',
    partnershipStart: '2024-01-01',
    partnershipEnd: '2028-12-31',
    programsOffered: 'BSIT, BSCS, BSCpE, BSBA, BSHM, BSED, BEED, BSCRIM',
    scholarshipSlots: 2500,
    activeScholarsCount: 0,
  },
  {
    schoolId: 'SCH-QC-002',
    schoolName: 'Quezon City University (QCU - San Bartolome Main)',
    schoolType: 'LGU University',
    address: '673 Quirino Highway, San Bartolome, Novaliches, Quezon City',
    contactPerson: 'Dr. Aris Ramos (University Registrar)',
    contactNumber: '(02) 8806-3000',
    email: 'registrar@qcu.edu.ph',
    partnershipStatus: 'Active',
    partnershipStart: '2024-01-01',
    partnershipEnd: '2028-12-31',
    programsOffered: 'BSIT, BSCS, BSA, BSBA, BSIE, BECED',
    scholarshipSlots: 3000,
    activeScholarsCount: 0,
  },
  {
    schoolId: 'SCH-QC-003',
    schoolName: 'Quezon City University (QCU - Batasan Campus)',
    schoolType: 'LGU University',
    address: 'Batasan Hills, District 2, Quezon City',
    contactPerson: 'Prof. Melinda De Jesus (Campus Coordinator)',
    contactNumber: '(02) 8951-4022',
    email: 'batasan.registrar@qcu.edu.ph',
    partnershipStatus: 'Active',
    partnershipStart: '2024-01-01',
    partnershipEnd: '2028-12-31',
    programsOffered: 'BSIT, BSBA, BSA, BSED',
    scholarshipSlots: 1500,
    activeScholarsCount: 0,
  },
  {
    schoolId: 'SCH-QC-004',
    schoolName: 'Quezon City University (QCU - San Francisco Campus)',
    schoolType: 'LGU University',
    address: 'San Francisco del Monte, District 1, Quezon City',
    contactPerson: 'Prof. Danilo Reyes (Campus Coordinator)',
    contactNumber: '(02) 8372-8812',
    email: 'sanfrancisco.registrar@qcu.edu.ph',
    partnershipStatus: 'Active',
    partnershipStart: '2024-01-01',
    partnershipEnd: '2028-12-31',
    programsOffered: 'BSIT, BSBA, BSIE',
    scholarshipSlots: 1200,
    activeScholarsCount: 0,
  },
  {
    schoolId: 'SCH-QC-005',
    schoolName: 'University of the Philippines Diliman (UPD)',
    schoolType: 'SUC',
    address: 'Diliman, Quezon City, Metro Manila',
    contactPerson: 'Prof. Carla Gomez (Office of Scholarships)',
    contactNumber: '(02) 8981-8500',
    email: 'scholarships@upd.edu.ph',
    partnershipStatus: 'Active',
    partnershipStart: '2024-01-01',
    partnershipEnd: '2028-12-31',
    programsOffered: 'All Priority STEM, Social Sciences, Allied Health, Engineering',
    scholarshipSlots: 1500,
    activeScholarsCount: 0,
  },
  {
    schoolId: 'SCH-QC-006',
    schoolName: 'Polytechnic University of the Philippines (PUP QC)',
    schoolType: 'SUC',
    address: 'Don Fabian St., Commonwealth, Quezon City',
    contactPerson: 'Prof. Ramon Santos (Branch Director)',
    contactNumber: '(02) 8952-7818',
    email: 'pupqc@pup.edu.ph',
    partnershipStatus: 'Active',
    partnershipStart: '2024-01-01',
    partnershipEnd: '2028-12-31',
    programsOffered: 'BSIT, BSBA, BPA, BSED, BS Accountancy',
    scholarshipSlots: 1000,
    activeScholarsCount: 0,
  },
  {
    schoolId: 'SCH-QC-007',
    schoolName: 'Our Lady of Fatima University (OLFU QC)',
    schoolType: 'Private',
    address: 'Regalado Ave., Fairview, Quezon City',
    contactPerson: 'Dr. Ma. Cristina Santos (Dean / Student Affairs)',
    contactNumber: '(02) 8935-2960',
    email: 'admissions.qc@fatima.edu.ph',
    partnershipStatus: 'Active',
    partnershipStart: '2024-01-01',
    partnershipEnd: '2028-12-31',
    programsOffered: 'BS Nursing, BS Pharmacy, BS Medical Tech, BS Physical Therapy, BSIT, BSBA',
    scholarshipSlots: 1200,
    activeScholarsCount: 0,
  },
  {
    schoolId: 'SCH-QC-008',
    schoolName: 'National University (NU Fairview / QC)',
    schoolType: 'Private',
    address: 'SM City Fairview Complex, Quirino Highway, Quezon City',
    contactPerson: 'Dir. Rafael Alcantara (Academic Registrar)',
    contactNumber: '(02) 8401-7700',
    email: 'admissions@nu-fairview.edu.ph',
    partnershipStatus: 'Active',
    partnershipStart: '2024-01-01',
    partnershipEnd: '2028-12-31',
    programsOffered: 'BS Architecture, BS Civil Engg, BS Computer Science, BSIT, BS Tourism',
    scholarshipSlots: 800,
    activeScholarsCount: 0,
  },
  {
    schoolId: 'SCH-QC-009',
    schoolName: 'Technological Institute of the Philippines (TIP QC)',
    schoolType: 'Private',
    address: '938 Aurora Blvd., Cubao, Quezon City',
    contactPerson: 'Engr. David Tan (Student Financial Assistance)',
    contactNumber: '(02) 8911-0964',
    email: 'info.qc@tip.edu.ph',
    partnershipStatus: 'Active',
    partnershipStart: '2024-01-01',
    partnershipEnd: '2028-12-31',
    programsOffered: 'BS Computer Engg, BSEE, BSME, BSCE, BSCS, BSIT',
    scholarshipSlots: 1000,
    activeScholarsCount: 0,
  },
  {
    schoolId: 'SCH-QC-010',
    schoolName: 'Far Eastern University Diliman (FEU Diliman)',
    schoolType: 'Private',
    address: 'Sampaguita Ave., Mapayapa Village, Quezon City',
    contactPerson: 'Ms. Teresa Mendoza (Admissions Officer)',
    contactNumber: '(02) 8931-6060',
    email: 'admissions@feudiliman.edu.ph',
    partnershipStatus: 'Active',
    partnershipStart: '2024-01-01',
    partnershipEnd: '2028-12-31',
    programsOffered: 'BS Accountancy, BSBA, BSIT, Senior High School Academic Track',
    scholarshipSlots: 600,
    activeScholarsCount: 0,
  },
  {
    schoolId: 'SCH-QC-011',
    schoolName: 'FEU - Nicanor Reyes Medical Foundation (FEU-NRMF)',
    schoolType: 'Private',
    address: 'Regalado Ave., West Fairview, Quezon City',
    contactPerson: 'Dr. Enrique Villanueva (Dean of Medical Services)',
    contactNumber: '(02) 8983-8000',
    email: 'admissions@feunrmf.edu.ph',
    partnershipStatus: 'Active',
    partnershipStart: '2024-01-01',
    partnershipEnd: '2028-12-31',
    programsOffered: 'BS Medical Technology, BS Physical Therapy, BS Radiologic Tech, BS Nursing',
    scholarshipSlots: 500,
    activeScholarsCount: 0,
  },
  {
    schoolId: 'SCH-QC-012',
    schoolName: 'Trinity University of Asia (TUA)',
    schoolType: 'Private',
    address: 'Cathedral Heights, 275 E. Rodriguez Sr. Ave., Quezon City',
    contactPerson: 'Dr. Cynthia Bautista (Registrar & Admissions)',
    contactNumber: '(02) 8702-2882',
    email: 'admissions@tua.edu.ph',
    partnershipStatus: 'Active',
    partnershipStart: '2024-01-01',
    partnershipEnd: '2028-12-31',
    programsOffered: 'BS Nursing, BS Medical Tech, BS Psychology, BSBA, BSED, BSIT',
    scholarshipSlots: 700,
    activeScholarsCount: 0,
  },
  {
    schoolId: 'SCH-QC-013',
    schoolName: 'Ateneo de Manila University (ADMU)',
    schoolType: 'Private',
    address: 'Katipunan Ave., Loyola Heights, Quezon City',
    contactPerson: 'Dir. Joaquin Reyes (Office of Admission and Aid)',
    contactNumber: '(02) 8426-6001',
    email: 'finaid@ateneo.edu',
    partnershipStatus: 'Active',
    partnershipStart: '2024-06-01',
    partnershipEnd: '2028-06-01',
    programsOffered: 'BS Management, BS Computer Science, BS Applied Math, AB Economics',
    scholarshipSlots: 500,
    activeScholarsCount: 0,
  },
  {
    schoolId: 'SCH-QC-014',
    schoolName: 'New Era University (NEU)',
    schoolType: 'Private',
    address: 'No. 9 Central Ave., New Era, Diliman, Quezon City',
    contactPerson: 'Prof. Ernesto Cruz (University Registrar)',
    contactNumber: '(02) 8981-4221',
    email: 'info@neu.edu.ph',
    partnershipStatus: 'Active',
    partnershipStart: '2024-01-01',
    partnershipEnd: '2028-12-31',
    programsOffered: 'BS Civil Engg, BSEE, BS Accountancy, BS Nursing, BSIT, BS Medical Tech',
    scholarshipSlots: 900,
    activeScholarsCount: 0,
  },
  {
    schoolId: 'SCH-QC-015',
    schoolName: 'Miriam College (MC)',
    schoolType: 'Private',
    address: 'Katipunan Ave., Loyola Heights, Quezon City',
    contactPerson: 'Ms. Victoria Salazar (Financial Assistance Desk)',
    contactNumber: '(02) 8930-1393',
    email: 'scholarships@mc.edu.ph',
    partnershipStatus: 'Active',
    partnershipStart: '2024-01-01',
    partnershipEnd: '2028-12-31',
    programsOffered: 'BS Child Development, BS International Studies, BS Communication',
    scholarshipSlots: 400,
    activeScholarsCount: 0,
  },
  {
    schoolId: 'SCH-QC-016',
    schoolName: 'UST - Angelicum College',
    schoolType: 'Private',
    address: '112 Sen. Mariano J. Cuenco St., Santa Mesa Heights, Quezon City',
    contactPerson: 'Rev. Fr. Arthur Dingel (Director)',
    contactNumber: '(02) 8732-2000',
    email: 'admissions@ustangelicum.edu.ph',
    partnershipStatus: 'Active',
    partnershipStart: '2024-01-01',
    partnershipEnd: '2028-12-31',
    programsOffered: 'BSIT, BSBA, AB Communication, Senior High School Academic Track',
    scholarshipSlots: 500,
    activeScholarsCount: 0,
  },
  {
    schoolId: 'SCH-QC-017',
    schoolName: 'St. Paul University Quezon City (SPUQC)',
    schoolType: 'Private',
    address: 'Aurora Blvd. cor. Gilmore Ave., New Manila, Quezon City',
    contactPerson: 'Sr. Bernadette Racadio (Office of Admissions)',
    contactNumber: '(02) 8726-7986',
    email: 'spuqc_admissions@spuqc.edu.ph',
    partnershipStatus: 'Active',
    partnershipStart: '2024-01-01',
    partnershipEnd: '2028-12-31',
    programsOffered: 'BS Nursing, BS Psychology, BSBA, BSED, BS Tourism',
    scholarshipSlots: 450,
    activeScholarsCount: 0,
  },
  {
    schoolId: 'SCH-QC-018',
    schoolName: 'World Citi Colleges (WCC QC)',
    schoolType: 'Private',
    address: '960 Aurora Blvd., Anonas, Quezon City',
    contactPerson: 'Prof. Allan Soriano (Registrar)',
    contactNumber: '(02) 8913-8380',
    email: 'info@worldciticolleges.edu.ph',
    partnershipStatus: 'Active',
    partnershipStart: '2024-01-01',
    partnershipEnd: '2028-12-31',
    programsOffered: 'BS Nursing, BS Medical Tech, BS Aeronautical Engg, BS Aviation',
    scholarshipSlots: 600,
    activeScholarsCount: 0,
  },
  {
    schoolId: 'SCH-QC-019',
    schoolName: 'STI College (Novaliches / Cubao / Fairview)',
    schoolType: 'Private',
    address: 'Quirino Highway, Novaliches, Quezon City',
    contactPerson: 'Mr. Dennis Garcia (Campus Administrator)',
    contactNumber: '(02) 8936-2244',
    email: 'novaliches@sti.edu',
    partnershipStatus: 'Active',
    partnershipStart: '2024-01-01',
    partnershipEnd: '2028-12-31',
    programsOffered: 'BSIT, BSCS, BS Information Systems, BS Tourism, BS Hospitality',
    scholarshipSlots: 800,
    activeScholarsCount: 0,
  },
  {
    schoolId: 'SCH-QC-020',
    schoolName: 'AMA Computer University (AMA QC)',
    schoolType: 'Private',
    address: 'Maximina St., Villa Arca Subd., Project 8, Quezon City',
    contactPerson: 'Engr. Manuel Santos (Registrar)',
    contactNumber: '(02) 8737-5555',
    email: 'customer_service@ama.edu.ph',
    partnershipStatus: 'Active',
    partnershipStart: '2024-01-01',
    partnershipEnd: '2028-12-31',
    programsOffered: 'BS Computer Science, BSIT, BS Computer Engg, BS Cybersecurity',
    scholarshipSlots: 650,
    activeScholarsCount: 0,
  },
  {
    schoolId: 'SCH-QC-021',
    schoolName: 'Metro Manila College (MMC Novaliches)',
    schoolType: 'Private',
    address: 'U-Site, Brgy. Kaligayahan, Novaliches, Quezon City',
    contactPerson: 'Dr. Aurora Miranda (Academic Vice President)',
    contactNumber: '(02) 8936-7080',
    email: 'info@metromanilacollege.edu.ph',
    partnershipStatus: 'Active',
    partnershipStart: '2024-01-01',
    partnershipEnd: '2028-12-31',
    programsOffered: 'BS Criminology, BEED, BSED, BSBA, BSIT, BSHM',
    scholarshipSlots: 800,
    activeScholarsCount: 0,
  },
  {
    schoolId: 'SCH-QC-022',
    schoolName: 'Access Computer College Novaliches',
    schoolType: 'Private',
    address: 'Quirino Highway cor. Zabarte Rd., Novaliches, Quezon City',
    contactPerson: 'Ms. Lorena Bautista (Branch Registrar)',
    contactNumber: '(02) 8930-0588',
    email: 'admissions@access.edu.ph',
    partnershipStatus: 'Active',
    partnershipStart: '2024-01-01',
    partnershipEnd: '2028-12-31',
    programsOffered: 'BSIT, BSBA, BS Hotel and Restaurant Management, Associate in Computer Tech',
    scholarshipSlots: 500,
    activeScholarsCount: 0,
  },
  {
    schoolId: 'SCH-QC-023',
    schoolName: 'Capitol Medical Center Colleges (CMCC)',
    schoolType: 'Private',
    address: 'Quezon Ave. cor. Scout Magbanua St., Quezon City',
    contactPerson: 'Dr. Maria Elena Ocampo (Dean of Health Sciences)',
    contactNumber: '(02) 8372-8888',
    email: 'colleges@capitolmedical.org',
    partnershipStatus: 'Active',
    partnershipStart: '2024-01-01',
    partnershipEnd: '2028-12-31',
    programsOffered: 'BS Nursing, BS Medical Tech, BS Radiologic Tech',
    scholarshipSlots: 400,
    activeScholarsCount: 0,
  },
  {
    schoolId: 'SCH-QC-024',
    schoolName: 'Eulogio Amang Rodriguez Institute of Science and Technology (EARIST QC)',
    schoolType: 'SUC',
    address: 'Bagtican St., Brgy. Sto. Cristo, Bago Bantay, Quezon City',
    contactPerson: 'Prof. Gilberto Ramos (Campus Director)',
    contactNumber: '(02) 8928-1120',
    email: 'earistqc@earist.edu.ph',
    partnershipStatus: 'Active',
    partnershipStart: '2024-01-01',
    partnershipEnd: '2028-12-31',
    programsOffered: 'BS Industrial Tech, BS Electrical Tech, BS Electronics Tech, BS Mechanical Tech, BSED',
    scholarshipSlots: 700,
    activeScholarsCount: 0,
  },
];

export const matchPartnerSchool = (schoolInput: string | undefined | null, partnerSchool: AdminPartnerSchool): boolean => {
  if (!schoolInput) return false;
  const s = schoolInput.toLowerCase().trim();
  const tName = partnerSchool.schoolName.toLowerCase().trim();
  const tId = partnerSchool.schoolId.toLowerCase().trim();

  return (
    s.includes(tName) ||
    tName.includes(s) ||
    s.includes(tId) ||
    (tName.includes('quezon city university') && (s.includes('qcu') || s.includes('quezon city university') || s.includes('san bartolome') || s.includes('batasan') || s.includes('san francisco'))) ||
    (tName.includes('bestlink') && (s.includes('bcp') || s.includes('bestlink'))) ||
    (tName.includes('university of the philippines') && (s.includes('up') || s.includes('diliman') || s.includes('upd'))) ||
    (tName.includes('polytechnic') && (s.includes('pup') || s.includes('polytechnic'))) ||
    (tName.includes('ateneo') && (s.includes('ateneo') || s.includes('admu'))) ||
    (tName.includes('feu') && (s.includes('feu') || s.includes('far eastern') || s.includes('nrmf'))) ||
    (tName.includes('tip') && (s.includes('tip') || s.includes('technological institute'))) ||
    (tName.includes('ust') && (s.includes('ust') || s.includes('santo tomas') || s.includes('angelicum'))) ||
    (tName.includes('fatima') && (s.includes('fatima') || s.includes('olfu'))) ||
    (tName.includes('national university') && (s.includes('nu') || s.includes('fairview'))) ||
    (tName.includes('trinity') && (s.includes('tua') || s.includes('trinity'))) ||
    (tName.includes('new era') && (s.includes('neu') || s.includes('new era'))) ||
    (tName.includes('miriam') && s.includes('miriam')) ||
    (tName.includes('st. paul') && (s.includes('spuqc') || s.includes('paul'))) ||
    (tName.includes('world citi') && (s.includes('wcc') || s.includes('world citi'))) ||
    (tName.includes('sti') && s.includes('sti')) ||
    (tName.includes('ama') && s.includes('ama')) ||
    (tName.includes('metro manila college') && (s.includes('mmc') || s.includes('metro manila'))) ||
    (tName.includes('access') && s.includes('access')) ||
    (tName.includes('capitol medical') && (s.includes('cmcc') || s.includes('capitol'))) ||
    (tName.includes('earist') && s.includes('earist'))
  );
};
export const AdminPartnerSchoolsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isCoordinator = user?.role === 'school_coordinator';

  const [schools, setSchools] = useState<AdminPartnerSchool[]>(DEFAULT_PARTNER_SCHOOLS);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('SCH-QC-001');
  const [activeRosterTab, setActiveRosterTab] = useState<'enrolled' | 'applicants'>('enrolled');
  const [allScholars, setAllScholars] = useState<ScholarRegistryRecord[]>([]);
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [scholarSearchQuery, setScholarSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'students' | 'directory'>('students');

  // Modals for admin management
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState<AdminPartnerSchool | null>(null);
  const [deletingSchool, setDeletingSchool] = useState<AdminPartnerSchool | null>(null);

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
  const [directorySearchQuery, setDirectorySearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  useEffect(() => {
    let isMounted = true;
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [partnersRes, scholarsRes, appsRes] = await Promise.allSettled([
          getPartners(),
          getScholars(),
          getMyApplications(),
        ]);

        let loadedSchools: AdminPartnerSchool[] = DEFAULT_PARTNER_SCHOOLS;

        if (partnersRes.status === 'fulfilled' && partnersRes.value?.data && partnersRes.value.data.length > 0) {
          loadedSchools = partnersRes.value.data.map((p: any) => ({
            schoolId: p.school_id,
            schoolName: p.name,
            schoolType: p.school_type,
            address: p.address,
            contactPerson: p.contact_person || 'N/A',
            contactNumber: p.contact_number || 'N/A',
            email: p.email || 'N/A',
            partnershipStatus: p.partnership_status || 'Active',
            partnershipStart: p.partnership_start || '2024-01-01',
            partnershipEnd: p.partnership_end || '2028-12-31',
            programsOffered: p.programs_offered || '',
            scholarshipSlots: p.scholarship_slots || 100,
            activeScholarsCount: Number(p.active_scholars) || 0,
          }));
        }

        if (isMounted) {
          setSchools(loadedSchools);
          if (scholarsRes.status === 'fulfilled' && scholarsRes.value?.data) {
            setAllScholars(scholarsRes.value.data);
          }
          if (appsRes.status === 'fulfilled' && appsRes.value?.data) {
            setAllApplications(appsRes.value.data);
          }
        }
      } catch (e) {
        console.error('Failed to load partner school database:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAllData();
    return () => { isMounted = false; };
  }, []);

  const currentSchool = schools.find(s => s.schoolId === selectedSchoolId) || schools[0] || DEFAULT_PARTNER_SCHOOLS[0];

  const currentSchoolScholars = allScholars.filter(s => matchPartnerSchool(s.school, currentSchool));

  const currentSchoolApplicants = allApplications.filter(app => {
    const fd = app.form_data || (app as any).formData || {};
    const appSchool = fd.school || fd.university || fd.schoolName || fd.institution || (app as any).school || app.notes || '';
    return matchPartnerSchool(appSchool, currentSchool);
  });

  const handleExportSchoolRoster = (school: AdminPartnerSchool) => {
    toast.success(`Exporting Enrolled Scholars Roster for ${school.schoolName}...`);
    const headers = 'Student ID,Full Name,Email,School,Program / Course,Current Term,GWA,Grant Amount,Disbursement Status,Status\n';
    const rows = currentSchoolScholars
      .map(
        (s) =>
          `"${s.student_id}","${s.full_name}","${s.email}","${s.school}","${s.program_name}","${s.current_term}",${s.gwa},${s.grant_amount},"${s.disbursement_status}","${s.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Enrolled_Scholars_${school.schoolName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleExportApplicantsRoster = (school: AdminPartnerSchool) => {
    toast.success(`Exporting Scholarship Applicants List for ${school.schoolName}...`);
    const headers = 'Reference ID,Applicant Name,Email,School,Program Applied,Year Level,GWA,Income,Date Submitted,Status\n';
    const rows = currentSchoolApplicants
      .map((app) => {
        const fd = app.form_data || (app as any).formData || {};
        const name =
          app.applicant_name ||
          fd.fullName ||
          (fd.firstName ? `${fd.firstName} ${fd.lastName || ''}`.trim() : '') ||
          (app as any).student_name ||
          app.applicant_email ||
          (app as any).email ||
          'N/A';
        const email = app.applicant_email || (app as any).email || fd.email || '';
        const prog = app.program_name || app.title || 'QCSP Scholarship';
        const yl = fd.yearLevel || 'Undergraduate';
        const gwa = fd.gwa || 'N/A';
        const inc = fd.householdIncome || fd.annualIncome || 'N/A';
        const created = app.created_at ? new Date(app.created_at).toISOString().split('T')[0] : 'N/A';
        return `"${app.reference_id || app.id}","${name}","${email}","${school.schoolName}","${prog}","${yl}","${gwa}","${inc}","${created}","${app.status}"`;
      })
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Scholarship_Applicants_${school.schoolName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleOpenAddModal = () => {
    setForm({
      ...defaultFormState,
      schoolId: `sch-qc-${String(schools.length + 1).padStart(2, '0')}`,
    });
    setShowAddModal(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.schoolName.trim()) return;
    setSchools([form, ...schools]);
    setShowAddModal(false);
    toast.success(`Partner School "${form.schoolName}" successfully added!`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchool) return;
    setSchools(schools.map((s) => (s.schoolId === editingSchool.schoolId ? { ...form } : s)));
    setEditingSchool(null);
    toast.success(`Partner School "${form.schoolName}" updated successfully!`);
  };

  const handleDeleteConfirm = () => {
    if (!deletingSchool) return;
    setSchools(schools.filter((s) => s.schoolId !== deletingSchool.schoolId));
    setDeletingSchool(null);
    toast.success(`Partner School "${deletingSchool.schoolName}" removed from active registry.`);
  };

  const handleOpenEditModal = (school: AdminPartnerSchool) => {
    setEditingSchool(school);
    setForm({ ...school });
  };

  const updateForm = (key: keyof AdminPartnerSchool, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const getStatusBadge = (status: AdminPartnerSchool['partnershipStatus']) => {
    switch (status) {
      case 'Active':
        return (
          <Badge variant="success" size="sm">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Active
          </Badge>
        );
      case 'Pending':
        return (
          <Badge variant="warning" size="sm">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
      case 'Expired':
        return (
          <Badge variant="destructive" size="sm">
            <AlertTriangle className="h-3 w-3 mr-1" /> Expired
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

  const filteredDirectorySchools = schools.filter((school) => {
    const matchesSearch =
      school.schoolName.toLowerCase().includes(directorySearchQuery.toLowerCase()) ||
      school.schoolId.toLowerCase().includes(directorySearchQuery.toLowerCase()) ||
      school.contactPerson.toLowerCase().includes(directorySearchQuery.toLowerCase()) ||
      school.programsOffered.toLowerCase().includes(directorySearchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || school.partnershipStatus === statusFilter;
    const matchesType = typeFilter === 'All' || school.schoolType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div className="space-y-1">
          <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
            Students & Applicants: {currentSchool.schoolName}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Institution ID: <strong className="text-slate-700 dark:text-slate-300 font-mono">{currentSchool.schoolId}</strong> • Classification: <strong className="text-slate-700 dark:text-slate-300">{currentSchool.schoolType}</strong> • Quota: <strong className="text-blue-600 dark:text-blue-400">{currentSchool.scholarshipSlots} Slots</strong>
          </p>
        </div>

        {/* Institution Switcher & Top Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* School Selector Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Building2 className="h-4 w-4 text-slate-400" />
            <select
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(e.target.value)}
              className="text-xs font-bold bg-transparent text-slate-800 dark:text-white focus:outline-none cursor-pointer max-w-[200px] sm:max-w-[240px] truncate"
              title="Select Partner School"
            >
              {schools.map((s) => (
                <option key={s.schoolId} value={s.schoolId} className="dark:bg-slate-900 dark:text-white">
                  {s.schoolName}
                </option>
              ))}
            </select>
          </div>

          {!isCoordinator && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'students' ? 'directory' : 'students')}
              className="font-bold text-xs"
              leftIcon={<Building2 className="h-4 w-4 text-slate-600" />}
            >
              {viewMode === 'students' ? 'All Institutions' : 'Students & Applicants'}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/master-students')}
            className="font-bold text-xs border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-50"
            leftIcon={<ExternalLink className="h-3.5 w-3.5" />}
          >
            Master Student DB
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(isCoordinator ? '/school/endorsements' : '/admin/applications')}
            className="font-bold text-xs border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-50"
            leftIcon={<ExternalLink className="h-3.5 w-3.5" />}
          >
            {isCoordinator ? 'Review Endorsements' : 'All Applications'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => (activeRosterTab === 'enrolled' ? handleExportSchoolRoster(currentSchool) : handleExportApplicantsRoster(currentSchool))}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
            leftIcon={<Download className="h-4 w-4" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {viewMode === 'students' ? (
        /* MAIN FULL-PAGE STUDENTS & APPLICANTS VIEW */
        <div className="space-y-4">
          {/* Institution Info Card / Banner */}
          <div className="p-4 bg-blue-50/70 dark:bg-slate-900/80 rounded-3xl border border-blue-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div>
              <span className="font-heading font-extrabold text-blue-950 dark:text-blue-200 text-base block">
                {currentSchool.schoolName}
              </span>
              <span className="text-slate-600 dark:text-slate-400 text-xs font-medium mt-0.5 block">
                Campus Coordinator: <strong>{currentSchool.contactPerson}</strong> ({currentSchool.email})
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-500 mt-1 block">
                📍 {currentSchool.address} • MOU Validity: {currentSchool.partnershipStart} to {currentSchool.partnershipEnd}
              </span>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/master-students')}
                className="text-xs font-bold border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                leftIcon={<ExternalLink className="h-3.5 w-3.5" />}
              >
                Master Student DB
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(isCoordinator ? '/school/endorsements' : '/admin/applications')}
                className="text-xs font-bold border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                leftIcon={<ExternalLink className="h-3.5 w-3.5" />}
              >
                {isCoordinator ? 'Review Endorsements' : 'Review Applications'}
              </Button>
            </div>
          </div>

          {/* DUAL TABS */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setActiveRosterTab('enrolled')}
              className={`pb-3 px-5 font-bold text-xs sm:text-sm flex items-center gap-2.5 border-b-2 transition-all cursor-pointer ${
                activeRosterTab === 'enrolled'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>Currently Enrolled Scholars</span>
              <span
                className={`text-[11px] px-2.5 py-0.5 rounded-full font-extrabold ${
                  activeRosterTab === 'enrolled'
                    ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {currentSchoolScholars.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRosterTab('applicants')}
              className={`pb-3 px-5 font-bold text-xs sm:text-sm flex items-center gap-2.5 border-b-2 transition-all cursor-pointer ${
                activeRosterTab === 'applicants'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Scholarship Applicants</span>
              <span
                className={`text-[11px] px-2.5 py-0.5 rounded-full font-extrabold ${
                  activeRosterTab === 'applicants'
                    ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {currentSchoolApplicants.length}
              </span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={
                activeRosterTab === 'enrolled'
                  ? 'Search enrolled student by name, student ID, course, or grant status...'
                  : 'Search applicant by name, reference ID, track, or application status...'
              }
              value={scholarSearchQuery}
              onChange={(e) => setScholarSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white shadow-xs"
            />
          </div>

          {/* Data Table */}
          {loading ? (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <Clock className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="font-bold text-sm">Loading institution database & records...</p>
            </div>
          ) : activeRosterTab === 'enrolled' ? (
            /* TAB 1: ENROLLED SCHOLARS TABLE */
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-4">Student & ID</th>
                      <th className="p-4">Course / Program</th>
                      <th className="p-4">Term / Year</th>
                      <th className="p-4 text-center">GWA</th>
                      <th className="p-4">Grant Amount</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {currentSchoolScholars
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
                        <tr key={scholar.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-slate-900 dark:text-white text-sm">{scholar.full_name}</div>
                            <code className="text-[11px] text-blue-600 font-mono font-semibold">{scholar.student_id}</code>
                            <div className="text-[11px] text-slate-400">{scholar.email}</div>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block">{scholar.program_name}</span>
                          </td>
                          <td className="p-4 text-slate-500 dark:text-slate-400 text-xs">
                            {scholar.current_term || '1st Sem AY 2026-2027'}
                          </td>
                          <td className="p-4 text-center font-bold text-emerald-600 text-sm">
                            {scholar.gwa ? Number(scholar.gwa).toFixed(2) : '1.75'}
                          </td>
                          <td className="p-4 font-bold text-slate-900 dark:text-white">
                            {formatCurrency(scholar.grant_amount || 15000)}
                            <div className="text-[10px] text-emerald-600 font-semibold">{scholar.disbursement_status || 'Scheduled'}</div>
                          </td>
                          <td className="p-4">
                            <Badge variant={scholar.status?.includes('Active') ? 'success' : 'primary'} size="sm">
                              {scholar.status || 'Active Good Standing'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    {currentSchoolScholars.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-slate-400">
                          <GraduationCap className="h-10 w-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                          <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">No scholars currently enrolled for this institution</p>
                          <p className="text-xs text-slate-400 mt-1">Enrolled students will appear here once applications are officially approved for this partner school.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* TAB 2: SCHOLARSHIP APPLICANTS TABLE */
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-4">Applicant & Ref ID</th>
                      <th className="p-4">Track / Program</th>
                      <th className="p-4">Course & Year</th>
                      <th className="p-4 text-center">GWA</th>
                      <th className="p-4">Date Applied</th>
                      <th className="p-4">Application Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {currentSchoolApplicants
                      .filter((app) => {
                        if (!scholarSearchQuery) return true;
                        const q = scholarSearchQuery.toLowerCase();
                        const fd = app.form_data || (app as any).formData || {};
                        const name = (
                          app.applicant_name ||
                          fd.fullName ||
                          (fd.firstName ? `${fd.firstName} ${fd.lastName || ''}`.trim() : '') ||
                          (app as any).student_name ||
                          'Applicant (Pending Name)'
                        ).toLowerCase();
                        const ref = String(app.reference_id || app.id).toLowerCase();
                        const prog = (app.program_name || app.title || '').toLowerCase();
                        const stat = String(app.status || '').toLowerCase();
                        return name.includes(q) || ref.includes(q) || prog.includes(q) || stat.includes(q);
                      })
                      .map((app) => {
                        const fd = app.form_data || (app as any).formData || {};
                        const applicantName =
                          app.applicant_name ||
                          fd.fullName ||
                          (fd.firstName ? `${fd.firstName} ${fd.lastName || ''}`.trim() : '') ||
                          (app as any).student_name ||
                          'Applicant (Pending Name)';
                        const email = app.applicant_email || (app as any).email || fd.email || '';
                        const course = fd.course || fd.program || 'Academic Program';
                        const yearLevel = fd.yearLevel || 'Undergraduate';
                        const gwa = fd.gwa || 'N/A';
                        const dateApplied = app.created_at ? new Date(app.created_at).toLocaleDateString() : 'Recent';

                        const getAppBadge = (statusStr: string) => {
                          const s = statusStr?.toLowerCase() || '';
                          if (s.includes('approve')) return <Badge variant="success" size="sm">Approved</Badge>;
                          if (s.includes('endorse') || s.includes('pending')) return <Badge variant="warning" size="sm">{statusStr}</Badge>;
                          if (s.includes('reject')) return <Badge variant="destructive" size="sm">Rejected</Badge>;
                          return <Badge variant="primary" size="sm">{statusStr || 'Submitted'}</Badge>;
                        };

                        return (
                          <tr key={app.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="p-4">
                              <div className="font-bold text-slate-900 dark:text-white text-sm">{applicantName}</div>
                              <code className="text-[11px] text-blue-600 font-mono font-semibold">
                                {app.reference_id || `APP-${app.id}`}
                              </code>
                              {email && <div className="text-[11px] text-slate-400">{email}</div>}
                            </td>
                            <td className="p-4">
                              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                                {app.program_name || app.title || 'QCSP Scholarship'}
                              </span>
                            </td>
                            <td className="p-4 text-slate-600 dark:text-slate-300">
                              <div className="font-medium">{course}</div>
                              <div className="text-[11px] text-slate-400">{yearLevel}</div>
                            </td>
                            <td className="p-4 text-center font-bold text-blue-600 text-sm">
                              {gwa}
                            </td>
                            <td className="p-4 text-slate-500 text-xs">
                              {dateApplied}
                            </td>
                            <td className="p-4">
                              {getAppBadge(app.status || 'Submitted')}
                            </td>
                            <td className="p-4 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(isCoordinator ? '/school/endorsements' : '/admin/applications')}
                                className="font-bold text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
                                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                              >
                                {isCoordinator ? 'Review & Endorse' : 'Review App'}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    {currentSchoolApplicants.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-slate-400">
                          <FileText className="h-10 w-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                          <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">No applicants currently applying from this institution</p>
                          <p className="text-xs text-slate-400 mt-1">Students who select {currentSchool.schoolName} in their application form will show up here.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Page Footer Summary Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 shadow-soft">
            <div className="flex items-center gap-3">
              <span>Enrolled Scholars: <strong className="text-slate-900 dark:text-white font-extrabold">{currentSchoolScholars.length}</strong></span>
              <span>•</span>
              <span>Active Applicants: <strong className="text-slate-900 dark:text-white font-extrabold">{currentSchoolApplicants.length}</strong></span>
              <span>•</span>
              <span>Institution Quota: <strong className="text-blue-600 font-extrabold">{currentSchool.scholarshipSlots}</strong></span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => (activeRosterTab === 'enrolled' ? handleExportSchoolRoster(currentSchool) : handleExportApplicantsRoster(currentSchool))}
              className="font-bold text-xs"
              leftIcon={<Download className="h-4 w-4" />}
            >
              Export {activeRosterTab === 'enrolled' ? 'Enrolled' : 'Applicants'} (CSV)
            </Button>
          </div>
        </div>
      ) : (
        /* ALL INSTITUTIONS DIRECTORY OVERVIEW (FOR ADMINS) */
        <div className="space-y-4">
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search partner school by name, ID, contact coordinator, or eligible programs..."
                  value={directorySearchQuery}
                  onChange={(e) => setDirectorySearchQuery(e.target.value)}
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
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Type:</span>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="All">All Types</option>
                    <option value="Private">Private</option>
                    <option value="LGU University">LGU University</option>
                    <option value="SUC">SUC</option>
                  </select>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenAddModal}
                  leftIcon={<Plus className="h-4 w-4" />}
                  className="font-bold bg-blue-600 text-white"
                >
                  Add Partner School
                </Button>
              </div>
            </CardHeader>

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
                  {filteredDirectorySchools.map((school) => (
                    <tr key={school.schoolId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <button
                          onClick={() => {
                            setSelectedSchoolId(school.schoolId);
                            setViewMode('students');
                          }}
                          className="text-left group/btn cursor-pointer block"
                          title="Click to view students and applicants for this school"
                        >
                          <div className="font-bold text-slate-900 dark:text-white text-sm group-hover/btn:text-blue-600 transition-colors flex items-center gap-1.5">
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
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Mail className="h-3 w-3 text-slate-400" /> {school.email}
                        </div>
                      </td>
                      <td className="p-4">{getStatusBadge(school.partnershipStatus)}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-400 text-[11px]">
                        <div className="font-semibold">{school.partnershipStart}</div>
                        <div className="text-slate-400">to {school.partnershipEnd}</div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-heading font-extrabold text-sm text-blue-700 dark:text-blue-300 block">
                          {school.scholarshipSlots} slots
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1">
                        <button
                          onClick={() => {
                            setSelectedSchoolId(school.schoolId);
                            setViewMode('students');
                          }}
                          title="View Students & Applicants"
                          className="p-1.5 rounded-lg text-blue-600 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200 dark:border-blue-800"
                        >
                          <Users className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(school)}
                          title="Edit Institution Record"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingSchool(school)}
                          title="Delete Record"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

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
                  className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600"
                >
                  <option value="LGU State University">LGU State University</option>
                  <option value="State University">State University</option>
                  <option value="National University">National University</option>
                  <option value="Private HEI">Private HEI</option>
                  <option value="Private Medical HEI">Private Medical HEI</option>
                  <option value="Private University">Private University</option>
                </select>
              </div>
              <Input
                label="Total Scholarship Slots Allocation *"
                type="number"
                value={form.scholarshipSlots}
                onChange={(e) => updateForm('scholarshipSlots', parseInt(e.target.value) || 0)}
                required
              />
            </div>

            <Input
              label="Campus Address *"
              placeholder="e.g. Quirino Highway, Novaliches, Quezon City"
              value={form.address}
              onChange={(e) => updateForm('address', e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Campus Coordinator *"
                placeholder="e.g. Dr. Maria Santos"
                value={form.contactPerson}
                onChange={(e) => updateForm('contactPerson', e.target.value)}
                required
              />
              <Input
                label="Contact Number"
                placeholder="e.g. (02) 8806-3000"
                value={form.contactNumber}
                onChange={(e) => updateForm('contactNumber', e.target.value)}
              />
              <Input
                label="Official Email *"
                type="email"
                placeholder="e.g. registrar@school.edu.ph"
                value={form.email}
                onChange={(e) => updateForm('email', e.target.value)}
                required
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
          title={`Edit Institution: ${editingSchool.schoolName}`}
          description="Update partner school information, quota, or accreditation status."
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
              <Input label="School ID" value={form.schoolId} disabled className="bg-slate-100 dark:bg-slate-800 font-mono text-xs" />
              <Input
                label="Institution Name *"
                value={form.schoolName}
                onChange={(e) => updateForm('schoolName', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">Partnership Status</label>
                <select
                  value={form.partnershipStatus}
                  onChange={(e) => updateForm('partnershipStatus', e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600"
                >
                  <option value="Active">Active MOU</option>
                  <option value="Pending">Renewal Pending</option>
                  <option value="Expired">Expired MOU</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <Input
                label="Quota Slots *"
                type="number"
                value={form.scholarshipSlots}
                onChange={(e) => updateForm('scholarshipSlots', parseInt(e.target.value) || 0)}
                required
              />
            </div>
          </form>
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
    </div>
  );
};

export default AdminPartnerSchoolsPage;
