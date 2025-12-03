import { useEffect, useState } from 'react';
import './UndertaleBox.css';

interface UndertaleBoxProps {
  text: string;
  onComplete?: () => void;
}

export default function UndertaleBox({ text, onComplete }: UndertaleBoxProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 50);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      const completeTimeout = setTimeout(onComplete, 2000);
      return () => clearTimeout(completeTimeout);
    }
  }, [currentIndex, text, onComplete]);

  return (
    <div className="undertale-box">
      <div className="undertale-box-inner">
        <p className="undertale-text">{displayedText}</p>
      </div>
    </div>
  );
}
