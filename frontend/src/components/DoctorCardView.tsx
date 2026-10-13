import React, { useState } from 'react';
import {
  Download, QrCode, ArrowLeft, Shield, AlertTriangle,
  Clock, CheckCircle, FileText, Share2, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { DoctorCard } from '../types';
import { ApiClient } from '../services/api';

interface DoctorCardViewProps {
  card: DoctorCard;
  language?: 'ta' | 'en';
  onBack?: () => void;
  isDoctorView?: boolean;
}

export const DoctorCardView: React.FC<DoctorCardViewProps> = ({
  card,
  language = 'en',
  onBack,
  isDoctorView = false
}) => {
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleFeedback = async (type: 'too_high' | 'too_low' | 'appropriate') => {
    try {
      await fetch('/api/models/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_code: card.cardCode, feedback_type: type })
      });
      setFeedbackSent(true);
    } catch {
      setFeedbackSent(true);
    }
  };

  const isEmergency = card.urgency === 'EMERGENCY' || card.urgency === 'CRISIS';

  return (
    <div className="card citizen-view" style={{ maxWidth: '680px', margin: '0 auto', padding: '24px' }}>
      
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button
          onClick={onBack}
          style={{ background: '#F1F5F9', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <a
          href={card.pdfUrl || `/api/cards/${card.cardCode}?format=pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ padding: '8px 14px', fontSize: '13px', borderRadius: '8px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Download size={15} />
          <span>Download PDF Card</span>
        </a>
      </div>

      {/* Card Body (Printable Form Factor) */}
      <div style={{
        border: '2px solid var(--border-color)',
        borderRadius: '12px',
        padding: '24px',
        background: '#FFFFFF',
        boxShadow: 'var(--shadow-sm)'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', borderBottom: '2px solid var(--primary-teal)', paddingBottom: '10px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-teal)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Tamil Nadu Health Systems Reform Project
            </span>
            <h2 style={{ fontSize: '20px', color: 'var(--primary-teal)', fontWeight: 800 }}>
              HealthPulse AI — Doctor Handoff Card
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>
              Patient-reported information. Not a diagnosis.
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '1px' }}>
              #{card.cardCode}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Valid for 30 days
            </div>
          </div>
        </div>

        {/* Urgency Ribbon */}
        <div style={{
          background: isEmergency ? '#FEE2E2' : '#FEF9C3',
          border: `1.5px solid ${isEmergency ? '#DC2626' : '#CA8A04'}`,
          borderRadius: '8px',
          padding: '10px 14px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: isEmergency ? '#991B1B' : '#854D0E', textTransform: 'uppercase' }}>
              Triage Urgency:
            </span>
            <div style={{ fontSize: '16px', fontWeight: 800, color: isEmergency ? '#DC2626' : '#A16207' }}>
              {card.urgency}
            </div>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Generated: {card.createdAt.slice(0, 10)}
          </span>
        </div>

        {/* Demographics & Clinical Profile */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', background: '#F8FAFC', padding: '12px', borderRadius: '8px', fontSize: '12px', marginBottom: '16px' }}>
          <div>
            <b style={{ color: 'var(--text-muted)' }}>Age Band:</b>
            <div style={{ fontWeight: 700, fontSize: '13px' }}>{card.ageBand}</div>
          </div>
          <div>
            <b style={{ color: 'var(--text-muted)' }}>Sex:</b>
            <div style={{ fontWeight: 700, fontSize: '13px' }}>{card.sex}</div>
          </div>
          <div>
            <b style={{ color: 'var(--text-muted)' }}>Pregnant:</b>
            <div style={{ fontWeight: 700, fontSize: '13px' }}>{card.pregnant ? 'Yes' : 'No'}</div>
          </div>
          <div>
            <b style={{ color: 'var(--text-muted)' }}>Duration:</b>
            <div style={{ fontWeight: 700, fontSize: '13px' }}>{card.durationDays} day(s)</div>
          </div>
        </div>

        {/* Symptoms & Danger Screening */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
            Reported Symptoms & Danger Screening
          </div>
          <div style={{ padding: '10px', background: '#F8FAFC', borderRadius: '8px', fontSize: '13px', lineHeight: 1.5 }}>
            <div><b>Symptoms:</b> {card.symptoms.map(s => s.replace('_', ' ')).join(', ') || 'General malaise'}</div>
            <div style={{ marginTop: '4px' }}>
              <b>Red-Flag Answers:</b>{' '}
              {Object.keys(card.dangerAnswers).filter(k => card.dangerAnswers[k]).join(', ') || 'No positive red flags'}
            </div>
            <div style={{ marginTop: '4px', color: 'var(--text-muted)' }}>
              <b>Clinical Rationale:</b> {card.urgencyReason}
            </div>
          </div>
        </div>

        {/* Lab Values if present */}
        {card.reportValues && card.reportValues.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Laboratory Biomarkers
            </div>
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead style={{ background: '#F1F5F9' }}>
                  <tr>
                    <th style={{ padding: '6px 10px', textAlign: 'left' }}>Test</th>
                    <th style={{ padding: '6px 10px', textAlign: 'left' }}>Value</th>
                    <th style={{ padding: '6px 10px', textAlign: 'left' }}>Ref Range</th>
                    <th style={{ padding: '6px 10px', textAlign: 'left' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {card.reportValues.map((v, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '6px 10px', fontWeight: 700 }}>{v.testCode}</td>
                      <td style={{ padding: '6px 10px', fontWeight: 700 }}>{v.value} {v.unit}</td>
                      <td style={{ padding: '6px 10px', color: 'var(--text-muted)' }}>{v.refLow} - {v.refHigh}</td>
                      <td style={{ padding: '6px 10px', color: v.flag === 'LOW' ? '#B45309' : (v.flag === 'CRITICAL' ? '#DC2626' : '#15803D'), fontWeight: 700 }}>
                        {v.flag}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* QR Code and Verification Strip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '6px', background: 'var(--primary-teal-light)', borderRadius: '6px' }}>
              <QrCode size={36} color="var(--primary-teal)" />
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Scan at PHC registration desk for instant 30-second patient history.<br />
              Safety Rules: <b>{card.rulesVersion}</b> · Model: <b>{card.modelVersion}</b>
            </div>
          </div>
        </div>

      </div>

      {/* MO Feedback Section (Prompt 10) */}
      {isDoctorView && (
        <div style={{ marginTop: '20px', padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>
            PHC Doctor Feedback (Clinical Calibration Loop)
          </div>
          {!feedbackSent ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleFeedback('appropriate')}
                style={{ flex: 1, padding: '8px', borderRadius: '6px', background: '#DCFCE7', color: '#16A34A', fontWeight: 700, fontSize: '13px' }}
              >
                Appropriate Urgency
              </button>
              <button
                onClick={() => handleFeedback('too_high')}
                style={{ flex: 1, padding: '8px', borderRadius: '6px', background: '#FEF3C7', color: '#B45309', fontWeight: 700, fontSize: '13px' }}
              >
                Urgency Too High
              </button>
              <button
                onClick={() => handleFeedback('too_low')}
                style={{ flex: 1, padding: '8px', borderRadius: '6px', background: '#FEE2E2', color: '#DC2626', fontWeight: 700, fontSize: '13px' }}
              >
                Urgency Too Low
              </button>
            </div>
          ) : (
            <div style={{ color: '#16A34A', fontWeight: 700, fontSize: '13px' }}>
              ✓ Thank you, Doctor. Your feedback has been recorded into the model calibration registry.
            </div>
          )}
        </div>
      )}

    </div>
  );
};
