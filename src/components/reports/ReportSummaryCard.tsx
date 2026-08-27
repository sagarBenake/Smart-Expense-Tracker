import React from 'react';
import { 
  TrendingDown, 
  TrendingUp, 
  Receipt, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Share2,
  Filter,
  Sparkles
} from 'lucide-react';
import { AdvancedSpendingReport } from '../../types';
import { formatINR } from '../../utils/formatters';

interface ReportSummaryCardProps {
  report: AdvancedSpendingReport;
  onOpenFilter: () => void;
  onOpenExport: () => void;
  onOpenShare: () => void;
  activeFilterCount: number;
}

export const ReportSummaryCard: React.FC<ReportSummaryCardProps> = ({
  report,
  onOpenFilter,
  onOpenExport,
  onOpenShare,
  activeFilterCount,
}) => {
  const isDecrease = report.trendChangePercentage <= 0;
  const absTrend = Math.abs(report.trendChangePercentage);

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-indigo-700/40 relative overflow-hidden space-y-5">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Row */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-indigo-100 border border-white/20">
            <Calendar className="w-3.5 h-3.5 text-indigo-300" />
            {report.dateRangeLabel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenFilter}
            className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeFilterCount > 0
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
            }`}
            title="Open Advanced Filters"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-slate-950 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenExport}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-medium flex items-center gap-1.5 transition-all"
            title="Export Report"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={onOpenShare}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-medium flex items-center gap-1.5 transition-all"
            title="Share Report"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Spend Amount & Trend */}
      <div className="space-y-1 relative z-10">
        <span className="text-xs font-medium text-indigo-200 tracking-wide uppercase">
          Total Spending
        </span>
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {formatINR(report.totalSpending)}
          </span>

          {report.previousPeriodSpending > 0 && (
            <div
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                isDecrease
                  ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                  : 'bg-rose-400/20 text-rose-300 border border-rose-400/30'
              }`}
            >
              {isDecrease ? (
                <TrendingDown className="w-3.5 h-3.5" />
              ) : (
                <TrendingUp className="w-3.5 h-3.5" />
              )}
              <span>
                {absTrend}% {isDecrease ? 'less' : 'more'}
              </span>
            </div>
          )}
        </div>

        {report.previousPeriodSpending > 0 && (
          <p className="text-[11px] text-indigo-200/80">
            vs {formatINR(report.previousPeriodSpending)} in previous equivalent period
          </p>
        )}
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-white/15 relative z-10">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-white/10">
          <span className="text-[10px] text-indigo-200 block font-medium">Transactions</span>
          <span className="text-base sm:text-lg font-bold text-white mt-0.5 block">
            {report.totalTransactions}
          </span>
          <span className="text-[10px] text-indigo-300/90 block">recorded</span>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-white/10">
          <span className="text-[10px] text-indigo-200 block font-medium">Average Txn</span>
          <span className="text-base sm:text-lg font-bold text-white mt-0.5 block">
            {formatINR(report.averageTransaction)}
          </span>
          <span className="text-[10px] text-indigo-300/90 block">per expense</span>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-white/10">
          <span className="text-[10px] text-indigo-200 block font-medium">Highest Expense</span>
          <span className="text-base sm:text-lg font-bold text-amber-300 mt-0.5 block truncate">
            {report.highestTransaction ? formatINR(report.highestTransaction.amount) : '₹0'}
          </span>
          <span className="text-[10px] text-indigo-300/90 block truncate">
            {report.highestTransaction ? report.highestTransaction.merchant : 'None'}
          </span>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-white/10">
          <span className="text-[10px] text-indigo-200 block font-medium">Daily Average</span>
          <span className="text-base sm:text-lg font-bold text-purple-300 mt-0.5 block">
            {formatINR(report.dailyAverage)}
          </span>
          <span className="text-[10px] text-indigo-300/90 block">per active day</span>
        </div>
      </div>
    </div>
  );
};
