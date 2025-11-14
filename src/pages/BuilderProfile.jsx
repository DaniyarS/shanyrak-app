import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { container } from '../infrastructure/di/ServiceContainer';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import AvatarUpload from '../components/AvatarUpload';
import PortfolioGallery from '../components/PortfolioGallery';
import './BuilderProfile.css';

const BuilderProfile = () => {
  const { updateUser, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [builderData, setBuilderData] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [portfolioPhotos, setPortfolioPhotos] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    login: '',
    aboutMe: '',
    experienceYears: '',
    city: '',
    district: '',
    jobsDone: '',
    available: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchBuilderProfile();
    fetchAvatar();
  }, []);

  const fetchBuilderProfile = async () => {
    try {
      setLoading(true);
      const getBuilderUseCase = container.getGetBuilderUseCase();
      const result = await getBuilderUseCase.execute();

      if (result.success) {
        setBuilderData(result.builder);
        setFormData({
          fullName: result.builder.fullName || '',
          email: result.builder.email || '',
          phone: result.builder.phone || '',
          login: result.builder.login || '',
          aboutMe: result.builder.aboutMe || '',
          experienceYears: result.builder.experienceYears?.toString() || '',
          city: result.builder.city || '',
          district: result.builder.district || '',
          jobsDone: result.builder.jobsDone?.toString() || '',
          available: result.builder.available !== undefined ? result.builder.available : true,
        });

        // Fetch portfolio photos after we have the builder ID
        if (result.builder?.id) {
          fetchPortfolioPhotos(result.builder.id);
        }
      }
    } catch (error) {
      console.error('Error fetching builder profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvatar = async () => {
    try {
      const getAvatarUseCase = container.getGetAvatarUseCase();
      const result = await getAvatarUseCase.execute();

      if (result.success && result.file) {
        setAvatarUrl(result.file.url);
      }
    } catch (error) {
      console.error('Error fetching avatar:', error);
    }
  };

  const fetchPortfolioPhotos = async (builderId) => {
    try {
      const getPortfolioUseCase = container.getGetPortfolioPhotosUseCase();
      // Pass builderId to get the builder's portfolio photos with linkPublicId parameter
      const result = await getPortfolioUseCase.execute(builderId);

      if (result.success) {
        setPortfolioPhotos(result.files);
      } else {
        console.error('Error fetching portfolio photos:', result.errors);
      }
    } catch (error) {
      console.error('Error fetching portfolio photos:', error);
    }
  };

  const handleAvatarUpdate = (newAvatarUrl) => {
    setAvatarUrl(newAvatarUrl);
    // Optionally update the builder data with new avatar link
    if (builderData) {
      setBuilderData({ ...builderData, avatarLink: newAvatarUrl });
    }
  };

  const handlePhotoAdded = (newPhoto) => {
    setPortfolioPhotos([...portfolioPhotos, newPhoto]);
  };

  const handlePhotoDeleted = (photoId) => {
    setPortfolioPhotos(portfolioPhotos.filter(photo => photo.id !== photoId));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!builderData?.id) {
      setErrors({ submit: 'Builder ID not found. Please refresh the page.' });
      return;
    }

    try {
      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        login: formData.login,
        aboutMe: formData.aboutMe,
        experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : 0,
        city: formData.city,
        district: formData.district,
        jobsDone: formData.jobsDone ? parseInt(formData.jobsDone) : 0,
        available: formData.available,
        // Include existing fields that shouldn't be changed
        avatarLink: builderData?.avatarLink || '',
        role: builderData?.role || 'BUILDER',
        ratingAvg: builderData?.ratingAvg || 0,
        priceList: builderData?.priceList || null,
      };

      console.log('Updating builder with data:', updateData);
      console.log('Builder ID:', builderData.id);

      const updateBuilderUseCase = container.getUpdateBuilderUseCase();
      const result = await updateBuilderUseCase.execute(builderData.id, updateData);

      console.log('Update result:', result);

      if (result.success) {
        setBuilderData(result.builder);
        setEditing(false);
        updateUser(result.builder);
        alert(t('profile.updateSuccess'));
      } else {
        console.error('Update failed:', result.errors);
        setErrors(result.errors || { submit: t('profile.updateFailed') });
      }
    } catch (error) {
      console.error('Update error:', error);
      setErrors({ submit: error.response?.data?.message || t('profile.updateFailed') });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="builder-profile-page">
        <div className="container">
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="builder-profile-page">
      <div className="container">
        <div className="profile-header">
          <h1>{t('profile.myProfile')}</h1>
        </div>

        <Card className="profile-card">
          <div className="profile-avatar-section">
            <AvatarUpload
              currentAvatarUrl={avatarUrl}
              onAvatarUpdate={handleAvatarUpdate}
            />
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <h2>{t('profile.editProfile')}</h2>

              <Input
                label={t('profile.fullName')}
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                error={errors.fullName}
                required
              />

              <Input
                label={t('estates.email')}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />

              <Input
                label={t('profile.phone')}
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                required
                readOnly
              />

              <Input
                label={t('profile.login')}
                name="login"
                value={formData.login}
                onChange={handleChange}
                error={errors.login}
              />

              <div className="input-wrapper">
                <label className="input-label">{t('services.aboutMe')}</label>
                <textarea
                  name="aboutMe"
                  value={formData.aboutMe}
                  onChange={handleChange}
                  placeholder={t('profile.aboutMePlaceholder')}
                  className="input"
                  rows="4"
                />
              </div>

              <div className="form-row">
                <Input
                  label={t('services.experienceYears')}
                  name="experienceYears"
                  type="number"
                  value={formData.experienceYears}
                  onChange={handleChange}
                  error={errors.experienceYears}
                />

                <Input
                  label={t('services.jobsDone')}
                  name="jobsDone"
                  type="number"
                  value={formData.jobsDone}
                  onChange={handleChange}
                  error={errors.jobsDone}
                />
              </div>

              <div className="form-row">
                <Input
                  label={t('services.city')}
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  error={errors.city}
                />

                <Input
                  label={t('services.district')}
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  error={errors.district}
                />
              </div>

              <div className="input-wrapper">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="available"
                    checked={formData.available}
                    onChange={handleChange}
                  />
                  <span>{t('services.available')}</span>
                </label>
              </div>

              {errors.submit && (
                <div className="error-message">{errors.submit}</div>
              )}

              <div className="form-actions">
                <Button type="submit" variant="primary">
                  {t('common.save')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEditing(false);
                    setErrors({});
                  }}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          ) : (
            <div className="profile-view">
              <div className="profile-view-header">
                <h2>{t('profile.profileInfo')}</h2>
                <Button onClick={() => setEditing(true)}>{t('common.edit')}</Button>
              </div>

              <div className="profile-section">
                <h3>{t('profile.personalInfo')}</h3>
                <div className="profile-details">
                  <div className="detail-row">
                    <span className="detail-label">{t('profile.fullName')}:</span>
                    <span className="detail-value">{builderData?.fullName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">{t('estates.email')}:</span>
                    <span className="detail-value">{builderData?.email || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">{t('profile.phone')}:</span>
                    <span className="detail-value">{builderData?.phone}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">{t('profile.login')}:</span>
                    <span className="detail-value">{builderData?.login || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {builderData?.aboutMe && (
                <div className="profile-section">
                  <h3>{t('services.aboutMe')}</h3>
                  <p className="about-text">{builderData.aboutMe}</p>
                </div>
              )}

              <div className="profile-section">
                <h3>{t('profile.professionalInfo')}</h3>
                <div className="profile-details">
                  <div className="detail-row">
                    <span className="detail-label">{t('services.experienceYears')}:</span>
                    <span className="detail-value">{builderData?.experienceYears || 0} {t('services.years')}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">{t('services.jobsDone')}:</span>
                    <span className="detail-value">{builderData?.jobsDone || 0}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">{t('services.city')}:</span>
                    <span className="detail-value">{builderData?.city || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">{t('services.district')}:</span>
                    <span className="detail-value">{builderData?.district || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">{t('services.rating')}:</span>
                    <span className="detail-value">{builderData?.ratingAvg?.toFixed(1) || '0.0'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">{t('profile.status')}:</span>
                    <span className={`status-badge ${builderData?.available ? 'available' : 'unavailable'}`}>
                      {builderData?.available ? t('services.available') : t('services.notAvailable')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Portfolio Section */}
              <div className="profile-section">
                <h3>{t('profile.portfolio')}</h3>
                <PortfolioGallery
                  photos={portfolioPhotos}
                  onPhotoAdded={handlePhotoAdded}
                  onPhotoDeleted={handlePhotoDeleted}
                  canEdit={true}
                  showAll={false}
                  builderId={builderData?.id}
                />
              </div>
            </div>
          )}
        </Card>

        <Card className="logout-section">
          <div className="logout-content">
            <div>
              <h3>{t('profile.accountSettings')}</h3>
              <p>{t('profile.logoutDescription')}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              {t('navbar.logout')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BuilderProfile;
