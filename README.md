# Renovation Deal Analyser

A simple database-backed Next.js app for analysing UK renovation and flip opportunities.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Postgres
- Prisma Client
- Vitest

## Install

```bash
npm install
npm run db:setup
npm run db:generate
npm run db:seed
```

Set `DATABASE_URL` to a Postgres connection string before running database commands. On Vercel, connect a Postgres storage integration and it will provide `DATABASE_URL` automatically.

## Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Useful Commands

```bash
npm test
npm run lint
npm run build
npm run db:seed
```

## Seed Data

The database seed creates one project:

- `Erica Drive`
- Size: `915 sq ft`, taken from the attached floor plan
- Kitchen: `71.53 sq ft`
- Bathroom: `34.76 sq ft`
- Finance figures from the Erica Drive `P&L` sheet

The displayed renovation line items in the source sheet have a one-penny rounding difference. The seed uses the sheet's headline total of `£9,233.38` so all-in cost, net profit, and ROI match the reference model.

## Editing Assumptions

Go to `/assumptions` to edit default costs for:

- Kitchen, bathroom, brilliant-white paint sqft rate, skip, and contingency
- Kitchen and bathroom renovation cost per sq ft
- Flooring and plastering labour cost per sq ft, with new deals allowing whole-house or specific-area estimates
- Acquisition cost per sq ft benchmark
- Plumbing and electrical hourly rates
- Decorator day rate and the day-count mapping for light, medium, and heavy work
- Monthly finance, council tax, utilities, and insurance
- Survey, purchase legal fees, and broker fee
- Sale legal fees and estate agent percentage

New deals inherit these assumptions unless a project has specific cost overrides.

## Calculation Summary

Acquisition costs:

```text
purchase price
+ second-home SDLT
+ survey
+ purchase legal fees
+ broker fee
```

Renovation costs:

```text
selected kitchen/bathroom works using room sq ft * room cost per sq ft
+ flooring/plastering works using selected sq ft * cost per sq ft
+ brilliant-white paint using total sq ft * paint cost per sq ft
+ plumbing/electrical labour using estimated hours * hourly rate
+ selected light/medium/heavy decorator labour
+ skip count using total sq ft / skip coverage sq ft
+ contingency
```

Holding costs:

```text
(monthly finance + council tax + utilities + insurance) * months held
```

For mortgage deals with APR and term:

```text
borrowed amount = purchase price - deposit amount
monthly rate = APR / 12
monthly repayment = borrowed amount * (monthly rate * (1 + monthly rate)^term months) / ((1 + monthly rate)^term months - 1)
outstanding balance after holding = amortised balance after months held
```

If no mortgage term is entered, finance falls back to the monthly finance assumption.
For cash deals, monthly finance is `£0`.

Disposal costs:

```text
estate agent fee
+ sale legal fees
+ mortgage exit fee
```

Stamp duty is calculated as England and Northern Ireland second-home SDLT. Estate agent fees are calculated as `sale price * estate agent %`, defaulting to `1.2%`. Mortgage exit fees are calculated from the outstanding debt after mortgage repayments: `2%` under 12 months held, `1%` from 12 to under 24 months, and `0%` from 24 months onward.

Profit and ROI:

```text
all-in cost = acquisition + renovation + holding + disposal
gross profit = sale price - all-in cost
net profit = gross profit - capital gains tax
ROI = net profit / all-in cost * 100
```

Sale price guidance solves for the sale price needed to hit target ROI bands. New projects use the 10% ROI sale price as their base advised sale price, and the project detail page also shows the prices needed for 11-20% and 21-30% ROI.
