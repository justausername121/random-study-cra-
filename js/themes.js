// Per-unit visual themes: each chu-de/chuong gets a distinct backdrop, a
// non-circular "ground" shape for its lesson nodes, and a few scattered
// scenery doodles, like a garden, a volcano, etc.

function blobClip(pts) {
  return `polygon(${pts})`;
}

const NODE_CLIP = {
  garden: blobClip("50% 1%, 76% 8%, 94% 30%, 96% 58%, 82% 84%, 55% 98%, 25% 92%, 6% 68%, 4% 38%, 20% 12%"),
  volcano: blobClip("30% 0%, 62% 6%, 88% 20%, 100% 48%, 90% 78%, 62% 98%, 32% 96%, 6% 74%, 0% 42%, 12% 14%"),
  ocean: blobClip("50% 2%, 80% 12%, 98% 40%, 90% 72%, 66% 97%, 34% 97%, 10% 72%, 2% 40%, 20% 12%"),
  desert: blobClip("50% 6%, 82% 16%, 98% 46%, 86% 80%, 56% 98%, 24% 92%, 4% 62%, 8% 30%, 28% 8%"),
  snow: blobClip("50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%"),
  night: "none",
};

function decorSun(style) {
  return `<svg style="${style}" viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="12" fill="#ffdd66"/><g stroke="#ffdd66" stroke-width="3" stroke-linecap="round"><path d="M30 4v8M30 48v8M4 30h8M48 30h8M11 11l6 6M43 43l6 6M11 49l6-6M43 17l6-6"/></g></svg>`;
}

function decorVolcano(style) {
  return `<svg style="${style}" viewBox="0 0 140 100" fill="none">
    <path d="M10 96 L60 14 L70 30 L80 14 L130 96 Z" fill="#2e1f2a"/>
    <path d="M60 14 L70 30 L80 14 L92 40 L48 40 Z" fill="#4a2f3a"/>
    <circle cx="70" cy="20" r="7" fill="#ff7a1a"/>
    <path d="M66 12 Q70 -2 74 12" stroke="#ff7a1a" stroke-width="3" fill="none" stroke-linecap="round"/>
  </svg>`;
}

function decorRock(style, color) {
  return `<svg style="${style}" viewBox="0 0 40 26" fill="none"><path d="M2 24 Q0 12 12 10 Q16 0 26 4 Q40 2 38 16 Q40 24 30 24 Z" fill="${color || "#4a3428"}"/></svg>`;
}

function decorBush(style) {
  return `<svg style="${style}" viewBox="0 0 44 30" fill="none"><ellipse cx="12" cy="20" rx="12" ry="10" fill="#3a9c3f"/><ellipse cx="28" cy="16" rx="15" ry="13" fill="#48b653"/><circle cx="10" cy="10" r="3" fill="#ff8fb0"/><circle cx="30" cy="6" r="3" fill="#ffd166"/></svg>`;
}

