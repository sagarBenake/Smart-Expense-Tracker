import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard, 
  Store, 
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  Filter,
  Download,
  Share2,
  SlidersHorizontal,
  Bookmark,
  Layers,
  Repeat,
  Scale,
  RefreshCw,
  Search
} from 'lucide-react';
import { 
  AdvancedSpendingReport, 
  Budget, 
  Category, 
  PaymentMethodType, 
  ReportDatePreset, 
  ReportFilterModel, 
  SavedReportFilter, 
  SpendingReport, 
  Transaction 
} from '../types';
import { generateAdvancedReport, filterTransactionsByModel, DEFAULT_REPORT_FILTER } from '../services/reportEngine';
import { storageService } from '../services/storageService';
import { formatDateIndian, formatINR } from '../utils/formatters';

// Specialized Report Sub-Components
import { ReportSummaryCard } from './reports/ReportSummaryCard';
import { QuickFilterChips } from './reports/QuickFilterChips';
import { CustomDateRangeModal } from './reports/CustomDateRangeModal';
import { ReportFilterDrawer } from './reports/ReportFilterDrawer';
import { MonthWiseReport } from './reports/MonthWiseReport';
import { MonthComparisonCard } from './reports/MonthComparisonCard';
import { CategoryReport } from './reports/CategoryReport';
import { CategoryTrendChart } from './reports/CategoryTrendChart';
import { DailyWeeklyReport } from './reports/DailyWeeklyReport';
import { PaymentMethodReport } from './reports/PaymentMethodReport';
import { MerchantReport } from './reports/MerchantReport';
import { TopExpensesCard } from './reports/TopExpensesCard';
import { HabitsAnalyticsCard } from './reports/HabitsAnalyticsCard';
import { BudgetActualReport } from './reports/BudgetActualReport';
import { IncomeVsExpenseReport } from './reports/IncomeVsExpenseReport';
import { RecurringSubscriptionsReport } from './reports/RecurringSubscriptionsReport';
import { ReportTransactionTable } from './reports/ReportTransactionTable';
import { ExportShareModal } from './reports/ExportShareModal';

interface ReportsViewProps {
  report?: SpendingReport;
  monthlyBudget?: number;
  transactions: Transaction[];
  categories?: Category[];
  budget?: Budget;
  onOpenTransactionDetails: (tx: Transaction) => void;
  onOpenBudgetModal?: () => void;
}

