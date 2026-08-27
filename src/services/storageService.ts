import { 
  AppSettings, 
  Budget, 
  Category, 
  GoogleSheetsConfig, 
  NotificationItem, 
  SpendingReport, 
  SyncQueueItem, 
  Transaction,
  ReportFilterModel,
  SavedReportFilter,
  AdvancedSpendingReport,
  MonthComparisonResult
} from '../types';
import { DEFAULT_CATEGORIES } from '../data/defaultCategories';
import { 
  generateAdvancedReport, 
  compareTwoMonths, 
  getCategoryMonthlyTrend 
} from './reportEngine';

const STORAGE_KEYS = {
  TRANSACTIONS: 'smart_expense_transactions_v1',
  CATEGORIES: 'smart_expense_categories_v1',
  BUDGET: 'smart_expense_budget_v1',
  SYNC_QUEUE: 'smart_expense_sync_queue_v1',
  SHEETS_CONFIG: 'smart_expense_sheets_config_v1',
  SETTINGS: 'smart_expense_settings_v1',
  NOTIFICATIONS: 'smart_expense_notifications_v1',
  SAVED_FILTERS: 'smart_expense_saved_filters_v1',
  RECURRING_RULES: 'smart_expense_recurring_rules_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  smsDetectionEnabled: true,
  autoRecordHighConfidence: true,
  confidenceThreshold: 0.85,
  confirmationMode: 'uncertain',
  monthlyBudget: 30000,
  currencySymbol: '₹',
  theme: 'system',
  notificationsEnabled: true,
  budgetWarning80: true,
  budgetWarning100: true,
  userName: 'Rohini',
};

