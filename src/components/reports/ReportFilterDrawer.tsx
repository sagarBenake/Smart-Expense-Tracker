import React, { useState } from 'react';
import { 
  X, 
  Filter, 
  RotateCcw, 
  Bookmark, 
  BookmarkCheck, 
  Trash2, 
  Check, 
  Sliders, 
  Search,
  Tag,
  CreditCard,
  Building,
  ArrowUpDown,
  Plus
} from 'lucide-react';
import { 
  Category, 
  PaymentMethodType, 
  ReportFilterModel, 
  SavedReportFilter, 
  TransactionType, 
  TransactionSource 
} from '../../types';

interface ReportFilterDrawerProps {
  filter: ReportFilterModel;
  categories: Category[];
  merchants: string[];
  savedFilters: SavedReportFilter[];
  onClose: () => void;
  onApplyFilter: (filter: ReportFilterModel) => void;
  onResetFilter: () => void;
  onSaveCurrentFilter: (name: string, filter: ReportFilterModel) => void;
  onDeleteSavedFilter: (id: string) => void;
}

export const ReportFilterDrawer: React.FC<ReportFilterDrawerProps> = ({
  filter,
  categories,
  merchants,
  savedFilters,
  onClose,
  onApplyFilter,
  onResetFilter,
  onSaveCurrentFilter,
  onDeleteSavedFilter,
}) => {
  const [draft, setDraft] = useState<ReportFilterModel>({ ...filter });
  const [saveName, setSaveName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  const paymentMethodsList: PaymentMethodType[] = [
    'UPI',
    'Credit Card',
    'Debit Card',
    'Cash',
    'Bank Transfer',
    'Wallet',
    'Net Banking',
    'Other',
  ];

  const handleToggleCategory = (catId: string) => {
    const current = draft.categoryIds || [];
    const updated = current.includes(catId)
      ? current.filter(id => id !== catId)
      : [...current, catId];
    setDraft({ ...draft, categoryIds: updated });
  };

  const handleTogglePaymentMethod = (pm: PaymentMethodType) => {
    const current = draft.paymentMethods || [];
    const updated = current.includes(pm)
      ? current.filter(m => m !== pm)
      : [...current, pm];
    setDraft({ ...draft, paymentMethods: updated });
  };

  const handleApply = () => {
    onApplyFilter(draft);
    onClose();
  };

  const handleSaveFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveName.trim()) return;
    onSaveCurrentFilter(saveName.trim(), draft);
    setSaveName('');
    setShowSaveInput(false);
  };

  const defaultCategories = (categories || []).filter(c => c && c.isDefault);
  const customCategories = (categories || []).filter(c => c && !c.isDefault);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl border-l border-slate-200 dark:border-slate-700 animate-slideLeft">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Report Filters
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customize data scope & parameters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Filter Options */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {/* Saved Filters Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-indigo-500" />
                <span>Saved Filter Presets</span>
              </span>
              <button
                type="button"
                onClick={() => setShowSaveInput(!showSaveInput)}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Save Current
              </button>
            </div>

            {showSaveInput && (
              <form onSubmit={handleSaveFilter} className="flex gap-2 p-2 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
                <input
                  type="text"
                  placeholder="Filter name (e.g. My Food Expenses)"
                  value={saveName}
                  onChange={e => setSaveName(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700"
                >
                  Save
                </button>
              </form>
            )}

            <div className="flex flex-wrap gap-1.5">
              {(savedFilters || []).map(sf => (
                <div
                  key={sf.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-xs"
                >
                  <button
                    type="button"
                    onClick={() => setDraft({ ...sf.filter })}
                    className="font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {sf.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteSavedFilter(sf.id)}
                    className="text-slate-400 hover:text-rose-500 transition-colors ml-1"
                    title="Delete preset"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 1. Transaction Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 dark:text-white block">
              Transaction Type
            </label>
            <div className="grid grid-cols-4 gap-1.5 text-xs font-medium">
              {[
                { id: 'all', label: 'All' },
                { id: 'Expense', label: 'Expense' },
                { id: 'Credit', label: 'Income' },
                { id: 'Transfer', label: 'Transfer' },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDraft({ ...draft, transactionType: opt.id as any })}
                  className={`py-2 rounded-xl text-center transition-all ${
                    draft.transactionType === opt.id || (!draft.transactionType && opt.id === 'all')
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Transfer Exclusion (Section 17) */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Include Transfers
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Self-transfers excluded by default
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDraft({ ...draft, includeTransfers: !draft.includeTransfers })}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                draft.includeTransfers ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform absolute top-0.5 left-0.5 ${
                  draft.includeTransfers ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 3. Source */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 dark:text-white block">
              Expense Source
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs font-medium">
              {[
                { id: 'all', label: 'All Sources' },
                { id: 'sms', label: 'SMS Detected' },
                { id: 'manual', label: 'Manual' },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDraft({ ...draft, source: opt.id as any })}
                  className={`py-2 rounded-xl text-center transition-all ${
                    draft.source === opt.id || (!draft.source && opt.id === 'all')
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Category Scope & Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white">
                Categories
              </label>
              <button
                type="button"
                onClick={() => setDraft({ ...draft, categoryIds: [] })}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear selection ({draft.categoryIds?.length || 0})
              </button>
            </div>

            {/* Category scope pill selector */}
            <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs">
              {[
                { id: 'all', label: 'All Categories' },
                { id: 'default', label: 'Default Only' },
                { id: 'custom', label: 'Custom Only' },
              ].map(scope => (
                <button
                  key={scope.id}
                  type="button"
                  onClick={() => setDraft({ ...draft, categoryScope: scope.id as any })}
                  className={`flex-1 py-1.5 rounded-lg text-center font-medium transition-all ${
                    draft.categoryScope === scope.id || (!draft.categoryScope && scope.id === 'all')
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {scope.label}
                </button>
              ))}
            </div>

            {/* Category checkboxes */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {(categories || []).map(cat => {
                const isChecked = (draft.categoryIds || []).includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleToggleCategory(cat.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs text-left transition-all ${
                      isChecked
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{cat.icon}</span>
                      <span className="font-medium">{cat.name}</span>
                      {!cat.isDefault && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold">
                          Custom
                        </span>
                      )}
                    </div>
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                        isChecked
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Payment Methods */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 dark:text-white block">
              Payment Methods
            </label>
            <div className="flex flex-wrap gap-1.5">
              {paymentMethodsList.map(pm => {
                const isSelected = (draft.paymentMethods || []).includes(pm);
                return (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => handleTogglePaymentMethod(pm)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white font-bold shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {pm}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Merchant Search */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-900 dark:text-white block">
              Merchant Search
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by merchant name (e.g. Amazon, Swiggy)"
                value={draft.merchantSearch || ''}
                onChange={e => setDraft({ ...draft, merchantSearch: e.target.value })}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* 7. Amount Range */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-900 dark:text-white block">
              Amount Range (₹)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min ₹0"
                value={draft.minAmount !== undefined ? draft.minAmount : ''}
                onChange={e =>
                  setDraft({
                    ...draft,
                    minAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
              <input
                type="number"
                placeholder="Max ₹Unlimited"
                value={draft.maxAmount !== undefined ? draft.maxAmount : ''}
                onChange={e =>
                  setDraft({
                    ...draft,
                    maxAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 flex gap-2">
          <button
            type="button"
            onClick={() => {
              onResetFilter();
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
};
