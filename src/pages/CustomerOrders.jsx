import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { container } from '../infrastructure/di/ServiceContainer';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import Select from '../components/Select';
import OrderPhotoGallery from '../components/OrderPhotoGallery';
import ConfirmDealModal from '../components/ConfirmDealModal';
import { OrderStatus } from '../domain/entities/Order';
import { OfferStatus } from '../domain/entities/Offer';
import './CustomerOrders.css';

const CustomerOrders = () => {
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
  const [openMenuId, setOpenMenuId] = useState(null);
  const [offerCounts, setOfferCounts] = useState({});
  const [loadingOfferCounts, setLoadingOfferCounts] = useState({});
  const [formData, setFormData] = useState({
    categoryId: '',
    estateId: '',
    title: '',
    description: '',
    budgetMin: '',
    budgetMax: '',
  });
  const [errors, setErrors] = useState({});
  const [pendingPhotos, setPendingPhotos] = useState([]); // Photos to upload after order creation
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [showEstateForm, setShowEstateForm] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [estateFormData, setEstateFormData] = useState({
    kind: '',
    addressLine: '',
    city: '',
    district: '',
    areaM2: '',
    floor: '',
  });
  const [requestingPhone, setRequestingPhone] = useState(false);
  const [builderContacts, setBuilderContacts] = useState({}); // Store requested builder contacts
  const [confirmingDealOffer, setConfirmingDealOffer] = useState(null); // Offer being confirmed/rejected

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Automatically select property if there's only one
  useEffect(() => {
    if (estates.length === 1 && showForm && !editingOrder && !formData.estateId) {
      setFormData((prev) => ({ ...prev, estateId: estates[0].id }));
    }
  }, [estates, showForm, editingOrder, formData.estateId]);

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

      // Fetch offer counts for each order separately
      if (ordersResult.orders && ordersResult.orders.length > 0) {
        fetchOfferCounts(ordersResult.orders);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfferCounts = async (ordersList) => {
    const offerRepo = container.getOfferRepository();

    // Set all orders as loading
    const loadingState = {};
    ordersList.forEach((order) => {
      loadingState[order.id] = true;
    });
    setLoadingOfferCounts(loadingState);

    // Fetch counts for each order
    const countsPromises = ordersList.map(async (order) => {
      try {
        const offers = await offerRepo.getByOrderId(order.id, { page: 0, size: 100 });
        return { orderId: order.id, count: offers.length };
      } catch (error) {
        console.error(`Error fetching offers for order ${order.id}:`, error);
        return { orderId: order.id, count: 0 };
      }
    });

    const countsResults = await Promise.all(countsPromises);

    // Update counts state
    const counts = {};
    const loading = {};
    countsResults.forEach((result) => {
      counts[result.orderId] = result.count;
      loading[result.orderId] = false;
    });

    setOfferCounts(counts);
    setLoadingOfferCounts(loading);
  };

  const handleCreateOrderClick = () => {
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleEstateChange = (e) => {
    const { name, value } = e.target;
    setEstateFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    // Only require estateId if user has existing estates
    if (estates.length > 0 && !formData.estateId) {
      newErrors.estateId = 'Property is required';
    }
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.budgetMin) newErrors.budgetMin = 'Minimum budget is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // If user has no estates and not editing, show estate form with animation
    if (estates.length === 0 && !editingOrder) {
      setIsAnimating(true);
      // Wait for animation to complete before hiding order form
      setTimeout(() => {
        setShowEstateForm(true);
        setIsAnimating(false);
      }, 400); // Match CSS transition duration
      return;
    }

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
        result = await updateOrderUseCase.execute(
          editingOrder.id,
          orderData,
          formData.categoryId,
          formData.estateId
        );
      } else {
        const createOrderUseCase = container.getCreateOrderUseCase();
        result = await createOrderUseCase.execute(
          orderData,
          formData.categoryId,
          formData.estateId
        );

        // Upload photos after order creation
        if (result.success && pendingPhotos.length > 0) {
          setUploadingPhotos(true);
          await uploadOrderPhotos(result.order.id, pendingPhotos);
          setUploadingPhotos(false);
        }
      }

      if (result.success) {
        fetchInitialData();
        resetForm();
      } else {
        setErrors(result.errors || { submit: 'Operation failed' });
      }
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Operation failed' });
      setUploadingPhotos(false);
    }
  };

  const uploadOrderPhotos = async (orderPublicId, photos) => {
    const uploadOrderPhotoUseCase = container.getUploadOrderPhotoUseCase();
    const uploadPromises = photos.map((photo, index) =>
      uploadOrderPhotoUseCase.execute(photo.file, orderPublicId, index)
    );

    try {
      const results = await Promise.all(uploadPromises);
      const failedUploads = results.filter((r) => !r.success);

      if (failedUploads.length > 0) {
        console.error('Some photos failed to upload:', failedUploads);
        setErrors((prev) => ({
          ...prev,
          photos: `${failedUploads.length} photo(s) failed to upload`,
        }));
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      setErrors((prev) => ({
        ...prev,
        photos: 'Failed to upload photos',
      }));
    }
  };

  const handlePhotoAdded = async (file) => {
    // For new orders, store photos locally until order is created
    if (!editingOrder) {
      const photoUrl = URL.createObjectURL(file);
      const newPhoto = {
        id: `temp-${Date.now()}`,
        file,
        url: photoUrl,
      };
      setPendingPhotos((prev) => [...prev, newPhoto]);
      return;
    }

    // For existing orders, upload immediately
    try {
      const uploadOrderPhotoUseCase = container.getUploadOrderPhotoUseCase();
      const result = await uploadOrderPhotoUseCase.execute(
        file,
        editingOrder.id,
        pendingPhotos.length
      );

      if (result.success) {
        setPendingPhotos((prev) => [...prev, result.file]);
      } else {
        throw new Error(result.errors?.upload || 'Upload failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const handlePhotoDeleted = async (photoId) => {
    // For temporary photos (new order), just remove from state
    if (photoId.startsWith('temp-')) {
      setPendingPhotos((prev) => {
        const photo = prev.find((p) => p.id === photoId);
        if (photo?.url) {
          URL.revokeObjectURL(photo.url);
        }
        return prev.filter((p) => p.id !== photoId);
      });
      return;
    }

    // For uploaded photos, delete from server
    try {
      const deleteOrderPhotoUseCase = container.getDeleteOrderPhotoUseCase();
      const result = await deleteOrderPhotoUseCase.execute(photoId);

      if (result.success) {
        setPendingPhotos((prev) => prev.filter((p) => p.id !== photoId));
      } else {
        throw new Error(result.errors?.delete || 'Delete failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleBackToOrderForm = () => {
    setIsAnimating(true);
    setErrors({});
    // Wait for animation to start before switching forms
    setTimeout(() => {
      setShowEstateForm(false);
      setIsAnimating(false);
    }, 400); // Match CSS transition duration
  };

  const handleEstateSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      // Create the estate first
      const estateUseCase = container.getManageEstatesUseCase();
      const estateData = {
        kind: estateFormData.kind,
        addressLine: estateFormData.addressLine,
        city: estateFormData.city,
        district: estateFormData.district,
        areaM2: parseFloat(estateFormData.areaM2),
        floor: estateFormData.floor ? parseInt(estateFormData.floor) : null,
      };

      const estateResult = await estateUseCase.create(estateData);

      if (!estateResult.success) {
        setErrors(estateResult.errors || { submit: 'Failed to create property' });
        return;
      }

      // Now create the order with the new estate
      const orderData = {
        title: formData.title,
        description: formData.description,
        budgetMin: parseInt(formData.budgetMin),
        budgetMax: formData.budgetMax ? parseInt(formData.budgetMax) : 0,
      };

      const createOrderUseCase = container.getCreateOrderUseCase();
      const result = await createOrderUseCase.execute(
        orderData,
        formData.categoryId,
        estateResult.estate.id
      );

      // Upload photos after order creation
      if (result.success && pendingPhotos.length > 0) {
        setUploadingPhotos(true);
        await uploadOrderPhotos(result.order.id, pendingPhotos);
        setUploadingPhotos(false);
      }

      if (result.success) {
        fetchInitialData();
        resetForm();
      } else {
        setErrors(result.errors || { submit: 'Operation failed' });
      }
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Operation failed' });
      setUploadingPhotos(false);
    }
  };

  const handleEdit = async (order) => {
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

    // Fetch existing photos for this order
    try {
      const getOrderPhotosUseCase = container.getGetOrderPhotosUseCase();
      const result = await getOrderPhotosUseCase.execute(order.id);

      console.log('Fetched order photos result:', result);
      console.log('Photos array:', result.photos);

      if (result.success && result.photos && result.photos.length > 0) {
        console.log('Setting pending photos:', result.photos);
        setPendingPhotos(result.photos);
      } else {
        console.log('No photos found or fetch failed');
        setPendingPhotos([]);
      }
    } catch (error) {
      console.error('Error fetching order photos:', error);
      setPendingPhotos([]);
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm(t('orders.deleteConfirm'))) return;

    try {
      // Add deleting class for animation
      const orderCard = document.querySelector(`[data-order-id="${orderId}"]`);
      if (orderCard) {
        orderCard.classList.add('deleting');
      }

      const deleteOrderUseCase = container.getDeleteOrderUseCase();
      const result = await deleteOrderUseCase.execute(orderId);

      if (result.success) {
        // Wait for animation to complete before removing from state
        setTimeout(() => {
          setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId));
        }, 300);
      } else {
        if (orderCard) {
          orderCard.classList.remove('deleting');
        }
        alert(result.error || t('orders.deleteFailed'));
      }
    } catch (error) {
      const orderCard = document.querySelector(`[data-order-id="${orderId}"]`);
      if (orderCard) {
        orderCard.classList.remove('deleting');
      }
      alert(t('orders.deleteFailed'));
    }
  };

  const handleViewOffers = async (order) => {
    try {
      setSelectedOrder(order);
      const getOrderOffersUseCase = container.getOrderOffersUseCase();
      const result = await getOrderOffersUseCase.execute(order.id);
      setOffers(result.offers || []);
      setOpenMenuId(null);
    } catch (error) {
      console.error('Error fetching offers:', error);
      setOffers([]);
    }
  };

  const handleRequestPhone = async (offerId) => {
    if (!selectedOrder || requestingPhone) return;

    setRequestingPhone(true);
    try {
      const requestPhoneUseCase = container.getRequestBuilderPhoneUseCase();
      const result = await requestPhoneUseCase.execute(selectedOrder.id, offerId);

      if (result.success) {
        // Store the builder contact info
        setBuilderContacts(prev => ({
          ...prev,
          [offerId]: result.builderContact
        }));

        // Update order status to IN_PROGRESS
        setSelectedOrder(prev => ({ ...prev, status: OrderStatus.IN_PROGRESS }));

        // Refresh orders list
        fetchInitialData();

        alert(t('orders.phoneRequested'));
      } else {
        alert(result.errors?.submit || 'Failed to request phone');
      }
    } catch (error) {
      console.error('Error requesting phone:', error);
      alert(error.response?.data?.message || 'Failed to request phone');
    } finally {
      setRequestingPhone(false);
    }
  };

  const handleConfirmDealClick = (offer) => {
    setConfirmingDealOffer(offer);
  };

  const handleDealConfirmed = () => {
    setConfirmingDealOffer(null);
    setSelectedOrder(null);
    fetchInitialData(); // Refresh orders list
  };

  const toggleMenu = (orderId) => {
    setOpenMenuId(openMenuId === orderId ? null : orderId);
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
    setEstateFormData({
      kind: '',
      addressLine: '',
      city: '',
      district: '',
      areaM2: '',
      floor: '',
    });
    setEditingOrder(null);
    setShowForm(false);
    setShowEstateForm(false);
    setIsAnimating(false);
    setErrors({});

    // Clean up temporary photo URLs
    pendingPhotos.forEach((photo) => {
      if (photo.url && photo.id.startsWith('temp-')) {
        URL.revokeObjectURL(photo.url);
      }
    });
    setPendingPhotos([]);
    setUploadingPhotos(false);
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
            <div className="form-container">
              {/* Order Form */}
              <div className={`form-slide ${showEstateForm ? 'slide-left-out' : 'slide-left-in'} ${showEstateForm && !isAnimating ? 'hidden' : ''}`}>
                <h2>{editingOrder ? t('orders.editOrder') : t('orders.createNewOrder')}</h2>
                <form onSubmit={handleSubmit} className="order-form">
              <Select
                label={t('orders.category')}
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                options={categories.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                }))}
                placeholder={t('orders.selectCategory')}
                error={errors.categoryId}
                required
              />

              {/* Only show property select if user has estates OR is editing */}
              {(estates.length > 0 || editingOrder) && (
                <Select
                  label={t('orders.property')}
                  name="estateId"
                  value={formData.estateId}
                  onChange={handleChange}
                  options={estates.map((estate) => ({
                    value: estate.id,
                    label: `${estate.kind} - ${estate.addressLine}, ${estate.city}`,
                  }))}
                  placeholder={t('orders.selectProperty')}
                  error={errors.estateId}
                  required
                />
              )}

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

              {/* Order Photos */}
              <div className="form-section">
                <label className="section-label">{t('orders.orderPhotos')} (Optional)</label>
                <OrderPhotoGallery
                  photos={pendingPhotos}
                  onPhotoAdded={handlePhotoAdded}
                  onPhotoDeleted={handlePhotoDeleted}
                  canEdit={true}
                />
              </div>

              {errors.submit && (
                <div className="error-message">{errors.submit}</div>
              )}
              {errors.photos && (
                <div className="error-message">{errors.photos}</div>
              )}

                  <div className="form-actions">
                    <Button type="submit" variant="primary" disabled={uploadingPhotos}>
                      {uploadingPhotos
                        ? 'Uploading photos...'
                        : editingOrder
                        ? t('orders.updateOrder')
                        : estates.length === 0
                        ? t('common.continue')
                        : t('orders.createOrder')}
                    </Button>
                    <Button type="button" variant="ghost" onClick={resetForm} disabled={uploadingPhotos}>
                      {t('common.cancel')}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Estate Creation Form */}
              <div className={`form-slide ${!showEstateForm ? 'slide-right-out' : 'slide-right-in'} ${!showEstateForm && !isAnimating ? 'hidden' : ''}`}>
                <h2>{t('orders.providePropertyInfo')}</h2>
                <p className="estate-form-description">{t('orders.propertyInfoDescription')}</p>
                <form onSubmit={handleEstateSubmit} className="order-form">
              <Select
                label={t('estates.propertyType')}
                name="kind"
                value={estateFormData.kind}
                onChange={handleEstateChange}
                options={[
                  { value: 'APARTMENT', label: t('estates.apartment') },
                  { value: 'HOUSE', label: t('estates.house') },
                  { value: 'OFFICE', label: t('estates.office') },
                  { value: 'COMMERCIAL', label: t('estates.commercial') },
                ]}
                placeholder={t('estates.selectPropertyType')}
                error={errors.kind}
                required
              />

              <Input
                label={t('estates.address')}
                name="addressLine"
                value={estateFormData.addressLine}
                onChange={handleEstateChange}
                placeholder={t('estates.addressPlaceholder')}
                error={errors.addressLine}
                required
              />

              <div className="form-row">
                <Input
                  label={t('estates.city')}
                  name="city"
                  value={estateFormData.city}
                  onChange={handleEstateChange}
                  placeholder={t('estates.cityPlaceholder')}
                  error={errors.city}
                  required
                />
                <Input
                  label={t('estates.district')}
                  name="district"
                  value={estateFormData.district}
                  onChange={handleEstateChange}
                  placeholder={t('estates.districtPlaceholder')}
                  error={errors.district}
                  required
                />
              </div>

              <div className="form-row">
                <Input
                  label={t('estates.area')}
                  name="areaM2"
                  type="number"
                  value={estateFormData.areaM2}
                  onChange={handleEstateChange}
                  placeholder="100"
                  error={errors.areaM2}
                  required
                />
                <Input
                  label={t('estates.floor')}
                  name="floor"
                  type="number"
                  value={estateFormData.floor}
                  onChange={handleEstateChange}
                  placeholder={t('estates.floorPlaceholder')}
                  error={errors.floor}
                />
              </div>

              {errors.submit && (
                <div className="error-message">{errors.submit}</div>
              )}

                  <div className="form-actions">
                    <Button type="submit" variant="primary" disabled={uploadingPhotos}>
                      {uploadingPhotos
                        ? t('common.creating')
                        : t('orders.createPropertyAndOrder')}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleBackToOrderForm}
                      disabled={uploadingPhotos}
                    >
                      {t('common.back')}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
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
              <Card key={order.id} className="order-card" data-order-id={order.id}>
                <div className="order-header">
                  <div className="order-title-row">
                    <h3>{order.title}</h3>
                  </div>
                  <div className="order-header-actions">
                    <span className="order-budget">
                      {order.budgetMin}
                      {order.budgetMax ? `-${order.budgetMax}` : '+'} ₸
                    </span>
                    <div className="order-menu">
                      <button
                        className="menu-button"
                        onClick={() => toggleMenu(order.id)}
                        aria-label="Options"
                      >
                        ⋮
                      </button>
                      {openMenuId === order.id && (
                        <div className="menu-dropdown">
                          <button
                            className="menu-item"
                            onClick={() => {
                              handleEdit(order);
                              setOpenMenuId(null);
                            }}
                          >
                            {t('common.edit')}
                          </button>
                          <button
                            className="menu-item"
                            onClick={() => handleViewOffers(order)}
                          >
                            {t('common.viewOffers')}
                          </button>
                          <button
                            className="menu-item delete"
                            onClick={() => {
                              handleDelete(order.id);
                              setOpenMenuId(null);
                            }}
                          >
                            {t('common.delete')}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
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
                <div className="order-offers-section" onClick={() => handleViewOffers(order)}>
                  <span className="offers-label">{t('orders.receivedOffers')}:</span>
                  {loadingOfferCounts[order.id] ? (
                    <span className="offers-count-shimmer"></span>
                  ) : (
                    <span className="offers-count">{offerCounts[order.id] || 0}</span>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Confirm Deal Modal */}
        {confirmingDealOffer && selectedOrder && (
          <ConfirmDealModal
            offer={confirmingDealOffer}
            order={selectedOrder}
            onClose={() => setConfirmingDealOffer(null)}
            onSuccess={handleDealConfirmed}
          />
        )}

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
                  offers.map((offer) => {
                    const getUnitLabel = (unit) => {
                      const unitMap = {
                        'm2': t('offers.perM2'),
                        'areaM2': t('offers.perM2'),
                        'unit': t('offers.perUnit'),
                        'hour': t('offers.perHour'),
                        'day': t('offers.perDay'),
                        'fixed': '',
                      };
                      return unitMap[unit] || unit;
                    };

                    const getDaysLabel = (days) => {
                      return days === 1 ? t('offers.day') : t('offers.days');
                    };

                    const handleBuilderClick = (e) => {
                      e.preventDefault();
                      if (offer.builder?.id) {
                        navigate(`/builders/${offer.builder.id}`);
                      }
                    };

                    const getOfferStatusBadge = (status) => {
                      const statusMap = {
                        [OfferStatus.PENDING]: { className: 'pending', label: t('offers.statusPending') },
                        [OfferStatus.ACCEPTED]: { className: 'accepted', label: t('offers.statusAccepted') },
                        [OfferStatus.REJECTED]: { className: 'rejected', label: t('offers.statusRejected') },
                        [OfferStatus.WITHDRAWN]: { className: 'withdrawn', label: t('offers.statusWithdrawn') },
                      };

                      const statusConfig = statusMap[status] || statusMap[OfferStatus.PENDING];
                      return <span className={`status-badge ${statusConfig.className}`}>{statusConfig.label}</span>;
                    };

                    const builderContact = builderContacts[offer.id];
                    const isPending = offer.status === OfferStatus.PENDING || !offer.status;
                    const showPhone = builderContact || selectedOrder.status === OrderStatus.IN_PROGRESS;

                    return (
                      <div key={offer.id} className="offer-item">
                        <div className="offer-header">
                          {getOfferStatusBadge(offer.status)}
                        </div>

                        {offer.builder && (
                          <div
                            className="offer-builder-info clickable"
                            onClick={handleBuilderClick}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                handleBuilderClick(e);
                              }
                            }}
                          >
                            <div className="builder-name-rating">
                              <strong className="builder-name">{offer.builder.fullName || offer.builder.login}</strong>
                              <span className="builder-rating">⭐ {offer.builder.ratingAvg?.toFixed(1) || '0.0'}</span>
                            </div>
                            {showPhone && (
                              <a
                                href={`tel:${builderContact?.phone || offer.builder.phone}`}
                                className="builder-phone"
                                onClick={(e) => e.stopPropagation()}
                              >
                                📞 {builderContact?.phone || offer.builder.phone}
                              </a>
                            )}
                          </div>
                        )}

                        <div className="offer-pricing">
                          <strong className="offer-price">
                            {offer.price} ₸ {getUnitLabel(offer.unit)}
                          </strong>
                          <p className="offer-estimate">
                            {t('offers.estimatedDays')}: {offer.daysEstimate} {getDaysLabel(offer.daysEstimate)}
                          </p>
                        </div>
                        <p className="offer-message">{offer.message}</p>

                        {/* Offer Actions */}
                        {isPending && !builderContact && (
                          <div className="offer-actions">
                            <button
                              className="btn btn-primary"
                              onClick={() => handleRequestPhone(offer.id)}
                              disabled={requestingPhone}
                            >
                              {requestingPhone ? t('common.loading') : t('orders.requestPhone')}
                            </button>
                          </div>
                        )}

                        {builderContact && isPending && (
                          <div className="offer-actions">
                            <button
                              className="btn btn-success"
                              onClick={() => handleConfirmDealClick(offer)}
                            >
                              {t('orders.confirmDeal')}
                            </button>
                            <button
                              className="btn btn-secondary"
                              onClick={() => handleConfirmDealClick(offer)}
                            >
                              {t('orders.rejectDeal')}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
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
