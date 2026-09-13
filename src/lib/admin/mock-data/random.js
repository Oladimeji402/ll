/**
 * Deterministic pseudo-random helpers so the seed mock data is stable
 * across reloads/hot-reloads (a real backend would obviously not need
 * this) instead of reshuffling every time a module re-evaluates.
 */
function mulberry32(seed) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRng(seed = 42) {
  const rand = mulberry32(seed);
  return {
    next: rand,
    int(min, max) {
      return Math.floor(rand() * (max - min + 1)) + min;
    },
    float(min, max, digits = 2) {
      const value = rand() * (max - min) + min;
      return Number(value.toFixed(digits));
    },
    bool(probability = 0.5) {
      return rand() < probability;
    },
    item(arr) {
      return arr[Math.floor(rand() * arr.length)];
    },
    items(arr, count) {
      const pool = [...arr];
      const picked = [];
      for (let i = 0; i < count && pool.length; i++) {
        const idx = Math.floor(rand() * pool.length);
        picked.push(pool.splice(idx, 1)[0]);
      }
      return picked;
    },
    daysAgo(maxDays, minDays = 0) {
      const days = this.float(minDays, maxDays, 4);
      return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    },
  };
}
