export type Block =
  | { kind: "h"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "formula"; text: string }
  | { kind: "example"; title: string; rows: { k: string; v: string }[]; note?: string }
  | { kind: "note"; text: string }
  | { kind: "figure"; id: string };

export type Question = {
  q: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  why: string;
};

export type Concept = {
  id: string;
  n: number;
  day: number;
  title: string;
  minutes: number;
  promise: string;
  line: string;
  blocks: Block[];
  questions: Question[];
};

export type Day = {
  n: number;
  title: string;
  minutes: number;
  aim: string;
  say: string;
};
