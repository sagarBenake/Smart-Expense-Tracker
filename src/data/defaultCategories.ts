import { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat_food',
    name: 'Food & Dining',
    icon: '🍔',
    color: '#F97316', // Orange
    monthlyBudget: 8000,
    isDefault: true,
    isActive: true,
    keywords: [
      'swiggy', 'zomato', 'restaurant', 'cafe', 'mcdonald', 'starbucks', 'dominos', 
      'pizza', 'burger', 'kfc', 'food', 'dining', 'bakery', 'tea', 'coffee', 'chai',
      'eats', 'dhaba', 'barbeque', 'bites', 'kitchen', 'biryani', 'sweet', 'haldiram'
    ],
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'cat_groceries',
    name: 'Groceries',
    icon: '🛒',
    color: '#10B981', // Emerald Green
    monthlyBudget: 6000,
    isDefault: true,
    isActive: true,
    keywords: [
      'blinkit', 'zepto', 'instamart', 'bigbasket', 'dmart', 'supermarket', 
      'grocery', 'kirana', 'vegetables', 'fruits', 'dairy', 'milk', 'reliance smart',
      'spencer', 'nature basket', 'super store', 'mart', 'provision'
    ],
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'cat_shopping',
    name: 'Shopping',
    icon: '🛍️',
    color: '#8B5CF6', // Purple
    monthlyBudget: 7000,
    isDefault: true,
    isActive: true,
    keywords: [
      'amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'zara', 'h&m', 'tata cliq',
      'shopping', 'retail', 'clothing', 'apparel', 'fashion', 'electronics', 'croma',
      'vijay sales', 'meesho', 'lenskart', 'decathlon', 'shoppers stop', 'lifestyle'
    ],
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'cat_travel',
    name: 'Travel & Transport',
    icon: '🚖',
    color: '#3B82F6', // Blue
    monthlyBudget: 4000,
    isDefault: true,
    isActive: true,
    keywords: [
      'uber', 'ola', 'rapido', 'metro', 'irctc', 'makemytrip', 'goibibo', 'indigo',
      'air india', 'redbus', 'flight', 'train', 'cab', 'auto', 'fastag', 'toll',
      'parking', 'railway', 'bus', 'travel', 'cleartrip', 'yatra'
    ],
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'cat_fuel',
    name: 'Fuel',
    icon: '⛽',
    color: '#EF4444', // Red
    monthlyBudget: 3500,
    isDefault: true,
    isActive: true,
    keywords: [
      'petrol', 'diesel', 'fuel', 'indian oil', 'iocl', 'bharat petroleum', 'bpcl',
      'hpcl', 'hindustan petroleum', 'shell', 'cng', 'gas station', 'pump'
    ],
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'cat_bills',
    name: 'Bills & Utilities',
    icon: '💡',
    color: '#F59E0B', // Amber
    monthlyBudget: 4500,
    isDefault: true,
    isActive: true,
    keywords: [
      'electricity', 'bescom', 'tata power', 'adani electricity', 'water', 'gas',
      'piped gas', 'igl', 'mgl', 'broadband', 'wifi', 'act fibernet', 'airtel broadband',
      'jiofiber', 'utility', 'bills', 'billdesk', 'bbps', 'maintenance'
    ],
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'cat_rent',
    name: 'Rent',
    icon: '🏠',
    color: '#06B6D4', // Cyan
    monthlyBudget: 15000,
    isDefault: true,
    isActive: true,
    keywords: [
      'rent', 'house rent', 'landlord', 'nobroker', 'housing', 'flat rent', 'society rent'
    ],
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'cat_health',
    name: 'Healthcare',
    icon: '💊',
    color: '#EC4899', // Pink
    monthlyBudget: 2500,
    isDefault: true,
    isActive: true,
    keywords: [
      'apollo', 'pharmacy', 'medicine', 'hospital', 'clinic', 'doctor', 'practo',
      'pharmeasy', '1mg', 'tata 1mg', 'medplus', 'diagnostic', 'lab', 'dental',
      'health', 'therapist', 'optician'
    ],
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'cat_entertainment',
    name: 'Entertainment',
    icon: '🎬',
    color: '#6366F1', // Indigo
    monthlyBudget: 2000,
    isDefault: true,
    isActive: true,
    keywords: [
      'netflix', 'hotstar', 'disney', 'prime video', 'spotify', 'youtube premium',
      'bookmyshow', 'pvr', 'inox', 'cinema', 'movie', 'gaming', 'steam', 'playstation',
      'concert', 'event', 'club', 'pub'
    ],
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'cat_education',
    name: 'Education',
    icon: '📚',
    color: '#14B8A6', // Teal
    monthlyBudget: 3000,
    isDefault: true,
    isActive: true,
    keywords: [
      'udemy', 'coursera', 'books', 'kindle', 'school', 'college', 'tuition',
      'coaching', 'course', 'fees', 'class', 'training', 'exam', 'stationery'
    ],
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'cat_insurance',
    name: 'Insurance',
    icon: '🛡️',
    color: '#64748B', // Slate
    monthlyBudget: 2000,
    isDefault: true,
    isActive: true,
    keywords: [
      'insurance', 'lic', 'hdfc ergo', 'icici lombard', 'star health', 'policybazaar',
      'acko', 'digit', 'premium', 'health insurance', 'car insurance', 'term plan'
    ],
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'cat_emi',
    name: 'EMI / Loans',
    icon: '💳',
    color: '#DC2626', // Deep Red
    monthlyBudget: 10000,
    isDefault: true,
    isActive: true,
    keywords: [
      'emi', 'loan', 'bajaj finance', 'hdfc loan', 'sbi loan', 'credit card emi',
      'home loan', 'car loan', 'personal loan', 'nach', 'ecs mandate', 'auto debit loan'
    ],
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'cat_recharge',
    name: 'Recharge',
    icon: '📱',
    color: '#0EA5E9', // Sky Blue
    monthlyBudget: 1000,
    isDefault: true,
    isActive: true,
    keywords: [
      'recharge', 'airtel prepaid', 'jio prepaid', 'vi', 'vodafone', 'idea',
      'dth', 'tata sky', 'tata play', 'dish tv', 'airtel dth', 'mobile recharge'
    ],
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'cat_investments',
    name: 'Investments',
    icon: '📈',
    color: '#059669', // Deep Green
    monthlyBudget: 10000,
    isDefault: true,
    isActive: true,
    keywords: [
      'zerodha', 'groww', 'kuvera', 'mutual fund', 'sip', 'indmoney', 'upstox',
      'stocks', 'ppf', 'nps', 'etf', 'gold', 'cryptocurrency', 'coin'
    ],
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'cat_cash_withdrawal',
    name: 'Cash Withdrawal',
    icon: '🏧',
    color: '#78716C', // Stone
    monthlyBudget: 3000,
    isDefault: true,
    isActive: true,
    keywords: [
      'atm', 'cash withdrawal', 'w/d', 'withdrawn at atm', 'cash wdl', 'sbi atm',
      'hdfc atm', 'icici atm', 'axis atm'
    ],
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'cat_upi_transfers',
    name: 'UPI Payments',
    icon: '⚡',
    color: '#4F46E5', // Indigo Violet
    monthlyBudget: 5000,
    isDefault: true,
    isActive: true,
    keywords: [
      'upi', 'gpay', 'phonepe', 'paytm', 'bhim', 'vpa', 'transferred via upi'
    ],
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'cat_other',
    name: 'Other',
    icon: '📦',
    color: '#94A3B8', // Slate Grey
    monthlyBudget: 2000,
    isDefault: true,
    isActive: true,
    keywords: ['miscellaneous', 'other', 'general', 'misc'],
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
];
