import db from '@repo/db/client'
export function updateOversBowled(currentOvers: string): string {
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
) {
  await db.$transaction(async (tx) => {
    await tx.team.update({
      where: { id: teamId },
      data: {
        runsScored: { increment: runs },
      },
    })

    await tx.playerStats.update({
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
    })

    await tx.playerStats.update({
      where: { id: nonStrikerId },
      data: {
        ...((runs === 1 || runs === 3) && !currOver.endsWith('.5')
          ? { currentlyOnStrike: true, currentlyNonStriker: false }
          : {}),
        ...(currOver.endsWith('.5') && runs !== 1 && runs !== 3
          ? { currentlyOnStrike: true, currentlyNonStriker: false }
          : {}),
      },
    })

    await tx.playerStats.update({
      where: { id: bowlerId },
      data: {
        runsGiven: { increment: runs },
        ...(overthrow
          ? {}
          : { oversBowled: updateOversBowled(oversBowledByBowler) }),
      },
    })

    await tx.matchStats.update({
      where: { id: matchId },
      data: {
        ...(overthrow ? {} : { currOver: updateOversBowled(currOver) }),
        lastSixOvers: { push: `${runs} Runs` },
      },
    })
  })
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
) {
  await db.$transaction(async (tx) => {
    await tx.team.update({
      where: { id: teamId },
      data: {
        runsScored: { increment: runs },
        ...(key === 'bye'
          ? { byeRuns: { increment: runs } }
          : { legByeRuns: { increment: runs } }),
      },
    })

    await tx.playerStats.update({
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
    })

    await tx.playerStats.update({
      where: { id: nonStrikerId },
      data: {
        ...((runs === 1 || runs === 3) && !currOver.endsWith('.5')
          ? { currentlyOnStrike: true, currentlyNonStriker: false }
          : {}),
        ...(currOver.endsWith('.5') && runs !== 1 && runs !== 3
          ? { currentlyOnStrike: true, currentlyNonStriker: false }
          : {}),
      },
    })

    await tx.playerStats.update({
      where: { id: bowlerId },
      data: {
        runsGiven: { increment: runs },
        ...(overthrow
          ? {}
          : { oversBowled: updateOversBowled(oversBowledByBowler) }),
      },
    })

    await tx.matchStats.update({
      where: { id: matchId },
      data: {
        ...(overthrow ? {} : { currOver: updateOversBowled(currOver) }),
        lastSixOvers: { push: `${runs} ${key === 'bye' ? 'b' : 'lb'}` },
      },
    })
  })
}
export async function handleWideBall(
  runs: number,
  teamId: string,
  strikerId: string,
  nonStrikerId: string,
  bowlerId: string,
  matchId: string
) {
  await db.$transaction(async (tx) => {
    await tx.team.update({
      where: { id: teamId },
      data: {
        runsScored: { increment: runs + 1 },
        wideRuns: { increment: runs + 1 },
      },
    })

    await tx.playerStats.update({
      where: { id: strikerId },
      data: {
        ...(runs === 1 || runs === 3
          ? { currentlyOnStrike: false, currentlyNonStriker: true }
          : {}),
      },
    })

    await tx.playerStats.update({
      where: { id: nonStrikerId },
      data: {
        ...(runs === 1 || runs === 3
          ? { currentlyOnStrike: true, currentlyNonStriker: false }
          : {}),
      },
    })

    await tx.playerStats.update({
      where: { id: bowlerId },
      data: {
        runsGiven: { increment: runs + 1 },
      },
    })

    await tx.matchStats.update({
      where: { id: matchId },
      data: {
        lastSixOvers: { push: `${runs} wd` },
      },
    })
  })
}

export async function handleNoBallUpdate(
  runs: number,
  teamId: string,
  strikerId: string,
  nonStrikerId: string,
  bowlerId: string,
  matchId: string
) {
  await db.$transaction(async (tx) => {
    await tx.team.update({
      where: { id: teamId },
      data: {
        runsScored: { increment: runs + 1 },
        noBallRuns: { increment: 1 },
      },
    })

    await tx.playerStats.update({
      where: { id: strikerId },
      data: {
        runsScored: { increment: runs },
        ...(runs === 4 ? { foursCount: { increment: 1 } } : {}),
        ...(runs === 6 ? { sixesCount: { increment: 1 } } : {}),
        ...(runs === 1 || runs === 3
          ? { currentlyOnStrike: false, currentlyNonStriker: true }
          : {}),
      },
    })

    await tx.playerStats.update({
      where: { id: nonStrikerId },
      data: {
        ...(runs === 1 || runs === 3
          ? { currentlyOnStrike: true, currentlyNonStriker: false }
          : {}),
      },
    })

    await tx.playerStats.update({
      where: { id: bowlerId },
      data: {
        runsGiven: { increment: runs + 1 },
      },
    })

    await tx.matchStats.update({
      where: { id: matchId },
      data: {
        lastSixOvers: { push: `${runs} nb` },
      },
    })
  })
}

export async function handleNoBallAndWide(
  runs: number,
  teamId: string,
  strikerId: string,
  nonStrikerId: string,
  bowlerId: string,
  matchId: string
) {
  await db.$transaction(async (tx) => {
    await tx.team.update({
      where: { id: teamId },
      data: {
        runsScored: { increment: runs + 2 },
        noBallRuns: { increment: 1 },
        wideRuns: { increment: runs + 1 },
      },
    })

    await tx.playerStats.update({
      where: { id: strikerId },
      data: {
        ...(runs === 1 || runs === 3
          ? { currentlyOnStrike: false, currentlyNonStriker: true }
          : {}),
      },
    })

    await tx.playerStats.update({
      where: { id: nonStrikerId },
      data: {
        ...(runs === 1 || runs === 3
          ? { currentlyOnStrike: true, currentlyNonStriker: false }
          : {}),
      },
    })

    await tx.playerStats.update({
      where: { id: bowlerId },
      data: {
        runsGiven: { increment: runs + 2 },
      },
    })

    await tx.matchStats.update({
      where: { id: matchId },
      data: {
        lastSixOvers: { push: `${runs} nb+wd` },
      },
    })
  })
}
export async function handleNoBallAndLegByeorBye(
  key: 'bye' | 'legBye',
  runs: number,
  teamId: string,
  strikerId: string,
  nonStrikerId: string,
  bowlerId: string,
  matchId: string
) {
  await db.$transaction(async (tx) => {
    await tx.team.update({
      where: { id: teamId },
      data: {
        runsScored: { increment: runs + 1 },
        noBallRuns: { increment: 1 },
        ...(key === 'bye'
          ? { byeRuns: { increment: runs } }
          : { legByeRuns: { increment: runs } }),
      },
    })

    await tx.playerStats.update({
      where: { id: strikerId },
      data: {
        ...(runs === 1 || runs === 3
          ? { currentlyOnStrike: false, currentlyNonStriker: true }
          : {}),
      },
    })

    await tx.playerStats.update({
      where: { id: nonStrikerId },
      data: {
        ...(runs === 1 || runs === 3
          ? { currentlyOnStrike: true, currentlyNonStriker: false }
          : {}),
      },
    })

    await tx.playerStats.update({
      where: { id: bowlerId },
      data: {
        runsGiven: { increment: runs + 1 },
      },
    })

    await tx.matchStats.update({
      where: { id: matchId },
      data: {
        lastSixOvers: { push: `${runs} nb+${key === 'bye' ? 'bye' : 'lb'}` },
      },
    })
  })
}
