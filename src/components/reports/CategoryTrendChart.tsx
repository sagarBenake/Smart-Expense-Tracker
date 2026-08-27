import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Activity, ArrowRight } from 'lucide-react';
import { Category, Transaction } from '../../types';
import { getCategoryMonthlyTrend } from '../../services/reportEngine';
import { formatINR } from '../../utils/formatters';

interface CategoryTrendChartProps {
  transactions: Transaction[];
  categories: Category[];
  initialCategoryId?: string;
}

export const CategoryTrendChart: React.FC<CategoryTrendChartProps> = ({
  transactions,
  categories,
  initialCategoryId,
}) => {
  const [selectedCatId, setSelectedCatId] = useState<string>(initialCategoryId || 'cat_food');
  const [year, setYear] = useState<number>(2026);

  const selectedCategory = (categories || []).find(c => c && c.id === selectedCatId) || categories[0];
  const trendData = getCategoryMonthlyTrend(transactions, selectedCatId, year);

  const totalSpent = trendData.reduce((sum, d) => sum + d.amount, 0);
  const maxAmount = Math.max(1, ...trendData.map(d => d.amount));

  // Determine trend (Compare recent months e.g. Jul vs Aug or May-Jun vs Jul-Aug)
  const recent1 = trendData[7]?.amount || 0; // Aug
  const recent2 = trendData[6]?.amount || 0; // Jul
  const isIncreasing = recent1 > recent2;
  const pctDiff = recent2 > 0 ? Math.round(((recent1 - recent2) / recent2) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
      {/* Header with Category Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-2xs"
            style={{ backgroundColor: `${selectedCategory?.color || '#6366F1'}20` }}
          >
            {selectedCategory?.icon || '📊'}
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Category Spending Trend</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Historical monthly velocity for {selectedCategory?.name || 'Category'}
            </p>
          </div>
        </div>

        {/* Category Selector Dropdown */}
        <select
          value={selectedCatId}
          onChange={e => setSelectedCatId(e.target.value)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 border-none text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
        >
          {(categories || []).map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name} {!cat.isDefault ? '(Custom)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Trend Summary Metric */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700/70 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 font-medium block">
            {year} Total Spent on {selectedCategory?.name}
          </span>
          <span className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5 block">
            {formatINR(totalSpent)}
          </span>
        </div>

        {recent2 > 0 && (
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold text-xs ${
              isIncreasing
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
            }`}
          >
            {isIncreasing ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>
              {isIncreasing ? `+${pctDiff}% vs July` : `${pctDiff}% vs July`}
            </span>
          </div>
        )}
      </div>

      {/* Trend Bar Chart */}
      <div className="space-y-2 pt-1">
        <div className="grid grid-cols-12 gap-1 sm:gap-2 items-end h-36 pb-2 border-b border-slate-100 dark:border-slate-700">
          {trendData.map((d, i) => {
            const heightPercent = d.amount > 0 ? Math.max(8, Math.round((d.amount / maxAmount) * 100)) : 4;
            const isAugust = i === 7;
            return (
              <div
                key={d.month}
                className="flex flex-col items-center h-full justify-end group"
                title={`${d.monthName}: ${formatINR(d.amount)} (${d.count} txns)`}
              >
                <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-t-md h-full flex items-end overflow-hidden p-0.5">
                  <div
                    style={{
                      height: `${heightPercent}%`,
                      backgroundColor: isAugust ? (selectedCategory?.color || '#6366F1') : undefined,
                    }}
                    className={`w-full rounded-t-sm transition-all duration-500 ${
                      isAugust
                        ? 'brightness-105 ring-1 ring-white/20'
                        : d.amount > 0
                        ? 'bg-slate-400 dark:bg-slate-600'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                </div>
                <span className={`text-[10px] mt-1 font-medium ${isAugust ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                  {d.monthName}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-400 text-center">
          Monthly spending pattern across {year}
        </p>
      </div>
    </div>
  );
};
