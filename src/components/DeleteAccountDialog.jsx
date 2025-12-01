import { useLanguage } from '../context/LanguageContext';
import Button from './Button';
import Card from './Card';
import './DeleteAccountDialog.css';

/**
 * DeleteAccountDialog Component
 * Custom alert dialog for account deletion confirmation
 */
const DeleteAccountDialog = ({ isOpen, onClose, onConfirm }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="delete-dialog-overlay" onClick={onClose}>
      <div className="delete-dialog-content" onClick={(e) => e.stopPropagation()}>
        <Card className="delete-dialog-card">
          <div className="delete-dialog-header">
            <div className="delete-dialog-icon">⚠️</div>
            <h3>{t('profile.deleteAccount')}</h3>
          </div>
          
          <div className="delete-dialog-body">
            <p className="delete-dialog-warning">
              {t('profile.confirmDeleteAccount')}
            </p>
            
            <div className="delete-dialog-consequences">
              <h4>{t('profile.deleteConsequencesTitle')}</h4>
              <ul>
                <li>{t('profile.deleteConsequence1')}</li>
                <li>{t('profile.deleteConsequence2')}</li>
                <li>{t('profile.deleteConsequence3')}</li>
                <li>{t('profile.deleteConsequence4')}</li>
                <li>{t('profile.deleteConsequence5')}</li>
              </ul>
              <p className="delete-dialog-final-warning">
                <strong>{t('profile.deleteWarningFinal')}</strong>
              </p>
            </div>
          </div>

          <div className="delete-dialog-actions">
            <Button
              variant="ghost"
              onClick={onClose}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="outline"
              onClick={handleConfirm}
              style={{ borderColor: '#dc2626', color: '#dc2626', backgroundColor: 'transparent' }}
            >
              {t('profile.deleteAccount')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DeleteAccountDialog;