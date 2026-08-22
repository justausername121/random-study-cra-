// Main controller: data loading, screen state machine, rendering.

const els = {
  app: document.getElementById("app"),
};

let S = loadState();
applyTheme(S);

const content = {}; // subjectId -> { lessons: {baiId: json|null}, quizzes: {chuDeId: json|null} }
for (const id of Object.keys(SUBJECTS)) content[id] = { lessons: {}, quizzes: {} };

let session = null; // active lesson/boss session
let homeRefreshTimer = null;

function currentSubject() {
  return SUBJECTS[S.currentSubjectId];
}

// ---------------- Data loading ----------------

async function fetchJson(path) {
  try {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

async function loadSubjectContent(subjectId, { onlyMissing } = {}) {
  const subj = SUBJECTS[subjectId];
  const c = content[subjectId];
  const baiJobs = subj.bai
    .filter((b) => !onlyMissing || c.lessons[b.id] == null)
    .map(async (b) => {
      const data = await fetchJson(`data/${subjectId}/lessons/${b.id}.json`);
      if (data) c.lessons[b.id] = data;
    });
  const cdJobs = subj.chuDe
    .filter((cd) => !onlyMissing || c.quizzes[cd.id] == null)
    .map(async (cd) => {
      const data = await fetchJson(`data/${subjectId}/quizzes/${cd.id}.json`);
      if (data) c.quizzes[cd.id] = data;
    });
  await Promise.all([...baiJobs, ...cdJobs]);
}

async function loadAllContent({ onlyMissing } = {}) {
  await Promise.all(Object.keys(SUBJECTS).map((id) => loadSubjectContent(id, { onlyMissing })));
}

// ---------------- Progress helpers ----------------

function isBaiAvailable(subjectId, baiId) {
  return !!content[subjectId].lessons[baiId];
}

function isBaiCompleted(subjectId, baiId) {
  return !!subjectState(S, subjectId).completedBai[baiId];
}

function isBaiUnlocked(subjectId, index, baiList) {
  if (index === 0) return true;
  const prev = baiList[index - 1];
  return isBaiCompleted(subjectId, prev.id);
}

function chuDeFullyCompleted(subjectId, chuDeId) {
  return baiByChuDe(subjectId, chuDeId).every((b) => isBaiCompleted(subjectId, b.id));
}

function isBossUnlocked(subjectId, chuDeId) {
  return chuDeFullyCompleted(subjectId, chuDeId);
}

function isBossCompleted(subjectId, chuDeId) {
  return !!subjectState(S, subjectId).completedBoss[chuDeId];
}

// ---------------- Rendering: chrome tab bar ----------------

function renderTabBar() {
  const tabs = SUBJECT_ORDER.map((id) => {
    const subj = SUBJECTS[id];
    const active = id === S.currentSubjectId;
    return `
      <button class="chrome-tab ${active ? "active" : ""}" data-tab="${id}" style="${active ? `--tab-color:${subj.color}` : ""}">
        <span class="tab-dot" style="background:${subj.color}"></span>
        <span class="tab-label">${subj.name}</span>
      </button>
    `;
  }).join("");
  return `<div class="tab-strip">${tabs}</div>`;
}

function wireTabBar() {
  document.querySelectorAll(".chrome-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-tab");
      if (id === S.currentSubjectId) return;
      S.currentSubjectId = id;
      saveState(S);
      renderHome();
    });
  });
}

// ---------------- Rendering: top bar ----------------

function renderTopbar(showBack) {
  return `
    <div class="topbar">
      ${showBack ? `<button class="back-btn" id="btn-back">${ICONS.back}</button>` : `<div class="topbar-actions">
          <button class="icon-btn" id="btn-missions" title="Nhiệm vụ hằng ngày">${icon("target")}</button>
          <button class="icon-btn" id="btn-shop" title="Cửa hàng">${icon("bag")}</button>
        </div>`}
      <div class="stat-group">
        <span class="stat-pill stat-fire">${icon("fire")}${S.streak}${S.streakFreezes > 0 ? `<sup class="freeze-badge">x${S.streakFreezes}</sup>` : ""}</span>
        <span class="stat-pill stat-heart">${icon("heart")}${S.hearts}</span>
        <span class="stat-pill stat-coin">${icon("coin")}${S.currency}</span>
        <span class="stat-pill stat-gem">${icon("gem")}${S.xp}</span>
      </div>
    </div>
  `;
}

