import { describe, expect, it } from "vitest";
import { payer, payerLabel } from "./payers";

describe("payers", () => {
  it("accepts the three supported payers", () => {
    expect(payer("ADAM")).toBe("ADAM");
    expect(payer("DANNY")).toBe("DANNY");
    expect(payer("HELEN")).toBe("HELEN");
  });

  it("defaults unknown and missing values to Adam", () => {
    expect(payer("")).toBe("ADAM");
    expect(payer("Someone else")).toBe("ADAM");
    expect(payerLabel("unknown")).toBe("Adam");
  });
});
