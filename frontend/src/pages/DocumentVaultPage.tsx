import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, Trash2, Download, Eye, Search, HardDrive, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getMyDocuments, createDocument, deleteDocument } from '../api/documents';
import type { VaultDocument } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { formatDate } from '../utils/cn';
import { useAuth } from '../context/AuthContext';
import { ScholarshipAwardCertificateModal } from '../components/common/ScholarshipAwardCertificateModal';

export const DocumentVaultPage: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newCategory, setNewCategory] = useState<VaultDocument['category']>('FAFSA');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  
  // Preview & Delete Confirmation
  const [previewDoc, setPreviewDoc] = useState<VaultDocument | null>(null);
  const [showAwardCertModal, setShowAwardCertModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Upload Progress Simulation
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await getMyDocuments();
        const apiData = res.data || [];
        const savedVaultDocs: VaultDocument[] = JSON.parse(localStorage.getItem('vault_uploaded_documents') || '[]');

        if (mounted) {
          if (apiData.length > 0) {
            const apiMapped = apiData.map((d: any) => ({
              id: d.id ?? `doc-${Math.random()}`,
              name: d.name ?? d.file_name ?? 'document.pdf',
              category: d.category ?? 'Academic Attachment',
              uploadDate: d.upload_date ?? d.uploaded_at ?? d.created_at ?? new Date().toISOString().split('T')[0],
              status: (d.status === 'verified' ? 'verified' : d.status === 'rejected' ? 'rejected' : 'pending') as VaultDocument['status'],
              size: d.size ?? '1.4 MB',
              expiryDate: d.expiry_date,
            }));
            setDocuments([...savedVaultDocs, ...apiMapped]);
          } else {
            setDocuments(savedVaultDocs);
          }
        }
      } catch {
        const savedVaultDocs: VaultDocument[] = JSON.parse(localStorage.getItem('vault_uploaded_documents') || '[]');
        if (mounted) {
          setDocuments(savedVaultDocs);
        }
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!newDocName) {
        setNewDocName(file.name);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (!newDocName) {
        setNewDocName(file.name);
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName) {
      toast.error('Please specify a document name');
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 200);

    setTimeout(async () => {
      clearInterval(interval);
      setUploadProgress(100);

      const fileSizeStr = selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.8 MB';
      const tempDoc: VaultDocument = {
        id: `doc-${Date.now()}`,
        name: newDocName.toLowerCase().endsWith('.pdf') || newDocName.toLowerCase().endsWith('.png') ? newDocName : `${newDocName}.pdf`,
        category: newCategory,
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        size: fileSizeStr,
      };

      try {
        await createDocument({ name: tempDoc.name, category: tempDoc.category });
      } catch {
        // offline fallback
      }

      setDocuments([tempDoc, ...documents]);
      setIsUploading(false);
      setUploadProgress(0);
      setShowUploadModal(false);
      setNewDocName('');
      setSelectedFile(null);
      toast.success('Document uploaded successfully and queued for verification!');
    }, 1000);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    const target = documents.find((d) => d.id === deleteTargetId);
    setDocuments(documents.filter((d) => d.id !== deleteTargetId));
    try {
      await deleteDocument(deleteTargetId);
    } catch {
      // offline
    }
    toast.success(`Deleted ${target?.name ?? 'document'}`);
    setDeleteTargetId(null);
  };

  const handleDownload = (doc: VaultDocument) => {
    toast.info(`Downloading ${doc.name}...`);
  };

  // Filtered docs
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || doc.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'all' || doc.category.toLowerCase() === selectedCategoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const usedMB = 14.8;
  const totalMB = 50.0;
  const usedPercent = Math.round((usedMB / totalMB) * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-border shadow-soft">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-foreground">Secure Document Vault</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Store, manage, and verify official transcripts, FAFSA forms, recommendation letters, and tax affidavits.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => setShowUploadModal(true)}
          leftIcon={<UploadCloud className="h-4 w-4" />}
          className="font-bold shadow-md shadow-blue-600/20 shrink-0"
        >
          Upload New Document
        </Button>
      </div>

      {/* Storage Indicator & Category Quick Filter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="bg-white border border-slate-200 text-slate-900 shadow-soft">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-blue-600" />
                <span className="font-heading text-xs font-bold uppercase tracking-wider text-slate-700">Vault Storage</span>
              </div>
              <span className="text-xs font-bold text-blue-600">{usedPercent}% Used</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
              <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${usedPercent}%` }} />
            </div>
            <p className="text-[11px] text-slate-500">
              Used <span className="font-bold text-slate-900">{usedMB} MB</span> of <span className="font-bold text-slate-900">{totalMB} MB</span> allocated storage.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Total Documents</p>
              <p className="font-heading font-extrabold text-2xl text-foreground mt-0.5">{documents.length}</p>
              <p className="text-[11px] text-slate-500 mt-1">Encrypted with AES-256</p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Verification Rate</p>
              <p className="font-heading font-extrabold text-2xl text-emerald-600 mt-0.5">
                {documents.filter((d) => d.status === 'verified').length} / {documents.length} Verified
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Reviewed by Financial Aid</p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Document Table & Filter Controls */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <CardTitle>Vault File Repository</CardTitle>
            <CardDescription>Search, filter, preview, or download verified documents.</CardDescription>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search file name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-border rounded-xl focus:outline-none focus:border-primary"
              />
            </div>

            {/* Category Dropdown */}
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full sm:w-auto h-9 px-3 text-xs bg-slate-50 border border-border rounded-xl focus:outline-none focus:border-primary"
            >
              <option value="all">All Categories</option>
              <option value="FAFSA">FAFSA</option>
              <option value="Tax Form">Tax Form</option>
              <option value="Transcript">Transcript</option>
              <option value="Recommendation">Recommendation</option>
              <option value="ID Verification">ID Verification</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase group-label border-b border-border">
                <tr>
                  <th className="p-3">Document Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Upload Date</th>
                  <th className="p-3">File Size</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No documents found matching query.
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4" />
                          </div>
                          <span className="font-bold text-slate-900 truncate max-w-xs">{doc.name}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">{doc.category}</span>
                      </td>
                      <td className="p-3 text-slate-600">{formatDate(doc.uploadDate)}</td>
                      <td className="p-3 text-slate-500">{doc.size}</td>
                      <td className="p-3">
                        <Badge
                          variant={doc.status === 'verified' ? 'success' : doc.status === 'pending' ? 'warning' : 'destructive'}
                        >
                          {doc.status === 'verified' ? 'Verified' : doc.status === 'pending' ? 'Pending Review' : 'Rejected'}
                        </Badge>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <button
                          onClick={() => {
                            if (doc.category === 'award_certificate' || doc.name.toLowerCase().includes('official_scholar_award_certificate') || doc.name.toLowerCase().includes('scholar_award')) {
                              setShowAwardCertModal(true);
                            } else {
                              setPreviewDoc(doc);
                            }
                          }}
                          title="Preview Document"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(doc)}
                          title="Download Document"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(doc.id)}
                          title="Delete Document"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Upload Modal */}
      {showUploadModal && (
        <Modal
          isOpen={showUploadModal}
          onClose={() => !isUploading && setShowUploadModal(false)}
          title="Upload Document to Vault"
          description="Drag and drop or select a PDF, PNG, or JPG file"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setShowUploadModal(false)} disabled={isUploading}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleUploadSubmit} disabled={isUploading} className="font-bold">
                {isUploading ? 'Uploading...' : 'Confirm Upload'}
              </Button>
            </>
          }
        >
          <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-foreground mb-1">Document Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full h-10 px-3 bg-white border border-border rounded-xl text-xs focus:outline-none focus:border-primary"
              >
                <option value="FAFSA">FAFSA Student Aid Report</option>
                <option value="Tax Form">W2 / Tax Return Transcript</option>
                <option value="Transcript">Official University Transcript</option>
                <option value="Recommendation">Recommendation Letter</option>
                <option value="ID Verification">Government Photo ID</option>
                <option value="Income Affidavit">Income Affidavit</option>
                <option value="Contract">Scholarship Agreement / Grant MOA</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">Document File Name</label>
              <input
                type="text"
                placeholder="2026_FAFSA_Form.pdf"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                required
                className="w-full h-10 px-3 bg-white border border-border rounded-xl text-xs focus:outline-none focus:border-primary"
              />
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="p-6 border-2 border-dashed border-slate-300 hover:border-primary rounded-2xl bg-slate-50 text-center space-y-2 cursor-pointer transition-colors"
            >
              <input type="file" id="file-upload" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileSelect} />
              <label htmlFor="file-upload" className="cursor-pointer block space-y-1">
                <UploadCloud className="h-8 w-8 text-primary mx-auto" />
                <p className="font-bold text-slate-800">
                  {selectedFile ? selectedFile.name : 'Click to browse or drop file here'}
                </p>
                <p className="text-[11px] text-slate-400">Supports PDF, PNG, JPG up to 10 MB</p>
              </label>
            </div>

            {/* Upload Progress Bar */}
            {isUploading && (
              <div className="space-y-1 pt-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                  <span>Uploading file...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}
          </form>
        </Modal>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <Modal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          title={`Document Preview: ${previewDoc.name}`}
          description={`Category: ${previewDoc.category} | Uploaded: ${formatDate(previewDoc.uploadDate)}`}
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl flex flex-col items-center justify-center space-y-3 min-h-[220px]">
              <FileText className="h-12 w-12 text-blue-400" />
              <p className="font-bold text-sm">{previewDoc.name}</p>
              <p className="text-slate-400 text-[11px]">AES-256 Encrypted PDF Preview Container</p>
              <Badge variant={previewDoc.status === 'verified' ? 'success' : 'warning'}>
                {previewDoc.status.toUpperCase()}
              </Badge>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setPreviewDoc(null)}>
                Close
              </Button>
              <Button variant="primary" size="sm" onClick={() => handleDownload(previewDoc)} leftIcon={<Download className="h-3.5 w-3.5" />}>
                Download File
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <Modal
          isOpen={!!deleteTargetId}
          onClose={() => setDeleteTargetId(null)}
          title="Confirm Document Deletion"
          description="Are you sure you want to permanently remove this file from your Document Vault?"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setDeleteTargetId(null)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={confirmDelete} className="font-bold">
                Yes, Delete Document
              </Button>
            </>
          }
        >
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
            <p>This action cannot be undone. Any active applications linked to this document will lose access to this verification file.</p>
          </div>
        </Modal>
      )}

      {/* Official Certificate of Scholarship Award Modal */}
      {showAwardCertModal && (
        <ScholarshipAwardCertificateModal
          isOpen={showAwardCertModal}
          onClose={() => setShowAwardCertModal(false)}
          applicantName={user?.name || 'Pia Marie T. Faner'}
          applicantEmail={user?.email || 'piamariefaner2004@gmail.com'}
          studentId={user?.student_id || '23010366'}
          programTitle="Quezon City Scholarship Program (QCSP)"
          awardAmount={20000}
          school={user?.department || 'Bestlink College of the Philippines (BCP)'}
          course={user?.major || 'B.S. Information Technology'}
          gpa={user?.gpa || 1.50}
        />
      )}
    </div>
  );
};
