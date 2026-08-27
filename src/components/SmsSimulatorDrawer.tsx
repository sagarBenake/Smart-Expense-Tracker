import React, { useState, useMemo } from 'react';
import { 
  X, 
  MessageSquareText, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ShieldAlert,
  Send,
  Zap
} from 'lucide-react';
import { Category, Transaction } from '../types';
import { parseTransactionSms } from '../utils/smsParser';
import { formatINR } from '../utils/formatters';

interface SmsSimulatorDrawerProps {
  categories?: Category[];
  onClose: () => void;
  onRecordExpense: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => void;
  onSimulateIncomingSms: (smsBody: string, sender: string) => void;
  isDuplicateCheck: (smsHash?: string, referenceId?: string, amount?: number, merchant?: string, date?: string) => boolean;
}

const SMS_PRESETS = [
  {
    label: 'HDFC • Amazon Rs. 499',
    sender: 'HDFCBK',
    body: 'Your A/C XX1234 is debited by Rs. 499.00 at AMAZON on 27-AUG-26. Info: UPI/328492/Amazon. Bal: INR 12,450.00',
  },
  {
    label: 'SBI • Swiggy UPI Rs. 250',
    sender: 'SBIPAY',
    body: 'UPI transaction of INR 250.00 paid to SWIGGY. Ref UPI123456 from A/C 9876 on 27Aug26.',
  },
  {
    label: 'ICICI • Uber Ride Rs. 280',
    sender: 'ICICIB',
    body: 'Acct XX4567 debited with INR 280.00 on 27-Aug-26 at UBER TRIP. UPI Ref 3829103849. Avail Bal INR 8,420.',
  },
  {
    label: 'HDFC CC • Flipkart Rs. 1,250',
    sender: 'HDFC-CARD',
    body: 'Rs 1,250.00 spent on your HDFC Bank credit card ending 5678 at FLIPKART on 27-Aug-26.',
  },
  {
    label: 'Axis • Bescom Bill Rs. 3,200',
    sender: 'AXISBK',
    body: 'Your account 3412 is debited by INR 3,200.00 for BESCOM ELECTRICITY BILL on 27-Aug-26. Ref AX940291.',
  },
  {
    label: 'HDFC • Shell Fuel Rs. 2,200',
    sender: 'HDFCBK',
    body: 'Your A/C XX1234 is debited by Rs. 2200.00 at SHELL PETROL STATION on 27-Aug-26.',
  },
  {
    label: 'Custom Category Rule • Pet Clinic Rs. 1,450',
    sender: 'PAYTM',
    body: 'Paid Rs. 1,450 to PET CLINIC & VET CARE via UPI Ref 94028401 from A/C 1234.',
  },
  {
    label: 'ICICI • Salary Credit Rs. 50,000 (IGNORED)',
    sender: 'ICICIB',
    body: 'Your account XXXX1234 credited with INR 50000 on 27-Aug-2026 towards Monthly Salary. Avl Bal: INR 62,450.',
  },
  {
    label: 'HDFC • Login OTP (IGNORED)',
    sender: 'HDFCBK',
    body: '482910 is your OTP for NetBanking login at HDFC Bank. Do not share OTP with anyone.',
  },
];

