import { CheckCircle2 } from 'lucide-react';
import { ChangeEvent, useEffect, useState } from 'react';
import { validateBirthDate } from '../engines/numerology';

interface VietnameseDateInputProps {
  id: string;
  value: string; // ISO YYYY-MM-DD or ''
  onChange: (isoDate: string) => void;
  className?: string;
  required?: boolean;
}

function isoToVnDisplay(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return '';
  return `${m[3]}/${m[2]}/${m[1]}`;
}

function formatDigitsToVnDate(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export default function VietnameseDateInput({
  id,
  value,
  onChange,
  className = '',
  required = false,
}: VietnameseDateInputProps) {
  const [displayText, setDisplayText] = useState<string>(() => isoToVnDisplay(value));
  const [inlineError, setInlineError] = useState<string | null>(null);

  // Sync when external value changes (e.g., loading sample customer or resetting)
  useEffect(() => {
    const formatted = isoToVnDisplay(value);
    if (value === '') {
      setDisplayText('');
      setInlineError(null);
    } else if (formatted && formatted !== displayText) {
      setDisplayText(formatted);
      setInlineError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Support pasting ISO format YYYY-MM-DD directly
    const isoPaste = raw.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoPaste) {
      const check = validateBirthDate(raw.trim());
      setDisplayText(`${isoPaste[3]}/${isoPaste[2]}/${isoPaste[1]}`);
      if (check.valid) {
        setInlineError(null);
        onChange(raw.trim());
      } else {
        setInlineError(check.error || 'Ngày sinh chưa hợp lệ.');
      }
      return;
    }

    const formatted = formatDigitsToVnDate(raw);
    setDisplayText(formatted);

    const digits = formatted.replace(/\D/g, '');
    if (digits.length === 0) {
      setInlineError(null);
      onChange('');
      return;
    }

    if (digits.length < 8) {
      setInlineError(null);
      return;
    }

    // Complete 8 digits: DDMMYYYY
    const dd = digits.slice(0, 2);
    const mm = digits.slice(2, 4);
    const yyyy = digits.slice(4, 8);
    const isoCandidate = `${yyyy}-${mm}-${dd}`;
    const check = validateBirthDate(isoCandidate);

    if (check.valid) {
      setInlineError(null);
      onChange(isoCandidate);
    } else {
      setInlineError(
        check.error || 'Ngày sinh chưa hợp lệ (nhập theo thứ tự Ngày/Tháng/Năm, VD: 15/08/1990).'
      );
    }
  };

  const handleBlur = () => {
    const digits = displayText.replace(/\D/g, '');
    if (digits.length > 0 && digits.length < 8) {
      setInlineError('Vui lòng nhập đủ 8 số theo thứ tự Ngày/Tháng/Năm (VD: 15/08/1990).');
    }
  };

  const isCompleteValid =
    displayText.length === 10 && !inlineError && Boolean(value) && validateBirthDate(value).valid;

  return (
    <div className="space-y-1">
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="bday"
          maxLength={10}
          required={required}
          value={displayText}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="DD/MM/YYYY (VD: 15/08/1990)"
          className={`pr-16 ${className}`}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isCompleteValid ? (
            <CheckCircle2 className="w-4 h-4 text-[#047857]" aria-hidden="true" />
          ) : (
            <span className="text-[10px] font-mono font-semibold text-[#7D90A5]">
              Ngày/Tháng
            </span>
          )}
        </span>
      </div>
      {inlineError && (
        <p className="text-[11px] text-[#D71920] font-medium leading-snug">{inlineError}</p>
      )}
    </div>
  );
}
