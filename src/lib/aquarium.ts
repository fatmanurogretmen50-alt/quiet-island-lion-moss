export const FISH_SRC = Array.from(
  { length: 12 },
  (_, i) => `/fish/fish-${i}.png`,
);

export const STORAGE_KEY = "sinif-akvaryumu-clean-fish-v6";

export type Fish = {
  id: number;
  name: string;
  type: number;
  points: number;
  x: number;
  y: number;
};

export const DEFAULT_FISH: Fish[] = [
  { id: 1, name: "Ali", type: 0, points: 8, x: 7, y: 25 },
  { id: 2, name: "Elif", type: 1, points: 12, x: 28, y: 21 },
  { id: 3, name: "Mert", type: 2, points: 5, x: 49, y: 31 },
  { id: 4, name: "Ayşe", type: 3, points: 10, x: 67, y: 24 },
];

export function fishSrc(type: number) {
  const i =
    Number.isInteger(Number(type)) && Number(type) >= 0 && Number(type) < FISH_SRC.length
      ? Number(type)
      : 0;
  return FISH_SRC[i];
}

export function normalizeFish(raw: unknown, fallbackId: number): Fish | null {
  if (!raw || typeof raw !== "object") return null;
  const f = raw as Record<string, unknown>;
  const name = typeof f.name === "string" ? f.name.trim().slice(0, 18) : "";
  if (!name) return null;
  const typeNum = Number(f.type);
  const type =
    Number.isInteger(typeNum) && typeNum >= 0 && typeNum < FISH_SRC.length ? typeNum : 0;
  const id = Number(f.id);
  return {
    id: Number.isFinite(id) && id > 0 ? id : fallbackId,
    name,
    type,
    points: Math.max(0, Number(f.points) || 0),
    x: clampNum(Number(f.x), 6, 76, 20),
    y: clampNum(Number(f.y), 12, 68, 30),
  };
}

function clampNum(n: number, min: number, max: number, fallback: number) {
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export function loadFish(): Fish[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as unknown;
    if (!Array.isArray(parsed)) return DEFAULT_FISH.map((f) => ({ ...f }));
    const out: Fish[] = [];
    let i = 1;
    for (const item of parsed) {
      const f = normalizeFish(item, i);
      if (f) {
        out.push(f);
        i = Math.max(i, f.id + 1);
      }
    }
    return out.length ? out : DEFAULT_FISH.map((f) => ({ ...f }));
  } catch {
    return DEFAULT_FISH.map((f) => ({ ...f }));
  }
}

export function saveFish(fishes: Fish[]) {
  const payload = fishes.map(({ id, name, type, points, x, y }) => ({
    id,
    name,
    type,
    points,
    x,
    y,
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export type SwimHandle = {
  vx: number;
  vy: number;
};

export function startSwim(
  fish: Fish,
  el: HTMLElement,
  art: HTMLElement,
  allFish: () => Fish[],
): () => void {
  const speed0 = 1.15 + Math.random() * 0.85;
  let vx = (Math.random() < 0.5 ? -1 : 1) * speed0;
  let vy = (Math.random() - 0.5) * 0.22;
  let turnTimer = 1.5 + Math.random() * 3.5;
  let phase = Math.random() * Math.PI * 2;
  let last = performance.now();
  let raf = 0;
  let stopped = false;

  function bounds() {
    const main = el.closest(".aq-main") as HTMLElement | null;
    if (!main) {
      return { minX: 4, maxX: 78, minY: 12, maxY: 70 };
    }
    const side = main.querySelector(".aq-side") as HTMLElement | null;
    const bottom = main.querySelector(".aq-bottom") as HTMLElement | null;
    const w = Math.max(1, main.clientWidth);
    const h = Math.max(1, main.clientHeight);
    const fishW = el.offsetWidth || 150;
    const fishH = el.offsetHeight || 110;
    let rightReserve = 16;
    if (
      side &&
      getComputedStyle(side).display !== "none" &&
      getComputedStyle(side).position === "absolute"
    ) {
      rightReserve = side.offsetWidth + 28;
    }
    let bottomReserve = 24;
    if (bottom && getComputedStyle(bottom).position === "absolute") {
      bottomReserve = bottom.offsetHeight + 28;
    }
    const maxX = Math.max(10, ((w - fishW - rightReserve) / w) * 100);
    const maxY = Math.max(16, ((h - fishH - bottomReserve) / h) * 100);
    return { minX: 2, maxX, minY: 10, maxY };
  }

  function frame(now: number) {
    if (stopped || !el.isConnected) return;

    const { minX, maxX, minY, maxY } = bounds();
    const dt = Math.min(0.032, Math.max(0.008, (now - last) / 1000));
    last = now;
    phase += dt * 2.1;

    turnTimer -= dt;
    if (turnTimer <= 0) {
      const a = (Math.random() - 0.5) * 0.7;
      const c = Math.cos(a);
      const s = Math.sin(a);
      const nvx = vx * c - vy * s;
      const nvy = vx * s + vy * c;
      vx = nvx;
      vy = nvy;
      turnTimer = 2.5 + Math.random() * 4.5;
    }

    let avoidX = 0;
    let avoidY = 0;
    for (const o of allFish()) {
      if (o === fish || typeof o.x !== "number") continue;
      const dx = fish.x - o.x;
      const dy = fish.y - o.y;
      const d = Math.hypot(dx, dy);
      if (d > 0 && d < 11) {
        const strength = (11 - d) / 11;
        avoidX += (dx / d) * strength;
        avoidY += (dy / d) * strength;
      }
    }

    if (fish.x < minX + 7) avoidX += 0.65;
    if (fish.x > maxX - 7) avoidX -= 0.65;
    if (fish.y < minY + 7) avoidY += 0.45;
    if (fish.y > maxY - 7) avoidY -= 0.45;

    vx += avoidX * dt * 0.75;
    vy += avoidY * dt * 0.55;
    vy += Math.sin(phase * 0.75) * 0.025;

    const minSpeed = 0.85;
    const maxSpeed = 2.25;
    const sp = Math.hypot(vx, vy);
    if (sp < minSpeed) {
      const a = Math.atan2(vy, vx);
      vx = Math.cos(a) * minSpeed;
      vy = Math.sin(a) * minSpeed;
    } else if (sp > maxSpeed) {
      vx *= maxSpeed / sp;
      vy *= maxSpeed / sp;
    }

    fish.x += vx * dt;
    fish.y += vy * dt;

    if (fish.x <= minX) {
      fish.x = minX;
      vx = Math.abs(vx) + 0.12;
    }
    if (fish.x >= maxX) {
      fish.x = maxX;
      vx = -Math.abs(vx) - 0.12;
    }
    if (fish.y <= minY) {
      fish.y = minY;
      vy = Math.abs(vy) + 0.08;
    }
    if (fish.y >= maxY) {
      fish.y = maxY;
      vy = -Math.abs(vy) - 0.08;
    }

    el.style.left = `${fish.x}%`;
    el.style.top = `${fish.y}%`;

    const right = vx >= 0;
    const tilt = Math.max(-6, Math.min(6, (vy / vx) * 3 || 0));
    const bob = Math.sin(phase) * 1.0;
    art.style.transform = `translateY(${bob}px) scaleX(${right ? 1 : -1}) rotate(${tilt}deg)`;

    raf = requestAnimationFrame(frame);
  }

  raf = requestAnimationFrame(frame);
  return () => {
    stopped = true;
    cancelAnimationFrame(raf);
  };
}
