import { useEffect, useState } from 'react';
import './GlitchEffect.css';

interface GlitchEffectProps {
  intensity: number; // 0-5
}

export default function GlitchEffect({ intensity }: GlitchEffectProps) {
  const [glitchElements, setGlitchElements] = useState<Array<{ id: number; x: number; y: number; size: number; type: string }>>([]);

  useEffect(() => {
    if (intensity === 0) {
      setGlitchElements([]);
      return;
    }

    const interval = setInterval(() => {
      const numGlitches = intensity * 2;
      const newGlitches = Array.from({ length: numGlitches }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 20 + Math.random() * 100,
        type: Math.random() > 0.5 ? 'line' : 'block',
      }));

      setGlitchElements(newGlitches);

      setTimeout(() => {
        setGlitchElements([]);
      }, 100 + Math.random() * 200);
    }, intensity > 3 ? 500 : 1500);

    return () => clearInterval(interval);
  }, [intensity]);

  if (intensity === 0) return null;

  return (
    <>
      <div className={`glitch-overlay intensity-${intensity}`}></div>
      {glitchElements.map((glitch) => (
        <div
          key={glitch.id}
          className={`glitch-artifact ${glitch.type}`}
          style={{
            left: `${glitch.x}%`,
            top: `${glitch.y}%`,
            width: glitch.type === 'line' ? `${glitch.size}px` : `${glitch.size / 2}px`,
            height: glitch.type === 'line' ? '2px' : `${glitch.size / 3}px`,
          }}
        />
      ))}
    </>
  );
}
