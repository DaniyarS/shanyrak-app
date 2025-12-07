import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { container } from '../infrastructure/di/ServiceContainer';
import Input from './Input';
import CascadingCategorySelect from './CascadingCategorySelect';
import Button from './Button';
import './Modal.css';

const AddCategoryModal = ({ isOpen, onClose, onSuccess, builderData }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    categoryPublicId: '',
    price: '',
    description: ''
  });
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      // Reset form when opening modal
      setFormData({
        categoryPublicId: '',
        price: '',
        description: ''
      });
      setErrors({});
    }
  }, [isOpen]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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
    
    setFormData(prev => ({
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    if (!formData.categoryPublicId) {
      newErrors.categoryPublicId = t('validation.required');
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = t('orders.priceRequired');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const addCategoryUseCase = container.getAddBuilderCategoryUseCase();
      const result = await addCategoryUseCase.execute(builderData.id, {
        category: {
          publicId: formData.categoryPublicId
        },
        price: parseFloat(formData.price),
        description: formData.description
      });

      if (result.success) {
        onSuccess(result);
        onClose();
      } else {
        setErrors(result.errors || { submit: t('profile.addCategoryFailed') });
      }
    } catch (error) {
      console.error('Error adding category:', error);
      setErrors({ submit: t('profile.addCategoryFailed') });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('profile.addNewCategory')}</h2>
          <button className="modal-close" onClick={handleClose} disabled={loading}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <CascadingCategorySelect
                label={t('profile.selectCategory')}
                categories={categories}
                value={formData.categoryPublicId}
                onChange={handleCategorySelect}
                error={errors.categoryPublicId}
                required
              />
            </div>
            
            <div className="form-group">
              <Input
                label={t('profile.price')}
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                error={errors.price}
                placeholder={t('orders.yourPrice')}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">
                {t('profile.description')}
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={t('profile.categoryDescription')}
                className="input"
                rows="3"
              />
            </div>

            {errors.submit && (
              <div className="error-message">{errors.submit}</div>
            )}

            <div className="modal-actions">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={loading}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading ? t('common.loading') : t('profile.addCategory')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCategoryModal;