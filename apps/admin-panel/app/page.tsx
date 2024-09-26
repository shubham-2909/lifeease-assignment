"use client";
import { useEffect, useState } from "react";
import { CurrentStats } from "@repo/common/CurrentStats";
import { UpdateStatType } from "@repo/common/UpdateStatType";
import customFetch from "./lib/axios";
import { MatchStats } from "@/components/MatchStats";
import { MatchUpdate } from "@/components/MatchUpdate";
export default function page() {
  const [striker, setStriker] = useState("");
  const [nonStriker, setNonStriker] = useState("");
  const [bowler, setBowler] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentStats, setCurrentStats] = useState<CurrentStats | null>(null);
  const [updateStats, setUpdateStats] = useState<UpdateStatType>({
    runs: 0,
    wide: false,
    overthrow: false,
    noball: false,
    bye: false,
    legBye: false,
  });
  useEffect(() => {
    customFetch.get("/teams/get-stats").then((resp) => {
      setCurrentStats(resp.data as CurrentStats);
    });
  }, []);

  return (
    <main className="h-screen p-4 grid grid-cols-2">
      <MatchUpdate />
      <MatchStats stats={currentStats} loading={loading} />
    </main>
  );
}
