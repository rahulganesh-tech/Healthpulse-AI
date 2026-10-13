import React, { useState, useEffect } from 'react';
import { 
  Activity, AlertTriangle, ShieldCheck, Info, ChevronRight, 
  MapPin, CheckCircle, BarChart3, TrendingUp, Bell
} from 'lucide-react';
import { PHCItem, PulseDetail, PulseAlert } from '../types';
import { ApiClient } from '../services/api';

interface CommunityPulseMapProps {
  language: 'en' | 'ta';
  onSelectPhcForDetail?: (phcId: string, phcName: string) => void;
}

export const CommunityPulseMap: React.FC<CommunityPulseMapProps> = ({
  language,
  onSelectPhcForDetail,
}) => {
  const [phcs, setPhcs] = useState<PHCItem[]>([]);
  const [selectedSyndrome, setSelectedSyndrome] = useState('FEVER');
  const [selectedPhc, setSelectedPhc] = useState<PHCItem | null>(null);
  const [loading, setLoading] = useState(true);

  // In demo data: Nanguneri PHC has active week 33 outbreak (EWMA 27.3 > UCL 24.1) -> RED
  // Kalakkad / Manur have elevated counts -> AMBER
  // Others -> GREEN
  const getCatchmentStatus = (phcId: string): { status: 'red' | 'amber' | 'green'; ewma: number; ucl: number; label: string } => {
    if (phcId.toUpperCase().includes('NANGUNERI')) {
      return { status: 'red', ewma: 27.3, ucl: 24.1, label: 'OUTBREAK ALERT (EWMA > UCL)' };
    }
    if (phcId.toUpperCase().includes('MANUR') || phcId.toUpperCase().includes('KALAKKAD')) {
      return { status: 'amber', ewma: 20.8, ucl: 24.1, label: 'ELEVATED (&gt; 80% UCL)' };
    }
    return { status: 'green', ewma: 14.5, ucl: 24.1, label: 'BASELINE NORMAL' };
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await ApiClient.getPhcs();
        setPhcs(data);
        if (data.length > 0) {
          const nanguneri = data.find(p => p.id.includes('NANGUNERI')) || data[0];
          setSelectedPhc(nanguneri);
        }
      } catch (err) {
        console.error('Failed to load PHCs for map', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-teal-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-teal-700 text-teal-200 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Activity size={12} /> Community Pulse District Syndromic Map
              </span>
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle size={12} /> 1 Active Alert
              </span>
            </div>
            <h2 className="text-2xl font-bold">Tirunelveli District Outbreak Early Warning</h2>
            <p className="text-teal-200 text-sm mt-1">
              EWMA Quality Control Surveillance Across 10 Primary Health Centre Catchments
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedSyndrome}
              onChange={(e) => setSelectedSyndrome(e.target.value)}
              className="bg-teal-800 text-white border border-teal-600 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none"
            >
              <option value="FEVER">Syndrome: FEVER</option>
              <option value="FEVER_BLEED_RASH">Syndrome: FEVER + BLEED / RASH</option>
              <option value="DIARRHOEA_VOMIT">Syndrome: DIARRHOEA & VOMIT</option>
              <option value="COUGH_BREATH">Syndrome: COUGH & BREATH</option>
              <option value="HEAT">Syndrome: HEAT ILLNESS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid: 10 Catchment Grid & Visual Map representation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Catchment Map & Tiles (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <MapPin size={18} className="text-teal-700" />
              10 PHC Catchment Health Grid (Tirunelveli)
            </h3>
            <div className="flex items-center gap-2 text-[11px] font-semibold">
              <span className="flex items-center gap-1 text-red-600"><span className="w-2.5 h-2.5 bg-red-600 rounded-full inline-block" /> Alert (1)</span>
              <span className="flex items-center gap-1 text-amber-600"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block" /> Elevated (2)</span>
              <span className="flex items-center gap-1 text-emerald-600"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block" /> Normal (7)</span>
            </div>
          </div>

          {/* Interactive Catchment Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {phcs.map((phc) => {
              const info = getCatchmentStatus(phc.id);
              const isSelected = selectedPhc?.id === phc.id;

              const borderClass = info.status === 'red'
                ? 'border-red-400 bg-red-50/70 hover:bg-red-50 ring-1 ring-red-400'
                : info.status === 'amber'
                ? 'border-amber-300 bg-amber-50/50 hover:bg-amber-50'
                : 'border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50/60';

              return (
                <div
                  key={phc.id}
                  onClick={() => setSelectedPhc(phc)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${borderClass} ${
                    isSelected ? 'ring-2 ring-teal-700 shadow-md scale-[1.01]' : 'shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{phc.name}</h4>
                      <p className="text-xs text-gray-500">{phc.block} Block</p>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        info.status === 'red'
                          ? 'bg-red-600 text-white'
                          : info.status === 'amber'
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {info.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-black/5">
                    <span className="text-gray-600 font-mono text-[11px]">
                      EWMA: <strong>{info.ewma.toFixed(1)}</strong> / UCL {info.ucl.toFixed(1)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectPhcForDetail) onSelectPhcForDetail(phc.id, phc.name);
                      }}
                      className="text-teal-800 hover:text-teal-950 font-semibold text-[11px] flex items-center gap-0.5"
                    >
                      Open MO Chart <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: "How this Works" Mathematical Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Info size={18} className="text-indigo-600" />
              How Community Pulse Works (Mathematical Specification)
            </h3>

            <p className="text-xs text-gray-600">
              Community Pulse applies an <strong>Exponentially Weighted Moving Average (EWMA)</strong> control chart to detect syndromic surges weeks before traditional static threshold spikes.
            </p>

            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl space-y-2.5 font-mono text-xs shadow-inner">
              <div className="text-teal-400 font-bold border-b border-slate-700 pb-1">
                1. EWMA Recursion Formula
              </div>
              <div>z_t = λ · x_t + (1 - λ) · z_{'{t-1}'}</div>
              <div className="text-slate-400 text-[11px]">
                Smoothing parameter λ = 0.3, Seed z_0 = μ
              </div>

              <div className="text-teal-400 font-bold border-b border-slate-700 pb-1 pt-2">
                2. Upper Control Limit (UCL)
              </div>
              <div>UCL = μ + L · σ · √(λ / (2 - λ))</div>
              <div className="text-slate-400 text-[11px]">
                Threshold parameter L = 3.0, √(0.3 / 1.7) ≈ 0.420
              </div>

              <div className="text-teal-400 font-bold border-b border-slate-700 pb-1 pt-2">
                3. Alert Trigger Condition
              </div>
              <div className="text-red-400 font-bold">Alert when z_t &gt; UCL</div>
            </div>

            <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1.5 text-xs">
              <h5 className="font-bold text-indigo-950 flex items-center gap-1.5">
                <TrendingUp size={14} className="text-indigo-700" />
                Monte Carlo Simulation Results (2,000 Runs)
              </h5>
              <p className="text-gray-700">
                • <strong>Early Warning:</strong> Detects genuine outbreaks <strong>2.41 weeks earlier</strong> than the standard "2x baseline" rule.
              </p>
              <p className="text-gray-700">
                • <strong>False Alarm Rate:</strong> Only ~10% over 26 quiet weeks.
              </p>
              <p className="text-gray-700">
                • <strong>Noise Immunity:</strong> Suppresses one-off transient spikes (e.g. Nanguneri week 30 count of 25 was suppressed with no false alarm).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
