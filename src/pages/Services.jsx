import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { container } from '../infrastructure/di/ServiceContainer';
import BuilderSearchForm from '../components/BuilderSearchForm';
import BuildersList from '../components/BuildersList';
import './Services.css';

const Services = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredSubCategory, setHoveredSubCategory] = useState(null);
  
  // Builders section state
  const [builders, setBuilders] = useState([]);
  const [buildersLoading, setBuildersLoading] = useState(false);
  const [, setBuilderFilters] = useState({});
  const [cities, setCities] = useState([]);
  const [builderAvatars, setBuilderAvatars] = useState(new Map()); // Map of builderId -> avatarUrl

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const getCategoryTreeUseCase = container.getGetCategoryTreeUseCase();
      const getCitiesUseCase = container.getGetCitiesUseCase();
      const searchBuildersUseCase = container.getSearchBuildersUseCase();
      
      const [categoryResult, citiesResult, buildersResult] = await Promise.all([
        getCategoryTreeUseCase.execute(false),
        getCitiesUseCase.execute(false),
        searchBuildersUseCase.execute({ page: 0, size: 6 }) // Load first 6 builders
      ]);

      if (categoryResult.success) {
        setCategories(categoryResult.categories);
      }
      
      if (citiesResult.success) {
        setCities(citiesResult.cities);
      }
      
      if (buildersResult.success) {
        const loadedBuilders = buildersResult.builders || [];
        setBuilders(loadedBuilders);
        
        // Fetch avatars for builders
        if (loadedBuilders.length > 0) {
          fetchBuilderAvatars(loadedBuilders);
        }
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBuilderAvatars = async (buildersArray) => {
    try {
      const avatarsMap = new Map();
      const baseUrl = 'https://api.shanyrak.group';
      
      await Promise.all(
        buildersArray.map(async (builder) => {
          if (builder.id) {
            try {
              // Use the proper files API endpoint with query parameters
              const avatarUrl = `${baseUrl}/api/v1/files?linkType=USER_AVATAR&linkPublicId=${builder.id}`;
              
              // Test if the avatar URL is accessible
              const response = await fetch(avatarUrl, { method: 'HEAD' });
              if (response.ok) {
                avatarsMap.set(builder.id, avatarUrl);
              }
            } catch (error) {
              console.warn(`Failed to fetch avatar for builder ${builder.id}:`, error);
            }
          }
        })
      );
      
      setBuilderAvatars(avatarsMap);
    } catch (error) {
      console.error('Error fetching builder avatars:', error);
    }
  };

  const handleBuilderSearch = async (filters) => {
    try {
      setBuildersLoading(true);
      setBuilderFilters(filters);
      
      const searchBuildersUseCase = container.getSearchBuildersUseCase();
      const result = await searchBuildersUseCase.execute({ ...filters, page: 0, size: 20 });
      
      if (result.success) {
        const searchedBuilders = result.builders || [];
        setBuilders(searchedBuilders);
        
        // Fetch avatars for searched builders
        if (searchedBuilders.length > 0) {
          fetchBuilderAvatars(searchedBuilders);
        }
      }
    } catch (error) {
      console.error('Builder search failed:', error);
    } finally {
      setBuildersLoading(false);
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
          <div className="builders-section-header">
            <h1>{t('services.findBuilders')}</h1>
            <p className="services-subtitle">{t('services.buildersDescription')}</p>
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
        {/* Builders Section */}
        <div className="builders-section">
          <div className="builders-section-header">
            <h1>{t('services.findBuilders')}</h1>
            <p className="services-subtitle">{t('services.buildersDescription')}</p>
          </div>
          
          <BuilderSearchForm
            categories={categories}
            cities={cities}
            onSearch={handleBuilderSearch}
            loading={buildersLoading}
          />
          
          <BuildersList
            builders={builders}
            loading={buildersLoading}
            builderAvatars={builderAvatars}
          />
        </div>

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
