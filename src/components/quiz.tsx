import { useState } from "react";
import type { Question } from "@/data/types";
import { useProgress } from "@/lib/progress";

export function Quiz({
  conceptId,
  questions,
}: {
  conceptId: string;
  questions: Question[];
}) {
  const record = useProgress((state) => state.record);
  const passed = useProgress((state) => state.passed[conceptId]);
  const best = useProgress((state) => state.best[conceptId]);
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));
  const [graded, setGraded] = useState(false);

  const need = Math.ceil(questions.length * 0.75);
  const correct = questions.filter((question, index) => picked[index] === question.answer).length;
  const ready = picked.every((value) => value !== null);

  return (
    <section className="space-y-6" aria-labelledby="quiz-title">
      <div>
        <p className="kicker">Cuestionario</p>
        <h2 id="quiz-title" className="mt-2 font-serif text-2xl">
          {need} de {questions.length} para darlo por entendido
        </h2>
        {passed ? (
          <p className="mt-2 text-sm text-pass">
            Ya lo pasaste{best ? ` · mejor ${best}/${questions.length}` : ""}.
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted">Elegí una opción por pregunta y recién ahí corregí.</p>
        )}
      </div>
      {questions.map((question, index) => (
        <fieldset key={question.q} className="space-y-2">
          <legend className="mb-2 text-base">
            {index + 1}. {question.q}
          </legend>
          {question.options.map((option, optionIndex) => {
            const on = picked[index] === optionIndex;
            let grade: string | undefined;
            if (graded && optionIndex === question.answer) grade = "right";
            else if (graded && on && optionIndex !== question.answer) grade = "wrong";
            return (
              <button
                key={option}
                type="button"
                className="choice"
                data-on={on ? "true" : "false"}
                data-grade={grade}
                disabled={graded}
                onClick={() => {
                  setPicked((current) => {
                    const next = [...current];
                    next[index] = optionIndex;
                    return next;
                  });
                }}
              >
                <span className="block">{option}</span>
                {graded && optionIndex === question.answer ? (
                  <span className="mt-1 block text-sm text-pass">Correcta</span>
                ) : null}
                {graded && on && optionIndex !== question.answer ? (
                  <span className="mt-1 block text-sm text-fail">Tu respuesta</span>
                ) : null}
              </button>
            );
          })}
          {graded ? <p className="text-sm text-muted">{question.why}</p> : null}
        </fieldset>
      ))}
      {graded ? (
        <div className="space-y-3" aria-live="polite">
          <p>
            Acertaste {correct} de {questions.length}.
            {correct >= need
              ? " Entendido."
              : ` Para cerrarlo hacen falta ${need}. Releé el ejemplo y reintentá.`}
          </p>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setPicked(questions.map(() => null));
              setGraded(false);
            }}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-primary"
          disabled={!ready}
          onClick={() => {
            record(conceptId, correct, questions.length);
            setGraded(true);
          }}
        >
          Corregir
        </button>
      )}
    </section>
  );
}