export type ReportTabType = 
  | 'overview' 
  | 'categories' 
  | 'monthly' 
  | 'daily_weekly' 
  | 'merchants' 
  | 'payment_methods' 
  | 'budget' 
  | 'recurring' 
  | 'income_expense';

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions = [],
  categories = [],
  budget,
  onOpenTransactionDetails,
  onOpenBudgetModal,
}) => {
  // Current Filter State
  const [filter, setFilter] = useState<ReportFilterModel>(DEFAULT_REPORT_FILTER);
  const [activeTab, setActiveTab] = useState<ReportTabType>('overview');

  // Modals & Drawers state
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
  const [isExportShareOpen, setIsExportShareOpen] = useState(false);

  // Saved Filters
  const [savedFilters, setSavedFilters] = useState<SavedReportFilter[]>(() => storageService.getSavedReportFilters());

  // Safe Fallback Categories and Budget
  const activeCategories = useMemo(() => {
    return categories.length > 0 ? categories : storageService.getCategories();
  }, [categories]);

  const activeBudget = useMemo(() => {
    return budget || storageService.getBudget();
  }, [budget]);

  // Compute Advanced Report dynamically based on active filter model
  const advancedReport: AdvancedSpendingReport = useMemo(() => {
    return generateAdvancedReport(transactions, activeCategories, activeBudget, filter, storageService.getRecurringRules());
  }, [transactions, activeCategories, activeBudget, filter]);

  // Filtered transactions for the report table & exports
  const filteredTransactions = useMemo(() => {
    const res = filterTransactionsByModel(transactions, activeCategories, filter);
    return res.filtered;
  }, [transactions, activeCategories, filter]);

  // Handle Preset Selection (This Month, Last Month, Last 3 Months, This Year, All, etc.)
  const handleSelectPreset = (preset: ReportDatePreset) => {
    setFilter(prev => ({
      ...prev,
      datePreset: preset,
    }));
  };

  // Handle Custom Date Range Apply
  const handleApplyCustomDates = (fromDate: string, toDate: string) => {
    setFilter(prev => ({
      ...prev,
      datePreset: 'custom',
      fromDate: fromDate,
      toDate: toDate,
    }));
  };

  // Save Filter preset
  const handleSaveCurrentFilter = (name: string, filterToSave: ReportFilterModel) => {
    storageService.saveReportFilter(name, filterToSave);
    setSavedFilters(storageService.getSavedReportFilters());
  };

  // Delete Saved Filter
  const handleDeleteSavedFilter = (id: string) => {
    storageService.deleteSavedReportFilter(id);
    setSavedFilters(storageService.getSavedReportFilters());
  };

  // Reset Filters
  const handleResetFilter = () => {
    setFilter(DEFAULT_REPORT_FILTER);
  };

  // Toggle Recurring Status override for a merchant
  const handleToggleRecurringMerchant = (merchant: string, isRecurring: boolean) => {
    storageService.toggleRecurringMerchant(merchant, isRecurring);
    // Trigger recalculation by updating filter state reference
    setFilter(prev => ({ ...prev }));
  };

  // Category drilldown from Category Report
  const handleCategoryDrilldown = (categoryId: string) => {
    setFilter(prev => ({
      ...prev,
      categoryIds: [categoryId],
    }));
    setActiveTab('overview');
  };

  // Merchant drilldown from Merchant Report
  const handleMerchantDrilldown = (merchant: string) => {
    setFilter(prev => ({
      ...prev,
      merchantSearch: merchant,
    }));
    setActiveTab('overview');
  };

  // Payment Method drilldown
  const handlePaymentMethodDrilldown = (pm: PaymentMethodType) => {
    setFilter(prev => ({
      ...prev,
      paymentMethods: [pm],
    }));
    setActiveTab('overview');
  };

  // Month drilldown from Month-wise report
  const handleMonthDrilldown = (year: number, month: number) => {
    const padM = String(month).padStart(2, '0');
    const lastDay = new Date(year, month, 0).getDate();
    setFilter(prev => ({
      ...prev,
      datePreset: 'custom',
      fromDate: `${year}-${padM}-01`,
      toDate: `${year}-${padM}-${String(lastDay).padStart(2, '0')}`,
    }));
    setActiveTab('overview');
  };

  // Specific Date drilldown from Daily report
  const handleDateDrilldown = (dateStr: string) => {
    setFilter(prev => ({
      ...prev,
      datePreset: 'custom',
      fromDate: dateStr,
      toDate: dateStr,
    }));
    setActiveTab('overview');
  };

  const hasActiveFilters = 
    filter.datePreset !== 'this_month' || 
    (filter.categoryIds && filter.categoryIds.length > 0) || 
    (filter.paymentMethods && filter.paymentMethods.length > 0) ||
    !!filter.merchantSearch ||
    filter.minAmount !== undefined ||
    filter.maxAmount !== undefined ||
    filter.transactionType !== 'Expense' ||
    filter.source !== 'all' ||
    filter.includeTransfers;

  return (
    <div className="space-y-4 pb-24 animate-fadeIn">
      {/* 1. TOP HEADER & MAIN ACTION BUTTONS */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Expense Reports
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {advancedReport.dateRangeLabel} • {advancedReport.totalTransactions} transactions analyzed
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              hasActiveFilters
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-indigo-600 shrink-0" />
            )}
          </button>

          <button
            onClick={() => setIsExportShareOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            <span>Export & Share</span>
          </button>
        </div>
      </div>

      {/* 2. QUICK DATE FILTERS (Section 1) */}
      <QuickFilterChips
        activePreset={filter.datePreset}
        onSelectPreset={handleSelectPreset}
        onOpenCustomDateModal={() => setIsCustomDateOpen(true)}
      />

      {/* 3. REPORT MODULE NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        {[
          { id: 'overview', label: 'Summary Overview', icon: <BarChart3 className="w-3.5 h-3.5" /> },
          { id: 'categories', label: 'Categories', icon: <PieChart className="w-3.5 h-3.5" /> },
          { id: 'monthly', label: 'Monthly & MoM', icon: <TrendingUp className="w-3.5 h-3.5" /> },
          { id: 'daily_weekly', label: 'Daily & Weekly', icon: <Calendar className="w-3.5 h-3.5" /> },
          { id: 'merchants', label: 'Merchants & Top', icon: <Store className="w-3.5 h-3.5" /> },
          { id: 'payment_methods', label: 'Payment Mode', icon: <CreditCard className="w-3.5 h-3.5" /> },
          { id: 'budget', label: 'Budget vs Actual', icon: <Wallet className="w-3.5 h-3.5" /> },
          { id: 'recurring', label: 'Subscriptions', icon: <Repeat className="w-3.5 h-3.5" /> },
          { id: 'income_expense', label: 'Cash Flow', icon: <Scale className="w-3.5 h-3.5" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ReportTabType)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-xs scale-[1.01]'
                : 'bg-white dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/70 hover:bg-slate-50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 4. ACTIVE FILTER CHIP PILL (If any special filter applied) */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 text-xs">
          <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 flex-wrap">
            <span className="font-bold">Active Scope:</span>
            {filter.datePreset === 'custom' && (
              <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 font-medium">
                {filter.fromDate} to {filter.toDate}
              </span>
            )}
            {filter.merchantSearch && (
              <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 font-medium">
                Merchant: {filter.merchantSearch}
              </span>
            )}
            {filter.categoryIds && filter.categoryIds.length > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 font-medium">
                {filter.categoryIds.length} categories
              </span>
            )}
            {filter.paymentMethods && filter.paymentMethods.length > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 font-medium">
                {filter.paymentMethods.join(', ')}
              </span>
            )}
          </div>

          <button
            onClick={handleResetFilter}
            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 ml-2"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* 5. ACTIVE TAB CONTENT RENDERING */}

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <ReportSummaryCard report={advancedReport} />
          <HabitsAnalyticsCard report={advancedReport} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CategoryReport
              report={advancedReport}
              categories={activeCategories}
              onSelectCategory={handleCategoryDrilldown}
            />
            <TopExpensesCard
              transactions={filteredTransactions}
              onOpenTransactionDetails={onOpenTransactionDetails}
            />
          </div>
          <ReportTransactionTable
            transactions={filteredTransactions}
            onOpenTransactionDetails={onOpenTransactionDetails}
          />
        </div>
      )}

      {/* TAB: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <CategoryReport
            report={advancedReport}
            categories={activeCategories}
            onSelectCategory={handleCategoryDrilldown}
          />
          <CategoryTrendChart
            transactions={transactions}
            categories={activeCategories}
            initialCategoryId={filter.categoryIds?.[0] || 'cat_food'}
          />
          <ReportTransactionTable
            transactions={filteredTransactions}
            onOpenTransactionDetails={onOpenTransactionDetails}
          />
        </div>
      )}

      {/* TAB: MONTHLY & MOM */}
      {activeTab === 'monthly' && (
        <div className="space-y-4">
          <MonthWiseReport
            transactions={transactions}
            onSelectMonth={handleMonthDrilldown}
          />
          <MonthComparisonCard
            transactions={transactions}
            categories={activeCategories}
          />
        </div>
      )}

      {/* TAB: DAILY & WEEKLY */}
      {activeTab === 'daily_weekly' && (
        <div className="space-y-4">
          <DailyWeeklyReport
            report={advancedReport}
            onSelectDate={handleDateDrilldown}
          />
          <HabitsAnalyticsCard report={advancedReport} />
          <ReportTransactionTable
            transactions={filteredTransactions}
            onOpenTransactionDetails={onOpenTransactionDetails}
          />
        </div>
      )}

      {/* TAB: MERCHANTS */}
      {activeTab === 'merchants' && (
        <div className="space-y-4">
          <MerchantReport
            report={advancedReport}
            onSelectMerchant={handleMerchantDrilldown}
          />
          <TopExpensesCard
            transactions={filteredTransactions}
            onOpenTransactionDetails={onOpenTransactionDetails}
          />
          <ReportTransactionTable
            transactions={filteredTransactions}
            onOpenTransactionDetails={onOpenTransactionDetails}
          />
        </div>
      )}

      {/* TAB: PAYMENT METHODS */}
      {activeTab === 'payment_methods' && (
        <div className="space-y-4">
          <PaymentMethodReport
            report={advancedReport}
            onSelectPaymentMethod={handlePaymentMethodDrilldown}
          />
          <ReportTransactionTable
            transactions={filteredTransactions}
            onOpenTransactionDetails={onOpenTransactionDetails}
          />
        </div>
      )}

      {/* TAB: BUDGET VS ACTUAL */}
      {activeTab === 'budget' && (
        <div className="space-y-4">
          <BudgetActualReport
            report={advancedReport}
            budget={activeBudget}
            categories={activeCategories}
            onOpenBudgetSettings={onOpenBudgetModal}
          />
        </div>
      )}

      {/* TAB: SUBSCRIPTIONS & RECURRING */}
      {activeTab === 'recurring' && (
        <div className="space-y-4">
          <RecurringSubscriptionsReport
            report={advancedReport}
            onToggleRecurring={handleToggleRecurringMerchant}
          />
        </div>
      )}

      {/* TAB: CASH FLOW (INCOME VS EXPENSE) */}
      {activeTab === 'income_expense' && (
        <div className="space-y-4">
          <IncomeVsExpenseReport report={advancedReport} />
          <ReportTransactionTable
            transactions={filteredTransactions}
            onOpenTransactionDetails={onOpenTransactionDetails}
          />
        </div>
      )}

      {/* MODAL: CUSTOM DATE RANGE SELECTOR */}
      {isCustomDateOpen && (
        <CustomDateRangeModal
          initialFromDate={filter.fromDate || '2026-08-01'}
          initialToDate={filter.toDate || '2026-08-27'}
          onClose={() => setIsCustomDateOpen(false)}
          onApply={handleApplyCustomDates}
        />
      )}

      {/* DRAWER: ADVANCED REPORT FILTER PANEL */}
      {isFilterDrawerOpen && (
        <ReportFilterDrawer
          filter={filter}
          categories={activeCategories}
          merchants={advancedReport.topMerchants.map(m => m.merchant)}
          savedFilters={savedFilters}
          onClose={() => setIsFilterDrawerOpen(false)}
          onApplyFilter={(newFilter) => setFilter(newFilter)}
          onResetFilter={handleResetFilter}
          onSaveCurrentFilter={handleSaveCurrentFilter}
          onDeleteSavedFilter={handleDeleteSavedFilter}
        />
      )}

      {/* MODAL: EXPORT & SHARE */}
      {isExportShareOpen && (
        <ExportShareModal
          report={advancedReport}
          transactions={filteredTransactions}
          onClose={() => setIsExportShareOpen(false)}
        />
      )}
    </div>
  );
};
