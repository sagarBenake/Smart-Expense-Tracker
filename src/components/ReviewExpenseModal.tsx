import React from 'react';
import { Sparkles, Check, Edit2, XCircle, CreditCard, Tag, Building, Smartphone } from 'lucide-react';
import { Category, Transaction } from '../types';
import { formatINR } from '../utils/formatters';

interface ReviewExpenseModalProps {
  transaction: Transaction;
  categories?: Category[];
  onConfirm: (tx: Transaction) => void;
  onEdit: (tx: Transaction) => void;
  onIgnore: () => void;
}

export const ReviewExpenseModal: React.FC<ReviewExpenseModalProps> = ({
  transaction,
  categories: _categories,
  onConfirm,
  onEdit,
  onIgnore,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-scaleUp">
        {/* Header with animated icon */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              New Expense Detected
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              An incoming transaction SMS was received
            </p>
          </div>
        </div>

        {/* Detected Info Box (Section 11) */}
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 space-y-2.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Merchant:</span>
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              {transaction.merchant}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Amount:</span>
            <span className="font-extrabold text-base text-rose-600 dark:text-rose-400">
              {formatINR(transaction.amount)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Category:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <span>{transaction.categoryIcon}</span>
              <span>{transaction.categoryName}</span>
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Payment Mode:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {transaction.paymentMethod} {transaction.bank ? `(${transaction.bank})` : ''}
            </span>
          </div>

          {transaction.accountLast4 && (
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Account Ending:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                •••• {transaction.accountLast4}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons (Section 11: Confirm, Edit, Ignore) */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => onConfirm(transaction)}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Confirm Expense</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(transaction)}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>

            <button
              onClick={onIgnore}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-500 dark:text-slate-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>Ignore</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
