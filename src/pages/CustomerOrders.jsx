import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { container } from '../infrastructure/di/ServiceContainer';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import Select from '../components/Select';
import CascadingCategorySelect from '../components/CascadingCategorySelect';
import OrderPhotoGallery from '../components/OrderPhotoGallery';
import ConfirmDealModal from '../components/ConfirmDealModal';
import { OrderStatus } from '../domain/entities/Order';
import { OfferStatus } from '../domain/entities/Offer';
import './CustomerOrders.css';

const CustomerOrders = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [estates, setEstates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [editingOrder, setEditingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [offers, setOffers] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [offerCounts, setOfferCounts] = useState({});
  const [loadingOfferCounts, setLoadingOfferCounts] = useState({});
  const [formData, setFormData] = useState({
    categoryId: '',
    estateId: '',
    description: '',
    price: '',
    unit: '',
    priceType: 'NEGOTIABLE',
  });
  const [errors, setErrors] = useState({});
  const [pendingPhotos, setPendingPhotos] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [estateFormData, setEstateFormData] = useState({
    kind: '',
    addressLine: '',
    city: '',
    district: '',
    areaM2: '',
    floor: '',
  });
  const [requestingPhoneOffers, setRequestingPhoneOffers] = useState(new Set());
  const [builderContacts, setBuilderContacts] = useState({});
  const [confirmingDealOffer, setConfirmingDealOffer] = useState(null);

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

      const getCategoryTreeUseCase = container.getGetCategoryTreeUseCase();
      const estateUseCase = container.getManageEstatesUseCase();
      const getCustomerOrdersUseCase = container.getCustomerOrdersUseCase();
      const getCitiesUseCase = container.getGetCitiesUseCase();

      const ordersResult = await getCustomerOrdersUseCase.execute({
        page: 0,
        size: 10,
        sort: 'createAt,desc',
      });

      const [categoryTreeResult, estatesResult, citiesResult] = await Promise.all([
        getCategoryTreeUseCase.execute(false),
        estateUseCase.getAll(),
        getCitiesUseCase.execute(false),
      ]);

      const categoryTree = categoryTreeResult.success
        ? categoryTreeResult.categories
        : [];

      setCategories(categoryTree);
      setEstates(estatesResult.estates || []);
      setOrders(ordersResult.orders || []);
      setCities(citiesResult.success ? citiesResult.cities : []);

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

    const loadingState = {};
    ordersList.forEach((order) => {
      loadingState[order.id] = true;
    });
    setLoadingOfferCounts(loadingState);

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
    setCurrentStep(1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'price') {
      if (value && value.trim()) {
        setFormData((prev) => ({ ...prev, [name]: value, priceType: 'FIXED' }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value, priceType: 'NEGOTIABLE', unit: '' }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

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

  const handleNextStep = () => {
    // Validate current step before proceeding
    const newErrors = {};

    if (currentStep === 1) {
      // Step 1: Category selection
      if (!formData.categoryId) {
        newErrors.categoryId = t('orders.categoryRequired');
      }
    } else if (currentStep === 2 && estates.length === 0) {
      // Step 2 (conditional): Estate creation for users without estates
      if (!estateFormData.kind) newErrors.kind = t('estates.propertyTypeRequired');
      if (!estateFormData.addressLine) newErrors.addressLine = t('estates.addressRequired');
      if (!estateFormData.city) newErrors.city = t('estates.cityRequired');
      if (!estateFormData.district) newErrors.district = t('estates.districtRequired');
      if (!estateFormData.areaM2) newErrors.areaM2 = t('estates.areaRequired');
    } else if (currentStep === 2 && estates.length > 0) {
      // Step 2: Order details for users WITH estates
      if (!formData.estateId) {
        newErrors.estateId = t('orders.propertyRequired');
      }
      if (!formData.description) newErrors.description = t('orders.descriptionRequired');
      if (formData.price && !formData.unit) {
        newErrors.unit = t('orders.unitRequired');
      }
    } else if (currentStep === 3 && estates.length === 0) {
      // Step 3: Order details for users WITHOUT estates
      if (!formData.description) newErrors.description = t('orders.descriptionRequired');
      if (formData.price && !formData.unit) {
        newErrors.unit = t('orders.unitRequired');
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    setErrors({});
    setCurrentStep(currentStep - 1);
  };

  const handleCreateOrder = async () => {
    try {
      // Final validation before creating order
      const newErrors = {};

      if (!formData.categoryId) {
        newErrors.categoryId = t('orders.categoryRequired');
      }
      if (!formData.description) {
        newErrors.description = t('orders.descriptionRequired');
      }
      if (formData.price && !formData.unit) {
        newErrors.unit = t('orders.unitRequired');
      }

      // For users with estates, validate estate selection
      if (estates.length > 0 && !formData.estateId) {
        newErrors.estateId = t('orders.propertyRequired');
      }

      // For users without estates, validate estate form data
      if (estates.length === 0) {
        if (!estateFormData.kind) newErrors.kind = t('estates.propertyTypeRequired');
        if (!estateFormData.addressLine) newErrors.addressLine = t('estates.addressRequired');
        if (!estateFormData.city) newErrors.city = t('estates.cityRequired');
        if (!estateFormData.district) newErrors.district = t('estates.districtRequired');
        if (!estateFormData.areaM2) newErrors.areaM2 = t('estates.areaRequired');
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setUploadingPhotos(true);

      // If user has no estates, create estate first
      if (estates.length === 0) {
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
          setErrors(estateResult.errors || { submit: t('orders.estateCreationFailed') });
          setUploadingPhotos(false);
          return;
        }

        // Use the newly created estate
        formData.estateId = estateResult.estate.id;
      }

      // Create order
      const orderData = {
        description: formData.description,
        priceType: formData.priceType,
      };

      if (formData.price && formData.price.trim()) {
        orderData.price = parseFloat(formData.price);
        orderData.unit = formData.unit;
      }

      console.log('Creating order with data:', {
        orderData,
        categoryId: formData.categoryId,
        estateId: formData.estateId,
      });

      const createOrderUseCase = container.getCreateOrderUseCase();
      const result = await createOrderUseCase.execute(
        orderData,
        formData.categoryId,
        formData.estateId
      );

      console.log('Create order result:', result);

      if (!result.success) {
        console.error('Order creation failed with errors:', result.errors);
        setErrors(result.errors || { submit: t('orders.operationFailed') });
        return;
      }

      // Upload photos if any
      if (pendingPhotos.length > 0) {
        await uploadOrderPhotos(result.order.id, pendingPhotos);
      }

      fetchInitialData();
      resetForm();
    } catch (error) {
      console.error('Error creating order:', error);
      setErrors({ submit: error.response?.data?.message || t('orders.operationFailed') });
    } finally {
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
        photos: t('orders.photoUploadFailed'),
      }));
    }
  };

  const handlePhotoAdded = async (file) => {
    const photoUrl = URL.createObjectURL(file);
    const newPhoto = {
      id: `temp-${Date.now()}`,
      file,
      url: photoUrl,
    };
    setPendingPhotos((prev) => [...prev, newPhoto]);
  };

  const handlePhotoDeleted = async (photoId) => {
    setPendingPhotos((prev) => {
      const photo = prev.find((p) => p.id === photoId);
      if (photo?.url) {
        URL.revokeObjectURL(photo.url);
      }
      return prev.filter((p) => p.id !== photoId);
    });
  };

  const handleEdit = async (order) => {
    // Editing not supported in wizard mode - use simple form
    setEditingOrder(order);
    setFormData({
      categoryId: order.category?.id || '',
      estateId: order.realEstate?.id || '',
      description: order.description || '',
      price: order.price?.toString() || '',
      unit: order.unit || '',
      priceType: order.priceType || 'NEGOTIABLE',
    });
    setShowForm(true);
    setCurrentStep(1); // Show simplified edit view

    try {
      const getOrderPhotosUseCase = container.getGetOrderPhotosUseCase();
      const result = await getOrderPhotosUseCase.execute(order.id);

      if (result.success && result.photos && result.photos.length > 0) {
        setPendingPhotos(result.photos);
      } else {
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
      const orderCard = document.querySelector(`[data-order-id="${orderId}"]`);
      if (orderCard) {
        orderCard.classList.add('deleting');
      }

      const deleteOrderUseCase = container.getDeleteOrderUseCase();
      const result = await deleteOrderUseCase.execute(orderId);

      if (result.success) {
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
    if (!selectedOrder || requestingPhoneOffers.has(offerId)) return;

    setRequestingPhoneOffers(prev => new Set([...prev, offerId]));
    try {
      const requestPhoneUseCase = container.getRequestBuilderPhoneUseCase();
      const result = await requestPhoneUseCase.execute(selectedOrder.id, offerId);

      if (result.success) {
        setBuilderContacts(prev => ({
          ...prev,
          [offerId]: result.builderContact
        }));

        setSelectedOrder(prev => ({ ...prev, status: OrderStatus.IN_PROGRESS }));

        alert(t('orders.phoneRequested'));
      } else {
        alert(result.errors?.submit || 'Failed to request phone');
      }
    } catch (error) {
      console.error('Error requesting phone:', error);
      alert(error.response?.data?.message || 'Failed to request phone');
    } finally {
      setRequestingPhoneOffers(prev => {
        const newSet = new Set(prev);
        newSet.delete(offerId);
        return newSet;
      });
    }
  };

  const handleConfirmDealClick = (offer) => {
    setConfirmingDealOffer(offer);
  };

  const handleDealConfirmed = () => {
    setConfirmingDealOffer(null);
    setSelectedOrder(null);
    fetchInitialData();
  };

  const toggleMenu = (orderId) => {
    setOpenMenuId(openMenuId === orderId ? null : orderId);
  };

  const resetForm = () => {
    setFormData({
      categoryId: '',
      estateId: '',
      description: '',
      price: '',
      unit: '',
      priceType: 'NEGOTIABLE',
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
    setCurrentStep(1);
    setErrors({});

    pendingPhotos.forEach((photo) => {
      if (photo.url && photo.id.startsWith('temp-')) {
        URL.revokeObjectURL(photo.url);
      }
    });
    setPendingPhotos([]);
    setUploadingPhotos(false);
  };

  const getTotalSteps = () => {
    return estates.length === 0 ? 4 : 3;
  };

  const renderStepIndicator = () => {
    const totalSteps = getTotalSteps();
    const steps = [];

    for (let i = 1; i <= totalSteps; i++) {
      steps.push(
        <div key={i} className={`step-indicator ${currentStep >= i ? 'active' : ''}`}>
          {i}
        </div>
      );
    }

    return <div className="step-indicators">{steps}</div>;
  };

  const renderStep1 = () => (
    <div className="wizard-step">
      <h2>{t('orders.selectCategory')}</h2>
      <p className="step-description">{t('orders.selectCategoryDescription')}</p>
      <CascadingCategorySelect
        label={t('orders.category')}
        categories={categories}
        value={formData.categoryId}
        onChange={handleChange}
        placeholder={t('orders.selectCategory')}
        error={errors.categoryId}
        required
      />
    </div>
  );

  const renderStep2Estate = () => (
    <div className="wizard-step">
      <h2>{t('orders.providePropertyInfo')}</h2>
      <p className="step-description">{t('orders.propertyInfoDescription')}</p>

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
        <Select
          label={t('estates.city')}
          name="city"
          value={estateFormData.city}
          onChange={handleEstateChange}
          options={cities.map((city) => ({
            value: city.getLocalizedName(language),
            label: city.getLocalizedName(language),
          }))}
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
    </div>
  );

  const renderStep3OrderDetails = () => (
    <div className="wizard-step">
      <h2>{t('orders.orderDetails')}</h2>
      <p className="step-description">{t('orders.orderDetailsDescription')}</p>

      {estates.length > 0 && (
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
          label={t('orders.priceLabel')}
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          placeholder={t('orders.pricePlaceholder')}
          error={errors.price}
        />
        {formData.price && formData.price.trim() && (
          <Select
            label={t('orders.unitLabel')}
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            options={[
              { value: 'perMeter', label: t('orders.units.perMeter') },
              { value: 'perMeterSquare', label: t('orders.units.perMeterSquare') },
              { value: 'perMeterCube', label: t('orders.units.perMeterCube') },
              { value: 'perHour', label: t('orders.units.perHour') },
              { value: 'perDay', label: t('orders.units.perDay') },
              { value: 'perItem', label: t('orders.units.perItem') },
              { value: 'total', label: t('orders.units.total') },
              { value: 'other', label: t('orders.units.other') },
            ]}
            placeholder={t('orders.selectUnit')}
            error={errors.unit}
            required
          />
        )}
      </div>
    </div>
  );

  const renderStep4Photos = () => (
    <div className="wizard-step">
      <h2>{t('orders.uploadPhotos')}</h2>
      <p className="step-description">{t('orders.uploadPhotosDescription')}</p>

      <div className="form-section">
        <OrderPhotoGallery
          photos={pendingPhotos}
          onPhotoAdded={handlePhotoAdded}
          onPhotoDeleted={handlePhotoDeleted}
          canEdit={true}
        />
      </div>

      {errors.photos && (
        <div className="error-message">{errors.photos}</div>
      )}
    </div>
  );

  const renderCurrentStep = () => {
    if (currentStep === 1) {
      // Step 1: Category selection (always)
      return renderStep1();
    } else if (currentStep === 2 && estates.length === 0) {
      // Step 2: Estate form (only for users without estates)
      return renderStep2Estate();
    } else if (currentStep === 2 && estates.length > 0) {
      // Step 2: Order details (for users WITH estates)
      return renderStep3OrderDetails();
    } else if (currentStep === 3 && estates.length === 0) {
      // Step 3: Order details (for users WITHOUT estates)
      return renderStep3OrderDetails();
    } else if (currentStep === 3 && estates.length > 0) {
      // Step 3: Photos (for users WITH estates - final step)
      return renderStep4Photos();
    } else if (currentStep === 4 && estates.length === 0) {
      // Step 4: Photos (for users WITHOUT estates - final step)
      return renderStep4Photos();
    }
  };

  const renderWizardActions = () => {
    const totalSteps = getTotalSteps();
    const isLastStep = currentStep === totalSteps;

    return (
      <div className="wizard-actions">
        {currentStep > 1 && (
          <Button
            type="button"
            variant="ghost"
            onClick={handlePrevStep}
            disabled={uploadingPhotos}
          >
            {t('common.back')}
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          onClick={resetForm}
          disabled={uploadingPhotos}
        >
          {t('common.cancel')}
        </Button>

        {!isLastStep ? (
          <Button
            type="button"
            variant="primary"
            onClick={handleNextStep}
          >
            {t('common.continue')}
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            onClick={handleCreateOrder}
            disabled={uploadingPhotos}
          >
            {uploadingPhotos ? t('common.creating') : t('orders.createOrder')}
          </Button>
        )}
      </div>
    );
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

        {/* Multi-Step Order Creation Wizard */}
        {showForm && (
          <div className="order-wizard">
            <Card className="wizard-card">
              {renderStepIndicator()}
              {renderCurrentStep()}
              {errors.submit && (
                <div className="error-message">{errors.submit}</div>
              )}
              {renderWizardActions()}
            </Card>
          </div>
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
                    <h3>{order.category?.name || 'N/A'}</h3>
                  </div>
                  <div className="order-header-actions">
                    {order.price && (
                      <span className="order-budget">
                        {order.price} ₸
                      </span>
                    )}
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
              <h2>{t('orders.offers')}: {selectedOrder.category?.name}</h2>
              <p className="modal-order-description">{selectedOrder.description}</p>
              <div className="order-modal-details">
                {selectedOrder.price && (
                  <p><strong>{t('orders.price')}:</strong> {selectedOrder.price} ₸</p>
                )}
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
                        'fixed': '',
                        'total': t('orders.units.total'),
                        'lump_sum': t('offers.fixedPrice'),
                        'flat_rate': t('offers.fixedPrice'),
                      };
                      
                      // Check both original case and lowercase
                      return unitTranslationMap[unit] || unitTranslationMap[unit.toLowerCase()] || unit;
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

                        {isPending && !builderContact && (
                          <div className="offer-actions">
                            <button
                              className="btn btn-primary"
                              onClick={() => handleRequestPhone(offer.id)}
                              disabled={requestingPhoneOffers.has(offer.id)}
                              style={{ position: 'relative' }}
                            >
                              {requestingPhoneOffers.has(offer.id) && (
                                <div className="button-progress-bar">
                                  <div className="progress-bar-fill"></div>
                                </div>
                              )}
                              {requestingPhoneOffers.has(offer.id) ? t('common.loading') : t('orders.requestPhone')}
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
