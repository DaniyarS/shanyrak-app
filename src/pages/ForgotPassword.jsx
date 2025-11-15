import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/Button';
import Input from '../components/Input';
import PhoneInput from '../components/PhoneInput';
import Card from '../components/Card';
import OtpInput from '../components/OtpInput';
import authService from '../services/authService';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [step, setStep] = useState(1); // 1: Enter phone, 2: Enter OTP and new password
  const [formData, setFormData] = useState({
    phone: '',
    otpCode: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpExpiresIn, setOtpExpiresIn] = useState(300);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (step === 2 && otpExpiresIn > 0) {
      const timer = setTimeout(() => setOtpExpiresIn(otpExpiresIn - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, otpExpiresIn]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.phone) {
      newErrors.phone = t('validation.phoneRequired');
    } else if (!/^7\d{10}$/.test(formData.phone)) {
      newErrors.phone = t('validation.phoneInvalid');
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
    if (!formData.newPassword) {
      newErrors.newPassword = t('validation.passwordRequired');
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.confirmPasswordRequired');
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordsNotMatch');
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
      setStep(2);
      setCountdown(30);
      setOtpExpiresIn(response.expiresIn || 300);
      setErrors({});
    } catch (error) {
      console.error('Send OTP error:', error);
      setErrors({ submit: error.response?.data?.message || t('validation.otpSendFailed') });
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
      setErrors({ submit: error.response?.data?.message || t('validation.otpSendFailed') });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    try {
      await authService.resetPassword(formData.phone, formData.otpCode, formData.newPassword);
      setResetSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || t('validation.resetPasswordFailed');
      if (errorMessage?.toLowerCase().includes('otp') || errorMessage?.toLowerCase().includes('код')) {
        setErrors({ otpCode: errorMessage });
      } else {
        setErrors({ submit: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setFormData((prev) => ({ ...prev, otpCode: '', newPassword: '', confirmPassword: '' }));
    setErrors({});
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (resetSuccess) {
    return (
      <div className="forgot-password-page">
        <div className="forgot-password-container">
          <Card className="forgot-password-card">
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h2>{t('auth.passwordResetSuccess')}</h2>
              <p>{t('auth.redirectingToLogin')}</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <Card className="forgot-password-card">
          <div className="forgot-password-header">
            <h1>{step === 1 ? t('auth.forgotPassword') : t('auth.resetPassword')}</h1>
            <p>
              {step === 1
                ? t('auth.enterPhoneToReset')
                : t('auth.otpSentTo', { phone: formData.phone })}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="forgot-password-form">
              <PhoneInput
                label={t('auth.phoneNumber')}
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                required
              />

              {errors.submit && <div className="error-message">{errors.submit}</div>}

              <Button type="submit" variant="primary" fullWidth disabled={loading}>
                {loading ? t('auth.sendingOtp') : t('auth.sendOtp')}
              </Button>

              <div className="forgot-password-footer">
                <Link to="/login" className="back-link">
                  {t('auth.backToLogin')}
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="forgot-password-form">
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

              <Input
                label={t('auth.newPassword')}
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder={t('auth.newPassword')}
                error={errors.newPassword}
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

              {errors.submit && <div className="error-message">{errors.submit}</div>}

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading || otpExpiresIn === 0}
              >
                {loading ? t('auth.resettingPassword') : t('auth.resetPasswordBtn')}
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
                <Button type="button" variant="ghost" onClick={handleBack} disabled={loading}>
                  {t('common.back')}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
