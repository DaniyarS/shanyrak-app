import { useState, useEffect } from 'react';
import './ImageSlider.css';

/**
 * ImageSlider Component
 * Modal image slider with navigation controls
 */
const ImageSlider = ({
  isOpen,
  photos,
  initialIndex = 0,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Update current index when initialIndex changes
  useEffect(() => {
    if (initialIndex >= 0 && initialIndex < photos.length) {
      setCurrentIndex(initialIndex);
    } else {
      setCurrentIndex(0);
    }
  }, [initialIndex, photos.length]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft') {
        goToPrevious();
      } else if (event.key === 'ArrowRight') {
        goToNext();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !photos || photos.length === 0) {
    return null;
  }

  // Ensure currentIndex is within bounds
  const safeCurrentIndex = Math.max(0, Math.min(currentIndex, photos.length - 1));

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + photos.length) % photos.length);
  };

  const goToIndex = (index) => {
    if (index >= 0 && index < photos.length) {
      setCurrentIndex(index);
    }
  };

  const currentPhoto = photos[safeCurrentIndex];

  // Additional safety check
  if (!currentPhoto) {
    console.error('ImageSlider: currentPhoto is undefined', { 
      currentIndex, 
      safeCurrentIndex, 
      photosLength: photos.length 
    });
    return null;
  }

  return (
    <div className="image-slider-overlay" onClick={onClose}>
      <div className="image-slider-container" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="slider-close-btn" onClick={onClose}>
          ×
        </button>

        {/* Main Image */}
        <div className="slider-main-image">
          <img 
            src={currentPhoto.url} 
            alt={`Photo ${currentIndex + 1}`}
            className="slider-image"
          />
        </div>

        {/* Navigation Arrows */}
        {photos.length > 1 && (
          <>
            <button 
              className="slider-nav-btn slider-prev" 
              onClick={goToPrevious}
              aria-label="Previous image"
            >
              ‹
            </button>
            <button 
              className="slider-nav-btn slider-next" 
              onClick={goToNext}
              aria-label="Next image"
            >
              ›
            </button>
          </>
        )}

        {/* Image Counter */}
        <div className="slider-counter">
          {safeCurrentIndex + 1} / {photos.length}
        </div>

        {/* Thumbnail Navigation */}
        {photos.length > 1 && (
          <div className="slider-thumbnails">
            {photos.map((photo, index) => (
              <button
                key={photo.id || `photo-${index}`}
                className={`slider-thumbnail ${index === safeCurrentIndex ? 'active' : ''}`}
                onClick={() => goToIndex(index)}
              >
                <img 
                  src={photo.url} 
                  alt={`Thumbnail ${index + 1}`}
                  className="thumbnail-image"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageSlider;