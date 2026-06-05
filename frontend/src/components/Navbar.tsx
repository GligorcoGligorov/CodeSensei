import { useNavigate } from 'react-router-dom'
function Navbar() {
  const navigate = useNavigate()
  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-purple-400 font-bold text-xl">CodeSensei</span>
        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">beta</span>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-400">
        <span onClick={() => navigate('/')} className="hover:text-white cursor-pointer">Challenges</span>
        <span onClick={() => navigate('/leaderboard')} className="hover:text-white cursor-pointer">Leaderboard</span>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-lg text-sm">
          Sign In
        </button>
      </div>
    </nav>
  )
}

export default Navbar