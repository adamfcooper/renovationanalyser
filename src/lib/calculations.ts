export type PropertyType = "BUNGALOW" | "TERRACE" | "SEMI" | "DETACHED" | "FLAT";
export type ConditionLevel =
  | "LIGHT_COSMETIC"
  | "MEDIUM_COSMETIC"
  | "HEAVY_COSMETIC"
  | "FULL_RENOVATION";
export type FinanceType = "CASH" | "MORTGAGE" | "BRIDGING";
export type EstateAgentFeeMode = "FIXED" | "PERCENTAGE";
export type TradeLevel = "NONE" | "LIGHT" | "MEDIUM" | "HEAVY";
export type DealScore = "Excellent" | "Good" | "Marginal" | "Avoid";

export type AssumptionsInput = {
  kitchenDefault: number;
  bathroomDefault: number;
  flooringDefault: number;
  decoratingDefault: number;
  plumbingDefault: number;
  electricalDefault: number;
  gardenDefault: number;
  restOfHouseDefault: number;
  miscDefault: number;
  renovationCostPerSqFt: number | null;
  kitchenRenoCostPerSqFt: number | null;
  bathroomRenoCostPerSqFt: number | null;
  flooringCostPerSqFt: number | null;
  plasteringCostPerSqFt: number | null;
  skipCost: number;
  skipCoverageSqFt: number;
  acquisitionCostPerSqFt: number | null;
  plumbingDayRate: number;
  electricianDayRate: number;
  decoratorDayRate: number;
  plastererDayRate: number;
  lightTradeDays: number;
  mediumTradeDays: number;
  heavyTradeDays: number;
  mortgageCostPerMonth: number;
  councilTaxPerMonth: number;
  utilitiesPerMonth: number;
  insurancePerMonth: number;
  stampDutyDefault: number;
  purchaseLegalFees: number;
  survey: number;
  brokerFee: number;
  lenderValuationFee: number;
  mortgageArrangementFee: number;
  saleLegalFees: number;
  epc: number;
  stagingPhotography: number;
  mortgageExitFee: number;
  estateAgentFeeMode: EstateAgentFeeMode;
  estateAgentFixedFee: number;
  estateAgentPercentage: number | null;
  contingencyPercentage: number;
};

export type ProjectInput = {
  name: string;
  projectLink?: string | null;
  addressOrArea: string | null;
  propertyType: PropertyType;
  bedrooms: number | null;
  bathrooms: number | null;
  internalSqFt: number | null;
  kitchenSqFt?: number | null;
  bathroomSqFt?: number | null;
  flooringSqFt?: number | null;
  plasteringSqFt?: number | null;
  plumbingHours?: number | null;
  electricalHours?: number | null;
  askingPrice: number | null;
  estimatedMarketValue: number | null;
  estimatedSalePrice: number;
  targetPurchasePrice: number | null;
  actualPurchasePrice: number;
  conditionLevel: ConditionLevel;
  needsKitchen: boolean;
  needsBathroom: boolean;
  needsFlooring: boolean;
  needsDecorating: boolean;
  needsMinorPlumbing: boolean;
  needsMinorElectrical: boolean;
  needsGardenWork: boolean;
  plumbingLevel?: TradeLevel | null;
  electricalLevel?: TradeLevel | null;
  decoratingLevel?: TradeLevel | null;
  plasteringLevel?: TradeLevel | null;
  estimatedHoldingMonths: number;
  financeType: FinanceType;
  depositAmount?: number | null;
  mortgageInterestRate?: number | null;
  mortgageTermYears?: number | null;
  targetRoiPercent: number | null;
  targetProfit: number | null;
  notes?: string | null;
  stampDuty?: number | null;
  survey?: number | null;
  purchaseLegalFees?: number | null;
  brokerFee?: number | null;
  lenderValuationFee?: number | null;
  mortgageArrangementFee?: number | null;
  kitchenCost?: number | null;
  bathroomCost?: number | null;
  flooringCost?: number | null;
  decoratingCost?: number | null;
  plumbingCost?: number | null;
  electricalCost?: number | null;
  gardenCost?: number | null;
  restOfHouseCost?: number | null;
  miscCost?: number | null;
  contingencyPercentage?: number | null;
  mortgageCostPerMonth?: number | null;
  councilTaxPerMonth?: number | null;
  utilitiesPerMonth?: number | null;
  insurancePerMonth?: number | null;
  estateAgentFeeMode?: EstateAgentFeeMode | null;
  estateAgentFixedFee?: number | null;
  estateAgentPercentage?: number | null;
  saleLegalFees?: number | null;
  epc?: number | null;
  stagingPhotography?: number | null;
  mortgageExitFee?: number | null;
  capitalGainsTax?: number | null;
};

