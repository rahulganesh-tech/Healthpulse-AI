import React, { useState } from 'react';
import { ShieldCheck, Check, Lock, Info, X } from 'lucide-react';

interface ConsentModalProps {
  isOpen: boolean;
  onConsentGiven: (saveTimeline: boolean) => void;
  onClose: () => void;
  language: 'ta' | 'en';
}

export const ConsentModal: React.FC<ConsentModalProps> = ({
  isOpen,
  onConsentGiven,
  onClose,
  language
}) => {
  const [saveTimeline, setSaveTimeline] = useState(false);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 120,
      padding: '16px'
    }}>
      <div className="card" style={{
        maxWidth: '540px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        border: '2px solid var(--primary-teal)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            background: 'var(--primary-teal-light)',
            color: 'var(--primary-teal)',
            padding: '10px',
            borderRadius: '12px'
          }}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-teal)' }}>
              {language === 'ta' ? 'தனியுரிமை மற்றும் தரவு ஒப்புதல்' : 'Privacy & Informed Consent'}
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Digital Personal Data Protection (DPDP) Act 2023 · India
            </span>
          </div>
        </div>

        {/* DPDP Explanations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', lineHeight: 1.5 }}>
          
          <div style={{ padding: '12px', background: 'var(--primary-teal-light)', borderRadius: '8px', borderLeft: '4px solid var(--primary-teal)' }}>
            <b>{language === 'ta' ? 'எங்கள் நோக்கம்:' : 'Our Purpose:'}</b>{' '}
            {language === 'ta' 
              ? 'உங்கள் அறிகுறிகளைப் பகுப்பாய்வு செய்து சரியான அரசு மருத்துவ மையத்திற்கு வழிகாட்ட மட்டுமே இந்தத் தகவல் பயன்படுகிறது. இது நோயறிதல் அல்ல.'
              : 'To evaluate reported symptoms, prioritize emergency signs, and navigate you to free public care. This is not a diagnosis.'}
          </div>

          <div>
            <b>{language === 'ta' ? 'என்ன சேகரிக்கப்படுகிறது?' : 'What is collected?'}</b>
            <ul style={{ paddingLeft: '20px', marginTop: '4px', color: 'var(--text-muted)' }}>
              <li>{language === 'ta' ? 'வயது வரம்பு, பாலினம் மற்றும் அறிகுறிகள் (பெயரோ தொலைபேசி எண்ணோ கட்டாயமில்லை).' : 'Age band, sex, and reported symptoms (No names or Aadhaar collected).'}</li>
              <li>{language === 'ta' ? 'அபாய அறிகுறிகளுக்கான ஆம்/இல்லை பதில்கள்.' : 'Yes/No answers to critical danger questions.'}</li>
            </ul>
          </div>

          <div>
            <b>{language === 'ta' ? 'தரவு பாதுகாப்பு மற்றும் நீக்கம்:' : 'Retention & Your Rights:'}</b>
            <p style={{ marginTop: '4px', color: 'var(--text-muted)' }}>
              {language === 'ta'
                ? 'உங்கள் தகவல்கள் 90 நாட்களில் தானாக நீக்கப்படும். "என் தரவை நீக்கு" (Delete Data) மூலம் எந்த நேரத்திலும் நீக்கலாம்.'
                : 'Data is automatically expunged after 90 days. You have the full right to erase your records anytime under DPDP Act 2023.'}
            </p>
          </div>

          {/* Optional Checkbox */}
          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '12px',
            background: '#F8FAFC',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '8px'
          }}>
            <input
              type="checkbox"
              checked={saveTimeline}
              onChange={(e) => setSaveTimeline(e.target.checked)}
              style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: 'var(--primary-teal)' }}
            />
            <span style={{ fontSize: '13px' }}>
              <b>{language === 'ta' ? '(விருப்பத்தேர்வு) என் வரலாற்றுப் பதிவில் சேமிக்க' : '(Optional) Save to My Health Timeline'}</b>:
              <br />
              <span style={{ color: 'var(--text-muted)' }}>
                {language === 'ta'
                  ? 'ரத்த பரிசோதனை அளவுகளைக் காலப்போக்கில் கண்காணிக்க என் தனிப்பட்ட டோக்கனில் சேமிக்க ஒப்புக்கொள்கிறேன்.'
                  : 'Allows tracking hemoglobin or platelets over time across multiple reports.'}
              </span>
            </span>
          </label>

        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            className="btn-outline"
            style={{ padding: '10px 18px', fontSize: '14px', borderRadius: 'var(--radius-sm)' }}
          >
            {language === 'ta' ? 'ரத்து செய்' : 'Cancel'}
          </button>
          <button
            onClick={() => onConsentGiven(saveTimeline)}
            className="btn-primary"
            style={{ padding: '10px 22px', fontSize: '14px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Check size={16} />
            <span>{language === 'ta' ? 'ஒப்புக்கொள்கிறேன் & தொடங்கு' : 'I Agree & Continue'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
