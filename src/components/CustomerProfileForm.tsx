import {
  ArrowRight,
  Briefcase,
  Check,
  Crown,
  Gem,
  Heart,
  RotateCcw,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { CUSTOMER_GOALS, SAMPLE_CUSTOMERS } from '../constants/banking';
import { validateBirthDate } from '../engines/numerology';
import { CustomerGoalId, CustomerProfile, GenderOption } from '../types';
import VietnameseDateInput from './VietnameseDateInput';

interface CustomerProfileFormProps {
  profile: CustomerProfile;
  onChange: (next: CustomerProfile) => void;
  onProceedToNumerology: () => void;
  onReset: () => void;
}

const GENDER_OPTIONS: { value: GenderOption; label: string }[] = [
  { value: 'unspecified', label: 'Không ghi nhận' },
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
];

const GOAL_VISUALS: Record<
  CustomerGoalId,
  { iconBg: string; iconText: string; activeBorder: string; activeBg: string }
> = {
  wealth_accumulation: {
    iconBg: 'bg-[#FEF3C7]',
    iconText: 'text-[#B45309]',
    activeBorder: 'border-[#F59E0B]',
    activeBg: 'bg-[#FFFBEB]',
  },
  business_growth: {
    iconBg: 'bg-[#EDF4FA]',
    iconText: 'text-[#0057A0]',
    activeBorder: 'border-[#0057A0]',
    activeBg: 'bg-[#EDF4FA]',
  },
  career_status: {
    iconBg: 'bg-[#FEF2F2]',
    iconText: 'text-[#D71920]',
    activeBorder: 'border-[#D71920]',
    activeBg: 'bg-[#FEF2F2]/70',
  },
  family_peace: {
    iconBg: 'bg-[#ECFDF5]',
    iconText: 'text-[#047857]',
    activeBorder: 'border-[#059669]',
    activeBg: 'bg-[#ECFDF5]/80',
  },
  unique_memorable: {
    iconBg: 'bg-[#EEF2FF]',
    iconText: 'text-[#4338CA]',
    activeBorder: 'border-[#4F46E5]',
    activeBg: 'bg-[#EEF2FF]/80',
  },
};

function renderGoalIcon(goalId: CustomerGoalId) {
  switch (goalId) {
    case 'wealth_accumulation':
      return <Gem className="w-4 h-4" />;
    case 'business_growth':
      return <Briefcase className="w-4 h-4" />;
    case 'career_status':
      return <Crown className="w-4 h-4" />;
    case 'family_peace':
      return <Heart className="w-4 h-4" />;
    default:
      return <Star className="w-4 h-4" />;
  }
}

export default function CustomerProfileForm({
  profile,
  onChange,
  onProceedToNumerology,
  onReset,
}: CustomerProfileFormProps) {
  const dateValidation = profile.birthDate ? validateBirthDate(profile.birthDate) : null;
  const nameValid = profile.fullName.trim().length >= 2;
  const canProceed = nameValid && Boolean(dateValidation?.valid);

  const toggleGoal = (goalId: CustomerGoalId) => {
    const exists = profile.goals.includes(goalId);
    const nextGoals = exists
      ? profile.goals.filter((g) => g !== goalId)
      : [...profile.goals, goalId];
    onChange({ ...profile, goals: nextGoals });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#0057A0]">Module 1 · Bước 1 / 7</p>
          <h1 className="text-2xl font-bold text-[#0F243E] mt-1">
            Hồ sơ khách hàng
          </h1>
          <p className="text-sm text-[#51647A] mt-1">
            Thu thập thông tin nền và mong muốn thực tế để cá nhân hóa phân tích và đề xuất số tài khoản.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {SAMPLE_CUSTOMERS.map((s, i) => (
            <button
              key={s.profile.fullName}
              type="button"
              onClick={() => onChange(s.profile)}
              className="px-3 py-1.5 text-xs font-medium text-[#0057A0] bg-[#EDF4FA] hover:bg-[#DCEAF7] rounded-md transition-colors cursor-pointer whitespace-nowrap"
            >
              Mẫu {i + 1}: {s.profile.fullName.split(' ').slice(-2).join(' ')}
            </button>
          ))}
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#51647A] hover:text-[#0F243E] bg-white border border-[#DDE6F0] rounded-md transition-colors cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Làm mới
          </button>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canProceed) onProceedToNumerology();
        }}
        className="bg-white border border-[#DDE6F0] rounded-xl p-6 sm:p-8 space-y-7"
      >
        {/* Basic Identification */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-6 space-y-1.5">
            <label htmlFor="customer-full-name" className="block text-sm font-semibold text-[#0F243E]">
              1. Họ và tên đầy đủ <span className="text-[#D71920]">*</span>
            </label>
            <input
              id="customer-full-name"
              type="text"
              value={profile.fullName}
              onChange={(e) => onChange({ ...profile, fullName: e.target.value })}
              placeholder="Ví dụ: Nguyễn Minh Khang"
              className="w-full px-3.5 py-2.5 text-sm text-[#0F243E] bg-white border border-[#C7D6E6] focus:border-[#0057A0] focus:ring-2 focus:ring-[#0057A0]/15 rounded-lg outline-none transition-all"
              required
            />
            <p className="text-xs text-[#51647A]">
              Hệ thống tự động bỏ dấu tiếng Việt và giữ nguyên thứ tự chữ cái khi tính Thần số học.
            </p>
          </div>

          <div className="md:col-span-3 space-y-1.5">
            <label htmlFor="customer-dob" className="block text-sm font-semibold text-[#0F243E]">
              2. Ngày tháng năm sinh <span className="text-[#D71920]">*</span>
            </label>
            <VietnameseDateInput
              id="customer-dob"
              value={profile.birthDate}
              onChange={(iso) => onChange({ ...profile, birthDate: iso })}
              required
              className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums text-[#0F243E] bg-white border border-[#C7D6E6] focus:border-[#0057A0] focus:ring-2 focus:ring-[#0057A0]/15 rounded-lg outline-none transition-all"
            />
            <p className="text-xs text-[#51647A]">Dương lịch theo thứ tự Ngày/Tháng/Năm (DD/MM/YYYY).</p>
          </div>

          <div className="md:col-span-3 space-y-1.5">
            <label htmlFor="customer-gender" className="block text-sm font-semibold text-[#0F243E]">
              3. Giới tính (tùy chọn)
            </label>
            <select
              id="customer-gender"
              value={profile.gender}
              onChange={(e) => onChange({ ...profile, gender: e.target.value as GenderOption })}
              className="w-full px-3.5 py-2.5 text-sm text-[#0F243E] bg-white border border-[#C7D6E6] focus:border-[#0057A0] focus:ring-2 focus:ring-[#0057A0]/15 rounded-lg outline-none transition-all"
            >
              {GENDER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-[#51647A]">
              Chỉ dùng tham khảo hành chính; không dùng suy đoán tính cách hay chấm điểm.
            </p>
          </div>
        </div>

        <hr className="border-[#EDF4FA]" />

        {/* Self-described personality */}
        <div className="space-y-1.5">
          <label htmlFor="customer-personality" className="block text-sm font-semibold text-[#0F243E]">
            4. Tính cách do khách hàng tự mô tả
          </label>
          <textarea
            id="customer-personality"
            rows={2}
            value={profile.selfDescribedPersonality}
            onChange={(e) => onChange({ ...profile, selfDescribedPersonality: e.target.value })}
            placeholder="Ví dụ: Thực tế, thích sự gọn gàng, rõ ràng khi giao dịch với đối tác; hoặc yêu thích sự nhẹ nhàng, tinh tế..."
            className="w-full px-3.5 py-2.5 text-sm text-[#0F243E] bg-white border border-[#C7D6E6] focus:border-[#0057A0] focus:ring-2 focus:ring-[#0057A0]/15 rounded-lg outline-none transition-all resize-y"
          />
          <p className="text-xs text-[#51647A]">
            Giúp Trợ lý AI điều chỉnh giọng điệu và câu chuyện tư vấn sát với phong cách riêng của khách hàng.
          </p>
        </div>

        <hr className="border-[#EDF4FA]" />

        {/* Customer Goals */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <span className="block text-sm font-semibold text-[#0F243E]">
                5. Mong muốn khi chọn số tài khoản
              </span>
              <p className="text-xs text-[#51647A] mt-0.5">
                Có thể chọn một hoặc nhiều nhóm mong muốn phù hợp nhất với khách hàng.
              </p>
            </div>
            <span className="text-xs text-[#51647A] tabular-nums">
              Đã chọn: {profile.goals.length}/5
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CUSTOMER_GOALS.map((goal) => {
              const selected = profile.goals.includes(goal.id);
              const vis = GOAL_VISUALS[goal.id];
              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => toggleGoal(goal.id)}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    selected
                      ? `${vis.activeBg} ${vis.activeBorder} text-[#0F243E] shadow-xs`
                      : 'bg-white border-[#DDE6F0] hover:border-[#0057A0]/50 text-[#0F243E]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-8 h-8 rounded-lg inline-flex items-center justify-center shrink-0 ${vis.iconBg} ${vis.iconText}`}
                      >
                        {renderGoalIcon(goal.id)}
                      </span>
                      <span className="text-sm font-semibold">{goal.label}</span>
                    </div>
                    <span
                      className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border mt-0.5 ${
                        selected
                          ? 'bg-[#0057A0] border-[#0057A0] text-white'
                          : 'border-[#C7D6E6] bg-white'
                      }`}
                    >
                      {selected && <Check className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[#51647A] leading-relaxed">
                    {goal.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <hr className="border-[#EDF4FA]" />

        {/* Teller Notes */}
        <div className="space-y-1.5">
          <label htmlFor="teller-notes" className="block text-sm font-semibold text-[#0F243E]">
            Ghi chú của GDV về sở thích khách hàng
          </label>
          <textarea
            id="teller-notes"
            rows={2}
            value={profile.notes}
            onChange={(e) => onChange({ ...profile, notes: e.target.value })}
            placeholder="Ví dụ: Khách thích đuôi 68 hoặc 89, muốn tránh số 4, hay đọc số tài khoản qua điện thoại, ưu tiên độ dài 6 số..."
            className="w-full px-3.5 py-2.5 text-sm text-[#0F243E] bg-white border border-[#C7D6E6] focus:border-[#0057A0] focus:ring-2 focus:ring-[#0057A0]/15 rounded-lg outline-none transition-all resize-y"
          />
        </div>

        {/* Privacy notice + CTA */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#EDF4FA]">
          <div className="flex items-start gap-2.5 text-xs text-[#51647A] max-w-xl">
            <ShieldCheck className="w-4 h-4 text-[#0057A0] shrink-0 mt-0.5" />
            <span>
              Bảo vệ dữ liệu cá nhân: Họ tên và ngày sinh chỉ lưu tạm trong bộ nhớ phiên trình duyệt hiện tại, không tự động lưu trữ lên máy chủ.
            </span>
          </div>

          <button
            type="submit"
            disabled={!canProceed}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              canProceed
                ? 'bg-[#0057A0] hover:bg-[#003F75] text-white cursor-pointer'
                : 'bg-[#DDE6F0] text-[#7D90A5] cursor-not-allowed'
            }`}
          >
            <span>Tính 6 chỉ số Thần số học</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
