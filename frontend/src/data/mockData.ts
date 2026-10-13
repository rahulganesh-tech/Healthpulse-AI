import {
  DoctorCard, ZoneData, PHCItem, PulseDetail, AuditLogEntry
} from '../types';

export const MOCK_PHCS: PHCItem[] = [
  { id: 'PHC-01', name: 'Manur PHC (demo)', block: 'Manur', district: 'Tirunelveli', lat: 8.8150, lng: 77.6850, phone: '+91-462-248101', isAam: true, zoneId: 'ZONE-01' },
  { id: 'PHC-02', name: 'Nanguneri PHC (demo)', block: 'Nanguneri', district: 'Tirunelveli', lat: 8.4890, lng: 77.6620, phone: '+91-4635-250102', isAam: true, zoneId: 'ZONE-02' },
  { id: 'PHC-03', name: 'Radhapuram PHC (demo)', block: 'Radhapuram', district: 'Tirunelveli', lat: 8.2710, lng: 77.6890, phone: '+91-4637-234103', isAam: true, zoneId: 'ZONE-03' },
  { id: 'PHC-04', name: 'Cheranmahadevi PHC (demo)', block: 'Cheranmahadevi', district: 'Tirunelveli', lat: 8.6820, lng: 77.5620, phone: '+91-4634-260104', isAam: false, zoneId: 'ZONE-04' },
  { id: 'PHC-05', name: 'Ambasamudram PHC (demo)', block: 'Ambasamudram', district: 'Tirunelveli', lat: 8.7080, lng: 77.4560, phone: '+91-4634-250105', isAam: true, zoneId: 'ZONE-05' },
  { id: 'PHC-06', name: 'Kadayam PHC (demo)', block: 'Kadayam', district: 'Tirunelveli', lat: 8.8180, lng: 77.3820, phone: '+91-4634-240106', isAam: false, zoneId: 'ZONE-06' },
  { id: 'PHC-07', name: 'Kalakkad PHC (demo)', block: 'Kalakkad', district: 'Tirunelveli', lat: 8.5140, lng: 77.5510, phone: '+91-4635-260107', isAam: true, zoneId: 'ZONE-07' },
  { id: 'PHC-08', name: 'Valliyoor PHC (demo)', block: 'Valliyoor', district: 'Tirunelveli', lat: 8.3790, lng: 77.6180, phone: '+91-4637-220108', isAam: true, zoneId: 'ZONE-08' },
  { id: 'PHC-09', name: 'Palayamkottai Rural PHC (demo)', block: 'Palayamkottai', district: 'Tirunelveli', lat: 8.7130, lng: 77.7340, phone: '+91-462-257109', isAam: false, zoneId: 'ZONE-09' },
  { id: 'PHC-10', name: 'Alangulam PHC (demo)', block: 'Alangulam', district: 'Tirunelveli', lat: 8.8710, lng: 77.5020, phone: '+91-4633-270110', isAam: true, zoneId: 'ZONE-10' },
];

