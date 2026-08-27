import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Edit2, 
  Calendar, 
  Clock, 
  CreditCard, 
  Tag, 
  Building, 
  Hash, 
  FileText, 
  CheckCircle2, 
  Camera, 
  ShieldCheck,
  Smartphone,
  Layers
} from 'lucide-react';
import { Category, PaymentMethodType, Transaction } from '../types';
import { formatDateIndian, formatINR, formatTime12H } from '../utils/formatters';

interface TransactionDetailModalProps {
  transaction: Transaction;
  categories?: Category[];
  onClose: () => void;
  onUpdate: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  categories = [],
  onClose,
  onUpdate,
  onDelete,
}) => {
  const catList = categories || [];
  const [isEditing, setIsEditing] = useState(false);

  const [merchant, setMerchant] = useState(transaction.merchant);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [categoryId, setCategoryId] = useState(transaction.categoryId);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(transaction.paymentMethod);
  const [date, setDate] = useState(transaction.date);
  const [time, setTime] = useState(transaction.time);
  const [notes, setNotes] = useState(transaction.notes || '');

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const matchedCat = catList.find(c => c && c.id === categoryId) || {
      name: transaction.categoryName,
      icon: transaction.categoryIcon,
      color: transaction.categoryColor,
    };

    onUpdate({
      ...transaction,
      merchant: merchant.trim(),
      amount: parsedAmount,
      categoryId,
      categoryName: matchedCat.name,
      categoryIcon: matchedCat.icon,
      categoryColor: matchedCat.color,
      paymentMethod,
      date,
      time,
      notes: notes.trim() || undefined,
    });

    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete this ${formatINR(transaction.amount)} expense at ${transaction.merchant}?`)) {
      onDelete(transaction.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-xs"
              style={{ backgroundColor: `${transaction.categoryColor}20` }}
            >
              {transaction.categoryIcon}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white truncate max-w-[200px]">
                {transaction.merchant}
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {transaction.categoryName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-slate-500 hover:text-indigo-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
                title="Edit Transaction"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleDelete}
              className="p-2 text-slate-500 hover:text-rose-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
              title="Delete Transaction"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isEditing ? (
          /* EDIT MODE */
          <form onSubmit={handleSaveEdit} className="space-y-3.5 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Amount (₹)
              </label>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-base text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Merchant
              </label>
              <input
                type="text"
                required
                value={merchant}
                onChange={e => setMerchant(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Category
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                {catList.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                <option value="UPI">UPI</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Cash">Cash</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Wallet">Wallet</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add notes..."
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          /* READ VIEW */
          <div className="space-y-4">
            {/* Amount Hero */}
            <div className="text-center py-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-700/60">
              <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
                -{formatINR(transaction.amount)}
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">
                {transaction.transactionType}
              </span>
            </div>

            {/* Metadata Fields (Section 22) */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700 text-xs">
              <div className="p-3 flex justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Date & Time</span>
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatDateIndian(transaction.date)}, {formatTime12H(transaction.time)}
                </span>
              </div>

              <div className="p-3 flex justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>Payment Method</span>
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {transaction.paymentMethod}
                </span>
              </div>

              {transaction.bank && (
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>Bank / Provider</span>
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {transaction.bank}
                  </span>
                </div>
              )}

              {transaction.accountLast4 && (
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    <span>Account/Card Last 4</span>
                  </span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    •••• {transaction.accountLast4}
                  </span>
                </div>
              )}

              {transaction.referenceId && (
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>Reference ID</span>
                  </span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    {transaction.referenceId}
                  </span>
                </div>
              )}

              <div className="p-3 flex justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Detection Source</span>
                </span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded-full ${
                    transaction.source === 'sms'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {transaction.source === 'sms' ? 'SMS Auto Detected' : 'Manual Entry'}
                </span>
              </div>

              {transaction.notes && (
                <div className="p-3 space-y-1">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Notes</span>
                  </span>
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    {transaction.notes}
                  </p>
                </div>
              )}

              {transaction.rawSmsText && (
                <div className="p-3 space-y-1 bg-slate-50 dark:bg-slate-900/40 rounded-b-2xl">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    Raw SMS Message
                  </span>
                  <p className="font-mono text-[11px] text-slate-600 dark:text-slate-400 break-words">
                    {transaction.rawSmsText}
                  </p>
                </div>
              )}
            </div>

            {/* Receipt Photo */}
            {transaction.receiptUri && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-slate-400" />
                  <span>Attached Receipt</span>
                </span>
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 h-36 flex items-center justify-center">
                  <img src={transaction.receiptUri} alt="Receipt" className="h-full object-contain" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
