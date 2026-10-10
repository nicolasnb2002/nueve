/** Normal helpers and the Deflated Sharpe Ratio (Bailey & López de Prado, 2014). */

export const EULER = 0.5772156649015329;

export function mean(xs: number[]): number {
  let s = 0;
  for (const x of xs) s += x;
  return s / xs.length;
}

/** Sample standard deviation (n − 1). */
export function stdev(xs: number[]): number {
  const m = mean(xs);
  let v = 0;
  for (const x of xs) v += (x - m) ** 2;
  return Math.sqrt(v / (xs.length - 1));
}

/** Population skewness. Positive = longer right tail. */
export function skewness(xs: number[]): number {
  const m = mean(xs);
  const n = xs.length;
  let m2 = 0;
  let m3 = 0;
  for (const x of xs) {
    const d = x - m;
    m2 += d * d;
    m3 += d * d * d;
  }
  m2 /= n;
  m3 /= n;
  return m3 / m2 ** 1.5;
}

/** Population raw kurtosis. A normal distribution is 3. */
export function kurtosis(xs: number[]): number {
  const m = mean(xs);
  const n = xs.length;
  let m2 = 0;
  let m4 = 0;
  for (const x of xs) {
    const d = x - m;
    const d2 = d * d;
    m2 += d2;
    m4 += d2 * d2;
  }
  m2 /= n;
  m4 /= n;
  return m4 / (m2 * m2);
}

/** Abramowitz & Stegun erf-based CDF. */
export function normCdf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * ax);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const erf =
    1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return 0.5 * (1 + sign * erf);
}

/** Acklam's rational approximation of the inverse standard normal CDF. */
export function normInv(p: number): number {
  if (!(p > 0 && p < 1)) throw new Error("normInv domain");
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416,
  ];
  const plow = 0.02425;
  const phigh = 1 - plow;
  if (p < plow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
  if (p > phigh) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -(
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
  const q = p - 0.5;
  const r = q * q;
  return (
    ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
    (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
  );
}

export type DsrInput = {
  sharpeAnnual: number;
  years: number;
  periodsPerYear: number;
  nTrials: number;
  skew: number;
  kurtosis: number;
};

export type DsrResult = {
  ok: boolean;
  reason?: string;
  periods: number;
  srPeriod: number;
  sr0Period: number;
  sr0Annual: number;
  z: number;
  probability: number;
};

/**
 * Deflated Sharpe Ratio.
 *
 * SR and T are per-period. The hurdle SR0 uses the simple null variance
 * 1/(T−1) — the spread of a zero-skill Sharpe — not the cross-sectional
 * variance of a saved trial ledger. Non-normality enters the PSR denominator
 * on the observed Sharpe. N = 1 collapses SR0 to 0 (ordinary PSR vs zero).
 */
export function deflatedSharpe(input: DsrInput): DsrResult {
  const periods = Math.round(input.years * input.periodsPerYear);
  const fail = (reason: string): DsrResult => ({
    ok: false,
    reason,
    periods,
    srPeriod: 0,
    sr0Period: 0,
    sr0Annual: 0,
    z: 0,
    probability: 0,
  });
  if (periods < 8) return fail("Hace falta más historia para esta aproximación.");
  if (input.nTrials < 1) return fail("N tiene que ser al menos 1.");
  const srPeriod = input.sharpeAnnual / Math.sqrt(input.periodsPerYear);
  let sr0Period = 0;
  if (input.nTrials > 1) {
    const n = input.nTrials;
    const factor =
      (1 - EULER) * normInv(1 - 1 / n) + EULER * normInv(1 - 1 / (n * Math.E));
    sr0Period = Math.sqrt(1 / (periods - 1)) * factor;
  }
  const inside =
    1 -
    input.skew * srPeriod +
    ((input.kurtosis - 1) / 4) * srPeriod * srPeriod;
  if (!(inside > 0)) {
    return fail("Esos parámetros rompen la aproximación (el denominador no es real).");
  }
  const z = ((srPeriod - sr0Period) * Math.sqrt(periods - 1)) / Math.sqrt(inside);
  return {
    ok: true,
    periods,
    srPeriod,
    sr0Period,
    sr0Annual: sr0Period * Math.sqrt(input.periodsPerYear),
    z,
    probability: normCdf(z),
  };
}

/** Rule of thumb: t ≈ Sharpe_anual × √años. Frequency cancels under iid. */
export function roughT(sharpeAnnual: number, years: number): number {
  return sharpeAnnual * Math.sqrt(years);
}

export function sharpeAnnual(rs: number[], periodsPerYear: number): number {
  if (rs.length < 3) return 0;
  const s = stdev(rs);
  if (s === 0) return 0;
  return (mean(rs) / s) * Math.sqrt(periodsPerYear);
}

export function tStat(rs: number[]): number {
  if (rs.length < 3) return 0;
  const s = stdev(rs);
  if (s === 0) return 0;
  return (mean(rs) / s) * Math.sqrt(rs.length);
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function gauss(rng: () => number): number {
  const u = Math.max(rng(), 1e-12);
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function formatPct(x: number, digits = 1): string {
  return `${(x * 100).toFixed(digits).replace(".", ",")}%`;
}

export function formatNum(x: number, digits = 2): string {
  return x.toFixed(digits).replace(".", ",");
}

export function formatP(p: number): string {
  if (p < 0.0001) return "< 0,0001";
  if (p < 0.001) return p.toFixed(4).replace(".", ",");
  return p.toFixed(3).replace(".", ",");
}
