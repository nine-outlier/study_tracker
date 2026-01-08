// smartLearningEngine.js
// "Always-on brain": always tracks and updates a per-deck mega history store.
// Button in UI should ONLY toggle Smart Quiz/Test selection strategy.
//
// Key ideas:
// - Per-item (question) stats with rolling history ring buffers (recent performance)
// - Per-domain stats (domain detection from question.domain or inferred)
// - Per-concept stats (concept tags)
// - Spaced repetition scheduling per item (due/overdue)
// - Global + per-session pacing stats
// - Multi-factor selection (NOT a single master stat)
// - Outdated detail pruning (keep summary, prune deep logs)

const ENGINE_VERSION = 2;
const ENGINE_SCHEMA = 'v2';

const IDB_DB = 'QuizAppLearningDB';
const IDB_STORE = 'engine_state';
const IDB_VERSION = 1;

const DAY_MS = 24 * 60 * 60 * 1000;

const DEFAULTS = {
  pruning: {
    // keep detailed events for N days, then prune
    maxEventAgeDays: 120,
    // keep per-item rolling history entries for N days
    maxRecentEntryAgeDays: 90,
    // hard caps
    eventMax: 2500,
    // rolling history size per item/domain/concept
    recentMax: 40
  },

  // BKT-ish concept mastery update (lightweight, but useful signal)
  bkt: {
    pLearn: 0.13,
    pGuess: 0.18,
    pSlip: 0.08
  },

  // Selection behavior
  selection: {
    // Study mode focuses on spaced repetition + stable progress
    study: {
      targetP: 0.75,
      band: 0.22,
      explore: 0.10,
      minRepeatMinutes: 8,
      varietyPenalty: 0.28,
      overdueBoost: 0.35,
      weaknessBoost: 0.30,
      uncertaintyBoost: 0.18,
      speedPenalty: 0.10,
      recencyPenalty: 0.20
    },
    // Smart Quiz/Test mode is more ruthless and pushes weaknesses and exam readiness
    test: {
      targetP: 0.68,
      band: 0.20,
      explore: 0.14,
      minRepeatMinutes: 5,
      varietyPenalty: 0.22,
      overdueBoost: 0.18,
      weaknessBoost: 0.45,
      uncertaintyBoost: 0.22,
      speedPenalty: 0.16,
      recencyPenalty: 0.12,
      // extra push: penalize "comfortable wins", emphasize weak domains + recent misses
      comfortPenalty: 0.18,
      recentMissBoost: 0.20
    }
  }
};

// -------------------------
// Persistence (IndexedDB + localStorage fallback)
// -------------------------
function supportsIDB() {
  return typeof window !== 'undefined' && 'indexedDB' in window;
}

function openDb() {
  return new Promise((resolve, reject) => {
    const req = window.indexedDB.open(IDB_DB, IDB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const store = tx.objectStore(IDB_STORE);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
    tx.onerror = () => db.close();
  });
}

async function idbSet(key, value) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    const req = store.put(value, key);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
    tx.onerror = () => db.close();
  });
}

function lsKey(key) {
  return `quiz_engine_${ENGINE_SCHEMA}_${key}`;
}

async function persist(key, state) {
  const payload = { ...state, _persistedAt: Date.now() };
  if (supportsIDB()) {
    try {
      await idbSet(key, payload);
      return;
    } catch {
      // fall back
    }
  }
  try {
    localStorage.setItem(lsKey(key), JSON.stringify(payload));
  } catch {
    // ignore
  }
}

