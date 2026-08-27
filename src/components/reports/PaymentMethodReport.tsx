import React from 'react';
import { CreditCard, Smartphone, Wallet, Landmark, DollarSign, ArrowRight } from 'lucide-react';
import { AdvancedSpendingReport, PaymentMethodType } from '../../types';
import { formatINR } from '../../utils/formatters';

interface PaymentMethodReportProps {
  report: AdvancedSpendingReport;
  onSelectPaymentMethod: (pm: PaymentMethodType) => void;
}

export const PaymentMethodReport: React.FC<PaymentMethodReportProps> = ({
  report,
  onSelectPaymentMethod,
}) => {
  const breakdown = report.paymentMethodBreakdown || [];
  const totalSpending = report.totalSpending || 1;

  const getMethodIcon = (method: PaymentMethodType) => {
    switch (method) {
      case 'UPI':
        return <Smartphone className="w-4 h-4 text-emerald-500" />;
      case 'Credit Card':
        return <CreditCard className="w-4 h-4 text-purple-500" />;
      case 'Debit Card':
        return <CreditCard className="w-4 h-4 text-blue-500" />;
      case 'Net Banking':
      case 'Bank Transfer':
        return <Landmark className="w-4 h-4 text-amber-500" />;
      case 'Cash':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'Wallet':
        return <Wallet className="w-4 h-4 text-pink-500" />;
      default:
        return <CreditCard className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Payment Method Breakdown
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Distribution across payment channels & modes
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
          {breakdown.length} modes
        </span>
      </div>

      {/* Multi-segmented distribution bar */}
      <div className="space-y-1.5">
        <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-700 flex overflow-hidden p-0.5 gap-0.5">
          {breakdown.map((pm, i) => {
            const colors = [
              'bg-emerald-500',
              'bg-purple-500',
              'bg-blue-500',
              'bg-amber-500',
              'bg-rose-500',
              'bg-indigo-500',
            ];
            return (
              <div
                key={pm.method}
                style={{ width: `${pm.percentage}%` }}
                className={`${colors[i % colors.length]} h-full rounded-xs transition-all duration-500`}
                title={`${pm.method}: ${pm.percentage}% (${formatINR(pm.amount)})`}
              />
            );
          })}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {breakdown.map(pm => (
          <button
            key={pm.method}
            type="button"
            onClick={() => onSelectPaymentMethod(pm.method)}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 border border-slate-200/80 dark:border-slate-700/80 transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-2xs border border-slate-200/60 dark:border-slate-700/60">
                  {getMethodIcon(pm.method)}
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {pm.method}
                </span>
              </div>
              <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                {pm.percentage}%
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                {formatINR(pm.amount)}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {pm.count} transactions
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
