import {
  deflatedSharpe,
  gauss,
  kurtosis,
  mulberry32,
  normCdf,
  sharpeAnnual,
  skewness,
  tStat,
} from "@/lib/math";

export const EQUITY: number[] = [
  100, 103, 108, 112, 118, 124, 131, 138, 142, 136, 128, 119, 110, 104, 99, 103,
  111, 120, 128, 135, 140, 146,
];

export function drawdownPath(equity: number[]) {
  let peak = equity[0];
  let peakI = 0;
  let maxDd = 0;
  let maxPeakI = 0;
  let maxTroughI = 0;
  const underwater = equity.map((v, i) => {
    if (v >= peak) {
      peak = v;
      peakI = i;
    }
    const dd = peak === 0 ? 0 : (peak - v) / peak;
    if (dd > maxDd) {
      maxDd = dd;
      maxPeakI = peakI;
      maxTroughI = i;
    }
    return -dd;
  });
  let recoveryI = -1;
  const peakLevel = equity[maxPeakI];
  for (let i = maxTroughI; i < equity.length; i++) {
    if (equity[i] >= peakLevel) {
      recoveryI = i;
      break;
    }
  }
  return { maxDd, maxPeakI, maxTroughI, recoveryI, underwater, peakLevel };
}

export function returnSamples(seed: number) {
  const rng = mulberry32(seed);
  const normal: number[] = [];
  const fat: number[] = [];
  for (let i = 0; i < 240; i++) {
    normal.push(0.006 + 0.04 * gauss(rng));
    const shock = rng() < 0.06;
    const jump = shock ? -Math.abs(0.11 * gauss(rng)) - 0.04 : 0;
    fat.push(0.008 + (shock ? 0.02 : 0.035) * gauss(rng) + jump);
  }
  return { normal, fat };
}

export function leakPaths(seed: number) {
  const rng = mulberry32(seed);
  const r = Array.from({ length: 180 }, () => 0.008 * gauss(rng));
  const cheat: number[] = [0];
  const honest: number[] = [0];
  for (let t = 1; t < r.length; t++) {
    const signNow = Math.sign(r[t]) || 1;
    const signPrev = Math.sign(r[t - 1]) || 1;
    cheat.push(cheat[t - 1] + signNow * r[t]);
    honest.push(honest[t - 1] + signPrev * r[t]);
  }
  return { cheat, honest };
}

export function noiseSharpes(n: number, seed: number, months = 120): number[] {
  const rng = mulberry32(seed);
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const rs = Array.from({ length: months }, () => 0.04 * gauss(rng));
    out.push(sharpeAnnual(rs, 12));
  }
  return out;
}

function strategyPnl(seed: number, edged: boolean) {
  const rng = mulberry32(seed);
  const months = 180;
  const market = Array.from({ length: months }, () => 0.04 * gauss(rng));
  const signal: number[] = [];
  for (let t = 0; t < months; t++) {
    if (!edged) {
      signal.push(rng() < 0.5 ? 1 : -1);
    } else if (rng() < 0.62) {
      signal.push(Math.sign(market[t]) || 1);
    } else {
      signal.push(rng() < 0.5 ? 1 : -1);
    }
  }
  const pnl = market.map((m, i) => signal[i] * m);
  return { market, signal, pnl };
}

function empiricalP(observed: number, nulls: number[]): number {
  let beat = 0;
  for (const v of nulls) if (v >= observed) beat++;
  return (1 + beat) / (nulls.length + 1);
}

export type NullStudy = {
  observed: number;
  nulls: number[];
  p: number;
  lo: number;
  hi: number;
  note: string;
};

