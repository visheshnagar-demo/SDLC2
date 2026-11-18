import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, Clock, ShieldCheck, KeyRound, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const SessionLifecycleCard = () => {
  const {
    accessToken,
    refreshToken,
    tokenExpiresIn,
    sessionStartTime,
    refreshSession,
    logout,
  } = useAuth();

  const [timeLeft, setTimeLeft] = useState(tokenExpiresIn || 3600);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
    const initialRemaining = Math.max(0, (tokenExpiresIn || 3600) - elapsed);
    setTimeLeft(initialRemaining);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionStartTime, tokenExpiresIn]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    setRefreshMessage({ text: '', type: '' });
    try {
      await refreshSession();
      setRefreshMessage({ text: 'Session successfully renewed!', type: 'success' });
      setTimeout(() => setRefreshMessage({ text: '', type: '' }), 4000);
    } catch (err) {
      setRefreshMessage({ text: err.message || 'Failed to refresh token', type: 'error' });
    } finally {
      setIsRefreshing(false);
    }
  };

  const isLowTime = timeLeft < 300;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Session Lifecycle</h3>
            <p className="text-xs text-slate-500">JWT Token Expiry & Security Policy</p>
          </div>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-slate-100 text-slate-700">
          HMAC-SHA256
        </span>
      </div>

      {refreshMessage.text && (
        <div
          className={`mb-4 p-3 rounded-xl text-xs font-medium flex items-center space-x-2 ${
            refreshMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {refreshMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          )}
          <span>{refreshMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className={`p-3.5 rounded-xl border transition-colors ${
          isLowTime ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-50 border-slate-100'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Access Token TTL</span>
            <Clock className={`w-3.5 h-3.5 ${isLowTime ? 'text-amber-500 animate-spin' : 'text-slate-400'}`} />
          </div>
          <div className={`text-xl font-bold font-mono tracking-tight ${
            isLowTime ? 'text-amber-700' : 'text-slate-900'
          }`}>
            {formatTime(timeLeft)}
          </div>
          <span className="text-[11px] text-slate-400">1-hour sliding session</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Refresh Token</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 tracking-tight">
            {refreshToken ? '7 Days' : 'Active'}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Valid & Stored</span>
        </div>
      </div>

      <div className="space-y-2 mb-5">
        <div className="text-xs">
          <span className="text-slate-400 block mb-1">Active Access Token (truncated):</span>
          <code className="block p-2 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] break-all border border-slate-800">
            {accessToken ? `${accessToken.substring(0, 32)}...${accessToken.substring(accessToken.length - 16)}` : 'None'}
          </code>
        </div>
      </div>

      <div className="flex items-center space-x-3 pt-2">
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing || !refreshToken}
          className="flex-1 py-2 px-3 bg-sky-50 hover:bg-sky-100 disabled:bg-slate-100 text-sky-700 disabled:text-slate-400 border border-sky-200 disabled:border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Renewing...' : 'Renew Access Token'}</span>
        </button>

        <button
          onClick={logout}
          className="py-2 px-3 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-semibold transition-colors"
        >
          End Session
        </button>
      </div>
    </div>
  );
};

export default SessionLifecycleCard;
