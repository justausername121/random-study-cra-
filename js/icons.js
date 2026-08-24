const ICONS = {
  fire: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 3-2 4-2 7a3 3 0 106 0c1.5 1 3 3.5 3 6a7 7 0 11-14 0c0-4 3-6 4-9 0 2 1 3 2 3 .5-2-.5-4.5 1-7z"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.7-10-9.3C.5 8 2 4 6 4c2 0 3.5 1.2 4 2.3C10.5 5.2 12 4 14 4c4 0 5.5 4 4 7.7C19.5 16.3 12 21 12 21z"/></svg>`,
  heartOutline: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7.5-4.7-10-9.3C.5 8 2 4 6 4c2 0 3.5 1.2 4 2.3C10.5 5.2 12 4 14 4c4 0 5.5 4 4 7.7C19.5 16.3 12 21 12 21z"/></svg>`,
  gem: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 3h12l4 6-10 12L2 9z"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.1 6.4L22 9.3l-5 4.9L18.2 22 12 18.3 5.8 22 7 14.2l-5-4.9 6.9-1z"/></svg>`,
  starOutline: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.1 6.4L22 9.3l-5 4.9L18.2 22 12 18.3 5.8 22 7 14.2l-5-4.9 6.9-1z"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a5 5 0 00-5 5v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm0 2a3 3 0 013 3v3H9V7a3 3 0 013-3z"/></svg>`,
  back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>`,
  crown: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 8l4 3 5-6 5 6 4-3-2 11H5L3 8z"/></svg>`,
  coin: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><text x="12" y="16.5" font-size="12" font-weight="800" text-anchor="middle" fill="#a67c00">₫</text></svg>`,
  target: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/></svg>`,
  bag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12l1 12H5L6 8z"/><path d="M9 8V6a3 3 0 016 0v2"/></svg>`,
  snowflake: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v20M4.5 6l15 12M19.5 6l-15 12M2 12h20M6 4.5l12 15M18 4.5l-12 15"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
  soundOn: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 5V4L8 9H4z"/><path d="M16.5 8.5a5 5 0 010 7M19 6a9 9 0 010 12"/></svg>`,
  soundOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 5V4L8 9H4z"/><path d="M16 9l5 6M21 9l-5 6"/></svg>`,
  flash: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/></svg>`,
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.2V5.8C4 4.8 4.8 4 5.8 4H12v16H5.8c-1 0-1.8-.8-1.8-1.8z"/><path d="M20 19.2V5.8c0-1-.8-1.8-1.8-1.8H12v16h6.2c1 0 1.8-.8 1.8-1.8z"/></svg>`,
  notes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h13l3 3v13H4z"/><path d="M17 4v3h3"/><path d="M8 10h8M8 14h8M8 18h4"/></svg>`,
  sword: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 3.5L21 10l-8.5 8.5-4-1-1-4z"/><path d="M9 15l-5.5 5.5"/><path d="M17 6l-8.5 8.5"/></svg>`,
  examPaper: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h9l3 3v17H6z"/><path d="M15 2v3h3"/><path d="M9 12l2 2 4-4"/><path d="M9 17h6"/></svg>`,
};

function icon(name, cls) {
  return `<span class="${cls || ""}">${ICONS[name]}</span>`;
}

// Original chibi-style mascot characters (round oversized head/body, big
// eyes, flat clean-vector look) - not affiliated with any brand's mascot.
// Several "species" share this same rig; only color + head accessory +
// snout + an optional tail differ between them.