export type CostLine = { label: string; amount: number; working?: string };
export type CostSection = { lines: CostLine[]; total: number };

export type DealCalculation = {
  acquisition: CostSection;
  renovation: CostSection & { preContingency: number; contingency: number };
  holding: CostSection & { monthlyTotal: number; months: number };
  disposal: CostSection;
  metrics: {
    salePrice: number;
    allInCost: number;
    grossProfit: number;
    capitalGainsTax: number;
    netProfit: number;
    roiPercent: number;
    purchasePricePerSqFt: number | null;
    renovationCostPerSqFt: number | null;
    salePricePerSqFt: number | null;
    profitPerSqFt: number | null;
    breakEvenSalePrice: number;
    maxPurchasePriceForTargetRoi: number | null;
    maxPurchasePriceForTargetProfit: number | null;
    salePriceGuidance: SalePriceGuidance[];
    dealScore: DealScore;
  };
  warnings: string[];
  sensitivity: ScenarioResult[];
};

export type SalePriceGuidance = {
  label: string;
  roiFromPercent: number;
  roiToPercent: number;
  minimumSalePrice: number | null;
  maximumSalePrice: number | null;
};

export type ScenarioResult = {
  name: "Base case" | "Optimistic" | "Pessimistic";
  salePrice: number;
  renovationCosts: number;
  holdingMonths: number;
  allInCost: number;
  netProfit: number;
  roiPercent: number;
  dealScore: DealScore;
};

const value = (override: number | null | undefined, fallback: number) =>
  override ?? fallback;

const roundMoney = (amount: number) => Math.round((amount + Number.EPSILON) * 100) / 100;
const roundPercent = (amount: number) => Math.round((amount + Number.EPSILON) * 100) / 100;
const formatInlineMoney = (amount: number) => `£${amount.toFixed(2)}`;
const formatSqFtRate = (amount: number) => `£${amount < 1 ? amount.toFixed(3) : amount.toFixed(2)}`;

function total(lines: CostLine[]) {
  return roundMoney(lines.reduce((sum, line) => sum + line.amount, 0));
}

function tradeDays(level: TradeLevel | null | undefined, assumptions: AssumptionsInput) {
  if (level === "LIGHT") return assumptions.lightTradeDays;
  if (level === "MEDIUM") return assumptions.mediumTradeDays;
  if (level === "HEAVY") return assumptions.heavyTradeDays;
  return 0;
}

function roomCost(
  roomSqFt: number | null | undefined,
  costPerSqFt: number | null,
  fallback: number,
  override: number | null | undefined,
) {
  if (override !== null && override !== undefined) return override;
  if (roomSqFt && costPerSqFt) return roundMoney(roomSqFt * costPerSqFt);
  return fallback;
}

function roomWorking(
  roomSqFt: number | null | undefined,
  costPerSqFt: number | null,
  fallback: number,
  override: number | null | undefined,
) {
  if (override !== null && override !== undefined) return "Actual/override cost entered for this project";
  if (roomSqFt && costPerSqFt) return `${roomSqFt} sq ft x ${formatSqFtRate(costPerSqFt)} per sq ft`;
  return `Default allowance: £${fallback.toFixed(2)}`;
}

