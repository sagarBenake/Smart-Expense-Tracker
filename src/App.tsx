import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Navbar 
} from './components/Navbar';
import { 
  BottomNav 
} from './components/BottomNav';
import { 
  DashboardView 
} from './components/DashboardView';
import { 
  TransactionsView 
} from './components/TransactionsView';
import { 
  ReportsView 
} from './components/ReportsView';
import { 
  SettingsView 
} from './components/SettingsView';
import { 
  AddExpenseModal 
} from './components/AddExpenseModal';
import { 
  SmsSimulatorDrawer 
} from './components/SmsSimulatorDrawer';
import { 
  TransactionDetailModal 
} from './components/TransactionDetailModal';
import { 
  ReviewExpenseModal 
} from './components/ReviewExpenseModal';
import { 
  AndroidCodeModal 
} from './components/AndroidCodeModal';
import { 
  NotificationsModal 
} from './components/NotificationsModal';
import { 
  BudgetModal 
} from './components/BudgetModal';

import { storageService } from './services/storageService';
import { sheetsSyncService } from './services/sheetsSync';
import { parseTransactionSms } from './utils/smsParser';
import { 
  AppSettings, 
  Budget, 
  Category, 
  GoogleSheetsConfig, 
  NotificationItem, 
  SpendingReport, 
  Transaction 
} from './types';
import { formatINR } from './utils/formatters';

