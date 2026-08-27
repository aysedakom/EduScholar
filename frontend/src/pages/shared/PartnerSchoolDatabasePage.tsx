import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Search,
  MapPin,
  Mail,
  CheckCircle2,
  Globe,
  ExternalLink,
  Phone,
  GraduationCap,
  ArrowRight,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/cn';

interface PartneredScholarship {
  id: string;
  title: string;
  type: 'LGU Grant' | 'Merit Scholarship' | 'Continuing Education Aid' | 'Need-Based Bursary';
  amount: number;
  coverage: string;
  description: string;
}

interface PartnerSchool {
  id: string;
  name: string;
  shortName: string;
  type: 'LGU University' | 'State University' | 'Private University' | 'Technical Institute';
  description: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  activeScholars: number;
  programs: string[];
  partneredScholarships: PartneredScholarship[];
  status: 'Accredited' | 'Partner Active';
}

const PARTNER_SCHOOLS: PartnerSchool[] = [
  {
    id: 'qcu',
    name: 'Quezon City University (QCU)',
    shortName: 'QCU',
    type: 'LGU University',
    description:
      "Quezon City's flagship LGU university offering fully-subsidized higher education, STEM degree programs, and community technology innovation initiatives.",
    address: '673 Quirino Highway, San Bartolome, Novaliches, Quezon City',
    email: 'scholarships@qcu.edu.ph',
    phone: '(02) 8806-3324',
    website: 'https://qcu.edu.ph',
    activeScholars: 420,
    programs: ['BS Information Technology', 'BS Entrepreneurship', 'BS Industrial Engineering', 'Diploma in IT'],
    status: 'Accredited',
    partneredScholarships: [
      {
        id: 'qc-tech-stem',
        title: 'QC Tech Giants STEM Scholarship',
        type: 'LGU Grant',
        amount: 25000,
        coverage: 'Per Semester + Monthly Allowance',
        description: 'Full tuition coverage and monthly laptop allowance for IT & Engineering majors enrolled at QCU.',
      },
      {
        id: 'qc-lgu-honor',
        title: 'QC LGU Honor Scholar Grant',
        type: 'Merit Scholarship',
        amount: 15000,
        coverage: 'Per Semester',
        description: 'Merit grant awarded to graduating Quezon City senior high honor students admitted into QCU.',
      },
      {
        id: 'qcu-research-grant',
        title: 'QCU Undergraduate Research & Innovation Aid',
        type: 'Continuing Education Aid',
        amount: 12000,
        coverage: 'Per Semester Research Grant',
        description: 'Undergraduate capstone and project innovation research stipend for qualified QCU STEM scholars.',
      },
    ],
  },
  {
    id: 'upd',
    name: 'University of the Philippines Diliman (UPD)',
    shortName: 'UP Diliman',
    type: 'State University',
    description:
      'Premier national university providing comprehensive undergraduate research, science, engineering, and public administration education in Quezon City.',
    address: 'Diliman, Quezon City, Metro Manila',
    email: 'osg.updiliman@up.edu.ph',
    phone: '(02) 8981-8500',
    website: 'https://upd.edu.ph',
    activeScholars: 310,
    programs: ['BS Computer Science', 'BS Civil Engineering', 'BA Communication', 'BS Molecular Biology'],
    status: 'Accredited',
    partneredScholarships: [
      {
        id: 'upd-deans-merit',
        title: 'Dean’s Excellence Merit Scholarship',
        type: 'Merit Scholarship',
        amount: 30000,
        coverage: 'Per Semester',
        description: 'High-academic performance stipend for UP Diliman undergraduate scholars maintaining a GPA of 1.75 or higher.',
      },
      {
        id: 'upd-first-gen',
        title: 'First-Gen Hardship Emergency Grant',
        type: 'Need-Based Bursary',
        amount: 20000,
        coverage: 'Per Semester + Book Fund',
        description: 'Financial assistance for first-generation university scholars living in Quezon City barangays.',
      },
    ],
  },
  {
    id: 'admu',
    name: 'Ateneo de Manila University',
    shortName: 'Ateneo',
    type: 'Private University',
    description:
      'Private Jesuit research institution renowned for leadership development, management engineering, ethics, and social action in Katipunan, Quezon City.',
    address: 'Katipunan Ave, Loyola Heights, Quezon City',
    email: 'finaid@ateneo.edu',
    phone: '(02) 8426-6001',
    website: 'https://ateneo.edu',
    activeScholars: 185,
    programs: ['BS Management Engineering', 'BS Computer Science', 'AB Economics'],
    status: 'Partner Active',
    partneredScholarships: [
      {
        id: 'admu-qc-leadership',
        title: 'Ateneo-QC LGU Leadership Equity Grant',
        type: 'LGU Grant',
        amount: 50000,
        coverage: 'Full Tuition & Dorm Support',
        description: 'Full equity grant for high-achieving Quezon City public school graduates pursuing degrees at Ateneo.',
      },
      {
        id: 'admu-katipunan-bursary',
        title: 'Katipunan Scholar Living Allowance Bursary',
        type: 'Need-Based Bursary',
        amount: 25000,
        coverage: 'Per Semester',
        description: 'Need-based book allowance, meal plan, and transportation grant for active QC scholars.',
      },
    ],
  },
  {
    id: 'pup-qc',
    name: 'Polytechnic University of the Philippines - QC Campus',
    shortName: 'PUP QC',
    type: 'State University',
    description:
      'State university campus in Commonwealth, Quezon City focused on polytechnic education, business administration, and public governance.',
    address: 'Don Fabian St., Commonwealth, Quezon City',
    email: 'quezoncity@pup.edu.ph',
    phone: '(02) 8952-7818',
    website: 'https://pup.edu.ph',
    activeScholars: 240,
    programs: ['BS Information Technology', 'BS Business Administration', 'BS Public Administration'],
    status: 'Accredited',
    partneredScholarships: [
      {
        id: 'pup-commonwealth-bursary',
        title: 'PUP Commonwealth Financial Bursary',
        type: 'Need-Based Bursary',
        amount: 15000,
        coverage: 'Per Semester',
        description: 'Allowance support for PUP QC scholars maintaining good academic standing.',
      },
      {
        id: 'pup-academic-aid',
        title: 'QC-PUP Academic Honors & Leadership Grant',
        type: 'Continuing Education Aid',
        amount: 10000,
        coverage: 'Per Semester',
        description: 'Educational development and leadership grant for qualified PUP Quezon City scholars.',
      },
    ],
  },
  {
    id: 'tip-qc',
    name: 'Technological Institute of the Philippines - QC',
    shortName: 'TIP QC',
    type: 'Private University',
    description:
      'ABET-accredited engineering & computing college in Cubao, Quezon City preparing students for global technology careers.',
    address: '938 Aurora Blvd, Cubao, Quezon City',
    email: 'scholarships.qc@tip.edu.ph',
    phone: '(02) 8911-0964',
    website: 'https://tip.edu.ph',
    activeScholars: 195,
    programs: ['BS Computer Engineering', 'BS Architecture', 'BS Electrical Engineering'],
    status: 'Accredited',
    partneredScholarships: [
      {
        id: 'tip-engineering-grant',
        title: 'TIP Engineering Excellence Grant',
        type: 'Merit Scholarship',
        amount: 35000,
        coverage: 'Tuition Discount + Lab Subsidy',
        description: 'Specialized grant for Computer, Civil, & Electrical Engineering majors at TIP Quezon City.',
      },
      {
        id: 'tip-tech-innovator',
        title: 'QC LGU Tech Innovator Bursary',
        type: 'LGU Grant',
        amount: 20000,
        coverage: 'Per Semester',
        description: 'Technology capstone project stipend for TIP engineering scholars.',
      },
    ],
  },
  {
    id: 'mc',
    name: 'Miriam College',
    shortName: 'MC',
    type: 'Private University',
    description:
      'Premier educational institution in Loyola Heights, Quezon City dedicated to women’s leadership, international studies, and early childhood education.',
    address: 'Katipunan Ave, Loyola Heights, Quezon City',
    email: 'scholarships@mc.edu.ph',
    phone: '(02) 8930-6272',
    website: 'https://mc.edu.ph',
    activeScholars: 98,
    programs: ['BA International Studies', 'BS Psychology', 'Bachelor of Early Childhood Education'],
    status: 'Partner Active',
    partneredScholarships: [
      {
        id: 'mc-women-leadership',
        title: 'Miriam Women Leadership Scholarship',
        type: 'Merit Scholarship',
        amount: 30000,
        coverage: 'Per Semester',
        description: 'Scholarship for female QC scholars pursuing degrees in International Studies, Psychology, & Education.',
      },
      {
        id: 'mc-educator-bursary',
        title: 'QC Community Educator Bursary',
        type: 'Need-Based Bursary',
        amount: 18000,
        coverage: 'Per Semester',
        description: 'Financial grant for future QC public school teachers enrolled at Miriam College.',
      },
    ],
  },
];

export const PartnerSchoolDatabasePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [expandedSchools, setExpandedSchools] = useState<Record<string, boolean>>({});

  const filteredSchools = PARTNER_SCHOOLS.filter((school) => {
    const matchesSearch =
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.partneredScholarships.some((s) => s.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'All' || school.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleApplyScholarship = (scholarshipTitle: string) => {
    navigate(`/scholarships?search=${encodeURIComponent(scholarshipTitle)}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-soft border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-slate-900">
              Partner School Database & Verified Scholarships
            </h1>
            <Badge variant="primary">LGU Verified</Badge>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Explore accredited Quezon City partner universities, view verified institutional scholarships, and apply for financial aid tailored to your school.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => navigate('/scholarships')} className="font-bold shrink-0">
          Browse All Scholarships →
        </Button>
      </div>

      {/* Search & Filter Options */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Input
            placeholder="Search school name, description, or scholarship grant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="h-4 w-4 text-slate-400" />}
          />
        </div>

        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {['All', 'LGU University', 'State University', 'Private University'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === t
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Partner Schools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {filteredSchools.map((school) => {
          const isExpanded = !!expandedSchools[school.id];
          return (
            <Card key={school.id} hoverEffect className="bg-white border border-slate-200 shadow-soft flex flex-col justify-between overflow-hidden">
              <div>
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-base shrink-0 border border-blue-200">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-base text-slate-900 line-clamp-1">{school.name}</CardTitle>
                        <span className="text-[11px] font-semibold text-slate-500">{school.type}</span>
                      </div>
                    </div>
                    <Badge variant="success" size="sm" className="shrink-0">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {school.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 text-xs text-slate-600 pt-4 pb-2">
                  {/* Short Overview Description */}
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/80 font-normal">
                    {school.description}
                  </p>

                  {/* Address & Contact Details */}
                  <div className="space-y-1.5 text-slate-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{school.address}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                      <a href={`mailto:${school.email}`} className="text-blue-600 hover:underline truncate">
                        {school.email}
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>{school.phone}</span>
                    </div>
                  </div>

                  {/* Active Scholars & Accredited Programs */}
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">Active QC Scholars Enrolled:</span>
                      <span className="font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                        {school.activeScholars} Scholars
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {school.programs.map((prog, idx) => (
                        <span key={idx} className="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[10px] font-semibold text-slate-700">
                          {prog}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Verified Partnered Scholarships Section */}
                  <div className="space-y-2.5 pt-1">
                    <button
                      onClick={() => setExpandedSchools((prev) => ({ ...prev, [school.id]: !prev[school.id] }))}
                      className="w-full flex items-center justify-between text-slate-900 font-extrabold text-xs bg-slate-50 hover:bg-slate-100/80 p-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4 text-blue-600" />
                        <span>Verified Partnered Scholarships</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          {school.partneredScholarships.length} Available
                        </span>
                        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="space-y-2 mt-2 animate-in slide-in-from-top-2 duration-200">
                        {school.partneredScholarships.map((sch) => (
                          <div
                            key={sch.id}
                            className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 shadow-xs transition-all space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                  <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                  {sch.title}
                                </h4>
                                <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                                  {sch.coverage}
                                </span>
                              </div>
                              <span className="font-extrabold text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 shrink-0">
                                {formatCurrency(sch.amount)}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              {sch.description}
                            </p>

                            <div className="pt-1 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                                {sch.type}
                              </span>
                              <button
                                onClick={() => handleApplyScholarship(sch.title)}
                                className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                              >
                                Apply for Scholarship
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </div>

              {/* Card Footer Action: Official Website */}
              <div className="p-4 pt-2 border-t border-slate-100 mt-2">
                <a
                  href={school.website}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all border border-slate-200 shadow-xs"
                >
                  <Globe className="h-3.5 w-3.5 text-slate-600" />
                  Visit {school.shortName} Official Website
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </a>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
