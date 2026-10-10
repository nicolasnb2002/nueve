import { useMemo, useState } from "react";
import { histogram, HistPanel, LinePanel } from "@/components/charts";
import { Panel, Slider, Stats } from "@/components/ui";
import {
  deflatedSharpe,
  formatNum,
  formatP,
  formatPct,
  kurtosis,
  mean,
  normCdf,
  normInv,
  roughT,
  skewness,
  stdev,
} from "@/lib/math";
import {
  drawdownPath,
  EQUITY,
  HARNESS_SEED,
  leakPaths,
  noiseSharpes,
  nullStudy,
  returnSamples,
  runHarness,
} from "@/lib/sims";

const RULE = `universo: futuros líquidos, front month
señal: signo del retorno a 12 meses, salteando el último mes
sizing: vol target 40% por instrumento, ventana 63 días pasados
ejecución: señal al cierre t, orden en t+1
costo: 1 bp por lado
holdout: últimos 24 meses, una sola lectura
filtro: DSR >= 0,95 con N = trials del ledger`;

function tone(on: boolean): string {
  return on ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm";
}

function DistFig() {
  const samples = useMemo(() => returnSamples(3), []);
  const [which, setWhich] = useState<"normal" | "fat">("fat");
  const xs = which === "fat" ? samples.fat : samples.normal;
  const rows = histogram(
    xs.map((value) => value * 100),
    16,
    1,
  );
  const sk = skewness(xs);
  const ku = kurtosis(xs);
  return (
    <Panel title="Dos curvas, mismos ejes">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={tone(which === "normal")} onClick={() => setWhich("normal")}>
          Campana
        </button>
        <button type="button" className={tone(which === "fat")} onClick={() => setWhich("fat")}>
          Colas gordas
        </button>
      </div>
      <HistPanel rows={rows} />
      <Stats
        items={[
          { k: "Media mensual", v: formatPct(mean(xs), 2) },
          { k: "Vol anualizada", v: formatPct(stdev(xs) * Math.sqrt(12), 1) },
          { k: "Asimetría", v: formatNum(sk, 2) },
          { k: "Curtosis", v: formatNum(ku, 1) },
        ]}
      />
      <p className="text-sm text-muted">
        {which === "fat"
          ? "La curtosis está por encima de 3 y la asimetría es negativa: la cola izquierda es la que duele. Una normal con esta media y esta vol casi no imprime esos meses."
          : "Curtosis cerca de 3 y asimetría cerca de 0. Esta es la campana que el Sharpe da por sentada. El mercado de al lado no se parece."}
      </p>
    </Panel>
  );
}

function DdFig() {
  const stats = useMemo(() => drawdownPath(EQUITY), []);
  const peak = EQUITY.map((_, index) => {
    let hi = EQUITY[0];
    for (let i = 0; i <= index; i++) hi = Math.max(hi, EQUITY[i]);
    return hi;
  });
  const underwater =
    stats.recoveryI < 0 ? "no recupera en la muestra" : `${stats.recoveryI - stats.maxPeakI} meses`;
  return (
    <Panel title="Del pico al valle">
      <LinePanel
        series={[
          { name: "Curva", values: EQUITY, tone: "fg" },
          { name: "Pico", values: peak, tone: "mark" },
        ]}
      />
      <p className="text-sm text-muted">Línea clara: la curva. Línea de acero: el pico vigente.</p>
      <Stats
        items={[
          { k: "MaxDD", v: formatPct(stats.maxDd, 1) },
          { k: "Pico", v: String(EQUITY[stats.maxPeakI]) },
          { k: "Valle", v: String(EQUITY[stats.maxTroughI]) },
          { k: "Bajo el agua", v: underwater },
        ]}
      />
    </Panel>
  );
}

function LeakFig() {
  const paths = useMemo(() => leakPaths(5), []);
  return (
    <Panel title="La misma señal, dos relojes">
      <LinePanel
        series={[
          { name: "Misma barra", values: paths.cheat, tone: "fg" },
          { name: "t+1", values: paths.honest, tone: "mark" },
        ]}
      />
      <p className="text-sm text-muted">
        PnL acumulado. La línea clara opera el signo contra el mismo retorno: cobra el valor absoluto. La de
        acero usa el signo de ayer. Sobre este ruido, la que podías mandar al mercado no tiene historia.
      </p>
    </Panel>
  );
}

