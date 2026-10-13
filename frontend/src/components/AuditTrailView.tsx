import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ShieldAlert, CheckCircle, AlertOctagon, 
  RefreshCw, Hash, Lock, Clock, User, Check
} from 'lucide-react';
import { AuditLogEntry } from '../types';
import { ApiClient } from '../services/api';

interface AuditTrailViewProps {
  language: 'en' | 'ta';
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ language }) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [verifyResult, setVerifyResult] = useState<{ intact: boolean; firstBrokenEntry?: number | null } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await ApiClient.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleVerifyChain = async () => {
    setIsVerifying(true);
    try {
      const res = await ApiClient.verifyAuditChain();
      setVerifyResult(res);
    } catch (err) {
      console.error('Audit verification failed', err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-teal-950 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-slate-700 text-teal-200 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Lock size={12} /> Independent Audit Portal
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                Append-Only SHA-256 Hash Chain
              </span>
            </div>
            <h2 className="text-2xl font-bold">Tamper-Evident Regulatory Audit Trail</h2>
            <p className="text-slate-300 text-sm mt-1">
              Cryptographically Linked Records of Staff Access, Clinical Rule Changes, Outbreak Alerts & Data Operations
            </p>
          </div>

          <button
            onClick={handleVerifyChain}
            disabled={isVerifying}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition active:scale-95 shrink-0"
          >
            {isVerifying ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Validating SHA-256 Chain...
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                Verify Chain Integrity
              </>
            )}
          </button>
        </div>
      </div>

      {/* Verification Status Card */}
      {verifyResult && (
        <div
          className={`p-5 rounded-2xl border shadow-sm animate-fadeIn ${
            verifyResult.intact
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-red-50 border-red-300 text-red-950'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {verifyResult.intact ? (
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <CheckCircle size={22} />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center">
                  <ShieldAlert size={22} />
                </div>
              )}
              <div>
                <h4 className="font-bold text-base">
                  {verifyResult.intact
                    ? 'Cryptographic Chain Integrity 100% Intact'
                    : 'Tamper Detected in Audit Log!'}
                </h4>
                <p className="text-xs mt-0.5 opacity-90">
                  {verifyResult.intact
                    ? `All ${logs.length} entries correctly satisfy: hash_n = SHA-256(ts | actor | role | action | detail | hash_{n-1}). No modifications detected.`
                    : `Hash chain verification failed at sequence record ID: ${verifyResult.firstBrokenEntry}. Immediate incident report filed.`}
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/60">
              STATUS: {verifyResult.intact ? 'VALID & VERIFIED' : 'TAMPERED'}
            </span>
          </div>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <Hash size={16} className="text-teal-700" />
            Append-Only Audit Log Records ({logs.length} Entries)
          </h3>
          <span className="text-xs font-mono text-gray-500">
            Genesis Hash: 00000000000000000000000000000000
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100 text-gray-700 uppercase font-semibold text-[11px] border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Detail</th>
                <th className="py-3 px-4">SHA-256 Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">Loading audit records...</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/80 transition font-mono">
                    <td className="py-3 px-4 font-bold text-gray-900">{log.id}</td>
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">{log.ts}</td>
                    <td className="py-3 px-4 text-teal-800 font-semibold">{log.actor}</td>
                    <td className="py-3 px-4">
                      <span className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        {log.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900 whitespace-nowrap">{log.action}</td>
                    <td className="py-3 px-4 text-gray-600 font-sans max-w-xs truncate">{log.detail}</td>
                    <td className="py-3 px-4 text-[10px] text-gray-400" title={log.hash}>
                      {log.hash.substring(0, 16)}...
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