async function loadPersisted(key) {
  if (supportsIDB()) {
    try {
      const v = await idbGet(key);
      if (v) return v;
    } catch {
      // fall back
    }
  }
  try {
    const raw = localStorage.getItem(lsKey(key));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// -------------------------
// Utilities
// -------------------------
const nowMs = () => Date.now();
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const sigmoid = (x) => 1 / (1 + Math.exp(-x));
const logit = (p) => Math.log(p / (1 - p));

function safeClone(obj) {
  // structuredClone is not universal; keep safe & predictable
  try {
    if (typeof structuredClone === 'function') return structuredClone(obj);
  } catch {}
  return JSON.parse(JSON.stringify(obj));
}

function escapeKey(x) {
  return String(x ?? '');
}

function minutesSince(ts) {
  if (!ts) return Infinity;
  return (nowMs() - ts) / 60000;
}

function hourKey(ts) {
  const d = new Date(ts);
  return String(d.getHours()).padStart(2, '0');
}
function dayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function bump(map, key, field, delta = 1) {
  const next = { ...(map || {}) };
  if (!next[key]) next[key] = {};
  next[key][field] = (next[key][field] || 0) + delta;
  return next;
}

// Exponential moving avg / variance (fast, stable, keeps “recent-ish” weighting)
function updateEMA(prev, value, alpha = 0.18) {
  if (prev == null) return value;
  return prev + alpha * (value - prev);
}
function updateVar(prevVar, prevMean, newMean, value, alpha = 0.18) {
  if (prevVar == null || prevMean == null) return 0;
  const diff = value - newMean;
  return (1 - alpha) * prevVar + alpha * diff * diff;
}

function betaMean(a, b) {
  a = a || 1;
  b = b || 1;
  return a / (a + b);
}

function betaVar(a, b) {
  a = a || 1;
  b = b || 1;
  const s = a + b;
  return (a * b) / (s * s * (s + 1));
}

// -------------------------
// Domain detection (deck-specific and fast)
// -------------------------
function inferDomain(question) {
  // Prefer explicit domain fields if you have them.
  const q = question || {};
  const direct =
    q.domain ?? q.domainId ?? q.domainName ?? q.domainTitle ?? q.category ?? q.section ?? null;
  if (direct) return String(direct);

  // Fallback: use the first concept/tag as domain hint (if your data is structured that way).
  const concepts = Array.isArray(q.concepts) ? q.concepts : Array.isArray(q.tags) ? q.tags : [];
  if (concepts.length > 0) {
    // If you use formats like "Domain 1: Networking", keep it as-is.
    return String(concepts[0]);
  }

  return 'General';
}

// -------------------------
// Rolling history ring buffer utilities
// -------------------------
function ensureRecent(obj, max) {
  if (!obj || typeof obj !== 'object') return { max, entries: [] };
  const m = Number(obj.max || max) || max;
  const entries = Array.isArray(obj.entries) ? obj.entries.slice() : [];
  return { max: m, entries };
}

function pushRecent(recent, entry) {
  const r = ensureRecent(recent, recent?.max || DEFAULTS.pruning.recentMax);
  r.entries.push(entry);
  if (r.entries.length > r.max) r.entries.splice(0, r.entries.length - r.max);
  return r;
}

function pruneRecentByAge(recent, maxAgeDays) {
  const r = ensureRecent(recent, recent?.max || DEFAULTS.pruning.recentMax);
  const cutoff = nowMs() - maxAgeDays * DAY_MS;
  r.entries = r.entries.filter((e) => (e?.t ?? 0) >= cutoff);
  if (r.entries.length > r.max) r.entries.splice(0, r.entries.length - r.max);
  return r;
}

function recentAccuracy(recent) {
  const r = ensureRecent(recent, DEFAULTS.pruning.recentMax);
  if (r.entries.length === 0) return null;
  const correct = r.entries.reduce((acc, e) => acc + (e.correct ? 1 : 0), 0);
  return correct / r.entries.length;
}

function recentMissRate(recent) {
  const a = recentAccuracy(recent);
  return a == null ? null : 1 - a;
}

// -------------------------
// Concept mastery (BKT-ish update)
// -------------------------
function bktUpdate(pKnown, observedCorrect, params) {
  const { pGuess, pSlip, pLearn } = params;

  const pC_given_L = 1 - pSlip;
  const pC_given_notL = pGuess;

  const pI_given_L = pSlip;
  const pI_given_notL = 1 - pGuess;

  let posterior;
  if (observedCorrect) {
    const num = pC_given_L * pKnown;
    const den = num + pC_given_notL * (1 - pKnown);
    posterior = den > 0 ? num / den : pKnown;
  } else {
    const num = pI_given_L * pKnown;
    const den = num + pI_given_notL * (1 - pKnown);
    posterior = den > 0 ? num / den : pKnown;
  }

  const next = posterior + (1 - posterior) * pLearn;
  return clamp(next, 0.0001, 0.9999);
}

// -------------------------
// Spaced repetition scheduling (SM-2-ish)
// -------------------------
function deriveQuality({ correct, rtMs, expectedRtMs, confidence1to5, changedAnswerCount }) {
  let q = correct ? 4 : 1;

  const c = clamp(Number(confidence1to5 || 3), 1, 5);
  const changed = Number(changedAnswerCount || 0);

  // speed effect
  if (expectedRtMs && rtMs != null) {
    const ratio = rtMs / expectedRtMs;
    if (correct) {
      if (ratio < 0.75) q += 0.8;
      else if (ratio > 1.6) q -= 0.8;
    } else {
      if (ratio > 1.6) q -= 0.6;
    }
  }

  // confidence effect
  if (correct) {
    if (c >= 4) q += 0.4;
    if (c === 1) q -= 0.4;
  } else {
    if (c >= 4) q -= 0.6; // confidently wrong = bad
    if (c === 1) q += 0.15;
  }

  // changing answers often indicates uncertainty (slightly lower quality)
  if (changed >= 1) q -= Math.min(0.5, changed * 0.15);

  return clamp(q, 0, 5);
}

function sm2Update(item, quality, now) {
  const next = { ...item };

  next.reps = (next.reps || 0) + 1;

  if (quality < 3) {
    next.intervalDays = 0;
    next.reps = 0;
    next.ease = clamp((next.ease || 2.3) - 0.2, 1.3, 2.8);
    next.lapseCount = (next.lapseCount || 0) + 1;
  } else {
    const ease = clamp(
      (next.ease || 2.3) + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
      1.3,
      2.8
    );
    next.ease = ease;

    if ((next.intervalDays || 0) < 1) next.intervalDays = 1;
    else if (next.intervalDays === 1) next.intervalDays = 3;
    else next.intervalDays = Math.round(next.intervalDays * ease);
  }

  next.lastSeen = now;
  next.nextDue = now + (next.intervalDays || 0) * DAY_MS;
  return next;
}

function isDue(item) {
  if (!item?.nextDue) return true;
  return item.nextDue <= nowMs();
}

// -------------------------
// Engine state
// -------------------------
function emptyState({ userId, deckId, storageKey }) {
  const params = safeClone(DEFAULTS);

  return {
    schema: ENGINE_SCHEMA,
    version: ENGINE_VERSION,
    storageKey,
    userId: userId || 'default',
    deckId: deckId || 'default',
    createdAt: nowMs(),
    updatedAt: nowMs(),

    params,

    // high-level totals (kept forever)
    totals: {
      attempts: 0,
      correct: 0,
      incorrect: 0,
      streak: 0,
      bestStreak: 0,
      totalTimeMs: 0,

      // global pacing model
      avgRtEma: null,
      rtVarEma: null,

      // session stats model
      sessionCount: 0,
      avgAttemptsPerSessionEma: null,
      avgSessionDurationEma: null,
      avgTimePerAttemptEma: null
    },

    // rolling session "current" (for updating averages robustly)
    currentSession: null,

    // per-question mega file
    items: {},

    // per-concept
    concepts: {},

    // per-domain (Network+ domains etc)
    domains: {},

    // aggregates (daily/hourly/type/difficulty/confidence, etc.)
    aggregates: {
      byDifficulty: {},
      byType: {},
      byHour: {},
      byDay: {},
      rtBuckets: { fast: 0, ok: 0, slow: 0 },
      confidence: {}
    },

    // detail log ring buffer (pruned by age + max)
    events: []
  };
}

function ensureItem(s, q) {
  const id = String(q.id);
  if (s.items[id]) return;

  const domain = inferDomain(q);
  const concepts = Array.isArray(q.concepts) ? q.concepts : Array.isArray(q.tags) ? q.tags : [];

  s.items[id] = {
    id,

    // totals
    attempts: 0,
    correct: 0,
    incorrect: 0,

    // beta posterior for per-item success tendency (one of many signals)
    alpha: 1,
    beta: 1,

    // pacing per item
    avgRT: null,
    rtVar: null,

    // rolling history (recent performance, pruned by age)
    recent: { max: s.params.pruning.recentMax, entries: [] },

    // rolling signals (fast access)
    recentAccuracyEma: null,
    recentRtEma: null,
    overconfidentWrong: 0, // confidence>=4 & wrong

    // streaks
    streak: 0,
    bestStreak: 0,
    lapseCount: 0,

    // SR scheduling
    ease: 2.3,
    intervalDays: 0,
    reps: 0,
    lastSeen: null,
    nextDue: null,

    // last attempt meta
    lastResult: null,
    lastConfidence: null,
    lastChanged: 0,

    // question metadata snapshot
    difficulty: q.difficulty ?? null,
    type: q.type ?? 'mcq',
    concepts,
    domain
  };
}

function ensureConcept(s, conceptKey) {
  const k = String(conceptKey);
  if (s.concepts[k]) return;
  s.concepts[k] = {
    concept: k,
    // mastery probability (signal, not a single master stat)
    pKnown: 0.35,

    // beta posterior for concept correctness tendency
    alpha: 1,
    beta: 1,

    attempts: 0,
    correct: 0,
    incorrect: 0,

    avgRT: null,
    rtVar: null,

    recent: { max: s.params.pruning.recentMax, entries: [] },
    recentAccuracyEma: null,
    recentRtEma: null,

    streak: 0,
    bestStreak: 0,
    lapseCount: 0,

    lastSeen: null
  };
}

function ensureDomain(s, domainKey) {
  const k = String(domainKey || 'General');
  if (s.domains[k]) return;
  s.domains[k] = {
    domain: k,

    // beta posterior for domain correctness tendency
    alpha: 1,
    beta: 1,

    attempts: 0,
    correct: 0,
    incorrect: 0,

    avgRT: null,
    rtVar: null,

    recent: { max: s.params.pruning.recentMax, entries: [] },
    recentAccuracyEma: null,
    recentRtEma: null,

    // richness: tracks “comfort wins” and “pain points”
    confidentWrong: 0,
    changedAnswerSum: 0,

    lastSeen: null,

    // recency variety
    lastPickedAt: null
  };
}

function ensureSeeded(state, questions) {
  const s = { ...state };
  s.items = { ...(s.items || {}) };
  s.concepts = { ...(s.concepts || {}) };
  s.domains = { ...(s.domains || {}) };

  const qArr = Array.isArray(questions) ? questions : [];
  for (const q of qArr) {
    if (!q || q.id == null) continue;
    ensureItem(s, q);

    const domain = inferDomain(q);
    ensureDomain(s, domain);

    const concepts = Array.isArray(q.concepts) ? q.concepts : Array.isArray(q.tags) ? q.tags : [];
    for (const c of concepts) ensureConcept(s, c);
  }

  // Ensure params and pruning caps exist
  s.params = s.params ? { ...safeClone(DEFAULTS), ...s.params } : safeClone(DEFAULTS);
  s.params.pruning = { ...safeClone(DEFAULTS.pruning), ...(s.params.pruning || {}) };
  s.params.selection = { ...safeClone(DEFAULTS.selection), ...(s.params.selection || {}) };
  s.params.bkt = { ...safeClone(DEFAULTS.bkt), ...(s.params.bkt || {}) };

  return s;
}

// -------------------------
// Pruning (outdated detail removal)
// -------------------------
function pruneState(state) {
  const s = { ...state };
  const p = s.params?.pruning || DEFAULTS.pruning;

  // Prune events by age + max
  const maxAge = p.maxEventAgeDays ?? DEFAULTS.pruning.maxEventAgeDays;
  const cutoff = nowMs() - maxAge * DAY_MS;

  const events = Array.isArray(s.events) ? s.events.slice() : [];
  const fresh = events.filter((e) => (e?.t ?? 0) >= cutoff);
  const max = p.eventMax ?? DEFAULTS.pruning.eventMax;
  if (fresh.length > max) fresh.splice(0, fresh.length - max);
  s.events = fresh;

  // Prune recent rings by age for items/domains/concepts
  const recentAge = p.maxRecentEntryAgeDays ?? DEFAULTS.pruning.maxRecentEntryAgeDays;

  if (s.items) {
    for (const item of Object.values(s.items)) {
      item.recent = pruneRecentByAge(item.recent, recentAge);
    }
  }
  if (s.domains) {
    for (const dom of Object.values(s.domains)) {
      dom.recent = pruneRecentByAge(dom.recent, recentAge);
    }
  }
  if (s.concepts) {
    for (const c of Object.values(s.concepts)) {
      c.recent = pruneRecentByAge(c.recent, recentAge);
    }
  }

  return s;
}

// -------------------------
// Prediction signals (multi-factor; no single master stat)
// -------------------------
function mapDifficulty(d) {
  const x = Number(d);
  if (!Number.isFinite(x)) return 0;
  return (x - 3) * 0.85; // center at 3
}

function computeGlobalSpeedZ(state, rtMs) {
  const mean = state.totals?.avgRtEma;
  const v = state.totals?.rtVarEma;
  if (mean == null || v == null || v <= 1) return 0;
  const sd = Math.sqrt(v);
  return clamp((rtMs - mean) / sd, -3, 3);
}

function predictedSuccess(state, q) {
  // Compose multiple independent-ish signals
  const id = String(q.id);
  const item = state.items?.[id];
  const domainKey = inferDomain(q);
  const domain = state.domains?.[domainKey];

  const concepts = Array.isArray(q.concepts) ? q.concepts : Array.isArray(q.tags) ? q.tags : [];
  const diff = mapDifficulty(q.difficulty);

  // item beta mean
  const itemP = item ? betaMean(item.alpha, item.beta) : 0.62;

  // domain beta mean
  const domP = domain ? betaMean(domain.alpha, domain.beta) : 0.62;

  // concept mastery: average logit(pKnown)
  let conceptTheta = 0;
  if (concepts.length > 0) {
    const vals = concepts
      .map((c) => state.concepts?.[String(c)]?.pKnown)
      .filter((v) => typeof v === 'number');
    if (vals.length > 0) {
      const avgP = clamp(vals.reduce((a, b) => a + b, 0) / vals.length, 0.0001, 0.9999);
      conceptTheta = logit(avgP);
    }
  }

  // speed penalty if item historically slow (uncertainty proxy)
  let speedPenalty = 0;
  if (item?.avgRT != null && state.totals?.avgRtEma != null) {
    const z = computeGlobalSpeedZ(state, item.avgRT);
    speedPenalty = clamp(z * 0.08, -0.15, 0.35); // slow => penalty
  }

  // recent accuracy (recency signal)
  const recentA = item?.recentAccuracyEma;
  const recentAdj = recentA == null ? 0 : clamp((recentA - 0.7) * 0.9, -0.25, 0.25);

  // Combine in logit space (keeps stable)
  const z =
    0.55 * logit(clamp(itemP, 0.0001, 0.9999)) +
    0.35 * logit(clamp(domP, 0.0001, 0.9999)) +
    0.75 * conceptTheta -
    diff -
    speedPenalty +
    recentAdj;

  return clamp(sigmoid(z), 0.02, 0.98);
}

// -------------------------
// Smart selection (study vs test)
// -------------------------
function scoreCandidate(state, q, mode) {
  const id = String(q.id);
  const item = state.items?.[id];

  const domainKey = inferDomain(q);
  const domain = state.domains?.[domainKey];

  const cfg =
    mode === 'test'
      ? state.params.selection.test
      : state.params.selection.study;

  const now = nowMs();

  const p = predictedSuccess(state, q);

  // edge: closer to target band = better learning/testing edge
  const edge = 1 - Math.min(1, Math.abs(p - cfg.targetP) / cfg.band);

  // uncertainty: use beta variance and lack of attempts
  const itemUnc = item ? betaVar(item.alpha, item.beta) : 0.09;
  const attempts = item?.attempts || 0;
  const coldStart = attempts === 0 ? 0.25 : 0;

  // due/overdue
  let overdueBoost = 0;
  if (!item?.nextDue) overdueBoost = 0.22;
  else {
    const overdueMs = Math.max(0, now - item.nextDue);
    overdueBoost = clamp(overdueMs / (48 * 60 * 60 * 1000), 0, 1);
  }

  // weakness: domain + item miss tendency
  const domMean = domain ? betaMean(domain.alpha, domain.beta) : 0.62;
  const domWeak = clamp(1 - domMean, 0, 1);

  const itemRecentMiss = recentMissRate(item?.recent); // from ring
  const itemMiss = itemRecentMiss == null ? 0 : clamp(itemRecentMiss, 0, 1);

  // speed: slow items penalized in test mode more (push pacing)
  const speedZ = item?.avgRT != null ? computeGlobalSpeedZ(state, item.avgRT) : 0;
  const speedPenalty = clamp(Math.max(0, speedZ) * cfg.speedPenalty, 0, 0.35);

  // recency penalty: avoid hammering same item back-to-back
  const seenRecently = item?.lastSeen && minutesSince(item.lastSeen) < cfg.minRepeatMinutes;
  const recencyPenalty = seenRecently ? cfg.recencyPenalty : 0;

  // variety penalty by domain (avoid drilling only one domain)
  // prefer domains not seen too recently
  let variety = 1;
  if (domain?.lastPickedAt) {
    const mins = minutesSince(domain.lastPickedAt);
    variety = clamp(mins / 25, 0.2, 1);
  }
  const varietyFactor = (1 - cfg.varietyPenalty) + cfg.varietyPenalty * variety;

  // comfort penalty in test mode: reduce priority of “easy wins”
  const comfortPenalty =
    mode === 'test'
      ? (state.params.selection.test.comfortPenalty || 0) * clamp(p - 0.82, 0, 1)
      : 0;

  // recent miss boost in test mode
  const recentMissBoost =
    mode === 'test'
      ? (state.params.selection.test.recentMissBoost || 0) * clamp(itemMiss, 0, 1)
      : 0;

  // Multi-factor score (no single stat dominates)
  const score =
    varietyFactor *
    clamp(
      0.28 * edge +
        cfg.overdueBoost * overdueBoost +
        cfg.weaknessBoost * (0.55 * domWeak + 0.45 * itemMiss) +
        cfg.uncertaintyBoost * clamp(itemUnc * 8 + coldStart, 0, 1) +
        recentMissBoost -
        speedPenalty -
        recencyPenalty -
        comfortPenalty,
      0,
      10
    );

  return { id, score, p, domainKey };
}

function pickWeightedTop(scored, topK = 10) {
  const top = scored.slice(0, Math.min(topK, scored.length));
  const sum = top.reduce((acc, x) => acc + x.score, 0) || 1;
  let r = Math.random() * sum;
  for (const x of top) {
    r -= x.score;
    if (r <= 0) return x;
  }
  return top[0] || null;
}

function selectNextQuestionId(state, questions, mode = 'study') {
  const qArr = Array.isArray(questions) ? questions : [];
  if (qArr.length === 0) return null;

  const cfg =
    mode === 'test'
      ? state.params.selection.test
      : state.params.selection.study;

  // Candidate pool excludes ultra-recent repeats
  const candidates = qArr
    .map((q) => {
      const id = String(q.id);
      const item = state.items?.[id];
      const seenRecently = item?.lastSeen && minutesSince(item.lastSeen) < cfg.minRepeatMinutes;
      return { q, seenRecently };
    })
    .filter((x) => !x.seenRecently);

  const pool = candidates.length > 0 ? candidates.map((x) => x.q) : qArr;

  // Score all candidates
  const scored = pool
    .map((q) => scoreCandidate(state, q, mode))
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return String(qArr[0].id);

  const doExplore = Math.random() < cfg.explore;
  return doExplore ? pickWeightedTop(scored, 12)?.id : scored[0].id;
}

// -------------------------
// Session tracking (for pacing + averages)
// -------------------------
function beginOrUpdateSession(state, attempt) {
  const s = { ...state };
  const now = nowMs();
  const sid = attempt.sessionId || 'default';

  const current = s.currentSession;
  if (!current || current.sessionId !== sid) {
    // finalize previous session into totals
    if (current) {
      const attempts = current.attempts || 0;
      const duration = Math.max(0, (current.lastActiveAt || now) - (current.startedAt || now));
      s.totals.sessionCount = (s.totals.sessionCount || 0) + 1;
      s.totals.avgAttemptsPerSessionEma = updateEMA(s.totals.avgAttemptsPerSessionEma, attempts, 0.12);
      s.totals.avgSessionDurationEma = updateEMA(s.totals.avgSessionDurationEma, duration, 0.12);
      const tpa = attempts > 0 ? (current.totalTimeMs || 0) / attempts : null;
      if (tpa != null) s.totals.avgTimePerAttemptEma = updateEMA(s.totals.avgTimePerAttemptEma, tpa, 0.12);
    }

    s.currentSession = {
      sessionId: sid,
      startedAt: attempt.startedAt || now,
      lastActiveAt: now,
      attempts: 0,
      totalTimeMs: 0
    };
  }

  return s;
}

// -------------------------
// Public API
// -------------------------
export function makeEngineKey({ userId = 'default', deckId = 'default' } = {}) {
  return `${ENGINE_SCHEMA}:${userId}:${deckId}`;
}

export async function loadEngine({ userId = 'default', deckId = 'default', storageKey } = {}) {
  const key = storageKey || makeEngineKey({ userId, deckId });
  const persisted = await loadPersisted(key);

  if (persisted && persisted.schema === ENGINE_SCHEMA) {
    // ensure defaults merged (future-proof)
    const merged = {
      ...emptyState({ userId, deckId, storageKey: key }),
      ...persisted,
      params: { ...safeClone(DEFAULTS), ...(persisted.params || {}) }
    };
    return merged;
  }

  return emptyState({ userId, deckId, storageKey: key });
}

export async function saveEngine(state) {
  if (!state?.storageKey) return;
  await persist(state.storageKey, state);
}

export async function resetEngine({ userId = 'default', deckId = 'default', storageKey } = {}) {
  const key = storageKey || makeEngineKey({ userId, deckId });
  const fresh = emptyState({ userId, deckId, storageKey: key });
  await persist(key, fresh);
  return fresh;
}

export function exportEngineState(state) {
  return JSON.stringify(state, null, 2);
}

export function importEngineState(jsonText) {
  const parsed = JSON.parse(jsonText);
  if (!parsed || parsed.schema !== ENGINE_SCHEMA) throw new Error('Invalid engine state');
  return parsed;
}

export function initializeWithQuestions(state, questions) {
  const seeded = ensureSeeded(state, questions);
  seeded.updatedAt = nowMs();
  return pruneState(seeded);
}

// -------------------------
// Attempt recording (ALWAYS ON)
// -------------------------
export function recordAttempt(state, attempt, question) {
  // attempt fields expected (add more whenever you want):
  // {
  //   questionId, correct, selected, correctAnswer,
  //   rtMs, confidence1to5, changedAnswerCount,
  //   mode: 'study'|'test' (this only affects logging + analysis; tracking ALWAYS),
  //   startedAt, endedAt,
  //   sessionId, device, viewport
  // }

  let s = ensureSeeded(state, question ? [question] : []);
  s = beginOrUpdateSession(s, attempt);

  const now = nowMs();
  const q = question || { id: attempt.questionId };
  const qid = String(attempt.questionId ?? q.id);
  const correct = !!attempt.correct;

  const rtMs = Number.isFinite(attempt.rtMs) ? Math.max(0, attempt.rtMs) : null;
  const conf = clamp(Number(attempt.confidence1to5 || 3), 1, 5);
  const changed = Number(attempt.changedAnswerCount || 0);

  const domainKey = inferDomain(q);
  const concepts = Array.isArray(q.concepts) ? q.concepts : Array.isArray(q.tags) ? q.tags : [];

  // Ensure structures exist
  ensureItem(s, { ...q, id: qid });
  ensureDomain(s, domainKey);
  for (const c of concepts) ensureConcept(s, c);

  const item = s.items[qid];
  const dom = s.domains[domainKey];

  // Totals
  s.updatedAt = now;
  s.totals.attempts += 1;
  s.totals.correct += correct ? 1 : 0;
  s.totals.incorrect += correct ? 0 : 1;
  s.totals.totalTimeMs += rtMs || 0;

  if (correct) {
    s.totals.streak = (s.totals.streak || 0) + 1;
    s.totals.bestStreak = Math.max(s.totals.bestStreak || 0, s.totals.streak);
  } else {
    s.totals.streak = 0;
  }

  // Global pacing
  if (rtMs != null) {
    const newMean = updateEMA(s.totals.avgRtEma, rtMs, 0.10);
    const newVar = updateVar(s.totals.rtVarEma, s.totals.avgRtEma, newMean, rtMs, 0.10);
    s.totals.avgRtEma = newMean;
    s.totals.rtVarEma = newVar;
  }

  // Session update
  if (s.currentSession) {
    s.currentSession.attempts += 1;
    s.currentSession.totalTimeMs += rtMs || 0;
    s.currentSession.lastActiveAt = now;
  }

  // Aggregates
  const diffKey = String(q.difficulty ?? 'unknown');
  const typeKey = String(q.type ?? 'mcq');
  const hr = hourKey(now);
  const day = dayKey(now);

  s.aggregates.byDifficulty = bump(s.aggregates.byDifficulty, diffKey, correct ? 'correct' : 'incorrect', 1);
  s.aggregates.byType = bump(s.aggregates.byType, typeKey, correct ? 'correct' : 'incorrect', 1);
  s.aggregates.byHour = bump(s.aggregates.byHour, hr, correct ? 'correct' : 'incorrect', 1);
  s.aggregates.byDay = bump(s.aggregates.byDay, day, correct ? 'correct' : 'incorrect', 1);

  if (!s.aggregates.confidence[String(conf)]) s.aggregates.confidence[String(conf)] = { attempts: 0, correct: 0 };
  s.aggregates.confidence[String(conf)].attempts += 1;
  s.aggregates.confidence[String(conf)].correct += correct ? 1 : 0;

  if (rtMs != null) {
    const b = rtMs < 4000 ? 'fast' : rtMs < 12000 ? 'ok' : 'slow';
    s.aggregates.rtBuckets[b] = (s.aggregates.rtBuckets[b] || 0) + 1;
  }

  // Update item stats (mega per-question file)
  item.attempts += 1;
  item.correct += correct ? 1 : 0;
  item.incorrect += correct ? 0 : 1;
  item.alpha += correct ? 1 : 0;
  item.beta += correct ? 0 : 1;

  if (correct) {
    item.streak = (item.streak || 0) + 1;
    item.bestStreak = Math.max(item.bestStreak || 0, item.streak);
  } else {
    item.streak = 0;
    item.lapseCount = (item.lapseCount || 0) + 1;
    if (conf >= 4) item.overconfidentWrong = (item.overconfidentWrong || 0) + 1;
  }

  if (rtMs != null) {
    const newAvg = updateEMA(item.avgRT, rtMs, 0.16);
    const newVar = updateVar(item.rtVar, item.avgRT, newAvg, rtMs, 0.16);
    item.avgRT = newAvg;
    item.rtVar = newVar;

    item.recentRtEma = updateEMA(item.recentRtEma, rtMs, 0.20);
  }

  item.recentAccuracyEma = updateEMA(item.recentAccuracyEma, correct ? 1 : 0, 0.20);

  item.lastResult = correct ? 'correct' : 'incorrect';
  item.lastConfidence = conf;
  item.lastChanged = changed;
  item.domain = domainKey;
  item.concepts = concepts;

  // Item rolling history ring (deep detail, pruned later)
  item.recent = pushRecent(item.recent, { t: now, correct, rtMs, conf, changed });

  // Spaced repetition scheduling
  const expectedRt = item.avgRT != null ? item.avgRT : 9000;
  const quality = deriveQuality({
    correct,
    rtMs,
    expectedRtMs: expectedRt,
    confidence1to5: conf,
    changedAnswerCount: changed
  });
  const updatedItem = sm2Update(item, quality, now);
  s.items[qid] = updatedItem;

  // Update domain stats (another major axis; not a master stat)
  dom.attempts += 1;
  dom.correct += correct ? 1 : 0;
  dom.incorrect += correct ? 0 : 1;
  dom.alpha += correct ? 1 : 0;
  dom.beta += correct ? 0 : 1;
  dom.lastSeen = now;
  dom.changedAnswerSum = (dom.changedAnswerSum || 0) + changed;

  if (!correct && conf >= 4) dom.confidentWrong = (dom.confidentWrong || 0) + 1;

  if (rtMs != null) {
    const dAvg = updateEMA(dom.avgRT, rtMs, 0.14);
    const dVar = updateVar(dom.rtVar, dom.avgRT, dAvg, rtMs, 0.14);
    dom.avgRT = dAvg;
    dom.rtVar = dVar;
    dom.recentRtEma = updateEMA(dom.recentRtEma, rtMs, 0.18);
  }
  dom.recentAccuracyEma = updateEMA(dom.recentAccuracyEma, correct ? 1 : 0, 0.18);
  dom.recent = pushRecent(dom.recent, { t: now, correct, rtMs, conf });

  // Update concept stats (BKT + beta + rolling)
  for (const c of concepts) {
    const key = String(c);
    const cs = s.concepts[key];
    cs.attempts += 1;
    cs.correct += correct ? 1 : 0;
    cs.incorrect += correct ? 0 : 1;
    cs.alpha += correct ? 1 : 0;
    cs.beta += correct ? 0 : 1;

    cs.pKnown = bktUpdate(cs.pKnown ?? 0.35, correct, s.params.bkt || DEFAULTS.bkt);

    if (correct) {
      cs.streak = (cs.streak || 0) + 1;
      cs.bestStreak = Math.max(cs.bestStreak || 0, cs.streak);
    } else {
      cs.streak = 0;
      cs.lapseCount = (cs.lapseCount || 0) + 1;
    }

    if (rtMs != null) {
      const cAvg = updateEMA(cs.avgRT, rtMs, 0.14);
      const cVar = updateVar(cs.rtVar, cs.avgRT, cAvg, rtMs, 0.14);
      cs.avgRT = cAvg;
      cs.rtVar = cVar;
      cs.recentRtEma = updateEMA(cs.recentRtEma, rtMs, 0.18);
    }

    cs.recentAccuracyEma = updateEMA(cs.recentAccuracyEma, correct ? 1 : 0, 0.18);
    cs.recent = pushRecent(cs.recent, { t: now, correct, rtMs, conf });
    cs.lastSeen = now;
  }

  // Append event (deep log, pruned by age/max)
  const event = {
    t: now,
    kind: 'attempt',
    questionId: qid,
    correct,
    rtMs,
    conf,
    changed,
    mode: attempt.mode || 'study',
    domain: domainKey,
    difficulty: q.difficulty ?? null,
    type: q.type ?? 'mcq',
    concepts
  };
  const events = Array.isArray(s.events) ? s.events.slice() : [];
  events.push(event);
  s.events = events;

  // IMPORTANT: mark the picked domain for variety (selection uses this)
  dom.lastPickedAt = now;

  // Prune old detail
  s = pruneState(s);

  return s;
}

// -------------------------
// Insights (multi-axis, no single master stat)
// -------------------------
export function getInsights(state, questions) {
  const s = ensureSeeded(state, questions);

  // Weak domains (enough attempts)
  const domains = Object.values(s.domains || {})
    .filter((d) => (d.attempts || 0) >= 4)
    .map((d) => {
      const mean = betaMean(d.alpha, d.beta);
      const recentA = d.recentAccuracyEma;
      const speed = d.avgRT;
      return {
        domain: d.domain,
        attempts: d.attempts,
        accuracy: mean,
        recentAccuracy: recentA,
        avgRT: speed,
        confidentWrong: d.confidentWrong || 0
      };
    })
    .sort((a, b) => (a.recentAccuracy ?? a.accuracy) - (b.recentAccuracy ?? b.accuracy))
    .slice(0, 6);

  // Weak concepts
  const concepts = Object.values(s.concepts || {})
    .filter((c) => (c.attempts || 0) >= 4)
    .map((c) => ({
      concept: c.concept,
      attempts: c.attempts,
      pKnown: c.pKnown ?? 0.5,
      accuracy: betaMean(c.alpha, c.beta),
      recentAccuracy: c.recentAccuracyEma ?? null
    }))
    .sort((a, b) => (a.pKnown ?? 0.5) - (b.pKnown ?? 0.5))
    .slice(0, 6);

  // Due items count for this deck view
  const qArr = Array.isArray(questions) ? questions : [];
  let dueCount = 0;
  for (const q of qArr) {
    const item = s.items?.[String(q.id)];
    if (!item) continue;
    if (isDue(item)) dueCount += 1;
  }

  // Global mastery proxy (NOT used as single ranking; just a UI metric)
  // average domain beta mean on attempted domains
  const practicedDomains = Object.values(s.domains || {}).filter((d) => (d.attempts || 0) > 0);
  const mastery =
    practicedDomains.length > 0
      ? practicedDomains.reduce((acc, d) => acc + betaMean(d.alpha, d.beta), 0) / practicedDomains.length
      : 0.62;

  return {
    totals: s.totals,
    mastery,
    dueCount,
    weakDomains: domains,
    weakConcepts: concepts
  };
}

// Selection entrypoint (mode: 'study' or 'test')
// Smart Learning is always running; mode only changes HOW it selects next question.
export function getNextQuestionId(state, questions, { mode = 'study' } = {}) {
  const s = ensureSeeded(state, questions);
  return selectNextQuestionId(s, questions, mode);
}