// All persistence lives in localStorage under one namespaced key.
// XP/currency/streak/missions are GLOBAL (shared across subjects). Lesson/
// boss completion and question rotation memory are PER-SUBJECT. Hearts are
// NOT persisted at all - they only exist on the in-memory session object,
// reset to the current max every time a lesson/boss round starts (see
// app.js). Only the permanent max-hearts upgrade (maxHeartsBonus) persists.

const STORAGE_KEY = "study-app-progress-v2";
const OLD_STORAGE_KEY = "ktpl12-progress-v1"; // v1 was ktpl12-only; migrated below

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysBetween(a, b) {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((db - da) / 86400000);
}

function defaultSubjectState() {
  return {
    completedBai: {},
    completedBoss: {},
    seenQuestionIds: {},
  };
}

function defaultState() {
  return {
    xp: 0,
    currency: 0,
    streak: 0,
    streakFreezes: 0,
    lastActiveDate: null,
    maxHeartsBonus: 0,
    currentSubjectId: "ktpl12",
    subjects: {},
    equipped: { cap: null }, // cosmetic slot -> shop item id
    owned: {}, // shop item id -> true
    missions: { date: null, counters: {}, claimed: {}, activeIds: [] },
    soundOn: true,
  };
}

function migrateOldState(s) {
  try {
    const old = JSON.parse(localStorage.getItem(OLD_STORAGE_KEY));
    if (!old) return s;
    s.xp = old.xp || 0;
    s.streak = old.streak || 0;
    s.lastActiveDate = old.lastActiveDate || null;
    s.subjects.ktpl12 = {
      completedBai: old.completedBai || {},
      completedBoss: old.completedBoss || {},
      seenQuestionIds: old.seenQuestionIds || {},
    };
    localStorage.removeItem(OLD_STORAGE_KEY);
  } catch (e) {
    /* no old state, nothing to migrate */
  }
  return s;
}

function loadState() {
  let s;
  try {
    s = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch (e) {
    s = null;
  }
  if (!s) {
    s = defaultState();
    s = migrateOldState(s);
  } else {
    s = { ...defaultState(), ...s };
  }
  for (const id of Object.keys(SUBJECTS)) {
    if (!s.subjects[id]) s.subjects[id] = defaultSubjectState();
  }
  applyStreakDecay(s);
  return s;
}

function saveState(s) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function subjectState(s, subjectId) {
  if (!s.subjects[subjectId]) s.subjects[subjectId] = defaultSubjectState();
  return s.subjects[subjectId];
}

function applyStreakDecay(s) {
  if (!s.lastActiveDate) return;
  const gap = daysBetween(s.lastActiveDate, todayStr());
  if (gap > 1) {
    const missedDays = gap - 1;
    if (s.streakFreezes >= missedDays) {
      s.streakFreezes -= missedDays;
    } else {
      s.streak = 0;
      s.streakFreezes = 0;
    }
  }
}

const BASE_MAX_HEARTS = 5;
const MAX_HEARTS_BONUS_CAP = 3;

function effectiveMaxHearts(s) {
  return BASE_MAX_HEARTS + (s.maxHeartsBonus || 0);
}

function markActiveToday(s) {
  const t = todayStr();
  if (s.lastActiveDate === t) return;
  if (s.lastActiveDate) {
    const gap = daysBetween(s.lastActiveDate, t);
    if (gap === 1) s.streak += 1;
    else if (gap > 1) s.streak = 1;
    else s.streak = Math.max(1, s.streak);
  } else {
    s.streak = 1;
  }
  s.lastActiveDate = t;
}

function addXp(s, amount) {
  s.xp += amount;
}

function addCurrency(s, amount) {
  s.currency += amount;
}

function recordBaiCompletion(s, subjectId, baiId, accuracy) {
  const sub = subjectState(s, subjectId);
  const prev = sub.completedBai[baiId];
  const stars = accuracy >= 0.9 ? 3 : accuracy >= 0.7 ? 2 : 1;
  sub.completedBai[baiId] = {
    stars: Math.max(stars, prev ? prev.stars : 0),
    bestAccuracy: Math.max(accuracy, prev ? prev.bestAccuracy : 0),
    timesCompleted: (prev ? prev.timesCompleted : 0) + 1,
  };
}

function recordBossCompletion(s, subjectId, chuDeId) {
  subjectState(s, subjectId).completedBoss[chuDeId] = true;
}

function getSeenSet(s, subjectId, chuDeId) {
  return new Set(subjectState(s, subjectId).seenQuestionIds[chuDeId] || []);
}

function addSeen(s, subjectId, chuDeId, ids) {
  const sub = subjectState(s, subjectId);
  const set = getSeenSet(s, subjectId, chuDeId);
  ids.forEach((id) => set.add(id));
  sub.seenQuestionIds[chuDeId] = Array.from(set);
}

function resetSeen(s, subjectId, chuDeId) {
  subjectState(s, subjectId).seenQuestionIds[chuDeId] = [];
}
