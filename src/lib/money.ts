const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** 125000 -> "₹1,25,000" */
export function rupees(amount: number): string {
  return `₹${inr.format(amount)}`;
}

/** 125000 -> "1,25,000" */
export function amountOnly(amount: number): string {
  return inr.format(amount);
}
