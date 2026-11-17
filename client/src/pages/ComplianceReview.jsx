import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SideBySideInspectionDrawer } from '../components/compliance/SideBySideInspectionDrawer';
import { OfficerDecisionModal } from '../components/compliance/OfficerDecisionModal';
import { getComplianceApplication, submitComplianceDecision } from '../services/api';
import { ArrowLeft, ShieldCheck, AlertTriangle } from 'lucide-react';

export const ComplianceReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState({
    application_id: id || 'APP-8921-KYC',
    customer_name: 'David K. Sullivan',
    email: 'd.sullivan@techcorp.io',
    doc_type: 'PASSPORT',
    flag_reason: 'Biometric Vector Score Below Threshold (74.2%)',
    ocr_confidence: 99.1,
    match_score: 74.2,
    risk_level: 'HIGH',
    overall_status: 'FLAGGED',
    timestamp: new Date().toISOString(),
    document_image_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    selfie_image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  });

  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      getComplianceApplication(id)
        .then((data) => {
          if (data) setApplication(data);
        })
        .catch((err) => {
          console.warn('Could not load application from API:', err.message);
        });
    }
  }, [id]);

  const handleDecisionSubmit = async ({ applicationId, decision, reason_code, notes }) => {
    setIsSubmitting(true);
    try {
      await submitComplianceDecision(applicationId, { decision, reason_code, notes });
      setApplication((prev) => ({ ...prev, overall_status: decision }));
      setDecisionModalOpen(false);
      navigate('/compliance/queue');
    } catch (err) {
      console.error('Failed to submit decision:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/compliance/queue')}
          className="p-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#334155]"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#F8FAFC]">
            Inspection: {application.application_id}
          </h1>
          <p className="text-xs text-[#94A3B8]">
            Detailed comparison of customer OCR data, passport scan, and live biometric selfie
          </p>
        </div>
      </div>

      <SideBySideInspectionDrawer
        application={application}
        onClose={() => navigate('/compliance/queue')}
        onOpenDecisionModal={() => setDecisionModalOpen(true)}
      />

      {decisionModalOpen && (
        <OfficerDecisionModal
          application={application}
          isOpen={decisionModalOpen}
          onClose={() => setDecisionModalOpen(false)}
          onSubmitDecision={handleDecisionSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default ComplianceReview;