function decorWave(style, color) {
  return `<svg style="${style}" viewBox="0 0 100 20" fill="none"><path d="M0 10 Q12 0 25 10 T50 10 T75 10 T100 10" stroke="${color || "#1c7fa8"}" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
}

function decorCactus(style) {
  return `<svg style="${style}" viewBox="0 0 40 50" fill="none"><rect x="16" y="10" width="8" height="38" rx="4" fill="#3a7d44"/><path d="M16 22 Q4 22 4 14 Q4 8 10 10 Q12 16 16 18" fill="#3a7d44"/><path d="M24 30 Q36 30 36 22 Q36 16 30 18 Q28 24 24 26" fill="#3a7d44"/></svg>`;
}

function decorSnowflake(style) {
  return `<svg style="${style}" viewBox="0 0 24 24" fill="none" stroke="#cfeeff" stroke-width="2" stroke-linecap="round"><path d="M12 2v20M4.5 6l15 12M19.5 6l-15 12"/></svg>`;
}

// A gentle winding band that stretches to fill the whole unit section
// (preserveAspectRatio="none"), giving the ground an actual "path" instead
// of a flat single-color fill.
function groundPathSvg(color) {
  return `<svg style="position:absolute;inset:0;width:100%;height:100%" viewBox="0 0 1000 300" preserveAspectRatio="none">
    <path d="M -50 130 C 120 60, 260 220, 420 150 S 700 40, 860 150 S 1080 230, 1050 150 L 1050 320 L -50 320 Z" fill="${color}" opacity="0.4"/>
  </svg>`;
}

function decorMoonStars(style) {
  return `<svg style="${style}" viewBox="0 0 80 60" fill="none">
    <path d="M55 10a16 16 0 100 32 13 13 0 010-32z" fill="#f2e9c9"/>
    <circle cx="14" cy="14" r="2" fill="#fff"/>
    <circle cx="26" cy="30" r="1.6" fill="#fff"/>
    <circle cx="8" cy="40" r="1.4" fill="#fff"/>
    <circle cx="34" cy="12" r="1.4" fill="#fff"/>
  </svg>`;
}

const THEME_DEFS = {
  garden: {
    label: "Vườn xanh",
    skyTop: "#eaffc9",
    skyBottom: "#c3f2a0",
    speckle: "#5a3a1e",
    bannerGlow: "rgba(88,204,2,0.18)",
    nodeClip: NODE_CLIP.garden,
    decor: [
      groundPathSvg("#e0b876"),
      decorSun("position:absolute;top:6%;right:8%;width:60px"),
      decorBush("position:absolute;bottom:2%;left:4%;width:70px"),
      decorBush("position:absolute;bottom:0%;right:14%;width:50px;transform:scaleX(-1)"),
    ],
  },
  volcano: {
    label: "Núi lửa",
    skyTop: "#3a2230",
    skyBottom: "#1c1420",
    speckle: "#ff7a1a",
    bannerGlow: "rgba(255,75,75,0.25)",
    nodeClip: NODE_CLIP.volcano,
    decor: [
      groundPathSvg("#e8952e"),
      decorVolcano("position:absolute;top:2%;right:6%;width:150px"),
      decorVolcano("position:absolute;bottom:8%;left:16%;width:60px"),
      decorVolcano("position:absolute;bottom:4%;right:22%;width:54px;transform:scaleX(-1)"),
      decorRock("position:absolute;bottom:4%;left:6%;width:44px"),
      decorRock("position:absolute;bottom:2%;left:38%;width:30px", "#3a2a20"),
      decorRock("position:absolute;bottom:10%;right:6%;width:36px"),
      decorRock("position:absolute;top:60%;left:2%;width:26px", "#2e2018"),
    ],
  },
  ocean: {
    label: "Đại dương",
    skyTop: "#cdf1ff",
    skyBottom: "#8fd8f5",
    speckle: "#0d5c7a",
    bannerGlow: "rgba(28,176,246,0.2)",
    nodeClip: NODE_CLIP.ocean,
    decor: [
      groundPathSvg("#f0d9a0"),
      decorSun("position:absolute;top:5%;left:8%;width:44px"),
      decorWave("position:absolute;bottom:6%;left:10%;width:120px"),
      decorWave("position:absolute;bottom:2%;right:8%;width:100px", "#2a8fc2"),
    ],
  },
  desert: {
    label: "Sa mạc",
    skyTop: "#ffe9b8",
    skyBottom: "#f5c874",
    speckle: "#9a5b21",
    bannerGlow: "rgba(255,150,0,0.2)",
    nodeClip: NODE_CLIP.desert,
    decor: [
      groundPathSvg("#d9a45c"),
      decorSun("position:absolute;top:6%;right:10%;width:54px"),
      decorCactus("position:absolute;bottom:2%;left:8%;width:40px"),
      decorCactus("position:absolute;bottom:0%;right:20%;width:30px;transform:scaleX(-1)"),
    ],
  },
  snow: {
    label: "Băng tuyết",
    skyTop: "#f2fbff",
    skyBottom: "#cfe9f7",
    speckle: "#7fb2c9",
    bannerGlow: "rgba(28,176,246,0.15)",
    nodeClip: NODE_CLIP.snow,
    decor: [
      groundPathSvg("#cfe9f7"),
      decorSnowflake("position:absolute;top:8%;left:10%;width:26px"),
      decorSnowflake("position:absolute;top:20%;right:14%;width:20px"),
      decorSnowflake("position:absolute;bottom:10%;left:24%;width:22px"),
      decorSnowflake("position:absolute;bottom:16%;right:8%;width:18px"),
    ],
  },
  night: {
    label: "Bầu trời đêm",
    skyTop: "#232a52",
    skyBottom: "#12142b",
    speckle: "#ffd76b",
    bannerGlow: "rgba(206,130,255,0.25)",
    nodeClip: NODE_CLIP.night,
    decor: [
      groundPathSvg("#3d3a72"),
      decorMoonStars("position:absolute;top:6%;right:8%;width:110px"),
    ],
  },
};

// Explicit per-unit assignment (falls back to cycling the palette if a unit
// id isn't listed here, so a newly-added subject still gets themed for free).
const UNIT_THEME = {
  cd1: "garden",
  cd2: "volcano",
  cd3: "ocean",
  cd4: "desert",
  cd5: "snow",
  cd6: "night",
  cd7: "garden",
  cd8: "volcano",
  cd9: "ocean",
  vlc1: "volcano",
  vlc2: "desert",
  vlc3: "night",
  vlc4: "ocean",
  c1: "volcano",
  c2: "night",
  c3: "ocean",
  c4: "garden",
  c5: "desert",
  c6: "snow",
};

const THEME_CYCLE = Object.keys(THEME_DEFS);

function themeForUnit(chuDeId, order) {
  const id = UNIT_THEME[chuDeId] || THEME_CYCLE[(order - 1) % THEME_CYCLE.length];
  return THEME_DEFS[id];
}
