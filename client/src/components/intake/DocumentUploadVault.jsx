import React, { useState } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ShieldCheck,
} from "lucide-react";

const REQUIRED_DOCS_BY_LOB = {
  "Cyber Risk": [
    {
      type: "Application",
      name: "Cyber Security Application (with Ransomware Supp.)",
      required: true,
    },
    {
      type: "Loss Runs",
      name: "3-Year Prior Cyber & Ransomware Loss Runs",
      required: true,
    },
    {
      type: "Financials / Audit",
      name: "SOC 2 Type II or Security Architecture Audit",
      required: true,
    },
  ],
  "D&O": [
    {
      type: "Application",
      name: "D&O Renewal Application & Questionnaire",
      required: true,
    },
    {
      type: "Financials",
      name: "3-Year Audited Financial Statements & 10-K",
      required: true,
    },
    {
      type: "Loss Runs",
      name: "Prior Securities & Derivative Litigation History",
      required: true,
    },
  ],
  "E&O": [
    {
      type: "Application",
      name: "Specialty E&O Professional Services Form",
      required: true,
    },
    {
      type: "Contracts",
      name: "Standard Client Contract & Limitation of Liability Clauses",
      required: true,
    },
    { type: "Loss Runs", name: "5-Year Claims Loss History", required: true },
  ],
  EPLI: [
    {
      type: "Application",
      name: "Employment Practices Liability Application",
      required: true,
    },
    {
      type: "Handbook",
      name: "Employee Handbook & Anti-Harassment Protocols",
      required: true,
    },
    {
      type: "Loss Runs",
      name: "5-Year EEOC & Severance Claims History",
      required: true,
    },
  ],
  "Medical Professional Liability": [
    {
      type: "Application",
      name: "Hospital / Facility Malpractice Application",
      required: true,
    },
    {
      type: "Guidelines",
      name: "Physician Credentialing & Clinical Protocols",
      required: true,
    },
    {
      type: "Loss Runs",
      name: "10-Year Actuarial Loss Runs by Specialty Unit",
      required: true,
    },
  ],
};

export default function DocumentUploadVault({
  lineOfBusiness = "Cyber Risk",
  uploadedDocs = [],
  onUploadDoc,
  onDeleteDoc,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const requirements =
    REQUIRED_DOCS_BY_LOB[lineOfBusiness] || REQUIRED_DOCS_BY_LOB["Cyber Risk"];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleFiles = (file) => {
    setUploading(true);
    setTimeout(() => {
      const newDoc = {
        id: `doc-${Date.now()}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: "Supporting Document",
        uploadedAt: new Date().toISOString(),
        verified: true,
      };
      if (onUploadDoc) onUploadDoc(newDoc);
      setUploading(false);
    }, 600);
  };

  const isSatisfied = (req) => {
    return uploadedDocs.some(
      (d) =>
        d.type.toLowerCase().includes(req.type.toLowerCase()) ||
        d.name.toLowerCase().includes(req.type.toLowerCase()),
    );
  };

  const completenessPercentage = Math.round(
    (requirements.filter(isSatisfied).length / requirements.length) * 100,
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <span>Document Completeness Vault</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Mandatory underwriting artifacts for{" "}
            <strong className="text-slate-800">{lineOfBusiness}</strong>
          </p>
        </div>
        <div className="text-right">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
              completenessPercentage === 100
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {completenessPercentage}% Complete
          </span>
        </div>
      </div>

      {/* LOB Checklist */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
          Required Artifacts Check
        </div>
        <div className="space-y-2">
          {requirements.map((req, idx) => {
            const satisfied = isSatisfied(req);
            return (
              <div
                key={idx}
                className={`flex items-start gap-2.5 p-2.5 rounded-lg text-xs border ${
                  satisfied
                    ? "bg-emerald-50/50 border-emerald-200 text-emerald-950"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                {satisfied ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-semibold">{req.name}</div>
                  <div className="text-[11px] text-slate-500">
                    Classification: {req.type}
                  </div>
                </div>
                <span className="text-[10px] font-medium text-slate-400">
                  {satisfied ? "Uploaded" : "Pending"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          dragActive
            ? "border-primary bg-blue-50/50"
            : "border-slate-300 hover:border-slate-400 bg-slate-50/30"
        }`}
      >
        <UploadCloud className="w-8 h-8 text-primary mx-auto mb-2 opacity-80" />
        <p className="text-xs font-semibold text-slate-800 mb-1">
          {uploading
            ? "Scanning & Encrypting File..."
            : "Drag & drop underwriting files, or browse"}
        </p>
        <p className="text-[11px] text-slate-500 mb-3">
          Supports PDF, XLSX, DOCX up to 50MB (AES-256 Encrypted in transit)
        </p>
        <label className="inline-flex items-center justify-center px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium cursor-pointer shadow-xs">
          <span>Select Document</span>
          <input
            type="file"
            className="hidden"
            onChange={handleChange}
            accept=".pdf,.xlsx,.xls,.docx,.csv"
          />
        </label>
      </div>

      {/* Uploaded Documents List */}
      {uploadedDocs && uploadedDocs.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Uploaded Files ({uploadedDocs.length})
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {uploadedDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div className="truncate">
                    <span className="font-medium text-slate-800">
                      {doc.name}
                    </span>
                    <span className="text-slate-400 text-[10px] ml-2">
                      ({doc.size})
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                    Verified
                  </span>
                  {onDeleteDoc && (
                    <button
                      type="button"
                      onClick={() => onDeleteDoc(doc.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
