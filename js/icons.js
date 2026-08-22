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
};

function icon(name, cls) {
  return `<span class="${cls || ""}">${ICONS[name]}</span>`;
}

// Original owl-with-graduation-cap mascot ("Cú Thông Thái" / the wise owl),
// hand-drawn in flat SVG shapes - not affiliated with any brand's mascot.
function mascotSvg(pose, capColor) {
  const cap1 = capColor || "#2b2b45";
  const cap2 = shadeColor(cap1, -25);
  const eyesWave = `
    <ellipse cx="62" cy="78" rx="17" ry="19" fill="#fff"/>
    <ellipse cx="118" cy="78" rx="17" ry="19" fill="#fff"/>
    <circle cx="65" cy="80" r="7.5" fill="#3c3c3c"/>
    <circle cx="121" cy="80" r="7.5" fill="#3c3c3c"/>
    <circle cx="67" cy="77" r="2" fill="#fff"/>
    <circle cx="123" cy="77" r="2" fill="#fff"/>
  `;
  const eyesHappy = `
    <path d="M48 76 Q62 62 76 76" stroke="#3c3c3c" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M104 76 Q118 62 132 76" stroke="#3c3c3c" stroke-width="6" fill="none" stroke-linecap="round"/>
  `;
  const eyesSad = `
    <ellipse cx="62" cy="82" rx="15" ry="16" fill="#fff"/>
    <ellipse cx="118" cy="82" rx="15" ry="16" fill="#fff"/>
    <circle cx="62" cy="87" r="7" fill="#3c3c3c"/>
    <circle cx="118" cy="87" r="7" fill="#3c3c3c"/>
    <path d="M50 64 Q62 58 72 66" stroke="#3c3c3c" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M108 66 Q118 58 130 64" stroke="#3c3c3c" stroke-width="5" fill="none" stroke-linecap="round"/>
  `;
  const beak = `<path d="M90 92 L102 108 L78 108 Z" fill="#ff9600"/>`;
  const body = `
    <ellipse cx="90" cy="95" rx="58" ry="62" fill="#58cc02"/>
    <ellipse cx="90" cy="108" rx="38" ry="40" fill="#8ee050"/>
    <ellipse cx="34" cy="100" rx="14" ry="26" fill="#4caf00" transform="rotate(-18 34 100)"/>
    <ellipse cx="146" cy="100" rx="14" ry="26" fill="#4caf00" transform="rotate(18 146 100)"/>
  `;
  const cap = `
    <path d="M40 40 L90 20 L140 40 L90 58 Z" fill="${cap1}"/>
    <path d="M90 58 L90 42 L112 34 L112 52 Z" fill="${cap2}"/>
    <line x1="140" y1="40" x2="140" y2="60" stroke="${cap1}" stroke-width="4"/>
    <circle cx="140" cy="62" r="4" fill="#ffc800"/>
  `;
  const feet = `
    <ellipse cx="72" cy="150" rx="10" ry="6" fill="#ff9600"/>
    <ellipse cx="108" cy="150" rx="10" ry="6" fill="#ff9600"/>
  `;
  const confettiBits = `
    <circle cx="18" cy="30" r="4" fill="#ffc800"/>
    <circle cx="168" cy="26" r="4" fill="#1cb0f6"/>
    <circle cx="10" cy="70" r="3.5" fill="#ff4b4b"/>
    <circle cx="176" cy="80" r="3.5" fill="#ce82ff"/>
    <rect x="150" y="12" width="7" height="7" fill="#58cc02" transform="rotate(20 150 12)"/>
    <rect x="24" y="12" width="7" height="7" fill="#ff9600" transform="rotate(-15 24 12)"/>
  `;
  let eyes = eyesWave;
  let extra = "";
  if (pose === "celebrate") {
    eyes = eyesHappy;
    extra = confettiBits;
  } else if (pose === "sad") {
    eyes = eyesSad;
  }
  return `
  <svg viewBox="0 0 180 165" xmlns="http://www.w3.org/2000/svg">
    ${feet}
    ${body}
    ${beak}
    ${eyes}
    ${cap}
    ${extra}
  </svg>`;
}

function mascot(pose, cls, capColor) {
  return `<div class="mascot ${cls || ""}">${mascotSvg(pose, capColor)}</div>`;
}

function shadeColor(hex, percent) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + Math.round((percent / 100) * 255)));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + Math.round((percent / 100) * 255)));
  const b = Math.max(0, Math.min(255, (n & 0xff) + Math.round((percent / 100) * 255)));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
