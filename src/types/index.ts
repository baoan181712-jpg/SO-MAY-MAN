export type GenderOption = 'unspecified' | 'male' | 'female' | 'other';

export type CustomerGoalId =
  | 'wealth_accumulation'
  | 'business_growth'
  | 'career_status'
  | 'family_peace'
  | 'unique_memorable';

export type NumberStyleId =
  | 'wealth_growth'
  | 'business_prosperity'
  | 'career_leadership'
  | 'peace_stability'
  | 'family_harmony'
  | 'unique_personalized'
  | 'easy_memorable';

export type YRuleMode = 'contextual' | 'always-vowel' | 'always-consonant';

export interface CustomerProfile {
  fullName: string;
  birthDate: string; // YYYY-MM-DD
  gender: GenderOption;
  selfDescribedPersonality: string;
  goals: CustomerGoalId[];
  notes: string;
}

export interface NumerologySettings {
  keepMasterNumbers: boolean;
  yRule: YRuleMode;
}

export interface LetterBreakdown {
  originalChar: string;
  normalizedChar: string;
  value: number;
  role: 'vowel' | 'consonant' | 'ignored';
  yReason?: string;
}

export interface WordBreakdown {
  word: string;
  letters: LetterBreakdown[];
  total: number;
  vowelsTotal: number;
  consonantsTotal: number;
}

export interface NumerologyIndexResult {
  key: 'lifePath' | 'birthday' | 'attitude' | 'expression' | 'soulUrge' | 'personality';
  label: string;
  englishLabel: string;
  value: number;
  isMaster: boolean;
  formulaDescription: string;
  steps: string[];
  meaningTitle: string;
  meaningSummary: string;
  strengths: string[];
  accountNumberHint: string;
}

export interface NumerologyReport {
  normalizedFullName: string;
  formattedBirthDate: string;
  settings: NumerologySettings;
  wordBreakdowns: WordBreakdown[];
  indices: {
    lifePath: NumerologyIndexResult;
    birthday: NumerologyIndexResult;
    attitude: NumerologyIndexResult;
    expression: NumerologyIndexResult;
    soulUrge: NumerologyIndexResult;
    personality: NumerologyIndexResult;
  };
  highlights: string[];
  comparisons: string[];
  recommendedDigits: number[];
  recommendedDigitReasons: { digit: number; reason: string }[];
  limitations: string[];
}

export interface EasternDigitInfo {
  digit: number;
  vietnameseWord: string;
  sinoVietnamese: string;
  folkReading: string;
  meaning: string;
  yinYang: 'Âm' | 'Dương';
  elementHaDo: 'Thủy' | 'Hỏa' | 'Mộc' | 'Kim' | 'Thổ';
}

export interface RecognizedPattern {
  pattern: string;
  positionIndex: number;
  reading: string;
  meaning: string;
  category: 'conventional' | 'structural';
  isPopular: boolean;
}

export interface EasternAnalysis {
  digits: EasternDigitInfo[];
  pairBreakdown: {
    pair: string;
    hasConvention: boolean;
    folkReading: string;
    meaning: string;
  }[];
  recognizedPatterns: RecognizedPattern[];
  readings: {
    byDigit: string;
    byPair: string;
    folkPopular: string;
    creativeNote: string;
  };
  yinYang: {
    yinCount: number;
    yangCount: number;
    ratioLabel: string;
    isBalanced: boolean;
  };
  elementsHaDo: Record<'Thủy' | 'Hỏa' | 'Mộc' | 'Kim' | 'Thổ', number>;
  overallSummary: string;
  quickValuePitch: {
    headline: string;
    coreMeaning: string;
    practicalValue: string;
    endingHighlight: string;
  };
  structureTags: string[];
}

export interface ScoringWeights {
  numerology: number;   // default 30
  eastern: number;      // default 25
  goalFit: number;      // default 20
  structure: number;    // default 15
  memorability: number; // default 10
}

export interface ScoreDetail {
  total: number;
  breakdown: {
    numerology: number;
    eastern: number;
    goalFit: number;
    structure: number;
    memorability: number;
  };
  explanations: {
    numerology: string;
    eastern: string;
    goalFit: string;
    structure: string;
    memorability: string;
  };
}

export type CandidateSource = 'ai_generated' | 'teller_input' | 'inventory';

export interface AnalyzedAccountNumber {
  id: string;
  number: string;
  formatted: string;
  length: number;
  source: CandidateSource;
  sourceLabel: string;
  availabilityNotice: string;
  styleTag?: string;
  eastern: EasternAnalysis;
  score: ScoreDetail;
  selectionReasons: string[];
  numerologyMatches: { digit: number; matchedIndices: string[] }[];
}

export type ObjectionCategory = 'fee_value' | 'number_preference' | 'decision_hesitation';

export interface ObjectionItem {
  situation: string;
  response: string;
  category?: ObjectionCategory;
  nextStep?: string;
}

export interface CustomObjectionReply {
  id: string;
  objectionText: string;
  accountNumber: string;
  empathyApproach: string;
  valueApproach: string;
  nextStepAction: string;
  createdAt: string;
}

export interface ConsultantScripts {
  source: 'gemini-ai' | 'template';
  personalizedSummary: string;
  scripts: {
    friendly: string;
    professional: string;
    closing: string;
  };
  objections: ObjectionItem[];
  generatedAt: string;
}

export type InventoryStatus = 'unverified' | 'consulted' | 'registered' | 'on_hold';

export interface InventoryNumberItem {
  id: string;
  number: string;
  length: number;
  structureType: string;
  status: InventoryStatus;
  note: string;
  addedAt: string;
  feeTier?: string;
}

export type ActiveTab =
  | 'quick'
  | 'overview'
  | 'profile'
  | 'numerology'
  | 'generator'
  | 'consultant'
  | 'sheet'
  | 'inventory';
