import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const india = await prisma.team.create({
    data: {
      name: 'India',
      players: {
        create: [
          { name: 'Rohit Sharma' },
          { name: 'Virat Kohli' },
          { name: 'Shubman Gill' },
          { name: 'KL Rahul' },
          { name: 'Hardik Pandya' },
          { name: 'Ravindra Jadeja' },
          { name: 'Jasprit Bumrah' },
          { name: 'Mohammed Shami' },
          { name: 'Kuldeep Yadav' },
          { name: 'Shardul Thakur' },
          { name: 'Ishan Kishan' },
        ],
      },
      isBatting: true,
    },
  })

  const australia = await prisma.team.create({
    data: {
      name: 'Australia',
      players: {
        create: [
          { name: 'David Warner' },
          { name: 'Steve Smith' },
          { name: 'Marnus Labuschagne' },
          { name: 'Travis Head' },
          { name: 'Glenn Maxwell' },
          { name: 'Pat Cummins' },
          { name: 'Mitchell Starc' },
          { name: 'Josh Hazlewood' },
          { name: 'Alex Carey' },
          { name: 'Marcus Stoinis' },
          { name: 'Cameron Green' },
        ],
      },
    },
  })
  const match = await prisma.matchStats.create({
    data: {},
  })

  const players = await prisma.player.findMany()
  for (const player of players) {
    if (player.name === 'Josh Hazlewood') {
      await prisma.playerStats.create({
        data: {
          playerId: player.id,
          currentlyBowling: true,
        },
      })

      continue
    }

    if (player.name === 'Rohit Sharma') {
      await prisma.playerStats.create({
        data: {
          playerId: player.id,
          currentlyOnStrike: true,
        },
      })

      continue
    }

    if (player.name === 'Virat Kohli') {
      await prisma.playerStats.create({
        data: {
          playerId: player.id,
          currentlyNonStriker: true,
        },
      })

      continue
    }
    const playerStats = await prisma.playerStats.create({
      data: {
        playerId: player.id,
      },
    })
  }

  console.log('Seeding completed.')
}
main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
