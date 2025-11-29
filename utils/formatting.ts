// Format currency values in Hong Kong Dollars
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-HK', {
    style: 'currency',
    currency: 'HKD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format currency for kids with simpler display
export function formatCurrencySimple(amount: number): string {
  return `HK$${amount.toFixed(2)}`;
}

// Format dates in a kid-friendly way
export function formatDate(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const inputDate = new Date(date);
  inputDate.setHours(0, 0, 0, 0);
  
  if (inputDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (inputDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    const day = inputDate.getDate();
    const month = inputDate.toLocaleString('default', { month: 'short' });
    return `${day} ${month}`;
  }
}