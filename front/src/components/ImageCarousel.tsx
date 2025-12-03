import { useState } from 'react';
import './ImageCarousel.css';

interface ImageCarouselProps {
  images: { url: string; filename: string; originalname: string }[];
}

export default function ImageCarousel({ images }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) {
    return <p className="muted">Aucune image pour ce projet.</p>;
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const currentImage = images[currentIndex];
  const imageUrl = currentImage.url.startsWith('/')
    ? `http://localhost:4000${currentImage.url}`
    : currentImage.url;

  return (
    <div className="carousel-container">
      <div className="carousel-main">
        <button
          className="carousel-button carousel-button-prev"
          onClick={goToPrevious}
          aria-label="Image précédente"
        >
          ‹
        </button>

        <div className="carousel-image-wrapper">
          <img
            src={imageUrl}
            alt={currentImage.originalname}
            className="carousel-image"
          />
          <div className="carousel-counter">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        <button
          className="carousel-button carousel-button-next"
          onClick={goToNext}
          aria-label="Image suivante"
        >
          ›
        </button>
      </div>

      {images.length > 1 && (
        <div className="carousel-thumbnails">
          {images.map((img, index) => {
            const thumbUrl = img.url.startsWith('/')
              ? `http://localhost:4000${img.url}`
              : img.url;
            return (
              <button
                key={img.filename}
                className={`carousel-thumbnail ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Aller à l'image ${index + 1}`}
              >
                <img src={thumbUrl} alt={`Miniature ${index + 1}`} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
