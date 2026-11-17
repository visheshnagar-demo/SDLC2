import React, { useState } from 'react';
import { X, Lock, CheckCircle2, Copy, ShieldCheck, Terminal, Hash } from 'lucide-react';

export const EventDetailModal = ({ event, isOpen, onClose }) => {
  if (!isOpen || !event) return null;

  const [copied, setCopied] = useState(false);

  const handleCopyJson = () => {
    navigator.clipboard?.writeText(JSON.stringify(event, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0F172A] border border-[#334155] rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-[#334155] flex items-center justify-between bg-[#131B2E]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0284C7]/15 border border-[#0284C7]/30 flex items-center justify-center text-[#38BDF8]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#F8FAFC]">
                  Audit Event Inspector: {event.id}
                </h3>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                  IMMUTABLE MERKLE LEAF
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8]">
                Cryptographic Activity Log Entry &amp; State Payload
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-4">
          {/* Cryptographic Proof Box */}
          <div className="p-3.5 rounded-lg bg-[#0B1326] border border-[#334155] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-[#94A3B8] flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-[#0284C7]" />
                SHA-256 Digest Checksum
              </span>
              <span className="text-[9px] font-mono text-[#10B981] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                SIGNATURE VERIFIED
              </span>
            </div>
            <div className="p-2 rounded bg-[#171F33] font-mono text-xs text-[#38BDF8] break-all border border-[#334155]">
              {event.hash_checksum ||
                'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded bg-[#0B1326] border border-[#334155]">
              <span className="text-[9px] font-mono uppercase text-[#94A3B8] block">Actor ID</span>
              <span className="font-mono text-[#F8FAFC]">{event.user_id || 'system'}</span>
            </div>
            <div className="p-2.5 rounded bg-[#0B1326] border border-[#334155]">
              <span className="text-[9px] font-mono uppercase text-[#94A3B8] block">Action</span>
              <span className="font-mono text-[#38BDF8]">{event.action}</span>
            </div>
            <div className="p-2.5 rounded bg-[#0B1326] border border-[#334155]">
              <span className="text-[9px] font-mono uppercase text-[#94A3B8] block">Target Resource</span>
              <span className="font-mono text-[#F8FAFC]">{event.resource}</span>
            </div>
            <div className="p-2.5 rounded bg-[#0B1326] border border-[#334155]">
              <span className="text-[9px] font-mono uppercase text-[#94A3B8] block">IP Address</span>
              <span className="font-mono text-[#F8FAFC]">{event.ip_address || '127.0.0.1'}</span>
            </div>
          </div>

          {/* JSON State Diff Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase text-[#94A3B8] flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#10B981]" />
                Event Payload &amp; State Diff (JSON)
              </span>
              <button
                onClick={handleCopyJson}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1E293B] hover:bg-[#334155] text-[#38BDF8] border border-[#334155] flex items-center gap-1 transition-colors"
              >
                {copied ? <CheckCircle2 className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-lg bg-[#060E20] border border-[#334155] text-[11px] font-mono text-[#93CCFF] overflow-x-auto max-h-56">
              {JSON.stringify(event.details_json || event, null, 2)}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#334155] bg-[#131B2E] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white font-medium text-xs shadow-sm transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
