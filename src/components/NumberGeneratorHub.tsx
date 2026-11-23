import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Compass,
  Crown,
  Database,
  Download,
  Gem,
  Heart,
  ListOrdered,
  RefreshCw,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Upload,
  Zap,
} from 'lucide-react';
import { ChangeEvent, useRef, useState } from 'react';
import NumberMeaningBadge from './NumberMeaningBadge';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DEFAULT_WEIGHTS, NUMBER_STYLES } from '../constants/banking';
import {
  CONVENTIONAL_PAIRS,
  EASTERN_DIGITS,
} from '../engines/easternNumerology';
import {
  AnalyzedAccountNumber,
  CustomerProfile,
  InventoryNumberItem,
  NumberStyleId,
  NumerologyReport,
  ScoringWeights,
} from '../types';
import { exportRankingToExcel, importNumbersFromFile } from '../utils/excelHelper';

interface NumberGeneratorHubProps {
  profile: CustomerProfile;
  numerology: NumerologyReport | null;
  mode: 'ai' | 'manual';
  onModeChange: (mode: 'ai' | 'manual') => void;
  selectedLength: number;
  onLengthChange: (len: number) => void;
  selectedStyle: NumberStyleId;
  onStyleChange: (style: NumberStyleId) => void;
  weights: ScoringWeights;
  onWeightsChange: (weights: ScoringWeights) => void;
  manualInput: string;
  onManualInputChange: (val: string) => void;
  manualParseErrors: string[];
  onRunManualAnalysis: () => void;
  onAnalyzeFromInventory: (numbers: string[]) => void;
  onGenerateModeB: () => void;
  candidates: AnalyzedAccountNumber[];
  selectedCandidateId: string | null;
  onSelectCandidate: (candidate: AnalyzedAccountNumber) => void;
  inventory: InventoryNumberItem[];
}

const LENGTH_OPTIONS = [3, 4, 5, 6, 7, 8];

const STYLE_VISUALS: Record<
  NumberStyleId,
  { icon: typeof TrendingUp; bg: string; text: string }
> = {
  wealth_growth: { icon: Gem, bg: 'bg-[#FFFBEB]', text: 'text-[#B45309]' },
  business_prosperity: { icon: Briefcase, bg: 'bg-[#FEF2F2]', text: 'text-[#D71920]' },
  career_leadership: { icon: Crown, bg: 'bg-[#EDF4FA]', text: 'text-[#0057A0]' },
  peace_stability: { icon: Shield, bg: 'bg-[#ECFDF5]', text: 'text-[#047857]' },
  family_harmony: { icon: Heart, bg: 'bg-[#FFF1F2]', text: 'text-[#BE123C]' },
  unique_personalized: { icon: Star, bg: 'bg-[#EEF2FF]', text: 'text-[#4338CA]' },
  easy_memorable: { icon: Zap, bg: 'bg-[#E0F2FE]', text: 'text-[#0369A1]' },
};

