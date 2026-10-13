import React, { useState } from 'react';
import { 
  Users, UserPlus, Phone, AlertTriangle, CheckCircle, Clock, 
  Send, ShieldAlert, ArrowRight, Activity, FileText
} from 'lucide-react';
import { UrgencyLevel } from '../types';

interface HouseholdMemberCheck {
  id: string;
  name: string;
  age: number;
  sex: 'M' | 'F';
  relation: string;
  symptoms: string[];
  urgency: UrgencyLevel;
  reason: string;
  timestamp: string;
  cardCode: string;
  moInformed: boolean;
}

interface AshaModeProps {
  language: 'en' | 'ta';
  onStartNewCheck: (prefill?: { ageBand: string; sex: string; childUnder5: boolean; pregnant: boolean }) => void;
  onViewDoctorCard: (cardCode: string) => void;
}

export const AshaMode: React.FC<AshaModeProps> = ({
  language,
  onStartNewCheck,
  onViewDoctorCard,
}) => {
  const [household, setHousehold] = useState<HouseholdMemberCheck[]>([
    {
      id: 'CHK-ASHA-001',
      name: 'Kavya S.',
      age: 3,
      sex: 'F',
      relation: 'Daughter (குழந்தை)',
      symptoms: ['loose motions', 'not drinking', 'very sleepy'],
      urgency: 'EMERGENCY',
      reason: 'RF-CHILD-08: Child under 5 cannot drink/vomits everything/lethargic',
      timestamp: '10:15 AM Today',
      cardCode: 'KAV03F',
      moInformed: true,
    },
    {
      id: 'CHK-ASHA-002',
      name: 'Rani S.',
      age: 26,
      sex: 'F',
      relation: 'Mother (தாய்)',
      symptoms: ['mild fever', 'body ache'],
      urgency: 'PHC_VISIT',
      reason: 'Seasonal viral prodrome, advised PHC OP consultation within 24-48 hrs',
      timestamp: '10:35 AM Today',
      cardCode: 'RAN26F',
      moInformed: false,
    },
    {
      id: 'CHK-ASHA-003',
      name: 'Murugesan K.',
      age: 62,
      sex: 'M',
      relation: 'Grandfather (தாத்தா)',
      symptoms: ['knee joint stiffness'],
      urgency: 'SELF_CARE',
      reason: 'No red flags, hydration & gentle home mobility recommended',
      timestamp: '10:50 AM Today',
      cardCode: 'MUR62M',
      moInformed: false,
    },
  ]);

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const handleInformMO = (checkId: string) => {
    setHousehold(prev =>
      prev.map(item =>
        item.id === checkId ? { ...item, moInformed: true } : item
      )
    );
    const item = household.find(h => h.id === checkId);
    setNotificationMsg(
      language === 'ta'
        ? `டாக்டர் / PHC MO-வுக்கு தகவல் அனுப்பப்பட்டது: ${item?.name} (${item?.urgency})`
        : `Medical Officer alerted for ${item?.name} (${item?.urgency}) at Manur PHC.`
    );
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const getUrgencyBadge = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'EMERGENCY':
        return (
          <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <AlertTriangle size={12} /> EMERGENCY (108)
          </span>
        );
      case 'URGENT':
        return (
          <span className="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            URGENT (Doctor Today)
          </span>
        );
      case 'PHC_VISIT':
        return (
          <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            PHC VISIT (24-48h)
          </span>
        );
      default:
        return (
          <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle size={12} /> HOME CARE
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ASHA Header */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-950 text-white rounded-2xl p-6 shadow-md border border-teal-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-teal-700/80 text-teal-200 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Users size={12} /> ASHA Assisted Screening Mode
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                Manur Catchment (Ward 4)
              </span>
            </div>
            <h2 className="text-2xl font-bold">
              {language === 'ta' ? 'ஆஷா களப் பணியாளர் போர்டல்' : 'ASHA Community Field Portal'}
            </h2>
            <p className="text-teal-200 text-sm mt-1">
              {language === 'ta'
                ? 'ஒரு தொலைபேசியில் குடும்ப உறுப்பினர்கள் அனைவரையும் சோதித்து PHC மருத்துவரிடம் பகிருங்கள்'
                : 'Screen multiple family members on one phone during home visits and dispatch directly to PHC'}
            </p>
          </div>

          <button
            onClick={() => onStartNewCheck({ ageBand: '0-4', sex: 'F', childUnder5: true, pregnant: false })}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
          >
            <UserPlus size={18} />
            {language === 'ta' ? '+ புதிய குடும்ப உறுப்பினர்' : '+ New Family Member'}
          </button>
        </div>
      </div>

      {notificationMsg && (
        <div className="bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded-xl shadow-sm flex items-center justify-between text-emerald-900 text-sm font-medium animate-fadeIn">
          <span>{notificationMsg}</span>
          <button onClick={() => setNotificationMsg(null)} className="text-emerald-700 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Household Visit Active Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
            <Users size={24} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-gray-900">{household.length}</div>
            <div className="text-xs text-gray-500">Screened Today in Household</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-red-600">
              {household.filter(h => h.urgency === 'EMERGENCY' || h.urgency === 'URGENT').length}
            </div>
            <div className="text-xs text-gray-500">Critical / Urgent Referrals</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-emerald-600">
              {household.filter(h => h.moInformed).length} / {household.filter(h => h.urgency === 'EMERGENCY').length}
            </div>
            <div className="text-xs text-gray-500">Medical Officer Notified</div>
          </div>
        </div>
      </div>

      {/* Household Entries List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Activity size={18} className="text-teal-700" />
            {language === 'ta' ? 'இன்றைய குடும்பப் பட்டியல் (அவசர நிலை வரிசை)' : 'Current Household Triage Queue'}
          </h3>
          <span className="text-xs font-medium text-gray-500">
            Household ID: HH-MANUR-402
          </span>
        </div>

        <div className="divide-y divide-gray-200">
          {household.map((member) => {
            const isEmergency = member.urgency === 'EMERGENCY';
            return (
              <div
                key={member.id}
                className={`p-5 transition hover:bg-gray-50 ${
                  isEmergency ? 'bg-red-50/50' : ''
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-gray-900 text-lg">{member.name}</h4>
                      <span className="text-xs text-gray-500 font-medium">
                        ({member.age} yrs, {member.sex}) • {member.relation}
                      </span>
                      {getUrgencyBadge(member.urgency)}
                    </div>

                    <p className="text-xs text-gray-700">
                      <strong className="text-gray-900">Symptoms:</strong> {member.symptoms.join(', ')}
                    </p>

                    <p className="text-xs text-gray-600 italic">
                      <strong className="text-gray-900 not-italic">Clinical Rule:</strong> {member.reason}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-gray-400 font-mono">
                      <span className="flex items-center gap-1"><Clock size={11} /> {member.timestamp}</span>
                      <span>Card: {member.cardCode}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    {isEmergency && (
                      <a
                        href="tel:108"
                        className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <Phone size={14} /> Call 108
                      </a>
                    )}

                    {isEmergency && !member.moInformed && (
                      <button
                        onClick={() => handleInformMO(member.id)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <Send size={14} /> Inform MO
                      </button>
                    )}

                    {member.moInformed && (
                      <span className="text-emerald-700 bg-emerald-100 text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                        <CheckCircle size={13} /> MO Notified
                      </span>
                    )}

                    <button
                      onClick={() => onViewDoctorCard(member.cardCode)}
                      className="bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <FileText size={14} /> View Card
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
