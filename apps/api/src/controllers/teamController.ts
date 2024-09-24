import { Request, Response } from "express";
import db from "@repo/db/client";
import { CurrentStats } from "@repo/common/CurrentStats";
export const getTeamStats = async (req: Request, res: Response) => {
  try {
    const teams = await db.team.findMany({
      //since currently we have only 2 teams
      select: {
        name: true,
        runsScored: true,
        wicketsFallen: true,
        legByeRuns: true,
        wideRuns: true,
        byeRuns: true,
        noBallRuns: true,
        isBatting: true,
      },
    });
    const players = await db.playerStats.findMany({
      where: {
        OR: [
          { currentlyOnStrike: true },
          { currentlyNonStriker: true },
          { currentlyBowling: true },
        ],
      },
      include: {
        player: true,
      },
    });

    const matchStats = await db.matchStats.findMany();

    if (players.length < 3 || teams.length < 2 || !teams[0] || !teams[1]) {
      res.status(500).json({
        error:
          "Something is wrong with your db please run the seed command to seed your database",
      });
    }

    const battingTeam = teams[0]?.isBatting ? teams[0] : teams[1];
    const bowlingTeam = teams[0]?.isBatting ? teams[1] : teams[0];
    const striker = players.find(
      (player) => player.currentlyOnStrike === true,
    )!;
    const nonStriker = players.find(
      (player) => player.currentlyNonStriker === true,
    )!;
    const bowler = players.find((player) => player.currentlyBowling === true)!;
    const data: CurrentStats = {
      teamStats: {
        battingTeamStats: {
          name: battingTeam?.name!,
          runs: battingTeam?.runsScored!,
          wickets: battingTeam?.wicketsFallen!,
          extras: {
            noBallRuns: battingTeam?.noBallRuns!,
            wideRuns: battingTeam?.wideRuns!,
            legByeRuns: battingTeam?.legByeRuns!,
            byeRuns: battingTeam?.byeRuns!,
          },
        },
        bowlingTeamStats: {
          name: bowlingTeam?.name!,
          runs: bowlingTeam?.runsScored!,
          wickets: bowlingTeam?.wicketsFallen!,
        },
      },
      playerStats: {
        striker: {
          name: striker.player?.name!,
          runsScored: striker.runsScored,
          ballsPlayed: striker.ballsPlayed,
          foursCount: striker.foursCount,
          sixesCount: striker.sixesCount,
        },
        nonStriker: {
          name: nonStriker.player?.name!,
          runsScored: nonStriker.runsScored,
          ballsPlayed: nonStriker.ballsPlayed,
          foursCount: nonStriker.foursCount,
          sixesCount: nonStriker.sixesCount,
        },
        bowler: {
          name: bowler.player?.name!,
          runsGiven: bowler.runsGiven,
          wicketsTakem: bowler.wicketsTaken,
          oversBowled: bowler.oversBowled,
        },
      },
      lastSixBalls: matchStats[0]?.lastSixOvers!,
    };
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Internal Server error" });
  }
};

export const updateTeamStats = async (req: Request, res: Response) => {
  res.status(200).json({ message: "Ok" });
};
