import { CUSTOMER_GOALS } from '../constants/banking';
import {
  AnalyzedAccountNumber,
  ConsultantScripts,
  CustomerProfile,
  NumerologyReport,
} from '../types';

function extractFirstName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) return 'anh/chị';
  const parts = trimmed.split(/\s+/);
  return parts[parts.length - 1];
}

/**
 * Deterministic, personalized baseline consultation script generator.
 * Always available instantly with zero latency and serves alongside the Gemini AI Consultant.
 */
export function buildTemplateConsultation(
  candidate: AnalyzedAccountNumber,
  profile: CustomerProfile,
  numerology: NumerologyReport | null
): ConsultantScripts {
  const firstName = extractFirstName(profile.fullName);
  const address = profile.fullName.trim() ? `anh/chị ${firstName}` : 'anh/chị';
  const goalLabels = CUSTOMER_GOALS.filter((g) => profile.goals.includes(g.id)).map((g) =>
    g.label.toLowerCase()
  );
  const goalText = goalLabels.length > 0 ? goalLabels.join(' và ') : 'sự gọn gàng, dễ nhớ khi giao dịch';

  const folkReading =
    candidate.eastern.readings.folkPopular !== 'Không chứa cụm quy ước dân gian cố định'
      ? candidate.eastern.readings.folkPopular
      : candidate.eastern.readings.byPair;

  const numConnect =
    numerology && candidate.numerologyMatches.length > 0
      ? `Dãy số có sự xuất hiện của chữ số ${candidate.numerologyMatches
          .map((m) => m.digit)
          .join(', ')} — gắn liền với ${candidate.numerologyMatches
          .map((m) => m.matchedIndices[0])
          .slice(0, 2)
          .join(' và ')} trong hồ sơ thần số học Pythagoras của ${address}.`
      : numerology
        ? `Trong hồ sơ của ${address} (Số chủ đạo ${numerology.indices.lifePath.value} – ${numerology.indices.lifePath.meaningTitle}), dãy số này tạo điểm nhấn hài hòa nhờ cấu trúc "${candidate.eastern.structureTags[0]}".`
        : `Dãy số nổi bật ở nhịp đọc "${candidate.eastern.readings.byPair}" và cấu trúc "${candidate.eastern.structureTags[0]}".`;

  const personalityBridge = profile.selfDescribedPersonality.trim()
    ? `Với phong cách "${profile.selfDescribedPersonality.trim()}" mà ${address} chia sẻ, nhịp số ${candidate.formatted} rất dễ tạo thiện cảm và thuận tiện khi đọc cho đối tác.`
    : `Nhịp tách số ${candidate.formatted} ngắn gọn, dễ nhớ khi chuyển khoản hàng ngày.`;

  const personalizedSummary = `${numConnect} ${personalityBridge} Đây là phương án đạt ${candidate.score.total}/100 điểm phù hợp tham khảo theo nhóm mong muốn ${goalText}.`;

  const friendly = `"Em gợi ý ${address} tham khảo dãy số ${candidate.formatted} ạ. Khi đọc lên sẽ là ${candidate.eastern.readings.byPair}, còn theo cách đọc dân gian quen thuộc thì gắn với ${folkReading}. Cấu trúc ${candidate.eastern.structureTags[0].toLowerCase()} giúp mình đọc một lần là nhớ ngay, rất tiện khi gửi cho người thân hay đối tác. Nếu ${address} đang ưu tiên ${goalText} thì đây là một lựa chọn rất đáng cân nhắc ạ."`;

  const professional = `"Thưa ${address}, căn cứ theo mong muốn về ${goalText}${
    numerology
      ? ` và các chỉ số tham khảo từ tên cùng ngày sinh (Số chủ đạo ${numerology.indices.lifePath.value}, Số sứ mệnh ${numerology.indices.expression.value})`
      : ''
  }, em đề xuất phương án ${candidate.formatted}. Về mặt cấu trúc, dãy số đạt cân đối ${candidate.eastern.yinYang.ratioLabel} và nổi bật ở cụm ${folkReading}. Điểm mạnh lớn nhất của số này là tính nhận diện cao, chuyên nghiệp trong giao dịch và mang dấu ấn cá nhân rõ nét."`;

  const closing = `"Trong các phương án hôm nay, ${candidate.formatted} đang dẫn đầu ở độ cân bằng giữa ý nghĩa (${folkReading}) và khả năng ghi nhớ nhanh. ${
    candidate.source === 'ai_generated'
      ? 'Để không mất thời gian của mình, em xin phép kiểm tra ngay trên hệ thống xem dãy số này hoặc một biến thể sát nhất có đang sẵn sàng mở cho ' + address + ' không ạ?'
      : 'Em xin phép kiểm tra tình trạng khả dụng trực tiếp trên hệ thống ngân hàng và báo rõ biểu phí tương ứng để ' + address + ' xem xét trước khi quyết định nhé ạ.'
  }"`;

  const objections = [
    // Group 1: Chi phí & Giá trị
    {
      category: 'fee_value' as const,
      situation: 'Khách hàng thấy phí cao',
      response: `"Em rất hiểu băn khoăn của ${address} về chi phí ạ. Số tài khoản mình dùng gắn bó lâu dài nhiều năm cho mọi giao dịch nên nếu chia theo thời gian sử dụng sẽ rất hợp lý. Tuy nhiên, nếu ${address} muốn tối ưu ngân sách hơn, em có thể lọc ngay các phương án độ dài ngắn hơn hoặc nhóm phí phổ thông nhưng vẫn giữ được chữ số yêu thích của mình ạ."`,
      nextStep: 'Chuyển sang Chế độ B chọn độ dài ngắn hơn (3–4 số) hoặc lọc "Nhóm phổ biến" trong Kho số.',
    },
    {
      category: 'fee_value' as const,
      situation: 'Khách hàng chưa thấy giá trị thực tế',
      response: `"Dạ, chọn số tài khoản đẹp không phải để khẳng định tài vận mà trước hết mang lại 3 giá trị thực tế: thứ nhất là đọc rất nhanh và hạn chế nhầm lẫn khi đối tác chuyển khoản; thứ hai là tạo sự chuyên nghiệp khi in trên hóa đơn, danh thiếp; thứ ba là mang một câu chuyện riêng mà mỗi lần giao dịch ${address} đều cảm thấy hài lòng ạ."`,
      nextStep: 'Cho khách xem nhanh phần "Cách đọc 3 tầng" để cảm nhận độ gọn khi đọc qua điện thoại.',
    },
    {
      category: 'fee_value' as const,
      situation: 'Khách hàng so sánh phí với ngân hàng khác',
      response: `"Dạ em cảm ơn ${address} đã chia sẻ thẳng thắn ạ. Biểu phí số đẹp mỗi ngân hàng sẽ đi kèm độ hiếm của cấu trúc số, hệ sinh thái giao dịch và các chính sách ưu đãi đi kèm theo từng thời điểm. Em xin phép kiểm tra giúp ${address} xem hiện tại phân khúc của mình có chương trình miễn/giảm phí số đẹp nào áp dụng được không nhé ạ."`,
      nextStep: 'Kiểm tra chính sách ưu đãi phí theo hạng khách hàng hoặc gói tài khoản thanh toán hiện hành.',
    },
    {
      category: 'fee_value' as const,
      situation: 'Khách hàng chỉ muốn dùng số tài khoản miễn phí',
      response: `"Dạ hoàn toàn được ạ, ngân hàng luôn hỗ trợ mở số tài khoản ngẫu nhiên miễn phí nhanh chóng cho ${address}. Em chỉ xin giới thiệu thêm lựa chọn số theo sở thích để mình biết có dịch vụ này; nếu sau này có nhu cầu mở thêm một tài khoản riêng cho kinh doanh hay tiết kiệm, ${address} cứ nhắn em hỗ trợ bất cứ lúc nào ạ."`,
      nextStep: 'Tôn trọng quyết định, hoàn tất mở tài khoản tiêu chuẩn vui vẻ để giữ thiện cảm lâu dài.',
    },

    // Group 2: Sở thích & Niềm tin về số
    {
      category: 'number_preference' as const,
      situation: 'Khách hàng chưa thích dãy số này',
      response: `"Không sao đâu ạ, số tài khoản là dấu ấn riêng nên quan trọng nhất là ${address} nhìn vào thấy thật ưng mắt. ${address} chia sẻ giúp em thích nhấn mạnh chữ số nào hoặc muốn tránh chữ số nào, em sẽ điều chỉnh ngay trên công cụ để tìm ra 5 lựa chọn sát gu của mình hơn ạ."`,
      nextStep: 'Hỏi 1–2 chữ số khách thích nhất rồi đổi Phong cách chọn số ở Module 4 để sinh lại TOP 5.',
    },
    {
      category: 'number_preference' as const,
      situation: 'Khách hàng thích số khác (ngày sinh, số điện thoại, kỷ niệm)',
      response: `"Tuyệt vời ạ! Chọn số gắn với ngày kỷ niệm hoặc dãy số quen thuộc với ${address} chính là cách cá nhân hóa ý nghĩa nhất. ${address} đọc giúp em dãy số mình đang nghĩ tới để em nhập trực tiếp vào hệ thống phân tích nhịp đọc và kiểm tra khả dụng trên kho số ngân hàng ngay nhé ạ."`,
      nextStep: 'Chuyển sang Chế độ A (GDV nhập số) để nhập trực tiếp dãy số khách mong muốn.',
    },
    {
      category: 'number_preference' as const,
      situation: 'Khách hàng kiêng một chữ số (ví dụ số 4 hoặc số 7)',
      response: `"Dạ em ghi nhận ngay sở thích này của ${address} ạ. Dù theo góc nhìn khác số 4 tượng trưng cho bốn mùa ổn định hay số 7 gắn với tổ hợp Thần Tài 79, nhưng quan trọng nhất vẫn là cảm giác yên tâm và thoải mái của ${address}. Em sẽ lọc ngay các phương án hoàn toàn không chứa chữ số đó để mình chọn ạ."`,
      nextStep: 'Chọn phương án khác trong TOP 5 hoặc lọc trong Kho số bỏ các số chứa chữ số khách kiêng.',
    },
    {
      category: 'number_preference' as const,
      situation: 'Khách hàng không tin thần số học hay phong thủy',
      response: `"Dạ em rất đồng tình với góc nhìn thực tế của ${address} ạ. Bên em cũng không dùng thần số học để khẳng định may rủi, mà chỉ xem đó như một gợi ý nhỏ về sự thú vị. Nếu ${address} chuộng tính thực dụng, mình chỉ cần tập trung vào tiêu chí dễ đọc, dễ nhớ, cấu trúc lặp gọn gàng như dãy ${candidate.formatted} để giao dịch hàng ngày thật tiện lợi là đủ ạ."`,
      nextStep: 'Mở bảng Trọng số ở Module 4, chọn phong cách "Dễ nhớ, dễ đọc" và giảm trọng số Thần số học.',
    },

    // Group 3: Quyết định & Do dự
    {
      category: 'decision_hesitation' as const,
      situation: 'Khách hàng muốn suy nghĩ thêm / hỏi ý kiến gia đình',
      response: `"Dạ hoàn toàn thoải mái ạ. Em xin phép in sẵn Phiếu tư vấn rút gọn gồm Top 5 số cùng cách đọc và ý nghĩa để ${address} mang về trao đổi thêm cùng gia đình. Khi nào ${address} chốt phương án ưng ý, mình nhắn em kiểm tra lại tình trạng khả dụng trên hệ thống trước khi đăng ký là được ạ."`,
      nextStep: 'Bấm "Xuất phiếu tư vấn PDF / In" (Bản rút gọn cho Khách hàng) để trao tận tay khách.',
    },
    {
      category: 'decision_hesitation' as const,
      situation: 'Khách hàng hỏi tại sao số này phù hợp với mình',
      response: `"Dãy ${candidate.formatted} được chấm minh bạch trên 5 tiêu chí: ${
        numerology
          ? `tương đồng với các chỉ số từ họ tên và ngày sinh (${numerology.recommendedDigits.join(', ')}), `
          : ''
      }ý nghĩa dân gian quen thuộc (${folkReading}), đáp ứng đúng mong muốn ${goalText}, nhịp tách số gọn gàng và dễ ghi nhớ. Đây là góc nhìn tham khảo giúp ${address} chọn ra con số mang dấu ấn cá nhân nhất ạ."`,
      nextStep: 'Chỉ nhanh vào mục "Chi tiết chấm điểm minh bạch" để khách thấy rõ căn cứ từng tiêu chí.',
    },
    {
      category: 'decision_hesitation' as const,
      situation: 'Khách hàng đã có nhiều tài khoản, ngại đổi số quen thuộc',
      response: `"Dạ ${address} không cần phải bỏ số tài khoản cũ đang dùng quen đâu ạ. Nhiều anh/chị chọn mở thêm một tài khoản số đẹp tách riêng cho mục đích cụ thể — ví dụ nhận thanh toán từ đối tác, hoặc tích lũy gia đình — vừa dễ quản lý dòng tiền, vừa có số gọn đẹp khi cần gửi cho khách hàng mới ạ."`,
      nextStep: 'Gợi ý phân tách tài khoản theo mục đích (chi tiêu hằng ngày vs. nhận chuyển khoản kinh doanh/tích lũy).',
    },
    {
      category: 'decision_hesitation' as const,
      situation: 'Khách hàng đang vội, không có thời gian nghe tư vấn dài',
      response: `"Dạ em hiểu ${address} đang bận, em xin phép tóm gọn trong 15 giây thôi ạ: với hồ sơ của mình, dãy ${candidate.formatted} đọc lên là ${candidate.eastern.readings.byPair} (${folkReading}), rất dễ nhớ. Em gửi nhanh bản tóm tắt để lát rảnh ${address} xem qua, nếu ưng mình kích hoạt sau cũng rất nhanh ạ."`,
      nextStep: 'Đọc đúng 1 dòng tiêu đề Giá trị & Ý nghĩa ở Phần 01 và in/gửi bản rút gọn cho khách.',
    },
  ];

  return {
    source: 'template',
    personalizedSummary,
    scripts: {
      friendly,
      professional,
      closing,
    },
    objections,
    generatedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
  };
}
