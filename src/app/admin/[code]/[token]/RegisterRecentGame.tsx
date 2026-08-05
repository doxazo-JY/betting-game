"use client";

import { useEffect } from "react";
import { registerRecentGame } from "@/lib/recentGames";

export default function RegisterRecentGame({
  code,
  adminToken,
  team1Name,
  team2Name,
}: {
  code: string;
  adminToken: string;
  team1Name: string;
  team2Name: string;
}) {
  useEffect(() => {
    registerRecentGame({ code, adminToken, team1Name, team2Name });
  }, [code, adminToken, team1Name, team2Name]);

  return null;
}
