import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { supabase } from '../lib/supabase'

type Challenge = {
  id: number
  title: string
  difficulty: string
  description: string
  examples: { input: string; output: string }[]
  starter_code: string
}

const difficultyColor: Record<string, string> = {
  Easy: "text-green-400 bg-green-400/10",
  Medium: "text-yellow-400 bg-yellow-400/10",
  Hard: "text-red-400 bg-red-400/10",
}

function Challenge() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState('')
  const [hint, setHint] = useState('')
  const [loadingHint, setLoadingHint] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)
  const [results, setResults] = useState<any[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchChallenge() {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching challenge:', error)
      } else {
        setChallenge(data)
        setCode(data.starter_code)
      }
      setLoading(false)
    }

    fetchChallenge()
  }, [id])

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-57px)] items-center justify-center">
        <p className="text-gray-500">Loading challenge...</p>
      </div>
    )
  }

  if (!challenge) {
    return (
      <div className="flex h-[calc(100vh-57px)] items-center justify-center">
        <p className="text-gray-500">Challenge not found.</p>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-57px)]">

      {/* Left Panel — Problem */}
      <div className="w-[45%] flex flex-col border-r border-gray-800 overflow-y-auto">

        {/* Problem Header */}
        <div className="p-6 border-b border-gray-800">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-gray-500 hover:text-white text-sm mb-4 transition-colors"
          >
            ← Back to Challenges
          </button>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-xl font-bold text-white">{challenge.title}</h1>
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${difficultyColor[challenge.difficulty]}`}>
              {challenge.difficulty}
            </span>
          </div>
        </div>

        {/* Problem Description */}
        <div className="p-6 flex flex-col gap-6">
          <p className="text-gray-300 leading-relaxed">{challenge.description}</p>

          {/* Examples */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-semibold">Examples</h3>
            {challenge.examples.map((ex, i) => (
              <div key={i} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <p className="text-sm text-gray-400 mb-1">
                  <span className="text-gray-500">Input: </span>
                  <code className="text-green-400">{ex.input}</code>
                </p>
                <p className="text-sm text-gray-400">
                  <span className="text-gray-500">Output: </span>
                  <code className="text-blue-400">{ex.output}</code>
                </p>
              </div>
            ))}
          </div>

          {/* AI Hint Section */}
          <div className="flex flex-col gap-3">
            <button
              onClick={async () => {
                setLoadingHint(true)
                setAttemptCount(prev => prev + 1)
                try {
                  const response = await fetch('http://localhost:3001/api/hint', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      challengeTitle: challenge.title,
                      description: challenge.description,
                      code: code,
                      attemptCount: attemptCount + 1,
                    }),
                  })
                  const data = await response.json()
                  setHint(data.hint)
                } catch (error) {
                  setHint('Failed to get hint. Please try again.')
                } finally {
                  setLoadingHint(false)
                }
              }}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors w-fit"
            >
              <span>✨</span>
              {loadingHint ? 'Getting hint...' : 'Get AI Hint'}
            </button>

            {hint && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <p className="text-purple-300 text-sm leading-relaxed">{hint}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel — Editor */}
      <div className="flex-1 flex flex-col">

        {/* Editor Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900">
          <select className="bg-gray-800 text-gray-300 text-sm px-3 py-1.5 rounded-lg border border-gray-700 outline-none">
            <option>JavaScript</option>
            <option>Python</option>
            <option>TypeScript</option>
          </select>
          <button
            onClick={async () => {
              setSubmitting(true)
              try {
                const response = await fetch('http://localhost:3001/api/execute', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ challengeId: id, code }),
                })
                const data = await response.json()
                setResults(data.results)
              } catch (error) {
                console.error(error)
              } finally {
                setSubmitting(false)
              }
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            {submitting ? 'Running...' : 'Submit'}
          </button>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            defaultValue={challenge.starter_code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              renderLineHighlight: 'all',
              padding: { top: 16 },
            }}
          />
        </div>

        {/* Bottom — Results Panel */}
        <div className="h-48 border-t border-gray-800 bg-gray-900 p-4 overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-gray-500 text-sm">Run your code to see results here...</p>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-gray-400 mb-1">
                {results.filter(r => r.passed).length}/{results.length} test cases passed
              </p>
              {results.map((result) => (
                <div
                  key={result.testCase}
                  className={`rounded-lg p-3 text-sm border ${
                    result.passed
                      ? 'bg-green-500/10 border-green-500/30 text-green-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>{result.passed ? '✅' : '❌'}</span>
                    <span className="font-medium">Test {result.testCase}</span>
                  </div>
                  <p className="text-xs text-gray-400">Input: {result.input}</p>
                  <p className="text-xs text-gray-400">Expected: {result.expected}</p>
                  <p className="text-xs">Output: {result.output}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Challenge