const MASCOT_SPECIES = {
  owl: {
    name: "Cú Thông Thái",
    body: "#58cc02", belly: "#8ee050", limb: "#4caf00",
    head(accent) {
      const a1 = accent || "#2b2b45";
      const a2 = shadeColor(a1, -25);
      return `
        <path d="M42 42 L90 22 L138 42 L90 60 Z" fill="${a1}"/>
        <path d="M90 60 L90 44 L110 37 L110 53 Z" fill="${a2}"/>
        <line x1="138" y1="42" x2="138" y2="60" stroke="${a1}" stroke-width="4"/>
        <circle cx="138" cy="62" r="4" fill="#ffc800"/>
      `;
    },
    snout: `<path d="M90 94 L101 108 L79 108 Z" fill="#ff9600"/>`,
    tail: "",
  },
  cat: {
    name: "Mèo Cam",
    body: "#ff9d3d", belly: "#ffd9a8", limb: "#e07d1e",
    head() {
      return `
        <path d="M46 44 L58 8 L78 46 Z" fill="#ff9d3d"/>
        <path d="M102 46 L122 8 L134 44 Z" fill="#ff9d3d"/>
        <path d="M53 38 L60 20 L69 40 Z" fill="#ffc9e0"/>
        <path d="M111 40 L120 20 L127 38 Z" fill="#ffc9e0"/>
      `;
    },
    snout: `
      <path d="M90 96 L98 104 L90 108 L82 104 Z" fill="#ffc9e0"/>
      <line x1="60" y1="100" x2="30" y2="96" stroke="#e07d1e" stroke-width="2" stroke-linecap="round"/>
      <line x1="60" y1="106" x2="30" y2="108" stroke="#e07d1e" stroke-width="2" stroke-linecap="round"/>
      <line x1="120" y1="100" x2="150" y2="96" stroke="#e07d1e" stroke-width="2" stroke-linecap="round"/>
      <line x1="120" y1="106" x2="150" y2="108" stroke="#e07d1e" stroke-width="2" stroke-linecap="round"/>
    `,
    tail: `<path d="M144 132 Q172 120 166 88" stroke="#ff9d3d" stroke-width="14" fill="none" stroke-linecap="round"/>`,
  },
  fox: {
    name: "Cáo Lửa",
    body: "#ff7a3d", belly: "#ffddb8", limb: "#e05f22",
    head() {
      return `
        <path d="M44 46 L54 4 L80 44 Z" fill="#ff7a3d"/>
        <path d="M100 44 L126 4 L136 46 Z" fill="#ff7a3d"/>
        <path d="M50 38 L56 18 L70 40 Z" fill="#2b2b2b"/>
        <path d="M110 40 L124 18 L130 38 Z" fill="#2b2b2b"/>
      `;
    },
    snout: `
      <path d="M90 90 Q108 96 104 112 Q90 120 76 112 Q72 96 90 90Z" fill="#fff3e6"/>
      <circle cx="90" cy="108" r="4.5" fill="#2b2b2b"/>
    `,
    tail: `<path d="M146 134 Q180 124 176 92 Q174 80 162 84 Q168 108 140 118Z" fill="#ff7a3d"/><path d="M170 90 Q178 96 174 108" stroke="#fff3e6" stroke-width="8" fill="none" stroke-linecap="round"/>`,
  },
  bear: {
    name: "Gấu Nâu",
    body: "#9a6b43", belly: "#d9b48f", limb: "#7c5334",
    head() {
      return `
        <circle cx="48" cy="34" r="19" fill="#9a6b43"/>
        <circle cx="132" cy="34" r="19" fill="#9a6b43"/>
        <circle cx="48" cy="34" r="9" fill="#7c5334"/>
        <circle cx="132" cy="34" r="9" fill="#7c5334"/>
      `;
    },
    snout: `<ellipse cx="90" cy="104" rx="20" ry="15" fill="#d9b48f"/><ellipse cx="90" cy="100" rx="6" ry="4.5" fill="#3c3c3c"/>`,
    tail: "",
  },
  dragon: {
    name: "Rồng Nhí",
    body: "#1cb0f6", belly: "#a9e6ff", limb: "#1590c9",
    head() {
      return `
        <path d="M56 40 L66 8 L76 42 Z" fill="#1cb0f6"/>
        <path d="M104 42 L114 8 L124 40 Z" fill="#1cb0f6"/>
        <path d="M56 40 L63 16 L70 41 Z" fill="#0d6d99"/>
        <path d="M110 41 L117 16 L124 40 Z" fill="#0d6d99"/>
      `;
    },
    snout: `<path d="M90 94 L100 106 L90 112 L80 106 Z" fill="#0d6d99"/>`,
    tail: `<path d="M144 130 Q176 132 170 100" stroke="#1cb0f6" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M162 98 L172 92 L168 104Z" fill="#0d6d99"/>`,
  },
  rabbit: {
    name: "Thỏ Hoàng Gia",
    body: "#c0392b", belly: "#fbe8d3", limb: "#96281b",
    head() {
      return `
        <ellipse cx="62" cy="16" rx="12" ry="34" fill="#c0392b" transform="rotate(-8 62 16)"/>
        <ellipse cx="118" cy="16" rx="12" ry="34" fill="#c0392b" transform="rotate(8 118 16)"/>
        <ellipse cx="62" cy="12" rx="6" ry="19" fill="#2b2b2b" transform="rotate(-8 62 12)"/>
        <ellipse cx="118" cy="12" rx="6" ry="19" fill="#2b2b2b" transform="rotate(8 118 12)"/>
        <path d="M77 36 L90 16 L103 36 L95 36 L90 24 L85 36 Z" fill="#ffc800"/>
        <circle cx="90" cy="22" r="3.2" fill="#ff4b4b"/>
      `;
    },
    snout: `<path d="M90 98 C86 93 78 95 78 101 C78 106 90 112 90 112 C90 112 102 106 102 101 C102 95 94 93 90 98Z" fill="#ffb6c1"/>`,
    tail: `<circle cx="150" cy="128" r="15" fill="#fbe8d3"/>`,
  },
  cookie: {
    name: "Bánh Quy",
    body: "#d2a679", belly: "#e8c39e", limb: "#a97c50",
    head() {
      return `
        <circle cx="118" cy="118" r="5.5" fill="#6b4226"/>
        <circle cx="62" cy="122" r="4.5" fill="#6b4226"/>
        <circle cx="94" cy="132" r="5" fill="#6b4226"/>
        <circle cx="46" cy="105" r="4.5" fill="#6b4226"/>
        <circle cx="134" cy="103" r="4" fill="#6b4226"/>
        <path d="M74 28 Q90 6 106 28 Q97 20 90 24 Q83 20 74 28Z" fill="#fff6e0"/>
      `;
    },
    snout: "",
    tail: "",
  },
  panda: {
    name: "Gấu Trúc",
    body: "#fafafa", belly: "#ffffff", limb: "#2b2b2b",
    head() {
      return `
        <circle cx="46" cy="32" r="18" fill="#2b2b2b"/>
        <circle cx="134" cy="32" r="18" fill="#2b2b2b"/>
      `;
    },
    // Eye patches must render BEHIND the eyes (snout slot draws before eyes),
    // otherwise they'd cover the pupils entirely.
    snout: `
      <ellipse cx="60" cy="80" rx="17" ry="19" fill="#2b2b2b"/>
      <ellipse cx="120" cy="80" rx="17" ry="19" fill="#2b2b2b"/>
      <ellipse cx="90" cy="102" rx="7" ry="5.5" fill="#2b2b2b"/>
    `,
    tail: "",
  },
  penguin: {
    name: "Cánh Cụt",
    body: "#2b3a4a", belly: "#f2f6fa", limb: "#1c2733",
    head() {
      return "";
    },
    snout: `
      <ellipse cx="90" cy="86" rx="30" ry="34" fill="#f2f6fa"/>
      <path d="M90 92 L104 100 L90 106 L76 100 Z" fill="#ff9600"/>
    `,
    tail: "",
  },
  unicorn: {
    name: "Kỳ Lân",
    body: "#fdf1ff", belly: "#ffffff", limb: "#e8c9fb",
    head() {
      return `
        <path d="M90 44 L82 4 L98 20 Z" fill="#ffe07a"/>
        <path d="M83 38 L89 8 L95 36 Z" fill="#fff3c4"/>
        <path d="M50 20 Q70 4 90 22 Q80 18 74 26 Q84 20 92 28" fill="none" stroke="#ce82ff" stroke-width="6" stroke-linecap="round"/>
        <path d="M55 26 Q75 12 93 28" fill="none" stroke="#ff8fb0" stroke-width="6" stroke-linecap="round"/>
        <path d="M60 32 Q78 20 94 34" fill="none" stroke="#8fd8f5" stroke-width="6" stroke-linecap="round"/>
        <ellipse cx="30" cy="75" rx="8" ry="13" fill="#fdf1ff"/>
        <ellipse cx="150" cy="75" rx="8" ry="13" fill="#fdf1ff"/>
      `;
    },
    snout: `<ellipse cx="76" cy="106" rx="3" ry="4" fill="#e8a4c9"/><ellipse cx="104" cy="106" rx="3" ry="4" fill="#e8a4c9"/>`,
    tail: `<path d="M148 128 Q178 118 172 90" fill="none" stroke="#ce82ff" stroke-width="7" stroke-linecap="round"/><path d="M150 132 Q176 126 168 100" fill="none" stroke="#ff8fb0" stroke-width="7" stroke-linecap="round"/>`,
  },
};

