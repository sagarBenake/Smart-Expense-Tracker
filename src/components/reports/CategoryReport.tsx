import React, { useState } from 'react';
import { PieChart, ChevronRight, ArrowRight, Tag, Sparkles, Layers } from 'lucide-react';
import { AdvancedSpendingReport, Category, Transaction } from '../../types';
import { formatINR } from '../../utils/formatters';

interface CategoryReportProps {
  report: AdvancedSpendingReport;
  categories: Category[];
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryReport: React.FC<CategoryReportProps> = ({
  report,
  categories,
  onSelectCategory,
}) => {
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);

  const breakdown = report.categoryBreakdown || [];
  const totalSpending = report.totalSpending || 1;

  // Compute SVG Donut Chart Slices
  let cumulativeAngle = 0;
  const radius = 64;
  const circumference = 2 * Math.PI * radius; // ~402.12

  const slices = breakdown.map(cat => {
    const fraction = cat.amount / totalSpending;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativeAngle * circumference;
    cumulativeAngle += fraction;

    return {
      ...cat,
      strokeDasharray,
      strokeDashoffset,
      fraction,
    };
  });

  const activeCat = breakdown.find(c => c.categoryId === hoveredCategoryId) || breakdown[0];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Category Spending Breakdown
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Includes all default & custom created categories
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
          {breakdown.length} active
        </span>
      </div>

      {/* Donut Chart & Hero Center */}
      <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
        {/* SVG Donut */}
        <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            {/* Background ring */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              className="stroke-slate-100 dark:stroke-slate-700"
              strokeWidth="20"
              fill="transparent"
            />
            {slices.map(s => (
              <circle
                key={s.categoryId}
                cx="80"
                cy="80"
                r={radius}
                stroke={s.color || '#6366F1'}
                strokeWidth={hoveredCategoryId === s.categoryId ? '24' : '20'}
                strokeDasharray={s.strokeDasharray}
                strokeDashoffset={s.strokeDashoffset}
                strokeLinecap="butt"
                fill="transparent"
                className="transition-all duration-300 cursor-pointer hover:opacity-90"
                onMouseEnter={() => setHoveredCategoryId(s.categoryId)}
                onClick={() => onSelectCategory(s.categoryId)}
              />
            ))}
          </svg>

          {/* Center Callout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2">
            {activeCat ? (
              <>
                <span className="text-xl">{activeCat.icon}</span>
                <span className="text-[11px] font-bold text-slate-900 dark:text-white truncate max-w-[100px]">
                  {activeCat.name}
                </span>
                <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                  {formatINR(activeCat.amount)}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {activeCat.percentage}%
                </span>
              </>
            ) : (
              <span className="text-xs text-slate-400 font-medium">No Data</span>
            )}
          </div>
        </div>

        {/* Top 3 Dominant Categories Quick Chips */}
        <div className="flex-1 space-y-2 w-full">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Distribution Summary
          </span>
          <div className="space-y-1.5">
            {breakdown.slice(0, 3).map(c => (
              <div
                key={c.categoryId}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-700/60 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{c.icon}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{c.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">{formatINR(c.amount)}</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-[10px]">
                    {c.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Complete Category List with tap-to-drilldown */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
          All Categories (Tap to view transactions)
        </span>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {breakdown.map(cat => {
            const isHovered = hoveredCategoryId === cat.categoryId;
            return (
              <button
                key={cat.categoryId}
                type="button"
                onClick={() => onSelectCategory(cat.categoryId)}
                onMouseEnter={() => setHoveredCategoryId(cat.categoryId)}
                onMouseLeave={() => setHoveredCategoryId(null)}
                className={`w-full p-3 rounded-xl border text-left transition-all group flex items-center justify-between ${
                  isHovered
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 shadow-xs'
                    : 'bg-slate-50/70 dark:bg-slate-850 border-slate-200/80 dark:border-slate-700/70 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-2xs shrink-0"
                    style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                  >
                    {cat.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {cat.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      {cat.count} transactions • {cat.percentage}% of total
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {formatINR(cat.amount)}
                    </span>
                    {cat.budget && cat.budget > 0 ? (
                      <span className={`text-[10px] font-semibold ${cat.isOverBudget ? 'text-rose-500' : 'text-slate-400'}`}>
                        Budget: {formatINR(cat.budget)}
                      </span>
                    ) : null}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
