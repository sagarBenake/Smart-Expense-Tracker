import React, { useState } from 'react';
import { X, Calendar, AlertCircle, Check } from 'lucide-react';

interface CustomDateRangeModalProps {
  initialFromDate: string;
  initialToDate: string;
  onClose: () => void;
  onApply: (fromDate: string, toDate: string) => void;
}

export const CustomDateRangeModal: React.FC<CustomDateRangeModalProps> = ({
  initialFromDate,
  initialToDate,
  onClose,
  onApply,
}) => {
  const [fromDate, setFromDate] = useState(initialFromDate || '2026-08-01');
  const [toDate, setToDate] = useState(initialToDate || '2026-08-27');
  const [error, setError] = useState<string | null>(null);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate) {
      setError('Please select both From and To dates.');
      return;
    }
    if (fromDate > toDate) {
      setError('Please select a valid date range. (From Date must be before or equal to To Date)');
      return;
    }
    setError(null);
    onApply(fromDate, toDate);
    onClose();
  };

  const setPreset = (from: string, to: string) => {
    setFromDate(from);
    setToDate(to);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Custom Date Range
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Filter inclusive transactions between dates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick presets inside modal */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Quick Selection
          </span>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setPreset('2026-08-01', '2026-08-27')}
              className="py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 font-medium transition-all text-center truncate"
            >
              1 Aug → 27 Aug
            </button>
            <button
              type="button"
              onClick={() => setPreset('2026-07-01', '2026-07-31')}
              className="py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 font-medium transition-all text-center truncate"
            >
              Full July 2026
            </button>
            <button
              type="button"
              onClick={() => setPreset('2026-06-01', '2026-08-27')}
              className="py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 font-medium transition-all text-center truncate"
            >
              Last 90 Days
            </button>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleApply} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                From Date:
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={e => {
                  setFromDate(e.target.value);
                  setError(null);
                }}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                To Date:
              </label>
              <input
                type="date"
                value={toDate}
                onChange={e => {
                  setToDate(e.target.value);
                  setError(null);
                }}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block">
              Inclusive Range Guarantee:
            </span>
            <p>
              Includes all expenses starting from {fromDate} 00:00 through {toDate} 23:59.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Generate Report</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
