import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { AVATARS } from '../lib/constants'

function getAvatarById(id) {
  return AVATARS.find(a => a.id === id) || AVATARS[0]
}

const MEDALS = ['🥇', '🥈', '🥉']

export default function ResultsScreen({ player, scores: initialScores, onRestart }) {
  const [scores, setScores] = useState(initialScores || [])

  // Poll for latecomers finishing
  useEffect(() => {
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', player.roomId)
        .order('score', { ascending: false })
      if (data) setScores(data)
    }, 3000)
    return () => clearInterval(interval)
  }, [player.roomId])

  const myRank = scores.findIndex(p => p.id === player.id) + 1
  const myScore = scores.find(p => p.id === player.id)?.score || 0

  return (
    <div className="card" style={{ maxWidth: 520, textAlign: 'center' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: '0.65rem', letterSpacing: '0.3em', color: 'var(--text-muted)', marginBottom: 8 }}>
          FIN DEL JUEGO
        </div>
        <h2 style={{ fontSize: '1.8rem', marginBottom: 12 }}>
          {myRank === 1 ? '¡Ganaste! 🏆' : myRank === 2 ? '¡Segundo lugar! 🥈' : '¡Buen juego!'}
        </h2>
        <div style={{
          display: 'inline-block',
          background: 'var(--bg-panel)',
          border: '1px solid var(--accent)',
          borderRadius: 10,
          padding: '10px 24px',
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.15em' }}>TU PUNTAJE</div>
          <div style={{
            fontFamily: 'Orbitron', fontSize: '2rem', fontWeight: 900,
            color: 'var(--accent-glow)', textShadow: '0 0 15px var(--accent-glow)',
          }}>
            {myScore}
          </div>
        </div>
      </div>

      {/* Ranking */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {scores.map((p, i) => {
          const av = getAvatarById(p.avatar_id)
          const isMe = p.id === player.id
          return (
            <div key={p.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              background: isMe ? `${av.color}18` : 'var(--bg-panel)',
              border: `2px solid ${isMe ? av.color : 'var(--border)'}`,
              borderRadius: 10,
              padding: '12px 16px',
              textAlign: 'left',
              boxShadow: isMe ? `0 0 16px ${av.color}33` : 'none',
              animation: `fadeInUp 0.4s ease ${i * 0.1}s both`,
            }}>
              <div style={{ fontSize: '1.3rem', width: 32, textAlign: 'center' }}>
                {MEDALS[i] || `#${i + 1}`}
              </div>
              <div style={{ fontSize: '1.5rem' }}>{av.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                  {p.name}
                  {isMe && <span style={{
                    marginLeft: 8, fontSize: '0.6rem', background: av.color,
                    color: '#000', padding: '1px 6px', borderRadius: 4,
                    fontFamily: 'Orbitron', fontWeight: 700,
                  }}>TÚ</span>}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{av.name}</div>
              </div>
              <div style={{
                fontFamily: 'Orbitron', fontWeight: 700,
                fontSize: '1.1rem', color: av.color,
              }}>
                {p.score}
              </div>
              {p.status !== 'done' && (
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>jugando...</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <button className="btn btn-primary" onClick={onRestart}>
        JUGAR DE NUEVO
      </button>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