function sqFtCost(roomSqFt: number | null | undefined, costPerSqFt: number | null) {
  if (roomSqFt && costPerSqFt) return roundMoney(roomSqFt * costPerSqFt);
  return 0;
}

function sqFtWorking(roomSqFt: number | null | undefined, costPerSqFt: number | null) {
  if (roomSqFt && costPerSqFt) return `${roomSqFt} sq ft x ${formatSqFtRate(costPerSqFt)} per sq ft`;
  return "Needs sq ft and £/sq ft assumption";
}

function tradeWorking(level: TradeLevel | null | undefined, days: number, dayRate: number) {
  return `${level?.toLowerCase()} scope: ${days} day${days === 1 ? "" : "s"} x £${dayRate.toFixed(2)} day rate`;
}

function skipCount(totalSqFt: number | null | undefined, skipCoverageSqFt: number) {
  if (!totalSqFt || skipCoverageSqFt <= 0) return 0;
  return Math.ceil(totalSqFt / skipCoverageSqFt);
}

function calculateSecondHomeStampDuty(purchasePrice: number) {
  const bands = [
    { limit: 125000, rate: 0.05 },
    { limit: 250000, rate: 0.07 },
    { limit: 925000, rate: 0.1 },
    { limit: 1500000, rate: 0.15 },
    { limit: Number.POSITIVE_INFINITY, rate: 0.17 },
  ];

  let previousLimit = 0;
  let totalDuty = 0;

  for (const band of bands) {
    if (purchasePrice <= previousLimit) break;
    const taxableAmount = Math.min(purchasePrice, band.limit) - previousLimit;
    totalDuty += taxableAmount * band.rate;
    previousLimit = band.limit;
  }

  return roundMoney(totalDuty);
}

function stampDutyWorking(purchasePrice: number) {
  if (purchasePrice <= 125000) return "Second-home SDLT: 5% of purchase price";
  if (purchasePrice <= 250000) return "Second-home SDLT: 5% up to £125,000, then 7% to £250,000";
  if (purchasePrice <= 925000) return "Second-home SDLT: 5% / 7% / 10% across the relevant bands";
  if (purchasePrice <= 1500000) return "Second-home SDLT: 5% / 7% / 10% / 15% across the relevant bands";
  return "Second-home SDLT: 5% / 7% / 10% / 15% / 17% across the relevant bands";
}

function mortgageExitRate(holdingMonths: number) {
  if (holdingMonths < 12) return 0.02;
  if (holdingMonths < 24) return 0.01;
  return 0;
}

function salePriceForRoi(fixedCostsExcludingEstateAgent: number, estateAgentPercentage: number, capitalGainsTax: number, roiPercent: number) {
  const roi = roiPercent / 100;
  const estateAgentRate = estateAgentPercentage / 100;
  const denominator = 1 - estateAgentRate * (1 + roi);
  if (denominator <= 0) return null;
  return roundMoney((fixedCostsExcludingEstateAgent * (1 + roi) + capitalGainsTax) / denominator);
}

function salePriceGuidance(fixedCostsExcludingEstateAgent: number, estateAgentPercentage: number, capitalGainsTax: number): SalePriceGuidance[] {
  return [
    {
      label: "10% ROI",
      roiFromPercent: 10,
      roiToPercent: 10,
      minimumSalePrice: salePriceForRoi(fixedCostsExcludingEstateAgent, estateAgentPercentage, capitalGainsTax, 10),
      maximumSalePrice: null,
    },
    {
      label: "11-20% ROI",
      roiFromPercent: 11,
      roiToPercent: 20,
      minimumSalePrice: salePriceForRoi(fixedCostsExcludingEstateAgent, estateAgentPercentage, capitalGainsTax, 11),
      maximumSalePrice: salePriceForRoi(fixedCostsExcludingEstateAgent, estateAgentPercentage, capitalGainsTax, 20),
    },
    {
      label: "21-30% ROI",
      roiFromPercent: 21,
      roiToPercent: 30,
      minimumSalePrice: salePriceForRoi(fixedCostsExcludingEstateAgent, estateAgentPercentage, capitalGainsTax, 21),
      maximumSalePrice: salePriceForRoi(fixedCostsExcludingEstateAgent, estateAgentPercentage, capitalGainsTax, 30),
    },
  ];
}

