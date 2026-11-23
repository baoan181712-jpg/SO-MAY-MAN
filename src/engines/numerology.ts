import {
  LetterBreakdown,
  NumerologyIndexResult,
  NumerologyReport,
  NumerologySettings,
  WordBreakdown,
  YRuleMode,
} from '../types';

export const PYTHAGORAS_MAP: Record<string, number> = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9,
};

export const PYTHAGORAS_TABLE_ROWS: { value: number; letters: string[] }[] = [
  { value: 1, letters: ['A', 'J', 'S'] },
  { value: 2, letters: ['B', 'K', 'T'] },
  { value: 3, letters: ['C', 'L', 'U'] },
  { value: 4, letters: ['D', 'M', 'V'] },
  { value: 5, letters: ['E', 'N', 'W'] },
  { value: 6, letters: ['F', 'O', 'X'] },
  { value: 7, letters: ['G', 'P', 'Y'] },
  { value: 8, letters: ['H', 'Q', 'Z'] },
  { value: 9, letters: ['I', 'R'] },
];

const BASE_VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);
const MASTER_NUMBERS = new Set([11, 22, 33]);

/**
 * Strip Vietnamese diacritics while strictly preserving exact letter order.
 */
export function stripVietnameseDiacritics(input: string): string {
  return input
    .replace(/Đ/g, 'D')
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

export function isMasterNumber(num: number): boolean {
  return MASTER_NUMBERS.has(num);
}

/**
 * Reduce a positive integer to 1..9 (or keep 11, 22, 33 when keepMaster is true).
 * Returns exact value and explicit step-by-step trace.
 */
export function reduceWithSteps(
  initialTotal: number,
  keepMaster: boolean
): { value: number; steps: string[]; isMaster: boolean } {
  const steps: string[] = [];
  let current = initialTotal;

  if (current <= 0) {
    return { value: 0, steps: ['0'], isMaster: false };
  }

  while (current > 9) {
    if (keepMaster && MASTER_NUMBERS.has(current)) {
      steps.push(`Giữ nguyên số Master ${current}`);
      return { value: current, steps, isMaster: true };
    }
    const digits = String(current).split('').map(Number);
    const next = digits.reduce((acc, d) => acc + d, 0);
    steps.push(`${digits.join(' + ')} = ${next}`);
    current = next;
  }

  return { value: current, steps, isMaster: false };
}

/**
 * Determine whether 'Y' at position `idx` inside a normalized word acts as a vowel or consonant.
 * Contextual rule (transparent Vietnamese & Pythagoras convention):
 * - If the word has NO other base vowels (A, E, I, O, U), Y is a vowel (e.g., LY, MY, VY, KY, THY).
 * - If Y is preceded by a consonant and followed by nothing or a consonant (e.g., HUYNH -> preceded by U vowel, so consonant; QUYNH -> preceded by U, consonant; NGUYEN -> surrounded by U and E, consonant; YEN -> followed by E vowel, consonant).
 */
function classifyLetterRole(
  normalizedWord: string,
  idx: number,
  yRule: YRuleMode
): { role: 'vowel' | 'consonant'; yReason?: string } {
  const ch = normalizedWord[idx];
  if (BASE_VOWELS.has(ch)) {
    return { role: 'vowel' };
  }
  if (ch !== 'Y') {
    return { role: 'consonant' };
  }

  if (yRule === 'always-vowel') {
    return { role: 'vowel', yReason: 'Cấu hình: Y luôn là nguyên âm' };
  }
  if (yRule === 'always-consonant') {
    return { role: 'consonant', yReason: 'Cấu hình: Y luôn là phụ âm' };
  }

  // Contextual rule
  const hasOtherBaseVowel = normalizedWord
    .split('')
    .some((c, i) => i !== idx && BASE_VOWELS.has(c));

  if (!hasOtherBaseVowel) {
    return {
      role: 'vowel',
      yReason: 'Ngữ cảnh: Y là nguyên âm duy nhất trong âm tiết',
    };
  }

  const prev = idx > 0 ? normalizedWord[idx - 1] : '';
  const next = idx < normalizedWord.length - 1 ? normalizedWord[idx + 1] : '';
  const adjacentToVowel = BASE_VOWELS.has(prev) || BASE_VOWELS.has(next);

  if (adjacentToVowel) {
    return {
      role: 'consonant',
      yReason: 'Ngữ cảnh: Y đứng liền kề nguyên âm A/E/I/O/U nên tính là phụ âm',
    };
  }

  return {
    role: 'vowel',
    yReason: 'Ngữ cảnh: Y đứng độc lập giữa các phụ âm nên tính là nguyên âm',
  };
}

interface NumberMeaning {
  title: string;
  summary: string;
  strengths: string[];
  accountHint: string;
  preferredDigits: number[];
}

const NUMBER_MEANINGS: Record<number, NumberMeaning> = {
  1: {
    title: 'Tiên phong & Độc lập',
    summary: 'Thể hiện tinh thần chủ động, dám dẫn đầu, rõ ràng về mục tiêu và đề cao dấu ấn cá nhân.',
    strengths: ['Chủ động quyết định', 'Tư duy độc lập', 'Phong thái rõ ràng'],
    accountHint: 'Hợp các dãy số mở đầu bằng 1 (như 168, 186) hoặc cấu trúc gọn, mạnh mẽ.',
    preferredDigits: [1, 8, 9],
  },
  2: {
    title: 'Kết nối & Cân bằng',
    summary: 'Đề cao sự hài hòa, tinh tế trong giao tiếp, lắng nghe và xây dựng mối quan hệ bền chặt.',
    strengths: ['Khéo léo ngoại giao', 'Hợp tác tốt', 'Nhạy bén cảm xúc'],
    accountHint: 'Hợp các dãy số có cặp đôi cân xứng (26, 28, cặp lặp hoặc gánh đối xứng).',
    preferredDigits: [2, 6, 8],
  },
  3: {
    title: 'Sáng tạo & Biểu đạt',
    summary: 'Giàu năng lượng giao tiếp, lạc quan, linh hoạt và tạo thiện cảm nhanh trong kinh doanh.',
    strengths: ['Truyền đạt lôi cuốn', 'Tư duy cởi mở', 'Dễ tạo thiện cảm'],
    accountHint: 'Hợp các dãy có số 3 (Tài), tổ hợp 36, 38, 39 hoặc nhịp đọc vui tai.',
    preferredDigits: [3, 6, 9],
  },
  4: {
    title: 'Nền tảng & Kỷ luật',
    summary: 'Chuộng sự chắc chắn, có kế hoạch, đáng tin cậy và xây dựng giá trị từng bước vững vàng.',
    strengths: ['Tổ chức khoa học', 'Kiên định', 'Quản trị rủi ro tốt'],
    accountHint: 'Hợp dãy số cân đối âm dương, cấu trúc đối xứng rõ ràng, nhịp tiến ổn định.',
    preferredDigits: [4, 6, 8],
  },
  5: {
    title: 'Linh hoạt & Mở rộng',
    summary: 'Ưa khám phá, thích ứng nhanh với thay đổi, phù hợp môi trường kinh doanh năng động.',
    strengths: ['Năng động', 'Đa nhiệm tốt', 'Nắm bắt xu hướng nhanh'],
    accountHint: 'Hợp tổ hợp số 5 (Sinh) kết hợp 56, 58 hoặc các dãy tiến lên sắc nét.',
    preferredDigits: [5, 6, 8],
  },
  6: {
    title: 'Trách nhiệm & Nuôi dưỡng',
    summary: 'Gắn liền với sự chu toàn, gia đình, uy tín cá nhân và mong muốn tích lũy bền vững.',
    strengths: ['Tận tâm', 'Đáng tin cậy', 'Cân bằng tài chính – gia đình'],
    accountHint: 'Hợp các dãy giàu số 6 (Lộc) như 66, 68, 86, 6868 mang cảm giác ấm áp và sung túc.',
    preferredDigits: [6, 8, 2],
  },
  7: {
    title: 'Chiều sâu & Phân tích',
    summary: 'Tư duy sâu sắc, quan sát kỹ lưỡng, chuộng chất lượng thực chất hơn hình thức phô trương.',
    strengths: ['Phân tích sắc bén', 'Tập trung chuyên môn', 'Độc lập tư duy'],
    accountHint: 'Hợp các dãy có tổ hợp 79 (Đại Thần Tài), 78 (Đại Ông Địa) hoặc số đối xứng tinh tế.',
    preferredDigits: [7, 9, 8],
  },
  8: {
    title: 'Quản trị & Thành tựu',
    summary: 'Hướng đến hiệu quả, tầm nhìn thực tế, năng lực điều hành và tăng trưởng giá trị tài chính.',
    strengths: ['Tư duy kinh doanh', 'Bản lĩnh thực thi', 'Mục tiêu rõ ràng'],
    accountHint: 'Hợp nổi bật với số 8 (Phát), 68, 86, 88, 168 giúp khẳng định phong thái chuyên nghiệp.',
    preferredDigits: [8, 6, 9],
  },
  9: {
    title: 'Tầm nhìn & Lan tỏa',
    summary: 'Chín chắn, rộng lượng, có góc nhìn dài hạn và coi trọng giá trị bền vững theo thời gian.',
    strengths: ['Tầm nhìn rộng', 'Uy tín xã hội', 'Hướng tới giá trị lâu dài'],
    accountHint: 'Hợp số 9 (Trường Cửu), 89, 98, 99 hoặc đuôi 9 tạo cảm giác viên mãn.',
    preferredDigits: [9, 6, 8],
  },
  11: {
    title: 'Master 11 – Trực giác & Cảm hứng',
    summary: 'Số Master kết hợp tinh thần tiên phong của số 1 và sự tinh tế của số 2, nổi bật về trực giác và sức lan tỏa.',
    strengths: ['Nhạy bén xu hướng', 'Truyền cảm hứng', 'Tư duy khác biệt'],
    accountHint: 'Hợp các dãy số mang cặp lặp 11, số 1 – 2 hài hòa hoặc dãy đối xứng tạo dấu ấn riêng.',
    preferredDigits: [1, 2, 8],
  },
  22: {
    title: 'Master 22 – Kiến tạo & Quy mô',
    summary: 'Số Master kết hợp cân bằng của số 2 và nền tảng vững chắc của số 4, hướng đến công trình bền lâu.',
    strengths: ['Hoạch định dài hạn', 'Biến ý tưởng thành thực tế', 'Vững vàng trước áp lực'],
    accountHint: 'Hợp các dãy có cặp 22, 26, 28 hoặc cấu trúc lặp gọn gàng, vững chãi.',
    preferredDigits: [2, 4, 8],
  },
  33: {
    title: 'Master 33 – Kết nối & Phụng sự',
    summary: 'Số Master kết hợp sức biểu đạt của số 3 và sự chu toàn của số 6, đề cao uy tín và cộng đồng.',
    strengths: ['Tạo niềm tin tự nhiên', 'Gắn kết đội nhóm', 'Sức ảnh hưởng tích cực'],
    accountHint: 'Hợp các dãy có cặp 33, 36, 68 mang âm hưởng ấm áp và dễ nhớ.',
    preferredDigits: [3, 6, 9],
  },
};

export function getNumberMeaning(num: number): NumberMeaning {
  if (NUMBER_MEANINGS[num]) {
    return NUMBER_MEANINGS[num];
  }
  const fallback = num > 9 ? reduceWithSteps(num, false).value : 1;
  return NUMBER_MEANINGS[fallback] ?? NUMBER_MEANINGS[1];
}

export function validateBirthDate(birthDate: string): {
  valid: boolean;
  day: number;
  month: number;
  year: number;
  error?: string;
} {
  if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return { valid: false, day: 0, month: 0, year: 0, error: 'Vui lòng chọn ngày sinh hợp lệ.' };
  }
  const [yStr, mStr, dStr] = birthDate.split('-');
  const year = Number(yStr);
  const month = Number(mStr);
  const day = Number(dStr);
  const currentYear = new Date().getFullYear();

  if (year < 1900 || year > currentYear) {
    return { valid: false, day: 0, month: 0, year: 0, error: `Năm sinh phải nằm trong khoảng 1900 – ${currentYear}.` };
  }
  const dateObj = new Date(year, month - 1, day);
  if (
    dateObj.getFullYear() !== year ||
    dateObj.getMonth() !== month - 1 ||
    dateObj.getDate() !== day
  ) {
    return { valid: false, day: 0, month: 0, year: 0, error: 'Ngày sinh không tồn tại trên lịch.' };
  }
  return { valid: true, day, month, year };
}

