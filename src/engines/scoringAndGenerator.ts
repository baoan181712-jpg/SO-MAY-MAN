import { CUSTOMER_GOALS, NUMBER_STYLES } from '../constants/banking';
import {
  AnalyzedAccountNumber,
  CandidateSource,
  CustomerProfile,
  NumberStyleId,
  NumerologyReport,
  ScoreDetail,
  ScoringWeights,
} from '../types';
import {
  analyzeEasternNumber,
  CONVENTIONAL_MULTI_PATTERNS,
  CONVENTIONAL_PAIRS,
  formatNumberGroups,
} from './easternNumerology';
import { reduceWithSteps } from './numerology';

function baseDigit(val: number): number {
  return val > 9 ? reduceWithSteps(val, false).value : val;
}

/**
 * Transparent 100-point scoring algorithm.
 * Strictly NEVER uses gender. Supports customizable weights (normalized to 100).
 */
export function scoreAccountNumber(
  numStr: string,
  profile: CustomerProfile,
  numerology: NumerologyReport | null,
  styleId: NumberStyleId,
  weights: ScoringWeights
): { score: ScoreDetail; numerologyMatches: { digit: number; matchedIndices: string[] }[]; selectionReasons: string[] } {
  const clean = numStr.replace(/\D/g, '');
  const digitNums = clean.split('').map(Number);
  const eastern = analyzeEasternNumber(clean);

  // Normalize weights to sum = 100
  const weightSum =
    weights.numerology +
    weights.eastern +
    weights.goalFit +
    weights.structure +
    weights.memorability || 100;

  const maxNum = (weights.numerology / weightSum) * 100;
  const maxEast = (weights.eastern / weightSum) * 100;
  const maxGoal = (weights.goalFit / weightSum) * 100;
  const maxStruct = (weights.structure / weightSum) * 100;
  const maxMem = (weights.memorability / weightSum) * 100;

  // 1. Numerology & Birthdate alignment (0..1 ratio)
  let numRatio = 0.5;
  let numExplanation = 'Chưa có hồ sơ thần số học — chấm mức trung tính.';
  const numerologyMatches: { digit: number; matchedIndices: string[] }[] = [];

  // Extract customer birth date anchors (DD, MM, YY, DDMM, YYYY)
  const birthParts = profile.birthDate ? profile.birthDate.split('-') : [];
  const birthYearFull = birthParts[0] || '';
  const birthYearTail = birthYearFull.length === 4 ? birthYearFull.slice(2) : '';
  const birthMonthPad = birthParts[1] || '';
  const birthDayPad = birthParts[2] || '';
  const birthDDMM = birthDayPad && birthMonthPad ? `${birthDayPad}${birthMonthPad}` : '';

  let hasBirthAnchor = false;
  let birthAnchorLabel = '';
  if (birthDDMM && clean.includes(birthDDMM)) {
    hasBirthAnchor = true;
    birthAnchorLabel = `ngày/tháng sinh ${birthDayPad}/${birthMonthPad}`;
  } else if (birthYearFull && clean.includes(birthYearFull)) {
    hasBirthAnchor = true;
    birthAnchorLabel = `năm sinh ${birthYearFull}`;
  } else if (birthYearTail && clean.length >= 4 && (clean.startsWith(birthYearTail) || clean.endsWith(birthYearTail))) {
    hasBirthAnchor = true;
    birthAnchorLabel = `năm sinh '${birthYearTail}`;
  } else if (birthDayPad && birthDayPad !== '00' && clean.length >= 4 && clean.startsWith(birthDayPad)) {
    hasBirthAnchor = true;
    birthAnchorLabel = `ngày sinh ${birthDayPad}`;
  }

  if (numerology) {
    const idxMap: { digit: number; label: string; weight: number }[] = [
      { digit: baseDigit(numerology.indices.lifePath.value), label: `Số chủ đạo (${numerology.indices.lifePath.value})`, weight: 0.36 },
      { digit: baseDigit(numerology.indices.expression.value), label: `Số sứ mệnh (${numerology.indices.expression.value})`, weight: 0.25 },
      { digit: baseDigit(numerology.indices.birthday.value), label: `Số ngày sinh (${numerology.indices.birthday.value})`, weight: 0.16 },
      { digit: baseDigit(numerology.indices.soulUrge.value), label: `Số linh hồn (${numerology.indices.soulUrge.value})`, weight: 0.13 },
      { digit: baseDigit(numerology.indices.attitude.value), label: `Số thái độ (${numerology.indices.attitude.value})`, weight: 0.1 },
    ];

    const matchedByDigit = new Map<number, string[]>();
    let matchedWeight = 0;

    for (const item of idxMap) {
      if (digitNums.includes(item.digit)) {
        matchedWeight += item.weight;
        const list = matchedByDigit.get(item.digit) ?? [];
        if (!list.includes(item.label)) {
          list.push(item.label);
          matchedByDigit.set(item.digit, list);
        }
      }
    }

    // Bonus if primary Life Path or Expression digit appears prominently (first or last digit)
    const lpDigit = baseDigit(numerology.indices.lifePath.value);
    const expDigit = baseDigit(numerology.indices.expression.value);
    const prominentCoreBonus =
      digitNums[0] === lpDigit ||
      digitNums[digitNums.length - 1] === lpDigit ||
      digitNums[digitNums.length - 1] === expDigit
        ? 0.14
        : 0;

    // Bonus if the reduced sum of the account number matches Life Path or Expression
    const accountDigitSum = reduceWithSteps(
      digitNums.reduce((a, b) => a + b, 0),
      false
    ).value;
    const sumMatchesCore =
      accountDigitSum === lpDigit || accountDigitSum === expDigit;

    // Bonus if Master digits (11, 22, 33) appear literally
    let masterLiteralBonus = 0;
    const allIdxVals = Object.values(numerology.indices);
    for (const idx of allIdxVals) {
      if (idx.isMaster && clean.includes(String(idx.value))) {
        masterLiteralBonus = 0.12;
      }
    }

    const birthBonus = hasBirthAnchor ? 0.18 : 0;

    numRatio = Math.min(
      1,
      0.16 +
        matchedWeight * 0.68 +
        prominentCoreBonus +
        (sumMatchesCore ? 0.12 : 0) +
        masterLiteralBonus +
        birthBonus
    );

    for (const [d, labels] of matchedByDigit.entries()) {
      numerologyMatches.push({ digit: d, matchedIndices: labels });
    }

    if (numerologyMatches.length > 0 || hasBirthAnchor) {
      const parts: string[] = [];
      if (hasBirthAnchor) {
        parts.push(`Gắn trực tiếp ${birthAnchorLabel}`);
      }
      if (numerologyMatches.length > 0) {
        parts.push(
          `Chứa chữ số hợp hồ sơ: ${numerologyMatches
            .map((m) => `số ${m.digit} (${m.matchedIndices[0]})`)
            .slice(0, 3)
            .join(', ')}`
        );
      }
      if (sumMatchesCore) {
        parts.push(`tổng rút gọn (${accountDigitSum}) đồng điệu trục chính`);
      }
      numExplanation = `${parts.join('; ')}.`;
    } else {
      numExplanation = `Các chữ số chưa trùng trực tiếp nhóm ưu tiên (${numerology.recommendedDigits.join(', ')}), thiên về ý nghĩa phổ thông.`;
    }
  }

  // 2. Eastern numerology score (0..1 ratio)
  let eastRatio = 0.42;
  const conventionalCount = eastern.recognizedPatterns.length;
  const hasMultiPattern = eastern.recognizedPatterns.some((p) => p.pattern.length >= 3);
  const endingPair = clean.slice(-2);
  const hasAuspiciousEndPair = Boolean(CONVENTIONAL_PAIRS[endingPair]);
  const lastDigit = digitNums[digitNums.length - 1];
  const favorableEndDigits = [9, 8, 6, 5, 3, 2, 1];

  if (hasMultiPattern) eastRatio += 0.22;
  eastRatio += Math.min(0.2, conventionalCount * 0.08);
  if (hasAuspiciousEndPair) eastRatio += 0.14;
  else if (favorableEndDigits.includes(lastDigit)) eastRatio += 0.08;
  if (eastern.yinYang.isBalanced) eastRatio += 0.12;
  if (eastern.structureTags.some((t) => t.includes('tiến') || t.includes('Đối xứng'))) {
    eastRatio += 0.08;
  }

  // Mild penalty if ending with 4 or 7 without conventional 78/79 combo
  if ((lastDigit === 4 || lastDigit === 7) && !hasAuspiciousEndPair) {
    eastRatio -= 0.1;
  }

  eastRatio = Math.max(0.22, Math.min(1, eastRatio));
  const eastExplanation =
    eastern.recognizedPatterns.length > 0
      ? `Nổi bật với tổ hợp ${eastern.recognizedPatterns
          .slice(0, 2)
          .map((p) => `${p.pattern} (${p.reading})`)
          .join(', ')}; âm dương ${eastern.yinYang.isBalanced ? 'cân bằng' : 'lệch nhẹ'} (${eastern.yinYang.ratioLabel}).`
      : `Đánh giá dựa trên chữ số kết thúc ${lastDigit} (${eastern.digits[eastern.digits.length - 1].folkReading}), cấu trúc "${eastern.structureTags[0]}" và âm dương (${eastern.yinYang.ratioLabel}).`;

  // 3. Goal & Style fit (0..1 ratio)
  const selectedGoalObjs = CUSTOMER_GOALS.filter((g) => profile.goals.includes(g.id));
  const styleObj = NUMBER_STYLES.find((s) => s.id === styleId) ?? NUMBER_STYLES[0];

  const styleDigits = new Set<number>(styleObj.preferredDigits);
  const goalDigits = new Set<number>(selectedGoalObjs.flatMap((g) => g.preferredDigits));
  const desiredPatterns = selectedGoalObjs.flatMap((g) => g.preferredPatterns);

  const styleMatchCount = digitNums.filter((d) => styleDigits.has(d)).length;
  const goalMatchCount = digitNums.filter((d) => goalDigits.has(d)).length;
  const styleCoverage = clean.length > 0 ? styleMatchCount / clean.length : 0;
  const goalCoverage = clean.length > 0 ? goalMatchCount / clean.length : 0;
  const patternHit = desiredPatterns.some((p) => clean.includes(p));

  let goalRatio = 0.22 + styleCoverage * 0.45 + goalCoverage * 0.22 + (patternHit ? 0.12 : 0);

  // Reward authentic non-68 theme alignment for non-wealth styles
  const isPureLocPhat = /^[68]+$/.test(clean) && clean.includes('6') && clean.includes('8');
  if (
    isPureLocPhat &&
    (styleId === 'career_leadership' ||
      styleId === 'family_harmony' ||
      styleId === 'peace_stability' ||
      styleId === 'unique_personalized')
  ) {
    goalRatio -= 0.22;
  }

  if (
    styleId === 'unique_personalized' &&
    (hasBirthAnchor || numerologyMatches.length >= 2)
  ) {
    goalRatio += 0.18;
  }

  if (
    styleId === 'easy_memorable' &&
    eastern.structureTags.some((t) => t.includes('Lặp') || t.includes('Đối xứng') || t.includes('2 chữ số') || t.includes('tiến'))
  ) {
    goalRatio += 0.16;
  }
  goalRatio = Math.max(0.15, Math.min(1, goalRatio));

  const goalNames = selectedGoalObjs.map((g) => g.label).join(', ');
  const goalExplanation = `Đáp ứng phong cách "${styleObj.label}"${goalNames ? ` và mong muốn "${goalNames}"` : ''} với ${Math.round(styleCoverage * 100)}% chữ số thuộc nhóm đặc trưng.`;

  // 4. Structure, balance, readability (0..1 ratio)
  let structRatio = 0.5;
  const hasGoodStructure = eastern.structureTags.some(
    (t) =>
      t.includes('Lặp') ||
      t.includes('Đối xứng') ||
      t.includes('Cặp đôi') ||
      t.includes('tiến') ||
      t.includes('Tam hoa') ||
      t.includes('Tứ quý')
  );
  if (hasGoodStructure) structRatio += 0.28;
  if (eastern.yinYang.isBalanced) structRatio += 0.14;
  if (digitNums[0] !== 0) structRatio += 0.08;
  structRatio = Math.min(1, structRatio);

  const structExplanation = `Nhịp đọc ${formatNumberGroups(clean)} (${eastern.structureTags.join(', ')}), tách cụm rõ ràng khi đọc qua điện thoại hoặc tại quầy.`;

  // 5. Memorability, repetition & symmetry (0..1 ratio)
  const uniqueCount = new Set(digitNums).size;
  let memRatio = 0.4;
  if (uniqueCount <= 2) memRatio += 0.35;
  else if (uniqueCount <= 3) memRatio += 0.26;
  else if (uniqueCount <= 4) memRatio += 0.14;

  if (
    eastern.structureTags.some(
      (t) => t.includes('Lặp') || t.includes('Đối xứng') || t.includes('Tứ quý') || t.includes('Tam hoa') || t.includes('tiến')
    )
  ) {
    memRatio += 0.22;
  }
  if (hasBirthAnchor) memRatio += 0.18; // Customer's own birthday is effortless for them to remember!
  if (clean.length <= 5) memRatio += 0.08;
  memRatio = Math.min(1, memRatio);

  const memExplanation = hasBirthAnchor
    ? `Chứa dấu ấn ${birthAnchorLabel} nên khách hàng nhớ ngay lập tức, kết hợp ${uniqueCount} chữ số gọn gàng.`
    : `Sử dụng ${uniqueCount} chữ số khác nhau trên tổng ${clean.length} số${
        eastern.structureTags[0] !== 'Cấu trúc hài hòa tự do' ? `, có điểm neo "${eastern.structureTags[0]}"` : ''
      } nên dễ ghi nhớ nhanh.`;

  const bNum = Math.round(numRatio * maxNum * 10) / 10;
  const bEast = Math.round(eastRatio * maxEast * 10) / 10;
  const bGoal = Math.round(goalRatio * maxGoal * 10) / 10;
  const bStruct = Math.round(structRatio * maxStruct * 10) / 10;
  const bMem = Math.round(memRatio * maxMem * 10) / 10;

  const total = Math.min(100, Math.round(bNum + bEast + bGoal + bStruct + bMem));

  const selectionReasons: string[] = [];
  if (hasBirthAnchor) {
    selectionReasons.push(`Mang dấu ấn cá nhân từ ${birthAnchorLabel} của khách hàng`);
  }
  if (numerologyMatches.length > 0) {
    const matchText = numerologyMatches
      .slice(0, 2)
      .map((m) => `số ${m.digit} (${m.matchedIndices[0]})`)
      .join(' & ');
    selectionReasons.push(`Hợp hồ sơ khách qua ${matchText}`);
  }
  if (eastern.recognizedPatterns.length > 0) {
    selectionReasons.push(
      `Tổ hợp ${eastern.recognizedPatterns
        .slice(0, 2)
        .map((p) => `${p.pattern} (${p.reading})`)
        .join(' · ')} hợp gu ${styleObj.label.toLowerCase()}`
    );
  }
  selectionReasons.push(`Cấu trúc "${eastern.structureTags[0]}" dễ đọc, dễ nhớ khi giao dịch`);

  return {
    score: {
      total,
      breakdown: {
        numerology: bNum,
        eastern: bEast,
        goalFit: bGoal,
        structure: bStruct,
        memorability: bMem,
      },
      explanations: {
        numerology: numExplanation,
        eastern: eastExplanation,
        goalFit: goalExplanation,
        structure: structExplanation,
        memorability: memExplanation,
      },
    },
    numerologyMatches,
    selectionReasons,
  };
}

