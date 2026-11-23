import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '100kb' }));

function createGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

interface ConsultantRequestPayload {
  customerFirstName: string;
  goalLabel: string;
  personality: string;
  notes: string;
  numerologySummary: {
    lifePath: number;
    birthday: number;
    attitude: number;
    expression: number;
    soulUrge: number;
    personalityNum: number;
    recommendedDigits: number[];
  };
  accountNumber: string;
  formattedNumber: string;
  sourceLabel: string;
  totalScore: number;
  scoreBreakdown: {
    numerology: number;
    eastern: number;
    goalFit: number;
    structure: number;
    memorability: number;
  };
  readings: {
    byDigit: string;
    byPair: string;
    folkPopular: string;
    creativeNote: string;
  };
  easternHighlights: string[];
  structureNotes: string[];
  styleLabel: string;
}

function sanitizeShortText(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\r\n\t]+/g, ' ').trim().slice(0, maxLen);
}

function isValidDigits(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9]{3,16}$/.test(value);
}

app.post('/api/consultant', async (req, res) => {
  try {
    const body = req.body as Partial<ConsultantRequestPayload>;

    if (!body || !isValidDigits(body.accountNumber)) {
      res.status(400).json({
        error: 'Số tài khoản không hợp lệ. Vui lòng chọn dãy từ 3 đến 16 chữ số.',
      });
      return;
    }

    if (!body.numerologySummary || typeof body.numerologySummary.lifePath !== 'number') {
      res.status(400).json({
        error: 'Thiếu dữ liệu phân tích thần số học để cá nhân hóa kịch bản.',
      });
      return;
    }

    const ai = createGeminiClient();

    // Note: Only pass non-identifying first/display name & deterministic indices to the model;
    // never store or log customer personal data on the server.
    const customerName = sanitizeShortText(body.customerFirstName, 80) || 'Quý khách';
    const goalLabel = sanitizeShortText(body.goalLabel, 100);
    const personality = sanitizeShortText(body.personality, 240);
    const notes = sanitizeShortText(body.notes, 240);
    const styleLabel = sanitizeShortText(body.styleLabel, 100);
    const formattedNumber = sanitizeShortText(body.formattedNumber, 30) || body.accountNumber;
    const byDigit = sanitizeShortText(body.readings?.byDigit, 150);
    const byPair = sanitizeShortText(body.readings?.byPair, 150);
    const folkPopular = sanitizeShortText(body.readings?.folkPopular, 200);
    const easternHighlights = Array.isArray(body.easternHighlights)
      ? body.easternHighlights.slice(0, 8).map((s) => sanitizeShortText(s, 140))
      : [];
    const structureNotes = Array.isArray(body.structureNotes)
      ? body.structureNotes.slice(0, 6).map((s) => sanitizeShortText(s, 140))
      : [];

    const ns = body.numerologySummary;

    const systemInstruction = `Bạn là chuyên gia tư vấn số tài khoản ngân hàng cao cấp (Lucky Number Bank) hỗ trợ Giao dịch viên (GDV) tại quầy.
Nguyên tắc bắt buộc:
1. Viết hoàn toàn bằng tiếng Việt tự nhiên, lịch sự, tinh tế, chuẩn phong cách tư vấn ngân hàng chuyên nghiệp (xưng hô "em" - "anh/chị").
2. KHÔNG BAO GIỜ tự tính lại thần số học; chỉ sử dụng đúng các chỉ số đã cung cấp sẵn.
3. KHÔNG BAO GIỜ cam kết số tài khoản mang lại giàu sang, đổi vận, hay bằng chứng khoa học về tài lộc. Luôn dùng cách diễn đạt văn minh ("theo quan niệm dân gian", "tạo điểm nhấn cá nhân", "dễ nhớ khi giao dịch", "đồng điệu với sở thích").
4. KHÔNG sử dụng giới tính để suy đoán tính cách.
5. Không tạo áp lực chốt bán; luôn tôn trọng sự lựa chọn của khách hàng.
6. Cá nhân hóa rõ ràng theo tên gọi, mong muốn, tính cách tự mô tả và các chỉ số thần số học đã cung cấp.
7. Mỗi kịch bản dài khoảng 3-5 câu, súc tích để GDV có thể nói trực tiếp tại quầy.`;

    const prompt = `Hãy xây dựng nội dung tư vấn cá nhân hóa cho số tài khoản đẹp sau:
- Số tài khoản đề xuất: ${formattedNumber} (${body.accountNumber})
- Nguồn số: ${sanitizeShortText(body.sourceLabel, 100)}
- Điểm đánh giá tham khảo: ${Number(body.totalScore) || 0}/100
- Cách đọc từng số: ${byDigit}
- Cách đọc theo cặp: ${byPair}
- Cách đọc dân gian phổ biến: ${folkPopular}
- Điểm nổi bật phương Đông: ${easternHighlights.join('; ') || 'Cân đối, rõ ràng'}
- Cấu trúc dãy số: ${structureNotes.join('; ') || 'Dễ đọc'}

Thông tin bối cảnh khách hàng (chỉ dùng để cá nhân hóa lời nói):
- Tên xưng hô: ${customerName}
- Nhóm mong muốn: ${goalLabel || 'Chưa chọn cụ thể'}
- Phong cách chọn số: ${styleLabel || 'Cân bằng'}
- Tính cách khách hàng tự mô tả: ${personality || 'Chưa cung cấp'}
- Ghi chú sở thích: ${notes || 'Không có'}
- Các chỉ số Thần số học Pythagoras (đã tính sẵn):
  + Số chủ đạo: ${ns.lifePath}
  + Số ngày sinh: ${ns.birthday}
  + Số thái độ: ${ns.attitude}
  + Số sứ mệnh: ${ns.expression}
  + Số linh hồn: ${ns.soulUrge}
  + Số nhân cách: ${ns.personalityNum}
  + Nhóm số ưu tiên tham khảo: ${Array.isArray(ns.recommendedDigits) ? ns.recommendedDigits.join(', ') : ''}

Hãy trả về JSON đúng cấu trúc yêu cầu gồm:
- personalizedSummary: Lời tư vấn cá nhân hóa riêng (2-3 câu) giải thích sự kết nối hợp lý giữa dãy số và hồ sơ khách hàng.
- scripts: 3 kịch bản nói trực tiếp tại quầy (friendly, professional, closing).
- objections: 6 câu trả lời xử lý từ chối tinh tế cho đúng 6 tình huống: phí cao, chưa thích số, muốn suy nghĩ thêm, chưa thấy giá trị, thích số khác, hỏi tại sao số này phù hợp với mình.`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personalizedSummary: {
              type: Type.STRING,
              description: 'Lời nhận xét cá nhân hóa riêng dành cho hồ sơ khách hàng này.',
            },
            scripts: {
              type: Type.OBJECT,
              properties: {
                friendly: {
                  type: Type.STRING,
                  description: 'Kịch bản 1: Phong cách gần gũi, tự nhiên.',
                },
                professional: {
                  type: Type.STRING,
                  description: 'Kịch bản 2: Phong cách chuyên nghiệp, có chiều sâu.',
                },
                closing: {
                  type: Type.STRING,
                  description: 'Kịch bản 3: Phong cách tư vấn chốt bán khéo léo, khơi gợi nhu cầu không gây áp lực.',
                },
              },
              required: ['friendly', 'professional', 'closing'],
            },
            objections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  situation: {
                    type: Type.STRING,
                    description: 'Tên tình huống khách hàng từ chối.',
                  },
                  response: {
                    type: Type.STRING,
                    description: 'Câu trả lời mẫu văn minh, không gây áp lực, không cam kết đổi vận.',
                  },
                },
                required: ['situation', 'response'],
              },
            },
          },
          required: ['personalizedSummary', 'scripts', 'objections'],
        },
      },
    });

    const rawText = (response.text ?? '').trim();
    if (!rawText) {
      res.status(502).json({ error: 'Mô hình AI không trả về nội dung. Vui lòng thử lại.' });
      return;
    }

    const parsed = JSON.parse(rawText);
    res.json({
      source: 'gemini-ai',
      ...parsed,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi không xác định';
    if (message === 'MISSING_API_KEY') {
      res.status(503).json({
        error: 'Chưa cấu hình GEMINI_API_KEY trên máy chủ. Bạn vẫn có thể sử dụng kịch bản mẫu chuẩn hóa của hệ thống.',
      });
      return;
    }
    const status = typeof (err as { status?: number })?.status === 'number'
      ? (err as { status: number }).status
      : 500;
    if (status === 429) {
      res.status(429).json({
        error: 'Hệ thống AI tạm thời vượt giới hạn lượt gọi. Vui lòng thử lại sau ít phút.',
      });
      return;
    }
    if (status === 403 || status === 400) {
      res.status(status).json({
        error: 'Không thể xác thực với dịch vụ AI. Vui lòng kiểm tra cấu hình khóa API trong Settings > Secrets.',
      });
      return;
    }
    res.status(500).json({
      error: 'Không thể kết nối trợ lý AI lúc này. Vui lòng thử lại hoặc dùng kịch bản chuẩn hóa.',
    });
  }
});

