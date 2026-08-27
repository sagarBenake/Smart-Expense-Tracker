import React from 'react';
import { X, Bell, CheckCircle2, AlertTriangle, MessageSquare, Info, Trash2 } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationsModalProps {
  notifications?: NotificationItem[];
  onClose: () => void;
  onMarkAllRead: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  notifications = [],
  onClose,
  onMarkAllRead,
}) => {
  const notifList = notifications || [];
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-scaleUp max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Notifications
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {notifList.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No notifications yet.
            </div>
          ) : (
            notifList.map(n => (
              <div
                key={n.id}
                className={`p-3 rounded-2xl border text-xs space-y-1 ${
                  !n.read
                    ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/40'
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {n.type === 'budget_warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                    {n.type === 'sync' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                    {n.type === 'sms_detected' && <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />}
                    {n.type === 'info' && <Info className="w-3.5 h-3.5 text-blue-500" />}
                    <span>{n.title}</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {n.message}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex-shrink-0">
          <button
            onClick={onMarkAllRead}
            className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-white text-xs font-semibold"
          >
            Mark all as read
          </button>
        </div>
      </div>
    </div>
  );
};
