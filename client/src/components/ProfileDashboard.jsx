import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCurrentUser } from '../services/api';
import { OnboardingStepper } from './OnboardingStepper';
import { SessionLifecycleCard } from './SessionLifecycleCard';
import {
  User,
  Mail,
  Shield,
  Calendar,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Lock,
} from 'lucide-react';

export const ProfileDashboard = () => {
  const { user, setUser, logout } = useAuth();
  const [profileData, setProfileData] = useState(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const loadFreshProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCurrentUser();
      setProfileData(data);
      setUser(data);
      localStorage.setItem('user_data', JSON.stringify(data));
      setSuccessNotice('Profile data synchronized with server.');
      setTimeout(() => setSuccessNotice(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch updated profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!profileData || !profileData.email) {
      loadFreshProfile();
    }
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Active Today';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const activeUser = profileData || user || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Welcome Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-sky-600/20">
            {activeUser.full_name
              ? activeUser.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .substring(0, 2)
              : activeUser.email
              ? activeUser.email[0].toUpperCase()
              : 'U'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {activeUser.full_name || 'Customer Profile'}
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle className="w-3 h-3 mr-1" /> Active
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Account ID:{' '}
              <span className="font-mono text-xs text-slate-700 font-medium">
                {activeUser.id || 'usr-verified-session'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadFreshProfile}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Profile</span>
          </button>
          <button
            onClick={logout}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
          >
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {successNotice && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-2"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card & Session */}
        <div className="lg:col-span-1 space-y-6">
          {/* Account Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
              Identity & Security Attributes
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 flex items-center text-xs">
                  <User className="w-3.5 h-3.5 mr-2 text-slate-400" /> Full Name
                </span>
                <span className="font-semibold text-slate-800">{activeUser.full_name || 'Not provided'}</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 flex items-center text-xs">
                  <Mail className="w-3.5 h-3.5 mr-2 text-slate-400" /> Email Address
                </span>
                <span className="font-semibold text-slate-800 text-xs font-mono">{activeUser.email || 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 flex items-center text-xs">
                  <Shield className="w-3.5 h-3.5 mr-2 text-slate-400" /> Account Role
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-sky-100 text-sky-800">
                  {activeUser.role || 'CUSTOMER'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 flex items-center text-xs">
                  <Calendar className="w-3.5 h-3.5 mr-2 text-slate-400" /> Member Since
                </span>
                <span className="font-medium text-slate-700 text-xs">{formatDate(activeUser.created_at)}</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 flex items-center text-xs">
                  <Lock className="w-3.5 h-3.5 mr-2 text-slate-400" /> Password Security
                </span>
                <span className="text-xs font-semibold text-emerald-600">Bcrypt Salted</span>
              </div>
            </div>
          </div>

          {/* Session Card */}
          <SessionLifecycleCard />
        </div>

        {/* Right Column: Onboarding Flow & Security Clearance */}
        <div className="lg:col-span-2 space-y-6">
          <OnboardingStepper initialStep={2} />

          {/* Identity Verification Next Steps */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md border border-slate-700">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/30 mb-3">
                  Identity Flow Ready
                </span>
                <h3 className="text-lg font-bold">Ready for Digital KYC Verification</h3>
                <p className="text-sm text-slate-300 mt-1 max-w-xl">
                  Your credentials and account are authenticated with JWT session tokens. Complete facial biometric and ID document validation in the next step to enable full transaction clearance.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/60 flex flex-wrap items-center gap-3">
              <Link
                to="/verify-documents"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 shadow-sm shadow-indigo-600/30"
              >
                <span>Initiate Document Verification</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDashboard;
