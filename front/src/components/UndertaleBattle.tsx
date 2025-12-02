import { useState, useEffect, useCallback } from 'react';
import './UndertaleBattle.css';

interface UndertaleBattleProps {
  onBattleComplete: () => void;
}

export default function UndertaleBattle({ onBattleComplete }: UndertaleBattleProps) {
  const [phase, setPhase] = useState<'intro' | 'battle' | 'victory'>('intro');
  const [playerHP, setPlayerHP] = useState(20);
  const [playerX, setPlayerX] = useState(50);
  const [playerY, setPlayerY] = useState(50);
  const [attacks, setAttacks] = useState<Array<{ id: number; x: number; y: number; vx: number; vy: number }>>([]);
  const [dodgeCount, setDodgeCount] = useState(0);
  const [message, setMessage] = useState("* L'IA vous affronte !");

  const BATTLE_DURATION = 30000; // 30 seconds
  const REQUIRED_DODGES = 15;

  // Generate attacks
  useEffect(() => {
    if (phase !== 'battle') return;

    const interval = setInterval(() => {
      const newAttack = {
        id: Date.now() + Math.random(),
        x: Math.random() * 100,
        y: Math.random() > 0.5 ? -5 : 105,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() > 0.5 ? 2 : -2,
      };
      setAttacks(prev => [...prev, newAttack]);
    }, 800);

    return () => clearInterval(interval);
  }, [phase]);

  // Move attacks
  useEffect(() => {
    if (phase !== 'battle') return;

    const interval = setInterval(() => {
      setAttacks(prev => {
        const updated = prev
          .map(attack => ({
            ...attack,
            x: attack.x + attack.vx,
            y: attack.y + attack.vy,
          }))
          .filter(attack => 
            attack.x >= -10 && attack.x <= 110 &&
            attack.y >= -10 && attack.y <= 110
          );

        // Check collisions
        updated.forEach(attack => {
          const dx = attack.x - playerX;
          const dy = attack.y - playerY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 5) {
            setPlayerHP(prev => Math.max(0, prev - 2));
            setMessage("* Vous êtes touché !");
          }
        });

        return updated;
      });

      setDodgeCount(prev => prev + 1);
    }, 50);

    return () => clearInterval(interval);
  }, [phase, playerX, playerY]);

  // Handle keyboard movement
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (phase !== 'battle') return;

    const speed = 3;
    switch (e.key) {
      case 'ArrowLeft':
        setPlayerX(prev => Math.max(5, prev - speed));
        break;
      case 'ArrowRight':
        setPlayerX(prev => Math.min(95, prev + speed));
        break;
      case 'ArrowUp':
        setPlayerY(prev => Math.max(5, prev - speed));
        break;
      case 'ArrowDown':
        setPlayerY(prev => Math.min(95, prev + speed));
        break;
    }
  }, [phase]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Battle timer
  useEffect(() => {
    if (phase !== 'battle') return;

    const timeout = setTimeout(() => {
      if (playerHP > 0 && dodgeCount >= REQUIRED_DODGES) {
        setPhase('victory');
        setMessage("* Vous avez survécu !");
        setTimeout(onBattleComplete, 3000);
      } else if (playerHP > 0) {
        setPhase('victory');
        setMessage("* L'IA se calme... pour l'instant.");
        setTimeout(onBattleComplete, 3000);
      }
    }, BATTLE_DURATION);

    return () => clearTimeout(timeout);
  }, [phase, playerHP, dodgeCount, onBattleComplete]);

  // Game over
  useEffect(() => {
    if (playerHP <= 0 && phase === 'battle') {
      setMessage("* Vous êtes mort...");
      setTimeout(() => {
        setPlayerHP(20);
        setDodgeCount(0);
        setAttacks([]);
        setPhase('battle');
        setMessage("* Réessayez !");
      }, 2000);
    }
  }, [playerHP, phase]);

  // Start battle
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPhase('battle');
      setMessage("* Esquivez les attaques ! (Flèches directionnelles)");
    }, 3000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="undertale-battle">
      <div className="battle-ui">
        <div className="battle-message">{message}</div>
        
        <div className="battle-stats">
          <div className="player-name">VISITEUR</div>
          <div className="hp-bar">
            <span className="hp-label">HP</span>
            <div className="hp-container">
              <div className="hp-fill" style={{ width: `${(playerHP / 20) * 100}%` }}></div>
            </div>
            <span className="hp-text">{playerHP} / 20</span>
          </div>
        </div>

        {phase === 'battle' && (
          <div className="battle-box">
            {/* Player heart */}
            <div 
              className="player-heart" 
              style={{ left: `${playerX}%`, top: `${playerY}%` }}
            >
              ♥
            </div>

            {/* Attack projectiles */}
            {attacks.map(attack => (
              <div
                key={attack.id}
                className="attack-bone"
                style={{ left: `${attack.x}%`, top: `${attack.y}%` }}
              />
            ))}
          </div>
        )}

        {phase === 'victory' && (
          <div className="victory-message">
            <p>VICTOIRE !</p>
          </div>
        )}
      </div>
    </div>
  );
}