export function analyzeSingleCandidate(
  rawNumber: string,
  source: CandidateSource,
  profile: CustomerProfile,
  numerology: NumerologyReport | null,
  styleId: NumberStyleId,
  weights: ScoringWeights
): AnalyzedAccountNumber | null {
  const clean = rawNumber.replace(/\D/g, '');
  if (clean.length < 3 || clean.length > 16) {
    return null;
  }

  const eastern = analyzeEasternNumber(clean);
  const { score, numerologyMatches, selectionReasons } = scoreAccountNumber(
    clean,
    profile,
    numerology,
    styleId,
    weights
  );

  const sourceLabel =
    source === 'ai_generated'
      ? 'Đề xuất cá nhân hóa'
      : source === 'inventory'
        ? 'Từ kho số nội bộ'
        : 'GDV nhập thủ công';

  const availabilityNotice =
    source === 'ai_generated'
      ? 'Số gợi ý mô phỏng — cần đối chiếu kho số chính thức của ngân hàng trước khi xác nhận mở tài khoản.'
      : 'Cần kiểm tra trạng thái khả dụng trực tiếp trên hệ thống lõi ngân hàng trước khi chốt đăng ký.';

  return {
    id: `${source}-${clean}`,
    number: clean,
    formatted: formatNumberGroups(clean),
    length: clean.length,
    source,
    sourceLabel,
    availabilityNotice,
    eastern,
    score,
    selectionReasons,
    numerologyMatches,
  };
}

