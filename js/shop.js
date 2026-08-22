// Shop: spend Xu (earned from finishing lessons/boss rounds + missions) on
// alternate mascot characters, UI color themes, and functional consumables.

const SHOP_ITEMS = [
  { id: "mascot_cat", type: "mascot", name: "Mèo Cam", price: 60, species: "cat" },
  { id: "mascot_fox", type: "mascot", name: "Cáo Lửa", price: 60, species: "fox" },
  { id: "mascot_bear", type: "mascot", name: "Gấu Nâu", price: 80, species: "bear" },
  { id: "mascot_dragon", type: "mascot", name: "Rồng Nhí", price: 100, species: "dragon" },
  { id: "mascot_rabbit", type: "mascot", name: "Thỏ Hoàng Gia", price: 90, species: "rabbit" },
  { id: "mascot_cookie", type: "mascot", name: "Bánh Quy", price: 80, species: "cookie" },
  { id: "mascot_panda", type: "mascot", name: "Gấu Trúc", price: 70, species: "panda" },
  { id: "mascot_penguin", type: "mascot", name: "Cánh Cụt", price: 70, species: "penguin" },
  { id: "mascot_unicorn", type: "mascot", name: "Kỳ Lân", price: 110, species: "unicorn" },
  { id: "theme_sunset", type: "theme", name: "Giao diện Hoàng hôn", price: 60, green: "#ff9600", blue: "#ff4b4b" },
  { id: "theme_ocean", type: "theme", name: "Giao diện Đại dương", price: 60, green: "#1cb0f6", blue: "#2b70c9" },
  { id: "theme_forest", type: "theme", name: "Giao diện Rừng xanh", price: 60, green: "#2b9348", blue: "#58cc02" },
  { id: "theme_sakura", type: "theme", name: "Giao diện Hoa anh đào", price: 70, green: "#ff8fb0", blue: "#ff6f9c" },
  { id: "theme_royal", type: "theme", name: "Giao diện Hoàng gia", price: 70, green: "#ce82ff", blue: "#7b4fd6" },
  { id: "theme_mint", type: "theme", name: "Giao diện Bạc hà", price: 70, green: "#2bd6a8", blue: "#1cb0f6" },
  { id: "streak_freeze", type: "consumable", name: "Bảo vệ chuỗi", desc: "Giữ chuỗi ngày nếu lỡ quên học 1 ngày", price: 50, icon: "snowflake" },
  { id: "max_heart", type: "upgrade", name: "Tăng tối đa tim", desc: "Có thêm 1 tim mỗi khi vào bài học", icon: "heart" },
];

const MAX_HEART_BASE_PRICE = 60;
const MAX_HEART_PRICE_STEP = 40;

function maxHeartPrice(s) {
  return MAX_HEART_BASE_PRICE + (s.maxHeartsBonus || 0) * MAX_HEART_PRICE_STEP;
}

function ownsItem(s, itemId) {
  return !!s.owned[itemId];
}

function buyItem(s, itemId) {
  const item = SHOP_ITEMS.find((i) => i.id === itemId);
  if (!item) return { ok: false, reason: "notfound" };
  if (item.type === "upgrade") {
    if ((s.maxHeartsBonus || 0) >= MAX_HEARTS_BONUS_CAP) return { ok: false, reason: "maxed" };
    const price = maxHeartPrice(s);
    if (s.currency < price) return { ok: false, reason: "poor" };
    s.currency -= price;
    s.maxHeartsBonus = (s.maxHeartsBonus || 0) + 1;
    return { ok: true, item };
  }
  if (item.type !== "consumable" && ownsItem(s, itemId)) return { ok: false, reason: "owned" };
  if (s.currency < item.price) return { ok: false, reason: "poor" };
  s.currency -= item.price;
  if (item.type === "consumable") {
    if (item.id === "streak_freeze") s.streakFreezes += 1;
  } else {
    s.owned[itemId] = true;
    if (item.type === "mascot") s.equipped.mascot = itemId;
    if (item.type === "theme") s.equipped.theme = itemId;
  }
  return { ok: true, item };
}

function equipItem(s, itemId) {
  const item = SHOP_ITEMS.find((i) => i.id === itemId);
  if (!item || !ownsItem(s, itemId)) return;
  if (item.type === "mascot") s.equipped.mascot = s.equipped.mascot === itemId ? null : itemId;
  if (item.type === "theme") s.equipped.theme = s.equipped.theme === itemId ? null : itemId;
}

// "owl" is the free default look, always available without owning anything.
function currentMascotSpecies(s) {
  if (!s.equipped.mascot) return "owl";
  const item = SHOP_ITEMS.find((i) => i.id === s.equipped.mascot);
  return item ? item.species : "owl";
}

function applyTheme(s) {
  const root = document.documentElement;
  if (s.equipped.theme) {
    const item = SHOP_ITEMS.find((i) => i.id === s.equipped.theme);
    if (item) {
      root.style.setProperty("--green", item.green);
      root.style.setProperty("--green-dark", shadeColor(item.green, -12));
      root.style.setProperty("--blue", item.blue);
      root.style.setProperty("--blue-dark", shadeColor(item.blue, -12));
      return;
    }
  }
  root.style.removeProperty("--green");
  root.style.removeProperty("--green-dark");
  root.style.removeProperty("--blue");
  root.style.removeProperty("--blue-dark");
}
