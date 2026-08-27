import React from 'react';
import { 
  CalendarDays, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  Lightbulb, 
  Coffee,
  CheckCircle2
} from 'lucide-react';
import { AdvancedSpendingReport } from '../../types';
import { formatINR } from '../../utils/formatters';

interface HabitsAnalyticsCardProps {
  report: AdvancedSpendingReport;
}

export const HabitsAnalyticsCard: React.FC<HabitsAnalyticsCardProps> = ({ report }) => {
  const dayOfWeekList = report.dayOfWeekSpending || [];
  const maxDaySpend = Math.max(1, ...dayOfWeekList.map(d => d.amount));

  return (
    <div className="space-y-4">
      {/* 1. Day of Week & Weekend vs Weekday Box */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Spending by Day of Week
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Identify weekly spending velocity patterns
              </p>
            </div>
          </div>
        </div>

        {/* Day of Week Bar Chart (Mon to Sun) */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 items-end h-32 pb-2 border-b border-slate-100 dark:border-slate-700">
          {dayOfWeekList.map(d => {
            const heightPercent = d.amount > 0 ? Math.max(12, Math.round((d.amount / maxDaySpend) * 100)) : 6;
            const isWeekend = d.dayIndex === 0 || d.dayIndex === 6;

            return (
              <div
                key={d.dayName}
                className="flex flex-col items-center h-full justify-end group"
                title={`${d.dayName}: ${formatINR(d.amount)} (${d.count} txns)`}
              >
                <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-t-lg h-full flex items-end overflow-hidden p-0.5">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-md transition-all duration-500 group-hover:brightness-115 ${
                      isWeekend
                        ? 'bg-amber-500 dark:bg-amber-600'
                        : 'bg-teal-500 dark:bg-teal-600'
                    }`}
                  />
                </div>
                <span className={`text-[10px] mt-1.5 font-semibold ${isWeekend ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {d.shortName}
                </span>
              </div>
            );
          })}
        </div>

        {/* Weekend vs Weekday Metric Comparison (Section 14) */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700/70">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Weekday Spending (Mon–Fri)
            </span>
            <span className="text-base font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">
              {formatINR(report.weekdaySpending)}
            </span>
            <span className="text-[10px] text-slate-500">
              Avg {formatINR(Math.round(report.weekdaySpending / 5))}/day
            </span>
          </div>

          <div>
            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider block">
              Weekend Spending (Sat–Sun)
            </span>
            <span className="text-base font-extrabold text-amber-600 dark:text-amber-400 mt-0.5 block">
              {formatINR(report.weekendSpending)}
            </span>
            <span className="text-[10px] text-amber-600/80 font-semibold">
              {report.weekendVsWeekdayPctDiff > 0 ? `+${report.weekendVsWeekdayPctDiff}% vs weekdays` : 'Balanced'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Unusual Spending Detection (Section 22) */}
      {report.unusualExpenses && report.unusualExpenses.length > 0 && (
        <div className="bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl p-4 sm:p-5 border border-amber-200 dark:border-amber-800/60 space-y-3">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="font-bold text-sm">
              Unusual Spending Observations
            </h3>
          </div>
          <div className="space-y-2">
            {report.unusualExpenses.map(u => (
              <div
                key={u.id}
                className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-amber-200/80 dark:border-amber-800/40 text-xs flex items-start gap-2.5 shadow-2xs"
              >
                <div className="p-1 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {u.merchant} • {formatINR(u.amount)}
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    {u.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Smart Data-Driven Insights (Section 35) */}
      {report.insights && report.insights.length > 0 && (
        <div className="bg-indigo-50/60 dark:bg-indigo-950/30 rounded-2xl p-4 sm:p-5 border border-indigo-200/80 dark:border-indigo-800/60 space-y-3">
          <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <h3 className="font-bold text-sm">
              Smart Financial Insights
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {report.insights.map((insight, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-2.5 text-xs shadow-2xs"
              >
                <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {insight}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
