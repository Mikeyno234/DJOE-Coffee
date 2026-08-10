export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatCurrencyNumber(value: string | number): string {
  if (!value && value !== 0) return "";
  const cleanNumber = String(value).replace(/\D/g, "");
  if (!cleanNumber) return "";
  return new Intl.NumberFormat("id-ID").format(parseInt(cleanNumber, 10));
}

export function parseCurrencyNumber(formattedValue: string): number {
  if (!formattedValue) return 0;
  const cleanNumber = String(formattedValue).replace(/\D/g, "");
  return cleanNumber ? parseInt(cleanNumber, 10) : 0;
}
