import { describe, expect, it } from "vitest";
import { calculateDeal } from "./calculations";
import { defaultAssumptions, ericaDriveProject } from "./seed-data";

describe("calculateDeal", () => {
  it("matches the Erica Drive finance sheet", () => {
    const result = calculateDeal(ericaDriveProject, defaultAssumptions);

    expect(result.acquisition.total).toBe(197349);
    expect(result.renovation.total).toBe(6835.56);
    expect(result.holding.total).toBe(5328);
    expect(result.disposal.total).toBe(7340);
    expect(result.metrics.allInCost).toBe(216852.56);
    expect(result.metrics.grossProfit).toBe(3147.44);
    expect(result.metrics.netProfit).toBe(3147.44);
    expect(result.metrics.roiPercent).toBe(1.45);
    expect(result.metrics.dealScore).toBe("Avoid");
  });

  it("adds contingency for normal new projects", () => {
    const project = {
      ...ericaDriveProject,
      contingencyPercentage: null,
    };

    const result = calculateDeal(project, defaultAssumptions);

    expect(result.renovation.contingency).toBe(683.56);
    expect(result.renovation.total).toBe(7519.12);
  });

  it("calculates mortgage exit fee from the holding period when no repayment schedule is available", () => {
    const underOneYear = calculateDeal({ ...ericaDriveProject, estimatedHoldingMonths: 11 }, defaultAssumptions);
    const yearOneToTwo = calculateDeal({ ...ericaDriveProject, estimatedHoldingMonths: 18 }, defaultAssumptions);
    const afterTwoYears = calculateDeal({ ...ericaDriveProject, estimatedHoldingMonths: 24 }, defaultAssumptions);

    expect(underOneYear.disposal.lines.find((line) => line.label === "Mortgage exit fee")?.amount).toBe(3700);
    expect(yearOneToTwo.disposal.lines.find((line) => line.label === "Mortgage exit fee")?.amount).toBe(1850);
    expect(afterTwoYears.disposal.lines.find((line) => line.label === "Mortgage exit fee")?.amount).toBe(0);
  });

  it("uses repayment mortgage payments and reduced outstanding balance for the exit fee", () => {
    const result = calculateDeal(
      {
        ...ericaDriveProject,
        depositAmount: 85000,
        mortgageInterestRate: 6,
        mortgageTermYears: 25,
        estimatedHoldingMonths: 9,
      },
      defaultAssumptions,
    );

    expect(result.holding.lines.find((line) => line.label === "Mortgage / finance")?.amount).toBe(5798.7);
    expect(result.disposal.lines.find((line) => line.label === "Mortgage exit fee")?.amount).toBe(1973.5);
  });

  it("calculates sale price guidance for ROI bands", () => {
    const result = calculateDeal(ericaDriveProject, defaultAssumptions);

    expect(result.metrics.salePriceGuidance).toEqual([
      {
        label: "10% ROI",
        roiFromPercent: 10,
        roiToPercent: 10,
        minimumSalePrice: 238785.79,
        maximumSalePrice: null,
      },
      {
        label: "11-20% ROI",
        roiFromPercent: 11,
        roiToPercent: 20,
        minimumSalePrice: 240985.87,
        maximumSalePrice: 260810.75,
      },
      {
        label: "21-30% ROI",
        roiFromPercent: 21,
        roiToPercent: 30,
        minimumSalePrice: 263016.19,
        maximumSalePrice: 282889.4,
      },
    ]);
  });
});
