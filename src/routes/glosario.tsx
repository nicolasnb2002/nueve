import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { glossary } from "@/data/glossary";

export const Route = createFileRoute("/glosario")({ component: Glosario });

function Glosario() {
  return (
    <Shell>
      <p className="kicker mt-8">Para arrancar de cero</p>
      <h1 className="mt-3 font-serif text-4xl leading-tight">Glosario</h1>
      <p className="mt-4 text-muted">Las palabras que aparecen en el recorrido, dichas simple.</p>
      <dl className="mt-8 space-y-5">
        {glossary.map((g) => (
          <div key={g.term} className="border-t border-line pt-4">
            <dt className="font-serif text-xl">{g.term}</dt>
            <dd className="mt-1 text-muted">{g.def}</dd>
          </div>
        ))}
      </dl>
    </Shell>
  );
}
