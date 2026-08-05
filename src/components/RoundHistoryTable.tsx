import type { RoundHistoryEntry } from "@/lib/roundHistory";

function Cell({ result }: { result: RoundHistoryEntry["team1"] }) {
  if (!result) return <span className="text-neutral-400">-</span>;
  return (
    <span>
      {result.finalBet.toLocaleString()}P 배팅 · {result.outcome === "WIN" ? "승" : "패"}{" "}
      <span className={result.delta >= 0 ? "text-green-600" : "text-red-600"}>
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
    <div className="w-full overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-800">
            <th className="whitespace-nowrap px-3 py-2">라운드</th>
            <th className="whitespace-nowrap px-3 py-2">{team1Name}</th>
            <th className="whitespace-nowrap px-3 py-2">{team2Name}</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.roundNo} className="border-b border-neutral-100 last:border-0 dark:border-neutral-900">
              <td className="whitespace-nowrap px-3 py-2 font-medium">R{e.roundNo}</td>
              <td className="whitespace-nowrap px-3 py-2">
                <Cell result={e.team1} />
              </td>
              <td className="whitespace-nowrap px-3 py-2">
                <Cell result={e.team2} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
