import { createFileRoute, Link } from "@tanstack/react-router";
import { concepts, conceptsForDay, days } from "@/data/curriculum";
import { Shell } from "@/components/shell";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/cierre")({ component: Cierre });

function Cierre() {
  const passed = useProgress((state) => state.passed);
  const done = concepts.filter((concept) => passed[concept.id]).length;
  const next = concepts.find((concept) => !passed[concept.id]);

  return (
    <Shell>
      <p className="kicker mt-8">Al final del recorrido</p>
      <h1 className="mt-3 font-serif text-4xl leading-tight">PASA histórico, pendiente de forward.</h1>
      <p className="mt-4 font-serif text-xl text-muted italic">Nunca «funciona».</p>

      <div className="mt-8 space-y-4">
        <p>
          <span className="text-fg">PASA histórico</span> quiere decir que la regla estaba escrita antes de
          la nota, que el número es ejecutable —sin look-ahead, en t+1, con el roll bien armado, con costos,
          con el tamaño congelado— y que el Deflated Sharpe, con el N del ledger, supera el corte. También
          quiere decir que el banco de pruebas vio un edge plantado y no firmó los que no tenían.
        </p>
        <p>
          <span className="text-fg">Pendiente de forward</span> quiere decir que todo eso usó datos que ya
          existían. El tramo que no se puede ajustar es el que todavía no había pasado el día en que se
          congeló la regla. Hasta que ese papel no se acumula, la frase se queda a mitad de camino.
        </p>
        <p>
          <span className="text-fg">Funciona</span> sería una oración en futuro. Este recorrido existe para
          no decirla.
        </p>
      </div>

      <div className="mt-8 border-l-2 border-line pl-3 text-sm text-muted">
        <p className="text-fg">Caso de estudio opcional</p>
        <p className="mt-1">
          Este recorrido nació de un trabajo propio que aplica cada paso a una estrategia de tendencia y carry
          en futuros. No hace falta leerlo: cada concepto se sostiene solo. Si lo usás, leelo como un ejemplo
          de cómo se ve la frase del final aplicada, no como una recomendación.
        </p>
      </div>

      <ol className="mt-10 space-y-8">
        {days.map((day) => (
          <li key={day.n}>
            <h2 className="font-serif text-xl">
              {String(day.n).padStart(2, "0")} · {day.title}
            </h2>
            <ul className="mt-3 space-y-3">
              {conceptsForDay(day.n).map((concept) => (
                <li key={concept.id}>
                  <Link to="/concepto/$id" params={{ id: concept.id }} className="link-title text-fg">
                    {concept.n}. {concept.title}
                  </Link>
                  <p className="text-sm text-muted">{concept.line}</p>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <div className="mt-10">
        {next ? (
          <Link to="/concepto/$id" params={{ id: next.id }} className="btn btn-primary">
            Seguir · {done}/{concepts.length}
          </Link>
        ) : (
          <p className="text-pass">Recorriste los {concepts.length}. La frase ya es tuya.</p>
        )}
      </div>
    </Shell>
  );
}
