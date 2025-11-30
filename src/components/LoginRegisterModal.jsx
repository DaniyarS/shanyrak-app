import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './LoginRegisterModal.css';

function LoginRegisterModal({ onClose, onSuccess }) {
  const { login, register } = useAuth();
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginData, setLoginData] = useState({
    phone: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    phone: '',
    password: '',
    name: '',
    email: ''
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(loginData.phone, loginData.password);
      if (result.success) {
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(result.error || t.auth.loginFailed);
      }
    } catch (err) {
      setError(t.auth.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await register(
        registerData.phone,
        registerData.password,
        registerData.name,
        registerData.email
      );
      if (result.success) {
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(result.error || t.auth.registerFailed);
      }
    } catch (err) {
      setError(t.auth.registerFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="auth-modal-close">×</button>

        <div className="auth-modal-header">
          <h2>{t.waste.authRequired}</h2>
          <p className="auth-modal-subtitle">{t.waste.authRequiredMessage}</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
          >
            {t.auth.login}
          </button>
          <button
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
          >
            {t.auth.register}
          </button>
        </div>

        <div className="auth-modal-content">
          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="form-group">
                <label>{t.auth.phone}</label>
                <input
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  value={loginData.phone}
                  onChange={(e) => setLoginData({ ...loginData, phone: e.target.value })}
                  required
                  className="auth-input"
                />
              </div>

              <div className="form-group">
                <label>{t.auth.password}</label>
                <input
                  type="password"
                  placeholder={t.auth.passwordPlaceholder}
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  className="auth-input"
                />
              </div>

              {error && <div className="auth-error">{error}</div>}

              <button type="submit" disabled={loading} className="auth-submit">
                {loading ? t.auth.loggingIn : t.auth.login}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="auth-form">
              <div className="form-group">
                <label>{t.auth.name}</label>
                <input
                  type="text"
                  placeholder={t.auth.namePlaceholder}
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  required
                  className="auth-input"
                />
              </div>

              <div className="form-group">
                <label>{t.auth.phone}</label>
                <input
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                  required
                  className="auth-input"
                />
              </div>

              <div className="form-group">
                <label>{t.auth.email}</label>
                <input
                  type="email"
                  placeholder={t.auth.emailPlaceholder}
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  required
                  className="auth-input"
                />
              </div>

              <div className="form-group">
                <label>{t.auth.password}</label>
                <input
                  type="password"
                  placeholder={t.auth.passwordPlaceholder}
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  required
                  className="auth-input"
                  minLength="6"
                />
              </div>

              {error && <div className="auth-error">{error}</div>}

              <button type="submit" disabled={loading} className="auth-submit">
                {loading ? t.auth.registering : t.auth.register}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginRegisterModal;
