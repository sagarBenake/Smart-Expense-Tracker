import React from 'react';
import { Home, Receipt, BarChart3, Settings, Plus } from 'lucide-react';

export type NavTab = 'home' | 'dashboard' | 'transactions' | 'reports' | 'settings';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab?: (tab: any) => void;
  onTabChange?: (tab: any) => void;
  onOpenAddExpense: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onTabChange,
  onOpenAddExpense,
}) => {
  const handleTabClick = (tab: any) => {
    if (onTabChange) onTabChange(tab);
    if (onSelectTab) onSelectTab(tab);
  };

  const isHomeActive = activeTab === 'home' || activeTab === 'dashboard';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-xl">
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between relative">
        {/* Home / Dashboard */}
        <button
          onClick={() => handleTabClick(activeTab === 'home' ? 'home' : 'dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            isHomeActive
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <div
            className={`p-1 rounded-full transition-all ${
              isHomeActive ? 'bg-indigo-50 dark:bg-indigo-950/60' : ''
            }`}
          >
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5">Home</span>
        </button>

        {/* Transactions */}
        <button
          onClick={() => handleTabClick('transactions')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'transactions'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <div
            className={`p-1 rounded-full transition-all ${
              activeTab === 'transactions' ? 'bg-indigo-50 dark:bg-indigo-950/60' : ''
            }`}
          >
            <Receipt className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5">Transactions</span>
        </button>

        {/* Central Floating Action Button */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            onClick={onOpenAddExpense}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-900 border-2 border-white dark:border-slate-900"
            aria-label="Add Expense"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Reports */}
        <button
          onClick={() => handleTabClick('reports')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'reports'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <div
            className={`p-1 rounded-full transition-all ${
              activeTab === 'reports' ? 'bg-indigo-50 dark:bg-indigo-950/60' : ''
            }`}
          >
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5">Reports</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => handleTabClick('settings')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'settings'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <div
            className={`p-1 rounded-full transition-all ${
              activeTab === 'settings' ? 'bg-indigo-50 dark:bg-indigo-950/60' : ''
            }`}
          >
            <Settings className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5">Settings</span>
        </button>
      </div>
    </nav>
  );
};
