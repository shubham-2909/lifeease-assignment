import { CurrentStats } from '@repo/common/CurrentStats'
import db from '@repo/db/client'
function updateOversBowled(currentOvers: string): string {
  const [overs, balls] = currentOvers.split('.').map(Number)
  if (typeof overs === 'undefined' || typeof balls === 'undefined') {
    throw new Error('Invalid Format')
  }
  if (balls >= 5) {
    return `${overs + 1}.0`
  }
  return `${overs}.${balls + 1}`
}

export async function handleNormalRunsUpdate(
  runs: number,
  overthrow: boolean,
  currOver: string,
  oversBowledByBowler: string,
  teamId: string,
  strikerId: string,
  nonStrikerId: string,
  bowlerId: string,
  matchId: string
): Promise<CurrentStats> {
  const [
    updatedTeamData,
    updatedStrikerData,
    updatedNonStrikerData,
    updatedBowlerData,
    updatedMatchStats,
  ] = await db.$transaction([
    db.team.update({
      where: { id: teamId },
      data: {
        runsScored: { increment: runs },
      },
    }),
    db.playerStats.update({
      where: { id: strikerId },
      data: {
        runsScored: { increment: runs },
        ...(overthrow ? {} : { ballsPlayed: { increment: 1 } }),
        ...(runs === 4 ? { foursCount: { increment: 1 } } : {}),
        ...(runs === 6 ? { sixesCount: { increment: 1 } } : {}),
        ...((runs === 1 || runs === 3) && !currOver.endsWith('.5')
          ? { currentlyOnStrike: false, currentlyNonStriker: true }
          : {}),
        ...(currOver.endsWith('.5') && runs !== 1 && runs !== 3
          ? { currentlyOnStrike: false, currentlyNonStriker: true }
          : {}),
      },
      include: { player: true },
    }),
    db.playerStats.update({
      where: { id: nonStrikerId },
      data: {
        ...((runs === 1 || runs === 3) && !currOver.endsWith('.5')
          ? { currentlyOnStrike: true, currentlyNonStriker: false }
          : {}),
        ...(currOver.endsWith('.5') && runs !== 1 && runs !== 3
          ? { currentlyOnStrike: true, currentlyNonStriker: false }
          : {}),
      },
      include: { player: true },
    }),
    db.playerStats.update({
      where: { id: bowlerId },
      data: {
        runsGiven: { increment: runs },
        ...(overthrow
          ? {}
          : { oversBowled: updateOversBowled(oversBowledByBowler) }),
      },
      include: { player: true },
    }),
    db.matchStats.update({
      where: { id: matchId },
      data: {
        ...(overthrow ? {} : { currOver: updateOversBowled(currOver) }),
        lastSixOvers: { push: `${runs} runs` },
      },
    }),
  ])

  return {
    teamStats: {
      battingTeamStats: {
        name: updatedTeamData.name,
        runs: updatedTeamData.runsScored,
        wickets: updatedTeamData.wicketsFallen,
        extras: {
          wideRuns: updatedTeamData.wideRuns,
          noBallRuns: updatedTeamData.noBallRuns,
          byeRuns: updatedTeamData.byeRuns,
          legByeRuns: updatedTeamData.legByeRuns,
        },
      },
      bowlingTeamStats: {
        // sorry hardcoding for now but yeah we can keep it as dynamic
        name: 'Australia',
        runs: 0,
        wickets: 0,
      },
    },
    playerStats: {
      striker: {
        name: updatedStrikerData.player?.name || '',
        runsScored: updatedStrikerData.runsScored,
        ballsPlayed: updatedStrikerData.ballsPlayed,
        foursCount: updatedStrikerData.foursCount,
        sixesCount: updatedStrikerData.sixesCount,
      },
      nonStriker: {
        name: updatedNonStrikerData.player?.name || '',
        runsScored: updatedNonStrikerData.runsScored,
        ballsPlayed: updatedNonStrikerData.ballsPlayed,
        foursCount: updatedNonStrikerData.foursCount,
        sixesCount: updatedNonStrikerData.sixesCount,
      },
      bowler: {
        name: updatedBowlerData.player?.name || '',
        runsGiven: updatedBowlerData.runsGiven,
        wicketsTakem: updatedBowlerData.wicketsTaken,
        oversBowled: updatedBowlerData.oversBowled,
      },
    },
    lastSixBalls: updatedMatchStats.lastSixOvers.slice(-7),
    currOver: updatedMatchStats.currOver,
  }
}
export async function handleByeAndLegBye(
  key: 'bye' | 'legBye',
  runs: number,
  overthrow: boolean,
  currOver: string,
  oversBowledByBowler: string,
  teamId: string,
  strikerId: string,
  nonStrikerId: string,
  bowlerId: string,
  matchId: string
): Promise<CurrentStats> {
  const [
    updatedTeamData,
    updatedStrikerData,
    updatedNonStrikerData,
    updatedBowlerData,
    updatedMatchStats,
  ] = await db.$transaction([
    db.team.update({
      where: { id: teamId },
      data: {
        runsScored: { increment: runs },
        ...(key === 'bye'
          ? { byeRuns: { increment: runs } }
          : { legByeRuns: { increment: runs } }),
      },
    }),
    db.playerStats.update({
      where: { id: strikerId },
      data: {
        ...(overthrow ? {} : { ballsPlayed: { increment: 1 } }),
        ...((runs === 1 || runs === 3) && !currOver.endsWith('.5')
          ? { currentlyOnStrike: false, currentlyNonStriker: true }
          : {}),
        ...(currOver.endsWith('.5') && runs !== 1 && runs !== 3
          ? { currentlyOnStrike: false, currentlyNonStriker: true }
          : {}),
      },
      include: { player: true },
    }),
    db.playerStats.update({
      where: { id: nonStrikerId },
      data: {
        ...((runs === 1 || runs === 3) && !currOver.endsWith('.5')
          ? { currentlyOnStrike: true, currentlyNonStriker: false }
          : {}),
        ...(currOver.endsWith('.5') && runs !== 1 && runs !== 3
          ? { currentlyOnStrike: true, currentlyNonStriker: false }
          : {}),
      },
      include: { player: true },
    }),
    db.playerStats.update({
      where: { id: bowlerId },
      data: {
        runsGiven: { increment: runs },
        ...(overthrow
          ? {}
          : { oversBowled: updateOversBowled(oversBowledByBowler) }),
      },
      include: { player: true },
    }),
    db.matchStats.update({
      where: { id: matchId },
      data: {
        ...(overthrow ? {} : { currOver: updateOversBowled(currOver) }),
        lastSixOvers: { push: `${runs} ${key === 'bye' ? 'b' : 'lb'}` },
      },
    }),
  ])

  return {
    teamStats: {
      battingTeamStats: {
        name: updatedTeamData.name,
        runs: updatedTeamData.runsScored,
        wickets: updatedTeamData.wicketsFallen,
        extras: {
          wideRuns: updatedTeamData.wideRuns,
          noBallRuns: updatedTeamData.noBallRuns,
          byeRuns: updatedTeamData.byeRuns,
          legByeRuns: updatedTeamData.legByeRuns,
        },
      },
      bowlingTeamStats: {
        // sorry hardcoding for now but yeah we can keep it as dynamic
        name: 'Australia',
        runs: 0,
        wickets: 0,
      },
    },
    playerStats: {
      striker: {
        name: updatedStrikerData.player?.name || '',
        runsScored: updatedStrikerData.runsScored,
        ballsPlayed: updatedStrikerData.ballsPlayed,
        foursCount: updatedStrikerData.foursCount,
        sixesCount: updatedStrikerData.sixesCount,
      },
      nonStriker: {
        name: updatedNonStrikerData.player?.name || '',
        runsScored: updatedNonStrikerData.runsScored,
        ballsPlayed: updatedNonStrikerData.ballsPlayed,
        foursCount: updatedNonStrikerData.foursCount,
        sixesCount: updatedNonStrikerData.sixesCount,
      },
      bowler: {
        name: updatedBowlerData.player?.name || '',
        runsGiven: updatedBowlerData.runsGiven,
        wicketsTakem: updatedBowlerData.wicketsTaken,
        oversBowled: updatedBowlerData.oversBowled,
      },
    },
    lastSixBalls: updatedMatchStats.lastSixOvers.slice(-7),
    currOver: updatedMatchStats.currOver,
  }
}
export async function handleWideBall(
  runs: number,
  teamId: string,
  strikerId: string,
  nonStrikerId: string,
  bowlerId: string,
  matchId: string
): Promise<CurrentStats> {
  const [
    updatedTeamData,
    updatedStrikerData,
    updatedNonStrikerData,
    updatedBowlerData,
    updatedMatchStats,
  ] = await db.$transaction([
    db.team.update({
      where: { id: teamId },
      data: {
        runsScored: { increment: runs + 1 },
        wideRuns: { increment: runs + 1 },
      },
    }),
    db.playerStats.update({
      where: { id: strikerId },
      data: {
        ...(runs === 1 || runs === 3
          ? { currentlyOnStrike: false, currentlyNonStriker: true }
          : {}),
      },
      include: { player: true },
    }),
    db.playerStats.update({
      where: { id: nonStrikerId },
      data: {
        ...(runs === 1 || runs === 3
          ? { currentlyOnStrike: true, currentlyNonStriker: false }
          : {}),
      },
      include: { player: true },
    }),
    db.playerStats.update({
      where: { id: bowlerId },
      data: {
        runsGiven: { increment: runs + 1 },
      },
      include: { player: true },
    }),
    db.matchStats.update({
      where: { id: matchId },
      data: {
        lastSixOvers: { push: `${runs} wd` },
      },
    }),
  ])

  return {
    teamStats: {
      battingTeamStats: {
        name: updatedTeamData.name,
        runs: updatedTeamData.runsScored,
        wickets: updatedTeamData.wicketsFallen,
        extras: {
          wideRuns: updatedTeamData.wideRuns,
          noBallRuns: updatedTeamData.noBallRuns,
          byeRuns: updatedTeamData.byeRuns,
          legByeRuns: updatedTeamData.legByeRuns,
        },
      },
      bowlingTeamStats: {
        // sorry hardcoding for now but yeah we can keep it as dynamic
        name: 'Australia',
        runs: 0,
        wickets: 0,
      },
    },
    playerStats: {
      striker: {
        name: updatedStrikerData.player?.name || '',
        runsScored: updatedStrikerData.runsScored,
        ballsPlayed: updatedStrikerData.ballsPlayed,
        foursCount: updatedStrikerData.foursCount,
        sixesCount: updatedStrikerData.sixesCount,
      },
      nonStriker: {
        name: updatedNonStrikerData.player?.name || '',
        runsScored: updatedNonStrikerData.runsScored,
        ballsPlayed: updatedNonStrikerData.ballsPlayed,
        foursCount: updatedNonStrikerData.foursCount,
        sixesCount: updatedNonStrikerData.sixesCount,
      },
      bowler: {
        name: updatedBowlerData.player?.name || '',
        runsGiven: updatedBowlerData.runsGiven,
        wicketsTakem: updatedBowlerData.wicketsTaken,
        oversBowled: updatedBowlerData.oversBowled,
      },
    },
    lastSixBalls: updatedMatchStats.lastSixOvers.slice(-7),
    currOver: updatedMatchStats.currOver,
  }
}
export async function handleNoBallUpdate(
  runs: number,
  teamId: string,
  strikerId: string,
  nonStrikerId: string,
  bowlerId: string,
  matchId: string
): Promise<CurrentStats> {
  const [
    updatedTeamData,
    updatedStrikerData,
    updatedNonStrikerData,
    updatedBowlerData,
    updatedMatchStats,
  ] = await db.$transaction([
    db.team.update({
      where: { id: teamId },
      data: {
        runsScored: { increment: runs + 1 },
        noBallRuns: { increment: 1 },
      },
    }),
    db.playerStats.update({
      where: { id: strikerId },
      data: {
        runsScored: { increment: runs },
        ...(runs === 4 ? { foursCount: { increment: 1 } } : {}),
        ...(runs === 6 ? { sixesCount: { increment: 1 } } : {}),
        ...(runs === 1 || runs === 3
          ? { currentlyOnStrike: false, currentlyNonStriker: true }
          : {}),
      },
      include: { player: true },
    }),
    db.playerStats.update({
      where: { id: nonStrikerId },
      data: {
        ...(runs === 1 || runs === 3
          ? { currentlyOnStrike: true, currentlyNonStriker: false }
          : {}),
      },
      include: { player: true },
    }),
    db.playerStats.update({
      where: { id: bowlerId },
      data: {
        runsGiven: { increment: runs + 1 },
      },
      include: { player: true },
    }),
    db.matchStats.update({
      where: { id: matchId },
      data: {
        lastSixOvers: { push: `${runs} nb` },
      },
    }),
  ])
  return {
    teamStats: {
      battingTeamStats: {
        name: updatedTeamData.name,
        runs: updatedTeamData.runsScored,
        wickets: updatedTeamData.wicketsFallen,
        extras: {
          wideRuns: updatedTeamData.wideRuns,
          noBallRuns: updatedTeamData.noBallRuns,
          byeRuns: updatedTeamData.byeRuns,
          legByeRuns: updatedTeamData.legByeRuns,
        },
      },
      bowlingTeamStats: {
        // sorry hardcoding for now but yeah we can keep it as dynamic
        name: 'Australia',
        runs: 0,
        wickets: 0,
      },
    },
    playerStats: {
      striker: {
        name: updatedStrikerData.player?.name || '',
        runsScored: updatedStrikerData.runsScored,
        ballsPlayed: updatedStrikerData.ballsPlayed,
        foursCount: updatedStrikerData.foursCount,
        sixesCount: updatedStrikerData.sixesCount,
      },
      nonStriker: {
        name: updatedNonStrikerData.player?.name || '',
        runsScored: updatedNonStrikerData.runsScored,
        ballsPlayed: updatedNonStrikerData.ballsPlayed,
        foursCount: updatedNonStrikerData.foursCount,
        sixesCount: updatedNonStrikerData.sixesCount,
      },
      bowler: {
        name: updatedBowlerData.player?.name || '',
        runsGiven: updatedBowlerData.runsGiven,
        wicketsTakem: updatedBowlerData.wicketsTaken,
        oversBowled: updatedBowlerData.oversBowled,
      },
    },
    lastSixBalls: updatedMatchStats.lastSixOvers.slice(-7),
    currOver: updatedMatchStats.currOver,
  }
}
export async function handleNoBallAndWide(
  runs: number,
  teamId: string,
  strikerId: string,
  nonStrikerId: string,
  bowlerId: string,
  matchId: string
): Promise<CurrentStats> {
  const [
    updatedTeamData,
    updatedStrikerData,
    updatedNonStrikerData,
    updatedBowlerData,
    updatedMatchStats,
  ] = await db.$transaction([
    db.team.update({
      where: { id: teamId },
      data: {
        runsScored: { increment: runs + 2 },
        noBallRuns: { increment: 1 },
        wideRuns: { increment: runs + 1 },
      },
    }),
    db.playerStats.update({
      where: { id: strikerId },
      data: {
        ...(runs === 1 || runs === 3
          ? { currentlyOnStrike: false, currentlyNonStriker: true }
          : {}),
      },
      include: { player: true },
    }),
    db.playerStats.update({
      where: { id: nonStrikerId },
      data: {
        ...(runs === 1 || runs === 3
          ? { currentlyOnStrike: true, currentlyNonStriker: false }
          : {}),
      },
      include: { player: true },
    }),
    db.playerStats.update({
      where: { id: bowlerId },
      data: {
        runsGiven: { increment: runs + 2 },
      },
      include: { player: true },
    }),
    db.matchStats.update({
      where: { id: matchId },
      data: {
        lastSixOvers: { push: `${runs} nb+wd` },
      },
    }),
  ])

  return {
    teamStats: {
      battingTeamStats: {
        name: updatedTeamData.name,
        runs: updatedTeamData.runsScored,
        wickets: updatedTeamData.wicketsFallen,
        extras: {
          wideRuns: updatedTeamData.wideRuns,
          noBallRuns: updatedTeamData.noBallRuns,
          byeRuns: updatedTeamData.byeRuns,
          legByeRuns: updatedTeamData.legByeRuns,
        },
      },
      bowlingTeamStats: {
        // sorry hardcoding for now but yeah we can keep it as dynamic
        name: 'Australia',
        runs: 0,
        wickets: 0,
      },
    },
    playerStats: {
      striker: {
        name: updatedStrikerData.player?.name || '',
        runsScored: updatedStrikerData.runsScored,
        ballsPlayed: updatedStrikerData.ballsPlayed,
        foursCount: updatedStrikerData.foursCount,
        sixesCount: updatedStrikerData.sixesCount,
      },
      nonStriker: {
        name: updatedNonStrikerData.player?.name || '',
        runsScored: updatedNonStrikerData.runsScored,
        ballsPlayed: updatedNonStrikerData.ballsPlayed,
        foursCount: updatedNonStrikerData.foursCount,
        sixesCount: updatedNonStrikerData.sixesCount,
      },
      bowler: {
        name: updatedBowlerData.player?.name || '',
        runsGiven: updatedBowlerData.runsGiven,
        wicketsTakem: updatedBowlerData.wicketsTaken,
        oversBowled: updatedBowlerData.oversBowled,
      },
    },
    lastSixBalls: updatedMatchStats.lastSixOvers.slice(-7),
    currOver: updatedMatchStats.currOver,
  }
}

