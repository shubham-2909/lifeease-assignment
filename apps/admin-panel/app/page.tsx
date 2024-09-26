'use client'
import { useEffect, useState } from 'react'
import { CurrentStats } from '@repo/common/CurrentStats'
import { UpdateStatType } from '@repo/common/UpdateStatType'
import customFetch from '@/lib/axios'
import { MatchStats } from '@/components/MatchStats'
import { MatchUpdate } from '@/components/MatchUpdate'
import { LoadingSpinner } from '@/components/Loading'
export default function page() {
  const [striker, setStriker] = useState('')
  const [nonStriker, setNonStriker] = useState('')
  const [bowler, setBowler] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentStats, setCurrentStats] = useState<CurrentStats | null>(null)
  const [updateStats, setUpdateStats] = useState<UpdateStatType>({
    runs: 0,
    wide: false,
    overthrow: false,
    noball: false,
    bye: false,
    legBye: false,
  })
  useEffect(() => {
    setLoading(true)
    customFetch.get('/teams/get-stats').then((resp) => {
      const dataFromServer = resp.data as CurrentStats
      setCurrentStats(resp.data as CurrentStats)
      setStriker(dataFromServer.playerStats.striker.name)
      setNonStriker(dataFromServer.playerStats.nonStriker.name)
      setBowler(dataFromServer.playerStats.bowler.name)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <LoadingSpinner />
  } else if (!currentStats) {
    return <h1>Error</h1>
  }
  return (
    <main className='h-screen p-4 grid grid-cols-2'>
      <MatchUpdate
        striker={striker}
        nonStriker={nonStriker}
        bowler={bowler}
        setCurrentStats={setCurrentStats}
        updateStats={updateStats}
        setUpdateStats={setUpdateStats}
        setLoading={setLoading}
      />
      <MatchStats stats={currentStats} />
    </main>
  )
}
