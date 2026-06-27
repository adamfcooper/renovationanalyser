export type ReceiptSuggestion = {
  amount: number | null;
  description: string;
  supplier: string;
};

const ignoredSupplierWords = [
  "receipt",
  "invoice",
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

  return {
    amount: findReceiptTotal(lines),
    description: supplier ? `${supplier} purchase` : "Receipt purchase",
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
  const candidate = lines.slice(0, 8).find((line) => {
    const normalised = line.toLowerCase();
    const letterCount = (line.match(/[a-z]/gi) ?? []).length;

    return (
      letterCount >= 2 &&
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
