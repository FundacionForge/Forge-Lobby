import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { QUESTIONS } from '../lib/constants'

const RADIUS = 36
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function GameScreen({ player, onGameEnd }) {
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [timeLeft, setTimeLeft] = useState(QUESTIONS[0].timeLimit)
  const [score, setScore] = useState(0)
  const [pointsEarned, setPointsEarned] = useState(null)
  const timerRef = useRef(null)

  const question = QUESTIONS[qIndex]

  // Timer per question
  useEffect(() => {
    setTimeLeft(question.timeLimit)
    setSelected(null)
    setRevealed(false)
    setPointsEarned(null)

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleReveal(null)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [qIndex])

  function handleSelect(optId) {
    if (selected || revealed) return
    clearInterval(timerRef.current)
    setSelected(optId)
    handleReveal(optId)
  }

  function handleReveal(optId) {
    setRevealed(true)
    const isCorrect = optId === question.correctId
    const pts = isCorrect ? Math.max(100, timeLeft * 10) : 0
    if (pts > 0) {
      setScore(prev => prev + pts)
      setPointsEarned(pts)
    }
  }

  async function handleNext() {
    const nextIndex = qIndex + 1
    if (nextIndex >= QUESTIONS.length) {
      // Save final score
      const finalScore = score + (pointsEarned || 0)

      // Recompute to avoid stale closure
      const correctNow = selected === question.correctId
      const pts = correctNow ? Math.max(100, timeLeft * 10) : 0
      const realScore = score + pts

      await supabase
        .from('players')
        .update({ score: realScore, status: 'done' })
        .eq('id', player.id)

      // Load all scores
      const { data } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', player.roomId)
        .order('score', { ascending: false })

      onGameEnd(data || [])
    } else {
      setQIndex(nextIndex)
    }
  }

  const progress = timeLeft / question.timeLimit
  const dashOffset = CIRCUMFERENCE * (1 - progress)
  const timerColor = timeLeft > 10 ? '#39ff14' : timeLeft > 5 ? '#FFD700' : '#ff006e'

  return (
    <div className="card" style={{ maxWidth: 580 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: 'var(--text-muted)' }}>
            PREGUNTA {qIndex + 1} / {QUESTIONS.length}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            {QUESTIONS.map((_, i) => (
              <div key={i} style={{
                height: 4, width: 28, borderRadius: 2,
                background: i <= qIndex ? 'var(--accent-glow)' : 'var(--border)',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
        </div>

        {/* Timer ring */}
        <div style={{ position: 'relative', width: 90, height: 90 }}>
          <svg width="90" height="90" className="timer-ring">
            <circle cx="45" cy="45" r={RADIUS} fill="none" stroke="var(--border)" strokeWidth="5" />
            <circle
              cx="45" cy="45" r={RADIUS} fill="none"
              stroke={timerColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ filter: `drop-shadow(0 0 6px ${timerColor})`, transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Orbitron, monospace', fontSize: '1.3rem', fontWeight: 900,
            color: timerColor, textShadow: `0 0 10px ${timerColor}`,
          }}>
            {timeLeft}
          </div>
        </div>
      </div>

      {/* Question */}
      <div style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '18px 20px',
        marginBottom: 20,
        fontSize: '1.05rem',
        fontWeight: 600,
        lineHeight: 1.5,
      }}>
        {question.text}
      </div>

      {/* Options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {question.options.map((opt, i) => {
          const isSelected  = selected === opt.id
          const isCorrect   = opt.id === question.correctId
          const COLORS = ['#7c3aed', '#00CED1', '#FF6B35', '#32CD32']

          let bg = 'var(--bg-panel)'
          let border = 'var(--border)'
          let textColor = 'var(--text)'

          if (revealed) {
            if (isCorrect) { bg = '#14532d'; border = '#39ff14'; textColor = '#39ff14' }
            else if (isSelected && !isCorrect) { bg = '#450a0a'; border = '#ff006e'; textColor = '#ff006e' }
            else { opacity: 0.5 }
          } else if (isSelected) {
            border = COLORS[i]
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              style={{
                background: bg,
                border: `2px solid ${border}`,
                borderRadius: 10,
                padding: '14px 12px',
                color: textColor,
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: revealed ? 'default' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.25s',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                lineHeight: 1.3,
              }}
            >
              <span style={{
                width: 26, height: 26, borderRadius: 6,
                background: revealed && isCorrect ? '#39ff14' : revealed && isSelected ? '#ff006e' : COLORS[i],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontFamily: 'Orbitron', fontWeight: 700,
                color: '#000', flexShrink: 0,
              }}>
                {opt.id.toUpperCase()}
              </span>
              {opt.text}
            </button>
          )
        })}
      </div>

      {/* Points feedback */}
      {pointsEarned && (
        <div style={{
          textAlign: 'center', marginBottom: 12,
          fontSize: '1.1rem', fontFamily: 'Orbitron', fontWeight: 700,
          color: 'var(--neon-green)',
          textShadow: '0 0 10px var(--neon-green)',
          animation: 'fadeInUp 0.3s ease',
        }}>
          +{pointsEarned} puntos ⚡
        </div>
      )}

      {/* Score */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: '1px solid var(--border)', paddingTop: 16,
      }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {player.avatar.emoji} {player.name}
        </div>
        <div style={{ fontFamily: 'Orbitron', fontWeight: 700, color: 'var(--accent-glow)' }}>
          {score} pts
        </div>
      </div>

      {revealed && (
        <button
          className="btn btn-primary"
          style={{ marginTop: 16 }}
          onClick={handleNext}
        >
          {qIndex + 1 >= QUESTIONS.length ? 'VER RESULTADOS ›' : 'SIGUIENTE ›'}
        </button>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
