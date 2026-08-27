import { Category, PaymentMethodType, SmsParsedResult, TransactionType } from '../types';
import { generateSimpleHash } from './formatters';

interface BankPattern {
  name: string;
  senderRegex: RegExp;
}

const KNOWN_BANKS: BankPattern[] = [
  { name: 'HDFC Bank', senderRegex: /(HDFC|HDFCBK|HDFCB)/i },
  { name: 'SBI', senderRegex: /(SBI|SBIINB|SBIPAY|SBICRD)/i },
  { name: 'ICICI Bank', senderRegex: /(ICICI|ICICIB|ICICIP)/i },
  { name: 'Axis Bank', senderRegex: /(AXIS|AXISBK|AXISBN)/i },
  { name: 'Kotak Mahindra Bank', senderRegex: /(KOTAK|KOTAKB)/i },
  { name: 'Bank of Baroda', senderRegex: /(BOB|BOBTXN|BARODA)/i },
  { name: 'Punjab National Bank', senderRegex: /(PNB|PNBTXN)/i },
  { name: 'Canara Bank', senderRegex: /(CANARA|CANBNK)/i },
  { name: 'Union Bank of India', senderRegex: /(UNIONB|UBIN)/i },
  { name: 'IndusInd Bank', senderRegex: /(INDUS|INDUSB)/i },
  { name: 'IDFC FIRST Bank', senderRegex: /(IDFC|IDFCFB)/i },
  { name: 'Yes Bank', senderRegex: /(YESBNK|YESBK)/i },
  { name: 'Paytm Payments Bank', senderRegex: /(PAYTM|PYTM)/i },
  { name: 'PhonePe', senderRegex: /(PHONEPE|PHONPE)/i },
  { name: 'Google Pay', senderRegex: /(GOOGLEPAY|GPAY)/i },
  { name: 'CRED', senderRegex: /(CRED|CREDTXN)/i },
  { name: 'Amazon Pay', senderRegex: /(AMAZONPAY|AMZNPAY)/i },
  { name: 'Federal Bank', senderRegex: /(FEDBNK|FEDERAL)/i },
  { name: 'AU Small Finance Bank', senderRegex: /(AUBANK|AUSFB)/i },
  { name: 'Standard Chartered', senderRegex: /(SCBL|STANCHAR)/i },
];

