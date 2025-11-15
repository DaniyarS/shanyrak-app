import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { container } from '../infrastructure/di/ServiceContainer';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import AvatarUpload from '../components/AvatarUpload';
import PortfolioUpload from '../components/PortfolioUpload';
import categoryService from '../services/categoryService';
import builderService from '../services/builderService';
import fileService from '../services/fileService';
import './Testing.css';

const Testing = () => {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState('builder-form');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Builder form state
  const [builderFormData, setBuilderFormData] = useState({
    aboutMe: '',
    experienceYears: '',
    city: '',
    district: '',
    jobsDone: '',
    available: true,
  });

  const [avatarUrl, setAvatarUrl] = useState(null);
  const [portfolioFiles, setPortfolioFiles] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    categoryId: '',
    price: '',
    description: '',
  });

  useEffect(() => {
    if (activeSection === 'builder-form') {
      loadCategories();
    }
  }, [activeSection]);

  const loadCategories = async () => {
    try {
      const allCategories = await categoryService.getAllCategories();

      // Filter to get only leaf categories
      const leafCategories = [];

      const checkIfLeaf = async (category) => {
        try {
          const children = await categoryService.getCategoryChildren(category.uuid || category.publicId);
          return !children || children.length === 0;
        } catch (error) {
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
  };

  const handleAvatarUpdate = (newAvatarUrl) => {
    setAvatarUrl(newAvatarUrl);
  };

  const handlePortfolioPhotosChange = (files) => {
    setPortfolioFiles(files);
  };

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

  const handleBuilderFormSubmit = async (e) => {
    e.preventDefault();
    console.log('Builder Form Submitted:', {
      builderFormData,
      avatarUrl,
      portfolioFiles,
      selectedCategories,
    });
    alert('Check console for form data. This is a testing environment.');
  };

  const renderBuilderForm = () => (
    <Card className="testing-card">
      <h2>{t('registration.moreInfoNeeded')}</h2>

      <form onSubmit={handleBuilderFormSubmit} className="testing-form">
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
          />

          <Input
            label={t('services.jobsDone')}
            name="jobsDone"
            type="number"
            value={builderFormData.jobsDone}
            onChange={handleBuilderFormChange}
          />
        </div>

        <div className="form-row">
          <Input
            label={t('services.city')}
            name="city"
            value={builderFormData.city}
            onChange={handleBuilderFormChange}
            required
          />

          <Input
            label={t('services.district')}
            name="district"
            value={builderFormData.district}
            onChange={handleBuilderFormChange}
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
          {loading ? t('common.creating') : 'Test Submit (Check Console)'}
        </Button>
      </form>
    </Card>
  );

  const renderOtherComponents = () => (
    <Card className="testing-card">
      <h2>Other UI Components</h2>
      <p>Add more components here for testing...</p>
    </Card>
  );

  return (
    <div className="testing-page">
      <div className="testing-container">
        <div className="testing-header">
          <h1>🧪 Testing Lab</h1>
          <p className="testing-env-badge">Development Environment Only</p>
        </div>

        <div className="testing-tabs">
          <button
            className={`testing-tab ${activeSection === 'builder-form' ? 'active' : ''}`}
            onClick={() => setActiveSection('builder-form')}
          >
            Builder Registration Form
          </button>
          <button
            className={`testing-tab ${activeSection === 'other' ? 'active' : ''}`}
            onClick={() => setActiveSection('other')}
          >
            Other Components
          </button>
        </div>

        <div className="testing-content">
          {activeSection === 'builder-form' && renderBuilderForm()}
          {activeSection === 'other' && renderOtherComponents()}
        </div>
      </div>
    </div>
  );
};

export default Testing;
