import React, { useState, useEffect } from 'react';
import { MapPin, Phone, ExternalLink, Navigation, AlertTriangle, ShieldCheck, Filter } from 'lucide-react';
import { PHCItem } from '../types';
import { ApiClient } from '../services/api';

interface NearestCareMapProps {
  language: 'en' | 'ta';
  selectedPhcId?: string;
  onSelectPhc?: (phc: PHCItem) => void;
}

export const NearestCareMap: React.FC<NearestCareMapProps> = ({
  language,
  selectedPhcId,
  onSelectPhc,
}) => {
  const [phcs, setPhcs] = useState<PHCItem[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string>('all');
  const [activePhc, setActivePhc] = useState<PHCItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPhcs = async () => {
      try {
        setLoading(true);
        const data = await ApiClient.getPhcs();
        setPhcs(data);
        if (selectedPhcId) {
          const matched = data.find(p => p.id === selectedPhcId);
          if (matched) setActivePhc(matched);
        } else if (data.length > 0) {
          setActivePhc(data[0]);
        }
      } catch (err) {
        console.error('Failed to load PHCs', err);
      } finally {
        setLoading(false);
      }
    };
    loadPhcs();
  }, [selectedPhcId]);

  const blocks = Array.from(new Set(phcs.map(p => p.block))).sort();

  const filteredPhcs = selectedBlock === 'all'
    ? phcs
    : phcs.filter(p => p.block === selectedBlock);

  const t = {
    title: language === 'ta' ? 'அருகிலுள்ள ஆரம்ப சுகாதார நிலையங்கள் (PHC)' : 'Nearest Primary Health Centres (PHC)',
    subtitle: language === 'ta' 
      ? 'திருநெல்வேலி பைலட் மாவட்டம் - இலவச அரசு மருத்துவ சேவை' 
      : 'Tirunelveli Pilot District - Free Public Healthcare Network',
    filterLabel: language === 'ta' ? 'ஒன்றியம் / பிளாக் தேர்வு:' : 'Filter by Block:',
    allBlocks: language === 'ta' ? 'அனைத்து ஒன்றியங்கள் (10 PHCs)' : 'All Blocks (10 PHCs)',
    aamBadge: language === 'ta' ? 'ஆயுஷ்மான் ஆரோக்கிய மந்திர்' : 'Ayushman Arogya Mandir (AAM)',
    callPhc: language === 'ta' ? 'PHC அழைக்கவும்' : 'Call PHC',
    call108: language === 'ta' ? '108 அவசர ஊர்தி' : 'Emergency Ambulance 108',
    teleconsult: language === 'ta' ? 'eSanjeevani ஆன்லைன் மருத்துவர்' : 'eSanjeevani Teleconsultation',
    freeBadge: language === 'ta' ? '100% இலவச அரசு சேவை' : '100% Free Public Care',
    demoNotice: language === 'ta' ? 'டெமோ தகவல் - அவசரத்திற்கு 108 அழைக்கவும்' : 'Demo Facility Coordinates - In Emergency Call 108',
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-teal-900 text-white rounded-2xl p-6 shadow-md border border-teal-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-teal-700 text-teal-100 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck size={12} /> {t.freeBadge}
              </span>
            </div>
            <h2 className="text-2xl font-bold">{t.title}</h2>
            <p className="text-teal-200 text-sm mt-1">{t.subtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:108"
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <AlertTriangle size={18} />
              {t.call108}
            </a>
            <a
              href="https://esanjeevani.in"
              target="_blank"
              rel="noreferrer"
              className="bg-teal-700 hover:bg-teal-600 text-white px-4 py-3 rounded-xl font-medium flex items-center gap-2 transition"
            >
              <ExternalLink size={16} />
              {t.teleconsult}
            </a>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={18} className="text-teal-700" />
          <label htmlFor="block-filter" className="text-sm font-semibold text-gray-700 whitespace-nowrap">
            {t.filterLabel}
          </label>
          <select
            id="block-filter"
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
            className="w-full sm:w-64 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
          >
            <option value="all">{t.allBlocks}</option>
            {blocks.map(b => (
              <option key={b} value={b}>{b} Block</option>
            ))}
          </select>
        </div>
        <div className="text-xs text-gray-500 italic">
          {t.demoNotice}
        </div>
      </div>

      {/* Grid: PHC List & Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: PHC List (5 cols) */}
        <div className="lg:col-span-5 space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading PHC directory...</div>
          ) : (
            filteredPhcs.map((phc) => {
              const isSelected = activePhc?.id === phc.id;
              return (
                <div
                  key={phc.id}
                  onClick={() => {
                    setActivePhc(phc);
                    if (onSelectPhc) onSelectPhc(phc);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-teal-700 bg-teal-50 ring-2 ring-teal-600/30 shadow-md'
                      : 'border-gray-200 bg-white hover:border-teal-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 text-base flex items-center gap-1.5">
                        <MapPin size={16} className={isSelected ? 'text-teal-700' : 'text-gray-400'} />
                        {phc.name}
                      </h4>
                      <p className="text-xs text-gray-600 ml-5 mt-0.5">
                        {phc.block} Block • {phc.district}
                      </p>
                    </div>
                    {phc.isAam && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        AAM
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                    <span className="text-gray-500 font-mono">
                      GPS: {phc.lat.toFixed(3)}, {phc.lng.toFixed(3)}
                    </span>
                    <a
                      href={`tel:${phc.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1"
                    >
                      <Phone size={12} /> {phc.phone}
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Selected PHC Details & Interactive Map representation (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
          {activePhc ? (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center justify-between">
                  <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {activePhc.block} Primary Healthcare Centre
                  </span>
                  {activePhc.isAam && (
                    <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                      <ShieldCheck size={14} /> {t.aamBadge}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">{activePhc.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  District: {activePhc.district} | Jurisdiction: {activePhc.block} Health Zone
                </p>
              </div>

              {/* Geographic Visual Representation */}
              <div className="relative bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-200 rounded-2xl p-6 overflow-hidden min-h-[220px] flex flex-col items-center justify-center text-center">
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[11px] font-mono text-gray-700 border border-teal-100 shadow-sm">
                  Lat: {activePhc.lat.toFixed(4)}° N | Lng: {activePhc.lng.toFixed(4)}° E
                </div>
                
                <div className="w-16 h-16 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-lg animate-pulse mb-3">
                  <MapPin size={32} />
                </div>
                <h4 className="text-lg font-bold text-gray-900">{activePhc.name}</h4>
                <p className="text-xs text-gray-600 max-w-sm mt-1">
                  Government Primary Health Centre offering 24/7 emergency stabilization, maternal health services, essential lab diagnostics, and free pharmacy supplies.
                </p>

                <div className="mt-4 flex gap-3">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${activePhc.lat},${activePhc.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-white text-teal-700 text-xs font-semibold px-3 py-2 rounded-lg border border-teal-300 shadow-sm hover:bg-teal-50"
                  >
                    <Navigation size={13} /> Open in Google Maps
                  </a>
                </div>
              </div>

              {/* Facility Services & Contact Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Available Free Services
                  </div>
                  <ul className="text-xs space-y-1.5 text-gray-700">
                    <li>✓ Outpatient & Emergency Triage</li>
                    <li>✓ 24x7 Normal Delivery Care</li>
                    <li>✓ Basic Lab (CBC, Blood Sugar, Urine)</li>
                    <li>✓ Free Essential Medicines (NLEM)</li>
                    <li>✓ National Immunization Outreach</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Direct Helpdesk
                    </div>
                    <p className="text-lg font-mono font-bold text-teal-800">
                      {activePhc.phone}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Duty Medical Officer / Staff Nurse
                    </p>
                  </div>
                  <div className="mt-3">
                    <a
                      href={`tel:${activePhc.phone}`}
                      className="w-full bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-1.5 transition"
                    >
                      <Phone size={14} /> {t.callPhc}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Select a PHC from the list to view directions and contact information.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
