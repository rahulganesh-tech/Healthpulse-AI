import React, { useState, useEffect } from 'react';
import { Mic, MicOff, AlertTriangle, ArrowRight, Check, Volume2, ShieldAlert } from 'lucide-react';
import { ApiClient } from '../services/api';
import { CheckParseResult, CheckResult, StructuredRecord, DangerQuestion } from '../types';

interface SymptomCheckerProps {
  language: 'ta' | 'en';
  onCheckComplete: (result: CheckResult) => void;
  initialText?: string;
  isAshaMode?: boolean;
}

export const SymptomChecker: React.FC<SymptomCheckerProps> = ({
  language,
  onCheckComplete,
  initialText = '',
  isAshaMode = false
}) => {
  const [step, setStep] = useState<'INPUT' | 'CONFIRM' | 'DANGER'>('INPUT');
  const [inputText, setInputText] = useState(initialText);
  const [isListening, setIsListening] = useState(false);
  const [ageBand, setAgeBand] = useState('18-39');
  const [sex, setSex] = useState('M');
  const [pregnant, setPregnant] = useState(false);
  const [childUnder5, setChildUnder5] = useState(false);
  const [loading, setLoading] = useState(false);

  // Parsing result
  const [parseResult, setParseResult] = useState<CheckParseResult | null>(null);
  const [dangerAnswers, setDangerAnswers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialText) {
      setInputText(initialText);
    }
  }, [initialText]);

  // Web Speech API
  const handleToggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert(language === 'ta' ? 'உங்கள் உலாவியில் குரல் உள்ளீடு ஆதரிக்கப்படவில்லை. தயவுசெய்து தட்டச்சு செய்யவும்.' : 'Speech Recognition is not supported on this browser. Please type.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      setInputText(transcript);
    };

    recognition.start();
  };

  const handleParse = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const res = await ApiClient.parseSymptoms(
        inputText,
        language,
        ageBand,
        sex,
        pregnant,
        childUnder5 || ageBand === '0-4'
      );
      setParseResult(res);
      setStep('CONFIRM');

      // Speech synthesis read-back
      if ('speechSynthesis' in window) {
        const sentence = language === 'ta' ? res.readBackSentenceTa : res.readBackSentenceEn;
        const utter = new SpeechSynthesisUtterance(sentence);
        utter.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
        window.speechSynthesis.speak(utter);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAndProceed = () => {
    setStep('DANGER');
  };

  const handleDangerAnswer = (qId: string, answer: boolean) => {
    setDangerAnswers(prev => ({ ...prev, [qId]: answer }));
  };

  const handleFinalSubmit = async () => {
    if (!parseResult) return;
    setLoading(true);

    const record: StructuredRecord = {
      ...parseResult.structuredRecord,
      ageBand,
      sex,
      pregnant,
      childUnder5: childUnder5 || ageBand === '0-4',
      dangerAnswers
    };

    try {
      const res = await ApiClient.createCheck(record, language);
      onCheckComplete(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card citizen-view" style={{ maxWidth: '640px', margin: '0 auto', border: '1.5px solid var(--border-color)' }}>
      
      {/* STEP 1: SYMPTOM INPUT */}
      {step === 'INPUT' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <h2 style={{ fontSize: '22px', color: 'var(--primary-teal)', marginBottom: '4px' }}>
              {language === 'ta' ? 'உங்கள் அறிகுறிகளைக் கூறுங்கள்' : 'Tell Us Your Symptoms'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              {language === 'ta' ? 'தமிழில் பேசலாம் அல்லது தட்டச்சு செய்யலாம். ஆபத்து அறிகுறிகள் பரிசோதிக்கப்படும்.' : 'Speak in Tamil or type in English. Life-threatening signs are checked first.'}
            </p>
          </div>

          {/* Demographics Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#F8FAFC', padding: '12px', borderRadius: '10px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
                {language === 'ta' ? 'வயது வரம்பு' : 'Age Band'}
              </label>
              <select
                value={ageBand}
                onChange={(e) => {
                  setAgeBand(e.target.value);
                  if (e.target.value === '0-4') setChildUnder5(true);
                }}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', marginTop: '4px', background: '#FFF' }}
              >
                <option value="0-4">0–4 ({language === 'ta' ? 'குழந்தை' : 'Child under 5'})</option>
                <option value="5-17">5–17 ({language === 'ta' ? 'சிறுவர்' : 'Youth'})</option>
                <option value="18-39">18–39 ({language === 'ta' ? 'இளைஞர்' : 'Adult'})</option>
                <option value="40-59">40–59 ({language === 'ta' ? 'நடுத்தர வயது' : 'Middle Aged'})</option>
                <option value="60+">60+ ({language === 'ta' ? 'முதியவர்' : 'Senior'})</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
                {language === 'ta' ? 'பாலினம்' : 'Sex'}
              </label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', marginTop: '4px', background: '#FFF' }}
              >
                <option value="M">{language === 'ta' ? 'ஆண் (Male)' : 'Male'}</option>
                <option value="F">{language === 'ta' ? 'பெண் (Female)' : 'Female'}</option>
              </select>
            </div>
          </div>

          {/* Pregnancy Checkbox */}
          {sex === 'F' && ageBand !== '0-4' && ageBand !== '60+' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={pregnant}
                onChange={(e) => setPregnant(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary-teal)' }}
              />
              <span style={{ fontWeight: 600 }}>
                {language === 'ta' ? 'தற்போது கர்ப்பமாக உள்ளீர்களா? (Pregnant)' : 'Currently Pregnant?'}
              </span>
            </label>
          )}

          {/* Voice Microphone Centerpiece */}
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <button
              onClick={handleToggleVoice}
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                background: isListening ? '#EF4444' : 'var(--primary-teal)',
                color: '#FFFFFF',
                boxShadow: isListening ? '0 0 0 10px rgba(239, 68, 68, 0.25)' : '0 4px 16px rgba(15, 110, 110, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
            >
              {isListening ? <MicOff size={36} /> : <Mic size={36} />}
            </button>
            <div style={{ marginTop: '10px', fontWeight: 600, color: isListening ? '#DC2626' : 'var(--primary-teal)' }}>
              {isListening 
                ? (language === 'ta' ? 'கேட்கிறது... தமிழில் பேசவும்' : 'Listening... Speak symptoms')
                : (language === 'ta' ? 'தமிழில் பேச தொடவும்' : 'Tap to Speak')}
            </div>
          </div>

          {/* Text Area */}
          <div>
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={language === 'ta' ? 'அல்லது இங்கே எழுதவும்: எ.கா: 3 நாளா காய்ச்சல், நெஞ்சு வலி, உடம்பு வலி...' : 'Or type symptoms: e.g. fever for 3 days, chest pain, body ache...'}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-color)',
                fontSize: '15px',
                fontFamily: 'inherit',
                outline: 'none'
              }}
            />
          </div>

          <button
            onClick={handleParse}
            disabled={!inputText.trim() || loading}
            className="btn-primary btn-large"
            style={{ width: '100%', opacity: !inputText.trim() ? 0.6 : 1 }}
          >
            <span>{language === 'ta' ? 'சரிபார்த்து தொடர்க' : 'Evaluate Symptoms'}</span>
            <ArrowRight size={18} />
          </button>

        </div>
      )}

      {/* STEP 2: READ-BACK & ANTI-MINIMISATION CONFIRMATION */}
      {step === 'CONFIRM' && parseResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <h2 style={{ fontSize: '20px', color: 'var(--primary-teal)' }}>
            {language === 'ta' ? 'நாங்கள் புரிந்துகொண்டது சரிதானா?' : 'Did We Understand Correctly?'}
          </h2>

          {/* Anti-Minimisation Banner if triggered */}
          {parseResult.minimisingPhrasesFound.length > 0 && (
            <div style={{
              background: '#FFFBEB',
              border: '2px solid #F59E0B',
              borderRadius: '10px',
              padding: '14px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start'
            }}>
              <ShieldAlert size={24} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 800, color: '#92400E', fontSize: '14px' }}>
                  {language === 'ta' ? 'எச்சரிக்கை: அறிகுறி குறைத்து மதிப்பிடப்பட்டது' : 'Safety Alert: Anti-Minimisation Guard'}
                </div>
                <div style={{ fontSize: '13px', color: '#B45309', marginTop: '4px' }}>
                  {language === 'ta'
                    ? `நாங்கள் '${parseResult.minimisingPhrasesFound.join(', ')}' என்ற வார்த்தையைக் கவனித்தோம். மாரடைப்பு போன்ற அவசரநிலைகளை இது மறைக்கக்கூடும் என்பதால், அவசரநிலையைக் குறைக்க இந்த வார்த்தை பயன்படுத்தப்படவில்லை.`
                    : `We noticed '${parseResult.minimisingPhrasesFound.join(', ')}'. We did not use this to lower the urgency. Potential cardiac or stroke danger signs are strictly preserved.`}
                </div>
              </div>
            </div>
          )}

          {/* Read back box */}
          <div style={{ background: 'var(--primary-teal-light)', padding: '16px', borderRadius: '12px', border: '1px solid var(--primary-teal)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-teal)', fontWeight: 700, marginBottom: '6px' }}>
              <Volume2 size={18} />
              <span>{language === 'ta' ? 'நீங்கள் கூறிய விவரம்:' : 'Summary of Symptoms:'}</span>
            </div>
            <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>
              {language === 'ta' ? parseResult.readBackSentenceTa : parseResult.readBackSentenceEn}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setStep('INPUT')}
              className="btn-outline btn-large"
              style={{ flex: 1 }}
            >
              {language === 'ta' ? 'மாற்றிப் பேசு / திருத்து' : 'Change / Edit'}
            </button>
            <button
              onClick={handleConfirmAndProceed}
              className="btn-primary btn-large"
              style={{ flex: 1 }}
            >
              <Check size={18} />
              <span>{language === 'ta' ? 'ஆம், சரியானது' : 'Yes, Correct'}</span>
            </button>
          </div>

        </div>
      )}

      {/* STEP 3: DANGER SCREENING QUESTIONS */}
      {step === 'DANGER' && parseResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626', fontWeight: 800, fontSize: '13px', textTransform: 'uppercase' }}>
              <AlertTriangle size={18} />
              <span>{language === 'ta' ? 'அவசர அபாய பரிசோதனை' : 'Critical Danger Signs Screening'}</span>
            </div>
            <h2 style={{ fontSize: '19px', color: 'var(--text-main)', marginTop: '4px' }}>
              {language === 'ta' ? 'கீழே உள்ளவற்றில் ஏதேனும் உள்ளதா?' : 'Do you experience any of the following?'}
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {parseResult.dangerQuestions.map((q) => {
              const currentAns = dangerAnswers[q.id];
              return (
                <div
                  key={q.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--border-color)',
                    background: currentAns ? '#FEF2F2' : '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>
                    {language === 'ta' ? q.questionTa : q.questionEn}
                  </span>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleDangerAnswer(q.id, true)}
                      style={{
                        flex: 1,
                        minHeight: '44px',
                        borderRadius: '8px',
                        border: currentAns === true ? '2px solid #DC2626' : '1px solid var(--border-color)',
                        background: currentAns === true ? '#DC2626' : '#F8FAFC',
                        color: currentAns === true ? '#FFFFFF' : 'var(--text-main)',
                        fontWeight: 700
                      }}
                    >
                      {language === 'ta' ? 'ஆம் (Yes)' : 'Yes'}
                    </button>
                    <button
                      onClick={() => handleDangerAnswer(q.id, false)}
                      style={{
                        flex: 1,
                        minHeight: '44px',
                        borderRadius: '8px',
                        border: currentAns === false ? '2px solid var(--primary-teal)' : '1px solid var(--border-color)',
                        background: currentAns === false ? 'var(--primary-teal)' : '#F8FAFC',
                        color: currentAns === false ? '#FFFFFF' : 'var(--text-main)',
                        fontWeight: 700
                      }}
                    >
                      {language === 'ta' ? 'இல்லை (No)' : 'No'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleFinalSubmit}
            disabled={loading}
            className="btn-primary btn-large"
            style={{ width: '100%', marginTop: '8px' }}
          >
            <span>{loading ? 'Analyzing Safety...' : (language === 'ta' ? 'முடிவைப் பெறுக' : 'Get Triage Recommendation')}</span>
            <ArrowRight size={18} />
          </button>

        </div>
      )}

    </div>
  );
};
