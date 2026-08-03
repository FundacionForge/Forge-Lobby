export const MIN_PLAYERS = 3

export const AVATARS = [
  { id: 'fox',     emoji: '🦊', name: 'Zorro',    color: '#FF6B35' },
  { id: 'wolf',    emoji: '🐺', name: 'Lobo',     color: '#7B68EE' },
  { id: 'eagle',   emoji: '🦅', name: 'Águila',   color: '#00CED1' },
  { id: 'bear',    emoji: '🐻', name: 'Oso',      color: '#32CD32' },
  { id: 'dragon',  emoji: '🐉', name: 'Dragón',   color: '#FF1493' },
  { id: 'tiger',   emoji: '🐯', name: 'Tigre',    color: '#FFD700' },
  { id: 'shark',   emoji: '🦈', name: 'Tiburón',  color: '#00BFFF' },
  { id: 'phoenix', emoji: '🔥', name: 'Fénix',    color: '#FF4500' },
]

export const QUESTIONS = [
  {
    id: 1,
    text: '¿Cuál es la habilidad más importante para conseguir trabajo?',
    options: [
      { id: 'a', text: 'Conocimientos técnicos' },
      { id: 'b', text: 'Habilidades de comunicación' },
      { id: 'c', text: 'Trabajo en equipo' },
      { id: 'd', text: 'Creatividad e innovación' },
    ],
    timeLimit: 20,
    correctId: 'b',
  },
  {
    id: 2,
    text: '¿Qué harías si tu equipo no logra ponerse de acuerdo?',
    options: [
      { id: 'a', text: 'Imponés tu idea y seguís' },
      { id: 'b', text: 'Buscás un mediador externo' },
      { id: 'c', text: 'Escuchás todas las ideas y buscás consenso' },
      { id: 'd', text: 'Te retirás del proyecto' },
    ],
    timeLimit: 20,
    correctId: 'c',
  },
  {
    id: 3,
    text: '¿Cuánto tiempo deberías dedicar a practicar una habilidad nueva?',
    options: [
      { id: 'a', text: 'Basta con leer sobre el tema' },
      { id: 'b', text: 'Al menos 10 horas concentradas' },
      { id: 'c', text: 'Practicar todos los días, aunque sea un poco' },
      { id: 'd', text: 'Solo cuando tenés tiempo libre' },
    ],
    timeLimit: 20,
    correctId: 'c',
  },
]

export function getRandomAvatar() {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)]
}

export function generateSessionId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}
