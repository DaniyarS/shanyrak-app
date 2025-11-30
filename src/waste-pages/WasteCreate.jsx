import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { container } from '../infrastructure/di/ServiceContainer';
import LoginRegisterModal from '../components/LoginRegisterModal';
import './WasteCreate.css';

const STEPS = {
  PHOTOS: 1,
  DETAILS: 2,
  ADDRESS: 3
};

function WasteCreate({ onClose, onSuccess }) {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();

  const [currentStep, setCurrentStep] = useState(STEPS.PHOTOS);

  // Photo management
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const fileInputRef = useRef(null);

  // Category management
  const [categories, setCategories] = useState([]);
  const [flatCategories, setFlatCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    city: 'Алматы',
    district: '',
    unit: 'pcs',
    amount: '',
    price: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const useCase = container.getGetWasteCategoryTreeUseCase();
      const result = await useCase.execute();
      if (result.success) {
        setCategories(result.tree);
        const flat = flattenCategories(result.tree);
        setFlatCategories(flat);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const flattenCategories = (tree, result = []) => {
    tree.forEach(cat => {
      if (cat.isLeaf()) {
        result.push(cat);
      }
      if (cat.children && cat.children.length > 0) {
        flattenCategories(cat.children, result);
      }
    });
    return result;
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newPhotos = [...photos, ...files].slice(0, 5);
      const newPreviews = newPhotos.map(file => URL.createObjectURL(file));
      setPhotos(newPhotos);
      setPhotoPreviews(newPreviews);
    }
  };

  const removePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
  };

  const handleNextStep = () => {
    if (currentStep === STEPS.PHOTOS) {
      setCurrentStep(STEPS.DETAILS);
    } else if (currentStep === STEPS.DETAILS) {
      // Validate details step
      if (!selectedCategory) {
        setError(t.waste.createFlow.categoryRequired);
        return;
      }
      if (!formData.title.trim()) {
        setError(t.waste.createFlow.titleRequired);
        return;
      }
      if (!formData.amount || formData.amount <= 0) {
        setError(t.waste.createFlow.amountRequired);
        return;
      }
      setError('');
      setCurrentStep(STEPS.ADDRESS);
    }
  };

  const handlePrevStep = () => {
    setError('');
    if (currentStep === STEPS.DETAILS) {
      setCurrentStep(STEPS.PHOTOS);
    } else if (currentStep === STEPS.ADDRESS) {
      setCurrentStep(STEPS.DETAILS);
    }
  };

  const submitWaste = async () => {
    setLoading(true);
    setError('');

    try {
      const category = flatCategories.find(c => c.id === selectedCategory);

      const useCase = container.getCreateWasteUseCase();
      const wasteData = {
        ...formData,
        category,
        photos: []
      };

      const result = await useCase.execute(wasteData);

      if (result.success) {
        alert(t.waste.publishSuccess);
        localStorage.removeItem('waste_draft');
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/');
        }
      } else {
        setError(result.error || t.waste.publishFailed);
      }
    } catch (error) {
      setError(t.waste.publishFailed);
      console.error('Publish failed:', error);
    } finally {
      setLoading(false);
      setPendingSubmit(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check authentication before submitting
    if (!isAuthenticated) {
      // Save form data to localStorage for potential restoration
      const savedData = {
        photos: photoPreviews,
        selectedCategory,
        formData,
        timestamp: Date.now()
      };
      localStorage.setItem('waste_draft', JSON.stringify(savedData));

      // Show auth modal instead of alert/confirm
      setPendingSubmit(true);
      setShowAuthModal(true);
      return;
    }

    await submitWaste();
  };

  const handleAuthSuccess = async () => {
    setShowAuthModal(false);
    // After successful authentication, submit the form
    if (pendingSubmit) {
      await submitWaste();
    }
  };

  const handleAuthClose = () => {
    setShowAuthModal(false);
    setPendingSubmit(false);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/');
    }
  };

  return (
    <>
      {showAuthModal && (
        <LoginRegisterModal
          onClose={handleAuthClose}
          onSuccess={handleAuthSuccess}
        />
      )}

      <div className="waste-create-form">
        <div className="form-header">
        <button onClick={handleClose} className="btn-close" aria-label="Close">
          ×
        </button>
        <h2>{t.waste.createAd}</h2>

        {/* Step Indicator */}
        <div className="step-indicator">
          <div className={`step-item ${currentStep >= STEPS.PHOTOS ? 'active' : ''} ${currentStep > STEPS.PHOTOS ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">{t.waste.createFlow.stepPhotos}</div>
          </div>
          <div className={`step-item ${currentStep >= STEPS.DETAILS ? 'active' : ''} ${currentStep > STEPS.DETAILS ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">{t.waste.createFlow.stepDetails}</div>
          </div>
          <div className={`step-item ${currentStep >= STEPS.ADDRESS ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">{t.waste.createFlow.stepAddress}</div>
          </div>
        </div>
      </div>

      <div className="form-content">
        {/* Step 1: Photos */}
        {currentStep === STEPS.PHOTOS && (
          <div className="step-section">
            <h3 className="step-title">{t.waste.createFlow.stepPhotos}</h3>
            <p className="step-hint">{t.waste.createFlow.photoOptional}</p>

            {photoPreviews.length > 0 && (
              <div className="photos-preview">
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="photo-item">
                    <img src={preview} alt={`${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="photo-remove"
                      aria-label="Remove"
                    >
                      ×
                    </button>
                    {index === 0 && <span className="main-badge">{t.waste.createFlow.mainPhoto}</span>}
                  </div>
                ))}
              </div>
            )}

            {photos.length < 5 && (
              <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
                <div className="upload-icon">📷</div>
                <p className="upload-text">{t.waste.createFlow.uploadPhotos}</p>
                <p className="upload-hint">{t.waste.createFlow.photoCount.replace('{count}', photos.length).replace('{max}', '5')}</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </div>
            )}

            <div className="step-actions">
              <button type="button" onClick={handleNextStep} className="btn-next-step">
                {t.common.next}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {currentStep === STEPS.DETAILS && (
          <div className="step-section">
            <h3 className="step-title">{t.waste.createFlow.stepDetails}</h3>

            <div className="form-group">
              <label className="field-label">{t.waste.createFlow.category} *</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select"
                required
              >
                <option value="">{t.waste.createFlow.selectCategory}</option>
                {flatCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.getLocalizedName(language)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="field-label">{t.waste.createFlow.title} *</label>
              <input
                type="text"
                placeholder={t.waste.createFlow.titlePlaceholder}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="field-label">{t.waste.createFlow.description}</label>
              <textarea
                placeholder={t.waste.createFlow.descriptionPlaceholder}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="form-textarea"
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="field-label">{t.waste.amount} *</label>
                <input
                  type="number"
                  placeholder={t.waste.createFlow.amountPlaceholder}
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="form-input"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label className="field-label">{t.waste.unit} *</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="form-select"
                  required
                >
                  <option value="pcs">{t.waste.units.pcs}</option>
                  <option value="kg">{t.waste.units.kg}</option>
                  <option value="m">{t.waste.units.m}</option>
                  <option value="m2">{t.waste.units.m2}</option>
                  <option value="m3">{t.waste.units.m3}</option>
                  <option value="ton">{t.waste.units.ton}</option>
                  <option value="bag">{t.waste.units.bag}</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="field-label">{t.waste.price}</label>
              <input
                type="number"
                placeholder={t.waste.createFlow.pricePlaceholder}
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                className="form-input"
                min="0"
              />
              <p className="field-hint">{t.waste.createFlow.priceHint}</p>
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="step-actions">
              <button type="button" onClick={handlePrevStep} className="btn-prev-step">
                {t.common.back}
              </button>
              <button type="button" onClick={handleNextStep} className="btn-next-step">
                {t.common.next}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Address */}
        {currentStep === STEPS.ADDRESS && (
          <form onSubmit={handleSubmit} className="step-section">
            <h3 className="step-title">{t.waste.createFlow.stepAddress}</h3>

            <div className="form-group">
              <label className="field-label">{t.waste.city} *</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="form-select"
                required
              >
                <option value="Алматы">Алматы</option>
                <option value="Астана">Астана</option>
                <option value="Шымкент">Шымкент</option>
              </select>
            </div>

            <div className="form-group">
              <label className="field-label">{t.waste.createFlow.districtLabel}</label>
              <input
                type="text"
                placeholder={t.waste.createFlow.districtPlaceholder}
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="form-input"
              />
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="step-actions">
              <button type="button" onClick={handlePrevStep} className="btn-prev-step">
                {t.common.back}
              </button>
              <button type="submit" disabled={loading} className="btn-submit">
                {loading ? t.waste.createFlow.publishing : t.waste.createFlow.publish}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
    </>
  );
}

export default WasteCreate;
