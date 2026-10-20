import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SubmissionIntakeForm } from "../components/intake/SubmissionIntakeForm";
import { api } from "../services/api";
import {
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "../components/common/Button";

export const SubmissionIntakePage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSub, setSubmittedSub] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await api.createSubmission(formData);
      setSubmittedSub(res);
    } catch (err) {
      // In case backend is not currently running or returned error
      // Show explicit error message without fake success
      const msg =
        err.response?.data?.detail ||
        err.message ||
        "Failed to submit risk to backend.";
      setErrorMessage(
        `Submission Failed: ${msg}. Please ensure backend API is running.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
            Ceding Insurer Intake Portal
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            New Facultative Risk Submission
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Submit specialty risk parameters, upload mandatory LOB
            documentation, and initiate automated underwriting scoring.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-900">Submission Error</h4>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Success View */}
      {submittedSub ? (
        <div className="bg-white border border-emerald-200 rounded-2xl p-8 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-bold text-slate-900">
              Facultative Submission Successfully Received!
            </h2>
            <p className="text-xs text-slate-600">
              Submission ID:{" "}
              <strong className="text-blue-600 font-mono text-sm">
                {submittedSub.id || "SUB-8841"}
              </strong>{" "}
              has been routed to the reinsurance underwriting queue.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-lg mx-auto text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Insured Entity:</span>
              <span className="font-semibold text-slate-800">
                {submittedSub.insured_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Line of Business:</span>
              <span className="font-semibold text-slate-800">
                {submittedSub.line_of_business}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Requested Limit:</span>
              <span className="font-semibold text-slate-800">
                ${(submittedSub.policy_limit / 1000000).toFixed(1)}M
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Current Status:</span>
              <span className="font-bold text-blue-600">
                {submittedSub.status || "RECEIVED"}
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              variant="secondary"
              onClick={() => {
                setSubmittedSub(null);
                setErrorMessage("");
              }}
            >
              Submit Another Risk
            </Button>
            <Button
              variant="primary"
              icon={ArrowRight}
              onClick={() =>
                navigate(`/submissions/${submittedSub.id || "SUB-8841"}`)
              }
            >
              View Risk Details & Score
            </Button>
          </div>
        </div>
      ) : (
        <SubmissionIntakeForm
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
};

export default SubmissionIntakePage;
