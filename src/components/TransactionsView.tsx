import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  SlidersHorizontal, 
  Plus, 
  Receipt, 
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Category, PaymentMethodType, Transaction } from '../types';
import { formatDateIndian, formatINR, formatTime12H } from '../utils/formatters';

interface TransactionsViewProps {
  transactions?: Transaction[];
  categories?: Category[];
  onOpenAddExpense: () => void;
  onOpenTransactionDetails: (tx: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions = [],
  categories = [],
  onOpenAddExpense,
  onOpenTransactionDetails,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<'all' | 'sms' | 'manual'>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Filter and sort logic
  const filteredTransactions = useMemo(() => {
    return (transactions || []).filter(tx => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesMerchant = tx.merchant.toLowerCase().includes(q);
        const matchesCategory = tx.categoryName.toLowerCase().includes(q);
        const matchesAmount = tx.amount.toString().includes(q) || `₹${tx.amount}`.includes(q);
        const matchesMethod = tx.paymentMethod.toLowerCase().includes(q);
        const matchesRef = (tx.referenceId || '').toLowerCase().includes(q);
        const matchesBank = (tx.bank || '').toLowerCase().includes(q);
        const matchesDate = tx.date.includes(q);

        if (!matchesMerchant && !matchesCategory && !matchesAmount && !matchesMethod && !matchesRef && !matchesBank && !matchesDate) {
          return false;
        }
      }

      // 2. Category Filter
      if (selectedCategory !== 'all' && tx.categoryId !== selectedCategory) {
        return false;
      }

      // 3. Payment Method Filter
      if (selectedMethod !== 'all' && tx.paymentMethod !== selectedMethod) {
        return false;
      }

      // 4. Source Filter
      if (selectedSource !== 'all' && tx.source !== selectedSource) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime();
      }
      if (sortBy === 'date_asc') {
        return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
      }
      if (sortBy === 'amount_desc') {
        return b.amount - a.amount;
      }
      if (sortBy === 'amount_asc') {
        return a.amount - b.amount;
      }
      return 0;
    });
  }, [transactions, searchQuery, selectedCategory, selectedMethod, selectedSource, sortBy]);

  // Group by Date for native Android list feel
  const groupedTransactions = useMemo(() => {
    const groups: { date: string; formattedDate: string; total: number; items: Transaction[] }[] = [];
    
    filteredTransactions.forEach(tx => {
      let group = groups.find(g => g.date === tx.date);
      if (!group) {
        group = {
          date: tx.date,
          formattedDate: formatDateIndian(tx.date),
          total: 0,
          items: [],
        };
        groups.push(group);
      }
      group.items.push(tx);
      if (tx.transactionType === 'Expense') {
        group.total += tx.amount;
      }
    });

    return groups;
  }, [filteredTransactions]);

  const activeFiltersCount = (selectedCategory !== 'all' ? 1 : 0) +
    (selectedMethod !== 'all' ? 1 : 0) +
    (selectedSource !== 'all' ? 1 : 0);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedMethod('all');
    setSelectedSource('all');
    setSortBy('date_desc');
  };

  return (
    <div className="space-y-4 pb-24 animate-fadeIn">
      {/* Header & Search Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Transactions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {filteredTransactions.length} of {transactions.length} records shown
            </p>
          </div>

          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>

        {/* Search input with live clear */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by merchant, amount, category, bank, or ID..."
            className="w-full pl-9.5 pr-8 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Filter Horizontal Scrolling Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setShowFiltersModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap transition-colors ${
              activeFiltersCount > 0
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
          </button>

          {/* Source Quick Chips */}
          <button
            onClick={() => setSelectedSource(selectedSource === 'all' ? 'sms' : selectedSource === 'sms' ? 'manual' : 'all')}
            className={`px-3 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap transition-colors ${
              selectedSource !== 'all'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            Source: {selectedSource === 'all' ? 'All' : selectedSource === 'sms' ? 'SMS Only' : 'Manual Only'}
          </button>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
          </select>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline px-2 whitespace-nowrap font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        /* Empty State (Section 53) */
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-700/60 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto text-2xl shadow-xs">
            <Receipt className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              No expenses found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              {searchQuery || activeFiltersCount > 0
                ? 'No transactions matched your search or filters. Try adjusting them.'
                : 'Your expenses will appear here automatically when transaction SMS messages arrive, or you can add one manually.'}
            </p>
          </div>
          <div className="flex justify-center gap-2 pt-2">
            {searchQuery || activeFiltersCount > 0 ? (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={onOpenAddExpense}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm"
              >
                + Add Expense
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedTransactions.map(group => (
            <div key={group.date} className="space-y-2">
              {/* Date Section Header */}
              <div className="flex items-center justify-between px-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{group.formattedDate}</span>
                </span>
                <span>Total: {formatINR(group.total)}</span>
              </div>

              {/* Transactions in this Date */}
              <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/60 divide-y divide-slate-100 dark:divide-slate-700/50 shadow-xs overflow-hidden">
                {group.items.map(tx => (
                  <div
                    key={tx.id}
                    onClick={() => onOpenTransactionDetails(tx)}
                    className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-2xs"
                        style={{ backgroundColor: `${tx.categoryColor}20` }}
                      >
                        {tx.categoryIcon}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {tx.merchant}
                          </h4>
                          {/* Auto vs Manual Tag */}
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                              tx.source === 'sms'
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {tx.source === 'sms' ? 'Auto detected' : 'Manual'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span>{tx.categoryName}</span>
                          <span>•</span>
                          <span>{formatTime12H(tx.time)}</span>
                          <span>•</span>
                          <span className="font-medium text-slate-600 dark:text-slate-300">{tx.paymentMethod}</span>
                          {tx.bank && (
                            <>
                              <span>•</span>
                              <span>{tx.bank}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-xs sm:text-sm text-rose-600 dark:text-rose-400 block">
                        -{formatINR(tx.amount)}
                      </span>
                      <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 mt-0.5">
                        {tx.syncStatus === 'synced' ? (
                          <span className="text-emerald-500 flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Synced</span>
                          </span>
                        ) : (
                          <span className="text-amber-500 flex items-center gap-0.5">
                            <AlertCircle className="w-2.5 h-2.5" />
                            <span>Pending</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Advanced Filters Modal */}
      {showFiltersModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-600" />
                <span>Filter Transactions</span>
              </h3>
              <button
                onClick={() => setShowFiltersModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Payment Method
              </label>
              <select
                value={selectedMethod}
                onChange={e => setSelectedMethod(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
              >
                <option value="all">All Methods</option>
                <option value="UPI">UPI</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Cash">Cash</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Wallet">Wallet</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            {/* Source */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Transaction Source
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['all', 'sms', 'manual'] as const).map(src => (
                  <button
                    key={src}
                    onClick={() => setSelectedSource(src)}
                    className={`py-2 rounded-xl text-xs font-semibold capitalize border ${
                      selectedSource === src
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {src === 'all' ? 'All' : src === 'sms' ? 'SMS Auto' : 'Manual'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFiltersModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
