// Daily missions: 3 picked deterministically per calendar day from a pool,
// progress tracked via simple daily counters, currency reward auto-granted
// the moment a mission's target is reached.

const MISSION_DEFS = [
  { id: "lessons1", counterKey: "lessons", target: 1, xu: 10, text: (t) => `Hoàn thành ${t} bài học` },
  { id: "lessons2", counterKey: "lessons", target: 2, xu: 15, text: (t) => `Hoàn thành ${t} bài học` },
  { id: "lessons3", counterKey: "lessons", target: 3, xu: 22, text: (t) => `Hoàn thành ${t} bài học` },
  { id: "correct10", counterKey: "correct", target: 10, xu: 10, text: (t) => `Trả lời đúng ${t} câu hỏi` },
  { id: "correct20", counterKey: "correct", target: 20, xu: 18, text: (t) => `Trả lời đúng ${t} câu hỏi` },
  { id: "correct35", counterKey: "correct", target: 35, xu: 28, text: (t) => `Trả lời đúng ${t} câu hỏi` },
  { id: "xp30", counterKey: "xp", target: 30, xu: 12, text: (t) => `Kiếm ${t} điểm kinh nghiệm (KN)` },
  { id: "xp60", counterKey: "xp", target: 60, xu: 20, text: (t) => `Kiếm ${t} điểm kinh nghiệm (KN)` },
  { id: "great1", counterKey: "great", target: 1, xu: 20, text: () => `Đạt từ 90% chính xác trong 1 bài học` },
  { id: "boss1", counterKey: "boss", target: 1, xu: 25, text: () => `Hoàn thành 1 lượt Ôn tập chủ đề` },
  { id: "subjects2", counterKey: "subjects", target: 2, xu: 15, text: () => `Học 2 môn khác nhau trong hôm nay` },
];

function dateSeed(dateStr) {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) h = (h * 31 + dateStr.charCodeAt(i)) >>> 0;
  return h;
}

function seededPick(seed, arr, n) {
  let s = seed || 1;
  const rand = () => {
    s = (s * 1103515245 + 12345) >>> 0;
    return s / 4294967296;
  };
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

function ensureDailyMissions(s) {
  const t = todayStr();
  if (s.missions.date !== t) {
    s.missions.date = t;
    s.missions.counters = { lessons: 0, correct: 0, xp: 0, great: 0, boss: 0, subjects: 0 };
    s.missions.subjectsTouched = [];
    s.missions.claimed = {};
    const picks = seededPick(dateSeed(t), MISSION_DEFS, 3);
    s.missions.activeIds = picks.map((m) => m.id);
  }
}

function getMissionDef(id) {
  return MISSION_DEFS.find((m) => m.id === id);
}

function getActiveMissions(s) {
  ensureDailyMissions(s);
  return s.missions.activeIds.map((id) => {
    const def = getMissionDef(id);
    const progress = s.missions.counters[def.counterKey] || 0;
    const done = progress >= def.target;
    return {
      ...def,
      label: def.text(def.target),
      progress: Math.min(progress, def.target),
      done,
      claimed: !!s.missions.claimed[id],
    };
  });
}

function allMissionsClaimed(s) {
  ensureDailyMissions(s);
  return s.missions.activeIds.every((id) => s.missions.claimed[id]);
}

// Call after any progress event. Returns newly-completed mission defs (for a toast).
function recordMissionEvent(s, counterKey, amount) {
  ensureDailyMissions(s);
  s.missions.counters[counterKey] = (s.missions.counters[counterKey] || 0) + amount;
  const newlyDone = [];
  for (const id of s.missions.activeIds) {
    const def = getMissionDef(id);
    if (def.counterKey !== counterKey) continue;
    const progress = s.missions.counters[counterKey];
    if (progress >= def.target && !s.missions.claimed[id]) {
      s.missions.claimed[id] = true;
      s.currency += def.xu;
      newlyDone.push(def);
    }
  }
  return newlyDone;
}

function recordSubjectTouch(s, subjectId) {
  ensureDailyMissions(s);
  if (!s.missions.subjectsTouched) s.missions.subjectsTouched = [];
  if (s.missions.subjectsTouched.includes(subjectId)) return [];
  s.missions.subjectsTouched.push(subjectId);
  const count = s.missions.subjectsTouched.length;
  s.missions.counters.subjects = count;
  const newlyDone = [];
  for (const id of s.missions.activeIds) {
    const def = getMissionDef(id);
    if (def.counterKey !== "subjects") continue;
    if (count >= def.target && !s.missions.claimed[id]) {
      s.missions.claimed[id] = true;
      s.currency += def.xu;
      newlyDone.push(def);
    }
  }
  return newlyDone;
}