interface CustomObjectionPayload {
  objectionText: string;
  customerFirstName?: string;
  goalLabel?: string;
  accountNumber: string;
  formattedNumber?: string;
  folkReading?: string;
  byPairReading?: string;
  headline?: string;
  totalScore?: number;
}

app.post('/api/objection', async (req, res) => {
  try {
    const body = req.body as Partial<CustomObjectionPayload>;

    const objectionText = sanitizeShortText(body?.objectionText, 350);
    if (objectionText.length < 3) {
      res.status(400).json({
        error: 'Vui lòng nhập tình huống từ chối của khách hàng (tối thiểu 3 ký tự).',
      });
      return;
    }

    if (!isValidDigits(body?.accountNumber)) {
      res.status(400).json({
        error: 'Số tài khoản đang tư vấn không hợp lệ.',
      });
      return;
    }

    const ai = createGeminiClient();

    const customerName = sanitizeShortText(body.customerFirstName, 80) || 'anh/chị';
    const goalLabel = sanitizeShortText(body.goalLabel, 120);
    const formattedNumber = sanitizeShortText(body.formattedNumber, 30) || body.accountNumber;
    const folkReading = sanitizeShortText(body.folkReading, 180);
    const byPairReading = sanitizeShortText(body.byPairReading, 180);
    const headline = sanitizeShortText(body.headline, 180);
    const totalScore = Number(body.totalScore) || 0;

    const systemInstruction = `Bạn là chuyên gia huấn luyện Giao dịch viên (GDV) ngân hàng xử lý từ chối khi tư vấn số tài khoản đẹp.
Quy tắc bắt buộc:
1. Tiếng Việt tự nhiên, lịch sự, tinh tế, xưng hô "em" - "anh/chị".
2. Tuyệt đối KHÔNG gây áp lực chốt bán, KHÔNG tranh cãi, KHÔNG cam kết số tài khoản mang lại giàu sang hay đổi vận.
3. Trả lời thẳng vào đúng băn khoăn khách hàng vừa nêu, súc tích 2-4 câu để GDV đọc và nói được ngay tại quầy.
4. Đề xuất 1 bước hành động thực tế tiếp theo mà GDV có thể thực hiện ngay trên công cụ hoặc tại quầy.`;

    const prompt = `Khách hàng đang được tư vấn số tài khoản: ${formattedNumber}
- Ý nghĩa nổi bật: ${headline || folkReading || 'Dễ nhớ, cấu trúc gọn gàng'}
- Cách đọc nhịp: ${byPairReading || formattedNumber}
- Điểm tham khảo: ${totalScore}/100
- Xưng hô khách hàng: ${customerName}
- Nhóm mong muốn: ${goalLabel || 'Chưa chọn cụ thể'}

Tình huống khách hàng vừa nói / từ chối tại quầy:
"${objectionText}"

Hãy trả về JSON gồm:
- empathyApproach: Cách trả lời 1 theo hướng nhẹ nhàng, đồng cảm, tôn trọng sự thoải mái của khách hàng.
- valueApproach: Cách trả lời 2 theo hướng chuyên nghiệp, giải thích rõ giá trị thực tế và phương án linh hoạt.
- nextStepAction: 1 câu gợi ý bước hành động tiếp theo GDV nên làm ngay sau câu trả lời (không phải lời thoại).`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            empathyApproach: {
              type: Type.STRING,
              description: 'Gợi ý trả lời nhẹ nhàng, đồng cảm, giảm áp lực.',
            },
            valueApproach: {
              type: Type.STRING,
              description: 'Gợi ý trả lời chuyên nghiệp, làm rõ giá trị thực tế và linh hoạt phương án.',
            },
            nextStepAction: {
              type: Type.STRING,
              description: 'Hành động cụ thể GDV nên thực hiện tiếp theo tại quầy.',
            },
          },
          required: ['empathyApproach', 'valueApproach', 'nextStepAction'],
        },
      },
    });

    const rawText = (response.text ?? '').trim();
    if (!rawText) {
      res.status(502).json({ error: 'Trợ lý AI không trả về gợi ý. Vui lòng thử lại.' });
      return;
    }

    const parsed = JSON.parse(rawText);
    res.json(parsed);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi không xác định';
    if (message === 'MISSING_API_KEY') {
      res.status(503).json({
        error: 'Chưa cấu hình GEMINI_API_KEY trên máy chủ để trả lời tình huống tùy chỉnh.',
      });
      return;
    }
    const status = typeof (err as { status?: number })?.status === 'number'
      ? (err as { status: number }).status
      : 500;
    if (status === 429) {
      res.status(429).json({
        error: 'Hệ thống AI tạm thời vượt giới hạn lượt gọi. Vui lòng thử lại sau ít phút.',
      });
      return;
    }
    if (status === 403 || status === 400) {
      res.status(status).json({
        error: 'Không thể xác thực dịch vụ AI. Vui lòng kiểm tra khóa API trong Settings > Secrets.',
      });
      return;
    }
    res.status(500).json({
      error: 'Không thể tạo gợi ý xử lý từ chối lúc này. Vui lòng thử lại.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Lucky Number Bank server listening on http://localhost:${PORT}`);
  });
}

startServer();
