import { computeRanking } from "@/lib/ranking";

export default function FinalRanking({
  team1Name,
  team2Name,
  team1Points,
  team2Points,
  myTeamNo,
}: {
  team1Name: string;
  team2Name: string;
  team1Points: number;
  team2Points: number;
  // 팀 화면(play/[teamNo])에서만 넘겨준다 — "내 팀" 기준 승/패 뱃지를
  // 보여주기 위함. 중계 화면은 두 팀을 동등하게 보여줘야 해서 안 넘김.
  myTeamNo?: 1 | 2;
}) {
  const ranking = computeRanking(team1Points, team2Points);

  return (
    <div className="animate-pop-in flex flex-col items-center gap-4 border-[3px] border-ink bg-paper-2 p-8 text-center shadow-sticker">
      <div className="flex items-center gap-2">
        <span className="border-2 border-ink bg-ink px-4 py-1 text-xs font-black tracking-wide text-paper-2">
          GAME OVER
        </span>
        {myTeamNo &&
          (ranking.type === "tie" ? (
            <span className="border-2 border-ink bg-paper px-4 py-1 text-xs font-black tracking-wide text-ink-soft">
              무승부
            </span>
          ) : ranking.winnerTeamNo === myTeamNo ? (
            <span className="border-2 border-ink bg-win px-4 py-1 text-xs font-black tracking-wide text-ink">
              WIN!
            </span>
          ) : (
            <span className="border-2 border-ink bg-lose-tint px-4 py-1 text-xs font-black tracking-wide text-lose-ink">
              LOSE!
            </span>
          ))}
      </div>
      {ranking.type === "winner" ? (
        <p className="text-3xl font-black text-win-ink">
          {ranking.winnerTeamNo === 1 ? team1Name : team2Name} 우승!
        </p>
      ) : (
        <p className="text-3xl font-black text-win-ink">공동 우승</p>
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
