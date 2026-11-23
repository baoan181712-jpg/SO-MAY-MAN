import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Check,
  CheckCircle2,
  Compass,
  Copy,
  FileText,
  Gem,
  Loader2,
  MessageSquareText,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Target,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import { CUSTOMER_GOALS, NUMBER_STYLES } from '../constants/banking';
import { buildTemplateConsultation } from '../engines/consultantTemplates';
import {
  AnalyzedAccountNumber,
  ConsultantScripts,
  CustomerProfile,
  CustomObjectionReply,
  NumberStyleId,
  NumerologyReport,
  ObjectionCategory,
  ObjectionItem,
} from '../types';
import NumberMeaningBadge, { deriveNumberBadge } from './NumberMeaningBadge';

interface SmartConsultantProps {
  profile: CustomerProfile;
  numerology: NumerologyReport | null;
  selectedStyle: NumberStyleId;
  candidates: AnalyzedAccountNumber[];
  selectedCandidate: AnalyzedAccountNumber | null;
  onSelectCandidate: (candidate: AnalyzedAccountNumber) => void;
  aiScriptsCache: Record<string, ConsultantScripts>;
  onSaveAiScripts: (candidateId: string, scripts: ConsultantScripts) => void;
  onGoToGenerator: () => void;
  onGoToSheet: () => void;
}

