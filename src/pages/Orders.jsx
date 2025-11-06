import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import categoryService from '../services/categoryService';
import estateService from '../services/estateService';
import offerService from '../services/offerService';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import './Orders.css';

const Orders = () => {
  const { user } = useAuth();
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
  const [searchFilters, setSearchFilters] = useState({
    q: '',
    city: '',
    categoryPublicId: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [categoriesData, estatesData, ordersData] = await Promise.all([
        categoryService.getAllCategories(),
        estateService.getCustomerEstates(),
        orderService.searchOrders(),
      ]);

      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setEstates(Array.isArray(estatesData) ? estatesData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : ordersData?.content || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const data = await orderService.searchOrders(searchFilters);
      setOrders(Array.isArray(data) ? data : data?.content || []);
    } catch (error) {
      console.error('Error searching orders:', error);
    } finally {
      setLoading(false);
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
        category: { publicId: formData.categoryId },
        realEstate: { publicId: formData.estateId },
        order: {
          title: formData.title,
          description: formData.description,
          budjetMin: parseInt(formData.budgetMin),
          budjetMax: formData.budgetMax ? parseInt(formData.budgetMax) : 0,
        },
      };

      if (editingOrder) {
        await orderService.updateOrder({
          uuid: editingOrder.uuid,
          ...orderData.order,
          budgetMin: parseInt(formData.budgetMin),
          budgetMax: formData.budgetMax ? parseInt(formData.budgetMax) : 0,
        });
      } else {
        await orderService.createOrder(orderData);
      }

      fetchInitialData();
      resetForm();
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Operation failed' });
    }
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setFormData({
      categoryId: order.category?.publicId || '',
      estateId: order.realEstate?.publicId || '',
      title: order.title || '',
      description: order.description || '',
      budgetMin: order.budgetMin?.toString() || '',
      budgetMax: order.budgetMax?.toString() || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    try {
      await orderService.deleteOrder(orderId);
      fetchInitialData();
    } catch (error) {
      alert('Failed to delete order');
    }
  };

  const handleViewOffers = async (order) => {
    try {
      setSelectedOrder(order);
      const offersData = await offerService.searchByOrder(order.uuid);
      setOffers(Array.isArray(offersData) ? offersData : offersData?.content || []);
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
      <div className="orders-page">
        <div className="container">
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="container">
        <div className="orders-header">
          <h1>Service Orders</h1>
          {user?.role === 'CUSTOMER' && !showForm && (
            <Button onClick={() => setShowForm(true)}>Create Order</Button>
          )}
        </div>

        {/* Search Filters */}
        <Card className="search-card">
          <h3>Search Orders</h3>
          <div className="search-form">
            <Input
              label="Search"
              name="q"
              value={searchFilters.q}
              onChange={handleSearchChange}
              placeholder="Search by title or description"
            />
            <Input
              label="City"
              name="city"
              value={searchFilters.city}
              onChange={handleSearchChange}
              placeholder="Filter by city"
            />
            <div className="input-wrapper">
              <label className="input-label">Category</label>
              <select
                name="categoryPublicId"
                value={searchFilters.categoryPublicId}
                onChange={handleSearchChange}
                className="input"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.publicId} value={cat.publicId}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </Card>

        {/* Create/Edit Order Form */}
        {showForm && user?.role === 'CUSTOMER' && (
          <Card className="order-form-card">
            <h2>{editingOrder ? 'Edit Order' : 'Create New Order'}</h2>
            <form onSubmit={handleSubmit} className="order-form">
              <div className="input-wrapper">
                <label className="input-label">
                  Category <span className="input-required">*</span>
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className={`input ${errors.categoryId ? 'input-error' : ''}`}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.publicId} value={cat.publicId}>
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
                  Property <span className="input-required">*</span>
                </label>
                <select
                  name="estateId"
                  value={formData.estateId}
                  onChange={handleChange}
                  className={`input ${errors.estateId ? 'input-error' : ''}`}
                >
                  <option value="">Select a property</option>
                  {estates.map((estate) => (
                    <option key={estate.publicId} value={estate.publicId}>
                      {estate.kind} - {estate.addressLine}, {estate.city}
                    </option>
                  ))}
                </select>
                {errors.estateId && (
                  <span className="input-error-message">{errors.estateId}</span>
                )}
              </div>

              <Input
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Install ceiling"
                error={errors.title}
                required
              />

              <div className="input-wrapper">
                <label className="input-label">
                  Description <span className="input-required">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the work needed"
                  className={`input ${errors.description ? 'input-error' : ''}`}
                  rows="4"
                />
                {errors.description && (
                  <span className="input-error-message">{errors.description}</span>
                )}
              </div>

              <div className="form-row">
                <Input
                  label="Minimum Budget"
                  name="budgetMin"
                  type="number"
                  value={formData.budgetMin}
                  onChange={handleChange}
                  placeholder="1000"
                  error={errors.budgetMin}
                  required
                />
                <Input
                  label="Maximum Budget (optional)"
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
                  {editingOrder ? 'Update Order' : 'Create Order'}
                </Button>
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Cancel
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
                No orders found. Try adjusting your search filters.
              </p>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.uuid} className="order-card">
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
                    <strong>Category:</strong> {order.category?.name || 'N/A'}
                  </p>
                  {order.realEstate && (
                    <>
                      <p>
                        <strong>Location:</strong> {order.realEstate.city},{' '}
                        {order.realEstate.district}
                      </p>
                      <p>
                        <strong>Property:</strong> {order.realEstate.kind} -{' '}
                        {order.realEstate.areaM2} m²
                      </p>
                    </>
                  )}
                </div>
                <div className="order-actions">
                  {user?.role === 'CUSTOMER' && (
                    <>
                      <Button
                        size="small"
                        variant="outline"
                        onClick={() => handleEdit(order)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="ghost"
                        onClick={() => handleViewOffers(order)}
                      >
                        View Offers
                      </Button>
                      <Button
                        size="small"
                        variant="error"
                        onClick={() => handleDelete(order.uuid)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                  {user?.role === 'SERVICE_PROVIDER' && (
                    <Button
                      size="small"
                      variant="primary"
                      onClick={() => handleViewOffers(order)}
                    >
                      Make Offer
                    </Button>
                  )}
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
              <h2>Offers for: {selectedOrder.title}</h2>
              <div className="offers-list">
                {offers.length === 0 ? (
                  <p className="empty-message">No offers yet.</p>
                ) : (
                  offers.map((offer) => (
                    <div key={offer.publicId} className="offer-item">
                      <div className="offer-header">
                        <strong>{offer.price} ₸</strong>
                        <span>{offer.daysEstimate} days</span>
                      </div>
                      <p>{offer.message}</p>
                      <p className="offer-unit">Unit: {offer.unit}</p>
                    </div>
                  ))
                )}
              </div>
              <Button onClick={() => setSelectedOrder(null)}>Close</Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
