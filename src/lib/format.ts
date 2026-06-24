export const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 2,
});

export const integerCurrencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: number | null | undefined, compact = false) {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return "n/a";
  return (compact ? integerCurrencyFormatter : currencyFormatter).format(amount);
}

export function formatPercent(amount: number | null | undefined) {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return "n/a";
  return `${amount.toFixed(2)}%`;
}

export function formatNumber(amount: number | null | undefined, suffix = "") {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return "n/a";
  return `${new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 }).format(amount)}${suffix}`;
}

export function labelize(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
