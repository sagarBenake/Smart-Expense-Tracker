/**
 * Indian Rupee & Date Formatting Utilities
 */

export function formatINR(amount: number, options: { compact?: boolean; hideDecimals?: boolean } = {}): string {
  if (isNaN(amount)) return '₹0';
  
  if (options.compact) {
    if (Math.abs(amount) >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (Math.abs(amount) >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    if (Math.abs(amount) >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}k`;
    }
  }

  // Indian Number Format (e.g. 1,23,456.78)
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  let formatted = '';
  if (options.hideDecimals || Number.isInteger(absAmount)) {
    formatted = Math.round(absAmount).toLocaleString('en-IN');
  } else {
    formatted = absAmount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return `${isNegative ? '-' : ''}₹${formatted}`;
}

export function formatDateIndian(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${day} ${months[month]} ${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function formatTime12H(timeStr: string): string {
  if (!timeStr) return '';
  try {
    const [hoursStr, minsStr] = timeStr.split(':');
    let hours = parseInt(hoursStr, 10);
    const mins = minsStr || '00';
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    return `${hours}:${mins.padStart(2, '0')} ${ampm}`;
  } catch {
    return timeStr;
  }
}

export function getGreeting(userName: string = 'there'): string {
  const hour = new Date().getHours();
  let greet = 'Good morning';
  if (hour >= 12 && hour < 17) {
    greet = 'Good afternoon';
  } else if (hour >= 17 && hour < 22) {
    greet = 'Good evening';
  } else if (hour >= 22 || hour < 5) {
    greet = 'Good night';
  }
  return `${greet}, ${userName}`;
}

export function generateSimpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}
