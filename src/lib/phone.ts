/**
 * WhatsApp needs the number with country code and digits only.
 * Handles "98765 43210", "098765 43210", "+91-98765-43210", "0091 98765 43210".
 */
export function whatsappLink(phone: string) {
  let digits = phone.replace(/\D/g, "").replace(/^00/, "");
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  const full = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${full}`;
}

export function telLink(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