function repaymentMortgage(principal: number, annualRatePercent: number | null | undefined, termYears: number | null | undefined, monthsPaid: number) {
  if (!annualRatePercent || !termYears || principal <= 0 || termYears <= 0) {
    return null;
  }

  const termMonths = Math.max(1, Math.round(termYears * 12));
  const paidMonths = Math.min(Math.max(0, monthsPaid), termMonths);
  const monthlyRate = annualRatePercent / 100 / 12;

  if (monthlyRate === 0) {
    const monthlyPayment = roundMoney(principal / termMonths);
    return {
      monthlyPayment,
      outstandingBalance: roundMoney(Math.max(0, principal - monthlyPayment * paidMonths)),
    };
  }

  const compoundTerm = (1 + monthlyRate) ** termMonths;
  const monthlyPayment = principal * ((monthlyRate * compoundTerm) / (compoundTerm - 1));
  const compoundPaid = (1 + monthlyRate) ** paidMonths;
  const outstandingBalance = principal * compoundPaid - monthlyPayment * ((compoundPaid - 1) / monthlyRate);

  return {
    monthlyPayment: roundMoney(monthlyPayment),
    outstandingBalance: roundMoney(Math.max(0, outstandingBalance)),
  };
}

export function getDealScore(roiPercent: number, netProfit: number): DealScore {
  if (roiPercent > 20 && netProfit > 25000) return "Excellent";
  if (roiPercent >= 12) return "Good";
  if (roiPercent >= 6) return "Marginal";
  return "Avoid";
}

