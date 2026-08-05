export type RecentGame = {
  code: string;
  adminToken: string;
  team1Name: string;
  team2Name: string;
  lastVisitedAt: number;
};

const KEY = "recent_games";
const MAX_ENTRIES = 8;

export function getRecentGames(): RecentGame[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as RecentGame[];
    return list.sort((a, b) => b.lastVisitedAt - a.lastVisitedAt);
  } catch {
    return [];
  }
}

export function registerRecentGame(game: Omit<RecentGame, "lastVisitedAt">) {
  if (typeof window === "undefined") return;
  const list = getRecentGames().filter((g) => g.code !== game.code);
  list.unshift({ ...game, lastVisitedAt: Date.now() });
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_ENTRIES)));
}

export function removeRecentGame(code: string) {
  if (typeof window === "undefined") return;
  const list = getRecentGames().filter((g) => g.code !== code);
  localStorage.setItem(KEY, JSON.stringify(list));
}
