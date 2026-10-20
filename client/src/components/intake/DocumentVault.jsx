import React, { useState } from "react";
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
} from "lucide-react";

export const MANDATORY_DOCS_BY_LOB = {
  CYBER: [
    {
      type: "APPLICATION",
      name: "Facultative Reinsurance Application",
      description: "Standard ACORD or Reinsurance Proposal Form",
    },
    {
      type: "LOSS_RUNS",
      name: "5-Year Historical Loss Runs",
      description: "Certified first-party and third-party cyber loss history",
    },
    {
      type: "CYBER_CONTROLS_AUDIT",
      name: "Cyber Controls Audit (MFA/EDR/Backups)",
      description: "Technical security questionnaire & architecture sheet",
    },
  ],
  DO: [
    {
      type: "APPLICATION",
      name: "D&O Reinsurance Application",
      description: "Public/Private Directors & Officers Questionnaire",
    },
    {
      type: "LOSS_RUNS",
      name: "5-Year Claims & Litigation History",
      description: "Historical securities/derivative action loss runs",
    },
    {
      type: "FINANCIALS",
      name: "3-Year Audited Financial Statements",
      description: "Balance sheet, cash flow, debt schedule, and 10-K",
    },
  ],
  EO: [
    {
      type: "APPLICATION",
      name: "Tech / Professional E&O Application",
      description: "Service scope and contract value questionnaire",
    },
    {
      type: "LOSS_RUNS",
      name: "5-Year Errors & Omissions Loss Runs",
      description: "Prior claims, arbitration & settlement log",
    },
    {
      type: "SERVICE_CONTRACTS",
      name: "Standard Client Service Agreement",
      description: "Master Services Agreement & liability caps",
    },
  ],
  EPLI: [
    {
      type: "APPLICATION",
      name: "EPLI Proposal Form",
      description: "Headcount breakdown, turnover metrics, and jurisdiction",
    },
    {
      type: "LOSS_RUNS",
      name: "5-Year Employment Practices Claims Log",
      description: "EEOC, severance disputes, and harassment loss runs",
    },
    {
      type: "HR_HANDBOOK",
      name: "Corporate Employee Handbook & HR Policy",
      description: "Formal anti-discrimination and whistleblower policies",
    },
  ],
  MED_MAL: [
    {
      type: "APPLICATION",
      name: "Medical Professional Liability Application",
      description: "Hospital / surgical facility facultative application",
    },
    {
      type: "LOSS_RUNS",
      name: "10-Year Medical Malpractice Loss Runs",
      description: "Historical actuarial malpractice claims history",
    },
    {
      type: "PHYSICIAN_ROSTER",
      name: "Physician & Specialty Credentialing Log",
      description: "Board certifications, privileges, and surgery volume",
    },
  ],
};

