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
  const inSession = !!session;
  return `
    <div class="topbar">
      <div class="topbar-actions">
        ${showBack ? `<button class="back-btn" id="btn-back">${ICONS.back}</button>` : `
          <button class="icon-btn" id="btn-missions" title="Nhiệm vụ hằng ngày">${icon("target")}</button>
          <button class="icon-btn" id="btn-shop" title="Cửa hàng">${icon("bag")}</button>`}
        <button class="icon-btn" id="btn-notes" title="Ghi chú">${icon("notes")}</button>
      </div>
      <div class="stat-group">
        <button class="icon-btn" id="btn-sound" title="${S.soundOn ? "Tắt âm thanh" : "Bật âm thanh"}">${icon(S.soundOn ? "soundOn" : "soundOff")}</button>
        <span class="stat-pill stat-fire">${icon("fire")}${S.streak}${S.streakFreezes > 0 ? `<sup class="freeze-badge">x${S.streakFreezes}</sup>` : ""}</span>
        ${inSession ? `<span class="stat-pill stat-heart">${icon("heart")}${session.hearts}</span>` : ""}
        <span class="stat-pill stat-coin">${icon("gem")}${S.currency}</span>
        <span class="stat-pill stat-xp">${icon("flash")}${S.xp}</span>
      </div>
    </div>
  `;
}

function wireTopbarExtras() {
  const mBtn = document.getElementById("btn-missions");
  const sBtn = document.getElementById("btn-shop");
  if (mBtn) mBtn.addEventListener("click", renderMissionsScreen);
  if (sBtn) sBtn.addEventListener("click", renderShopScreen);
  document.getElementById("btn-notes").addEventListener("click", openNotes);
  wireSoundToggle();
}

function wireSoundToggle() {
  const btn = document.getElementById("btn-sound");
  if (!btn) return;
  btn.addEventListener("click", () => {
    S.soundOn = !S.soundOn;
    saveState(S);
    btn.innerHTML = icon(S.soundOn ? "soundOn" : "soundOff");
    btn.title = S.soundOn ? "Tắt âm thanh" : "Bật âm thanh";
    if (S.soundOn) playClick();
  });
}

// ---------------- Rendering: home / path ----------------

// Deterministic pseudo-random per-node offset so the path looks organically
// scattered (not a repeating wave) but stays stable across re-renders.
function nodeJitter(seed, maxY, maxRot) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const a = ((h % 1000) / 1000) * 2 - 1;
  const b = (((h >> 5) % 1000) / 1000) * 2 - 1;
  return { ty: Math.round(a * maxY), rot: Math.round(b * maxRot) };
}

