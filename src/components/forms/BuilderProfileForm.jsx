import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import Button from '../Button';
import Input from '../Input';
import Select from '../Select';
import AvatarUpload from '../AvatarUpload';
import PortfolioUpload from '../PortfolioUpload';
import categoryService from '../../services/categoryService';
import './BuilderProfileForm.css';

/**
 * BuilderProfileForm - Reusable form component for builder profile information
 * Can be used in registration flow or for testing UI components in isolation
 */
const BuilderProfileForm = ({
  onSubmit,
  loading = false,
  showSuccessHeader = true,
  initialData = null,
  submitButtonText = null
}) => {
  const { t } = useLanguage();

  // Builder profile form data
  const [builderFormData, setBuilderFormData] = useState(
    initialData || {
      aboutMe: '',
      experienceYears: '',
      city: '',
      district: '',
      jobsDone: '',
      available: true,
    }
  );

  // Avatar and portfolio files
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [portfolioFiles, setPortfolioFiles] = useState([]);

  // Categories
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    categoryId: '',
    price: '',
    description: '',
  });

  const [errors, setErrors] = useState({});

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const allCategories = await categoryService.getAllCategories();

      // Filter to get only leaf categories (categories without children)
      const leafCategories = [];

      const checkIfLeaf = async (category) => {
        try {
          const children = await categoryService.getCategoryChildren(category.uuid || category.publicId);
          return !children || children.length === 0;
        } catch (error) {
          // If fetching children fails, assume it's a leaf category
          return true;
        }
      };

      for (const category of allCategories) {
        const isLeaf = await checkIfLeaf(category);
        if (isLeaf) {
          leafCategories.push(category);
        }
      }

      setAvailableCategories(leafCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleBuilderFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBuilderFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Avatar upload handler
  const handleAvatarUpdate = (newAvatarUrl) => {
    setAvatarUrl(newAvatarUrl);
  };

  // Portfolio photos handler
  const handlePortfolioPhotosChange = (files) => {
    setPortfolioFiles(files);
  };

  // Category handlers
  const handleNewCategoryChange = (e) => {
    const { name, value } = e.target;
    setNewCategory((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddCategory = () => {
    if (!newCategory.categoryId || !newCategory.price) {
      setErrors({ category: t('validation.required') });
      return;
    }

    const category = availableCategories.find(
      (cat) => cat.uuid === newCategory.categoryId || cat.publicId === newCategory.categoryId
    );

    if (!category) return;

    setSelectedCategories((prev) => [
      ...prev,
      {
        id: newCategory.categoryId,
        name: category.name,
        price: newCategory.price,
        description: newCategory.description,
      },
    ]);

    setNewCategory({ categoryId: '', price: '', description: '' });
    setErrors({});
  };

  const handleRemoveCategory = (index) => {
    setSelectedCategories((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!builderFormData.city) {
      newErrors.city = t('estates.cityRequired');
    }

    if (!builderFormData.district) {
      newErrors.district = t('estates.districtRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Call parent onSubmit with all form data
    if (onSubmit) {
      onSubmit({
        builderFormData,
        avatarUrl,
        portfolioFiles,
        selectedCategories,
      });
    }
  };

  return (
    <div className="builder-profile-form-wrapper">
      {showSuccessHeader && (
        <div className="form-header">
          <div className="success-icon">✓</div>
          <h1>{t('registration.congratulations')}</h1>
          <p className="success-subtitle">{t('registration.successfullyVerified')}</p>
          <p>{t('registration.lastStep')}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="builder-profile-form">
        <h2>{t('registration.moreInfoNeeded')}</h2>

        {/* Avatar Upload */}
        <div className="input-wrapper">
          <label className="input-label">{t('registration.uploadAvatar')}</label>
          <p className="input-hint">{t('registration.uploadAvatarDesc')}</p>
          <AvatarUpload
            currentAvatarUrl={avatarUrl}
            onAvatarUpdate={handleAvatarUpdate}
          />
        </div>

        <div className="input-wrapper">
          <label className="input-label">{t('services.aboutMe')}</label>
          <textarea
            name="aboutMe"
            value={builderFormData.aboutMe}
            onChange={handleBuilderFormChange}
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
            value={builderFormData.experienceYears}
            onChange={handleBuilderFormChange}
            error={errors.experienceYears}
          />

          <Input
            label={t('services.jobsDone')}
            name="jobsDone"
            type="number"
            value={builderFormData.jobsDone}
            onChange={handleBuilderFormChange}
            error={errors.jobsDone}
          />
        </div>

        <div className="form-row">
          <Input
            label={t('services.city')}
            name="city"
            value={builderFormData.city}
            onChange={handleBuilderFormChange}
            error={errors.city}
            required
          />

          <Input
            label={t('services.district')}
            name="district"
            value={builderFormData.district}
            onChange={handleBuilderFormChange}
            error={errors.district}
            required
          />
        </div>

        {/* Portfolio Upload */}
        <div className="input-wrapper">
          <label className="input-label">{t('registration.uploadPortfolio')}</label>
          <p className="input-hint">{t('registration.uploadPortfolioDesc')}</p>
          <PortfolioUpload
            onPhotosChange={handlePortfolioPhotosChange}
            maxPhotos={10}
          />
        </div>

        {/* Category Selection */}
        <div className="input-wrapper">
          <label className="input-label">{t('registration.addCategory')}</label>
          <p className="input-hint">{t('registration.addCategoryDesc')}</p>

          <div className="category-form">
            <Select
              label={t('registration.selectCategoryPlaceholder')}
              name="categoryId"
              value={newCategory.categoryId}
              onChange={handleNewCategoryChange}
              options={availableCategories.map((cat) => ({
                value: cat.uuid || cat.publicId,
                label: cat.name,
              }))}
              placeholder={t('registration.selectCategoryPlaceholder')}
              error={errors.category}
            />

            <Input
              label={t('registration.categoryPrice')}
              name="price"
              type="text"
              value={newCategory.price}
              onChange={handleNewCategoryChange}
              placeholder={t('registration.categoryPricePlaceholder')}
            />

            <div className="input-wrapper">
              <label className="input-label">{t('registration.categoryDescription')}</label>
              <textarea
                name="description"
                value={newCategory.description}
                onChange={handleNewCategoryChange}
                placeholder={t('registration.categoryDescriptionPlaceholder')}
                className="input"
                rows="2"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleAddCategory}
            >
              {t('registration.addCategory')}
            </Button>
          </div>

          {/* Selected Categories List */}
          {selectedCategories.length > 0 && (
            <div className="selected-categories">
              <h3>{t('registration.yourCategories')}</h3>
              {selectedCategories.map((category, index) => (
                <div key={index} className="category-item">
                  <div className="category-info">
                    <strong>{category.name}</strong>
                    <span className="category-price">{category.price}</span>
                    {category.description && (
                      <p className="category-desc">{category.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(index)}
                    className="remove-category-btn"
                  >
                    {t('registration.removeCategory')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="input-wrapper">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="available"
              checked={builderFormData.available}
              onChange={handleBuilderFormChange}
            />
            <span>{t('services.available')}</span>
          </label>
        </div>

        {errors.submit && (
          <div className="error-message">{errors.submit}</div>
        )}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={loading}
        >
          {loading ? t('common.creating') : (submitButtonText || t('registration.completeRegistration'))}
        </Button>
      </form>
    </div>
  );
};

export default BuilderProfileForm;
