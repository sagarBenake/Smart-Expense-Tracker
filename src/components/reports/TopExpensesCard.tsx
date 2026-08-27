import React, { useState } from 'react';
import { Award, ChevronRight, ArrowUpRight } from 'lucide-react';
import { Transaction } from '../../types';
import { formatDateIndian, formatINR } from '../../utils/formatters';

interface TopExpensesCardProps {
  transactions: Transaction[];
  onOpenTransactionDetails: (tx: Transaction) => void;
}

export const TopExpensesCard: React.FC<TopExpensesCardProps> = ({
  transactions,
  onOpenTransactionDetails,
}) => {
  const [topCount, setTopCount] = useState<5 | 10 | 20>(5);

  const expenseTxns = (transactions || [])
    .filter(t => t.transactionType === 'Expense')
    .sort((a, b) => b.amount - a.amount);

  const topList = expenseTxns.slice(0, topCount);

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
      {/* Header & Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Top Expenses Ranking
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Highest single transactions recorded
            </p>
          </div>
        </div>

        {/* Top 5 / 10 / 20 selector */}
        <div className="flex p-0.5 rounded-xl bg-slate-100 dark:bg-slate-700/60 text-xs font-semibold">
          {[5, 10, 20].map(cnt => (
            <button
              key={cnt}
              onClick={() => setTopCount(cnt as any)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                topCount === cnt
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Top {cnt}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {topList.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No expenses found.
          </div>
        ) : (
          topList.map((tx, idx) => (
            <button
              key={tx.id}
              onClick={() => onOpenTransactionDetails(tx)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-lg text-xs font-extrabold flex items-center justify-center ${
                    idx === 0
                      ? 'bg-amber-400 text-amber-950'
                      : idx === 1
                      ? 'bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white'
                      : idx === 2
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {idx + 1}
                </span>

                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-2xs" style={{ backgroundColor: `${tx.categoryColor}20` }}>
                  {tx.categoryIcon}
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {tx.merchant}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                    {tx.categoryName} • {formatDateIndian(tx.date)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                    {formatINR(tx.amount)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    {tx.paymentMethod}
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
