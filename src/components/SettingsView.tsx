import React, { useState } from 'react';
import { 
  FolderPlus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Plus, 
  Tag, 
  RefreshCw, 
  FileSpreadsheet, 
  ShieldCheck, 
  Download, 
  Upload, 
  Moon, 
  Sun, 
  Smartphone, 
  Code2, 
  Lock, 
  CheckCircle2, 
  AlertTriangle,
  Sliders,
  DollarSign
} from 'lucide-react';
import { AppSettings, Category, GoogleSheetsConfig } from '../types';
import { formatINR } from '../utils/formatters';
import { sheetsSyncService } from '../services/sheetsSync';
import { downloadAndroidProjectZip } from '../services/androidProjectGenerator';

interface SettingsViewProps {
  settings: AppSettings;
  categories?: Category[];
  sheetsConfig: GoogleSheetsConfig;
  onUpdateSettings: (settings: AppSettings) => void;
  onAddCategory: (cat: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateCategory: (cat: Category) => void;
  onDeleteCategory: (id: string) => void;
  onToggleCategoryActive: (id: string, active: boolean) => void;
  onUpdateSheetsConfig: (cfg: GoogleSheetsConfig) => void;
  onTriggerSync: () => void;
  isSyncing: boolean;
  onOpenCodeInspector: () => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  categories = [],
  sheetsConfig,
  onUpdateSettings,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onToggleCategoryActive,
  onUpdateSheetsConfig,
  onTriggerSync,
  isSyncing,
  onOpenCodeInspector,
  onResetData,
}) => {
  // Add/Edit Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('🐶');
  const [catColor, setCatColor] = useState('#8B5CF6');
  const [catBudget, setCatBudget] = useState<string>('3000');
  const [catKeywords, setCatKeywords] = useState<string>('Petshop, Dog Food, Vet, Pet Clinic');

  // Budget Modal State
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [monthlyBudgetInput, setMonthlyBudgetInput] = useState(settings.monthlyBudget.toString());

  // Privacy Info Modal State
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Quick Preset Icons & Colors for Categories
  const PRESET_ICONS = ['🐶', '🐾', '🔧', '🧹', '🎮', '☕', '👶', '🚗', '🎨', '🏖️', '💻', '🏋️', '🎁', '🪴', '✈️', '🍔', '🛍️'];
  const PRESET_COLORS = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#6366F1', '#14B8A6', '#F97316'];

  const openAddCategory = () => {
    setEditingCategory(null);
    setCatName('');
    setCatIcon('🐶');
    setCatColor('#8B5CF6');
    setCatBudget('3000');
    setCatKeywords('Petshop, Dog Food, Vet, Pet Clinic');
    setShowCategoryModal(true);
  };

  const openEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatIcon(cat.icon);
    setCatColor(cat.color);
    setCatBudget(cat.monthlyBudget ? cat.monthlyBudget.toString() : '');
    setCatKeywords(cat.keywords.join(', '));
    setShowCategoryModal(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    const keywordsArray = catKeywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    const budgetNum = parseFloat(catBudget);

    if (editingCategory) {
      onUpdateCategory({
        ...editingCategory,
        name: catName.trim(),
        icon: catIcon,
        color: catColor,
        monthlyBudget: isNaN(budgetNum) ? undefined : budgetNum,
        keywords: keywordsArray,
      });
    } else {
      onAddCategory({
        name: catName.trim(),
        icon: catIcon,
        color: catColor,
        monthlyBudget: isNaN(budgetNum) ? undefined : budgetNum,
        isDefault: false,
        isActive: true,
        keywords: keywordsArray,
      });
    }

    setShowCategoryModal(false);
  };

  // CSV Export & Import Handlers
  const handleExportCsv = () => {
    const transactions = JSON.parse(localStorage.getItem('smart_expense_transactions_v1') || '[]');
    const csv = sheetsSyncService.generateCsvContent(transactions);
    sheetsSyncService.downloadFile(csv, `SmartExpense_Export_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
  };

  const handleExportJson = () => {
    const data = {
      transactions: JSON.parse(localStorage.getItem('smart_expense_transactions_v1') || '[]'),
      categories: categories,
      settings: settings,
      exportedAt: new Date().toISOString(),
    };
    sheetsSyncService.downloadFile(JSON.stringify(data, null, 2), `SmartExpense_Backup_${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
  };

  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      if (content) {
        const { transactions: imported, errors } = sheetsSyncService.parseCsv(content);
        if (imported.length > 0) {
          alert(`Successfully imported ${imported.length} transactions from CSV!`);
          window.location.reload();
        } else {
          alert(`Import failed: ${errors.join(', ')}`);
        }
      }
    };
    reader.readAsText(file);
  };

  const catList = categories || [];
  const defaultCategories = catList.filter(c => c && c.isDefault);
  const customCategories = catList.filter(c => c && !c.isDefault);

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Settings & Preferences
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure Google Sheets sync, custom categories, SMS detection, and app data
        </p>
      </div>

      {/* SECTION 1: GOOGLE ACCOUNT & SHEETS (Section 30, 31) */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/60 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Google Sheets Integration
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cloud synchronization & live backups
              </p>
            </div>
          </div>

          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            <span>Connected</span>
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3.5 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Google Account:</span>
            <span className="font-semibold text-slate-900 dark:text-white">{sheetsConfig.userEmail}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Spreadsheet:</span>
            <span className="font-semibold text-slate-900 dark:text-white">{sheetsConfig.spreadsheetName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Worksheet:</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{sheetsConfig.sheetName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Last Synced:</span>
            <span className="text-slate-600 dark:text-slate-300">
              {sheetsConfig.lastSyncTime ? new Date(sheetsConfig.lastSyncTime).toLocaleTimeString() : 'Never'}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing...' : 'Sync Now with Sheets'}</span>
          </button>

          <button
            onClick={() => onUpdateSheetsConfig({ ...sheetsConfig, autoSync: !sheetsConfig.autoSync })}
            className={`px-3 py-2.5 rounded-xl text-xs font-semibold border ${
              sheetsConfig.autoSync
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600'
            }`}
          >
            Auto-Sync: {sheetsConfig.autoSync ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* SECTION 2: CUSTOM CATEGORIES (Mandatory Feature - Sections 16, 17, 18, 19) */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/60 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Expense Categories & Rules
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Custom categories, budgets & keyword triggers
              </p>
            </div>
          </div>

          <button
            onClick={openAddCategory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Category</span>
          </button>
        </div>

        {/* My Custom Categories */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            My Custom Categories ({customCategories.length})
          </h4>

          {customCategories.length === 0 ? (
            <div className="bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/30 rounded-xl p-4 text-center text-xs text-slate-600 dark:text-slate-300">
              <p>No custom categories created yet.</p>
              <button
                onClick={openAddCategory}
                className="text-purple-600 dark:text-purple-400 font-semibold underline mt-1 block mx-auto"
              >
                + Create your first custom category (e.g. Pet Expenses, Home Repair)
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {customCategories.map(cat => (
                <div
                  key={cat.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-base shadow-2xs"
                      style={{ backgroundColor: `${cat.color}20` }}
                    >
                      {cat.icon}
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                        {cat.name}
                      </h5>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[130px]">
                        Keywords: {cat.keywords.join(', ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditCategory(cat)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                      title="Edit Category & Rules"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteCategory(cat.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                      title="Delete Custom Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Default Categories Preview */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Standard Default Categories ({defaultCategories.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {defaultCategories.map(cat => (
              <span
                key={cat.id}
                onClick={() => openEditCategory(cat)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3: AUTOMATIC SMS DETECTION PREFERENCES (Sections 8, 9, 10) */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/60 space-y-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              SMS Expense Detection
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Indian bank & UPI transaction parsing
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2 text-xs">
          {/* SMS Detection toggle */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-900 dark:text-white block">
                Automatic SMS Detection
              </span>
              <span className="text-slate-500">Scan incoming bank SMS for eligible expenses</span>
            </div>
            <input
              type="checkbox"
              checked={settings.smsDetectionEnabled}
              onChange={e => onUpdateSettings({ ...settings, smsDetectionEnabled: e.target.checked })}
              className="w-4 h-4 accent-indigo-600"
            />
          </div>

          {/* Confirmation Mode */}
          <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-700">
            <label className="font-semibold text-slate-900 dark:text-white block">
              Confirmation Mode
            </label>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { id: 'uncertain', label: 'Ask if Uncertain' },
                { id: 'always', label: 'Always Ask' },
                { id: 'never', label: 'Auto Record' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => onUpdateSettings({ ...settings, confirmationMode: m.id as any })}
                  className={`py-2 rounded-xl text-xs font-semibold border ${
                    settings.confirmationMode === m.id
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Confidence Slider */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-700">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-900 dark:text-white">
                Auto-Record Confidence Threshold
              </span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {Math.round(settings.confidenceThreshold * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="0.95"
              step="0.05"
              value={settings.confidenceThreshold}
              onChange={e => onUpdateSettings({ ...settings, confidenceThreshold: parseFloat(e.target.value) })}
              className="w-full accent-indigo-600"
            />
            <span className="text-[11px] text-slate-400 block">
              Transactions with confidence at or above this threshold are recorded automatically without confirmation popups.
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 4: DATA EXPORT / IMPORT (Section 33) */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/60 space-y-4 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
          Data Management & Backup
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-purple-500" />
            <span>Export JSON Backup</span>
          </button>

          <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 text-emerald-500" />
            <span>Import CSV</span>
            <input type="file" accept=".csv" onChange={handleImportCsv} className="hidden" />
          </label>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={() => setShowPrivacyModal(true)}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy Policy & Permissions</span>
          </button>

          <button
            onClick={onResetData}
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
          >
            Reset Sample Data
          </button>
        </div>
      </div>

      {/* SECTION 5: ANDROID STUDIO CODE EXPORTER (Section 60) */}
      <div className="bg-gradient-to-r from-purple-900/90 to-indigo-950 rounded-2xl p-5 text-white space-y-4 shadow-xl border border-purple-800/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                Android Studio Project Source Code
              </h3>
              <p className="text-xs text-purple-200">
                Complete Kotlin, Jetpack Compose, Room DB & Gradle Codebase
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-purple-100 leading-relaxed">
          The full production Android codebase is built with Clean Architecture, Hilt DI, Room SQLite DB, WorkManager, SMS Broadcast Receiver, and Material 3 Compose UI.
        </p>

        <div className="flex gap-2.5">
          <button
            onClick={downloadAndroidProjectZip}
            className="flex-1 py-2.5 rounded-xl bg-white text-purple-950 font-bold text-xs flex items-center justify-center gap-2 hover:bg-purple-50 active:scale-98 transition-all shadow-md"
          >
            <Download className="w-4 h-4 text-purple-700" />
            <span>Download Android Project (ZIP)</span>
          </button>

          <button
            onClick={onOpenCodeInspector}
            className="px-4 py-2.5 rounded-xl bg-purple-800/60 hover:bg-purple-700/60 text-white font-semibold text-xs border border-purple-600/40 transition-colors"
          >
            Inspect Source
          </button>
        </div>
      </div>

      {/* ADD / EDIT CUSTOM CATEGORY MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-600" />
                <span>{editingCategory ? 'Edit Category & Rules' : 'Create Custom Category'}</span>
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3.5">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                  placeholder="e.g. Pet Expenses, Home Repair, Subscriptions"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              {/* Icon Picker */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Choose Icon / Emoji
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {PRESET_ICONS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setCatIcon(emoji)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-base border transition-transform ${
                        catIcon === emoji
                          ? 'border-purple-600 bg-purple-100 dark:bg-purple-950 scale-110'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Color Tag
                </label>
                <div className="flex items-center gap-2">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setCatColor(color)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        catColor === color ? 'ring-2 ring-offset-2 ring-purple-600 scale-115' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Monthly Budget */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Monthly Budget (Optional, ₹)
                </label>
                <input
                  type="number"
                  value={catBudget}
                  onChange={e => setCatBudget(e.target.value)}
                  placeholder="3000"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              {/* Keyword Matching Rules (Section 19) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Automatic SMS Keyword Rules (comma separated) *
                </label>
                <textarea
                  rows={2}
                  value={catKeywords}
                  onChange={e => setCatKeywords(e.target.value)}
                  placeholder="e.g. petshop, vet, dog food, pedigree, clinic"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
                <span className="text-[10px] text-slate-400 block">
                  Incoming transaction SMS containing any of these keywords will automatically suggest this category.
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-sm"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRIVACY & PERMISSIONS MODAL (Sections 36, 37) */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span>Privacy & Android Permissions</span>
              </h3>
              <button onClick={() => setShowPrivacyModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <h4 className="font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                  Why SMS Access is Needed:
                </h4>
                <p>
                  This app reads transaction SMS messages to automatically identify your expenses. Only relevant financial information (amount, merchant name, date, and payment mode) is used for expense tracking.
                </p>
              </div>

              <h4 className="font-bold text-slate-900 dark:text-white">Strict Privacy Guarantees:</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Your SMS messages are processed 100% locally on your device.</li>
                <li>No OTPs, personal messages, or chat texts are ever read or logged.</li>
                <li>Your financial data is never sold or shared with external AI servers.</li>
                <li>All cloud syncing is performed directly with YOUR personal Google Account and Google Sheet.</li>
              </ul>
            </div>

            <button
              onClick={() => setShowPrivacyModal(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs"
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
