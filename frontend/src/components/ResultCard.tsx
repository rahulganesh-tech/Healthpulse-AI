import React from 'react';
import {
  AlertOctagon, CheckCircle2, Clock, PhoneCall,
  Volume2, QrCode, MapPin, HeartHandshake, ShieldAlert
} from 'lucide-react';
import { CheckResult } from '../types';

interface ResultCardProps {
  result: CheckResult;
  language: 'ta' | 'en';
  onOpenCard: (cardCode: string) => void;
  onOpenMap: () => void;
  onStartNew: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  language,
  onOpenCard,
  onOpenMap,
  onStartNew
}) => {
  const isEmergency = result.finalLevel === 'EMERGENCY' || result.finalLevel === 'CRISIS';
  const isCrisis = result.finalLevel === 'CRISIS';

  const handleReadAloud = () => {
    if ('speechSynthesis' in window) {
      const textToSpeak = language === 'ta' 
        ? `${result.nextStepTa}. ${result.explanationTa}`
        : `${result.nextStep}. ${result.explanation}`;
      const utter = new SpeechSynthesisUtterance(textToSpeak);
      utter.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
      window.speechSynthesis.speak(utter);
    }
  };

  const getUrgencyConfig = (level: string) => {
    switch (level) {
      case 'EMERGENCY':
        return {
          title: language === 'ta' ? 'உடனடி அவசர உதவி (EMERGENCY)' : 'Critical Emergency',
          badgeClass: 'badge-emergency',
          icon: <AlertOctagon size={28} color="#DC2626" />,
          borderColor: '#DC2626',
          bgHeader: '#FEE2E2',
        };
      case 'CRISIS':
        return {
          title: language === 'ta' ? 'மனநல அவசர உதவி (CRISIS)' : 'Crisis Support',
          badgeClass: 'badge-crisis',
          icon: <HeartHandshake size={28} color="#9333EA" />,
          borderColor: '#9333EA',
          bgHeader: '#F3E8FF',
        };
      case 'URGENT':
        return {
          title: language === 'ta' ? 'இன்றே மருத்துவரை அணுகவும் (URGENT)' : 'See a Doctor Today',
          badgeClass: 'badge-urgent',
          icon: <Clock size={28} color="#EA580C" />,
          borderColor: '#EA580C',
          bgHeader: '#FFEDD5',
        };
      case 'PHC_VISIT':
        return {
          title: language === 'ta' ? '24–48 மணி நேரத்தில் ஆரம்ப சுகாதார நிலையம் செல்லவும்' : 'Visit PHC in 24–48 Hours',
          badgeClass: 'badge-phc',
          icon: <Clock size={28} color="#CA8A04" />,
          borderColor: '#CA8A04',
          bgHeader: '#FEF9C3',
        };
      default:
        return {
          title: language === 'ta' ? 'வீட்டுப் பராமரிப்பு மற்றும் ஓய்வு' : 'Care at Home',
          badgeClass: 'badge-self-care',
          icon: <CheckCircle2 size={28} color="#16A34A" />,
          borderColor: '#16A34A',
          bgHeader: '#DCFCE7',
        };
    }
  };

  const config = getUrgencyConfig(result.finalLevel);

  return (
    <div className="card citizen-view" style={{ maxWidth: '640px', margin: '0 auto', border: `2.5px solid ${config.borderColor}`, padding: 0, overflow: 'hidden' }}>
      
      {/* Top Urgency Header */}
      <div style={{ background: config.bgHeader, padding: '20px', borderBottom: `1.5px solid ${config.borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {config.icon}
          <div>
            <span className={config.badgeClass}>
              {result.finalLevel}
            </span>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px' }}>
              {config.title}
            </h2>
          </div>
        </div>
        <button
          onClick={handleReadAloud}
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--border-color)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 600
          }}
          title="Read Aloud in Tamil/English"
        >
          <Volume2 size={16} color="var(--primary-teal)" />
          <span>{language === 'ta' ? 'வாசிக்க' : 'Listen'}</span>
        </button>
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Anti-Minimisation Ignored Alert Banner */}
        {result.minimisingWarning && (
          <div style={{
            background: '#FFFBEB',
            border: '1.5px solid #F59E0B',
            padding: '12px 14px',
            borderRadius: '10px',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            fontSize: '13px',
            color: '#92400E'
          }}>
            <ShieldAlert size={20} color="#D97706" style={{ flexShrink: 0 }} />
            <span>{result.minimisingWarning}</span>
          </div>
        )}

        {/* Next Step Box */}
        <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
            {language === 'ta' ? 'அடுத்த கட்ட நடவடிக்கை:' : 'Recommended Next Step:'}
          </div>
          <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.4 }}>
            {language === 'ta' ? result.nextStepTa : result.nextStep}
          </div>
        </div>

        {/* Big Action Button for Emergency */}
        {isEmergency && (
          <div>
            <a
              href="tel:108"
              className="btn-emergency btn-large"
              style={{ width: '100%', textDecoration: 'none', fontSize: '18px' }}
            >
              <PhoneCall size={22} />
              <span>{language === 'ta' ? 'உடனடியாக 108 அழைக்கவும்' : 'Call 108 Emergency Now'}</span>
            </a>
          </div>
        )}

        {/* Crisis Tele-MANAS */}
        {isCrisis && (
          <div>
            <a
              href="tel:14416"
              style={{
                width: '100%',
                background: '#9333EA',
                color: '#FFF',
                textDecoration: 'none',
                minHeight: '48px',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: 700,
                fontSize: '16px'
              }}
            >
              <HeartHandshake size={20} />
              <span>{language === 'ta' ? 'Tele-MANAS 14416 அழைக்கவும்' : 'Call Tele-MANAS 14416 Free'}</span>
            </a>
          </div>
        )}

        {/* Clinical Drivers / Factors */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
            {language === 'ta' ? 'காரணங்கள் மற்றும் பின்னணி:' : 'Key Clinical Factors:'}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: 1.5 }}>
            {language === 'ta' ? result.explanationTa : result.explanation}
          </div>
          {result.modelTopFactors.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
              {result.modelTopFactors.map((factor, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '12px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--primary-teal-light)',
                    color: 'var(--primary-teal)',
                    fontWeight: 600
                  }}
                >
                  ✓ {factor}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Public Care Router Options */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            {language === 'ta' ? 'இலவச அரசு மருத்துவ வழிகள்:' : 'Public Healthcare Options:'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {result.careOptions.map((opt, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: '#FFFFFF'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{opt.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{opt.actionText}</div>
                </div>
                <a
                  href={`tel:${opt.phone}`}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: 'var(--primary-teal-light)',
                    color: 'var(--primary-teal)',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '13px'
                  }}
                >
                  {opt.phone}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Doctor Card Button & Map Links */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '8px' }}>
          <button
            onClick={() => onOpenCard(result.cardCode)}
            className="btn-outline btn-large"
            style={{ width: '100%', fontSize: '14px' }}
          >
            <QrCode size={18} />
            <span>{language === 'ta' ? 'மருத்துவர் அட்டை' : 'Doctor Card QR'}</span>
          </button>

          <button
            onClick={onOpenMap}
            className="btn-outline btn-large"
            style={{ width: '100%', fontSize: '14px' }}
          >
            <MapPin size={18} />
            <span>{language === 'ta' ? 'அருகிலுள்ள PHC வரைபடம்' : 'Nearest PHC Map'}</span>
          </button>
        </div>

        {/* Statutory Medical Disclaimer */}
        <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
          {language === 'ta'
            ? 'இது மருத்துவ நோயறிதல் அல்ல. உடல்நிலை மோசமடைந்தால் உடனடியாக 108 அழைக்கவும்.'
            : 'This is not a medical diagnosis. If symptoms worsen or you feel unwell, call 108.'}
        </div>

        {/* Start New Check */}
        <button
          onClick={onStartNew}
          style={{
            background: 'transparent',
            color: 'var(--text-muted)',
            fontSize: '13px',
            textDecoration: 'underline',
            marginTop: '-6px'
          }}
        >
          {language === 'ta' ? 'புதிய பரிசோதனை செய்க' : 'Start a New Check'}
        </button>

      </div>

    </div>
  );
};
