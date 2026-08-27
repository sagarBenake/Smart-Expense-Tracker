import React, { useState } from 'react';
import { Calendar, Layers, Clock, ChevronRight } from 'lucide-react';
import { AdvancedSpendingReport, Transaction } from '../../types';
import { formatINR } from '../../utils/formatters';

interface DailyWeeklyReportProps {
  report: AdvancedSpendingReport;
  onSelectDate: (date: string) => void;
}

export const DailyWeeklyReport: React.FC<DailyWeeklyReportProps> = ({
  report,
  onSelectDate,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'daily' | 'weekly'>('daily');

  const dailyList = report.dailySpending || [];
  const weeklyList = report.weeklySpending || [];
  const maxDaily = Math.max(1, ...dailyList.map(d => d.amount));
  const maxWeekly = Math.max(1, ...weeklyList.map(w => w.amount));

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
      {/* Header & Sub Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Daily & Weekly Analysis
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Spending distribution across active time intervals
            </p>
          </div>
        </div>

        <div className="flex p-0.5 rounded-xl bg-slate-100 dark:bg-slate-700/60 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('daily')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeSubTab === 'daily'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setActiveSubTab('weekly')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeSubTab === 'weekly'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      {/* TAB 1: DAILY SPENDING VIEW */}
      {activeSubTab === 'daily' && (
        <div className="space-y-4">
          {dailyList.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No daily expense data in this period.
            </div>
          ) : (
            <>
              {/* Daily Bar Histogram */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-end gap-1 h-36 pb-2 border-b border-slate-100 dark:border-slate-700 overflow-x-auto no-scrollbar">
                  {dailyList.map(item => {
                    const heightPercent = item.amount > 0 ? Math.max(12, Math.round((item.amount / maxDaily) * 100)) : 4;
                    const isPeak = report.highestSpendingDay && report.highestSpendingDay.date === item.date;

                    return (
                      <button
                        key={item.date}
                        type="button"
                        onClick={() => onSelectDate(item.date)}
                        className="flex-1 min-w-[20px] flex flex-col items-center h-full justify-end group cursor-pointer"
                        title={`${item.date}: ${formatINR(item.amount)} (${item.count} txns) - Click to inspect`}
                      >
                        <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-t-sm h-full flex items-end overflow-hidden p-0.5">
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full rounded-t-xs transition-all duration-300 group-hover:brightness-125 ${
                              isPeak
                                ? 'bg-amber-500 ring-2 ring-amber-400/50'
                                : item.amount > 0
                                ? 'bg-indigo-500 dark:bg-indigo-600'
                                : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                          />
                        </div>
                        <span className={`text-[9px] mt-1 font-medium truncate ${
                          isPeak ? 'font-bold text-amber-500' : 'text-slate-400 group-hover:text-slate-900'
                        }`}>
                          {item.day}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 text-center">
                  Tap any day column to filter and inspect transactions for that date
                </p>
              </div>

              {/* Top Daily Spending List */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {dailyList
                  .filter(d => d.amount > 0)
                  .sort((a, b) => b.amount - a.amount)
                  .slice(0, 5)
                  .map(d => (
                    <button
                      key={d.date}
                      onClick={() => onSelectDate(d.date)}
                      className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 border border-slate-200/60 dark:border-slate-700/60 text-xs transition-all text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{d.label}</span>
                        <span className="text-[10px] text-slate-400">({d.count} transactions)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white">{formatINR(d.amount)}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </button>
                  ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: WEEKLY SPENDING VIEW */}
      {activeSubTab === 'weekly' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {weeklyList.map(w => {
              const barPercent = maxWeekly > 0 ? Math.round((w.amount / maxWeekly) * 100) : 0;
              return (
                <div
                  key={w.weekNumber}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {w.label}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {w.startDate} → {w.endDate}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 block">
                        {formatINR(w.amount)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        {w.count} transactions
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${barPercent}%` }}
                      className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
