import {
  Award,
  Crown,
  Gem,
  Repeat,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useMemo } from 'react';
import { analyzeEasternNumber } from '../engines/easternNumerology';
import { EasternAnalysis } from '../types';

export interface BadgeDescriptor {
  shortLabel: string;
  tone: 'red' | 'amber' | 'blue' | 'emerald' | 'indigo';
  iconName: 'crown' | 'gem' | 'trending' | 'repeat' | 'shield' | 'award' | 'sparkles';
  tooltipTitle: string;
  tooltipReading: string;
  tooltipMeaning: string;
}

export function deriveNumberBadge(eastern: EasternAnalysis): BadgeDescriptor {
  const firstPattern = eastern.recognizedPatterns[0];
  const structure = eastern.structureTags[0] || '';
  const lastDigit = eastern.digits[eastern.digits.length - 1];

  let shortLabel = '';
  let tone: BadgeDescriptor['tone'] = 'blue';
  let iconName: BadgeDescriptor['iconName'] = 'sparkles';

  if (firstPattern) {
    const r = firstPattern.reading;
    if (r.includes('Tứ quý') || r.includes('Tam hoa')) {
      shortLabel = r;
      tone = 'red';
      iconName = 'crown';
    } else if (r.includes('San bằng') || r.includes('Tiến đều')) {
      shortLabel = r.includes('San bằng') ? 'Tiến 6-7-8-9' : r;
      tone = 'indigo';
      iconName = 'trending';
    } else if (r.includes('Thần Tài')) {
      shortLabel = r.includes('–') ? 'Bộ đôi Thần Tài' : r;
      tone = 'amber';
      iconName = 'gem';
    } else if (r.includes('Ông Địa')) {
      shortLabel = r.includes('–') ? 'Bộ đôi Ông Địa' : r;
      tone = 'amber';
      iconName = 'shield';
    } else if (r.includes('Nhất Cửu') || r.includes('Nhất Phát') || r.includes('Nhất Trường Cửu') || r.includes('Nhất Sinh')) {
      shortLabel = r;
      tone = 'blue';
      iconName = 'crown';
    } else if (r.includes('Lộc Phát – Lộc Phát')) {
      shortLabel = 'Lộc Phát lặp';
      tone = 'red';
      iconName = 'repeat';
    } else if (r.includes('Phát Lộc – Phát Lộc')) {
      shortLabel = 'Phát Lộc lặp';
      tone = 'red';
      iconName = 'repeat';
    } else if (r.includes('Nhất Lộc Phát') || r.includes('Nhất Phát Lộc')) {
      shortLabel = r;
      tone = 'blue';
      iconName = 'crown';
    } else if (r.includes('Lộc Phát') || r.includes('Phát Lộc')) {
      shortLabel = r.includes('–') ? 'Lộc Phát đối xứng' : r;
      tone = 'red';
      iconName = 'trending';
    } else if (r.includes('Song Phát') || r.includes('Trường Phát') || r.includes('Phát Trường Cửu')) {
      shortLabel = r;
      tone = 'blue';
      iconName = 'trending';
    } else if (r.includes('Trường Cửu') || r.includes('Viên Cửu')) {
      shortLabel = r;
      tone = 'indigo';
      iconName = 'award';
    } else if (r.includes('Song Hỷ') || r.includes('Phúc') || r.includes('Sinh') || r.includes('Mãi') || r.includes('Song Lộc') || r.includes('Tài Lộc') || r.includes('Viên')) {
      shortLabel = r;
      tone = 'emerald';
      iconName = 'sparkles';
    } else {
      shortLabel = r;
      tone = 'blue';
      iconName = 'sparkles';
    }
  } else if (structure.includes('Đối xứng')) {
    shortLabel = 'Số đối xứng';
    tone = 'emerald';
    iconName = 'repeat';
  } else if (structure.includes('tiến')) {
    shortLabel = 'Dãy số tiến';
    tone = 'indigo';
    iconName = 'trending';
  } else if (structure.includes('Lặp')) {
    shortLabel = 'Nhịp lặp dễ nhớ';
    tone = 'blue';
    iconName = 'repeat';
  } else {
    shortLabel = `Đuôi ${lastDigit.folkReading}`;
    tone = lastDigit.digit === 8 || lastDigit.digit === 6 ? 'red' : 'emerald';
    iconName = 'sparkles';
  }

  return {
    shortLabel,
    tone,
    iconName,
    tooltipTitle: eastern.quickValuePitch.headline,
    tooltipReading: `Đọc nhịp: ${eastern.readings.byPair}`,
    tooltipMeaning: eastern.quickValuePitch.coreMeaning,
  };
}