export const SmsSimulatorDrawer: React.FC<SmsSimulatorDrawerProps> = ({
  categories,
  onClose,
  onRecordExpense,
  onSimulateIncomingSms,
  isDuplicateCheck,
}) => {
  const [selectedSender, setSelectedSender] = useState('HDFCBK');
  const [smsText, setSmsText] = useState(SMS_PRESETS[0].body);

  // Live parse result
  const parsed = useMemo(() => {
    return parseTransactionSms(smsText, selectedSender, categories);
  }, [smsText, selectedSender, categories]);

  const isDuplicate = useMemo(() => {
    return isDuplicateCheck(
      parsed.rawSmsHash,
      parsed.referenceId,
      parsed.amount || undefined,
      parsed.merchant,
      new Date().toISOString().slice(0, 10)
    );
  }, [parsed, isDuplicateCheck]);

  const handleRecord = () => {
    if (!parsed.amount || !parsed.isDebit || parsed.isOtpOrSpam) {
      alert('This SMS is not an eligible debit expense.');
      return;
    }

    if (isDuplicate) {
      const confirmDup = confirm('This transaction appears to already exist. Record anyway?');
      if (!confirmDup) return;
    }

    const now = new Date();
    onRecordExpense({
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
      notes: `Auto-parsed from ${parsed.bank} SMS`,
      isConfirmed: parsed.confidenceScore >= 0.85,
      confidenceScore: parsed.confidenceScore,
      smsHash: parsed.rawSmsHash,
      rawSmsText: parsed.rawText,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-scaleUp max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <MessageSquareText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                SMS Transaction Sandbox
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Test Indian Bank & UPI regex parsing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Select Indian Bank / UPI Preset
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
            {SMS_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedSender(preset.sender);
                  setSmsText(preset.body);
                }}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                  smsText === preset.body
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* SMS Text Area */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Sender: <strong className="text-indigo-600 dark:text-indigo-400">{selectedSender}</strong>
            </span>
            <span className="text-slate-400">Edit text below to test live</span>
          </div>
          <textarea
            rows={3}
            value={smsText}
            onChange={e => setSmsText(e.target.value)}
            placeholder="Paste your transaction SMS here..."
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        {/* Live Parsing Results Card */}
        <div className="bg-slate-50 dark:bg-slate-900/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Extracted Transaction Data</span>
            </h4>

            {/* Confidence Score Pill */}
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                parsed.isOtpOrSpam
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                  : parsed.confidenceScore >= 0.85
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
              }`}
            >
              <span>{Math.round(parsed.confidenceScore * 100)}% Confidence</span>
            </span>
          </div>

          {parsed.isOtpOrSpam ? (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <div>
                <strong className="block font-semibold">Discarded / Non-Expense Message</strong>
                <span>{parsed.reasons[0] || 'Contains OTP, promo, or balance inquiry.'}</span>
              </div>
            </div>
          ) : parsed.isCredit ? (
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <strong className="block font-semibold">Incoming Credit Transaction</strong>
                <span>Money was credited to your account. This is not recorded as an expense.</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 text-[10px] block">Amount</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {parsed.amount ? formatINR(parsed.amount) : 'Not detected'}
                </span>
              </div>

              <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 text-[10px] block">Merchant</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white truncate block">
                  {parsed.merchant}
                </span>
              </div>

              <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 text-[10px] block">Category Rule Match</span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mt-0.5">
                  <span>{parsed.suggestedCategoryIcon}</span>
                  <span className="truncate">{parsed.suggestedCategoryName}</span>
                </span>
              </div>

              <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 text-[10px] block">Payment Mode & Bank</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate block mt-0.5">
                  {parsed.paymentMethod} • {parsed.bank}
                </span>
              </div>
            </div>
          )}

          {/* Duplicate check badge */}
          {isDuplicate && (
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Duplicate detected: Transaction with same hash/amount already recorded.</span>
            </div>
          )}

          {/* Parsing Reasons log */}
          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Parser Evaluation Steps</span>
            <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5 list-disc pl-4">
              {parsed.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              onSimulateIncomingSms(smsText, selectedSender);
              onClose();
            }}
            className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Simulate Incoming SMS</span>
          </button>

          <button
            type="button"
            onClick={handleRecord}
            disabled={parsed.isOtpOrSpam || !parsed.isDebit || !parsed.amount}
            className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white text-xs font-bold shadow-md shadow-indigo-600/30 active:scale-98 transition-all flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Record as Expense</span>
          </button>
        </div>
      </div>
    </div>
  );
};
