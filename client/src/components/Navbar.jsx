import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, User, LogOut, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 group-hover:bg-sky-500/30 transition-colors">
            <Shield className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white block">AuthGuard</span>
            <span className="text-xs text-sky-400 font-medium">Digital Identity & Access</span>
          </div>
        </Link>

        <nav className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 text-sm text-slate-300 hover:text-white transition-colors py-1.5 px-3 rounded-md hover:bg-slate-800"
              >
                <User className="w-4 h-4 text-sky-400" />
                <span className="font-medium">{user.full_name || user.email}</span>
                {user.is_active && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" /> Active
                  </span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 text-sm font-medium bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 px-3.5 py-1.5 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="text-sm font-medium text-slate-300 hover:text-white px-3.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium bg-sky-600 hover:bg-sky-500 text-white px-4 py-1.5 rounded-lg shadow-sm shadow-sky-900/20 transition-all font-semibold"
              >
                Create Account
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
