import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const QUOTA_PATH = resolve(__dir, '.quota-usage.json');

// Coûts en unités YouTube Data API v3 (quota journalier : 10 000 unités)
export const QUOTA_COSTS = {
  'videos.insert':       1600,
  'thumbnails.set':        50,
  'videos.update':         50,
  'videos.list':            1,
};

const DAILY_LIMIT = 10_000;

function today() {
  return new Date().toISOString().slice(0, 10);
}

function loadState() {
  if (!existsSync(QUOTA_PATH)) return { date: today(), used: 0 };
  const state = JSON.parse(readFileSync(QUOTA_PATH, 'utf8'));
  if (state.date !== today()) return { date: today(), used: 0 };
  return state;
}

function save(state) {
  writeFileSync(QUOTA_PATH, JSON.stringify(state, null, 2));
}

export function checkQuota(operations) {
  const cost = operations.reduce((sum, op) => sum + (QUOTA_COSTS[op] ?? 0), 0);
  const state = loadState();
  const remaining = DAILY_LIMIT - state.used;

  if (cost > remaining) {
    throw new Error(
      `Quota insuffisant. Besoin : ${cost} unités | Restant : ${remaining}/${DAILY_LIMIT} unités aujourd'hui (${today()}).`
    );
  }
  return { cost, remaining, state };
}

export function consumeQuota(operations) {
  const { cost, state } = checkQuota(operations);
  state.used += cost;
  save(state);
  console.log(`Quota consommé : ${cost} unités | Utilisé aujourd'hui : ${state.used}/${DAILY_LIMIT}`);
}

export function showQuotaStatus() {
  const state = loadState();
  const remaining = DAILY_LIMIT - state.used;
  console.log(`\nQuota YouTube API — ${state.date}`);
  console.log(`  Utilisé   : ${state.used} unités`);
  console.log(`  Restant   : ${remaining} unités`);
  console.log(`  Limite    : ${DAILY_LIMIT} unités/jour`);
  console.log(`  Max uploads restants : ${Math.floor(remaining / (QUOTA_COSTS['videos.insert'] + QUOTA_COSTS['thumbnails.set']))}\n`);
}
