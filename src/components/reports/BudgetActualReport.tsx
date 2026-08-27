import React from 'react';
import { Wallet, AlertCircle, CheckCircle2, TrendingUp, Sliders } from 'lucide-react';
import { AdvancedSpendingReport, Budget, Category } from '../../types';
import { formatINR } from '../../utils/formatters';

interface BudgetActualReportProps {
  report: AdvancedSpendingReport;
  budget: Budget;
  categories: Category[];
  onOpenBudgetSettings?: () => void;
}

export const BudgetActualReport: React.FC<BudgetActualReportProps> = ({
  report,
  budget,
  categories,
  onOpenBudgetSettings,
}) => {
  const overallBudget = budget?.overallAmount || 30000;
  const totalSpending = report.totalSpending || 0;
  const remaining = Math.max(0, overallBudget - totalSpending);
  const usagePercentage = overallBudget > 0 ? Math.min(100, Math.round((totalSpending / overallBudget) * 100)) : 0;
  const isOverBudget = totalSpending > overallBudget;

  const categoryBudgets = report.categoryBreakdown.filter(c => c.budget && c.budget > 0);

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Budget vs. Actual Spending
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Track allocated limits across all default & custom categories
            </p>
          </div>
        </div>

        {onOpenBudgetSettings && (
          <button
            onClick={onOpenBudgetSettings}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
          >
            Adjust Budget
          </button>
        )}
      </div>

      {/* Overall Budget Hero Progress */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700/70 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Allocated Limit</span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white block mt-0.5">
              {formatINR(overallBudget)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 font-medium block">Actual Spending</span>
            <span className={`text-lg font-extrabold block mt-0.5 ${isOverBudget ? 'text-rose-600' : 'text-indigo-600 dark:text-indigo-400'}`}>
              {formatINR(totalSpending)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden p-0.5">
            <div
              style={{ width: `${usagePercentage}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget
                  ? 'bg-rose-500'
                  : usagePercentage >= 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span>Budget usage: {usagePercentage}%</span>
            <span>
              {isOverBudget
                ? `Over budget by ${formatINR(totalSpending - overallBudget)}`
                : `Remaining: ${formatINR(remaining)}`}
            </span>
          </div>
        </div>
      </div>

      {/* Category Budgets Grid (Including Custom Categories) */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
          Category Budgets Status
        </span>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {categoryBudgets.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-400">
              No category-specific budgets configured yet.
            </div>
          ) : (
            categoryBudgets.map(c => {
              const catBudget = c.budget || 0;
              const catSpend = c.amount;
              const catPercent = catBudget > 0 ? Math.min(100, Math.round((catSpend / catBudget) * 100)) : 0;
              const catOver = catSpend > catBudget;
              const diff = Math.abs(catSpend - catBudget);

              return (
                <div
                  key={c.categoryId}
                  className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-700/60 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{c.icon}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{c.name}</span>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        catOver
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {catOver ? `Over Budget by ${formatINR(diff)}` : `Remaining: ${formatINR(diff)}`}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${catPercent}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        catOver ? 'bg-rose-500' : 'bg-indigo-600 dark:bg-indigo-500'
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span>Spent: {formatINR(catSpend)}</span>
                    <span>Budget: {formatINR(catBudget)} ({catPercent}%)</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
