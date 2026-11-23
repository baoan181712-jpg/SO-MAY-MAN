import {
  ArrowRight,
  Award,
  Briefcase,
  Calculator,
  Database,
  FileText,
  Heart,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Star,
  UserCheck,
  UserRound,
} from 'lucide-react';
import { SAMPLE_CUSTOMERS } from '../constants/banking';
import {
  ActiveTab,
  AnalyzedAccountNumber,
  CustomerProfile,
  NumerologyReport,
} from '../types';
import NumberMeaningBadge from './NumberMeaningBadge';

interface OverviewPageProps {
  profile: CustomerProfile;
  numerology: NumerologyReport | null;
  topCandidates: AnalyzedAccountNumber[];
  inventoryCount: number;
  onNavigate: (tab: ActiveTab) => void;
  onLoadSample: (sample: CustomerProfile) => void;
}

const WORKFLOW_STEPS: {
  step: string;
  title: string;
  desc: string;
  tab: ActiveTab;
  icon: typeof UserRound;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    step: '01',
    title: 'Nhập hồ sơ khách hàng',
    desc: 'Ghi nhận họ tên, ngày sinh, tính cách tự mô tả và nhóm mong muốn tài chính.',
    tab: 'profile',
    icon: UserRound,
    iconBg: 'bg-[#EDF4FA]',
    iconColor: 'text-[#0057A0]',
  },
  {
    step: '02',
    title: 'Phân tích Thần số học',
    desc: 'Tự động tính 6 chỉ số Pythagoras bằng thuật toán minh bạch từng phép cộng.',
    tab: 'numerology',
    icon: Calculator,
    iconBg: 'bg-[#EEF2FF]',
    iconColor: 'text-[#4338CA]',
  },
  {
    step: '03',
    title: 'Nhập số hoặc Đề xuất TOP 5',
    desc: 'Chấm điểm số GDV nhập, kho số Excel hoặc sinh bộ 10+ phương án chọn lọc TOP 5.',
    tab: 'generator',
    icon: Sparkles,
    iconBg: 'bg-[#FEF2F2]',
    iconColor: 'text-[#D71920]',
  },
  {
    step: '04',
    title: 'Trợ lý đọc số & Kịch bản',
    desc: 'Tạo cách đọc 3 tầng, giải thích dân gian, 3 kịch bản tư vấn và xử lý từ chối.',
    tab: 'consultant',
    icon: MessageSquareText,
    iconBg: 'bg-[#FFFBEB]',
    iconColor: 'text-[#B45309]',
  },
  {
    step: '05',
    title: 'Xuất phiếu tư vấn PDF / In',
    desc: 'In trực tiếp bản đầy đủ nội bộ GDV hoặc bản rút gọn trang trọng cho khách hàng.',
    tab: 'sheet',
    icon: FileText,
    iconBg: 'bg-[#ECFDF5]',
    iconColor: 'text-[#047857]',
  },
];

const SAMPLE_CARD_STYLES = [
  { icon: Briefcase, bg: 'bg-[#FEF2F2]', color: 'text-[#D71920]', tag: 'Doanh nhân · Kinh doanh' },
  { icon: Star, bg: 'bg-[#EEF2FF]', color: 'text-[#4338CA]', tag: 'Cá tính · Sáng tạo' },
  { icon: Heart, bg: 'bg-[#ECFDF5]', color: 'text-[#047857]', tag: 'Gia đình · Tích lũy' },
];

