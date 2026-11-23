import {
  BarChart3,
  Calculator,
  Database,
  FileText,
  Menu,
  MessageSquareText,
  X,
  Zap,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import ConsultationSheet from './components/ConsultationSheet';
import InventoryManager from './components/InventoryManager';
import NumberGeneratorHub from './components/NumberGeneratorHub';
import NumerologyView from './components/NumerologyView';
import QuickCounterWorkspace from './components/QuickCounterWorkspace';
import SmartConsultant from './components/SmartConsultant';
import {
  DEFAULT_WEIGHTS,
  INITIAL_INVENTORY,
  SAMPLE_CUSTOMERS,
} from './constants/banking';
import { calculateNumerology } from './engines/numerology';
import {
  analyzeSingleCandidate,
  generateSmartCandidates,
  parseManualNumbers,
} from './engines/scoringAndGenerator';
import {
  ActiveTab,
  AnalyzedAccountNumber,
  ConsultantScripts,
  CustomerProfile,
  InventoryNumberItem,
  InventoryStatus,
  NumberStyleId,
  NumerologySettings,
  ScoringWeights,
} from './types';

const INVENTORY_STORAGE_KEY = 'lucky_number_bank_inventory_v1';

const EMPTY_PROFILE: CustomerProfile = {
  fullName: '',
  birthDate: '',
  gender: 'unspecified',
  selfDescribedPersonality: '',
  goals: ['wealth_accumulation'],
  notes: '',
};

interface NavItemConfig {
  id: ActiveTab;
  label: string;
  hint?: string;
  group: 'primary' | 'optional';
  icon: typeof Zap;
  iconBg: string;
  iconColor: string;
}

const NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'quick',
    label: 'Tư vấn nhanh (3 bước)',
    hint: 'Chính',
    group: 'primary',
    icon: Zap,
    iconBg: 'bg-[#EDF4FA]',
    iconColor: 'text-[#0057A0]',
  },
  {
    id: 'consultant',
    label: 'Kịch bản & Từ chối AI',
    group: 'primary',
    icon: MessageSquareText,
    iconBg: 'bg-[#FEF2F2]',
    iconColor: 'text-[#D71920]',
  },
  {
    id: 'sheet',
    label: 'Phiếu tư vấn PDF',
    group: 'primary',
    icon: FileText,
    iconBg: 'bg-[#ECFDF5]',
    iconColor: 'text-[#047857]',
  },
  {
    id: 'numerology',
    label: 'Thần số học chi tiết',
    group: 'optional',
    icon: Calculator,
    iconBg: 'bg-[#EEF2FF]',
    iconColor: 'text-[#4338CA]',
  },
  {
    id: 'generator',
    label: 'Phân tích & Biểu đồ',
    group: 'optional',
    icon: BarChart3,
    iconBg: 'bg-[#FFFBEB]',
    iconColor: 'text-[#B45309]',
  },
  {
    id: 'inventory',
    label: 'Kho số nội bộ',
    group: 'optional',
    icon: Database,
    iconBg: 'bg-[#E0F2FE]',
    iconColor: 'text-[#0369A1]',
  },
];

