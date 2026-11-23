import ExcelJS from 'exceljs';
import { AnalyzedAccountNumber, InventoryNumberItem } from '../types';

export interface ParsedExcelNumberRow {
  number: string;
  note?: string;
  feeTier?: string;
}

/**
 * Parse .xlsx or .csv file in the browser to extract account numbers (3..16 digits).
 */
export async function importNumbersFromFile(
  file: File
): Promise<{ rows: ParsedExcelNumberRow[]; skippedCount: number }> {
  const fileName = file.name.toLowerCase();
  const rows: ParsedExcelNumberRow[] = [];
  const seen = new Set<string>();
  let skippedCount = 0;

  const pushCandidate = (rawNum: string, note?: string, feeTier?: string) => {
    const clean = rawNum.replace(/[\s.-]/g, '').trim();
    if (/^\d{3,16}$/.test(clean)) {
      if (!seen.has(clean)) {
        seen.add(clean);
        rows.push({
          number: clean,
          note: note?.trim() || undefined,
          feeTier: feeTier?.trim() || undefined,
        });
      }
    } else if (rawNum.trim()) {
      skippedCount += 1;
    }
  };

  if (fileName.endsWith('.csv') || fileName.endsWith('.txt')) {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    for (let i = 0; i < lines.length; i++) {
      const cols = lines[i].split(/[,;\t]/).map((c) => c.replace(/^["']|["']$/g, '').trim());
      if (i === 0 && !/^\d{3,16}$/.test((cols[0] || '').replace(/[\s.-]/g, ''))) {
        // Skip header row
        continue;
      }
      pushCandidate(cols[0] || '', cols[1], cols[2]);
    }
    return { rows, skippedCount };
  }

  if (fileName.endsWith('.xlsx')) {
    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new Error('Tệp Excel không có trang tính nào.');
    }

    worksheet.eachRow((row, rowNumber) => {
      const rawFirst = String(row.getCell(1).text || row.getCell(1).value || '').trim();
      const rawSecond = String(row.getCell(2).text || row.getCell(2).value || '').trim();
      const rawThird = String(row.getCell(3).text || row.getCell(3).value || '').trim();

      if (rowNumber === 1 && !/^\d{3,16}$/.test(rawFirst.replace(/[\s.-]/g, ''))) {
        return;
      }
      pushCandidate(rawFirst, rawSecond, rawThird);
    });

    return { rows, skippedCount };
  }

  throw new Error('Định dạng tệp chưa được hỗ trợ. Vui lòng chọn tệp .xlsx hoặc .csv.');
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportInventoryToExcel(items: InventoryNumberItem[]): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Kho số nội bộ');

  sheet.columns = [
    { header: 'Số tài khoản', key: 'number', width: 20 },
    { header: 'Ghi chú', key: 'note', width: 38 },
    { header: 'Nhóm phí tham khảo', key: 'feeTier', width: 20 },
    { header: 'Độ dài', key: 'length', width: 10 },
    { header: 'Cấu trúc', key: 'structureType', width: 22 },
    { header: 'Trạng thái', key: 'statusLabel', width: 24 },
    { header: 'Ngày thêm', key: 'addedAt', width: 14 },
  ];

  const statusText: Record<InventoryNumberItem['status'], string> = {
    unverified: 'Chưa kiểm tra hệ thống lõi',
    consulted: 'Đã tư vấn khách hàng',
    registered: 'Đã đăng ký',
    on_hold: 'Đang tạm giữ',
  };

  for (const item of items) {
    sheet.addRow({
      number: item.number,
      note: item.note,
      feeTier: item.feeTier || '',
      length: item.length,
      structureType: item.structureType,
      statusLabel: statusText[item.status],
      addedAt: item.addedAt,
    });
  }

  sheet.getRow(1).font = { bold: true };
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  triggerBlobDownload(blob, `LuckyNumberBank_KhoSo_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export async function exportRankingToExcel(
  candidates: AnalyzedAccountNumber[],
  customerName: string
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Bảng xếp hạng số đề xuất');

  sheet.columns = [
    { header: 'Hạng', key: 'rank', width: 8 },
    { header: 'Số tài khoản', key: 'number', width: 18 },
    { header: 'Nhịp tách số', key: 'formatted', width: 20 },
    { header: 'Điểm tổng (/100)', key: 'total', width: 16 },
    { header: 'Nguồn số', key: 'sourceLabel', width: 24 },
    { header: 'Cách đọc theo cặp', key: 'byPair', width: 28 },
    { header: 'Ý nghĩa dân gian', key: 'folk', width: 32 },
    { header: 'Lý do lựa chọn', key: 'reasons', width: 46 },
  ];

  candidates.forEach((c, idx) => {
    sheet.addRow({
      rank: idx + 1,
      number: c.number,
      formatted: c.formatted,
      total: c.score.total,
      sourceLabel: c.sourceLabel,
      byPair: c.eastern.readings.byPair,
      folk: c.eastern.readings.folkPopular,
      reasons: c.selectionReasons.join('; '),
    });
  });

  sheet.getRow(1).font = { bold: true };
  const safeName = customerName
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_\u00C0-\u1EF9]/g, '')
    .slice(0, 24);
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  triggerBlobDownload(
    blob,
    `LuckyNumberBank_DeXuat_${safeName || 'KhachHang'}_${new Date().toISOString().slice(0, 10)}.xlsx`
  );
}
