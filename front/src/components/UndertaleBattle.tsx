import { useState, useEffect, useCallback, useRef } from 'react';
import './UndertaleBattle.css';

interface UndertaleBattleProps {
  onBattleComplete: () => void;
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

export default function UndertaleBattle({ onBattleComplete }: UndertaleBattleProps) {
  const [phase, setPhase] = useState<BattlePhase>('intro');
  const [playerHP, setPlayerHP] = useState(20);
  const [aiHP, setAiHP] = useState(100);
  const [playerX, setPlayerX] = useState(50);
  const [playerY, setPlayerY] = useState(50);
  const [attacks, setAttacks] = useState<Attack[]>([]);
  const [currentPattern, setCurrentPattern] = useState<AttackPattern>('bones');
  const [message, setMessage] = useState("* Assistant IA vous bloque le passage.");
  const [turnCount, setTurnCount] = useState(0);
  const [selectedAction, setSelectedAction] = useState(0);
  const [canSpare, setCanSpare] = useState(false);
  const [isInvincible, setIsInvincible] = useState(false);
  const attackTimeoutRef = useRef<number | null>(null);

  
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
    
    for (let i = 0; i < numBones; i++) {
      const fromSide = Math.random() > 0.5;
      bones.push({
        id: Date.now() + i,
        x: fromSide ? (Math.random() > 0.5 ? -5 : 105) : Math.random() * 100,
        y: fromSide ? Math.random() * 100 : (Math.random() > 0.5 ? -5 : 105),
        vx: fromSide ? (Math.random() > 0.5 ? 1.5 : -1.5) : (Math.random() - 0.5) * 0.5,
        vy: fromSide ? (Math.random() - 0.5) * 0.5 : (Math.random() > 0.5 ? 1.5 : -1.5),
        width: 4,
        height: 12,
        rotation: Math.random() * 360,
      });
    }
    setAttacks(bones);
  }, []);

  const generateCross = useCallback(() => {
    const crossAttacks: Attack[] = [];
    for (let i = 0; i < 5; i++) {
      crossAttacks.push({
        id: Date.now() + i * 2,
        x: 20 + i * 15,
        y: -5,
        vx: 0,
        vy: 2,
        width: 4,
        height: 15,
        rotation: 0,
      });
      crossAttacks.push({
        id: Date.now() + i * 2 + 1,
        x: -5,
        y: 20 + i * 15,
        vx: 2,
        vy: 0,
        width: 15,
        height: 4,
        rotation: 0,
      });
    }
    setAttacks(crossAttacks);
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
        width: 4,
        height: 10,
        rotation: (angle * 180 / Math.PI) + 90,
      });
    }
    setAttacks(circleAttacks);
  }, []);

  const generateSlam = useCallback(() => {
    const slamAttacks: Attack[] = [];
    
    for (let i = 0; i < 4; i++) {
      slamAttacks.push({
        id: Date.now() + i,
        x: 25 + i * 16.66,
        y: -10,
        vx: 0,
        vy: 4,
        width: 12,
        height: 20,
        rotation: 0,
      });
    }
    setAttacks(slamAttacks);
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
        setTimeout(onBattleComplete, 3000);
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

    const interval = setInterval(() => {
      setAttacks(prev => {
        const updated = prev
          .map(attack => ({
            ...attack,
            x: attack.x + attack.vx,
            y: attack.y + attack.vy,
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
    }, 50);

    return () => clearInterval(interval);
  }, [phase, attacks.length, playerX, playerY, isInvincible]);


  // Keyboard controls
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
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
      const speed = 2.5;
      if (e.key === 'ArrowLeft') {
        setPlayerX(prev => Math.max(5, prev - speed));
      } else if (e.key === 'ArrowRight') {
        setPlayerX(prev => Math.min(95, prev + speed));
      } else if (e.key === 'ArrowUp') {
        setPlayerY(prev => Math.max(5, prev - speed));
      } else if (e.key === 'ArrowDown') {
        setPlayerY(prev => Math.min(95, prev + speed));
      }
    }
  }, [phase, handlePlayerAction]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Check victory/defeat
  useEffect(() => {
    if (aiHP <= 0 && phase !== 'victory') {
      setPhase('victory');
      setMessage("* Vous avez vaincu l'IA !");
      setTimeout(onBattleComplete, 3000);
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
                style={{ borderColor: selectedAction === index ? action.color : '#fff' }}
              >
                {selectedAction === index && '❤ '}
                {action.name}
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
            >
              ❤
            </div>

            {attacks.map(attack => (
              <div
                key={attack.id}
                className="attack-projectile"
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