export const MOCK_ZONES: ZoneData[] = [
  { id: 'ZONE-01', name: 'Manur Health Zone', block: 'Manur', population: 64000, vulnerabilityScore: 78.5, infrastructureGap: 42.0, staffingShortage: 38.0, medicineStockPct: 30.0, ambulanceCoveragePct: 45.0, maternalHighRiskCount: 18, childMalnutritionPct: 18.5, phcId: 'PHC-01' },
  { id: 'ZONE-02', name: 'Nanguneri Health Zone', block: 'Nanguneri', population: 58000, vulnerabilityScore: 77.3, infrastructureGap: 39.0, staffingShortage: 35.0, medicineStockPct: 42.0, ambulanceCoveragePct: 48.0, maternalHighRiskCount: 16, childMalnutritionPct: 16.8, phcId: 'PHC-02' },
  { id: 'ZONE-03', name: 'Radhapuram Health Zone', block: 'Radhapuram', population: 71000, vulnerabilityScore: 68.2, infrastructureGap: 32.0, staffingShortage: 28.0, medicineStockPct: 52.0, ambulanceCoveragePct: 55.0, maternalHighRiskCount: 12, childMalnutritionPct: 14.2, phcId: 'PHC-03' },
  { id: 'ZONE-04', name: 'Cheranmahadevi Health Zone', block: 'Cheranmahadevi', population: 49000, vulnerabilityScore: 64.0, infrastructureGap: 29.0, staffingShortage: 25.0, medicineStockPct: 58.0, ambulanceCoveragePct: 58.0, maternalHighRiskCount: 10, childMalnutritionPct: 13.5, phcId: 'PHC-04' },
  { id: 'ZONE-05', name: 'Ambasamudram Health Zone', block: 'Ambasamudram', population: 56000, vulnerabilityScore: 54.5, infrastructureGap: 24.0, staffingShortage: 20.0, medicineStockPct: 70.0, ambulanceCoveragePct: 68.0, maternalHighRiskCount: 8, childMalnutritionPct: 11.2, phcId: 'PHC-05' },
  { id: 'ZONE-06', name: 'Kadayam Health Zone', block: 'Kadayam', population: 47000, vulnerabilityScore: 51.0, infrastructureGap: 22.0, staffingShortage: 18.0, medicineStockPct: 72.0, ambulanceCoveragePct: 70.0, maternalHighRiskCount: 7, childMalnutritionPct: 10.5, phcId: 'PHC-06' },
  { id: 'ZONE-07', name: 'Kalakkad Health Zone', block: 'Kalakkad', population: 53000, vulnerabilityScore: 48.2, infrastructureGap: 20.0, staffingShortage: 16.0, medicineStockPct: 74.0, ambulanceCoveragePct: 72.0, maternalHighRiskCount: 6, childMalnutritionPct: 9.8, phcId: 'PHC-07' },
  { id: 'ZONE-08', name: 'Valliyoor Health Zone', block: 'Valliyoor', population: 62000, vulnerabilityScore: 41.5, infrastructureGap: 16.0, staffingShortage: 12.0, medicineStockPct: 82.0, ambulanceCoveragePct: 78.0, maternalHighRiskCount: 4, childMalnutritionPct: 8.0, phcId: 'PHC-08' },
  { id: 'ZONE-09', name: 'Palayamkottai Rural Zone', block: 'Palayamkottai', population: 82000, vulnerabilityScore: 38.0, infrastructureGap: 14.0, staffingShortage: 10.0, medicineStockPct: 86.0, ambulanceCoveragePct: 82.0, maternalHighRiskCount: 3, childMalnutritionPct: 7.2, phcId: 'PHC-09' },
  { id: 'ZONE-10', name: 'Alangulam Health Zone', block: 'Alangulam', population: 55000, vulnerabilityScore: 34.5, infrastructureGap: 12.0, staffingShortage: 8.0, medicineStockPct: 88.0, ambulanceCoveragePct: 85.0, maternalHighRiskCount: 2, childMalnutritionPct: 6.5, phcId: 'PHC-10' },
];

