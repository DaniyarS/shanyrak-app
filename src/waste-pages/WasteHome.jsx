import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { container } from '../infrastructure/di/ServiceContainer';
import Button from '../components/Button';
import Card from '../components/Card';
import WasteCreate from './WasteCreate';
import './WasteHome.css';

function WasteHome() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [waste, setWaste] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [onlyFree, setOnlyFree] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadCategories();
    searchWaste();
  }, []);

  const loadCategories = async () => {
    try {
      const useCase = container.getGetWasteCategoryTreeUseCase();
      const result = await useCase.execute();
      if (result.success) {
        setCategories(flattenCategories(result.tree));
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

  const searchWaste = async () => {
    setLoading(true);
    try {
      const useCase = container.getSearchWasteUseCase();
      const filters = {
        q: searchQuery,
        city: selectedCity,
        onlyFree,
        categoryPublicId: selectedCategory,
        sort: 'createdAt,desc'
      };

      const result = await useCase.execute(filters);
      if (result.success) {
        setWaste(result.content);
        setShowAll(false); // Reset to show only 10 after new search
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchWaste();
  }, [selectedCity, onlyFree, selectedCategory]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showCreateModal) {
        setShowCreateModal(false);
      }
    };

    if (showCreateModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showCreateModal]);

  const handleCreateClick = () => {
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    searchWaste();
  };

  return (
    <div className="waste-home-page">
      {/* Hero Section */}
      <section className="waste-hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">{t.waste.title}</h1>
            <p className="hero-subtitle">{t.waste.subtitle}</p>
            <div className="hero-actions">
              <Button variant="primary" size="large" onClick={handleCreateClick}>
                + {t.waste.createAd}
              </Button>
              {isAuthenticated && (
                <Link to="/my-ads">
                  <Button variant="outline" size="large">
                    {t.waste.myAds}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section">
        <div className="container">
          <Card className="search-card">
            <div className="search-form">
              <input
                type="text"
                placeholder={t.waste.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchWaste()}
                className="search-input"
              />
              <Button onClick={searchWaste} variant="primary">
                {t.waste.search}
              </Button>
            </div>

            <div className="filters-row">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="filter-select"
              >
                <option value="">{t.waste.allCities || 'Все города'}</option>
                <option value="Алматы">Алматы</option>
                <option value="Астана">Астана</option>
                <option value="Шымкент">Шымкент</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                <option value="">{t.waste.allCategories}</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.getLocalizedName(language)}
                  </option>
                ))}
              </select>

              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={onlyFree}
                  onChange={(e) => setOnlyFree(e.target.checked)}
                />
                <span>{t.waste.freeOnly}</span>
              </label>
            </div>
          </Card>
        </div>
      </section>

      {/* Waste Listings */}
      <section className="listings-section">
        <div className="container">
          {loading ? (
            <div className="loading-state">
              <p>{t.common.loading}</p>
            </div>
          ) : waste.length === 0 ? (
            <Card className="empty-state">
              <div className="empty-state-content">
                <div className="empty-state-icon">🔍</div>
                <h3>{t.waste.noResults}</h3>
                <p>{t.waste.noResultsDescription}</p>
                <Button variant="primary" onClick={handleCreateClick}>
                  {t.waste.createAd}
                </Button>
              </div>
            </Card>
          ) : (
            <>
              <div className="waste-grid">
                {(showAll ? waste : waste.slice(0, 10)).map(item => (
                  <Card
                    key={item.id}
                    className="waste-card"
                    onClick={() => navigate(`/waste/${item.id}`)}
                  >
                    {item.photos && item.photos.length > 0 && (
                      <div className="waste-image-container">
                        <img src={item.photos[0]} alt={item.title} className="waste-image" />
                      </div>
                    )}
                    <div className="waste-content">
                      <div className="waste-header">
                        <h3 className="waste-title">{item.title}</h3>
                        <span className={`waste-price-badge ${item.isFree() ? 'free' : 'paid'}`}>
                          {item.isFree() ? t.waste.free : `${item.price} ₸`}
                        </span>
                      </div>
                      <p className="waste-description">{item.description}</p>
                      <div className="waste-meta">
                        <span className="waste-meta-item">
                          📦 {item.amount} {t.waste.units[item.unit] || item.unit}
                        </span>
                        <span className="waste-meta-item">
                          📍 {item.city}
                        </span>
                        {item.category && (
                          <span className="waste-category-tag">
                            {item.category.icon} {item.category.getLocalizedName(language)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {!showAll && waste.length > 10 && (
                <div className="show-more-container">
                  <Button variant="outline" size="large" onClick={() => setShowAll(true)}>
                    {t.waste.showAll || 'Show More'} ({waste.length - 10} {t.waste.more || 'more'})
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <WasteCreate onClose={handleCloseModal} onSuccess={handleCreateSuccess} />
          </div>
        </div>
      )}
    </div>
  );
}

export default WasteHome;