type MeaningFamily =
  | 'loc_phat'
  | 'than_tai_ong_dia'
  | 'tam_hoa_tu_quy'
  | 'tien_len'
  | 'birthday_personal'
  | 'career_truong_cuu'
  | 'family_peace'
  | 'symmetry_rhythm';

function classifyMeaningFamily(item: AnalyzedAccountNumber, birthDDMM: string, birthYearTail: string): MeaningFamily {
  const n = item.number;
  const firstPat = item.eastern.recognizedPatterns[0]?.reading || '';
  const tags = item.eastern.structureTags.join(' ');

  if (
    (birthDDMM && n.includes(birthDDMM)) ||
    (birthYearTail && n.length >= 4 && (n.startsWith(birthYearTail) || n.endsWith(birthYearTail)))
  ) {
    return 'birthday_personal';
  }
  if (firstPat.includes('Tứ quý') || firstPat.includes('Tam hoa') || tags.includes('Tứ quý') || tags.includes('Tam hoa')) {
    return 'tam_hoa_tu_quy';
  }
  if (firstPat.includes('Thần Tài') || firstPat.includes('Ông Địa')) {
    return 'than_tai_ong_dia';
  }
  if (tags.includes('Dãy tiến') || firstPat.includes('Tiến đều') || firstPat.includes('San bằng')) {
    return 'tien_len';
  }
  if (
    firstPat.includes('Lộc Phát') ||
    firstPat.includes('Phát Lộc') ||
    (/68|86/.test(n) && !/39|79|19|25|59/.test(n))
  ) {
    return 'loc_phat';
  }
  if (firstPat.includes('Trường Cửu') || firstPat.includes('Nhất Cửu') || firstPat.includes('Nhất Phát') || /19|89|99/.test(n)) {
    return 'career_truong_cuu';
  }
  if (firstPat.includes('Song Hỷ') || firstPat.includes('Phúc') || firstPat.includes('Sinh') || /25|29|59|22|55/.test(n)) {
    return 'family_peace';
  }
  return 'symmetry_rhythm';
}

