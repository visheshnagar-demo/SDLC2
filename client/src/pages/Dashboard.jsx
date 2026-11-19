import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  User,
  Mail,
  CheckCircle,
  Clock,
  LogOut,
  RefreshCw,
  FileText,
  Camera,
  Search,
  History,
  AlertCircle,
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout, fetchUserProfile, loading } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setRefreshError('');
      await fetchUserProfile();
    } catch (err) {
      setRefreshError('Failed to refresh user profile.');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-slate-50'>
        <div className='flex flex-col items-center gap-3'>
          <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600'></div>
          <p className='text-sm text-slate-500'>Loading your profile...</p>
        </div>
      </div>
    );
  }

  const steps = [
    {
      id: 'SCRUM-498',
      name: 'Account & Registration',
      status: 'COMPLETED',
      icon: User,
      desc: 'Customer registered & authenticated via JWT session',
    },
    {
      id: 'SCRUM-499',
      name: 'Document Upload & OCR',
      status: 'UPCOMING',
      icon: FileText,
      desc: 'Upload government-issued passport or driver license',
    },
    {
      id: 'SCRUM-500',
      name: 'Biometric Check',
      status: 'UPCOMING',
      icon: Camera,
      desc: 'Facial liveness verification and selfie cross-match',
    },
    {
      id: 'SCRUM-501',
      name: 'Compliance Review',
      status: 'UPCOMING',
      icon: Search,
      desc: 'Officer review for flagged applications and risk scoring',
    },
    {
      id: 'SCRUM-502',
      name: 'Audit Trail',
      status: 'UPCOMING',
      icon: History,
      desc: 'Immutable audit logs and administrative event records',
    },
  ];

  return (
    <div className='min-h-screen bg-slate-50'>
      <header className='bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 bg-primary-600 text-white rounded-lg flex items-center justify-center font-bold shadow-md'>
              <Shield className='h-6 w-6' />
            </div>
            <div>
              <h1 className='text-xl font-bold text-slate-900'>VerifyID Portal</h1>
              <p className='text-xs text-slate-500'>Digital Identity Verification</p>
            </div>
          </div>

          <div className='flex items-center gap-4'>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className='inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-md text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition'
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className='inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-200 rounded-md text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition'
            >
              <LogOut className='h-3.5 w-3.5' />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8'>
        {refreshError && (
          <div role='alert' className='p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2'>
            <AlertCircle className='h-5 w-5' />
            <span>{refreshError}</span>
          </div>
        )}

        {/* Profile Card */}
        <section className='bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200'>
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
            <div className='flex items-start sm:items-center gap-4'>
              <div className='h-16 w-16 bg-primary-100 text-primary-700 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-inner'>
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className='flex items-center gap-3'>
                  <h2 className='text-2xl font-bold text-slate-900'>
                    {user?.full_name || 'Welcome Customer'}
                  </h2>
                  <span className='px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200'>
                    {user?.role || 'ROLE_CUSTOMER'}
                  </span>
                </div>
                <div className='flex items-center gap-4 mt-1 text-sm text-slate-500'>
                  <span className='flex items-center gap-1'>
                    <Mail className='h-4 w-4' />
                    {user?.email || 'N/A'}
                  </span>
                  <span className='flex items-center gap-1'>
                    <Clock className='h-4 w-4' />
                    Status: <strong className='text-slate-700'>{user?.status || 'PENDING_VERIFICATION'}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className='bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 min-w-[240px]'>
              <p className='font-semibold text-slate-800 mb-1'>Session Details</p>
              <p>User ID: <code className='text-primary-700 font-mono'>{user?.id || 'Active'}</code></p>
              <p>Registered: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Today'}</p>
            </div>
          </div>
        </section>

        {/* Verification Roadmap */}
        <section className='space-y-4'>
          <div>
            <h3 className='text-lg font-bold text-slate-900'>Identity Verification Progress</h3>
            <p className='text-sm text-slate-500'>Track your multi-stage verification pipeline</p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {steps.map((st) => {
              const StepIcon = st.icon;
              const isCompleted = st.status === 'COMPLETED';
              return (
                <div
                  key={st.id}
                  className={`p-5 rounded-xl border transition-all ${
                    isCompleted
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : 'bg-white border-slate-200 opacity-90'
                  }`}
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center gap-3'>
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          isCompleted
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <StepIcon className='h-5 w-5' />
                      </div>
                      <div>
                        <h4 className='font-semibold text-slate-900 text-sm'>{st.name}</h4>
                        <span className='text-xs font-mono text-slate-400'>{st.id}</span>
                      </div>
                    </div>
                    {isCompleted ? (
                      <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800'>
                        <CheckCircle className='h-3 w-3' /> Ready
                      </span>
                    ) : (
                      <span className='px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600'>
                        Next Scrum
                      </span>
                    )}
                  </div>
                  <p className='mt-3 text-xs text-slate-600 leading-relaxed'>{st.desc}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
