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
    <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-yellow-400 bg-yellow-50 p-8 text-center dark:bg-yellow-950">
      <p className="text-lg font-bold">🏁 게임 종료</p>
      {ranking.type === "winner" ? (
        <>
          <p className="text-3xl font-extrabold">
            🏆 {ranking.winnerTeamNo === 1 ? team1Name : team2Name} 우승!
          </p>
        </>
      ) : (
        <p className="text-3xl font-extrabold">🤝 공동 우승</p>
      )}
      <div className="flex gap-8">
        <div>
          <p className="font-medium">{team1Name}</p>
          <p className="text-2xl font-bold tabular-nums">{team1Points.toLocaleString()}P</p>
        </div>
        <div>
          <p className="font-medium">{team2Name}</p>
          <p className="text-2xl font-bold tabular-nums">{team2Points.toLocaleString()}P</p>
        </div>
      </div>
    </div>
  );
}
