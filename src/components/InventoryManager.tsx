import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  Download,
  MessageSquareText,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from 'react';
import NumberMeaningBadge from './NumberMeaningBadge';
import {
  classifyPrimaryStructure,
  formatNumberGroups,
} from '../engines/easternNumerology';
import { InventoryNumberItem, InventoryStatus } from '../types';
import {
  exportInventoryToExcel,
  importNumbersFromFile,
} from '../utils/excelHelper';

interface InventoryManagerProps {
  items: InventoryNumberItem[];
  onAddItems: (newItems: InventoryNumberItem[]) => void;
  onUpdateStatus: (id: string, status: InventoryStatus) => void;
  onDeleteItem: (id: string) => void;
  onSendToAnalysis: (numbers: string[]) => void;
}

const STATUS_META: Record<InventoryStatus, { label: string; colorClass: string }> = {
  unverified: { label: 'Chưa kiểm tra hệ thống lõi', colorClass: 'text-[#51647A]' },
  consulted: { label: 'Đã tư vấn khách', colorClass: 'text-[#0057A0]' },
  on_hold: { label: 'Đang tạm giữ', colorClass: 'text-[#B45309]' },
  registered: { label: 'Đã đăng ký', colorClass: 'text-[#15803D]' },
};

const STRUCTURE_FILTERS = [
  'Tất cả cấu trúc',
  'Lặp cặp ABAB',
  'Lặp cụm ABCABC',
  'Đối xứng / Gánh',
  'Tứ quý / Tam hoa',
  'Tiến lên',
  'Lộc Phát / Thần Tài',
  'Cấu trúc khác',
];

