import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
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

    if (!formData.phone) {
      newErrors.phone = t('validation.phoneRequired');
    } else if (!/^[0-9]{11}$/.test(formData.phone)) {
      newErrors.phone = t('validation.phoneInvalid');
    }

    if (!formData.password) {
      newErrors.password = t('validation.passwordRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    const result = await login(formData.phone, formData.password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setErrors({ submit: result.error });
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <Card className="login-card">
          <div className="login-header">
            <h1>{t('auth.welcomeBack')}</h1>
            <p>{t('auth.signInAccount')}</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
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

            {errors.submit && (
              <div className="error-message">{errors.submit}</div>
            )}

            <div className="forgot-password-link-wrapper">
              <Link to="/forgot-password" className="forgot-password-link">
                {t('auth.forgotPassword')}?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? t('auth.signingIn') : t('auth.signIn')}
            </Button>
          </form>

          <div className="login-footer">
            <p>
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="login-link">
                {t('auth.registerHere')}
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