const TONE_STYLES: Record<BadgeDescriptor['tone'], string> = {
  red: 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]',
  amber: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
  blue: 'bg-[#EDF4FA] text-[#0057A0] border-[#BFDBFE]',
  emerald: 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]',
  indigo: 'bg-[#EEF2FF] text-[#3730A3] border-[#C7D2FE]',
};

function BadgeIcon({ name, className }: { name: BadgeDescriptor['iconName']; className?: string }) {
  switch (name) {
    case 'crown':
      return <Crown className={className} />;
    case 'gem':
      return <Gem className={className} />;
    case 'trending':
      return <TrendingUp className={className} />;
    case 'repeat':
      return <Repeat className={className} />;
    case 'shield':
      return <ShieldCheck className={className} />;
    case 'award':
      return <Award className={className} />;
    default:
      return <Sparkles className={className} />;
  }
}

interface NumberMeaningBadgeProps {
  eastern?: EasternAnalysis;
  rawNumber?: string;
  size?: 'sm' | 'md';
  tooltipAlign?: 'left' | 'center' | 'right';
  tooltipPlacement?: 'top' | 'bottom';
}

export default function NumberMeaningBadge({
  eastern,
  rawNumber,
  size = 'sm',
  tooltipAlign = 'left',
  tooltipPlacement = 'top',
}: NumberMeaningBadgeProps) {
  const analysis = useMemo(() => {
    if (eastern) return eastern;
    if (rawNumber) return analyzeEasternNumber(rawNumber);
    return null;
  }, [eastern, rawNumber]);

  if (!analysis) return null;

  const badge = deriveNumberBadge(analysis);
  const alignClass =
    tooltipAlign === 'right'
      ? 'right-0'
      : tooltipAlign === 'center'
        ? 'left-1/2 -translate-x-1/2'
        : 'left-0';
  const placementClass =
    tooltipPlacement === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2';

  return (
    <span className="relative inline-flex group/badge align-middle">
      <span
        tabIndex={0}
        title={`${badge.shortLabel} — ${badge.tooltipMeaning}`}
        className={`inline-flex items-center gap-1 font-semibold border rounded-md whitespace-nowrap select-none cursor-help transition-colors ${
          TONE_STYLES[badge.tone]
        } ${size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[11px]'}`}
      >
        <BadgeIcon name={badge.iconName} className={size === 'md' ? 'w-3.5 h-3.5 shrink-0' : 'w-3 h-3 shrink-0'} />
        <span>{badge.shortLabel}</span>
      </span>

      {/* Rich Counter Hover/Focus Tooltip */}
      <span
        role="tooltip"
        className={`pointer-events-none opacity-0 invisible group-hover/badge:opacity-100 group-hover/badge:visible group-focus-within/badge:opacity-100 group-focus-within/badge:visible transition-opacity duration-150 absolute ${placementClass} ${alignClass} z-50 w-64 sm:w-72 p-3 rounded-lg bg-[#0F243E] text-white shadow-lg text-left whitespace-normal`}
      >
        <span className="block text-xs font-bold text-[#7DD3FC]">
          {badge.tooltipTitle}
        </span>
        <span className="block text-[11px] text-white/80 mt-0.5 font-medium">
          {badge.tooltipReading}
        </span>
        <span className="block text-[11px] text-white/95 mt-1.5 leading-relaxed font-normal">
          {badge.tooltipMeaning}
        </span>
      </span>
    </span>
  );
}
