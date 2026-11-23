import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  Compass,
  Heart,
  Info,
  SlidersHorizontal,
  Smile,
  Sparkles,
  Target,
  UserCheck,
} from 'lucide-react';
import { useState } from 'react';
import { PYTHAGORAS_TABLE_ROWS } from '../engines/numerology';
import {
  CustomerProfile,
  NumerologyIndexResult,
  NumerologyReport,
  NumerologySettings,
  YRuleMode,
} from '../types';

const INDEX_VISUALS: Record<
  string,
  { iconBg: string; iconText: string; valueColor: string; hintBg: string }
> = {
  lifePath: {
    iconBg: 'bg-[#EDF4FA]',
    iconText: 'text-[#0057A0]',
    valueColor: 'text-[#0057A0]',
    hintBg: 'text-[#0057A0]',
  },
  birthday: {
    iconBg: 'bg-[#E0F2FE]',
    iconText: 'text-[#0369A1]',
    valueColor: 'text-[#0369A1]',
    hintBg: 'text-[#0369A1]',
  },
  attitude: {
    iconBg: 'bg-[#FFFBEB]',
    iconText: 'text-[#B45309]',
    valueColor: 'text-[#B45309]',
    hintBg: 'text-[#B45309]',
  },
  expression: {
    iconBg: 'bg-[#FEF2F2]',
    iconText: 'text-[#D71920]',
    valueColor: 'text-[#D71920]',
    hintBg: 'text-[#B91C1C]',
  },
  soulUrge: {
    iconBg: 'bg-[#ECFDF5]',
    iconText: 'text-[#047857]',
    valueColor: 'text-[#047857]',
    hintBg: 'text-[#047857]',
  },
  personality: {
    iconBg: 'bg-[#EEF2FF]',
    iconText: 'text-[#4338CA]',
    valueColor: 'text-[#4338CA]',
    hintBg: 'text-[#4338CA]',
  },
};

function renderIndexIcon(key: string) {
  switch (key) {
    case 'lifePath':
      return <Compass className="w-4 h-4" />;
    case 'birthday':
      return <Calendar className="w-4 h-4" />;
    case 'attitude':
      return <Smile className="w-4 h-4" />;
    case 'expression':
      return <Target className="w-4 h-4" />;
    case 'soulUrge':
      return <Heart className="w-4 h-4" />;
    default:
      return <UserCheck className="w-4 h-4" />;
  }
}

interface NumerologyViewProps {
  profile: CustomerProfile;
  report: NumerologyReport | null;
  settings: NumerologySettings;
  onSettingsChange: (next: NumerologySettings) => void;
  onEditProfile: () => void;
  onProceedToGenerator: () => void;
}

const Y_RULE_OPTIONS: { value: YRuleMode; label: string; hint: string }[] = [
  {
    value: 'contextual',
    label: 'Y theo ngữ cảnh (Khuyên dùng)',
    hint: 'Y là nguyên âm khi âm tiết không có A/E/I/O/U (vd: VY, LY, MY); là phụ âm khi đứng kề nguyên âm (vd: NGUYEN, HUYNH, YEN).',
  },
  {
    value: 'always-vowel',
    label: 'Y luôn là nguyên âm',
    hint: 'Mọi chữ Y trong họ tên đều được tính vào Số linh hồn.',
  },
  {
    value: 'always-consonant',
    label: 'Y luôn là phụ âm',
    hint: 'Mọi chữ Y trong họ tên đều được tính vào Số nhân cách.',
  },
];