export const MOCK_DEMO_PERSONAS: Record<string, DoctorCard> = {
  MUR58M: {
    cardCode: 'MUR58M',
    createdAt: '2026-10-13T10:00:00Z',
    channel: 'web',
    language: 'ta',
    ageBand: '40-59',
    sex: 'M',
    pregnant: false,
    childUnder5: false,
    conditions: ['hypertension'],
    symptoms: ['chest_pain', 'sweating'],
    durationDays: 1,
    dangerAnswers: { sweating: true },
    reportValues: [],
    urgency: 'EMERGENCY',
    urgencyReason: 'Safety rule RF-CHEST-01 fired: Chest pain with heavy sweating at age 58 is a suspected acute coronary emergency. Minimising phrase "gas dhaan" detected and safely ignored.',
    rulesVersion: '0.3-draft',
    modelVersion: 'triage-0.1',
    qrUrl: '/card/MUR58M',
    pdfUrl: '/api/cards/MUR58M?format=pdf',
    disclaimer: 'Patient-reported information. Not a diagnosis.'
  },
  SEL24F: {
    cardCode: 'SEL24F',
    createdAt: '2026-10-13T10:15:00Z',
    channel: 'web',
    language: 'ta',
    ageBand: '18-39',
    sex: 'F',
    pregnant: true,
    childUnder5: false,
    conditions: [],
    symptoms: ['severe_headache', 'blurred_vision'],
    durationDays: 1,
    dangerAnswers: { severe_headache_blurred_vision: true },
    reportValues: [],
    urgency: 'EMERGENCY',
    urgencyReason: 'Safety rule RF-PREG-07 fired: Severe headache accompanied by blurred vision in 7th month pregnancy indicates severe pre-eclampsia.',
    rulesVersion: '0.3-draft',
    modelVersion: 'triage-0.1',
    qrUrl: '/card/SEL24F',
    pdfUrl: '/api/cards/SEL24F?format=pdf',
    disclaimer: 'Patient-reported information. Not a diagnosis.'
  },
  KAV03F: {
    cardCode: 'KAV03F',
    createdAt: '2026-10-13T10:30:00Z',
    channel: 'asha',
    language: 'ta',
    ageBand: '0-4',
    sex: 'F',
    pregnant: false,
    childUnder5: true,
    conditions: [],
    symptoms: ['loose_motions', 'vomiting'],
    durationDays: 1,
    dangerAnswers: { cannot_drink: true, hard_to_wake: true },
    reportValues: [],
    urgency: 'EMERGENCY',
    urgencyReason: 'Safety rule RF-CHILD-08 fired: Child under 5 with acute dehydration, unable to drink fluids, and abnormally lethargic.',
    rulesVersion: '0.3-draft',
    modelVersion: 'triage-0.1',
    qrUrl: '/card/KAV03F',
    pdfUrl: '/api/cards/KAV03F?format=pdf',
    disclaimer: 'Patient-reported information. Not a diagnosis.'
  },
  KAR19M: {
    cardCode: 'KAR19M',
    createdAt: '2026-10-13T10:45:00Z',
    channel: 'web',
    language: 'ta',
    ageBand: '18-39',
    sex: 'M',
    pregnant: false,
    childUnder5: false,
    conditions: [],
    symptoms: ['fever', 'body_pain', 'headache'],
    durationDays: 3,
    dangerAnswers: {},
    reportValues: [],
    urgency: 'PHC_VISIT',
    urgencyReason: 'Calibrated triage model decision: Fever for 3 days in monsoon season with moderate myalgia. No danger signs present. Visit PHC in 24–48 hours for platelet screening.',
    rulesVersion: '0.3-draft',
    modelVersion: 'triage-0.1',
    qrUrl: '/card/KAR19M',
    pdfUrl: '/api/cards/KAR19M?format=pdf',
    disclaimer: 'Patient-reported information. Not a diagnosis.'
  },
  LAK45F: {
    cardCode: 'LAK45F',
    createdAt: '2026-10-13T11:00:00Z',
    channel: 'web',
    language: 'ta',
    ageBand: '40-59',
    sex: 'F',
    pregnant: false,
    childUnder5: false,
    conditions: [],
    symptoms: ['tiredness', 'body_pain'],
    durationDays: 7,
    dangerAnswers: {},
    reportValues: [
      { testCode: 'HB', value: 8.9, unit: 'g/dL', refLow: 12.0, refHigh: 16.0, flag: 'LOW', meaningEn: 'Haemoglobin is 8.9 g/dL (moderately low) and has fallen by 2.3 g/dL across 6 months.' },
      { testCode: 'PLT', value: 230000, unit: '/µL', refLow: 150000, refHigh: 450000, flag: 'NORMAL' },
      { testCode: 'WBC', value: 5900, unit: '/µL', refLow: 4000, refHigh: 11000, flag: 'NORMAL' }
    ],
    urgency: 'PHC_VISIT',
    urgencyReason: 'Lab rules LAB-HB-01 and LAB-HB-02 fired: Moderate anaemia (Hb 8.9 g/dL) with rapid decline of 2.3 g/dL within 6 months.',
    rulesVersion: '0.3-draft',
    modelVersion: 'triage-0.1',
    qrUrl: '/card/LAK45F',
    pdfUrl: '/api/cards/LAK45F?format=pdf',
    disclaimer: 'Patient-reported information. Not a diagnosis.'
  }
};

