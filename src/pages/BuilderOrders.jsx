import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { container } from '../infrastructure/di/ServiceContainer';
import offerService from '../services/offerService';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import Select from '../components/Select';
import CascadingCategorySelect from '../components/CascadingCategorySelect';
import './BuilderOrders.css';

const BuilderOrders = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOfferForm, setShowOfferForm] = useState(false);

  // Helper function to translate unit labels
  // Helper function to translate unit types from English API response to current locale
  const getUnitLabel = (unit) => {
    if (!unit) return '';
    
    const unitTranslationMap = {
      // Area-based units (API returns these)
      'm2': t('offers.perM2'),
      'areaM2': t('offers.perM2'),
      'aream2': t('offers.perM2'),
      'sqm': t('offers.perM2'),
      'meter2': t('offers.perM2'),
      'square_meter': t('offers.perM2'),
      'square meter': t('offers.perM2'),
      'permetersquare': t('orders.units.perMeterSquare'),
      'permeter²': t('orders.units.perMeterSquare'),
      'perMeterSquare': t('orders.units.perMeterSquare'),
      
      // Time-based units
      'hour': t('offers.perHour'),
      'hr': t('offers.perHour'),
      'hours': t('offers.perHour'),
      'day': t('offers.perDay'),
      'daily': t('offers.perDay'),
      'days': t('offers.perDay'),
      
      // Quantity-based units
      'unit': t('offers.perUnit'),
      'piece': t('offers.perItem'),
      'pieces': t('offers.perItem'),
      'pcs': t('offers.perItem'),
      'item': t('offers.perItem'),
      'items': t('offers.perItem'),
      'each': t('offers.perItem'),
      'peritem': t('orders.units.perItem'),
      'perItem': t('orders.units.perItem'),
      
      // Fixed price
      'fixed': t('offers.fixedPrice'),
      'total': t('orders.units.total'),
      'lump_sum': t('offers.fixedPrice'),
      'flat_rate': t('offers.fixedPrice'),
    };
    
    // Check both original case and lowercase
    return unitTranslationMap[unit] || unitTranslationMap[unit.toLowerCase()] || unit;
  };
  const [offerFormData, setOfferFormData] = useState({
    price: '',
    unit: 'm2',
    daysEstimate: '',
    message: '',
  });
  const [searchFilters, setSearchFilters] = useState({
    q: '',
    city: '',
    categoryPublicId: '',
  });
  const [errors, setErrors] = useState({});
  const [ordersWithOffers, setOrdersWithOffers] = useState(new Set());

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      const getCategoryTreeUseCase = container.getGetCategoryTreeUseCase();
      const getCitiesUseCase = container.getGetCitiesUseCase();
      const searchOrdersUseCase = container.getSearchOrdersUseCase();

      const [categoryTreeResult, citiesResult, ordersResult] = await Promise.all([
        getCategoryTreeUseCase.execute(false),
        getCitiesUseCase.execute(false),
        searchOrdersUseCase.execute(),
      ]);

      // Fetch builder's offers to check which orders already have offers
      const builderOffers = await offerService.getBuilderOffers({ size: 100 });
      const offerOrderIds = new Set(
        (builderOffers?.content || []).map(item => item.order?.uuid || item.order?.publicId || item.order?.id)
      );

      setCategories(categoryTreeResult.success ? categoryTreeResult.categories : []);
      setCities(citiesResult.success ? citiesResult.cities : []);
      setOrders(ordersResult.orders || []);
      setOrdersWithOffers(offerOrderIds);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (categoryId) => {
    setSearchFilters((prev) => ({ ...prev, categoryPublicId: categoryId }));
  };

  const handleSearch = async () => {
    try {
      setLoading(true);

      const searchOrdersUseCase = container.getSearchOrdersUseCase();
      const result = await searchOrdersUseCase.execute(searchFilters);

      setOrders(result.orders || []);
    } catch (error) {
      console.error('Error searching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeOffer = (order) => {
    setSelectedOrder(order);
    setShowOfferForm(true);
    setOfferFormData({
      price: '',
      unit: 'm2',
      daysEstimate: '',
      message: '',
    });
  };

  const handleOfferChange = (e) => {
    const { name, value } = e.target;
    setOfferFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmitOffer = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!offerFormData.price || offerFormData.price <= 0) {
      newErrors.price = t('orders.priceRequired');
    }
    if (!offerFormData.daysEstimate || offerFormData.daysEstimate <= 0) {
      newErrors.daysEstimate = t('orders.daysRequired');
    }
    if (!offerFormData.message || offerFormData.message.trim().length === 0) {
      newErrors.message = t('orders.messageRequired');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const createOfferUseCase = container.getCreateOfferUseCase();
      const result = await createOfferUseCase.execute(
        {
          price: parseInt(offerFormData.price),
          unit: offerFormData.unit,
          daysEstimate: parseInt(offerFormData.daysEstimate),
          message: offerFormData.message,
        },
        selectedOrder.id
      );

      if (result.success) {
        alert(t('orders.offerSubmitted'));
        // Add this order to the set of orders with offers
        setOrdersWithOffers(prev => new Set([...prev, selectedOrder.id]));
        setSelectedOrder(null);
        setShowOfferForm(false);
        setOfferFormData({
          price: '',
          unit: 'm2',
          daysEstimate: '',
          message: '',
        });
      } else {
        setErrors(result.errors || { submit: t('errors.submitFailed') });
      }
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || t('errors.submitFailed') });
    }
  };

  if (loading) {
    return (
      <div className="builder-orders-page">
        <div className="container">
          <p>{t('orders.loadingOrders')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="builder-orders-page">
      <div className="container">
        <div className="orders-header">
          <h1>{t('orders.availableOrders')}</h1>
        </div>

        {/* Search Filters */}
        <Card className="search-card">
          <h3>{t('orders.searchOrders')}</h3>
          <div className="search-form">
            <Input
              label={t('common.search')}
              name="q"
              value={searchFilters.q}
              onChange={handleSearchChange}
              placeholder={t('orders.searchPlaceholder')}
            />
            <Select
              label={t('estates.city')}
              name="city"
              value={searchFilters.city}
              onChange={handleSearchChange}
              options={cities.map((city) => ({
                value: city.getLocalizedName(language),
                label: city.getLocalizedName(language),
              }))}
              placeholder={t('orders.filterByCity') || t('estates.cityPlaceholder')}
            />
            <CascadingCategorySelect
              label={t('orders.category')}
              categories={categories}
              value={searchFilters.categoryPublicId}
              onChange={handleCategoryChange}
              placeholder={t('orders.allCategories')}
            />
            <Button onClick={handleSearch}>{t('common.search')}</Button>
          </div>
        </Card>

        {/* Orders List */}
        <div className="orders-grid">
          {orders.length === 0 ? (
            <Card>
              <p className="empty-message">
                {t('orders.noOrders')}
              </p>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id} className="order-card">
                <div className="order-header">
                  <span className="order-category-badge">{order.category?.name || 'N/A'}</span>
                  <span className={`order-price-badge ${order.priceType === 'FIXED' ? 'fixed' : 'negotiable'}`}>
                    {order.priceType === 'FIXED' && order.price
                      ? `${order.price} ₸${order.unit ? `/${getUnitLabel(order.unit)}` : ''}`
                      : t('orders.negotiable')}
                  </span>
                </div>
                <p className="order-description">{order.description}</p>
                <div className="order-details">
                  {order.realEstate && (
                    <>
                      <div className="order-detail-item">
                        <span className="detail-icon">📍</span>
                        <span><strong>{t('orders.location')}:</strong> {order.realEstate.city}, {order.realEstate.district}</span>
                      </div>
                      <div className="order-detail-item">
                        <span className="detail-icon">🏠</span>
                        <span><strong>{t('orders.property')}:</strong> {order.realEstate.kind} - {order.realEstate.areaM2} m²</span>
                      </div>
                    </>
                  )}
                  {order.createdAt && (
                    <div className="order-detail-item">
                      <span className="detail-icon">📅</span>
                      <span><strong>{t('common.createdAt')}:</strong> {new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  {order.offersCount > 0 && (
                    <div className="order-detail-item">
                      <span className="detail-icon">💼</span>
                      <span><strong>{t('orders.offers')}:</strong> {order.offersCount}</span>
                    </div>
                  )}
                </div>
                <div className="order-actions">
                  {ordersWithOffers.has(order.id) ? (
                    <span className="already-responded-label">{t('common.alreadyResponded')}</span>
                  ) : (
                    <Button
                      size="small"
                      variant="primary"
                      onClick={() => handleMakeOffer(order)}
                    >
                      {t('common.makeOffer')}
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Make Offer Modal */}
        {selectedOrder && showOfferForm && (
          <div className="modal-overlay" onClick={() => { setSelectedOrder(null); setShowOfferForm(false); }}>
            <Card
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <h2>{t('orders.makeOfferTitle')}</h2>
              <p className="modal-order-description">{selectedOrder.description}</p>
              <div className="order-modal-details">
                <div className="modal-detail-badges">
                  {selectedOrder.category && (
                    <span className="order-category-badge">{selectedOrder.category.name}</span>
                  )}
                  <span className={`order-price-badge ${selectedOrder.priceType === 'FIXED' ? 'fixed' : 'negotiable'}`}>
                    {selectedOrder.priceType === 'FIXED' && selectedOrder.price
                      ? `${selectedOrder.price} ₸${selectedOrder.unit ? `/${getUnitLabel(selectedOrder.unit)}` : ''}`
                      : t('orders.negotiable')}
                  </span>
                </div>
                {selectedOrder.realEstate && (
                  <>
                    <p><strong>{t('orders.location')}:</strong> {selectedOrder.realEstate.city}, {selectedOrder.realEstate.district}</p>
                    <p><strong>{t('orders.property')}:</strong> {selectedOrder.realEstate.kind} - {selectedOrder.realEstate.areaM2} m²</p>
                  </>
                )}
              </div>

              <form onSubmit={handleSubmitOffer} className="offer-form">
                <div className="form-row">
                  <Input
                    label={t('orders.yourPrice')}
                    name="price"
                    type="number"
                    value={offerFormData.price}
                    onChange={handleOfferChange}
                    placeholder={t('orders.yourPrice')}
                    error={errors.price}
                    required
                  />
                  <div className="input-wrapper">
                    <label className="input-label">
                      {t('orders.priceUnit')} <span className="input-required">*</span>
                    </label>
                    <select
                      name="unit"
                      value={offerFormData.unit}
                      onChange={handleOfferChange}
                      className="input"
                    >
                      <option value="m2">{t('offers.perM2')}</option>
                      <option value="unit">{t('offers.perUnit')}</option>
                      <option value="hour">{t('offers.perHour')}</option>
                      <option value="day">{t('offers.perDay')}</option>
                      <option value="fixed">{t('offers.fixedPrice')}</option>
                    </select>
                  </div>
                </div>

                <Input
                  label={t('orders.estimatedDays')}
                  name="daysEstimate"
                  type="number"
                  value={offerFormData.daysEstimate}
                  onChange={handleOfferChange}
                  placeholder={t('orders.daysPlaceholder')}
                  error={errors.daysEstimate}
                  required
                />

                <div className="input-wrapper">
                  <label className="input-label">
                    {t('orders.yourMessage')} <span className="input-required">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={offerFormData.message}
                    onChange={handleOfferChange}
                    placeholder={t('orders.offerMessagePlaceholder')}
                    className={`input ${errors.message ? 'input-error' : ''}`}
                    rows="5"
                  />
                  {errors.message && (
                    <span className="input-error-message">{errors.message}</span>
                  )}
                </div>

                {errors.submit && (
                  <div className="error-message">{errors.submit}</div>
                )}

                <div className="form-actions">
                  <Button type="submit" variant="primary">
                    {t('orders.submitOffer')}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => { setSelectedOrder(null); setShowOfferForm(false); }}
                  >
                    {t('common.cancel')}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuilderOrders;
