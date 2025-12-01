import './GameOverlay.css';

interface GameOverlayProps {
  isActive: boolean;
  onClose: () => void;
}

export default function GameOverlay({ isActive, onClose }: GameOverlayProps) {
  if (!isActive) return null;

  return (
    <div className="game-overlay">
      <button className="game-close-btn" onClick={onClose}>
        ✕ Fermer le jeu
      </button>
    </div>
  );
}
