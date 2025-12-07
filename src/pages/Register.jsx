import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { container } from '../infrastructure/di/ServiceContainer';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Card from '../components/Card';
import OtpInput from '../components/OtpInput';
import PhoneInput from '../components/PhoneInput';
import CascadingCategorySelect from '../components/CascadingCategorySelect';
import authService from '../services/authService';
import estateService from '../services/estateService';
import builderService from '../services/builderService';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t, language } = useLanguage();

  // Steps: 1=User Type, 2=Basic Info, 3=OTP, 4=Customer Choice or Builder Form, 5=Property Form (customer only)
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
    email: '',
    otpCode: '',
  });

  // Builder profile form data
  const [builderFormData, setBuilderFormData] = useState({
    aboutMe: '',
    experienceYears: '',
    city: '',
    district: '',
    jobsDone: '',
    available: true,
  });

  // Categories
  const [categoryTree, setCategoryTree] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    categoryId: '',
    price: '',
    description: '',
  });

  // Property form data
  const [propertyFormData, setPropertyFormData] = useState({
    kind: '',
    addressLine: '',
    city: '',
    district: '',
    areaM2: '',
    floor: '',
  });

  const [cities, setCities] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpExpiresIn, setOtpExpiresIn] = useState(300);
  const [phoneValidation, setPhoneValidation] = useState({
    checked: false,
    available: null,
    hasWhatsapp: null,
    loading: false
  });

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // OTP expiration timer
  useEffect(() => {
    if (otpSent && otpExpiresIn > 0) {
      const timer = setTimeout(() => setOtpExpiresIn(otpExpiresIn - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpSent, otpExpiresIn]);

  // Load categories and cities when builder form is shown
  useEffect(() => {
    if (step === 4 && formData.role === 'BUILDER') {
      loadCategories();
      loadCities();
    }
  }, [step, formData.role]);

  // Load cities when property form is shown
  useEffect(() => {
    if (step === 5) {
      loadCities();
    }
  }, [step]);

  const loadCategories = async () => {
    try {
      const getCategoryTreeUseCase = container.getGetCategoryTreeUseCase();
      const result = await getCategoryTreeUseCase.execute(false);

      if (result.success) {
        setCategoryTree(result.categories);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadCities = async () => {
    try {
      const getCitiesUseCase = container.getGetCitiesUseCase();
      const citiesResult = await getCitiesUseCase.execute(false);
      setCities(citiesResult.success ? citiesResult.cities : []);
    } catch (error) {
      console.error('Failed to load cities:', error);
    }
  };

  const validatePhone = async (phone) => {
    if (!phone || phone.length !== 11) return;
    
    setPhoneValidation(prev => ({ ...prev, loading: true }));
    
    try {
      const result = await authService.checkPhone(phone);
      setPhoneValidation({
        checked: true,
        available: result.available,
        hasWhatsapp: result.hasWhatsapp,
        loading: false
      });
      
      // Clear any existing phone validation errors
      if (errors.phone && (result.available === false || result.hasWhatsapp === false)) {
        // Let the error show from validation result
      } else if (result.available && result.hasWhatsapp) {
        setErrors(prev => ({ ...prev, phone: '' }));
      }
    } catch (error) {
      console.error('Phone validation error:', error);
      setPhoneValidation({
        checked: false,
        available: null,
        hasWhatsapp: null,
        loading: false
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Reset validation state when phone changes
    if (name === 'phone') {
      setPhoneValidation({
        checked: false,
        available: null,
        hasWhatsapp: null,
        loading: false
      });
      
      // Validate phone after a short delay to allow user to finish typing
      if (value && value.length === 11) {
        setTimeout(() => validatePhone(value), 500);
      }
    }
    
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleBuilderFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBuilderFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handlePropertyFormChange = (e) => {
    const { name, value } = e.target;
    setPropertyFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Category handlers
  const handleNewCategoryChange = (e) => {
    const { name, value } = e.target;
    // Skip categoryId changes from other handlers
    if (name === 'categoryId') return;

    setNewCategory((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategorySelect = (categoryId) => {
    console.log('Category selected:', categoryId);
    setNewCategory((prev) => ({
      ...prev,
      categoryId: categoryId,
    }));
  };

  const handleAddCategory = () => {
    console.log('handleAddCategory called with newCategory:', newCategory);

    // Extract categoryId properly (in case it's an event object)
    let categoryId = newCategory.categoryId;
    if (typeof categoryId === 'object' && categoryId?.target) {
      categoryId = categoryId.target.value;
      console.warn('CategoryId was an event object, extracted value:', categoryId);
    }

    if (!categoryId || !newCategory.price) {
      setErrors({ category: t('validation.required') });
      return;
    }

    // Find the category in the tree
    const findCategory = (categories, targetId) => {
      for (const cat of categories) {
        if (cat.id === targetId) {
          return cat;
        }
        if (cat.children && cat.children.length > 0) {
          const found = findCategory(cat.children, targetId);
          if (found) return found;
        }
      }
      return null;
    };

    const category = findCategory(categoryTree, categoryId);

    if (!category) {
      console.error('Category not found in tree. CategoryId:', categoryId, 'Tree:', categoryTree);
      setErrors({ category: t('validation.categoryNotFound') || 'Category not found' });
      return;
    }

    console.log('Adding category to local state:', {
      id: categoryId,
      name: category.name,
      price: newCategory.price,
      description: newCategory.description,
    });

    setSelectedCategories((prev) => [
      ...prev,
      {
        id: categoryId,
        name: category.name,
        price: newCategory.price,
        description: newCategory.description,
      },
    ]);

    setNewCategory({ categoryId: '', price: '', description: '' });
    setErrors({});
  };

  const handleRemoveCategory = (index) => {
    setSelectedCategories((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUserTypeSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
    setStep(2);
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.firstName) {
      newErrors.firstName = t('validation.firstNameRequired');
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = t('validation.firstNameLength');
    }

    if (!formData.lastName) {
      newErrors.lastName = t('validation.lastNameRequired');
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = t('validation.lastNameLength');
    }

    if (!formData.phone) {
      newErrors.phone = t('validation.phoneRequired');
    } else if (!/^7\d{10}$/.test(formData.phone)) {
      newErrors.phone = t('validation.phoneInvalid');
    } else if (phoneValidation.checked && phoneValidation.available === false) {
      newErrors.phone = t('validation.phoneNotAvailable');
    } else if (phoneValidation.checked && phoneValidation.hasWhatsapp === false) {
      newErrors.phone = t('validation.phoneNoWhatsapp');
    }

    if (!formData.password) {
      newErrors.password = t('validation.passwordRequired');
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordsNotMatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};

    if (!formData.otpCode) {
      newErrors.otpCode = t('validation.otpRequired');
    } else if (formData.otpCode.length !== 4) {
      newErrors.otpCode = t('validation.otpInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateBuilderForm = () => {
    const newErrors = {};

    if (!builderFormData.city) {
      newErrors.city = t('estates.cityRequired');
    }

    if (!builderFormData.district) {
      newErrors.district = t('estates.districtRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePropertyForm = () => {
    const newErrors = {};

    if (!propertyFormData.kind) newErrors.kind = t('estates.propertyTypeRequired');
    if (!propertyFormData.addressLine) newErrors.addressLine = t('estates.addressRequired');
    if (!propertyFormData.city) newErrors.city = t('estates.cityRequired');
    if (!propertyFormData.district) newErrors.district = t('estates.districtRequired');
    if (!propertyFormData.areaM2) newErrors.areaM2 = t('estates.areaRequired');
    if (!propertyFormData.floor) newErrors.floor = t('estates.floorRequired');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!validateStep2()) return;

    setLoading(true);
    try {
      const response = await authService.sendOtp(formData.phone);
      setOtpSent(true);
      setStep(3);
      setCountdown(30);
      setOtpExpiresIn(response.expiresIn || 300);
      setErrors({});
    } catch (error) {
      console.error('Send OTP error:', error);
      const errorMessage = error.response?.data?.message || t('validation.otpSendFailed');
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setLoading(true);
    try {
      const response = await authService.sendOtp(formData.phone);
      setCountdown(30);
      setOtpExpiresIn(response.expiresIn || 300);
      setFormData((prev) => ({ ...prev, otpCode: '' }));
      setErrors({});
    } catch (error) {
      console.error('Resend OTP error:', error);
      const errorMessage = error.response?.data?.message || t('validation.otpSendFailed');
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!validateStep3()) return;

    setLoading(true);
    const { confirmPassword: _confirmPassword, ...userData } = formData;
    const result = await register(userData);
    setLoading(false);

    if (result.success) {
      // Go to step 4 - conditional based on user type
      setStep(4);
    } else {
      const errorMessage = result.error;
      if (errorMessage?.toLowerCase().includes('otp') || errorMessage?.toLowerCase().includes('код')) {
        setErrors({ otpCode: errorMessage });
      } else {
        setErrors({ submit: errorMessage });
      }
    }
  };

  const handleCustomerChoice = (choice) => {
    if (choice === 'services') {
      navigate('/services');
    } else if (choice === 'property') {
      setStep(5);
    }
  };

  const handleBuilderFormSubmit = async (e) => {
    e.preventDefault();

    console.log('Builder form submit - selected categories:', selectedCategories);

    if (!validateBuilderForm()) return;

    setLoading(true);
    try {
      // Get builder profile
      const getBuilderUseCase = container.getGetBuilderUseCase();
      const builderResult = await getBuilderUseCase.execute();

      if (!builderResult.success || !builderResult.builder?.id) {
        setErrors({ submit: t('registration.builderNotFound') });
        setLoading(false);
        return;
      }

      const builderId = builderResult.builder.id;

      // Update builder profile
      const updateData = {
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        login: formData.phone,
        aboutMe: builderFormData.aboutMe,
        experienceYears: builderFormData.experienceYears ? parseInt(builderFormData.experienceYears) : 0,
        city: builderFormData.city,
        district: builderFormData.district,
        jobsDone: builderFormData.jobsDone ? parseInt(builderFormData.jobsDone) : 0,
        available: builderFormData.available,
        avatarLink: '',
        role: 'BUILDER',
        ratingAvg: 0,
        priceList: null,
      };

      const updateBuilderUseCase = container.getUpdateBuilderUseCase();
      const result = await updateBuilderUseCase.execute(builderId, updateData);

      if (!result.success) {
        setErrors(result.errors || { submit: t('profile.updateFailed') });
        setLoading(false);
        return;
      }

      // Add categories if selected
      if (selectedCategories.length > 0) {
        console.log('Adding categories to builder:', {
          builderId,
          categories: selectedCategories,
        });

        try {
          for (const category of selectedCategories) {
            const categoryPayload = {
              category: { publicId: category.id },
              price: parseFloat(category.price),
              description: category.description || '',
            };
            console.log('Adding category:', categoryPayload);

            const result = await builderService.addCategory(builderId, categoryPayload);
            console.log('Category added successfully:', result);
          }
        } catch (error) {
          console.error('Category add failed:', error);
          console.error('Error details:', error.response?.data || error.message);
          // Don't stop the flow, continue to navigation
        }
      }

      navigate('/');
    } catch (error) {
      console.error('Builder form submit error:', error);
      setErrors({ submit: error.response?.data?.message || t('profile.updateFailed') });
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyFormSubmit = async (e) => {
    e.preventDefault();

    if (!validatePropertyForm()) return;

    setLoading(true);
    try {
      await estateService.createEstate(propertyFormData);
      navigate('/services');
    } catch (error) {
      console.error('Property form submit error:', error);
      setErrors({ submit: error.response?.data?.message || t('estates.operationFailed') });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setFormData((prev) => ({ ...prev, role: '' }));
    } else if (step === 3) {
      setStep(2);
      setOtpSent(false);
      setFormData((prev) => ({ ...prev, otpCode: '' }));
    } else if (step === 5) {
      setStep(4);
    }
    setErrors({});
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Step 1: User Type Selection
  if (step === 1) {
    return (
      <div className="register-page">
        <div className="register-container">
          <Card className="register-card">
            <div className="register-header">
              <h1>{t('registration.whoAreYou')}</h1>
              <p>{t('registration.selectUserType')}</p>
            </div>

            <div className="user-type-selection">
              <button
                className="user-type-card"
                onClick={() => handleUserTypeSelect('CUSTOMER')}
              >
                <div className="user-type-icon">👤</div>
                <h2>{t('registration.customer')}</h2>
                <p>{t('registration.customerDesc')}</p>
              </button>

              <button
                className="user-type-card"
                onClick={() => handleUserTypeSelect('BUILDER')}
              >
                <div className="user-type-icon">🔨</div>
                <h2>{t('registration.serviceProvider')}</h2>
                <p>{t('registration.serviceProviderDesc')}</p>
              </button>
            </div>

            <div className="register-footer">
              <p>
                {t('auth.haveAccount')}{' '}
                <Link to="/login" className="register-link">
                  {t('auth.signInHere')}
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Step 2: Basic Information
  if (step === 2) {
    return (
      <div className="register-page">
        <div className="register-container">
          <Card className="register-card">
            <div className="register-header">
              <h1>{t('registration.basicInfo')}</h1>
              <p>{t('registration.basicInfoDesc')}</p>
            </div>

            <form onSubmit={handleSendOtp} className="register-form">
              <Input
                label={t('auth.firstName')}
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder={t('auth.firstName')}
                error={errors.firstName}
                required
              />

              <Input
                label={t('auth.lastName')}
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder={t('auth.lastName')}
                error={errors.lastName}
                required
              />

              <div className="phone-input-section">
                <PhoneInput
                  label={t('auth.phoneNumber')}
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  required
                />
                
                {/* Phone validation status */}
                {phoneValidation.loading && (
                  <div className="phone-validation-status">
                    <span className="status-indicator loading">⏳</span>
                    <span>{t('validation.checkingPhone')}</span>
                  </div>
                )}
                
                {phoneValidation.checked && phoneValidation.available && phoneValidation.hasWhatsapp && (
                  <div className="phone-validation-status success">
                    <span className="status-indicator">✓</span>
                    <span>{t('validation.phoneAvailable')}</span>
                  </div>
                )}
                
                {phoneValidation.checked && !phoneValidation.available && (
                  <div className="phone-validation-status error">
                    <span className="status-indicator">✕</span>
                    <span>{t('validation.phoneNotAvailable')}</span>
                  </div>
                )}
                
                {phoneValidation.checked && phoneValidation.available && !phoneValidation.hasWhatsapp && (
                  <div className="phone-validation-status error">
                    <span className="status-indicator">✕</span>
                    <span>{t('validation.phoneNoWhatsapp')}</span>
                    <span className="whatsapp-explanation">
                      <span className="explanation-icon" title={t('validation.whatsappExplanation')}>ℹ️</span>
                      {t('validation.whatsappRequired')}
                    </span>
                  </div>
                )}
              </div>

              <Input
                label={t('auth.password')}
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('auth.password')}
                error={errors.password}
                required
              />

              <Input
                label={t('auth.confirmPassword')}
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t('auth.confirmPassword')}
                error={errors.confirmPassword}
                required
              />

              {errors.submit && (
                <div className="error-message">{errors.submit}</div>
              )}

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? t('auth.sendingOtp') : t('auth.sendOtp')}
              </Button>

              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={handleBack}
              >
                {t('common.back')}
              </Button>

              <p className="policy-notice">
                {t('auth.policyNoticeStart')}{' '}
                <Link to="/privacy-policy" target="_blank" className="policy-link">
                  {t('auth.privacyPolicy')}
                </Link>
                {language === 'kk' && ` ${t('auth.policyNoticeEnd')}`}
              </p>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  // Step 3: OTP Verification
  if (step === 3) {
    return (
      <div className="register-page">
        <div className="register-container">
          <Card className="register-card">
            <div className="register-header">
              <h1>{t('auth.verifyPhone')}</h1>
              <p>{t('auth.otpSentTo', { phone: formData.phone })}</p>
            </div>

            <form onSubmit={handleVerifyOtp} className="register-form">
              <div className="otp-section">
                <label className="input-label">
                  {t('auth.enterOtpCode')} <span className="input-required">*</span>
                </label>
                <OtpInput
                  length={4}
                  value={formData.otpCode}
                  onChange={(value) => {
                    setFormData((prev) => ({ ...prev, otpCode: value }));
                    if (errors.otpCode) {
                      setErrors((prev) => ({ ...prev, otpCode: '' }));
                    }
                  }}
                  error={errors.otpCode}
                  disabled={loading}
                />
                <div className="otp-info">
                  {otpExpiresIn > 0 ? (
                    <p className="otp-timer">
                      {t('auth.otpExpiresIn', { time: formatTime(otpExpiresIn) })}
                    </p>
                  ) : (
                    <p className="otp-expired">{t('auth.otpExpired')}</p>
                  )}
                </div>
              </div>

              {errors.submit && (
                <div className="error-message">{errors.submit}</div>
              )}

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading || otpExpiresIn === 0}
              >
                {loading ? t('auth.creatingAccount') : t('registration.verifyAndContinue')}
              </Button>

              <div className="otp-actions">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || loading}
                >
                  {countdown > 0
                    ? t('auth.resendOtpIn', { seconds: countdown })
                    : t('auth.resendOtp')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  disabled={loading}
                >
                  {t('common.back')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  // Step 4: Conditional - Customer Choice or Builder Form
  if (step === 4) {
    if (formData.role === 'CUSTOMER') {
      return (
        <div className="register-page">
          <div className="register-container">
            <Card className="register-card">
              <div className="register-header">
                <div className="success-icon">✓</div>
                <h1>{t('registration.congratulations')}</h1>
                <p>{t('registration.registrationSuccess')}</p>
              </div>

              <div className="customer-choice-section">
                <h2>{t('registration.whatNext')}</h2>
                <p className="choice-description">{t('registration.propertyExplanation')}</p>

                <div className="choice-buttons">
                  <button
                    className="choice-card"
                    onClick={() => handleCustomerChoice('property')}
                  >
                    <div className="choice-icon">🏠</div>
                    <h3>{t('registration.addProperty')}</h3>
                    <p>{t('registration.addPropertyDesc')}</p>
                  </button>

                  <button
                    className="choice-card"
                    onClick={() => handleCustomerChoice('services')}
                  >
                    <div className="choice-icon">🔍</div>
                    <h3>{t('registration.browseServices')}</h3>
                    <p>{t('registration.browseServicesDesc')}</p>
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      );
    } else {
      // Builder form
      return (
        <div className="register-page">
          <div className="register-container">
            <Card className="register-card">
              <div className="register-header">
                <div className="success-icon">✓</div>
                <h1>{t('registration.congratulations')}</h1>
                <p className="success-subtitle">{t('registration.successfullyVerified')}</p>
                <p>{t('registration.lastStep')}</p>
              </div>

              <form onSubmit={handleBuilderFormSubmit} className="register-form">
                <h2>{t('registration.moreInfoNeeded')}</h2>

                <div className="input-wrapper">
                  <label className="input-label">{t('services.aboutMe')}</label>
                  <textarea
                    name="aboutMe"
                    value={builderFormData.aboutMe}
                    onChange={handleBuilderFormChange}
                    placeholder={t('profile.aboutMePlaceholder')}
                    className="input"
                    rows="4"
                  />
                </div>

                <div className="form-row">
                  <Input
                    label={t('services.experienceYears')}
                    name="experienceYears"
                    type="number"
                    value={builderFormData.experienceYears}
                    onChange={handleBuilderFormChange}
                    error={errors.experienceYears}
                  />

                  <Input
                    label={t('services.jobsDone')}
                    name="jobsDone"
                    type="number"
                    value={builderFormData.jobsDone}
                    onChange={handleBuilderFormChange}
                    error={errors.jobsDone}
                  />
                </div>

                <div className="form-row">
                  <Select
                    label={t('services.city')}
                    name="city"
                    value={builderFormData.city}
                    onChange={handleBuilderFormChange}
                    options={cities.map((city) => ({
                      value: city.getLocalizedName(language),
                      label: city.getLocalizedName(language),
                    }))}
                    placeholder={t('estates.cityPlaceholder')}
                    error={errors.city}
                    required
                  />

                  <Input
                    label={t('services.district')}
                    name="district"
                    value={builderFormData.district}
                    onChange={handleBuilderFormChange}
                    error={errors.district}
                    required
                  />
                </div>

                {/* Category Selection */}
                <div className="input-wrapper">
                  <label className="input-label">{t('registration.addCategory')}</label>
                  <p className="input-hint">{t('registration.addCategoryDesc')}</p>

                  {/* Selected Categories List - Show above form */}
                  {selectedCategories.length > 0 && (
                    <div className="selected-categories">
                      <h3>{t('registration.yourCategories')}</h3>
                      <div className="category-cards">
                        {selectedCategories.map((category, index) => (
                          <div key={index} className="category-card-item">
                            <div className="category-card-content">
                              <div className="category-card-name">{category.name}</div>
                              <div className="category-card-price">{category.price} ₸</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveCategory(index)}
                              className="category-card-remove"
                              aria-label={t('registration.removeCategory')}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="category-form">
                    <CascadingCategorySelect
                      label={t('registration.selectCategoryPlaceholder')}
                      categories={categoryTree}
                      value={newCategory.categoryId}
                      onChange={handleCategorySelect}
                      placeholder={t('registration.selectCategoryPlaceholder')}
                      error={errors.category}
                    />

                    <Input
                      label={t('registration.categoryPrice')}
                      name="price"
                      type="text"
                      value={newCategory.price}
                      onChange={handleNewCategoryChange}
                      placeholder={t('registration.categoryPricePlaceholder')}
                    />

                    <div className="input-wrapper">
                      <label className="input-label">{t('registration.categoryDescription')}</label>
                      <textarea
                        name="description"
                        value={newCategory.description}
                        onChange={handleNewCategoryChange}
                        placeholder={t('registration.categoryDescriptionPlaceholder')}
                        className="input"
                        rows="2"
                      />
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddCategory}
                    >
                      {t('registration.addCategory')}
                    </Button>
                  </div>
                </div>

                <div className="input-wrapper">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="available"
                      checked={builderFormData.available}
                      onChange={handleBuilderFormChange}
                    />
                    <span>{t('services.available')}</span>
                  </label>
                </div>

                {errors.submit && (
                  <div className="error-message">{errors.submit}</div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? t('common.creating') : t('registration.completeRegistration')}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      );
    }
  }

  // Step 5: Property Form (Customer only)
  if (step === 5) {
    return (
      <div className="register-page">
        <div className="register-container">
          <Card className="register-card">
            <div className="register-header">
              <h1>{t('registration.addYourProperty')}</h1>
              <p>{t('registration.propertyFormDesc')}</p>
            </div>

            <form onSubmit={handlePropertyFormSubmit} className="register-form">
              <Select
                label={t('estates.propertyType')}
                name="kind"
                value={propertyFormData.kind}
                onChange={handlePropertyFormChange}
                options={[
                  { value: 'APARTMENT', label: t('estates.apartment') },
                  { value: 'HOUSE', label: t('estates.house') },
                  { value: 'OFFICE', label: t('estates.office') },
                  { value: 'COMMERCIAL', label: t('estates.commercial') },
                ]}
                placeholder={t('estates.propertyTypePlaceholder')}
                error={errors.kind}
                required
              />

              <Input
                label={t('estates.address')}
                name="addressLine"
                value={propertyFormData.addressLine}
                onChange={handlePropertyFormChange}
                placeholder={t('estates.addressPlaceholder')}
                error={errors.addressLine}
                required
              />

              <div className="form-row">
                <Select
                  label={t('estates.city')}
                  name="city"
                  value={propertyFormData.city}
                  onChange={handlePropertyFormChange}
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
                  value={propertyFormData.district}
                  onChange={handlePropertyFormChange}
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
                  step="0.1"
                  value={propertyFormData.areaM2}
                  onChange={handlePropertyFormChange}
                  placeholder="50"
                  error={errors.areaM2}
                  required
                />
                <Input
                  label={t('estates.floor')}
                  name="floor"
                  type="number"
                  value={propertyFormData.floor}
                  onChange={handlePropertyFormChange}
                  placeholder={t('estates.floorPlaceholder')}
                  error={errors.floor}
                  required
                />
              </div>

              {errors.submit && (
                <div className="error-message">{errors.submit}</div>
              )}

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? t('common.creating') : t('registration.addPropertyAndFinish')}
              </Button>

              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={handleBack}
              >
                {t('common.back')}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  return null;
};

export default Register;