export default function NumerologyView({
  profile,
  report,
  settings,
  onSettingsChange,
  onEditProfile,
  onProceedToGenerator,
}: NumerologyViewProps) {
  const [showMappingTable, setShowMappingTable] = useState(false);

  if (!report) {
    return (
      <div className="bg-white border border-[#DDE6F0] rounded-xl p-10 text-center space-y-4">
        <h2 className="text-lg font-semibold text-[#0F243E]">
          Chưa đủ thông tin để tính Thần số học
        </h2>
        <p className="text-sm text-[#51647A] max-w-md mx-auto">
          Vui lòng nhập đầy đủ họ và tên cùng ngày tháng năm sinh ở Module 1 để hệ thống tính chính xác 6 chỉ số Pythagoras.
        </p>
        <button
          type="button"
          onClick={onEditProfile}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0057A0] hover:bg-[#003F75] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Quay lại nhập hồ sơ khách hàng
        </button>
      </div>
    );
  }

  const indexList: NumerologyIndexResult[] = [
    report.indices.lifePath,
    report.indices.birthday,
    report.indices.attitude,
    report.indices.expression,
    report.indices.soulUrge,
    report.indices.personality,
  ];

  const activeYOption = Y_RULE_OPTIONS.find((o) => o.value === settings.yRule) ?? Y_RULE_OPTIONS[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#0057A0]">Module 2 · Bước 2 / 7</p>
          <h1 className="text-2xl font-bold text-[#0F243E] mt-1">
            Phân tích Thần số học Pythagoras
          </h1>
          <p className="text-sm text-[#51647A] mt-1">
            Khách hàng: <span className="font-semibold text-[#0F243E]">{profile.fullName}</span>
            <span className="mx-2 text-[#C7D6E6]">·</span>
            Quy đổi không dấu: <span className="font-mono text-[#0057A0]">{report.normalizedFullName}</span>
            <span className="mx-2 text-[#C7D6E6]">·</span>
            Ngày sinh: <span className="font-mono tabular-nums">{report.formattedBirthDate}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={onProceedToGenerator}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0057A0] hover:bg-[#003F75] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <span>Đề xuất & Chấm điểm số</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Algorithm Configuration Toolbar */}
      <div className="bg-white border border-[#DDE6F0] rounded-xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#0F243E]">
            <SlidersHorizontal className="w-4 h-4 text-[#0057A0]" />
            <span>Cấu hình quy tắc tính Pythagoras</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2.5 text-sm text-[#0F243E] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.keepMasterNumbers}
                onChange={(e) =>
                  onSettingsChange({ ...settings, keepMasterNumbers: e.target.checked })
                }
                className="w-4 h-4 accent-[#0057A0] rounded cursor-pointer"
              />
              <span className="font-medium">Giữ nguyên số Master (11, 22, 33)</span>
            </label>

            <div className="flex items-center gap-1 p-1 bg-[#F7F9FC] border border-[#DDE6F0] rounded-lg">
              {Y_RULE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onSettingsChange({ ...settings, yRule: opt.value })}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    settings.yRule === opt.value
                      ? 'bg-white text-[#0057A0] shadow-xs font-semibold'
                      : 'text-[#51647A] hover:text-[#0F243E]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="text-xs text-[#51647A]">{activeYOption.hint}</p>
      </div>

      {/* 6 Core Numerology Indices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {indexList.map((idx) => {
          const vis = INDEX_VISUALS[idx.key] ?? INDEX_VISUALS.lifePath;
          return (
            <div
              key={idx.key}
              className="bg-white border border-[#DDE6F0] hover:border-[#0057A0]/40 rounded-xl p-5 flex flex-col justify-between space-y-4 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`w-9 h-9 rounded-lg inline-flex items-center justify-center shrink-0 mt-0.5 ${vis.iconBg} ${vis.iconText}`}
                    >
                      {renderIndexIcon(idx.key)}
                    </span>
                    <div>
                      <h2 className="text-base font-bold text-[#0F243E]">{idx.label}</h2>
                      <p className="text-xs text-[#51647A]">{idx.englishLabel}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`font-mono text-3xl font-bold tabular-nums leading-none ${
                        idx.isMaster ? 'text-[#D71920]' : vis.valueColor
                      }`}
                    >
                      {idx.value}
                    </span>
                    {idx.isMaster && (
                      <p className="text-[11px] font-semibold text-[#D71920] mt-1">Số Master</p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#EDF4FA] space-y-1">
                  <p className="text-xs font-semibold text-[#0F243E]">{idx.meaningTitle}</p>
                  <p className="text-xs text-[#51647A] leading-relaxed">{idx.meaningSummary}</p>
                </div>
              </div>

              {/* Transparent Calculation Trace */}
              <div className="pt-3 border-t border-[#EDF4FA] space-y-1.5">
                <p className="text-[11px] font-semibold text-[#51647A]">
                  Phép tính chi tiết · {idx.formulaDescription}
                </p>
                <div className="bg-[#F7F9FC] rounded-md px-3 py-2 font-mono text-xs text-[#0F243E] space-y-0.5 tabular-nums overflow-x-auto">
                  {idx.steps.map((st, i) => (
                    <div key={i} className="whitespace-nowrap">
                      {st}
                    </div>
                  ))}
                </div>
                <p className={`text-xs font-medium pt-1 leading-relaxed ${vis.hintBg}`}>
                  Gợi ý chọn số: {idx.accountNumberHint}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Letter-by-Letter Vietnamese Name Conversion */}
      <div className="bg-white border border-[#DDE6F0] rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#EDF4FA] text-[#0057A0] inline-flex items-center justify-center shrink-0 mt-0.5">
              <BookOpen className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-[#0F243E]">
                Bảng quy đổi chi tiết từng chữ cái trong họ tên
              </h2>
              <p className="text-xs text-[#51647A] mt-0.5">
                Hiển thị minh bạch cách tách dấu tiếng Việt, giá trị Pythagoras và phân loại nguyên âm (N) / phụ âm (P).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowMappingTable((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0057A0] hover:underline cursor-pointer whitespace-nowrap"
          >
            <span>{showMappingTable ? 'Ẩn bảng quy đổi 1–9' : 'Xem bảng quy đổi chuẩn Pythagoras 1–9'}</span>
            {showMappingTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showMappingTable && (
          <div className="grid grid-cols-3 sm:grid-cols-9 gap-2 bg-[#F7F9FC] p-3.5 rounded-lg border border-[#EDF4FA]">
            {PYTHAGORAS_TABLE_ROWS.map((row) => (
              <div key={row.value} className="text-center py-2 px-1 bg-white rounded border border-[#DDE6F0]">
                <div className="font-mono text-sm font-bold text-[#0057A0] tabular-nums">{row.value}</div>
                <div className="font-mono text-xs text-[#0F243E] mt-1">{row.letters.join(' · ')}</div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-6 pt-1">
          {report.wordBreakdowns.map((wb, wIdx) => (
            <div key={`${wb.word}-${wIdx}`} className="space-y-2">
              <div className="flex items-baseline gap-2 text-xs">
                <span className="font-semibold text-[#0F243E]">{wb.word}</span>
                <span className="text-[#51647A] font-mono tabular-nums">
                  Tổng: {wb.total} · Nguyên âm: {wb.vowelsTotal} · Phụ âm: {wb.consonantsTotal}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {wb.letters.map((l, lIdx) => (
                  <div
                    key={`${l.normalizedChar}-${lIdx}`}
                    title={l.yReason || `${l.originalChar} → ${l.normalizedChar} = ${l.value}`}
                    className={`w-11 py-1.5 px-1 rounded-md border text-center ${
                      l.role === 'vowel'
                        ? 'bg-[#EDF4FA] border-[#0057A0]/40'
                        : 'bg-white border-[#DDE6F0]'
                    }`}
                  >
                    <div className="font-mono text-xs font-bold text-[#0F243E]">{l.normalizedChar}</div>
                    <div className="font-mono text-xs font-semibold text-[#0057A0] tabular-nums">{l.value}</div>
                    <div className="text-[10px] text-[#51647A]">
                      {l.role === 'vowel' ? 'N.âm' : 'P.âm'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interpretation Synthesis, Priority Digits & Methodology Limitations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 bg-white border border-[#DDE6F0] rounded-xl p-6 space-y-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-[#FFFBEB] text-[#B45309] inline-flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-base font-semibold text-[#0F243E]">
                Điểm nổi bật & Đối chiếu các chỉ số
              </h2>
            </div>
            <ul className="mt-3 space-y-2.5 text-sm text-[#0F243E] leading-relaxed">
              {report.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="font-mono text-xs font-semibold text-[#0057A0] mt-1">0{i + 1}.</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-[#EDF4FA]">
            <h3 className="text-sm font-semibold text-[#0F243E]">
              Tương đồng và khác biệt trong hồ sơ
            </h3>
            <ul className="mt-2.5 space-y-2 text-sm text-[#51647A] leading-relaxed">
              {report.comparisons.map((c, i) => (
                <li key={i}>• {c}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-[#DDE6F0] rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-[#FEF2F2] text-[#D71920] inline-flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </span>
              <h2 className="text-base font-semibold text-[#0F243E]">
                Nhóm chữ số nên ưu tiên khi chọn số tài khoản
              </h2>
            </div>
            <div className="divide-y divide-[#EDF4FA]">
              {report.recommendedDigitReasons.map((item) => (
                <div key={item.digit} className="py-2.5 flex items-center gap-3.5">
                  <span className="w-9 h-9 rounded-lg bg-[#FEF2F2] border border-[#FECACA] font-mono text-lg font-bold text-[#D71920] inline-flex items-center justify-center shrink-0 tabular-nums">
                    {item.digit}
                  </span>
                  <span className="text-xs text-[#51647A] leading-relaxed">{item.reason}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#F7F9FC] border border-[#DDE6F0] rounded-xl p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#0F243E]">
              <Info className="w-4 h-4 text-[#0057A0]" />
              <span>Giới hạn của phương pháp</span>
            </div>
            <ul className="space-y-1.5 text-xs text-[#51647A] leading-relaxed">
              {report.limitations.map((lim, i) => (
                <li key={i}>• {lim}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
