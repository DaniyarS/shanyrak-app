import { useLanguage } from '../context/LanguageContext';
import Card from '../components/Card';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  const { t } = useLanguage();

  return (
    <div className="privacy-policy-page">
      <div className="container">
        <Card className="privacy-policy-card">
          <h1>{t('privacy.title')}</h1>
          <p className="policy-last-updated">{t('privacy.lastUpdated')}: 13.11.2024</p>

          <section className="policy-section">
            <h2>{t('privacy.introduction.title')}</h2>
            <p>{t('privacy.introduction.text')}</p>
          </section>

          <section className="policy-section">
            <h2>{t('privacy.dataCollected.title')}</h2>
            <p>{t('privacy.dataCollected.intro')}</p>
            <ul>
              <li>{t('privacy.dataCollected.item1')}</li>
              <li>{t('privacy.dataCollected.item2')}</li>
              <li>{t('privacy.dataCollected.item3')}</li>
              <li>{t('privacy.dataCollected.item4')}</li>
              <li>{t('privacy.dataCollected.item5')}</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>{t('privacy.dataUsage.title')}</h2>
            <p>{t('privacy.dataUsage.intro')}</p>
            <ul>
              <li>{t('privacy.dataUsage.item1')}</li>
              <li>{t('privacy.dataUsage.item2')}</li>
              <li>{t('privacy.dataUsage.item3')}</li>
              <li>{t('privacy.dataUsage.item4')}</li>
              <li>{t('privacy.dataUsage.item5')}</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>{t('privacy.dataSecurity.title')}</h2>
            <p>{t('privacy.dataSecurity.text1')}</p>
            <p>{t('privacy.dataSecurity.text2')}</p>
            <ul>
              <li>{t('privacy.dataSecurity.item1')}</li>
              <li>{t('privacy.dataSecurity.item2')}</li>
              <li>{t('privacy.dataSecurity.item3')}</li>
              <li>{t('privacy.dataSecurity.item4')}</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>{t('privacy.thirdParty.title')}</h2>
            <p>{t('privacy.thirdParty.text')}</p>
          </section>

          <section className="policy-section">
            <h2>{t('privacy.userRights.title')}</h2>
            <p>{t('privacy.userRights.intro')}</p>
            <ul>
              <li>{t('privacy.userRights.item1')}</li>
              <li>{t('privacy.userRights.item2')}</li>
              <li>{t('privacy.userRights.item3')}</li>
              <li>{t('privacy.userRights.item4')}</li>
              <li>{t('privacy.userRights.item5')}</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>{t('privacy.dataRetention.title')}</h2>
            <p>{t('privacy.dataRetention.text')}</p>
          </section>

          <section className="policy-section">
            <h2>{t('privacy.kazakhstanLaw.title')}</h2>
            <p>{t('privacy.kazakhstanLaw.text')}</p>
          </section>

          <section className="policy-section">
            <h2>{t('privacy.changes.title')}</h2>
            <p>{t('privacy.changes.text')}</p>
          </section>

          <section className="policy-section">
            <h2>{t('privacy.contact.title')}</h2>
            <p>{t('privacy.contact.text')}</p>
          </section>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
