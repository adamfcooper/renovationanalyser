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
      items: [{ amount: 29.4, description: "B&Q purchase" }],
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

  it("extracts and reconciles invoice table rows", () => {
    const result = suggestReceiptDetails(`
      Quote this reference for enquiries
      Customer:
      Mr Danny Cooper
      Invoice Summary:
      Your Order
      VAT Breakdown
      Product
      Description
      Qty
      Unit
      Sub
      Gross
      Net
      Price
      Total
      Discount
      VAT Applied
      50422
      JG Speedfit 15mm Equal Tee Each
      359
      14.36
      10.00
      1.46
      12.90
      10.75
      2.15
      20.0
      28263
      209
      4.18
      10.00
      043
      375
      3.12
      0.63
      20.0
      JG Speedfit 15mm Straight Coupling Each
      95828
      Straight Coupling 15mm Pack of 2
      454
      454
      0.00
      0.00
      454
      378
      0.76
      200
      Sub total
      23.08
      Total Paid: £21.19
    `);

    expect(result.amount).toBe(21.19);
    expect(result.supplier).toBe("");
    expect(result.items).toEqual([
      { amount: 12.9, description: "JG Speedfit 15mm Equal Tee Each" },
      { amount: 3.75, description: "JG Speedfit 15mm Straight Coupling Each" },
      { amount: 4.54, description: "Straight Coupling 15mm Pack of 2" },
    ]);
  });
});
