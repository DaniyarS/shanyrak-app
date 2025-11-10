import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName) {
      newErrors.fullName = t('validation.fullNameRequired');
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = t('validation.fullNameLength');
    }

    if (!formData.phone) {
      newErrors.phone = t('validation.phoneRequired');
    } else if (!/^[0-9]{11}$/.test(formData.phone)) {
      newErrors.phone = t('validation.phoneInvalid');
    }

    if (!formData.password) {
      newErrors.password = t('validation.passwordRequired');
    }
    // Commented out password validation for now
    // else if (formData.password.length < 8) {
    //   newErrors.password = t('validation.passwordLength');
    // } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
    //   newErrors.password = t('validation.passwordStrength');
    // }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordsNotMatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setErrors({ submit: result.error });
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <Card className="register-card">
          <div className="register-header">
            <h1>{t('auth.createAccount')}</h1>
            <p>{t('auth.joinToday')}</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            <Input
              label={t('auth.fullName')}
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder={t('auth.fullName')}
              error={errors.fullName}
              required
            />

            <Input
              label={t('auth.phoneNumber')}
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="87020000796"
              error={errors.phone}
              required
            />

            <div className="input-wrapper">
              <label htmlFor="role" className="input-label">
                {t('auth.role')} <span className="input-required">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input"
              >
                <option value="CUSTOMER">{t('auth.customer')}</option>
                <option value="BUILDER">{t('auth.serviceProvider')}</option>
              </select>
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
              {loading ? t('auth.creatingAccount') : t('auth.createAccountBtn')}
            </Button>
          </form>

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
