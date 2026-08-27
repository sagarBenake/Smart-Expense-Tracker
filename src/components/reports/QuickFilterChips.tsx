import React from 'react';
import { Calendar, Clock, SlidersHorizontal, Sparkles } from 'lucide-react';
import { ReportDatePreset } from '../../types';

interface QuickFilterChipsProps {
  activePreset: ReportDatePreset;
  onSelectPreset: (preset: ReportDatePreset) => void;
  onOpenCustomDateModal: () => void;
}

export const QuickFilterChips: React.FC<QuickFilterChipsProps> = ({
  activePreset,
  onSelectPreset,
  onOpenCustomDateModal,
}) => {
  const presets: { id: ReportDatePreset; label: string; icon?: React.ReactNode }[] = [
    { id: 'this_month', label: 'This Month' },
    { id: 'today', label: 'Today' },
    { id: 'this_week', label: 'This Week' },
    { id: 'last_month', label: 'Last Month' },
    { id: 'last_3_months', label: 'Last 3 Months' },
    { id: 'last_6_months', label: 'Last 6 Months' },
    { id: 'this_year', label: 'This Year' },
    { id: 'all', label: 'All Expenses' },
    { id: 'custom', label: 'Custom Date Range', icon: <SlidersHorizontal className="w-3 h-3" /> },
  ];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
        <span>Quick Date Filter</span>
        {activePreset === 'custom' && (
          <button
            onClick={onOpenCustomDateModal}
            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-bold"
          >
            <Calendar className="w-3 h-3" />
            Edit Date Range
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {presets.map(item => {
          const isActive = activePreset === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'custom') {
                  onSelectPreset('custom');
                  onOpenCustomDateModal();
                } else {
                  onSelectPreset(item.id);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 scale-[1.02]'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
