import React from "react";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Trash2,
} from "lucide-react";
import Badge from "../common/Badge";

export const LOB_DOCUMENT_REQUIREMENTS = {
  "Cyber Risk": [
    {
      key: "application",
      name: "Cyber Facultative Application (PDF)",
      required: true,
    },
    {
      key: "loss_runs",
      name: "3-Year Certified Loss Runs (XLSX/PDF)",
      required: true,
    },
    {
      key: "financials",
      name: "Audited Financial Statements (PDF)",
      required: true,
    },
    {
      key: "cyber_controls",
      name: "Cyber Security & MFA Questionnaire (PDF)",
      required: true,
    },
  ],
  "D&O": [
    {
      key: "application",
      name: "D&O Liability Application (PDF)",
      required: true,
    },
    {
      key: "loss_runs",
      name: "5-Year Claims & Loss History (XLSX)",
      required: true,
    },
    {
      key: "financials",
      name: "Audited Financials / SEC Form 10-K (PDF)",
      required: true,
    },
    {
      key: "board_charter",
      name: "Board Composition & Governance Charter",
      required: false,
    },
  ],
  "E&O": [
    {
      key: "application",
      name: "E&O Specialty Application Form (PDF)",
      required: true,
    },
    {
      key: "loss_runs",
      name: "3-Year Historical Loss Runs (XLSX)",
      required: true,
    },
    {
      key: "contracts",
      name: "Standard Client Contract / MSA Template (PDF)",
      required: true,
    },
  ],
  EPLI: [
    {
      key: "application",
      name: "EPLI Specialty Application (PDF)",
      required: true,
    },
    {
      key: "loss_runs",
      name: "5-Year EEOC & EPL Claims History (XLSX)",
      required: true,
    },
    {
      key: "handbook",
      name: "Employee Handbook & Anti-Harassment Policy",
      required: true,
    },
  ],
  "Medical Professional Liability": [
    {
      key: "application",
      name: "Medical Malpractice Application (PDF)",
      required: true,
    },
    {
      key: "loss_runs",
      name: "5-Year Historical Loss Runs (XLSX)",
      required: true,
    },
    {
      key: "credentials",
      name: "Physician Roster & Board Certifications (PDF)",
      required: true,
    },
  ],
};

export const DocumentCompletenessGate = ({
  lineOfBusiness = "Cyber Risk",
  uploadedDocuments = [],
  onUploadDocument,
  onRemoveDocument,
  readOnly = false,
}) => {
  const requirements =
    LOB_DOCUMENT_REQUIREMENTS[lineOfBusiness] ||
    LOB_DOCUMENT_REQUIREMENTS["Cyber Risk"];

  const getDocStatus = (req) => {
    const found = uploadedDocuments.find(
      (d) => d.type === req.key || d.name.toLowerCase().includes(req.key),
    );
    if (found && found.status !== "PENDING") {
      return { uploaded: true, doc: found };
    }
    return { uploaded: false, doc: null };
  };

  const missingMandatory = requirements.filter(
    (req) => req.required && !getDocStatus(req).uploaded,
  );
  const isComplete = missingMandatory.length === 0;

  const handleSimulatedUpload = (req) => {
    if (readOnly) return;
    const fakeDoc = {
      id: `doc-${Date.now()}`,
      name: `${req.name.split(" (")[0].replace(/\s+/g, "_")}_Signed.pdf`,
      type: req.key,
      size_mb: (Math.random() * 3 + 1).toFixed(1),
      status: "UPLOADED",
      uploaded_at: new Date().toISOString(),
    };
    onUploadDocument(fakeDoc);
  };

  return (
    <div className="space-y-4">
      {/* Completeness Summary Banner */}
      <div
        className={`p-4 rounded-xl border flex items-center justify-between ${
          isComplete
            ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
            : "bg-amber-50/80 border-amber-200 text-amber-900"
        }`}
      >
        <div className="flex items-center space-x-3">
          {isComplete ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          )}
          <div>
            <h4 className="text-sm font-semibold">
              {isComplete
                ? "Document Completeness Check: Passed"
                : `Document Completeness Check: ${missingMandatory.length} Mandatory Document(s) Missing`}
            </h4>
            <p className="text-xs opacity-90">
              {isComplete
                ? `All mandatory underwriting documents for ${lineOfBusiness} are satisfied.`
                : `Underwriting review for ${lineOfBusiness} requires all mandatory documents before binding.`}
            </p>
          </div>
        </div>
        <Badge
          variant={isComplete ? "BOUND" : "WARNING"}
          label={isComplete ? "Complete" : "Pending Docs"}
        />
      </div>

      {/* Checklist Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
          <span>Required Document Manifest ({lineOfBusiness})</span>
          <span>Status & Action</span>
        </div>
        <ul className="divide-y divide-slate-100">
          {requirements.map((req) => {
            const { uploaded, doc } = getDocStatus(req);
            return (
              <li
                key={req.key}
                className="px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${uploaded ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                  >
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900 flex items-center space-x-2">
                      <span>{req.name}</span>
                      {req.required ? (
                        <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wider bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          Mandatory
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">
                          Optional
                        </span>
                      )}
                    </div>
                    {uploaded && doc && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {doc.name} • {doc.size_mb} MB • Uploaded{" "}
                        {new Date(
                          doc.uploaded_at || Date.now(),
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {uploaded ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                      </span>
                      {!readOnly && onRemoveDocument && doc && (
                        <button
                          type="button"
                          onClick={() => onRemoveDocument(doc.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                          title="Remove file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Pending
                      </span>
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => handleSimulatedUpload(req)}
                          className="inline-flex items-center text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          <UploadCloud className="w-3.5 h-3.5 mr-1" /> Upload
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default DocumentCompletenessGate;
