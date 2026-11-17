import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, CheckCircle2, ShieldCheck, Sparkles, AlertCircle, Scan, Eye } from 'lucide-react';

export const BiometricViewfinder = ({ onCapture, isEvaluating, capturedSelfie }) => {
  const [livenessStage, setLivenessStage] = useState(0);
  const [livenessScore, setLivenessScore] = useState(96.8);
  const [isSimulatingCamera, setIsSimulatingCamera] = useState(true);
  const videoRef = useRef(null);

  const livenessPrompts = [
    { text: 'Look directly at the camera reticle', status: 'IN_POSITION' },
    { text: 'Blink your eyes slowly to prove liveness', status: 'BLINK_DETECTED' },
    { text: 'Turn head slightly right for 3D depth map', status: '3D_VECTOR_MAPPED' },
    { text: 'Hold still, synthesizing 468-point facial mesh', status: 'SYNTHESIS_COMPLETE' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setLivenessStage((prev) => (prev + 1) % livenessPrompts.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const handleSimulateCapture = () => {
    // Generate high fidelity selfie demo data
    const sampleSelfieUrl =
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
    onCapture({
      selfieUrl: sampleSelfieUrl,
      livenessPassed: true,
      livenessScore: 97.4,
      meshPoints: 468,
      depthTelemetry: 'PASS_3D_STEREO_ACTIVE',
    });
  };

  return (
    <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-5 shadow-lg flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#F8FAFC]">3. Biometric Liveness Capture</h3>
            <p className="text-xs text-[#94A3B8]">Anti-spoofing 3D face mesh verification</p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#10B981]/10 border border-[#10B981]/30 text-[11px] font-mono text-[#10B981]">
            <ShieldCheck className="w-3.5 h-3.5" />
            ISO/IEC 30107-3 PAD L2
          </div>
        </div>

        {/* Oval Camera Viewfinder */}
        <div className="relative w-full aspect-[4/3] max-h-[320px] bg-[#060E20] border-2 border-[#334155] rounded-xl overflow-hidden flex items-center justify-center">
          {/* Background live camera feed or simulated avatar */}
          <img
            src={
              capturedSelfie ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
            }
            alt="Biometric Camera Frame"
            className="w-full h-full object-cover opacity-75 filter grayscale-[20%]"
          />

          {/* Oval Viewport Guide */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[180px] h-[240px] md:w-[210px] md:h-[270px] rounded-[50%] border-2 border-[#0284C7] shadow-[0_0_20px_rgba(2,132,199,0.5)] relative flex items-center justify-center">
              {/* Corner crosshairs */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#38BDF8]" />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#38BDF8]" />
              <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0.5 h-4 bg-[#38BDF8]" />
              <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-0.5 h-4 bg-[#38BDF8]" />

              {/* Animated Scan Line */}
              <div className="absolute inset-x-4 top-4 bottom-4 overflow-hidden pointer-events-none">
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#38BDF8] to-transparent animate-bounce opacity-80" />
              </div>

              {/* Simulated 468-point mesh overlay dots */}
              <div className="absolute inset-0 flex flex-wrap gap-3 p-6 opacity-30 justify-center items-center">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-[#38BDF8]" />
                ))}
              </div>
            </div>
          </div>

          {/* Real-time telemetry overlay badge */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0F172A]/80 text-[#38BDF8] border border-[#0284C7]/40 flex items-center gap-1 backdrop-blur-sm">
              <Scan className="w-3 h-3 animate-spin" />
              468-POINT MESH ACTIVE
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0F172A]/80 text-[#10B981] border border-[#10B981]/40 flex items-center gap-1 backdrop-blur-sm">
              <Eye className="w-3 h-3" />
              LIVENESS SCORE: {livenessScore}%
            </span>
          </div>

          {/* Active instruction banner */}
          <div className="absolute bottom-3 inset-x-3 bg-[#0F172A]/90 border border-[#334155] rounded-lg p-2.5 backdrop-blur-md text-center z-10">
            <p className="text-xs font-medium text-[#F8FAFC] flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0284C7] animate-ping" />
              {livenessPrompts[livenessStage].text}
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4 pt-4 border-t border-[#334155] flex flex-col gap-2">
        <button
          type="button"
          disabled={isEvaluating}
          onClick={handleSimulateCapture}
          className="w-full py-3 px-4 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white font-medium text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(2,132,199,0.4)] transition-all hover:scale-[1.01] disabled:opacity-50"
        >
          {isEvaluating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Verifying 3D Liveness &amp; Vector Cosine Distance...</span>
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" />
              <span>Capture Live Selfie &amp; Run Face Match</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
