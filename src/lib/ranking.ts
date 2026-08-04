export type RankingResult =
  | { type: "winner"; winnerTeamNo: 1 | 2 }
  | { type: "tie" };

export function computeRanking(team1Points: number, team2Points: number): RankingResult {
  if (team1Points === team2Points) return { type: "tie" };
  return { type: "winner", winnerTeamNo: team1Points > team2Points ? 1 : 2 };
}
