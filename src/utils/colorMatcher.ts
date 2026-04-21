import type { BeadColor } from '../types';

export function buildMatcher(palette: BeadColor[]) {
  return function findNearest(r: number, g: number, b: number): BeadColor {
    let best = palette[0];
    let bestDist = Infinity;
    for (const color of palette) {
      const dr = r - color.r;
      const dg = g - color.g;
      const db = b - color.b;
      const dist = dr * dr + dg * dg + db * db;
      if (dist < bestDist) {
        bestDist = dist;
        best = color;
      }
    }
    return best;
  };
}
