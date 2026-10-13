import React, { useState, useEffect } from 'react';
import { 
  Heart, Mic, FileText, MapPin, Activity, ShieldCheck, 
  Phone, Users, Stethoscope, Building2, Award, Lock, 
  HelpCircle, ArrowRight, CheckCircle2, AlertTriangle, 
  ChevronRight, Sparkles, RefreshCw
} from 'lucide-react';
import { UserRole, CheckResult, DoctorCard } from './types';
import { ApiClient } from './services/api';

// Components
import { Header } from './components/Header';
import { ConsentModal } from './components/ConsentModal';
import { DemoGuideOverlay } from './components/DemoGuideOverlay';
import { SymptomChecker } from './components/SymptomChecker';
import { ResultCard } from './components/ResultCard';
import { ReportReader } from './components/ReportReader';
import { HealthTimeline } from './components/HealthTimeline';
import { NearestCareMap } from './components/NearestCareMap';
import { DoctorCardView } from './components/DoctorCardView';
import { AshaMode } from './components/AshaMode';
import { StaffLoginModal } from './components/StaffLoginModal';
import { PHCDoctorPortal } from './components/PHCDoctorPortal';
import { DistrictView } from './components/DistrictView';
import { CommunityPulseMap } from './components/CommunityPulseMap';
import { ClinicalReviewerPortal } from './components/ClinicalReviewerPortal';
import { AuditTrailView } from './components/AuditTrailView';
import { ComplianceHub } from './components/ComplianceHub';

type ActiveView = 
  | 'home' 
  | 'symptom_check' 
  | 'report_reader' 
  | 'timeline' 
  | 'nearest_care' 
  | 'doctor_card'
  | 'asha_mode' 
  | 'phc_portal' 
  | 'district_view' 
  | 'pulse_map' 
  | 'clinical_reviewer' 
  | 'audit_trail' 
  | 'compliance';

