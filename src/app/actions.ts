"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { calculateDeal, type AssumptionsInput, type ProjectInput } from "@/lib/calculations";
import { getDb } from "@/lib/db";
import { getAssumptions } from "@/lib/data";

function text(formData: FormData, key: string, fallback = "") {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function number(formData: FormData, key: string, fallback = 0) {
  const raw = formData.get(key);
  if (typeof raw !== "string" || raw.trim() === "") return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function nullableNumber(formData: FormData, key: string) {
  const raw = formData.get(key);
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function bool(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

export async function createProjectAction(formData: FormData) {
  const assumptions = await getAssumptions();
  const purchasePrice = number(formData, "actualPurchasePrice");
  const internalSqFt = nullableNumber(formData, "internalSqFt");
  const flooringScope = text(formData, "flooringScope", "NONE");
  const plasteringScope = text(formData, "plasteringScope", "NONE");
  const flooringSqFt = flooringScope === "WHOLE" ? internalSqFt : flooringScope === "SPECIFIC" ? nullableNumber(formData, "flooringSqFt") : null;
  const plasteringSqFt =
    plasteringScope === "WHOLE" ? internalSqFt : plasteringScope === "SPECIFIC" ? nullableNumber(formData, "plasteringSqFt") : null;
  let projectData: ProjectInput = {
    name: text(formData, "name", "Untitled deal"),
    projectLink: text(formData, "projectLink") || null,
    addressOrArea: null,
    propertyType: text(formData, "propertyType", "BUNGALOW") as ProjectInput["propertyType"],
    bedrooms: null,
    bathrooms: null,
    internalSqFt,
    kitchenSqFt: nullableNumber(formData, "kitchenSqFt"),
    bathroomSqFt: nullableNumber(formData, "bathroomSqFt"),
    flooringSqFt,
    plasteringSqFt,
    plumbingHours: nullableNumber(formData, "plumbingHours"),
    electricalHours: nullableNumber(formData, "electricalHours"),
    askingPrice: purchasePrice,
    estimatedMarketValue: null,
    estimatedSalePrice: purchasePrice,
    targetPurchasePrice: null,
    actualPurchasePrice: purchasePrice,
    conditionLevel: "MEDIUM_COSMETIC",
    needsKitchen: bool(formData, "needsKitchen"),
    needsBathroom: bool(formData, "needsBathroom"),
    needsFlooring: flooringScope !== "NONE",
    needsDecorating: bool(formData, "needsDecorating"),
    needsMinorPlumbing: bool(formData, "needsMinorPlumbing"),
    needsMinorElectrical: bool(formData, "needsMinorElectrical"),
    needsGardenWork: bool(formData, "needsGardenWork"),
    plumbingLevel: "NONE",
    electricalLevel: "NONE",
    decoratingLevel: text(formData, "decoratingLevel", "NONE") as ProjectInput["decoratingLevel"],
    plasteringLevel: "NONE",
    estimatedHoldingMonths: number(formData, "estimatedHoldingMonths", 9),
    financeType: text(formData, "financeType", "MORTGAGE") as ProjectInput["financeType"],
    depositAmount: nullableNumber(formData, "depositAmount"),
    mortgageInterestRate: nullableNumber(formData, "mortgageInterestRate"),
    mortgageTermYears: nullableNumber(formData, "mortgageTermYears"),
    councilTaxPerMonth: nullableNumber(formData, "councilTaxPerMonth"),
    utilitiesPerMonth: nullableNumber(formData, "utilitiesPerMonth"),
    insurancePerMonth: nullableNumber(formData, "insurancePerMonth"),
    targetRoiPercent: null,
    targetProfit: null,
    notes: undefined,
  };
  const preliminary = calculateDeal(projectData, assumptions as AssumptionsInput);
  projectData = {
    ...projectData,
    estimatedSalePrice: preliminary.metrics.salePriceGuidance[0]?.minimumSalePrice ?? purchasePrice,
  };

  const db = getDb();
  const project = await db.project.create({
    data: {
      ...projectData,
      plumbingLevel: projectData.plumbingLevel ?? "NONE",
      electricalLevel: projectData.electricalLevel ?? "NONE",
      decoratingLevel: projectData.decoratingLevel ?? "NONE",
      plasteringLevel: projectData.plasteringLevel ?? "NONE",
    },
  });
  const result = calculateDeal(project as ProjectInput, assumptions as AssumptionsInput);

  await db.projectSnapshot.create({
    data: {
      projectId: project.id,
      acquisitionCosts: result.acquisition,
      renovationCosts: result.renovation,
      holdingCosts: result.holding,
      disposalCosts: result.disposal,
      results: result.metrics,
      sensitivity: result.sensitivity,
      warnings: result.warnings,
    },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

export async function updateAssumptionsAction(formData: FormData) {
  const current = await getAssumptions();
  const db = getDb();

  await db.assumption.update({
    where: { id: current.id },
    data: {
      kitchenDefault: 0,
      bathroomDefault: 0,
      flooringDefault: number(formData, "flooringDefault"),
      decoratingDefault: number(formData, "decoratingDefault"),
      plumbingDefault: 0,
      electricalDefault: 0,
      gardenDefault: number(formData, "gardenDefault"),
      restOfHouseDefault: 0,
      miscDefault: 0,
      renovationCostPerSqFt: nullableNumber(formData, "renovationCostPerSqFt"),
      kitchenRenoCostPerSqFt: nullableNumber(formData, "kitchenRenoCostPerSqFt"),
      bathroomRenoCostPerSqFt: nullableNumber(formData, "bathroomRenoCostPerSqFt"),
      flooringCostPerSqFt: nullableNumber(formData, "flooringCostPerSqFt"),
      plasteringCostPerSqFt: nullableNumber(formData, "plasteringCostPerSqFt"),
      skipCost: number(formData, "skipCost"),
      skipCoverageSqFt: number(formData, "skipCoverageSqFt", 915),
      acquisitionCostPerSqFt: nullableNumber(formData, "acquisitionCostPerSqFt"),
      plumbingDayRate: number(formData, "plumbingDayRate"),
      electricianDayRate: number(formData, "electricianDayRate"),
      decoratorDayRate: number(formData, "decoratorDayRate"),
      plastererDayRate: current.plastererDayRate,
      lightTradeDays: number(formData, "lightTradeDays"),
      mediumTradeDays: number(formData, "mediumTradeDays"),
      heavyTradeDays: number(formData, "heavyTradeDays"),
      mortgageCostPerMonth: number(formData, "mortgageCostPerMonth"),
      councilTaxPerMonth: number(formData, "councilTaxPerMonth"),
      utilitiesPerMonth: number(formData, "utilitiesPerMonth"),
      insurancePerMonth: number(formData, "insurancePerMonth"),
      stampDutyDefault: current.stampDutyDefault,
      purchaseLegalFees: number(formData, "purchaseLegalFees"),
      survey: number(formData, "survey"),
      brokerFee: number(formData, "brokerFee"),
      lenderValuationFee: 0,
      mortgageArrangementFee: 0,
      saleLegalFees: number(formData, "saleLegalFees"),
      epc: 0,
      stagingPhotography: 0,
      mortgageExitFee: 0,
      estateAgentFeeMode: "PERCENTAGE",
      estateAgentFixedFee: 0,
      estateAgentPercentage: nullableNumber(formData, "estateAgentPercentage") ?? 1.2,
      contingencyPercentage: number(formData, "contingencyPercentage"),
    },
  });

  revalidatePath("/");
  revalidatePath("/assumptions");
  revalidatePath("/projects");
  redirect("/assumptions");
}

export async function updateProjectAction(formData: FormData) {
  const assumptions = await getAssumptions();
  const projectId = text(formData, "projectId");
  const purchasePrice = number(formData, "actualPurchasePrice");
  const internalSqFt = nullableNumber(formData, "internalSqFt");
  const flooringScope = text(formData, "flooringScope", "NONE");
  const plasteringScope = text(formData, "plasteringScope", "NONE");
  const flooringSqFt = flooringScope === "WHOLE" ? internalSqFt : flooringScope === "SPECIFIC" ? nullableNumber(formData, "flooringSqFt") : null;
  const plasteringSqFt =
    plasteringScope === "WHOLE" ? internalSqFt : plasteringScope === "SPECIFIC" ? nullableNumber(formData, "plasteringSqFt") : null;

  if (!projectId) return;

  const projectData: ProjectInput = {
    name: text(formData, "name", "Untitled deal"),
    projectLink: text(formData, "projectLink") || null,
    addressOrArea: null,
    propertyType: text(formData, "propertyType", "BUNGALOW") as ProjectInput["propertyType"],
    bedrooms: null,
    bathrooms: null,
    internalSqFt,
    kitchenSqFt: nullableNumber(formData, "kitchenSqFt"),
    bathroomSqFt: nullableNumber(formData, "bathroomSqFt"),
    flooringSqFt,
    plasteringSqFt,
    plumbingHours: nullableNumber(formData, "plumbingHours"),
    electricalHours: nullableNumber(formData, "electricalHours"),
    askingPrice: purchasePrice,
    estimatedMarketValue: null,
    estimatedSalePrice: number(formData, "estimatedSalePrice", purchasePrice),
    targetPurchasePrice: null,
    actualPurchasePrice: purchasePrice,
    conditionLevel: "MEDIUM_COSMETIC",
    needsKitchen: bool(formData, "needsKitchen"),
    needsBathroom: bool(formData, "needsBathroom"),
    needsFlooring: flooringScope !== "NONE",
    needsDecorating: bool(formData, "needsDecorating"),
    needsMinorPlumbing: bool(formData, "needsMinorPlumbing"),
    needsMinorElectrical: bool(formData, "needsMinorElectrical"),
    needsGardenWork: bool(formData, "needsGardenWork"),
    plumbingLevel: "NONE",
    electricalLevel: "NONE",
    decoratingLevel: text(formData, "decoratingLevel", "NONE") as ProjectInput["decoratingLevel"],
    plasteringLevel: "NONE",
    estimatedHoldingMonths: number(formData, "estimatedHoldingMonths", 9),
    financeType: text(formData, "financeType", "MORTGAGE") as ProjectInput["financeType"],
    depositAmount: nullableNumber(formData, "depositAmount"),
    mortgageInterestRate: nullableNumber(formData, "mortgageInterestRate"),
    mortgageTermYears: nullableNumber(formData, "mortgageTermYears"),
    councilTaxPerMonth: nullableNumber(formData, "councilTaxPerMonth"),
    utilitiesPerMonth: nullableNumber(formData, "utilitiesPerMonth"),
    insurancePerMonth: nullableNumber(formData, "insurancePerMonth"),
    targetRoiPercent: null,
    targetProfit: null,
    notes: text(formData, "notes") || null,
    survey: nullableNumber(formData, "survey"),
    purchaseLegalFees: nullableNumber(formData, "purchaseLegalFees"),
    brokerFee: nullableNumber(formData, "brokerFee"),
    lenderValuationFee: 0,
    mortgageArrangementFee: 0,
    saleLegalFees: nullableNumber(formData, "saleLegalFees"),
    epc: 0,
    stagingPhotography: 0,
    mortgageExitFee: null,
    capitalGainsTax: nullableNumber(formData, "capitalGainsTax"),
    estateAgentFeeMode: "PERCENTAGE",
    estateAgentFixedFee: null,
    estateAgentPercentage: nullableNumber(formData, "estateAgentPercentage") ?? 1.2,
    contingencyPercentage: nullableNumber(formData, "contingencyPercentage"),
  };

  const db = getDb();
  const project = await db.project.update({
    where: { id: projectId },
    data: {
      ...projectData,
      plumbingLevel: projectData.plumbingLevel ?? "NONE",
      electricalLevel: projectData.electricalLevel ?? "NONE",
      decoratingLevel: projectData.decoratingLevel ?? "NONE",
      plasteringLevel: projectData.plasteringLevel ?? "NONE",
    },
  });
  const result = calculateDeal(project as ProjectInput, assumptions as AssumptionsInput);

  await db.projectSnapshot.create({
    data: {
      projectId: project.id,
      acquisitionCosts: result.acquisition,
      renovationCosts: result.renovation,
      holdingCosts: result.holding,
      disposalCosts: result.disposal,
      results: result.metrics,
      sensitivity: result.sensitivity,
      warnings: result.warnings,
    },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}`);
}

export async function addRenovationCostItemAction(formData: FormData) {
  const projectId = text(formData, "projectId");
  const name = text(formData, "name");
  const amount = number(formData, "amount");
  const purchased = bool(formData, "purchased");

  if (!projectId || !name || amount <= 0) return;

  await getDb().renovationCostItem.create({
    data: {
      projectId,
      name,
      tag: text(formData, "tag") || null,
      amount,
      purchased,
      supplier: text(formData, "supplier") || null,
      purchaseUrl: text(formData, "purchaseUrl") || null,
      notes: text(formData, "notes") || null,
      purchasedAt: purchased ? new Date() : null,
    },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
}

export async function addRenovationReceiptItemsAction(formData: FormData) {
  const projectId = text(formData, "projectId");
  const tag = text(formData, "tag") || null;
  const supplier = text(formData, "supplier") || null;
  const rawItems = text(formData, "items", "[]");

  if (!projectId) return;

  let parsedItems: unknown;
  try {
    parsedItems = JSON.parse(rawItems);
  } catch {
    return;
  }

  if (!Array.isArray(parsedItems)) return;

  const items = parsedItems
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const name = "description" in item && typeof item.description === "string" ? item.description.trim() : "";
      const amount = "amount" in item ? Number(item.amount) : Number.NaN;
      return name && Number.isFinite(amount) && amount > 0 ? { amount, name } : null;
    })
    .filter((item): item is { amount: number; name: string } => Boolean(item))
    .slice(0, 50);

  if (items.length === 0) return;

  const purchasedAt = new Date();
  await getDb().renovationCostItem.createMany({
    data: items.map((item) => ({
      projectId,
      name: item.name,
      tag,
      amount: item.amount,
      purchased: true,
      supplier,
      notes: "Added from an approved receipt scan.",
      purchasedAt,
    })),
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
}

export async function updateRenovationCostItemStatusAction(formData: FormData) {
  const projectId = text(formData, "projectId");
  const itemId = text(formData, "itemId");
  const status = text(formData, "status", "planned");
  const purchased = status === "purchased";

  if (!projectId || !itemId) return;

  await getDb().renovationCostItem.update({
    where: { id: itemId },
    data: {
      purchased,
      purchasedAt: purchased ? new Date() : null,
    },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteRenovationCostItemAction(formData: FormData) {
  const projectId = text(formData, "projectId");
  const itemId = text(formData, "itemId");

  if (!projectId || !itemId) return;

  await getDb().renovationCostItem.delete({ where: { id: itemId } });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
}
