import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { concepts } from "@/data/curriculum";
import { useProgress } from "@/lib/progress";

export function Shell({ children }: { children: ReactNode }) {
  const passed = useProgress((state) => state.passed);
  const reset = useProgress((state) => state.reset);
  const done = concepts.filter((concept) => passed[concept.id]).length;
  const [arm, setArm] = useState(false);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-line bg-bg">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4 px-5 py-3">
          <Link to="/" className="font-serif text-xl tracking-tight">
            Nueve
          </Link>
          <p className="font-mono text-sm text-muted tabular-nums">
            {done}/{concepts.length}
          </p>
        </div>
      </header>
      <main className="mx-auto w-full min-w-0 max-w-2xl px-5 pt-2 pb-24">{children}</main>
      <footer className="mx-auto w-full max-w-2xl px-5 pb-16">
        <p className="text-sm text-muted">
          Contenido educativo. No es asesoramiento financiero ni recomendación de inversión.
        </p>
        <p className="mt-2 text-sm text-muted">
          El progreso queda guardado solo en este dispositivo. Sin cuentas ni analíticas.
        </p>
        <button
          type="button"
          className="btn btn-ghost mt-4"
          onClick={() => {
            if (!arm) {
              setArm(true);
              return;
            }
            reset();
            setArm(false);
          }}
        >
          {arm ? "Confirmar borrado" : "Borrar progreso"}
        </button>
      </footer>
    </div>
  );
}