export function calculateDeal(project: ProjectInput, assumptions: AssumptionsInput): DealCalculation {
  const stampDuty = project.stampDuty ?? calculateSecondHomeStampDuty(project.actualPurchasePrice);
  const acquisitionLines: CostLine[] = [
    { label: "Purchase price", amount: project.actualPurchasePrice, working: "Purchase price entered for this deal" },
    {
      label: "Stamp duty",
      amount: stampDuty,
      working: project.stampDuty ? "Project override" : stampDutyWorking(project.actualPurchasePrice),
    },
    { label: "Survey", amount: value(project.survey, assumptions.survey), working: project.survey ? "Project override" : "Default assumption" },
    { label: "Purchase legal fees", amount: value(project.purchaseLegalFees, assumptions.purchaseLegalFees), working: project.purchaseLegalFees ? "Project override" : "Default assumption" },
    { label: "Mortgage broker fee", amount: value(project.brokerFee, assumptions.brokerFee), working: project.brokerFee ? "Project override" : "Default assumption" },
  ];
  const acquisitionTotal = total(acquisitionLines);

  const renovationLines: CostLine[] = [];
  if (project.needsKitchen) {
    renovationLines.push({
      label: "Kitchen",
      amount: sqFtCost(project.kitchenSqFt, assumptions.kitchenRenoCostPerSqFt),
      working: sqFtWorking(project.kitchenSqFt, assumptions.kitchenRenoCostPerSqFt),
    });
  }
  if (project.needsBathroom) {
    renovationLines.push({
      label: "Bathroom",
      amount: sqFtCost(project.bathroomSqFt, assumptions.bathroomRenoCostPerSqFt),
      working: sqFtWorking(project.bathroomSqFt, assumptions.bathroomRenoCostPerSqFt),
    });
  }
  if (project.needsFlooring) {
    renovationLines.push({
      label: "Flooring",
      amount: roomCost(project.flooringSqFt, assumptions.flooringCostPerSqFt, assumptions.flooringDefault, project.flooringCost),
      working: roomWorking(project.flooringSqFt, assumptions.flooringCostPerSqFt, assumptions.flooringDefault, project.flooringCost),
    });
  }
  if (project.needsDecorating) {
    renovationLines.push({ label: "Decorating", amount: value(project.decoratingCost, assumptions.decoratingDefault) });
  }
  if (project.needsGardenWork) {
    renovationLines.push({ label: "Garden / exterior", amount: value(project.gardenCost, assumptions.gardenDefault) });
  }
  const plumbingLabour = project.needsMinorPlumbing ? (project.plumbingHours ?? 0) * assumptions.plumbingDayRate : 0;
  const electricalLabour = project.needsMinorElectrical ? (project.electricalHours ?? 0) * assumptions.electricianDayRate : 0;
  const decoratingLabour = tradeDays(project.decoratingLevel, assumptions) * assumptions.decoratorDayRate;
  if (project.needsMinorPlumbing) {
    renovationLines.push({
      label: "Plumbing labour",
      amount: roundMoney(plumbingLabour),
      working: `${project.plumbingHours ?? 0} hours x £${assumptions.plumbingDayRate.toFixed(2)} hourly rate`,
    });
  }
  if (project.needsMinorElectrical) {
    renovationLines.push({
      label: "Electrical labour",
      amount: roundMoney(electricalLabour),
      working: `${project.electricalHours ?? 0} hours x £${assumptions.electricianDayRate.toFixed(2)} hourly rate`,
    });
  }
  if (decoratingLabour) {
    renovationLines.push({
      label: `${project.decoratingLevel?.toLowerCase()} decorating labour`,
      amount: roundMoney(decoratingLabour),
      working: tradeWorking(project.decoratingLevel, tradeDays(project.decoratingLevel, assumptions), assumptions.decoratorDayRate),
    });
  }
  if (project.plasteringSqFt && assumptions.plasteringCostPerSqFt) {
    renovationLines.push({
      label: "Plastering labour",
      amount: roundMoney(project.plasteringSqFt * assumptions.plasteringCostPerSqFt),
      working: `${project.plasteringSqFt} sq ft x ${formatSqFtRate(assumptions.plasteringCostPerSqFt)} per sq ft`,
    });
  }

  const paintEstimate =
    project.restOfHouseCost ??
    (project.internalSqFt && assumptions.renovationCostPerSqFt
      ? project.internalSqFt * assumptions.renovationCostPerSqFt
      : assumptions.restOfHouseDefault);
  renovationLines.push({
    label: "Brilliant white paint",
    amount: roundMoney(paintEstimate),
    working:
      project.restOfHouseCost !== null && project.restOfHouseCost !== undefined
        ? "Actual/override cost entered for this project"
        : project.internalSqFt && assumptions.renovationCostPerSqFt
          ? `${project.internalSqFt} sq ft x ${formatSqFtRate(assumptions.renovationCostPerSqFt)} per sq ft`
          : "Default brilliant-white paint allowance",
  });
  const skips = skipCount(project.internalSqFt, assumptions.skipCoverageSqFt);
  if (skips) {
    renovationLines.push({
      label: "Skip",
      amount: roundMoney(skips * assumptions.skipCost),
      working: `${skips} skip${skips === 1 ? "" : "s"} for ${project.internalSqFt} sq ft at £${assumptions.skipCost.toFixed(2)} each`,
    });
  }

  const preContingency = total(renovationLines);
  const contingencyRate = value(project.contingencyPercentage, assumptions.contingencyPercentage);
  const contingency = roundMoney(preContingency * (contingencyRate / 100));
  const renovationTotal = roundMoney(preContingency + contingency);

  const debtAmount = Math.max(0, project.actualPurchasePrice - (project.depositAmount ?? 0));
  const repayment =
    project.financeType === "MORTGAGE"
      ? repaymentMortgage(debtAmount, project.mortgageInterestRate, project.mortgageTermYears, project.estimatedHoldingMonths)
      : null;
  const calculatedFinance =
    project.financeType === "CASH"
      ? 0
      : repayment
        ? repayment.monthlyPayment
        : project.mortgageInterestRate
        ? roundMoney((debtAmount * (project.mortgageInterestRate / 100)) / 12)
        : value(project.mortgageCostPerMonth, assumptions.mortgageCostPerMonth);
  const monthlyHoldingLines: CostLine[] = [
    {
      label: "Mortgage / finance",
      amount: calculatedFinance,
      working: repayment
        ? `${formatInlineMoney(debtAmount)} borrowed over ${project.mortgageTermYears} years at ${project.mortgageInterestRate}% APR`
        : undefined,
    },
    { label: "Council tax", amount: value(project.councilTaxPerMonth, assumptions.councilTaxPerMonth) },
    { label: "Utilities", amount: value(project.utilitiesPerMonth, assumptions.utilitiesPerMonth) },
    { label: "Buildings / site insurance", amount: value(project.insurancePerMonth, assumptions.insurancePerMonth) },
  ];
  const monthlyTotal = total(monthlyHoldingLines);
  const holdingLines = monthlyHoldingLines.map((line) => ({
    ...line,
    amount: roundMoney(line.amount * project.estimatedHoldingMonths),
    working: line.working
      ? `${line.working}; ${formatInlineMoney(line.amount)} per month x ${project.estimatedHoldingMonths} months`
      : `${formatInlineMoney(line.amount)} per month x ${project.estimatedHoldingMonths} months`,
  }));
  const holdingTotal = total(holdingLines);

  const estateAgentPercentage = project.estateAgentPercentage ?? assumptions.estateAgentPercentage ?? 1.2;
  const estateAgentFee = project.estimatedSalePrice * (estateAgentPercentage / 100);
  const exitRate = mortgageExitRate(project.estimatedHoldingMonths);
  const exitFeeDebt = repayment?.outstandingBalance ?? debtAmount;
  const mortgageExitFee = roundMoney(exitFeeDebt * exitRate);
  const disposalLines: CostLine[] = [
    {
      label: "Estate agent fees",
      amount: roundMoney(estateAgentFee),
      working: `${estateAgentPercentage}% x sale price`,
    },
    { label: "Sale legal fees", amount: value(project.saleLegalFees, assumptions.saleLegalFees), working: project.saleLegalFees ? "Project override" : "Default assumption" },
    {
      label: "Mortgage exit fee",
      amount: project.mortgageExitFee ?? mortgageExitFee,
      working:
        project.mortgageExitFee !== null && project.mortgageExitFee !== undefined
          ? "Project override"
          : `${roundPercent(exitRate * 100)}% x ${formatInlineMoney(exitFeeDebt)} outstanding debt (${project.estimatedHoldingMonths} months held)`,
    },
  ];
  const disposalTotal = total(disposalLines);
  const fixedCostsExcludingEstateAgent = roundMoney(acquisitionTotal + renovationTotal + holdingTotal + disposalTotal - roundMoney(estateAgentFee));

  const allInCost = roundMoney(acquisitionTotal + renovationTotal + holdingTotal + disposalTotal);
  const grossProfit = roundMoney(project.estimatedSalePrice - allInCost);
  const capitalGainsTax = value(project.capitalGainsTax, 0);
  const netProfit = roundMoney(grossProfit - capitalGainsTax);
  const roiPercent = roundPercent((netProfit / allInCost) * 100);
  const nonPurchaseCosts = roundMoney(allInCost - project.actualPurchasePrice);

  const targetRoiDecimal = project.targetRoiPercent ? project.targetRoiPercent / 100 : null;
  const maxPurchasePriceForTargetRoi = targetRoiDecimal
    ? roundMoney(project.estimatedSalePrice / (1 + targetRoiDecimal) - nonPurchaseCosts)
    : null;
  const maxPurchasePriceForTargetProfit = project.targetProfit
    ? roundMoney(project.estimatedSalePrice - project.targetProfit - nonPurchaseCosts)
    : null;

  const metrics = {
    salePrice: project.estimatedSalePrice,
    allInCost,
    grossProfit,
    capitalGainsTax,
    netProfit,
    roiPercent,
    purchasePricePerSqFt: perSqFt(project.actualPurchasePrice, project.internalSqFt),
    renovationCostPerSqFt: perSqFt(renovationTotal, project.internalSqFt),
    salePricePerSqFt: perSqFt(project.estimatedSalePrice, project.internalSqFt),
    profitPerSqFt: perSqFt(netProfit, project.internalSqFt),
    breakEvenSalePrice: allInCost,
    maxPurchasePriceForTargetRoi,
    maxPurchasePriceForTargetProfit,
    salePriceGuidance: salePriceGuidance(fixedCostsExcludingEstateAgent, estateAgentPercentage, capitalGainsTax),
    dealScore: getDealScore(roiPercent, netProfit),
  };

  return {
    acquisition: { lines: acquisitionLines, total: acquisitionTotal },
    renovation: { lines: renovationLines, total: renovationTotal, preContingency, contingency },
    holding: { lines: holdingLines, total: holdingTotal, monthlyTotal, months: project.estimatedHoldingMonths },
    disposal: { lines: disposalLines, total: disposalTotal },
    metrics,
    warnings: getWarnings(project, metrics, renovationTotal),
    sensitivity: calculateSensitivity(project, assumptions, acquisitionTotal, disposalTotal, monthlyTotal, capitalGainsTax),
  };
}

