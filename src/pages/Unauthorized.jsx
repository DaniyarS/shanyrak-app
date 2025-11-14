import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/Button';
import '../styles/Unauthorized.css';

const Unauthorized = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <div className="unauthorized-icon">⛔</div>
        <h1 className="unauthorized-title">{t('unauthorized.title')}</h1>
        <p className="unauthorized-message">
          {t('unauthorized.message')}
        </p>
        <div className="unauthorized-actions">
          <Button onClick={() => navigate(-1)}>
            {t('unauthorized.goBack')}
          </Button>
          <Button onClick={() => navigate('/')} variant="secondary">
            {t('unauthorized.goHome')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
