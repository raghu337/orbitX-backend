import satelliteService from './satelliteService';

// Predict passes by stepping forward and detecting elevation peaks.
export async function predictPassesForTLE(tleLines, observer, hours = 24, stepSec = 30) {
  const results = [];
  if (!tleLines) return results;
  const now = Date.now();
  let inPass = false;
  let passStart = null;
  let maxElevation = -Infinity;
  for (let t = now; t < now + hours * 3600 * 1000; t += stepSec * 1000) {
    const state = satelliteService.computeStateFromTLE(tleLines, new Date(t), observer);
    if (!state) continue;
    const elev = state.elevation || 0;
    if (!inPass && elev > 5) {
      inPass = true;
      passStart = t;
      maxElevation = elev;
    }
    if (inPass) {
      maxElevation = Math.max(maxElevation, elev);
      if (elev <= 1) {
        const passEnd = t;
        results.push({ start: new Date(passStart).toISOString(), end: new Date(passEnd).toISOString(), maxElevation });
        inPass = false;
        passStart = null;
        maxElevation = -Infinity;
      }
    }
  }
  return results;
}

export default { predictPassesForTLE };
