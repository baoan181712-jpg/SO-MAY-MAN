import { Download, Printer } from 'lucide-react';
import { useState } from 'react';
import { CUSTOMER_GOALS } from '../constants/banking';
import { buildTemplateConsultation } from '../engines/consultantTemplates';
import {
  AnalyzedAccountNumber,
  ConsultantScripts,
  CustomerProfile,
  NumerologyReport,
} from '../types';
import { exportRankingToExcel } from '../utils/excelHelper';

interface ConsultationSheetProps {
  profile: CustomerProfile;
  numerology: NumerologyReport | null;
  candidates: AnalyzedAccountNumber[];
  selectedCandidate: AnalyzedAccountNumber | null;
  aiScriptsCache: Record<string, ConsultantScripts>;
  onGoToGenerator: () => void;
}

export default function ConsultationSheet({
  profile,
  numerology,
  candidates,
  selectedCandidate,
  aiScriptsCache,
  onGoToGenerator,
}: ConsultationSheetProps) {
  const [edition, setEdition] = useState<'customer' | 'internal'>('customer');
  const [tellerName, setTellerName] = useState('');
  const [branchName, setBranchName] = useState('');

  const topFive = candidates.slice(0, 5);
  const featured = selectedCandidate ?? topFive[0] ?? null;

  if (topFive.length === 0) {
    return (
      <div className="bg-white border border-[#DDE6F0] rounded-xl p-10 text-center space-y-4">
        <h2 className="text-lg font-semibold text-[#0F243E]">
          Chưa có dữ liệu để xuất Phiếu tư vấn
        </h2>
        <p className="text-sm text-[#51647A] max-w-md mx-auto">
          Hãy chạy phân tích số tài khoản ở Module 4 trước để hệ thống tổng hợp TOP 5 số tài khoản vào Phiếu tư vấn.
        </p>
        <button
          type="button"
          onClick={onGoToGenerator}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0057A0] hover:bg-[#003F75] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Đi tới Đề xuất & Xếp hạng số
        </button>
      </div>
    );
  }

  const featuredScripts = featured
    ? aiScriptsCache[featured.id] ?? buildTemplateConsultation(featured, profile, numerology)
    : null;

  const goalLabels = CUSTOMER_GOALS.filter((g) => profile.goals.includes(g.id)).map(
    (g) => g.label
  );

  const todayFormatted = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Control Toolbar (hidden when printing) */}
      <div className="no-print space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#0057A0]">Module 7 · Bước 7 / 7</p>
            <h1 className="text-2xl font-bold text-[#0F243E] mt-1">
              Phiếu tư vấn số tài khoản cá nhân hóa
            </h1>
            <p className="text-sm text-[#51647A] mt-1">
              Chọn bản rút gọn trao khách hàng hoặc bản đầy đủ nội bộ GDV, sau đó in trực tiếp hoặc lưu thành tệp PDF chuẩn A4.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => exportRankingToExcel(topFive, profile.fullName)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#EDF4FA] text-[#0057A0] border border-[#DDE6F0] text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Excel TOP 5</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0057A0] hover:bg-[#003F75] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-4 h-4" />
              <span>In trực tiếp / Lưu PDF</span>
            </button>
          </div>
        </div>

        <div className="bg-white border border-[#DDE6F0] rounded-xl p-5 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-[#51647A]">Phiên bản xuất phiếu</span>
            <div className="inline-flex items-center gap-1 p-1 bg-[#F7F9FC] border border-[#DDE6F0] rounded-lg">
              <button
                type="button"
                onClick={() => setEdition('customer')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  edition === 'customer'
                    ? 'bg-[#0057A0] text-white'
                    : 'text-[#51647A] hover:text-[#0F243E]'
                }`}
              >
                Bản rút gọn cho Khách hàng
              </button>
              <button
                type="button"
                onClick={() => setEdition('internal')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  edition === 'internal'
                    ? 'bg-[#0057A0] text-white'
                    : 'text-[#51647A] hover:text-[#0F243E]'
                }`}
              >
                Bản đầy đủ nội bộ (GDV)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 max-w-xl">
            <div>
              <label htmlFor="teller-name" className="block text-xs font-medium text-[#51647A] mb-1">
                Chuyên viên tư vấn (tùy chọn in trên phiếu)
              </label>
              <input
                id="teller-name"
                type="text"
                value={tellerName}
                onChange={(e) => setTellerName(e.target.value)}
                placeholder="VD: Nguyễn Thị Thu"
                className="w-full px-3 py-1.5 text-xs bg-white border border-[#C7D6E6] rounded-md outline-none focus:border-[#0057A0]"
              />
            </div>
            <div>
              <label htmlFor="branch-name" className="block text-xs font-medium text-[#51647A] mb-1">
                Chi nhánh / Phòng giao dịch (tùy chọn)
              </label>
              <input
                id="branch-name"
                type="text"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="VD: Phòng Giao Dịch Trung Tâm"
                className="w-full px-3 py-1.5 text-xs bg-white border border-[#C7D6E6] rounded-md outline-none focus:border-[#0057A0]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Printable A4 Banking Handout Sheet */}
      <article className="print-sheet bg-white border border-[#DDE6F0] rounded-xl p-8 sm:p-10 max-w-4xl mx-auto space-y-7">
        {/* Document Masthead */}
        <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-[#0057A0]">
          <div>
            <p className="text-xs font-bold tracking-wider text-[#0057A0]">
              LUCKY NUMBER BANK
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F243E] mt-1">
              {edition === 'customer'
                ? 'PHIẾU TƯ VẤN SỐ TÀI KHOẢN CÁ NHÂN HÓA'
                : 'HỒ SƠ TƯ VẤN SỐ TÀI KHOẢN (BẢN NỘI BỘ GDV)'}
            </h2>
            <p className="text-xs text-[#51647A] mt-1">
              Chọn con số mang dấu ấn riêng
            </p>
          </div>
          <div className="text-left sm:text-right text-xs text-[#51647A] space-y-1">
            <p>
              Ngày lập: <span className="font-mono font-semibold text-[#0F243E]">{todayFormatted}</span>
            </p>
            {branchName.trim() && <p>{branchName.trim()}</p>}
            {tellerName.trim() && <p>GDV phụ trách: {tellerName.trim()}</p>}
          </div>
        </header>

        {/* Customer & Numerology Summary */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6 border-b border-[#EDF4FA]">
          <div className="md:col-span-5 space-y-2">
            <h3 className="text-xs font-bold text-[#0057A0]">THÔNG TIN KHÁCH HÀNG</h3>
            <p className="text-lg font-bold text-[#0F243E]">
              {profile.fullName.trim() || 'Quý khách hàng'}
            </p>
            {numerology && (
              <p className="text-xs text-[#51647A] font-mono tabular-nums">
                Ngày sinh: {numerology.formattedBirthDate}
              </p>
            )}
            {goalLabels.length > 0 && (
              <p className="text-xs text-[#51647A]">
                Mong muốn ưu tiên: <span className="text-[#0F243E] font-medium">{goalLabels.join(', ')}</span>
              </p>
            )}
          </div>

          <div className="md:col-span-7 space-y-2">
            <h3 className="text-xs font-bold text-[#0057A0]">HỒ SƠ THẦN SỐ HỌC PYTHAGORAS</h3>
            {numerology ? (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
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
                    className="p-2 rounded border border-[#DDE6F0] bg-[#F7F9FC] text-center"
                  >
                    <p className="text-[10px] text-[#51647A] truncate">{idx.label}</p>
                    <p className="font-mono text-lg font-bold text-[#0057A0] tabular-nums mt-0.5">
                      {idx.value}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#51647A]">Chưa nhập đầy đủ dữ liệu ngày sinh / họ tên.</p>
            )}
            {numerology && (
              <p className="text-xs text-[#51647A] pt-1">
                Nhóm chữ số ưu tiên tham khảo:{' '}
                <span className="font-mono font-semibold text-[#D71920]">
                  {numerology.recommendedDigits.join(' · ')}
                </span>
              </p>
            )}
          </div>
        </section>

        {/* TOP 5 Proposed Account Numbers */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-[#0057A0]">
            DANH SÁCH TOP {topFive.length} SỐ TÀI KHOẢN ĐƯỢC ĐỀ XUẤT
          </h3>

          <div className="space-y-3">
            {topFive.map((item, idx) => (
              <div
                key={item.id}
                className="avoid-break p-4 rounded-lg border border-[#DDE6F0] bg-[#F7F9FC]/60 space-y-2"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs font-bold text-[#D71920]">
                      #{idx + 1}
                    </span>
                    <span className="font-mono text-xl font-bold tracking-wider text-[#0F243E] tabular-nums">
                      {item.formatted}
                    </span>
                    <span className="text-xs text-[#51647A]">{item.sourceLabel}</span>
                  </div>
                  <span className="font-mono text-sm font-bold text-[#0057A0] tabular-nums">
                    Điểm tham khảo: {item.score.total}/100
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs">
                  <p className="text-[#51647A]">
                    Cách đọc nhịp: <strong className="text-[#0F243E]">{item.eastern.readings.byPair}</strong>
                  </p>
                  <p className="text-[#51647A]">
                    Ý nghĩa dân gian: <strong className="text-[#0057A0]">{item.eastern.readings.folkPopular}</strong>
                  </p>
                </div>

                <p className="text-xs text-[#0F243E] leading-relaxed">
                  Lý do lựa chọn: {item.selectionReasons.join('. ')}.
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Personalized Advisory Note */}
        {featured && featuredScripts && (
          <section className="avoid-break p-5 rounded-lg border border-[#0057A0]/25 bg-[#EDF4FA]/40 space-y-2">
            <h3 className="text-xs font-bold text-[#0057A0]">
              LỜI TƯ VẤN RIÊNG CHO PHƯƠNG ÁN NỔI BẬT ({featured.formatted})
            </h3>
            <p className="text-sm text-[#0F243E] leading-relaxed">
              {featuredScripts.personalizedSummary}
            </p>
          </section>
        )}

        {/* Internal GDV Only Section */}
        {edition === 'internal' && featured && featuredScripts && (
          <section className="avoid-break space-y-4 pt-4 border-t border-[#DDE6F0]">
            <h3 className="text-xs font-bold text-[#D71920]">
              PHẦN DÀNH RIÊNG CHO GIAO DỊCH VIÊN (NỘI BỘ)
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-lg border border-[#DDE6F0] bg-white space-y-1">
                <p className="font-semibold text-[#0057A0]">Kịch bản 1 · Gần gũi, tự nhiên</p>
                <p className="text-[#0F243E] leading-relaxed">{featuredScripts.scripts.friendly}</p>
              </div>
              <div className="p-3.5 rounded-lg border border-[#DDE6F0] bg-white space-y-1">
                <p className="font-semibold text-[#0057A0]">Kịch bản 2 · Chuyên nghiệp, có chiều sâu</p>
                <p className="text-[#0F243E] leading-relaxed">{featuredScripts.scripts.professional}</p>
              </div>
              <div className="p-3.5 rounded-lg border border-[#DDE6F0] bg-white space-y-1">
                <p className="font-semibold text-[#0057A0]">Kịch bản 3 · Khơi gợi nhu cầu & chốt nhẹ nhàng</p>
                <p className="text-[#0F243E] leading-relaxed">{featuredScripts.scripts.closing}</p>
              </div>
            </div>

            {profile.notes.trim() && (
              <div className="text-xs text-[#51647A]">
                <strong className="text-[#0F243E]">Ghi chú sở thích khách hàng:</strong> {profile.notes}
              </div>
            )}
          </section>
        )}

        {/* Compliance Footer */}
        <footer className="pt-4 border-t border-[#DDE6F0] text-[11px] text-[#51647A] leading-relaxed space-y-1">
          <p>
            * Lưu ý khả dụng: Các số tài khoản gợi ý cần được đối chiếu trực tiếp trên hệ thống kho số chính thức của ngân hàng tại thời điểm đăng ký để xác nhận tình trạng khả dụng và biểu phí hiện hành.
          </p>
          <p>
            * Lưu ý tham khảo: Phân tích thần số học Pythagoras và ý nghĩa số phương Đông mang tính văn hóa – cá nhân hóa trải nghiệm lựa chọn số đẹp, không cấu thành cam kết hay bằng chứng khoa học về tài vận.
          </p>
        </footer>
      </article>
    </div>
  );
}