function wireTopbarExtras() {
  const mBtn = document.getElementById("btn-missions");
  const sBtn = document.getElementById("btn-shop");
  if (mBtn) mBtn.addEventListener("click", renderMissionsScreen);
  if (sBtn) sBtn.addEventListener("click", renderShopScreen);
}

// ---------------- Rendering: home / path ----------------

function renderHome() {
  const subjectId = S.currentSubjectId;
  const subj = currentSubject();
  const baiList = subj.bai;

  let html = renderTabBar() + renderTopbar(false) + `<div class="home-scroll" id="home-scroll">` + renderHeroBanner();

  let nextIndex = baiList.findIndex((b, i) => isBaiUnlocked(subjectId, i, baiList) && !isBaiCompleted(subjectId, b.id));

  for (const cd of subj.chuDe) {
    const bais = baiByChuDe(subjectId, cd.id);
    const doneCount = bais.filter((b) => isBaiCompleted(subjectId, b.id)).length;
    html += `
      <div class="unit-banner" style="background:${cd.color}">
        <div>
          <div class="unit-label">${subj.unitLabel} ${cd.order}</div>
          <div class="unit-title">${cd.title}</div>
        </div>
        <div class="unit-progress">${doneCount}/${bais.length} ${subj.lessonLabel.toLowerCase()}</div>
      </div>
      <div class="path">
    `;

    bais.forEach((b) => {
      const globalIndex = baiList.findIndex((x) => x.id === b.id);
      const unlocked = isBaiUnlocked(subjectId, globalIndex, baiList);
      const completed = isBaiCompleted(subjectId, b.id);
      const available = isBaiAvailable(subjectId, b.id);
      const isNext = globalIndex === nextIndex;
      let cls = "node";
      let inner = `${b.baiNumber}`;
      let clickable = false;
      if (completed) {
        inner = icon("check");
      } else if (!unlocked) {
        cls += " locked";
        inner = icon("lock");
      } else if (!available) {
        cls += " pending";
        inner = "···";
      } else {
        clickable = true;
      }
      if (isNext && available) cls += " next-up";
      const bg = completed ? cd.color : unlocked && available ? cd.color : undefined;
      html += `
        <div class="node-wrap">
          ${isNext && available ? `<div class="start-badge">Bắt đầu</div>` : ""}
          <button class="${cls}" style="${bg ? `background:${bg}` : ""}" data-bai="${b.id}" ${clickable ? "" : "disabled"}>
            ${inner}
            ${completed ? `<span class="stars">${renderStars(subjectState(S, subjectId).completedBai[b.id].stars)}</span>` : ""}
          </button>
          <div class="node-title">${subj.lessonLabel} ${b.baiNumber}</div>
          <div class="node-label">${b.title}${!available ? " — đang cập nhật" : ""}</div>
        </div>
      `;
    });

    const bossUnlocked = isBossUnlocked(subjectId, cd.id);
    const bossAvailable = !!content[subjectId].quizzes[cd.id];
    const bossCompleted = isBossCompleted(subjectId, cd.id);
    let bossCls = "node boss";
    let bossInner = icon("crown");
    let bossClickable = false;
    if (!bossUnlocked) {
      bossCls += " locked";
      bossInner = icon("lock");
    } else if (!bossAvailable) {
      bossCls += " pending";
      bossInner = "···";
    } else {
      bossClickable = true;
    }
    html += `
      <div class="node-wrap">
        <button class="${bossCls}" style="${bossClickable || bossCompleted ? `background:${cd.color}` : ""}" data-boss="${cd.id}" ${bossClickable ? "" : "disabled"}>
          ${bossInner}
        </button>
        <div class="node-title">Ôn tập ${subj.unitLabel.toLowerCase()}</div>
        <div class="node-label">${bossCompleted ? "Đã hoàn thành ✓" : !bossAvailable ? "đang cập nhật" : !bossUnlocked ? `Hoàn thành hết ${subj.lessonLabel.toLowerCase()} trong ${subj.unitLabel.toLowerCase()} để mở khoá` : "Thử thách tổng hợp"}</div>
      </div>
    `;

    html += `</div>`;
  }

  html += `</div>`;
  els.app.innerHTML = html;

  document.querySelectorAll("[data-bai]").forEach((btn) => {
    btn.addEventListener("click", () => startBaiSession(btn.getAttribute("data-bai")));
  });
  document.querySelectorAll("[data-boss]").forEach((btn) => {
    btn.addEventListener("click", () => startBossSession(btn.getAttribute("data-boss")));
  });
  wireTabBar();
  wireTopbarExtras();

  clearInterval(homeRefreshTimer);
  homeRefreshTimer = setInterval(async () => {
    await loadAllContent({ onlyMissing: true });
    if (document.getElementById("home-scroll")) renderHome();
  }, 15000);
}

