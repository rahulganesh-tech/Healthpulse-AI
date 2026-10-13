import React from 'react';
import { Activity, PhoneCall, Globe, UserCheck, PlayCircle, RotateCcw } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  language: 'ta' | 'en';
  setLanguage: (lang: 'ta' | 'en') => void;
  activeRole: UserRole;
  onOpenLogin: () => void;
  onLogout: () => void;
  onToggleDemoGuide: () => void;
  onResetDemo: () => void;
  onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  setLanguage,
  activeRole,
  onOpenLogin,
  onLogout,
  onToggleDemoGuide,
  onResetDemo,
  onNavigateHome,
}) => {
  return (
    <header className="app-header">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        
        {/* Brand */}
        <div 
          onClick={onNavigateHome}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{
            background: 'var(--primary-teal)',
            color: '#FFFFFF',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="brand-font" style={{ fontSize: '20px', color: 'var(--primary-teal)', fontWeight: 800 }}>
                HealthPulse AI
              </span>
              <span style={{ fontSize: '11px', background: 'var(--primary-teal-light)', color: 'var(--primary-teal)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                SEVA 2026
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {language === 'ta' ? 'தமிழ்-முதன்மை சுகாதார வழிகாட்டி • திருநெல்வேலி' : 'Tamil-First Health Navigator • Tirunelveli'}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Emergency 108 Button */}
          <a
            href="tel:108"
            className="btn-emergency"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 700
            }}
          >
            <PhoneCall size={16} />
            <span>108 {language === 'ta' ? 'அழைக்க' : 'Emergency'}</span>
          </a>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'ta' ? 'en' : 'ta')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: '#FFFFFF',
              color: 'var(--text-main)',
              fontSize: '13px',
              fontWeight: 600
            }}
            title="Switch Language"
          >
            <Globe size={15} color="var(--primary-teal)" />
            <span>{language === 'ta' ? 'English' : 'தமிழ்'}</span>
          </button>

          {/* Demo Guide Toggle */}
          <button
            onClick={onToggleDemoGuide}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #F59E0B',
              background: '#FEF3C7',
              color: '#92400E',
              fontSize: '13px',
              fontWeight: 700
            }}
          >
            <PlayCircle size={15} />
            <span>{language === 'ta' ? 'டெமோ வழிகாட்டி' : 'Demo Guide'}</span>
          </button>

          {/* Reset Demo */}
          <button
            onClick={onResetDemo}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: '#FFFFFF',
              color: 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 600
            }}
            title="Reset Demo Data"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          {/* Staff Portal / Role Badge */}
          {activeRole === 'CITIZEN' ? (
            <button
              onClick={onOpenLogin}
              className="btn-outline"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              <UserCheck size={15} />
              <span>{language === 'ta' ? 'பணியாளர் பகுதி' : 'Staff Portal'}</span>
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                background: 'var(--primary-teal)',
                color: '#FFFFFF',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: 700
              }}>
                Role: {activeRole}
              </span>
              <button
                onClick={onLogout}
                style={{
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: '#FFFFFF',
                  color: 'var(--text-muted)',
                  fontSize: '12px'
                }}
              >
                Logout
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
