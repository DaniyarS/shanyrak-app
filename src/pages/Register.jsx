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
import AvatarUpload from '../components/AvatarUpload';
import PortfolioUpload from '../components/PortfolioUpload';
import authService from '../services/authService';
import estateService from '../services/estateService';
import fileService from '../services/fileService';
import categoryService from '../services/categoryService';
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

  // Avatar and portfolio files
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [portfolioFiles, setPortfolioFiles] = useState([]);

  // Categories
  const [availableCategories, setAvailableCategories] = useState([]);
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

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpExpiresIn, setOtpExpiresIn] = useState(300);

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

  // Load categories when builder form is shown
  useEffect(() => {
    if (step === 4 && formData.role === 'BUILDER') {
      loadCategories();
    }
  }, [step, formData.role]);

  const loadCategories = async () => {
    try {
      const allCategories = await categoryService.getAllCategories();

      // Filter to get only leaf categories (categories without children)
      const leafCategories = [];

      const checkIfLeaf = async (category) => {
        try {
          const children = await categoryService.getCategoryChildren(category.uuid || category.publicId);
          return !children || children.length === 0;
        } catch (error) {
          // If fetching children fails, assume it's a leaf category
          return true;
        }
      };

      for (const category of allCategories) {
        const isLeaf = await checkIfLeaf(category);
        if (isLeaf) {
          leafCategories.push(category);
        }
      }

      setAvailableCategories(leafCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  // Avatar upload handler
  const handleAvatarUpdate = (newAvatarUrl) => {
    setAvatarUrl(newAvatarUrl);
  };

  // Portfolio photos handler
  const handlePortfolioPhotosChange = (files) => {
    setPortfolioFiles(files);
  };

  // Category handlers
  const handleNewCategoryChange = (e) => {
    const { name, value } = e.target;
    setNewCategory((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddCategory = () => {
    if (!newCategory.categoryId || !newCategory.price) {
      setErrors({ category: t('validation.required') });
      return;
    }

    const category = availableCategories.find(
      (cat) => cat.uuid === newCategory.categoryId || cat.publicId === newCategory.categoryId
    );

    if (!category) return;

    setSelectedCategories((prev) => [
      ...prev,
      {
        id: newCategory.categoryId,
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
    const { confirmPassword, ...userData } = formData;
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

      // Note: Avatar is already uploaded via AvatarUpload component
      // Portfolio photos will be uploaded after profile update

      // Upload portfolio photos if selected
      if (portfolioFiles.length > 0) {
        try {
          for (let i = 0; i < portfolioFiles.length; i++) {
            await fileService.uploadBuilderPortfolio(portfolioFiles[i], i);
          }
        } catch (error) {
          console.error('Portfolio upload failed:', error);
        }
      }

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
        try {
          for (const category of selectedCategories) {
            await builderService.addCategory(builderId, {
              category: { publicId: category.id },
              price: category.price,
              description: category.description,
            });
          }
        } catch (error) {
          console.error('Category add failed:', error);
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

              <PhoneInput
                label={t('auth.phoneNumber')}
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                required
              />

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

                {/* Avatar Upload */}
                <div className="input-wrapper">
                  <label className="input-label">{t('registration.uploadAvatar')}</label>
                  <p className="input-hint">{t('registration.uploadAvatarDesc')}</p>
                  <AvatarUpload
                    currentAvatarUrl={avatarUrl}
                    onAvatarUpdate={handleAvatarUpdate}
                  />
                </div>

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
                  <Input
                    label={t('services.city')}
                    name="city"
                    value={builderFormData.city}
                    onChange={handleBuilderFormChange}
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

                {/* Portfolio Upload */}
                <div className="input-wrapper">
                  <label className="input-label">{t('registration.uploadPortfolio')}</label>
                  <p className="input-hint">{t('registration.uploadPortfolioDesc')}</p>
                  <PortfolioUpload
                    onPhotosChange={handlePortfolioPhotosChange}
                    maxPhotos={10}
                  />
                </div>

                {/* Category Selection */}
                <div className="input-wrapper">
                  <label className="input-label">{t('registration.addCategory')}</label>
                  <p className="input-hint">{t('registration.addCategoryDesc')}</p>

                  <div className="category-form">
                    <Select
                      label={t('registration.selectCategoryPlaceholder')}
                      name="categoryId"
                      value={newCategory.categoryId}
                      onChange={handleNewCategoryChange}
                      options={availableCategories.map((cat) => ({
                        value: cat.uuid || cat.publicId,
                        label: cat.name,
                      }))}
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

                  {/* Selected Categories List */}
                  {selectedCategories.length > 0 && (
                    <div className="selected-categories">
                      <h3>{t('registration.yourCategories')}</h3>
                      {selectedCategories.map((category, index) => (
                        <div key={index} className="category-item">
                          <div className="category-info">
                            <strong>{category.name}</strong>
                            <span className="category-price">{category.price}</span>
                            {category.description && (
                              <p className="category-desc">{category.description}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCategory(index)}
                            className="remove-category-btn"
                          >
                            {t('registration.removeCategory')}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
                <Input
                  label={t('estates.city')}
                  name="city"
                  value={propertyFormData.city}
                  onChange={handlePropertyFormChange}
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