export default function OverviewPage({
  profile,
  numerology,
  topCandidates,
  inventoryCount,
  onNavigate,
  onLoadSample,
}: OverviewPageProps) {
  return (
    <div className="space-y-8">
      {/* Main Hero Workbench Header */}
      <section className="bg-white border border-[#DDE6F0] rounded-xl overflow-hidden shadow-xs">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0057A0] via-[#0089CF] to-[#D71920]" />
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#0057A0]">
              <span className="w-6 h-6 rounded-md bg-[#EDF4FA] text-[#0057A0] inline-flex items-center justify-center">
                <Award className="w-3.5 h-3.5" />
              </span>
              <span>Lucky Number Bank · Trợ lý tư vấn số tài khoản cá nhân hóa</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F243E] tracking-tight leading-tight max-w-2xl">
              Chọn con số mang dấu ấn riêng cho từng khách hàng tại quầy giao dịch
            </h1>
            <p className="text-sm sm:text-[15px] text-[#51647A] leading-relaxed max-w-2xl">
              Công cụ hỗ trợ giao dịch viên phân tích thần số học Pythagoras chính xác bằng thuật toán lập trình,
              kết hợp ý nghĩa số phương Đông và trợ lý AI cá nhân hóa lời tư vấn — giúp mỗi số tài khoản đều có câu chuyện,
              cách đọc rõ ràng và lý do lựa chọn thuyết phục.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('profile')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0057A0] hover:bg-[#003F75] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <UserRound className="w-4 h-4" />
                <span>Bắt đầu phiên tư vấn</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('generator')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA] text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                <span>Phân tích nhanh số tài khoản</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-[#DDE6F0] pt-5 lg:pt-0 lg:pl-7 space-y-4">
            <h2 className="text-sm font-bold text-[#0F243E]">
              Trạng thái phiên làm việc hiện tại
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex items-baseline justify-between gap-4 pb-2.5 border-b border-[#EDF4FA]">
                <dt className="text-[#51647A]">Khách hàng</dt>
                <dd className="font-semibold text-[#0F243E] text-right truncate">
                  {profile.fullName.trim() || 'Chưa nhập hồ sơ'}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 pb-2.5 border-b border-[#EDF4FA]">
                <dt className="text-[#51647A]">Số chủ đạo / Sứ mệnh</dt>
                <dd className="font-mono font-bold text-[#0057A0] tabular-nums">
                  {numerology
                    ? `${numerology.indices.lifePath.value} / ${numerology.indices.expression.value}`
                    : '—'}
                </dd>
              </div>
              <div className="space-y-1.5 pb-2.5 border-b border-[#EDF4FA]">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-[#51647A]">Phương án nổi bật nhất</dt>
                  <dd className="font-mono font-bold text-[#D71920] tabular-nums">
                    {topCandidates[0] ? `${topCandidates[0].formatted} (${topCandidates[0].score.total}đ)` : 'Chưa có'}
                  </dd>
                </div>
                {topCandidates[0] && (
                  <div className="flex justify-end">
                    <NumberMeaningBadge
                      eastern={topCandidates[0].eastern}
                      size="sm"
                      tooltipAlign="right"
                    />
                  </div>
                )}
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[#51647A]">Kho số nội bộ</dt>
                <dd className="font-mono font-semibold text-[#0F243E] tabular-nums">
                  {inventoryCount} số
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Quick Test Profiles for Counter Demo */}
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-bold text-[#0F243E]">
            Kiểm thử nhanh với hồ sơ khách hàng mẫu
          </h2>
          <p className="text-xs text-[#51647A] mt-0.5">
            Chọn một hồ sơ giả định để nạp sẵn dữ liệu, tính 6 chỉ số và trải nghiệm ngay luồng tư vấn hoàn chỉnh.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAMPLE_CUSTOMERS.map((sample, idx) => {
            const visual = SAMPLE_CARD_STYLES[idx % SAMPLE_CARD_STYLES.length];
            const SampleIcon = visual.icon;
            return (
              <button
                key={sample.profile.fullName}
                type="button"
                onClick={() => onLoadSample(sample.profile)}
                className="text-left bg-white hover:bg-[#EDF4FA]/50 border border-[#DDE6F0] hover:border-[#0057A0]/50 rounded-xl p-5 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-10 h-10 rounded-lg inline-flex items-center justify-center shrink-0 ${visual.bg} ${visual.color}`}
                  >
                    <SampleIcon className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold ${visual.color}`}>{visual.tag}</p>
                    <p className="text-base font-bold text-[#0F243E] group-hover:text-[#0057A0] transition-colors truncate">
                      {sample.profile.fullName}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-[#51647A] font-mono tabular-nums">
                  Ngày sinh: {sample.profile.birthDate.split('-').reverse().join('/')}
                </p>
                <p className="mt-1.5 text-xs text-[#51647A] line-clamp-2 leading-relaxed">
                  {sample.profile.selfDescribedPersonality}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#0057A0]">
                  Nạp hồ sơ và phân tích
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 5-Stage Guided Counter Flow */}
      <section className="bg-white border border-[#DDE6F0] rounded-xl p-6">
        <div className="mb-5">
          <h2 className="text-base font-bold text-[#0F243E]">
            Quy trình tư vấn chuẩn tại quầy giao dịch
          </h2>
          <p className="text-xs text-[#51647A] mt-0.5">
            Chọn bất kỳ bước nào bên dưới để chuyển nhanh đến chức năng tương ứng.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {WORKFLOW_STEPS.map((item) => {
            const StepIcon = item.icon;
            return (
              <button
                key={item.step}
                type="button"
                onClick={() => onNavigate(item.tab)}
                className="text-left p-4 rounded-xl border border-[#EDF4FA] hover:border-[#0057A0]/45 hover:bg-[#F7F9FC] transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`w-9 h-9 rounded-lg inline-flex items-center justify-center ${item.iconBg} ${item.iconColor}`}
                    >
                      <StepIcon className="w-4 h-4" />
                    </span>
                    <span className="font-mono text-xs font-bold text-[#D71920] tabular-nums">
                      Bước {item.step}
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-[#0F243E] group-hover:text-[#0057A0] transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-[#51647A] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <span className="mt-3.5 text-xs font-semibold text-[#0057A0] inline-flex items-center gap-1">
                  Mở mục này <ArrowRight className="w-3 h-3" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Core Module Summary & Privacy Notice */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white border border-[#DDE6F0] rounded-xl p-5 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#EDF4FA] text-[#0057A0] inline-flex items-center justify-center shrink-0">
              <Calculator className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-[#0F243E]">Tính toán lập trình minh bạch</h3>
          </div>
          <p className="text-xs text-[#51647A] leading-relaxed">
            Toàn bộ 6 chỉ số Pythagoras, quy đổi họ tên tiếng Việt không dấu, quy tắc chữ Y và điểm số 100 điểm đều chạy bằng thuật toán xác định, hiển thị chi tiết từng bước để đối chiếu.
          </p>
        </div>

        <div className="bg-white border border-[#DDE6F0] rounded-xl p-5 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#FEF2F2] text-[#D71920] inline-flex items-center justify-center shrink-0">
              <MessageSquareText className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-[#0F243E]">Trợ lý bán hàng thực chiến</h3>
          </div>
          <p className="text-xs text-[#51647A] leading-relaxed">
            Cung cấp nhãn ý nghĩa nhìn nhanh, cách đọc 3 tầng, giải thích dân gian rõ ràng, 3 kịch bản nói tại quầy và 12+ tình huống xử lý từ chối lịch sự, không gây áp lực.
          </p>
        </div>

        <div className="bg-white border border-[#DDE6F0] rounded-xl p-5 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#047857] inline-flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-[#0F243E]">Bảo vệ dữ liệu & Minh bạch</h3>
          </div>
          <p className="text-xs text-[#51647A] leading-relaxed">
            Họ tên và ngày sinh khách hàng chỉ xử lý tạm trên trình duyệt trong phiên làm việc, không lưu lên máy chủ. Các số đề xuất luôn ghi chú cần đối chiếu kho số chính thức của ngân hàng.
          </p>
        </div>
      </section>

      {/* Quick Secondary Shortcuts */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#DDE6F0] text-xs text-[#51647A]">
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => onNavigate('inventory')}
            className="inline-flex items-center gap-1.5 text-[#0057A0] hover:underline font-medium cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            Quản lý kho số & Nhập Excel
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => onNavigate('sheet')}
            className="inline-flex items-center gap-1.5 text-[#0057A0] hover:underline font-medium cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            Xem mẫu phiếu tư vấn PDF
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => onNavigate('consultant')}
            className="inline-flex items-center gap-1.5 text-[#0057A0] hover:underline font-medium cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5" />
            Mở Smart Number Consultant
          </button>
        </div>
        <span>Dữ liệu phân tích mang tính tham khảo cá nhân hóa · Không cam kết tài vận</span>
      </div>
    </div>
  );
}