function SplitsFig() {
  const [peeked, setPeeked] = useState(false);
  const cells = [
    { name: "In-sample", note: "Diseñás. Está contaminado." },
    { name: "Validación", note: "Elegís entre pocas reglas. Igual es un trial." },
    peeked
      ? { name: "Gastado", note: "Lo miraste y cambiaste la regla. Ya no es holdout." }
      : { name: "Holdout", note: "Una lectura. Todavía virgen." },
  ];
  return (
    <Panel title="Tres tramos">
      <div className="grid gap-3 sm:grid-cols-3">
        {cells.map((cell, index) => (
          <div key={cell.name} className="rounded-lg border border-line bg-bg p-3">
            <p className="kicker">0{index + 1}</p>
            <p className="mt-2 font-serif text-xl">{cell.name}</p>
            <p className="mt-2 text-sm text-muted">{cell.note}</p>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-ghost" onClick={() => setPeeked((value) => !value)}>
        {peeked ? "Reiniciar el ejemplo" : "Miré el holdout y cambié el lookback"}
      </button>
      <p className="text-sm text-muted">
        {peeked
          ? "En el widget podés volver atrás. En una investigación, no: ese tramo ya votó."
          : "El tercer bloque sigue cerrado. Tocá el botón y fijate cómo cambia de nombre."}
      </p>
    </Panel>
  );
}

function WfaFig() {
  const [step, setStep] = useState(0);
  const years = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const test = 5 + step;
  return (
    <Panel title="Una ventana que no mira el test">
      <div className="grid grid-cols-5 gap-2">
        {years.map((year) => {
          const role = year < test ? "train" : year === test ? "test" : "future";
          const cls =
            role === "test"
              ? "bg-fg text-bg"
              : role === "train"
                ? "bg-elevated text-fg"
                : "border border-line text-faint";
          return (
            <div key={year} className={`flex min-h-11 items-center justify-center rounded-lg text-sm ${cls}`}>
              {year}
            </div>
          );
        })}
      </div>
      <p className="text-sm text-muted">
        Años en bloque: entrenamiento. El año en claro es el test: no vota el parámetro. El resto todavía no
        entra. Ahora el test es el año {test}.
      </p>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => setStep((value) => (value + 1) % 5)}
      >
        Correr la ventana
      </button>
    </Panel>
  );
}

function SnoopFig() {
  const [n, setN] = useState(300);
  const [seed, setSeed] = useState(4);
  const sharpes = useMemo(() => noiseSharpes(n, seed), [n, seed]);
  const best = Math.max(...sharpes);
  return (
    <Panel title="Concurso sobre ruido">
      <Slider label="Variantes" min={20} max={300} step={10} value={n} display={String(n)} onChange={setN} />
      <HistPanel rows={histogram(sharpes, 16, 1, best)} />
      <Stats
        items={[
          { k: "Mejor Sharpe", v: formatNum(best, 2) },
          { k: "Mediana", v: formatNum([...sharpes].sort((a, b) => a - b)[Math.floor(sharpes.length / 2)], 2) },
        ]}
      />
      <p className="text-sm text-muted">
        Ninguna tiene edge. La barra clara es el ganador que te quedarías. Ese número no se replica: es el
        máximo de {n} estimaciones ruidosas.
      </p>
      <button type="button" className="btn btn-ghost" onClick={() => setSeed((value) => value + 1)}>
        Otro sorteo
      </button>
    </Panel>
  );
}

function NormalCurve({ z }: { z: number }) {
  const width = 320;
  const height = 150;
  const xs = Array.from({ length: 97 }, (_, index) => -4 + (8 * index) / 96);
  const yOf = (x: number) => Math.exp(-0.5 * x * x);
  const X = (x: number) => ((x + 4) / 8) * width;
  const Y = (y: number) => 16 + (1 - y) * (height - 36);
  const line = xs
    .map((x, index) => `${index ? "L" : "M"}${X(x).toFixed(1)},${Y(yOf(x)).toFixed(1)}`)
    .join(" ");
  const tailFrom = Math.min(4, Math.max(-4, z));
  const tail = xs.filter((x) => x >= tailFrom);
  const shade = [
    `M${X(tailFrom).toFixed(1)},${Y(0).toFixed(1)}`,
    ...tail.map((x) => `L${X(x).toFixed(1)},${Y(yOf(x)).toFixed(1)}`),
    `L${X(4).toFixed(1)},${Y(0).toFixed(1)} Z`,
  ].join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Campana normal con la cola derecha sombreada">
      <path d={shade} fill="var(--color-mark)" opacity={0.45} />
      <path d={line} fill="none" stroke="var(--color-fg)" strokeWidth={1.6} />
      <line x1={X(tailFrom)} x2={X(tailFrom)} y1={18} y2={Y(0)} stroke="var(--color-mark)" />
    </svg>
  );
}

function PvalFig() {
  const [z, setZ] = useState(2.65);
  const one = 1 - normCdf(z);
  const two = 2 * one;
  return (
    <Panel title="Qué está diciendo el p">
      <NormalCurve z={z} />
      <Slider label="Estadístico z" min={0} max={4} step={0.01} value={z} display={formatNum(z, 2)} onChange={setZ} />
      <Stats
        items={[
          { k: "p unilateral", v: formatP(one) },
          { k: "p bilateral", v: formatP(two) },
        ]}
      />
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setZ(normInv(0.996))}>
          p bilateral = 0,008
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setZ(normInv(0.992))}>
          p unilateral = 0,008
        </button>
      </div>
      <p className="text-sm text-muted">
        El área sombreada es la cola. p = 0,008 no es «99,2% de chance de que sea verdad». Es la frecuencia de
        una cola así, si la nula es cierta y este fue el único test.
      </p>
    </Panel>
  );
}

