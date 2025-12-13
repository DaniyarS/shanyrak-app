import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { container } from '../infrastructure/di/ServiceContainer';
import { ContractStatus } from '../domain/entities/Contract';
import estateService from '../services/estateService';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import Select from '../components/Select';
import AvatarUpload from '../components/AvatarUpload';
import DeleteAccountDialog from '../components/DeleteAccountDialog';
import './CustomerProfile.css';

const CustomerProfile = () => {
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Estates state
  const [estates, setEstates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingEstates, setLoadingEstates] = useState(false);
  const [showEstateForm, setShowEstateForm] = useState(false);
  const [editingEstate, setEditingEstate] = useState(null);
  const [estateFormData, setEstateFormData] = useState({
    kind: '',
    addressLine: '',
    city: '',
    district: '',
    areaM2: '',
    floor: '',
  });
  const [estateErrors, setEstateErrors] = useState({});

  // Contracts state
  const [contracts, setContracts] = useState([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [confirmingContract, setConfirmingContract] = useState(null);

  // Profile state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      const fullName = user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.phone || '';

      setFormData({
        fullName: fullName,
        phone: user.phone || '',
      });
    }
    fetchAvatar();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'properties') {
      fetchEstates();
      fetchCities();
    } else if (activeTab === 'contracts') {
      fetchContracts();
    }
  }, [activeTab]);

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

  // Estates functions
  const fetchEstates = async () => {
    try {
      setLoadingEstates(true);
      const data = await estateService.getCustomerEstates();
      setEstates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching estates:', error);
      setEstates([]);
    } finally {
      setLoadingEstates(false);
    }
  };

  const fetchCities = async () => {
    try {
      const getCitiesUseCase = container.getGetCitiesUseCase();
      const result = await getCitiesUseCase.execute(false);

      if (result.success) {
        setCities(result.cities);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const handleEstateChange = (e) => {
    const { name, value } = e.target;
    setEstateFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (estateErrors[name]) {
      setEstateErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateEstateForm = () => {
    const newErrors = {};

    if (!estateFormData.kind) newErrors.kind = t('estates.propertyTypeRequired');
    if (!estateFormData.addressLine) newErrors.addressLine = t('estates.addressRequired');
    if (!estateFormData.city) newErrors.city = t('estates.cityRequired');
    if (!estateFormData.district) newErrors.district = t('estates.districtRequired');
    if (!estateFormData.areaM2) newErrors.areaM2 = t('estates.areaRequired');
    if (!estateFormData.floor) newErrors.floor = t('estates.floorRequired');

    setEstateErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEstateSubmit = async (e) => {
    e.preventDefault();

    if (!validateEstateForm()) return;

    try {
      if (editingEstate) {
        await estateService.updateEstate({
          publicId: editingEstate.publicId,
          ...estateFormData,
          areaM2: parseFloat(estateFormData.areaM2),
          floor: parseInt(estateFormData.floor),
        });
      } else {
        await estateService.createEstate(estateFormData);
      }

      fetchEstates();
      resetEstateForm();
    } catch (error) {
      setEstateErrors({ submit: error.response?.data?.message || t('estates.operationFailed') });
    }
  };

  const handleEditEstate = (estate) => {
    setEditingEstate(estate);
    setEstateFormData({
      kind: estate.kind || '',
      addressLine: estate.addressLine || '',
      city: estate.city || '',
      district: estate.district || '',
      areaM2: estate.areaM2?.toString() || '',
      floor: estate.floor?.toString() || '',
    });
    setShowEstateForm(true);
  };

  const handleDeleteEstate = async (estateId) => {
    if (!window.confirm(t('estates.deleteConfirm'))) return;

    try {
      await estateService.deleteEstate(estateId);
      fetchEstates();
    } catch (error) {
      alert(t('estates.deleteFailed'));
    }
  };

  const resetEstateForm = () => {
    setEstateFormData({
      kind: '',
      addressLine: '',
      city: '',
      district: '',
      areaM2: '',
      floor: '',
    });
    setEditingEstate(null);
    setShowEstateForm(false);
    setEstateErrors({});
  };

  // Contracts functions
  const fetchContracts = async () => {
    try {
      setLoadingContracts(true);
      const getUserContractsUseCase = container.getGetUserContractsUseCase();
      const result = await getUserContractsUseCase.execute({ page: 0, size: 50 });

      if (result.success) {
        setContracts(result.contracts || []);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoadingContracts(false);
    }
  };

  const handleConfirmCompletion = async (contractId) => {
    if (!window.confirm(t('contracts.workCompleted'))) {
      return;
    }

    setConfirmingContract(contractId);
    try {
      const completeContractUseCase = container.getCompleteContractUseCase();
      const result = await completeContractUseCase.execute(contractId, true);

      if (result.success) {
        alert(t('contracts.completionConfirmed'));
        fetchContracts();
      } else {
        alert(result.errors?.submit || 'Failed to confirm completion');
      }
    } catch (error) {
      console.error('Error confirming completion:', error);
      alert(error.response?.data?.message || 'Failed to confirm completion');
    } finally {
      setConfirmingContract(null);
    }
  };

  const getStatusBadge = (contract) => {
    const statusMap = {
      [ContractStatus.ACTIVE]: { className: 'active', label: t('contracts.statusActive') },
      [ContractStatus.COMPLETED]: { className: 'completed', label: t('contracts.statusCompleted') },
      [ContractStatus.CANCELLED]: { className: 'cancelled', label: t('contracts.statusCancelled') },
      [ContractStatus.PENDING_COMPLETION]: { className: 'pending', label: t('contracts.statusPendingCompletion') },
    };

    const statusConfig = statusMap[contract.status] || statusMap[ContractStatus.ACTIVE];
    return <span className={`status-badge ${statusConfig.className}`}>{statusConfig.label}</span>;
  };

  const canConfirmCompletion = (contract) => {
    if (contract.status !== ContractStatus.ACTIVE && contract.status !== ContractStatus.PENDING_COMPLETION) {
      return false;
    }
    return !contract.customerConfirmedComplete;
  };

  const getCompletionStatus = (contract) => {
    if (contract.status === ContractStatus.COMPLETED) {
      return t('contracts.bothPartiesConfirmed');
    }

    if (contract.customerConfirmedComplete) {
      return t('contracts.waitingForOtherParty');
    }

    return null;
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

  const handleDeleteAccount = async () => {
    try {
      const deleteAccountUseCase = container.getDeleteAccountUseCase();
      const result = await deleteAccountUseCase.execute();

      if (result.success) {
        alert(t('profile.accountDeleted'));
        logout();
        navigate('/login');
      } else {
        alert(result.errors?.message || t('profile.accountDeletionFailed'));
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert(t('profile.accountDeletionFailed'));
    }
  };

  const renderProfileTab = () => (
    <>
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
                      : user?.phone || t('common.notAvailable')}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t('profile.phone')}:</span>
                  <span className="detail-value">{user?.phone}</span>
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

      <div className="delete-content">
        <div>
          <p className="delete-link-text">
            Need to delete your account? 
            <button 
              type="button"
              className="delete-link-button"
              onClick={() => setShowDeleteDialog(true)}
            >
              Click here
            </button>
          </p>
        </div>
      </div>

      <DeleteAccountDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteAccount}
      />
    </>
  );

  const renderPropertiesTab = () => {
    if (loadingEstates) {
      return (
        <div className="tab-loading">
          <div className="spinner"></div>
          <p>{t('estates.loadingProperties')}</p>
        </div>
      );
    }

    return (
      <>
        <div className="tab-header">
          {!showEstateForm && (
            <Button onClick={() => setShowEstateForm(true)}>{t('estates.addProperty')}</Button>
          )}
        </div>

        {showEstateForm && (
          <Card className="estate-form-card">
            <h2>{editingEstate ? t('estates.editProperty') : t('estates.addNewProperty')}</h2>
            <form onSubmit={handleEstateSubmit} className="estate-form">
              <Select
                label={t('estates.propertyType')}
                name="kind"
                value={estateFormData.kind}
                onChange={handleEstateChange}
                options={[
                  { value: 'APARTMENT', label: t('estates.apartment') },
                  { value: 'HOUSE', label: t('estates.house') },
                  { value: 'OFFICE', label: t('estates.office') },
                  { value: 'COMMERCIAL', label: t('estates.commercial') },
                ]}
                placeholder={t('estates.propertyTypePlaceholder')}
                error={estateErrors.kind}
                required
              />

              <Input
                label={t('estates.address')}
                name="addressLine"
                value={estateFormData.addressLine}
                onChange={handleEstateChange}
                placeholder={t('estates.addressPlaceholder')}
                error={estateErrors.addressLine}
                required
              />

              <div className="form-row">
                <Select
                  label={t('estates.city')}
                  name="city"
                  value={estateFormData.city}
                  onChange={handleEstateChange}
                  options={cities.map((city) => ({
                    value: city.getLocalizedName(language),
                    label: city.getLocalizedName(language),
                  }))}
                  placeholder={t('estates.cityPlaceholder')}
                  error={estateErrors.city}
                  required
                />
                <Input
                  label={t('estates.district')}
                  name="district"
                  value={estateFormData.district}
                  onChange={handleEstateChange}
                  placeholder={t('estates.districtPlaceholder')}
                  error={estateErrors.district}
                  required
                />
              </div>

              <div className="form-row">
                <Input
                  label={t('estates.area')}
                  name="areaM2"
                  type="number"
                  step="0.1"
                  value={estateFormData.areaM2}
                  onChange={handleEstateChange}
                  placeholder="50"
                  error={estateErrors.areaM2}
                  required
                />
                <Input
                  label={t('estates.floor')}
                  name="floor"
                  type="number"
                  value={estateFormData.floor}
                  onChange={handleEstateChange}
                  placeholder={t('estates.floorPlaceholder')}
                  error={estateErrors.floor}
                  required
                />
              </div>

              {estateErrors.submit && (
                <div className="error-message">{estateErrors.submit}</div>
              )}

              <div className="form-actions">
                <Button type="submit" variant="primary">
                  {editingEstate ? t('estates.updateProperty') : t('estates.addProperty')}
                </Button>
                <Button type="button" variant="ghost" onClick={resetEstateForm}>
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="estates-grid">
          {estates.length === 0 ? (
            <Card>
              <p className="empty-message">{t('estates.noProperties')}</p>
            </Card>
          ) : (
            estates.map((estate) => (
              <Card key={estate.publicId} className="estate-card">
                <div className="estate-header">
                  <h3>{t(`estates.${estate.kind.toLowerCase()}`) || estate.kind}</h3>
                  <span className="estate-area">{estate.areaM2} m²</span>
                </div>
                <div className="estate-details">
                  <p>
                    <strong>{t('estates.address')}:</strong> {estate.addressLine}
                  </p>
                  <p>
                    <strong>{t('estates.city')}:</strong> {estate.city}, {estate.district}
                  </p>
                  <p>
                    <strong>{t('estates.floor')}:</strong> {estate.floor}
                  </p>
                </div>
                <div className="estate-actions">
                  <Button
                    size="small"
                    variant="outline"
                    onClick={() => handleEditEstate(estate)}
                  >
                    {t('common.edit')}
                  </Button>
                  <Button
                    size="small"
                    variant="error"
                    onClick={() => handleDeleteEstate(estate.publicId)}
                  >
                    {t('common.delete')}
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </>
    );
  };

  const renderContractsTab = () => {
    if (loadingContracts) {
      return (
        <div className="tab-loading">
          <div className="spinner"></div>
          <p className="loading-message">{t('common.loading')}</p>
        </div>
      );
    }

    if (contracts.length === 0) {
      return (
        <Card>
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>{t('contracts.noContracts')}</h3>
            <p>{t('contracts.noContractsDescription')}</p>
          </div>
        </Card>
      );
    }

    return (
      <div className="contracts-grid">
        {contracts.map((contract) => (
          <Card key={contract.id} className="contract-card">
            <div className="contract-header">
              <h3>{t('contracts.contractDetails')}</h3>
              {getStatusBadge(contract)}
            </div>

            <div className="contract-details">
              <div className="detail-row">
                <span className="detail-label">{t('contracts.startDate')}:</span>
                <span className="detail-value">
                  {contract.startDate ? new Date(contract.startDate).toLocaleDateString() : '-'}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">{t('contracts.endDate')}:</span>
                <span className="detail-value">
                  {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : '-'}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">{t('common.createdAt')}:</span>
                <span className="detail-value">
                  {contract.createdAt ? new Date(contract.createdAt).toLocaleDateString() : '-'}
                </span>
              </div>
            </div>

            {getCompletionStatus(contract) && (
              <div className="completion-status">
                <span className="status-icon">ℹ️</span>
                {getCompletionStatus(contract)}
              </div>
            )}

            {canConfirmCompletion(contract) && (
              <div className="contract-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => handleConfirmCompletion(contract.id)}
                  disabled={confirmingContract === contract.id}
                >
                  {confirmingContract === contract.id
                    ? t('common.loading')
                    : t('contracts.confirmCompletion')}
                </button>
              </div>
            )}
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="customer-profile-page">
      <div className="container">
        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            {t('profile.myProfile')}
          </button>
          <button
            className={`profile-tab ${activeTab === 'properties' ? 'active' : ''}`}
            onClick={() => setActiveTab('properties')}
          >
            {t('navbar.myProperties')}
          </button>
          <button
            className={`profile-tab ${activeTab === 'contracts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contracts')}
          >
            {t('navbar.contracts')}
          </button>
        </div>

        <div className="tab-content-wrapper">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'properties' && renderPropertiesTab()}
          {activeTab === 'contracts' && renderContractsTab()}
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