function renderHome() {
  const subjectId = S.currentSubjectId;
  const subj = currentSubject();
  const baiList = subj.bai;

  let html = renderTabBar() + renderTopbar(false) + `<div class="home-scroll" id="home-scroll">` + renderHeroBanner();

  let nextIndex = baiList.findIndex((b, i) => isBaiUnlocked(subjectId, i, baiList) && !isBaiCompleted(subjectId, b.id));

  for (const cd of subj.chuDe) {
    const bais = baiByChuDe(subjectId, cd.id);
    const doneCount = bais.filter((b) => isBaiCompleted(subjectId, b.id)).length;
    const theme = themeForUnit(cd.id, cd.order);
    html += `
      <div class="unit-section" style="--sky-top:${theme.skyTop};--sky-bottom:${theme.skyBottom};--node-speckle:${theme.speckle};--theme-glow:${theme.bannerGlow};--node-clip:${theme.nodeClip}">
      <div class="unit-decor" aria-hidden="true">${theme.decor.join("")}</div>
      <div class="unit-banner" style="background-color:${cd.color}">
        <div>
          <div class="unit-label">${subj.unitLabel} ${cd.order} · ${theme.label}</div>
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
      const jitter = nodeJitter(`${cd.id}-${b.baiNumber}`, 16, 5);
      let cls = "node";
      let inner = `${icon("book", "node-icon")}<span class="node-num">${b.baiNumber}</span>`;
      let clickable = false;
      if (completed) {
        inner = icon("check");
        clickable = true;
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
        <div class="node-wrap" style="transform:translateY(${jitter.ty}px) rotate(${jitter.rot}deg)">
          ${isNext && available ? `<div class="start-badge">Bắt đầu</div>` : ""}
          <button class="${cls}" style="${bg ? `background-color:${bg}` : ""}" data-bai="${b.id}" ${clickable ? "" : "disabled"}>
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
      <div class="node-wrap boss-wrap">
        <button class="${bossCls}" style="${bossClickable || bossCompleted ? `background-color:${cd.color}` : ""}" data-boss="${cd.id}" ${bossClickable ? "" : "disabled"}>
          <span class="boss-ring"></span>
          ${bossInner}
        </button>
        <div class="node-title">Ôn tập ${subj.unitLabel.toLowerCase()}</div>
        <div class="node-label">${bossCompleted ? "Đã hoàn thành ✓" : !bossAvailable ? "đang cập nhật" : !bossUnlocked ? `Hoàn thành hết ${subj.lessonLabel.toLowerCase()} trong ${subj.unitLabel.toLowerCase()} để mở khoá` : "Thử thách tổng hợp"}</div>
      </div>
    `;

    html += `</div></div>`;
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
      ${mascot("wave", "", null, currentMascotSpecies(S))}
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
              <div class="mission-reward">${icon("gem")}+${m.xu}</div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
  document.getElementById("btn-back").addEventListener("click", renderHome);
  wireTopbarExtras();
}

// ---------------- Rendering: shop screen ----------------

function renderShopScreen() {
  const groups = [
    { type: "upgrade", title: "Nâng cấp" },
    { type: "mascot", title: "Bạn đồng hành" },
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
              ${g.type === "mascot" ? renderOwlShopCard() : ""}
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
  wireTopbarExtras();
  wireShopButtons();
}

function renderOwlShopCard() {
  const equipped = !S.equipped.mascot;
  return `
    <div class="shop-card">
      <div class="shop-preview">${mascotSvg("wave", null, "owl")}</div>
      <div class="shop-card-name">Cú Thông Thái</div>
      <div class="shop-card-desc">Mặc định</div>
      <button class="btn ${equipped ? "btn-primary" : "btn-secondary"} btn-small" data-equip-owl="1">${equipped ? "Đang dùng" : "Sử dụng"}</button>
    </div>
  `;
}

function renderShopItem(item) {
  const owned = ownsItem(S, item.id);
  const equipped = item.type === "mascot" ? S.equipped.mascot === item.id : item.type === "theme" ? S.equipped.theme === item.id : false;
  let preview = "";
  if (item.type === "mascot") preview = `<div class="shop-preview">${mascotSvg("wave", null, item.species)}</div>`;
  else if (item.type === "theme") preview = `<div class="shop-preview theme-swatch"><span style="background:${item.green}"></span><span style="background:${item.blue}"></span></div>`;
  else preview = `<div class="shop-preview consumable-preview">${icon(item.icon)}</div>`;

  let name = item.name;
  let desc = item.desc || "";
  let actionHtml;
  if (item.type === "upgrade") {
    const bonus = S.maxHeartsBonus || 0;
    const maxed = bonus >= MAX_HEARTS_BONUS_CAP;
    name = `${item.name} (${BASE_MAX_HEARTS + bonus} tim)`;
    if (maxed) {
      actionHtml = `<button class="btn btn-secondary btn-small" disabled>Đã tối đa</button>`;
    } else {
      const price = maxHeartPrice(S);
      actionHtml = `<button class="btn btn-primary btn-small" data-buy="${item.id}" ${S.currency < price ? "disabled" : ""}>${icon("gem")} ${price}</button>`;
    }
  } else if (item.type === "consumable") {
    actionHtml = `<button class="btn btn-primary btn-small" data-buy="${item.id}" ${S.currency < item.price ? "disabled" : ""}>${icon("gem")} ${item.price}</button>`;
  } else if (owned) {
    actionHtml = `<button class="btn ${equipped ? "btn-primary" : "btn-secondary"} btn-small" data-equip="${item.id}">${equipped ? "Đang dùng" : "Sử dụng"}</button>`;
  } else {
    actionHtml = `<button class="btn btn-primary btn-small" data-buy="${item.id}" ${S.currency < item.price ? "disabled" : ""}>${icon("gem")} ${item.price}</button>`;
  }

  return `
    <div class="shop-card">
      ${preview}
      <div class="shop-card-name">${name}</div>
      ${desc ? `<div class="shop-card-desc">${desc}</div>` : ""}
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
  const owlBtn = document.querySelector("[data-equip-owl]");
  if (owlBtn) {
    owlBtn.addEventListener("click", () => {
      S.equipped.mascot = null;
      saveState(S);
      renderShopScreen();
    });
  }
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
    hearts: effectiveMaxHearts(S),
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
    hearts: effectiveMaxHearts(S),
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
  const cd = chuDeById(session.subjectId, session.chuDeId);
  const accent = cd ? cd.color : null;

  if ((card.kind === "mcq" || card.kind === "gloss" || card.kind === "tf") && card._style === undefined) {
    card._style = Math.random() < 0.5 ? (card.kind === "tf" ? "sort" : "bubbles") : (card.kind === "tf" ? "toggle" : "list");
  }

  let bodyHtml = "";
  if (card.kind === "concept") {
    bodyHtml = renderConceptCard(card);
  } else if (card.kind === "mcq" || card.kind === "gloss") {
    bodyHtml = renderMcqCard(card);
  } else if (card.kind === "tf") {
    bodyHtml = renderTfCard(card);
  } else if (card.kind === "short") {
    bodyHtml = renderShortCard(card);
  } else if (card.kind === "match") {
    bodyHtml = renderMatchCard(card);
  }

  els.app.innerHTML = `
    <div class="lesson-screen" style="${accent ? `--lesson-accent:${accent}` : ""}">
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
  wireTopbarExtras();

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
  const bubbles = card._style === "bubbles";
  return `
    <div class="q-prompt">${card.kind === "mcq" ? card.question : card.prompt}</div>
    <div class="options ${bubbles ? "options-bubbles" : ""}">
      ${optKeys
        .map((k, i) => {
          const text = card.kind === "mcq" ? card.options[k] : card.options[i];
          const label = card.kind === "mcq" ? k : String.fromCharCode(65 + i);
          const rot = bubbles ? Math.round((Math.random() - 0.5) * 12) : 0;
          return `<button class="option-btn" data-key="${k}" style="${bubbles ? `--bubble-rot:${rot}deg` : ""}"><b>${label}.</b> ${text}</button>`;
        })
        .join("")}
    </div>
  ` + footerCheck();
}

function renderTfCard(card) {
  if (card._style === "sort") {
    return `
      ${card.stimulus ? `<div class="q-stimulus">${card.stimulus}</div>` : ""}
      <div class="q-prompt" style="font-size:16px">Xếp mỗi ý vào đúng cột:</div>
      <div class="tf-sort-columns">
        <div class="tf-sort-col tf-sort-true">
          <div class="tf-sort-label">${icon("check")} ĐÚNG</div>
          <div class="tf-sort-drop" id="tf-drop-true"></div>
        </div>
        <div class="tf-sort-col tf-sort-false">
          <div class="tf-sort-label">${icon("x")} SAI</div>
          <div class="tf-sort-drop" id="tf-drop-false"></div>
        </div>
      </div>
      <div class="tf-chip-pool" id="tf-chip-pool"></div>
      <div class="tf-sort-hint">Chạm vào 1 ý để xếp Đúng, chạm lần nữa để chuyển sang Sai, chạm lần 3 để bỏ ra.</div>
    ` + footerCheck();
  }
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

function renderMatchCard(card) {
  const defOrder = card.defOrder.map((key) => card.pairs.find((p) => p.key === key));
  return `
    <div class="q-prompt" style="font-size:16px">Ghép mỗi khái niệm với đúng định nghĩa của nó:</div>
    <div class="match-columns">
      <div class="match-col" id="match-terms">
        ${card.pairs.map((p) => `<button class="match-chip match-term" data-key="${p.key}">${p.term}</button>`).join("")}
      </div>
      <div class="match-col" id="match-defs">
        ${defOrder.map((p) => `<button class="match-chip match-def" data-key="${p.key}">${p.definition}</button>`).join("")}
      </div>
    </div>
    <div class="match-progress" id="match-progress">Đã ghép: 0/${card.pairs.length}</div>
  `;
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

  if (card.kind === "tf" && card._style === "sort") {
    wireTfSort(card);
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

  if (card.kind === "match") {
    wireMatchCard(card);
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

function wireTfSort(card) {
  const answers = {};
  function renderChips() {
    const trueZone = document.getElementById("tf-drop-true");
    const falseZone = document.getElementById("tf-drop-false");
    const pool = document.getElementById("tf-chip-pool");
    trueZone.innerHTML = "";
    falseZone.innerHTML = "";
    pool.innerHTML = "";
    card.statements.forEach((st) => {
      const chip = document.createElement("button");
      chip.className = "tf-chip";
      chip.setAttribute("data-key", st.key);
      chip.innerHTML = `<b>${st.key})</b> ${st.text}`;
      chip.addEventListener("click", () => {
        if (session.answered) return;
        const current = answers[st.key];
        if (current === undefined) answers[st.key] = true;
        else if (current === true) answers[st.key] = false;
        else delete answers[st.key];
        renderChips();
        document.getElementById("btn-check").disabled = Object.keys(answers).length < card.statements.length;
      });
      const state = answers[st.key];
      if (state === true) {
        chip.classList.add("tf-chip-true");
        trueZone.appendChild(chip);
      } else if (state === false) {
        chip.classList.add("tf-chip-false");
        falseZone.appendChild(chip);
      } else {
        pool.appendChild(chip);
      }
    });
  }
  renderChips();
  document.getElementById("btn-check").addEventListener("click", () => {
    if (session.answered) return;
    gradeTf(card, answers);
  });
}

function wireMatchCard(card) {
  let selectedTerm = null;
  let locked = false;
  const matched = new Set();
  const wrongTerm = new Set();
  document.querySelectorAll(".match-term").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (locked || matched.has(btn.getAttribute("data-key"))) return;
      document.querySelectorAll(".match-term").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedTerm = btn;
    });
  });
  document.querySelectorAll(".match-def").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (locked || !selectedTerm || matched.has(btn.getAttribute("data-key"))) return;
      const termKey = selectedTerm.getAttribute("data-key");
      const defKey = btn.getAttribute("data-key");
      const termBtn = selectedTerm;
      if (termKey === defKey) {
        matched.add(termKey);
        termBtn.classList.remove("selected");
        termBtn.classList.add("match-locked");
        btn.classList.add("match-locked");
        termBtn.disabled = true;
        btn.disabled = true;
        playCorrect();
        selectedTerm = null;
        document.getElementById("match-progress").textContent = `Đã ghép: ${matched.size}/${card.pairs.length}`;
        if (matched.size === card.pairs.length) gradeMatch(card, wrongTerm);
      } else {
        wrongTerm.add(termKey);
        locked = true;
        btn.classList.add("match-wrong");
        termBtn.classList.add("match-wrong");
        playIncorrect();
        selectedTerm = null;
        setTimeout(() => {
          btn.classList.remove("match-wrong");
          termBtn.classList.remove("match-wrong", "selected");
          locked = false;
        }, 500);
      }
    });
  });
}