function NullsFig() {
  const [mode, setMode] = useState<"sign" | "permute" | "bootstrap">("sign");
  const [edged, setEdged] = useState(true);
  const [seed, setSeed] = useState(8);
  const study = useMemo(() => nullStudy(mode, seed, edged), [mode, seed, edged]);
  return (
    <Panel title="Tres máquinas">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={tone(mode === "sign")} onClick={() => setMode("sign")}>
          Sign-flip
        </button>
        <button type="button" className={tone(mode === "permute")} onClick={() => setMode("permute")}>
          Permutar
        </button>
        <button type="button" className={tone(mode === "bootstrap")} onClick={() => setMode("bootstrap")}>
          Bootstrap
        </button>
      </div>
      <HistPanel rows={histogram(study.nulls, 18, 1, study.observed)} />
      <Stats
        items={
          mode === "bootstrap"
            ? [
                { k: "Sharpe observado", v: formatNum(study.observed, 2) },
                { k: "Banda 5%", v: formatNum(study.lo, 2) },
                { k: "Banda 95%", v: formatNum(study.hi, 2) },
              ]
            : [
                { k: "Sharpe observado", v: formatNum(study.observed, 2) },
                { k: "p empírico", v: formatP(study.p) },
              ]
        }
      />
      <p className="text-sm text-muted">{study.note}</p>
      <p className="text-sm text-muted">
        {edged
          ? "Hay edge plantado: la señal ve el signo del mismo mes el 62% de las veces. Es un look-ahead a propósito, para que la máquina tenga algo que detectar."
          : "La señal es una moneda. Si el test está sano, el observado no debería ser raro."}
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEdged((value) => !value)}>
          {edged ? "Sacar el edge" : "Devolver el edge"}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSeed((value) => value + 1)}>
          Otra semilla
        </button>
      </div>
    </Panel>
  );
}

