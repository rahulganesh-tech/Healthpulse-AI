import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceArea
} from 'recharts';
import { Activity, AlertTriangle, ArrowDownRight, ArrowLeft } from 'lucide-react';

interface HealthTimelineProps {
  language: 'ta' | 'en';
  onBack: () => void;
}

export const HealthTimeline: React.FC<HealthTimelineProps> = ({
  language,
  onBack
}) => {
  // Lakshmi's 3 CBC Reports (Prompt 5 & 8)
  const data = [
    { date: 'Jan 2026', fullDate: '2026-01-15', hb: 11.2, plt: 260, refLow: 12.0, refHigh: 16.0 },
    { date: 'Apr 2026', fullDate: '2026-04-10', hb: 10.1, plt: 245, refLow: 12.0, refHigh: 16.0 },
    { date: 'Jul 2026', fullDate: '2026-07-20', hb: 8.9, plt: 230, refLow: 12.0, refHigh: 16.0 }
  ];

  return (
    <div className="card citizen-view" style={{ maxWidth: '720px', margin: '0 auto' }}>
      
      {/* Back button & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <button
          onClick={onBack}
          style={{ background: '#F1F5F9', padding: '8px', borderRadius: '8px', border: 'none' }}
        >
          <ArrowLeft size={20} color="var(--primary-teal)" />
        </button>
        <div>
          <h2 style={{ fontSize: '20px', color: 'var(--primary-teal)', fontWeight: 800 }}>
            {language === 'ta' ? 'உடல்நல வரலாற்றுப் பதிவு (ஹெல்த் டைம்லைன்)' : 'Personal Health Timeline'}
          </h2>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Lakshmi (45, F, Manur) · Longitudinal Biomarker Monitoring
          </span>
        </div>
      </div>

      {/* Rapid Drop Alert Banner (LAB-HB-02) */}
      <div style={{
        background: '#FFFBEB',
        border: '2px solid #F59E0B',
        padding: '14px',
        borderRadius: '12px',
        marginBottom: '20px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start'
      }}>
        <AlertTriangle size={24} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ fontWeight: 800, color: '#92400E', fontSize: '15px' }}>
            {language === 'ta' ? 'அபாயப் போக்கு: ஹீமோகுளோபின் விரைவான வீழ்ச்சி (LAB-HB-02)' : 'Clinical Trend Alert: Rapid Haemoglobin Decline (LAB-HB-02)'}
          </div>
          <div style={{ fontSize: '13px', color: '#B45309', marginTop: '4px', lineHeight: 1.4 }}>
            {language === 'ta'
              ? 'கடந்த 6 மாதங்களில் ஹீமோகுளோபின் 11.2 லிருந்து 8.9 g/dL ஆக (2.3 g/dL) குறைந்துள்ளது. ரத்த இழப்பு அல்லது ஊட்டச்சத்துக் குறைபாடு குறித்து ஆரம்ப சுகாதார நிலையத்தில் பரிசோதிக்கவும்.'
              : 'Hb fell by 2.3 g/dL in 6 months (from 11.2 to 8.9 g/dL). This meets rule LAB-HB-02 (drop ≥ 2 g/dL within 12 months) requiring PHC investigation for ongoing blood loss or nutritional anaemia.'}
          </div>
        </div>
      </div>

      {/* Interactive Recharts Line Chart with Shaded Normal Band */}
      <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: '15px' }}>Haemoglobin Trend (g/dL)</span>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Normal Adult Reference Band: 12.0 – 16.0 g/dL</div>
          </div>
          <span style={{ background: '#FEE2E2', color: '#DC2626', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
            Current: 8.9 g/dL (LOW)
          </span>
        </div>

        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
              <YAxis domain={[6, 18]} stroke="#64748B" fontSize={12} />
              <Tooltip
                contentStyle={{ background: '#FFFFFF', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                formatter={(val: any) => [`${val} g/dL`, 'Haemoglobin']}
              />
              {/* Shaded Reference Band */}
              <ReferenceArea y1={12.0} y2={16.0} fill="#E6F4F4" fillOpacity={0.6} />
              <Line
                type="monotone"
                dataKey="hb"
                stroke="#DC2626"
                strokeWidth={3}
                dot={{ r: 6, fill: '#DC2626' }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* History Table */}
      <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '10px 14px' }}>Date</th>
              <th style={{ padding: '10px 14px' }}>Haemoglobin</th>
              <th style={{ padding: '10px 14px' }}>Platelets</th>
              <th style={{ padding: '10px 14px' }}>Clinical Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '10px 14px', fontWeight: 600 }}>15 Jan 2026</td>
              <td style={{ padding: '10px 14px' }}>11.2 g/dL</td>
              <td style={{ padding: '10px 14px' }}>260,000 /µL</td>
              <td style={{ padding: '10px 14px', color: '#16A34A', fontWeight: 700 }}>Normal Baseline</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '10px 14px', fontWeight: 600 }}>10 Apr 2026</td>
              <td style={{ padding: '10px 14px' }}>10.1 g/dL</td>
              <td style={{ padding: '10px 14px' }}>245,000 /µL</td>
              <td style={{ padding: '10px 14px', color: '#CA8A04', fontWeight: 700 }}>Mild Fall (-1.1 g/dL)</td>
            </tr>
            <tr>
              <td style={{ padding: '10px 14px', fontWeight: 600 }}>20 Jul 2026</td>
              <td style={{ padding: '10px 14px', color: '#DC2626', fontWeight: 700 }}>8.9 g/dL</td>
              <td style={{ padding: '10px 14px' }}>230,000 /µL</td>
              <td style={{ padding: '10px 14px', color: '#DC2626', fontWeight: 700 }}>LAB-HB-02 Triggered</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
};