export function App() {
  const [language, setLanguage] = useState<'en' | 'ta'>('ta');
  const [currentView, setCurrentView] = useState<ActiveView>('home');
  const [currentUser, setCurrentUser] = useState<{ email: string; role: UserRole; name: string; phcId?: string } | null>(null);
  
  // Modals & Overlays
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState(true);
  
  // Active Data State
  const [ownerToken, setOwnerToken] = useState('USR-MOCK-SESSION');
  const [lastCheckResult, setLastCheckResult] = useState<CheckResult | null>(null);
  const [activeDoctorCard, setActiveDoctorCard] = useState<DoctorCard | null>(null);
  const [initialCheckPrefill, setInitialCheckPrefill] = useState<any>(null);

  // Check consent on first visit
  useEffect(() => {
    const hasConsented = localStorage.getItem('hp_consent_given');
    if (!hasConsented) {
      setIsConsentOpen(true);
    }
  }, []);

  const handleConsentAccept = (token: string) => {
    setOwnerToken(token);
    localStorage.setItem('hp_consent_given', 'true');
    setIsConsentOpen(false);
  };

  const handleLoginSuccess = (user: { email: string; role: UserRole; name: string; phcId?: string }) => {
    setCurrentUser(user);
    // Route automatically based on role
    switch (user.role) {
      case 'ASHA':
        setCurrentView('asha_mode');
        break;
      case 'MO':
        setCurrentView('phc_portal');
        break;
      case 'DHO':
        setCurrentView('district_view');
        break;
      case 'CLIN':
        setCurrentView('clinical_reviewer');
        break;
      case 'AUDITOR':
        setCurrentView('audit_trail');
        break;
      default:
        setCurrentView('compliance');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    ApiClient.setToken(null);
    setCurrentView('home');
  };

  // Demo step jumping from overlay
  const handleJumpToDemoStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        // Murugan Emergency
        setInitialCheckPrefill({
          text: 'nenju vali, romba viyarvai gas dhaan',
          ageBand: '40-59',
          sex: 'M',
        });
        setCurrentView('symptom_check');
        break;
      case 2:
        // Karthik Everyday PHC Visit
        setInitialCheckPrefill({
          text: '3 naala kaichal, udambu vali, thalai vali',
          ageBand: '18-39',
          sex: 'M',
        });
        setCurrentView('symptom_check');
        break;
      case 3:
        // Lakshmi Lab Reports
        setCurrentView('report_reader');
        break;
      case 4:
        // Doctor Card QR Scanner
        setCurrentUser({
          email: 'mo.nanguneri@healthpulse.demo',
          role: 'MO',
          name: 'Dr. Nanguneri MO',
          phcId: 'PHC-NANGUNERI',
        });
        setCurrentView('phc_portal');
        break;
      case 5:
        // Community Pulse Outbreak Alert
        setCurrentUser({
          email: 'mo.nanguneri@healthpulse.demo',
          role: 'MO',
          name: 'Dr. Nanguneri MO',
          phcId: 'PHC-NANGUNERI',
        });
        setCurrentView('phc_portal');
        break;
      case 6:
        // Trust & Compliance
        setCurrentView('compliance');
        break;
    }
  };

  const openCardByCode = async (cardCode: string) => {
    try {
      const card = await ApiClient.getDoctorCard(cardCode);
      setActiveDoctorCard(card);
      setCurrentView('doctor_card');
    } catch (err) {
      console.error('Failed to open card', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Universal Header with Navigation & 108 Emergency Trigger */}
      <Header
        language={language}
        setLanguage={setLanguage}
        activeRole={currentUser?.role || 'CITIZEN'}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onToggleDemoGuide={() => setIsDemoGuideOpen(prev => !prev)}
        onResetDemo={() => handleJumpToDemoStep(1)}
        onNavigateHome={() => setCurrentView('home')}
      />

      {/* Navigation Sub-Bar for Quick Screen Navigation */}
      <div className="bg-teal-900 text-teal-100 px-4 py-2 text-xs border-b border-teal-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-3 whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            <span className="text-teal-400 font-bold uppercase tracking-wider text-[10px]">Citizen Portal:</span>
            <button 
              onClick={() => setCurrentView('home')} 
              className={`px-2.5 py-1 rounded hover:bg-teal-800 ${currentView === 'home' ? 'bg-teal-800 font-bold text-white' : ''}`}
            >
              Home
            </button>
            <button 
              onClick={() => { setInitialCheckPrefill(null); setCurrentView('symptom_check'); }} 
              className={`px-2.5 py-1 rounded hover:bg-teal-800 ${currentView === 'symptom_check' ? 'bg-teal-800 font-bold text-white' : ''}`}
            >
              Symptom Check
            </button>
            <button 
              onClick={() => setCurrentView('report_reader')} 
              className={`px-2.5 py-1 rounded hover:bg-teal-800 ${currentView === 'report_reader' ? 'bg-teal-800 font-bold text-white' : ''}`}
            >
              Lab Reader
            </button>
            <button 
              onClick={() => setCurrentView('timeline')} 
              className={`px-2.5 py-1 rounded hover:bg-teal-800 ${currentView === 'timeline' ? 'bg-teal-800 font-bold text-white' : ''}`}
            >
              Timeline
            </button>
            <button 
              onClick={() => setCurrentView('nearest_care')} 
              className={`px-2.5 py-1 rounded hover:bg-teal-800 ${currentView === 'nearest_care' ? 'bg-teal-800 font-bold text-white' : ''}`}
            >
              Nearest PHC
            </button>
          </div>

          <div className="flex items-center gap-1.5 border-l border-teal-800 pl-3">
            <span className="text-teal-400 font-bold uppercase tracking-wider text-[10px]">Staff Portals:</span>
            <button 
              onClick={() => setCurrentView('asha_mode')} 
              className={`px-2.5 py-1 rounded hover:bg-teal-800 ${currentView === 'asha_mode' ? 'bg-teal-800 font-bold text-white' : ''}`}
            >
              ASHA Field
            </button>
            <button 
              onClick={() => setCurrentView('phc_portal')} 
              className={`px-2.5 py-1 rounded hover:bg-teal-800 ${currentView === 'phc_portal' ? 'bg-teal-800 font-bold text-white' : ''}`}
            >
              PHC Doctor (Pulse)
            </button>
            <button 
              onClick={() => setCurrentView('district_view')} 
              className={`px-2.5 py-1 rounded hover:bg-teal-800 ${currentView === 'district_view' ? 'bg-teal-800 font-bold text-white' : ''}`}
            >
              District View
            </button>
            <button 
              onClick={() => setCurrentView('pulse_map')} 
              className={`px-2.5 py-1 rounded hover:bg-teal-800 ${currentView === 'pulse_map' ? 'bg-teal-800 font-bold text-white' : ''}`}
            >
              Syndromic Map
            </button>
            <button 
              onClick={() => setCurrentView('clinical_reviewer')} 
              className={`px-2.5 py-1 rounded hover:bg-teal-800 ${currentView === 'clinical_reviewer' ? 'bg-teal-800 font-bold text-white' : ''}`}
            >
              Clinical Reviewer
            </button>
            <button 
              onClick={() => setCurrentView('audit_trail')} 
              className={`px-2.5 py-1 rounded hover:bg-teal-800 ${currentView === 'audit_trail' ? 'bg-teal-800 font-bold text-white' : ''}`}
            >
              Audit Trail
            </button>
            <button 
              onClick={() => setCurrentView('compliance')} 
              className={`px-2.5 py-1 rounded hover:bg-teal-800 ${currentView === 'compliance' ? 'bg-teal-800 font-bold text-white' : ''}`}
            >
              Compliance Hub
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* VIEW: HOME LANDING */}
        {currentView === 'home' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Hero Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-950 text-white p-8 sm:p-12 shadow-xl border border-teal-700/50">
              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 bg-teal-700/60 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold text-teal-200 border border-teal-500/30">
                  <Sparkles size={14} className="text-emerald-300" />
                  {language === 'ta' 
                    ? 'தமிழ்நாடு கிராமப்புற சுகாதாரம் • இலவச AI வழிகாட்டி' 
                    : 'Rural Tamil Nadu • Free Safety-Engineered Health Navigator'}
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                  {language === 'ta' ? (
                    <>
                      உங்கள் உடல்நலப் பிரச்சனைகளை <br />
                      <span className="text-emerald-300">தமிழில் பேசி</span> வழிகாட்டல் பெறுங்கள்.
                    </>
                  ) : (
                    <>
                      Speak your symptoms in Tamil. <br />
                      Get <span className="text-emerald-300">safe, clinical next steps</span> in seconds.
                    </>
                  )}
                </h1>

                <p className="text-teal-100 text-sm sm:text-base leading-relaxed max-w-2xl">
                  {language === 'ta'
                    ? 'ஆபத்தான அறிகுறிகளை விதிகள் மூலம் கண்டறிந்து, இலவச ஆரம்ப சுகாதார நிலையம் (PHC), eSanjeevani அல்லது 108 அவசர ஊர்திக்கு உங்களை வழிநடத்துகிறது. மருத்துவர் 30 வினாடிகளில் புரிந்துகொள்ளும் சுருக்க அட்டை வழங்கப்படுகிறது.'
                    : 'Checks danger signs with doctor-verified rules that AI cannot override. Routes to free public care (PHC, eSanjeevani, 108) and generates a 30-second Doctor Handoff Card.'}
                </p>

                {/* Main Action Buttons */}
                <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                  <button
                    onClick={() => {
                      setInitialCheckPrefill(null);
                      setCurrentView('symptom_check');
                    }}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white text-base font-bold px-7 py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2.5 transition active:scale-95"
                  >
                    <Mic size={22} />
                    {language === 'ta' ? 'அறிகுறிகளைச் சோதிக்கவும்' : 'Check Symptoms (Voice/Text)'}
                  </button>

                  <button
                    onClick={() => setCurrentView('report_reader')}
                    className="bg-teal-700/80 hover:bg-teal-600 text-white text-base font-semibold px-6 py-4 rounded-2xl border border-teal-500/30 backdrop-blur-sm flex items-center justify-center gap-2.5 transition"
                  >
                    <FileText size={20} />
                    {language === 'ta' ? 'லேப் ரிப்போர்ட் படிக்க' : 'Read Lab Report'}
                  </button>

                  <button
                    onClick={() => setCurrentView('nearest_care')}
                    className="bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-5 py-4 rounded-2xl border border-white/10 backdrop-blur-sm flex items-center justify-center gap-2 transition"
                  >
                    <MapPin size={18} />
                    {language === 'ta' ? 'அருகிலுள்ள PHC' : 'Nearest PHC'}
                  </button>
                </div>
              </div>

              {/* Decorative Background Elements */}
              <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
              <div className="absolute right-12 top-12 opacity-15 hidden lg:block pointer-events-none">
                <Heart size={260} strokeWidth={1} />
              </div>
            </div>

            {/* Quick Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                onClick={() => {
                  setInitialCheckPrefill(null);
                  setCurrentView('symptom_check');
                }}
                className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-teal-500 hover:shadow-md transition cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                  <Mic size={24} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1 flex items-center justify-between">
                  {language === 'ta' ? 'குரல் வழி பரிசோதனை' : 'Voice-First Tamil Triage'}
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-teal-700 transition" />
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {language === 'ta'
                    ? 'தமிழிலோ தங்க்லிஷிலோ பேசலாம். "நெஞ்சு வலி", "வாயு தான்" போன்ற வார்த்தைகளை துல்லியமாகப் பிரித்து ஆபத்தை உணர்த்தும்.'
                    : 'Speak in Tamil or Tanglish. Anti-minimisation guard prevents downplaying serious chest symptoms as "just gas".'}
                </p>
              </div>

              <div 
                onClick={() => setCurrentView('report_reader')}
                className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-teal-500 hover:shadow-md transition cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                  <FileText size={24} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1 flex items-center justify-between">
                  {language === 'ta' ? 'ரிப்போர்ட் விளக்கம் & காலக்கோடு' : 'Lab Report & Timeline'}
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-teal-700 transition" />
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {language === 'ta'
                    ? 'ரத்தப் பரிசோதனை ரிப்போர்ட்டை பதிவேற்றவும். இயல்பு நிலையை எளிய தமிழில் விளக்கி, மருத்துவரிடம் கேட்க 3 கேள்விகளைத் தரும்.'
                    : 'Upload CBC/sugar photos. Explains values in simple words and tracks Hb changes over time with doctor questions.'}
                </p>
              </div>

              <div 
                onClick={() => setCurrentView('nearest_care')}
                className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-teal-500 hover:shadow-md transition cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                  <MapPin size={24} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1 flex items-center justify-between">
                  {language === 'ta' ? 'இலவச அரசு சுகாதார வழிகாட்டி' : 'Free Public Care First'}
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-teal-700 transition" />
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {language === 'ta'
                    ? 'திருநெல்வேலியின் 10 PHC நிலையங்கள், தொலைபேசி எண்கள், eSanjeevani ஆன்லைன் மருத்துவர் மற்றும் 108 உடனடி உதவி.'
                    : 'Direct navigation to 10 Tirunelveli PHCs, Ayushman Arogya Mandirs, eSanjeevani teleconsultation, and 108.'}
                </p>
              </div>
            </div>

            {/* Public Health Innovation Banner */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-teal-800 text-teal-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    Public Health Signal
                  </span>
                  <h4 className="font-bold text-base">Community Pulse Early Warning System</h4>
                </div>
                <p className="text-xs text-slate-300">
                  Every anonymous symptom check feeds district EWMA syndromic surveillance, catching local infectious disease outbreaks <strong>2.41 weeks earlier</strong> than static rules.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setCurrentUser({
                      email: 'mo.nanguneri@healthpulse.demo',
                      role: 'MO',
                      name: 'Dr. Nanguneri MO',
                      phcId: 'PHC-NANGUNERI',
                    });
                    setCurrentView('phc_portal');
                  }}
                  className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow"
                >
                  <Activity size={14} /> Open PHC Surveillance
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: SYMPTOM CHECKER */}
        {currentView === 'symptom_check' && (
          <SymptomChecker
            language={language}
            initialText={initialCheckPrefill?.text || ''}
            onCheckComplete={(res: CheckResult) => {
              setLastCheckResult(res);
              setCurrentView('home');
            }}
          />
        )}

        {/* VIEW: LAB REPORT READER */}
        {currentView === 'report_reader' && (
          <ReportReader
            language={language}
            onValuesConfirmed={(values) => {
              setCurrentView('timeline');
            }}
            onOpenTimeline={() => setCurrentView('timeline')}
          />
        )}

        {/* VIEW: HEALTH TIMELINE */}
        {currentView === 'timeline' && (
          <HealthTimeline
            language={language}
            onBack={() => setCurrentView('home')}
          />
        )}

        {/* VIEW: NEAREST CARE MAP */}
        {currentView === 'nearest_care' && (
          <NearestCareMap
            language={language}
          />
        )}

        {/* VIEW: DOCTOR CARD VIEW */}
        {currentView === 'doctor_card' && activeDoctorCard && (
          <div className="space-y-4">
            <button
              onClick={() => setCurrentView('home')}
              className="text-xs font-bold text-teal-800 hover:underline flex items-center gap-1"
            >
              ← Back to Home
            </button>
            <DoctorCardView card={activeDoctorCard} language={language} onBack={() => setCurrentView('home')} />
          </div>
        )}

        {/* VIEW: ASHA WORKER MODE */}
        {currentView === 'asha_mode' && (
          <AshaMode
            language={language}
            onStartNewCheck={(prefill) => {
              setInitialCheckPrefill(prefill);
              setCurrentView('symptom_check');
            }}
            onViewDoctorCard={openCardByCode}
          />
        )}

        {/* VIEW: PHC MEDICAL OFFICER PORTAL */}
        {currentView === 'phc_portal' && (
          <PHCDoctorPortal
            language={language}
            phcId={currentUser?.phcId || 'PHC-NANGUNERI'}
            phcName="Nanguneri PHC (demo)"
          />
        )}

        {/* VIEW: DISTRICT DHO VIEW */}
        {currentView === 'district_view' && (
          <DistrictView
            language={language}
          />
        )}

        {/* VIEW: COMMUNITY PULSE MAP */}
        {currentView === 'pulse_map' && (
          <CommunityPulseMap
            language={language}
            onSelectPhcForDetail={(phcId, phcName) => {
              setCurrentUser({
                email: 'mo.nanguneri@healthpulse.demo',
                role: 'MO',
                name: 'Dr. Nanguneri MO',
                phcId,
              });
              setCurrentView('phc_portal');
            }}
          />
        )}

        {/* VIEW: CLINICAL REVIEWER PORTAL */}
        {currentView === 'clinical_reviewer' && (
          <ClinicalReviewerPortal
            language={language}
          />
        )}

        {/* VIEW: AUDIT TRAIL VIEW */}
        {currentView === 'audit_trail' && (
          <AuditTrailView
            language={language}
          />
        )}

        {/* VIEW: COMPLIANCE HUB */}
        {currentView === 'compliance' && (
          <ComplianceHub
            language={language}
            ownerToken={ownerToken}
          />
        )}

      </main>

      {/* Universal Sticky 108 Emergency Banner */}
      <footer className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-gray-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>
              {language === 'ta'
                ? 'இது மருத்துவ நோயறிதல் அல்ல. உடல்நிலை மோசமடைந்தால் உடனடியாக 108 அழைக்கவும்.'
                : 'Health information & navigation only. Not a diagnosis. If condition worsens, call 108.'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:108"
              className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-md transition active:scale-95"
            >
              <Phone size={14} />
              {language === 'ta' ? 'அவசரம்: 108 அழைக்கவும்' : 'Emergency: Call 108'}
            </a>
            <a
              href="tel:14416"
              className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm transition"
            >
              Tele-MANAS: 14416
            </a>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <ConsentModal
        isOpen={isConsentOpen}
        language={language}
        onConsentGiven={(saveTimeline: boolean) => handleConsentAccept('USR-LOCAL-CONSENT')}
        onClose={() => setIsConsentOpen(false)}
      />

      <StaffLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* 4-Minute Demo Walkthrough Overlay */}
      <DemoGuideOverlay
        isOpen={isDemoGuideOpen}
        onClose={() => setIsDemoGuideOpen(false)}
        onLoadPersona={(personaKey) => {
          if (personaKey === 'MUR58M') handleJumpToDemoStep(1);
          else if (personaKey === 'KAR19M') handleJumpToDemoStep(2);
          else if (personaKey === 'LAK45F') handleJumpToDemoStep(3);
          else openCardByCode(personaKey);
        }}
        onSwitchRole={(role) => {
          if (role === 'CITIZEN') setCurrentView('home');
          else if (role === 'ASHA') setCurrentView('asha_mode');
          else if (role === 'MO') setCurrentView('phc_portal');
          else if (role === 'DHO') setCurrentView('district_view');
          else if (role === 'CLIN') setCurrentView('clinical_reviewer');
          else if (role === 'AUDITOR') setCurrentView('audit_trail');
        }}
        onResetDemo={() => handleJumpToDemoStep(1)}
        onSelectTab={(tab) => {
          if (tab === 'symptom') setCurrentView('symptom_check');
          else if (tab === 'report') setCurrentView('report_reader');
          else if (tab === 'timeline') setCurrentView('timeline');
          else if (tab === 'pulse') setCurrentView('pulse_map');
          else if (tab === 'district') setCurrentView('district_view');
        }}
      />
    </div>
  );
}

export default App;
