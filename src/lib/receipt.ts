export type ReceiptSuggestion = {
  amount: number | null;
  description: string;
  items: ReceiptLineItem[];
  supplier: string;
};

export type ReceiptLineItem = {
  amount: number;
  description: string;
};

const ignoredSupplierWords = [
  "receipt",
  "invoice",
  "quote this reference",
  "customer",
  "summary",
  "reference",
  "your order",
  "product",
  "description",
  "tax",
  "vat",
  "date",
  "time",
  "tel",
  "www",
  "thank",
  "welcome",
];

const rejectedTotalLines = /\b(sub\s*total|vat|tax|change|cash|tendered|saving|discount|balance brought)\b/i;

export function suggestReceiptDetails(rawText: string): ReceiptSuggestion {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const supplier = findSupplier(lines);
  const amount = findReceiptTotal(lines);
  const items = findReceiptItems(lines, amount);

  return {
    amount,
    description: supplier ? `${supplier} purchase` : "Receipt purchase",
    items: items.length > 0 ? items : [{ amount: amount ?? 0, description: supplier ? `${supplier} purchase` : "Receipt purchase" }],
    supplier,
  };
}

function findReceiptTotal(lines: string[]) {
  const scoredCandidates = lines
    .map((line, index) => {
      if (rejectedTotalLines.test(line)) return null;

      const amounts = moneyValues(line);
      if (amounts.length === 0) return null;

      let score = 0;
      if (/\bgrand\s*total\b/i.test(line)) score = 50;
      else if (/\b(amount|balance)\s*due\b/i.test(line)) score = 45;
      else if (/\btotal\s*(paid|to pay)\b/i.test(line)) score = 40;
      else if (/^\s*total\b/i.test(line)) score = 35;
      else if (/\btotal\b/i.test(line)) score = 30;

      return { amount: amounts.at(-1) ?? 0, index, score };
    })
    .filter((candidate): candidate is { amount: number; index: number; score: number } => Boolean(candidate));

  const labelledTotal = scoredCandidates
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || b.index - a.index)[0];

  if (labelledTotal) return labelledTotal.amount;

  const fallback = scoredCandidates
    .map((candidate) => candidate.amount)
    .filter((amount) => amount > 0 && amount < 100000)
    .sort((a, b) => b - a)[0];

  return fallback ?? null;
}

function moneyValues(line: string) {
  const matches = line.matchAll(/(?:£\s*)?(\d{1,6}(?:[,\s]\d{3})*[.,]\d{2})\b/g);

  return Array.from(matches, (match) => Number(match[1].replace(/[,\s](?=\d{3}\b)/g, "").replace(",", "."))).filter(
    Number.isFinite,
  );
}

function findSupplier(lines: string[]) {
  const customerIndex = lines.findIndex((line) => /\bcustomer\s*:/i.test(line));
  const headerLines = lines.slice(0, customerIndex > 0 ? customerIndex : 8);
  const candidate = headerLines.find((line) => {
    const normalised = line.toLowerCase();
    const letterCount = (line.match(/[a-z]/gi) ?? []).length;

    return (
      (letterCount >= 3 || (letterCount >= 2 && line.includes("&"))) &&
      line.length <= 60 &&
      !ignoredSupplierWords.some((word) => normalised.includes(word)) &&
      !/^\d/.test(line) &&
      !/[£]\s*\d/.test(line)
    );
  });

  if (!candidate) return "";

  return candidate
    .replace(/[^\p{L}\p{N}&' .-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

function findReceiptItems(lines: string[], receiptTotal: number | null): ReceiptLineItem[] {
  const tableStart = lines.findIndex((line) => /^(product|description|your order)$/i.test(line));
  if (tableStart < 0) return [];

  const tableEndOffset = lines
    .slice(tableStart + 1)
    .findIndex((line) => /\b(sub\s*total|total paid|grand total|amount due)\b/i.test(line));
  const tableEnd = tableEndOffset >= 0 ? tableStart + 1 + tableEndOffset : lines.length;
  const tableLines = lines.slice(tableStart + 1, tableEnd);
  const codeIndexes = tableLines
    .map((line, index) => (/^\d{4,8}$/.test(line) ? index : -1))
    .filter((index) => index >= 0);

  if (codeIndexes.length === 0) return [];

  const rows = codeIndexes
    .map((start, rowIndex) => {
      const end = codeIndexes[rowIndex + 1] ?? tableLines.length;
      const cells = tableLines.slice(start + 1, end);
      const description = cells.find(isLikelyDescription);
      const values = cells.map(parseLooseNumber).filter((value): value is number => value !== null);

      return description && values.length > 0 ? { description: cleanDescription(description), values } : null;
    })
    .filter((row): row is { description: string; values: number[] } => Boolean(row));

  if (rows.length === 0) return [];

  const shortestRow = Math.min(...rows.map((row) => row.values.length));
  const candidateOffsets = Array.from({ length: Math.min(shortestRow, 8) }, (_, index) => index + 1);
  const bestOffset = candidateOffsets
    .map((offset) => {
      const amounts = rows.map((row) => row.values[row.values.length - offset]);
      const sum = roundMoney(amounts.reduce((total, amount) => total + amount, 0));
      const distance = receiptTotal === null ? offset : Math.abs(sum - receiptTotal);
      return { amounts, distance, offset };
    })
    .sort((a, b) => a.distance - b.distance || a.offset - b.offset)[0];

  if (!bestOffset) return [];

  const items = rows.map((row, index) => ({
    amount: roundMoney(bestOffset.amounts[index]),
    description: row.description,
  }));
  const itemsTotal = roundMoney(items.reduce((sum, item) => sum + item.amount, 0));

  if (receiptTotal !== null && Math.abs(itemsTotal - receiptTotal) > 0.05) return [];
  return items.filter((item) => item.amount > 0);
}

function isLikelyDescription(line: string) {
  const letters = (line.match(/[a-z]/gi) ?? []).length;
  return letters >= 4 && !/^(qty|unit|price|total|gross|net|discount|applied)$/i.test(line);
}

function cleanDescription(line: string) {
  return line
    .replace(/[€|[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function parseLooseNumber(line: string) {
  const match = line.replace(/[£\s]/g, "").match(/^(\d{1,6}(?:[.,]\d{1,2})?)$/);
  if (!match) return null;

  const raw = match[1].replace(",", ".");
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return null;
  if (!raw.includes(".") && raw.length >= 3) return parsed / 100;
  return parsed;
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