function perSqFt(amount: number, sqFt: number | null) {
  return sqFt ? roundMoney(amount / sqFt) : null;
}

function calculateSensitivity(
  project: ProjectInput,
  assumptions: AssumptionsInput,
  acquisitionTotal: number,
  disposalTotal: number,
  monthlyHoldingCost: number,
  capitalGainsTax: number,
): ScenarioResult[] {
  const base = calculateScenario(
    "Base case",
    project.estimatedSalePrice,
    calculateRenovationTotalOnly(project, assumptions),
    project.estimatedHoldingMonths,
    acquisitionTotal,
    disposalTotal,
    monthlyHoldingCost,
    capitalGainsTax,
  );
  const optimistic = calculateScenario(
    "Optimistic",
    project.estimatedSalePrice * 1.05,
    base.renovationCosts * 0.95,
    Math.max(0, project.estimatedHoldingMonths - 1),
    acquisitionTotal,
    disposalTotal,
    monthlyHoldingCost,
    capitalGainsTax,
  );
  const pessimistic = calculateScenario(
    "Pessimistic",
    project.estimatedSalePrice * 0.95,
    base.renovationCosts * 1.1,
    project.estimatedHoldingMonths + 2,
    acquisitionTotal,
    disposalTotal,
    monthlyHoldingCost,
    capitalGainsTax,
  );

  return [base, optimistic, pessimistic];
}

