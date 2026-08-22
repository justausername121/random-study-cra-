// Shop: spend Xu (earned from finishing lessons/boss rounds + missions) on
// cosmetic mascot caps, UI color themes, and functional consumables.

const SHOP_ITEMS = [
  { id: "cap_red", type: "cap", name: "Mũ đỏ", price: 40, color: "#ff4b4b" },
  { id: "cap_blue", type: "cap", name: "Mũ xanh dương", price: 40, color: "#1cb0f6" },
  { id: "cap_purple", type: "cap", name: "Mũ tím", price: 40, color: "#ce82ff" },
  { id: "cap_gold", type: "cap", name: "Mũ vàng kim", price: 80, color: "#ffc800" },
  { id: "theme_sunset", type: "theme", name: "Giao diện Hoàng hôn", price: 60, green: "#ff9600", blue: "#ff4b4b" },
  { id: "theme_ocean", type: "theme", name: "Giao diện Đại dương", price: 60, green: "#1cb0f6", blue: "#2b70c9" },
  { id: "theme_forest", type: "theme", name: "Giao diện Rừng xanh", price: 60, green: "#2b9348", blue: "#58cc02" },
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
    if (item.type === "cap") s.equipped.cap = itemId;
    if (item.type === "theme") s.equipped.theme = itemId;
  }
  return { ok: true, item };
}

function equipItem(s, itemId) {
  const item = SHOP_ITEMS.find((i) => i.id === itemId);
  if (!item || !ownsItem(s, itemId)) return;
  if (item.type === "cap") s.equipped.cap = s.equipped.cap === itemId ? null : itemId;
  if (item.type === "theme") s.equipped.theme = s.equipped.theme === itemId ? null : itemId;
}

function currentCapColor(s) {
  if (!s.equipped.cap) return null;
  const item = SHOP_ITEMS.find((i) => i.id === s.equipped.cap);
  return item ? item.color : null;
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
