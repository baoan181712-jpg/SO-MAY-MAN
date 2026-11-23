import {
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  Calculator,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  Copy,
  Crown,
  FileText,
  Gem,
  Heart,
  MessageSquareText,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UserRound,
  Volume2,
  Zap,
} from 'lucide-react';
import { FormEvent, useRef, useState } from 'react';
import { NUMBER_STYLES, SAMPLE_CUSTOMERS } from '../constants/banking';
import { buildTemplateConsultation } from '../engines/consultantTemplates';
import { validateBirthDate } from '../engines/numerology';
import {
  ActiveTab,
  AnalyzedAccountNumber,
  CustomerGoalId,
  CustomerProfile,
  NumberStyleId,
  NumerologyReport,
} from '../types';
import NumberMeaningBadge from './NumberMeaningBadge';
import VietnameseDateInput from './VietnameseDateInput';

interface QuickCounterWorkspaceProps {
  profile: CustomerProfile;
  onProfileChange: (next: CustomerProfile) => void;
  onResetProfile: () => void;
  numerology: NumerologyReport | null;
  selectedLength: number;
  onLengthChange: (len: number) => void;
  selectedStyle: NumberStyleId;
  onStyleChange: (style: NumberStyleId) => void;
  candidates: AnalyzedAccountNumber[];
  selectedCandidate: AnalyzedAccountNumber | null;
  onSelectCandidate: (candidate: AnalyzedAccountNumber) => void;
  onCheckCustomNumber: (rawNumber: string) => boolean;
  onReturnToSuggestions: () => void;
  generatorMode: 'ai' | 'manual';
  onNavigate: (tab: ActiveTab) => void;
}

const TAIL_LENGTHS = [3, 4, 5, 6, 7, 8];

interface PersonalityPreset {
  id: string;
  label: string;
  personalityText: string;
  styleId: NumberStyleId;
  goals: CustomerGoalId[];
  icon: typeof Gem;
  iconBg: string;
  iconText: string;
  activeClass: string;
}

const PERSONALITY_PRESETS: PersonalityPreset[] = [
  {
    id: 'business',
    label: 'Quyết đoán, kinh doanh',
    personalityText: 'Quyết đoán, thực tế, chú trọng kinh doanh phát triển và rõ ràng khi giao dịch.',
    styleId: 'business_prosperity',
    goals: ['business_growth', 'wealth_accumulation'],
    icon: Briefcase,
    iconBg: 'bg-[#EDF4FA]',
    iconText: 'text-[#0057A0]',
    activeClass: 'bg-[#EDF4FA] border-[#0057A0] text-[#0057A0]',
  },
  {
    id: 'wealth',
    label: 'Cầu tiến, thích tài lộc',
    personalityText: 'Cầu tiến, coi trọng tích lũy tài lộc bền vững và phát triển tài chính.',
    styleId: 'wealth_growth',
    goals: ['wealth_accumulation'],
    icon: Gem,
    iconBg: 'bg-[#FEF3C7]',
    iconText: 'text-[#B45309]',
    activeClass: 'bg-[#FFFBEB] border-[#D97706] text-[#92400E]',
  },
  {
    id: 'leader',
    label: 'Bản lĩnh, dẫn đầu',
    personalityText: 'Bản lĩnh, tự tin, yêu thích sự chuyên nghiệp, vị thế và khẳng định bản thân.',
    styleId: 'career_leadership',
    goals: ['career_status'],
    icon: Crown,
    iconBg: 'bg-[#FEF2F2]',
    iconText: 'text-[#D71920]',
    activeClass: 'bg-[#FEF2F2] border-[#D71920] text-[#B91C1C]',
  },
  {
    id: 'family',
    label: 'Điềm đạm, hướng gia đình',
    personalityText: 'Điềm đạm, ấm áp, đề cao sự bình an, ổn định và gắn kết gia đình.',
    styleId: 'family_harmony',
    goals: ['family_peace'],
    icon: Heart,
    iconBg: 'bg-[#ECFDF5]',
    iconText: 'text-[#047857]',
    activeClass: 'bg-[#ECFDF5] border-[#059669] text-[#065F46]',
  },
  {
    id: 'unique',
    label: 'Sáng tạo, cá tính riêng',
    personalityText: 'Sáng tạo, tinh tế, yêu thích con số mang dấu ấn cá nhân độc đáo.',
    styleId: 'unique_personalized',
    goals: ['unique_memorable'],
    icon: Star,
    iconBg: 'bg-[#EEF2FF]',
    iconText: 'text-[#4338CA]',
    activeClass: 'bg-[#EEF2FF] border-[#4F46E5] text-[#3730A3]',
  },
  {
    id: 'simple',
    label: 'Gọn gàng, chuộng dễ nhớ',
    personalityText: 'Thực tế, thích sự gọn gàng, tối giản và đọc nhanh dễ nhớ qua điện thoại.',
    styleId: 'easy_memorable',
    goals: ['unique_memorable'],
    icon: Zap,
    iconBg: 'bg-[#E0F2FE]',
    iconText: 'text-[#0369A1]',
    activeClass: 'bg-[#E0F2FE] border-[#0284C7] text-[#0369A1]',
  },
];

