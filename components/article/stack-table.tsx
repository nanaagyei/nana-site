import type { ReactNode } from "react";

interface StackTableProps {
  caption: string;
  /** First column is the row header. */
  columns: string[];
  rows: ReactNode[][];
}

/**
 * A comparison table that reflows to labeled blocks below 40rem instead of
 * forcing horizontal scroll. Roles are explicit because the CSS changes display.
 */
export function StackTable({ caption, columns, rows }: StackTableProps) {
  return (
    <div className="stack-table my-6">
      <table role="table" className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead role="rowgroup">
          <tr role="row" className="border-b border-paper-edge">
            {columns.map((c) => (
              <th key={c} role="columnheader" scope="col" className="px-3 py-2 align-bottom font-normal text-ink-faded">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody role="rowgroup">
          {rows.map((cells, r) => (
            <tr key={r} role="row" className="border-b border-paper-edge/70 align-top">
              {cells.map((cell, c) =>
                c === 0 ? (
                  <th key={c} role="rowheader" scope="row" className="px-3 py-2.5 font-normal text-ink">
                    {cell}
                  </th>
                ) : (
                  <td key={c} role="cell" data-label={columns[c]} className="px-3 py-2.5 text-ink-soft">
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
