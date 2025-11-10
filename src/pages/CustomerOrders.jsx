import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { container } from '../infrastructure/di/ServiceContainer';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import './CustomerOrders.css';

const CustomerOrders = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [estates, setEstates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [offers, setOffers] = useState([]);
  const [formData, setFormData] = useState({
    categoryId: '',
    estateId: '',
    title: '',
    description: '',
    budgetMin: '',
    budgetMax: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      const categoryRepo = container.getCategoryRepository();
      const estateUseCase = container.getManageEstatesUseCase();
      const getCustomerOrdersUseCase = container.getCustomerOrdersUseCase();

      const ordersResult = await getCustomerOrdersUseCase.execute({
        page: 0,
        size: 10,
        sort: 'createAt,desc',
      });

      const [categoriesData, estatesResult] = await Promise.all([
        categoryRepo.getAll(),
        estateUseCase.getAll(),
      ]);

      setCategories(categoriesData || []);
      setEstates(estatesResult.estates || []);
      setOrders(ordersResult.orders || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrderClick = () => {
    if (estates.length === 0) {
      if (window.confirm(t('orders.needPropertyFirst'))) {
        navigate('/estates');
      }
      return;
    }
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.estateId) newErrors.estateId = 'Property is required';
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.budgetMin) newErrors.budgetMin = 'Minimum budget is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const orderData = {
        title: formData.title,
        description: formData.description,
        budgetMin: parseInt(formData.budgetMin),
        budgetMax: formData.budgetMax ? parseInt(formData.budgetMax) : 0,
      };

      let result;
      if (editingOrder) {
        const updateOrderUseCase = container.getUpdateOrderUseCase();
        result = await updateOrderUseCase.execute(editingOrder.id, orderData);
      } else {
        const createOrderUseCase = container.getCreateOrderUseCase();
        result = await createOrderUseCase.execute(
          orderData,
          formData.categoryId,
          formData.estateId
        );
      }

      if (result.success) {
        fetchInitialData();
        resetForm();
      } else {
        setErrors(result.errors || { submit: 'Operation failed' });
      }
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Operation failed' });
    }
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setFormData({
      categoryId: order.category?.id || '',
      estateId: order.realEstate?.id || '',
      title: order.title || '',
      description: order.description || '',
      budgetMin: order.budgetMin?.toString() || '',
      budgetMax: order.budgetMax?.toString() || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm(t('orders.deleteConfirm'))) return;

    try {
      const deleteOrderUseCase = container.getDeleteOrderUseCase();
      const result = await deleteOrderUseCase.execute(orderId);

      if (result.success) {
        fetchInitialData();
      } else {
        alert(result.error || t('orders.deleteFailed'));
      }
    } catch (error) {
      alert(t('orders.deleteFailed'));
    }
  };

  const handleViewOffers = async (order) => {
    try {
      setSelectedOrder(order);
      const getOrderOffersUseCase = container.getOrderOffersUseCase();
      const result = await getOrderOffersUseCase.execute(order.id);
      setOffers(result.offers || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
      setOffers([]);
    }
  };

  const resetForm = () => {
    setFormData({
      categoryId: '',
      estateId: '',
      title: '',
      description: '',
      budgetMin: '',
      budgetMax: '',
    });
    setEditingOrder(null);
    setShowForm(false);
    setErrors({});
  };

  if (loading && !showForm) {
    return (
      <div className="customer-orders-page">
        <div className="container">
          <p>{t('orders.loadingOrders')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-orders-page">
      <div className="container">
        <div className="orders-header">
          <h1>{t('orders.myOrders')}</h1>
          {!showForm && (
            <Button onClick={handleCreateOrderClick}>{t('orders.createOrder')}</Button>
          )}
        </div>

        {/* Create/Edit Order Form */}
        {showForm && (
          <Card className="order-form-card">
            <h2>{editingOrder ? t('orders.editOrder') : t('orders.createNewOrder')}</h2>
            <form onSubmit={handleSubmit} className="order-form">
              <div className="input-wrapper">
                <label className="input-label">
                  {t('orders.category')} <span className="input-required">*</span>
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className={`input ${errors.categoryId ? 'input-error' : ''}`}
                >
                  <option value="">{t('orders.selectCategory')}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <span className="input-error-message">{errors.categoryId}</span>
                )}
              </div>

              <div className="input-wrapper">
                <label className="input-label">
                  {t('orders.property')} <span className="input-required">*</span>
                </label>
                <select
                  name="estateId"
                  value={formData.estateId}
                  onChange={handleChange}
                  className={`input ${errors.estateId ? 'input-error' : ''}`}
                >
                  <option value="">{t('orders.selectProperty')}</option>
                  {estates.map((estate) => (
                    <option key={estate.id} value={estate.id}>
                      {estate.kind} - {estate.addressLine}, {estate.city}
                    </option>
                  ))}
                </select>
                {errors.estateId && (
                  <span className="input-error-message">{errors.estateId}</span>
                )}
              </div>

              <Input
                label={t('orders.orderTitle')}
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={t('orders.titlePlaceholder')}
                error={errors.title}
                required
              />

              <div className="input-wrapper">
                <label className="input-label">
                  {t('orders.description')} <span className="input-required">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder={t('orders.descriptionPlaceholder')}
                  className={`input ${errors.description ? 'input-error' : ''}`}
                  rows="4"
                />
                {errors.description && (
                  <span className="input-error-message">{errors.description}</span>
                )}
              </div>

              <div className="form-row">
                <Input
                  label={t('orders.minBudget')}
                  name="budgetMin"
                  type="number"
                  value={formData.budgetMin}
                  onChange={handleChange}
                  placeholder="1000"
                  error={errors.budgetMin}
                  required
                />
                <Input
                  label={t('orders.maxBudget')}
                  name="budgetMax"
                  type="number"
                  value={formData.budgetMax}
                  onChange={handleChange}
                  placeholder="5000"
                />
              </div>

              {errors.submit && (
                <div className="error-message">{errors.submit}</div>
              )}

              <div className="form-actions">
                <Button type="submit" variant="primary">
                  {editingOrder ? t('orders.updateOrder') : t('orders.createOrder')}
                </Button>
                <Button type="button" variant="ghost" onClick={resetForm}>
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Orders List */}
        <div className="orders-grid">
          {orders.length === 0 ? (
            <Card>
              <p className="empty-message">
                {showForm
                  ? t('orders.noOrdersForm')
                  : t('orders.noOrdersCustomer')}
              </p>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id} className="order-card">
                <div className="order-header">
                  <h3>{order.title}</h3>
                  <span className="order-budget">
                    {order.budgetMin}
                    {order.budgetMax ? `-${order.budgetMax}` : '+'} ₸
                  </span>
                </div>
                <p className="order-description">{order.description}</p>
                <div className="order-details">
                  <p>
                    <strong>{t('orders.category')}:</strong> {order.category?.name || 'N/A'}
                  </p>
                  {order.realEstate && (
                    <>
                      <p>
                        <strong>{t('orders.location')}:</strong> {order.realEstate.city},{' '}
                        {order.realEstate.district}
                      </p>
                      <p>
                        <strong>{t('orders.property')}:</strong> {order.realEstate.kind} -{' '}
                        {order.realEstate.areaM2} m²
                      </p>
                    </>
                  )}
                </div>
                <div className="order-actions">
                  <Button
                    size="small"
                    variant="outline"
                    onClick={() => handleEdit(order)}
                  >
                    {t('common.edit')}
                  </Button>
                  <Button
                    size="small"
                    variant="ghost"
                    onClick={() => handleViewOffers(order)}
                  >
                    {t('common.viewOffers')}
                  </Button>
                  <Button
                    size="small"
                    variant="error"
                    onClick={() => handleDelete(order.id)}
                  >
                    {t('common.delete')}
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Offers Modal */}
        {selectedOrder && (
          <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
            <Card
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <h2>{t('orders.offers')}: {selectedOrder.title}</h2>
              <p className="modal-order-description">{selectedOrder.description}</p>
              <div className="order-modal-details">
                <p><strong>{t('orders.budget')}:</strong> {selectedOrder.budgetMin}{selectedOrder.budgetMax ? `-${selectedOrder.budgetMax}` : '+'} ₸</p>
                {selectedOrder.category && (
                  <p><strong>{t('orders.category')}:</strong> {selectedOrder.category.name}</p>
                )}
              </div>
              <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>{t('orders.submittedOffers')}</h3>
              <div className="offers-list">
                {offers.length === 0 ? (
                  <p className="empty-message">{t('orders.noOffers')}</p>
                ) : (
                  offers.map((offer) => (
                    <div key={offer.id} className="offer-item">
                      <div className="offer-header">
                        <strong>{offer.price} ₸</strong>
                        <span>{offer.daysEstimate} {t('orders.days')}</span>
                      </div>
                      <p>{offer.message}</p>
                      <p className="offer-unit">{t('orders.unit')}: {offer.unit}</p>
                    </div>
                  ))
                )}
              </div>
              <Button onClick={() => setSelectedOrder(null)}>{t('common.close')}</Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrders;
