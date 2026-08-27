import React from 'react';
import { Repeat, Check, X, Calendar, Sparkles, AlertCircle } from 'lucide-react';
import { AdvancedSpendingReport, RecurringExpenseItem } from '../../types';
import { formatDateIndian, formatINR } from '../../utils/formatters';

interface RecurringSubscriptionsReportProps {
  report: AdvancedSpendingReport;
  onToggleRecurring: (merchant: string, isRecurring: boolean) => void;
}

export const RecurringSubscriptionsReport: React.FC<RecurringSubscriptionsReportProps> = ({
  report,
  onToggleRecurring,
}) => {
  const recurringList = report.recurringExpenses || [];
  const activeRecurring = recurringList.filter(r => r.isRecurring);
  const monthlyTotal = activeRecurring.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <Repeat className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Recurring Expenses & Subscriptions
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Identified bills, utilities, rent & active subscriptions
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-medium block">Monthly Total</span>
          <span className="text-sm sm:text-base font-extrabold text-purple-600 dark:text-purple-400">
            {formatINR(monthlyTotal)}/mo
          </span>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {recurringList.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No recurring subscriptions identified yet.
          </div>
        ) : (
          recurringList.map(rec => (
            <div
              key={rec.id}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                rec.isRecurring
                  ? 'bg-slate-50/90 dark:bg-slate-850 border-slate-200/80 dark:border-slate-700/70'
                  : 'bg-slate-100/50 dark:bg-slate-900/50 border-slate-200/40 dark:border-slate-800/40 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base shadow-2xs shrink-0"
                  style={{ backgroundColor: `${rec.categoryColor}20` }}
                >
                  {rec.categoryIcon}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {rec.merchant}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    {rec.frequency} • Last paid: {formatDateIndian(rec.lastDate)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                    {formatINR(rec.amount)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    {rec.categoryName}
                  </span>
                </div>

                {/* Toggle button */}
                <button
                  type="button"
                  onClick={() => onToggleRecurring(rec.merchant, !rec.isRecurring)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    rec.isRecurring
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 hover:bg-purple-200'
                      : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                  }`}
                  title={rec.isRecurring ? 'Mark as not recurring' : 'Mark as recurring'}
                >
                  {rec.isRecurring ? 'Recurring' : 'Ignored'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
