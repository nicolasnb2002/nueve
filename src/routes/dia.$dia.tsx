import { createFileRoute, Link } from "@tanstack/react-router";
import { conceptsForDay, formatSpan, getDay } from "@/data/curriculum";
import { Missing } from "@/components/ui";
import { Shell } from "@/components/shell";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/dia/$dia")({ component: DayPage });

function DayPage() {
  const { dia } = Route.useParams();
  const day = getDay(Number(dia));
  const passed = useProgress((state) => state.passed);
  if (!day || String(day.n) !== dia) {
    return (
      <Shell>
        <Missing />
      </Shell>
    );
  }
  const items = conceptsForDay(day.n);

  return (
    <Shell>
      <p className="kicker mt-8">
        Día {String(day.n).padStart(2, "0")} · {formatSpan(day.minutes)}
      </p>
      <h1 className="mt-3 font-serif text-4xl leading-tight">{day.title}</h1>
      <p className="mt-4">{day.aim}</p>
      <p className="note mt-6">Al cerrar el día tendrías que poder decir: {day.say}</p>
      <ol className="mt-8 space-y-4">
        {items.map((concept) => (
          <li key={concept.id}>
            <Link to="/concepto/$id" params={{ id: concept.id }} className="panel link-row block">
              <p className="kicker">Concepto {concept.id}</p>
              <p className="link-title mt-2 font-serif text-2xl">{concept.title}</p>
              <p className="mt-2 text-sm text-muted">
                {concept.minutes} min{passed[concept.id] ? " · Listo" : ""}
              </p>
            </Link>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-sm text-muted">
        Dos sentadas. El cuestionario entra en la hora, no es un extra. Pará entre una y la otra.
      </p>
      <Link to="/" className="btn btn-ghost mt-6">
        Índice
      </Link>
    </Shell>
  );
}
