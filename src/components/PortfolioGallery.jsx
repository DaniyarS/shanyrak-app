import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { container } from '../infrastructure/di/ServiceContainer';
import ImageLightbox from './ImageLightbox';
import './PortfolioGallery.css';

const PortfolioGallery = ({ photos, onPhotoAdded, onPhotoDeleted, canEdit = false, showAll = false, builderId = null }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [loadingImages, setLoadingImages] = useState({});
  const fileInputRef = useRef(null);

  // If canEdit (builder's own profile), show all photos
  const displayPhotos = canEdit || showAll ? photos : photos.slice(0, 3);
  // Don't show "View More" button if canEdit (builder's own profile) or already showing all
  const hasMore = !canEdit && photos.length > 3 && !showAll;
  const canUpload = canEdit && photos.length < 10;

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setError('');

      const nextSortOrder = photos.length;
      const uploadUseCase = container.getUploadPortfolioPhotoUseCase();
      const result = await uploadUseCase.execute(file, nextSortOrder);

      if (result.success && result.file) {
        if (onPhotoAdded) {
          onPhotoAdded(result.file);
        }
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError(result.errors?.file || result.errors?.submit || t('portfolio.uploadFailed'));
      }
    } catch (err) {
      console.error('Error uploading portfolio photo:', err);
      setError(t('portfolio.uploadFailed'));
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm(t('portfolio.confirmDelete'))) return;

    try {
      const deleteUseCase = container.getDeletePortfolioPhotoUseCase();
      const result = await deleteUseCase.execute(photoId);

      if (result.success) {
        if (onPhotoDeleted) {
          onPhotoDeleted(photoId);
        }
      } else {
        setError(result.errors?.delete || t('portfolio.deleteFailed'));
      }
    } catch (err) {
      console.error('Error deleting portfolio photo:', err);
      setError(t('portfolio.deleteFailed'));
    }
  };

  const handleImageClick = (displayIndex) => {
    // When clicking from displayPhotos, we need to map to the correct index in the full photos array
    // Since displayPhotos is either the full array or a slice of the first 3 items,
    // the displayIndex is already correct for the photos array
    setSelectedImageIndex(displayIndex);
  };

  const handleCloseLightbox = () => {
    setSelectedImageIndex(null);
  };

  const handleNextImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex < displayPhotos.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const handlePreviousImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const handleViewAll = () => {
    if (builderId) {
      navigate(`/builder/${builderId}/portfolio`);
    }
  };

  const handleImageLoad = (photoId) => {
    setLoadingImages(prev => ({ ...prev, [photoId]: false }));
  };

  const handleImageLoadStart = (photoId) => {
    setLoadingImages(prev => ({ ...prev, [photoId]: true }));
  };

  return (
    <div className="portfolio-gallery">
      <div className="portfolio-grid">
        {displayPhotos.map((photo, index) => (
          <div key={photo.id} className="portfolio-item">
            <div className="portfolio-image-container" onClick={() => handleImageClick(index)}>
              {loadingImages[photo.id] !== false && (
                <div className="portfolio-image-shimmer"></div>
              )}
              <img
                src={photo.url}
                alt={`Portfolio ${index + 1}`}
                className={`portfolio-image ${loadingImages[photo.id] === false ? 'loaded' : 'loading'}`}
                onLoadStart={() => handleImageLoadStart(photo.id)}
                onLoad={() => handleImageLoad(photo.id)}
              />
              <div className="portfolio-overlay">
                <svg className="portfolio-view-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            {canEdit && (
              <button
                className="portfolio-delete-btn"
                onClick={() => handleDeletePhoto(photo.id)}
                aria-label={t('common.delete')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}

        {hasMore && (
          <div className="portfolio-item portfolio-more-item">
            <button className="portfolio-more-btn" onClick={handleViewAll}>
              <span className="portfolio-more-count">+{photos.length - 3}</span>
              <span className="portfolio-more-text">{t('portfolio.viewAll')}</span>
            </button>
          </div>
        )}

        {canUpload && (
          <div className="portfolio-item portfolio-upload-item">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              disabled={uploading}
            />
            <button
              className="portfolio-upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <div className="portfolio-spinner" />
              ) : (
                <>
                  <svg className="portfolio-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="portfolio-upload-text">{t('portfolio.addPhoto')}</span>
                  <span className="portfolio-upload-count">{photos.length}/10</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {error && <div className="portfolio-error">{error}</div>}

      {selectedImageIndex !== null && selectedImageIndex < displayPhotos.length && (
        <ImageLightbox
          imageUrl={displayPhotos[selectedImageIndex].url}
          onClose={handleCloseLightbox}
          onNext={selectedImageIndex < displayPhotos.length - 1 ? handleNextImage : null}
          onPrevious={selectedImageIndex > 0 ? handlePreviousImage : null}
          currentIndex={selectedImageIndex}
          totalImages={displayPhotos.length}
        />
      )}
    </div>
  );
};

export default PortfolioGallery;
