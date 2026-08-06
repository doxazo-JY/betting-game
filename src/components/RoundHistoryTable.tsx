import type { RoundHistoryEntry } from "@/lib/roundHistory";

function Cell({ result }: { result: RoundHistoryEntry["team1"] }) {
  if (!result) return <span className="text-ink-faint">-</span>;
  return (
    <span>
      {result.finalBet.toLocaleString()}P · {result.outcome === "WIN" ? "승" : "패"}{" "}
      <span className={"font-bold " + (result.delta >= 0 ? "text-win-ink" : "text-lose-ink")}>
        ({result.delta >= 0 ? "+" : ""}
        {result.delta.toLocaleString()}P)
      </span>
    </span>
  );
}

export default function RoundHistoryTable({
  team1Name,
  team2Name,
  entries,
}: {
  team1Name: string;
  team2Name: string;
  entries: RoundHistoryEntry[];
}) {
  if (entries.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto border-[3px] border-ink bg-paper-2 shadow-sticker">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b-2 border-ink bg-paper">
            <th className="whitespace-nowrap px-3 py-2.5 font-black">라운드</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-black text-team-red-ink">
              {team1Name}
            </th>
            <th className="whitespace-nowrap px-3 py-2.5 font-black text-team-blue-ink">
              {team2Name}
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.flatMap((e) => {
            const rows = [];
            if (e.swapAllBefore) {
              rows.push(
                <tr key={`${e.roundNo}-swap`} className="border-b border-line">
                  <td
                    colSpan={3}
                    className="px-3 py-1.5 text-center text-xs font-semibold text-ink-faint"
                  >
                    전체 점수 교환
                  </td>
                </tr>
              );
            }
            rows.push(
              <tr key={e.roundNo} className="border-b border-line last:border-0">
                <td className="whitespace-nowrap px-3 py-2 font-black">
                  R{e.roundNo}
                  {e.multiplier && (
                    <span className="ml-1 font-semibold text-ink-faint">(×{e.multiplier})</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-2 font-semibold">
                  <Cell result={e.team1} />
                </td>
                <td className="whitespace-nowrap px-3 py-2 font-semibold">
                  <Cell result={e.team2} />
                </td>
              </tr>
            );
            return rows;
          })}
        </tbody>
      </table>
    </div>
  );
}