export default function NumberGeneratorHub({
  profile,
  numerology,
  mode,
  onModeChange,
  selectedLength,
  onLengthChange,
  selectedStyle,
  onStyleChange,
  weights,
  onWeightsChange,
  manualInput,
  onManualInputChange,
  manualParseErrors,
  onRunManualAnalysis,
  onAnalyzeFromInventory,
  onGenerateModeB,
  candidates,
  selectedCandidateId,
  onSelectCandidate,
  inventory,
}: NumberGeneratorHubProps) {
  const [showWeightsPanel, setShowWeightsPanel] = useState(false);
  const [showEasternRef, setShowEasternRef] = useState(false);
  const [showAllCandidates, setShowAllCandidates] = useState(false);
  const [previewCandidateId, setPreviewCandidateId] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const topFive = candidates.slice(0, 5);
  const displayedTable = showAllCandidates ? candidates : candidates.slice(0, 10);
  const spotlightCandidate =
    candidates.find((c) => c.id === previewCandidateId) ??
    candidates.find((c) => c.id === selectedCandidateId) ??
    topFive[0] ??
    null;
  const spotlightRank = spotlightCandidate
    ? candidates.findIndex((c) => c.id === spotlightCandidate.id) + 1
    : 1;

  const totalWeights =
    weights.numerology +
    weights.eastern +
    weights.goalFit +
    weights.structure +
    weights.memorability;

  const chartData = topFive.map((item) => ({
    name: item.formatted,
    'Thần số học': item.score.breakdown.numerology,
    'Phương Đông': item.score.breakdown.eastern,
    'Mong muốn': item.score.breakdown.goalFit,
    'Cấu trúc': item.score.breakdown.structure,
    'Dễ nhớ': item.score.breakdown.memorability,
  }));

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploadStatus(null);
    try {
      const { rows, skippedCount } = await importNumbersFromFile(file);
      if (rows.length === 0) {
        setUploadError('Không tìm thấy dãy số hợp lệ (3–16 chữ số) trong tệp vừa tải lên.');
      } else {
        const listStr = rows.map((r) => r.number).join('\n');
        onManualInputChange(listStr);
        setUploadStatus(
          `Đã đọc ${rows.length} số từ "${file.name}"${skippedCount > 0 ? ` (bỏ qua ${skippedCount} dòng không hợp lệ)` : ''}. Bấm "Phân tích & Xếp hạng" để chấm điểm.`
        );
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Không thể đọc tệp Excel.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const applyStyleWeights = () => {
    const styleObj = NUMBER_STYLES.find((s) => s.id === selectedStyle);
    if (styleObj) {
      onWeightsChange({ ...styleObj.recommendedWeights });
    }
  };

  const handleExportExcel = async () => {
    if (candidates.length === 0) return;
    await exportRankingToExcel(candidates, profile.fullName);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#0057A0]">Module 3, 4 & 5 · Bước 3 & 4 / 7</p>
          <h1 className="text-2xl font-bold text-[#0F243E] mt-1">
            Tạo, phân tích & xếp hạng số tài khoản
          </h1>
          <p className="text-sm text-[#51647A] mt-1">
            {numerology
              ? `Đang đối chiếu theo hồ sơ ${profile.fullName} (Số chủ đạo ${numerology.indices.lifePath.value} · Nhóm số ưu tiên: ${numerology.recommendedDigits.join(', ')})`
              : 'Chưa nhập hồ sơ khách hàng — hệ thống vẫn phân tích chính xác theo ý nghĩa Phương Đông và cấu trúc số.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEasternRef((p) => !p)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0057A0] bg-white border border-[#DDE6F0] hover:bg-[#EDF4FA] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{showEasternRef ? 'Ẩn thư viện số 0–9' : 'Thư viện số Phương Đông'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowWeightsPanel((p) => !p)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0F243E] bg-white border border-[#DDE6F0] hover:bg-[#EDF4FA] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Trọng số chấm điểm (100đ)</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher + Controls */}
      <section className="bg-white border border-[#DDE6F0] rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EDF4FA] pb-4">
          <div className="inline-flex items-center gap-1 p-1 bg-[#F7F9FC] border border-[#DDE6F0] rounded-lg self-start">
            <button
              type="button"
              onClick={() => onModeChange('ai')}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                mode === 'ai'
                  ? 'bg-[#0057A0] text-white'
                  : 'text-[#51647A] hover:text-[#0F243E]'
              }`}
            >
              Chế độ B: Đề xuất số thông minh (TOP 5)
            </button>
            <button
              type="button"
              onClick={() => onModeChange('manual')}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                mode === 'manual'
                  ? 'bg-[#0057A0] text-white'
                  : 'text-[#51647A] hover:text-[#0F243E]'
              }`}
            >
              Chế độ A: GDV nhập số / Excel / Kho số
            </button>
          </div>

          <p className="text-xs text-[#51647A]">
            {mode === 'ai'
              ? 'Sinh tối thiểu 12 phương án không trùng lặp, đúng độ dài và chọn lọc TOP 5.'
              : 'Phân tích số có sẵn của khách hàng, danh sách Excel hoặc kho số nội bộ.'}
          </p>
        </div>

        {mode === 'ai' ? (
          <div className="space-y-5">
            {/* Length Picker */}
            <div className="space-y-2">
              <span className="block text-sm font-semibold text-[#0F243E]">
                Chọn độ dài dãy số đẹp (3 – 8 chữ số)
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {LENGTH_OPTIONS.map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => onLengthChange(len)}
                    className={`px-4 py-2 text-sm font-mono font-semibold rounded-lg border transition-colors cursor-pointer tabular-nums whitespace-nowrap ${
                      selectedLength === len
                        ? 'bg-[#0057A0] text-white border-[#0057A0]'
                        : 'bg-white text-[#0F243E] border-[#C7D6E6] hover:border-[#0057A0]'
                    }`}
                  >
                    {len} chữ số
                  </button>
                ))}
              </div>
            </div>

            {/* Style Picker */}
            <div className="space-y-2">
              <span className="block text-sm font-semibold text-[#0F243E]">
                Chọn phong cách tư vấn
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {NUMBER_STYLES.map((st) => {
                  const active = selectedStyle === st.id;
                  const visual = STYLE_VISUALS[st.id];
                  const StyleIcon = visual.icon;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => onStyleChange(st.id)}
                      className={`text-left p-3.5 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                        active
                          ? 'bg-[#EDF4FA] border-[#0057A0] shadow-xs'
                          : 'bg-white border-[#DDE6F0] hover:border-[#0057A0]/50 hover:bg-[#F7F9FC]'
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${visual.bg} ${visual.text}`}
                      >
                        <StyleIcon className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#0F243E]">{st.label}</p>
                        <p className="text-xs text-[#51647A] mt-0.5 leading-snug">{st.shortDesc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#EDF4FA]">
              <p className="text-xs text-[#51647A]">
                Lưu ý: Các dãy số do hệ thống tạo ra là phương án đề xuất mô phỏng; cần đối chiếu kho số chính thức của ngân hàng trước khi xác nhận khả dụng.
              </p>
              <button
                type="button"
                onClick={() => {
                  setPreviewCandidateId(null);
                  onGenerateModeB();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0057A0] hover:bg-[#003F75] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                <span>Tạo & Xếp hạng TOP 5 ({selectedLength} số)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-8 space-y-2">
                <label htmlFor="manual-numbers" className="block text-sm font-semibold text-[#0F243E]">
                  Nhập một hoặc nhiều số tài khoản (mỗi số một dòng hoặc ngăn cách bằng dấu phẩy)
                </label>
                <textarea
                  id="manual-numbers"
                  rows={4}
                  value={manualInput}
                  onChange={(e) => onManualInputChange(e.target.value)}
                  placeholder={'Ví dụ:\n686868\n168888\n397986\n688668'}
                  className="w-full px-3.5 py-2.5 font-mono text-sm text-[#0F243E] bg-white border border-[#C7D6E6] focus:border-[#0057A0] focus:ring-2 focus:ring-[#0057A0]/15 rounded-lg outline-none"
                />
                {manualParseErrors.length > 0 && (
                  <p className="text-xs text-[#D71920]">
                    Bỏ qua các giá trị chưa đúng định dạng (cần 3–16 chữ số): {manualParseErrors.join(', ')}
                  </p>
                )}
                {uploadStatus && <p className="text-xs text-[#0057A0] font-medium">{uploadStatus}</p>}
                {uploadError && <p className="text-xs text-[#D71920] font-medium">{uploadError}</p>}
              </div>

              <div className="lg:col-span-4 space-y-3 bg-[#F7F9FC] border border-[#EDF4FA] rounded-lg p-4">
                <p className="text-xs font-semibold text-[#0F243E]">Nguồn nhập nhanh cho GDV</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-white hover:bg-[#EDF4FA] text-[#0057A0] border border-[#C7D6E6] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Nhập danh sách từ Excel (.xlsx / .csv)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const available = inventory
                      .filter((i) => i.status !== 'registered')
                      .map((i) => i.number);
                    onAnalyzeFromInventory(available);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-white hover:bg-[#EDF4FA] text-[#0F243E] border border-[#C7D6E6] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5 text-[#0057A0]" />
                  <span>Chấm điểm toàn bộ Kho số nội bộ ({inventory.filter((i) => i.status !== 'registered').length})</span>
                </button>
                <p className="text-[11px] text-[#51647A] leading-relaxed">
                  Tệp Excel chỉ cần đặt danh sách số tài khoản ở cột đầu tiên (cột A).
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#EDF4FA]">
              <span className="text-xs text-[#51647A]">
                Hệ thống tự động chấm điểm 100 điểm và xếp hạng toàn bộ các số đã nhập.
              </span>
              <button
                type="button"
                onClick={() => {
                  setPreviewCandidateId(null);
                  onRunManualAnalysis();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0057A0] hover:bg-[#003F75] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Phân tích & Xếp hạng</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Collapsible Scoring Weights Panel (Module 5) */}
      {showWeightsPanel && (
        <section className="bg-white border border-[#DDE6F0] rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-[#0F243E]">
                Thang điểm 100 minh bạch & Tùy chỉnh trọng số
              </h2>
              <p className="text-xs text-[#51647A] mt-0.5">
                Tổng trọng số hiện tại: <span className="font-mono font-semibold text-[#0057A0] tabular-nums">{totalWeights}</span> (hệ thống tự chuẩn hóa theo tỷ lệ 100 điểm).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={applyStyleWeights}
                className="px-3 py-1.5 text-xs font-semibold text-[#0057A0] bg-[#EDF4FA] hover:bg-[#DCEAF7] rounded-md cursor-pointer"
              >
                Áp dụng trọng số theo phong cách đang chọn
              </button>
              <button
                type="button"
                onClick={() => onWeightsChange({ ...DEFAULT_WEIGHTS })}
                className="px-3 py-1.5 text-xs font-medium text-[#51647A] border border-[#DDE6F0] rounded-md hover:text-[#0F243E] cursor-pointer"
              >
                Mặc định (30/25/20/15/10)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {(
              [
                ['numerology', 'Tương đồng Thần số học', 30],
                ['eastern', 'Tổ hợp số Phương Đông', 25],
                ['goalFit', 'Phù hợp mong muốn & gu', 20],
                ['structure', 'Cấu trúc cân đối, dễ đọc', 15],
                ['memorability', 'Dễ nhớ, lặp & đối xứng', 10],
              ] as [keyof ScoringWeights, string, number][]
            ).map(([key, label, defVal]) => (
              <div key={key} className="space-y-1.5 bg-[#F7F9FC] p-3.5 rounded-lg border border-[#EDF4FA]">
                <div className="flex items-baseline justify-between gap-2">
                  <label htmlFor={`weight-${key}`} className="text-xs font-semibold text-[#0F243E]">
                    {label}
                  </label>
                  <span className="font-mono text-sm font-bold text-[#0057A0] tabular-nums">
                    {weights[key]}đ
                  </span>
                </div>
                <input
                  id={`weight-${key}`}
                  type="range"
                  min={0}
                  max={50}
                  step={5}
                  value={weights[key]}
                  onChange={(e) =>
                    onWeightsChange({ ...weights, [key]: Number(e.target.value) })
                  }
                  className="w-full accent-[#0057A0] cursor-pointer"
                />
                <p className="text-[11px] text-[#51647A]">Chuẩn mặc định: {defVal} điểm</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-[#51647A] border-t border-[#EDF4FA] pt-3">
            Lưu ý chuẩn mực: Điểm số chỉ dùng để xếp hạng mức độ hài hòa về cấu trúc, cách đọc và độ tương đồng với hồ sơ cá nhân; tuyệt đối không sử dụng làm bằng chứng khoa học về tài vận, may mắn hay thành công.
          </p>
        </section>
      )}

      {/* Collapsible Eastern Numerology Library Reference (Module 3) */}
      {showEasternRef && (
        <section className="bg-white border border-[#DDE6F0] rounded-xl p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-[#0F243E]">
              Thư viện ý nghĩa số Phương Đông (0–9) & Tổ hợp phổ biến
            </h2>
            <p className="text-xs text-[#51647A] mt-0.5">
              Âm Dương: số chẵn là Âm, số lẻ là Dương · Ngũ Hành theo Hà Đồ (1,6 Thủy · 2,7 Hỏa · 3,8 Mộc · 4,9 Kim · 5,0 Thổ).
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Object.values(EASTERN_DIGITS).map((d) => (
              <div key={d.digit} className="p-3 rounded-lg border border-[#EDF4FA] bg-[#F7F9FC] space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-xl font-bold text-[#0057A0] tabular-nums">{d.digit}</span>
                  <span className="text-[11px] text-[#51647A]">
                    {d.yinYang} · {d.elementHaDo}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#0F243E]">
                  {d.sinoVietnamese} · {d.folkReading}
                </p>
                <p className="text-[11px] text-[#51647A] leading-snug">{d.meaning}</p>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#EDF4FA]">
            <p className="text-xs font-semibold text-[#0F243E] mb-2">
              Các cặp số có quy ước dân gian phổ biến (không gán ghép tùy tiện cho tổ hợp ngoài quy ước):
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
              {Object.entries(CONVENTIONAL_PAIRS).map(([pair, info]) => (
                <div key={pair} className="px-2.5 py-2 rounded border border-[#DDE6F0] bg-white">
                  <span className="font-mono font-bold text-[#D71920] tabular-nums">{pair}</span>
                  <span className="mx-1.5 text-[#C7D6E6]">·</span>
                  <span className="font-medium text-[#0F243E]">{info.reading}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quick Value & Meaning Spotlight + TOP 5 Highlighted Candidates */}
      {topFive.length > 0 ? (
        <section className="space-y-6">
          {/* STAGE 1: Instant Value & Meaning Panel for Fast Teller Glance */}
          {spotlightCandidate && (
            <div className="bg-white border border-[#0057A0]/35 rounded-xl p-6 sm:p-7 space-y-5 shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-5 border-b border-[#EDF4FA]">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#0057A0]">
                    <span className="w-6 h-6 rounded-md bg-[#EDF4FA] text-[#0057A0] inline-flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5" />
                    </span>
                    <span>
                      1. Diễn giải nhanh Giá trị & Ý nghĩa · Đang xem Hạng #{spotlightRank} ({spotlightCandidate.sourceLabel})
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-3xl sm:text-4xl font-bold tracking-wider text-[#0F243E] tabular-nums">
                      {spotlightCandidate.formatted}
                    </span>
                    <NumberMeaningBadge eastern={spotlightCandidate.eastern} size="md" />
                  </div>
                  <p className="text-xs text-[#51647A]">
                    Đọc nhịp: <strong className="text-[#0F243E]">{spotlightCandidate.eastern.readings.byPair}</strong>
                    <span className="mx-2 text-[#C7D6E6]">·</span>
                    Dân gian: <strong className="text-[#0057A0]">{spotlightCandidate.eastern.readings.folkPopular}</strong>
                  </p>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 shrink-0">
                  <div className="text-left lg:text-right">
                    <p className="text-[11px] text-[#51647A]">Điểm tham khảo</p>
                    <p className="font-mono text-2xl font-bold text-[#D71920] tabular-nums leading-tight">
                      {spotlightCandidate.score.total}
                      <span className="text-sm font-medium text-[#51647A]">/100</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectCandidate(spotlightCandidate)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#D71920] hover:bg-[#B01218] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <span>Phân tích chi tiết & Kịch bản bán</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-[#FFFBEB]/65 border border-[#FDE68A]/80 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#FEF3C7] text-[#B45309] inline-flex items-center justify-center shrink-0">
                      <Gem className="w-4 h-4" />
                    </span>
                    <p className="text-xs font-bold text-[#92400E]">Ý nghĩa nổi bật của dãy số</p>
                  </div>
                  <p className="text-sm text-[#0F243E] leading-relaxed">
                    {spotlightCandidate.eastern.quickValuePitch.coreMeaning}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[#ECFDF5]/65 border border-[#A7F3D0]/80 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#D1FAE5] text-[#047857] inline-flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                    <p className="text-xs font-bold text-[#065F46]">Giá trị thực tế cho khách hàng</p>
                  </div>
                  <p className="text-sm text-[#0F243E] leading-relaxed">
                    {spotlightCandidate.eastern.quickValuePitch.practicalValue}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[#EDF4FA]/80 border border-[#BFDBFE] space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#DBEAFE] text-[#0057A0] inline-flex items-center justify-center shrink-0">
                      <Target className="w-4 h-4" />
                    </span>
                    <p className="text-xs font-bold text-[#003F75]">Điểm chạm hồ sơ & Chốt đuôi</p>
                  </div>
                  <p className="text-sm text-[#0F243E] leading-relaxed">
                    {spotlightCandidate.numerologyMatches.length > 0
                      ? `Trùng khớp hồ sơ Thần số học qua số ${spotlightCandidate.numerologyMatches
                          .map((m) => `${m.digit} (${m.matchedIndices[0]})`)
                          .slice(0, 2)
                          .join(', ')}. `
                      : ''}
                    {spotlightCandidate.eastern.quickValuePitch.endingHighlight}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TOP 5 Cards */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-[#FEF2F2] text-[#D71920] inline-flex items-center justify-center shrink-0 mt-0.5">
                  <Award className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-[#0F243E]">
                    TOP {topFive.length} số tài khoản phù hợp nhất
                  </h2>
                  <p className="text-xs text-[#51647A]">
                    Di chuột vào nhãn ý nghĩa để xem nhanh diễn giải, chạm thẻ để xem chi tiết ở khung trên hoặc mở kịch bản bán hàng.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleExportExcel}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0057A0] bg-white border border-[#DDE6F0] hover:bg-[#EDF4FA] rounded-lg transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất bảng xếp hạng Excel</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {topFive.map((item, index) => {
                const isSpotlight = spotlightCandidate?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setPreviewCandidateId(item.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setPreviewCandidateId(item.id);
                      }
                    }}
                    className={`bg-white rounded-xl p-5 border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                      isSpotlight
                        ? 'border-[#0057A0] ring-2 ring-[#0057A0]/15 shadow-xs'
                        : 'border-[#DDE6F0] hover:border-[#0057A0]/60 hover:bg-[#FCFDFE]'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-bold tabular-nums ${
                            index === 0 ? 'text-[#D71920]' : 'text-[#0057A0]'
                          }`}
                        >
                          {index === 0 ? (
                            <Crown className="w-3.5 h-3.5 text-[#D71920]" />
                          ) : (
                            <Compass className="w-3.5 h-3.5 text-[#0089CF]" />
                          )}
                          <span>Hạng #{index + 1}</span>
                        </span>
                        <span className="font-mono text-sm font-bold text-[#0F243E] tabular-nums">
                          {item.score.total}/100đ
                        </span>
                      </div>

                      <div className="space-y-2">
                        <p className="font-mono text-2xl font-bold tracking-wider text-[#0F243E] tabular-nums break-all">
                          {item.formatted}
                        </p>
                        <NumberMeaningBadge
                          eastern={item.eastern}
                          size="sm"
                          tooltipAlign={index === 4 ? 'right' : 'left'}
                        />
                      </div>

                      <div className="pt-2.5 border-t border-[#EDF4FA] space-y-1.5">
                        <p className="text-xs text-[#0F243E] leading-relaxed line-clamp-3">
                          {item.eastern.quickValuePitch.coreMeaning}
                        </p>
                        <p className="text-[11px] text-[#51647A]">
                          Đọc nhịp: {item.eastern.readings.byPair}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#EDF4FA] flex items-center justify-between gap-2">
                      <span className="text-[11px] font-medium text-[#51647A] truncate">
                        {isSpotlight ? 'Đang xem nhanh' : 'Xem nhanh'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCandidate(item);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#0057A0] hover:text-[#D71920] transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Chi tiết & Kịch bản <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STAGE 2: Detailed Score Comparison Chart */}
          <div className="bg-white border border-[#DDE6F0] rounded-xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-[#EDF4FA] text-[#0057A0] inline-flex items-center justify-center shrink-0 mt-0.5">
                  <BarChart3 className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-[#0F243E]">
                    2. Phân tích so sánh điểm TOP {topFive.length} phương án
                  </h3>
                  <p className="text-xs text-[#51647A]">
                    So sánh trực quan 5 nhóm tiêu chí chấm điểm minh bạch (thang 100 điểm).
                  </p>
                </div>
              </div>
              <span className="text-xs text-[#51647A] tabular-nums">
                Tổng phương án đã phân tích: {candidates.length}
              </span>
            </div>

            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDF4FA" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#0F243E', fontFamily: 'JetBrains Mono' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#51647A' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#DDE6F0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="Thần số học" stackId="a" fill="#0057A0" />
                  <Bar dataKey="Phương Đông" stackId="a" fill="#0089CF" />
                  <Bar dataKey="Mong muốn" stackId="a" fill="#D71920" />
                  <Bar dataKey="Cấu trúc" stackId="a" fill="#4B7EA8" />
                  <Bar dataKey="Dễ nhớ" stackId="a" fill="#9BBAD4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Full Ranking Table */}
          <div className="bg-white border border-[#DDE6F0] rounded-xl overflow-visible">
            <div className="px-6 py-4 border-b border-[#EDF4FA] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#047857] inline-flex items-center justify-center shrink-0 mt-0.5">
                  <ListOrdered className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-[#0F243E]">
                    Bảng xếp hạng chi tiết ({candidates.length} phương án)
                  </h3>
                  <p className="text-xs text-[#51647A]">
                    Mọi số đều hiển thị nhãn ý nghĩa kèm tooltip nhìn nhanh; bấm vào dòng để xem tóm tắt phía trên.
                  </p>
                </div>
              </div>
              {candidates.length > 10 && (
                <button
                  type="button"
                  onClick={() => setShowAllCandidates((p) => !p)}
                  className="text-xs font-semibold text-[#0057A0] hover:underline cursor-pointer self-start sm:self-auto"
                >
                  {showAllCandidates ? 'Thu gọn 10 dòng đầu' : `Xem toàn bộ ${candidates.length} phương án`}
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#DDE6F0] bg-[#F7F9FC] text-xs font-semibold text-[#51647A]">
                    <th className="py-3 px-4">Hạng</th>
                    <th className="py-3 px-4">Số tài khoản & Nhãn ý nghĩa</th>
                    <th className="py-3 px-4">Diễn giải nhanh</th>
                    <th className="py-3 px-4">Cấu trúc · Âm Dương</th>
                    <th className="py-3 px-4 text-right">Điểm tổng</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDF4FA] text-sm">
                  {displayedTable.map((item, idx) => (
                    <tr
                      key={item.id}
                      onClick={() => setPreviewCandidateId(item.id)}
                      className="hover:bg-[#F7F9FC] transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono text-xs font-bold tabular-nums">
                        <span className={idx === 0 ? 'text-[#D71920]' : 'text-[#51647A]'}>
                          #{idx + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-[#0F243E] tabular-nums">
                            {item.formatted}
                          </span>
                          <NumberMeaningBadge
                            eastern={item.eastern}
                            size="sm"
                            tooltipPlacement={idx < 2 ? 'bottom' : 'top'}
                          />
                        </div>
                        <div className="text-[11px] text-[#51647A] mt-0.5">{item.sourceLabel}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-[#0F243E] max-w-xs">
                        <div className="line-clamp-1 font-medium">{item.eastern.quickValuePitch.coreMeaning}</div>
                        <div className="text-[11px] text-[#51647A] mt-0.5">Đọc: {item.eastern.readings.byPair}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-[#51647A]">
                        <div>{item.eastern.structureTags[0]}</div>
                        <div className="text-[11px] mt-0.5">{item.eastern.yinYang.ratioLabel}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#0057A0] tabular-nums">
                        {item.score.total}đ
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCandidate(item);
                          }}
                          className="text-xs font-semibold text-[#0057A0] hover:text-[#D71920] transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Chi tiết & Kịch bản →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : (
        <div className="bg-white border border-[#DDE6F0] rounded-xl p-10 text-center space-y-3">
          <h3 className="text-base font-semibold text-[#0F243E]">Chưa có danh sách số được phân tích</h3>
          <p className="text-sm text-[#51647A] max-w-md mx-auto">
            Bấm "Tạo & Xếp hạng TOP 5" ở Chế độ B hoặc nhập số tài khoản ở Chế độ A để hệ thống bắt đầu chấm điểm.
          </p>
        </div>
      )}
    </div>
  );
}
