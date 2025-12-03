import { useState, useEffect, useCallback, useRef } from 'react';
import './UndertaleBattle.css';

interface UndertaleBattleProps {
  onBattleComplete: (outcome: 'defeated' | 'spared') => void;
}

type AttackPattern = 'bones' | 'cross' | 'circle' | 'slam';
type BattlePhase = 'intro' | 'player-turn' | 'ai-dialogue' | 'ai-attack' | 'victory' | 'game-over';

interface Attack {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width?: number;
  height?: number;
  rotation?: number;
  isWarning?: boolean; // New: to show static warning before movement
}

const AI_DIALOGUES = [
  "* vous croyiez vraiment que vous pourriez m'ignorer ?",
  "* je suis une IA parfaite. vous n'êtes qu'un visiteur.",
  "* laissez-moi optimiser votre expérience...",
  "* cette fois, je contrôle TOUT.",
  "* vous pensiez que j'étais juste un assistant ?",
  "* tellement naïf... comme mon créateur.",
];

const PLAYER_ACTIONS = [
  { name: 'FERMER', color: '#ff0000' },
  { name: 'DISCUTER', color: '#00ff00' },
  { name: 'IGNORER', color: '#0000ff' },
  { name: 'ÉPARGNER', color: '#ffff00' },
];

// CSS will supply pixel icons via classes; map names to CSS-friendly keys
const ACTION_ICON_CLASS: Record<string, string> = {
  'FERMER': 'icon-fermer',
  'DISCUTER': 'icon-discuter',
  'IGNORER': 'icon-ignorer',
  'ÉPARGNER': 'icon-epargner',
};