const GREETINGS = [
  "Sẵn sàng học chưa nào?",
  "Ôn một chút mỗi ngày nhé!",
  "Tiếp tục chuỗi ngày học nào!",
  "Cùng chinh phục kiến thức mới!",
];

function renderHeroBanner() {
  const subj = currentSubject();
  const greeting = S.streak > 0 ? `Chuỗi ${S.streak} ngày rồi - đừng để đứt nhé!` : GREETINGS[new Date().getDate() % GREETINGS.length];
  return `
    <div class="hero">
      ${mascot("wave", "", currentCapColor(S))}
      <div class="hero-text">
        <div class="greeting">${greeting}</div>
        <div class="sub">${subj.fullName}${subj.tagline ? " - " + subj.tagline : ""}</div>
      </div>
    </div>
  `;
}

function renderStars(n) {
  let s = "";
  for (let i = 0; i < 3; i++) s += icon(i < n ? "star" : "starOutline");
  return s;
}

// ---------------- Rendering: missions screen ----------------

function renderMissionsScreen() {
  const missions = getActiveMissions(S);
  els.app.innerHTML = `
    <div class="lesson-screen">
      ${renderTopbar(true)}
      <div class="card-area pop-in">
        <div class="panel-header">
          ${icon("target", "panel-icon")}
          <div>
            <h2>Nhiệm vụ hằng ngày</h2>
            <div class="sub">Làm mới mỗi ngày lúc 0:00 - hoàn thành để nhận Xu</div>
          </div>
        </div>
        <div class="mission-list">
          ${missions
            .map(
              (m) => `
            <div class="mission-row ${m.done ? "done" : ""}">
              <div class="mission-icon">${m.done ? icon("check") : icon("target")}</div>
              <div class="mission-body">
                <div class="mission-label">${m.label}</div>
                <div class="mission-progress-bar"><div class="mission-progress-fill" style="width:${(m.progress / m.target) * 100}%"></div></div>
                <div class="mission-progress-text">${m.progress}/${m.target}</div>
              </div>
              <div class="mission-reward">${icon("coin")}+${m.xu}</div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
  document.getElementById("btn-back").addEventListener("click", renderHome);
}

// ---------------- Rendering: shop screen ----------------