function chibiEyes(pose) {
  if (pose === "celebrate") {
    return `
      <path d="M46 78 Q62 62 78 78" stroke="#3c3c3c" stroke-width="6.5" fill="none" stroke-linecap="round"/>
      <path d="M102 78 Q118 62 134 78" stroke="#3c3c3c" stroke-width="6.5" fill="none" stroke-linecap="round"/>
    `;
  }
  if (pose === "sad") {
    return `
      <ellipse cx="62" cy="83" rx="16" ry="17" fill="#fff"/>
      <ellipse cx="118" cy="83" rx="16" ry="17" fill="#fff"/>
      <circle cx="62" cy="89" r="7.5" fill="#3c3c3c"/>
      <circle cx="118" cy="89" r="7.5" fill="#3c3c3c"/>
      <path d="M49 66 Q62 59 74 68" stroke="#3c3c3c" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M106 68 Q118 59 131 66" stroke="#3c3c3c" stroke-width="5" fill="none" stroke-linecap="round"/>
    `;
  }
  return `
    <ellipse cx="62" cy="78" rx="19" ry="21" fill="#fff"/>
    <ellipse cx="118" cy="78" rx="19" ry="21" fill="#fff"/>
    <circle cx="65" cy="81" r="8.5" fill="#3c3c3c"/>
    <circle cx="121" cy="81" r="8.5" fill="#3c3c3c"/>
    <circle cx="68" cy="77" r="2.3" fill="#fff"/>
    <circle cx="124" cy="77" r="2.3" fill="#fff"/>
  `;
}