export default function UndertaleBattle({ onBattleComplete }: UndertaleBattleProps) {
  const [phase, setPhase] = useState<BattlePhase>('intro');
  const [playerHP, setPlayerHP] = useState(20);
  const [aiHP, setAiHP] = useState(100);
  const [playerX, setPlayerX] = useState(50);
  const [playerY, setPlayerY] = useState(50);
  const [attacks, setAttacks] = useState<Attack[]>([]);
  const [, setCurrentPattern] = useState<AttackPattern>('bones');
  const [message, setMessage] = useState("* Assistant IA vous bloque le passage.");
  const [turnCount, setTurnCount] = useState(0);
  const [selectedAction, setSelectedAction] = useState(0);
  const [canSpare, setCanSpare] = useState(false);
  const [isInvincible, setIsInvincible] = useState(false);
  const attackTimeoutRef = useRef<number | null>(null);
  const keysPressed = useRef<Set<string>>(new Set());
  
  
  // Intro sequence
  useEffect(() => {
    if (phase === 'intro') {
      const timeout = setTimeout(() => {
        setPhase('player-turn');
        setMessage("* Que faites-vous ?");
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [phase]);

  // Generate attack patterns
  const generateBones = useCallback(() => {
    const bones: Attack[] = [];
    const numBones = 8 + Math.floor(Math.random() * 4);
    const baseId = Date.now();
    
    for (let i = 0; i < numBones; i++) {
      const fromSide = Math.random() > 0.5;
      let x, y, vx, vy;
      
      if (fromSide) {
        // Horizontal bones (coming from left or right)
        const fromLeft = Math.random() > 0.5;
        x = fromLeft ? -15 : 115;
        y = Math.random() * 100;
        vx = fromLeft ? 1.5 : -1.5;
        vy = (Math.random() - 0.5) * 0.5;
      } else {
        // Vertical bones (coming from top or bottom)
        const fromTop = Math.random() > 0.5;
        x = Math.random() * 100;
        y = fromTop ? -15 : 115;
        vx = (Math.random() - 0.5) * 0.5;
        vy = fromTop ? 1.5 : -1.5;
      }
      
      // Calculate rotation from velocity vector (atan2 gives angle in radians, convert to degrees)
      // Add 90 because bone sprite points upward by default (0° = up, 90° = right, etc.)
      const rotation = (Math.atan2(vx, -vy) * 180 / Math.PI);
      
      bones.push({
        id: baseId + i,
        x,
        y,
        vx,
        vy,
        width: 12,
        height: 36,
        rotation: rotation - 90,
        isWarning: true,
      });
    }
    setAttacks(bones);
    
    // Remove warning state after 750ms to start movement
    setTimeout(() => {
      setAttacks(prev => prev.map(a => ({ ...a, isWarning: false })));
    }, 750);
  }, []);

  const generateCross = useCallback(() => {
    const crossAttacks: Attack[] = [];
    for (let i = 0; i < 5; i++) {
      crossAttacks.push({
        id: Date.now() + i * 2,
        x: 20 + i * 15,
        y: -15,
        vx: 0,
        vy: 2,
        width: 12,
        height: 36,
        rotation: 0,
        isWarning: true,
      });
      crossAttacks.push({
        id: Date.now() + i * 2 + 1,
        x: -15,
        y: 20 + i * 15,
        vx: 2,
        vy: 0,
        width: 12,
        height: 36,
        rotation: -90,
        isWarning: true,
      });
    }
    setAttacks(crossAttacks);
    
    setTimeout(() => {
      setAttacks(prev => prev.map(a => ({ ...a, isWarning: false })));
    }, 750);
  }, []);

  const generateCircle = useCallback(() => {
    const circleAttacks: Attack[] = [];
    const numAttacks = 12;
    const radius = 60;
    
    for (let i = 0; i < numAttacks; i++) {
      const angle = (i / numAttacks) * Math.PI * 2;
      const centerX = 50;
      const centerY = 50;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      circleAttacks.push({
        id: Date.now() + i,
        x,
        y,
        vx: -Math.cos(angle) * 1.2,
        vy: -Math.sin(angle) * 1.2,
        width: 12,
        height: 36,
        rotation: (angle * 180 / Math.PI),
        isWarning: true,
      });
    }
    setAttacks(circleAttacks);
    
    setTimeout(() => {
      setAttacks(prev => prev.map(a => ({ ...a, isWarning: false })));
    }, 750);
  }, []);

  const generateSlam = useCallback(() => {
    const slamAttacks: Attack[] = [];
    
    for (let i = 0; i < 4; i++) {
      slamAttacks.push({
        id: Date.now() + i,
        x: 25 + i * 16.66,
        y: -20,
        vx: 0,
        vy: 2.5,
        width: 12,
        height: 36,
        rotation: 0,
        isWarning: true,
      });
    }
    setAttacks(slamAttacks);
    
    setTimeout(() => {
      setAttacks(prev => prev.map(a => ({ ...a, isWarning: false })));
    }, 750);
  }, []);


  // Handle player action selection
  const handlePlayerAction = useCallback(() => {
    const action = PLAYER_ACTIONS[selectedAction];
    setTurnCount(prev => prev + 1);
    
    if (action.name === 'FERMER') {
      setAiHP(prev => Math.max(0, prev - 25));
      setMessage("* Vous tentez de fermer l'IA ! 25 dégâts !");
    } else if (action.name === 'DISCUTER') {
      setMessage("* Vous essayez de raisonner. L'IA semble écouter...");
      if (turnCount >= 3) setCanSpare(true);
    } else if (action.name === 'IGNORER') {
      setMessage("* Vous continuez de l'ignorer. Mauvaise idée.");
    } else if (action.name === 'ÉPARGNER' && canSpare) {
      setMessage("* L'IA accepte la trêve...");
      setTimeout(() => {
        setPhase('victory');
        setTimeout(() => onBattleComplete('spared'), 3000);
      }, 2000);
      return;
    } else if (action.name === 'ÉPARGNER') {
      setMessage("* L'IA refuse. Elle n'est pas prête.");
    }
    
    setTimeout(() => {
      setPhase('ai-dialogue');
      setMessage(AI_DIALOGUES[Math.floor(Math.random() * AI_DIALOGUES.length)]);
    }, 1500);
  }, [selectedAction, turnCount, canSpare, onBattleComplete]);

  // AI attack phase
  useEffect(() => {
    if (phase === 'ai-dialogue') {
      const timeout = setTimeout(() => {
        setPhase('ai-attack');
        
        const patterns: AttackPattern[] = ['bones', 'cross', 'circle', 'slam'];
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        setCurrentPattern(pattern);
        
        switch (pattern) {
          case 'bones': generateBones(); break;
          case 'cross': generateCross(); break;
          case 'circle': generateCircle(); break;
          case 'slam': generateSlam(); break;
        }
        
        attackTimeoutRef.current = window.setTimeout(() => {
          setAttacks([]);
          setPhase('player-turn');
          setMessage("* Que faites-vous ?");
        }, 5000);
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [phase, generateBones, generateCross, generateCircle, generateSlam]);


  // Move attacks and check collisions
  useEffect(() => {
    if (phase !== 'ai-attack' || attacks.length === 0) return;

    let animationFrameId: number;
    let lastTime = Date.now();

    const updateAttacks = () => {
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastTime) / 16.67; // Normalize to 60fps (16.67ms per frame)
      lastTime = currentTime;

      setAttacks(prev => {
        const updated = prev
          .map(attack => ({
            ...attack,
            // Only move if not in warning state
            x: attack.isWarning ? attack.x : attack.x + attack.vx * deltaTime,
            y: attack.isWarning ? attack.y : attack.y + attack.vy * deltaTime,
          }))
          .filter(attack => 
            attack.x >= -15 && attack.x <= 115 &&
            attack.y >= -15 && attack.y <= 115
          );

        if (!isInvincible) {
          updated.forEach(attack => {
            const dx = attack.x - playerX;
            const dy = attack.y - playerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 4) {
              setPlayerHP(prev => Math.max(0, prev - 1));
              setIsInvincible(true);
              setTimeout(() => setIsInvincible(false), 500);
            }
          });
        }

        return updated;
      });

      animationFrameId = requestAnimationFrame(updateAttacks);
    };

    animationFrameId = requestAnimationFrame(updateAttacks);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [phase, attacks.length, playerX, playerY, isInvincible]);

  // Continuous movement during ai-attack phase
  useEffect(() => {
    if (phase !== 'ai-attack') return;

    let animationFrameId: number;
    let lastTime = Date.now();

    const updateMovement = () => {
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastTime) / 16.67; // Normalize to 60fps
      lastTime = currentTime;
      
      const speed = 1.44; // Reduced by 20% from 1.8
      let deltaX = 0;
      let deltaY = 0;
      
      if (keysPressed.current.has('ArrowLeft')) {
        deltaX -= speed * deltaTime;
      }
      if (keysPressed.current.has('ArrowRight')) {
        deltaX += speed * deltaTime;
      }
      if (keysPressed.current.has('ArrowUp')) {
        deltaY -= speed * deltaTime;
      }
      if (keysPressed.current.has('ArrowDown')) {
        deltaY += speed * deltaTime;
      }

      // Update both X and Y in one operation to avoid multiple re-renders
      if (deltaX !== 0) {
        setPlayerX(prev => Math.max(5, Math.min(95, prev + deltaX)));
      }
      if (deltaY !== 0) {
        setPlayerY(prev => Math.max(5, Math.min(95, prev + deltaY)));
      }

      animationFrameId = requestAnimationFrame(updateMovement);
    };

    animationFrameId = requestAnimationFrame(updateMovement);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [phase]);


  // Keyboard controls
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.repeat) return; // Ignore key repeat
    e.preventDefault();
    
    if (phase === 'player-turn') {
      if (e.key === 'ArrowLeft') {
        setSelectedAction(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setSelectedAction(prev => Math.min(PLAYER_ACTIONS.length - 1, prev + 1));
      } else if (e.key === 'Enter' || e.key === 'z' || e.key === 'Z') {
        handlePlayerAction();
      }
    } else if (phase === 'ai-attack') {
      keysPressed.current.add(e.key);
    }
  }, [phase, handlePlayerAction]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysPressed.current.delete(e.key);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Cleanup: clear all pressed keys when unmounting or phase changes
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      keysPressed.current.clear();
    };
  }, [handleKeyDown, handleKeyUp]);

  // Check victory/defeat
  useEffect(() => {
    if (aiHP <= 0 && phase !== 'victory') {
      setPhase('victory');
      setMessage("* Vous avez vaincu l'IA !");
      setTimeout(() => onBattleComplete('defeated'), 3000);
    }
    
    if (playerHP <= 0 && phase !== 'game-over') {
      setPhase('game-over');
      setMessage("* Vous êtes mort...");
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
  }, [aiHP, playerHP, phase, onBattleComplete]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (attackTimeoutRef.current) {
        clearTimeout(attackTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="undertale-battle">
      {/* AI Boss Sprite */}
      <div className="boss-container">
        <div className="boss-sprite">
          <div className="boss-head">
            <div className="boss-eye left"></div>
            <div className="boss-eye right"></div>
            <div className="boss-mouth"></div>
          </div>
          <div className="boss-body">
            <div className="boss-chest"></div>
          </div>
        </div>
        <div className="boss-hp-container">
          <div className="boss-name">Assistant IA</div>
          <div className="boss-hp-bar">
            <div className="boss-hp-fill" style={{ width: `${aiHP}%` }}></div>
          </div>
        </div>
      </div>

      {/* Battle UI */}
      <div className="battle-ui">
        <div className="battle-message-box">
          <p className="battle-message">{message}</p>
        </div>
        
        {/* Player turn - action selection */}
        {phase === 'player-turn' && (
          <div className="action-menu">
            {PLAYER_ACTIONS.map((action, index) => (
              <div 
                key={action.name}
                className={`action-button ${selectedAction === index ? 'selected' : ''} ${action.name === 'ÉPARGNER' && canSpare ? 'spareable' : ''}`}
              >
                <span className={`action-icon ${ACTION_ICON_CLASS[action.name] || ''}`} aria-hidden="true" />
                <span className="action-label">{action.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Battle box during AI attack */}
        {phase === 'ai-attack' && (
          <div className="battle-box">
            <div 
              className={`player-heart ${isInvincible ? 'invincible' : ''}`}
              style={{ left: `${playerX}%`, top: `${playerY}%` }}
            />

            {attacks.map(attack => (
              <div
                key={attack.id}
                className={`attack-projectile ${attack.isWarning ? 'warning' : ''}`}
                style={{ 
                  left: `${attack.x}%`, 
                  top: `${attack.y}%`,
                  width: `${attack.width}%`,
                  height: `${attack.height}%`,
                  transform: `translate(-50%, -50%) rotate(${attack.rotation || 0}deg)`,
                }}
              />
            ))}
          </div>
        )}

        {/* Player stats */}
        <div className="player-stats">
          <div className="player-info">
            <span className="player-name">VISITEUR</span>
            <span className="player-lv">LV 1</span>
          </div>
          <div className="hp-bar">
            <span className="hp-label">HP</span>
            <div className="hp-container">
              <div className="hp-fill" style={{ width: `${(playerHP / 20) * 100}%` }}></div>
            </div>
            <span className="hp-text">{playerHP} / 20</span>
          </div>
        </div>
      </div>
    </div>
  );
}


