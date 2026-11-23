import React from 'react';
import { ScanFace, CheckCheck, GitCompare, ShieldCheck } from 'lucide-react';
import Badge from '../common/Badge';

export default function FacialComparisonInspector({ matchScore = 0.987, documentPhotoUrl, selfieUrl }) {
  const percentage = (matchScore * 100).toFixed(1);

  return (
    <div className="bg-[#171F33] p-6 rounded-lg border border-slate-700/80 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#DAE2FD]">1:1 Facial Vector Comparison</h2>
          <p className="text-xs text-slate-400">
            Cosine distance calculation between ID portrait embedding and live biometric frame.
          </p>
        </div>
        <Badge variant={matchScore >= 0.85 ? 'success' : 'warning'}>
          {matchScore >= 0.85 ? 'BIOMETRIC MATCH' : 'BORDERLINE MATCH'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Document Portrait Box */}
        <div className="bg-[#0B1326] p-4 rounded-lg border border-slate-700 text-center">
          <div className="text-xs font-mono text-slate-400 mb-2">SOURCE A: PASSPORT CHIP / OCR</div>
          <div className="w-32 h-40 mx-auto rounded-md bg-slate-800 border-2 border-slate-600 flex flex-col items-center justify-center overflow-hidden relative">
            {documentPhotoUrl ? (
              <img src={documentPhotoUrl} alt="Doc Portrait" className="w-full h-full object-cover" />
            ) : (
              <div className="p-3 text-center">
                <ScanFace size={40} className="text-slate-500 mx-auto mb-1" />
                <span className="text-[10px] text-slate-400 font-mono">Alexander J. Montgomery</span>
              </div>
            )}
            <span className="absolute bottom-1 right-1 bg-black/70 text-[9px] font-mono px-1 rounded text-slate-300">
              ICAO Crop
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-2">Vector ID: #VEC-DOC-091</p>
        </div>

        {/* Live Selfie Box */}
        <div className="bg-[#0B1326] p-4 rounded-lg border border-slate-700 text-center">
          <div className="text-xs font-mono text-slate-400 mb-2">SOURCE B: LIVE 3D BIOMETRIC FRAME</div>
          <div className="w-32 h-40 mx-auto rounded-md bg-slate-800 border-2 border-cyan-500/60 flex flex-col items-center justify-center overflow-hidden relative shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            {selfieUrl ? (
              <img src={selfieUrl} alt="Live Selfie" className="w-full h-full object-cover" />
            ) : (
              <div className="p-3 text-center">
                <ScanFace size={40} className="text-cyan-400 mx-auto mb-1" />
                <span className="text-[10px] text-cyan-300 font-mono">Live Liveness Frame</span>
              </div>
            )}
            <span className="absolute bottom-1 right-1 bg-cyan-900/80 text-[9px] font-mono px-1 rounded text-cyan-300 border border-cyan-500/30">
              PAD Verified
            </span>
          </div>
          <p className="text-[11px] text-cyan-400 font-mono mt-2">Vector ID: #VEC-LIVE-844</p>
        </div>
      </div>

      {/* Comparison Score Bar */}
      <div className="mt-5 p-4 bg-[#0B1326] rounded-lg border border-slate-700/80">
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <div className="flex items-center space-x-2">
            <GitCompare size={15} className="text-blue-400" />
            <span className="text-slate-300 font-bold">COSINE SIMILARITY CONFIDENCE</span>
          </div>
          <span className="text-emerald-400 font-bold text-sm">{percentage}%</span>
        </div>

        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 h-2.5 rounded-full"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-1.5">
          <span>Threshold: 85.0%</span>
          <span className="text-emerald-400 flex items-center space-x-1">
            <CheckCheck size={12} />
            <span>EXCEEDS NIST FRTE BENCHMARK</span>
          </span>
        </div>
      </div>
    </div>
  );
}