function LedgerFig() {
  const catalog = [
    { id: "lb9", name: "Lookback 9, después de ver el 12" },
    { id: "nocost", name: "La misma, sin costos" },
    { id: "only", name: "Solo el equity index, el resto no" },
    { id: "skip", name: "Sacar 2020 de la muestra" },
  ];
  const [named, setNamed] = useState<string[]>([]);
  const [extra, setExtra] = useState(0);
  const n = 1 + named.length + extra;
  const result = deflatedSharpe({
    sharpeAnnual: 1,
    years: 10,
    periodsPerYear: 12,
    nTrials: n,
    skew: 0,
    kurtosis: 3,
  });
  const fwer = 1 - 0.95 ** n;
  return (
    <Panel title="El ledger, no la shortlist">
      <ul className="space-y-2 text-sm">
        <li>1. Regla base, escrita antes de mirar</li>
        {named.map((id, index) => (
          <li key={id}>
            {index + 2}. {catalog.find((item) => item.id === id)?.name}
          </li>
        ))}
        {extra > 0 ? <li>Más {extra} variantes que tiraste y no iban al informe.</li> : null}
      </ul>
      <Stats
        items={[
          { k: "N", v: String(n) },
          { k: "Falso pase, 5%", v: formatPct(fwer, 0) },
          { k: "SR₀ anual", v: formatNum(result.sr0Annual, 2) },
          { k: "DSR de un Sharpe 1", v: result.ok ? formatPct(result.probability, 1) : "—" },
        ]}
      />
      <p className="text-sm text-muted">
        El backtest ganador sigue en Sharpe 1, diez años, mensual, normal. Lo único que cambia es cuántos
        intentos admitís. El corte de casa, 0,95, {result.ok && result.probability >= 0.95 ? "todavía se sostiene." : "ya no se sostiene."}
      </p>
      <div className="flex flex-wrap gap-2">
        {catalog.map((item) => (
          <button
            key={item.id}
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={named.includes(item.id)}
            onClick={() => setNamed((current) => [...current, item.id])}
          >
            Anotar: {item.name}
          </button>
        ))}
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setExtra((value) => value + 1)}>
          Sumar un intento anónimo
        </button>
      </div>
    </Panel>
  );
}

function DsrFig() {
  const [sharpe, setSharpe] = useState(1);
  const [years, setYears] = useState(10);
  const [n, setN] = useState(1);
  const [skew, setSkew] = useState(0);
  const [kurt, setKurt] = useState(3);
  const [freq, setFreq] = useState<1 | 12 | 252>(12);
  const result = deflatedSharpe({
    sharpeAnnual: sharpe,
    years,
    periodsPerYear: freq,
    nTrials: n,
    skew,
    kurtosis: kurt,
  });
  const apply = (next: {
    sharpe: number;
    years: number;
    n: number;
    skew: number;
    kurt: number;
    freq: 1 | 12 | 252;
  }) => {
    setSharpe(next.sharpe);
    setYears(next.years);
    setN(next.n);
    setSkew(next.skew);
    setKurt(next.kurt);
    setFreq(next.freq);
  };
  return (
    <Panel title="El filtro, con las unidades a la vista">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={tone(freq === 12)} onClick={() => setFreq(12)}>
          Mensual
        </button>
        <button type="button" className={tone(freq === 252)} onClick={() => setFreq(252)}>
          Diaria
        </button>
        <button type="button" className={tone(freq === 1)} onClick={() => setFreq(1)}>
          Anual
        </button>
      </div>
      <Slider label="Sharpe anual" min={0} max={2.5} step={0.05} value={sharpe} display={formatNum(sharpe, 2)} onChange={setSharpe} />
      <Slider label="Años" min={2} max={40} step={1} value={years} display={String(years)} onChange={setYears} />
      <Slider label="N de trials" min={1} max={300} step={1} value={n} display={String(n)} onChange={setN} />
      <Slider label="Asimetría" min={-1.5} max={1.5} step={0.1} value={skew} display={formatNum(skew, 1)} onChange={setSkew} />
      <Slider label="Curtosis" min={2} max={15} step={0.5} value={kurt} display={formatNum(kurt, 1)} onChange={setKurt} />
      {result.ok ? (
        <Stats
          items={[
            { k: "SR del período", v: formatNum(result.srPeriod, 3) },
            { k: "SR₀ anual", v: formatNum(result.sr0Annual, 2) },
            { k: "z", v: formatNum(result.z, 2) },
            { k: "DSR", v: formatPct(result.probability, 1) },
          ]}
        />
      ) : (
        <p className="text-sm text-fail">{result.reason}</p>
      )}
      <p className="text-sm text-muted">
        {n <= 1
          ? "N = 1: no hubo búsqueda. El obstáculo es cero y esto es el Sharpe probabilístico contra nada."
          : `SR₀ es el Sharpe anualizado que el mejor de ${n} intentos sin habilidad suele mostrar.`}
        {result.ok
          ? result.probability >= 0.95
            ? " Con el corte 0,95, este histórico pasaría."
            : " Con el corte 0,95, este histórico no pasa."
          : ""}
        {freq === 12
          ? " En meses, la curtosis mueve poco: el Sharpe del mes es chico."
          : freq === 1
            ? " Frecuencia anual: solo vale si de verdad tenés un retorno por año."
            : " No reutilices la curtosis mensual en datos diarios: no es el mismo número."}
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => apply({ sharpe: 1, years: 10, n: 1, skew: 0, kurt: 3, freq: 12 })}>
          Un solo intento
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => apply({ sharpe: 1, years: 10, n: 100, skew: 0, kurt: 3, freq: 12 })}>
          Cien variantes
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => apply({ sharpe: 1, years: 7, n: 20, skew: -0.5, kurt: 7, freq: 12 })}>
          Siete años, N = 20
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => apply({ sharpe: 1, years: 15, n: 10, skew: 0, kurt: 3, freq: 1 })}>
          15 años, normal
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => apply({ sharpe: 1, years: 15, n: 10, skew: -0.8, kurt: 8, freq: 1 })}>
          15 años, colas
        </button>
      </div>
    </Panel>
  );
}

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function HashFig() {
  const [text, setText] = useState(RULE);
  const [frozen, setFrozen] = useState<string | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const same = frozen !== null && text === frozen;
  return (
    <Panel title="Congelar el texto">
      <label className="field block">
        <span className="mb-2 block text-sm text-muted">La regla, no la motivación</span>
        <textarea value={text} onChange={(event) => setText(event.target.value)} spellCheck={false} />
      </label>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          void sha256(text).then((value) => {
            setFrozen(text);
            setHash(value);
          });
        }}
      >
        Congelar y hashear
      </button>
      {hash ? (
        <>
          <p className="font-mono text-xs break-all text-fg">{hash}</p>
          <p className={same ? "text-sm text-pass" : "text-sm text-fail"}>
            {same
              ? "El texto coincide con la huella. Eso no lo hace verdadero: lo hace inmóvil."
              : "El texto ya no coincide. Esto es una versión nueva, no un edit silencioso. El intento anterior sigue en el ledger."}
          </p>
        </>
      ) : (
        <p className="text-sm text-muted">Cambiá una coma después de congelar y la huella deja de coincidir.</p>
      )}
    </Panel>
  );
}

