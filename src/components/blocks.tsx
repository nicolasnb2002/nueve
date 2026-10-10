import type { Block } from "@/data/types";
import { Figure } from "@/components/figures";

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((block, index) => {
        if (block.kind === "h") {
          return (
            <h2 key={index} className="pt-2 font-serif text-2xl">
              {block.text}
            </h2>
          );
        }
        if (block.kind === "p") return <p key={index}>{block.text}</p>;
        if (block.kind === "ul") {
          return (
            <ul key={index} className="list-disc space-y-2 pl-5">
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }
        if (block.kind === "formula") {
          return (
            <pre key={index} className="formula">
              {block.text}
            </pre>
          );
        }
        if (block.kind === "note") {
          return (
            <p key={index} className="note">
              {block.text}
            </p>
          );
        }
        if (block.kind === "example") {
          return (
            <div key={index} className="panel space-y-3">
              <h3 className="font-serif text-xl">{block.title}</h3>
              <dl className="space-y-3">
                {block.rows.map((row) => (
                  <div key={row.k}>
                    <dt className="text-sm text-muted">{row.k}</dt>
                    <dd className="mt-0.5">{row.v}</dd>
                  </div>
                ))}
              </dl>
              {block.note ? <p className="text-sm text-muted">{block.note}</p> : null}
            </div>
          );
        }
        return <Figure key={block.id} id={block.id} />;
      })}
    </div>
  );
}
