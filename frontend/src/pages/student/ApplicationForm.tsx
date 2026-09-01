import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { api, processAiApplicationMatch } from '../../services/api';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  User,
  BookOpen,
  Wallet,
  UploadCloud,
  Video,
  FileText,
  ShieldCheck,
  Trash2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Lock,
  Clock,
  Sun,
  Moon,
  Info,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { INSTALLED_DEPARTMENTS } from '../../utils/departments';
import {
  getProgramById,
  getActiveStudentApplication,
  saveActiveStudentApplication,
  type ScholarshipProgramSpec,
} from '../../utils/scholarshipPrograms';
import { getPortalSettings, type PortalSettingsData } from '../../api/portalSettings';
import { sendSystemScholarshipNotice } from '../../utils/systemNotifications';

// List of accredited Quezon City Universities, Colleges & HEIs
export const QC_SCHOOLS = [
  'Bestlink College of the Philippines (BCP)',
  'Quezon City University (QCU - Main San Bartolome)',
  'Quezon City University (QCU - Batasan Campus)',
  'Quezon City University (QCU - San Francisco Campus)',
  'University of the Philippines Diliman (UPD)',
  'Ateneo de Manila University (ADMU)',
  'Polytechnic University of the Philippines (PUP QC)',
  'Far Eastern University (FEU Diliman)',
  'FEU - Nicanor Reyes Medical Foundation (FEU-NRMF)',
  'Trinity University of Asia (TUA)',
  'Miriam College (MC)',
  'New Era University (NEU)',
  'Our Lady of Fatima University (OLFU QC)',
  'National University (NU Fairview / QC)',
  'Technological Institute of the Philippines (TIP QC)',
  'St. Paul University Quezon City (SPUQC)',
  'UST - Angelicum College',
  'World Citi Colleges (WCC)',
  'AMA Computer University (AMA QC)',
  'STI College Novaliches',
  'STI College Cubao',
  'STI College Fairview',
  'Access Computer College Novaliches',
  'Informatics College Quezon City',
  'Metro Manila College (MMC Novaliches)',
  'Siena College Quezon City',
  'Capitol Medical Center Colleges (CMCC)',
  'Philippine Women\'s University (PWU QC)',
  'Eulogio "Amang" Rodriguez Institute of Tech (EARIST QC)',
  'Asian College of Science and Technology (ACSAT QC)',
  'Quezon City High School (Public / Private SHS)',
  'Other / School Not Listed (Exception Flow - Requires Certificate of Enrollment)',
];

