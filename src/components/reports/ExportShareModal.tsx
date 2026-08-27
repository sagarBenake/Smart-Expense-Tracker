import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  Printer, 
  Sparkles,
  ExternalLink 
} from 'lucide-react';
import { AdvancedSpendingReport, Transaction } from '../../types';
import { exportReportCSV, exportReportJSON } from '../../services/reportEngine';
import { formatINR } from '../../utils/formatters';

interface ExportShareModalProps {
  report: AdvancedSpendingReport;
  transactions: Transaction[];
  onClose: () => void;
}

export const ExportShareModal: React.FC<ExportShareModalProps> = ({
  report,
  transactions,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Generate plain text summary for WhatsApp / SMS / Telegram sharing (Section 30)
  const shareText = `📊 *SmartExpense Report Summary*
📅 *Period:* ${report.dateRangeLabel}
💸 *Total Expenses:* ${formatINR(report.totalSpending)} (${report.transactionCount} transactions)
💰 *Total Income:* ${formatINR(report.totalIncome)}
📈 *Daily Average:* ${formatINR(report.dailyAverage)}
🏆 *Top Category:* ${report.highestSpendingCategory?.name || 'N/A'} (${formatINR(report.highestSpendingCategory?.amount || 0)})
🏪 *Top Merchant:* ${report.topMerchants[0]?.merchant || 'N/A'} (${formatINR(report.topMerchants[0]?.amount || 0)})
⚡ Generated via Smart Expense Tracker`;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `SmartExpense Report - ${report.dateRangeLabel}`,
          text: shareText,
        });
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      handleCopyText();
    }
  };

  const handleDownloadCSV = () => {
    const csvContent = exportReportCSV(transactions, report);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Expense_Report_${report.fromDate}_to_${report.toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadSuccess('CSV spreadsheet downloaded successfully!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const jsonStr = exportReportJSON(report, transactions);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Expense_Analytics_${report.fromDate}_to_${report.toDate}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadSuccess('Raw JSON data exported successfully!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Export & Share Report
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Download PDF/CSV or share WhatsApp breakdown
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {downloadSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Share preview box */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Shareable Summary Card</span>
            <button
              type="button"
              onClick={handleCopyText}
              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-[11px]"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied!' : 'Copy text'}</span>
            </button>
          </div>
          <pre className="text-[11px] font-sans text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed bg-white dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            {shareText}
          </pre>
        </div>

        {/* Export Options Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleDownloadCSV}
            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 border border-slate-200 dark:border-slate-700/80 flex flex-col items-start gap-1 transition-all text-left group"
          >
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white mt-1">
              CSV Spreadsheet
            </span>
            <span className="text-[10px] text-slate-500">
              Excel, Numbers, Sheets
            </span>
          </button>

          <button
            type="button"
            onClick={handlePrintPDF}
            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 border border-slate-200 dark:border-slate-700/80 flex flex-col items-start gap-1 transition-all text-left group"
          >
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <Printer className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white mt-1">
              Print / Save PDF
            </span>
            <span className="text-[10px] text-slate-500">
              Clean printable layout
            </span>
          </button>

          <button
            type="button"
            onClick={handleNativeShare}
            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 border border-slate-200 dark:border-slate-700/80 flex flex-col items-start gap-1 transition-all text-left group"
          >
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Share2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white mt-1">
              Share Summary
            </span>
            <span className="text-[10px] text-slate-500">
              WhatsApp, Telegram, etc.
            </span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJSON}
            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 border border-slate-200 dark:border-slate-700/80 flex flex-col items-start gap-1 transition-all text-left group"
          >
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white mt-1">
              Raw JSON Data
            </span>
            <span className="text-[10px] text-slate-500">
              Structured export
            </span>
          </button>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