function loadInitialInventory(): InventoryNumberItem[] {
  try {
    const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (!raw) return INITIAL_INVENTORY;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_INVENTORY;
  } catch {
    return INITIAL_INVENTORY;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('quick');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Customer Profile kept strictly in React memory (no PII written to localStorage or server)
  const [profile, setProfile] = useState<CustomerProfile>(SAMPLE_CUSTOMERS[0].profile);

  // Module 2 Settings
  const [numerologySettings, setNumerologySettings] = useState<NumerologySettings>({
    keepMasterNumbers: true,
    yRule: 'contextual',
  });

  // Module 4 & 5 State
  const [generatorMode, setGeneratorMode] = useState<'ai' | 'manual'>('ai');
  const [selectedLength, setSelectedLength] = useState<number>(6);
  const [selectedStyle, setSelectedStyle] = useState<NumberStyleId>('business_prosperity');
  const [weights, setWeights] = useState<ScoringWeights>({ ...DEFAULT_WEIGHTS });
  const [manualInput, setManualInput] = useState<string>('686868\n168888\n397986\n688668\n136899');
  const [manualParseErrors, setManualParseErrors] = useState<string[]>([]);
  const [manualSourceNumbers, setManualSourceNumbers] = useState<{
    numbers: string[];
    source: 'teller_input' | 'inventory';
  }>({
    numbers: ['686868', '168888', '397986', '688668', '136899'],
    source: 'teller_input',
  });

  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [aiScriptsCache, setAiScriptsCache] = useState<Record<string, ConsultantScripts>>({});

  // Module 8 Inventory (non-PII, stored locally for GDV convenience)
  const [inventory, setInventory] = useState<InventoryNumberItem[]>(loadInitialInventory);

  useEffect(() => {
    try {
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
    } catch {
      // Ignore storage quota errors
    }
  }, [inventory]);

  // Deterministic Module 2 Numerology Computation
  const numerologyReport = useMemo(
    () => calculateNumerology(profile.fullName, profile.birthDate, numerologySettings),
    [profile.fullName, profile.birthDate, numerologySettings]
  );

  // Reactive Candidate Ranking (recomputes automatically when profile, numerology, weights, mode, length, or style change)
  const candidates = useMemo<AnalyzedAccountNumber[]>(() => {
    if (generatorMode === 'ai') {
      return generateSmartCandidates(
        selectedLength,
        selectedStyle,
        profile,
        numerologyReport,
        weights
      );
    }

    const analyzed: AnalyzedAccountNumber[] = [];
    for (const num of manualSourceNumbers.numbers) {
      const item = analyzeSingleCandidate(
        num,
        manualSourceNumbers.source,
        profile,
        numerologyReport,
        selectedStyle,
        weights
      );
      if (item) analyzed.push(item);
    }

    analyzed.sort((a, b) => {
      if (b.score.total !== a.score.total) return b.score.total - a.score.total;
      return b.score.breakdown.numerology - a.score.breakdown.numerology;
    });
    return analyzed;
  }, [
    generatorMode,
    selectedLength,
    selectedStyle,
    profile,
    numerologyReport,
    weights,
    manualSourceNumbers,
  ]);

  const selectedCandidate = useMemo(() => {
    if (!selectedCandidateId) return candidates[0] ?? null;
    return candidates.find((c) => c.id === selectedCandidateId) ?? candidates[0] ?? null;
  }, [candidates, selectedCandidateId]);

  const navigateTo = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetProfile = () => {
    setProfile(EMPTY_PROFILE);
    setAiScriptsCache({});
    setSelectedCandidateId(null);
  };

  const handleCheckCustomNumber = (rawNumber: string): boolean => {
    const { valid } = parseManualNumbers(rawNumber);
    if (valid.length === 0) return false;
    setManualInput(valid.join('\n'));
    setManualParseErrors([]);
    setManualSourceNumbers({ numbers: valid, source: 'teller_input' });
    setGeneratorMode('manual');
    setSelectedCandidateId(null);
    return true;
  };

  const handleRunManualAnalysis = () => {
    const { valid, invalid } = parseManualNumbers(manualInput);
    setManualParseErrors(invalid);
    if (valid.length > 0) {
      setManualSourceNumbers({ numbers: valid, source: 'teller_input' });
      setGeneratorMode('manual');
      setSelectedCandidateId(null);
    }
  };

  const handleAnalyzeFromInventory = (numbers: string[]) => {
    if (numbers.length === 0) return;
    setManualInput(numbers.join('\n'));
    setManualParseErrors([]);
    setManualSourceNumbers({ numbers, source: 'inventory' });
    setGeneratorMode('manual');
    setSelectedCandidateId(null);
    navigateTo('generator');
  };

  const handleSelectCandidateForConsultant = (candidate: AnalyzedAccountNumber) => {
    setSelectedCandidateId(candidate.id);
    navigateTo('consultant');
  };

  const handleAddInventoryItems = (newItems: InventoryNumberItem[]) => {
    setInventory((prev) => [...newItems, ...prev]);
  };

  const handleUpdateInventoryStatus = (id: string, status: InventoryStatus) => {
    setInventory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  const handleDeleteInventoryItem = (id: string) => {
    setInventory((prev) => prev.filter((item) => item.id !== id));
  };

  const activeNavMeta = NAV_ITEMS.find((n) => n.id === activeTab) ?? NAV_ITEMS[0];

  return (
    <div className="min-h-screen flex bg-[#F7F9FC] text-[#0F243E]">
      {/* Desktop Left Sidebar */}
      <aside className="no-print hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-[#DDE6F0] z-30">
        {/* Brand Block */}
        <div className="px-5 py-4 border-b border-[#EDF4FA]">
          <button
            type="button"
            onClick={() => navigateTo('quick')}
            className="text-left group cursor-pointer w-full"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0057A0] to-[#0089CF] flex items-center justify-center text-white font-mono text-xs font-bold tracking-tight shrink-0 shadow-xs">
                LN
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#0F243E] tracking-tight truncate">
                  Lucky Number Bank
                </p>
                <p className="text-[11px] text-[#51647A] truncate">
                  Chọn con số mang dấu ấn riêng
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Grouped Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto" aria-label="Điều hướng chính">
          <div className="space-y-1">
            <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-[#51647A]">
              Tác nghiệp nhanh
            </p>
            {NAV_ITEMS.filter((i) => i.group === 'primary').map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.id)}
                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-sm transition-all cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#EDF4FA] text-[#0057A0] font-bold shadow-xs'
                      : 'text-[#3B4F66] hover:text-[#0F243E] hover:bg-[#F7F9FC] font-medium'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-lg inline-flex items-center justify-center shrink-0 ${item.iconBg} ${item.iconColor}`}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="truncate">{item.label}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="space-y-1 pt-3 border-t border-[#EDF4FA]">
            <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-[#51647A]">
              Tìm hiểu sâu & Kho số
            </p>
            {NAV_ITEMS.filter((i) => i.group === 'optional').map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.id)}
                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-sm transition-all cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#EDF4FA] text-[#0057A0] font-bold shadow-xs'
                      : 'text-[#3B4F66] hover:text-[#0F243E] hover:bg-[#F7F9FC] font-medium'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-lg inline-flex items-center justify-center shrink-0 ${item.iconBg} ${item.iconColor}`}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="truncate">{item.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Active Customer Footer Summary inside Sidebar */}
        <div className="p-4 border-t border-[#EDF4FA] bg-[#F7F9FC]/70 space-y-1.5">
          <p className="text-[11px] font-semibold text-[#51647A]">Phiên tư vấn hiện tại</p>
          <p className="text-xs font-bold text-[#0F243E] truncate">
            {profile.fullName.trim() || 'Chưa nhập tên khách hàng'}
          </p>
          {selectedCandidate && (
            <p className="text-[11px] text-[#0057A0] font-mono font-semibold tabular-nums">
              Đang chọn: {selectedCandidate.formatted} ({selectedCandidate.score.total}đ)
            </p>
          )}
        </div>
      </aside>

      {/* Mobile Navigation Drawer */}
      {mobileNavOpen && (
        <div className="no-print fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#0F243E]/40"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[82vw] bg-white h-full flex flex-col border-r border-[#DDE6F0] z-10">
            <div className="px-5 py-4 border-b border-[#EDF4FA] flex items-center justify-between">
              <span className="text-sm font-bold text-[#0057A0]">Lucky Number Bank</span>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Đóng menu"
                className="p-1.5 text-[#51647A] hover:text-[#0F243E] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
              <div className="space-y-1">
                <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-[#51647A]">
                  Tác nghiệp nhanh
                </p>
                {NAV_ITEMS.filter((i) => i.group === 'primary').map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigateTo(item.id)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#EDF4FA] text-[#0057A0] font-bold'
                          : 'text-[#3B4F66] hover:text-[#0F243E] hover:bg-[#F7F9FC] font-medium'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-lg inline-flex items-center justify-center shrink-0 ${item.iconBg} ${item.iconColor}`}
                      >
                        <Icon className="w-4 h-4" />
                      </span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1 pt-3 border-t border-[#EDF4FA]">
                <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-[#51647A]">
                  Tìm hiểu sâu & Kho số
                </p>
                {NAV_ITEMS.filter((i) => i.group === 'optional').map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigateTo(item.id)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#EDF4FA] text-[#0057A0] font-bold'
                          : 'text-[#3B4F66] hover:text-[#0F243E] hover:bg-[#F7F9FC] font-medium'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-lg inline-flex items-center justify-center shrink-0 ${item.iconBg} ${item.iconColor}`}
                      >
                        <Icon className="w-4 h-4" />
                      </span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Contextual Top Bar */}
        <header className="no-print sticky top-0 z-20 bg-white/95 backdrop-blur-xs border-b border-[#DDE6F0] px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Mở menu điều hướng"
              className="lg:hidden p-1.5 -ml-1.5 text-[#0F243E] hover:bg-[#EDF4FA] rounded-md cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
              <span className="font-semibold text-[#0057A0] whitespace-nowrap shrink-0">
                Lucky Number Bank
              </span>
              <span className="text-[#C7D6E6]" aria-hidden="true">/</span>
              <span className="font-medium text-[#0F243E] truncate">
                {activeNavMeta.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {profile.fullName.trim() && (
              <span className="hidden md:inline text-xs text-[#51647A] truncate max-w-[200px]">
                KH: <strong className="text-[#0F243E]">{profile.fullName}</strong>
              </span>
            )}
            <button
              type="button"
              onClick={() => navigateTo(activeTab === 'quick' ? 'sheet' : 'quick')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0057A0] hover:bg-[#003F75] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {activeTab === 'quick' ? 'Xuất phiếu tư vấn' : '← Về Tư vấn nhanh'}
            </button>
          </div>
        </header>

        {/* Viewport Canvas */}
        <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              {(activeTab === 'quick' || activeTab === 'overview' || activeTab === 'profile') && (
                <QuickCounterWorkspace
                  profile={profile}
                  onProfileChange={(next) => {
                    setProfile(next);
                    setAiScriptsCache({});
                  }}
                  onResetProfile={handleResetProfile}
                  numerology={numerologyReport}
                  selectedLength={selectedLength}
                  onLengthChange={(len) => {
                    setSelectedLength(len);
                    setSelectedCandidateId(null);
                  }}
                  selectedStyle={selectedStyle}
                  onStyleChange={(st) => {
                    setSelectedStyle(st);
                    setSelectedCandidateId(null);
                  }}
                  candidates={candidates}
                  selectedCandidate={selectedCandidate}
                  onSelectCandidate={(c) => setSelectedCandidateId(c.id)}
                  onCheckCustomNumber={handleCheckCustomNumber}
                  onReturnToSuggestions={() => {
                    setGeneratorMode('ai');
                    setSelectedCandidateId(null);
                  }}
                  generatorMode={generatorMode}
                  onNavigate={navigateTo}
                />
              )}

              {activeTab === 'numerology' && (
                <NumerologyView
                  profile={profile}
                  report={numerologyReport}
                  settings={numerologySettings}
                  onSettingsChange={(next) => {
                    setNumerologySettings(next);
                    setAiScriptsCache({});
                  }}
                  onEditProfile={() => navigateTo('quick')}
                  onProceedToGenerator={() => navigateTo('quick')}
                />
              )}

              {activeTab === 'generator' && (
                <NumberGeneratorHub
                  profile={profile}
                  numerology={numerologyReport}
                  mode={generatorMode}
                  onModeChange={setGeneratorMode}
                  selectedLength={selectedLength}
                  onLengthChange={(len) => {
                    setSelectedLength(len);
                    setSelectedCandidateId(null);
                  }}
                  selectedStyle={selectedStyle}
                  onStyleChange={(st) => {
                    setSelectedStyle(st);
                    setSelectedCandidateId(null);
                  }}
                  weights={weights}
                  onWeightsChange={setWeights}
                  manualInput={manualInput}
                  onManualInputChange={setManualInput}
                  manualParseErrors={manualParseErrors}
                  onRunManualAnalysis={handleRunManualAnalysis}
                  onAnalyzeFromInventory={handleAnalyzeFromInventory}
                  onGenerateModeB={() => {
                    setGeneratorMode('ai');
                    setSelectedCandidateId(null);
                  }}
                  candidates={candidates}
                  selectedCandidateId={selectedCandidate?.id ?? null}
                  onSelectCandidate={handleSelectCandidateForConsultant}
                  inventory={inventory}
                />
              )}

              {activeTab === 'consultant' && (
                <SmartConsultant
                  profile={profile}
                  numerology={numerologyReport}
                  selectedStyle={selectedStyle}
                  candidates={candidates}
                  selectedCandidate={selectedCandidate}
                  onSelectCandidate={(c) => setSelectedCandidateId(c.id)}
                  aiScriptsCache={aiScriptsCache}
                  onSaveAiScripts={(id, scripts) =>
                    setAiScriptsCache((prev) => ({ ...prev, [id]: scripts }))
                  }
                  onGoToGenerator={() => navigateTo('generator')}
                  onGoToSheet={() => navigateTo('sheet')}
                />
              )}

              {activeTab === 'sheet' && (
                <ConsultationSheet
                  profile={profile}
                  numerology={numerologyReport}
                  candidates={candidates}
                  selectedCandidate={selectedCandidate}
                  aiScriptsCache={aiScriptsCache}
                  onGoToGenerator={() => navigateTo('generator')}
                />
              )}

              {activeTab === 'inventory' && (
                <InventoryManager
                  items={inventory}
                  onAddItems={handleAddInventoryItems}
                  onUpdateStatus={handleUpdateInventoryStatus}
                  onDeleteItem={handleDeleteInventoryItem}
                  onSendToAnalysis={handleAnalyzeFromInventory}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
