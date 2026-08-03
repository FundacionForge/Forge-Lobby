import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { AVATARS, MIN_PLAYERS } from '../lib/constants'

function getAvatarById(id) {
  return AVATARS.find(a => a.id === id) || AVATARS[0]
}

export default function LobbyScreen({ player, onGameStart }) {
  const [players, setPlayers] = useState([])
  const [countdown, setCountdown] = useState(null)
  const [copied, setCopied] = useState(false)
  const countdownRef = useRef(null)
  const channelRef = useRef(null)

  const shareUrl = `${window.location.origin}${window.location.pathname}?room=${player.roomId}`

  // Load initial players & subscribe to changes
  useEffect(() => {
    async function loadPlayers() {
      const { data } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', player.roomId)
      if (data) setPlayers(data)
    }

    loadPlayers()

    const channel = supabase
      .channel(`room-${player.roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'players',
        filter: `room_id=eq.${player.roomId}`,
      }, () => {
        loadPlayers()
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [player.roomId])

  // Watch player count → trigger countdown
  useEffect(() => {
    if (players.length >= MIN_PLAYERS && countdown === null) {
      let secs = 5
      setCountdown(secs)
      countdownRef.current = setInterval(() => {
        secs -= 1
        if (secs <= 0) {
          clearInterval(countdownRef.current)
          setCountdown(0)
          onGameStart()
        } else {
          setCountdown(secs)
        }
      }, 1000)
    }
    return () => {}
  }, [players.length])

  // Cleanup countdown on unmount
  useEffect(() => () => clearInterval(countdownRef.current), [])

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const waiting = players.length < MIN_PLAYERS
  const needed  = Math.max(0, MIN_PLAYERS - players.length)

  return (
    <div className="card" style={{ maxWidth: 600, textAlign: 'center' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: '0.65rem', letterSpacing: '0.3em', color: 'var(--text-muted)', marginBottom: 6 }}>
          SALA · {player.roomId}
        </div>
        <h2 style={{ fontSize: '1.4rem', marginBottom: 8 }}>
          {waiting ? 'Esperando jugadores...' : countdown > 0 ? `¡Ya somos suficientes!` : 'Comenzando...'}
        </h2>

        {/* Status bar */}
        {waiting ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <div className="pulse-dot" />
            Faltan <span className="neon-cyan" style={{ fontWeight: 700, margin: '0 4px' }}>{needed}</span> jugador{needed !== 1 ? 'es' : ''} más
          </div>
        ) : countdown > 0 ? (
          <div style={{ fontSize: '0.95rem', color: 'var(--neon-green)', fontWeight: 700 }}>
            El juego arranca en <span style={{ fontSize: '1.4rem' }}>{countdown}</span>s...
          </div>
        ) : null}
      </div>

      {/* Players grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
        gap: 16,
        marginBottom: 28,
        minHeight: 120,
      }}>
        {players.map((p, i) => {
          const av = getAvatarById(p.avatar_id)
          const isMe = p.id === player.id
          return (
            <div key={p.id} style={{
              background: 'var(--bg-panel)',
              border: `2px solid ${isMe ? av.color : 'var(--border)'}`,
              borderRadius: 12,
              padding: '14px 8px',
              position: 'relative',
              boxShadow: isMe ? `0 0 18px ${av.color}44` : 'none',
              animation: `fadeInUp 0.4s ease ${i * 0.1}s both`,
            }}>
              {isMe && (
                <div style={{
                  position: 'absolute', top: 6, right: 6,
                  fontSize: '0.55rem', background: av.color, color: '#000',
                  padding: '1px 5px', borderRadius: 4, fontWeight: 700,
                  fontFamily: 'Orbitron, monospace', letterSpacing: '0.05em',
                }}>
                  TÚ
                </div>
              )}
              <div className="avatar-bubble">
                <div className="avatar-emoji" style={{ fontSize: '2.2rem' }}>{av.emoji}</div>
                <div className="avatar-name" style={{ color: av.color, fontSize: '0.6rem' }}>{av.name}</div>
              </div>
              <div style={{
                fontSize: '0.8rem', fontWeight: 600, marginTop: 6,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {p.name}
              </div>
            </div>
          )
        })}

        {/* Empty slots */}
        {waiting && Array.from({ length: needed }).map((_, i) => (
          <div key={`empty-${i}`} style={{
            background: 'var(--bg-panel)',
            border: '2px dashed var(--border)',
            borderRadius: 12,
            padding: '14px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 8,
            opacity: 0.4,
          }}>
            <div style={{ fontSize: '1.8rem' }}>?</div>
            <div style={{ fontSize: '0.65rem', fontFamily: 'Orbitron', color: 'var(--text-muted)' }}>esperando</div>
          </div>
        ))}
      </div>

      {/* Share */}
      <div style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '14px 16px',
      }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.1em' }}>
          COMPARTÍ ESTE LINK CON TUS COMPAÑEROS
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{
            flex: 1, fontSize: '0.78rem', fontFamily: 'Orbitron, monospace',
            color: 'var(--neon-cyan)', overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap', letterSpacing: '0.05em',
          }}>
            ?room={player.roomId}
          </div>
          <button
            className="btn btn-ghost"
            style={{ width: 'auto', padding: '8px 16px', fontSize: '0.7rem' }}
            onClick={copyLink}
          >
            {copied ? '✓ Copiado' : 'Copiar'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
