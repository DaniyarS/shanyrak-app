import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Select from './Select';
import CascadingCategorySelect from './CascadingCategorySelect';
import Card from './Card';
import './BuilderSearchForm.css';

const BuilderSearchForm = ({ categories, cities, onSearch, loading }) => {
  const { t, language } = useLanguage();
  const [filters, setFilters] = useState({
    q: '',
    city: '',
    categoryPublicId: '',
    ratingFrom: '',
    priceFrom: '',
    priceTo: '',
    availability: ''
  });

  // Auto-search when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 500); // Debounce search by 500ms

    return () => clearTimeout(timer);
  }, [filters]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (eventOrId) => {
    const categoryId = eventOrId?.target?.value || eventOrId;
    setFilters(prev => ({ ...prev, categoryPublicId: categoryId }));
  };

  const handleSearch = () => {
    // Filter out empty values
    const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value && value.toString().trim() !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});

    onSearch(activeFilters);
  };

  const handleReset = () => {
    setFilters({
      q: '',
      city: '',
      categoryPublicId: '',
      ratingFrom: '',
      priceFrom: '',
      priceTo: '',
      availability: ''
    });
  };

  return (
    <Card className="builder-search-form">
      <div className="search-form-header">
        <h3>{t('builders.searchBuilders')}</h3>
        <button
          type="button"
          className="reset-button"
          onClick={handleReset}
          disabled={loading}
        >
          {t('common.reset')}
        </button>
      </div>

      {/* Form Fields with Labels Above */}
      <div className="search-form-grid">
        {/* Search Query */}
        <div className="form-field">
          <label htmlFor="search-form-q" className="form-label">{t('common.search')}</label>
          <input
            id="search-form-q"
            name="q"
            type="text"
            value={filters.q}
            onChange={handleInputChange}
            placeholder={t('builders.searchPlaceholder')}
            disabled={loading}
            className="search-form-input-control"
          />
        </div>

        {/* City */}
        <div className="form-field">
          <label htmlFor="search-form-city" className="form-label">{t('estates.city')}</label>
          <Select
            name="city"
            value={filters.city}
            onChange={handleInputChange}
            options={cities.map((city) => ({
              value: city.getLocalizedName(language),
              label: city.getLocalizedName(language),
            }))}
            placeholder={t('builders.allCities')}
            disabled={loading}
            className="search-form-select"
            controlId="search-form-city"
          />
        </div>

        {/* Category */}
        <div className="form-field">
          <label htmlFor="search-form-category" className="form-label">{t('orders.category')}</label>
          <CascadingCategorySelect
            categories={categories}
            value={filters.categoryPublicId}
            onChange={handleCategoryChange}
            placeholder={t('builders.allCategories')}
            disabled={loading}
            className="search-form-category"
            inputId="search-form-category"
          />
        </div>

        {/* Rating */}
        <div className="form-field">
          <label htmlFor="search-form-ratingFrom" className="form-label">{t('builders.minRating')}</label>
          <Select
            name="ratingFrom"
            value={filters.ratingFrom}
            onChange={handleInputChange}
            options={[
              { value: '1', label: '1+ ⭐' },
              { value: '2', label: '2+ ⭐' },
              { value: '3', label: '3+ ⭐' },
              { value: '4', label: '4+ ⭐' },
              { value: '5', label: '5 ⭐' }
            ]}
            placeholder={t('builders.anyRating')}
            disabled={loading}
            className="search-form-select"
            controlId="search-form-ratingFrom"
          />
        </div>

        {/* Availability */}
        <div className="form-field">
          <label htmlFor="search-form-availability" className="form-label">{t('builders.availability')}</label>
          <Select
            name="availability"
            value={filters.availability}
            onChange={handleInputChange}
            options={[
              { value: 'true', label: t('builders.availableNow') },
              { value: 'false', label: t('builders.notAvailable') }
            ]}
            placeholder={t('builders.anyAvailability')}
            disabled={loading}
            className="search-form-select"
            controlId="search-form-availability"
          />
        </div>

        {/* Search Button */}
        <div className="form-field search-button-field">
          <label className="form-label form-label-spacer">&nbsp;</label>
          <button
            className="search-button"
            onClick={handleSearch}
            disabled={loading}
            title={loading ? t('common.searching') : t('common.search')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="M21 21L16.65 16.65"></path>
            </svg>
            <span className="search-button-text">{loading ? t('common.searching') : t('common.search')}</span>
          </button>
        </div>
      </div>
    </Card>
  );
};

export default BuilderSearchForm;