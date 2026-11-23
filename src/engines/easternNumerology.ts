import { EasternAnalysis, EasternDigitInfo, RecognizedPattern } from '../types';

export const EASTERN_DIGITS: Record<number, EasternDigitInfo> = {
  0: {
    digit: 0,
    vietnameseWord: 'Không',
    sinoVietnamese: 'Không / Viên',
    folkReading: 'Tròn đầy',
    meaning: 'Tròn đầy, viên mãn, khởi đầu khoáng đạt và trọn vẹn.',
    yinYang: 'Âm',
    elementHaDo: 'Thổ',
  },
  1: {
    digit: 1,
    vietnameseWord: 'Một',
    sinoVietnamese: 'Nhất',
    folkReading: 'Nhất',
    meaning: 'Nhất, dẫn đầu, độc nhất và khởi sinh vững vàng.',
    yinYang: 'Dương',
    elementHaDo: 'Thủy',
  },
  2: {
    digit: 2,
    vietnameseWord: 'Hai',
    sinoVietnamese: 'Nhị / Song',
    folkReading: 'Mãi / Song hỷ',
    meaning: 'Song hỷ, mãi mãi, cân xứng và đồng hành gắn kết.',
    yinYang: 'Âm',
    elementHaDo: 'Hỏa',
  },
  3: {
    digit: 3,
    vietnameseWord: 'Ba',
    sinoVietnamese: 'Tam',
    folkReading: 'Tài',
    meaning: 'Tài lộc, tài năng, thế kiềng ba chân vững chãi.',
    yinYang: 'Dương',
    elementHaDo: 'Mộc',
  },
  4: {
    digit: 4,
    vietnameseWord: 'Bốn',
    sinoVietnamese: 'Tứ',
    folkReading: 'Bốn mùa',
    meaning: 'Bốn mùa tuần hoàn, ổn định, vuông vức và bền bỉ.',
    yinYang: 'Âm',
    elementHaDo: 'Kim',
  },
  5: {
    digit: 5,
    vietnameseWord: 'Năm',
    sinoVietnamese: 'Ngũ',
    folkReading: 'Sinh / Phúc',
    meaning: 'Sinh sôi, trung tâm ngũ hành, cân bằng hài hòa.',
    yinYang: 'Dương',
    elementHaDo: 'Thổ',
  },
  6: {
    digit: 6,
    vietnameseWord: 'Sáu',
    sinoVietnamese: 'Lục',
    folkReading: 'Lộc',
    meaning: 'Lộc, thuận lợi, sung túc và trôi chảy trong giao dịch.',
    yinYang: 'Âm',
    elementHaDo: 'Thủy',
  },
  7: {
    digit: 7,
    vietnameseWord: 'Bảy',
    sinoVietnamese: 'Thất',
    folkReading: 'Thất / Phất',
    meaning: 'Thất (số bảy) hoặc sức mạnh nội lực, tinh thần tùy quan niệm văn hóa.',
    yinYang: 'Dương',
    elementHaDo: 'Hỏa',
  },
  8: {
    digit: 8,
    vietnameseWord: 'Tám',
    sinoVietnamese: 'Bát',
    folkReading: 'Phát',
    meaning: 'Phát đạt, mở rộng, tăng trưởng bền vững.',
    yinYang: 'Âm',
    elementHaDo: 'Mộc',
  },
  9: {
    digit: 9,
    vietnameseWord: 'Chín',
    sinoVietnamese: 'Cửu',
    folkReading: 'Trường cửu',
    meaning: 'Trường cửu, lâu bền, viên mãn và uy tín cao.',
    yinYang: 'Dương',
    elementHaDo: 'Kim',
  },
};