const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-20260827-001',
    amount: 420,
    merchant: 'Swiggy',
    categoryId: 'cat_food',
    categoryName: 'Food & Dining',
    categoryIcon: '🍔',
    categoryColor: '#F97316',
    date: '2026-08-27',
    time: '14:30',
    paymentMethod: 'UPI',
    transactionType: 'Expense',
    source: 'sms',
    bank: 'HDFC Bank',
    accountLast4: '1234',
    referenceId: 'UPI329482910',
    notes: 'Lunch with team',
    isConfirmed: true,
    confidenceScore: 0.96,
    smsHash: 'hash_swiggy_420',
    rawSmsText: 'UPI transaction of INR 420.00 paid to SWIGGY. Ref UPI329482910 from HDFC Bank A/C XX1234 on 27-Aug-2026.',
    syncStatus: 'synced',
    createdAt: '2026-08-27T14:30:00.000Z',
    updatedAt: '2026-08-27T14:30:00.000Z',
  },
  {
    id: 'TXN-20260827-002',
    amount: 1299,
    merchant: 'Amazon',
    categoryId: 'cat_shopping',
    categoryName: 'Shopping',
    categoryIcon: '🛍️',
    categoryColor: '#8B5CF6',
    date: '2026-08-27',
    time: '11:20',
    paymentMethod: 'Credit Card',
    transactionType: 'Expense',
    source: 'sms',
    bank: 'HDFC Bank',
    accountLast4: '8821',
    referenceId: 'HDFC882199',
    notes: 'Wireless Earbuds',
    isConfirmed: true,
    confidenceScore: 0.95,
    smsHash: 'hash_amzn_1299',
    rawSmsText: 'Rs 1,299 spent on your HDFC Bank credit card ending 8821 at AMAZON on 27-Aug-26.',
    syncStatus: 'synced',
    createdAt: '2026-08-27T11:20:00.000Z',
    updatedAt: '2026-08-27T11:20:00.000Z',
  },
  {
    id: 'TXN-20260826-001',
    amount: 280,
    merchant: 'Uber',
    categoryId: 'cat_travel',
    categoryName: 'Travel & Transport',
    categoryIcon: '🚖',
    categoryColor: '#3B82F6',
    date: '2026-08-26',
    time: '20:45',
    paymentMethod: 'UPI',
    transactionType: 'Expense',
    source: 'sms',
    bank: 'ICICI Bank',
    accountLast4: '4567',
    referenceId: 'UPI482910384',
    notes: 'Ride to Indiranagar',
    isConfirmed: true,
    confidenceScore: 0.94,
    smsHash: 'hash_uber_280',
    rawSmsText: 'Acct XX4567 debited with INR 280.00 on 26-Aug-26 at UBER. UPI Ref 482910384.',
    syncStatus: 'synced',
    createdAt: '2026-08-26T20:45:00.000Z',
    updatedAt: '2026-08-26T20:45:00.000Z',
  },
  {
    id: 'TXN-20260825-001',
    amount: 850,
    merchant: 'Blinkit',
    categoryId: 'cat_groceries',
    categoryName: 'Groceries',
    categoryIcon: '🛒',
    categoryColor: '#10B981',
    date: '2026-08-25',
    time: '09:15',
    paymentMethod: 'UPI',
    transactionType: 'Expense',
    source: 'sms',
    bank: 'SBI',
    accountLast4: '9876',
    referenceId: 'SBIN8492019',
    notes: 'Milk, fruits & breakfast items',
    isConfirmed: true,
    confidenceScore: 0.95,
    smsHash: 'hash_blinkit_850',
    rawSmsText: 'Dear SBI User, A/C 9876 debited by Rs 850.00 on 25Aug26 transfer to BLINKIT Ref SBIN8492019.',
    syncStatus: 'synced',
    createdAt: '2026-08-25T09:15:00.000Z',
    updatedAt: '2026-08-25T09:15:00.000Z',
  },
  {
    id: 'TXN-20260824-001',
    amount: 2200,
    merchant: 'Shell Fuel Station',
    categoryId: 'cat_fuel',
    categoryName: 'Fuel',
    categoryIcon: '⛽',
    categoryColor: '#EF4444',
    date: '2026-08-24',
    time: '18:00',
    paymentMethod: 'Debit Card',
    transactionType: 'Expense',
    source: 'sms',
    bank: 'HDFC Bank',
    accountLast4: '1234',
    referenceId: 'POS8392011',
    notes: 'Petrol tank full',
    isConfirmed: true,
    confidenceScore: 0.92,
    smsHash: 'hash_shell_2200',
    rawSmsText: 'Your A/C XX1234 is debited by Rs. 2200.00 at SHELL PETROL on 24-AUG-26.',
    syncStatus: 'synced',
    createdAt: '2026-08-24T18:00:00.000Z',
    updatedAt: '2026-08-24T18:00:00.000Z',
  },
  {
    id: 'TXN-20260822-001',
    amount: 3200,
    merchant: 'Bescom Electricity',
    categoryId: 'cat_bills',
    categoryName: 'Bills & Utilities',
    categoryIcon: '💡',
    categoryColor: '#F59E0B',
    date: '2026-08-22',
    time: '10:30',
    paymentMethod: 'Net Banking',
    transactionType: 'Expense',
    source: 'manual',
    bank: 'Axis Bank',
    referenceId: 'BILLDESK49201',
    notes: 'Monthly power utility bill',
    isConfirmed: true,
    confidenceScore: 1.0,
    syncStatus: 'synced',
    createdAt: '2026-08-22T10:30:00.000Z',
    updatedAt: '2026-08-22T10:30:00.000Z',
  },
  {
    id: 'TXN-20260820-001',
    amount: 649,
    merchant: 'Netflix',
    categoryId: 'cat_entertainment',
    categoryName: 'Entertainment',
    categoryIcon: '🎬',
    categoryColor: '#6366F1',
    date: '2026-08-20',
    time: '04:00',
    paymentMethod: 'Credit Card',
    transactionType: 'Expense',
    source: 'sms',
    bank: 'HDFC Bank',
    accountLast4: '8821',
    referenceId: 'RECURRING7482',
    notes: 'Premium 4K plan',
    isConfirmed: true,
    confidenceScore: 0.98,
    smsHash: 'hash_netflix_649',
    rawSmsText: 'Rs 649.00 spent on your HDFC Bank credit card ending 8821 for NETFLIX subscription.',
    syncStatus: 'synced',
    createdAt: '2026-08-20T04:00:00.000Z',
    updatedAt: '2026-08-20T04:00:00.000Z',
  },
  {
    id: 'TXN-20260818-001',
    amount: 560,
    merchant: 'Apollo Pharmacy',
    categoryId: 'cat_health',
    categoryName: 'Healthcare',
    categoryIcon: '💊',
    categoryColor: '#EC4899',
    date: '2026-08-18',
    time: '16:40',
    paymentMethod: 'UPI',
    transactionType: 'Expense',
    source: 'sms',
    bank: 'ICICI Bank',
    accountLast4: '4567',
    referenceId: 'UPI94028401',
    notes: 'Prescription medicines & vitamins',
    isConfirmed: true,
    confidenceScore: 0.94,
    smsHash: 'hash_apollo_560',
    rawSmsText: 'Paid Rs. 560 to Apollo Pharmacy via UPI Ref 94028401 from ICICI Acct XX4567.',
    syncStatus: 'synced',
    createdAt: '2026-08-18T16:40:00.000Z',
    updatedAt: '2026-08-18T16:40:00.000Z',
  },
  {
    id: 'TXN-20260815-001',
    amount: 2500,
    merchant: 'D-Mart Supermarket',
    categoryId: 'cat_groceries',
    categoryName: 'Groceries',
    categoryIcon: '🛒',
    categoryColor: '#10B981',
    date: '2026-08-15',
    time: '17:15',
    paymentMethod: 'Debit Card',
    transactionType: 'Expense',
    source: 'manual',
    bank: 'SBI',
    accountLast4: '9876',
    notes: 'Monthly staples and provisions',
    isConfirmed: true,
    confidenceScore: 1.0,
    syncStatus: 'synced',
    createdAt: '2026-08-15T17:15:00.000Z',
    updatedAt: '2026-08-15T17:15:00.000Z',
  },
  {
    id: 'TXN-20260812-001',
    amount: 2501,
    merchant: 'Zara Lifestyle',
    categoryId: 'cat_shopping',
    categoryName: 'Shopping',
    categoryIcon: '🛍️',
    categoryColor: '#8B5CF6',
    date: '2026-08-12',
    time: '19:30',
    paymentMethod: 'Credit Card',
    transactionType: 'Expense',
    source: 'sms',
    bank: 'HDFC Bank',
    accountLast4: '8821',
    referenceId: 'POS948201',
    notes: 'Summer shirt',
    isConfirmed: true,
    confidenceScore: 0.93,
    smsHash: 'hash_zara_2501',
    rawSmsText: 'INR 2,501.00 spent on your credit card ending 8821 at ZARA STORE on 12-Aug-26.',
    syncStatus: 'synced',
    createdAt: '2026-08-12T19:30:00.000Z',
    updatedAt: '2026-08-12T19:30:00.000Z',
  },
  {
    id: 'TXN-20260810-001',
    amount: 3830,
    merchant: 'Zomato & Dining',
    categoryId: 'cat_food',
    categoryName: 'Food & Dining',
    categoryIcon: '🍔',
    categoryColor: '#F97316',
    date: '2026-08-10',
    time: '21:00',
    paymentMethod: 'UPI',
    transactionType: 'Expense',
    source: 'sms',
    bank: 'HDFC Bank',
    accountLast4: '1234',
    referenceId: 'UPI7482019',
    notes: 'Family dinner celebration',
    isConfirmed: true,
    confidenceScore: 0.95,
    smsHash: 'hash_zomato_3830',
    rawSmsText: 'UPI payment of Rs 3,830.00 to ZOMATO FOODS from HDFC A/C 1234 Ref UPI7482019.',
    syncStatus: 'synced',
    createdAt: '2026-08-10T21:00:00.000Z',
    updatedAt: '2026-08-10T21:00:00.000Z',
  },
  {
    id: 'TXN-20260805-001',
    amount: 360,
    merchant: 'Local Chai Tapri',
    categoryId: 'cat_food',
    categoryName: 'Food & Dining',
    categoryIcon: '🍔',
    categoryColor: '#F97316',
    date: '2026-08-05',
    time: '17:30',
    paymentMethod: 'Cash',
    transactionType: 'Expense',
    source: 'manual',
    notes: 'Tea & snacks for group',
    isConfirmed: true,
    confidenceScore: 1.0,
    syncStatus: 'synced',
    createdAt: '2026-08-05T17:30:00.000Z',
    updatedAt: '2026-08-05T17:30:00.000Z',
  }
];