function calculateScenario(
  name: ScenarioResult["name"],
  salePrice: number,
  renovationCosts: number,
  holdingMonths: number,
  acquisitionTotal: number,
  disposalTotal: number,
  monthlyHoldingCost: number,
  capitalGainsTax: number,
): ScenarioResult {
  const holdingCosts = roundMoney(monthlyHoldingCost * holdingMonths);
  const allInCost = roundMoney(acquisitionTotal + renovationCosts + holdingCosts + disposalTotal);
  const netProfit = roundMoney(salePrice - allInCost - capitalGainsTax);
  const roiPercent = roundPercent((netProfit / allInCost) * 100);

  return {
    name,
    salePrice: roundMoney(salePrice),
    renovationCosts: roundMoney(renovationCosts),
    holdingMonths,
    allInCost,
    netProfit,
    roiPercent,
    dealScore: getDealScore(roiPercent, netProfit),
  };
}

function calculateRenovationTotalOnly(project: ProjectInput, assumptions: AssumptionsInput) {
  return calculateDealWithoutSensitivity(project, assumptions).renovation.total;
}

function calculateDealWithoutSensitivity(project: ProjectInput, assumptions: AssumptionsInput) {
  const renovationLines: CostLine[] = [];
  if (project.needsKitchen) {
    renovationLines.push({
      label: "Kitchen",
      amount: sqFtCost(project.kitchenSqFt, assumptions.kitchenRenoCostPerSqFt),
    });
  }
  if (project.needsBathroom) {
    renovationLines.push({
      label: "Bathroom",
      amount: sqFtCost(project.bathroomSqFt, assumptions.bathroomRenoCostPerSqFt),
    });
  }
  if (project.needsFlooring) {
    renovationLines.push({
      label: "Flooring",
      amount: roomCost(project.flooringSqFt, assumptions.flooringCostPerSqFt, assumptions.flooringDefault, project.flooringCost),
    });
  }
  if (project.needsDecorating) renovationLines.push({ label: "Decorating", amount: value(project.decoratingCost, assumptions.decoratingDefault) });
  if (project.needsGardenWork) renovationLines.push({ label: "Garden / exterior", amount: value(project.gardenCost, assumptions.gardenDefault) });
  const plumbingLabour = project.needsMinorPlumbing ? (project.plumbingHours ?? 0) * assumptions.plumbingDayRate : 0;
  const electricalLabour = project.needsMinorElectrical ? (project.electricalHours ?? 0) * assumptions.electricianDayRate : 0;
  const decoratingLabour = tradeDays(project.decoratingLevel, assumptions) * assumptions.decoratorDayRate;
  if (project.needsMinorPlumbing) renovationLines.push({ label: "Plumbing labour", amount: roundMoney(plumbingLabour) });
  if (project.needsMinorElectrical) renovationLines.push({ label: "Electrical labour", amount: roundMoney(electricalLabour) });
  if (decoratingLabour) renovationLines.push({ label: `${project.decoratingLevel?.toLowerCase()} decorating labour`, amount: roundMoney(decoratingLabour) });
  if (project.plasteringSqFt && assumptions.plasteringCostPerSqFt) {
    renovationLines.push({
      label: "Plastering labour",
      amount: roundMoney(project.plasteringSqFt * assumptions.plasteringCostPerSqFt),
    });
  }
  renovationLines.push({
    label: "Brilliant white paint",
    amount: roundMoney(
      project.restOfHouseCost ??
        (project.internalSqFt && assumptions.renovationCostPerSqFt
          ? project.internalSqFt * assumptions.renovationCostPerSqFt
          : assumptions.restOfHouseDefault),
    ),
  });
  const skips = skipCount(project.internalSqFt, assumptions.skipCoverageSqFt);
  if (skips) renovationLines.push({ label: "Skip", amount: roundMoney(skips * assumptions.skipCost) });
  const preContingency = total(renovationLines);
  const contingency = roundMoney(preContingency * (value(project.contingencyPercentage, assumptions.contingencyPercentage) / 100));
  return { renovation: { lines: renovationLines, total: roundMoney(preContingency + contingency), preContingency, contingency } };
}

function getWarnings(project: ProjectInput, metrics: DealCalculation["metrics"], renovationTotal: number) {
  const warnings: string[] = [];

  if (project.estimatedHoldingMonths > 9) {
    warnings.push("Holding period is over 9 months.");
  }
  if (renovationTotal > project.actualPurchasePrice * 0.15) {
    warnings.push("Renovation cost exceeds 15% of purchase price.");
  }
  if (metrics.netProfit < 10000 || metrics.roiPercent < 6) {
    warnings.push("Profit margin is thin.");
  }
  if (project.estimatedMarketValue && project.estimatedSalePrice > project.estimatedMarketValue * 1.2) {
    warnings.push("Sale price assumption is more than 20% above today's market value.");
  }
  if (project.actualPurchasePrice > project.estimatedSalePrice * 0.85) {
    warnings.push("Purchase price is close to the finished value.");
  }

  return warnings;
}
