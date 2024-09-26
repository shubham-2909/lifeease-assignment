'use client'
import { CurrentStats } from '@repo/common/CurrentStats'

type Props = {
  stats: CurrentStats
}
export function MatchStats({ stats }: Props) {
  return (
    <div className='grid grid-cols-1'>
      <div className='grid grid-cols-2 gap-8 '>
        {/* Batting Team Stats */}
        <div className='p-4 flex flex-col gap-4'>
          <h2 className='text-2xl font-bold mb-2'>
            Batting Team: {stats.teamStats.battingTeamStats.name}
          </h2>
          <div>
            <h2 className='font-semibold text-xl tracking-tight'>Runs</h2>
            <h3 className='font-medium text-lg'>
              {stats.teamStats.battingTeamStats.runs}/{' '}
              {stats.teamStats.battingTeamStats.wickets}
            </h3>
            <h2 className='text-xl font-bold'>Overs</h2>
            <h3 className='text-lg font-medium'>
              {stats.currOver}/{'10.0'}
            </h3>
            <h2 className='text-xl font-bold'>Extras</h2>
            <h3 className='text-lg font-medium'>
              Extras: (Byes: {stats.teamStats.battingTeamStats.extras.byeRuns},
              Leg Byes: {stats.teamStats.battingTeamStats.extras.legByeRuns}, No
              Balls: {stats.teamStats.battingTeamStats.extras.noBallRuns},
              Wides: {stats.teamStats.battingTeamStats.extras.wideRuns})
            </h3>
          </div>
        </div>
        {/* Bowling Team Stats */}
        <div className='p-4 flex flex-col gap-4'>
          <h2 className='text-2xl font-bold mb-2'>
            Bowling Team: {stats.teamStats.bowlingTeamStats.name}
          </h2>
          <div>
            <h2 className='font-semibold text-xl tracking-tight'>Runs</h2>
            <h3 className='font-medium text-lg'>
              {stats.teamStats.bowlingTeamStats.runs}/{' '}
              {stats.teamStats.bowlingTeamStats.wickets}
            </h3>
            <h2 className='text-xl font-bold'>Overs</h2>
            <h3 className='text-lg font-medium'>
              {'0.0'}/{'10.0'}
            </h3>
          </div>
          <p className='text-sm text-rose-500'>Yet to bat</p>
        </div>
        ``
      </div>
      <div className='grid grid-cols-2 gap-5'>
        <div className='p-4'>
          <h3 className='text-xl font-bold mb-2'>Batsmen</h3>
          <table className='w-96 border-collapse border border-gray-500'>
            <thead>
              <tr>
                <th className='border border-gray-500 px-4 py-2'>Name</th>
                <th className='border border-gray-500 px-4 py-2'>Runs</th>
                <th className='border border-gray-500 px-4 py-2'>Balls</th>
                <th className='border border-gray-500 px-4 py-2'>4s</th>
                <th className='border border-gray-500 px-4 py-2'>6s</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className='border border-gray-500 px-4 py-2'>
                  {stats.playerStats.striker.name}*
                </td>
                <td className='border border-gray-500 px-4 py-2'>
                  {stats.playerStats.striker.runsScored}
                </td>
                <td className='border border-gray-500 px-4 py-2'>
                  {stats.playerStats.striker.ballsPlayed}
                </td>
                <td className='border border-gray-500 px-4 py-2'>
                  {stats.playerStats.striker.foursCount}
                </td>
                <td className='border border-gray-500 px-4 py-2'>
                  {stats.playerStats.striker.sixesCount}
                </td>
              </tr>
              <tr>
                <td className='border border-gray-500 px-4 py-2'>
                  {stats.playerStats.nonStriker.name}
                </td>
                <td className='border border-gray-500 px-4 py-2'>
                  {stats.playerStats.nonStriker.runsScored}
                </td>
                <td className='border border-gray-500 px-4 py-2'>
                  {stats.playerStats.nonStriker.ballsPlayed}
                </td>
                <td className='border border-gray-500 px-4 py-2'>
                  {stats.playerStats.nonStriker.foursCount}
                </td>
                <td className='border border-gray-500 px-4 py-2'>
                  {stats.playerStats.nonStriker.sixesCount}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bowling Player Stats Table */}
        <div className='p-4'>
          <h3 className='text-xl font-bold mb-2'>Bowlers</h3>
          <table className='w-96  border-collapse border border-gray-500'>
            <thead>
              <tr>
                <th className='border border-gray-500 px-4 py-2'>Name</th>
                <th className='border border-gray-500 px-4 py-2'>O</th>
                <th className='border border-gray-500 px-4 py-2'>M</th>
                <th className='border border-gray-500 px-4 py-2'>W</th>
                <th className='border border-gray-500 px-4 py-2'>R</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className='border border-gray-500 px-4 py-2'>
                  {stats.playerStats.bowler.name}
                </td>
                <td className='border border-gray-500 px-4 py-2'>
                  {stats.playerStats.bowler.oversBowled}
                </td>
                <td className='border border-gray-500 px-4 py-2'>0</td>
                <td className='border border-gray-500 px-4 py-2'>
                  {stats.playerStats.bowler.wicketsTakem}
                </td>
                <td className='border border-gray-500 px-4 py-2'>
                  {stats.playerStats.bowler.runsGiven}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {/* Last Six Balls */}
      <div className='p-4'>
        <h3 className='text-xl font-bold mb-2'>Last Six Balls</h3>
        <div className='flex space-x-2'>
          {stats.lastSixBalls.map((ball, index) => (
            <span key={index} className='px-3 py-1 border rounded bg-gray-200'>
              {ball}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