export const CONVENTIONAL_PAIRS: Record<string, { reading: string; meaning: string }> = {
  '39': { reading: 'Thần Tài nhỏ', meaning: 'Tài năng và sự bền lâu, biểu tượng quen thuộc trong kinh doanh.' },
  '79': { reading: 'Thần Tài lớn', meaning: 'Biểu tượng Thần Tài lớn phổ biến, tạo ấn tượng mạnh về sự hanh thông.' },
  '38': { reading: 'Ông Địa nhỏ', meaning: 'Tài – Phát song hành, gắn với sự vững chãi nền tảng.' },
  '78': { reading: 'Ông Địa lớn', meaning: 'Biểu tượng Ông Địa lớn theo quan niệm dân gian, giữ nền và mở rộng.' },
  '68': { reading: 'Lộc Phát', meaning: 'Lộc rồi Phát — tổ hợp được ưa chuộng hàng đầu tại Việt Nam.' },
  '86': { reading: 'Phát Lộc', meaning: 'Phát triển đi liền với tích tụ lộc, dễ đọc và rất quen tai.' },
  '88': { reading: 'Song Phát', meaning: 'Hai chữ Phát liền kề, nhấn mạnh nhịp tăng trưởng rõ nét.' },
  '99': { reading: 'Trường Cửu', meaning: 'Bền lâu, vững chãi và đáng tin cậy theo thời gian.' },
  '66': { reading: 'Song Lộc', meaning: 'Nhân đôi ý nghĩa thuận lợi và tích lũy.' },
  '28': { reading: 'Mãi Phát', meaning: 'Phát triển bền bỉ, nhịp đọc gọn gàng.' },
  '26': { reading: 'Mãi Lộc', meaning: 'Giữ gìn lộc bền lâu và hài hòa.' },
  '29': { reading: 'Mãi Trường Cửu', meaning: 'Gắn kết dài lâu, êm ấm và bền vững theo năm tháng.' },
  '36': { reading: 'Tài Lộc', meaning: 'Kết hợp Tài và Lộc, ngắn gọn, dễ hiểu.' },
  '33': { reading: 'Song Tài', meaning: 'Nhấn mạnh tài năng và sự vững vàng.' },
  '56': { reading: 'Sinh Lộc', meaning: 'Sinh sôi, tích lũy thuận lợi.' },
  '58': { reading: 'Sinh Phát', meaning: 'Khởi sinh và mở rộng phát triển.' },
  '59': { reading: 'Phúc Trường Cửu', meaning: 'Phúc lộc sinh sôi và bền lâu, rất hợp người hướng gia đình.' },
  '55': { reading: 'Song Phúc', meaning: 'Cân bằng trung hòa, sinh khí dồi dào.' },
  '25': { reading: 'Song Sinh', meaning: 'Hài hòa, sinh trưởng êm ả và gắn kết.' },
  '22': { reading: 'Song Hỷ', meaning: 'Cân xứng, có đôi có cặp, mang sắc thái ấm áp và gắn bó.' },
  '19': { reading: 'Nhất Cửu', meaning: 'Dẫn đầu và bền vững, thể hiện vị thế và sự uy tín.' },
  '18': { reading: 'Nhất Phát', meaning: 'Vươn lên dẫn đầu và phát triển rõ rệt.' },
  '15': { reading: 'Nhất Sinh', meaning: 'Khởi đầu thuận lợi, sinh khí mạnh mẽ.' },
  '16': { reading: 'Nhất Lộc', meaning: 'Mở đầu suôn sẻ, đón lộc tinh gọn.' },
  '89': { reading: 'Phát Trường Cửu', meaning: 'Phát triển gắn với sự bền vững lâu dài.' },
  '98': { reading: 'Trường Phát', meaning: 'Bền vững và không ngừng phát triển.' },
  '09': { reading: 'Viên Cửu', meaning: 'Tròn đầy và lâu bền, nhịp số thanh thoát.' },
  '06': { reading: 'Viên Lộc', meaning: 'Tròn vẹn và thuận lợi.' },
  '05': { reading: 'Viên Phúc', meaning: 'Trọn vẹn, cân bằng và an hòa.' },
};