class StorageService {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item);
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage set failed', e);
    }
  }

  // --- Categories ---
  getCategories(): Category[] {
    const stored = this.get<Category[]>(STORAGE_KEYS.CATEGORIES, []);
    if (!stored || stored.length === 0) {
      this.set(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    return stored;
  }

  saveCategories(categories: Category[]): void {
    this.set(STORAGE_KEYS.CATEGORIES, categories);
  }

  addCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Category {
    const categories = this.getCategories();
    const newCategory: Category = {
      ...category,
      id: `cat_custom_${Date.now()}`,
      isDefault: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    categories.push(newCategory);
    this.saveCategories(categories);
    return newCategory;
  }

  updateCategory(category: Category): void {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === category.id);
    if (index !== -1) {
      categories[index] = { ...category, updatedAt: new Date().toISOString() };
      this.saveCategories(categories);

      // Cascade update to transactions category name/icon/color
      const transactions = this.getTransactions();
      let hasUpdates = false;
      const updatedTxns = transactions.map(t => {
        if (t.categoryId === category.id) {
          hasUpdates = true;
          return {
            ...t,
            categoryName: category.name,
            categoryIcon: category.icon,
            categoryColor: category.color,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      });
      if (hasUpdates) {
        this.saveTransactions(updatedTxns);
      }
    }
  }

  deleteCategory(categoryId: string): boolean {
    const categories = this.getCategories();
    const cat = categories.find(c => c.id === categoryId);
    if (!cat || cat.isDefault) {
      return false; // Cannot permanently delete default categories
    }
    const filtered = categories.filter(c => c.id !== categoryId);
    this.saveCategories(filtered);

    // Reassign transactions of deleted category to 'cat_other'
    const otherCat = categories.find(c => c.id === 'cat_other') || DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1];
    const transactions = this.getTransactions();
    const updatedTxns = transactions.map(t => {
      if (t.categoryId === categoryId) {
        return {
          ...t,
          categoryId: otherCat.id,
          categoryName: otherCat.name,
          categoryIcon: otherCat.icon,
          categoryColor: otherCat.color,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    this.saveTransactions(updatedTxns);
    return true;
  }

  toggleCategoryActive(categoryId: string, isActive: boolean): void {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === categoryId);
    if (index !== -1) {
      categories[index].isActive = isActive;
      categories[index].updatedAt = new Date().toISOString();
      this.saveCategories(categories);
    }
  }

  // --- Transactions ---
  getTransactions(): Transaction[] {
    const stored = this.get<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    if (!stored || stored.length === 0) {
      this.set(STORAGE_KEYS.TRANSACTIONS, SEED_TRANSACTIONS);
      return SEED_TRANSACTIONS;
    }
    return stored;
  }

  saveTransactions(transactions: Transaction[]): void {
    this.set(STORAGE_KEYS.TRANSACTIONS, transactions);
  }

  addTransaction(tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>): Transaction {
    const transactions = this.getTransactions();
    const newTx: Transaction = {
      ...tx,
      id: `TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-4)}`,
      syncStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    transactions.unshift(newTx);
    this.saveTransactions(transactions);

    // Queue for Google Sheets Sync
    this.enqueueSync(newTx.id, 'INSERT');

    // Check notification triggers
    this.checkBudgetTriggers();

    return newTx;
  }

  updateTransaction(transaction: Transaction): void {
    const transactions = this.getTransactions();
    const index = transactions.findIndex(t => t.id === transaction.id);
    if (index !== -1) {
      const updated = {
        ...transaction,
        syncStatus: 'pending' as const,
        updatedAt: new Date().toISOString(),
      };
      transactions[index] = updated;
      this.saveTransactions(transactions);
      this.enqueueSync(transaction.id, 'UPDATE');
      this.checkBudgetTriggers();
    }
  }

  deleteTransaction(id: string): void {
    const transactions = this.getTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    this.saveTransactions(filtered);
    this.enqueueSync(id, 'DELETE');
    this.checkBudgetTriggers();
  }

  isDuplicate(smsHash?: string, referenceId?: string, amount?: number, merchant?: string, date?: string): boolean {
    if (!amount) return false;
    const transactions = this.getTransactions();
    
    // Check SMS hash exact match
    if (smsHash && transactions.some(t => t.smsHash && t.smsHash === smsHash)) {
      return true;
    }

    // Check Reference ID exact match
    if (referenceId && referenceId.length >= 5 && transactions.some(t => t.referenceId === referenceId)) {
      return true;
    }

    // Check similar amount + merchant + date
    if (merchant && date) {
      const isMatch = transactions.some(t => 
        t.amount === amount && 
        t.merchant.toLowerCase() === merchant.toLowerCase() && 
        t.date === date
      );
      if (isMatch) return true;
    }

    return false;
  }

  // --- Budgets ---
  getBudget(): Budget {
    const now = new Date();
    const defaultBudget: Budget = {
      id: `budget_${now.getFullYear()}_${now.getMonth() + 1}`,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      overallAmount: 30000,
      categoryBudgets: {
        cat_food: 8000,
        cat_groceries: 6000,
        cat_shopping: 7000,
        cat_travel: 4000,
        cat_fuel: 3500,
        cat_bills: 4500,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.get<Budget>(STORAGE_KEYS.BUDGET, defaultBudget);
  }

  saveBudget(budget: Budget): void {
    this.set(STORAGE_KEYS.BUDGET, budget);
  }

  updateCategoryBudget(categoryId: string, amount: number): void {
    const budget = this.getBudget();
    budget.categoryBudgets[categoryId] = amount;
    budget.updatedAt = new Date().toISOString();
    this.saveBudget(budget);
  }

  // --- Sync Queue ---
  getSyncQueue(): SyncQueueItem[] {
    return this.get<SyncQueueItem[]>(STORAGE_KEYS.SYNC_QUEUE, []);
  }

  saveSyncQueue(queue: SyncQueueItem[]): void {
    this.set(STORAGE_KEYS.SYNC_QUEUE, queue);
  }

  enqueueSync(transactionId: string, operation: 'INSERT' | 'UPDATE' | 'DELETE'): void {
    const queue = this.getSyncQueue();
    // Remove previous pending actions on same item if any
    const filtered = queue.filter(q => q.transactionId !== transactionId);
    filtered.push({
      id: `sync_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      transactionId,
      operation,
      status: 'pending',
      retryCount: 0,
      createdAt: new Date().toISOString(),
    });
    this.saveSyncQueue(filtered);
  }

  // --- Google Sheets Config ---
  getSheetsConfig(): GoogleSheetsConfig {
    return this.get<GoogleSheetsConfig>(STORAGE_KEYS.SHEETS_CONFIG, {
      isConnected: true,
      userEmail: 'rohinisbenake@gmail.com',
      spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
      spreadsheetName: 'Smart Expense Tracker 2026',
      sheetName: 'Expenses_2026',
      autoSync: true,
      lastSyncTime: new Date().toISOString(),
    });
  }

  saveSheetsConfig(config: GoogleSheetsConfig): void {
    this.set(STORAGE_KEYS.SHEETS_CONFIG, config);
  }

  // --- Settings ---
  getSettings(): AppSettings {
    return this.get<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  saveSettings(settings: AppSettings): void {
    this.set(STORAGE_KEYS.SETTINGS, settings);
  }

  // --- Notifications ---
  getNotifications(): NotificationItem[] {
    return this.get<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, [
      {
        id: 'notif_welcome',
        title: 'Welcome to Smart Expense Tracker!',
        message: 'Automatic SMS detection is active for Indian banks and UPI payments.',
        type: 'info',
        timestamp: new Date().toISOString(),
        read: false,
      }
    ]);
  }

  addNotification(notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>): void {
    const list = this.getNotifications();
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif_${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    list.unshift(newNotif);
    this.set(STORAGE_KEYS.NOTIFICATIONS, list.slice(0, 30));
  }

  markAllNotificationsRead(): void {
    const list = this.getNotifications().map(n => ({ ...n, read: true }));
    this.set(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  // --- Reports Calculation Engine ---
  calculateReports(
    customTransactions?: Transaction[],
    customCategories?: Category[],
    customBudget?: Budget,
    targetMonth: number = 8,
    targetYear: number = 2026
  ): SpendingReport {
    const transactions = customTransactions || this.getTransactions();
    const categories = customCategories || this.getCategories();
    const budget = customBudget || this.getBudget();

    // Filter by target month & year
    const monthTxns = transactions.filter(t => {
      if (t.transactionType !== 'Expense') return false;
      const parts = t.date.split('-');
      if (parts.length < 3) return false;
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      return y === targetYear && m === targetMonth;
    });

    const totalSpending = monthTxns.reduce((sum, t) => sum + t.amount, 0);
    const totalTransactions = monthTxns.length;
    const daysInMonth = 31;
    const currentDay = Math.min(new Date().getDate(), daysInMonth);
    const dailyAverage = currentDay > 0 ? Math.round(totalSpending / currentDay) : 0;

    // Daily Spending Map
    const dailyMap: Record<number, number> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      dailyMap[d] = 0;
    }
    monthTxns.forEach(t => {
      const day = parseInt(t.date.split('-')[2], 10);
      if (dailyMap[day] !== undefined) {
        dailyMap[day] += t.amount;
      }
    });

    const dailySpending = Object.keys(dailyMap).map(d => ({
      date: `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      day: parseInt(d, 10),
      amount: dailyMap[parseInt(d, 10)],
    }));

    // Highest Spending Day
    let highestSpendingDay: { date: string; amount: number } | null = null;
    dailySpending.forEach(ds => {
      if (!highestSpendingDay || ds.amount > highestSpendingDay.amount) {
        if (ds.amount > 0) {
          highestSpendingDay = { date: ds.date, amount: ds.amount };
        }
      }
    });

    // Category Breakdown
    const catMap: Record<string, { amount: number; count: number }> = {};
    monthTxns.forEach(t => {
      if (!catMap[t.categoryId]) {
        catMap[t.categoryId] = { amount: 0, count: 0 };
      }
      catMap[t.categoryId].amount += t.amount;
      catMap[t.categoryId].count += 1;
    });

    const categoryBreakdown = categories
      .map(c => {
        const data = catMap[c.id] || { amount: 0, count: 0 };
        const percentage = totalSpending > 0 ? Math.round((data.amount / totalSpending) * 100) : 0;
        return {
          categoryId: c.id,
          name: c.name,
          icon: c.icon,
          color: c.color,
          amount: data.amount,
          count: data.count,
          percentage,
          budget: budget.categoryBudgets[c.id] || c.monthlyBudget,
        };
      })
      .filter(c => c.amount > 0 || (c.budget && c.budget > 0))
      .sort((a, b) => b.amount - a.amount);

    const highestCategory = categoryBreakdown.length > 0 && categoryBreakdown[0].amount > 0
      ? {
          name: categoryBreakdown[0].name,
          amount: categoryBreakdown[0].amount,
          percentage: categoryBreakdown[0].percentage,
          icon: categoryBreakdown[0].icon,
          color: categoryBreakdown[0].color,
        }
      : null;

    // Merchant breakdown
    const merchMap: Record<string, { amount: number; count: number }> = {};
    monthTxns.forEach(t => {
      const m = t.merchant || 'Other';
      if (!merchMap[m]) merchMap[m] = { amount: 0, count: 0 };
      merchMap[m].amount += t.amount;
      merchMap[m].count += 1;
    });

    const topMerchants = Object.keys(merchMap)
      .map(m => ({ merchant: m, amount: merchMap[m].amount, count: merchMap[m].count }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    const highestMerchant = topMerchants.length > 0 ? topMerchants[0] : null;

    // Payment Method Breakdown
    const pmMap: Record<string, { amount: number; count: number }> = {};
    monthTxns.forEach(t => {
      const pm = t.paymentMethod;
      if (!pmMap[pm]) pmMap[pm] = { amount: 0, count: 0 };
      pmMap[pm].amount += t.amount;
      pmMap[pm].count += 1;
    });

    const paymentMethodBreakdown = Object.keys(pmMap)
      .map(pm => {
        const amt = pmMap[pm].amount;
        const count = pmMap[pm].count;
        const percentage = totalSpending > 0 ? Math.round((amt / totalSpending) * 100) : 0;
        return { method: pm as any, amount: amt, count, percentage };
      })
      .sort((a, b) => b.amount - a.amount);

    // Budget Calculations
    const budgetRemaining = Math.max(0, budget.overallAmount - totalSpending);
    const budgetPercentage = budget.overallAmount > 0
      ? Math.min(100, Math.round((totalSpending / budget.overallAmount) * 100))
      : 0;

    // Monthly comparisons (Previous Months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyComparison = [
      { monthName: 'May', month: 5, year: 2026, amount: 24200 },
      { monthName: 'Jun', month: 6, year: 2026, amount: 26800 },
      { monthName: 'Jul', month: 7, year: 2026, amount: 21000 },
      { monthName: 'Aug', month: 8, year: 2026, amount: totalSpending },
    ];

    // MoM change: Compare with July
    const julySpend = 21000;
    const momChangePercentage = julySpend > 0
      ? parseFloat((((totalSpending - julySpend) / julySpend) * 100).toFixed(1))
      : 0;

    return {
      totalSpending,
      totalTransactions,
      dailyAverage,
      highestSpendingDay,
      highestCategory,
      highestMerchant,
      budgetRemaining,
      budgetPercentage,
      momChangePercentage,
      categoryBreakdown,
      dailySpending,
      paymentMethodBreakdown,
      topMerchants,
      monthlyComparison,
    };
  }

  private checkBudgetTriggers(): void {
    const settings = this.getSettings();
    if (!settings.notificationsEnabled) return;

    const reports = this.calculateReports();
    const budget = this.getBudget();

    if (settings.budgetWarning100 && reports.totalSpending >= budget.overallAmount) {
      this.addNotification({
        title: '⚠️ Monthly Budget Exceeded!',
        message: `You have spent ₹${reports.totalSpending.toLocaleString('en-IN')}, exceeding your ₹${budget.overallAmount.toLocaleString('en-IN')} budget.`,
        type: 'budget_warning',
      });
    } else if (settings.budgetWarning80 && reports.budgetPercentage >= 80) {
      this.addNotification({
        title: '📊 80% Budget Reached',
        message: `You have used ${reports.budgetPercentage}% of your ₹${budget.overallAmount.toLocaleString('en-IN')} monthly budget.`,
        type: 'budget_warning',
      });
    }
  }

  calculateReport(
    transactions?: Transaction[],
    categories?: Category[],
    budget?: Budget,
    year: number = 2026,
    month: number = 8
  ): SpendingReport {
    return this.calculateReports(transactions, categories, budget, month, year);
  }

  // --- Saved Report Filters ---
  getSavedReportFilters(): SavedReportFilter[] {
    const saved = this.get<SavedReportFilter[]>(STORAGE_KEYS.SAVED_FILTERS, []);
    if (!saved || saved.length === 0) {
      const defaultSaved: SavedReportFilter[] = [
        {
          id: 'filter_food_month',
          name: 'My Food Expenses',
          filter: {
            datePreset: 'this_month',
            categoryIds: ['cat_food'],
            transactionType: 'Expense',
          },
          createdAt: new Date().toISOString(),
        },
        {
          id: 'filter_cc_year',
          name: 'Credit Card Spending',
          filter: {
            datePreset: 'this_year',
            paymentMethods: ['Credit Card'],
            transactionType: 'Expense',
          },
          createdAt: new Date().toISOString(),
        },
        {
          id: 'filter_high_value',
          name: 'Expenses Above ₹2,000',
          filter: {
            datePreset: 'all',
            minAmount: 2000,
            transactionType: 'Expense',
          },
          createdAt: new Date().toISOString(),
        },
      ];
      this.set(STORAGE_KEYS.SAVED_FILTERS, defaultSaved);
      return defaultSaved;
    }
    return saved;
  }

  saveReportFilter(name: string, filter: ReportFilterModel): SavedReportFilter {
    const filters = this.getSavedReportFilters();
    const newFilter: SavedReportFilter = {
      id: `filter_${Date.now()}`,
      name: name.trim() || 'Custom Filter',
      filter,
      createdAt: new Date().toISOString(),
    };
    filters.push(newFilter);
    this.set(STORAGE_KEYS.SAVED_FILTERS, filters);
    return newFilter;
  }

  deleteSavedReportFilter(id: string): void {
    const filters = this.getSavedReportFilters().filter(f => f.id !== id);
    this.set(STORAGE_KEYS.SAVED_FILTERS, filters);
  }

  // --- Recurring Overrides ---
  getRecurringRules(): Record<string, boolean> {
    return this.get<Record<string, boolean>>(STORAGE_KEYS.RECURRING_RULES, {});
  }

  toggleRecurringMerchant(merchant: string, isRecurring: boolean): void {
    const rules = this.getRecurringRules();
    rules[merchant] = isRecurring;
    this.set(STORAGE_KEYS.RECURRING_RULES, rules);
  }

  // --- Advanced Reporting Engine Facades ---
  getAdvancedReport(
    filter: ReportFilterModel,
    customTransactions?: Transaction[],
    customCategories?: Category[],
    customBudget?: Budget
  ): AdvancedSpendingReport {
    const txns = customTransactions || this.getTransactions();
    const cats = customCategories || this.getCategories();
    const bud = customBudget || this.getBudget();
    const rules = this.getRecurringRules();
    return generateAdvancedReport(txns, cats, bud, filter, rules);
  }

  compareMonths(
    yearA: number,
    monthA: number,
    yearB: number,
    monthB: number,
    customTransactions?: Transaction[],
    customCategories?: Category[]
  ): MonthComparisonResult {
    const txns = customTransactions || this.getTransactions();
    const cats = customCategories || this.getCategories();
    return compareTwoMonths(txns, cats, yearA, monthA, yearB, monthB);
  }

  getCategoryTrend(
    categoryId: string,
    year: number = 2026,
    customTransactions?: Transaction[]
  ): { monthName: string; month: number; amount: number; count: number }[] {
    const txns = customTransactions || this.getTransactions();
    return getCategoryMonthlyTrend(txns, categoryId, year);
  }

  markNotificationsAsRead(): void {
    this.markAllNotificationsRead();
  }

  resetToSampleData(): void {
    this.resetAllData();
  }

  resetAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.BUDGET);
    localStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    this.getCategories();
    this.getTransactions();
    this.getBudget();
  }
}

export const storageService = new StorageService();
