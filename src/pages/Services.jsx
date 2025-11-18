import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { container } from '../infrastructure/di/ServiceContainer';
import './Services.css';

const Services = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredSubCategory, setHoveredSubCategory] = useState(null);

  useEffect(() => {
    loadCategoryTree();
  }, []);

  const loadCategoryTree = async () => {
    try {
      setLoading(true);
      const getCategoryTreeUseCase = container.getGetCategoryTreeUseCase();
      const result = await getCategoryTreeUseCase.execute(false);

      if (result.success) {
        setCategories(result.categories);
      }
    } catch (error) {
      console.error('Failed to load category tree:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    // If it's a leaf category (no children), navigate to builders page
    if (category.isLeafCategory()) {
      navigate(`/builders?categoryId=${category.id}`);
    }
    // If it has children, do nothing (hover will show them)
  };

  const handleMouseEnter = (category, level = 'main') => {
    if (level === 'main') {
      setHoveredCategory(category);
      setHoveredSubCategory(null);
    } else if (level === 'sub') {
      setHoveredSubCategory(category);
    }
  };

  const handleMouseLeave = (level = 'main') => {
    if (level === 'main') {
      setHoveredCategory(null);
      setHoveredSubCategory(null);
    } else if (level === 'sub') {
      setHoveredSubCategory(null);
    }
  };

  if (loading) {
    return (
      <div className="services-page">
        <div className="container">
          <div className="services-header">
            <h1>{t('services.title')}</h1>
            <p className="services-subtitle">{t('services.subtitle')}</p>
          </div>
          <div className="loading-state">
            <div className="spinner"></div>
            <p>{t('services.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="services-page">
      <div className="container">
        <div className="services-header">
          <h1>{t('services.title')}</h1>
          <p className="services-subtitle">{t('services.subtitle')}</p>
        </div>

        {categories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <p>{t('services.noCategories')}</p>
          </div>
        ) : (
          <div className="categories-mega-grid">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`category-card ${
                  category.isLeafCategory() ? 'clickable' : 'has-dropdown'
                } ${hoveredCategory?.id === category.id ? 'hovered' : ''}`}
                onMouseEnter={() => handleMouseEnter(category, 'main')}
                onMouseLeave={() => handleMouseLeave('main')}
                onClick={() => handleCategoryClick(category)}
              >
                <div className="category-card-content">
                  <div className="category-icon">{category.emoji}</div>
                  <h3 className="category-name">{category.name}</h3>
                  {!category.isLeafCategory() && (
                    <div className="category-badge">
                      {category.children.length} {t('services.subcategories')}
                    </div>
                  )}
                  {category.description && (
                    <p className="category-description">{category.description}</p>
                  )}
                </div>

                {/* First Level Dropdown - Children of root category */}
                {hoveredCategory?.id === category.id &&
                  !category.isLeafCategory() &&
                  category.children.length > 0 && (
                    <div className="mega-dropdown level-1">
                      <div className="mega-dropdown-content">
                        <h4 className="dropdown-title">{category.name}</h4>
                        <div className="dropdown-grid">
                          {category.children.map((child) => (
                            <div
                              key={child.id}
                              className="dropdown-item-wrapper"
                              onMouseEnter={() => handleMouseEnter(child, 'sub')}
                              onMouseLeave={() => handleMouseLeave('sub')}
                            >
                              <div
                                className={`dropdown-item ${
                                  child.isLeafCategory() ? 'clickable' : ''
                                } ${hoveredSubCategory?.id === child.id ? 'hovered' : ''}`}
                                onClick={() => handleCategoryClick(child)}
                              >
                                <span className="dropdown-item-icon">{child.emoji}</span>
                                <span className="dropdown-item-name">{child.name}</span>
                                {!child.isLeafCategory() && (
                                  <span className="dropdown-item-arrow">→</span>
                                )}
                              </div>

                              {/* Second Level Dropdown - Grandchildren */}
                              {hoveredSubCategory?.id === child.id &&
                                !child.isLeafCategory() &&
                                child.children.length > 0 && (
                                  <div className="mega-dropdown level-2">
                                    <div className="mega-dropdown-content">
                                      <h5 className="dropdown-title-small">{child.name}</h5>
                                      <div className="dropdown-list">
                                        {child.children.map((grandchild) => (
                                          <div
                                            key={grandchild.id}
                                            className="dropdown-item clickable"
                                            onClick={() => handleCategoryClick(grandchild)}
                                          >
                                            <span className="dropdown-item-icon">
                                              {grandchild.emoji}
                                            </span>
                                            <span className="dropdown-item-name">
                                              {grandchild.name}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}

        <div className="services-info">
          <div className="info-card">
            <div className="info-icon">🎯</div>
            <h3>{t('services.howItWorks')}</h3>
            <p>{t('services.howItWorksDescription')}</p>
          </div>
          <div className="info-card">
            <div className="info-icon">⭐</div>
            <h3>{t('services.qualityGuarantee')}</h3>
            <p>{t('services.qualityGuaranteeDescription')}</p>
          </div>
          <div className="info-card">
            <div className="info-icon">💬</div>
            <h3>{t('services.support')}</h3>
            <p>{t('services.supportDescription')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