export async function handleNoBallAndLegByeorBye(
  key: 'bye' | 'legBye',
  runs: number,
  teamId: string,
  strikerId: string,
  nonStrikerId: string,
  bowlerId: string,
  matchId: string
): Promise<CurrentStats> {
  const [
    updatedTeamData,
    updatedStrikerData,
    updatedNonStrikerData,
    updatedBowlerData,
    updatedMatchStats,
  ] = await db.$transaction([
    db.team.update({
      where: { id: teamId },
      data: {
        runsScored: { increment: runs + 1 },
        noBallRuns: { increment: 1 },
        ...(key === 'bye'
          ? { byeRuns: { increment: runs } }
          : { legByeRuns: { increment: runs } }),
      },
    }),
    db.playerStats.update({
      where: { id: strikerId },
      data: {
        ...(runs === 1 || runs === 3
          ? { currentlyOnStrike: false, currentlyNonStriker: true }
          : {}),
      },
      include: { player: true },
    }),
    db.playerStats.update({
      where: { id: nonStrikerId },
      data: {
        ...(runs === 1 || runs === 3
          ? { currentlyOnStrike: true, currentlyNonStriker: false }
          : {}),
      },
      include: { player: true },
    }),
    db.playerStats.update({
      where: { id: bowlerId },
      data: {
        runsGiven: { increment: runs + 1 },
      },
      include: { player: true },
    }),
    db.matchStats.update({
      where: { id: matchId },
      data: {
        lastSixOvers: { push: `${runs} nb+${key === 'bye' ? 'bye' : 'lb'}` },
      },
    }),
  ])

  return {
    teamStats: {
      battingTeamStats: {
        name: updatedTeamData.name,
        runs: updatedTeamData.runsScored,
        wickets: updatedTeamData.wicketsFallen,
        extras: {
          wideRuns: updatedTeamData.wideRuns,
          noBallRuns: updatedTeamData.noBallRuns,
          byeRuns: updatedTeamData.byeRuns,
          legByeRuns: updatedTeamData.legByeRuns,
        },
      },
      bowlingTeamStats: {
        // sorry hardcoding for now but yeah we can keep it as dynamic
        name: 'Australia',
        runs: 0,
        wickets: 0,
      },
    },
    playerStats: {
      striker: {
        name: updatedStrikerData.player?.name || '',
        runsScored: updatedStrikerData.runsScored,
        ballsPlayed: updatedStrikerData.ballsPlayed,
        foursCount: updatedStrikerData.foursCount,
        sixesCount: updatedStrikerData.sixesCount,
      },
      nonStriker: {
        name: updatedNonStrikerData.player?.name || '',
        runsScored: updatedNonStrikerData.runsScored,
        ballsPlayed: updatedNonStrikerData.ballsPlayed,
        foursCount: updatedNonStrikerData.foursCount,
        sixesCount: updatedNonStrikerData.sixesCount,
      },
      bowler: {
        name: updatedBowlerData.player?.name || '',
        runsGiven: updatedBowlerData.runsGiven,
        wicketsTakem: updatedBowlerData.wicketsTaken,
        oversBowled: updatedBowlerData.oversBowled,
      },
    },
    lastSixBalls: updatedMatchStats.lastSixOvers.slice(-7),
    currOver: updatedMatchStats.currOver,
  }
}
