import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Search,
  Play,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  FileSpreadsheet,
  Clock,
  Layers,
  ChevronRight,
} from "lucide-react";
import DocumentUploadCard from "../components/documents/DocumentUploadCard";
import { api } from "../services/api";

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDocuments();
      const list = Array.isArray(data)
        ? data
        : data.items || data.documents || [];
      setDocuments(list);
    } catch (err) {
      console.error("Failed to load documents:", err);
      setError("Unable to fetch documents from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUploadSuccess = (newDoc) => {
    fetchDocuments();
  };

  const handleTriggerAnalysis = async (docId) => {
    try {
      const job = await api.triggerAnalysis(docId);
      navigate(`/analysis?job_id=${job.id || ""}&doc_id=${docId}`);
    } catch (err) {
      console.error("Analysis trigger failed:", err);
      setError("Failed to initiate agent analysis.");
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const nameMatch = (doc.file_name || doc.id || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const typeMatch =
      filterType === "ALL" ||
      (doc.file_type || "").toUpperCase() === filterType;
    return nameMatch && typeMatch;
  });

  return (
    <div className="space-y-6">
      {/* Upload Card */}
      <DocumentUploadCard onUploadSuccess={handleUploadSuccess} />

      {/* Ingested Documents List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-[#0F2744]">
              Ingested Treaty & Claim Document Repository
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage uploaded slips, inspect extracted metadata, and launch
              agentic workflows
            </p>
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>

            {/* Filter by format */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg py-2 px-2.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            >
              <option value="ALL">All Formats</option>
              <option value="PDF">PDF</option>
              <option value="DOCX">DOCX</option>
              <option value="CSV">CSV</option>
            </select>

            <button
              onClick={fetchDocuments}
              className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
              title="Refresh document list"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0F2744]" />
            Loading repository files...
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No matching documents found in repository.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => {
              const docId = doc.id || doc._id;
              const metadata = doc.extracted_metadata || {};
              const isSelected = selectedDoc?.id === docId;

              return (
                <div
                  key={docId}
                  className={`bg-slate-50/70 border rounded-xl p-4 transition-all hover:border-[#1E3A8A] hover:shadow-md flex flex-col justify-between ${
                    isSelected
                      ? "border-[#1E3A8A] ring-2 ring-[#1E3A8A]/20 bg-white"
                      : "border-slate-200"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-[#0F2744] shadow-2xs">
                          {doc.file_type?.toLowerCase() === "csv" ? (
                            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <FileText className="w-5 h-5 text-[#1E3A8A]" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-900 leading-tight line-clamp-1">
                            {doc.file_name || "Reinsurance Document"}
                          </p>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {doc.file_type?.toUpperCase() || "DOCUMENT"} •{" "}
                            {doc.file_size_bytes
                              ? `${(doc.file_size_bytes / 1024).toFixed(1)} KB`
                              : "Uploaded"}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {doc.status || "INGESTED"}
                      </span>
                    </div>

                    {/* Metadata Preview */}
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Ceding Insurer:</span>
                        <span className="font-semibold text-slate-800">
                          {metadata.ceding_company ||
                            metadata.insurer ||
                            "Swiss Re Partner"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">
                          Line of Business:
                        </span>
                        <span className="font-semibold text-slate-800">
                          {metadata.line_of_business || "Property Cat"}
                        </span>
                      </div>
                      {doc.created_at && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">
                            Ingestion Date:
                          </span>
                          <span className="font-mono text-slate-700">
                            {new Date(doc.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-200/70 mt-3 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="text-xs font-semibold text-slate-600 hover:text-[#0F2744] flex items-center"
                    >
                      <span>Inspect Metadata</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </button>
                    <button
                      onClick={() => handleTriggerAnalysis(docId)}
                      className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-bold bg-[#0F2744] text-white hover:bg-[#1E3A8A] transition-colors shadow-xs"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Run Analysis
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Metadata Detail Modal / Card if selected */}
      {selectedDoc && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-[#0F2744]" />
              <h3 className="text-base font-bold text-[#0F2744]">
                Extracted Document Schema & Metadata: {selectedDoc.file_name}
              </h3>
            </div>
            <button
              onClick={() => setSelectedDoc(null)}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-2 py-1 rounded bg-slate-100"
            >
              Close Inspector
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                System Attributes
              </h4>
              <div className="text-xs space-y-1 font-mono text-slate-600">
                <p>
                  <span className="text-slate-400">ID:</span> {selectedDoc.id}
                </p>
                <p>
                  <span className="text-slate-400">File Type:</span>{" "}
                  {selectedDoc.file_type}
                </p>
                <p>
                  <span className="text-slate-400">Status:</span>{" "}
                  {selectedDoc.status}
                </p>
                <p>
                  <span className="text-slate-400">Storage Path:</span>{" "}
                  {selectedDoc.storage_path || "local-vault/treaties/"}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Extracted Schema & Content
              </h4>
              <pre className="text-[11px] bg-white p-3 rounded border border-slate-200 overflow-x-auto text-slate-800 font-mono">
                {JSON.stringify(
                  selectedDoc.extracted_metadata || {
                    message: "Raw document parsed successfully",
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
