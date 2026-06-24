import "dotenv/config";
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

function dbPathFromUrl(url: string) {
  if (!url.startsWith("file:")) return url;
  return resolve(process.cwd(), url.replace("file:", ""));
}

const dbPath = dbPathFromUrl(process.env.DATABASE_URL ?? "file:./prisma/dev.db");
mkdirSync(dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma("foreign_keys = ON");

function addColumnIfMissing(table: string, column: string, definition: string) {
  const columns = db.prepare(`PRAGMA table_info("${table}")`).all() as { name: string }[];
  if (!columns.some((entry) => entry.name === column)) {
    db.exec(`ALTER TABLE "${table}" ADD COLUMN "${column}" ${definition}`);
  }
}

db.exec(`
CREATE TABLE IF NOT EXISTS "Project" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "projectLink" TEXT,
  "addressOrArea" TEXT,
  "propertyType" TEXT NOT NULL,
  "bedrooms" INTEGER,
  "bathrooms" INTEGER,
  "internalSqFt" REAL,
  "kitchenSqFt" REAL,
  "bathroomSqFt" REAL,
  "flooringSqFt" REAL,
  "plasteringSqFt" REAL,
  "plumbingHours" REAL,
  "electricalHours" REAL,
  "askingPrice" REAL,
  "estimatedMarketValue" REAL,
  "estimatedSalePrice" REAL NOT NULL,
  "targetPurchasePrice" REAL,
  "actualPurchasePrice" REAL NOT NULL,
  "conditionLevel" TEXT NOT NULL,
  "needsKitchen" BOOLEAN NOT NULL DEFAULT false,
  "needsBathroom" BOOLEAN NOT NULL DEFAULT false,
  "needsFlooring" BOOLEAN NOT NULL DEFAULT false,
  "needsDecorating" BOOLEAN NOT NULL DEFAULT false,
  "needsMinorPlumbing" BOOLEAN NOT NULL DEFAULT false,
  "needsMinorElectrical" BOOLEAN NOT NULL DEFAULT false,
  "needsGardenWork" BOOLEAN NOT NULL DEFAULT false,
  "plumbingLevel" TEXT NOT NULL DEFAULT 'NONE',
  "electricalLevel" TEXT NOT NULL DEFAULT 'NONE',
  "decoratingLevel" TEXT NOT NULL DEFAULT 'NONE',
  "plasteringLevel" TEXT NOT NULL DEFAULT 'NONE',
  "estimatedHoldingMonths" INTEGER NOT NULL,
  "financeType" TEXT NOT NULL,
  "depositAmount" REAL,
  "mortgageInterestRate" REAL,
  "mortgageTermYears" REAL,
  "targetRoiPercent" REAL,
  "targetProfit" REAL,
  "notes" TEXT,
  "stampDuty" REAL,
  "survey" REAL,
  "purchaseLegalFees" REAL,
  "brokerFee" REAL,
  "lenderValuationFee" REAL,
  "mortgageArrangementFee" REAL,
  "kitchenCost" REAL,
  "bathroomCost" REAL,
  "flooringCost" REAL,
  "decoratingCost" REAL,
  "plumbingCost" REAL,
  "electricalCost" REAL,
  "gardenCost" REAL,
  "restOfHouseCost" REAL,
  "miscCost" REAL,
  "contingencyPercentage" REAL,
  "mortgageCostPerMonth" REAL,
  "councilTaxPerMonth" REAL,
  "utilitiesPerMonth" REAL,
  "insurancePerMonth" REAL,
  "estateAgentFeeMode" TEXT,
  "estateAgentFixedFee" REAL,
  "estateAgentPercentage" REAL,
  "saleLegalFees" REAL,
  "epc" REAL,
  "stagingPhotography" REAL,
  "mortgageExitFee" REAL,
  "capitalGainsTax" REAL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Assumption" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "kitchenDefault" REAL NOT NULL DEFAULT 4750,
  "bathroomDefault" REAL NOT NULL DEFAULT 1775,
  "flooringDefault" REAL NOT NULL DEFAULT 0,
  "decoratingDefault" REAL NOT NULL DEFAULT 0,
  "plumbingDefault" REAL NOT NULL DEFAULT 0,
  "electricalDefault" REAL NOT NULL DEFAULT 0,
  "gardenDefault" REAL NOT NULL DEFAULT 0,
  "restOfHouseDefault" REAL NOT NULL DEFAULT 0,
  "miscDefault" REAL NOT NULL DEFAULT 667,
  "renovationCostPerSqFt" REAL,
  "kitchenRenoCostPerSqFt" REAL,
  "bathroomRenoCostPerSqFt" REAL,
  "flooringCostPerSqFt" REAL,
  "plasteringCostPerSqFt" REAL,
  "skipCost" REAL NOT NULL DEFAULT 240,
  "skipCoverageSqFt" REAL NOT NULL DEFAULT 915,
  "acquisitionCostPerSqFt" REAL,
  "plumbingDayRate" REAL NOT NULL DEFAULT 385,
  "electricianDayRate" REAL NOT NULL DEFAULT 385,
  "decoratorDayRate" REAL NOT NULL DEFAULT 250,
  "plastererDayRate" REAL NOT NULL DEFAULT 300,
  "lightTradeDays" REAL NOT NULL DEFAULT 0.5,
  "mediumTradeDays" REAL NOT NULL DEFAULT 1,
  "heavyTradeDays" REAL NOT NULL DEFAULT 2,
  "mortgageCostPerMonth" REAL NOT NULL DEFAULT 279,
  "councilTaxPerMonth" REAL NOT NULL DEFAULT 190,
  "utilitiesPerMonth" REAL NOT NULL DEFAULT 113,
  "insurancePerMonth" REAL NOT NULL DEFAULT 10,
  "stampDutyDefault" REAL NOT NULL DEFAULT 1200,
  "purchaseLegalFees" REAL NOT NULL DEFAULT 1200,
  "survey" REAL NOT NULL DEFAULT 500,
  "brokerFee" REAL NOT NULL DEFAULT 199,
  "lenderValuationFee" REAL NOT NULL DEFAULT 0,
  "mortgageArrangementFee" REAL NOT NULL DEFAULT 0,
  "saleLegalFees" REAL NOT NULL DEFAULT 1000,
  "epc" REAL NOT NULL DEFAULT 0,
  "stagingPhotography" REAL NOT NULL DEFAULT 0,
  "mortgageExitFee" REAL NOT NULL DEFAULT 350,
  "estateAgentFeeMode" TEXT NOT NULL DEFAULT 'FIXED',
  "estateAgentFixedFee" REAL NOT NULL DEFAULT 2640,
  "estateAgentPercentage" REAL,
  "contingencyPercentage" REAL NOT NULL DEFAULT 10,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ProjectSnapshot" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "projectId" TEXT NOT NULL,
  "acquisitionCosts" JSONB NOT NULL,
  "renovationCosts" JSONB NOT NULL,
  "holdingCosts" JSONB NOT NULL,
  "disposalCosts" JSONB NOT NULL,
  "results" JSONB NOT NULL,
  "sensitivity" JSONB NOT NULL,
  "warnings" JSONB NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProjectSnapshot_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "RenovationCostItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "projectId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "tag" TEXT,
  "amount" REAL NOT NULL,
  "purchased" BOOLEAN NOT NULL DEFAULT false,
  "supplier" TEXT,
  "purchaseUrl" TEXT,
  "notes" TEXT,
  "purchasedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RenovationCostItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
`);

addColumnIfMissing("Project", "kitchenSqFt", "REAL");
addColumnIfMissing("Project", "projectLink", "TEXT");
addColumnIfMissing("Project", "bathroomSqFt", "REAL");
addColumnIfMissing("Project", "flooringSqFt", "REAL");
addColumnIfMissing("Project", "plasteringSqFt", "REAL");
addColumnIfMissing("Project", "plumbingHours", "REAL");
addColumnIfMissing("Project", "electricalHours", "REAL");
addColumnIfMissing("Project", "plumbingLevel", "TEXT NOT NULL DEFAULT 'NONE'");
addColumnIfMissing("Project", "electricalLevel", "TEXT NOT NULL DEFAULT 'NONE'");
addColumnIfMissing("Project", "decoratingLevel", "TEXT NOT NULL DEFAULT 'NONE'");
addColumnIfMissing("Project", "plasteringLevel", "TEXT NOT NULL DEFAULT 'NONE'");
addColumnIfMissing("Project", "depositAmount", "REAL");
addColumnIfMissing("Project", "mortgageInterestRate", "REAL");
addColumnIfMissing("Project", "mortgageTermYears", "REAL");
addColumnIfMissing("Assumption", "kitchenRenoCostPerSqFt", "REAL");
addColumnIfMissing("Assumption", "bathroomRenoCostPerSqFt", "REAL");
addColumnIfMissing("Assumption", "flooringCostPerSqFt", "REAL");
addColumnIfMissing("Assumption", "plasteringCostPerSqFt", "REAL");
addColumnIfMissing("Assumption", "skipCost", "REAL NOT NULL DEFAULT 240");
addColumnIfMissing("Assumption", "skipCoverageSqFt", "REAL NOT NULL DEFAULT 915");
addColumnIfMissing("Assumption", "acquisitionCostPerSqFt", "REAL");
addColumnIfMissing("Assumption", "plumbingDayRate", "REAL NOT NULL DEFAULT 385");
addColumnIfMissing("Assumption", "electricianDayRate", "REAL NOT NULL DEFAULT 385");
addColumnIfMissing("Assumption", "decoratorDayRate", "REAL NOT NULL DEFAULT 250");
addColumnIfMissing("Assumption", "plastererDayRate", "REAL NOT NULL DEFAULT 300");
addColumnIfMissing("Assumption", "lightTradeDays", "REAL NOT NULL DEFAULT 0.5");
addColumnIfMissing("Assumption", "mediumTradeDays", "REAL NOT NULL DEFAULT 1");
addColumnIfMissing("Assumption", "heavyTradeDays", "REAL NOT NULL DEFAULT 2");

db.close();
console.log(`SQLite database ready at ${dbPath}`);
