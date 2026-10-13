export type UrgencyLevel = 'SELF_CARE' | 'PHC_VISIT' | 'URGENT' | 'EMERGENCY' | 'CRISIS';

export type UserRole = 'CITIZEN' | 'ASHA' | 'MO' | 'DHO' | 'CLIN' | 'ADMIN' | 'AUDITOR';

export interface CareOption {
  name: string;
  type: string;
  distanceKm?: number;
  phone: string;
  actionText: string;
}

export interface DangerQuestion {
  id: string;
  questionEn: string;
  questionTa: string;
  group: string;
}

export interface StructuredRecord {
  ageBand: string;
  sex: string;
  pregnant: boolean;
  childUnder5: boolean;
  conditions: string[];
  durationDays: number;
  symptoms: string[];
  dangerAnswers: Record<string, boolean | string>;
  vitals?: Record<string, any>;
  lab?: Array<{ test: string; value: number; unit: string }>;
  minimisingPhrases?: string[];
  context?: Record<string, any>;
  hbDropAmount?: number;
}

export interface CheckParseResult {
  cleanedText: string;
  extractedSymptoms: string[];
  durationDays: number;
  minimisingPhrasesFound: string[];
  readBackSentenceEn: string;
  readBackSentenceTa: string;
  dangerQuestions: DangerQuestion[];
  structuredRecord: StructuredRecord;
}

export interface CheckResult {
  checkId: string;
  cardCode: string;
  finalLevel: UrgencyLevel;
  ruleLevel: string;
  modelLevel: string;
  reason: string;
  ruleHits: any[];
  modelTopFactors: string[];
  nextStep: string;
  nextStepTa: string;
  careOptions: CareOption[];
  explanation: string;
  explanationTa: string;
  doctorQuestions: string[];
  rulesVersion: string;
  modelVersion: string;
  minimisingWarning?: string;
}

export interface LabValue {
  testCode: string;
  value: number;
  unit: string;
  refLow?: number;
  refHigh?: number;
  flag: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  meaningEn?: string;
  meaningTa?: string;
}

export interface DoctorCard {
  cardCode: string;
  createdAt: string;
  channel: string;
  language: string;
  ageBand: string;
  sex: string;
  pregnant: boolean;
  childUnder5: boolean;
  conditions: string[];
  symptoms: string[];
  durationDays: number;
  dangerAnswers: Record<string, any>;
  reportValues: LabValue[];
  urgency: UrgencyLevel;
  urgencyReason: string;
  rulesVersion: string;
  modelVersion: string;
  qrUrl: string;
  pdfUrl: string;
  disclaimer: string;
}

export interface ZoneData {
  id: string;
  name: string;
  block: string;
  population: number;
  vulnerabilityScore: number;
  infrastructureGap: number;
  staffingShortage: number;
  medicineStockPct: number;
  ambulanceCoveragePct: number;
  maternalHighRiskCount: number;
  childMalnutritionPct: number;
  phcId?: string;
}

export interface InterventionItem {
  id: string;
  title: string;
  category: string;
  targetBlock: string;
  priorityRank: number;
  description: string;
  rationale: string;
}

export interface PulseAlert {
  id: string;
  phcId: string;
  phcName: string;
  syndrome: string;
  weekStart: string;
  ewma: number;
  ucl: number;
  baselineMean: number;
  baselineSd: number;
  status: string;
  acknowledgedBy?: string;
  note?: string;
}

export interface SyndromeCount {
  weekStart: string;
  count: string;
  rawCount: number;
  ewma: number;
  ucl: number;
}

export interface PulseDetail {
  phcId: string;
  phcName: string;
  syndrome: string;
  history: SyndromeCount[];
  activeAlert?: PulseAlert;
  baselineMean: number;
  baselineSd: number;
  currentUcl: number;
  currentEwma: number;
}

export interface AuditLogEntry {
  id: number;
  ts: string;
  actor: string;
  role: string;
  action: string;
  detail: string;
  prevHash: string;
  hash: string;
}

export interface PHCItem {
  id: string;
  name: string;
  block: string;
  district: string;
  lat: number;
  lng: number;
  phone: string;
  isAam: boolean;
  zoneId?: string;
}
