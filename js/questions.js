// Builds the queue of cards shown during a lesson / boss session.
// Card shapes:
//   { kind:"concept", heading, summary, keyPoints, example }
//   { kind:"mcq", id, question, options:{A,B,C,D}, answer }
//   { kind:"tf",  id, stimulus, statements:[{key,text,answer}] }
//   { kind:"gloss", id, prompt, options:[4 strings], answerIndex }

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick(arr, n) {
  return shuffle(arr).slice(0, n);
}

function buildGlossaryCards(glossary, count) {
  if (!glossary || glossary.length < 2) return [];
  const terms = shuffle(glossary).slice(0, count);
  return terms.map((g, i) => {
    const distractorPool = glossary.filter((x) => x.term !== g.term);
    const distractors = pick(distractorPool, 3).map((x) => x.definition);
    while (distractors.length < 3) distractors.push("Không có đáp án nào ở trên đúng.");
    const askTerm = i % 2 === 0;
    const options = shuffle([g.definition, ...distractors]);
    return {
      kind: "gloss",
      id: `gloss-${g.term}-${i}`,
      prompt: askTerm ? `"${g.term}" nghĩa là gì?` : `Khái niệm nào sau đây được gọi là "${g.term}"?`,
      options,
      answerIndex: options.indexOf(g.definition),
    };
  });
}

function questionPoolFromQuiz(quiz) {
  const mcq = (quiz.mcq || []).map((q) => ({ kind: "mcq", ...q }));
  const tf = (quiz.trueFalse || []).map((q) => ({ kind: "tf", ...q }));
  const sa = (quiz.shortAnswer || []).map((q) => ({ kind: "short", ...q }));
  return [...mcq, ...tf, ...sa];
}

function poolIdOf(item) {
  return item.id;
}

// Selects `count` items from the quiz pool the learner hasn't seen recently
// (per chu-de rotation memory in localStorage), reshuffling once exhausted.
function selectUnseen(pool, seenSet, count) {
  const unseen = pool.filter((q) => !seenSet.has(poolIdOf(q)));
  let chosen;
  if (unseen.length >= count) {
    chosen = pick(unseen, count);
  } else {
    chosen = shuffle(unseen);
    const need = count - chosen.length;
    const rest = pool.filter((q) => seenSet.has(poolIdOf(q)));
    chosen = chosen.concat(pick(rest, need));
  }
  return chosen;
}

function buildLessonQueue(lesson, quiz, seenSet, opts = {}) {
  const conceptCards = (lesson.sections || []).map((s) => ({
    kind: "concept",
    heading: s.heading,
    summary: s.summary,
    keyPoints: s.keyPoints || [],
    example: s.example || null,
  }));

  const glossCards = buildGlossaryCards(lesson.glossary || [], 2);

  let practice = [];
  if (quiz) {
    const pool = questionPoolFromQuiz(quiz);
    const target = opts.practiceCount || Math.min(8, Math.max(4, Math.round(pool.length / 3)));
    practice = selectUnseen(pool, seenSet, Math.min(target, pool.length));
  }

  return [...conceptCards, ...shuffle(glossCards), ...shuffle(practice)];
}

function buildBossQueue(quiz) {
  if (!quiz) return [];
  return shuffle(questionPoolFromQuiz(quiz));
}

// Flattens the scoring units in a queue for accuracy calc: a concept card
// contributes 0, an mcq contributes 1, a tf group contributes N (one per
// statement).
function totalScoreUnits(queue) {
  let n = 0;
  for (const q of queue) {
    if (q.kind === "mcq" || q.kind === "gloss" || q.kind === "short") n += 1;
    else if (q.kind === "tf") n += q.statements.length;
  }
  return n;
}
