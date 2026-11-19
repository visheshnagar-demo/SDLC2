import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      await register(fullName.trim(), email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
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
            Create your account
          </h2>
          <p className='mt-2 text-sm text-slate-600'>
            Start your digital identity verification journey
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

        <form className='mt-8 space-y-5' onSubmit={handleSubmit}>
          <div className='space-y-4 rounded-md shadow-sm'>
            <div>
              <label
                htmlFor='reg-fullname'
                className='block text-sm font-medium text-slate-700 mb-1'
              >
                Full Name
              </label>
              <div className='relative rounded-md shadow-sm'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400'>
                  <User className='h-5 w-5' />
                </div>
                <input
                  id='reg-fullname'
                  name='fullName'
                  type='text'
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className='block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors'
                  placeholder='Jane Doe'
                />
              </div>
            </div>

            <div>
              <label
                htmlFor='reg-email'
                className='block text-sm font-medium text-slate-700 mb-1'
              >
                Email address
              </label>
              <div className='relative rounded-md shadow-sm'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400'>
                  <Mail className='h-5 w-5' />
                </div>
                <input
                  id='reg-email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors'
                  placeholder='jane@example.com'
                />
              </div>
            </div>

            <div>
              <label
                htmlFor='reg-password'
                className='block text-sm font-medium text-slate-700 mb-1'
              >
                Password
              </label>
              <div className='relative rounded-md shadow-sm'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400'>
                  <Lock className='h-5 w-5' />
                </div>
                <input
                  id='reg-password'
                  name='password'
                  type='password'
                  autoComplete='new-password'
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors'
                  placeholder='••••••••'
                />
              </div>
            </div>

            <div>
              <label
                htmlFor='reg-confirm-password'
                className='block text-sm font-medium text-slate-700 mb-1'
              >
                Confirm Password
              </label>
              <div className='relative rounded-md shadow-sm'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400'>
                  <CheckCircle2 className='h-5 w-5' />
                </div>
                <input
                  id='reg-confirm-password'
                  name='confirmPassword'
                  type='password'
                  autoComplete='new-password'
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className='block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors'
                  placeholder='••••••••'
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type='submit'
              disabled={submitting}
              className='group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors shadow-md'
            >
              <span className='flex items-center gap-2'>
                {submitting ? 'Creating account...' : 'Create Account'}
                {!submitting && <ArrowRight className='h-4 w-4' />}
              </span>
            </button>
          </div>
        </form>

        <div className='text-center pt-2 border-t border-slate-200'>
          <p className='text-sm text-slate-600'>
            Already have an account?{' '}
            <Link
              to='/login'
              className='font-semibold text-primary-600 hover:text-primary-500 hover:underline'
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
