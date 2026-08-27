import React, { useState } from 'react';
import { 
  GitCompare, 
  TrendingDown, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { Category, MonthComparisonResult, Transaction } from '../../types';
import { compareTwoMonths } from '../../services/reportEngine';
import { formatINR } from '../../utils/formatters';

interface MonthComparisonCardProps {
  transactions: Transaction[];
  categories: Category[];
}

export const MonthComparisonCard: React.FC<MonthComparisonCardProps> = ({
  transactions,
  categories,
}) => {
  const [monthA, setMonthA] = useState<{ year: number; month: number }>({ year: 2026, month: 7 }); // July 2026
  const [monthB, setMonthB] = useState<{ year: number; month: number }>({ year: 2026, month: 8 }); // August 2026

  const monthOptions = [
    { year: 2026, month: 5, label: 'May 2026' },
    { year: 2026, month: 6, label: 'Jun 2026' },
    { year: 2026, month: 7, label: 'Jul 2026' },
    { year: 2026, month: 8, label: 'Aug 2026' },
    { year: 2025, month: 8, label: 'Aug 2025' },
    { year: 2025, month: 12, label: 'Dec 2025' },
  ];

  const comparison: MonthComparisonResult = compareTwoMonths(
    transactions,
    categories,
    monthA.year,
    monthA.month,
    monthB.year,
    monthB.month
  );

  const isDecrease = comparison.difference <= 0;
  const absDiff = Math.abs(comparison.difference);
  const absPct = Math.abs(comparison.percentageChange);

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
      {/* Header & Month Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <GitCompare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Month-over-Month Comparison
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Analyze spending variance and category shifts
            </p>
          </div>
        </div>

        {/* Dual Month Selectors */}
        <div className="flex items-center gap-1.5 text-xs">
          <select
            value={`${monthA.year}-${monthA.month}`}
            onChange={e => {
              const [y, m] = e.target.value.split('-').map(Number);
              setMonthA({ year: y, month: m });
            }}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 border-none font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            {monthOptions.map(opt => (
              <option key={`a-${opt.year}-${opt.month}`} value={`${opt.year}-${opt.month}`}>
                {opt.label}
              </option>
            ))}
          </select>

          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

          <select
            value={`${monthB.year}-${monthB.month}`}
            onChange={e => {
              const [y, m] = e.target.value.split('-').map(Number);
              setMonthB({ year: y, month: m });
            }}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 border-none font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            {monthOptions.map(opt => (
              <option key={`b-${opt.year}-${opt.month}`} value={`${opt.year}-${opt.month}`}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* High-level Difference Metric Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/40 dark:from-slate-850 dark:to-indigo-950/20 border border-slate-200/80 dark:border-slate-700/80">
        <div>
          <span className="text-[11px] text-slate-400 font-medium block">
            {comparison.monthA.label}
          </span>
          <span className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
            {formatINR(comparison.monthA.total)}
          </span>
          <span className="text-[10px] text-slate-400 block">
            {comparison.monthA.count} transactions
          </span>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 font-medium block">
            {comparison.monthB.label}
          </span>
          <span className="text-base sm:text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 block">
            {formatINR(comparison.monthB.total)}
          </span>
          <span className="text-[10px] text-slate-400 block">
            {comparison.monthB.count} transactions
          </span>
        </div>

        <div className="flex flex-col justify-center">
          <span className="text-[11px] text-slate-400 font-medium block">
            Net Difference
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold ${
                isDecrease
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
              }`}
            >
              {isDecrease ? (
                <TrendingDown className="w-3.5 h-3.5" />
              ) : (
                <TrendingUp className="w-3.5 h-3.5" />
              )}
              <span>{isDecrease ? '↓' : '↑'} {absPct}% ({formatINR(absDiff)} {isDecrease ? 'less' : 'more'})</span>
            </span>
          </div>
        </div>
      </div>

      {/* Category-by-Category Detailed Comparisons */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
          Category Shifts Breakdown
        </span>

        <div className="space-y-2">
          {comparison.categoryComparisons.slice(0, 6).map(cat => {
            const isCatDecrease = cat.diff <= 0;
            const maxCatAmt = Math.max(1, cat.amountA, cat.amountB);
            const barA = Math.round((cat.amountA / maxCatAmt) * 100);
            const barB = Math.round((cat.amountB / maxCatAmt) * 100);

            return (
              <div
                key={cat.categoryId}
                className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-700/60 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-0.5 ${
                        isCatDecrease
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                      }`}
                    >
                      {isCatDecrease ? '↓' : '↑'} {Math.abs(cat.percentageChange)}% ({formatINR(Math.abs(cat.diff))})
                    </span>
                  </div>
                </div>

                {/* Dual horizontal bars */}
                <div className="space-y-1 text-[10px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-16 truncate font-medium text-slate-500">{comparison.monthA.label.split(' ')[0]}</span>
                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${barA}%` }}
                        className="bg-slate-400 dark:bg-slate-500 h-full rounded-full"
                      />
                    </div>
                    <span className="w-16 text-right font-semibold text-slate-700 dark:text-slate-300">
                      {formatINR(cat.amountA)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-16 truncate font-medium text-indigo-500">{comparison.monthB.label.split(' ')[0]}</span>
                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${barB}%` }}
                        className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full"
                      />
                    </div>
                    <span className="w-16 text-right font-bold text-indigo-600 dark:text-indigo-400">
                      {formatINR(cat.amountB)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