function gradeMatch(card, wrongTerm) {
  session.answered = true;
  const correctCount = card.pairs.filter((p) => !wrongTerm.has(p.key)).length;
  session.correctUnits += correctCount;
  session.xpEarned += correctCount * 5;
  if (correctCount < card.pairs.length) loseSessionHeart();
  const allCorrect = correctCount === card.pairs.length;
  allCorrect ? playComplete() : playCorrect();
  showFeedback(allCorrect, `Bạn ghép đúng ${correctCount}/${card.pairs.length} cặp ngay lần đầu.`);
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
  isCorrect ? playCorrect() : playIncorrect();
  if (isCorrect) {
    session.correctUnits += 1;
    session.xpEarned += 10;
  } else {
    loseSessionHeart();
  }
  const answerText = `${card.answer}${card.unit ? " " + card.unit : ""}`;
  showFeedback(isCorrect, isCorrect ? null : `Đáp án đúng: ${answerText}`);
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
  isCorrect ? playCorrect() : playIncorrect();
  if (isCorrect) {
    session.correctUnits += 1;
    session.xpEarned += 10;
  } else {
    loseSessionHeart();
  }
  showFeedback(isCorrect, null);
}

function gradeTf(card, answers) {
  session.answered = true;
  let correctCount = 0;
  card.statements.forEach((st) => {
    if (answers[st.key] === st.answer) correctCount += 1;
  });

  // Toggle-row style feedback
  document.querySelectorAll(".tf-row").forEach((row) => {
    const key = row.getAttribute("data-key");
    const st = card.statements.find((s) => s.key === key);
    const ok = answers[key] === st.answer;
    row.classList.add(ok ? "graded-correct" : "graded-incorrect");
    row.querySelectorAll(".tf-btn").forEach((b) => (b.disabled = true));
  });
  // Sort-chip style feedback
  document.querySelectorAll(".tf-chip[data-key]").forEach((chip) => {
    const key = chip.getAttribute("data-key");
    const st = card.statements.find((s) => s.key === key);
    if (!st) return;
    const ok = answers[key] === st.answer;
    chip.classList.add(ok ? "graded-correct" : "graded-incorrect");
    chip.disabled = true;
  });

  session.correctUnits += correctCount;
  session.xpEarned += correctCount * 5;
  if (correctCount < card.statements.length) loseSessionHeart();
  const allCorrect = correctCount === card.statements.length;
  allCorrect ? playCorrect() : playIncorrect();
  showFeedback(allCorrect, `Bạn đúng ${correctCount}/${card.statements.length} ý.`);
}

