import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './BottomNav.css';

const BottomNav = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Don't show bottom nav if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Define menu items based on user role
  const getMenuItems = () => {
    const items = [
      {
        path: '/',
        icon: '🏠',
        label: t('navbar.home'),
      },
    ];

    if (user?.role === 'CUSTOMER') {
      items.push({
        path: '/services',
        icon: '🔧',
        label: t('navbar.services'),
      });
      items.push({
        path: '/my-orders',
        icon: '📋',
        label: t('navbar.myOrders'),
      });
    } else if (user?.role === 'BUILDER') {
      items.push({
        path: '/orders',
        icon: '📋',
        label: t('navbar.orders'),
      });
      items.push({
        path: '/offers',
        icon: '💼',
        label: t('navbar.myOffers'),
      });
    }

    items.push({
      path: '/profile',
      icon: '👤',
      label: t('navbar.profile'),
    });

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-content">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`bottom-nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