const STYLE_CHIP_COLORS: Record<NumberStyleId, { bg: string; text: string; active: string }> = {
  wealth_growth: {
    bg: 'bg-[#FFFBEB] border-[#FDE68A]',
    text: 'text-[#B45309]',
    active: 'bg-[#D97706] border-[#D97706] text-white',
  },
  business_prosperity: {
    bg: 'bg-[#EDF4FA] border-[#BFDBFE]',
    text: 'text-[#0057A0]',
    active: 'bg-[#0057A0] border-[#0057A0] text-white',
  },
  career_leadership: {
    bg: 'bg-[#FEF2F2] border-[#FECACA]',
    text: 'text-[#D71920]',
    active: 'bg-[#D71920] border-[#D71920] text-white',
  },
  peace_stability: {
    bg: 'bg-[#ECFDF5] border-[#A7F3D0]',
    text: 'text-[#047857]',
    active: 'bg-[#059669] border-[#059669] text-white',
  },
  family_harmony: {
    bg: 'bg-[#FDF2F8] border-[#FBCFE8]',
    text: 'text-[#BE185D]',
    active: 'bg-[#DB2777] border-[#DB2777] text-white',
  },
  unique_personalized: {
    bg: 'bg-[#EEF2FF] border-[#C7D2FE]',
    text: 'text-[#4338CA]',
    active: 'bg-[#4F46E5] border-[#4F46E5] text-white',
  },
  easy_memorable: {
    bg: 'bg-[#E0F2FE] border-[#BAE6FD]',
    text: 'text-[#0369A1]',
    active: 'bg-[#0284C7] border-[#0284C7] text-white',
  },
};

function inferStyleFromPersonality(text: string): { styleId: NumberStyleId; goals: CustomerGoalId[] } | null {
  const lower = text.toLowerCase();
  if (!lower.trim()) return null;
  if (lower.includes('kinh doanh') || lower.includes('buôn bán') || lower.includes('chủ doanh nghiệp') || lower.includes('quyết đoán')) {
    return { styleId: 'business_prosperity', goals: ['business_growth', 'wealth_accumulation'] };
  }
  if (lower.includes('tài lộc') || lower.includes('tích lũy') || lower.includes('tiết kiệm') || lower.includes('phát tài')) {
    return { styleId: 'wealth_growth', goals: ['wealth_accumulation'] };
  }
  if (lower.includes('lãnh đạo') || lower.includes('vị thế') || lower.includes('sự nghiệp') || lower.includes('bản lĩnh') || lower.includes('dẫn đầu')) {
    return { styleId: 'career_leadership', goals: ['career_status'] };
  }
  if (lower.includes('gia đình') || lower.includes('bình an') || lower.includes('điềm đạm') || lower.includes('ổn định')) {
    return { styleId: 'family_harmony', goals: ['family_peace'] };
  }
  if (lower.includes('độc đáo') || lower.includes('sáng tạo') || lower.includes('cá tính') || lower.includes('tinh tế')) {
    return { styleId: 'unique_personalized', goals: ['unique_memorable'] };
  }
  if (lower.includes('dễ nhớ') || lower.includes('gọn') || lower.includes('đơn giản') || lower.includes('thực tế')) {
    return { styleId: 'easy_memorable', goals: ['unique_memorable'] };
  }
  return null;
}

