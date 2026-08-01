// Demo seed: customers + accounts + cards + baseline transactions (with injected
// anomalies), then real alerts via the actual scoring pipeline. Idempotent — resets its
// own `seed_*` data on each run. Configure with SEED_CUSTOMERS / SEED_TXNS_PER_CUSTOMER.
//
// Run from the repo root:  npm run seed
import "../api/src/config/env"; // loads api/.env (DATABASE_URL) before the client connects
import { prisma } from "../api/src/db/client";
import { scoreAndCreateAlerts } from "../api/src/scoring/scoreAndAlert";

const CUSTOMERS = Number(process.env.SEED_CUSTOMERS ?? 8);
const TXNS_PER_CUSTOMER = Number(process.env.SEED_TXNS_PER_CUSTOMER ?? 250);
const PREFIX = "seed_cust_";
const DAY_MS = 24 * 60 * 60 * 1000;

const MERCHANTS = [
  { name: "Starbucks", mcc: "5814" },
  { name: "Whole Foods", mcc: "5411" },
  { name: "Shell", mcc: "5541" },
  { name: "Amazon", mcc: "5999" },
  { name: "Uber", mcc: "4121" },
  { name: "Netflix", mcc: "4899" },
];
const HOMES = [
  { country: "US", city: "San Francisco" },
  { country: "US", city: "Austin" },
  { country: "GB", city: "London" },
  { country: "DE", city: "Berlin" },
];
const NETWORKS = ["VISA", "MASTERCARD", "AMEX"];

const randInt = (n: number): number => Math.floor(Math.random() * n);
const pick = <T>(arr: T[]): T => arr[randInt(arr.length)];

async function resetSeed(): Promise<void> {
  const byCustomer = { customerId: { startsWith: PREFIX } };
  await prisma.caseEvent.deleteMany({ where: { case: byCustomer } });
  await prisma.case.deleteMany({ where: byCustomer });
  await prisma.alert.deleteMany({ where: byCustomer });
  await prisma.transaction.deleteMany({ where: byCustomer });
  await prisma.card.deleteMany({ where: byCustomer });
  await prisma.account.deleteMany({ where: byCustomer });
  await prisma.customer.deleteMany({ where: { id: { startsWith: PREFIX } } });
}

function buildTransactions(customerId: string, home: (typeof HOMES)[number]) {
  const now = Date.now();

  // Baseline: typical merchants, home country, daytime hours, modest amounts.
  const baseline = Array.from({ length: TXNS_PER_CUSTOMER }, (_, i) => {
    const merchant = pick(MERCHANTS);
    const ts = new Date(now - randInt(90) * DAY_MS);
    ts.setUTCHours(8 + randInt(10), randInt(60), 0, 0);
    return {
      customerId,
      txnId: `${customerId}_t${i}`,
      amountCents: BigInt(500 + randInt(20_000)), // $5–$205
      currency: "USD",
      mcc: merchant.mcc,
      merchant: merchant.name,
      country: home.country,
      city: home.city,
      status: "SUCCESS",
      ts,
    };
  });

  // A few blatant anomalies: large amount, new country/merchant, rare MCC, odd hour.
  const anomalies = Array.from({ length: 3 }, (_, a) => {
    const ts = new Date(now - randInt(20) * DAY_MS);
    ts.setUTCHours(3, randInt(60), 0, 0);
    return {
      customerId,
      txnId: `${customerId}_anom${a}`,
      amountCents: BigInt(300_000 + randInt(500_000)), // $3k–$8k
      currency: "USD",
      mcc: "5944",
      merchant: "Luxury Imports",
      country: "RU",
      city: "Moscow",
      status: "SUCCESS",
      ts,
    };
  });

  return [...baseline, ...anomalies];
}

async function main(): Promise<void> {
  console.log(`Seeding ${CUSTOMERS} customers × ~${TXNS_PER_CUSTOMER} transactions…`);
  await resetSeed();

  let totalTxns = 0;
  let totalAlerts = 0;

  for (let c = 0; c < CUSTOMERS; c += 1) {
    const id = `${PREFIX}${String(c + 1).padStart(4, "0")}`;
    const home = pick(HOMES);

    await prisma.customer.create({ data: { id, name: `Customer ${c + 1}`, email: `${id}@example.com` } });
    const account = await prisma.account.create({
      data: { customerId: id, type: "CHECKING", currency: "USD" },
    });
    await prisma.card.create({
      data: {
        customerId: id,
        accountId: account.id,
        last4: String(1000 + randInt(9000)),
        network: pick(NETWORKS),
        status: "ACTIVE",
      },
    });

    const data = buildTransactions(id, home);
    await prisma.transaction.createMany({ data });
    totalTxns += data.length;

    // Reuse the real scoring pipeline to produce explainable alerts.
    const rows = await prisma.transaction.findMany({
      where: { customerId: id },
      select: { id: true, customerId: true, amountCents: true, merchant: true, country: true, mcc: true, ts: true },
    });
    const created = await scoreAndCreateAlerts(rows);
    totalAlerts += created;
    process.stdout.write(`  ${id}: ${data.length} txns, ${created} alerts\n`);
  }

  console.log(`\nDone — ${CUSTOMERS} customers, ${totalTxns} transactions, ${totalAlerts} alerts.`);
  console.log(`Visit /alerts in the web app, or GET /api/alerts.`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
