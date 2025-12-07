import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Button from './Button';
import './Modal.css';

const AuthModal = ({ isOpen, onClose, message, redirectAfterAuth = null }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    onClose();
    
    // Store redirect URL in sessionStorage if provided
    if (redirectAfterAuth) {
      sessionStorage.setItem('redirectAfterAuth', redirectAfterAuth);
    }
    
    // Navigate to login page
    navigate('/login');
    setIsLoading(false);
  };

  const handleRegister = async () => {
    setIsLoading(true);
    onClose();
    
    // Store redirect URL in sessionStorage if provided
    if (redirectAfterAuth) {
      sessionStorage.setItem('redirectAfterAuth', redirectAfterAuth);
    }
    
    // Navigate to register page
    navigate('/register');
    setIsLoading(false);
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('auth.authRequired')}</h2>
          <button className="modal-close" onClick={handleClose} disabled={isLoading}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="auth-prompt">
            <div className="auth-icon">🔐</div>
            <p className="auth-message">
              {message || t('auth.authRequiredMessage')}
            </p>
            <p className="auth-submessage">
              {t('auth.authPromptDescription')}
            </p>
          </div>
        </div>

        <div className="modal-actions">
          <Button
            variant="primary"
            onClick={handleLogin}
            disabled={isLoading}
            className="auth-button"
          >
            {t('auth.login')}
          </Button>
          <Button
            variant="outline"
            onClick={handleRegister}
            disabled={isLoading}
            className="auth-button"
          >
            {t('auth.register')}
          </Button>
        </div>

        <div className="auth-cancel">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isLoading}
            size="small"
          >
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;