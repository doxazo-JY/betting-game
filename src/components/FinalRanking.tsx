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
      {myTeamNo ? (
        // 팀 화면에서는 "GAME OVER"보다 내 팀 승/패가 훨씬 중요한
        // 정보라, 작은 뱃지 대신 이걸 화면에서 가장 크게 보여준다.
        <span
          className={
            "border-[3px] border-ink px-8 py-3 text-3xl font-black tracking-wide " +
            (ranking.type === "tie"
              ? "bg-paper text-ink-soft"
              : ranking.winnerTeamNo === myTeamNo
                ? "bg-win text-ink"
                : "bg-lose-tint text-lose-ink")
          }
        >
          {ranking.type === "tie" ? "무승부" : ranking.winnerTeamNo === myTeamNo ? "WIN!" : "LOSE!"}
        </span>
      ) : (
        <span className="border-2 border-ink bg-ink px-4 py-1 text-xs font-black tracking-wide text-paper-2">
          GAME OVER
        </span>
      )}
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
