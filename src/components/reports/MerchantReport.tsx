import React from 'react';
import { Store, ChevronRight, ArrowUpRight, TrendingUp } from 'lucide-react';
import { AdvancedSpendingReport } from '../../types';
import { formatINR } from '../../utils/formatters';

interface MerchantReportProps {
  report: AdvancedSpendingReport;
  onSelectMerchant: (merchant: string) => void;
}

export const MerchantReport: React.FC<MerchantReportProps> = ({
  report,
  onSelectMerchant,
}) => {
  const topMerchants = report.topMerchants || [];
  const maxMerchantSpend = Math.max(1, ...topMerchants.map(m => m.amount));

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Merchant Spending Report
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Ranked by total volume (Tap to view receipts)
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
          {topMerchants.length} vendors
        </span>
      </div>

      {/* Merchant List */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {topMerchants.map((m, idx) => {
          const barWidth = Math.round((m.amount / maxMerchantSpend) * 100);
          return (
            <button
              key={m.merchant}
              type="button"
              onClick={() => onSelectMerchant(m.merchant)}
              className="w-full p-3 rounded-xl bg-slate-50/80 dark:bg-slate-850 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 border border-slate-200/80 dark:border-slate-700/70 transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {m.merchant}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      {m.count} transactions • Avg {formatINR(m.average)}/txn
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {formatINR(m.amount)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  style={{ width: `${barWidth}%` }}
                  className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500"
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
