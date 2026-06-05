import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type Challenge = {
  id: number
  title: string
  difficulty: string
  category: string
}

const difficultyColor: Record<string, string> = {
  Easy: "text-green-400 bg-green-400/10",
  Medium: "text-yellow-400 bg-yellow-400/10",
  Hard: "text-red-400 bg-red-400/10",
}

function Home() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('All')
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchChallenges() {
      const { data, error } = await supabase
        .from('challenges')
        .select('id, title, difficulty, category')
        .order('id')

      if (error) {
        console.error('Error fetching challenges:', error)
      } else {
        setChallenges(data || [])
      }
      setLoading(false)
    }

    fetchChallenges()
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Challenges</h1>
        <p className="text-gray-400">Practice coding problems with your AI mentor</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {["All", "Easy", "Medium", "Hard"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
              filter === f
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-purple-600 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Challenge List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-900 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {challenges
            .filter(c => filter === 'All' || c.difficulty === filter)
            .map((challenge) => (
              <div
                key={challenge.id}
                onClick={() => navigate(`/challenge/${challenge.id}`)}
                className="flex items-center justify-between bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-purple-500/50 rounded-xl px-6 py-4 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className="text-gray-600 text-sm w-6">{challenge.id}</span>
                  <span className="text-white font-medium">{challenge.title}</span>
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                    {challenge.category}
                  </span>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${difficultyColor[challenge.difficulty]}`}>
                  {challenge.difficulty}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

export default Home