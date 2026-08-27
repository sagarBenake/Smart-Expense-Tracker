export type PaymentMethodType =
  | 'UPI'
  | 'Credit Card'
  | 'Debit Card'
  | 'Cash'
  | 'Bank Transfer'
  | 'Wallet'
  | 'Net Banking'
  | 'Other';

export type TransactionSource = 'sms' | 'manual' | 'import';
export type TransactionType = 'Expense' | 'Credit' | 'Transfer';
export type SyncStatus = 'synced' | 'pending' | 'failed';

export interface Category {
  id: string;
  name: string;
  icon: string; // Emoji or Lucide icon key
  color: string; // Hex color code
  monthlyBudget?: number;
  isDefault: boolean;
  isActive: boolean;
  keywords: string[]; // Keywords for auto-matching SMS
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  merchant: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  paymentMethod: PaymentMethodType;
  transactionType: TransactionType;
  source: TransactionSource;
  bank?: string;
  accountLast4?: string;
  referenceId?: string;
  notes?: string;
  receiptUri?: string;
  isConfirmed: boolean;
  confidenceScore: number; // 0 to 1
  smsHash?: string;
  rawSmsText?: string;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  month: number; // 1-12
  year: number;
  overallAmount: number;
  categoryBudgets: Record<string, number>; // categoryId -> amount
  createdAt: string;
  updatedAt: string;
}

export interface SyncQueueItem {
  id: string;
  transactionId: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  lastAttempt?: string;
  createdAt: string;
  error?: string;
}

export interface GoogleSheetsConfig {
  isConnected: boolean;
  userEmail?: string;
  spreadsheetId?: string;
  spreadsheetName?: string;
  sheetName: string;
  autoSync: boolean;
  lastSyncTime?: string;
}

export interface AppSettings {
  smsDetectionEnabled: boolean;
  autoRecordHighConfidence: boolean;
  confidenceThreshold: number; // e.g. 0.85
  confirmationMode: 'always' | 'uncertain' | 'never';
  monthlyBudget: number;
  currencySymbol: string;
  theme: 'system' | 'light' | 'dark';
  notificationsEnabled: boolean;
  budgetWarning80: boolean;
  budgetWarning100: boolean;
  userName: string;
}

export interface SmsParsedResult {
  amount: number | null;
  merchant: string;
  suggestedCategoryId: string;
  suggestedCategoryName: string;
  suggestedCategoryIcon: string;
  suggestedCategoryColor: string;
  paymentMethod: PaymentMethodType;
  transactionType: TransactionType;
  bank: string;
  accountLast4?: string;
  referenceId?: string;
  confidenceScore: number;
  isDebit: boolean;
  isCredit: boolean;
  isOtpOrSpam: boolean;
  rawSmsHash: string;
  rawText: string;
  extractedKeywords: string[];
  reasons: string[];
}

export interface SpendingReport {
  totalSpending: number;
  totalTransactions: number;
  dailyAverage: number;
  highestSpendingDay: { date: string; amount: number } | null;
  highestCategory: { name: string; amount: number; percentage: number; icon: string; color: string } | null;
  highestMerchant: { merchant: string; amount: number; count: number } | null;
  budgetRemaining: number;
  budgetPercentage: number;
  momChangePercentage: number;
  categoryBreakdown: {
    categoryId: string;
    name: string;
    icon: string;
    color: string;
    amount: number;
    count: number;
    percentage: number;
    budget?: number;
  }[];
  dailySpending: { date: string; day: number; amount: number }[];
  paymentMethodBreakdown: { method: PaymentMethodType; amount: number; percentage: number; count: number }[];
  topMerchants: { merchant: string; amount: number; count: number }[];
  monthlyComparison: { monthName: string; month: number; year: number; amount: number }[];
}

export type ReportDatePreset =
  | 'today'
  | 'this_week'
  | 'this_month'
  | 'last_month'
  | 'last_3_months'
  | 'last_6_months'
  | 'this_year'
  | 'all'
  | 'custom';

export interface ReportFilterModel {
  datePreset: ReportDatePreset;
  fromDate?: string; // YYYY-MM-DD
  toDate?: string; // YYYY-MM-DD
  categoryIds?: string[]; // Empty means all
  categoryScope?: 'all' | 'default' | 'custom';
  merchants?: string[];
  merchantSearch?: string;
  paymentMethods?: PaymentMethodType[];
  transactionType?: 'all' | 'Expense' | 'Credit' | 'Transfer';
  source?: 'all' | 'sms' | 'manual' | 'import';
  minAmount?: number;
  maxAmount?: number;
  includeTransfers?: boolean;
}

export interface SavedReportFilter {
  id: string;
  name: string;
  filter: ReportFilterModel;
  createdAt: string;
}

export interface RecurringExpenseItem {
  id: string;
  merchant: string;
  amount: number;
  frequency: 'Monthly' | 'Weekly' | 'Quarterly' | 'Yearly';
  lastDate: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  isRecurring: boolean;
  count: number;
}

export interface MonthComparisonResult {
  monthA: { label: string; month: number; year: number; total: number; count: number };
  monthB: { label: string; month: number; year: number; total: number; count: number };
  difference: number;
  percentageChange: number;
  isIncreased: boolean;
  categoryComparisons: {
    categoryId: string;
    name: string;
    icon: string;
    color: string;
    amountA: number;
    amountB: number;
    diff: number;
    percentageChange: number;
    isIncreased: boolean;
  }[];
}

export interface AdvancedSpendingReport {
  dateRangeLabel: string;
  fromDate: string;
  toDate: string;
  totalSpending: number;
  totalIncome: number;
  netBalance: number;
  totalTransactions: number;
  averageTransaction: number;
  highestTransaction: { id: string; merchant: string; amount: number; date: string; categoryName: string; categoryIcon: string } | null;
  lowestTransaction: { id: string; merchant: string; amount: number; date: string; categoryName: string; categoryIcon: string } | null;
  dailyAverage: number;
  highestSpendingDay: { date: string; amount: number } | null;
  highestCategory: { name: string; amount: number; percentage: number; icon: string; color: string } | null;
  highestMerchant: { merchant: string; amount: number; count: number } | null;
  budgetRemaining: number;
  budgetPercentage: number;
  previousPeriodSpending: number;
  trendChangePercentage: number; // vs previous equivalent period
  categoryBreakdown: {
    categoryId: string;
    name: string;
    icon: string;
    color: string;
    amount: number;
    count: number;
    percentage: number;
    budget?: number;
    isOverBudget?: boolean;
  }[];
  dailySpending: { date: string; day: number; label: string; amount: number; count: number }[];
  weeklySpending: { weekNumber: number; label: string; startDate: string; endDate: string; amount: number; count: number }[];
  paymentMethodBreakdown: { method: PaymentMethodType; amount: number; percentage: number; count: number }[];
  topMerchants: { merchant: string; amount: number; count: number; average: number }[];
  dayOfWeekSpending: { dayName: string; shortName: string; dayIndex: number; amount: number; count: number; percentage: number }[];
  weekendSpending: number;
  weekdaySpending: number;
  weekendVsWeekdayPctDiff: number;
  monthlyComparison: { monthName: string; month: number; year: number; amount: number }[];
  recurringExpenses: RecurringExpenseItem[];
  unusualExpenses: { id: string; merchant: string; amount: number; date: string; reason: string; usualAmount?: number }[];
  insights: string[];
  filteredTransactions: Transaction[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'expense' | 'budget_warning' | 'sync' | 'sms_detected' | 'info';
  timestamp: string;
  read: boolean;
  transactionId?: string;
}
