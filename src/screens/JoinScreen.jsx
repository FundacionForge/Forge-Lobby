import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { getRandomAvatar, generateSessionId } from '../lib/constants'

export default function JoinScreen({ roomId: presetRoomId, onJoined }) {
  const [name, setName] = useState('')
  const [roomCode, setRoomCode] = useState(presetRoomId || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(getRandomAvatar())

  async function handleJoin(e) {
    e.preventDefault()
    if (!name.trim()) return setError('Escribí tu nombre para continuar')

    setLoading(true)
    setError('')

    try {
      const finalRoom = roomCode.trim().toUpperCase() || generateSessionId()
      const avatar = preview

      // Upsert player into DB
      const { data, error: dbError } = await supabase
        .from('players')
        .insert({
          name: name.trim(),
          avatar_id: avatar.id,
          room_id: finalRoom,
          score: 0,
          status: 'waiting',
        })
        .select()
        .single()

      if (dbError) throw dbError

      // Share room URL
      const url = new URL(window.location.href)
      url.searchParams.set('room', finalRoom)
      window.history.replaceState({}, '', url)

      onJoined({ id: data.id, name: data.name, avatar, roomId: finalRoom })
    } catch (err) {
      console.error(err)
      setError('Algo salió mal. Revisá tu conexión e intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      {/* Logo */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: '0.7rem', letterSpacing: '0.3em', color: 'var(--text-muted)', marginBottom: 4 }}>
          FORGE / DINÁMICA
        </div>
        <h1 style={{ fontSize: '1.6rem', color: 'var(--accent-glow)' }}>
          THE<br/>LOBBY
        </h1>
      </div>

      {/* Avatar preview */}
      <div
        style={{
          background: 'var(--bg-panel)',
          border: `2px solid ${preview.color}`,
          borderRadius: 16,
          padding: '20px 16px',
          marginBottom: 24,
          boxShadow: `0 0 24px ${preview.color}33`,
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setPreview(getRandomAvatar())}
        title="Clic para cambiar avatar"
      >
        <div className="avatar-bubble">
          <div className="avatar-emoji">{preview.emoji}</div>
          <div className="avatar-name" style={{ color: preview.color }}>{preview.name}</div>
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 10 }}>
          toca para cambiar avatar
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          className="input"
          placeholder="Tu nombre o apodo"
          value={name}
          maxLength={20}
          onChange={e => setName(e.target.value)}
          autoFocus
        />

        <input
          className="input"
          placeholder="Código de sala (opcional)"
          value={roomCode}
          maxLength={6}
          onChange={e => setRoomCode(e.target.value.toUpperCase())}
          style={{ letterSpacing: '0.15em', fontFamily: 'Orbitron, monospace', fontSize: '1rem' }}
        />

        {error && (
          <div style={{ color: 'var(--neon-pink)', fontSize: '0.85rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <button className="btn btn-primary" type="submit" disabled={loading || !name.trim()}>
          {loading ? 'Entrando...' : 'ENTRAR AL LOBBY ›'}
        </button>
      </form>

      <div style={{ marginTop: 16, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
        Si no tenés código, se crea una sala nueva automáticamente.
      </div>
    </div>
  )
}
