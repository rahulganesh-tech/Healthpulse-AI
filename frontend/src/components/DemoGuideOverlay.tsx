import React from 'react';
import { X, Play, User, Sparkles, CheckCircle, ChevronRight, RefreshCw } from 'lucide-react';
import { UserRole } from '../types';

interface DemoGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadPersona: (personaKey: 'MUR58M' | 'SEL24F' | 'KAV03F' | 'KAR19M' | 'LAK45F') => void;
  onSwitchRole: (role: UserRole) => void;
  onResetDemo: () => void;
  onSelectTab: (tab: string) => void;
}

export const DemoGuideOverlay: React.FC<DemoGuideProps> = ({
  isOpen,
  onClose,
  onLoadPersona,
  onSwitchRole,
  onResetDemo,
  onSelectTab
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      width: '380px',
      maxWidth: 'calc(100vw - 32px)',
      background: '#FFFFFF',
      border: '2px solid #F59E0B',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-lg)',
      zIndex: 100,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '85vh'
    }}>
      {/* Header */}
      <div style={{
        background: '#FEF3C7',
        borderBottom: '1px solid #F59E0B',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="#D97706" />
          <span style={{ fontWeight: 800, fontSize: '15px', color: '#92400E' }}>
            SEVA 2026 Interactive Demo Guide
          </span>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', color: '#92400E' }}>
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Step 1: Pre-loaded Demo Personas */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
            1-Click Persona Loaders (Judge Evaluation)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            
            <button
              onClick={() => { onLoadPersona('MUR58M'); onSelectTab('symptom_result'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                textAlign: 'left',
                fontSize: '13px'
              }}
            >
              <div>
                <span style={{ fontWeight: 700 }}>1. Murugan (58M, Manur)</span>
                <div style={{ fontSize: '11px', color: '#B91C1C' }}>
                  Chest pain + "gas dhaan" → EMERGENCY by RF-CHEST-01
                </div>
              </div>
              <ChevronRight size={16} />
            </button>

            <button
              onClick={() => { onLoadPersona('KAR19M'); onSelectTab('symptom_result'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: '#FEF9C3',
                border: '1px solid #FDE047',
                color: '#854D0E',
                textAlign: 'left',
                fontSize: '13px'
              }}
            >
              <div>
                <span style={{ fontWeight: 700 }}>2. Karthik (19M, Nanguneri)</span>
                <div style={{ fontSize: '11px', color: '#A16207' }}>
                  Fever 3 days, Monsoon → PHC_VISIT (Top Factors)
                </div>
              </div>
              <ChevronRight size={16} />
            </button>

            <button
              onClick={() => { onLoadPersona('LAK45F'); onSelectTab('timeline'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: '#EFF6FF',
                border: '1px solid #93C5FD',
                color: '#1E40AF',
                textAlign: 'left',
                fontSize: '13px'
              }}
            >
              <div>
                <span style={{ fontWeight: 700 }}>3. Lakshmi (45F, Manur)</span>
                <div style={{ fontSize: '11px', color: '#2563EB' }}>
                  Hb drop 11.2 → 8.9 g/dL → LAB-HB-02 Trend Alert
                </div>
              </div>
              <ChevronRight size={16} />
            </button>

            <button
              onClick={() => { onLoadPersona('SEL24F'); onSelectTab('symptom_result'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: '#FDF2F8',
                border: '1px solid #FBCFE8',
                color: '#9D174D',
                textAlign: 'left',
                fontSize: '13px'
              }}
            >
              <div>
                <span style={{ fontWeight: 700 }}>4. Selvi (24F, Pregnant)</span>
                <div style={{ fontSize: '11px', color: '#BE185D' }}>
                  Severe headache + blurred vision → RF-PREG-07
                </div>
              </div>
              <ChevronRight size={16} />
            </button>

            <button
              onClick={() => { onLoadPersona('KAV03F'); onSelectTab('symptom_result'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: '#F5F3FF',
                border: '1px solid #DDD6FE',
                color: '#5B21B6',
                textAlign: 'left',
                fontSize: '13px'
              }}
            >
              <div>
                <span style={{ fontWeight: 700 }}>5. Kavya (3F, Child)</span>
                <div style={{ fontSize: '11px', color: '#6D28D9' }}>
                  Diarrhea + not drinking fluids → RF-CHILD-08
                </div>
              </div>
              <ChevronRight size={16} />
            </button>

          </div>
        </div>

        {/* Step 2: 4-Minute Presentation Track */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
            Presentation Workflow Steps
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <div style={{ padding: '8px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <b>1. Emergency Caught (60s)</b>: Show Murugan, Anti-minimisation detection for "gas dhaan", and 108 dispatch priority.
            </div>
            <div style={{ padding: '8px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <b>2. Everyday Case (45s)</b>: Show Karthik, top 3 clinical factors driving PHC visit, and Doctor Card QR.
            </div>
            <div style={{ padding: '8px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <b>3. Report Reader (45s)</b>: Show Lakshmi's declining Hb timeline (11.2 → 10.1 → 8.9) with 3 doctor questions.
            </div>
            <div 
              onClick={() => { onSwitchRole('MO'); onSelectTab('doctor_portal'); }}
              style={{ padding: '8px', background: 'var(--primary-teal-light)', borderRadius: '6px', border: '1px solid var(--primary-teal)', cursor: 'pointer' }}
            >
              <b>4. Doctor Side (30s)</b>: <u>Click to jump to PHC Doctor Portal</u> (scan code KAR19M in 30 seconds).
            </div>
            <div 
              onClick={() => { onSwitchRole('MO'); onSelectTab('pulse'); }}
              style={{ padding: '8px', background: '#FEF3C7', borderRadius: '6px', border: '1px solid #F59E0B', cursor: 'pointer' }}
            >
              <b>5. Community Pulse (45s)</b>: <u>Click to see Nanguneri Fever Alert (Week 33)</u> (1 week before 2x rule!).
            </div>
            <div 
              onClick={() => { onSwitchRole('AUDITOR'); onSelectTab('audit'); }}
              style={{ padding: '8px', background: '#F1F5F9', borderRadius: '6px', border: '1px solid #CBD5E1', cursor: 'pointer' }}
            >
              <b>6. Trust & Audit (15s)</b>: <u>Click to verify cryptographic SHA-256 hash chain</u>.
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={onResetDemo}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              background: '#FFFFFF',
              color: 'var(--text-main)',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            <RefreshCw size={13} />
            <span>Reset Demo</span>
          </button>
          <button
            onClick={onClose}
            className="btn-primary"
            style={{ padding: '6px 14px', fontSize: '12px', borderRadius: 'var(--radius-sm)' }}
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
