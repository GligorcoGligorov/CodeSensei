import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

type LeaderboardEntry = {
  id: number
  rank: number
  name: string
  solved: number
  score: number
}

function Leaderboard() {
  const [data, setData] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeaderboard() {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('rank')

      if (error) {
        console.error('Error fetching leaderboard:', error)
      } else {
        setData(data || [])
      }
      setLoading(false)
    }

    fetchLeaderboard()
  }, [])

  const badges: Record<number, string> = { 1: '🏆', 2: '🥈', 3: '🥉' }

  const topThreeColors: Record<number, string> = {
    1: 'bg-yellow-500/10 border-yellow-500/30',
    2: 'bg-gray-400/10 border-gray-400/30',
    3: 'bg-orange-500/10 border-orange-500/30',
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Leaderboard</h1>
        <p className="text-gray-400">Top coders this month</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-900 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Top 3 Cards */}
          <div className="flex gap-4 mb-8">
            {data.slice(0, 3).map((user) => (
              <div
                key={user.rank}
                className={`flex-1 rounded-xl p-4 border text-center ${topThreeColors[user.rank]}`}
              >
                <div className="text-3xl mb-2">{badges[user.rank]}</div>
                <p className="text-white font-bold">{user.name}</p>
                <p className="text-gray-400 text-sm">{user.solved} solved</p>
                <p className="text-purple-400 text-sm font-medium">{user.score} pts</p>
              </div>
            ))}
          </div>

          {/* Full Table */}
          <div className="flex flex-col gap-2">
            {data.map((user) => (
              <div
                key={user.rank}
                className={`flex items-center justify-between px-5 py-3 rounded-xl border transition-all ${
                  user.name === 'gish_dev'
                    ? 'bg-purple-500/10 border-purple-500/30'
                    : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-bold w-6 ${
                    user.rank === 1 ? 'text-yellow-400' :
                    user.rank === 2 ? 'text-gray-400' :
                    user.rank === 3 ? 'text-orange-400' :
                    'text-gray-600'
                  }`}>
                    {user.rank}
                  </span>
                  <span className="text-white font-medium">{user.name}</span>
                  {user.name === 'gish_dev' && (
                    <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">you</span>
                  )}
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-gray-400">{user.solved} solved</span>
                  <span className="text-purple-400 font-medium">{user.score} pts</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default Leaderboard