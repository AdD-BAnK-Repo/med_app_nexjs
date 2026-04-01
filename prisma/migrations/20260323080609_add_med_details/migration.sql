-- CreateTable
CREATE TABLE "Medication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "location" TEXT,
    "shelf" TEXT,
    "isNoStock" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Inspection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "medicationId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "expiryDate" TEXT,
    "qtyUnder3Months" INTEGER,
    "qtyUnder8Months" INTEGER,
    "checkedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Inspection_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FireExtinguisher" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "location" TEXT NOT NULL,
    "assetCode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "FireInspection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "extinguisherId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "nozzleStatus" TEXT NOT NULL,
    "pinStatus" TEXT NOT NULL,
    "invertStatus" TEXT NOT NULL,
    "gaugeStatus" TEXT NOT NULL,
    "overallStatus" TEXT NOT NULL,
    "inspector" TEXT NOT NULL,
    "note" TEXT,
    "checkedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FireInspection_extinguisherId_fkey" FOREIGN KEY ("extinguisherId") REFERENCES "FireExtinguisher" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmergencyLight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "location" TEXT NOT NULL,
    "assetCode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "LightInspection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lightId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "ledStatus" TEXT NOT NULL,
    "chargeStatus" TEXT NOT NULL,
    "testStatus" TEXT NOT NULL,
    "overallStatus" TEXT NOT NULL,
    "inspector" TEXT NOT NULL,
    "note" TEXT,
    "checkedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LightInspection_lightId_fkey" FOREIGN KEY ("lightId") REFERENCES "EmergencyLight" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Inspection_medicationId_month_year_key" ON "Inspection"("medicationId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "FireInspection_extinguisherId_month_year_key" ON "FireInspection"("extinguisherId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "LightInspection_lightId_month_year_key" ON "LightInspection"("lightId", "month", "year");
