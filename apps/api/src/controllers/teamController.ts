import { Request, Response } from 'express'
import db from '@repo/db/client'
import { CurrentStats } from '@repo/common/CurrentStats'
import { updateStatSchema } from '@repo/common/updateStatSchema'
import {
  handleByeAndLegBye,
  handleNoBallUpdate,
  handleNormalRunsUpdate,
  handleWideBall,
} from '@/lib/helpers'

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
    })
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
    })

    const matchStats = await db.matchStats.findMany()

    if (players.length < 3 || teams.length < 2 || !teams[0] || !teams[1]) {
      res.status(500).json({
        error:
          'Something is wrong with your db please run the seed command to seed your database',
      })
    }

    const battingTeam = teams[0]?.isBatting ? teams[0] : teams[1]
    const bowlingTeam = teams[0]?.isBatting ? teams[1] : teams[0]
    const striker = players.find((player) => player.currentlyOnStrike === true)!
    const nonStriker = players.find(
      (player) => player.currentlyNonStriker === true
    )!
    const bowler = players.find((player) => player.currentlyBowling === true)!
    console.log(striker)

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
      lastSixBalls: matchStats[0]?.lastSixOvers.slice(-6)!,
      currOver: matchStats[0]?.currOver!,
    }
    res.status(200).json(data)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server error' })
  }
}

export const updateTeamStats = async (req: Request, res: Response) => {
  const { data, success, error } = updateStatSchema.safeParse(req.body)
  if (!success) {
    const errorMessages = error.errors.map((err) => ({
      path: err.path.join('.'),
      message: err.message,
    }))

    return res.status(400).json({
      message: 'Invalid Inputs',
      errors: errorMessages,
    })
  }

  const { wide, noball, legBye, runs, bye, overthrow } = data

  const players = await db.playerStats.findMany({
    where: {
      OR: [
        { currentlyOnStrike: true },
        { currentlyBowling: true },
        { currentlyNonStriker: true },
      ],
    },
    select: {
      id: true,
      oversBowled: true,
      currentlyOnStrike: true,
      currentlyNonStriker: true,
      currentlyBowling: true,
    },
  })

  const currmatchStats = await db.matchStats.findFirst({
    select: { currOver: true, id: true },
  })

  const battingTeam = await db.team.findFirst({
    where: { isBatting: true },
    select: { id: true },
  })

  if (!battingTeam || players.length < 3 || !currmatchStats) {
    return res.status(400).json({
      error: 'Something is wrong with your schema please run a db seed',
    })
  }

  const striker = players.find((p) => p.currentlyOnStrike === true)
  const bowler = players.find((p) => p.currentlyBowling === true)
  const nonStriker = players.find((p) => p.currentlyNonStriker === true)

  if (!striker || !bowler || !nonStriker) {
    return res.status(400).json({
      error: 'Something is wrong with your schema please run a db seed',
    })
  }
  // case 1 normal and normal + overthrow
  if (!wide && !noball && !bye && !legBye) {
    await handleNormalRunsUpdate(
      runs,
      overthrow,
      currmatchStats.currOver,
      bowler.oversBowled,
      battingTeam.id,
      striker.id,
      nonStriker.id,
      bowler.id,
      currmatchStats.id
    )
  } else if ((bye || legBye) && !wide && !noball) {
    //case 2 only bye or legbye with overthrow

    await handleByeAndLegBye(
      bye ? 'bye' : 'legBye',
      runs,
      overthrow,
      currmatchStats.currOver,
      bowler.oversBowled,
      battingTeam.id,
      striker.id,
      nonStriker.id,
      bowler.id,
      currmatchStats.id
    )
  } else if (wide && !noball && !legBye && !bye) {
    // wide and wide + overthrow and whatever
    await handleWideBall(
      runs,
      battingTeam.id,
      striker.id,
      nonStriker.id,
      bowler.id,
      currmatchStats.id
    )
  } else if (noball && !wide && !bye && !legBye) {
    await handleNoBallUpdate(
      runs,
      battingTeam.id,
      striker.id,
      nonStriker.id,
      bowler.id,
      currmatchStats.id
    )
  }
  res.status(200).json({ message: 'Ok' })
}
