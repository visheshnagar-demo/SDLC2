import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout.jsx";
import QuotingForm from "../components/quoting/QuotingForm.jsx";
import QuoteSummary from "../components/quoting/QuoteSummary.jsx";
import { quoteApi } from "../services/api.js";
import { RefreshCw, ListFilter, PlusCircle, CheckCircle2 } from "lucide-react";

export default function QuotingPage() {
  const location = useLocation();
  const [activeQuote, setActiveQuote] = useState(
    location.state?.selectedQuote || null,
  );
  const [quotesList, setQuotesList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const data = await quoteApi.getQuotes();
      const list = Array.isArray(data) ? data : data?.content || [];
      setQuotesList(list);
      if (!activeQuote && list.length > 0) {
        setActiveQuote(list[0]);
      }
    } catch (err) {
      console.warn("Could not load quotes from backend:", err);
      // Fallback synthetic initial quote so the prototype displays rich information even if backend is starting
      const mockQuote = {
        id: "quo-apex-cat-001",
        quoteNumber: "QUO-2026-001",
        insuredName: "Apex Global Assurance Corp",
        lineOfBusiness: "Property Catastrophe",
        sumInsured: 50000000,
        deductible: 5000000,
        structureType: "EXCESS_OF_LOSS",
        attachmentPoint: 10000000,
        targetRate: 8.5,
        rateOnLine: 8.5,
        quotedPremium: 4250000,
        cedingCommission: 5.0,
        status: "QUOTED",
      };
      setQuotesList([mockQuote]);
      if (!activeQuote) {
        setActiveQuote(mockQuote);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleQuoteGenerated = (newQuote) => {
    setActiveQuote(newQuote);
    setQuotesList((prev) => [
      newQuote,
      ...prev.filter((q) => q.id !== newQuote.id),
    ]);
  };

  return (
    <AppLayout pageTitle="Reinsurance Quoting & Submissions">
      <div className="space-y-8">
        {/* Page Top Banner */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Reinsurance Quoting & Actuarial Pricing Engine
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Calculate structured treaty pricing, evaluate rates on line, layer
              attachments, and ceding commission schedules using Gen Re
              synthetic actuarial datasets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchQuotes}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh Quotes</span>
            </button>
          </div>
        </div>

        {/* Main 2-Column Quoting Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form (7 Cols) */}
          <div className="lg:col-span-7">
            <QuotingForm onQuoteGenerated={handleQuoteGenerated} />
          </div>

          {/* Right Summary (5 Cols) */}
          <div className="lg:col-span-5">
            <QuoteSummary quote={activeQuote} />
          </div>
        </div>

        {/* Existing Synthetic Quotes Repository Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-blue-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Synthetic Quoting Records & Submissions
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              {quotesList.length} Active Records in Memory
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 uppercase font-bold text-slate-600 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Quote Ref</th>
                  <th className="py-3 px-4">Cedent / Insured</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Limit</th>
                  <th className="py-3 px-4">ROL</th>
                  <th className="py-3 px-4">Premium</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {quotesList.map((q) => (
                  <tr
                    key={q.id || q.quoteNumber}
                    className={`hover:bg-blue-50/50 cursor-pointer transition ${
                      activeQuote?.id === q.id
                        ? "bg-blue-50/70 font-semibold"
                        : ""
                    }`}
                    onClick={() => setActiveQuote(q)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-900">
                      {q.quoteNumber || `QUO-${q.id?.substring(0, 6)}`}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {q.insuredName}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {q.lineOfBusiness}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      ${Number(q.sumInsured || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-blue-700 font-bold">
                      {Number(q.rateOnLine || q.targetRate || 8.5).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                      ${Number(q.quotedPremium || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        {q.status || "QUOTED"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveQuote(q);
                        }}
                        className="text-blue-700 hover:text-blue-900 font-semibold"
                      >
                        Inspect &rarr;
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
