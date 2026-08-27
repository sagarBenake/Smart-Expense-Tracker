import React from 'react';
import { Bell, Code2, MessageSquareText, Shield, RefreshCw, Moon, Sun } from 'lucide-react';
import { AppSettings, NotificationItem } from '../types';

interface NavbarProps {
  notifications?: NotificationItem[];
  unreadNotificationCount?: number;
  settings?: AppSettings;
  onOpenNotifications?: () => void;
  onOpenSmsSimulator?: () => void;
  onOpenCodeInspector?: () => void;
  onQuickSync?: () => void;
  onToggleTheme?: () => void;
  isSyncing?: boolean;
  pendingSyncCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  notifications = [],
  unreadNotificationCount,
  settings,
  onOpenNotifications,
  onOpenSmsSimulator,
  onOpenCodeInspector,
  onQuickSync,
  onToggleTheme,
  isSyncing = false,
  pendingSyncCount = 0,
}) => {
  const unreadCount = unreadNotificationCount !== undefined 
    ? unreadNotificationCount 
    : (notifications || []).filter(n => !n.read).length;

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md border-b border-slate-800">
      {/* Android Device Status Bar Simulation */}
      <div className="bg-slate-950/80 px-4 py-1 flex items-center justify-between text-[11px] text-slate-400 font-mono select-none">
        <span className="font-semibold text-slate-300">09:41 AM</span>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-950/80 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            SMS Active
          </span>
          <span>5G • 85%</span>
        </div>
      </div>

      {/* Main Material 3 Top App Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 font-bold text-lg">
            ₹
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base tracking-tight text-white">Smart Expense Tracker</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Android
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>Offline-First • Google Sheets Sync</span>
            </p>
          </div>
        </div>

        {/* Quick Action Badges */}
        <div className="flex items-center gap-2">
          {/* Quick Sync Button */}
          {onQuickSync && (
            <button
              onClick={onQuickSync}
              title={pendingSyncCount > 0 ? `${pendingSyncCount} pending sync` : 'All synced'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors border border-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isSyncing ? 'Syncing...' : pendingSyncCount > 0 ? `${pendingSyncCount} Sync` : 'Synced'}
              </span>
            </button>
          )}

          {/* SMS Simulator Sandbox Button */}
          {onOpenSmsSimulator && (
            <button
              onClick={onOpenSmsSimulator}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all shadow-sm shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <MessageSquareText className="w-3.5 h-3.5" />
              <span>Test SMS</span>
            </button>
          )}

          {/* Android Code Explorer Button */}
          {onOpenCodeInspector && (
            <button
              onClick={onOpenCodeInspector}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors border border-slate-700"
              title="Inspect Android Kotlin Codebase & Export ZIP"
            >
              <Code2 className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden md:inline">Android Code</span>
            </button>
          )}

          {/* Dark / Light Toggle */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
              title="Toggle Theme"
            >
              {settings?.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>
          )}

          {/* Notifications Bell */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
