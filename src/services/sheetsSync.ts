import { GoogleSheetsConfig, Transaction } from '../types';
import { storageService } from './storageService';

export const SHEETS_COLUMNS = [
  'Transaction ID',
  'Date',
  'Time',
  'Merchant',
  'Amount',
  'Category',
  'Payment Method',
  'Transaction Type',
  'Source',
  'Bank',
  'Account Last 4',
  'Reference ID',
  'Notes',
  'Created At',
  'Updated At',
] as const;

export class SheetsSyncService {
  /**
   * Convert list of transactions into formatted Google Sheets / CSV rows
   */
  generateCsvContent(transactions: Transaction[]): string {
    const header = SHEETS_COLUMNS.join(',');
    const rows = transactions.map(t => {
      return [
        `"${t.id}"`,
        `"${t.date}"`,
        `"${t.time}"`,
        `"${t.merchant.replace(/"/g, '""')}"`,
        t.amount,
        `"${t.categoryName.replace(/"/g, '""')}"`,
        `"${t.paymentMethod}"`,
        `"${t.transactionType}"`,
        `"${t.source}"`,
        `"${t.bank || ''}"`,
        `"${t.accountLast4 || ''}"`,
        `"${t.referenceId || ''}"`,
        `"${(t.notes || '').replace(/"/g, '""')}"`,
        `"${t.createdAt}"`,
        `"${t.updatedAt}"`,
      ].join(',');
    });
    return [header, ...rows].join('\n');
  }

  /**
   * Parse CSV content into transactions
   */
  parseCsv(csvText: string): { transactions: Partial<Transaction>[]; errors: string[] } {
    const lines = csvText.trim().split(/\r?\n/);
    const transactions: Partial<Transaction>[] = [];
    const errors: string[] = [];

    if (lines.length < 2) {
      return { transactions: [], errors: ['CSV file is empty or missing headers'] };
    }

    const header = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    // Find column indexes
    const idxId = header.indexOf('Transaction ID');
    const idxDate = header.indexOf('Date');
    const idxTime = header.indexOf('Time');
    const idxMerchant = header.indexOf('Merchant');
    const idxAmount = header.indexOf('Amount');
    const idxCategory = header.indexOf('Category');
    const idxMethod = header.indexOf('Payment Method');
    const idxNotes = header.indexOf('Notes');

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle simple CSV parsing
      const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
      const cols = matches.map(c => c.replace(/^"|"$/g, '').trim());

      try {
        const amount = parseFloat(cols[idxAmount >= 0 ? idxAmount : 4]);
        const merchant = cols[idxMerchant >= 0 ? idxMerchant : 3] || 'Unknown Merchant';
        const date = cols[idxDate >= 0 ? idxDate : 1] || new Date().toISOString().slice(0, 10);
        const time = cols[idxTime >= 0 ? idxTime : 2] || '12:00';
        const categoryName = cols[idxCategory >= 0 ? idxCategory : 5] || 'Other';
        const paymentMethod = (cols[idxMethod >= 0 ? idxMethod : 6] || 'UPI') as any;
        const notes = cols[idxNotes >= 0 ? idxNotes : 12] || '';

        if (isNaN(amount) || amount <= 0) {
          errors.push(`Row ${i + 1}: Invalid amount`);
          continue;
        }

        transactions.push({
          amount,
          merchant,
          date,
          time,
          categoryName,
          paymentMethod,
          notes,
          transactionType: 'Expense',
          source: 'import',
          isConfirmed: true,
          confidenceScore: 1.0,
        });
      } catch (e: any) {
        errors.push(`Row ${i + 1}: ${e.message}`);
      }
    }

    return { transactions, errors };
  }

  /**
   * Simulates Google Sheets sync with callbacks
   */
  async simulateGoogleSheetsSync(
    transactions: Transaction[],
    config: GoogleSheetsConfig,
    onSuccess?: (updated: Transaction[]) => void
  ): Promise<{ success: boolean; recordsSynced: number; message: string }> {
    await new Promise(r => setTimeout(r, 1000));
    const updated = transactions.map(t => ({ ...t, syncStatus: 'synced' as const }));
    if (onSuccess) onSuccess(updated);
    return {
      success: true,
      recordsSynced: transactions.length,
      message: `Successfully synchronized with worksheet "${config.sheetName}" in "${config.spreadsheetName}".`,
    };
  }

  /**
   * Simulates full bi-directional synchronization with Google Sheets API
   */
  async processSyncQueue(): Promise<{ success: boolean; syncedCount: number; message: string }> {
    const queue = storageService.getSyncQueue();
    const config = storageService.getSheetsConfig();

    if (!config.isConnected) {
      return { success: false, syncedCount: 0, message: 'Google Sheets is not connected.' };
    }

    if (queue.length === 0) {
      return { success: true, syncedCount: 0, message: 'All transactions are already synchronized.' };
    }

    // Simulate network delay
    await new Promise(r => setTimeout(r, 900));

    // Mark pending transactions as synced
    const transactions = storageService.getTransactions();
    const updatedTxns = transactions.map(t => ({
      ...t,
      syncStatus: 'synced' as const,
    }));
    storageService.saveTransactions(updatedTxns);

    // Clear completed queue
    const syncedCount = queue.length;
    storageService.saveSyncQueue([]);

    // Update config lastSyncTime
    config.lastSyncTime = new Date().toISOString();
    storageService.saveSheetsConfig(config);

    // Record notification
    storageService.addNotification({
      title: '✓ Google Sheets Synced',
      message: `Successfully synchronized ${syncedCount} transaction${syncedCount > 1 ? 's' : ''} to "${config.spreadsheetName}".`,
      type: 'sync',
    });

    return {
      success: true,
      syncedCount,
      message: `Synchronized ${syncedCount} changes to Google Sheets.`,
    };
  }

  /**
   * Trigger download of CSV or JSON
   */
  downloadFile(content: string, fileName: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const sheetsSyncService = new SheetsSyncService();
