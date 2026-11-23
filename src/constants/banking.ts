import {
  CustomerGoalId,
  CustomerProfile,
  InventoryNumberItem,
  NumberStyleId,
  ScoringWeights,
} from '../types';

export const CUSTOMER_GOALS: {
  id: CustomerGoalId;
  label: string;
  description: string;
  preferredDigits: number[];
  preferredPatterns: string[];
}[] = [
  {
    id: 'wealth_accumulation',
    label: 'Tài lộc và tích lũy',
    description: 'Ưu tiên ý nghĩa Lộc, Phát, tích tụ bền bỉ và dễ ghi nhớ.',
    preferredDigits: [6, 8, 9, 3],
    preferredPatterns: ['68', '86', '6868', '168', '88', '66', '39', '79'],
  },
  {
    id: 'business_growth',
    label: 'Kinh doanh và phát triển',
    description: 'Nhấn mạnh nhịp điệu tiến lên, mở rộng giao thương và dễ đọc cho đối tác.',
    preferredDigits: [8, 6, 3, 9, 1],
    preferredPatterns: ['168', '68', '86', '88', '39', '79', '38', '78', '1368'],
  },
  {
    id: 'career_status',
    label: 'Sự nghiệp và vị thế',
    description: 'Đề cao con số dẫn đầu, vững chãi, trường cửu và phong thái chuyên nghiệp.',
    preferredDigits: [1, 8, 9, 5],
    preferredPatterns: ['168', '99', '89', '98', '186', '88', '19'],
  },
  {
    id: 'family_peace',
    label: 'Gia đình và bình an',
    description: 'Hướng đến sự cân bằng âm dương, tròn đầy, bốn mùa an yên và gắn kết.',
    preferredDigits: [0, 2, 4, 5, 6, 9],
    preferredPatterns: ['26', '56', '66', '99', '22', '00', '28'],
  },
  {
    id: 'unique_memorable',
    label: 'Cá tính, độc đáo và dễ nhớ',
    description: 'Tập trung vào cấu trúc đối xứng, lặp nhịp, dấu ấn cá nhân nổi bật.',
    preferredDigits: [1, 2, 5, 6, 8, 9],
    preferredPatterns: ['6868', '8686', '6886', '8888', '9999', '6666'],
  },
];

export const NUMBER_STYLES: {
  id: NumberStyleId;
  label: string;
  shortDesc: string;
  preferredDigits: number[];
  recommendedWeights: ScoringWeights;
}[] = [
  {
    id: 'wealth_growth',
    label: 'Tài lộc, phát triển',
    shortDesc: 'Tập trung nhóm Lộc – Phát – Trường Cửu',
    preferredDigits: [6, 8, 9, 3],
    recommendedWeights: { numerology: 25, eastern: 30, goalFit: 20, structure: 15, memorability: 10 },
  },
  {
    id: 'business_prosperity',
    label: 'Kinh doanh, thịnh vượng',
    shortDesc: 'Kết hợp Thần Tài, Ông Địa, Lộc Phát ấn tượng',
    preferredDigits: [8, 6, 3, 7, 9],
    recommendedWeights: { numerology: 25, eastern: 30, goalFit: 20, structure: 15, memorability: 10 },
  },
  {
    id: 'career_leadership',
    label: 'Sự nghiệp, dẫn đầu',
    shortDesc: 'Số 1 dẫn đầu, số 8 phát triển, số 9 vững bền',
    preferredDigits: [1, 8, 9, 5],
    recommendedWeights: { numerology: 35, eastern: 20, goalFit: 20, structure: 15, memorability: 10 },
  },
  {
    id: 'peace_stability',
    label: 'Bình an, bền vững',
    shortDesc: 'Cân bằng âm dương, nhịp số êm và hài hòa',
    preferredDigits: [0, 2, 4, 5, 6, 9],
    recommendedWeights: { numerology: 30, eastern: 20, goalFit: 20, structure: 20, memorability: 10 },
  },
  {
    id: 'family_harmony',
    label: 'Gia đình, viên mãn',
    shortDesc: 'Song hỷ, sinh lộc, trọn vẹn và gắn bó',
    preferredDigits: [2, 5, 6, 0, 9],
    recommendedWeights: { numerology: 30, eastern: 25, goalFit: 20, structure: 15, memorability: 10 },
  },
  {
    id: 'unique_personalized',
    label: 'Độc đáo, cá nhân hóa',
    shortDesc: 'Bám sát tối đa 6 chỉ số thần số học cá nhân',
    preferredDigits: [1, 3, 5, 7, 8, 9],
    recommendedWeights: { numerology: 40, eastern: 15, goalFit: 20, structure: 15, memorability: 10 },
  },
  {
    id: 'easy_memorable',
    label: 'Dễ nhớ, dễ đọc',
    shortDesc: 'Ưu tiên lặp cặp, đối xứng, nhịp đọc gọn gàng',
    preferredDigits: [6, 8, 9, 2, 0, 1],
    recommendedWeights: { numerology: 20, eastern: 20, goalFit: 15, structure: 20, memorability: 25 },
  },
];

export const DEFAULT_WEIGHTS: ScoringWeights = {
  numerology: 30,
  eastern: 25,
  goalFit: 20,
  structure: 15,
  memorability: 10,
};