const CONFETTI_BITS = `
  <circle cx="18" cy="30" r="4" fill="#ffc800"/>
  <circle cx="168" cy="26" r="4" fill="#1cb0f6"/>
  <circle cx="10" cy="70" r="3.5" fill="#ff4b4b"/>
  <circle cx="176" cy="80" r="3.5" fill="#ce82ff"/>
  <rect x="150" y="12" width="7" height="7" fill="#58cc02" transform="rotate(20 150 12)"/>
  <rect x="24" y="12" width="7" height="7" fill="#ff9600" transform="rotate(-15 24 12)"/>
`;

function mascotSvg(pose, capColor, species) {
  const sp = MASCOT_SPECIES[species] || MASCOT_SPECIES.owl;
  const body = `
    <ellipse cx="90" cy="98" rx="62" ry="58" fill="${sp.body}"/>
    <ellipse cx="90" cy="112" rx="40" ry="36" fill="${sp.belly}"/>
    <ellipse cx="32" cy="104" rx="14" ry="25" fill="${sp.limb}" transform="rotate(-18 32 104)"/>
    <ellipse cx="148" cy="104" rx="14" ry="25" fill="${sp.limb}" transform="rotate(18 148 104)"/>
  `;
  const feet = `
    <ellipse cx="72" cy="152" rx="11" ry="6.5" fill="${shadeColor(sp.limb, -8)}"/>
    <ellipse cx="108" cy="152" rx="11" ry="6.5" fill="${shadeColor(sp.limb, -8)}"/>
  `;
  const eyes = chibiEyes(pose);
  const extra = pose === "celebrate" ? CONFETTI_BITS : "";
  return `
  <svg viewBox="0 0 180 170" xmlns="http://www.w3.org/2000/svg">
    ${sp.tail}
    ${feet}
    ${body}
    ${sp.snout}
    ${eyes}
    ${sp.head(capColor)}
    ${extra}
  </svg>`;
}

function mascot(pose, cls, capColor, species) {
  return `<div class="mascot ${cls || ""}">${mascotSvg(pose, capColor, species)}</div>`;
}

// A single original "rock golem" boss monster, distinct from the player's
// own mascot species. Gets angrier (narrower glowing eyes, jagged frown) the
// lower its HP falls - hpPct is 0..1.
function bossSvg(hpPct) {
  const angry = hpPct < 0.4;
  const eyeColor = angry ? "#ff2e2e" : "#ff8a5c";
  const mouth = angry
    ? `<path d="M72 130 L92 118 L108 130 L128 118" stroke="#1c1420" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
    : `<path d="M74 120 Q100 138 126 120" stroke="#1c1420" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <path d="M100 10 L126 38 L156 26 L152 60 L182 78 L154 100 L182 122 L152 140 L156 174 L126 162 L100 190 L74 162 L44 174 L48 140 L18 122 L46 100 L18 78 L48 60 L44 26 L74 38 Z" fill="#362734"/>
    <circle cx="100" cy="100" r="60" fill="#4a3648"/>
    <circle cx="100" cy="100" r="60" fill="none" stroke="#241a26" stroke-width="4"/>
    <ellipse cx="76" cy="90" rx="15" ry="${angry ? 8 : 15}" fill="${eyeColor}"/>
    <ellipse cx="124" cy="90" rx="15" ry="${angry ? 8 : 15}" fill="${eyeColor}"/>
    <circle cx="76" cy="90" r="5" fill="#241a26"/>
    <circle cx="124" cy="90" r="5" fill="#241a26"/>
    ${mouth}
  </svg>`;
}

function shadeColor(hex, percent) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + Math.round((percent / 100) * 255)));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + Math.round((percent / 100) * 255)));
  const b = Math.max(0, Math.min(255, (n & 0xff) + Math.round((percent / 100) * 255)));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
