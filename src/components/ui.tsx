import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel space-y-4">
      <h3 className="font-serif text-xl">{title}</h3>
      {children}
    </section>
  );
}

export function Stats({ items }: { items: { k: string; v: string }[] }) {
  return (
    <dl className={items.length > 3 ? "stat-grid cols-4" : "stat-grid"}>
      {items.map((item) => (
        <div key={item.k}>
          <dt>{item.k}</dt>
          <dd>{item.v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  display: string;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-mono text-fg tabular-nums">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

export function Missing() {
  return (
    <div className="py-16">
      <h1 className="font-serif text-3xl">Esa página no está en el recorrido.</h1>
      <Link to="/" className="btn btn-primary mt-6">
        Volver al índice
      </Link>
    </div>
  );
}