function renderShopScreen() {
  const groups = [
    { type: "cap", title: "Mũ cho Cú Thông Thái" },
    { type: "theme", title: "Giao diện màu" },
    { type: "consumable", title: "Vật phẩm hỗ trợ" },
  ];
  els.app.innerHTML = `
    <div class="lesson-screen">
      ${renderTopbar(true)}
      <div class="card-area pop-in">
        <div class="panel-header">
          ${icon("bag", "panel-icon")}
          <div>
            <h2>Cửa hàng</h2>
            <div class="sub">Dùng Xu kiếm được từ bài học để mua vật phẩm</div>
          </div>
        </div>
        ${groups
          .map(
            (g) => `
          <div class="shop-group">
            <div class="shop-group-title">${g.title}</div>
            <div class="shop-grid">
              ${SHOP_ITEMS.filter((i) => i.type === g.type).map(renderShopItem).join("")}
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `;
  document.getElementById("btn-back").addEventListener("click", renderHome);
  wireShopButtons();
}

function renderShopItem(item) {
  const owned = ownsItem(S, item.id);
  const equipped = item.type === "cap" ? S.equipped.cap === item.id : item.type === "theme" ? S.equipped.theme === item.id : false;
  let preview = "";
  if (item.type === "cap") preview = `<div class="shop-preview">${mascotSvg("wave", item.color)}</div>`;
  else if (item.type === "theme") preview = `<div class="shop-preview theme-swatch"><span style="background:${item.green}"></span><span style="background:${item.blue}"></span></div>`;
  else preview = `<div class="shop-preview consumable-preview">${icon(item.icon)}</div>`;

  let actionHtml;
  if (item.type === "consumable") {
    actionHtml = `<button class="btn btn-primary btn-small" data-buy="${item.id}" ${S.currency < item.price ? "disabled" : ""}>${icon("coin")} ${item.price}</button>`;
  } else if (owned) {
    actionHtml = `<button class="btn ${equipped ? "btn-primary" : "btn-secondary"} btn-small" data-equip="${item.id}">${equipped ? "Đang dùng" : "Sử dụng"}</button>`;
  } else {
    actionHtml = `<button class="btn btn-primary btn-small" data-buy="${item.id}" ${S.currency < item.price ? "disabled" : ""}>${icon("coin")} ${item.price}</button>`;
  }

  return `
    <div class="shop-card">
      ${preview}
      <div class="shop-card-name">${item.name}</div>
      ${item.desc ? `<div class="shop-card-desc">${item.desc}</div>` : ""}
      ${actionHtml}
    </div>
  `;
}

function wireShopButtons() {
  document.querySelectorAll("[data-buy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-buy");
      const result = buyItem(S, id);
      if (result.ok) {
        applyTheme(S);
        saveState(S);
        renderShopScreen();
      }
    });
  });
  document.querySelectorAll("[data-equip]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-equip");
      equipItem(S, id);
      applyTheme(S);
      saveState(S);
      renderShopScreen();
    });
  });
}

// ---------------- Rendering: lesson session ----------------

function startBaiSession(baiId) {
  const subjectId = S.currentSubjectId;
  const lesson = content[subjectId].lessons[baiId];
  if (!lesson) return;
  const bai = SUBJECTS[subjectId].bai.find((b) => b.id === baiId);
  const quiz = content[subjectId].quizzes[bai.chuDeId] || null;
  const seenSet = getSeenSet(S, subjectId, bai.chuDeId);
  const queue = buildLessonQueue(lesson, quiz, seenSet, { practiceCount: 8 });
  session = {
    mode: "lesson",
    subjectId,
    baiId,
    chuDeId: bai.chuDeId,
    lessonTitle: lesson.title,
    queue,
    index: 0,
    totalUnits: totalScoreUnits(queue),
    correctUnits: 0,
    xpEarned: 0,
    usedIds: queue.filter((q) => q.kind === "mcq" || q.kind === "tf" || q.kind === "short").map((q) => q.id),
  };
  clearInterval(homeRefreshTimer);
  renderCard();
}

function startBossSession(chuDeId) {
  const subjectId = S.currentSubjectId;
  const quiz = content[subjectId].quizzes[chuDeId];
  if (!quiz) return;
  const cd = chuDeById(subjectId, chuDeId);
  const queue = buildBossQueue(quiz);
  if (queue.length === 0) return;
  session = {
    mode: "boss",
    subjectId,
    chuDeId,
    lessonTitle: `Ôn tập: ${cd.title}`,
    queue,
    index: 0,
    totalUnits: totalScoreUnits(queue),
    correctUnits: 0,
    xpEarned: 0,
    usedIds: [],
  };
  clearInterval(homeRefreshTimer);
  renderCard();
}

function currentCard() {
  return session.queue[session.index];
}

function renderCard() {
  const card = currentCard();
  const progressPct = Math.round((session.index / session.queue.length) * 100);

  let bodyHtml = "";
  if (card.kind === "concept") {
    bodyHtml = renderConceptCard(card);
  } else if (card.kind === "mcq" || card.kind === "gloss") {
    bodyHtml = renderMcqCard(card);
  } else if (card.kind === "tf") {
    bodyHtml = renderTfCard(card);
  } else if (card.kind === "short") {
    bodyHtml = renderShortCard(card);
  }

  els.app.innerHTML = `
    <div class="lesson-screen">
      ${renderTopbar(true)}
      <div class="progress-bar"><div class="progress-bar-fill" style="width:${progressPct}%"></div></div>
      <div class="card-area pop-in" id="card-area">${bodyHtml}</div>
      <div id="footer-slot"></div>
    </div>
  `;

  document.getElementById("btn-back").addEventListener("click", () => {
    session = null;
    switchToHome();
  });

  wireCardInteractions(card);
}

function renderConceptCard(card) {
  return `
    <div class="concept-card">
      <div class="kicker">Khám phá</div>
      <h2>${card.heading}</h2>
      <p class="summary">${card.summary}</p>
      ${card.keyPoints && card.keyPoints.length ? `<ul class="keypoints">${card.keyPoints.map((k) => `<li>${k}</li>`).join("")}</ul>` : ""}
      ${card.example ? `<div class="example-box"><span class="label">Ví dụ thực tế</span>${card.example}</div>` : ""}
    </div>
  ` + footerContinue("Tiếp tục");
}

function renderMcqCard(card) {
  const optKeys = card.kind === "mcq" ? ["A", "B", "C", "D"] : card.options.map((_, i) => i);
  return `
    <div class="q-prompt">${card.kind === "mcq" ? card.question : card.prompt}</div>
    <div class="options">
      ${optKeys
        .map((k, i) => {
          const text = card.kind === "mcq" ? card.options[k] : card.options[i];
          const label = card.kind === "mcq" ? k : String.fromCharCode(65 + i);
          return `<button class="option-btn" data-key="${k}"><b>${label}.</b> ${text}</button>`;
        })
        .join("")}
    </div>
  ` + footerCheck();
}

function renderTfCard(card) {
  return `
    ${card.stimulus ? `<div class="q-stimulus">${card.stimulus}</div>` : ""}
    <div class="q-prompt" style="font-size:16px">Mỗi ý dưới đây là Đúng hay Sai?</div>
    <div class="tf-list">
      ${card.statements
        .map(
          (st) => `
        <div class="tf-row" data-key="${st.key}">
          <div class="tf-text"><b>${st.key})</b> ${st.text}</div>
          <div class="tf-toggle">
            <button class="tf-btn" data-val="true">Đúng</button>
            <button class="tf-btn" data-val="false">Sai</button>
          </div>
        </div>`
        )
        .join("")}
    </div>
  ` + footerCheck();
}

function renderShortCard(card) {
  return `
    <div class="q-prompt">${card.question}</div>
    <div class="short-answer-row">
      <input type="text" inputmode="decimal" class="short-input" id="short-input" placeholder="Nhập đáp số..." autocomplete="off" />
      ${card.unit ? `<span class="short-unit">${card.unit}</span>` : ""}
    </div>
  ` + footerCheck();
}

function footerContinue(label) {
  return `<div class="footer-bar"><button class="btn btn-primary" id="btn-continue">${label}</button></div>`;
}

function footerCheck() {
  return `<div class="footer-bar"><button class="btn btn-primary" id="btn-check" disabled>Kiểm tra</button></div>`;
}

function wireCardInteractions(card) {
  if (card.kind === "concept") {
    document.getElementById("btn-continue").addEventListener("click", advanceCard);
    return;
  }

  if (card.kind === "mcq" || card.kind === "gloss") {
    let selected = null;
    const btns = document.querySelectorAll(".option-btn");
    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (session.answered) return;
        btns.forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        selected = btn.getAttribute("data-key");
        document.getElementById("btn-check").disabled = false;
      });
    });
    document.getElementById("btn-check").addEventListener("click", () => {
      if (selected == null || session.answered) return;
      gradeMcq(card, selected, btns);
    });
    return;
  }

  if (card.kind === "tf") {
    const answers = {};
    document.querySelectorAll(".tf-row").forEach((row) => {
      const key = row.getAttribute("data-key");
      row.querySelectorAll(".tf-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (session.answered) return;
          const val = btn.getAttribute("data-val") === "true";
          answers[key] = val;
          row.querySelectorAll(".tf-btn").forEach((b) => b.classList.remove("selected", "active-true", "active-false"));
          btn.classList.add("selected", val ? "active-true" : "active-false");
          document.getElementById("btn-check").disabled = Object.keys(answers).length < card.statements.length;
        });
      });
    });
    document.getElementById("btn-check").addEventListener("click", () => {
      if (session.answered) return;
      gradeTf(card, answers);
    });
    return;
  }

  if (card.kind === "short") {
    const input = document.getElementById("short-input");
    const checkBtn = document.getElementById("btn-check");
    input.addEventListener("input", () => {
      checkBtn.disabled = input.value.trim().length === 0;
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !checkBtn.disabled && !session.answered) gradeShort(card, input);
    });
    checkBtn.addEventListener("click", () => {
      if (session.answered) return;
      gradeShort(card, input);
    });
  }
}

function parseNumericInput(raw) {
  const cleaned = raw.trim().replace(",", ".").replace(/[^\d.\-]/g, "");
  const n = parseFloat(cleaned);
  return Number.isNaN(n) ? null : n;
}

function gradeShort(card, input) {
  session.answered = true;
  const userVal = parseNumericInput(input.value);
  const correctVal = parseFloat(card.answer);
  const tolerance = card.tolerance != null ? card.tolerance : Math.max(0.01, Math.abs(correctVal) * 0.01);
  const isCorrect = userVal != null && Math.abs(userVal - correctVal) <= tolerance;
  input.disabled = true;
  input.classList.add(isCorrect ? "correct" : "incorrect");
  if (isCorrect) {
    session.correctUnits += 1;
    session.xpEarned += 10;
  } else {
    loseHeart(S);
  }
  const answerText = `${card.answer}${card.unit ? " " + card.unit : ""}`;
  showFeedback(isCorrect, isCorrect ? "Chính xác!" : `Đáp án đúng: ${answerText}`);
}

function gradeMcq(card, selectedKey, btns) {
  session.answered = true;
  const correctKey = card.kind === "mcq" ? card.answer : String(card.answerIndex);
  const isCorrect = selectedKey === correctKey;
  btns.forEach((b) => {
    b.setAttribute("disabled", "true");
    const k = b.getAttribute("data-key");
    if (k === correctKey) b.classList.add("correct");
    else if (k === selectedKey && !isCorrect) b.classList.add("incorrect");
  });
  if (isCorrect) {
    session.correctUnits += 1;
    session.xpEarned += 10;
  } else {
    loseHeart(S);
  }
  showFeedback(isCorrect, isCorrect ? "Chính xác!" : "Chưa đúng rồi.");
}

function gradeTf(card, answers) {
  session.answered = true;
  let correctCount = 0;
  document.querySelectorAll(".tf-row").forEach((row) => {
    const key = row.getAttribute("data-key");
    const st = card.statements.find((s) => s.key === key);
    const ok = answers[key] === st.answer;
    if (ok) correctCount += 1;
    row.classList.add(ok ? "graded-correct" : "graded-incorrect");
    row.querySelectorAll(".tf-btn").forEach((b) => (b.disabled = true));
  });
  session.correctUnits += correctCount;
  session.xpEarned += correctCount * 5;
  if (correctCount < card.statements.length) loseHeart(S);
  const allCorrect = correctCount === card.statements.length;
  showFeedback(allCorrect, `Bạn đúng ${correctCount}/${card.statements.length} ý.`);
}

function showFeedback(isCorrect, text) {
  const bar = document.querySelector(".footer-bar");
  if (bar) bar.remove();
  const div = document.createElement("div");
  div.className = `feedback-banner ${isCorrect ? "correct" : "incorrect"}`;
  div.innerHTML = `
    <span class="fb-text">${icon(isCorrect ? "check" : "x")} ${text}</span>
    <button class="btn btn-primary" id="btn-next">Tiếp tục</button>
  `;
  document.querySelector(".lesson-screen").appendChild(div);
  document.getElementById("btn-next").addEventListener("click", advanceCard);
  document.querySelector(".stat-heart").innerHTML = `${icon("heart")}${S.hearts}`;
  document.querySelector(".stat-gem").innerHTML = `${icon("gem")}${S.xp + session.xpEarned}`;
}

function advanceCard() {
  session.answered = false;
  session.index += 1;
  if (session.index >= session.queue.length) {
    finishSession();
  } else {
    renderCard();
  }
}

function finishSession() {
  const accuracy = session.totalUnits > 0 ? session.correctUnits / session.totalUnits : 1;
  markActiveToday(S);
  addXp(S, session.xpEarned);

  const toasts = [];
  toasts.push(...recordMissionEvent(S, "xp", session.xpEarned));
  toasts.push(...recordMissionEvent(S, "correct", session.correctUnits));
  toasts.push(...recordSubjectTouch(S, session.subjectId));
  if (accuracy >= 0.9) toasts.push(...recordMissionEvent(S, "great", 1));

  if (session.mode === "lesson") {
    const bonus = 20;
    addXp(S, bonus);
    addCurrency(S, 8);
    recordBaiCompletion(S, session.subjectId, session.baiId, accuracy);
    addSeen(S, session.subjectId, session.chuDeId, session.usedIds);
    const pool = content[session.subjectId].quizzes[session.chuDeId] ? questionPoolFromQuiz(content[session.subjectId].quizzes[session.chuDeId]) : [];
    if (pool.length && getSeenSet(S, session.subjectId, session.chuDeId).size >= pool.length) resetSeen(S, session.subjectId, session.chuDeId);
    toasts.push(...recordMissionEvent(S, "lessons", 1));
    session.bonusXp = bonus;
  } else {
    const bonus = 50;
    addXp(S, bonus);
    addCurrency(S, 20);
    recordBossCompletion(S, session.subjectId, session.chuDeId);
    toasts.push(...recordMissionEvent(S, "boss", 1));
    session.bonusXp = bonus;
  }
  saveState(S);
  renderSummary(accuracy, toasts);
}

const ENCOURAGEMENT = {
  great: ["Xuất sắc!", "Quá đỉnh!", "Học giỏi quá!", "Không thể chê vào đâu được!"],
  good: ["Làm tốt lắm!", "Cố lên, gần hoàn hảo rồi!", "Tiến bộ rõ rệt!"],
  okay: ["Đã học là có ích!", "Ôn thêm chút nữa nhé!", "Cứ tiếp tục cố gắng!"],
};

function renderSummary(accuracy, toasts) {
  const stars = accuracy >= 0.9 ? 3 : accuracy >= 0.7 ? 2 : 1;
  const pct = Math.round(accuracy * 100);
  const totalXp = session.xpEarned + (session.bonusXp || 0);
  const totalXu = session.mode === "lesson" ? 8 : 20;
  const tier = pct >= 90 ? "great" : pct >= 70 ? "good" : "okay";
  const line = ENCOURAGEMENT[tier][Math.floor(Math.random() * ENCOURAGEMENT[tier].length)];
  els.app.innerHTML = `
    <div class="summary-screen pop-in">
      <div class="confetti-layer" id="confetti-layer"></div>
      ${mascot(pct >= 70 ? "celebrate" : "wave", "", currentCapColor(S))}
      <h1>${line}</h1>
      <div class="sub">${session.mode === "lesson" ? "Hoàn thành bài học: " : "Hoàn thành ôn tập: "}${session.lessonTitle}</div>
      <div class="summary-stats">
        <div class="summary-stat"><div class="val">${pct}%</div><div class="lbl">Độ chính xác</div></div>
        <div class="summary-stat"><div class="val">+${totalXp}</div><div class="lbl">Điểm KN</div></div>
        <div class="summary-stat"><div class="val">+${totalXu}</div><div class="lbl">Xu</div></div>
        <div class="summary-stat"><div class="val">${renderStars(stars)}</div><div class="lbl">Sao</div></div>
      </div>
      ${
        toasts && toasts.length
          ? `<div class="mission-toast">${toasts.map((t) => `${icon("target")} Hoàn thành nhiệm vụ: <b>${t.text(t.target)}</b> ${icon("coin")}+${t.xu}`).join("<br/>")}</div>`
          : ""
      }
      <button class="btn btn-primary btn-block" id="btn-done">Tiếp tục</button>
    </div>
  `;
  document.getElementById("btn-done").addEventListener("click", () => {
    session = null;
    switchToHome();
  });
  if (pct >= 70) spawnConfetti(document.getElementById("confetti-layer"));
}

const CONFETTI_COLORS = ["#58cc02", "#1cb0f6", "#ffc800", "#ff4b4b", "#ce82ff"];

function spawnConfetti(layer) {
  if (!layer) return;
  const count = 36;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.left = `${Math.random() * 100}%`;
    el.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    el.style.animationDuration = `${1.6 + Math.random() * 1.2}s`;
    el.style.animationDelay = `${Math.random() * 0.4}s`;
    el.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    layer.appendChild(el);
  }
}

function switchToHome() {
  renderHome();
}

// ---------------- Boot ----------------

async function boot() {
  els.app.innerHTML = `<div class="empty-state">${mascot("wave", "boot-mascot")}<h3>Đang tải nội dung...</h3><p>Đang chuẩn bị bài học cho bạn.</p></div>`;
  await loadAllContent({});
  renderHome();
}

boot();
