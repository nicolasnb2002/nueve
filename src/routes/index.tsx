import { createFileRoute, Link } from "@tanstack/react-router";
import { conceptCount, concepts, conceptsForDay, dayCount, days, formatSpan, totalMinutes } from "@/data/curriculum";
import { Shell } from "@/components/shell";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const passed = useProgress((state) => state.passed);
  const done = concepts.filter((concept) => passed[concept.id]).length;
  const next = concepts.find((concept) => !passed[concept.id]);

  return (
    <Shell>
      <div className="pt-8">
        <p className="kicker">
          {conceptCount} conceptos · {dayCount} días · {formatSpan(totalMinutes)}
        </p>
        <h1 className="mt-3 font-serif text-5xl leading-none tracking-tight">Nueve</h1>
        <p className="mt-5 text-lg text-muted">
          Cómo saber si una estrategia de inversión funciona de verdad o solo parece, y cómo operar cripto
          sin regalar plata en costos. Pensado para estudiantes y para cualquiera que arranque de cero: dos
          conceptos por día, cada uno con la idea en criollo, un ejemplo con números chicos y un cuestionario corto.
        </p>
        <p className="mt-4 border-l-2 border-line pl-3 text-sm text-muted" role="note">
          Contenido educativo. No es asesoramiento financiero ni recomendación de inversión.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {next ? (
            <Link to="/concepto/$id" params={{ id: next.id }} className="btn btn-primary">
              {done === 0 ? "Empezar" : "Continuar"} · {next.title}
            </Link>
          ) : (
            <Link to="/cierre" className="btn btn-primary">
              Volver al veredicto
            </Link>
          )}
          <Link to="/glosario" className="btn btn-ghost">
            Glosario
          </Link>
        </div>
        <div
          className="mt-5 h-1 bg-elevated"
          role="progressbar"
          aria-valuenow={done}
          aria-valuemin={0}
          aria-valuemax={conceptCount}
          aria-label="Conceptos entendidos"
        >
          <div className="h-full bg-mark" style={{ width: `${(done / conceptCount) * 100}%` }} />
        </div>
        <p className="mt-2 text-sm text-muted">{done} de {conceptCount} entendidos. Hace falta acertar 3 de 4.</p>
      </div>

      <ol className="mt-10">
        {days.map((day) => {
          const items = conceptsForDay(day.n);
          const ready = items.every((concept) => passed[concept.id]);
          return (
            <li key={day.n} className="border-t border-line py-6">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-serif text-2xl">
                  <Link to="/dia/$dia" params={{ dia: String(day.n) }} className="link-title">
                    {String(day.n).padStart(2, "0")}
                    <span className="text-muted"> · </span>
                    {day.title}
                  </Link>
                </h2>
                <p className={ready ? "shrink-0 text-sm text-pass" : "shrink-0 text-sm text-muted"}>
                  {ready ? "Listo" : formatSpan(day.minutes)}
                </p>
              </div>
              <ol className="mt-2">
                {items.map((concept) => (
                  <li key={concept.id}>
                    <Link
                      to="/concepto/$id"
                      params={{ id: concept.id }}
                      className="link-row flex items-baseline justify-between gap-4 py-2"
                    >
                      <span className="link-title">
                        {concept.n}. {concept.title}
                      </span>
                      <span className={passed[concept.id] ? "shrink-0 text-sm text-pass" : "shrink-0 text-sm text-muted"}>
                        {passed[concept.id] ? "Listo" : `${concept.minutes} min`}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </li>
          );
        })}
      </ol>

      <div className="border-t border-line py-6">
        <Link to="/cierre" className="link-row inline-flex py-2">
          <span className="link-title font-serif text-xl">La frase del final</span>
        </Link>
        <p className="text-sm text-muted">Mejor después del día 9 (los días 10 y 11 son la parte práctica de cripto). Se puede leer antes: no es un secreto, es el punto.</p>
      </div>
    </Shell>
  );
}
