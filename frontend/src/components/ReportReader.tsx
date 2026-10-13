import React, { useState } from 'react';
import { Upload, FileText, Check, AlertCircle, ArrowRight, HelpCircle } from 'lucide-react';
import { LabValue } from '../types';

interface ReportReaderProps {
  language: 'ta' | 'en';
  onValuesConfirmed: (values: LabValue[]) => void;
  onOpenTimeline: () => void;
}

export const ReportReader: React.FC<ReportReaderProps> = ({
  language,
  onValuesConfirmed,
  onOpenTimeline
}) => {
  const [extractedValues, setExtractedValues] = useState<LabValue[]>([
    { testCode: 'HB', value: 8.9, unit: 'g/dL', refLow: 12.0, refHigh: 16.0, flag: 'LOW', meaningEn: 'Haemoglobin carries oxygen in the blood. Yours is lower than usual, which can make you tired.', meaningTa: 'ஹீமோகுளோபின் ரத்தத்தில் ஆக்சிஜனை எடுத்துச் செல்கிறது. உங்கள் அளவு குறைவாக உள்ளது, இது சோர்வை ஏற்படுத்தலாம்.' },
    { testCode: 'PLT', value: 230000, unit: '/µL', refLow: 150000, refHigh: 450000, flag: 'NORMAL', meaningEn: 'Platelet count is in the safe normal range.', meaningTa: 'ரத்த தட்டணுக்கள் இயல்பான அளவில் உள்ளன.' },
    { testCode: 'WBC', value: 5900, unit: '/µL', refLow: 4000, refHigh: 11000, flag: 'NORMAL', meaningEn: 'White blood cell count is normal.', meaningTa: 'வெள்ளை ரத்த அணுக்கள் இயல்பான அளவில் உள்ளன.' }
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  const handleValueChange = (index: number, newVal: number) => {
    setExtractedValues(prev => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        value: newVal,
        flag: newVal < (copy[index].refLow || 0) ? 'LOW' : (newVal > (copy[index].refHigh || 999999) ? 'HIGH' : 'NORMAL')
      };
      return copy;
    });
  };

  const handleConfirm = () => {
    setHasConfirmed(true);
    setIsEditing(false);
    onValuesConfirmed(extractedValues);
  };

  return (
    <div className="card citizen-view" style={{ maxWidth: '680px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ background: 'var(--primary-teal-light)', color: 'var(--primary-teal)', padding: '10px', borderRadius: '12px' }}>
          <FileText size={28} />
        </div>
        <div>
          <h2 style={{ fontSize: '20px', color: 'var(--primary-teal)', fontWeight: 800 }}>
            {language === 'ta' ? 'ரத்த பரிசோதனை அறிக்கை வாசிப்பான்' : 'Smart Lab Report Reader'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {language === 'ta' ? 'மதிப்புகளை உறுதி செய்த பின்னரே விளக்கம் அளிக்கப்படும் (Prompt 5 பாதுகாப்பு நெறிமுறை).' : 'Values must be reviewed and confirmed before explanation (Prompt 5 safety rule).'}
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <div style={{
        border: '2px dashed var(--primary-teal)',
        background: 'var(--primary-teal-light)',
        borderRadius: 'var(--radius-md)',
        padding: '24px',
        textAlign: 'center',
        marginBottom: '20px',
        cursor: 'pointer'
      }}>
        <Upload size={32} color="var(--primary-teal)" style={{ margin: '0 auto 8px' }} />
        <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--primary-teal)' }}>
          {language === 'ta' ? 'அறிக்கை புகைப்படத்தை அல்லது PDF-ஐ பதிவேற்றவும்' : 'Upload CBC or Blood Report (Photo or PDF)'}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
          JPG, PNG, or PDF up to 10 MB · Synonyms: Hb, PLT, WBC, FBS, Creatinine
        </div>
      </div>

      {/* Confirmation Table */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            {language === 'ta' ? 'பிரித்தெடுக்கப்பட்ட அளவுகள் (சரிபார்க்கவும்):' : 'Extracted Values (Review & Confirm):'}
          </span>
          <button
            onClick={() => setIsEditing(!isEditing)}
            style={{ fontSize: '12px', color: 'var(--primary-teal)', background: 'transparent', fontWeight: 700 }}
          >
            {isEditing ? 'Done Editing' : 'Edit Numbers'}
          </button>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>{language === 'ta' ? 'பரிசோதனை' : 'Test'}</th>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>{language === 'ta' ? 'அளவு' : 'Value'}</th>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>{language === 'ta' ? 'அலகு' : 'Unit'}</th>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>{language === 'ta' ? 'இயல்பு வரம்பு' : 'Ref Range'}</th>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>{language === 'ta' ? 'நிலை' : 'Flag'}</th>
              </tr>
            </thead>
            <tbody>
              {extractedValues.map((val, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--primary-teal)' }}>{val.testCode}</td>
                  <td style={{ padding: '10px 12px' }}>
                    {isEditing ? (
                      <input
                        type="number"
                        value={val.value}
                        step="0.1"
                        onChange={(e) => handleValueChange(idx, parseFloat(e.target.value) || 0)}
                        style={{ width: '80px', padding: '4px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                      />
                    ) : (
                      <span style={{ fontWeight: 700, fontSize: '15px' }}>{val.value}</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{val.unit}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{val.refLow} - {val.refHigh}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: val.flag === 'LOW' ? '#FEF3C7' : (val.flag === 'CRITICAL' ? '#FEE2E2' : '#DCFCE7'),
                      color: val.flag === 'LOW' ? '#B45309' : (val.flag === 'CRITICAL' ? '#DC2626' : '#15803D')
                    }}>
                      {val.flag}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Action */}
      {!hasConfirmed ? (
        <button
          onClick={handleConfirm}
          className="btn-primary btn-large"
          style={{ width: '100%', marginTop: '20px' }}
        >
          <Check size={18} />
          <span>{language === 'ta' ? 'அளவுகளை உறுதி செய்க & விளக்கத்தைப் பெறுக' : 'Confirm Values & View Safe Explanation'}</span>
        </button>
      ) : (
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Explanation Cards per biomarker */}
          {extractedValues.map((v, i) => (
            <div key={i} style={{ padding: '12px 14px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>
                {v.testCode} ({v.value} {v.unit}):
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {language === 'ta' ? v.meaningTa : v.meaningEn}
              </div>
            </div>
          ))}

          {/* 3 Questions for Doctor */}
          <div style={{ background: '#EFF6FF', padding: '16px', borderRadius: '12px', border: '1px solid #93C5FD' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1E40AF', fontWeight: 800, fontSize: '14px', marginBottom: '8px' }}>
              <HelpCircle size={18} />
              <span>{language === 'ta' ? 'மருத்துவரிடம் கேட்க வேண்டிய 3 கேள்விகள்:' : '3 Questions to Ask Your Doctor:'}</span>
            </div>
            <ul style={{ paddingLeft: '20px', fontSize: '13px', color: '#1E3A8A', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>What is causing my low haemoglobin, and would iron supplements or dietary changes help?</li>
              <li>Do I need repeat platelet testing or hospital observation if I develop fever?</li>
              <li>When should I repeat this complete blood count test for monitoring?</li>
            </ul>
          </div>

          {/* Jump to Timeline button */}
          <button
            onClick={onOpenTimeline}
            className="btn-outline btn-large"
            style={{ width: '100%' }}
          >
            <span>{language === 'ta' ? 'வரலாற்றுப் பதிவு மற்றும் வரைபடத்தைக் காண்க' : 'View Longitudinal Trend Chart (Timeline)'}</span>
            <ArrowRight size={18} />
          </button>

        </div>
      )}

    </div>
  );
};
