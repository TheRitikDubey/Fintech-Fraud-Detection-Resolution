// Bulk transaction generator for performance testing. Inserts GEN_COUNT transactions
// (default 200k; ≥1M capable) across GEN_CUSTOMERS customers via batched createMany.
//
// ⚠️  Intended for a LOCAL Postgres. Point DATABASE_URL (api/.env) at a local instance —
//     generating large volumes against the pooled cloud DB is slow and burns quota.
//
// Run from the repo root:  GEN_COUNT=1000000 npm run gen:txns
import "../api/src/config/env";
import { prisma } from "../api/src/db/client";

const COUNT = Number(process.env.GEN_COUNT ?? 200_000);
const CUSTOMERS = Number(process.env.GEN_CUSTOMERS ?? 1_000);
const BATCH = Number(process.env.GEN_BATCH ?? 5_000);
const PREFIX = "perf_cust_";
const DAY_MS = 24 * 60 * 60 * 1000;
const SPREAD_DAYS = 180; // so a ?from=<90d ago> filter selects roughly half

const MERCHANTS = [
  { name: "Starbucks", mcc: "5814" },
  { name: "Whole Foods", mcc: "5411" },
  { name: "Shell", mcc: "5541" },
  { name: "Amazon", mcc: "5999" },
  { name: "Uber", mcc: "4121" },
  { name: "Delta Airlines", mcc: "3000" },
];
const COUNTRIES = ["US", "GB", "DE", "FR", "IN"];

const randInt = (n: number): number => Math.floor(Math.random() * n);

interface TxnRow {
  customerId: string;
  txnId: string;
  amountCents: bigint;
  currency: string;
  mcc: string;
  merchant: string;
  country: string;
  city: string;
  status: string;
  ts: Date;
}

async function main(): Promise<void> {
  console.warn(
    "⚠️  generate-transactions is intended for a LOCAL Postgres. Large volumes against a pooled/remote DB are slow.",
  );
  console.log(`Generating ${COUNT.toLocaleString()} transactions across ${CUSTOMERS.toLocaleString()} customers…`);

  // Ensure perf customers exist (FK requirement).
  const customers = Array.from({ length: CUSTOMERS }, (_, i) => ({
    id: `${PREFIX}${i}`,
    name: `Perf Customer ${i}`,
    email: `${PREFIX}${i}@example.com`,
  }));
  await prisma.customer.createMany({ data: customers, skipDuplicates: true });

  const now = Date.now();
  const start = Date.now();
  let inserted = 0;
  let batch: TxnRow[] = [];

  for (let i = 0; i < COUNT; i += 1) {
    const merchant = MERCHANTS[randInt(MERCHANTS.length)];
    const ts = new Date(now - randInt(SPREAD_DAYS) * DAY_MS - randInt(DAY_MS));
    batch.push({
      customerId: `${PREFIX}${randInt(CUSTOMERS)}`,
      txnId: `perf_${i}`, // globally unique -> (customerId, txnId) unique
      amountCents: BigInt(200 + randInt(50_000)),
      currency: "USD",
      mcc: merchant.mcc,
      merchant: merchant.name,
      country: COUNTRIES[randInt(COUNTRIES.length)],
      city: "City",
      status: "SUCCESS",
      ts,
    });

    if (batch.length >= BATCH) {
      await prisma.transaction.createMany({ data: batch, skipDuplicates: true });
      inserted += batch.length;
      batch = [];
      process.stdout.write(`\r  inserted ${inserted.toLocaleString()}/${COUNT.toLocaleString()}`);
    }
  }
  if (batch.length > 0) {
    await prisma.transaction.createMany({ data: batch, skipDuplicates: true });
    inserted += batch.length;
  }

  const secs = (Date.now() - start) / 1000;
  console.log(`\nInserted ${inserted.toLocaleString()} transactions in ${secs.toFixed(1)}s (~${Math.round(inserted / secs).toLocaleString()}/s).`);
  console.log(
    `Perf check: time GET /api/customer/${PREFIX}0/transactions?from=${new Date(now - 90 * DAY_MS).toISOString()}&limit=50  (target p95 ≤ 100ms @ 1M rows, local).`,
  );
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
