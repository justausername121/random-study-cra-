// All persistence lives in localStorage under one namespaced key.
// Hearts/XP/currency/streak/missions are GLOBAL (shared across subjects -
// one student, one set of lives/energy). Lesson/boss completion and question
// rotation memory are PER-SUBJECT.

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
    hearts: 5,
    heartsRefillAt: null,
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
    s.hearts = old.hearts != null ? old.hearts : 5;
    s.heartsRefillAt = old.heartsRefillAt || null;
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
  applyHeartRegen(s);
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

const HEART_REGEN_MINUTES = 30;
const MAX_HEARTS = 5;

function applyHeartRegen(s) {
  if (s.hearts >= MAX_HEARTS) {
    s.heartsRefillAt = null;
    return;
  }
  if (!s.heartsRefillAt) {
    s.heartsRefillAt = Date.now() + HEART_REGEN_MINUTES * 60000;
    return;
  }
  const now = Date.now();
  if (now >= s.heartsRefillAt) {
    const elapsedRegens = Math.floor((now - s.heartsRefillAt) / (HEART_REGEN_MINUTES * 60000)) + 1;
    s.hearts = Math.min(MAX_HEARTS, s.hearts + elapsedRegens);
    s.heartsRefillAt = s.hearts >= MAX_HEARTS ? null : now + HEART_REGEN_MINUTES * 60000;
  }
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

function loseHeart(s) {
  if (s.hearts > 0) {
    s.hearts -= 1;
    if (s.hearts < MAX_HEARTS && !s.heartsRefillAt) {
      s.heartsRefillAt = Date.now() + HEART_REGEN_MINUTES * 60000;
    }
  }
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
