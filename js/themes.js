// Per-unit visual themes: each chu-de/chuong gets a distinct backdrop and a
// textured "ground" for its lesson nodes, like a garden, a volcano, etc.

const THEME_DEFS = {
  garden: {
    label: "Vườn xanh",
    skyTop: "#eaffc9",
    skyBottom: "#c3f2a0",
    speckle: "#5a3a1e",
    bannerGlow: "rgba(88,204,2,0.18)",
  },
  volcano: {
    label: "Núi lửa",
    skyTop: "#3a2230",
    skyBottom: "#1c1420",
    speckle: "#ff7a1a",
    bannerGlow: "rgba(255,75,75,0.25)",
  },
  ocean: {
    label: "Đại dương",
    skyTop: "#cdf1ff",
    skyBottom: "#8fd8f5",
    speckle: "#0d5c7a",
    bannerGlow: "rgba(28,176,246,0.2)",
  },
  desert: {
    label: "Sa mạc",
    skyTop: "#ffe9b8",
    skyBottom: "#f5c874",
    speckle: "#9a5b21",
    bannerGlow: "rgba(255,150,0,0.2)",
  },
  snow: {
    label: "Băng tuyết",
    skyTop: "#f2fbff",
    skyBottom: "#cfe9f7",
    speckle: "#7fb2c9",
    bannerGlow: "rgba(28,176,246,0.15)",
  },
  night: {
    label: "Bầu trời đêm",
    skyTop: "#232a52",
    skyBottom: "#12142b",
    speckle: "#ffd76b",
    bannerGlow: "rgba(206,130,255,0.25)",
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
};

const THEME_CYCLE = Object.keys(THEME_DEFS);

function themeForUnit(chuDeId, order) {
  const id = UNIT_THEME[chuDeId] || THEME_CYCLE[(order - 1) % THEME_CYCLE.length];
  return THEME_DEFS[id];
}