export function nullStudy(
  mode: "sign" | "permute" | "bootstrap",
  seed: number,
  edged: boolean,
): NullStudy {
  const { market, signal, pnl } = strategyPnl(seed, edged);
  const observed = sharpeAnnual(pnl, 12);
  const reps = 800;
  const nulls: number[] = [];
  const rng = mulberry32(seed + 17);
  if (mode === "sign") {
    for (let i = 0; i < reps; i++) {
      const flipped = pnl.map((x) => (rng() < 0.5 ? x : -x));
      nulls.push(sharpeAnnual(flipped, 12));
    }
    return {
      observed,
      nulls,
      p: empiricalP(observed, nulls),
      lo: 0,
      hi: 0,
      note: "Sign-flip: cada retorno de la estrategia cambia de signo al azar. La pregunta es si la media se distingue de cero.",
    };
  }
  if (mode === "permute") {
    for (let i = 0; i < reps; i++) {
      const idx = market.map((_, j) => j);
      for (let j = idx.length - 1; j > 0; j--) {
        const k = Math.floor(rng() * (j + 1));
        const tmp = idx[j];
        idx[j] = idx[k];
        idx[k] = tmp;
      }
      const shuffled = idx.map((j, t) => signal[t] * market[j]);
      nulls.push(sharpeAnnual(shuffled, 12));
    }
    return {
      observed,
      nulls,
      p: empiricalP(observed, nulls),
      lo: 0,
      hi: 0,
      note: "Permutación: el mercado y la señal siguen existiendo, pero se rompe el calendario que los une. La pregunta es si el timing importaba.",
    };
  }
  for (let i = 0; i < reps; i++) {
    const sample = Array.from({ length: pnl.length }, () => pnl[Math.floor(rng() * pnl.length)]);
    nulls.push(sharpeAnnual(sample, 12));
  }
  const sorted = [...nulls].sort((a, b) => a - b);
  const lo = sorted[Math.floor(0.05 * sorted.length)];
  const hi = sorted[Math.floor(0.95 * sorted.length)];
  return {
    observed,
    nulls,
    p: empiricalP(0, nulls.map((v) => v - observed)),
    lo,
    hi,
    note: "Bootstrap: se remuestrea tu propia serie. El centro sigue siendo tu Sharpe. Es un rango de incertidumbre, no un mundo sin edge.",
  };
}

export type HarnessReport = {
  seed: number;
  plantedSharpe: number;
  plantedP: number;
  plantedDsr: number;
  plantedNaive: boolean;
  plantedFilter: boolean;
  nullNaive: number;
  nullFilter: number;
  nulls: number;
};

export const HARNESS_SEED = 11;

export function runHarness(seed = HARNESS_SEED): HarnessReport {
  const rng = mulberry32(seed);
  const years = 30;
  const months = years * 12;
  const vol = 0.04;
  const monthlyMean = (1 / Math.sqrt(12)) * vol;
  const planted = Array.from({ length: months }, () => monthlyMean + vol * gauss(rng));
  const nullSeries = Array.from({ length: 50 }, () =>
    Array.from({ length: months }, () => vol * gauss(rng)),
  );
  const pOf = (rs: number[]) => 1 - normCdf(tStat(rs));
  const plantedSharpe = sharpeAnnual(planted, 12);
  const plantedP = pOf(planted);
  const plantedDsr = deflatedSharpe({
    sharpeAnnual: plantedSharpe,
    years,
    periodsPerYear: 12,
    nTrials: 1,
    skew: skewness(planted),
    kurtosis: kurtosis(planted),
  });
  let nullNaive = 0;
  let nullFilter = 0;
  for (const rs of nullSeries) {
    if (pOf(rs) < 0.05) nullNaive++;
    const d = deflatedSharpe({
      sharpeAnnual: sharpeAnnual(rs, 12),
      years,
      periodsPerYear: 12,
      nTrials: 50,
      skew: skewness(rs),
      kurtosis: kurtosis(rs),
    });
    if (d.ok && d.probability >= 0.95) nullFilter++;
  }
  return {
    seed,
    plantedSharpe,
    plantedP,
    plantedDsr: plantedDsr.probability,
    plantedNaive: plantedP < 0.05,
    plantedFilter: plantedDsr.ok && plantedDsr.probability >= 0.95,
    nullNaive,
    nullFilter,
    nulls: 50,
  };
}
