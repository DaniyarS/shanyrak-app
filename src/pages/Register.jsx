import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import OtpInput from '../components/OtpInput';
import authService from '../services/authService';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t, language } = useLanguage();
  const [step, setStep] = useState(1); // 1: Enter details, 2: Enter OTP
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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpExpiresIn, setOtpExpiresIn] = useState(300); // 5 minutes in seconds

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateStep1 = () => {
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
    } else if (!/^[0-9]{11}$/.test(formData.phone)) {
      newErrors.phone = t('validation.phoneInvalid');
    }

    if (!formData.role) {
      newErrors.role = t('validation.roleRequired');
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

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.otpCode) {
      newErrors.otpCode = t('validation.otpRequired');
    } else if (formData.otpCode.length !== 4) {
      newErrors.otpCode = t('validation.otpInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!validateStep1()) return;

    setLoading(true);
    try {
      const response = await authService.sendOtp(formData.phone);
      setOtpSent(true);
      setStep(2);
      setCountdown(30); // 30 seconds cooldown before resend
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
      setCountdown(30); // 30 seconds cooldown before next resend
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep2()) return;

    setLoading(true);
    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      const errorMessage = result.error;
      // Check if error is related to OTP
      if (errorMessage?.toLowerCase().includes('otp') || errorMessage?.toLowerCase().includes('код')) {
        setErrors({ otpCode: errorMessage });
      } else {
        setErrors({ submit: errorMessage });
      }
    }
  };

  const handleBack = () => {
    setStep(1);
    setOtpSent(false);
    setFormData((prev) => ({ ...prev, otpCode: '' }));
    setErrors({});
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <Card className="register-card">
          <div className="register-header">
            <h1>{step === 1 ? t('auth.createAccount') : t('auth.verifyPhone')}</h1>
            <p>
              {step === 1
                ? t('auth.joinToday')
                : t('auth.otpSentTo', { phone: formData.phone })}
            </p>
          </div>

          {step === 1 ? (
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

              <Input
                label={t('auth.phoneNumber')}
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="77020000796"
                error={errors.phone}
                required
              />

              <Input
                label={t('auth.email')}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('auth.emailOptional')}
                error={errors.email}
              />

              <div className="role-selector-wrapper">
                <label className="input-label">
                  {t('auth.role')} <span className="input-required">*</span>
                </label>
                <div className={`role-selector ${errors.role ? 'has-error' : ''}`}>
                  <label className={`role-option ${formData.role === 'CUSTOMER' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="CUSTOMER"
                      checked={formData.role === 'CUSTOMER'}
                      onChange={handleChange}
                      className="role-radio"
                    />
                    <div className="role-content">
                      <span className="role-title">{t('auth.customerTitle')}</span>
                      <span className="role-description">{t('auth.customerDescription')}</span>
                    </div>
                  </label>
                  <label className={`role-option ${formData.role === 'BUILDER' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="BUILDER"
                      checked={formData.role === 'BUILDER'}
                      onChange={handleChange}
                      className="role-radio"
                    />
                    <div className="role-content">
                      <span className="role-title">{t('auth.builderTitle')}</span>
                      <span className="role-description">{t('auth.builderDescription')}</span>
                    </div>
                  </label>
                </div>
                {errors.role && <span className="input-error-message">{errors.role}</span>}
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

              <p className="policy-notice">
                {t('auth.policyNoticeStart')}{' '}
                <Link to="/privacy-policy" target="_blank" className="policy-link">
                  {t('auth.privacyPolicy')}
                </Link>
                {language === 'kk' && ` ${t('auth.policyNoticeEnd')}`}
              </p>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="register-form">
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
                {loading ? t('auth.creatingAccount') : t('auth.createAccountBtn')}
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
          )}

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
};

export default Register;
