import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { container } from '../infrastructure/di/ServiceContainer';
import Button from './Button';
import './AvatarUpload.css';

const AvatarUpload = ({ currentAvatarUrl, onAvatarUpdate }) => {
  const { t } = useLanguage();
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [imageLoading, setImageLoading] = useState(true);
  const [cameraStream, setCameraStream] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    setAvatarUrl(currentAvatarUrl);
    if (currentAvatarUrl) {
      setImageLoading(true);
    }
  }, [currentAvatarUrl]);

  useEffect(() => {
    // Cleanup camera stream on unmount
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const handleAvatarClick = () => {
    if (!selectedFile && !previewUrl) {
      setShowModal(true);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      setImageLoading(true);
      setShowModal(false);
      setError('');
    }
  };

  const handleUploadChoice = () => {
    fileInputRef.current?.click();
  };

  const handleCameraChoice = async () => {
    try {
      // Check if browser supports mediaDevices API
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError(t('avatar.cameraNotSupported'));
        setShowModal(false);
        return;
      }

      // Request camera permission and start stream
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
        });

        setCameraStream(stream);
        setShowModal(false);
        setShowCamera(true);

        // Wait for next tick to ensure video element is rendered
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

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
        const preview = URL.createObjectURL(blob);

        setSelectedFile(file);
        setPreviewUrl(preview);
        setImageLoading(true);
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

  const handleCancel = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setError('');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError('');

      const uploadAvatarUseCase = container.getUploadAvatarUseCase();
      const result = await uploadAvatarUseCase.execute(selectedFile);

      if (result.success && result.file) {
        setAvatarUrl(result.file.url);
        setSelectedFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);

        // Notify parent component about the update
        if (onAvatarUpdate) {
          onAvatarUpdate(result.file.url);
        }
      } else {
        setError(result.errors?.file || result.errors?.upload || result.errors?.submit || t('avatar.uploadFailed'));
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError(t('avatar.uploadFailed'));
    } finally {
      setUploading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const displayUrl = previewUrl || avatarUrl;

  return (
    <div className="avatar-upload-container">
      <div className="avatar-wrapper">
        {displayUrl ? (
          <>
            {imageLoading && <div className="avatar-image-shimmer"></div>}
            <img
              src={displayUrl}
              alt={t('avatar.userAvatar')}
              className={`avatar-image ${imageLoading ? 'loading' : 'loaded'}`}
              onLoad={() => setImageLoading(false)}
            />
          </>
        ) : (
          <div className="avatar-placeholder">
            <svg className="avatar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}

        {/* Camera button overlay at bottom */}
        <button
          type="button"
          className="avatar-camera-button"
          onClick={selectedFile ? handleUpload : handleAvatarClick}
          disabled={uploading}
        >
          {uploading ? (
            <div className="avatar-spinner"></div>
          ) : selectedFile ? (
            <>
              <svg className="camera-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="camera-text">{t('avatar.upload')}</span>
            </>
          ) : (
            <svg className="camera-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>

        {selectedFile && !uploading && (
          <button
            type="button"
            className="avatar-cancel-button"
            onClick={handleCancel}
            title={t('common.cancel')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {error && <div className="avatar-error">{error}</div>}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
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

            <h3 className="avatar-modal-title">{t('avatar.chooseOption')}</h3>

            <div className="avatar-modal-options">
              <button className="avatar-option-button" onClick={handleUploadChoice}>
                <div className="avatar-option-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="avatar-option-text">{t('avatar.uploadPhoto')}</span>
              </button>

              <button className="avatar-option-button" onClick={handleCameraChoice}>
                <div className="avatar-option-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="avatar-option-text">{t('avatar.takePhoto')}</span>
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

export default AvatarUpload;
