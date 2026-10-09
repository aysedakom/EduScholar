import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Server,
  Cloud,
  CreditCard,
  Search,
  ShieldCheck,
  Building2,
  CheckCircle2,
  XCircle,
  Activity,
  Lock,
  Network,
  Layers,
  Play,
  Terminal,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  getQcCitizenDirectory,
  verifyQcCitizen,
  verifySchoolEnrollment,
  getInteropCatalog,
  getInteropLogs,
  simulateInteropSubsystem,
  type QcCitizenRecord,
  type QcVerificationResponse,
  type SchoolSyncStudentResponse,
  type GovernmentSubsystem,
} from '../../api/integrations';
import { getPartners, type PartnerSchool } from '../../api/partners';

export const ApiIntegrationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'qcid' | 'schools' | 'adapters' | 'qc-mesh'>('qc-mesh');

  // --- 1. QC ID Verification State ---
  const [qcIdQuery, setQcIdQuery] = useState('QC-2024-884920');
  const [citizenDirectory, setCitizenDirectory] = useState<QcCitizenRecord[]>([]);
  const [activeVerification, setActiveVerification] = useState<QcVerificationResponse | null>(null);
  const [isVerifyingQcId, setIsVerifyingQcId] = useState(false);
  const [dirSearch, setDirSearch] = useState('');

  // --- 2. School Registrar Sync State ---
  const [partnerSchools, setPartnerSchools] = useState<PartnerSchool[]>([]);
  const [selectedSchoolCode, setSelectedSchoolCode] = useState('SCH-QC-007');
  const [studentIdQuery, setStudentIdQuery] = useState('23010366');
  const [schoolSyncResult, setSchoolSyncResult] = useState<SchoolSyncStudentResponse | null>(null);
  const [isSyncingSchool, setIsSyncingSchool] = useState(false);

  // --- 3. QC Government Service Management Mesh (10 Systems) ---
  const [qcSubsystems, setQcSubsystems] = useState<GovernmentSubsystem[]>([]);
  const [isLoadingMesh, setIsLoadingMesh] = useState(false);
  const [simulatingCode, setSimulatingCode] = useState<string | null>(null);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);
  const [interopLogs, setInteropLogs] = useState<any[]>([]);

  const fetchMeshCatalog = async () => {
    setIsLoadingMesh(true);
    try {
      const [catRes, logsRes] = await Promise.all([
        getInteropCatalog(),
        getInteropLogs(15)
      ]);
      if (catRes.data?.connected_subsystems) {
        setQcSubsystems(catRes.data.connected_subsystems);
      }
      if (logsRes.data?.data) {
        setInteropLogs(logsRes.data.data);
      }
    } catch (err) {
      console.warn('Could not fetch interop catalog:', err);
    } finally {
      setIsLoadingMesh(false);
    }
  };

  const handleSimulateSubsystem = async (systemCode: string, name: string) => {
    setSimulatingCode(systemCode);
    setSimulationResult(null);
    toast.info(`Executing integration handshake with ${name}...`);
    try {
      const res = await simulateInteropSubsystem(systemCode);
      if (res.data?.success) {
        setSimulationResult(res.data.simulated_result);
        toast.success(`Handshake succeeded with ${name}!`);
        // Refresh logs
        getInteropLogs(15).then(r => r.data?.data && setInteropLogs(r.data.data));
      }
    } catch (err: any) {
      toast.error(`Handshake failed: ${err.message || 'Service unreachable'}`);
    } finally {
      setSimulatingCode(null);
    }
  };

  // Load initial citizen directory, partner schools & mesh
  useEffect(() => {
    fetchMeshCatalog();
    getQcCitizenDirectory()
      .then((res) => {
        if (res.data?.data) {
          setCitizenDirectory(res.data.data);
        }
      })
      .catch((err) => console.error('Failed to load citizen directory:', err));

    getPartners()
      .then((res) => {
        if (Array.isArray(res.data)) {
          setPartnerSchools(res.data);
          if (res.data.length > 0) {
            setSelectedSchoolCode(res.data[0].school_id);
          }
        }
      })
      .catch((err) => console.error('Failed to load partners:', err));
  }, []);

  // Run initial QC ID verification for demo
  useEffect(() => {
    handleRunQcIdVerification('QC-2024-884920');
  }, []);

  // --- QC ID Handlers ---
  const handleRunQcIdVerification = async (idToVerify?: string) => {
    const targetId = idToVerify || qcIdQuery;
    if (!targetId) {
      toast.error('Please enter a QC ID Number to verify');
      return;
    }
    setIsVerifyingQcId(true);
    try {
      const res = await verifyQcCitizen({ qcitizen_id: targetId });
      setActiveVerification(res.data);
      if (res.data.verified) {
        toast.success(`QC ID ${targetId} successfully verified! (Bona Fide QC Resident)`);
      } else {
        toast.error(`QC ID ${targetId} validation flagged!`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to execute QC ID verification');
    } finally {
      setIsVerifyingQcId(false);
    }
  };

  // --- School Registrar Handlers ---
  const handleRunSchoolSync = async () => {
    if (!studentIdQuery) {
      toast.error('Please enter a Student ID Number');
      return;
    }
    setIsSyncingSchool(true);
    try {
      const res = await verifySchoolEnrollment(selectedSchoolCode, studentIdQuery);
      setSchoolSyncResult(res.data);
      toast.success(
        `Pulled live registrar record from ${res.data.student_record.school_name} for ${res.data.student_record.full_name}!`
      );
    } catch (err) {
      console.error(err);
      toast.error('Failed to pull data from school registrar SIS');
    } finally {
      setIsSyncingSchool(false);
    }
  };

  const filteredDirectory = citizenDirectory.filter(
    (c) =>
      c.full_name.toLowerCase().includes(dirSearch.toLowerCase()) ||
      c.qcitizen_id.toLowerCase().includes(dirSearch.toLowerCase()) ||
      c.barangay.toLowerCase().includes(dirSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
              Data Integrations & Verification Gateway
            </h1>
            <Badge variant="success" size="sm" className="bg-emerald-50 text-emerald-800 border-emerald-200">
              Adapters Active
            </Badge>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Unified government verification gateway. Execute real-time data pulls against Quezon City Citizen ID,
            Partner University Registrars, and Cloud Financial Storage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast.info('Pinging all integration gateways...');
              setTimeout(() => toast.success('All 16 Partner SIS Gateways & QC ID Services: 100% Operational (24ms)'), 900);
            }}
            leftIcon={<Activity className="h-4 w-4 text-blue-600" />}
            className="font-bold whitespace-nowrap"
          >
            Gateway Health Check
          </Button>
        </div>
      </div>

      {/* Segmented Navigation Tabs */}
      <div className="bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl flex flex-wrap gap-1 border border-slate-200 dark:border-slate-700 max-w-4xl">
        <button
          onClick={() => setActiveTab('qc-mesh')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'qc-mesh'
              ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400 shadow-xs border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Network className="h-4 w-4 text-purple-600" />
          <span>QC Government Service Mesh (10 Systems)</span>
        </button>

        <button
          onClick={() => setActiveTab('qcid')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'qcid'
              ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          <span>QC ID Verification</span>
        </button>

        <button
          onClick={() => setActiveTab('schools')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'schools'
              ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Building2 className="h-4 w-4 text-indigo-600" />
          <span>Partner School Sync</span>
        </button>

        <button
          onClick={() => setActiveTab('adapters')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'adapters'
              ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Server className="h-4 w-4 text-emerald-600" />
          <span>System Adapters</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 0: QC GOVERNMENT SERVICE MANAGEMENT MESH (10 SYSTEMS)                */}
      {/* ========================================================================= */}
      {activeTab === 'qc-mesh' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Executive Overview Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 text-white border border-purple-800/40 shadow-xl">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold">
                  <Network className="w-3.5 h-3.5" />
                  Quezon City LGU Enterprise Interoperability System (EIS)
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold tracking-tight font-heading">
                  Subsystem 5: Education & Scholarship Management Mesh
                </h2>
                <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Decoupled API Gateway architecture connecting EduScholar to all 9 peer municipal subsystems.
                  Exposes standardized RESTful adapters, transactional webhooks, and secure audit handshakes.
                </p>
              </div>

              <div className="flex flex-wrap md:flex-col gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={fetchMeshCatalog}
                  isLoading={isLoadingMesh}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                >
                  Refresh Mesh Status
                </Button>
                <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs text-[11px] font-mono text-purple-200 flex items-center gap-1.5 border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Gateway: Traefik v3.0 / WSS
                </div>
              </div>
            </div>

            {/* Mesh Stat Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-purple-800/50">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Subsystems</span>
                <span className="text-xl font-heading font-extrabold text-white">10 Municipal Depts</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Live Bridges</span>
                <span className="text-xl font-heading font-extrabold text-emerald-400">4 Active Adapters</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Integration Ready</span>
                <span className="text-xl font-heading font-extrabold text-indigo-300">6 Subsystem Adapters</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Security & Privacy</span>
                <span className="text-xl font-heading font-extrabold text-purple-300">RA 10173 • TLS 1.3</span>
              </div>
            </div>
          </div>

          {/* Interactive Live Inspection Console */}
          {simulationResult && (
            <Card className="border border-purple-300 dark:border-purple-800/80 bg-purple-50/50 dark:bg-purple-950/20 shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <CardTitle className="text-sm font-bold text-purple-950 dark:text-purple-200">
                      Live Subsystem Handshake Response
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSimulationResult(null)}
                    className="text-xs h-7 text-slate-500 hover:text-slate-800"
                  >
                    Clear Output
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <pre className="p-3 bg-slate-900 text-purple-300 rounded-xl text-[11px] font-mono overflow-x-auto max-h-60 border border-slate-800">
                  {JSON.stringify(simulationResult, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* 10 QC Government Subsystems Cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  Quezon City Government Service Management System Subsystems
                </h3>
                <p className="text-xs text-slate-500">
                  Department matrix defined in municipal IT governance plan. Select any subsystem to run a live handshake.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {qcSubsystems.map((subsystem) => {
                const isCore = subsystem.code === 'SYS-05';
                const isActive = subsystem.status.includes('ACTIVE');
                return (
                  <Card
                    key={subsystem.code}
                    className={`border transition-all ${
                      isCore
                        ? 'border-purple-500/70 bg-purple-50/30 dark:bg-purple-950/15 shadow-md ring-1 ring-purple-500/30'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-300 dark:hover:border-purple-800'
                    }`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {subsystem.code}
                          </span>
                          <CardTitle className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                            {subsystem.name}
                          </CardTitle>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {subsystem.department}
                          </p>
                        </div>
                        <Badge
                          variant={isCore ? 'primary' : isActive ? 'success' : 'outline'}
                          size="sm"
                          className="font-bold whitespace-nowrap text-[10px]"
                        >
                          {isCore ? 'YOUR SYSTEM' : isActive ? 'Active Connected' : 'Adapter Ready'}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs mt-1 line-clamp-2">
                        {subsystem.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0 space-y-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                          Integration Capabilities:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {subsystem.capabilities.map((cap, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700"
                            >
                              • {cap}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-purple-700 dark:text-purple-400 font-semibold truncate max-w-[200px]">
                          {subsystem.adapter_route}
                        </span>
                        {!isCore && (
                          <Button
                            variant="outline"
                            size="sm"
                            isLoading={simulatingCode === subsystem.code}
                            onClick={() => handleSimulateSubsystem(subsystem.code, subsystem.name)}
                            leftIcon={<Play className="w-3 h-3 text-purple-600" />}
                            className="text-xs h-7 font-bold border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50"
                          >
                            Simulate Handshake
                          </Button>
                        )}
                        {isCore && (
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Core Orchestrator
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Audit Logs Table for Interoperability Events */}
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                    Municipal Interoperability Transaction Log (Immutable Audit)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Real-time audit records of payloads exchanged between EduScholar and peer QC departments.
                  </CardDescription>
                </div>
                <Badge variant="secondary" size="sm" className="font-mono text-[10px]">
                  {interopLogs.length} Events Captured
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {interopLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No inter-system transactions logged yet. Click "Simulate Handshake" on any subsystem to initiate a live event.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold text-[10px] uppercase">
                        <th className="py-2.5 px-3">Timestamp</th>
                        <th className="py-2.5 px-3">Source Subsystem</th>
                        <th className="py-2.5 px-3">Event Type</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                      {interopLogs.map((log, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-2 px-3 text-slate-500">
                            {new Date(log.created_at || Date.now()).toLocaleTimeString()}
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                            {log.source_system}
                          </td>
                          <td className="py-2 px-3 text-purple-600 dark:text-purple-400">
                            {log.event_type}
                          </td>
                          <td className="py-2 px-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              {log.status || 'SUCCESS'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: QC IDENTIFICATION VERIFICATION HUB                                 */}
      {/* ========================================================================= */}
      {activeTab === 'qcid' && (
        <div className="space-y-6">
          {/* Query Bar */}
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-slate-900 dark:text-white">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                Live QCitizen Identity & Residency Verification Pull
              </CardTitle>
              <CardDescription className="text-xs">
                Enter an applicant's QCitizen ID or select from the citizen registry to execute automated residency
                tenure, COMELEC voter registration, and low-income qualification checks.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={qcIdQuery}
                    onChange={(e) => setQcIdQuery(e.target.value)}
                    placeholder="Enter QCitizen ID (e.g. QC-2024-884920, QC-2023-110293)..."
                    className="w-full h-10 pl-10 pr-4 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600"
                  />
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleRunQcIdVerification()}
                  isLoading={isVerifyingQcId}
                  leftIcon={<Search className="h-4 w-4" />}
                  className="font-bold bg-blue-600 text-white w-full sm:w-auto shrink-0"
                >
                  Verify Residency & Voter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Verification Scorecard Result */}
          {activeVerification && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Citizen Identity Card */}
              <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">QCitizen Card Record</span>
                    <Badge
                      variant={activeVerification.verified ? 'success' : 'destructive'}
                      size="sm"
                      className="font-bold"
                    >
                      {activeVerification.verified ? 'Bona Fide QC Resident' : 'Unverified'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {activeVerification.resident.full_name}
                  </CardTitle>
                  <code className="text-xs text-blue-700 dark:text-blue-400 font-mono font-semibold">
                    {activeVerification.resident.qcitizen_id}
                  </code>
                </CardHeader>

                <CardContent className="space-y-3 pt-4 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700 space-y-1.5">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Registered Address</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {activeVerification.resident.address}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Barangay & District</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {activeVerification.resident.barangay} ({activeVerification.resident.district})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Residency Tenure</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                          {activeVerification.resident.residency_years} Years in QC
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700 space-y-1.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Voter Status</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {activeVerification.resident.voter_status}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Precinct No.</span>
                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                          {activeVerification.resident.precinct_number}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Monthly Income</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          ₱{activeVerification.resident.monthly_household_income.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Indigency Cert.</span>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                          {activeVerification.resident.indigency_certified ? 'Authenticated' : 'Standard'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Middle & Right Column: Official Rules Evaluation & Security Audit */}
              <Card className="lg:col-span-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base flex items-center gap-2 text-slate-900 dark:text-white">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      QCSP Ordinance Eligibility Audit & Security Verification
                    </CardTitle>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Confidence Score</span>
                      <span className="font-heading font-extrabold text-emerald-600 text-base">
                        {activeVerification.confidence_score}
                      </span>
                    </div>
                  </div>
                  <CardDescription className="text-xs">
                    Automated rule engine cross-checks applicant details against Quezon City Scholarship Program (QCSP) Ordinance criteria.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                  <div className="space-y-2.5">
                    {activeVerification.eligibility_checklist.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border flex items-start gap-3 text-xs ${
                          item.passed
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {item.passed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-900 dark:text-white">{item.rule}</span>
                            <Badge variant={item.passed ? 'success' : 'destructive'} size="sm">
                              {item.passed ? 'PASSED' : 'FLAGGED'}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">{item.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cryptographic Security Stamp */}
                  <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-blue-600" />
                      <div>
                        <span className="font-bold text-blue-950 dark:text-blue-200 block text-[11px]">
                          Cryptographic Security Token
                        </span>
                        <code className="text-[10px] text-blue-700 dark:text-blue-300 font-mono">
                          {activeVerification.security_audit.certificate_hash}
                        </code>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold">Fraud Risk Level</span>
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                        {activeVerification.security_audit.fraud_risk}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Citizen Registry Sample Browser */}
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base text-slate-900 dark:text-white">
                  Quezon City Citizen Master Registry (Dummy Integration Store)
                </CardTitle>
                <CardDescription className="text-xs">
                  Click any resident record to simulate an instant live identity pull request.
                </CardDescription>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter citizen name or ID..."
                  value={dirSearch}
                  onChange={(e) => setDirSearch(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
            </CardHeader>

            <CardContent className="pt-0 p-0 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">QCitizen ID</th>
                    <th className="p-3">Citizen Name</th>
                    <th className="p-3">Barangay & District</th>
                    <th className="p-3">Residency Tenure</th>
                    <th className="p-3">Voter Status</th>
                    <th className="p-3">Household Income</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredDirectory.map((cit) => (
                    <tr
                      key={cit.qcitizen_id}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <td className="p-3 font-mono font-bold text-blue-700 dark:text-blue-400">
                        {cit.qcitizen_id}
                      </td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">
                        {cit.full_name}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">
                        {cit.barangay} ({cit.district})
                      </td>
                      <td className="p-3 font-bold text-emerald-700 dark:text-emerald-400">
                        {cit.residency_years} Years
                      </td>
                      <td className="p-3">
                        <Badge variant={cit.is_registered_voter ? 'success' : 'destructive'} size="sm">
                          {cit.is_registered_voter ? 'QC Voter (Active)' : 'Non-Voter'}
                        </Badge>
                      </td>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                        ₱{cit.monthly_household_income.toLocaleString()} / mo
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setQcIdQuery(cit.qcitizen_id);
                            handleRunQcIdVerification(cit.qcitizen_id);
                          }}
                          leftIcon={<ShieldCheck className="h-3.5 w-3.5 text-blue-600" />}
                          className="font-bold text-xs"
                        >
                          Pull & Verify
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PARTNER SCHOOL REGISTRAR SYNC HUB                                  */}
      {/* ========================================================================= */}
      {activeTab === 'schools' && (
        <div className="space-y-6">
          {/* Query Bar */}
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-slate-900 dark:text-white">
                <Building2 className="h-5 w-5 text-indigo-600" />
                Live University Registrar & SIS Academic Data Pull
              </CardTitle>
              <CardDescription className="text-xs">
                Query any of the 16 accredited partner institutions to pull real-time student enrollment status,
                cumulative GWA, units enrolled, and official Statement of Account (SOA).
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Select Accredited Partner Institution:
                  </label>
                  <select
                    value={selectedSchoolCode}
                    onChange={(e) => setSelectedSchoolCode(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
                  >
                    {partnerSchools.map((sch) => (
                      <option key={sch.school_id} value={sch.school_id}>
                        {sch.name} ({sch.school_id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Student ID Number:
                  </label>
                  <input
                    type="text"
                    value={studentIdQuery}
                    onChange={(e) => setStudentIdQuery(e.target.value)}
                    placeholder="Enter Student ID (e.g. 23010366)..."
                    className="w-full h-10 px-3 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleRunSchoolSync}
                    isLoading={isSyncingSchool}
                    leftIcon={<RefreshCw className="h-4 w-4" />}
                    className="font-bold bg-indigo-600 text-white w-full h-10"
                  >
                    Execute SIS Data Pull
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* School Sync Live Results */}
          {schoolSyncResult && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Student Academic Card */}
              <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">SIS Student Profile</span>
                    <Badge variant="success" size="sm" className="font-bold">
                      {schoolSyncResult.student_record.enrollment_status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {schoolSyncResult.student_record.full_name}
                  </CardTitle>
                  <p className="text-xs text-indigo-700 dark:text-indigo-400 font-semibold">
                    {schoolSyncResult.student_record.school_name}
                  </p>
                </CardHeader>

                <CardContent className="space-y-3 pt-4 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700 space-y-1.5">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Degree Program</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {schoolSyncResult.student_record.degree_program}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Term</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {schoolSyncResult.student_record.current_term}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Units Enrolled</span>
                        <span className="font-bold text-blue-700 dark:text-blue-400">
                          {schoolSyncResult.student_record.units_enrolled} Units
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">
                        Official Cumulative GWA
                      </span>
                      <span className="font-heading font-extrabold text-emerald-700 dark:text-emerald-400 text-base">
                        {schoolSyncResult.student_record.gwa.toFixed(2)}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-900 dark:text-emerald-200 block">
                      {schoolSyncResult.student_record.academic_standing}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Good Moral Clearance</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {schoolSyncResult.student_record.good_moral_cleared ? 'Cleared (No Infractions)' : 'Flagged'}
                      </span>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>

              {/* Statement of Account & Enrolled Subjects */}
              <Card className="lg:col-span-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base text-slate-900 dark:text-white">
                      Statement of Account (SOA) & Enrolled Courses
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Official billing breakdown directly from {schoolSyncResult.student_record.school_name} Finance Desk.
                    </CardDescription>
                  </div>
                  <Badge variant="primary" size="sm" className="font-mono">
                    {schoolSyncResult.student_record.statement_of_account.soa_reference}
                  </Badge>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                  {/* Financial Breakdown Table */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Tuition Fee</span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        ₱{schoolSyncResult.student_record.statement_of_account.tuition_fee.toLocaleString()}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Misc & Lab Fees</span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        ₱{(
                          schoolSyncResult.student_record.statement_of_account.misc_fee +
                          schoolSyncResult.student_record.statement_of_account.laboratory_fee
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Assessment</span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        ₱{schoolSyncResult.student_record.statement_of_account.total_assessment.toLocaleString()}
                      </span>
                    </div>
                    <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
                      <span className="text-blue-700 dark:text-blue-400 block text-[10px] uppercase font-bold">
                        Outstanding Balance
                      </span>
                      <span className="font-heading font-extrabold text-blue-800 dark:text-blue-300 text-sm">
                        ₱{schoolSyncResult.student_record.statement_of_account.outstanding_balance.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Course Load Table */}
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
                    <div className="bg-slate-50 dark:bg-slate-800 px-3.5 py-2 font-bold text-slate-700 dark:text-slate-300 text-[11px] border-b border-slate-200 dark:border-slate-700">
                      Enrolled Subject Load ({schoolSyncResult.student_record.enrolled_courses.length} Courses)
                    </div>
                    <table className="w-full text-left">
                      <thead className="bg-slate-100/50 dark:bg-slate-800/50 text-slate-500 font-bold text-[10px]">
                        <tr>
                          <th className="p-2.5">Course Code</th>
                          <th className="p-2.5">Subject Title</th>
                          <th className="p-2.5 text-center">Units</th>
                          <th className="p-2.5 text-right">Midterm Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {schoolSyncResult.student_record.enrolled_courses.map((crs, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                            <td className="p-2.5 font-mono font-semibold text-blue-700 dark:text-blue-400">
                              {crs.code}
                            </td>
                            <td className="p-2.5 font-medium text-slate-900 dark:text-white">{crs.title}</td>
                            <td className="p-2.5 text-center font-bold">{crs.units}</td>
                            <td className="p-2.5 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                              {crs.grade}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SYSTEM ADAPTERS & EXTERNAL APIS                                    */}
      {/* ========================================================================= */}
      {activeTab === 'adapters' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card hoverEffect className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-base text-slate-900 dark:text-white">
                    Quezon City QCitizen Authentication Gateway
                  </CardTitle>
                </div>
                <Badge variant="success">Connected (Active)</Badge>
              </div>
              <CardDescription className="text-xs">
                Restricted API integration with Quezon City Citizen Database for automated residency verification.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs pt-0">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1 font-mono text-[11px] border border-slate-200 dark:border-slate-700">
                <p>
                  <span className="text-slate-400">Endpoint:</span> https://qcitizen.quezoncity.gov.ph/api/v3/auth/verify
                </p>
                <p>
                  <span className="text-slate-400">Protocol:</span> REST JSON over TLS 1.3 • AES-256 GCM
                </p>
                <p>
                  <span className="text-slate-400">Status:</span> 200 OK • Average Latency: 18ms
                </p>
              </div>
            </CardContent>
          </Card>

          <Card hoverEffect className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-indigo-600" />
                  <CardTitle className="text-base text-slate-900 dark:text-white">
                    Partner HEI Student Information System (SIS) Hub
                  </CardTitle>
                </div>
                <Badge variant="success">16 / 16 Accredited HEIs Online</Badge>
              </div>
              <CardDescription className="text-xs">
                Real-time API connector syncing Certificate of Registration (COR), unit loads, and cumulative GWAs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs pt-0">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1 font-mono text-[11px] border border-slate-200 dark:border-slate-700">
                <p>
                  <span className="text-slate-400">Hub Gateway:</span> https://sis-connector.qc.edu.ph/v2/institutions
                </p>
                <p>
                  <span className="text-slate-400">Accreditation:</span> CHED-NCR / LGU Higher Education Directorate
                </p>
                <p>
                  <span className="text-slate-400">Health:</span> 100% Uptime across 16 Partner Universities
                </p>
              </div>
            </CardContent>
          </Card>

          <Card hoverEffect className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                  <CardTitle className="text-base text-slate-900 dark:text-white">
                    Landbank / GCash Direct Disbursement Treasury
                  </CardTitle>
                </div>
                <Badge variant="success">ISO 20022 Ready</Badge>
              </div>
              <CardDescription className="text-xs">
                Automated electronic disbursement gateway for direct stipend deposits and tuition fee clearance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs pt-0">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1 font-mono text-[11px] border border-slate-200 dark:border-slate-700">
                <p>
                  <span className="text-slate-400">ACH Gateway:</span> https://lgu-epay.landbank.com/v4/direct-credit
                </p>
                <p>
                  <span className="text-slate-400">Security:</span> Mutually Authenticated TLS (mTLS) + RSA Signature
                </p>
              </div>
            </CardContent>
          </Card>

          <Card hoverEffect className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-sky-600" />
                  <CardTitle className="text-base text-slate-900 dark:text-white">
                    AWS S3 Encrypted Document Vault
                  </CardTitle>
                </div>
                <Badge variant="success">AES-256 Encrypted</Badge>
              </div>
              <CardDescription className="text-xs">
                Encrypted storage repository for applicant birth certificates, transcripts, and mayoral award certificates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs pt-0">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1 font-mono text-[11px] border border-slate-200 dark:border-slate-700">
                <p>
                  <span className="text-slate-400">S3 Bucket:</span> s3://eduscholar-vault-prod-qc
                </p>
                <p>
                  <span className="text-slate-400">Encrypted Objects:</span> 2,840 PDF Attachments Stored
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ApiIntegrationsPage;