function RollFig() {
  return (
    <Panel title="El gap no es tuyo">
      <div className="sheet-wrap">
        <table className="sheet">
          <thead>
            <tr>
              <th>Momento</th>
              <th>Marzo</th>
              <th>Junio crudo</th>
              <th>Junio −4</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>t0</td>
              <td>100</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>t1</td>
              <td>104</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Roll</td>
              <td>vendés 104</td>
              <td>comprás 108</td>
              <td>la serie queda en 104</td>
            </tr>
            <tr>
              <td>t2</td>
              <td></td>
              <td>110</td>
              <td>106</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Stats
        items={[
          { k: "PnL del marzo", v: "+4" },
          { k: "Fantasma del empalme", v: "+3,8%" },
          { k: "PnL honesto en t2", v: "+2" },
          { k: "Carry del long", v: "negativo" },
        ]}
      />
      <p className="text-sm text-muted">
        108 contra 104 es contango en el tramo. El long que rolea paga esa pendiente. No se la suma otra vez si
        el continuo ya incluye el roll.
      </p>
    </Panel>
  );
}

function SignalsFig() {
  const [contango, setContango] = useState(true);
  const far = contango ? 86 : 74;
  const carry = 80 / far - 1;
  const path = [100, 101, 99, 103, 102, 106, 105, 108, 107, 110, 112, 111, 114];
  return (
    <Panel title="Dos signos, un mercado">
      <LinePanel series={[{ name: "Precio", values: path, tone: "fg" }]} />
      <Stats
        items={[
          { k: "12 meses, sin el último", v: "+11%" },
          { k: "Tendencia", v: "Long" },
          { k: "Front / diferido", v: `80 / ${far}` },
          { k: "Carry del long", v: formatPct(carry, 1) },
        ]}
      />
      <p className="text-sm text-muted">
        {contango
          ? "La tendencia dice long. La curva está en contango: el carry dice short. No se promedian después de ver cuál ganó."
          : "Ahora el diferido está más barato. Backwardation: el carry del long es positivo y coincide con la tendencia. Sigue siendo otra apuesta."}
      </p>
      <button type="button" className="btn btn-ghost" onClick={() => setContango((value) => !value)}>
        {contango ? "Pasar a backwardation" : "Volver a contango"}
      </button>
    </Panel>
  );
}

