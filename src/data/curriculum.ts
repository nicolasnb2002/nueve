import { part1 } from "@/data/part1";
import { part2 } from "@/data/part2";
import { part3 } from "@/data/part3";
import type { Concept, Day } from "@/data/types";

export const concepts: Concept[] = [...part1, ...part2, ...part3];

const dayMeta: Omit<Day, "minutes">[] = [
  {
    n: 1,
    title: "La forma de la curva",
    aim: "Leer el retorno como una distribución y la caída como una herida desde el pico, no como un único número de performance.",
    say: "El Sharpe no dice la forma de la cola ni cuánto tiempo estuviste debajo del pico.",
  },
  {
    n: 2,
    title: "Cómo se miente un backtest",
    aim: "Nombrar look-ahead, supervivencia y ejecución en la misma barra, y saber cuándo un holdout dejó de serlo.",
    say: "Si el número usa información que no tenía a la hora de la orden, o si ya reescribí la regla después de mirar el holdout, esa nota no vale.",
  },
  {
    n: 3,
    title: "El tiempo y la búsqueda",
    aim: "Distinguir una prueba que camina hacia adelante de un concurso de variantes sobre ruido.",
    say: "El test no vota el parámetro, y el Sharpe que recuerdo es el del ganador de N, no el de una idea sola.",
  },
  {
    n: 4,
    title: "¿Fue suerte?",
    aim: "Leer un p-valor sin invertirlo, y saber qué pregunta hacen permutación, sign-flip y bootstrap.",
    say: "p = 0,008 es una frecuencia bajo la nula. El bootstrap no fabrica esa nula: la permutación y el sign-flip sí.",
  },
  {
    n: 5,
    title: "El filtro",
    aim: "Contar los intentos y comparar el Sharpe contra el que la búsqueda ya te regalaba.",
    say: "El ledger es N. El DSR es la probabilidad de superar el Sharpe del mejor ruido, no otro Sharpe para el brochure.",
  },
  {
    n: 6,
    title: "Antes de mirar",
    aim: "Congelar el texto de la regla, y no confundir un roll de futuros con una ganancia.",
    say: "El hash prueba que no reescribí la regla. El salto entre contratos no es PnL, y el carry vive en esa curva.",
  },
  {
    n: 7,
    title: "Las dos ideas",
    aim: "Separar tendencia de carry, y ver que el tamaño iguala el voto de cada mercado.",
    say: "Time-series momentum mira el propio pasado. El carry mira la pendiente. El 40% es el dial que les da la misma voz, no una ley.",
  },
  {
    n: 8,
    title: "Lo que el pasado no firma",
    aim: "Pasar el edge bruto a neto, y ubicar el único tramo de datos que todavía no existía.",
    say: "Al filtro entra el Sharpe neto. El forward es el único tramo que no estaba en el disco cuando congelé la regla.",
  },
  {
    n: 9,
    title: "¿Alcanza la evidencia?",
    aim: "Medir si hay años de sobra, y no creerle a un motor que no pasó los controles.",
    say: "t ≈ Sharpe × √años, por eso siete años de cripto no cierran solos. El banco tiene que ver el edge plantado y rechazar los cincuenta sin edge. Recién ahí el histórico se puede decir, y el forward sigue pendiente.",
  },
  {
    n: 10,
    title: "Cripto: el libro y la comisión",
    aim: "Leer un libro de órdenes, medir el spread, distinguir maker de taker y calcular la comisión spot real de Binance, con y sin BNB.",
    say: "El precio de pantalla es el mid. Cruzar cuesta medio spread, y la comisión regular es 0,100 % por lado (0,075 % con BNB), repetida en cada operación.",
  },
  {
    n: 11,
    title: "Cripto: ejecución y riesgo",
    aim: "Calcular el slippage de una orden de mercado, elegir entre límite y mercado, entender el riesgo de custodia y hacer la cuenta de liquidación.",
    say: "Mercado garantiza ejecución, límite garantiza precio. A 10x, una caída de 9,5 % me liquida: una cuenta chica opera spot y sin apalancamiento.",
  },
];

export const conceptCount = concepts.length;

export const days: Day[] = dayMeta.map((d) => ({
  ...d,
  minutes: concepts.filter((c) => c.day === d.n).reduce((s, c) => s + c.minutes, 0),
}));

export const dayCount = days.length;

export const totalMinutes = days.reduce((s, d) => s + d.minutes, 0);

export function formatSpan(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m}`;
}

export function getConcept(id: string): Concept | undefined {
  return concepts.find((c) => c.id === id);
}

export function conceptsForDay(n: number): Concept[] {
  return concepts.filter((c) => c.day === n);
}

export function getDay(n: number): Day | undefined {
  return days.find((d) => d.n === n);
}

export function prevConcept(id: string): Concept | undefined {
  const i = concepts.findIndex((c) => c.id === id);
  return i > 0 ? concepts[i - 1] : undefined;
}

export function nextConcept(id: string): Concept | undefined {
  const i = concepts.findIndex((c) => c.id === id);
  return i >= 0 && i < concepts.length - 1 ? concepts[i + 1] : undefined;
}