export function parseTransactionSms(
  smsBody: string,
  sender: string = '',
  categories: Category[] = []
): SmsParsedResult {
  const cleanBody = smsBody.trim();
  const lowerBody = cleanBody.toLowerCase();
  const reasons: string[] = [];

  // 1. Check for OTP / Security / Promo messages
  const isOtp = /(otp|verification code|one time password|security code|login with|secret code)\b/i.test(cleanBody);
  const isMarketing = /(pre-approved|apply for loan|cash prize|click here|congratulations you won|call now to activate|claim now|discount offer|instant loan)/i.test(cleanBody);
  const isBalanceOnly = /(your balance is|avl bal|available balance|clear balance|stmt for)\b/i.test(cleanBody) &&
    !/(debited|spent|paid|purchase|withdrawn|charged)/i.test(cleanBody);

  const isOtpOrSpam = isOtp || isMarketing || isBalanceOnly;
  if (isOtp) reasons.push('Message contains an OTP or authentication code');
  if (isMarketing) reasons.push('Message identified as promotional or marketing spam');
  if (isBalanceOnly) reasons.push('Message appears to be an informational balance alert only');

  // 2. Identify Bank / Provider
  let bank = 'Unknown Provider';
  const matchedBank = KNOWN_BANKS.find(b => b.senderRegex.test(sender) || b.senderRegex.test(cleanBody));
  if (matchedBank) {
    bank = matchedBank.name;
    reasons.push(`Identified provider: ${bank}`);
  } else if (/bank/i.test(cleanBody)) {
    const bankMatch = cleanBody.match(/([A-Z][a-zA-Z]+)\s+Bank/i);
    if (bankMatch) bank = `${bankMatch[1]} Bank`;
  }

  // 3. Determine Debit vs Credit
  const debitRegex = /(debited|spent|paid|purchase|withdrawn|charged|sent to|transfer to|payment of|deducted)/i;
  const creditRegex = /(credited|deposited|salary|refund|cashback|reversed|received|added to your)/i;

  const isDebit = debitRegex.test(cleanBody) && !/will be debited|if not requested/i.test(cleanBody);
  const isCredit = creditRegex.test(cleanBody) && !isDebit;

  let transactionType: TransactionType = 'Expense';
  if (isCredit) {
    transactionType = 'Credit';
    reasons.push('Transaction identified as incoming CREDIT (not an expense)');
  } else if (isDebit) {
    reasons.push('Debit keyword detected');
  }

  // 4. Extract Amount
  let amount: number | null = null;
  // Regex matches INR 499.00, Rs. 1,250, Rs 500, ₹420.50, INR 12,500 etc.
  const amountRegexes = [
    /(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,
    /(?:debited(?:\s+by|\s+with)?|spent|paid|purchase of|amounting to)\s*(?:rs\.?|inr|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /(?:sum of|transferred)\s*(?:rs\.?|inr|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /([\d,]+(?:\.\d{1,2})?)\s*(?:rs\.?|inr|₹)/i,
  ];

  for (const regex of amountRegexes) {
    const match = cleanBody.match(regex);
    if (match && match[1]) {
      const parsedNum = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(parsedNum) && parsedNum > 0) {
        amount = parsedNum;
        reasons.push(`Parsed amount: ₹${amount}`);
        break;
      }
    }
  }

  // 5. Extract Account / Card Last 4 digits
  let accountLast4: string | undefined;
  const accMatch = cleanBody.match(/(?:a\/c|acct|account|card|ending with|ending in|ending)\s*(?:no\.?)?\s*(?:x+|\*+|xx+|\.\.\.)*([0-9]{3,4})/i);
  if (accMatch && accMatch[1]) {
    accountLast4 = accMatch[1];
    reasons.push(`Detected account/card ending: ${accountLast4}`);
  }

  // 6. Extract Reference ID / UPI Ref
  let referenceId: string | undefined;
  const refMatch = cleanBody.match(/(?:ref|rrn|upi ref|reference|txn id|txn|id)\s*(?:no\.?)?\s*[:\-#]?\s*([a-zA-Z0-9]{6,20})/i);
  if (refMatch && refMatch[1]) {
    referenceId = refMatch[1];
    reasons.push(`Extracted reference: ${referenceId}`);
  }

  // 7. Extract Payment Method
  let paymentMethod: PaymentMethodType = 'UPI';
  if (/upi|vpa|gpay|phonepe|paytm upi/i.test(cleanBody)) {
    paymentMethod = 'UPI';
  } else if (/credit card|creditcard/i.test(cleanBody)) {
    paymentMethod = 'Credit Card';
  } else if (/debit card|debitcard|atm/i.test(cleanBody)) {
    paymentMethod = 'Debit Card';
  } else if (/net banking|netbanking|internet banking/i.test(cleanBody)) {
    paymentMethod = 'Net Banking';
  } else if (/wallet/i.test(cleanBody)) {
    paymentMethod = 'Wallet';
  } else if (/cash|withdrawn/i.test(cleanBody)) {
    paymentMethod = 'Cash';
  } else {
    paymentMethod = 'Bank Transfer';
  }
  reasons.push(`Payment method inferred: ${paymentMethod}`);

  // 8. Extract Merchant Name
  let merchant = 'Unknown Merchant';
  const merchantPatterns = [
    /(?:at|to|info:?\s*upi\/\d+\/|vpa\s+)\s*([A-Za-z0-9\s&.\-']{2,25})(?:\s+on|\s+ref|\s+dated|\s+bal|\.|\s*$)/i,
    /(?:paid to|transferred to|towards)\s+([A-Za-z0-9\s&.\-']{2,25})(?:\s+on|\s+ref|\s+via|\.|\s*$)/i,
    /(?:merchant:?\s*)([A-Za-z0-9\s&.\-']{2,25})/i,
    /(?:purchase at)\s+([A-Za-z0-9\s&.\-']{2,25})/i,
  ];

  for (const pat of merchantPatterns) {
    const match = cleanBody.match(pat);
    if (match && match[1]) {
      const candidate = match[1].trim()
        .replace(/^(the|a|an)\s+/i, '')
        .replace(/(?:vpa|ref|upi|avl|bal|your|ac).*$/i, '')
        .trim();
      
      if (candidate.length >= 2 && !/^(rs|inr|account|card|bank|on|dated)$/i.test(candidate)) {
        merchant = candidate.toUpperCase();
        reasons.push(`Extracted merchant: ${merchant}`);
        break;
      }
    }
  }

  // Fallback merchant check from known brands in body
  if (merchant === 'Unknown Merchant') {
    const knownBrands = [
      'AMAZON', 'SWIGGY', 'ZOMATO', 'FLIPKART', 'UBER', 'OLA', 'BLINKIT', 
      'ZEPTO', 'MYNTRA', 'BIGBASKET', 'DMART', 'MAKEMYTRIP', 'NETFLIX', 
      'SPOTIFY', 'AIRTEL', 'JIO', 'BOOKMYSHOW', 'APOLLO PHARMACY', 'SHELL',
      'INDIAN OIL', 'STARBUCKS', 'MCDONALDS', 'DOMINOS', 'KFC', 'RELIANCE'
    ];
    for (const brand of knownBrands) {
      if (new RegExp(`\\b${brand}\\b`, 'i').test(cleanBody)) {
        merchant = brand;
        reasons.push(`Matched known merchant keyword: ${brand}`);
        break;
      }
    }
  }

  // 9. Intelligent Category Matching with User Custom Categories First
  let suggestedCategoryId = 'cat_other';
  let suggestedCategoryName = 'Other';
  let suggestedCategoryIcon = '📦';
  let suggestedCategoryColor = '#94A3B8';
  const extractedKeywords: string[] = [];

  const activeCategories = (categories || []).filter(c => c && c.isActive);
  let bestScore = 0;

  // First check custom categories, then default ones
  for (const cat of activeCategories) {
    let score = 0;
    const catKeywords = cat.keywords || [];
    for (const kw of catKeywords) {
      if (!kw) continue;
      const kwLower = kw.toLowerCase().trim();
      if (!kwLower) continue;

      // Merchant match is weighted highest
      if (merchant.toLowerCase().includes(kwLower)) {
        score += 10;
        extractedKeywords.push(`Merchant keyword "${kw}" matches ${cat.name}`);
      }
      // SMS body match
      if (lowerBody.includes(kwLower)) {
        score += 3;
        extractedKeywords.push(`SMS keyword "${kw}" matches ${cat.name}`);
      }
    }

    if (score > bestScore) {
      bestScore = score;
      suggestedCategoryId = cat.id;
      suggestedCategoryName = cat.name;
      suggestedCategoryIcon = cat.icon;
      suggestedCategoryColor = cat.color;
    }
  }

  if (bestScore > 0) {
    reasons.push(`Categorized as "${suggestedCategoryName}" based on rule matching score (${bestScore})`);
  } else {
    reasons.push('No specific keyword matched; categorized as "Other"');
  }

  // 10. Calculate Confidence Score
  let confidence = 0.1;

  if (isOtpOrSpam) {
    confidence = 0.0;
  } else if (isCredit) {
    confidence = 0.15; // Low confidence for expense since it's credit
  } else {
    if (amount !== null && amount > 0) confidence += 0.35;
    if (isDebit) confidence += 0.25;
    if (merchant !== 'Unknown Merchant') confidence += 0.20;
    if (accountLast4 || referenceId) confidence += 0.10;
    if (matchedBank) confidence += 0.10;
  }

  confidence = Math.min(1.0, Math.max(0.0, parseFloat(confidence.toFixed(2))));
  reasons.push(`Final Confidence Score: ${Math.round(confidence * 100)}%`);

  // 11. Hash for duplicate detection
  const hashString = `${amount || 0}_${merchant}_${referenceId || ''}_${accountLast4 || ''}_${paymentMethod}`;
  const rawSmsHash = generateSimpleHash(hashString + cleanBody);

  return {
    amount,
    merchant,
    suggestedCategoryId,
    suggestedCategoryName,
    suggestedCategoryIcon,
    suggestedCategoryColor,
    paymentMethod,
    transactionType,
    bank,
    accountLast4,
    referenceId,
    confidenceScore: confidence,
    isDebit,
    isCredit,
    isOtpOrSpam,
    rawSmsHash,
    rawText: cleanBody,
    extractedKeywords,
    reasons,
  };
}
