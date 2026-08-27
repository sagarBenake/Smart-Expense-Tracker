import React, { useState } from 'react';
import { X, Wallet, Check, Tag } from 'lucide-react';
import { Budget, Category } from '../types';
import { formatINR } from '../utils/formatters';

interface BudgetModalProps {
  budget: Budget;
  categories?: Category[];
  onClose: () => void;
  onSave: (overallAmount: number, categoryBudgets: Record<string, number>) => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  budget,
  categories = [],
  onClose,
  onSave,
}) => {
  const catList = categories || [];
  const [overall, setOverall] = useState((budget?.overallAmount || 30000).toString());
  const [catBudgets, setCatBudgets] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    const catBudgetsObj = budget?.categoryBudgets || {};
    catList.forEach(c => {
      if (c) {
        initial[c.id] = (catBudgetsObj[c.id] || c.monthlyBudget || 0).toString();
      }
    });
    return initial;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const overallNum = parseFloat(overall);
    if (isNaN(overallNum) || overallNum <= 0) return;

    const parsedCatBudgets: Record<string, number> = {};
    Object.keys(catBudgets).forEach(cid => {
      const val = parseFloat(catBudgets[cid]);
      if (!isNaN(val) && val > 0) {
        parsedCatBudgets[cid] = val;
      }
    });

    onSave(overallNum, parsedCatBudgets);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Monthly & Category Budgets
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Set spending limits for August 2026
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Overall Monthly Budget */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Total Monthly Budget Limit (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                required
                value={overall}
                onChange={e => setOverall(e.target.value)}
                placeholder="30000"
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          {/* Individual Category Budgets */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Individual Category Limits (₹)
            </label>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {catList.filter(c => c && c.isActive).map(cat => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-base">{cat.icon}</span>
                    <span className="text-xs font-medium text-slate-900 dark:text-white truncate">
                      {cat.name}
                    </span>
                  </div>

                  <div className="w-28 relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={catBudgets[cat.id] || ''}
                      onChange={e => setCatBudgets({ ...catBudgets, [cat.id]: e.target.value })}
                      placeholder="0"
                      className="w-full pl-6 pr-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm"
            >
              Save Budgets
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
