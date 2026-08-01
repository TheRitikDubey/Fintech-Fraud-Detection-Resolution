// Eval harness: run known-fraud / known-legit scenarios through the scoring core and
// report precision / recall / F1 / accuracy. Pure — no DB, no network.
//
// Run from the repo root:  npm run eval
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { scoreTransaction } from "../api/src/scoring/score";
import type { ScorableTxn } from "../api/src/scoring/types";

const THRESHOLD = Number(process.env.SCORE_THRESHOLD ?? 70);

type Label = "fraud" | "legit";

interface RawTxn {
  amountCents: number;
  merchant: string;
  country: string;
  mcc: string;
  ts: string;
}
interface Scenario {
  name: string;
  history: RawTxn[];
  txn: RawTxn;
}

const toScorable = (r: RawTxn): ScorableTxn => ({
  amountCents: BigInt(r.amountCents),
  merchant: r.merchant,
  country: r.country,
  mcc: r.mcc,
  ts: new Date(r.ts),
});

function load(file: string): Scenario[] {
  const path = fileURLToPath(new URL(`../fixtures/${file}`, import.meta.url));
  return JSON.parse(readFileSync(path, "utf8")) as Scenario[];
}

interface Row {
  name: string;
  label: Label;
  score: number;
  predicted: Label;
  correct: boolean;
}

function evaluate(scenarios: Scenario[], label: Label): Row[] {
  return scenarios.map((s) => {
    const { score } = scoreTransaction(toScorable(s.txn), s.history.map(toScorable));
    const predicted: Label = score >= THRESHOLD ? "fraud" : "legit";
    return { name: s.name, label, score, predicted, correct: predicted === label };
  });
}

const rows = [
  ...evaluate(load("known-fraud.json"), "fraud"),
  ...evaluate(load("known-legit.json"), "legit"),
];

let tp = 0;
let fp = 0;
let fn = 0;
let tn = 0;
for (const r of rows) {
  if (r.label === "fraud" && r.predicted === "fraud") tp += 1;
  else if (r.label === "legit" && r.predicted === "fraud") fp += 1;
  else if (r.label === "fraud" && r.predicted === "legit") fn += 1;
  else tn += 1;
}

const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
const accuracy = rows.length === 0 ? 0 : (tp + tn) / rows.length;

console.log(`\nScoring eval — alert threshold = ${THRESHOLD}\n`);
console.log("  RESULT  LABEL  SCORE  SCENARIO");
console.log("  ------  -----  -----  --------");
for (const r of rows) {
  const mark = r.correct ? "✓" : "✗";
  console.log(`    ${mark}    ${r.label.padEnd(5)}   ${String(r.score).padStart(3)}   ${r.name}`);
}

console.log(`\n  Confusion matrix          predicted`);
console.log(`                         fraud   legit`);
console.log(`            actual fraud   ${String(tp).padStart(2)}      ${String(fn).padStart(2)}`);
console.log(`            actual legit   ${String(fp).padStart(2)}      ${String(tn).padStart(2)}`);

console.log(
  `\n  Precision ${precision.toFixed(3)}  |  Recall ${recall.toFixed(3)}  |  F1 ${f1.toFixed(3)}  |  Accuracy ${accuracy.toFixed(3)}\n`,
);
