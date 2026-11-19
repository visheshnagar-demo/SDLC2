import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('testpassword');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 sm:px-6 lg:px-8 py-12'>
      <div className='max-w-md w-full space-y-8 bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-slate-100'>
        <div className='text-center'>
          <div className='mx-auto h-14 w-14 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center shadow-inner'>
            <Shield className='h-8 w-8 text-primary-600' />
          </div>
          <h2 className='mt-4 text-3xl font-extrabold text-slate-900 tracking-tight'>
            Sign in to VerifyID
          </h2>
          <p className='mt-2 text-sm text-slate-600'>
            Digital Identity Verification Platform
          </p>
        </div>

        {errorMessage && (
          <div
            role='alert'
            className='flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm'
          >
            <AlertCircle className='h-5 w-5 flex-shrink-0' />
            <span>{errorMessage}</span>
          </div>
        )}

        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div className='space-y-4 rounded-md shadow-sm'>
            <div>
              <label
                htmlFor='login-email'
                className='block text-sm font-medium text-slate-700 mb-1'
              >
                Email address
              </label>
              <div className='relative rounded-md shadow-sm'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400'>
                  <Mail className='h-5 w-5' />
                </div>
                <input
                  id='login-email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors'
                  placeholder='you@example.com'
                />
              </div>
            </div>

            <div>
              <label
                htmlFor='login-password'
                className='block text-sm font-medium text-slate-700 mb-1'
              >
                Password
              </label>
              <div className='relative rounded-md shadow-sm'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400'>
                  <Lock className='h-5 w-5' />
                </div>
                <input
                  id='login-password'
                  name='password'
                  type='password'
                  autoComplete='current-password'
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors'
                  placeholder='••••••••'
                />
              </div>
            </div>
          </div>

          <div className='bg-primary-50 border border-primary-200 rounded-lg p-3 text-xs text-primary-800 flex items-center justify-between'>
            <span>
              <strong>Test account:</strong> test@example.com / testpassword
            </span>
            <button
              type='button'
              onClick={() => {
                setEmail('test@example.com');
                setPassword('testpassword');
              }}
              className='text-primary-700 font-semibold hover:underline ml-2'
            >
              Fill
            </button>
          </div>

          <div>
            <button
              type='submit'
              disabled={submitting}
              className='group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors shadow-md'
            >
              <span className='flex items-center gap-2'>
                {submitting ? 'Signing in...' : 'Sign In'}
                {!submitting && <ArrowRight className='h-4 w-4' />}
              </span>
            </button>
          </div>
        </form>

        <div className='text-center pt-2 border-t border-slate-200'>
          <p className='text-sm text-slate-600'>
            Don't have an account?{' '}
            <Link
              to='/register'
              className='font-semibold text-primary-600 hover:text-primary-500 hover:underline'
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
