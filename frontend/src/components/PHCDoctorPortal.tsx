import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, QrCode, Search, AlertTriangle, CheckCircle, 
  TrendingUp, Activity, ShieldAlert, FileText, Check, Clock, User
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { DoctorCard, PulseDetail, PulseAlert } from '../types';
import { ApiClient } from '../services/api';
import { DoctorCardView } from './DoctorCardView';

interface PHCDoctorPortalProps {
  language: 'en' | 'ta';
  phcId?: string; // e.g. PHC-NANGUNERI or PHC-MANUR
  phcName?: string;
}

export const PHCDoctorPortal: React.FC<PHCDoctorPortalProps> = ({
  language,
  phcId = 'PHC-NANGUNERI',
  phcName = 'Nanguneri PHC (demo)',
}) => {
  const [activeTab, setActiveTab] = useState<'pulse' | 'lookup'>('pulse');
  const [cardCodeInput, setCardCodeInput] = useState('');
  const [loadedCard, setLoadedCard] = useState<DoctorCard | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  // Pulse States
  const [syndrome, setSyndrome] = useState('FEVER');
  const [pulseData, setPulseData] = useState<PulseDetail | null>(null);
  const [pulseLoading, setPulseLoading] = useState(true);
  const [ackNote, setAckNote] = useState('');
  const [isAckSubmitting, setIsAckSubmitting] = useState(false);
  const [ackSuccess, setAckSuccess] = useState(false);

  // Load Community Pulse for this PHC
  const loadPulse = async () => {
    try {
      setPulseLoading(true);
      const data = await ApiClient.getPulseData(phcId, syndrome);
      setPulseData(data);
    } catch (err) {
      console.error('Failed to load pulse data', err);
    } finally {
      setPulseLoading(false);
    }
  };

  useEffect(() => {
    loadPulse();
  }, [phcId, syndrome]);

  const handleLookupCard = async (codeToLookup?: string) => {
    const code = (codeToLookup || cardCodeInput).trim().toUpperCase();
    if (!code) return;
    setLookupLoading(true);
    setLookupError(null);

    try {
      const card = await ApiClient.getDoctorCard(code);
      setLoadedCard(card);
    } catch (err: any) {
      setLookupError(`Card "${code}" not found. Try demo codes: MUR58M, SEL24F, KAV03F, KAR19M, LAK45F.`);
      setLoadedCard(null);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleAcknowledgeAlert = async () => {
    if (!pulseData?.activeAlert) return;
    setIsAckSubmitting(true);
    try {
      await ApiClient.acknowledgePulseAlert(
        pulseData.activeAlert.id,
        ackNote || 'Acknowledged by PHC Medical Officer. Field surveillance team mobilized.'
      );
      setAckSuccess(true);
      setTimeout(() => {
        setAckSuccess(false);
        loadPulse();
      }, 1500);
    } catch (err) {
      console.error('Failed to acknowledge alert', err);
    } finally {
      setIsAckSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Portal Header */}
      <div className="bg-gradient-to-r from-teal-900 to-blue-950 text-white rounded-2xl p-6 shadow-md border border-teal-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-teal-700/80 text-teal-200 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Stethoscope size={12} /> Primary Health Centre Medical Officer (MO)
              </span>
              <span className="bg-blue-500/30 text-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-full font-mono">
                {phcName}
              </span>
            </div>
            <h2 className="text-2xl font-bold">
              {language === 'ta' ? 'PHC மருத்துவ அலுவலர் பணிமனை' : 'PHC Clinical Triage & Syndromic Pulse'}
            </h2>
            <p className="text-teal-200 text-sm mt-1">
              30-Second Doctor Handoff Card Reader & Catchment Early Warning Surveillance
            </p>
          </div>

          <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-xl border border-teal-700/50">
            <button
              onClick={() => setActiveTab('pulse')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'pulse'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-teal-200 hover:text-white'
              }`}
            >
              <Activity size={14} /> Community Pulse
            </button>
            <button
              onClick={() => setActiveTab('lookup')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'lookup'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-teal-200 hover:text-white'
              }`}
            >
              <QrCode size={14} /> Doctor Card Lookup
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: COMMUNITY PULSE */}
      {activeTab === 'pulse' && (
        <div className="space-y-6">
          {/* Syndromic Alert Banner (EWMA Triggered) */}
          {pulseData?.activeAlert && (
            <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-6 shadow-md animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-red-600 text-white text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
                      <AlertTriangle size={14} /> EWMA OUTBREAK ALERT: WEEK 33
                    </span>
                    <span className="text-xs font-semibold text-red-900">
                      Syndrome: {pulseData.activeAlert.syndrome} • {pulseData.activeAlert.phcName}
                    </span>
                  </div>

                  <p className="text-red-950 font-bold text-base">
                    EWMA statistic reached {pulseData.activeAlert.ewma.toFixed(1)} (Upper Control Limit UCL: {pulseData.activeAlert.ucl.toFixed(1)}).
                  </p>

                  <p className="text-xs text-red-800 bg-red-100/70 p-2.5 rounded-lg border border-red-200 inline-block font-medium">
                    ⚠️ <strong>Signal, not diagnosis.</strong> Verify with IDSP/IHIP reports and local field investigation.
                  </p>
                </div>

                {/* Acknowledgment Workflow */}
                <div className="bg-white p-4 rounded-xl border border-red-200 shadow-sm shrink-0 w-full md:w-80 space-y-3">
                  <div className="text-xs font-bold text-gray-700 flex items-center justify-between">
                    <span>Officer Action</span>
                    <span className="text-[10px] text-red-600 font-mono">STATUS: {pulseData.activeAlert.status}</span>
                  </div>

                  {pulseData.activeAlert.status === 'Open' ? (
                    <>
                      <input
                        type="text"
                        value={ackNote}
                        onChange={(e) => setAckNote(e.target.value)}
                        placeholder="Action note (e.g. Field team dispatched)"
                        className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-red-500 focus:outline-none"
                      />
                      <button
                        onClick={handleAcknowledgeAlert}
                        disabled={isAckSubmitting || ackSuccess}
                        className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 rounded-lg shadow transition flex items-center justify-center gap-1.5"
                      >
                        {ackSuccess ? (
                          <>
                            <Check size={14} /> Acknowledged & Audited
                          </>
                        ) : isAckSubmitting ? (
                          'Recording...'
                        ) : (
                          'Acknowledge Alert'
                        )}
                      </button>
                    </>
                  ) : (
                    <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2">
                      <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                      <span>Acknowledged by {pulseData.activeAlert.acknowledgedBy || 'MO'}: "{pulseData.activeAlert.note}"</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Syndromic Selector & Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <label className="text-xs font-semibold text-gray-500 block mb-1">Select Syndrome</label>
              <select
                value={syndrome}
                onChange={(e) => setSyndrome(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-teal-600 focus:outline-none"
              >
                <option value="FEVER">FEVER (Acute Febrile Illness)</option>
                <option value="FEVER_BLEED_RASH">FEVER + BLEED / RASH (Dengue)</option>
                <option value="DIARRHOEA_VOMIT">DIARRHOEA & VOMITING (ADD)</option>
                <option value="COUGH_BREATH">COUGH & BREATHLESSNESS (ARI)</option>
                <option value="HEAT">HEAT ILLNESS (Hyperthermia)</option>
              </select>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="text-xs font-semibold text-gray-500">26-Week Baseline Mean (μ)</div>
              <div className="text-2xl font-extrabold text-gray-900 mt-1">
                {pulseData?.baselineMean ? pulseData.baselineMean.toFixed(1) : '19.8'}
              </div>
              <div className="text-[11px] text-gray-400">Cases / Week (Calm period)</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="text-xs font-semibold text-gray-500">Standard Deviation (σ)</div>
              <div className="text-2xl font-extrabold text-gray-900 mt-1">
                {pulseData?.baselineSd ? pulseData.baselineSd.toFixed(1) : '3.5'}
              </div>
              <div className="text-[11px] text-gray-400">Baseline variation</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="text-xs font-semibold text-gray-500">Upper Control Limit (UCL)</div>
              <div className="text-2xl font-extrabold text-red-600 mt-1">
                {pulseData?.currentUcl ? pulseData.currentUcl.toFixed(1) : '24.1'}
              </div>
              <div className="text-[11px] text-gray-400">L=3.0 sigma limit threshold</div>
            </div>
          </div>

          {/* 52-Week EWMA Surveillance Chart */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <TrendingUp size={18} className="text-teal-700" />
                  52-Week EWMA Outbreak Detection (λ = 0.3, L = 3.0)
                </h3>
                <p className="text-xs text-gray-500">
                  Poisson baseline weeks 1-26 (μ=19.8, σ=3.5, UCL=24.1). Note: Week 30 count of 25 is raw noise suppressed by EWMA. Week 33 triggers early outbreak alert.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 font-semibold text-teal-700">
                  <span className="w-3 h-3 bg-teal-600 rounded-full inline-block" /> EWMA Statistic (z)
                </span>
                <span className="flex items-center gap-1 font-semibold text-red-600">
                  <span className="w-3 h-0.5 border-t-2 border-dashed border-red-500 inline-block" /> UCL (24.1)
                </span>
              </div>
            </div>

            <div className="h-80 w-full">
              {pulseLoading ? (
                <div className="h-full flex items-center justify-center text-gray-400">Loading syndromic series...</div>
              ) : pulseData?.history ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pulseData.history} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="weekStart"
                      tick={{ fontSize: 10 }}
                      interval={4}
                      tickFormatter={(val) => {
                        const d = new Date(val);
                        return `W${Math.ceil((d.getTime() - new Date('2025-01-01').getTime()) / (7 * 86400000))}`;
                      }}
                    />
                    <YAxis domain={[0, 'auto']} tick={{ fontSize: 11 }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="bg-gray-900 text-white text-xs p-3 rounded-xl shadow-xl space-y-1">
                              <p className="font-bold border-b border-gray-700 pb-1">{item.weekStart}</p>
                              <p>Raw Count: <strong className="text-teal-300">{item.count}</strong></p>
                              <p>EWMA (z): <strong className="text-emerald-300">{item.ewma.toFixed(1)}</strong></p>
                              <p>UCL Threshold: <strong className="text-red-300">{item.ucl.toFixed(1)}</strong></p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine y={pulseData.currentUcl} stroke="#dc2626" strokeDasharray="4 4" strokeWidth={2} label={{ value: 'UCL (24.1)', position: 'top', fill: '#dc2626', fontSize: 10 }} />
                    <Line
                      type="monotone"
                      dataKey="ewma"
                      stroke="#0f766e"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, fill: '#0f766e' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rawCount"
                      stroke="#cbd5e1"
                      strokeWidth={1.5}
                      dot={{ r: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : null}
            </div>

            {/* Privacy & Methodology Footer */}
            <div className="bg-gray-50 p-3 rounded-xl text-xs text-gray-600 flex flex-col sm:flex-row items-center justify-between gap-2 border border-gray-100">
              <span>
                🔒 <strong>Privacy Protection:</strong> Weekly syndromic counts &lt;10 are suppressed as "&lt;10" to protect patient anonymity.
              </span>
              <span className="font-mono text-[11px] text-teal-800 font-semibold">
                Monte Carlo Validation: 2.41 Weeks Earlier Detection vs 2x Baseline
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOCTOR CARD LOOKUP */}
      {activeTab === 'lookup' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 text-lg mb-2 flex items-center gap-2">
              <QrCode size={20} className="text-teal-700" />
              Patient 30-Second Doctor Handoff Card Lookup
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Enter the 6-character card code from the patient's mobile or printed triage token to inspect clinical factors in under 30 seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={cardCodeInput}
                  onChange={(e) => setCardCodeInput(e.target.value.toUpperCase())}
                  placeholder="Enter 6-char code (e.g. KAR19M, MUR58M, LAK45F)"
                  maxLength={6}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 font-mono font-bold text-lg uppercase tracking-widest text-teal-900 focus:border-teal-700 focus:outline-none"
                />
              </div>

              <button
                onClick={() => handleLookupCard()}
                disabled={lookupLoading}
                className="bg-teal-800 hover:bg-teal-900 text-white font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
              >
                {lookupLoading ? 'Fetching Card...' : <><Search size={18} /> Open Doctor Card</>}
              </button>
            </div>

            {/* Quick Demo Selector Chips */}
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-500">Demo Persona Cards:</span>
              {[
                { code: 'KAR19M', label: 'Karthik (Fever 3d, PHC Visit)' },
                { code: 'MUR58M', label: 'Murugan (Chest pain, Emergency)' },
                { code: 'SEL24F', label: 'Selvi (Pregnancy Pre-eclampsia)' },
                { code: 'KAV03F', label: 'Kavya (Child Dehydration)' },
                { code: 'LAK45F', label: 'Lakshmi (Hb 8.9 Drop, 3 Reports)' },
              ].map(item => (
                <button
                  key={item.code}
                  onClick={() => {
                    setCardCodeInput(item.code);
                    handleLookupCard(item.code);
                  }}
                  className="text-xs bg-gray-100 hover:bg-teal-100 text-teal-800 font-semibold px-2.5 py-1 rounded-lg border border-gray-200 transition"
                >
                  {item.code}: {item.label}
                </button>
              ))}
            </div>

            {lookupError && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {lookupError}
              </div>
            )}
          </div>

          {/* Render loaded card */}
          {loadedCard && (
            <div className="border border-teal-200 rounded-2xl overflow-hidden shadow-lg">
              <DoctorCardView card={loadedCard} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
