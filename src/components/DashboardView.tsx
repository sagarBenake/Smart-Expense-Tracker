import React from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  ArrowUpRight, 
  ChevronRight, 
  Wallet, 
  Plus, 
  MessageSquareText, 
  BarChart3, 
  SlidersHorizontal,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Category, SpendingReport, Transaction } from '../types';
import { formatDateIndian, formatINR, formatTime12H, getGreeting } from '../utils/formatters';

interface DashboardViewProps {
  userName?: string;
  report: SpendingReport;
  monthlyBudget?: number;
  recentTransactions?: Transaction[];
  categories?: Category[];
  onNavigateToTab?: (tab: any) => void;
  onViewAllTransactions?: () => void;
  onOpenAddExpense: () => void;
  onOpenSmsSimulator: () => void;
  onOpenCodeInspector?: () => void;
  onOpenTransactionDetails: (tx: Transaction) => void;
  onOpenBudgetModal?: () => void;
  onTriggerSync?: () => void;
  isSyncing?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userName = 'Rohini',
  report,
  monthlyBudget = 30000,
  recentTransactions = [],
  categories: _categories = [],
  onNavigateToTab,
  onViewAllTransactions,
  onOpenAddExpense,
  onOpenSmsSimulator,
  onOpenCodeInspector: _onOpenCodeInspector,
  onOpenTransactionDetails,
  onOpenBudgetModal,
  onTriggerSync: _onTriggerSync,
  isSyncing: _isSyncing = false,
}) => {
  const greeting = getGreeting(userName);
  const now = new Date();
  const currentMonthName = 'August 2026';

  const txList = recentTransactions || [];

  // Calculate today's and this week's spending
  const todayStr = '2026-08-27'; // matching current local simulated date
  const todaySpend = txList
    .filter(t => t && t.date === todayStr && t.transactionType === 'Expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const thisWeekSpend = txList
    .filter(t => t && t.date >= '2026-08-21' && t.date <= '2026-08-27' && t.transactionType === 'Expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  // Dynamic Smart Insights generated from actual transaction data
  const dynamicInsights: string[] = [];
  if (report?.paymentMethodBreakdown && report.paymentMethodBreakdown.length > 0) {
    const topMethod = report.paymentMethodBreakdown[0];
    dynamicInsights.push(`${topMethod.method} accounts for ${topMethod.percentage}% of your spending.`);
  }
  if (report?.highestCategory) {
    dynamicInsights.push(`${report.highestCategory.name} is your highest spending category (${formatINR(report.highestCategory.amount)}).`);
  }
  if (report?.budgetRemaining !== undefined) {
    if (report.budgetRemaining > 0) {
      dynamicInsights.push(`You have ${formatINR(report.budgetRemaining)} remaining from your monthly budget.`);
    } else {
      dynamicInsights.push(`You have reached 100% of your monthly budget.`);
    }
  }
  if (report?.momChangePercentage && report.momChangePercentage !== 0) {
    const dir = report.momChangePercentage > 0 ? 'more' : 'less';
    dynamicInsights.push(`You spent ${Math.abs(report.momChangePercentage)}% ${dir} this month compared to July.`);
  }

  // Budget progress bar status color
  const budgetPercentage = report?.budgetPercentage || 0;
  const isBudgetWarning80 = budgetPercentage >= 80 && budgetPercentage < 100;
  const isBudgetExceeded = budgetPercentage >= 100;

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Greeting Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {greeting}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span>{currentMonthName} Overview</span>
          </p>
        </div>

        <button
          onClick={onOpenBudgetModal}
          className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 px-3 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-800 transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Set Budget</span>
        </button>
      </div>

      {/* Main Monthly Spending Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white p-5 sm:p-6 shadow-xl border border-indigo-800/40">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 rounded-full bg-purple-500/10 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              Monthly Spending
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
              {currentMonthName}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
                {formatINR(report.totalSpending)}
              </div>
              <div className="flex items-center gap-1 text-xs text-indigo-200 mt-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>{report.totalTransactions} recorded transactions</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Daily Average</span>
              <span className="text-sm sm:text-base font-bold text-slate-200">
                {formatINR(report.dailyAverage)}
              </span>
            </div>
          </div>

          {/* Mini Stats Grid */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-indigo-800/40 text-xs">
            <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/50">
              <span className="text-slate-400 text-[11px] block">Today&apos;s Spending</span>
              <span className="text-sm font-bold text-white mt-0.5 block">
                {formatINR(todaySpend)}
              </span>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/50">
              <span className="text-slate-400 text-[11px] block">This Week&apos;s Spending</span>
              <span className="text-sm font-bold text-white mt-0.5 block">
                {formatINR(thisWeekSpend)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Budget Summary Card */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Monthly Budget</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Limit: {formatINR(monthlyBudget)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                isBudgetExceeded
                  ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                  : isBudgetWarning80
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                  : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              {report.budgetPercentage}% Spent
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-700/80 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isBudgetExceeded
                  ? 'bg-gradient-to-r from-rose-500 to-red-600'
                  : isBudgetWarning80
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500'
              }`}
              style={{ width: `${Math.min(100, report.budgetPercentage)}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-slate-600 dark:text-slate-300">
              Spent: <strong className="text-slate-900 dark:text-white">{formatINR(report.totalSpending)}</strong>
            </span>
            <span className="text-slate-600 dark:text-slate-300">
              Remaining: <strong className="text-emerald-600 dark:text-emerald-400">{formatINR(report.budgetRemaining)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={onOpenAddExpense}
          className="flex items-center gap-2 p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-all shadow-sm shadow-indigo-600/20 active:scale-95 text-left"
        >
          <div className="p-1.5 rounded-lg bg-white/20">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <span className="block font-semibold">Add Expense</span>
            <span className="text-[10px] text-indigo-100">Manual Entry</span>
          </div>
        </button>

        <button
          onClick={onOpenSmsSimulator}
          className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-white font-medium text-xs transition-all border border-slate-200 dark:border-slate-700 active:scale-95 text-left"
        >
          <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <MessageSquareText className="w-4 h-4" />
          </div>
          <div>
            <span className="block font-semibold">Test SMS</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Auto Parser</span>
          </div>
        </button>

        <button
          onClick={() => onNavigateToTab('reports')}
          className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-white font-medium text-xs transition-all border border-slate-200 dark:border-slate-700 active:scale-95 text-left"
        >
          <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <span className="block font-semibold">Reports</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Charts & Trends</span>
          </div>
        </button>

        <button
          onClick={() => onNavigateToTab('transactions')}
          className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-white font-medium text-xs transition-all border border-slate-200 dark:border-slate-700 active:scale-95 text-left"
        >
          <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="block font-semibold">All Txns</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Search & Filter</span>
          </div>
        </button>
      </div>

      {/* Smart Financial Insights (Section 42) */}
      <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 dark:from-amber-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 rounded-2xl p-4 border border-amber-500/20 dark:border-amber-500/30 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Smart Spending Insights</span>
        </div>
        <div className="space-y-1.5">
          {dynamicInsights.map((insight, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
              <span className="text-amber-500 font-bold">•</span>
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dashboard Top Categories Summary (Section 6) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Top Categories
          </h3>
          <button
            onClick={() => onNavigateToTab('reports')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {report.categoryBreakdown.slice(0, 4).map(cat => (
            <div
              key={cat.categoryId}
              className="bg-white dark:bg-slate-800/90 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-xs"
                  style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                >
                  {cat.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {cat.name}
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {cat.count} transaction{cat.count > 1 ? 's' : ''} • {cat.percentage}%
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                  {formatINR(cat.amount)}
                </span>
                {cat.budget && (
                  <span className="text-[10px] text-slate-400">
                    Budget: {formatINR(cat.budget)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions (Section 7) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Recent Transactions
          </h3>
          <button
            onClick={() => onNavigateToTab('transactions')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
          >
            <span>See History</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/60 divide-y divide-slate-100 dark:divide-slate-700/50 shadow-xs overflow-hidden">
          {recentTransactions.slice(0, 5).map(tx => (
            <div
              key={tx.id}
              onClick={() => onOpenTransactionDetails(tx)}
              className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${tx.categoryColor}20` }}
                >
                  {tx.categoryIcon}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {tx.merchant}
                    </h4>
                    {/* Auto-detected vs Manual Badge */}
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                        tx.source === 'sms'
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {tx.source === 'sms' ? 'Auto detected' : 'Manual'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>{tx.categoryName}</span>
                    <span>•</span>
                    <span>{formatDateIndian(tx.date)}, {formatTime12H(tx.time)}</span>
                    <span>•</span>
                    <span className="font-medium text-slate-600 dark:text-slate-300">{tx.paymentMethod}</span>
                  </div>
                </div>
              </div>

              <div className="text-right flex items-center gap-2">
                <div>
                  <span className="font-bold text-xs sm:text-sm text-rose-600 dark:text-rose-400 block">
                    -{formatINR(tx.amount)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {tx.bank || 'Expense'}
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
