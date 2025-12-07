import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import BuilderCard from './services/BuilderCard';
import BuilderProfileDialog from './BuilderProfileDialog';
import './BuildersList.css';

const BuildersList = ({ builders, loading, builderAvatars }) => {
  const { t } = useLanguage();
  const [selectedBuilderId, setSelectedBuilderId] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  const handleBuilderClick = (builder) => {
    setSelectedBuilderId(builder.id);
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setSelectedBuilderId(null);
  };

  if (loading) {
    return (
      <div className="builders-list-loading">
        <div className="builders-loading-grid">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="builder-card-skeleton">
              <div className="skeleton-avatar"></div>
              <div className="skeleton-content">
                <div className="skeleton-line skeleton-title"></div>
                <div className="skeleton-line skeleton-subtitle"></div>
                <div className="skeleton-line skeleton-text"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (builders.length === 0) {
    return (
      <div className="builders-empty-state">
        <div className="empty-state-content">
          <div className="empty-state-icon">🔍</div>
          <h3>{t('builders.noBuildersFound')}</h3>
          <p>{t('builders.noBuildersDescription')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="builders-list">
      <div className="builders-list-header">
        <h3>
          {t('builders.foundBuilders', { count: builders.length })}
        </h3>
      </div>

      <div className="builders-grid">
        {builders.map((builder) => (
          <BuilderCard
            key={builder.id}
            builder={builder}
            avatarUrl={builderAvatars?.get(builder.id)}
            onClick={() => handleBuilderClick(builder)}
          />
        ))}
      </div>

      {/* Builder Profile Dialog */}
      <BuilderProfileDialog
        isOpen={showDialog}
        onClose={closeDialog}
        builderId={selectedBuilderId}
      />
    </div>
  );
};

export default BuildersList;