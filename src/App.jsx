import { useState, useEffect } from 'react'
import JoinScreen from './screens/JoinScreen'
import LobbyScreen from './screens/LobbyScreen'
import GameScreen from './screens/GameScreen'
import ResultsScreen from './screens/ResultsScreen'
import './App.css'

export default function App() {
  const [screen, setScreen] = useState('join') // join | lobby | game | results
  const [player, setPlayer] = useState(null)    // { id, name, avatar, roomId }
  const [roomId, setRoomId] = useState(null)
  const [finalScores, setFinalScores] = useState([])

  // Parse roomId from URL ?room=XXXX
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const room = params.get('room')
    if (room) setRoomId(room.toUpperCase())
  }, [])

  function handleJoined(playerData) {
    setPlayer(playerData)
    setScreen('lobby')
  }

  function handleGameStart() {
    setScreen('game')
  }

  function handleGameEnd(scores) {
    setFinalScores(scores)
    setScreen('results')
  }

  function handleRestart() {
    setPlayer(null)
    setFinalScores([])
    setScreen('join')
  }

  return (
    <div className="app">
      {screen === 'join' && (
        <JoinScreen roomId={roomId} onJoined={handleJoined} />
      )}
      {screen === 'lobby' && (
        <LobbyScreen player={player} onGameStart={handleGameStart} />
      )}
      {screen === 'game' && (
        <GameScreen player={player} onGameEnd={handleGameEnd} />
      )}
      {screen === 'results' && (
        <ResultsScreen player={player} scores={finalScores} onRestart={handleRestart} />
      )}
    </div>
  )
}