function VoltFig() {
  const [same, setSame] = useState(true);
  const esVol = 0.16;
  const clVol = 0.32;
  const target = 0.4;
  const wEs = same ? 1 : target / esVol;
  const wCl = same ? 1 : target / clVol;
  const rEs = wEs * esVol;
  const rCl = wCl * clVol;
  const max = Math.max(rEs, rCl);
  return (
    <Panel title="Mismo nocional contra misma voz">
      <div className="space-y-3">
        {[
          { name: "Equity index", risk: rEs, weight: wEs },
          { name: "Crudo", risk: rCl, weight: wCl },
        ].map((item) => (
          <div key={item.name}>
            <div className="mb-1 flex items-baseline justify-between text-sm">
              <span>{item.name}</span>
              <span className="font-mono tabular-nums">
                peso {formatNum(item.weight, 2)} · riesgo {formatPct(item.risk, 0)}
              </span>
            </div>
            <div className="h-2 bg-elevated">
              <div className="h-full bg-mark" style={{ width: `${(item.risk / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted">
        {same
          ? "Mismo nocional: el crudo aporta el doble de riesgo. El test se vuelve un test de crudo con un invitado."
          : "Vol target 40%: pesos 2,50 y 1,25. Cada mercado aporta la misma volatilidad. El libro, si se alinean, puede pasar ese 40%."}
      </p>
      <button type="button" className="btn btn-ghost" onClick={() => setSame((value) => !value)}>
        {same ? "Igualar volatilidad al 40%" : "Volver al mismo nocional"}
      </button>
    </Panel>
  );
}

function CostFig() {
  const [gross, setGross] = useState(0.55);
  const [vol, setVol] = useState(0.4);
  const [turns, setTurns] = useState(200);
  const [bps, setBps] = useState(4);
  const cost = (turns * bps) / 10000;
  const drag = vol === 0 ? 0 : cost / vol;
  const net = gross - drag;
  return (
    <Panel title="De bruto a neto">
      <Slider label="Sharpe bruto" min={0} max={2} step={0.05} value={gross} display={formatNum(gross, 2)} onChange={setGross} />
      <Slider label="Vol del libro" min={0.05} max={0.8} step={0.05} value={vol} display={formatPct(vol, 0)} onChange={setVol} />
      <Slider label="Vueltas de un lado" min={1} max={300} step={1} value={turns} display={String(turns)} onChange={setTurns} />
      <Slider label="Costo por vuelta, bp" min={0.5} max={10} step={0.5} value={bps} display={formatNum(bps, 1)} onChange={setBps} />
      <Stats
        items={[
          { k: "Costo anual", v: formatPct(cost, 2) },
          { k: "Arrastre", v: formatNum(drag, 2) },
          { k: "Sharpe neto", v: formatNum(net, 2) },
        ]}
      />
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setTurns(200); setBps(4); setVol(0.4); setGross(0.55); }}>
          Rápida, 4 bp
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setTurns(12); setBps(1); setVol(0.4); setGross(0.55); }}>
          Futuros, lenta
        </button>
      </div>
      <p className="text-sm text-muted">Al filtro entra el neto. Un pase bruto es el de otra estrategia, más barata de lo que el mercado cobra.</p>
    </Panel>
  );
}

function FwdFig() {
  const [tweaked, setTweaked] = useState(false);
  return (
    <Panel title="El tramo que no existía">
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg bg-elevated p-3">
          <p className="kicker">Ya existía</p>
          <p className="mt-2 text-sm">Histórico. Acá vive el pase, si es que vive.</p>
        </div>
        <div className={`rounded-lg p-3 ${tweaked ? "border border-fail" : "bg-fg text-bg"}`}>
          <p className="kicker">{tweaked ? "Gastado" : "Congelado"}</p>
          <p className="mt-2 text-sm">
            {tweaked ? "El forward feo sigue contando. N pasó a 2." : "Desde esta fecha, la regla no se toca."}
          </p>
        </div>
        <div className="rounded-lg border border-line p-3">
          <p className="kicker">Todavía no</p>
          <p className="mt-2 text-sm text-muted">
            {tweaked ? "Reloj nuevo. No borra el anterior." : "Papel: señal y fill de t+1, en el momento."}
          </p>
        </div>
      </div>
      <button type="button" className="btn btn-ghost" onClick={() => setTweaked((value) => !value)}>
        {tweaked ? "Reiniciar el ejemplo" : "Salió mal y cambio la regla"}
      </button>
    </Panel>
  );
}

function PowerFig() {
  const [sharpe, setSharpe] = useState(0.7);
  const [years, setYears] = useState(7);
  const t = roughT(sharpe, years);
  const need = sharpe > 0 ? (2 / sharpe) ** 2 : Infinity;
  const read =
    t < 1.6
      ? "Ni un test ingenuo, único y normal, lo separa del ruido."
      : t < 2
        ? "Débil. Al lado del 2, que es la memoria del 5% bilateral, y eso sin descontar N."
        : "Un test aislado empezaría a creerlo. Todavía no descontaste la búsqueda, las colas ni los costos.";
  return (
    <Panel title="t ≈ Sharpe × √años">
      <Slider label="Sharpe anual" min={0.1} max={2} step={0.05} value={sharpe} display={formatNum(sharpe, 2)} onChange={setSharpe} />
      <Slider label="Años" min={1} max={40} step={1} value={years} display={String(years)} onChange={setYears} />
      <Stats
        items={[
          { k: "t", v: formatNum(t, 2) },
          { k: "Años para t ≈ 2", v: Number.isFinite(need) ? formatNum(need, 1) : "—" },
        ]}
      />
      <p className="text-sm text-muted">{read}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setSharpe(0.7); setYears(7); }}>
          Cripto, 7 años, 0,7
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setSharpe(0.5); setYears(30); }}>
          Futuros, 30 años, 0,5
        </button>
      </div>
    </Panel>
  );
}

function HarnessFig() {
  const [seed, setSeed] = useState(HARNESS_SEED);
  const report = useMemo(() => runHarness(seed), [seed]);
  return (
    <Panel title="Antes de creerle al botón">
      <Stats
        items={[
          { k: "Sharpe plantado", v: formatNum(report.plantedSharpe, 2) },
          { k: "p de la plantada", v: formatP(report.plantedP) },
          { k: "DSR plantada, N=1", v: formatPct(report.plantedDsr, 1) },
          { k: "Semilla", v: String(report.seed) },
        ]}
      />
      <p>
        Test ingenuo, p menor que 0,05: la plantada {report.plantedNaive ? "pasa" : "no pasa"}. De las 50 sin edge,
        pasan {report.nullNaive}.
      </p>
      <p>
        Filtro, DSR ≥ 0,95 y N = 50 en las nulas: la plantada {report.plantedFilter ? "pasa" : "no pasa"}. De
        las 50, pasan {report.nullFilter}.
      </p>
      <p className="text-sm text-muted">
        El motor de esta fase tiene que ver el edge que plantaste y no firmar el ruido. Si una semilla deja
        pasar un nulo, la barra todavía no sirve: no se corre la tendencia encima.
      </p>
      <button type="button" className="btn btn-ghost" onClick={() => setSeed((value) => value + 1)}>
        Otra semilla
      </button>
    </Panel>
  );
}

export function Figure({ id }: { id: string }) {
  switch (id) {
    case "dist":
      return <DistFig />;
    case "dd":
      return <DdFig />;
    case "leak":
      return <LeakFig />;
    case "splits":
      return <SplitsFig />;
    case "wfa":
      return <WfaFig />;
    case "snoop":
      return <SnoopFig />;
    case "pval":
      return <PvalFig />;
    case "nulls":
      return <NullsFig />;
    case "ledger":
      return <LedgerFig />;
    case "dsr":
      return <DsrFig />;
    case "hash":
      return <HashFig />;
    case "roll":
      return <RollFig />;
    case "signals":
      return <SignalsFig />;
    case "volt":
      return <VoltFig />;
    case "cost":
      return <CostFig />;
    case "fwd":
      return <FwdFig />;
    case "power":
      return <PowerFig />;
    case "harness":
      return <HarnessFig />;
    default:
      return null;
  }
}
