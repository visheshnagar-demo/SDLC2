import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Shield,
  Activity,
  KeyRound,
  Lock,
} from 'lucide-react';

export default function ProfileDashboard() {
  const { user, refreshProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);
  };

  const isVerified = user?.email_verified ?? false;
  const status = user?.status || 'ACTIVE';

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center font-bold text-2xl text-white shadow-inner">
              {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold tracking-tight">
                  {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Customer Identity Profile'}
                </h1>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    isVerified
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {isVerified ? 'Verified Account' : 'Pending Activation'}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1 flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>{user?.email || 'customer@example.com'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/profile/edit"
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm text-sm"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Profile</span>
            </Link>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-3.5 py-2.5 rounded-xl transition-colors text-sm"
            >
              <Activity className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Account Status</span>
            <Shield className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">{status}</div>
          <div className="text-xs text-slate-500 mt-1">Tier-1 Sovereign Trust</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Email Verification</span>
            {isVerified ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <XCircle className="h-5 w-5 text-amber-500" />
            )}
          </div>
          <div className="text-xl font-bold text-slate-900">
            {isVerified ? 'Completed' : 'Action Required'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {isVerified ? 'Cryptographically Bound' : 'Activation pending'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Session Security</span>
            <Lock className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">Active JWT</div>
          <div className="text-xs text-slate-500 mt-1">Bearer Token Session</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Identity ID</span>
            <KeyRound className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="text-sm font-mono font-bold text-slate-900 truncate">
            {user?.user_id || user?.id || 'UUID'}
          </div>
          <div className="text-xs text-slate-500 mt-1">Unique Customer GUID</div>
        </div>
      </div>

      {/* Profile Details Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <User className="h-5 w-5 text-indigo-600" />
              <span>Personal Information</span>
            </h2>
            <Link to="/profile/edit" className="text-xs text-indigo-600 hover:text-indigo-500 font-medium">
              Update
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">First Name</span>
              <span className="font-medium text-slate-800">{user?.first_name || '—'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Last Name</span>
              <span className="font-medium text-slate-800">{user?.last_name || '—'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</span>
              <span className="font-medium text-slate-800 break-all">{user?.email || '—'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone</span>
              <span className="font-medium text-slate-800">{user?.phone_number || '—'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Date of Birth</span>
              <span className="font-medium text-slate-800">{user?.date_of_birth || '—'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Country Code</span>
              <span className="font-medium text-slate-800">{user?.country_code || 'USA'}</span>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-indigo-600" />
              <span>Address & Residency</span>
            </h2>
            <Link to="/profile/edit" className="text-xs text-indigo-600 hover:text-indigo-500 font-medium">
              Update
            </Link>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Address Line 1</span>
              <span className="font-medium text-slate-800">{user?.address_line1 || '—'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Address Line 2</span>
              <span className="font-medium text-slate-800">{user?.address_line2 || '—'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">City</span>
                <span className="font-medium text-slate-800">{user?.city || '—'}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">State / Prov</span>
                <span className="font-medium text-slate-800">{user?.state_province || '—'}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Postal Code</span>
                <span className="font-medium text-slate-800">{user?.postal_code || '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