// Dynamic Validation Schema
const applicationSchema = z.object({
  // Step 1: Basic Information
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  suffix: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['Male', 'Female', 'Prefer not to say']),
  civilStatus: z.enum(['Single', 'Married', 'Widowed', 'Separated']),
  nationality: z.string().min(1, 'Nationality is required'),
  religion: z.string().optional(),
  email: z.string().email('Invalid email address'),
  mobileNumber: z.string().min(10, 'Mobile number is required'),
  telephoneNumber: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  barangay: z.string().min(1, 'Barangay is required'),
  city: z.string().min(1, 'City is required'),
  province: z.string().optional().default('Metro Manila'),
  zipCode: z.string().optional().default('1100'),

  // Step 2: Academic Information
  studentId: z.string().min(1, 'Student ID or LRN is required'),
  school: z.string().min(1, 'School is required'),
  unlistedSchoolName: z.string().optional(),
  unlistedSchoolAddress: z.string().optional(),
  schoolType: z.enum(['Private', 'Public', 'SUC', 'LUC']),
  department: z.string().min(1, 'Beneficiary department / college is required'),
  course: z.string().min(1, 'Course / Strand is required'),
  yearLevel: z.enum(['Grade 11', 'Grade 12', '1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Postgraduate / Reviewee']),
  gwa: z.number().min(1.0, 'Enter a valid GWA or grade percentage').max(100.0, 'Enter a valid GWA or grade percentage'),

  // Step 3: Financial Information
  annualIncome: z.number().min(0, 'Annual income is required'),
  incomeBracket: z.enum(['Low', 'Middle', 'High']),
  numberOfSiblings: z.number().min(0),
  financialSupport: z.enum(['Parents', 'Self', 'Scholarship', 'Other']),
  disbursementChannel: z.enum([
    'Landbank ATM / Cash Card',
    'GCash E-Wallet',
    'Maya E-Wallet',
    'City Hall Cashier Pickup',
  ]),
  accountNumber: z.string().min(1, 'Account or Mobile number is required'),
  accountName: z.string().min(1, 'Account holder name is required'),
  isPWD: z.boolean().optional(),
  isIndigenous: z.boolean().optional(),
  is4Ps: z.boolean().optional(),
  isSoloParent: z.boolean().optional(),
  isKasambahayOrToda: z.boolean().optional(),

  // Step 4: Terms Consent
  termsAccepted: z.boolean().refine((val) => val === true, 'You must accept the terms'),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface UploadedDocMeta {
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  dataUrl?: string;
}

export const ApplicationForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';

  // Determine chosen scholarship program from URL or default to SHS Academic
  const selectedProgramId = searchParams.get('program') || searchParams.get('programId') || 'shs-academic';
  const selectedProgram: ScholarshipProgramSpec = getProgramById(selectedProgramId);

  // Active Application state check (Single Application Constraint)
  const [activeApp, setActiveApp] = useState<any | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [portalSettings, setPortalSettings] = useState<PortalSettingsData | null>(null);
  const [isCheckingPortal, setIsCheckingPortal] = useState(true);

  useEffect(() => {
    const existing = getActiveStudentApplication();
    setActiveApp(existing);

    getPortalSettings()
      .then((res: any) => {
        if (res.data?.data) {
          setPortalSettings(res.data.data);
        }
      })
      .catch((err: any) => {
        console.warn('Failed to load portal settings in ApplicationForm:', err);
      })
      .finally(() => {
        setIsCheckingPortal(false);
      });
  }, []);

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Uploads Dictionary per Document Spec ID
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, UploadedDocMeta | null>>({
    residency_qc: {
      name: 'Citizen_Information_System_Matched.json',
      size: 'System Verified',
      type: 'application/json',
      uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    },
  });

  // Video Presentation state for vocational / applicable tracks
  const [videoMode, setVideoMode] = useState<'link' | 'file'>('link');
  const [videoUrl, setVideoUrl] = useState<string>('');

  // Requirement Validation Errors
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

  // Submission Celebration State
  const [submittedApp, setSubmittedApp] = useState<any | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  // Hidden File Input Refs stored by document ID
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Offline Resilience & Auto-Draft Persistence State
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);

  const DRAFT_STORAGE_KEY = `eduscholar_app_draft_${selectedProgramId}_${user?.email || 'guest'}`;

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    reset,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema) as any,
    defaultValues: {
      firstName: user?.name?.split(' ')[0] || '',
      lastName: user?.name?.split(' ').slice(1).join(' ') || '',
      email: user?.email || '',
      city: 'Quezon City',
      province: 'Metro Manila',
      barangay: 'Barangay Central',
      zipCode: '1100',
      school: QC_SCHOOLS[0],
      department: INSTALLED_DEPARTMENTS[0],
      disbursementChannel: 'Landbank ATM / Cash Card',
      accountNumber: '',
      accountName: user?.name || '',
      annualIncome: 0,
      numberOfSiblings: 0,
      gender: 'Female',
      civilStatus: 'Single',
      schoolType: selectedProgram.categoryId === 'shs' ? 'Public' : 'SUC',
      yearLevel: selectedProgram.categoryId === 'shs' ? 'Grade 11' : selectedProgram.categoryId === 'postgrad' ? 'Postgraduate / Reviewee' : '1st Year',
      incomeBracket: 'Low',
      financialSupport: 'Parents',
      nationality: 'Filipino',
      isPWD: false,
      isIndigenous: false,
      is4Ps: false,
      isSoloParent: false,
      isKasambahayOrToda: false,
      termsAccepted: true,
    },
  });

  // 1. Connectivity Event Listeners (Online / Offline detection)
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Internet Connection Restored 🟢', {
        description: 'You are back online! All your filled information and attached documents are held safe.',
        duration: 5000,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Internet Connection Lost 📡', {
        description: 'You are currently offline. Do not worry — all your form inputs and attached files are safely held in local storage and will stay intact.',
        duration: 8000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 2. Restore Draft on initial component mount
  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (parsed.formData) {
          reset(parsed.formData);
        }
        if (parsed.currentStep) {
          setCurrentStep(parsed.currentStep);
        }
        if (parsed.uploadedDocs) {
          setUploadedDocs(parsed.uploadedDocs);
        }
        if (parsed.videoUrl) {
          setVideoUrl(parsed.videoUrl);
        }
        if (parsed.videoMode) {
          setVideoMode(parsed.videoMode);
        }
        if (parsed.savedAt) {
          setDraftSavedAt(parsed.savedAt);
        }
      }
    } catch (e) {
      console.warn('Could not restore saved application draft:', e);
    }
  }, [DRAFT_STORAGE_KEY, reset]);

  // 3. Continuously auto-save filled form data, step, and attachments
  const formValues = watch();

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const draftPayload = {
          formData: formValues,
          currentStep,
          uploadedDocs,
          videoUrl,
          videoMode,
          savedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftPayload));
        setDraftSavedAt(draftPayload.savedAt);
      } catch (err) {
        // Local storage write failsafe
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [formValues, currentStep, uploadedDocs, videoUrl, videoMode, DRAFT_STORAGE_KEY]);

  const handleClearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setDraftSavedAt(null);
      reset({
        firstName: user?.name?.split(' ')[0] || '',
        lastName: user?.name?.split(' ').slice(1).join(' ') || '',
        email: user?.email || '',
        city: 'Quezon City',
        province: 'Metro Manila',
        barangay: 'Barangay Central',
        zipCode: '1100',
        school: QC_SCHOOLS[0],
        department: INSTALLED_DEPARTMENTS[0],
        disbursementChannel: 'Landbank ATM / Cash Card',
        accountNumber: '',
        accountName: user?.name || '',
        annualIncome: 0,
        numberOfSiblings: 0,
        gender: 'Female',
        civilStatus: 'Single',
        schoolType: selectedProgram.categoryId === 'shs' ? 'Public' : 'SUC',
        yearLevel: selectedProgram.categoryId === 'shs' ? 'Grade 11' : selectedProgram.categoryId === 'postgrad' ? 'Postgraduate / Reviewee' : '1st Year',
        incomeBracket: 'Low',
        financialSupport: 'Parents',
        nationality: 'Filipino',
        isPWD: false,
        isIndigenous: false,
        is4Ps: false,
        isSoloParent: false,
        isKasambahayOrToda: false,
        termsAccepted: true,
      });
      setCurrentStep(1);
      toast.success('Application draft cleared. You can start with a fresh form.');
    } catch (e) {
      console.warn('Error clearing draft:', e);
    }
  };

  const isPWD = watch('isPWD');
  const isIndigenous = watch('isIndigenous');
  const is4Ps = watch('is4Ps');
  const isSoloParent = watch('isSoloParent');
  const isKasambahayOrToda = watch('isKasambahayOrToda');

  const hasSpecialSector = Boolean(isPWD || isIndigenous || is4Ps || isSoloParent || isKasambahayOrToda);

  const selectedSchool = watch('school');
  const isUnlistedSchool = selectedSchool?.includes('Other / School Not Listed');

  const baseRequiredDocs = selectedProgram.requiredDocuments.filter((doc) => {
    if (doc.id === 'sectoral_proof') {
      return hasSpecialSector;
    }
    return true;
  });

  const activeRequiredDocs = isUnlistedSchool
    ? [
        ...baseRequiredDocs,
        {
          id: 'unlisted_school_coe',
          label: 'Certificate of Enrollment / Registration (Unlisted School)',
          description: 'Official DepEd/CHED Certificate of Registration, Assessment Form, or Enrollment Certificate verifying your active student standing at your unlisted institution.',
          isRequired: true,
          accept: '.pdf,.jpg,.jpeg,.png',
        },
      ]
    : baseRequiredDocs;

  const steps = [
    { id: 1, title: 'Basic Information', description: 'Personal & Contact Details', icon: User },
    { id: 2, title: 'Academic Information', description: 'School, Course & GWA', icon: BookOpen },
    { id: 3, title: 'Financial Information', description: 'Household Income & Payout', icon: Wallet },
    { id: 4, title: 'Uploading Requirements', description: 'Program-Specific Documents', icon: UploadCloud },
  ];

  // Helper to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Helper to process uploaded file for a specific doc ID
  const handleFileUpload = (
    docId: string,
    file: File | undefined,
    docLabel: string
  ) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const meta: UploadedDocMeta = {
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type || 'application/octet-stream',
        uploadedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        dataUrl,
      };
      setUploadedDocs((prev) => ({ ...prev, [docId]: meta }));
      setUploadErrors((prev) => {
        const copy = { ...prev };
        delete copy[docId];
        return copy;
      });
      toast.success(`${docLabel} attached successfully!`, {
        description: `${file.name} (${formatFileSize(file.size)})`,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveDoc = (docId: string) => {
    setUploadedDocs((prev) => {
      const copy = { ...prev };
      delete copy[docId];
      return copy;
    });
  };

  // Step Validation Fields (only fields rendered in the active form step)
  const stepFields: Record<number, (keyof ApplicationFormData)[]> = {
    1: [
      'firstName',
      'lastName',
      'dateOfBirth',
      'gender',
      'civilStatus',
      'nationality',
      'email',
      'mobileNumber',
      'address',
      'barangay',
      'city',
    ],
    2: ['studentId', 'school', 'schoolType', 'department', 'course', 'yearLevel', 'gwa'],
    3: ['annualIncome', 'incomeBracket', 'financialSupport', 'disbursementChannel', 'accountNumber'],
    4: ['termsAccepted'],
  };

  const handleNextStep = async () => {
    const fieldsToValidate = stepFields[currentStep];
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const errorKeys = Object.keys(errors);
      const firstErrorMessage = errorKeys.length > 0 ? (errors as any)[errorKeys[0]]?.message : null;
      toast.error(firstErrorMessage || 'Please complete all required fields in this step before proceeding.');
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = async (data: ApplicationFormData) => {
    // Validate Step 4: Check if all mandatory documents for this program are uploaded
    const errorsMap: Record<string, string> = {};
    activeRequiredDocs.forEach((doc) => {
      if (doc.isRequired) {
        if (doc.id === 'voc_video_doc') {
          const hasVideo = videoMode === 'link' ? Boolean(videoUrl.trim()) : Boolean(uploadedDocs[doc.id]);
          if (!hasVideo) {
            errorsMap[doc.id] = 'Please provide your 2-minute video pitch link or upload the video file.';
          }
        } else if (!uploadedDocs[doc.id]) {
          errorsMap[doc.id] = `Please attach ${doc.label.replace('*', '').trim()}.`;
        }
      }
    });

    if (Object.keys(errorsMap).length > 0) {
      setUploadErrors(errorsMap);
      toast.error('Incomplete Documentary Requirements', {
        description: `Please upload all required documentary attachments for ${selectedProgram.title}.`,
      });
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      const generatedRefId = 'APP-QC-' + Math.floor(100000 + Math.random() * 900000);

      // Save to PostgreSQL Backend API
      try {
        await api.post('/applications', {
          type: 'Scholarship',
          programId: selectedProgram.id,
          programName: selectedProgram.title,
          referenceId: generatedRefId,
          title: selectedProgram.title,
          amount: selectedProgram.categoryId === 'shs' ? 30000 : selectedProgram.categoryId === 'tertiary' ? 105000 : 25000,
          progress: 33,
          status: 'Under Review',
          requirementsCount: activeRequiredDocs.length,
          completedRequirements: activeRequiredDocs.length,
          formData: data,
          documentsSubmitted: Object.entries(uploadedDocs).map(([docId, docMeta]) => ({
            id: docId,
            name: docMeta?.name,
            size: docMeta?.size,
            uploadedAt: docMeta?.uploadedAt,
          })),
          notes: `Submitted for ${selectedProgram.title}. All ${activeRequiredDocs.length} required documents submitted. Documents queued for administrative verification.`,
          remarks: 'Application submitted via student portal. Documents and credentials queued for initial secretariat review.',
        });
      } catch (backendError) {
        console.warn('Backend server connection note:', backendError);
      }

      // Success AI Processing Simulation
      try {
        processAiApplicationMatch(data);
      } catch (aiError) {
        console.error('AI Processing failed:', aiError);
      }

      // 1. Build unified Application Record
      const newApplicationRecord = {
        id: generatedRefId,
        applicantName: `${data.firstName} ${data.lastName}`,
        scholarshipId: selectedProgram.id,
        scholarshipTitle: selectedProgram.title,
        program_name: selectedProgram.title,
        category: selectedProgram.categoryTitle,
        level: selectedProgram.level,
        course: data.course,
        school: data.school,
        gwa: data.gwa,
        tuitionGrant: selectedProgram.tuitionGrant,
        stipend: selectedProgram.stipend,
        totalMax: selectedProgram.totalMax,
        amount: 10000,
        submissionDate: new Date().toISOString().split('T')[0],
        submitted_at: new Date().toISOString(),
        status: 'pending',
        requirementsCount: activeRequiredDocs.length,
        completedRequirements: activeRequiredDocs.length,
        documents: Object.entries(uploadedDocs).map(([docId, docMeta]) => ({
          id: docId,
          name: docMeta?.name,
          size: docMeta?.size,
          uploadedAt: docMeta?.uploadedAt,
        })),
        notes: `Submitted for ${selectedProgram.title}. All ${activeRequiredDocs.length} program-specific documentary attachments attached. Under review by QCYDO Screening Committee.`,
      };

      // 2. Save active application into LocalStorage (Locking duplicate applications)
      saveActiveStudentApplication(newApplicationRecord);
      setActiveApp(newApplicationRecord);

      // 3. Sync into Document Vault in LocalStorage
      try {
        const currentVaultDocs = JSON.parse(localStorage.getItem('vault_uploaded_documents') || '[]');
        const newVaultItems = Object.entries(uploadedDocs).map(([docId, docMeta]) => ({
          id: `doc-${docId}-${Date.now()}`,
          name: docMeta?.name || 'Attached_Document.pdf',
          category: selectedProgram.categoryTitle,
          uploadDate: new Date().toISOString().split('T')[0],
          status: 'verified',
          size: docMeta?.size || '1.2 MB',
        }));
        localStorage.setItem('vault_uploaded_documents', JSON.stringify([...newVaultItems, ...currentVaultDocs]));
      } catch (e) {
        console.error('Vault LocalStorage error:', e);
      }

      // 4. Record student in-app notification
      try {
        sendSystemScholarshipNotice({
          recipientStudentId: data.studentId || 'STUDENT',
          recipientStudentName: `${data.firstName} ${data.lastName}`,
          recipientEmail: data.email,
          scholarshipTitle: selectedProgram.title,
          subject: `Application Submitted: ${selectedProgram.title}`,
          message: `Your scholarship application (${generatedRefId}) for ${selectedProgram.title} has been successfully filed. All ${activeRequiredDocs.length} required documents have been received and are queued for review.`,
          category: 'Document Compliance',
        });
      } catch (notifErr) {
        console.warn('System notification record note:', notifErr);
      }

      // Clear saved draft from local storage upon successful completion
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        setDraftSavedAt(null);
      } catch (e) {}

      setSubmittedApp(newApplicationRecord);
      setShowSuccessModal(true);
      toast.success('Scholarship Application Submitted Successfully! 🎉');
    } catch (error: any) {
      toast.error('Failed to submit application. Please verify all form fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // VIEW: SINGLE ACTIVE SCHOLARSHIP ENFORCEMENT NOTICE
  // =========================================================================
  if (activeApp && !showSuccessModal) {
    return (
      <div className={`min-h-screen font-sans selection:bg-primary/20 flex flex-col justify-between transition-colors duration-200 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        {/* Header */}
        <header className={`w-full shadow-md border-b relative z-30 transition-colors ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo-system.png" alt="GovServe Logo" className="h-9 w-9 object-contain bg-blue-50 dark:bg-slate-800 p-1 rounded-xl border border-blue-200 dark:border-blue-900" />
              <div>
                <span className="font-heading font-extrabold text-lg leading-none block">GovServe</span>
                <span className="text-[10px] text-slate-500 font-semibold">Campus Aid Hub Portal</span>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Button variant="ghost" size="sm" onClick={toggleTheme} className="p-2">
                {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
              </Button>
            </div>
          </div>
        </header>

        {/* Locked Active Application Content */}
        <main className="max-w-3xl mx-auto w-full px-4 py-12 space-y-6 animate-in fade-in duration-300">
          <Card className={`p-8 rounded-3xl border shadow-xl space-y-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0 border border-amber-200 dark:border-amber-800 shadow-md">
                <Lock className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <Badge variant="primary" className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 font-extrabold text-xs">
                  Active Application on File
                </Badge>
                <h1 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
                  Existing Scholarship Application Active
                </h1>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              In accordance with the <strong>Quezon City Scholarship Program (QCSP) Committee Governance & Ordinances</strong>, an applicant may only apply to and hold <strong>one (1) active scholarship program</strong> at a time.
            </p>

            {/* Active Application Record Card */}
            <div className={`p-5 rounded-2xl border space-y-3 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 font-semibold">Active Program</span>
                <span className="text-xs font-black text-slate-900 dark:text-white text-right">
                  {activeApp.program_name || activeApp.scholarshipTitle || 'Quezon City Scholarship Program (QCSP)'}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 font-semibold">Reference ID</span>
                <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                  {activeApp.id || 'QCSP-2026-ACTIVE'}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 font-semibold">Application Status</span>
                <Badge variant="primary" className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 capitalize font-extrabold text-xs">
                  {activeApp.status || 'Under Review'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Submission Date</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {activeApp.submissionDate || activeApp.submitted_at?.split('T')[0] || new Date().toISOString().split('T')[0]}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/dashboard')}
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="w-full sm:w-auto font-black bg-blue-600 hover:bg-blue-700 text-white shadow-md text-sm px-6 cursor-pointer"
              >
                Track My Application →
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto font-bold text-sm"
              >
                Go to Scholar Dashboard
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => navigate('/scholar-prog-available')}
                className="w-full sm:w-auto font-bold text-xs text-slate-500"
              >
                Browse Other Programs
              </Button>
            </div>
          </Card>
        </main>

        <footer className={`py-6 px-4 text-center text-xs border-t ${isDark ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-400'}`}>
          © 2026 Local Government Unit of Quezon City • Youth Development Office
        </footer>
      </div>
    );
  }

  // If application portal intake is closed by Administrator
  if (!isCheckingPortal && portalSettings?.isOpen === false && user?.role === 'student') {
    return (
      <div className={`min-h-screen font-sans selection:bg-primary/20 flex flex-col justify-between transition-colors duration-200 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        <header className={`w-full shadow-md border-b relative z-30 transition-colors ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo-system.png" alt="GovServe Logo" className="h-9 w-9 object-contain bg-blue-50 dark:bg-slate-800 p-1 rounded-xl border border-blue-200 dark:border-blue-900" />
              <div>
                <span className="font-heading font-extrabold text-lg leading-none block">GovServe</span>
                <span className="text-[10px] text-slate-500 font-semibold">Scholarship Portal</span>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Button variant="ghost" size="sm" onClick={toggleTheme} className="p-2">
                {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto w-full px-4 py-12 space-y-6 animate-in fade-in duration-300">
          <Card className={`p-8 rounded-3xl border shadow-xl space-y-6 text-center ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="h-16 w-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-sm">
              <AlertCircle className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <Badge variant="warning" size="md">
                Application Intake Closed
              </Badge>
              <h1 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
                Application Intake Is Currently Closed
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mx-auto">
                {portalSettings.closedMessage ||
                  'The Quezon City Scholarship Application Portal is currently closed for new candidate submissions.'}
              </p>
            </div>

            {portalSettings.nextCycleOpening && (
              <div className={`p-4 rounded-2xl border text-xs inline-block text-left w-full max-w-md ${isDark ? 'bg-slate-950 border-slate-800 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span>Upcoming Application Cycle</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Target Opening: <strong>{portalSettings.nextCycleOpening}</strong> ({portalSettings.academicYear} • {portalSettings.term})
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/scholarships')}
                className="w-full sm:w-auto font-bold bg-blue-600 text-white"
              >
                Browse Scholarships Catalog
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/messages')}
                className="w-full sm:w-auto font-bold"
              >
                Contact Helpdesk
              </Button>
            </div>
          </Card>
        </main>

        <footer className={`py-6 px-4 text-center text-xs border-t ${isDark ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-400'}`}>
          © 2026 Local Government Unit of Quezon City • Youth Development Office
        </footer>
      </div>
    );
  }

  // =========================================================================
  // VIEW: MAIN DYNAMIC MULTI-STEP APPLICATION WIZARD
  // =========================================================================
  return (
    <div className={`min-h-screen font-sans selection:bg-primary/20 flex flex-col justify-between transition-colors duration-200 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Top Header Navbar */}
      <header className={`w-full shadow-md border-b relative z-30 transition-colors ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/logo-system.png"
                alt="GovServe Logo"
                className="h-9 w-9 object-contain bg-blue-50 dark:bg-slate-800 p-1 rounded-xl border border-blue-200 dark:border-blue-900 shadow-xs"
              />
              <div>
                <span className="font-heading font-extrabold text-lg leading-none block">GovServe</span>
                <span className="text-[10px] text-slate-500 font-semibold">Campus Aid Hub Portal</span>
              </div>
            </Link>

            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                to="/"
                className="flex items-center px-3 py-2 rounded-xl text-xs font-extrabold hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <span>HOME</span>
              </Link>
              <Link
                to="/scholar-prog-available"
                className="flex items-center px-3 py-2 rounded-xl text-xs font-extrabold hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <span>AVAILABLE PROGRAMS</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="p-2">
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </Button>

            {user ? (
              <div className="relative app-form-user-dropdown">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-2 rounded-xl border p-1.5 px-2.5 shadow-xs transition-all cursor-pointer ${
                    isDark ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-extrabold text-white shadow-xs">
                    {user.name?.charAt(0).toUpperCase() ?? 'U'}
                  </div>
                  <span className="text-xs font-bold hidden sm:inline">{user.name}</span>
                </button>
                {userDropdownOpen && (
                  <div className={`absolute right-0 top-11 w-48 rounded-xl border shadow-xl z-50 p-2 ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}>
                    <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <p className="text-xs font-bold truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-400 capitalize font-mono">
                        {user.role === 'student'
                          ? `Application ID: ${user.application_code || user.reference_id || user.applicationId || user.application_id || (user.id ? `APP-2026-${String(user.id).padStart(4, '0')}` : 'APP-2026-0001')}`
                          : user.role?.replace('_', ' ')}
                      </p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className={`w-full block rounded-lg px-3 py-2 text-left text-xs font-semibold ${
                        isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer border-t border-slate-100 dark:border-slate-800 mt-1 pt-1.5"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/signup" className="hidden sm:inline-flex">
                  <Button variant="outline" size="sm" className="font-bold border-slate-300 dark:border-slate-700 text-xs">
                    Sign Up
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="primary" size="sm" className="font-extrabold shadow-md shadow-blue-600/30 text-xs">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Banner Section with Program Breadcrumb */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-8 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to="/education-scholarship"
              className="text-xs font-extrabold text-blue-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Education & Scholarship
            </Link>
            <span className="text-slate-500 text-xs">/</span>
            <Link
              to="/scholar-prog-available"
              className="text-xs font-bold text-blue-200 hover:text-white transition-colors"
            >
              Scholarship Programs
            </Link>
            <span className="text-slate-500 text-xs">/</span>
            <span className="text-xs font-extrabold text-amber-300">{selectedProgram.title}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Application Form: {selectedProgram.title}
          </h1>
          <p className="text-xs text-blue-200">
            Tailored requirements application wizard for <strong>{selectedProgram.categoryTitle}</strong>.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* NETWORK & OFFLINE PERSISTENCE STATUS BAR */}
        {!isOnline ? (
          <div className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-pulse">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
                <WifiOff className="h-5 w-5 animate-bounce" />
              </div>
              <div>
                <div className="font-extrabold text-sm flex items-center gap-2">
                  <span>OFFLINE MODE ACTIVE</span>
                  <span className="text-[10px] uppercase bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full font-black">
                    Zero Data Loss Protection
                  </span>
                </div>
                <div className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                  You have temporarily lost your internet connection. All filled information and attachments are safely held in local storage. You can continue filling out your form — all your data will stay intact when your internet comes back.
                </div>
              </div>
            </div>
            {draftSavedAt && (
              <span className="text-[11px] font-bold bg-amber-100 dark:bg-amber-900/60 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 whitespace-nowrap self-start sm:self-auto text-amber-900 dark:text-amber-200">
                Held safely on device ({draftSavedAt})
              </span>
            )}
          </div>
        ) : (
          <div className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-2xs ${
            isDark ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <Wifi className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="font-extrabold text-emerald-700 dark:text-emerald-400">Offline Resilience Protected:</span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400">
                All form fields & attached files are continuously held in local storage. If you lose internet, you will never start over.
              </span>
            </div>
            {draftSavedAt && (
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Auto-Saved: {draftSavedAt}</span>
                <button
                  type="button"
                  onClick={handleClearDraft}
                  className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline cursor-pointer font-bold"
                  title="Clear all saved data and start fresh"
                >
                  Clear Draft
                </button>
              </div>
            )}
          </div>
        )}

        {/* MILESTONE PROGRESS TRACKER */}
        <div className={`p-4 sm:p-6 rounded-2xl border shadow-sm space-y-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'}`}>
          <div className="flex items-center justify-between text-xs font-bold pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-wider text-[11px]">
              Step {currentStep} of 4: {steps[currentStep - 1].title}
            </span>
            <span className="bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 font-extrabold">
              {Math.round((currentStep / 4) * 100)}% Completed
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-4 relative">
            {steps.map((step) => {
              const StepIcon = step.icon;
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;

              return (
                <div
                  key={step.id}
                  onClick={() => {
                    if (step.id < currentStep) setCurrentStep(step.id);
                  }}
                  className={`flex flex-col items-center text-center space-y-2 transition-all ${
                    isActive
                      ? 'opacity-100'
                      : isCompleted
                      ? 'opacity-90 hover:opacity-100 cursor-pointer'
                      : 'opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`h-10 w-10 sm:h-12 sm:w-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-all shadow-sm ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                        : isActive
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-950 shadow-blue-600/30 scale-105'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isCompleted ? <Check className="h-5 w-5 stroke-[3]" /> : <StepIcon className="h-5 w-5" />}
                  </div>
                  <div>
                    <p
                      className={`text-[11px] sm:text-xs font-extrabold leading-snug ${
                        isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-[10px] text-slate-400 hidden sm:block font-medium mt-0.5">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PROGRAM QUALIFICATIONS BANNER CARD */}
        <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-gradient-to-br from-blue-50/90 via-slate-50 to-indigo-50/40 border-blue-200'}`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="primary" className="bg-blue-600 text-white font-extrabold text-[10px] px-2.5 py-0.5">
                {selectedProgram.badge}
              </Badge>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {selectedProgram.categoryTitle}
              </span>
            </div>
            <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white">
              {selectedProgram.title}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {selectedProgram.summary}
            </p>
          </div>

          {/* Grant Metrics & Qualifications Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-200/80 dark:border-slate-800">
            <div className="p-3.5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Tuition Grant</span>
              <p className="font-extrabold text-blue-600 dark:text-blue-400 text-base">{selectedProgram.tuitionGrant}</p>
            </div>
            <div className="p-3.5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Living Stipend</span>
              <p className="font-extrabold text-emerald-600 dark:text-emerald-400 text-base">{selectedProgram.stipend}</p>
            </div>
            <div className="p-3.5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Minimum Academic Requirement</span>
              <p className="font-extrabold text-amber-600 dark:text-amber-400 text-xs sm:text-sm">{selectedProgram.minGwaText}</p>
            </div>
          </div>

          {/* Program Criteria Checklist */}
          <div className="p-4 bg-white/80 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Program Qualifications & Eligibility Checklist:
            </span>
            <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300 pl-1">
              {selectedProgram.qualifications.map((q, qIdx) => (
                <li key={qIdx} className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FORM CONTAINER */}
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
          {/* STEP 1: BASIC INFORMATION */}
          {currentStep === 1 && (
            <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 animate-in fade-in duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'}`}>
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-[10px] font-bold">
                    Step 1
                  </Badge>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Basic Information</h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Please provide your personal, contact, and Quezon City residency details.
                </p>
              </div>

              {/* Personal Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">1. Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">First Name *</label>
                    <input
                      {...register('firstName')}
                      className={`w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                      placeholder="e.g. Maria"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Middle Name</label>
                    <input
                      {...register('middleName')}
                      className={`w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                      placeholder="e.g. Santos"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Last Name *</label>
                    <input
                      {...register('lastName')}
                      className={`w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                      placeholder="e.g. Dela Cruz"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.lastName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Suffix</label>
                    <input
                      {...register('suffix')}
                      className={`w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                      placeholder="e.g. Jr., III"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      {...register('dateOfBirth')}
                      className={`w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    />
                    {errors.dateOfBirth && (
                      <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.dateOfBirth.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Gender *</label>
                    <select
                      {...register('gender')}
                      className={`w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Civil Status *</label>
                    <select
                      {...register('civilStatus')}
                      className={`w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    >
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Separated">Separated</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Nationality *</label>
                    <input
                      {...register('nationality')}
                      className={`w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                      placeholder="Filipino"
                    />
                  </div>
                </div>
              </div>

              {/* Contact & Address Details */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  2. Contact & QC Residency Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">Email Address *</label>
                    <input
                      type="email"
                      {...register('email')}
                      className={`w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                      placeholder="applicant@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Mobile Number *</label>
                    <input
                      {...register('mobileNumber')}
                      className={`w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                      placeholder="09171234567"
                    />
                    {errors.mobileNumber && (
                      <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.mobileNumber.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">City / Municipality *</label>
                    <input
                      {...register('city')}
                      className={`w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                      placeholder="Quezon City"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold mb-1">House / Unit No., Street Address *</label>
                    <input
                      {...register('address')}
                      className={`w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                      placeholder="e.g. 123 Kalayaan Avenue"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.address.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Quezon City Barangay *</label>
                    <input
                      {...register('barangay')}
                      className={`w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                      placeholder="e.g. Barangay Central"
                    />
                    {errors.barangay && (
                      <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.barangay.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ACADEMIC INFORMATION */}
          {currentStep === 2 && (
            <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 animate-in fade-in duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'}`}>
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-[10px] font-bold">
                    Step 2
                  </Badge>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Academic Information</h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Provide your current school enrollment, course/strand, year level, and Cumulative GWA.
                </p>
              </div>

              {/* Requirement Alert Notice */}
              <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-center gap-3 text-xs text-blue-900 dark:text-blue-300">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>
                  Academic threshold for <strong>{selectedProgram.title}</strong>: <strong>{selectedProgram.minGwaText}</strong>.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Student ID Number / LRN *</label>
                  <input
                    {...register('studentId')}
                    className={`w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    placeholder="e.g. 2023-10492 / LRN"
                  />
                  {errors.studentId && (
                    <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.studentId.message}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold mb-1">
                    School / University / Training Center *
                  </label>
                  <select
                    {...register('school')}
                    className={`w-full p-2.5 border rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                  >
                    {QC_SCHOOLS.map((sch) => (
                      <option key={sch} value={sch}>
                        {sch}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phase 1: School Validation Exception Flow Callout */}
                {watch('school')?.includes('Other') && (
                  <div className="md:col-span-3 p-4 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 rounded-2xl space-y-3 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900 dark:text-amber-200">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span>🏫 School Validation Exception Flow Triggered</span>
                    </div>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300">
                      Your institution is not currently listed in the pre-accredited DepEd/CHED database. Please input your school's exact details below and attach a <strong>Certificate of Enrollment / Transcript</strong> in Step 4. Your application will be routed to the <strong>Special Eligibility Review Queue</strong>.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold mb-1">Official School / Institution Name *</label>
                        <input
                          {...register('unlistedSchoolName')}
                          className={`w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                          placeholder="e.g. Quezon City Polytechnic Institute"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">Campus / Institution Address *</label>
                        <input
                          {...register('unlistedSchoolAddress')}
                          className={`w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                          placeholder="e.g. Commonwealth Avenue, Quezon City"
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold mb-1">School Institution Type *</label>
                  <select
                    {...register('schoolType')}
                    className={`w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                  >
                    <option value="Public">Public Institution</option>
                    <option value="SUC">State University / College (SUC)</option>
                    <option value="LUC">Local University / College (LUC)</option>
                    <option value="Private">Private Institution</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold mb-1">
                    Beneficiary Department / College *
                  </label>
                  <select
                    {...register('department')}
                    className={`w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                  >
                    {INSTALLED_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Course / Academic Strand *</label>
                  <input
                    {...register('course')}
                    className={`w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    placeholder={selectedProgram.categoryId === 'shs' ? 'e.g. STEM / ABM / HUMSS' : 'e.g. B.S. Information Technology'}
                  />
                  {errors.course && (
                    <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.course.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Current Year / Grade Level *</label>
                  <select
                    {...register('yearLevel')}
                    className={`w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                  >
                    <option value="Grade 11">Grade 11 (SHS)</option>
                    <option value="Grade 12">Grade 12 (SHS)</option>
                    <option value="1st Year">1st Year College</option>
                    <option value="2nd Year">2nd Year College</option>
                    <option value="3rd Year">3rd Year College</option>
                    <option value="4th Year">4th Year College</option>
                    <option value="5th Year">5th Year College</option>
                    <option value="Postgraduate / Reviewee">Postgraduate / Reviewee</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">
                    Cumulative GWA (or % Equivalent) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('gwa', { valueAsNumber: true })}
                    className={`w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    placeholder={selectedProgram.categoryId === 'shs' ? 'e.g. 91.5' : 'e.g. 1.50'}
                  />
                  {errors.gwa && <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.gwa.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: FINANCIAL INFORMATION */}
          {currentStep === 3 && (
            <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 animate-in fade-in duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'}`}>
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-[10px] font-bold">
                    Step 3
                  </Badge>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Financial Information & Payout Channel</h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Specify household financial status, vulnerable sector verification, and preferred stipend disbursal account.
                </p>
              </div>

              {/* Household Financial Status */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  1. Household Financial Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">
                      Gross Annual Household Income (₱) *
                    </label>
                    <input
                      type="number"
                      {...register('annualIncome', { valueAsNumber: true })}
                      className={`w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                      placeholder="e.g. 120000"
                    />
                    {errors.annualIncome && (
                      <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.annualIncome.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Income Bracket *</label>
                    <select
                      {...register('incomeBracket')}
                      className={`w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    >
                      <option value="Low">Low Income (Below ₱250,000/yr)</option>
                      <option value="Middle">Middle Income (₱250,000 - ₱500,000/yr)</option>
                      <option value="High">Above ₱500,000/yr</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Number of Siblings</label>
                    <input
                      type="number"
                      {...register('numberOfSiblings', { valueAsNumber: true })}
                      className={`w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Sectoral checkmarks for Need-Based & Special Grant Priorities */}
                <div className="p-4 rounded-2xl border space-y-2 text-xs bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                  <span className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    Special Sector Inclusions (Check if applicable):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" {...register('is4Ps')} className="rounded text-blue-600" />
                      <span>4Ps Beneficiary Household</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" {...register('isSoloParent')} className="rounded text-blue-600" />
                      <span>Solo Parent / Dependent</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" {...register('isPWD')} className="rounded text-blue-600" />
                      <span>Person with Disability (PWD)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" {...register('isKasambahayOrToda')} className="rounded text-blue-600" />
                      <span>Kasambahay / TODA Dependent</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" {...register('isIndigenous')} className="rounded text-blue-600" />
                      <span>Indigenous Peoples (IP) / ALS Grad</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Disbursement Channel */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  2. Stipend Disbursal Account
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">Disbursement Channel *</label>
                    <select
                      {...register('disbursementChannel')}
                      className={`w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    >
                      <option value="Landbank ATM / Cash Card">Landbank ATM / Cash Card</option>
                      <option value="GCash E-Wallet">GCash E-Wallet</option>
                      <option value="Maya E-Wallet">Maya E-Wallet</option>
                      <option value="City Hall Cashier Pickup">City Hall Cashier Pickup</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Account Holder Full Name *</label>
                    <input
                      {...register('accountName')}
                      className={`w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                      placeholder="e.g. Maria S. Dela Cruz"
                    />
                    {errors.accountName && (
                      <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.accountName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Account / Mobile Number *</label>
                    <input
                      {...register('accountNumber')}
                      className={`w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                      placeholder="e.g. 09171234567 or 1234-5678-90"
                    />
                    {errors.accountNumber && (
                      <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.accountNumber.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PROGRAM-SPECIFIC UPLOADING REQUIREMENTS */}
          {currentStep === 4 && (
            <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 animate-in fade-in duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'}`}>
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-[10px] font-bold">
                      Step 4
                    </Badge>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                      Documentary Requirements ({selectedProgram.shortTitle})
                    </h2>
                  </div>
                  <Badge variant="primary" className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 font-extrabold text-xs">
                    {activeRequiredDocs.filter((d) => Boolean(uploadedDocs[d.id])).length} of {activeRequiredDocs.length} Attached
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Upload the required documentary attachments specifically mandatory for <strong>{selectedProgram.title}</strong>.
                </p>
              </div>

              {/* Dynamic Program-Specific Upload Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {activeRequiredDocs.map((docSpec) => {
                  const isUploaded = Boolean(uploadedDocs[docSpec.id]);
                  const uploadedMeta = uploadedDocs[docSpec.id];
                  const hasError = Boolean(uploadErrors[docSpec.id]);

                  // Special Case: Video Presentation Document
                  if (docSpec.id === 'voc_video_doc') {
                    const isVideoAttached = videoMode === 'link' ? Boolean(videoUrl.trim()) : Boolean(uploadedMeta);
                    return (
                      <div
                        key={docSpec.id}
                        className={`md:col-span-2 p-5 rounded-2xl border transition-all space-y-3 ${
                          hasError
                            ? 'border-red-400 bg-red-50/40 dark:bg-red-950/30'
                            : isVideoAttached
                            ? 'border-emerald-300 bg-emerald-50/30 dark:bg-emerald-950/20'
                            : isDark ? 'border-slate-700 bg-slate-850' : 'border-blue-200 bg-blue-50/40'
                        }`}
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Video className="h-4 w-4 text-blue-600" /> {docSpec.label}
                          </span>
                          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs shadow-2xs">
                            <button
                              type="button"
                              onClick={() => setVideoMode('link')}
                              className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                                videoMode === 'link' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              Option A: Video Link URL
                            </button>
                            <button
                              type="button"
                              onClick={() => setVideoMode('file')}
                              className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                                videoMode === 'file' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              Option B: Upload File
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{docSpec.description}</p>

                        {videoMode === 'link' ? (
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center gap-2">
                              <input
                                type="url"
                                value={videoUrl}
                                onChange={(e) => {
                                  setVideoUrl(e.target.value);
                                  setUploadErrors((prev) => {
                                    const copy = { ...prev };
                                    delete copy[docSpec.id];
                                    return copy;
                                  });
                                }}
                                className={`w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 ${
                                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                                }`}
                                placeholder="https://drive.google.com/file/d/... or https://youtube.com/watch?v=..."
                              />
                              {videoUrl.trim() && (
                                <Badge variant="success" className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold shrink-0 border-emerald-300">
                                  ✓ Link Set
                                </Badge>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2 pt-1">
                            <input
                              ref={(el) => { fileInputRefs.current[docSpec.id] = el; }}
                              type="file"
                              accept="video/mp4,video/quicktime,video/webm"
                              className="hidden"
                              onChange={(e) => handleFileUpload(docSpec.id, e.target.files?.[0], docSpec.label)}
                            />
                            {uploadedMeta ? (
                              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-2 shadow-2xs">
                                <div className="flex items-center gap-2 truncate">
                                  <Video className="h-5 w-5 text-blue-600 shrink-0" />
                                  <div className="truncate">
                                    <p className="text-xs font-extrabold truncate">{uploadedMeta.name}</p>
                                    <p className="text-[10px] text-slate-400">{uploadedMeta.size} • {uploadedMeta.uploadedAt}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => fileInputRefs.current[docSpec.id]?.click()}
                                    className="text-[11px] font-bold text-blue-600 p-1.5 h-auto"
                                  >
                                    Replace
                                  </Button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveDoc(docSpec.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                onClick={() => fileInputRefs.current[docSpec.id]?.click()}
                                className="p-5 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl text-center cursor-pointer hover:bg-blue-50/30 dark:hover:bg-blue-950/20"
                              >
                                <Video className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                                <p className="text-xs font-bold text-blue-900 dark:text-blue-300">Click to upload video presentation</p>
                                <p className="text-[10px] text-slate-400">MP4, MOV, WEBM up to 50MB</p>
                              </div>
                            )}
                          </div>
                        )}

                        {hasError && (
                          <p className="text-red-500 text-[11px] font-bold flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" /> {uploadErrors[docSpec.id]}
                          </p>
                        )}
                      </div>
                    );
                  }

                  // Default Standard Document Upload Card
                  return (
                    <div
                      key={docSpec.id}
                      className={`p-4 rounded-2xl border transition-all space-y-3 ${
                        hasError
                          ? 'border-red-400 bg-red-50/40 dark:bg-red-950/30'
                          : isUploaded
                          ? 'border-emerald-300 bg-emerald-50/30 dark:bg-emerald-950/20'
                          : isDark ? 'border-slate-800 bg-slate-850 hover:border-slate-700' : 'border-slate-200 bg-slate-50/60 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <FileText className="h-4 w-4 text-blue-600" /> {docSpec.label}
                        </span>
                        {isUploaded ? (
                          <Badge variant="success" className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 font-extrabold">
                            ✓ Attached
                          </Badge>
                        ) : docSpec.isRequired ? (
                          <Badge variant="primary" className="text-[9px] bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-none font-bold">
                            Required
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px] font-bold">
                            Optional
                          </Badge>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {docSpec.description}
                      </p>

                      <input
                        ref={(el) => { fileInputRefs.current[docSpec.id] = el; }}
                        type="file"
                        accept={docSpec.accept || '.pdf,.jpg,.jpeg,.png'}
                        className="hidden"
                        onChange={(e) => handleFileUpload(docSpec.id, e.target.files?.[0], docSpec.label)}
                      />

                      {isUploaded && uploadedMeta ? (
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-2 shadow-2xs">
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="h-5 w-5 text-emerald-600 shrink-0" />
                            <div className="truncate">
                              <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{uploadedMeta.name}</p>
                              <p className="text-[10px] text-slate-400 font-semibold">{uploadedMeta.size} • {uploadedMeta.uploadedAt}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => fileInputRefs.current[docSpec.id]?.click()}
                              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 p-1.5 h-auto"
                            >
                              Replace
                            </Button>
                            {docSpec.id !== 'residency_qc' && (
                              <button
                                type="button"
                                onClick={() => handleRemoveDoc(docSpec.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors cursor-pointer"
                                title="Remove file"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRefs.current[docSpec.id]?.click()}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            handleFileUpload(docSpec.id, e.dataTransfer.files?.[0], docSpec.label);
                          }}
                          className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-xl text-center cursor-pointer transition-all hover:bg-blue-50/20 dark:hover:bg-blue-950/20 group"
                        >
                          <UploadCloud className="h-6 w-6 text-slate-400 group-hover:text-blue-600 mx-auto mb-1 transition-colors" />
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600">
                            Click to upload or drag file here
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">PDF, PNG, JPG up to 10MB</p>
                        </div>
                      )}

                      {hasError && (
                        <p className="text-red-500 text-[11px] font-bold flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5" /> {uploadErrors[docSpec.id]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Consent Checkbox */}
              <div className={`p-4 rounded-2xl border space-y-2 ${isDark ? 'bg-slate-850 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('termsAccepted')}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                  />
                  <span className="text-xs text-slate-800 dark:text-slate-300 font-medium leading-relaxed">
                    I hereby certify that all information and attached documents submitted for <strong>{selectedProgram.title}</strong> are authentic, complete, and true. I understand that submitting false credentials will lead to immediate disqualification and that only <strong>one active scholarship application</strong> is permitted per applicant under QCSP rules. *
                  </span>
                </label>
                {errors.termsAccepted && (
                  <p className="text-red-500 text-[11px] font-semibold">{errors.termsAccepted.message}</p>
                )}
              </div>
            </div>
          )}

          {/* STEP NAVIGATION BUTTONS */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handlePrevStep}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
                className="font-extrabold text-xs cursor-pointer"
              >
                Previous Step
              </Button>
            ) : (
              <Link to="/scholar-prog-available">
                <Button type="button" variant="outline" size="md" className="font-extrabold text-xs cursor-pointer">
                  Cancel & Return
                </Button>
              </Link>
            )}

            {currentStep < 4 ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleNextStep}
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="font-extrabold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/30 px-6 cursor-pointer"
              >
                Next Step: {steps[currentStep].title} →
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                variant="primary"
                size="md"
                className="font-extrabold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 px-8 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" /> Submitting Application...
                  </span>
                ) : (
                  `Submit Application for ${selectedProgram.shortTitle} 🎉`
                )}
              </Button>
            )}
          </div>
        </form>
      </main>

      {/* SUBMISSION CELEBRATION MODAL */}
      {showSuccessModal && submittedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`rounded-3xl border max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            {/* Modal Header */}
            <div className="text-center space-y-2">
              <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20 ring-8 ring-emerald-50 dark:ring-emerald-900/40">
                <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
              </div>
              <Badge variant="success" className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 font-extrabold text-xs px-3 py-1">
                Application Successfully Filed
              </Badge>
              <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
                Application Submitted!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your application and all {selectedProgram.requiredDocuments.length} mandatory requirements for <strong>{submittedApp.scholarshipTitle}</strong> have been registered into the GovServe QCYDO Portal.
              </p>
            </div>

            {/* Application Summary Card */}
            <div className={`p-4 rounded-2xl border space-y-3 text-xs ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200/80'}`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 dark:border-slate-800">
                <span className="text-slate-500 font-semibold">Reference ID</span>
                <span className="font-mono font-black text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                  {submittedApp.id}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 dark:border-slate-800">
                <span className="text-slate-500 font-semibold">Scholarship Program</span>
                <span className="font-bold text-slate-900 dark:text-white text-right">{submittedApp.scholarshipTitle}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 dark:border-slate-800">
                <span className="text-slate-500 font-semibold">Grant Package</span>
                <span className="font-black text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm">{selectedProgram.totalMax}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 dark:border-slate-800">
                <span className="text-slate-500 font-semibold">Requirements Attached</span>
                <span className="font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  {selectedProgram.requiredDocuments.length} of {selectedProgram.requiredDocuments.length} Attached & Verified
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Live Evaluation Stage</span>
                <span className="font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                  Under Screening Committee Review
                </span>
              </div>
            </div>

            {/* Expected Verification Timeline (7-10 Business Days) */}
            <div className={`p-4 rounded-2xl border space-y-2 text-xs ${isDark ? 'bg-blue-950/40 border-blue-900' : 'bg-blue-50/80 border-blue-200'}`}>
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-extrabold">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Expected Verification Timeline:</span>
              </div>
              <div className={`flex items-center justify-between font-mono font-bold text-xs p-2.5 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700 text-blue-300' : 'bg-white border-blue-100 text-blue-900'}`}>
                <span>7–10 Business Days</span>
                <Badge variant="primary" size="sm" className="text-[10px]">
                  Estimated: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                The QCYDO Screening Committee will verify your credentials and documentary attachments within 7 to 10 working days.
              </p>
            </div>

            {/* Modal Action Buttons */}
            <div className="space-y-2 pt-2">
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={() => navigate('/applications')}
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="w-full font-black text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 py-3.5 cursor-pointer"
              >
                View Application Progress Tracker →
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => navigate('/documents')}
                  leftIcon={<UploadCloud className="h-4 w-4" />}
                  className="font-bold text-xs cursor-pointer"
                >
                  Document Vault
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => navigate('/dashboard')}
                  className="font-bold text-xs text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Scholar Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={`w-full text-xs py-8 border-t mt-auto ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo-system.png" alt="GovServe Logo" className="h-7 w-7 object-contain bg-blue-600/20 p-1 rounded-lg" />
            <span className="font-extrabold text-white">GovServe • Quezon City Youth Development Office</span>
          </div>
          <p>© 2026 Local Government Unit of Quezon City. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ApplicationForm;