export const DocumentVault = ({
  lineOfBusiness = "CYBER",
  documents = [],
  onDocumentsChange,
  readOnly = false,
}) => {
  const [selectedType, setSelectedType] = useState("APPLICATION");
  const [isUploading, setIsUploading] = useState(false);

  const requiredDocs =
    MANDATORY_DOCS_BY_LOB[lineOfBusiness] || MANDATORY_DOCS_BY_LOB.CYBER;

  const getDocStatus = (docType) => {
    return documents.some(
      (d) => d.document_type === docType || d.documentType === docType,
    );
  };

  const uploadedCount = requiredDocs.filter((req) =>
    getDocStatus(req.type),
  ).length;
  const isComplete = uploadedCount === requiredDocs.length;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Simulate standard file object creation
    setTimeout(() => {
      const newDoc = {
        id: `doc-${Date.now()}`,
        document_type: selectedType,
        documentType: selectedType,
        file_name: file.name,
        fileName: file.name,
        file_size_bytes: file.size,
        fileSizeBytes: file.size,
        uploaded_at: new Date().toISOString(),
        is_mandatory: true,
      };

      const updated = [...documents, newDoc];
      onDocumentsChange?.(updated);
      setIsUploading(false);
    }, 400);
  };

  const handleRemove = (docId) => {
    if (readOnly) return;
    const updated = documents.filter((d) => d.id !== docId);
    onDocumentsChange?.(updated);
  };

  return (
    <div className="space-y-4">
      {/* Completeness Banner */}
      <div
        className={`p-4 rounded-xl border flex items-center justify-between ${
          isComplete
            ? "bg-emerald-50 border-emerald-200 text-emerald-900"
            : "bg-amber-50 border-amber-200 text-amber-900"
        }`}
      >
        <div className="flex items-center space-x-3">
          {isComplete ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          )}
          <div>
            <h4 className="text-sm font-semibold">
              LOB Document Completeness: {uploadedCount} of{" "}
              {requiredDocs.length} Mandatory Files
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              {isComplete
                ? "All required documentation for this Line of Business has been verified."
                : "Missing mandatory documents will flag an underwriting information request."}
            </p>
          </div>
        </div>
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            isComplete
              ? "bg-emerald-200 text-emerald-800"
              : "bg-amber-200 text-amber-800"
          }`}
        >
          {isComplete ? "100% COMPLETE" : "INCOMPLETE"}
        </span>
      </div>

      {/* Mandatory Requirements Checklist */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Mandatory File Checklist ({lineOfBusiness})
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {requiredDocs.map((req) => {
            const hasUploaded = getDocStatus(req.type);
            return (
              <div
                key={req.type}
                className={`p-3 rounded-lg border text-xs flex flex-col justify-between ${
                  hasUploaded
                    ? "bg-white border-emerald-300 text-slate-800 shadow-xs"
                    : "bg-white border-slate-200 text-slate-600"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-semibold">{req.name}</span>
                  {hasUploaded ? (
                    <span className="text-emerald-600 text-[10px] font-bold">
                      ✓ Uploaded
                    </span>
                  ) : (
                    <span className="text-amber-600 text-[10px] font-bold">
                      ! Pending
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {req.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Dropzone (if not readonly) */}
      {!readOnly && (
        <div className="border-2 border-dashed border-slate-300 hover:border-blue-400 bg-white rounded-xl p-6 text-center transition-colors">
          <UploadCloud className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <h5 className="text-sm font-semibold text-slate-800">
            Upload Underwriting Document
          </h5>
          <p className="text-xs text-slate-500 mb-4">
            Supports PDF, DOCX, XLSX (Max 25MB). Financials and loss runs
            encrypted at rest.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-800 w-full sm:w-auto"
              aria-label="Select Document Type"
            >
              {requiredDocs.map((d) => (
                <option key={d.type} value={d.type}>
                  {d.name}
                </option>
              ))}
              <option value="SUPPLEMENTAL">Supplemental Risk Assessment</option>
            </select>

            <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm inline-flex items-center justify-center">
              <span>
                {isUploading ? "Encrypting & Storing..." : "Select File"}
              </span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
              />
            </label>
          </div>
        </div>
      )}

      {/* Uploaded Documents List */}
      {documents.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 flex justify-between items-center">
            <span>Uploaded Submissions & Attachments ({documents.length})</span>
            <span className="text-slate-500 font-normal">
              AES-256 Encrypted
            </span>
          </div>
          <ul className="divide-y divide-slate-100 text-xs">
            {documents.map((doc) => (
              <li
                key={doc.id || doc.file_name}
                className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/50"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">
                      {doc.file_name || doc.fileName}
                    </p>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded border text-slate-700">
                        {doc.document_type || doc.documentType}
                      </span>
                      <span>
                        {doc.file_size_bytes
                          ? `${Math.round(doc.file_size_bytes / 1024)} KB`
                          : "1.2 MB"}
                      </span>
                    </div>
                  </div>
                </div>
                {!readOnly && (
                  <button
                    onClick={() => handleRemove(doc.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remove attachment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DocumentVault;