/**
 * Diversity-aware re-ranking for the TOP 6 slots so tellers see a genuinely varied,
 * customer-tailored selection instead of 6 near-identical Lộc Phát clones.
 */
function diversifyTopCandidates(
  sorted: AnalyzedAccountNumber[],
  styleId: NumberStyleId,
  birthDDMM: string,
  birthYearTail: string
): AnalyzedAccountNumber[] {
  if (sorted.length <= 6) return sorted;

  const maxLocPhatInTop6 = styleId === 'wealth_growth' ? 2 : 1;
  const maxPerOtherFamily = 2;

  const picked: AnalyzedAccountNumber[] = [];
  const deferred: AnalyzedAccountNumber[] = [];
  const familyCounts = new Map<MeaningFamily, number>();

  for (const cand of sorted) {
    if (picked.length >= 6) {
      deferred.push(cand);
      continue;
    }

    const fam = classifyMeaningFamily(cand, birthDDMM, birthYearTail);
    const count = familyCounts.get(fam) ?? 0;
    const cap = fam === 'loc_phat' ? maxLocPhatInTop6 : maxPerOtherFamily;

    if (count < cap) {
      picked.push(cand);
      familyCounts.set(fam, count + 1);
    } else {
      deferred.push(cand);
    }
  }

  // If picked < 6 (unlikely), backfill from deferred
  while (picked.length < 6 && deferred.length > 0) {
    const next = deferred.shift();
    if (next) picked.push(next);
  }

  // Keep TOP 6 strictly ordered from highest score to lowest score
  picked.sort((a, b) => {
    if (b.score.total !== a.score.total) return b.score.total - a.score.total;
    return b.score.breakdown.numerology - a.score.breakdown.numerology;
  });

  return [...picked, ...deferred];
}

