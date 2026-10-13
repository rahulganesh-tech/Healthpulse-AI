import React, { useState } from 'react';
import { 
  Lock, KeyRound, UserCheck, Shield, AlertCircle, X, Check, 
  Stethoscope, ShieldAlert, Award, FileSpreadsheet, Activity
} from 'lucide-react';
import { UserRole } from '../types';
import { ApiClient } from '../services/api';

interface StaffLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { email: string; role: UserRole; name: string; phcId?: string }) => void;
}

export const StaffLoginModal: React.FC<StaffLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('mo.nanguneri@healthpulse.demo');
  const [password, setPassword] = useState('demo123');
  const [otp, setOtp] = useState('482913');
  const [step, setStep] = useState<'creds' | 'otp'>('creds');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const demoAccounts: Array<{
    role: UserRole;
    label: string;
    email: string;
    desc: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    {
      role: 'MO',
      label: 'MO Nanguneri',
      email: 'mo.nanguneri@healthpulse.demo',
      desc: 'Week 33 Fever Alert & Doctor Cards',
      icon: <Stethoscope size={16} />,
      color: 'bg-blue-600',
    },
    {
      role: 'MO',
      label: 'MO Manur',
      email: 'mo.manur@healthpulse.demo',
      desc: 'Manur PHC Catchment',
      icon: <Stethoscope size={16} />,
      color: 'bg-teal-600',
    },
    {
      role: 'DHO',
      label: 'District Health Officer',
      email: 'dho@healthpulse.demo',
      desc: 'District View & 10 PHC Pulse Map',
      icon: <Activity size={16} />,
      color: 'bg-indigo-600',
    },
    {
      role: 'ASHA',
      label: 'ASHA Worker',
      email: 'asha.manur@healthpulse.demo',
      desc: 'Assisted Screening Manur Ward 4',
      icon: <UserCheck size={16} />,
      color: 'bg-emerald-600',
    },
    {
      role: 'CLIN',
      label: 'Clinical Reviewer',
      email: 'clin@healthpulse.demo',
      desc: 'Rules Approval & Model Cards',
      icon: <Award size={16} />,
      color: 'bg-purple-600',
    },
    {
      role: 'AUDITOR',
      label: 'Independent Auditor',
      email: 'auditor@healthpulse.demo',
      desc: 'SHA-256 Hash-Chained Audit Log',
      icon: <FileSpreadsheet size={16} />,
      color: 'bg-slate-700',
    },
    {
      role: 'ADMIN',
      label: 'System Admin',
      email: 'admin@healthpulse.demo',
      desc: 'User Management & Demo Reset',
      icon: <Shield size={16} />,
      color: 'bg-gray-800',
    },
  ];

  const handleQuickLogin = async (targetEmail: string) => {
    setEmail(targetEmail);
    setPassword('demo123');
    setOtp('482913');
    setError(null);
    setLoading(true);

    try {
      const res = await ApiClient.login(targetEmail, 'demo123', '482913');
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await ApiClient.login(email, password, otp);
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-teal-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-800 flex items-center justify-center text-teal-200">
              <Lock size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold">HealthPulse AI — Staff Sign In</h3>
              <p className="text-xs text-teal-300">
                Authorized Public Health & Clinical Administration Access
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-teal-300 hover:text-white p-2 rounded-lg hover:bg-teal-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Sign In Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                1-Click Demo Login (Evaluators & Judges)
              </span>
              <span className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono font-bold">
                PWD: demo123 | OTP: 482913
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickLogin(acc.email)}
                  disabled={loading}
                  className="p-3 text-left border border-gray-200 rounded-xl hover:border-teal-600 hover:bg-teal-50/50 transition flex items-start gap-3 group"
                >
                  <div className={`w-8 h-8 rounded-lg ${acc.color} text-white flex items-center justify-center shrink-0`}>
                    {acc.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm text-gray-900 group-hover:text-teal-900 flex items-center justify-between">
                      <span>{acc.label}</span>
                      <span className="text-[10px] font-mono text-gray-400 group-hover:text-teal-700">
                        {acc.role}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 truncate">{acc.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">Or Sign In Manually</span></div>
          </div>

          {/* Manual Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Authorized Email / Mobile
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                placeholder="officer@healthpulse.demo"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  placeholder="demo123"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  2FA Mobile OTP (Demo: 482913)
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-widest text-center focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  placeholder="482913"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-800 hover:bg-teal-900 text-white font-bold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span>Authenticating with Bcrypt + JWT...</span>
              ) : (
                <>
                  <KeyRound size={16} /> Secure Sign In
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
