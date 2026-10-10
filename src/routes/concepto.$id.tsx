import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getConcept, getDay, nextConcept, prevConcept } from "@/data/curriculum";
import { Blocks } from "@/components/blocks";
import { Quiz } from "@/components/quiz";
import { Shell } from "@/components/shell";
import { Missing } from "@/components/ui";

export const Route = createFileRoute("/concepto/$id")({ component: ConceptPage });

function ConceptPage() {
  const { id } = Route.useParams();
  const concept = getConcept(id);
  const day = concept ? getDay(concept.day) : undefined;

  useEffect(() => {
    if (concept) document.title = `${concept.title} · Nueve`;
    return () => {
      document.title = "Nueve";
    };
  }, [concept]);

  if (!concept || !day) {
    return (
      <Shell>
        <Missing />
      </Shell>
    );
  }

  const prev = prevConcept(concept.id);
  const next = nextConcept(concept.id);

  return (
    <Shell>
      <p className="kicker mt-8">
        Día {day.n} · Concepto {concept.id} · {concept.minutes} min
      </p>
      <h1 className="mt-3 font-serif text-4xl leading-tight">{concept.title}</h1>
      <p className="mt-4 font-serif text-xl text-muted italic">{concept.promise}</p>
      <div className="mt-8">
        <Blocks blocks={concept.blocks} />
      </div>
      <div className="mt-12 border-t border-line pt-8">
        <Quiz conceptId={concept.id} questions={concept.questions} />
      </div>
      <nav className="mt-10 flex flex-wrap gap-3">
        {prev ? (
          <Link to="/concepto/$id" params={{ id: prev.id }} className="btn btn-ghost">
            Anterior
          </Link>
        ) : null}
        {next ? (
          <Link to="/concepto/$id" params={{ id: next.id }} className="btn btn-primary">
            Siguiente
          </Link>
        ) : (
          <Link to="/cierre" className="btn btn-primary">
            El veredicto
          </Link>
        )}
        <Link to="/dia/$dia" params={{ dia: String(concept.day) }} className="btn btn-ghost">
          Día {concept.day}
        </Link>
      </nav>
    </Shell>
  );
}
