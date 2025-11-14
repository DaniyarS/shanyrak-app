import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { container } from '../infrastructure/di/ServiceContainer';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import AvatarUpload from '../components/AvatarUpload';
import './CustomerProfile.css';

const CustomerProfile = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      const fullName = user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.phone || '';

      setFormData({
        fullName: fullName,
        phone: user.phone || '',
        email: user.email || '',
      });
    }
    fetchAvatar();
  }, [user]);

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

  const handleAvatarUpdate = (newAvatarUrl) => {
    setAvatarUrl(newAvatarUrl);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock update - just show success message
    alert(t('profile.updateSuccess'));
    setEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="customer-profile-page">
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
                required
              />

              <Input
                label={t('profile.phone')}
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                readOnly
              />

              <Input
                label={t('estates.email')}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />

              <div className="form-actions">
                <Button type="submit" variant="primary">
                  {t('common.save')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditing(false)}
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
                    <span className="detail-value">
                      {user?.firstName && user?.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user?.phone || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">{t('profile.phone')}:</span>
                    <span className="detail-value">{user?.phone}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">{t('estates.email')}:</span>
                    <span className="detail-value">{user?.email || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">{t('auth.role')}:</span>
                    <span className="detail-value">{t('auth.customer')}</span>
                  </div>
                </div>
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

export default CustomerProfile;