export const CONVENTIONAL_MULTI_PATTERNS: Record<string, { reading: string; meaning: string }> = {
  '6868': { reading: 'Lộc Phát – Lộc Phát', meaning: 'Hai cặp Lộc Phát lặp lại cân đối, cực kỳ dễ nhớ và dễ nhận diện.' },
  '8686': { reading: 'Phát Lộc – Phát Lộc', meaning: 'Hai cặp Phát Lộc nối tiếp, nhịp điệu mạnh mẽ và dứt khoát.' },
  '6886': { reading: 'Lộc Phát – Phát Lộc', meaning: 'Cấu trúc đối xứng gương Lộc Phát – Phát Lộc rất sang trọng.' },
  '8668': { reading: 'Phát Lộc – Lộc Phát', meaning: 'Cấu trúc đối xứng hài hòa, đầu cuối trọn vẹn.' },
  '3979': { reading: 'Thần Tài Nhỏ – Thần Tài Lớn', meaning: 'Bộ đôi Thần Tài tăng tiến, quen thuộc trong giới kinh doanh.' },
  '3939': { reading: 'Song Thần Tài', meaning: 'Hai nhịp Thần Tài liền kề, rất sắc nét và dễ nhớ cho người kinh doanh.' },
  '7979': { reading: 'Thần Tài Lớn lặp', meaning: 'Nhịp lặp Thần Tài lớn đầy ấn tượng và mạnh mẽ.' },
  '3878': { reading: 'Ông Địa Nhỏ – Ông Địa Lớn', meaning: 'Bộ đôi Ông Địa vững nền, thuận lợi cho giao dịch.' },
  '1368': { reading: 'Sinh Tài Lộc Phát', meaning: 'Dãy tiến bốn bước từ khởi sinh đến Tài – Lộc – Phát.' },
  '1589': { reading: 'Nhất Sinh Phát Cửu', meaning: 'Dãy tiến sự nghiệp: Khởi đầu – Sinh sôi – Phát đạt – Trường cửu.' },
  '1989': { reading: 'Nhất Cửu Phát Cửu', meaning: 'Dẫn đầu, phát triển và giữ vững vị thế dài lâu.' },
  '2569': { reading: 'Song Sinh Lộc Cửu', meaning: 'Dãy tiến êm ái tượng trưng cho gia đình hòa hợp, tích lũy bền lâu.' },
  '5689': { reading: 'Sinh Lộc Phát Cửu', meaning: 'Dãy tiến bốn bước hài hòa từ Sinh – Lộc – Phát đến Trường Cửu.' },
  '3689': { reading: 'Tài Lộc Phát Cửu', meaning: 'Dãy tiến đủ Tài – Lộc – Phát – Trường Cửu, rất cân đối.' },
  '6789': { reading: 'San bằng tất cả (Tiến 6-7-8-9)', meaning: 'Bộ tứ số tiến liên tiếp cực kỳ nổi tiếng, biểu trưng cho sự bứt phá.' },
  '5678': { reading: 'Tiến đều 5-6-7-8', meaning: 'Bốn số tiến liên tiếp gọn gàng, thể hiện bước tiến vững chắc.' },
  '1234': { reading: 'Tiến đều 1-2-3-4', meaning: 'Bốn bước khởi đầu liền mạch, cực dễ đọc và ghi nhớ.' },
  '2345': { reading: 'Tiến đều 2-3-4-5', meaning: 'Nhịp tiến nhẹ nhàng, ổn định và hài hòa.' },
  '168': { reading: 'Nhất Lộc Phát', meaning: 'Một đường Lộc Phát — bộ ba kinh điển, ngắn gọn và ấn tượng.' },
  '186': { reading: 'Nhất Phát Lộc', meaning: 'Dẫn đầu Phát Lộc, dứt khoát và dễ đọc.' },
  '189': { reading: 'Nhất Phát Cửu', meaning: 'Dẫn đầu, phát triển và bền vững — rất hợp người làm quản lý, lãnh đạo.' },
  '199': { reading: 'Nhất Trường Cửu', meaning: 'Vị thế dẫn đầu bền lâu, tối giản và sang trọng.' },
  '259': { reading: 'Mãi Phúc Cửu', meaning: 'Bình an, sinh phúc và gắn kết bền lâu.' },
  '269': { reading: 'Mãi Lộc Cửu', meaning: 'Tích lũy êm ả, giữ lộc dài lâu cho gia đình.' },
  '569': { reading: 'Sinh Lộc Cửu', meaning: 'Sinh sôi thuận lợi và giữ nền tảng vững bền.' },
  '268': { reading: 'Mãi Lộc Phát', meaning: 'Lộc Phát bền lâu, âm điệu tròn vành rõ chữ.' },
  '568': { reading: 'Sinh Lộc Phát', meaning: 'Sinh sôi Lộc Phát, tiến dần nhẹ nhàng.' },
  '689': { reading: 'Lộc Phát Trường Cửu', meaning: 'Ba số tiến Lộc – Phát – Trường Cửu, trọn vẹn ý nghĩa.' },
  '789': { reading: 'Tiến đều 7-8-9', meaning: 'Ba số tiến cao nhất, sắc nét và đầy khí chất bứt phá.' },
  '379': { reading: 'Tài Thần Tài', meaning: 'Tài năng kết hợp Thần Tài lớn, nổi bật trong giao thương.' },
  '8888': { reading: 'Tứ quý Phát', meaning: 'Bốn chữ số 8 đồng nhất, độ nhận diện cực cao.' },
  '9999': { reading: 'Tứ quý Trường Cửu', meaning: 'Bốn chữ số 9 đồng nhất, biểu trưng cho sự bền vững và vị thế.' },
  '6666': { reading: 'Tứ quý Lộc', meaning: 'Bốn chữ số 6 đồng nhất, êm tai và dễ nhớ.' },
  '5555': { reading: 'Tứ quý Phúc', meaning: 'Bốn chữ số 5 cân bằng ngũ hành, mang sắc thái an hòa.' },
  '3333': { reading: 'Tứ quý Tài', meaning: 'Bốn chữ số 3 vững chãi, tôn vinh tài năng và bản lĩnh.' },
  '2222': { reading: 'Tứ quý Song Hỷ', meaning: 'Bốn chữ số 2 cân xứng, nhẹ nhàng và cực kỳ dễ nhớ.' },
  '1111': { reading: 'Tứ quý Nhất', meaning: 'Bốn chữ số 1 sắc nét, biểu trưng cho tinh thần tiên phong.' },
  '888': { reading: 'Tam hoa Phát', meaning: 'Ba chữ số 8 liền kề, nổi bật và sắc nét.' },
  '999': { reading: 'Tam hoa Trường Cửu', meaning: 'Ba chữ số 9 liền kề, vững chãi và đẳng cấp.' },
  '666': { reading: 'Tam hoa Lộc', meaning: 'Ba chữ số 6 liền kề, thuận lợi và dễ đọc.' },
  '555': { reading: 'Tam hoa Phúc', meaning: 'Ba chữ số 5 trung hòa, sinh khí và an yên.' },
  '333': { reading: 'Tam hoa Tài', meaning: 'Ba chữ số 3 vững như kiềng ba chân, đề cao năng lực.' },
  '222': { reading: 'Tam hoa Song Hỷ', meaning: 'Ba chữ số 2 mềm mại, cân bằng và dễ đọc.' },
  '111': { reading: 'Tam hoa Nhất', meaning: 'Ba chữ số 1 tinh gọn, mang dấu ấn dẫn đầu.' },
};