export default function QuickCounterWorkspace({
  profile,
  onProfileChange,
  onResetProfile,
  numerology,
  selectedLength,
  onLengthChange,
  selectedStyle,
  onStyleChange,
  candidates,
  selectedCandidate,
  onSelectCandidate,
  onCheckCustomNumber,
  onReturnToSuggestions,
  generatorMode,
  onNavigate,
}: QuickCounterWorkspaceProps) {
  const resultsRef = useRef<HTMLElement | null>(null);
  const readingRef = useRef<HTMLElement | null>(null);

  const [showCustomCheck, setShowCustomCheck] = useState(false);
  const [customNumberText, setCustomNumberText] = useState('');
  const [customError, setCustomError] = useState<string | null>(null);
  const [showMoreNumbers, setShowMoreNumbers] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Optional deep-dive sections (collapsed by default so main view stays uncluttered)
  const [openDeepSection, setOpenDeepSection] = useState<'none' | 'numerology' | 'fengshui'>('none');

  const dateValidation = profile.birthDate ? validateBirthDate(profile.birthDate) : null;
  const hasValidProfile = profile.fullName.trim().length >= 2 && Boolean(dateValidation?.valid);

  const activeItem = selectedCandidate ?? candidates[0] ?? null;
  const topSix = candidates.slice(0, 6);
  const extraCandidates = candidates.slice(6);

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      // Ignore clipboard failure in restricted iframes
    }
  };

  const handleApplyPreset = (preset: PersonalityPreset) => {
    onProfileChange({
      ...profile,
      selfDescribedPersonality: preset.personalityText,
      goals: preset.goals,
    });
    onStyleChange(preset.styleId);
    if (generatorMode === 'manual') {
      onReturnToSuggestions();
    }
  };

  const handlePersonalityInput = (value: string) => {
    const inferred = inferStyleFromPersonality(value);
    onProfileChange({
      ...profile,
      selfDescribedPersonality: value,
      goals: inferred ? inferred.goals : profile.goals,
    });
    if (inferred) {
      onStyleChange(inferred.styleId);
    }
  };

  const handleQuickSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (generatorMode === 'manual') {
      onReturnToSuggestions();
    }
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCustomSubmit = (e: FormEvent) => {
    e.preventDefault();
    const clean = customNumberText.replace(/[\s.-]/g, '');
    if (!/^\d{3,16}$/.test(clean)) {
      setCustomError('Vui lòng nhập dãy số từ 3 đến 16 chữ số (VD: 6868, 168888).');
      return;
    }
    const ok = onCheckCustomNumber(clean);
    if (ok) {
      setCustomError(null);
      readingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const quickScript = activeItem
    ? buildTemplateConsultation(activeItem, profile, numerology).scripts.friendly
    : '';

  return (
    <div className="space-y-6">
      {/* Compact Top Banner with Visual 3-Step Flow Indicator */}
      <div className="bg-white border border-[#DDE6F0] rounded-2xl overflow-hidden shadow-xs">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0057A0] via-[#0089CF] to-[#D71920]" />
        <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className="w-11 h-11 rounded-xl bg-[#EDF4FA] text-[#0057A0] inline-flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#0F243E] tracking-tight">
                Tư vấn nhanh số tài khoản đẹp tại quầy
              </h1>
              <p className="text-sm text-[#51647A] mt-0.5">
                Chỉ 3 bước gọn gàng: Nhập thông tin khách → Chọn đuôi đẹp 3–8 số → Đọc ý nghĩa & tư vấn ngay.
              </p>
            </div>
          </div>

          {/* 3-Step Colored Visual Breadcrumb */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EDF4FA] text-[#0057A0] text-xs font-bold border border-[#BFDBFE]">
              <UserRound className="w-3.5 h-3.5" />
              1. Thông tin KH
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FEF2F2] text-[#D71920] text-xs font-bold border border-[#FECACA]">
              <Crown className="w-3.5 h-3.5" />
              2. Đuôi 3–8 số
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ECFDF5] text-[#047857] text-xs font-bold border border-[#A7F3D0]">
              <Volume2 className="w-3.5 h-3.5" />
              3. Đọc ý nghĩa
            </span>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* STEP 1: COMPACT 3-FIELD CUSTOMER INPUT CARD                         */}
      {/* =================================================================== */}
      <section className="bg-white border border-[#DDE6F0] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EDF4FA]">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-[#0057A0] text-white inline-flex items-center justify-center shrink-0">
              <UserRound className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#0F243E]">
                Bước 1 · Nhập thông tin khách hàng
              </h2>
              <p className="text-xs text-[#51647A]">
                Chỉ cần Họ tên, Ngày sinh và Tính cách — hệ thống tự động đề xuất ngay bên dưới.
              </p>
            </div>
          </div>

          {/* Quick Sample Fillers */}
          <div className="flex flex-wrap items-center gap-1.5">
            {SAMPLE_CUSTOMERS.map((s, idx) => (
              <button
                key={s.profile.fullName}
                type="button"
                onClick={() => {
                  onProfileChange(s.profile);
                  if (idx === 0) onStyleChange('business_prosperity');
                  else if (idx === 1) onStyleChange('unique_personalized');
                  else onStyleChange('family_harmony');
                  if (generatorMode === 'manual') onReturnToSuggestions();
                }}
                className="px-2.5 py-1.5 text-xs font-semibold text-[#0057A0] bg-[#EDF4FA] hover:bg-[#DCEAF7] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Mẫu {idx + 1}: {s.profile.fullName.split(' ').slice(-2).join(' ')}
              </button>
            ))}
            <button
              type="button"
              onClick={onResetProfile}
              title="Xóa trắng để nhập khách mới"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#51647A] hover:text-[#0F243E] bg-[#F7F9FC] border border-[#DDE6F0] rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khách mới</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleQuickSubmit} className="space-y-5">
          {/* 3 Essential Fields in 1 Clean Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Field 1: Full Name */}
            <div className="md:col-span-4 space-y-1.5">
              <label
                htmlFor="quick-fullname"
                className="flex items-center gap-1.5 text-xs font-bold text-[#0F243E]"
              >
                <span className="w-5 h-5 rounded-md bg-[#EDF4FA] text-[#0057A0] inline-flex items-center justify-center">
                  <UserRound className="w-3 h-3" />
                </span>
                <span>Họ và tên khách hàng</span>
                <span className="text-[#D71920]">*</span>
              </label>
              <input
                id="quick-fullname"
                type="text"
                value={profile.fullName}
                onChange={(e) => onProfileChange({ ...profile, fullName: e.target.value })}
                placeholder="VD: Nguyễn Minh Khang"
                className="w-full px-3.5 py-2.5 text-sm font-medium text-[#0F243E] bg-[#FCFDFE] border border-[#C7D6E6] focus:border-[#0057A0] focus:bg-white focus:ring-2 focus:ring-[#0057A0]/15 rounded-xl outline-none transition-all"
              />
            </div>

            {/* Field 2: Birth Date */}
            <div className="md:col-span-3 space-y-1.5">
              <label
                htmlFor="quick-dob"
                className="flex items-center gap-1.5 text-xs font-bold text-[#0F243E]"
              >
                <span className="w-5 h-5 rounded-md bg-[#FEF2F2] text-[#D71920] inline-flex items-center justify-center">
                  <Calendar className="w-3 h-3" />
                </span>
                <span>Ngày tháng năm sinh</span>
                <span className="text-[#D71920]">*</span>
              </label>
              <VietnameseDateInput
                id="quick-dob"
                value={profile.birthDate}
                onChange={(iso) => onProfileChange({ ...profile, birthDate: iso })}
                className="w-full px-3.5 py-2.5 text-sm font-mono font-medium tabular-nums text-[#0F243E] bg-[#FCFDFE] border border-[#C7D6E6] focus:border-[#0057A0] focus:bg-white focus:ring-2 focus:ring-[#0057A0]/15 rounded-xl outline-none transition-all"
              />
            </div>

            {/* Field 3: Personality */}
            <div className="md:col-span-5 space-y-1.5">
              <label
                htmlFor="quick-personality"
                className="flex items-center gap-1.5 text-xs font-bold text-[#0F243E]"
              >
                <span className="w-5 h-5 rounded-md bg-[#FFFBEB] text-[#B45309] inline-flex items-center justify-center">
                  <Sparkles className="w-3 h-3" />
                </span>
                <span>Tính cách / Gu số khách hàng</span>
              </label>
              <input
                id="quick-personality"
                type="text"
                value={profile.selfDescribedPersonality}
                onChange={(e) => handlePersonalityInput(e.target.value)}
                placeholder="VD: Quyết đoán, thích kinh doanh, gọn gàng dễ nhớ..."
                className="w-full px-3.5 py-2.5 text-sm text-[#0F243E] bg-[#FCFDFE] border border-[#C7D6E6] focus:border-[#0057A0] focus:bg-white focus:ring-2 focus:ring-[#0057A0]/15 rounded-xl outline-none transition-all"
              />
            </div>
          </div>

          {/* 1-Click Colorful Personality Chips */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-[#51647A]">
              Chọn nhanh tính cách (1 chạm tự khớp phong cách số):
            </p>
            <div className="flex flex-wrap gap-2">
              {PERSONALITY_PRESETS.map((preset) => {
                const Icon = preset.icon;
                const isSelected = selectedStyle === preset.styleId;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? `${preset.activeClass} shadow-xs`
                        : 'bg-white border-[#DDE6F0] text-[#0F243E] hover:border-[#0057A0]/50 hover:bg-[#F7F9FC]'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-md inline-flex items-center justify-center ${preset.iconBg} ${preset.iconText}`}
                    >
                      <Icon className="w-3 h-3" />
                    </span>
                    <span>{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tail Length Bar (3 to 8 digits) + Primary Action Button */}
          <div className="pt-4 border-t border-[#EDF4FA] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#0F243E] mr-1">
                Số chữ số cuối cần chọn:
              </span>
              {TAIL_LENGTHS.map((len) => {
                const active = generatorMode === 'ai' && selectedLength === len;
                return (
                  <button
                    key={len}
                    type="button"
                    onClick={() => {
                      if (generatorMode === 'manual') onReturnToSuggestions();
                      onLengthChange(len);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer tabular-nums ${
                      active
                        ? 'bg-[#0057A0] text-white border-[#0057A0] shadow-xs'
                        : 'bg-white text-[#0F243E] border-[#DDE6F0] hover:border-[#0057A0] hover:bg-[#EDF4FA]/60'
                    }`}
                  >
                    {len} số cuối
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowCustomCheck((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-[#0057A0] bg-[#EDF4FA] hover:bg-[#DCEAF7] rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{showCustomCheck ? 'Ẩn ô tra số riêng' : 'Tra ý nghĩa 1 số có sẵn'}</span>
              </button>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#D71920] hover:bg-[#B01218] text-white text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                <span>Đề xuất số đẹp ngay</span>
              </button>
            </div>
          </div>
        </form>

        {/* Optional Quick Custom Number Checker */}
        {showCustomCheck && (
          <form
            onSubmit={handleCustomSubmit}
            className="p-4 rounded-xl bg-[#F7F9FC] border border-[#DDE6F0] flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
          >
            <input
              type="text"
              value={customNumberText}
              onChange={(e) => setCustomNumberText(e.target.value)}
              placeholder="Nhập số tài khoản hoặc đuôi số khách chọn (3–16 chữ số, VD: 6868, 168888)..."
              className="flex-1 px-3.5 py-2 text-sm font-mono bg-white border border-[#C7D6E6] focus:border-[#0057A0] rounded-lg outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#0057A0] hover:bg-[#003F75] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Đọc ý nghĩa số này
            </button>
            {generatorMode === 'manual' && (
              <button
                type="button"
                onClick={onReturnToSuggestions}
                className="px-3 py-2 text-xs font-semibold text-[#51647A] hover:text-[#0F243E] bg-white border border-[#DDE6F0] rounded-lg cursor-pointer whitespace-nowrap"
              >
                Quay lại đề xuất tự động
              </button>
            )}
            {customError && (
              <p className="text-xs text-[#D71920] font-medium sm:w-full">{customError}</p>
            )}
          </form>
        )}
      </section>

      {/* =================================================================== */}
      {/* STEP 2: RECOMMENDED LUCKY TAIL NUMBERS (3 TO 8 DIGITS)              */}
      {/* =================================================================== */}
      <section ref={resultsRef} className="space-y-4 scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-[#FEF2F2] text-[#D71920] border border-[#FECACA] inline-flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#0F243E]">
                Bước 2 · Đề xuất số tài khoản phù hợp{' '}
                <span className="text-[#0057A0]">
                  ({generatorMode === 'manual' ? 'Số GDV vừa tra cứu' : `Đuôi ${selectedLength} chữ số`})
                </span>
              </h2>
              <p className="text-xs text-[#51647A]">
                Mỗi phương án hiển thị ngay nhãn ý nghĩa + tooltip nhanh. Nhấp vào số bất kỳ để đọc ý nghĩa chi tiết bên dưới.
              </p>
            </div>
          </div>

          {hasValidProfile && numerology ? (
            <div className="inline-flex flex-wrap items-center gap-2 text-xs font-medium text-[#0057A0] bg-[#EDF4FA] border border-[#BFDBFE] px-3 py-1.5 rounded-lg">
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#0057A0]" />
              <span>
                Cá nhân hóa cho <strong className="text-[#0F243E]">{profile.fullName}</strong> · Ngày sinh{' '}
                <strong className="font-mono text-[#0F243E]">{numerology.formattedBirthDate}</strong> · Số hợp:{' '}
                <strong className="font-mono text-[#D71920]">{numerology.recommendedDigits.slice(0, 4).join(', ')}</strong>
              </span>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#B45309] bg-[#FFFBEB] border border-[#FDE68A] px-3 py-1.5 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              Nhập đủ Họ tên & Ngày sinh để cá nhân hóa sâu hơn
            </span>
          )}
        </div>

        {/* Optional Quick Style Filter Strip */}
        {generatorMode === 'ai' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[11px] font-semibold text-[#51647A] whitespace-nowrap mr-1">
              Phong cách số:
            </span>
            {NUMBER_STYLES.map((st) => {
              const active = selectedStyle === st.id;
              const palette = STYLE_CHIP_COLORS[st.id];
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => onStyleChange(st.id)}
                  className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    active ? palette.active : `${palette.bg} ${palette.text} hover:opacity-90`
                  }`}
                >
                  {st.label}
                </button>
              );
            })}
          </div>
        )}

        {/* TOP 6 Recommended Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {topSix.map((item, idx) => {
            const isSelected = activeItem?.id === item.id;
            const isTop = idx === 0;
            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  onSelectCandidate(item);
                  readingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectCandidate(item);
                  }
                }}
                className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between space-y-3.5 ${
                  isSelected
                    ? 'border-[#0057A0] ring-2 ring-[#0057A0]/20 shadow-sm'
                    : isTop
                      ? 'border-[#FECACA] hover:border-[#D71920]'
                      : 'border-[#DDE6F0] hover:border-[#0057A0]/60 hover:bg-[#FCFDFE]'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Row: Rank + Score */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold ${
                        isTop
                          ? 'bg-[#FEF2F2] text-[#D71920]'
                          : 'bg-[#EDF4FA] text-[#0057A0]'
                      }`}
                    >
                      {isTop ? (
                        <Crown className="w-3.5 h-3.5 text-[#D71920]" />
                      ) : (
                        <TrendingUp className="w-3.5 h-3.5 text-[#0089CF]" />
                      )}
                      <span>{isTop ? 'Đề xuất #1' : `Phương án #${idx + 1}`}</span>
                    </span>

                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#F7F9FC] border border-[#DDE6F0] text-[#0F243E] tabular-nums">
                      {item.score.total}/100đ
                    </span>
                  </div>

                  {/* Account Number Visual: Subtle Bank Prefix + Highlighted 3-8 Tail Digits */}
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      {item.length <= 8 && (
                        <span className="font-mono text-sm font-medium text-[#94A3B8] select-none">
                          1088 ••••
                        </span>
                      )}
                      <span className="font-mono text-2xl sm:text-[26px] font-extrabold tracking-wider text-[#0F243E] tabular-nums">
                        {item.formatted}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <NumberMeaningBadge
                        eastern={item.eastern}
                        size="sm"
                        tooltipAlign={idx % 3 === 2 ? 'right' : 'left'}
                      />
                      <span className="text-[11px] font-mono text-[#51647A] tabular-nums">
                        ({item.length} chữ số)
                      </span>
                    </div>
                  </div>

                  {/* Personalized Customer-Fit Reason + Quick Reading */}
                  <div className="pt-2.5 border-t border-[#EDF4FA] space-y-1.5">
                    {item.selectionReasons[0] && (
                      <p className="text-xs font-semibold text-[#047857] bg-[#ECFDF5] border border-[#A7F3D0]/70 rounded-lg px-2.5 py-1.5 leading-snug">
                        ✓ {item.selectionReasons[0]}
                      </p>
                    )}
                    <p className="text-xs text-[#51647A] leading-relaxed line-clamp-2">
                      {item.eastern.quickValuePitch.coreMeaning}
                    </p>
                    <p className="text-[11px] text-[#0057A0] font-semibold">
                      Đọc nhanh: {item.eastern.readings.byPair}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-2.5 border-t border-[#EDF4FA] flex items-center justify-between gap-2 text-xs">
                  <span
                    className={`font-semibold ${
                      isSelected ? 'text-[#047857]' : 'text-[#51647A]'
                    }`}
                  >
                    {isSelected ? '● Đang xem ý nghĩa bên dưới' : 'Bấm để đọc ý nghĩa'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(item.number, `card-${item.id}`);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0057A0] hover:text-[#D71920] cursor-pointer"
                  >
                    {copiedKey === `card-${item.id}` ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Chép số</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Optional Toggle for Additional Candidates */}
        {extraCandidates.length > 0 && (
          <div className="bg-white border border-[#DDE6F0] rounded-xl overflow-visible">
            <button
              type="button"
              onClick={() => setShowMoreNumbers((v) => !v)}
              className="w-full px-5 py-3 flex items-center justify-between text-xs font-semibold text-[#0057A0] hover:bg-[#F7F9FC] transition-colors cursor-pointer rounded-xl"
            >
              <span>
                {showMoreNumbers
                  ? 'Thu gọn danh sách mở rộng'
                  : `Xem thêm ${extraCandidates.length} phương án đuôi ${selectedLength} số khác`}
              </span>
              {showMoreNumbers ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showMoreNumbers && (
              <div className="border-t border-[#EDF4FA] overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <tbody className="divide-y divide-[#EDF4FA] text-xs">
                    {extraCandidates.map((item, i) => (
                      <tr
                        key={item.id}
                        onClick={() => {
                          onSelectCandidate(item);
                          readingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }}
                        className={`hover:bg-[#F7F9FC] cursor-pointer transition-colors ${
                          activeItem?.id === item.id ? 'bg-[#EDF4FA]/60' : ''
                        }`}
                      >
                        <td className="py-2.5 px-4 font-mono font-bold text-[#51647A] w-12">
                          #{i + 7}
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-sm font-bold text-[#0F243E] tabular-nums">
                              {item.formatted}
                            </span>
                            <NumberMeaningBadge
                              eastern={item.eastern}
                              size="sm"
                              tooltipPlacement={i < 2 ? 'bottom' : 'top'}
                            />
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-[#51647A] hidden sm:table-cell">
                          {item.eastern.readings.byPair}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-[#0057A0] tabular-nums">
                          {item.score.total}đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

      {/* =================================================================== */}
      {/* STEP 3: INSTANT NUMBER MEANING & READING CARD                       */}
      {/* =================================================================== */}
      {activeItem && (
        <section
          ref={readingRef}
          className="bg-white border border-[#0057A0]/35 rounded-2xl overflow-visible shadow-xs scroll-mt-20"
        >
          <div className="h-1.5 w-full bg-gradient-to-r from-[#059669] via-[#0089CF] to-[#0057A0] rounded-t-2xl" />
          <div className="p-5 sm:p-7 space-y-6">
            {/* Header with Big Number + Badge + Copy */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#EDF4FA]">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#047857] inline-flex items-center justify-center shrink-0">
                    <Volume2 className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold text-[#047857]">
                    Bước 3 · Đọc ý nghĩa số & Tư vấn trực tiếp tại quầy
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="flex items-baseline gap-2">
                    {activeItem.length <= 8 && (
                      <span className="font-mono text-lg text-[#94A3B8] select-none">
                        1088 ••••
                      </span>
                    )}
                    <span className="font-mono text-3xl sm:text-4xl font-extrabold tracking-widest text-[#0F243E] tabular-nums">
                      {activeItem.formatted}
                    </span>
                  </div>
                  <NumberMeaningBadge eastern={activeItem.eastern} size="md" />
                </div>

                <p className="text-sm font-semibold text-[#0057A0]">
                  {activeItem.eastern.quickValuePitch.headline}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <div className="px-3.5 py-2 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-center">
                  <p className="text-[10px] font-semibold text-[#991B1B]">Độ phù hợp</p>
                  <p className="font-mono text-xl font-extrabold text-[#D71920] tabular-nums leading-tight">
                    {activeItem.score.total}/100
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(activeItem.number, 'hero-num')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-[#0057A0] bg-[#EDF4FA] hover:bg-[#DCEAF7] rounded-xl transition-colors cursor-pointer"
                >
                  {copiedKey === 'hero-num' ? (
                    <>
                      <Check className="w-4 h-4 text-[#047857]" />
                      <span>Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Chép số</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 3 Clear Color-Coded Meaning & Reading Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: How to Read Aloud */}
              <div className="p-4 rounded-xl bg-[#EDF4FA]/70 border border-[#BFDBFE] space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-[#DBEAFE] text-[#0057A0] inline-flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </span>
                  <h3 className="text-xs font-bold text-[#0057A0]">Cách đọc thuận miệng tại quầy</h3>
                </div>
                <p className="text-base font-bold text-[#0F243E] leading-snug">
                  {activeItem.eastern.readings.byPair}
                </p>
                <p className="text-xs text-[#51647A] leading-relaxed">
                  Đọc từng số: <strong className="text-[#0F243E]">{activeItem.eastern.readings.byDigit}</strong>
                </p>
              </div>

              {/* Card 2: Core Folk Meaning */}
              <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#FDE68A] space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-[#FEF3C7] text-[#B45309] inline-flex items-center justify-center shrink-0">
                    <Gem className="w-4 h-4" />
                  </span>
                  <h3 className="text-xs font-bold text-[#92400E]">Ý nghĩa nổi bật của dãy số</h3>
                </div>
                <p className="text-sm font-semibold text-[#0F243E] leading-relaxed">
                  {activeItem.eastern.readings.folkPopular}
                </p>
                <p className="text-xs text-[#51647A] leading-relaxed">
                  {activeItem.eastern.quickValuePitch.coreMeaning}
                </p>
              </div>

              {/* Card 3: Practical Value + Customer Fit */}
              <div className="p-4 rounded-xl bg-[#F4FDF9] border border-[#A7F3D0] space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-[#D1FAE5] text-[#047857] inline-flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <h3 className="text-xs font-bold text-[#065F46]">Điểm cộng khi giao dịch</h3>
                </div>
                <p className="text-xs text-[#0F243E] leading-relaxed">
                  {activeItem.eastern.quickValuePitch.practicalValue}
                </p>
                <p className="text-xs text-[#047857] font-medium leading-relaxed">
                  {activeItem.eastern.quickValuePitch.endingHighlight}
                </p>
              </div>
            </div>

            {/* Instant 1-Sentence Teller Pitch + Action Buttons */}
            <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#DDE6F0] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#FEF2F2] text-[#D71920] inline-flex items-center justify-center shrink-0">
                    <MessageSquareText className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs font-bold text-[#0F243E]">
                    Gợi ý câu tư vấn ngắn cho GDV:
                  </span>
                </div>
                <p className="text-sm text-[#0F243E] leading-relaxed">{quickScript}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopy(quickScript, 'quick-script')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0057A0] bg-white hover:bg-[#EDF4FA] border border-[#DDE6F0] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  {copiedKey === 'quick-script' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#047857]" />
                      <span>Đã chép lời thoại</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Chép lời thoại</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('consultant')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#0057A0] hover:bg-[#003F75] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  <MessageSquareText className="w-3.5 h-3.5" />
                  <span>Kịch bản AI & Xử lý từ chối</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('sheet')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0F243E] bg-white hover:bg-[#EDF4FA] border border-[#DDE6F0] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  <FileText className="w-3.5 h-3.5 text-[#047857]" />
                  <span>Phiếu tư vấn PDF</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* OPTIONAL DEEP-DIVE (ONLY IF TELLER WANTS TO EXPLORE FURTHER)        */}
      {/* =================================================================== */}
      <section className="bg-white border border-[#DDE6F0] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#4338CA] inline-flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-[#0F243E]">
                Mở rộng chuyên sâu (Tùy chọn nếu GDV muốn tìm hiểu thêm)
              </h2>
              <p className="text-xs text-[#51647A]">
                Gọn gàng mặc định — bấm chọn bên dưới để xem chi tiết Thần số học Pythagoras hoặc Phong thủy Phương Đông.
              </p>
            </div>
          </div>
        </div>

        {/* 2 Eye-Catching Toggle Buttons for Optional Deep-Dive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() =>
              setOpenDeepSection((prev) => (prev === 'numerology' ? 'none' : 'numerology'))
            }
            className={`p-4 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
              openDeepSection === 'numerology'
                ? 'bg-[#EEF2FF] border-[#4F46E5] shadow-xs'
                : 'bg-[#F7F9FC] border-[#DDE6F0] hover:border-[#4F46E5]/60'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-10 h-10 rounded-xl bg-[#E0E7FF] text-[#4338CA] inline-flex items-center justify-center shrink-0">
                <Calculator className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#0F243E]">
                  Tìm hiểu chi tiết Thần số học Pythagoras
                </p>
                <p className="text-xs text-[#51647A] truncate">
                  {numerology
                    ? `Chủ đạo ${numerology.indices.lifePath.value} · Sứ mệnh ${numerology.indices.expression.value} · Số hợp: ${numerology.recommendedDigits.join(', ')}`
                    : 'Nhập Họ tên và Ngày sinh để tính 6 chỉ số Pythagoras'}
                </p>
              </div>
            </div>
            {openDeepSection === 'numerology' ? (
              <ChevronUp className="w-4 h-4 text-[#4338CA] shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#51647A] shrink-0" />
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              setOpenDeepSection((prev) => (prev === 'fengshui' ? 'none' : 'fengshui'))
            }
            className={`p-4 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
              openDeepSection === 'fengshui'
                ? 'bg-[#FFFBEB] border-[#D97706] shadow-xs'
                : 'bg-[#F7F9FC] border-[#DDE6F0] hover:border-[#D97706]/60'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#B45309] inline-flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#0F243E]">
                  Phân tích Phong thủy & Số Phương Đông chi tiết
                </p>
                <p className="text-xs text-[#51647A] truncate">
                  {activeItem
                    ? `Âm Dương ${activeItem.eastern.yinYang.ratioLabel} · Ngũ hành Hà Đồ · Từng chữ số & cặp số`
                    : 'Xem phân tích Âm Dương, Ngũ hành Hà Đồ và từng chữ số'}
                </p>
              </div>
            </div>
            {openDeepSection === 'fengshui' ? (
              <ChevronUp className="w-4 h-4 text-[#B45309] shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#51647A] shrink-0" />
            )}
          </button>
        </div>

        {/* Expanded Panel A: Numerology Summary + Link to Full Module */}
        {openDeepSection === 'numerology' && (
          <div className="p-5 rounded-xl bg-[#F8FAFF] border border-[#C7D2FE] space-y-4">
            {numerology ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    numerology.indices.lifePath,
                    numerology.indices.birthday,
                    numerology.indices.attitude,
                    numerology.indices.expression,
                    numerology.indices.soulUrge,
                    numerology.indices.personality,
                  ].map((idx) => (
                    <div
                      key={idx.key}
                      className="p-3 rounded-xl bg-white border border-[#DDE6F0] text-center space-y-1"
                    >
                      <p className="text-[11px] font-semibold text-[#51647A]">{idx.label}</p>
                      <p className="font-mono text-2xl font-extrabold text-[#4338CA] tabular-nums">
                        {idx.value}
                      </p>
                      <p className="text-[10px] text-[#0F243E] line-clamp-2">{idx.meaningTitle}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#E0E7FF]">
                  <p className="text-xs text-[#0F243E]">
                    <strong>Nhóm chữ số ưu tiên theo hồ sơ:</strong>{' '}
                    <span className="font-mono font-bold text-[#D71920]">
                      {numerology.recommendedDigits.join(' · ')}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate('numerology')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#4338CA] hover:bg-[#3730A3] rounded-lg transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Xem đầy đủ phép tính & bảng chữ cái</span>
                  </button>
                </div>
              </>
            ) : (
              <p className="text-xs text-[#51647A]">
                Vui lòng nhập đầy đủ Họ và tên cùng Ngày tháng năm sinh ở Bước 1 để xem 6 chỉ số Thần số học Pythagoras.
              </p>
            )}
          </div>
        )}

        {/* Expanded Panel B: Eastern / Feng Shui Breakdown */}
        {openDeepSection === 'fengshui' && activeItem && (
          <div className="p-5 rounded-xl bg-[#FFFDF7] border border-[#FDE68A] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-2.5 py-1 rounded-md bg-white border border-[#FDE68A] text-[#0F243E] font-semibold">
                  Âm Dương: {activeItem.eastern.yinYang.ratioLabel}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-[#FDE68A] text-[#0F243E] font-semibold">
                  Ngũ hành Hà Đồ:{' '}
                  {(Object.entries(activeItem.eastern.elementsHaDo) as [string, number][])
                    .filter(([, c]) => c > 0)
                    .map(([el, c]) => `${el} (${c})`)
                    .join(' · ')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('generator')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B45309] hover:underline cursor-pointer"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Xem biểu đồ so sánh & trọng số chấm điểm</span>
              </button>
            </div>

            {/* Per-Digit Meaning Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {activeItem.eastern.digits.map((d, i) => (
                <div
                  key={`${d.digit}-${i}`}
                  className="p-2.5 rounded-lg bg-white border border-[#FDE68A]/70 text-center space-y-0.5"
                >
                  <div className="font-mono text-xl font-extrabold text-[#0057A0] tabular-nums">
                    {d.digit}
                  </div>
                  <div className="text-[11px] font-bold text-[#0F243E]">
                    {d.sinoVietnamese} · {d.folkReading}
                  </div>
                  <div className="text-[10px] text-[#51647A]">
                    {d.yinYang} · {d.elementHaDo}
                  </div>
                </div>
              ))}
            </div>

            {/* Pair Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {activeItem.eastern.pairBreakdown.map((p, i) => (
                <div
                  key={`${p.pair}-${i}`}
                  className="p-3 rounded-lg bg-white border border-[#EDF4FA] flex items-start gap-3"
                >
                  <span className="font-mono text-base font-extrabold text-[#D71920] tabular-nums shrink-0">
                    {p.pair}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#0F243E]">{p.folkReading}</p>
                    <p className="text-[11px] text-[#51647A] leading-snug">{p.meaning}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-[#51647A]">
              Lưu ý: Các diễn giải Âm Dương, Ngũ hành Hà Đồ và quan niệm dân gian mang tính tham khảo văn hóa để tăng trải nghiệm chọn số, không mang tính khẳng định đổi vận.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
