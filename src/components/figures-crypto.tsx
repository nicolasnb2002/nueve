import { useState } from "react";
import { Panel, Slider, Stats } from "@/components/ui";

const ASKS: [number, number][] = [
  [100.1, 4],
  [100.2, 6],
  [100.4, 10],
];
const BIDS: [number, number][] = [
  [99.9, 5],
  [99.8, 8],
  [99.5, 10],
];
const MID = (ASKS[0][0] + BIDS[0][0]) / 2;
const TAKER = 0.001;
const BNB = 0.25;

const es = (x: number, d = 2) =>
  x.toLocaleString("es-AR", { minimumFractionDigits: d, maximumFractionDigits: d });

function sweep(levels: [number, number][], qty: number) {
  let left = qty;
  let cost = 0;
  const used: number[] = [];
  for (const [p, q] of levels) {
    const take = Math.min(q, left);
    used.push(take);
    cost += take * p;
    left -= take;
  }
  const filled = qty - Math.max(left, 0);
  return { cost, avg: filled > 0 ? cost / filled : 0, used, filled };
}

function BookSvg({ buyQty = 0 }: { buyQty?: number }) {
  const used = sweep(ASKS, buyQty).used;
  const rows = [...ASKS].reverse().map(([p, q], i) => ({ p, q, side: "ask" as const, eaten: used[ASKS.length - 1 - i] ?? 0 }));
  const all = [...rows, ...BIDS.map(([p, q]) => ({ p, q, side: "bid" as const, eaten: 0 }))];
  const W = 320;
  const H = 22;
  return (
    <svg viewBox={`0 0 ${W} ${all.length * H + 24}`} className="w-full" role="img" aria-label="Libro de órdenes">
      {all.map((r, i) => {
        const y = i * H + (r.side === "bid" ? 24 : 0);
        const w = (r.q / 10) * 180;
        const we = (r.eaten / 10) * 180;
        return (
          <g key={r.p}>
            <text x={0} y={y + 15} fill="var(--color-muted)" fontSize="12" fontFamily="monospace">
              {es(r.p)}
            </text>
            <rect x={70} y={y + 3} width={w} height={H - 6} fill={r.side === "ask" ? "var(--color-fail)" : "var(--color-pass)"} opacity={0.5} />
            {we > 0 ? <rect x={70} y={y + 3} width={we} height={H - 6} fill="var(--color-mark)" /> : null}
            <text x={76 + w} y={y + 15} fill="var(--color-fg)" fontSize="12">
              {r.q}
            </text>
          </g>
        );
      })}
      <text x={70} y={ASKS.length * H + 16} fill="var(--color-mark)" fontSize="12">
        mid {es(MID)} · spread {es(ASKS[0][0] - BIDS[0][0])}
      </text>
    </svg>
  );
}

function BookFig() {
  return (
    <Panel title="El libro, dibujado">
      <BookSvg />
      <p className="text-sm text-muted">Rojo: venden (asks). Verde: compran (bids). Largo de la barra: cantidad.</p>
    </Panel>
  );
}

function FeesFig() {
  const [trades, setTrades] = useState(20);
  const [bnb, setBnb] = useState(false);
  const rate = TAKER * (bnb ? 1 - BNB : 1);
  const month = trades * 2 * 500 * rate;
  const year = (1 - Math.pow(1 - month / 500, 12)) * 100;
  return (
    <Panel title="Cuenta de 500 USDT, todo taker">
      <Slider label="Idas y vueltas por mes" min={1} max={60} step={1} value={trades} onChange={setTrades} display={String(trades)} />
      <button type="button" className={bnb ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"} onClick={() => setBnb(!bnb)}>
        {bnb ? "Con BNB (−25 %)" : "Sin BNB"}
      </button>
      <Stats
        items={[
          { k: "Tasa", v: `${es(rate * 100, 3)} %` },
          { k: "Por mes", v: `${es(month)} USDT` },
          { k: "% de la cuenta / mes", v: `${es((month / 500) * 100, 1)} %` },
          { k: "12 meses", v: `${es(Math.min(year, 100), 1)} %` },
        ]}
      />
    </Panel>
  );
}

function SlipFig() {
  const [qty, setQty] = useState(8);
  const r = sweep(ASKS, qty);
  return (
    <Panel title="Compra de mercado: cuánto del libro te comés">
      <Slider label="Unidades" min={1} max={20} step={1} value={qty} onChange={setQty} display={String(qty)} />
      <BookSvg buyQty={qty} />
      <Stats
        items={[
          { k: "Promedio", v: es(r.avg) },
          { k: "vs mejor ask", v: `${es(((r.avg - ASKS[0][0]) / ASKS[0][0]) * 1e4, 1)} bps` },
          { k: "vs mid", v: `${es(((r.avg - MID) / MID) * 1e4, 0)} bps` },
          { k: "Comisión taker", v: `${es(r.cost * TAKER, 4)}` },
        ]}
      />
    </Panel>
  );
}

function LiqFig() {
  const [lev, setLev] = useState(10);
  const mm = 0.005;
  const drop = Math.max(1 / lev - mm, 0);
  const pts = Array.from({ length: 49 }, (_, i) => i + 2).map((L) => [L, Math.max(1 / L - mm, 0) * 100] as const);
  const W = 320;
  const H = 140;
  const x = (L: number) => 30 + ((L - 1) / 49) * (W - 40);
  const y = (d: number) => 10 + (1 - d / 50) * (H - 30);
  return (
    <Panel title="Caída hasta la liquidación (modelo simple)">
      <Slider label="Apalancamiento" min={1} max={50} step={1} value={lev} onChange={setLev} display={`${lev}x`} />
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Caída hasta liquidación según apalancamiento">
        <polyline fill="none" stroke="var(--color-mark)" strokeWidth={2} points={pts.map(([L, d]) => `${x(L)},${y(d)}`).join(" ")} />
        <circle cx={x(lev)} cy={y(Math.min(drop * 100, 50))} r={4} fill="var(--color-fail)" />
        <text x={2} y={y(50) + 4} fontSize="10" fill="var(--color-muted)">50%</text>
        <text x={2} y={y(0) + 4} fontSize="10" fill="var(--color-muted)">0%</text>
        <text x={x(1)} y={H - 4} fontSize="10" fill="var(--color-muted)">1x</text>
        <text x={x(50) - 16} y={H - 4} fontSize="10" fill="var(--color-muted)">50x</text>
      </svg>
      <Stats
        items={[
          { k: "Caída que liquida", v: lev === 1 ? "sin liquidación" : `${es(drop * 100, 1)} %` },
          { k: "Posición con 100 USDT", v: `${es(100 * lev, 0)} USDT` },
        ]}
      />
    </Panel>
  );
}

export function CryptoFigure({ id }: { id: string }) {
  switch (id) {
    case "book":
      return <BookFig />;
    case "fees":
      return <FeesFig />;
    case "slip":
      return <SlipFig />;
    case "liq":
      return <LiqFig />;
    default:
      return null;
  }
}
