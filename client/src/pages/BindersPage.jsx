import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout.jsx";
import BindingForm from "../components/binder/BindingForm.jsx";
import CertificatePreview from "../components/binder/CertificatePreview.jsx";
import { binderApi } from "../services/api.js";
import { FileCheck2, ShieldCheck, RefreshCw, Eye } from "lucide-react";

export default function BindersPage() {
  const location = useLocation();
  const selectedQuote = location.state?.selectedQuote;

  const [binders, setBinders] = useState([]);
  const [activeBinder, setActiveBinder] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBinders = async () => {
    setLoading(true);
    try {
      const data = await binderApi.getBinders();
      const list = Array.isArray(data) ? data : data?.content || [];
      setBinders(list);
      if (list.length > 0) {
        setActiveBinder(list[0]);
      }
    } catch (err) {
      console.warn("Could not load binders from backend:", err);
      // Fallback synthetic initial binder certificate
      const mockBinder = {
        id: "bind-genre-na-001",
        policyReferenceId: "GENRE-2026-POL-9921",
        quoteId: selectedQuote?.id || "quo-apex-cat-001",
        insuredName: selectedQuote?.insuredName || "Apex Global Assurance Corp",
        lineOfBusiness:
          selectedQuote?.lineOfBusiness ||
          "Property Catastrophe Excess of Loss",
        effectiveDate: "2026-07-01",
        expiryDate: "2027-06-30",
        grossPremium: selectedQuote?.quotedPremium || 4250000,
        limit: selectedQuote?.sumInsured || 50000000,
        attachmentPoint: selectedQuote?.attachmentPoint || 10000000,
        boundBy: "Aarchi Jain, FCAS (Lead Underwriter)",
        bindingTimestamp: "2026-05-18T14:32:00Z",
        status: "BOUND",
        documentSummary: {
          governingLaw: "State of New York, USA",
          arbitrationClause: "ARIAS U.S. Certified Rules",
          currency: "USD ($)",
          territorialScope: "United States & Territories",
          hashSha256:
            "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        },
      };
      setBinders([mockBinder]);
      setActiveBinder(mockBinder);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBinders();
  }, []);

  const handlePolicyBound = (newBinder) => {
    setActiveBinder(newBinder);
    setBinders((prev) => [
      newBinder,
      ...prev.filter((b) => b.id !== newBinder.id),
    ]);
  };

  return (
    <AppLayout pageTitle="Policy Binding & Certificate Management">
      <div className="space-y-8">
        {/* Top Header Banner */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Policy Binding & Evidentiary Certificate Management
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Execute definitive reinsurance binding covenants, confirm
              conditions precedent, and issue tamper-evident binder certificates
              with cryptographic audit records.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchBinders}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh Binders</span>
            </button>
          </div>
        </div>

        {/* 2-Column: Binding Form (left) + Certificate Preview (right) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-6">
            <BindingForm
              selectedQuote={selectedQuote}
              onPolicyBound={handlePolicyBound}
            />
          </div>

          <div className="xl:col-span-6">
            <CertificatePreview binderData={activeBinder} />
          </div>
        </div>

        {/* Bound Policies History Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Executed Policy Binders & Active Treaties
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              {binders.length} Legally Bound Treaties
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 uppercase font-bold text-slate-600 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Policy Ref ID</th>
                  <th className="py-3 px-4">Cedent / Insured</th>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Bound Limit</th>
                  <th className="py-3 px-4">Gross Premium</th>
                  <th className="py-3 px-4">Signatory Underwriter</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {binders.map((b) => (
                  <tr
                    key={b.id || b.policyReferenceId}
                    className={`hover:bg-blue-50/50 cursor-pointer transition ${
                      activeBinder?.policyReferenceId === b.policyReferenceId
                        ? "bg-blue-50/70 font-semibold"
                        : ""
                    }`}
                    onClick={() => setActiveBinder(b)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-900">
                      {b.policyReferenceId}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {b.insuredName || "Apex Global Assurance"}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {b.effectiveDate} to {b.expiryDate}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      ${Number(b.limit || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                      ${Number(b.grossPremium || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{b.boundBy}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {b.status || "BOUND"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveBinder(b);
                        }}
                        className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 font-semibold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
