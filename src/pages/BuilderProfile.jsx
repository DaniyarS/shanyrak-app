import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { container } from '../infrastructure/di/ServiceContainer';
import { ContractStatus } from '../domain/entities/Contract';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import AvatarUpload from '../components/AvatarUpload';
import PortfolioGallery from '../components/PortfolioGallery';
import CascadingCategorySelect from '../components/CascadingCategorySelect';
import DeleteAccountDialog from '../components/DeleteAccountDialog';
import './BuilderProfile.css';

const BuilderProfile = () => {
  const { updateUser, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [builderData, setBuilderData] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [portfolioPhotos, setPortfolioPhotos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [addCategoryForm, setAddCategoryForm] = useState({
    categoryPublicId: '',
    price: '',
    description: ''
  });
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

  // Contracts state
  const [contracts, setContracts] = useState([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [confirmingContract, setConfirmingContract] = useState(null);

  useEffect(() => {
    fetchBuilderProfile();
    fetchAvatar();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (activeTab === 'contracts') {
      fetchContracts();
    }
  }, [activeTab]);

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

  const fetchCategories = async () => {
    try {
      const getCategoryTreeUseCase = container.getGetCategoryTreeUseCase();
      const result = await getCategoryTreeUseCase.execute();

      if (result.success) {
        setCategories(result.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
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

  const handleAddCategoryFormChange = (e) => {
    const { name, value } = e.target;
    setAddCategoryForm(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCategorySelect = (eventOrId) => {
    // Handle both event object and direct ID value
    const categoryId = eventOrId?.target?.value || eventOrId;
    
    setAddCategoryForm(prev => ({
      ...prev,
      categoryPublicId: categoryId
    }));
    
    // Clear category-related error immediately
    if (categoryId) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.categoryPublicId;
        return newErrors;
      });
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();

    if (!addCategoryForm.categoryPublicId) {
      setErrors(prev => ({ ...prev, categoryPublicId: 'Please select a category' }));
      return;
    }

    if (!addCategoryForm.price || parseFloat(addCategoryForm.price) <= 0) {
      setErrors(prev => ({ ...prev, price: 'Please enter a valid price' }));
      return;
    }

    setAddingCategory(true);
    try {
      const addCategoryUseCase = container.getAddBuilderCategoryUseCase();
      const result = await addCategoryUseCase.execute(builderData.id, {
        category: {
          publicId: addCategoryForm.categoryPublicId
        },
        price: addCategoryForm.price,
        description: addCategoryForm.description
      });

      if (result.success) {
        // If backend returns updated builder data, use it; otherwise update locally
        if (result.builder && result.builder.priceList) {
          setBuilderData(prevData => ({
            ...prevData,
            priceList: result.builder.priceList
          }));
        } else {
          // Fallback: Create the new category locally
          const findCategoryById = (cats, targetId) => {
            for (const cat of cats) {
              if (cat.id === targetId) return cat;
              if (cat.children && cat.children.length > 0) {
                const found = findCategoryById(cat.children, targetId);
                if (found) return found;
              }
            }
            return null;
          };
          
          const selectedCategory = findCategoryById(categories, addCategoryForm.categoryPublicId);
          const newCategory = {
            id: Date.now(), // Temporary ID until next page refresh
            category: selectedCategory,
            price: parseFloat(addCategoryForm.price),
            description: addCategoryForm.description
          };
          
          setBuilderData(prevData => ({
            ...prevData,
            priceList: [...(prevData.priceList || []), newCategory]
          }));
        }
        
        setAddCategoryForm({ categoryPublicId: '', price: '', description: '' });
        setShowAddCategory(false);
        setErrors({}); // Clear all errors on success
      } else {
        setErrors(result.errors || { submit: t('profile.addCategoryFailed') });
      }
    } catch (error) {
      console.error('Error adding category:', error);
      setErrors({ submit: t('profile.addCategoryFailed') });
    } finally {
      setAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (priceListId) => {
    if (!window.confirm(t('profile.confirmDeleteCategory'))) {
      return;
    }

    setDeletingCategory(priceListId);
    try {
      const deleteCategoryUseCase = container.getDeleteBuilderCategoryUseCase();
      const result = await deleteCategoryUseCase.execute(priceListId);

      if (result.success) {
        // Remove the category locally instead of refreshing entire page
        setBuilderData(prevData => ({
          ...prevData,
          priceList: prevData.priceList.filter(item => item.id !== priceListId)
        }));
      } else {
        alert(result.errors?.submit || t('profile.deleteCategoryFailed'));
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert(t('profile.deleteCategoryFailed'));
    } finally {
      setDeletingCategory(null);
    }
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
      const result = await completeContractUseCase.execute(contractId, false); // false for builder confirmation

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
    return !contract.builderConfirmedComplete;
  };

  const getCompletionStatus = (contract) => {
    if (contract.status === ContractStatus.COMPLETED) {
      return t('contracts.bothPartiesConfirmed');
    }

    if (contract.builderConfirmedComplete) {
      return t('contracts.waitingForOtherParty');
    }

    return null;
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
                {(builderData?.firstName || builderData?.lastName) && (
                  <div className="detail-row">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">
                      {[builderData?.firstName, builderData?.lastName].filter(Boolean).join(' ') || 'N/A'}
                    </span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-label">{t('profile.fullName')}:</span>
                  <span className="detail-value">{builderData?.fullName || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t('profile.phone')}:</span>
                  <span className="detail-value">{builderData?.phone}</span>
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
                  <span className="detail-label">{t('services.rating')}:</span>
                  <span className="detail-value rating-value">
                    ⭐ {builderData?.ratingAvg?.toFixed(1) || '0.0'} / 5.0
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t('services.experienceYears')}:</span>
                  <span className="detail-value">{builderData?.experienceYears || 0} {t('services.years')}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t('services.jobsDone')}:</span>
                  <span className="detail-value">{builderData?.jobsDone || 0} {t('profile.completedProjects')}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t('profile.location')}:</span>
                  <span className="detail-value">
                    {[builderData?.city, builderData?.district].filter(Boolean).join(', ') || 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t('profile.status')}:</span>
                  <span className={`status-badge ${builderData?.available ? 'available' : 'unavailable'}`}>
                    {builderData?.available ? t('services.available') : t('services.notAvailable')}
                  </span>
                </div>
              </div>
            </div>

            {/* Categories Section */}
            <div className="profile-section">
              <div className="section-header">
                <h3>{t('profile.serviceCategories')}</h3>
                <Button
                  variant="outline"
                  onClick={() => setShowAddCategory(true)}
                >
                  {t('profile.addCategory')}
                </Button>
              </div>
              
              {builderData?.priceList && builderData.priceList.length > 0 ? (
                <div className="categories-list">
                  {builderData.priceList.map((item) => {
                    const categoryName = typeof item.category === 'object' && item.category !== null
                      ? (item.category.name || 'Service')
                      : (item.category || 'Service');
                    
                    return (
                      <div key={item.id} className="category-item">
                        <div className="category-info">
                          <h4>{categoryName}</h4>
                          <p className="category-price">{item.price} ₸</p>
                          {item.description && (
                            <p className="category-description">{item.description}</p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => handleDeleteCategory(item.id)}
                          style={{ borderColor: '#ef4444', color: '#ef4444' }}
                          disabled={deletingCategory === item.id}
                        >
                          {deletingCategory === item.id ? t('common.loading') : t('common.delete')}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p>{t('profile.noCategoriesYet')}</p>
              )}

              {/* Add Category Form */}
              {showAddCategory && (
                <div className="add-category-form">
                  <h4>{t('profile.addNewCategory')}</h4>
                  <form onSubmit={handleAddCategory}>
                    <CascadingCategorySelect
                      label={t('profile.selectCategory')}
                      categories={categories}
                      value={addCategoryForm.categoryPublicId}
                      onChange={handleCategorySelect}
                      error={errors.categoryPublicId}
                      required
                    />
                    
                    <Input
                      label={t('profile.price')}
                      name="price"
                      type="number"
                      step="0.01"
                      value={addCategoryForm.price}
                      onChange={handleAddCategoryFormChange}
                      error={errors.price}
                      required
                    />
                    
                    <div className="input-wrapper">
                      <label className="input-label">{t('profile.description')}</label>
                      <textarea
                        name="description"
                        value={addCategoryForm.description}
                        onChange={handleAddCategoryFormChange}
                        placeholder={t('profile.categoryDescription')}
                        className="input"
                        rows="3"
                      />
                    </div>

                    {errors.submit && (
                      <div className="error-message">{errors.submit}</div>
                    )}

                    <div className="form-actions">
                      <Button type="submit" variant="primary" disabled={addingCategory}>
                        {addingCategory ? t('common.loading') : t('profile.addCategory')}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={addingCategory}
                        onClick={() => {
                          setShowAddCategory(false);
                          setAddCategoryForm({ categoryPublicId: '', price: '', description: '' });
                          setErrors({}); // Clear all errors when canceling
                        }}
                      >
                        {t('common.cancel')}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
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
        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            {t('profile.myProfile')}
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
          {activeTab === 'contracts' && renderContractsTab()}
        </div>
      </div>
    </div>
  );
};

export default BuilderProfile;
