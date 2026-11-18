export const payerOptions = [
  { label: "Adam", value: "ADAM" },
  { label: "Danny", value: "DANNY" },
  { label: "Helen", value: "HELEN" },
] as const;

export type Payer = (typeof payerOptions)[number]["value"];

export function payer(value: string): Payer {
  return payerOptions.some((option) => option.value === value) ? (value as Payer) : "ADAM";
}

export function payerLabel(value: string) {
  return payerOptions.find((option) => option.value === value)?.label ?? "Adam";
}
