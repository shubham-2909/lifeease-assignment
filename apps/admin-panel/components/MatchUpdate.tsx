'use client'
import { UpdateStatType } from '@repo/common/UpdateStatType'
import { Dispatch, SetStateAction } from 'react'
import { CurrentStats } from '@repo/common/CurrentStats'
import { cn } from '@/lib/utils'
import customFetch from '@/lib/axios'

type Props = {
  striker: string
  nonStriker: string
  bowler: string
  updateStats: UpdateStatType
  setUpdateStats: Dispatch<SetStateAction<UpdateStatType>>
  setCurrentStats: Dispatch<SetStateAction<CurrentStats | null>>
  setStriker: Dispatch<SetStateAction<string>>
  setNonStriker: Dispatch<SetStateAction<string>>
  setBowler: Dispatch<SetStateAction<string>>
}
export function MatchUpdate({
  striker,
  nonStriker,
  bowler,
  updateStats,
  setUpdateStats,
  setCurrentStats,
  setStriker,
  setNonStriker,
  setBowler,
}: Props) {
  function handleArrayWithOverthrow(arr: string[]) {
    // Get the second last element (second last element to combine with last)
    const secondLast = arr[arr.length - 2]?.split(' ') // ["2", "Runs"]
    const last = arr[arr.length - 1]?.split(' ') // ["1", "wd"] (or "1 Runs")
    if (!secondLast || !last) {
      return arr
    }
    // Combine numbers and keep the string part of second last
    const combined = `${parseInt(secondLast[0]!) + parseInt(last[0]!)} ${secondLast[1]}`

    // Create a new array with combined last two elements
    const newArr = [...arr.slice(0, arr.length - 2), combined]

    return newArr
  }
  function handleRunsClick(value: 0 | 1 | 2 | 3 | 4 | 6) {
    setUpdateStats({ ...updateStats, runs: value })
  }

  function handleNoBallChange() {
    setUpdateStats({ ...updateStats, noball: !updateStats.noball })
  }

  function handleByeOrlegByeChange(key: 'bye' | 'legBye') {
    setUpdateStats({ ...updateStats, [key]: !updateStats[key] })
  }

  async function handleWideChange() {
    setUpdateStats({ ...updateStats, wide: !updateStats.wide })
  }

  function handleOverThrowChange() {
    setUpdateStats({ ...updateStats, overthrow: !updateStats.overthrow })
  }

  async function handleSubmit() {
    try {
      const resp = await customFetch.patch('/teams/update-stats', updateStats)
      const updatedStats: CurrentStats = resp.data
      if (updateStats.overthrow) {
        setCurrentStats({
          ...updatedStats,
          lastSixBalls: handleArrayWithOverthrow(updatedStats.lastSixBalls),
        })
      } else {
        setCurrentStats({
          ...updatedStats,
          lastSixBalls: updatedStats.lastSixBalls.slice(1),
        })
      }
      setStriker(updatedStats.playerStats.striker.name)
      setNonStriker(updatedStats.playerStats.nonStriker.name)
      setBowler(updatedStats.playerStats.bowler.name)
    } catch (error) {
      console.error(error)
    } finally {
      setUpdateStats({
        runs: 0,
        overthrow: false,
        wide: false,
        legBye: false,
        bye: false,
        noball: false,
      })
    }
  }

  return (
    <div className='flex flex-col items-center p-4 space-y-4 gap-8'>
      <h1 className='text-2xl font-bold tracking-tighter'>
        Currently on field
      </h1>
      <div className='grid grid-cols-3 gap-8 mb-12 mt-8'>
        <div>
          <h1 className='text-xl font-semibold tracking-tight mb-3'>Striker</h1>
          <div className='border border-gray-400 p-4 text-center bg-emerald-500 text-white'>
            {!striker && 'Loading...'}
            {striker}
          </div>
        </div>
        <div>
          <h1 className='text-xl font-semibold tracking-tight mb-3'>
            Non Striker
          </h1>
          <div className='border border-gray-400 p-4 text-center bg-emerald-500 text-white'>
            {!nonStriker && 'Loading...'}
            {nonStriker}
          </div>
        </div>
        <div>
          <h1 className='text-xl font-semibold tracking-tight mb-3'>Bowler</h1>
          <div className='border border-gray-400 p-4 text-center bg-emerald-500 text-white'>
            {!bowler && 'Loading...'}
            {bowler}
          </div>
        </div>
      </div>
      <h1 className='text-2xl font-bold tracking-tighter'>Change the score</h1>
      <div className='grid grid-cols-4 gap-4'>
        <div
          className={cn(
            'border border-gray-400 cursor-pointer p-6 text-center bg-rose-500 text-white',
            updateStats.runs === 0 && 'bg-rose-800'
          )}
          onClick={() => handleRunsClick(0)}
        >
          0
        </div>
        <div
          className={cn(
            'border border-gray-400 p-6 cursor-pointer text-center bg-sky-500 text-white',
            updateStats.runs === 1 && 'bg-sky-800'
          )}
          onClick={() => handleRunsClick(1)}
        >
          1
        </div>

        <div
          className={cn(
            'border border-gray-400 p-6 text-center cursor-pointer bg-green-500 text-white',
            updateStats.runs === 2 && 'bg-green-800'
          )}
          onClick={() => handleRunsClick(2)}
        >
          2
        </div>

        <div
          className={cn(
            'border border-gray-400 p-6 text-center bg-teal-500 cursor-pointer text-white',
            updateStats.runs === 3 && 'bg-teal-800'
          )}
          onClick={() => handleRunsClick(3)}
        >
          3
        </div>

        <div
          className={cn(
            'border border-gray-400 p-6 text-center bg-yellow-500 text-white cursor-pointer',
            updateStats.runs === 4 && 'bg-yellow-800'
          )}
          onClick={() => handleRunsClick(4)}
        >
          4
        </div>

        <div
          className={cn(
            'border border-gray-400 p-6 text-center bg-orange-500 text-white cursor-pointer',
            updateStats.runs === 6 && 'bg-orange-800'
          )}
          onClick={() => handleRunsClick(6)}
        >
          6
        </div>
        <div
          className={cn(
            'border border-gray-400 p-6 text-center bg-lime-500 text-white cursor-pointer',
            updateStats.overthrow && 'bg-lime-800'
          )}
          onClick={handleOverThrowChange}
        >
          Overthrow
        </div>
        <div
          className={cn(
            'border border-gray-400 p-6 text-center bg-rose-500 text-white cursor-pointer',
            updateStats.wide && 'bg-rose-800'
          )}
          onClick={handleWideChange}
        >
          Wide
        </div>

        <div
          className={cn(
            'border border-gray-400 p-6 text-center bg-rose-500 text-white cursor-pointer',
            updateStats.bye && 'bg-rose-800'
          )}
          onClick={() => handleByeOrlegByeChange('bye')}
        >
          Bye
        </div>
        <div
          className={cn(
            'border border-gray-400 p-6 text-center bg-rose-500 text-white cursor-pointer',
            updateStats.legBye && 'bg-rose-800'
          )}
          onClick={() => handleByeOrlegByeChange('legBye')}
        >
          Legbye
        </div>
        <div
          className={cn(
            'border border-gray-400 p-6 text-center bg-rose-500 text-white cursor-pointer',
            updateStats.noball && 'bg-rose-800'
          )}
          onClick={handleNoBallChange}
        >
          Noball
        </div>
        <div
          className='col-span-4 border border-gray-400 p-6 text-center transition-all ease-linear hover:bg-amber-400 bg-amber-500 text-white cursor-pointer'
          onClick={handleSubmit}
        >
          New Ball
        </div>
      </div>
    </div>
  )
}
