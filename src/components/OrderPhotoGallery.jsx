import { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import ImageLightbox from './ImageLightbox';
import './OrderPhotoGallery.css';

const OrderPhotoGallery = ({ photos, onPhotoAdded, onPhotoDeleted, canEdit = false }) => {
  const { t } = useLanguage();
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [loadingImages, setLoadingImages] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  console.log('OrderPhotoGallery received photos:', photos);
  console.log('Photos is array?', Array.isArray(photos));
  console.log('Photos length:', photos?.length);

  // Ensure photos is always an array
  const photosList = Array.isArray(photos) ? photos : [];

  const canUpload = canEdit && photosList.length < 5; // Max 5 photos for orders

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError(t('errors.invalidFileType'));
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(t('errors.fileTooLarge'));
      return;
    }

    handleUpload(file);
  };

  const handleUpload = async (file) => {
    setUploading(true);
    setError('');

    try {
      await onPhotoAdded(file);
    } catch (err) {
      setError(err.message || t('errors.uploadFailed'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm(t('orders.confirmDeletePhoto'))) {
      return;
    }

    try {
      await onPhotoDeleted(photoId);
    } catch (err) {
      setError(err.message || t('errors.deleteFailed'));
    }
  };

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
  };

  const handleCloseLightbox = () => {
    setSelectedImageIndex(null);
  };

  const handleNextImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex < photosList.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const handlePreviousImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const handleImageLoad = (photoId) => {
    setLoadingImages(prev => ({ ...prev, [photoId]: false }));
  };

  const handleImageLoadStart = (photoId) => {
    setLoadingImages(prev => ({ ...prev, [photoId]: true }));
  };

  const handleAddPhotoClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleUploadChoice = () => {
    setShowModal(false);
    fileInputRef.current?.click();
  };

  const handleCameraChoice = async () => {
    setShowModal(false);
    setShowCamera(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      setCameraStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError(t('errors.cameraAccessDenied') || 'Camera access denied');
      setShowCamera(false);
    }
  };

  const handleCloseCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
        handleCloseCamera();
        handleUpload(file);
      }
    }, 'image/jpeg', 0.9);
  };

  return (
    <div className="order-photo-gallery">
      {error && <div className="order-photo-error">{error}</div>}

      <div className="order-photo-grid">
        {photosList.map((photo, index) => (
          <div key={photo.id} className="order-photo-item">
            <div className="order-photo-image-container" onClick={() => handleImageClick(index)}>
              {loadingImages[photo.id] !== false && (
                <div className="order-photo-image-shimmer"></div>
              )}
              <img
                src={photo.url}
                alt={`Order photo ${index + 1}`}
                className={`order-photo-image ${loadingImages[photo.id] === false ? 'loaded' : 'loading'}`}
                onLoadStart={() => handleImageLoadStart(photo.id)}
                onLoad={() => handleImageLoad(photo.id)}
              />
              <div className="order-photo-overlay">
                <svg className="order-photo-view-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            {canEdit && (
              <button
                type="button"
                className="order-photo-delete-btn"
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

        {canUpload && (
          <div className="order-photo-item order-photo-upload-item">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              disabled={uploading}
            />
            <button
              type="button"
              className="order-photo-upload-btn"
              onClick={handleAddPhotoClick}
              disabled={uploading}
            >
              {uploading ? (
                <div className="order-photo-spinner" />
              ) : (
                <>
                  <svg className="order-photo-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="order-photo-upload-text">{t('orders.addPhoto')}</span>
                  <span className="order-photo-upload-count">{photosList.length}/5</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {selectedImageIndex !== null && selectedImageIndex < photosList.length && (
        <ImageLightbox
          imageUrl={photosList[selectedImageIndex].url}
          onClose={handleCloseLightbox}
          onNext={selectedImageIndex < photosList.length - 1 ? handleNextImage : null}
          onPrevious={selectedImageIndex > 0 ? handlePreviousImage : null}
          currentIndex={selectedImageIndex}
          totalImages={photosList.length}
        />
      )}

      {/* Photo Source Selection Modal */}
      {showModal && (
        <div className="order-photo-modal-overlay" onClick={handleCloseModal}>
          <div className="order-photo-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="order-photo-modal-close" onClick={handleCloseModal}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="order-photo-modal-title">{t('portfolio.choosePhotoSource')}</h3>

            <div className="order-photo-modal-options">
              <button type="button" className="order-photo-option-button" onClick={handleUploadChoice}>
                <div className="order-photo-option-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="order-photo-option-text">{t('portfolio.uploadFromGallery')}</span>
              </button>

              <button type="button" className="order-photo-option-button" onClick={handleCameraChoice}>
                <div className="order-photo-option-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="order-photo-option-text">{t('portfolio.takePhoto')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Capture Modal */}
      {showCamera && (
        <div className="order-photo-camera-modal-overlay">
          <div className="order-photo-camera-modal">
            <button type="button" className="order-photo-camera-close-button" onClick={handleCloseCamera}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="order-photo-camera-preview-container">
              <video ref={videoRef} autoPlay playsInline className="order-photo-camera-video" />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            <div className="order-photo-camera-controls">
              <button type="button" className="order-photo-camera-capture-button" onClick={handleCapturePhoto}>
                <div className="order-photo-camera-capture-inner" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPhotoGallery;