export default function InventoryManager({
  items,
  onAddItems,
  onUpdateStatus,
  onDeleteItem,
  onSendToAnalysis,
}: InventoryManagerProps) {
  const [search, setSearch] = useState('');
  const [lengthFilter, setLengthFilter] = useState<string>('all');
  const [structureFilter, setStructureFilter] = useState<string>('Tất cả cấu trúc');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [newNumber, setNewNumber] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newFeeTier, setNewFeeTier] = useState('Nhóm phổ biến');
  const [formMessage, setFormMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredItems = useMemo(() => {
    const q = search.replace(/\s+/g, '').toLowerCase();
    return items.filter((item) => {
      if (q && !item.number.includes(q) && !item.note.toLowerCase().includes(q)) {
        return false;
      }
      if (lengthFilter !== 'all' && item.length !== Number(lengthFilter)) {
        return false;
      }
      if (structureFilter !== 'Tất cả cấu trúc' && item.structureType !== structureFilter) {
        return false;
      }
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [items, search, lengthFilter, structureFilter, statusFilter]);

  const handleManualAdd = (e: FormEvent) => {
    e.preventDefault();
    const clean = newNumber.replace(/[\s.-]/g, '').trim();
    if (!/^\d{3,16}$/.test(clean)) {
      setFormMessage({ type: 'err', text: 'Vui lòng nhập dãy từ 3 đến 16 chữ số.' });
      return;
    }
    if (items.some((i) => i.number === clean)) {
      setFormMessage({ type: 'err', text: `Số ${clean} đã tồn tại trong kho số nội bộ.` });
      return;
    }

    const item: InventoryNumberItem = {
      id: `inv-${Date.now()}-${clean}`,
      number: clean,
      length: clean.length,
      structureType: classifyPrimaryStructure(clean),
      status: 'unverified',
      note: newNote.trim() || 'Thêm thủ công bởi GDV',
      feeTier: newFeeTier,
      addedAt: new Date().toISOString().slice(0, 10),
    };

    onAddItems([item]);
    setNewNumber('');
    setNewNote('');
    setFormMessage({ type: 'ok', text: `Đã thêm số ${formatNumberGroups(clean)} vào kho nội bộ.` });
  };

  const handleImportExcel = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormMessage(null);
    try {
      const { rows, skippedCount } = await importNumbersFromFile(file);
      const existingSet = new Set(items.map((i) => i.number));
      const today = new Date().toISOString().slice(0, 10);

      const created: InventoryNumberItem[] = [];
      let duplicateCount = 0;

      for (const row of rows) {
        if (existingSet.has(row.number)) {
          duplicateCount += 1;
          continue;
        }
        existingSet.add(row.number);
        created.push({
          id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${row.number}`,
          number: row.number,
          length: row.number.length,
          structureType: classifyPrimaryStructure(row.number),
          status: 'unverified',
          note: row.note || `Nhập từ ${file.name}`,
          feeTier: row.feeTier || 'Chưa phân nhóm',
          addedAt: today,
        });
      }

      if (created.length > 0) {
        onAddItems(created);
      }

      setFormMessage({
        type: created.length > 0 ? 'ok' : 'err',
        text: `Đã nhập ${created.length} số mới${
          duplicateCount > 0 ? `, bỏ qua ${duplicateCount} số trùng` : ''
        }${skippedCount > 0 ? `, bỏ qua ${skippedCount} dòng không hợp lệ` : ''}.`,
      });
    } catch (err) {
      setFormMessage({
        type: 'err',
        text: err instanceof Error ? err.message : 'Lỗi khi nhập tệp Excel.',
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const counts = {
    total: items.length,
    consulted: items.filter((i) => i.status === 'consulted').length,
    registered: items.filter((i) => i.status === 'registered').length,
    unverified: items.filter((i) => i.status === 'unverified').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#0057A0]">Module 8 · Quản lý kho số nội bộ</p>
          <h1 className="text-2xl font-bold text-[#0F243E] mt-1">
            Kho số tài khoản & Nhập/Xuất Excel
          </h1>
          <p className="text-sm text-[#51647A] mt-1">
            Tổng {counts.total} số · Chưa kiểm tra lõi: {counts.unverified} · Đã tư vấn: {counts.consulted} · Đã đăng ký: {counts.registered}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.csv,.txt"
            onChange={handleImportExcel}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0057A0] bg-white border border-[#DDE6F0] hover:bg-[#EDF4FA] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Nhập Excel (.xlsx/.csv)</span>
          </button>
          <button
            type="button"
            onClick={() => exportInventoryToExcel(filteredItems)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0F243E] bg-white border border-[#DDE6F0] hover:bg-[#EDF4FA] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const list = filteredItems
                .filter((i) => i.status !== 'registered')
                .map((i) => i.number);
              if (list.length > 0) onSendToAnalysis(list);
            }}
            disabled={filteredItems.filter((i) => i.status !== 'registered').length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0057A0] hover:bg-[#003F75] disabled:bg-[#DDE6F0] disabled:text-[#7D90A5] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chấm điểm danh sách đang lọc</span>
          </button>
        </div>
      </div>

      {/* Colorful KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-[#DDE6F0] rounded-xl p-4 flex items-center gap-3.5">
          <span className="w-10 h-10 rounded-lg bg-[#EDF4FA] text-[#0057A0] inline-flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </span>
          <div>
            <p className="text-xs text-[#51647A]">Tổng kho số</p>
            <p className="font-mono text-xl font-bold text-[#0F243E] tabular-nums">{counts.total}</p>
          </div>
        </div>
        <div className="bg-white border border-[#DDE6F0] rounded-xl p-4 flex items-center gap-3.5">
          <span className="w-10 h-10 rounded-lg bg-[#FFFBEB] text-[#B45309] inline-flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </span>
          <div>
            <p className="text-xs text-[#51647A]">Chưa kiểm tra lõi</p>
            <p className="font-mono text-xl font-bold text-[#B45309] tabular-nums">{counts.unverified}</p>
          </div>
        </div>
        <div className="bg-white border border-[#DDE6F0] rounded-xl p-4 flex items-center gap-3.5">
          <span className="w-10 h-10 rounded-lg bg-[#E0F2FE] text-[#0369A1] inline-flex items-center justify-center shrink-0">
            <MessageSquareText className="w-5 h-5" />
          </span>
          <div>
            <p className="text-xs text-[#51647A]">Đã tư vấn khách</p>
            <p className="font-mono text-xl font-bold text-[#0057A0] tabular-nums">{counts.consulted}</p>
          </div>
        </div>
        <div className="bg-white border border-[#DDE6F0] rounded-xl p-4 flex items-center gap-3.5">
          <span className="w-10 h-10 rounded-lg bg-[#ECFDF5] text-[#047857] inline-flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </span>
          <div>
            <p className="text-xs text-[#51647A]">Đã đăng ký</p>
            <p className="font-mono text-xl font-bold text-[#047857] tabular-nums">{counts.registered}</p>
          </div>
        </div>
      </div>

      {/* Important Core Banking Availability Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E]">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          <strong>Lưu ý vận hành:</strong> Đây là kho số lưu cục bộ trên trình duyệt phục vụ GDV quản lý danh mục tham khảo. Hệ thống không tự xác nhận số tài khoản đang khả dụng cho đến khi được đối chiếu hoặc tích hợp API kho số chính thức của ngân hàng.
        </span>
      </div>

      {/* Add Manual Number Form */}
      <form
        onSubmit={handleManualAdd}
        className="bg-white border border-[#DDE6F0] rounded-xl p-5 grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
      >
        <div className="md:col-span-3 space-y-1">
          <label htmlFor="inv-num" className="block text-xs font-semibold text-[#0F243E]">
            Thêm số tài khoản thủ công
          </label>
          <input
            id="inv-num"
            type="text"
            value={newNumber}
            onChange={(e) => setNewNumber(e.target.value)}
            placeholder="VD: 688688"
            className="w-full px-3 py-2 text-sm font-mono bg-white border border-[#C7D6E6] focus:border-[#0057A0] rounded-lg outline-none"
          />
        </div>
        <div className="md:col-span-4 space-y-1">
          <label htmlFor="inv-note" className="block text-xs font-semibold text-[#0F243E]">
            Ghi chú nội bộ
          </label>
          <input
            id="inv-note"
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="VD: Cặp Lộc Phát đối xứng..."
            className="w-full px-3 py-2 text-sm bg-white border border-[#C7D6E6] focus:border-[#0057A0] rounded-lg outline-none"
          />
        </div>
        <div className="md:col-span-3 space-y-1">
          <label htmlFor="inv-tier" className="block text-xs font-semibold text-[#0F243E]">
            Nhóm phí tham khảo
          </label>
          <select
            id="inv-tier"
            value={newFeeTier}
            onChange={(e) => setNewFeeTier(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-[#C7D6E6] focus:border-[#0057A0] rounded-lg outline-none"
          >
            <option value="Nhóm phổ biến">Nhóm phổ biến</option>
            <option value="Nhóm chọn lọc">Nhóm chọn lọc</option>
            <option value="Nhóm cao cấp">Nhóm cao cấp</option>
            <option value="Nhóm đặc biệt">Nhóm đặc biệt</option>
            <option value="Nhóm cá nhân hóa">Nhóm cá nhân hóa</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#0057A0] hover:bg-[#003F75] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm số</span>
          </button>
        </div>
        {formMessage && (
          <div className="md:col-span-12">
            <p
              className={`text-xs font-medium ${
                formMessage.type === 'ok' ? 'text-[#0057A0]' : 'text-[#D71920]'
              }`}
            >
              {formMessage.text}
            </p>
          </div>
        )}
      </form>

      {/* Filter Bar */}
      <div className="bg-white border border-[#DDE6F0] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#51647A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo chữ số hoặc ghi chú..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#F7F9FC] border border-[#DDE6F0] focus:border-[#0057A0] focus:bg-white rounded-lg outline-none"
          />
        </div>

        <select
          value={lengthFilter}
          onChange={(e) => setLengthFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-[#F7F9FC] border border-[#DDE6F0] focus:border-[#0057A0] rounded-lg outline-none"
        >
          <option value="all">Tất cả độ dài</option>
          {[3, 4, 5, 6, 7, 8].map((len) => (
            <option key={len} value={String(len)}>
              Độ dài {len} chữ số
            </option>
          ))}
        </select>

        <select
          value={structureFilter}
          onChange={(e) => setStructureFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-[#F7F9FC] border border-[#DDE6F0] focus:border-[#0057A0] rounded-lg outline-none"
        >
          {STRUCTURE_FILTERS.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-[#F7F9FC] border border-[#DDE6F0] focus:border-[#0057A0] rounded-lg outline-none"
        >
          <option value="all">Tất cả trạng thái</option>
          {(Object.entries(STATUS_META) as [InventoryStatus, { label: string }][]).map(
            ([val, meta]) => (
              <option key={val} value={val}>
                {meta.label}
              </option>
            )
          )}
        </select>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-[#DDE6F0] rounded-xl overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#DDE6F0] bg-[#F7F9FC] text-xs font-semibold text-[#51647A]">
                <th className="py-3 px-4">Số tài khoản & Nhãn ý nghĩa</th>
                <th className="py-3 px-4">Độ dài · Cấu trúc</th>
                <th className="py-3 px-4">Ghi chú & Nhóm phí</th>
                <th className="py-3 px-4">Trạng thái quản lý</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF4FA] text-sm">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-[#51647A]">
                    Không có số nào khớp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-[#F7F9FC] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-base font-bold text-[#0F243E] tabular-nums">
                          {formatNumberGroups(item.number)}
                        </span>
                        <NumberMeaningBadge
                          rawNumber={item.number}
                          size="sm"
                          tooltipPlacement={idx < 2 ? 'bottom' : 'top'}
                        />
                      </div>
                      <div className="text-[11px] text-[#51647A] font-mono tabular-nums mt-0.5">
                        Thêm ngày {item.addedAt}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-[#0F243E]">
                      <span className="font-mono font-semibold tabular-nums">{item.length} số</span>
                      <span className="mx-1.5 text-[#C7D6E6]">·</span>
                      <span className="text-[#51647A]">{item.structureType}</span>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <p className="text-[#0F243E]">{item.note}</p>
                      {item.feeTier && (
                        <p className="text-[#51647A] mt-0.5">{item.feeTier}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        aria-label={`Trạng thái số ${item.number}`}
                        value={item.status}
                        onChange={(e) =>
                          onUpdateStatus(item.id, e.target.value as InventoryStatus)
                        }
                        className={`text-xs font-semibold bg-white border border-[#DDE6F0] rounded-md px-2.5 py-1.5 outline-none focus:border-[#0057A0] cursor-pointer ${STATUS_META[item.status].colorClass}`}
                      >
                        {(Object.entries(STATUS_META) as [InventoryStatus, { label: string }][]).map(
                          ([val, meta]) => (
                            <option key={val} value={val}>
                              {meta.label}
                            </option>
                          )
                        )}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => onSendToAnalysis([item.number])}
                          className="text-xs font-semibold text-[#0057A0] hover:underline cursor-pointer"
                        >
                          Phân tích
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteItem(item.id)}
                          aria-label={`Xóa số ${item.number}`}
                          className="p-1.5 text-[#51647A] hover:text-[#D71920] rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
