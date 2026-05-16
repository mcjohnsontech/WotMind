export function buildApprovalSMS(
  amount: number,
  description: string,
  token: string
): string {
  const formatted_amount = `₦${amount.toLocaleString('en-NG')}`;
  return `WOTMIND: Approve ${formatted_amount} for "${description}"? Reply YES-${token} to approve or NO-${token} to reject. Expires in 1 hour.`;
}

export function buildPaymentConfirmationSMS(amount: number, recipient: string): string {
  const formatted_amount = `₦${amount.toLocaleString('en-NG')}`;
  return `WOTMIND: ✓ Payment of ${formatted_amount} to ${recipient} has been initiated successfully. Check your audit log for details.`;
}

export function buildAlertSMS(message: string): string {
  return `WOTMIND ALERT: ${message}`;
}

export function buildInventoryAlertSMS(item_name: string, current_stock: number, threshold: number): string {
  return `WOTMIND: Low stock alert for "${item_name}". Current: ${current_stock} units, Threshold: ${threshold} units. Please reorder.`;
}

export function buildPayrollReceiptSMS(staff_name: string, amount: number): string {
  const formatted_amount = `₦${amount.toLocaleString('en-NG')}`;
  return `WOTMIND: Your salary of ${formatted_amount} has been transferred. Thank you for your work.`;
}

export function buildExpenseApprovalSMS(amount: number, status: string): string {
  const formatted_amount = `₦${amount.toLocaleString('en-NG')}`;
  return `WOTMIND: Your expense claim of ${formatted_amount} has been ${status}. Check your account for details.`;
}