export function calculateNumerology(
  fullName: string,
  birthDate: string,
  settings: NumerologySettings
): NumerologyReport | null {
  const cleanedName = fullName.trim().replace(/\s+/g, ' ');
  const dateCheck = validateBirthDate(birthDate);

  if (!cleanedName || !dateCheck.valid) {
    return null;
  }

  const { day, month, year } = dateCheck;
  const dd = String(day).padStart(2, '0');
  const mm = String(month).padStart(2, '0');
  const yyyy = String(year);
  const formattedBirthDate = `${dd}/${mm}/${yyyy}`;

  // 1. Life Path Number: sum all digits of DD + MM + YYYY
  const allDateDigits = `${dd}${mm}${yyyy}`.split('').map(Number);
  const lifePathRaw = allDateDigits.reduce((acc, d) => acc + d, 0);
  const lifePathReduced = reduceWithSteps(lifePathRaw, settings.keepMasterNumbers);
  const lifePathMeaning = getNumberMeaning(lifePathReduced.value);

  const lifePath: NumerologyIndexResult = {
    key: 'lifePath',
    label: 'Số chủ đạo',
    englishLabel: 'Life Path Number',
    value: lifePathReduced.value,
    isMaster: lifePathReduced.isMaster,
    formulaDescription: `Tổng các chữ số ngày tháng năm sinh (${formattedBirthDate})`,
    steps: [
      `${allDateDigits.join(' + ')} = ${lifePathRaw}`,
      ...lifePathReduced.steps,
    ],
    meaningTitle: lifePathMeaning.title,
    meaningSummary: lifePathMeaning.summary,
    strengths: lifePathMeaning.strengths,
    accountNumberHint: lifePathMeaning.accountHint,
  };

  // 2. Birthday Number
  const birthdayDigits = String(day).split('').map(Number);
  const birthdaySteps: string[] = [];
  let birthdayFinal = day;
  let birthdayMaster = false;

  if (day > 9) {
    if (settings.keepMasterNumbers && MASTER_NUMBERS.has(day)) {
      birthdaySteps.push(`Ngày sinh ${day} là số Master — giữ nguyên ${day}`);
      birthdayFinal = day;
      birthdayMaster = true;
    } else {
      const reduced = reduceWithSteps(day, settings.keepMasterNumbers);
      birthdaySteps.push(`Ngày ${day}: ${reduced.steps.join(' → ')}`);
      birthdayFinal = reduced.value;
      birthdayMaster = reduced.isMaster;
    }
  } else {
    birthdaySteps.push(`Ngày sinh ${birthdayDigits.join('')} = ${day}`);
  }
  const birthdayMeaning = getNumberMeaning(birthdayFinal);

  const birthday: NumerologyIndexResult = {
    key: 'birthday',
    label: 'Số ngày sinh',
    englishLabel: 'Birthday Number',
    value: birthdayFinal,
    isMaster: birthdayMaster,
    formulaDescription: `Rút gọn ngày sinh (${day})`,
    steps: birthdaySteps,
    meaningTitle: birthdayMeaning.title,
    meaningSummary: birthdayMeaning.summary,
    strengths: birthdayMeaning.strengths,
    accountNumberHint: birthdayMeaning.accountHint,
  };

  // 3. Attitude Number: Day + Month
  const attitudeDigits = `${dd}${mm}`.split('').map(Number);
  const attitudeRaw = attitudeDigits.reduce((acc, d) => acc + d, 0);
  const attitudeReduced = reduceWithSteps(attitudeRaw, settings.keepMasterNumbers);
  const attitudeMeaning = getNumberMeaning(attitudeReduced.value);

  const attitude: NumerologyIndexResult = {
    key: 'attitude',
    label: 'Số thái độ',
    englishLabel: 'Attitude Number',
    value: attitudeReduced.value,
    isMaster: attitudeReduced.isMaster,
    formulaDescription: `Tổng các chữ số ngày sinh + tháng sinh (${dd}/${mm})`,
    steps: [
      `${attitudeDigits.join(' + ')} = ${attitudeRaw}`,
      ...attitudeReduced.steps,
    ],
    meaningTitle: attitudeMeaning.title,
    meaningSummary: attitudeMeaning.summary,
    strengths: attitudeMeaning.strengths,
    accountNumberHint: attitudeMeaning.accountHint,
  };

  // Name breakdown (preserving order, stripping Vietnamese diacritics)
  const originalWords = cleanedName.split(' ');
  const wordBreakdowns: WordBreakdown[] = [];
  const allLetterValues: number[] = [];
  const allVowelValues: number[] = [];
  const allConsonantValues: number[] = [];

  for (const origWord of originalWords) {
    const normalizedWord = stripVietnameseDiacritics(origWord).replace(/[^A-Z]/g, '');
    if (!normalizedWord) continue;

    // Map each character from original word to normalized letter cleanly
    const origChars = Array.from(origWord);
    const letters: LetterBreakdown[] = [];
    let normPtr = 0;

    for (const origCh of origChars) {
      const normCh = stripVietnameseDiacritics(origCh).replace(/[^A-Z]/g, '');
      if (!normCh) continue;

      for (const ch of normCh) {
        const val = PYTHAGORAS_MAP[ch] ?? 0;
        const { role, yReason } = classifyLetterRole(normalizedWord, normPtr, settings.yRule);
        normPtr += 1;

        letters.push({
          originalChar: origCh,
          normalizedChar: ch,
          value: val,
          role,
          yReason,
        });

        allLetterValues.push(val);
        if (role === 'vowel') {
          allVowelValues.push(val);
        } else {
          allConsonantValues.push(val);
        }
      }
    }

    const total = letters.reduce((acc, l) => acc + l.value, 0);
    const vowelsTotal = letters
      .filter((l) => l.role === 'vowel')
      .reduce((acc, l) => acc + l.value, 0);
    const consonantsTotal = letters
      .filter((l) => l.role === 'consonant')
      .reduce((acc, l) => acc + l.value, 0);

    wordBreakdowns.push({
      word: normalizedWord,
      letters,
      total,
      vowelsTotal,
      consonantsTotal,
    });
  }

  const normalizedFullName = wordBreakdowns.map((w) => w.word).join(' ');

  // 4. Expression / Destiny Number
  const exprRaw = allLetterValues.reduce((acc, v) => acc + v, 0);
  const exprReduced = reduceWithSteps(exprRaw, settings.keepMasterNumbers);
  const exprMeaning = getNumberMeaning(exprReduced.value);

  const expression: NumerologyIndexResult = {
    key: 'expression',
    label: 'Số sứ mệnh',
    englishLabel: 'Expression / Destiny',
    value: exprReduced.value,
    isMaster: exprReduced.isMaster,
    formulaDescription: `Tổng giá trị tất cả chữ cái trong "${normalizedFullName}"`,
    steps: [
      wordBreakdowns.map((w) => `${w.word}(${w.total})`).join(' + ') + ` = ${exprRaw}`,
      ...exprReduced.steps,
    ],
    meaningTitle: exprMeaning.title,
    meaningSummary: exprMeaning.summary,
    strengths: exprMeaning.strengths,
    accountNumberHint: exprMeaning.accountHint,
  };

  // 5. Soul Urge Number
  const soulRaw = allVowelValues.reduce((acc, v) => acc + v, 0);
  const soulReduced = reduceWithSteps(soulRaw, settings.keepMasterNumbers);
  const soulMeaning = getNumberMeaning(soulReduced.value);

  const soulUrge: NumerologyIndexResult = {
    key: 'soulUrge',
    label: 'Số linh hồn',
    englishLabel: 'Soul Urge Number',
    value: soulReduced.value,
    isMaster: soulReduced.isMaster,
    formulaDescription: 'Tổng giá trị các nguyên âm trong họ tên đầy đủ',
    steps: [
      allVowelValues.length > 0
        ? `${wordBreakdowns
            .map((w) => {
              const vs = w.letters.filter((l) => l.role === 'vowel');
              return vs.length > 0 ? `${vs.map((l) => `${l.normalizedChar}=${l.value}`).join('+')}` : '';
            })
            .filter(Boolean)
            .join(' | ')} = ${soulRaw}`
        : 'Không có nguyên âm',
      ...soulReduced.steps,
    ],
    meaningTitle: soulMeaning.title,
    meaningSummary: soulMeaning.summary,
    strengths: soulMeaning.strengths,
    accountNumberHint: soulMeaning.accountHint,
  };

  // 6. Personality Number
  const persRaw = allConsonantValues.reduce((acc, v) => acc + v, 0);
  const persReduced = reduceWithSteps(persRaw, settings.keepMasterNumbers);
  const persMeaning = getNumberMeaning(persReduced.value);

  const personality: NumerologyIndexResult = {
    key: 'personality',
    label: 'Số nhân cách',
    englishLabel: 'Personality Number',
    value: persReduced.value,
    isMaster: persReduced.isMaster,
    formulaDescription: 'Tổng giá trị các phụ âm trong họ tên đầy đủ',
    steps: [
      allConsonantValues.length > 0
        ? `${wordBreakdowns
            .map((w) => {
              const cs = w.letters.filter((l) => l.role === 'consonant');
              return cs.length > 0 ? `${cs.map((l) => `${l.normalizedChar}=${l.value}`).join('+')}` : '';
            })
            .filter(Boolean)
            .join(' | ')} = ${persRaw}`
        : 'Không có phụ âm',
      ...persReduced.steps,
    ],
    meaningTitle: persMeaning.title,
    meaningSummary: persMeaning.summary,
    strengths: persMeaning.strengths,
    accountNumberHint: persMeaning.accountHint,
  };

  // Highlights & Comparisons
  const allIndices = [lifePath, birthday, attitude, expression, soulUrge, personality];
  const baseValue = (v: number) => (v > 9 ? reduceWithSteps(v, false).value : v);

  const highlights: string[] = [
    `Trục chính ${lifePath.label} ${lifePath.value} (${lifePath.meaningTitle}) kết hợp cùng ${expression.label} ${expression.value} (${expression.meaningTitle}).`,
    `Nội tâm (${soulUrge.label} ${soulUrge.value}) hướng tới giá trị "${soulUrge.meaningTitle}", trong khi phong thái giao tiếp bên ngoài (${personality.label} ${personality.value}) nổi bật nét "${personality.meaningTitle}".`,
  ];

  const masterList = allIndices.filter((idx) => idx.isMaster);
  if (masterList.length > 0) {
    highlights.push(
      `Hồ sơ xuất hiện chỉ số Master: ${masterList.map((m) => `${m.label} (${m.value})`).join(', ')}. Đây là điểm nhấn rất dễ tạo câu chuyện cá nhân hóa khi chọn cặp số lặp.`
    );
  }

  // Find repeated digits/values across the 6 indices
  const valueMap = new Map<number, string[]>();
  for (const idx of allIndices) {
    const bv = baseValue(idx.value);
    const list = valueMap.get(bv) ?? [];
    list.push(`${idx.label} (${idx.value})`);
    valueMap.set(bv, list);
  }

  const comparisons: string[] = [];
  for (const [val, names] of valueMap.entries()) {
    if (names.length >= 2) {
      comparisons.push(
        `Sự tương đồng nổi bật ở con số ${val}: cùng xuất hiện tại ${names.join(' và ')}, thể hiện tính nhất quán cao trong hồ sơ.`
      );
    }
  }

  if (baseValue(soulUrge.value) !== baseValue(personality.value)) {
    comparisons.push(
      `Điểm bổ trợ thú vị giữa bên trong và bên ngoài: ${soulUrge.label} (${soulUrge.value} – ${soulUrge.meaningTitle}) khác biệt với ${personality.label} (${personality.value} – ${personality.meaningTitle}), nên chọn dãy số cân bằng giữa ý nghĩa cá nhân và độ ấn tượng khi đọc cho đối tác.`
    );
  } else {
    comparisons.push(
      `${soulUrge.label} và ${personality.label} đồng điệu ở số ${soulUrge.value}: mong muốn bên trong và cách thể hiện bên ngoài thống nhất rõ nét.`
    );
  }

  if (baseValue(lifePath.value) === baseValue(expression.value)) {
    comparisons.push(
      `${lifePath.label} và ${expression.label} cùng cộng hưởng ở trục ${lifePath.value}, rất thuận lợi để lấy chữ số ${baseValue(lifePath.value)} làm điểm neo chính trong số tài khoản.`
    );
  } else {
    comparisons.push(
      `${lifePath.label} (${lifePath.value}) và ${expression.label} (${expression.value}) tạo thế song hành: có thể kết hợp cả hai chữ số nền (${baseValue(lifePath.value)} và ${baseValue(expression.value)}) vào các vị trí nhấn.`
    );
  }

  // Priority digits for account number selection
  const digitReasonsMap = new Map<number, string[]>();
  const addDigitReason = (d: number, reason: string) => {
    if (d < 0 || d > 9) return;
    const existing = digitReasonsMap.get(d) ?? [];
    if (!existing.includes(reason)) {
      existing.push(reason);
      digitReasonsMap.set(d, existing);
    }
  };

  addDigitReason(baseValue(lifePath.value), `Gắn với ${lifePath.label} (${lifePath.value})`);
  addDigitReason(baseValue(expression.value), `Gắn với ${expression.label} (${expression.value})`);
  addDigitReason(baseValue(birthday.value), `Gắn với ${birthday.label} (${birthday.value})`);
  addDigitReason(baseValue(soulUrge.value), `Gắn với ${soulUrge.label} (${soulUrge.value})`);

  // Add harmonic complement digits from Life Path meaning if fewer than 4 distinct digits
  for (const d of lifePathMeaning.preferredDigits) {
    if (digitReasonsMap.size >= 5) break;
    if (!digitReasonsMap.has(d)) {
      addDigitReason(d, `Bổ trợ hài hòa cho trục ${lifePath.label} ${lifePath.value}`);
    }
  }

  const recommendedDigitReasons = Array.from(digitReasonsMap.entries())
    .slice(0, 5)
    .map(([digit, reasons]) => ({
      digit,
      reason: reasons.join('; '),
    }));

  const recommendedDigits = recommendedDigitReasons.map((r) => r.digit);

  const limitations = [
    'Thần số học Pythagoras là phương pháp diễn giải mang tính văn hóa – tham khảo nhằm tạo câu chuyện cá nhân hóa, không phải công cụ khoa học dự báo tài chính hay vận mệnh.',
    'Kết quả tên tiếng Việt phụ thuộc vào quy ước bỏ dấu và cách xếp chữ Y (nguyên âm/phụ âm); hệ thống luôn hiển thị rõ từng bước tính để GDV và khách hàng đối chiếu.',
    'Giới tính không được đưa vào công thức tính toán hoặc đánh giá điểm số.',
  ];

  return {
    normalizedFullName,
    formattedBirthDate,
    settings,
    wordBreakdowns,
    indices: {
      lifePath,
      birthday,
      attitude,
      expression,
      soulUrge,
      personality,
    },
    highlights,
    comparisons,
    recommendedDigits,
    recommendedDigitReasons,
    limitations,
  };
}
