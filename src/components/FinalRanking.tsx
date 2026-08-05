import { computeRanking } from "@/lib/ranking";

export default function FinalRanking({
  team1Name,
  team2Name,
  team1Points,
  team2Points,
}: {
  team1Name: string;
  team2Name: string;
  team1Points: number;
  team2Points: number;
}) {
  const ranking = computeRanking(team1Points, team2Points);

  return (
    <div className="animate-pop-in flex flex-col items-center gap-4 border-[3px] border-ink bg-paper-2 p-8 text-center shadow-sticker">
      <span className="border-2 border-ink bg-ink px-4 py-1 text-xs font-black tracking-wide text-paper-2">
        GAME OVER
      </span>
      {ranking.type === "winner" ? (
        <p className="text-3xl font-black">
          🏆 {ranking.winnerTeamNo === 1 ? team1Name : team2Name} 우승!
        </p>
      ) : (
        <p className="text-3xl font-black">🤝 공동 우승</p>
      )}
      <div className="flex gap-4">
        <div className="border-2 border-ink bg-team-red-tint px-5 py-3">
          <p className="text-xs font-black text-team-red-ink">{team1Name}</p>
          <p className="text-xl font-black tabular-nums text-team-red-ink">
            {team1Points.toLocaleString()}P
          </p>
        </div>
        <div className="border-2 border-ink bg-team-blue-tint px-5 py-3">
          <p className="text-xs font-black text-team-blue-ink">{team2Name}</p>
          <p className="text-xl font-black tabular-nums text-team-blue-ink">
            {team2Points.toLocaleString()}P
          </p>
        </div>
      </div>
    </div>
  );
}