// 52 Weeks Nanguneri FEVER counts exactly matching Prompt 8
const NANGUNERI_FEVER_COUNTS = [
  24, 14, 18, 22, 19, 21, 25, 24, 24, 19, 15, 18, 20, 14, 16, 19, 23, 18, 22, 16, 24, 23, 19, 14, 22, 21,
  22, 21, 16, 25, 15, 28, 40, 52, 69, 82, 84, 106, 117, 113, 115, 137, 129, 118, 118, 113, 108, 128, 117, 122, 101, 114
];

export function getMockPulseData(): PulseDetail {
  const history = NANGUNERI_FEVER_COUNTS.map((c, i) => {
    // EWMA formula with lambda = 0.3, z0 = 19.8
    let z = 19.8;
    for (let j = 0; j <= i; j++) {
      z = 0.3 * NANGUNERI_FEVER_COUNTS[j] + 0.7 * z;
    }
    return {
      weekStart: `2026-W${(i + 1).toString().padStart(2, '0')}`,
      count: c >= 10 ? c.toString() : '<10',
      rawCount: c,
      ewma: Number(z.toFixed(1)),
      ucl: 24.1
    };
  });

  return {
    phcId: 'PHC-02',
    phcName: 'Nanguneri PHC (demo)',
    syndrome: 'FEVER',
    history,
    baselineMean: 19.8,
    baselineSd: 3.5,
    currentUcl: 24.1,
    currentEwma: history[history.length - 1].ewma,
    activeAlert: {
      id: 'ALT-PHC-02-FEVER-2026-W33',
      phcId: 'PHC-02',
      phcName: 'Nanguneri PHC (demo)',
      syndrome: 'FEVER',
      weekStart: '2026-W33',
      ewma: 27.3,
      ucl: 24.1,
      baselineMean: 19.8,
      baselineSd: 3.5,
      status: 'Open',
      note: 'EWMA threshold breached in week 33 (EWMA 27.3 > UCL 24.1). Alert fired 1 week before 2x-baseline rule.'
    }
  };
}

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  { id: 1, ts: '2026-10-13T05:07:18Z', actor: 'System Admin', role: 'ADMIN', action: 'Demo Data Loaded', detail: 'Filled database with synthetic demo data for 10 Tirunelveli PHCs, 5 personas, and 52-week surveillance.', prevHash: '0000000000000000000000000000000000000000000000000000000000000000', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
  { id: 2, ts: '2026-10-13T06:07:18Z', actor: 'Dr. R. Rajendran', role: 'CLIN', action: 'Rules v0.3-draft Approved', detail: 'Reviewed and approved red_flags.yaml (v0.3-draft, SHA-256).', prevHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4' },
  { id: 3, ts: '2026-10-13T07:07:18Z', actor: 'System Admin', role: 'ADMIN', action: 'Model triage-0.1 Registered', detail: 'Registered calibrated triage model triage-0.1 with 0% emergency under-triage on 60 vignettes.', prevHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4', hash: '6ca13d52ca70c883e0f0bb101e425a89e8624de51db2d2392593af6a84118090' },
  { id: 4, ts: '2026-10-13T08:07:18Z', actor: 'Surveillance Engine', role: 'SYSTEM', action: 'Pulse Alert Raised: Nanguneri FEVER week 33', detail: 'EWMA statistic reached 27.3, crossing UCL of 24.1 for Nanguneri PHC FEVER syndrome.', prevHash: '6ca13d52ca70c883e0f0bb101e425a89e8624de51db2d2392593af6a84118090', hash: 'd9b734638a1639d671f28b4931a7f017cfab9957367cd279c565ad0b9049be8a' },
  { id: 5, ts: '2026-10-13T09:07:18Z', actor: 'Dr. S. Sundaram', role: 'MO', action: 'Doctor Card Viewed by MO Nanguneri', detail: 'Medical Officer scanned and reviewed Doctor Handoff Card KAR19M (Karthik) at Nanguneri PHC.', prevHash: 'd9b734638a1639d671f28b4931a7f017cfab9957367cd279c565ad0b9049be8a', hash: '2c5a019e078c18ec5bf90d7966774f19b2512f46d3be927d6d539ecb001a4239' },
];