export default function App() {
  // App Core State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'reports' | 'settings'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>(() => storageService.getTransactions());
  const [categories, setCategories] = useState<Category[]>(() => storageService.getCategories());
  const [budget, setBudget] = useState<Budget>(() => storageService.getBudget());
  const [settings, setSettings] = useState<AppSettings>(() => storageService.getSettings());
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>(() => storageService.getSheetsConfig());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => storageService.getNotifications());
  
  // UI Loading & Sync States
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals & Drawers
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSmsSimulatorOpen, setIsSmsSimulatorOpen] = useState(false);
  const [isAndroidCodeOpen, setIsAndroidCodeOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [selectedDetailTransaction, setSelectedDetailTransaction] = useState<Transaction | null>(null);
  const [detectedTransactionToReview, setDetectedTransactionToReview] = useState<Transaction | null>(null);

  // Toast Notification Trigger
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(current => (current === msg ? null : current));
    }, 3500);
  }, []);

  // Sync state changes back to storage
  const refreshAllState = useCallback(() => {
    setTransactions(storageService.getTransactions());
    setCategories(storageService.getCategories());
    setBudget(storageService.getBudget());
    setSettings(storageService.getSettings());
    setSheetsConfig(storageService.getSheetsConfig());
    setNotifications(storageService.getNotifications());
  }, []);

  // Dark/Light Theme management
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  // Derived Spending Analytics Report for current month (August 2026)
  const report: SpendingReport = useMemo(() => {
    return storageService.calculateReport(transactions, categories, budget, 2026, 8);
  }, [transactions, categories, budget]);

  // Google Sheets Cloud Sync Trigger
  const handleTriggerSync = useCallback(async () => {
    setIsSyncing(true);
    showToast('Syncing with Google Sheets (Smart Expense Tracker 2026)...');

    const result = await sheetsSyncService.simulateGoogleSheetsSync(
      transactions,
      sheetsConfig,
      (txs) => {
        storageService.saveTransactions(txs);
        setTransactions(txs);
      }
    );

    setIsSyncing(false);

    if (result.success) {
      const updatedConfig: GoogleSheetsConfig = {
        ...sheetsConfig,
        lastSyncTime: new Date().toISOString(),
        syncStatus: 'synced',
      };
      storageService.saveSheetsConfig(updatedConfig);
      setSheetsConfig(updatedConfig);

      const notification: NotificationItem = {
        id: `notif_${Date.now()}`,
        type: 'sync',
        title: 'Google Sheets Synced',
        message: `Successfully synchronized ${result.recordsSynced} records with worksheet "${sheetsConfig.sheetName}".`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      storageService.addNotification(notification);
      setNotifications(storageService.getNotifications());
      showToast(`✅ Synced ${result.recordsSynced} records with Google Sheets!`);
    } else {
      showToast(`❌ Sync failed: ${result.message}`);
    }
  }, [transactions, sheetsConfig, showToast]);

  // Transaction Operations
  const handleAddTransaction = (newTxData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => {
    const saved = storageService.addTransaction(newTxData);
    setTransactions(storageService.getTransactions());
    showToast(`Recorded expense of ${formatINR(saved.amount)} at ${saved.merchant}`);

    // Check if budget exceeded after this expense
    const newTotal = report.totalSpending + saved.amount;
    if (newTotal >= budget.overallAmount) {
      const notif: NotificationItem = {
        id: `notif_${Date.now()}`,
        type: 'budget_warning',
        title: 'Monthly Budget Limit Reached',
        message: `You have spent ${formatINR(newTotal)}, exceeding your limit of ${formatINR(budget.overallAmount)}.`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      storageService.addNotification(notif);
      setNotifications(storageService.getNotifications());
    } else if (newTotal >= budget.overallAmount * 0.8) {
      const notif: NotificationItem = {
        id: `notif_${Date.now()}`,
        type: 'budget_warning',
        title: '80% Monthly Budget Reached',
        message: `You have spent ${formatINR(newTotal)} of your ${formatINR(budget.overallAmount)} monthly limit.`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      storageService.addNotification(notif);
      setNotifications(storageService.getNotifications());
    }

    if (sheetsConfig.autoSync) {
      setTimeout(() => handleTriggerSync(), 1200);
    }
  };

  const handleUpdateTransaction = (updated: Transaction) => {
    storageService.updateTransaction(updated);
    setTransactions(storageService.getTransactions());
    setSelectedDetailTransaction(null);
    showToast('Transaction updated');
  };

  const handleDeleteTransaction = (id: string) => {
    storageService.deleteTransaction(id);
    setTransactions(storageService.getTransactions());
    setSelectedDetailTransaction(null);
    showToast('Transaction deleted');
  };

  // Custom Category Operations (Sections 16, 17, 18, 19)
  const handleAddCategory = (catData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = storageService.addCategory(catData);
    setCategories(storageService.getCategories());
    showToast(`Created custom category: ${created.icon} ${created.name}`);
  };

  const handleUpdateCategory = (cat: Category) => {
    storageService.updateCategory(cat);
    setCategories(storageService.getCategories());
    showToast(`Updated category: ${cat.name}`);
  };

  const handleDeleteCategory = (id: string) => {
    storageService.deleteCategory(id);
    setCategories(storageService.getCategories());
    showToast('Custom category removed');
  };

  const handleToggleCategoryActive = (id: string, active: boolean) => {
    const target = categories.find(c => c.id === id);
    if (target) {
      storageService.updateCategory({ ...target, isActive: active });
      setCategories(storageService.getCategories());
    }
  };

  // SMS Simulation Handler (Section 8, 9, 10, 11)
  const handleSimulateIncomingSms = (smsBody: string, sender: string) => {
    const parsed = parseTransactionSms(smsBody, sender, categories);

    if (parsed.isOtpOrSpam) {
      showToast('Incoming SMS received: Discarded (OTP / Promotion / Balance alert)');
      return;
    }

    if (parsed.isCredit) {
      showToast('Incoming SMS received: Account Credited (Not an expense)');
      return;
    }

    if (!parsed.amount) {
      showToast('Incoming SMS received: No debit expense amount detected');
      return;
    }

    // Check duplicate
    const isDup = storageService.isDuplicate(
      parsed.rawSmsHash,
      parsed.referenceId,
      parsed.amount || undefined,
      parsed.merchant,
      new Date().toISOString().slice(0, 10)
    );

    if (isDup) {
      showToast('Duplicate SMS detected: Already recorded in database.');
      return;
    }

    const now = new Date();
    const candidateTx: Transaction = {
      id: `tx_${Date.now()}`,
      amount: parsed.amount,
      merchant: parsed.merchant,
      categoryId: parsed.suggestedCategoryId,
      categoryName: parsed.suggestedCategoryName,
      categoryIcon: parsed.suggestedCategoryIcon,
      categoryColor: parsed.suggestedCategoryColor,
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 5),
      paymentMethod: parsed.paymentMethod,
      transactionType: parsed.transactionType,
      source: 'sms',
      bank: parsed.bank,
      accountLast4: parsed.accountLast4,
      referenceId: parsed.referenceId,
      notes: `Detected from ${parsed.bank} SMS`,
      isConfirmed: false,
      confidenceScore: parsed.confidenceScore,
      smsHash: parsed.rawSmsHash,
      rawSmsText: parsed.rawText,
      syncStatus: 'pending',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    // Evaluate against confirmation mode and confidence threshold (Section 10)
    if (settings.confirmationMode === 'never' || (settings.confirmationMode === 'uncertain' && parsed.confidenceScore >= settings.confidenceThreshold)) {
      // Auto-record
      handleAddTransaction(candidateTx);
      showToast(`Auto-recorded: ${formatINR(candidateTx.amount)} at ${candidateTx.merchant} (${Math.round(parsed.confidenceScore * 100)}% conf)`);
    } else {
      // Prompt user to review (Section 11)
      setDetectedTransactionToReview(candidateTx);
    }
  };

  // Duplicate checker helper
  const isDuplicateCheck = (smsHash?: string, referenceId?: string, amount?: number, merchant?: string, date?: string) => {
    return storageService.isDuplicate(smsHash, referenceId, amount, merchant, date);
  };

  // Reset sample data
  const handleResetData = () => {
    if (confirm('Reset database with initial sample expenses and default categories?')) {
      storageService.resetToSampleData();
      refreshAllState();
      showToast('Database reset to initial sample state');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        settings={settings}
        unreadNotificationCount={notifications.filter(n => !n.read).length}
        onOpenSmsSimulator={() => setIsSmsSimulatorOpen(true)}
        onOpenCodeInspector={() => setIsAndroidCodeOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onToggleTheme={() => {
          const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
          const updated = { ...settings, theme: nextTheme as any };
          storageService.saveSettings(updated);
          setSettings(updated);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-20 sm:pb-24">
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <DashboardView
            report={report}
            monthlyBudget={budget.overallAmount}
            recentTransactions={transactions}
            categories={categories}
            onOpenAddExpense={() => setIsAddExpenseOpen(true)}
            onOpenSmsSimulator={() => setIsSmsSimulatorOpen(true)}
            onOpenCodeInspector={() => setIsAndroidCodeOpen(true)}
            onOpenTransactionDetails={(tx) => setSelectedDetailTransaction(tx)}
            onTriggerSync={handleTriggerSync}
            isSyncing={isSyncing}
            onViewAllTransactions={() => setActiveTab('transactions')}
          />
        )}

        {/* TAB 2: TRANSACTIONS LIST */}
        {activeTab === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            categories={categories}
            onOpenAddExpense={() => setIsAddExpenseOpen(true)}
            onOpenTransactionDetails={(tx) => setSelectedDetailTransaction(tx)}
          />
        )}

        {/* TAB 3: REPORTS & ANALYTICS */}
        {activeTab === 'reports' && (
          <ReportsView
            report={report}
            monthlyBudget={budget.overallAmount}
            transactions={transactions}
            categories={categories}
            budget={budget}
            onOpenTransactionDetails={(tx) => setSelectedDetailTransaction(tx)}
            onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
          />
        )}

        {/* TAB 4: SETTINGS & CUSTOM CATEGORIES */}
        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            categories={categories}
            sheetsConfig={sheetsConfig}
            onUpdateSettings={(newSettings) => {
              storageService.saveSettings(newSettings);
              setSettings(newSettings);
              showToast('Settings saved');
            }}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            onToggleCategoryActive={handleToggleCategoryActive}
            onUpdateSheetsConfig={(cfg) => {
              storageService.saveSheetsConfig(cfg);
              setSheetsConfig(cfg);
              showToast('Google Sheets configuration saved');
            }}
            onTriggerSync={handleTriggerSync}
            isSyncing={isSyncing}
            onOpenCodeInspector={() => setIsAndroidCodeOpen(true)}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Floating Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenAddExpense={() => setIsAddExpenseOpen(true)}
      />

      {/* MODAL 1: ADD EXPENSE */}
      {isAddExpenseOpen && (
        <AddExpenseModal
          categories={categories}
          onClose={() => setIsAddExpenseOpen(false)}
          onSave={handleAddTransaction}
        />
      )}

      {/* MODAL 2: SMS SIMULATOR DRAWER */}
      {isSmsSimulatorOpen && (
        <SmsSimulatorDrawer
          categories={categories}
          onClose={() => setIsSmsSimulatorOpen(false)}
          onRecordExpense={handleAddTransaction}
          onSimulateIncomingSms={handleSimulateIncomingSms}
          isDuplicateCheck={isDuplicateCheck}
        />
      )}

      {/* MODAL 3: TRANSACTION DETAIL & EDIT */}
      {selectedDetailTransaction && (
        <TransactionDetailModal
          transaction={selectedDetailTransaction}
          categories={categories}
          onClose={() => setSelectedDetailTransaction(null)}
          onUpdate={handleUpdateTransaction}
          onDelete={handleDeleteTransaction}
        />
      )}

      {/* MODAL 4: REVIEW DETECTED EXPENSE (Section 11) */}
      {detectedTransactionToReview && (
        <ReviewExpenseModal
          transaction={detectedTransactionToReview}
          categories={categories}
          onConfirm={(tx) => {
            handleAddTransaction(tx);
            setDetectedTransactionToReview(null);
          }}
          onEdit={(tx) => {
            setSelectedDetailTransaction(tx);
            setDetectedTransactionToReview(null);
          }}
          onIgnore={() => {
            setDetectedTransactionToReview(null);
            showToast('Ignored incoming SMS transaction');
          }}
        />
      )}

      {/* MODAL 5: ANDROID STUDIO CODE INSPECTOR */}
      {isAndroidCodeOpen && (
        <AndroidCodeModal onClose={() => setIsAndroidCodeOpen(false)} />
      )}

      {/* MODAL 6: NOTIFICATIONS */}
      {isNotificationsOpen && (
        <NotificationsModal
          notifications={notifications}
          onClose={() => setIsNotificationsOpen(false)}
          onMarkAllRead={() => {
            storageService.markNotificationsAsRead();
            setNotifications(storageService.getNotifications());
          }}
        />
      )}

      {/* MODAL 7: BUDGET CONFIGURATION */}
      {isBudgetModalOpen && (
        <BudgetModal
          budget={budget}
          categories={categories}
          onClose={() => setIsBudgetModalOpen(false)}
          onSave={(overall, catBudgets) => {
            const updated: Budget = {
              ...budget,
              overallAmount: overall,
              categoryBudgets: catBudgets,
            };
            storageService.saveBudget(updated);
            setBudget(updated);
            showToast('Monthly and category budgets updated');
          }}
        />
      )}

      {/* GLOBAL TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 dark:bg-slate-800/95 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700/60 text-xs font-semibold flex items-center gap-2 animate-slideUp pointer-events-none max-w-[90vw] truncate">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