export const SAMPLE_CUSTOMERS: { label: string; profile: CustomerProfile }[] = [
  {
    label: 'Khách hàng kinh doanh (Nguyễn Minh Khang)',
    profile: {
      fullName: 'Nguyễn Minh Khang',
      birthDate: '1990-08-15',
      gender: 'male',
      selfDescribedPersonality: 'Quyết đoán, thực tế, thích sự gọn gàng và rõ ràng trong giao dịch.',
      goals: ['business_growth', 'wealth_accumulation'],
      notes: 'Thường xuyên đọc số tài khoản cho đối tác qua điện thoại, ưu tiên 6 số hoặc 8 số dễ nhớ.',
    },
  },
  {
    label: 'Khách hàng trẻ yêu cá tính (Trần Thảo Vy)',
    profile: {
      fullName: 'Trần Thảo Vy',
      birthDate: '1997-11-24',
      gender: 'female',
      selfDescribedPersonality: 'Sáng tạo, tinh tế, yêu thích các chi tiết mang dấu ấn riêng và nhẹ nhàng.',
      goals: ['unique_memorable', 'career_status'],
      notes: 'Thích dãy 4 hoặc 6 chữ số có tính đối xứng, không cần quá cầu kỳ.',
    },
  },
  {
    label: 'Khách hàng gia đình (Lê Hoàng Anh)',
    profile: {
      fullName: 'Lê Hoàng Anh',
      birthDate: '1986-04-09',
      gender: 'unspecified',
      selfDescribedPersonality: 'Điềm đạm, coi trọng sự ổn định lâu dài và tích lũy cho gia đình.',
      goals: ['family_peace', 'wealth_accumulation'],
      notes: 'Muốn mở tài khoản tiết kiệm và giao dịch gia đình, thích nhịp số êm và hài hòa.',
    },
  },
];

export const INITIAL_INVENTORY: InventoryNumberItem[] = [
  {
    id: 'inv-1',
    number: '6868',
    length: 4,
    structureType: 'Lặp cặp ABAB',
    status: 'unverified',
    note: 'Cặp Lộc Phát lặp lại kinh điển, rất dễ đọc.',
    addedAt: '2026-11-18',
    feeTier: 'Nhóm phổ biến',
  },
  {
    id: 'inv-2',
    number: '16868',
    length: 5,
    structureType: 'Lộc Phát / Thần Tài',
    status: 'unverified',
    note: 'Nhất Lộc Phát kết hợp đuôi 68.',
    addedAt: '2026-11-18',
    feeTier: 'Nhóm chọn lọc',
  },
  {
    id: 'inv-3',
    number: '3979',
    length: 4,
    structureType: 'Lộc Phát / Thần Tài',
    status: 'consulted',
    note: 'Thần Tài Nhỏ – Thần Tài Lớn.',
    addedAt: '2026-11-19',
    feeTier: 'Nhóm chọn lọc',
  },
  {
    id: 'inv-4',
    number: '688668',
    length: 6,
    structureType: 'Đối xứng / Gánh',
    status: 'unverified',
    note: 'Đầu Lộc Phát – giữa Song Phát – đuôi Lộc Phát.',
    addedAt: '2026-11-19',
    feeTier: 'Nhóm cao cấp',
  },
  {
    id: 'inv-5',
    number: '168888',
    length: 6,
    structureType: 'Tứ quý / Tam hoa',
    status: 'on_hold',
    note: 'Nhất Lộc kết hợp Tứ quý 8.',
    addedAt: '2026-11-20',
    feeTier: 'Nhóm đặc biệt',
  },
  {
    id: 'inv-6',
    number: '268268',
    length: 6,
    structureType: 'Lặp cụm ABCABC',
    status: 'unverified',
    note: 'Mãi Lộc Phát lặp nhịp 3-3 rõ ràng.',
    addedAt: '2026-11-20',
    feeTier: 'Nhóm chọn lọc',
  },
  {
    id: 'inv-7',
    number: '886688',
    length: 6,
    structureType: 'Đối xứng / Gánh',
    status: 'unverified',
    note: 'Cấu trúc gánh Song Phát – Song Lộc – Song Phát.',
    addedAt: '2026-11-20',
    feeTier: 'Nhóm cao cấp',
  },
  {
    id: 'inv-8',
    number: '198688',
    length: 6,
    structureType: 'Lộc Phát / Thần Tài',
    status: 'unverified',
    note: 'Phù hợp khách hàng sinh năm 1986 kèm Song Phát.',
    addedAt: '2026-11-21',
    feeTier: 'Nhóm cá nhân hóa',
  },
  {
    id: 'inv-9',
    number: '5689',
    length: 4,
    structureType: 'Tiến lên',
    status: 'unverified',
    note: 'Dãy tiến Sinh – Lộc – Phát – Trường Cửu.',
    addedAt: '2026-11-21',
    feeTier: 'Nhóm phổ biến',
  },
  {
    id: 'inv-10',
    number: '136899',
    length: 6,
    structureType: 'Tiến lên',
    status: 'registered',
    note: 'Sinh Tài Lộc Phát – Trường Cửu.',
    addedAt: '2026-11-21',
    feeTier: 'Nhóm chọn lọc',
  },
  {
    id: 'inv-11',
    number: '68686868',
    length: 8,
    structureType: 'Lặp cặp ABAB',
    status: 'unverified',
    note: 'Lộc Phát lặp 4 nhịp, nhận diện nổi bật.',
    addedAt: '2026-11-21',
    feeTier: 'Nhóm đặc biệt',
  },
  {
    id: 'inv-12',
    number: '387886',
    length: 6,
    structureType: 'Lộc Phát / Thần Tài',
    status: 'unverified',
    note: 'Ông Địa nhỏ – Ông Địa lớn – Phát Lộc.',
    addedAt: '2026-11-22',
    feeTier: 'Nhóm chọn lọc',
  },
];