const CORRECT_QUOTES = [
  "Chuẩn không cần chỉnh!",
  "Đỉnh của chóp!",
  "Não to dữ vậy!",
  "Xịn xò ghê ta ơi!",
  "Cú tui phải chắp cánh vái chào!",
  "Auto đúng, khỏi bàn!",
  "Học vậy điểm 10 chạy đâu cho thoát!",
  "Giỏi như này thi cử nhẹ tênh!",
];

const WRONG_QUOTES = [
  "Ui, hụt xíu à nha!",
  "Cú tui đây còn sai nữa là...",
  "Không sao, sai một lần nhớ cả đời!",
  "Gần đúng rồi, nhưng chưa phải!",
  "Học là phải có vài lần vấp chứ!",
  "Đáp án đang trốn ở chỗ khác kìa!",
  "Cố lên, lần sau đúng chóc!",
  "Cú tui buồn ngủ gật xíu, thử lại nha!",
];

function randomQuote(isCorrect) {
  const pool = isCorrect ? CORRECT_QUOTES : WRONG_QUOTES;
  return pool[Math.floor(Math.random() * pool.length)];
}

function showFeedback(isCorrect, detail) {
  const bar = document.querySelector(".footer-bar");
  if (bar) bar.remove();
  const div = document.createElement("div");
  div.className = `feedback-banner ${isCorrect ? "correct" : "incorrect"}`;
  div.innerHTML = `
    <div class="fb-left">
      ${mascot(isCorrect ? "celebrate" : "sad", "fb-mascot", null, currentMascotSpecies(S))}
      <div class="fb-text-wrap">
        <span class="fb-quote">${icon(isCorrect ? "check" : "x")} ${randomQuote(isCorrect)}</span>
        ${detail ? `<span class="fb-detail">${detail}</span>` : ""}
      </div>
    </div>
    <button class="btn ${isCorrect ? "btn-primary" : "btn-danger"}" id="btn-next">Tiếp tục</button>
  `;
  document.querySelector(".lesson-screen").appendChild(div);
  document.getElementById("btn-next").addEventListener("click", advanceCard);
  const heartEl = document.querySelector(".stat-heart");
  if (heartEl) heartEl.innerHTML = `${icon("heart")}${session.hearts}`;
  document.querySelector(".stat-xp").innerHTML = `${icon("flash")}${S.xp + session.xpEarned}`;
}

