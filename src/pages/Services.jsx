import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { container } from '../infrastructure/di/ServiceContainer';
import Card from '../components/Card';
import BuilderCard from '../components/services/BuilderCard';
import BuilderDetailDialog from '../components/services/BuilderDetailDialog';
import './Services.css';

const Services = () => {
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryPath, setCategoryPath] = useState([]);
  const [builders, setBuilders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buildersLoading, setBuildersLoading] = useState(false);
  const [selectedBuilder, setSelectedBuilder] = useState(null);
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const [imageErrorStates, setImageErrorStates] = useState({});

  useEffect(() => {
    loadRootCategories();
  }, []);

  useEffect(() => {
    // Set timeout for image loading (10 seconds)
    categories.forEach((category) => {
      if (imageLoadingStates[category.id] !== false && !imageErrorStates[category.id]) {
        const timer = setTimeout(() => {
          handleImageError(category.id);
        }, 10000);

        return () => clearTimeout(timer);
      }
    });
  }, [categories, imageLoadingStates, imageErrorStates]);

  const loadRootCategories = async () => {
    try {
      setLoading(true);
      const categoryRepository = container.getCategoryRepository();
      const categories = await categoryRepository.getAll();
      setCategories(categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryChildren = async (category) => {
    try {
      setLoading(true);
      const categoryRepository = container.getCategoryRepository();
      const children = await categoryRepository.getChildren(category.id);

      if (children && children.length > 0) {
        // Has children - navigate to subcategories
        setCategories(children);
        setCategoryPath([...categoryPath, category]);
        setSelectedCategory(null);
        setBuilders([]);
      } else {
        // No children - this is a leaf category, load builders
        setSelectedCategory(category);
        setCategoryPath([...categoryPath, category]);
        loadBuilders(category.id);
      }
    } catch (error) {
      console.error('Failed to load category children:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBuilders = async (categoryId) => {
    try {
      setBuildersLoading(true);
      const searchBuildersUseCase = container.getSearchBuildersUseCase();
      const result = await searchBuildersUseCase.execute({
        categoryPublicId: categoryId,
      });

      if (result.success) {
        setBuilders(result.builders);
      } else {
        setBuilders([]);
      }
    } catch (error) {
      console.error('Failed to load builders:', error);
      setBuilders([]);
    } finally {
      setBuildersLoading(false);
    }
  };

  const navigateBack = () => {
    if (categoryPath.length === 0) return;

    const newPath = [...categoryPath];
    newPath.pop(); // Remove last category

    if (newPath.length === 0) {
      // Back to root
      loadRootCategories();
      setCategoryPath([]);
      setSelectedCategory(null);
      setBuilders([]);
    } else {
      // Load parent's children
      const parent = newPath[newPath.length - 1];
      const categoryRepository = container.getCategoryRepository();
      categoryRepository.getChildren(parent.id).then((children) => {
        setCategories(children);
        setCategoryPath(newPath);
        setSelectedCategory(null);
        setBuilders([]);
      });
    }
  };

  const handleBuilderClick = (builder) => {
    setSelectedBuilder(builder);
  };

  const closeBuilderDialog = () => {
    setSelectedBuilder(null);
  };

  const handleImageLoad = (categoryId) => {
    setImageLoadingStates((prev) => ({ ...prev, [categoryId]: false }));
  };

  const handleImageError = (categoryId) => {
    setImageLoadingStates((prev) => ({ ...prev, [categoryId]: false }));
    setImageErrorStates((prev) => ({ ...prev, [categoryId]: true }));
  };

  return (
    <div className="services-page">
      <div className="container">
        <div className="services-header">
          <h1>{t('services.title')}</h1>
        </div>

        {/* Breadcrumb Navigation */}
        {categoryPath.length > 0 && (
          <div className="breadcrumb">
            <button onClick={loadRootCategories} className="breadcrumb-item">
              {t('services.categories')}
            </button>
            {categoryPath.map((cat) => (
              <span key={cat.id}>
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-item current">{cat.name}</span>
              </span>
            ))}
            {categoryPath.length > 0 && (
              <button onClick={navigateBack} className="back-button">
                ← {t('common.back')}
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="loading">{t('services.loading')}</div>
        ) : (
          <>
            {/* Category Grid */}
            {!selectedCategory && categories.length > 0 && (
              <div className="categories-section">
                <div className="categories-grid">
                  {categories.map((category) => (
                    <div key={category.id} className="category-card-wrapper">
                      <div
                        className="category-card"
                        onClick={() => loadCategoryChildren(category)}
                      >
                        <div className="category-image-container">
                          {imageLoadingStates[category.id] !== false && !imageErrorStates[category.id] && (
                            <div className="image-shimmer"></div>
                          )}
                          {imageErrorStates[category.id] ? (
                            <div className="image-placeholder" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}></div>
                          ) : (
                            <img
                              src={category.imageUrl || 'https://via.placeholder.com/400x200/667eea'}
                              alt={category.name}
                              className="category-image"
                              loading="lazy"
                              onLoad={() => handleImageLoad(category.id)}
                              onError={() => handleImageError(category.id)}
                              style={{ display: imageLoadingStates[category.id] === false ? 'block' : 'none' }}
                            />
                          )}
                          <div className="category-overlay"></div>
                          <div className="category-content">
                            <h3 className="category-title">{category.name}</h3>
                            <div className="category-arrow">→</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Builders List */}
            {selectedCategory && (
              <div className="builders-section">
                <h2 className="section-title">
                  {t('services.builders')} - {selectedCategory.name}
                </h2>

                {buildersLoading ? (
                  <div className="loading">{t('services.loading')}</div>
                ) : builders.length > 0 ? (
                  <div className="builders-grid">
                    {builders.map((builder) => (
                      <BuilderCard
                        key={builder.id}
                        builder={builder}
                        onClick={() => handleBuilderClick(builder)}
                      />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <div className="no-data">
                      <p>{t('services.noBuilders')}</p>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* No Categories State */}
            {!selectedCategory && categories.length === 0 && !loading && (
              <Card>
                <div className="no-data">
                  <p>{t('services.selectCategory')}</p>
                </div>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Builder Detail Dialog */}
      {selectedBuilder && (
        <BuilderDetailDialog builder={selectedBuilder} onClose={closeBuilderDialog} />
      )}
    </div>
  );
};

export default Services;
