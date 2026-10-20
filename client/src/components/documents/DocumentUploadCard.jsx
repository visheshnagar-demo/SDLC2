import React, { useState } from "react";
import {
  UploadCloud,
  File,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  X,
} from "lucide-react";
import { api } from "../../services/api";

export default function DocumentUploadCard({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState("treaty_slip");
  const [cedingCompany, setCedingCompany] = useState("");
  const [lineOfBusiness, setLineOfBusiness] = useState("Property Catastrophe");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a document file to upload.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_type", docType);
      formData.append(
        "ceding_company",
        cedingCompany || "Swiss Re Ceding Partner",
      );
      formData.append("line_of_business", lineOfBusiness);

      const res = await api.uploadDocument(formData);
      setSuccessMsg(
        `Document "${file.name}" successfully uploaded and queued for agentic parsing.`,
      );
      setFile(null);
      setCedingCompany("");
      if (onUploadSuccess) {
        onUploadSuccess(res);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      const detail =
        err.response?.data?.detail ||
        err.message ||
        "Failed to upload document.";
      setError(detail);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-[#0F2744]">
            Ingest Reinsurance Documents
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload treaties, slips, bordereaux, and claims logs for agentic
            extraction
          </p>
        </div>
        <img
          src="/GENRE.svg"
          alt="Gen Re Branding"
          className="h-6 w-auto opacity-70"
        />
      </div>

      {error && (
        <div
          role="alert"
          className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start space-x-2"
        >
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-xs uppercase tracking-wide">
              Upload Error
            </p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div
          role="status"
          className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800 flex items-start space-x-2"
        >
          <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-xs uppercase tracking-wide">
              Upload Success
            </p>
            <p className="text-xs mt-0.5">{successMsg}</p>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-500 hover:text-emerald-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
            isDragOver
              ? "border-[#0284C7] bg-sky-50/50"
              : "border-slate-300 hover:border-slate-400 bg-slate-50/40"
          }`}
          onClick={() => document.getElementById("treaty-file-input").click()}
        >
          <input
            id="treaty-file-input"
            type="file"
            className="hidden"
            accept=".pdf,.docx,.csv"
            onChange={handleFileChange}
          />
          <img
            src="/GENRE.svg"
            alt="Gen Re Branding"
            className="h-8 mx-auto mb-3 opacity-60"
          />
          <UploadCloud className="w-10 h-10 text-[#0F2744] mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-800">
            {file ? file.name : "Drag & Drop Reinsurance Slips & Claims Logs"}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {file
              ? `${(file.size / (1024 * 1024)).toFixed(2)} MB - Ready to upload`
              : "Supports PDF, DOCX, and CSV formats up to 50MB"}
          </p>
        </div>

        {/* Ingestion Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Document Category
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            >
              <option value="treaty_slip">
                Reinsurance Treaty Slip (Excess of Loss)
              </option>
              <option value="proportional_treaty">
                Quota Share / Surplus Treaty
              </option>
              <option value="claims_log">
                Historical Claims Bordereau (CSV)
              </option>
              <option value="underwriting_guideline">
                Underwriting Guideline Document
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ceding Insurer / Partner
            </label>
            <input
              type="text"
              placeholder="e.g. Swiss Re / Munich Re / Allianz"
              value={cedingCompany}
              onChange={(e) => setCedingCompany(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Line of Business
            </label>
            <select
              value={lineOfBusiness}
              onChange={(e) => setLineOfBusiness(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            >
              <option value="Property Catastrophe">Property Catastrophe</option>
              <option value="Casualty / Liability">Casualty / Liability</option>
              <option value="Marine & Energy">Marine & Energy</option>
              <option value="Aviation">Aviation & Aerospace</option>
              <option value="Financial Lines">Financial Lines & Cyber</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={uploading || !file}
            className={`inline-flex items-center px-5 py-2.5 rounded-lg text-xs font-bold text-white transition-colors shadow-sm ${
              uploading || !file
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-[#0F2744] hover:bg-[#1E3A8A]"
            }`}
          >
            {uploading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Ingesting & Parsing Document...
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4 mr-2" />
                Upload & Ingest Document
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