function loseSessionHeart() {
  session.hearts = Math.max(0, session.hearts - 1);
}

function advanceCard() {
  session.answered = false;
  if (session.hearts <= 0) {
    renderFailScreen();
    return;
  }
  session.index += 1;
  if (session.index >= session.queue.length) {
    finishSession();
  } else {
    renderCard();
  }
}

function renderFailScreen() {
  playFail();
  els.app.innerHTML = `
    <div class="summary-screen pop-in fail-screen">
      ${mascot("sad", "", null, currentMascotSpecies(S))}
      <h1>Hết tim rồi!</h1>
      <div class="sub">${session.lessonTitle} - đừng lo, thử lại là qua thôi!</div>
      <div class="summary-stats">
        <div class="summary-stat"><div class="val">${session.correctUnits}</div><div class="lbl">Câu đúng</div></div>
      </div>
      <button class="btn btn-primary btn-block" id="btn-retry">Thử lại</button>
      <button class="btn btn-secondary btn-block" id="btn-fail-home">Về trang chủ</button>
    </div>
  `;
  document.getElementById("btn-retry").addEventListener("click", () => {
    if (session.mode === "lesson") startBaiSession(session.baiId);
    else startBossSession(session.chuDeId);
  });
  document.getElementById("btn-fail-home").addEventListener("click", () => {
    session = null;
    switchToHome();
  });
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
      ${mascot(pct >= 70 ? "celebrate" : "wave", "", null, currentMascotSpecies(S))}
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
          ? `<div class="mission-toast">${toasts.map((t) => `${icon("target")} Hoàn thành nhiệm vụ: <b>${t.text(t.target)}</b> ${icon("gem")}+${t.xu}`).join("<br/>")}</div>`
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
  playComplete();
  if (toasts && toasts.length) setTimeout(playCoin, 350);
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

const LOADING_TIPS = [
  "Học 5 phút mỗi ngày còn hơn học dồn một lần mỗi tuần!",
  "Sai không sao cả, quan trọng là nhớ được đáp án đúng.",
  "Ôn lại chủ đề cũ giúp bạn nhớ lâu hơn là chỉ học bài mới.",
  "GDP và GNI khác nhau đấy, đừng nhầm lẫn nhé!",
  "Làm bài tính toán nhớ ghi rõ đơn vị đo, dễ ăn điểm hơn.",
  "Giữ chuỗi ngày học đều để kiến thức không bị quên.",
  "Đọc kỹ câu Đúng/Sai - chỉ cần sai 1 ý là cả câu tính sai.",
  "Dùng Xu mua thêm tim nếu định thử bài khó hơn.",
  "Học xong một bài, thử luôn phần Ôn tập chủ đề nhé!",
  "Cú tui tin là bạn làm được!",
  "Muốn nhớ công thức lâu? Thử áp dụng vào ví dụ thực tế xem.",
  "Đừng ngại bấm nút Thử lại - càng luyện càng nhớ chắc.",
];

function renderLoadingScreen() {
  const tip = LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)];
  els.app.innerHTML = `
    <div class="loading-screen">
      ${mascot("wave", "boot-mascot", null, currentMascotSpecies(S))}
      <h3>Đang tải bài học...</h3>
      <div class="loading-tip"><span class="tip-label">Mẹo nhỏ</span>${tip}</div>
    </div>
  `;
}

function wireClickEffects() {
  document.addEventListener("pointerdown", (e) => {
    const btn = e.target.closest("button:not(:disabled)");
    if (!btn) return;
    const ripple = document.createElement("span");
    ripple.className = "click-ripple";
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    document.body.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
    setTimeout(() => ripple.remove(), 600);
  });
}
wireClickEffects();

async function boot() {
  renderLoadingScreen();
  const start = Date.now();
  await loadAllContent({});
  const minDelay = 700;
  const elapsed = Date.now() - start;
  if (elapsed < minDelay) await new Promise((resolve) => setTimeout(resolve, minDelay - elapsed));
  renderHome();
}

boot();
