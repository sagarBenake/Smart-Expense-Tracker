import React from 'react';
import { Scale, TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { AdvancedSpendingReport, Transaction } from '../../types';
import { formatINR } from '../../utils/formatters';

interface IncomeVsExpenseReportProps {
  report: AdvancedSpendingReport;
}

export const IncomeVsExpenseReport: React.FC<IncomeVsExpenseReportProps> = ({ report }) => {
  const totalIncome = report.totalIncome || 0;
  const totalSpending = report.totalSpending || 0;
  const netBalance = totalIncome - totalSpending;
  const isPositive = netBalance >= 0;

  const maxTotal = Math.max(1, totalIncome, totalSpending);
  const incomeBar = Math.round((totalIncome / maxTotal) * 100);
  const expenseBar = Math.round((totalSpending / maxTotal) * 100);

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Income vs. Expense Summary
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Net balance & cashflow stability
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <ArrowDownLeft className="w-4 h-4" />
            <span>Total Income</span>
          </div>
          <span className="text-lg font-extrabold text-emerald-950 dark:text-emerald-200 block">
            {formatINR(totalIncome)}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/50 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400">
            <ArrowUpRight className="w-4 h-4" />
            <span>Total Expenses</span>
          </div>
          <span className="text-lg font-extrabold text-rose-950 dark:text-rose-200 block">
            {formatINR(totalSpending)}
          </span>
        </div>

        <div className={`p-3.5 rounded-xl border space-y-1 ${
          isPositive
            ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-200/80 dark:border-indigo-800/50'
            : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-800/50'
        }`}>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-400">
            <Scale className="w-4 h-4" />
            <span>Net Balance</span>
          </div>
          <span className={`text-lg font-extrabold block ${isPositive ? 'text-indigo-950 dark:text-indigo-200' : 'text-amber-700 dark:text-amber-400'}`}>
            {isPositive ? `+${formatINR(netBalance)}` : formatINR(netBalance)}
          </span>
        </div>
      </div>

      {/* Comparative Bars */}
      <div className="space-y-2 pt-1">
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Income Inflow</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatINR(totalIncome)}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div style={{ width: `${incomeBar}%` }} className="bg-emerald-500 h-full rounded-full" />
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Expense Outflow</span>
            <span className="font-bold text-rose-600 dark:text-rose-400">{formatINR(totalSpending)}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div style={{ width: `${expenseBar}%` }} className="bg-rose-500 h-full rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