/**
 * Mode B: Generate 14+ genuinely personalized, diverse candidates matching exact length (3..8)
 * tailored to Customer's Name, Birthdate, Numerology core digits, and Personality/Style.
 */
export function generateSmartCandidates(
  length: number,
  styleId: NumberStyleId,
  profile: CustomerProfile,
  numerology: NumerologyReport | null,
  weights: ScoringWeights
): AnalyzedAccountNumber[] {
  const safeLength = Math.max(3, Math.min(8, Math.floor(length)));
  const styleObj = NUMBER_STYLES.find((s) => s.id === styleId) ?? NUMBER_STYLES[0];

  // 1. Extract customer's own numerology core digits (strictly unique, ordered by importance)
  const personalDigits: number[] = [];
  if (numerology) {
    const rawCore = [
      baseDigit(numerology.indices.lifePath.value),
      baseDigit(numerology.indices.expression.value),
      baseDigit(numerology.indices.birthday.value),
      baseDigit(numerology.indices.soulUrge.value),
      baseDigit(numerology.indices.attitude.value),
      baseDigit(numerology.indices.personality.value),
    ];
    for (const d of rawCore) {
      if (d >= 1 && d <= 9 && !personalDigits.includes(d)) {
        personalDigits.push(d);
      }
    }
  }
  for (const d of styleObj.preferredDigits) {
    if (d >= 1 && d <= 9 && !personalDigits.includes(d)) {
      personalDigits.push(d);
    }
  }
  for (const d of [9, 8, 6, 5, 3, 2, 1]) {
    if (!personalDigits.includes(d)) personalDigits.push(d);
  }

  const d1 = personalDigits[0] ?? 9; // Primary Life Path / Style digit
  const d2 = personalDigits[1] ?? 5; // Expression / Secondary digit
  const d3 = personalDigits[2] ?? 8; // Birthday / Tertiary digit
  const d4 = personalDigits[3] ?? 2; // Soul Urge / Fourth digit

  // 2. Customer birth date components (real anchors!)
  const birthParts = profile.birthDate ? profile.birthDate.split('-') : [];
  const yearFull = birthParts[0] || '';
  const yearTail = yearFull.length === 4 ? yearFull.slice(2, 4) : '';
  const monthPad = birthParts[1] || '';
  const dayPad = birthParts[2] || '';
  const ddmm = dayPad && monthPad ? `${dayPad}${monthPad}` : '';
  const ddmmyy = ddmm && yearTail ? `${ddmm}${yearTail}` : '';

  // 3. Truly distinct, style-authentic building blocks (NOT cloning 68/86 everywhere!)
  const styleBlocks: Record<
    NumberStyleId,
    { pairs: string[]; triples: string[]; quads: string[]; anchors: number[] }
  > = {
    business_prosperity: {
      pairs: ['39', '79', '38', '78', '89', '98', '36', '88', '68'],
      triples: ['379', '789', '389', '139', '168', '888', '999', '333'],
      quads: ['3979', '3878', '3939', '7979', '1368', '3689', '6789', '8899'],
      anchors: [9, 8, 3, 7],
    },
    wealth_growth: {
      pairs: ['68', '86', '88', '66', '39', '79', '28', '36', '89'],
      triples: ['168', '268', '689', '379', '888', '666', '568', '789'],
      quads: ['3979', '1368', '5689', '6688', '8899', '6868', '2689', '6789'],
      anchors: [8, 6, 9, 3],
    },
    career_leadership: {
      pairs: ['19', '18', '89', '98', '99', '15', '59', '39', '88'],
      triples: ['189', '199', '159', '789', '999', '111', '888', '389'],
      quads: ['1989', '1589', '1899', '1919', '9898', '6789', '9999', '1889'],
      anchors: [1, 9, 8, 5],
    },
    peace_stability: {
      pairs: ['59', '25', '29', '56', '55', '99', '09', '05', '26'],
      triples: ['259', '569', '555', '999', '269', '256', '059', '567'],
      quads: ['2569', '5689', '5599', '2929', '2525', '5656', '2345', '5555'],
      anchors: [5, 9, 2, 0],
    },
    family_harmony: {
      pairs: ['22', '25', '26', '29', '56', '59', '66', '99', '55'],
      triples: ['259', '269', '229', '569', '222', '666', '555', '256'],
      quads: ['2266', '2299', '2525', '2929', '5656', '2569', '2662', '5599'],
      anchors: [2, 5, 6, 9],
    },
    unique_personalized: {
      pairs: [`${d1}${d2}`, `${d2}${d1}`, `${d1}${d3}`, `${d2}${d3}`, `${d1}${d1}`, `${d1}9`, `${d2}9`, '39', '89'],
      triples: [`${d1}${d2}${d3}`, `${d1}${d2}${d1}`, `${d1}${d3}${d1}`, `${d1}${d1}${d1}`, `${d1}89`, `${d1}79`, `${d2}99`],
      quads: [
        `${d1}${d2}${d1}${d2}`,
        `${d1}${d2}${d2}${d1}`,
        `${d1}${d1}${d2}${d2}`,
        `${d1}${d2}${d3}${d4}`,
        `${d1}${d3}${d3}${d1}`,
        `${d1}${d1}${d1}${d1}`,
      ],
      anchors: [d1, d2, d3, d4],
    },
    easy_memorable: {
      pairs: [`${d1}${d2}`, `${d1}${d1}`, `${d2}${d2}`, '99', '88', '55', '22', '39', '89'],
      triples: [`${d1}${d1}${d1}`, `${d1}${d2}${d1}`, `${d2}${d1}${d2}`, '789', '999', '555', '333', '222'],
      quads: [
        `${d1}${d2}${d1}${d2}`,
        `${d1}${d1}${d2}${d2}`,
        `${d1}${d2}${d2}${d1}`,
        '6789',
        '5678',
        '1234',
        '2299',
        '3399',
        '5588',
      ],
      anchors: [d1, d2, 9, 5],
    },
  };

  const blocks = styleBlocks[styleId];
  const a1 = blocks.anchors[0] ?? d1;
  const a2 = blocks.anchors[1] ?? d2;
  const rawSet = new Set<string>();

  const pushIfValid = (candidate: string) => {
    const clean = candidate.replace(/\D/g, '');
    if (clean.length === safeLength && !/^0+$/.test(clean)) {
      rawSet.add(clean);
    }
  };

  // 4. Generate rich customer-personalized + style-specific candidates strictly matching `safeLength` (3..8)
  if (safeLength === 3) {
    // Customer personal numerology triples first
    pushIfValid(`${d1}${d2}${d3}`);
    pushIfValid(`${d1}${d2}${d1}`);
    pushIfValid(`${d1}${d1}${d1}`);
    pushIfValid(`${d1}${d1}${d2}`);
    pushIfValid(`${d1}${a1}${a2}`);
    pushIfValid(`${d2}${a1}${a2}`);
    if (dayPad) pushIfValid(`${d1}${dayPad}`);
    if (yearTail) pushIfValid(`${d1}${yearTail}`);
    // Style-authentic triples
    for (const t of blocks.triples) pushIfValid(t);
    pushIfValid(`${d1}79`);
    pushIfValid(`${d1}89`);
    pushIfValid(`${d1}99`);
    pushIfValid(`${d2}39`);
  } else if (safeLength === 4) {
    // Customer personal + birthday anchors
    if (ddmm) pushIfValid(ddmm);
    if (yearFull) pushIfValid(yearFull);
    if (yearTail) {
      pushIfValid(`${yearTail}${d1}${d2}`);
      pushIfValid(`${yearTail}${blocks.pairs[0]}`);
      pushIfValid(`${yearTail}${a1}${a1}`);
    }
    if (dayPad) {
      pushIfValid(`${dayPad}${blocks.pairs[0]}`);
      pushIfValid(`${dayPad}${d1}${d1}`);
    }
    pushIfValid(`${d1}${d2}${d1}${d2}`);
    pushIfValid(`${d1}${d2}${d2}${d1}`);
    pushIfValid(`${d1}${d1}${d2}${d2}`);
    pushIfValid(`${d1}${d1}${d1}${d1}`);
    pushIfValid(`${d1}${d2}${blocks.pairs[0]}`);
    pushIfValid(`${d1}${blocks.triples[0]}`);
    pushIfValid(`${d2}${blocks.triples[1]}`);
    for (const q of blocks.quads) pushIfValid(q);
  } else if (safeLength === 5) {
    // Customer personal + birthday anchors
    if (ddmm) {
      pushIfValid(`${d1}${ddmm}`);
      pushIfValid(`${ddmm}${d1}`);
    }
    if (yearTail) {
      pushIfValid(`${yearTail}${blocks.triples[0]}`);
      pushIfValid(`${yearTail}${d1}${d1}${d1}`);
    }
    if (dayPad) {
      pushIfValid(`${dayPad}${blocks.triples[0]}`);
    }
    pushIfValid(`${d1}${d2}${d3}${d2}${d1}`);
    pushIfValid(`${d1}${d2}${d1}${d2}${d1}`);
    pushIfValid(`${d1}${d1}${d1}${d2}${d2}`);
    pushIfValid(`${d1}${blocks.quads[0]}`);
    pushIfValid(`${d1}${blocks.quads[1]}`);
    pushIfValid(`${d2}${blocks.quads[2]}`);
    pushIfValid(`${d1}${d2}${blocks.triples[0]}`);
    pushIfValid(`${d1}${d2}${blocks.triples[1]}`);
    pushIfValid(`${blocks.pairs[0]}${d1}${blocks.pairs[0]}`);
    pushIfValid(`${blocks.pairs[1]}${blocks.triples[2]}`);
    pushIfValid(`${d1}6789`);
    pushIfValid(`${d1}3979`);
    pushIfValid(`${d1}5689`);
  } else if (safeLength === 6) {
    // Customer personal + birthday anchors
    if (ddmmyy) pushIfValid(ddmmyy);
    if (ddmm) {
      pushIfValid(`${ddmm}${blocks.pairs[0]}`);
      pushIfValid(`${ddmm}${d1}${d1}`);
      pushIfValid(`${blocks.pairs[0]}${ddmm}`);
    }
    if (yearTail) {
      pushIfValid(`${yearTail}${blocks.quads[0]}`);
      pushIfValid(`${yearTail}${blocks.quads[1]}`);
      pushIfValid(`${yearTail}${d1}${d1}${d2}${d2}`);
    }
    if (dayPad) {
      pushIfValid(`${dayPad}${blocks.quads[0]}`);
    }
    // Personal rhythm patterns
    pushIfValid(`${d1}${d2}${d3}${d1}${d2}${d3}`);
    pushIfValid(`${d1}${d2}${d3}${d3}${d2}${d1}`);
    pushIfValid(`${d1}${d2}${d1}${d2}${d1}${d2}`);
    pushIfValid(`${d1}${d1}${d2}${d2}${d3}${d3}`);
    pushIfValid(`${d1}${d2}${blocks.quads[0]}`);
    pushIfValid(`${d1}${d2}${blocks.quads[1]}`);
    pushIfValid(`${d1}${d3}${blocks.quads[2]}`);
    pushIfValid(`${d1}${d2}${a1}${a1}${a1}${a1}`);
    pushIfValid(`${blocks.triples[0]}${blocks.triples[0]}`);
    pushIfValid(`${blocks.triples[1]}${blocks.triples[1]}`);
    pushIfValid(`${blocks.pairs[0]}${blocks.pairs[1]}${blocks.pairs[2]}`);
    pushIfValid(`${blocks.pairs[0]}${blocks.pairs[0]}${blocks.pairs[0]}`);
    pushIfValid(`${blocks.pairs[1]}${blocks.pairs[1]}${blocks.pairs[1]}`);
    pushIfValid(`${blocks.pairs[0]}${blocks.quads[3]}`);
  } else if (safeLength === 7) {
    if (ddmmyy) {
      pushIfValid(`${d1}${ddmmyy}`);
      pushIfValid(`${ddmmyy}${d1}`);
    }
    if (ddmm) {
      pushIfValid(`${ddmm}${blocks.triples[0]}`);
      pushIfValid(`${ddmm}${d1}${d1}${d1}`);
    }
    if (yearTail) {
      pushIfValid(`${yearTail}${d1}${blocks.quads[0]}`);
      pushIfValid(`${yearTail}${blocks.pairs[0]}${blocks.triples[0]}`);
    }
    pushIfValid(`${d1}${d2}${d3}${d4}${d3}${d2}${d1}`);
    pushIfValid(`${d1}${d2}${d3}${d1}${d2}${d3}${d1}`);
    pushIfValid(`${d1}${blocks.triples[0]}${blocks.triples[0]}`);
    pushIfValid(`${d1}${blocks.pairs[0]}${blocks.quads[0]}`);
    pushIfValid(`${d1}${blocks.pairs[1]}${blocks.quads[1]}`);
    pushIfValid(`${d1}${d2}${d3}${blocks.quads[0]}`);
    pushIfValid(`${d1}${d2}${d3}${blocks.quads[2]}`);
    pushIfValid(`${blocks.triples[0]}${d1}${blocks.triples[0]}`);
    pushIfValid(`${blocks.triples[1]}${d2}${blocks.triples[1]}`);
    pushIfValid(`${blocks.triples[0]}${blocks.quads[0]}`);
    pushIfValid(`${blocks.triples[2]}${blocks.quads[1]}`);
  } else if (safeLength === 8) {
    if (ddmm && yearFull) pushIfValid(`${ddmm}${yearFull}`);
    if (ddmm) {
      pushIfValid(`${ddmm}${blocks.quads[0]}`);
      pushIfValid(`${ddmm}${blocks.quads[1]}`);
      pushIfValid(`${ddmm}${d1}${d1}${d2}${d2}`);
    }
    if (yearFull) {
      pushIfValid(`${yearFull}${blocks.quads[0]}`);
      pushIfValid(`${yearFull}${d1}${d1}${d1}${d1}`);
    }
    if (ddmmyy) {
      pushIfValid(`${ddmmyy}${blocks.pairs[0]}`);
      pushIfValid(`${blocks.pairs[0]}${ddmmyy}`);
    }
    pushIfValid(`${d1}${d2}${d3}${d4}${d1}${d2}${d3}${d4}`);
    pushIfValid(`${d1}${d2}${d3}${d4}${d4}${d3}${d2}${d1}`);
    pushIfValid(`${d1}${d2}${blocks.quads[0]}${blocks.pairs[0]}`);
    pushIfValid(`${d1}${d2}${d1}${d2}${blocks.quads[0]}`);
    pushIfValid(`${blocks.quads[0]}${blocks.quads[0]}`);
    pushIfValid(`${blocks.quads[1]}${blocks.quads[1]}`);
    pushIfValid(`${blocks.quads[2]}${blocks.quads[2]}`);
    pushIfValid(`${blocks.quads[0]}${blocks.quads[1]}`);
    pushIfValid(`${blocks.pairs[0]}${blocks.pairs[1]}${blocks.pairs[0]}${blocks.pairs[1]}`);
    pushIfValid(`${d1}${d1}${d2}${d2}${blocks.quads[3]}`);
  }

  // Ensure at least 14 distinct candidates using customer personal + style pairs
  let fallbackCounter = 0;
  while (rawSet.size < 14 && fallbackCounter < 40) {
    const p1 = blocks.pairs[fallbackCounter % blocks.pairs.length];
    const p2 = `${d1}${d2}`;
    const p3 = blocks.pairs[(fallbackCounter + 3) % blocks.pairs.length];
    const p4 = `${d2}${d3}`;
    const built = `${p1}${p2}${p3}${p4}`.slice(0, safeLength);
    pushIfValid(built);
    fallbackCounter += 1;
  }

  const analyzed: AnalyzedAccountNumber[] = [];
  for (const num of rawSet) {
    const item = analyzeSingleCandidate(
      num,
      'ai_generated',
      profile,
      numerology,
      styleId,
      weights
    );
    if (item) {
      item.styleTag = styleObj.label;
      analyzed.push(item);
    }
  }

  // Sort strictly descending by total score, tie-break by numerology (customer fit) then goal fit
  analyzed.sort((a, b) => {
    if (b.score.total !== a.score.total) return b.score.total - a.score.total;
    if (b.score.breakdown.numerology !== a.score.breakdown.numerology) {
      return b.score.breakdown.numerology - a.score.breakdown.numerology;
    }
    return b.score.breakdown.goalFit - a.score.breakdown.goalFit;
  });

  // Apply diversity re-ranking for TOP 6 so suggestions showcase varied, customer-matched themes
  return diversifyTopCandidates(analyzed, styleId, ddmm, yearTail);
}

/**
 * Parse manual text input containing one or multiple numbers (newline, comma, semicolon, space separated).
 */
export function parseManualNumbers(input: string): { valid: string[]; invalid: string[] } {
  const tokens = input
    .split(/[\n,;|\t]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const validSet = new Set<string>();
  const invalid: string[] = [];

  for (const token of tokens) {
    const clean = token.replace(/[\s.-]/g, '');
    if (/^\d{3,16}$/.test(clean)) {
      validSet.add(clean);
    } else {
      invalid.push(token);
    }
  }

  return {
    valid: Array.from(validSet),
    invalid,
  };
}
