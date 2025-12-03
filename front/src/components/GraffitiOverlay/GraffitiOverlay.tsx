import { useTheme } from '../../contexts/ThemeContext';
import './GraffitiOverlay.css';

export default function GraffitiOverlay() {
  const { theme } = useTheme();

  if (theme !== 'fever-dream') return null;

  return (
    <div className="graffiti-overlay">
      {/* Top left cluster */}
      <div className="graffiti graffiti-x1">✕</div>
      <div className="graffiti graffiti-x2">×</div>
      <div className="graffiti graffiti-circle1">○</div>
      
      {/* Center scattered */}
      <div className="graffiti graffiti-star1">★</div>
      <div className="graffiti graffiti-star2">✦</div>
      
      {/* Right side */}
      <div className="graffiti graffiti-x3">✕</div>
      <div className="graffiti graffiti-x4">×</div>
      <div className="graffiti graffiti-circle2">◯</div>
      
      {/* Bottom */}
      <div className="graffiti graffiti-diamond">◇</div>
      <div className="graffiti graffiti-x5">✕</div>
      
      {/* Scattered text-like marks */}
      <div className="graffiti graffiti-scribble1">~~~</div>
      <div className="graffiti graffiti-scribble2">///</div>
      
      {/* More X clusters like on the gun */}
      <div className="graffiti graffiti-cluster1">× × ×</div>
      <div className="graffiti graffiti-cluster2">✕ ✕</div>
    </div>
  );
}
