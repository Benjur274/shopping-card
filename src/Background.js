import { useState, useEffect } from 'react';

const THEMES = [
  {
    gradient: 'linear-gradient(135deg, #f9a8d4 0%, #c084fc 50%, #818cf8 100%)',
    emojis: ['🌸', '🌺', '🌷', '🍃', '🦋', '🌸', '🌷'],
  },
  {
    gradient: 'linear-gradient(135deg, #fde68a 0%, #6ee7b7 50%, #67e8f9 100%)',
    emojis: ['🌻', '🌼', '☀️', '🌿', '🐝', '🌻', '🌈'],
  },
  {
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f97316 40%, #dc2626 100%)',
    emojis: ['🍂', '🍁', '🍂', '🍁', '🌾', '🎃', '🦔'],
  },
  {
    gradient: 'linear-gradient(135deg, #bfdbfe 0%, #c7d2fe 40%, #ddd6fe 100%)',
    emojis: ['❄️', '⛄', '✨', '❄️', '🌨', '✨', '🦌'],
  },
];

function getCurrentSeason() {
  const m = new Date().getMonth();
  if (m >= 2 && m <= 4) return 0; // jar
  if (m >= 5 && m <= 7) return 1; // leto
  if (m >= 8 && m <= 10) return 2; // jeseň
  return 3;                         // zima
}

function makeParticles(emojis) {
  return Array.from({ length: 18 }, (_, i) => ({
    id: i,
    emoji: emojis[i % emojis.length],
    left: Math.random() * 100,
    size: 18 + Math.random() * 22,
    duration: 9 + Math.random() * 10,
    delay: -(Math.random() * 15), // záporný delay = hneď viditeľné od startu
    sway: (Math.random() * 80 - 40).toFixed(0),
    swayNeg: (Math.random() * -80 + 40).toFixed(0),
  }));
}

export default function Background({ onGradientChange }) {
  const [themeIdx, setThemeIdx] = useState(getCurrentSeason);
  const [particles, setParticles] = useState(() => makeParticles(THEMES[getCurrentSeason()].emojis));
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    onGradientChange?.(THEMES[themeIdx].gradient);
  }, [themeIdx, onGradientChange]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setThemeIdx((i) => {
          const next = (i + 1) % THEMES.length;
          setParticles(makeParticles(THEMES[next].emojis));
          return next;
        });
        setTransitioning(false);
      }, 800);
    }, 40000);
    return () => clearInterval(timer);
  }, []);

  const theme = THEMES[themeIdx];

  return (
    <div
      className={`bg-layer${transitioning ? ' bg-fade' : ''}`}
      style={{ background: theme.gradient }}
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            '--sway': `${p.sway}px`,
            '--sway-neg': `${p.swayNeg}px`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
