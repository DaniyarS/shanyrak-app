import { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Button from './Button';
import './PortfolioUpload.css';

const PortfolioUpload = ({ onPhotosChange, maxPhotos = 10 }) => {
  const { t } = useLanguage();
  const [photos, setPhotos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleAddPhotoClick = () => {
    if (photos.length < maxPhotos) {
      setShowModal(true);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const remainingSlots = maxPhotos - photos.length;
    const filesToAdd = files.slice(0, remainingSlots);

    const newPhotos = filesToAdd.map((file, index) => ({
      id: Date.now() + index,
      file,
      preview: URL.createObjectURL(file),
    }));

    const updatedPhotos = [...photos, ...newPhotos];
    setPhotos(updatedPhotos);

    if (onPhotosChange) {
      onPhotosChange(updatedPhotos.map(p => p.file));
    }

    setShowModal(false);
    setError('');
  };

  const handleUploadChoice = () => {
    fileInputRef.current?.click();
  };

  const handleCameraChoice = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError(t('avatar.cameraNotSupported'));
        setShowModal(false);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });

        setCameraStream(stream);
        setShowModal(false);
        setShowCamera(true);

        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }, 100);

      } catch (permissionError) {
        console.error('Camera permission error:', permissionError);

        if (permissionError.name === 'NotAllowedError' || permissionError.name === 'PermissionDeniedError') {
          setError(t('avatar.cameraPermissionDenied'));
        } else if (permissionError.name === 'NotFoundError') {
          setError(t('avatar.cameraNotFound'));
        } else {
          setError(t('avatar.cameraError'));
        }
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setError(t('avatar.cameraError'));
      setShowModal(false);
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `portfolio-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const preview = URL.createObjectURL(blob);

        const newPhoto = {
          id: Date.now(),
          file,
          preview,
        };

        const updatedPhotos = [...photos, newPhoto];
        setPhotos(updatedPhotos);

        if (onPhotosChange) {
          onPhotosChange(updatedPhotos.map(p => p.file));
        }

        handleCloseCamera();
      }
    }, 'image/jpeg', 0.9);
  };

  const handleCloseCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const handleRemovePhoto = (photoId) => {
    const photo = photos.find(p => p.id === photoId);
    if (photo?.preview) {
      URL.revokeObjectURL(photo.preview);
    }

    const updatedPhotos = photos.filter(p => p.id !== photoId);
    setPhotos(updatedPhotos);

    if (onPhotosChange) {
      onPhotosChange(updatedPhotos.map(p => p.file));
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="portfolio-upload-container">
      <div className="portfolio-upload-grid">
        {photos.map((photo) => (
          <div key={photo.id} className="portfolio-upload-item">
            <img src={photo.preview} alt="Portfolio" className="portfolio-upload-image" />
            <button
              type="button"
              className="portfolio-upload-remove"
              onClick={() => handleRemovePhoto(photo.id)}
            >
              ×
            </button>
          </div>
        ))}

        {photos.length < maxPhotos && (
          <div className="portfolio-upload-item portfolio-upload-add">
            <button
              type="button"
              className="portfolio-upload-add-btn"
              onClick={handleAddPhotoClick}
            >
              <svg className="portfolio-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>{t('portfolio.addPhoto')}</span>
              <span className="portfolio-upload-count">{photos.length}/{maxPhotos}</span>
            </button>
          </div>
        )}
      </div>

      {error && <div className="portfolio-upload-error">{error}</div>}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Modal for upload/camera choice */}
      {showModal && (
        <div className="avatar-modal-overlay" onClick={handleCloseModal}>
          <div className="avatar-modal" onClick={(e) => e.stopPropagation()}>
            <button className="avatar-modal-close" onClick={handleCloseModal} aria-label={t('common.close')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="avatar-modal-title">{t('portfolio.choosePhotoSource')}</h3>

            <div className="avatar-modal-options">
              <button className="avatar-option-button" onClick={handleUploadChoice}>
                <div className="avatar-option-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="avatar-option-text">{t('portfolio.uploadFromGallery')}</span>
              </button>

              <button className="avatar-option-button" onClick={handleCameraChoice}>
                <div className="avatar-option-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="avatar-option-text">{t('portfolio.takePhoto')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera capture modal */}
      {showCamera && (
        <div className="camera-modal-overlay">
          <div className="camera-modal">
            <button className="camera-close-button" onClick={handleCloseCamera} aria-label={t('common.close')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="camera-preview-container">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="camera-video"
              />
            </div>

            <div className="camera-controls">
              <button className="camera-capture-button" onClick={handleCapturePhoto}>
                <div className="camera-capture-inner" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioUpload;
