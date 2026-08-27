import React, { useState } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  Receipt, 
  ChevronRight, 
  SlidersHorizontal,
  ExternalLink,
  MessageSquareText,
  Smartphone
} from 'lucide-react';
import { Transaction } from '../../types';
import { formatDateIndian, formatINR } from '../../utils/formatters';

interface ReportTransactionTableProps {
  transactions: Transaction[];
  onOpenTransactionDetails: (tx: Transaction) => void;
}

export const ReportTransactionTable: React.FC<ReportTransactionTableProps> = ({
  transactions,
  onOpenTransactionDetails,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Filter transactions by in-report search query
  const filtered = (transactions || []).filter(tx => {
    if (!tx) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      tx.merchant.toLowerCase().includes(q) ||
      tx.categoryName.toLowerCase().includes(q) ||
      tx.paymentMethod.toLowerCase().includes(q) ||
      (tx.notes || '').toLowerCase().includes(q) ||
      tx.amount.toString().includes(q)
    );
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.date.localeCompare(a.date) || b.time.localeCompare(a.time);
      case 'oldest':
        return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
      case 'highest':
        return b.amount - a.amount;
      case 'lowest':
        return a.amount - b.amount;
      default:
        return 0;
    }
  });

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
      {/* Header with Search and Sort controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-indigo-500" />
            <span>Included Transactions</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {sorted.length} matching transactions (Tap to inspect or edit)
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1.5 text-xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 border-none font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="highest">Highest amount</option>
            <option value="lowest">Lowest amount</option>
          </select>
        </div>
      </div>

      {/* Search Input Bar (Section 26) */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search within report (e.g. Amazon, Swiggy, Fuel, 1299)..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Transactions List */}
      <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
        {sorted.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 space-y-1">
            <p>No transactions match your search or filter criteria.</p>
          </div>
        ) : (
          sorted.map(tx => (
            <button
              key={tx.id}
              onClick={() => onOpenTransactionDetails(tx)}
              className="w-full p-2.5 sm:p-3 rounded-xl bg-slate-50/80 dark:bg-slate-850 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base shadow-2xs shrink-0"
                  style={{ backgroundColor: `${tx.categoryColor}20` }}
                >
                  {tx.categoryIcon}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {tx.merchant}
                    </span>
                    {tx.source === 'sms' && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800">
                        SMS
                      </span>
                    )}
                    {tx.transactionType === 'Credit' && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
                        Income
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    {formatDateIndian(tx.date)} • {tx.categoryName} • {tx.paymentMethod}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className={`text-xs font-extrabold block ${
                    tx.transactionType === 'Credit' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'
                  }`}>
                    {tx.transactionType === 'Credit' ? `+${formatINR(tx.amount)}` : formatINR(tx.amount)}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {tx.time}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