/**
 * Format account digits into clean, readable bank-counter groups.
 */
export function formatNumberGroups(numStr: string): string {
  const len = numStr.length;
  if (len <= 3) return numStr;
  if (len === 4) return `${numStr.slice(0, 2)} ${numStr.slice(2)}`;
  if (len === 5) return `${numStr.slice(0, 2)} ${numStr.slice(2)}`;
  if (len === 6) {
    // Check if ABCABC or ABABAB
    if (numStr.slice(0, 3) === numStr.slice(3)) {
      return `${numStr.slice(0, 3)} ${numStr.slice(3)}`;
    }
    return `${numStr.slice(0, 2)} ${numStr.slice(2, 4)} ${numStr.slice(4)}`;
  }
  if (len === 7) return `${numStr.slice(0, 3)} ${numStr.slice(3, 5)} ${numStr.slice(5)}`;
  if (len === 8) return `${numStr.slice(0, 4)} ${numStr.slice(4)}`;
  return numStr.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function detectStructureTags(numStr: string): string[] {
  const tags: string[] = [];
  const len = numStr.length;

  // Check palindrome
  const reversed = numStr.split('').reverse().join('');
  if (len >= 4 && numStr === reversed) {
    tags.push('Đối xứng (Gánh / Gương)');
  }

  // Check ABAB or ABABAB or ABABABAB
  if (len >= 4 && len % 2 === 0) {
    const firstPair = numStr.slice(0, 2);
    if (firstPair[0] !== firstPair[1] && firstPair.repeat(len / 2) === numStr) {
      tags.push('Lặp cặp ABAB');
    }
  }

  // Check ABCABC
  if (len === 6 && numStr.slice(0, 3) === numStr.slice(3) && new Set(numStr).size > 1) {
    tags.push('Lặp cụm 3-3 (ABC-ABC)');
  }

  // Check ABCDABCD
  if (len === 8 && numStr.slice(0, 4) === numStr.slice(4) && new Set(numStr).size > 1) {
    tags.push('Lặp cụm 4-4 (ABCD-ABCD)');
  }

  // Check AABB or AABBCC
  if (len >= 4 && len % 2 === 0) {
    let allDoublePairs = true;
    for (let i = 0; i < len; i += 2) {
      if (numStr[i] !== numStr[i + 1]) {
        allDoublePairs = false;
        break;
      }
    }
    if (allDoublePairs && new Set(numStr).size >= 2) {
      tags.push('Cặp đôi song hành (AABB)');
    }
  }

  // Check Tứ quý / Tam hoa
  if (/(\d)\1{3,}/.test(numStr)) {
    tags.push('Tứ quý nổi bật');
  } else if (/(\d)\1{2}/.test(numStr)) {
    tags.push('Tam hoa liền kề');
  }

  // Check strictly or gently ascending
  let strictlyAsc = true;
  let nonDesc = true;
  for (let i = 1; i < len; i++) {
    if (Number(numStr[i]) <= Number(numStr[i - 1])) strictlyAsc = false;
    if (Number(numStr[i]) < Number(numStr[i - 1])) nonDesc = false;
  }
  if (strictlyAsc && len >= 3) {
    tags.push('Dãy tiến đều');
  } else if (nonDesc && new Set(numStr).size >= 3 && len >= 4) {
    tags.push('Nhịp tiến lên');
  }

  // Compact digit variety
  if (new Set(numStr).size <= 2 && len >= 4) {
    tags.push('Chỉ 2 chữ số — siêu dễ nhớ');
  }

  if (tags.length === 0) {
    tags.push('Cấu trúc hài hòa tự do');
  }

  return tags;
}

export function classifyPrimaryStructure(numStr: string): string {
  const tags = detectStructureTags(numStr);
  if (tags.some((t) => t.includes('Tứ quý') || t.includes('Tam hoa'))) return 'Tứ quý / Tam hoa';
  if (tags.some((t) => t.includes('Lặp cặp'))) return 'Lặp cặp ABAB';
  if (tags.some((t) => t.includes('Lặp cụm'))) return 'Lặp cụm ABCABC';
  if (tags.some((t) => t.includes('Đối xứng'))) return 'Đối xứng / Gánh';
  if (tags.some((t) => t.includes('tiến'))) return 'Tiến lên';
  if (/(68|86|39|79|38|78)/.test(numStr)) return 'Lộc Phát / Thần Tài';
  return 'Cấu trúc khác';
}

export function analyzeEasternNumber(rawNumber: string): EasternAnalysis {
  const clean = rawNumber.replace(/\D/g, '');
  const digitArr = clean.split('').map(Number);
  const digits = digitArr.map((d) => EASTERN_DIGITS[d]);

  // Split into natural reading chunks (pairs, or 3+2 / 3+2+2 for odd lengths)
  const chunks: string[] = [];
  if (clean.length % 2 === 0) {
    for (let i = 0; i < clean.length; i += 2) {
      chunks.push(clean.slice(i, i + 2));
    }
  } else if (clean.length === 3) {
    chunks.push(clean);
  } else if (clean.length === 5) {
    // Prefer 3+2 if first 3 is conventional (like 168-68), else 2+3 or 1+2+2
    if (CONVENTIONAL_MULTI_PATTERNS[clean.slice(0, 3)]) {
      chunks.push(clean.slice(0, 3), clean.slice(3));
    } else if (CONVENTIONAL_MULTI_PATTERNS[clean.slice(2)]) {
      chunks.push(clean.slice(0, 2), clean.slice(2));
    } else {
      chunks.push(clean.slice(0, 1), clean.slice(1, 3), clean.slice(3));
    }
  } else if (clean.length === 7) {
    chunks.push(clean.slice(0, 3), clean.slice(3, 5), clean.slice(5));
  } else {
    for (let i = 0; i < clean.length; i += 2) {
      chunks.push(clean.slice(i, i + 2));
    }
  }

  // Pair breakdown (strictly without fabricating meanings for non-conventional pairs)
  const pairBreakdown = chunks.map((chunk) => {
    if (chunk.length === 2 && CONVENTIONAL_PAIRS[chunk]) {
      return {
        pair: chunk,
        hasConvention: true,
        folkReading: CONVENTIONAL_PAIRS[chunk].reading,
        meaning: CONVENTIONAL_PAIRS[chunk].meaning,
      };
    }
    if (chunk.length >= 3 && CONVENTIONAL_MULTI_PATTERNS[chunk]) {
      return {
        pair: chunk,
        hasConvention: true,
        folkReading: CONVENTIONAL_MULTI_PATTERNS[chunk].reading,
        meaning: CONVENTIONAL_MULTI_PATTERNS[chunk].meaning,
      };
    }
    const digitWords = chunk
      .split('')
      .map((c) => EASTERN_DIGITS[Number(c)].folkReading)
      .join(' – ');
    return {
      pair: chunk,
      hasConvention: false,
      folkReading: `Đọc rời từng số (${digitWords})`,
      meaning: 'Tổ hợp chưa có quy ước dân gian cố định; diễn giải dựa theo từng chữ số thành phần và nhịp đọc.',
    };
  });

  // Scan recognized multi-digit and pair patterns across the string
  const recognizedPatterns: RecognizedPattern[] = [];
  const seenKeys = new Set<string>();

  // Multi-digit patterns first (length 4 then 3)
  for (const patLen of [4, 3]) {
    for (let i = 0; i <= clean.length - patLen; i++) {
      const sub = clean.slice(i, i + patLen);
      const match = CONVENTIONAL_MULTI_PATTERNS[sub];
      if (match && !seenKeys.has(`${sub}@${i}`)) {
        seenKeys.add(`${sub}@${i}`);
        recognizedPatterns.push({
          pattern: sub,
          positionIndex: i,
          reading: match.reading,
          meaning: match.meaning,
          category: 'conventional',
          isPopular: true,
        });
      }
    }
  }

  // Conventional 2-digit patterns
  for (let i = 0; i <= clean.length - 2; i++) {
    const sub = clean.slice(i, i + 2);
    const match = CONVENTIONAL_PAIRS[sub];
    if (match && !seenKeys.has(`${sub}@${i}`)) {
      seenKeys.add(`${sub}@${i}`);
      recognizedPatterns.push({
        pattern: sub,
        positionIndex: i,
        reading: match.reading,
        meaning: match.meaning,
        category: 'conventional',
        isPopular: true,
      });
    }
  }

  // 3-layer reading
  const byDigit = digits.map((d) => d.vietnameseWord).join(' – ');
  const byPair = chunks
    .map((chunk) =>
      chunk
        .split('')
        .map((c) => EASTERN_DIGITS[Number(c)].vietnameseWord)
        .join(' ')
    )
    .join(' – ');

  // Folk popular reading vs creative note
  let folkPopular = '';
  let creativeNote = '';

  if (CONVENTIONAL_MULTI_PATTERNS[clean]) {
    folkPopular = CONVENTIONAL_MULTI_PATTERNS[clean].reading;
    creativeNote = `Cách đọc phổ biến rộng rãi: "${folkPopular}". Không cần diễn giải thêm phức tạp.`;
  } else {
    const allChunksConventional = pairBreakdown.every((p) => p.hasConvention);
    if (allChunksConventional) {
      folkPopular = pairBreakdown.map((p) => p.folkReading).join(' – ');
      creativeNote = `Các cụm số đều thuộc nhóm cách đọc dân gian quen thuộc (${folkPopular}), giúp khách hàng dễ cảm nhận ngay lần nghe đầu tiên.`;
    } else {
      const popularFound = pairBreakdown.filter((p) => p.hasConvention);
      if (popularFound.length > 0) {
        folkPopular = popularFound
          .map((p) => `${p.pair} (${p.folkReading})`)
          .join(' · ');
        const creativeJoin = digits.map((d) => d.folkReading).join(' – ');
        creativeNote = `Phân biệt rõ: Cụm ${folkPopular} là cách đọc dân gian phổ biến; phần còn lại được kết nối theo nhịp đọc sáng tạo từng số (${creativeJoin}).`;
      } else {
        folkPopular = 'Không chứa cụm quy ước dân gian cố định';
        creativeNote = `Diễn giải sáng tạo dựa trên ý nghĩa từng chữ số: ${digits
          .map((d) => `${d.digit} (${d.folkReading})`)
          .join(' · ')}.`;
      }
    }
  }

  // Yin-Yang balance (Chẵn = Âm, Lẻ = Dương)
  const yinCount = digits.filter((d) => d.yinYang === 'Âm').length;
  const yangCount = digits.filter((d) => d.yinYang === 'Dương').length;
  const diff = Math.abs(yinCount - yangCount);
  const isBalanced = clean.length <= 3 ? diff <= 1 : diff <= 2;
  const ratioLabel = `${yinCount} Âm (chẵn) / ${yangCount} Dương (lẻ)`;

  // Five Elements via Hà Đồ (published method: 1,6 Thủy; 2,7 Hỏa; 3,8 Mộc; 4,9 Kim; 5,0 Thổ)
  const elementsHaDo: Record<'Thủy' | 'Hỏa' | 'Mộc' | 'Kim' | 'Thổ', number> = {
    Thủy: 0,
    Hỏa: 0,
    Mộc: 0,
    Kim: 0,
    Thổ: 0,
  };
  for (const d of digits) {
    elementsHaDo[d.elementHaDo] += 1;
  }

  const structureTags = detectStructureTags(clean);

  const endingDigit = digits[digits.length - 1];
  const endingPair = clean.slice(-2);
  const endingPairMatch = CONVENTIONAL_PAIRS[endingPair];
  const dominantElement = (Object.entries(elementsHaDo) as [string, number][]).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const primaryStructure = structureTags[0] || 'Cấu trúc hài hòa';
  const primaryPattern = recognizedPatterns[0];
  const uniqueDigitCount = new Set(digitArr).size;

  const headline = primaryPattern
    ? `${primaryPattern.reading} · ${primaryStructure}`
    : `${primaryStructure} · Đuôi ${endingDigit.digit} (${endingDigit.folkReading})`;

  const coreMeaning =
    recognizedPatterns.length > 0
      ? `Mang thông điệp dân gian quen thuộc "${recognizedPatterns
          .slice(0, 2)
          .map((p) => `${p.pattern} – ${p.reading}`)
          .join(', ')}" kết hợp kết thúc bằng số ${endingDigit.digit} (${endingDigit.folkReading} – ${endingDigit.meaning.replace(/\.$/, '').toLowerCase()}).`
      : `Không gán ghép cầu kỳ, giá trị nổi bật đến từ ${digits
          .slice(0, 3)
          .map((d) => `số ${d.digit} (${d.folkReading})`)
          .join(', ')} và chữ số kết thúc ${endingDigit.digit} (${endingDigit.folkReading}), tạo cảm giác gọn gàng, chỉn chu.`;

  const practicalValue =
    uniqueDigitCount <= 3
      ? `Chỉ dùng ${uniqueDigitCount} chữ số khác nhau trên ${clean.length} số với nhịp tách "${byPair}", giúp khách hàng và đối tác nhớ ngay sau 1 lần nghe và giảm nhầm lẫn khi chuyển khoản.`
      : `Nhịp tách "${byPair}" rõ ràng (${primaryStructure.toLowerCase()}), thuận tiện khi đọc qua điện thoại, in trên danh thiếp hoặc xuất hóa đơn giao dịch.`;

  const endingHighlight = endingPairMatch
    ? `Cụm kết ${endingPair} (${endingPairMatch.reading}): ${endingPairMatch.meaning}`
    : `Chữ số kết thúc ${endingDigit.digit} (${endingDigit.sinoVietnamese} – ${endingDigit.folkReading}): ${endingDigit.meaning}`;

  const overallSummary =
    recognizedPatterns.length > 0
      ? `Dãy số ${formatNumberGroups(clean)} nổi bật với tổ hợp quen thuộc ${recognizedPatterns
          .slice(0, 2)
          .map((p) => `${p.pattern} (${p.reading})`)
          .join(', ')}, kết thúc bằng số ${endingDigit.digit} (${endingDigit.folkReading}). Tỷ lệ âm dương ${ratioLabel} (${isBalanced ? 'cân bằng' : 'nghiêng nhẹ về một cực'}), hành trội theo Hà Đồ là ${dominantElement[0]}.`
      : `Dãy số ${formatNumberGroups(clean)} tạo điểm nhấn nhờ cấu trúc "${structureTags[0]}" và chữ số kết thúc ${endingDigit.digit} (${endingDigit.folkReading}). Tỷ lệ âm dương ${ratioLabel}, hành trội theo Hà Đồ là ${dominantElement[0]}.`;

  return {
    digits,
    pairBreakdown,
    recognizedPatterns,
    readings: {
      byDigit,
      byPair,
      folkPopular,
      creativeNote,
    },
    yinYang: {
      yinCount,
      yangCount,
      ratioLabel,
      isBalanced,
    },
    elementsHaDo,
    overallSummary,
    quickValuePitch: {
      headline,
      coreMeaning,
      practicalValue,
      endingHighlight,
    },
    structureTags,
  };
}