export default function SmartConsultant({
  profile,
  numerology,
  selectedStyle,
  candidates,
  selectedCandidate,
  onSelectCandidate,
  aiScriptsCache,
  onSaveAiScripts,
  onGoToGenerator,
  onGoToSheet,
}: SmartConsultantProps) {
  const [activeScriptTab, setActiveScriptTab] = useState<'friendly' | 'professional' | 'closing'>('friendly');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [openObjectionKey, setOpenObjectionKey] = useState<string | null>('0');
  const [objectionCategory, setObjectionCategory] = useState<'all' | ObjectionCategory>('all');
  const [objectionSearch, setObjectionSearch] = useState('');

  // Custom live counter objection input + AI reply state
  const [customObjectionInput, setCustomObjectionInput] = useState('');
  const [isLoadingObjectionAi, setIsLoadingObjectionAi] = useState(false);
  const [customObjectionError, setCustomObjectionError] = useState<string | null>(null);
  const [customReplies, setCustomReplies] = useState<CustomObjectionReply[]>([]);

  const activeItem = selectedCandidate ?? candidates[0] ?? null;

  if (!activeItem) {
    return (
      <div className="bg-white border border-[#DDE6F0] rounded-xl p-10 text-center space-y-4">
        <h2 className="text-lg font-semibold text-[#0F243E]">
          Chưa chọn số tài khoản để tư vấn
        </h2>
        <p className="text-sm text-[#51647A] max-w-md mx-auto">
          Vui lòng tạo đề xuất TOP 5 hoặc nhập số tài khoản cần phân tích ở bước trước để mở Smart Number Consultant.
        </p>
        <button
          type="button"
          onClick={onGoToGenerator}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0057A0] hover:bg-[#003F75] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Đi đến mục Đề xuất & Xếp hạng số
        </button>
      </div>
    );
  }

  const templateScripts = buildTemplateConsultation(activeItem, profile, numerology);
  const currentScripts = aiScriptsCache[activeItem.id] ?? templateScripts;
  const isAiGenerated = currentScripts.source === 'gemini-ai';

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      // Ignore clipboard failure in restricted iframes
    }
  };

  const handleGenerateAiConsultant = async () => {
    setIsLoadingAi(true);
    setAiError(null);

    try {
      const styleLabel =
        NUMBER_STYLES.find((s) => s.id === selectedStyle)?.label ?? 'Cân bằng';
      const goalLabel = CUSTOMER_GOALS.filter((g) => profile.goals.includes(g.id))
        .map((g) => g.label)
        .join(', ');

      // Send only first/display name (never full sensitive PII or birthDate string) to server AI endpoint
      const nameParts = profile.fullName.trim().split(/\s+/).filter(Boolean);
      const displayCallName = nameParts.length > 0 ? nameParts[nameParts.length - 1] : 'Quý khách';

      const payload = {
        customerFirstName: displayCallName,
        goalLabel,
        personality: profile.selfDescribedPersonality,
        notes: profile.notes,
        numerologySummary: numerology
          ? {
              lifePath: numerology.indices.lifePath.value,
              birthday: numerology.indices.birthday.value,
              attitude: numerology.indices.attitude.value,
              expression: numerology.indices.expression.value,
              soulUrge: numerology.indices.soulUrge.value,
              personalityNum: numerology.indices.personality.value,
              recommendedDigits: numerology.recommendedDigits,
            }
          : {
              lifePath: 8,
              birthday: 6,
              attitude: 5,
              expression: 8,
              soulUrge: 6,
              personalityNum: 2,
              recommendedDigits: [6, 8, 9],
            },
        accountNumber: activeItem.number,
        formattedNumber: activeItem.formatted,
        sourceLabel: activeItem.sourceLabel,
        totalScore: activeItem.score.total,
        scoreBreakdown: activeItem.score.breakdown,
        readings: activeItem.eastern.readings,
        easternHighlights: activeItem.eastern.recognizedPatterns.map(
          (p) => `${p.pattern}: ${p.reading}`
        ),
        structureNotes: activeItem.eastern.structureTags,
        styleLabel,
      };

      const res = await fetch('/api/consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Không thể kết nối trợ lý AI lúc này.');
      }

      onSaveAiScripts(activeItem.id, {
        source: 'gemini-ai',
        personalizedSummary: data.personalizedSummary,
        scripts: data.scripts,
        objections: Array.isArray(data.objections) && data.objections.length > 0
          ? data.objections
          : templateScripts.objections,
        generatedAt: new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    } catch (err) {
      setAiError(
        err instanceof Error
          ? err.message
          : 'Có lỗi khi gọi trợ lý AI. Bạn vẫn có thể sử dụng kịch bản chuẩn hóa bên dưới.'
      );
    } finally {
      setIsLoadingAi(false);
    }
  };

  const scoreRows: { label: string; score: number; explanation: string; barColor: string; textColor: string }[] = [
    {
      label: 'Tương đồng Thần số học',
      score: activeItem.score.breakdown.numerology,
      explanation: activeItem.score.explanations.numerology,
      barColor: 'bg-[#0057A0]',
      textColor: 'text-[#0057A0]',
    },
    {
      label: 'Ý nghĩa tổ hợp Phương Đông',
      score: activeItem.score.breakdown.eastern,
      explanation: activeItem.score.explanations.eastern,
      barColor: 'bg-[#0089CF]',
      textColor: 'text-[#0074B2]',
    },
    {
      label: 'Phù hợp mong muốn & phong cách',
      score: activeItem.score.breakdown.goalFit,
      explanation: activeItem.score.explanations.goalFit,
      barColor: 'bg-[#D71920]',
      textColor: 'text-[#B91C1C]',
    },
    {
      label: 'Cấu trúc, cân đối & dễ đọc',
      score: activeItem.score.breakdown.structure,
      explanation: activeItem.score.explanations.structure,
      barColor: 'bg-[#059669]',
      textColor: 'text-[#047857]',
    },
    {
      label: 'Dễ nhớ, tính lặp & đối xứng',
      score: activeItem.score.breakdown.memorability,
      explanation: activeItem.score.explanations.memorability,
      barColor: 'bg-[#4F46E5]',
      textColor: 'text-[#3730A3]',
    },
  ];

  const scriptTabs: { id: 'friendly' | 'professional' | 'closing'; label: string }[] = [
    { id: 'friendly', label: '1. Gần gũi, tự nhiên' },
    { id: 'professional', label: '2. Chuyên nghiệp, có chiều sâu' },
    { id: 'closing', label: '3. Khơi gợi nhu cầu & chốt nhẹ nhàng' },
  ];

  return (
    <div className="space-y-6">
      {/* Header + Quick Candidate Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#0057A0]">Module 6 · Bước 5 & 6 / 7</p>
          <h1 className="text-2xl font-bold text-[#0F243E] mt-1">
            Smart Number Consultant – Trợ lý tư vấn bán hàng
          </h1>
          <p className="text-sm text-[#51647A] mt-1">
            Trình tự chuẩn tại quầy: Nhìn nhanh Giá trị & Ý nghĩa → Phân tích chi tiết → Kịch bản bán hàng & Xử lý từ chối.
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToSheet}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0057A0] hover:bg-[#003F75] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <FileText className="w-4 h-4" />
          <span>Xuất phiếu tư vấn PDF / In</span>
        </button>
      </div>

      {/* Quick TOP 5 Switcher Strip */}
      {candidates.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-[#51647A] whitespace-nowrap shrink-0 mr-1">
            Chuyển nhanh số:
          </span>
          {candidates.slice(0, 6).map((cand, idx) => {
            const active = cand.id === activeItem.id;
            const badge = deriveNumberBadge(cand.eastern);
            return (
              <button
                key={cand.id}
                type="button"
                title={`${cand.formatted} · ${badge.shortLabel} — ${badge.tooltipMeaning}`}
                onClick={() => {
                  onSelectCandidate(cand);
                  setAiError(null);
                }}
                className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-2 ${
                  active
                    ? 'bg-[#0057A0] text-white border-[#0057A0] shadow-xs'
                    : 'bg-white text-[#0F243E] border-[#DDE6F0] hover:border-[#0057A0]'
                }`}
              >
                <span className="font-mono tabular-nums">
                  #{idx + 1} · {cand.formatted}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    active
                      ? 'bg-white/20 text-white'
                      : 'bg-[#EDF4FA] text-[#0057A0]'
                  }`}
                >
                  {badge.shortLabel}
                </span>
                <span className={`font-mono text-[11px] tabular-nums ${active ? 'text-white/85' : 'text-[#51647A]'}`}>
                  {cand.score.total}đ
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Quick Jump Anchor Strip for Fast Counter Navigation */}
      <nav aria-label="Điều hướng nhanh 3 bước tư vấn" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-[#0057A0] border-b border-[#DDE6F0] pb-3">
        <a href="#stage-value" className="inline-flex items-center gap-1.5 hover:underline whitespace-nowrap">
          <Gem className="w-3.5 h-3.5 text-[#D97706]" />
          <span>01. Diễn giải nhanh Giá trị & Ý nghĩa</span>
        </a>
        <span className="text-[#C7D6E6]" aria-hidden="true">/</span>
        <a href="#stage-detail" className="inline-flex items-center gap-1.5 hover:underline whitespace-nowrap">
          <BarChart3 className="w-3.5 h-3.5 text-[#0057A0]" />
          <span>02. Phân tích chi tiết & Chấm điểm</span>
        </a>
        <span className="text-[#C7D6E6]" aria-hidden="true">/</span>
        <a href="#stage-scripts" className="inline-flex items-center gap-1.5 hover:underline whitespace-nowrap">
          <MessageSquareText className="w-3.5 h-3.5 text-[#D71920]" />
          <span>03. Kịch bản bán hàng & Xử lý từ chối</span>
        </a>
      </nav>

      {/* ===================================================================== */}
      {/* STAGE 1: QUICK VALUE & MEANING INTERPRETATION (INSTANT TELLER GLANCE) */}
      {/* ===================================================================== */}
      <section id="stage-value" className="bg-white border border-[#0057A0]/35 rounded-xl overflow-visible shadow-xs scroll-mt-20">
        <div className="h-1 w-full bg-gradient-to-r from-[#0057A0] via-[#0089CF] to-[#D71920] rounded-t-xl" />
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#EDF4FA]">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#51647A]">
                <span className="font-semibold text-[#0057A0]">Phần 01 · Nhìn nhanh Giá trị & Ý nghĩa</span>
                <span aria-hidden="true">·</span>
                <span>{activeItem.sourceLabel}</span>
                <span aria-hidden="true">·</span>
                <span>Độ dài {activeItem.length} chữ số</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="font-mono text-4xl sm:text-5xl font-bold tracking-widest text-[#0F243E] tabular-nums">
                  {activeItem.formatted}
                </span>
                <NumberMeaningBadge eastern={activeItem.eastern} size="md" />
              </div>
              <p className="text-sm font-semibold text-[#0057A0]">
                {activeItem.eastern.quickValuePitch.headline}
              </p>
              <p className="text-xs text-[#51647A] max-w-2xl">
                {activeItem.availabilityNotice}
              </p>
            </div>

            <div className="flex items-center gap-6 shrink-0">
              <div className="text-left lg:text-right px-4 py-3 rounded-xl bg-[#FEF2F2]/60 border border-[#FECACA]/70">
                <p className="text-xs font-medium text-[#51647A]">Điểm phù hợp tham khảo</p>
                <p className="font-mono text-4xl font-bold text-[#D71920] tabular-nums leading-tight">
                  {activeItem.score.total}
                  <span className="text-lg text-[#51647A] font-medium">/100</span>
                </p>
              </div>
            </div>
          </div>

          {/* 3-Column Instant Value Summary */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-[#0F243E]">
              Diễn giải giá trị & ý nghĩa cốt lõi (GDV nhìn nhanh 5 giây)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#FDE68A]/80 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#FEF3C7] text-[#B45309] inline-flex items-center justify-center shrink-0">
                    <Gem className="w-4 h-4" />
                  </span>
                  <p className="text-xs font-bold text-[#92400E]">Ý nghĩa nổi bật của dãy số</p>
                </div>
                <p className="text-sm text-[#0F243E] leading-relaxed">
                  {activeItem.eastern.quickValuePitch.coreMeaning}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F4FDF9] border border-[#A7F3D0]/80 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#D1FAE5] text-[#047857] inline-flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <p className="text-xs font-bold text-[#065F46]">Giá trị thực tế khi sử dụng</p>
                </div>
                <p className="text-sm text-[#0F243E] leading-relaxed">
                  {activeItem.eastern.quickValuePitch.practicalValue}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#EDF4FA]/75 border border-[#BFDBFE] space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#DBEAFE] text-[#0057A0] inline-flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4" />
                  </span>
                  <p className="text-xs font-bold text-[#0057A0]">Điểm chạm hồ sơ & Chốt đuôi</p>
                </div>
                <p className="text-sm text-[#0F243E] leading-relaxed">
                  {activeItem.numerologyMatches.length > 0
                    ? `Gắn với hồ sơ ${profile.fullName.trim() || 'khách hàng'} qua số ${activeItem.numerologyMatches
                        .map((m) => `${m.digit} (${m.matchedIndices[0]})`)
                        .slice(0, 2)
                        .join(', ')}. `
                    : ''}
                  {activeItem.eastern.quickValuePitch.endingHighlight}
                </p>
              </div>
            </div>
          </div>

          {/* 3-Layer Reading Right Under Core Value */}
          <div className="space-y-3 pt-3 border-t border-[#EDF4FA]">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#EEF2FF] text-[#3730A3] inline-flex items-center justify-center shrink-0">
                <BookOpen className="w-3.5 h-3.5" />
              </span>
              <h3 className="text-sm font-bold text-[#0F243E]">Cách đọc số tại quầy (3 tầng)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-lg bg-[#F7F9FC] border border-[#EDF4FA] space-y-1">
                <p className="text-xs font-semibold text-[#51647A]">1. Đọc từng chữ số</p>
                <p className="text-sm font-semibold text-[#0F243E]">
                  {activeItem.eastern.readings.byDigit}
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-[#F7F9FC] border border-[#EDF4FA] space-y-1">
                <p className="text-xs font-semibold text-[#51647A]">2. Đọc theo cặp / nhịp tách</p>
                <p className="text-sm font-semibold text-[#0057A0]">
                  {activeItem.eastern.readings.byPair}
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-[#EDF4FA]/70 border border-[#0057A0]/20 space-y-1">
                <p className="text-xs font-semibold text-[#0057A0]">3. Ý nghĩa dân gian phổ biến</p>
                <p className="text-sm font-bold text-[#0F243E]">
                  {activeItem.eastern.readings.folkPopular}
                </p>
              </div>
            </div>
            <p className="text-xs text-[#51647A] leading-relaxed">
              Phân biệt diễn giải: {activeItem.eastern.readings.creativeNote}
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* STAGE 2: DETAILED ANALYSIS (DIGITS, PAIRS, STRUCTURE, 100-PT SCORE)   */}
      {/* ===================================================================== */}
      <div id="stage-detail" className="grid grid-cols-1 lg:grid-cols-12 gap-6 scroll-mt-20">
        <section className="lg:col-span-7 bg-white border border-[#DDE6F0] rounded-xl p-6 space-y-5">
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-lg bg-[#EDF4FA] text-[#0057A0] inline-flex items-center justify-center shrink-0 mt-0.5">
              <Compass className="w-5 h-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-[#0057A0]">Phần 02 · Phân tích chi tiết</p>
              <h2 className="text-base font-bold text-[#0F243E] mt-0.5">
                Giải thích từng chữ số, cặp số & cấu trúc Phương Đông
              </h2>
              <p className="text-sm text-[#51647A] mt-1 leading-relaxed">
                {activeItem.eastern.overallSummary}
              </p>
            </div>
          </div>

          {/* Per-digit breakdown */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-[#51647A]">
              Ý nghĩa từng chữ số (Âm Hán Việt · Dân gian · Âm Dương · Ngũ hành Hà Đồ)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {activeItem.eastern.digits.map((d, i) => (
                <div
                  key={`${d.digit}-${i}`}
                  className="p-3 rounded-lg border border-[#EDF4FA] bg-[#F7F9FC] space-y-1"
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-lg font-bold text-[#0057A0] tabular-nums">
                      {d.digit}
                    </span>
                    <span className="text-[11px] text-[#51647A]">
                      {d.yinYang} · {d.elementHaDo}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#0F243E]">
                    {d.sinoVietnamese} — {d.folkReading}
                  </p>
                  <p className="text-[11px] text-[#51647A] leading-snug">{d.meaning}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pair breakdown */}
          <div className="space-y-2.5 pt-2 border-t border-[#EDF4FA]">
            <h3 className="text-xs font-semibold text-[#51647A]">
              Phân tích từng cụm / cặp số
            </h3>
            <div className="divide-y divide-[#EDF4FA] border border-[#EDF4FA] rounded-lg">
              {activeItem.eastern.pairBreakdown.map((p, i) => (
                <div key={`${p.pair}-${i}`} className="p-3 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                  <span className="font-mono text-base font-bold text-[#D71920] w-14 shrink-0 tabular-nums">
                    {p.pair}
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-[#0F243E]">
                      {p.folkReading}{' '}
                      <span className="font-normal text-[#51647A]">
                        · {p.hasConvention ? 'Quy ước phổ biến' : 'Diễn giải theo chữ số thành phần'}
                      </span>
                    </p>
                    <p className="text-xs text-[#51647A]">{p.meaning}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ha Do Five Elements summary */}
          <div className="pt-2 border-t border-[#EDF4FA] flex flex-wrap items-center justify-between gap-2 text-xs text-[#51647A]">
            <span>
              Âm Dương: <strong className="text-[#0F243E]">{activeItem.eastern.yinYang.ratioLabel}</strong>
            </span>
            <span>
              Ngũ hành (Hà Đồ):{' '}
              {(Object.entries(activeItem.eastern.elementsHaDo) as [string, number][])
                .filter(([, count]) => count > 0)
                .map(([el, count]) => `${el} (${count})`)
                .join(' · ')}
            </span>
          </div>
        </section>

        {/* Transparent Score Breakdown */}
        <section className="lg:col-span-5 bg-white border border-[#DDE6F0] rounded-xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-lg bg-[#EEF2FF] text-[#3730A3] inline-flex items-center justify-center shrink-0 mt-0.5">
              <BarChart3 className="w-5 h-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-[#3730A3]">Đối chiếu thang điểm 100</p>
              <h2 className="text-base font-bold text-[#0F243E] mt-0.5">
                Chi tiết chấm điểm minh bạch ({activeItem.score.total}/100)
              </h2>
            </div>
          </div>

          <div className="space-y-4">
            {scoreRows.map((row) => (
              <div key={row.label} className="space-y-1.5">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-semibold text-[#0F243E]">{row.label}</span>
                  <span className={`font-mono font-bold tabular-nums ${row.textColor}`}>
                    {row.score}đ
                  </span>
                </div>
                <div className="h-2 w-full bg-[#EDF4FA] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${row.barColor}`}
                    style={{ width: `${Math.min(100, (row.score / 35) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-[#51647A] leading-relaxed">{row.explanation}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ===================================================================== */}
      {/* STAGE 3: SALES CONSULTATION SCRIPTS & OBJECTION HANDLING              */}
      {/* ===================================================================== */}
      <section id="stage-scripts" className="bg-white border border-[#DDE6F0] rounded-xl p-6 sm:p-8 space-y-6 scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-lg bg-[#FEF2F2] text-[#D71920] inline-flex items-center justify-center shrink-0 mt-0.5">
              <MessageSquareText className="w-5 h-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-[#D71920]">Phần 03 · Kịch bản bán hàng tại quầy</p>
              <h2 className="text-base font-bold text-[#0F243E] mt-0.5">
                Kịch bản tư vấn cá nhân hóa (3 phong cách)
              </h2>
              <p className="text-xs text-[#51647A] mt-0.5">
                Nguồn nội dung hiện tại:{' '}
                <span className="font-semibold text-[#0057A0]">
                  {isAiGenerated
                    ? `Trợ lý AI Gemini (cá nhân hóa lúc ${currentScripts.generatedAt})`
                    : 'Kịch bản chuẩn hóa lập trình theo hồ sơ'}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateAiConsultant}
            disabled={isLoadingAi}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              isLoadingAi
                ? 'bg-[#DDE6F0] text-[#51647A] cursor-wait'
                : 'bg-[#D71920] hover:bg-[#B01218] text-white cursor-pointer'
            }`}
          >
            {isLoadingAi ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang tạo lời tư vấn AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{isAiGenerated ? 'Viết lại bằng AI Gemini' : 'Cá nhân hóa sâu bằng AI Gemini'}</span>
              </>
            )}
          </button>
        </div>

        {aiError && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{aiError}</span>
          </div>
        )}

        {/* Personalized Connection Summary */}
        <div className="p-4 rounded-lg bg-[#F7F9FC] border border-[#DDE6F0] space-y-1.5">
          <p className="text-xs font-semibold text-[#0057A0]">
            Lời nhận xét cá nhân hóa theo hồ sơ {profile.fullName.trim() || 'khách hàng'}
          </p>
          <p className="text-sm text-[#0F243E] leading-relaxed">
            {currentScripts.personalizedSummary}
          </p>
        </div>

        {/* 3 Script Styles Segmented Tabs */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F7F9FC] border border-[#DDE6F0] rounded-lg w-fit">
            {scriptTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveScriptTab(tab.id)}
                className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  activeScriptTab === tab.id
                    ? 'bg-white text-[#0057A0] shadow-xs'
                    : 'text-[#51647A] hover:text-[#0F243E]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5 rounded-xl border border-[#DDE6F0] bg-white space-y-4">
            <p className="text-[15px] text-[#0F243E] leading-relaxed">
              {currentScripts.scripts[activeScriptTab]}
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-[#EDF4FA]">
              <span className="text-xs text-[#51647A]">
                Cam kết chuẩn mực: Không gây áp lực · Không khẳng định đổi vận hay chắc chắn tài lộc
              </span>
              <button
                type="button"
                onClick={() =>
                  handleCopy(currentScripts.scripts[activeScriptTab], `script-${activeScriptTab}`)
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0057A0] bg-[#EDF4FA] hover:bg-[#DCEAF7] rounded-md transition-colors cursor-pointer whitespace-nowrap"
              >
                {copiedKey === `script-${activeScriptTab}` ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Đã sao chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép lời thoại</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Objection Handling: Live Custom Input + 12 Diverse Counter Scenarios */}
      <section className="bg-white border border-[#DDE6F0] rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex items-start gap-3">
          <span className="w-9 h-9 rounded-lg bg-[#FFFBEB] text-[#B45309] inline-flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-[#0F243E]">
              Xử lý tình huống khách hàng từ chối (Đa dạng & Nhập tình huống thực tế)
            </h2>
            <p className="text-xs text-[#51647A] mt-0.5">
              Nhập trực tiếp câu từ chối khách vừa nói tại quầy để AI gợi ý câu trả lời ngay, hoặc chọn nhanh từ 12 tình huống phổ biến bên dưới.
            </p>
          </div>
        </div>

        {/* Interactive Custom Objection Input Box */}
        <div className="p-5 rounded-xl bg-[#F7F9FC] border border-[#DDE6F0] space-y-4">
          <div className="space-y-1">
            <label htmlFor="custom-objection-input" className="block text-sm font-semibold text-[#0F243E]">
              Nhập tình huống khách hàng vừa từ chối tại quầy
            </label>
            <p className="text-xs text-[#51647A]">
              AI sẽ dựa trên số đang tư vấn (<span className="font-mono font-semibold text-[#0F243E]">{activeItem.formatted}</span>) và hồ sơ khách hàng để gợi ý 2 cách đáp lời tinh tế + bước tiếp theo.
            </p>
          </div>

          <form
            onSubmit={async (e: FormEvent) => {
              e.preventDefault();
              const text = customObjectionInput.trim();
              if (text.length < 3 || isLoadingObjectionAi) return;

              setIsLoadingObjectionAi(true);
              setCustomObjectionError(null);
              try {
                const nameParts = profile.fullName.trim().split(/\s+/).filter(Boolean);
                const displayCallName =
                  nameParts.length > 0 ? nameParts[nameParts.length - 1] : 'anh/chị';
                const goalLabel = CUSTOMER_GOALS.filter((g) => profile.goals.includes(g.id))
                  .map((g) => g.label)
                  .join(', ');

                const res = await fetch('/api/objection', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    objectionText: text,
                    customerFirstName: displayCallName,
                    goalLabel,
                    accountNumber: activeItem.number,
                    formattedNumber: activeItem.formatted,
                    folkReading: activeItem.eastern.readings.folkPopular,
                    byPairReading: activeItem.eastern.readings.byPair,
                    headline: activeItem.eastern.quickValuePitch.headline,
                    totalScore: activeItem.score.total,
                  }),
                });
                const data = await res.json();
                if (!res.ok) {
                  throw new Error(data?.error || 'Không thể tạo gợi ý xử lý từ chối.');
                }
                const reply: CustomObjectionReply = {
                  id: `cust-obj-${Date.now()}`,
                  objectionText: text,
                  accountNumber: activeItem.formatted,
                  empathyApproach: data.empathyApproach,
                  valueApproach: data.valueApproach,
                  nextStepAction: data.nextStepAction,
                  createdAt: new Date().toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                };
                setCustomReplies((prev) => [reply, ...prev]);
                setCustomObjectionInput('');
              } catch (err) {
                setCustomObjectionError(
                  err instanceof Error ? err.message : 'Lỗi kết nối trợ lý AI.'
                );
              } finally {
                setIsLoadingObjectionAi(false);
              }
            }}
            className="flex flex-col sm:flex-row gap-2.5"
          >
            <input
              id="custom-objection-input"
              type="text"
              maxLength={350}
              value={customObjectionInput}
              onChange={(e) => setCustomObjectionInput(e.target.value)}
              placeholder="Ví dụ: Khách nói phí 2 triệu hơi cao, hoặc khách bảo vợ/chồng chưa đồng ý, hoặc khách không thích số 7..."
              className="flex-1 px-3.5 py-2.5 text-sm text-[#0F243E] bg-white border border-[#C7D6E6] focus:border-[#0057A0] focus:ring-2 focus:ring-[#0057A0]/15 rounded-lg outline-none"
            />
            <button
              type="submit"
              disabled={isLoadingObjectionAi || customObjectionInput.trim().length < 3}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                isLoadingObjectionAi || customObjectionInput.trim().length < 3
                  ? 'bg-[#DDE6F0] text-[#7D90A5] cursor-not-allowed'
                  : 'bg-[#0057A0] hover:bg-[#003F75] text-white cursor-pointer'
              }`}
            >
              {isLoadingObjectionAi ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang tạo gợi ý...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Gợi ý câu trả lời AI</span>
                </>
              )}
            </button>
          </form>

          {/* Quick-fill real counter prompt buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-[#51647A]">Nhập nhanh ví dụ:</span>
            {[
              'Khách nói phí số đẹp hơi cao so với dự tính',
              'Khách bảo chỉ dùng nhận lương nên không cần số đẹp',
              'Khách ngại đổi số vì đối tác đã lưu số cũ',
              'Khách hỏi số này có đảm bảo làm ăn phát đạt không?',
            ].map((sampleText) => (
              <button
                key={sampleText}
                type="button"
                onClick={() => setCustomObjectionInput(sampleText)}
                className="px-2.5 py-1 text-[11px] font-medium text-[#0057A0] bg-white hover:bg-[#EDF4FA] border border-[#DDE6F0] rounded-md transition-colors cursor-pointer"
              >
                {sampleText}
              </button>
            ))}
          </div>

          {customObjectionError && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{customObjectionError}</span>
            </div>
          )}

          {/* Rendered AI Custom Objection Replies */}
          {customReplies.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-[#DDE6F0]">
              {customReplies.map((reply) => (
                <div
                  key={reply.id}
                  className="bg-white border border-[#0057A0]/30 rounded-lg p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2 pb-2 border-b border-[#EDF4FA]">
                    <p className="text-sm font-bold text-[#0F243E]">
                      Tình huống: “{reply.objectionText}”
                    </p>
                    <span className="text-[11px] text-[#51647A] font-mono tabular-nums">
                      Số {reply.accountNumber} · {reply.createdAt}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-lg bg-[#F7F9FC] border border-[#EDF4FA] space-y-2">
                      <p className="text-xs font-semibold text-[#0057A0]">
                        Cách 1 · Nhẹ nhàng, đồng cảm
                      </p>
                      <p className="text-sm text-[#0F243E] leading-relaxed">
                        {reply.empathyApproach}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleCopy(reply.empathyApproach, `ce-${reply.id}`)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#0057A0] hover:underline cursor-pointer"
                      >
                        {copiedKey === `ce-${reply.id}` ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Đã sao chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-3.5 rounded-lg bg-[#F7F9FC] border border-[#EDF4FA] space-y-2">
                      <p className="text-xs font-semibold text-[#0057A0]">
                        Cách 2 · Chuyên nghiệp, làm rõ giá trị
                      </p>
                      <p className="text-sm text-[#0F243E] leading-relaxed">
                        {reply.valueApproach}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleCopy(reply.valueApproach, `cv-${reply.id}`)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#0057A0] hover:underline cursor-pointer"
                      >
                        {copiedKey === `cv-${reply.id}` ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Đã sao chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#51647A]">
                    <strong className="text-[#0F243E]">Bước tiếp theo gợi ý cho GDV:</strong>{' '}
                    {reply.nextStepAction}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Categorized Library of Diverse Counter Situations */}
        {(() => {
          // Merge AI-generated objections (if user ran full AI) with our 12 diverse categorized templates without duplicating situations
          const mergedObjections: ObjectionItem[] = [...templateScripts.objections];
          if (isAiGenerated && currentScripts.objections.length > 0) {
            const existingTitles = new Set(
              mergedObjections.map((o) => o.situation.toLowerCase().trim())
            );
            // Update matching situations with AI-personalized wording, or prepend unique AI items
            for (const aiObj of currentScripts.objections) {
              const norm = aiObj.situation.toLowerCase().trim();
              const matchIdx = mergedObjections.findIndex(
                (m) => m.situation.toLowerCase().trim() === norm || m.situation.toLowerCase().includes(norm) || norm.includes(m.situation.toLowerCase())
              );
              if (matchIdx >= 0) {
                mergedObjections[matchIdx] = {
                  ...mergedObjections[matchIdx],
                  response: aiObj.response,
                };
              } else if (!existingTitles.has(norm)) {
                mergedObjections.unshift({
                  situation: aiObj.situation,
                  response: aiObj.response,
                  category: 'decision_hesitation',
                });
              }
            }
          }

          const categoryTabs: { id: 'all' | ObjectionCategory; label: string }[] = [
            { id: 'all', label: `Tất cả (${mergedObjections.length})` },
            {
              id: 'fee_value',
              label: `Chi phí & Giá trị (${mergedObjections.filter((o) => o.category === 'fee_value').length})`,
            },
            {
              id: 'number_preference',
              label: `Sở thích về số (${mergedObjections.filter((o) => o.category === 'number_preference').length})`,
            },
            {
              id: 'decision_hesitation',
              label: `Do dự & Quyết định (${mergedObjections.filter((o) => o.category === 'decision_hesitation').length})`,
            },
          ];

          const q = objectionSearch.trim().toLowerCase();
          const visibleObjections = mergedObjections.filter((o) => {
            if (objectionCategory !== 'all' && o.category !== objectionCategory) return false;
            if (q && !o.situation.toLowerCase().includes(q) && !o.response.toLowerCase().includes(q)) {
              return false;
            }
            return true;
          });

          const categoryLabelMap: Record<ObjectionCategory, string> = {
            fee_value: 'Chi phí & Giá trị',
            number_preference: 'Sở thích về số',
            decision_hesitation: 'Do dự & Quyết định',
          };

          return (
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1 p-1 bg-[#F7F9FC] border border-[#DDE6F0] rounded-lg">
                  {categoryTabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setObjectionCategory(tab.id);
                        setOpenObjectionKey(null);
                      }}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                        objectionCategory === tab.id
                          ? 'bg-white text-[#0057A0] shadow-xs'
                          : 'text-[#51647A] hover:text-[#0F243E]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full lg:w-64">
                  <Search className="w-3.5 h-3.5 text-[#51647A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={objectionSearch}
                    onChange={(e) => setObjectionSearch(e.target.value)}
                    placeholder="Tìm nhanh tình huống..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F7F9FC] border border-[#DDE6F0] focus:border-[#0057A0] focus:bg-white rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="divide-y divide-[#EDF4FA] border border-[#DDE6F0] rounded-xl overflow-hidden">
                {visibleObjections.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#51647A]">
                    Không tìm thấy tình huống mẫu khớp từ khóa — bạn có thể nhập trực tiếp vào ô phía trên để AI tạo câu trả lời riêng.
                  </div>
                ) : (
                  visibleObjections.map((obj, idx) => {
                    const key = `${obj.situation}-${idx}`;
                    const isOpen = openObjectionKey === key || (openObjectionKey === '0' && idx === 0);
                    const numLabel = String(idx + 1).padStart(2, '0');
                    return (
                      <div key={key} className="bg-white">
                        <button
                          type="button"
                          onClick={() => setOpenObjectionKey(isOpen ? null : key)}
                          className="w-full px-5 py-3.5 text-left flex items-center justify-between gap-4 hover:bg-[#F7F9FC] transition-colors cursor-pointer"
                        >
                          <div className="min-w-0">
                            <span className="text-sm font-semibold text-[#0F243E]">
                              {numLabel}. {obj.situation}
                            </span>
                            {obj.category && (
                              <span className="ml-2.5 text-[11px] text-[#51647A]">
                                · {categoryLabelMap[obj.category]}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-medium text-[#0057A0] shrink-0 whitespace-nowrap">
                            {isOpen ? 'Thu gọn' : 'Xem câu trả lời'}
                          </span>
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-4 pt-1 bg-[#F7F9FC] space-y-2.5">
                            <p className="text-sm text-[#0F243E] leading-relaxed">{obj.response}</p>
                            {obj.nextStep && (
                              <p className="text-xs text-[#51647A]">
                                <strong className="text-[#0057A0]">Gợi ý thao tác tiếp theo:</strong>{' '}
                                {obj.nextStep}
                              </p>
                            )}
                            <button
                              type="button"
                              onClick={() => handleCopy(obj.response, `obj-${key}`)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0057A0] hover:underline cursor-pointer"
                            >
                              {copiedKey === `obj-${key}` ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Đã sao chép câu phản hồi</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Sao chép câu phản hồi</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })()}
      </section>
    </div>
  );
}
