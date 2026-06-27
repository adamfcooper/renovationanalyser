import { describe, expect, it } from "vitest";
import { suggestReceiptDetails } from "./receipt";

describe("suggestReceiptDetails", () => {
  it("uses a labelled grand total and supplier name", () => {
    const result = suggestReceiptDetails(`
      B&Q
      White emulsion £18.00
      Paint roller £6.50
      Subtotal £24.50
      VAT £4.90
      GRAND TOTAL £29.40
    `);

    expect(result).toEqual({
      amount: 29.4,
      description: "B&Q purchase",
      supplier: "B&Q",
    });
  });

  it("ignores change and uses the amount due", () => {
    const result = suggestReceiptDetails(`
      Toolstation
      Amount due 12,49
      Cash 20.00
      Change 7.51
    `);

    expect(result.amount).toBe(12.49);
  });

  it("falls back to the largest currency value when no total is labelled", () => {
    const result = suggestReceiptDetails(`
      Local Hardware
      Screws 4.20
      Timber 31.90
      Sealant 8.50
    `);

    expect(result.amount).toBe(31.9);
  });
});
