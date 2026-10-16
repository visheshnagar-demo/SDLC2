import React, { useState } from "react";
import {
  UploadCloud,
  File,
  Trash2,
  CheckCircle2,
  Paperclip,
  AlertCircle,
} from "lucide-react";
import Button from "../common/Button";

export function AttachmentUploader({
  files = [],
  onFilesChange,
  riskType = "Cyber",
}) {
  const [docType, setDocType] = useState(
    riskType.toLowerCase().includes("cyber")
      ? "security_audit"
      : "audited_financials",
  );
  const [customName, setCustomName] = useState("");

  const docOptions = riskType.toLowerCase().includes("cyber")
    ? [
        {
          value: "security_audit",
          label: "Third-Party Security Audit / Pen Test",
        },
        { value: "policy_wording", label: "Underlying Primary Policy Wording" },
        { value: "loss_runs", label: "Historical Loss Runs (5 Years)" },
        {
          value: "incident_response",
          label: "Incident Response & Backup Policy",
        },
        { value: "other", label: "Supplementary Risk Document" },
      ]
    : [
        {
          value: "audited_financials",
          label: "Audited Financial Statements (Last 3 Years)",
        },
        { value: "policy_wording", label: "Primary D&O Policy Wordings" },
        {
          value: "governance_charter",
          label: "Board Governance & Litigation Summary",
        },
        { value: "loss_runs", label: "Historical D&O Loss Experience" },
        { value: "other", label: "Supplementary Document" },
      ];

  const handleAddSample = (e) => {
    e.preventDefault();
    const docOption = docOptions.find((d) => d.value === docType);
    const fileName =
      customName.trim() ||
      `${docOption?.label.split(" ")[0]}_Report_${Date.now().toString().slice(-4)}.pdf`;

    const newFile = {
      id: `att-${Date.now()}`,
      document_type: docType,
      document_type_label: docOption?.label || docType,
      file_name: fileName,
      file_size: `${(Math.random() * 4 + 1).toFixed(1)} MB`,
      uploaded_at: new Date().toISOString(),
    };

    onFilesChange([...files, newFile]);
    setCustomName("");
  };

  const handleRemove = (id) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Quick Add Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Attach Risk Documentation
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-5">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Document Category
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {docOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-5">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              File Name / Reference
            </label>
            <input
              type="text"
              placeholder="e.g. 2025_Audited_Financials.pdf"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="md:col-span-2">
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={Paperclip}
              onClick={handleAddSample}
              className="w-full"
            >
              Attach
            </Button>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50/50">
          <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">
            No documents attached yet
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Attach audited financials, security assessments, or loss runs to
            clear automated checklist flags.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg text-xs"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 rounded bg-indigo-50 text-indigo-600 shrink-0">
                  <File className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="font-semibold text-slate-800 truncate">
                    {file.file_name}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span className="text-indigo-600 font-medium">
                      {file.document_type_label || file.document_type}
                    </span>
                    <span>•</span>
                    <span>{file.file_size}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemove(file.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                title="Remove attachment"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AttachmentUploader;
