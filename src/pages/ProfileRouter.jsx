import { useAuth } from '../context/AuthContext';
import BuilderProfile from './BuilderProfile';
import CustomerProfile from './CustomerProfile';

const ProfileRouter = () => {
  const { user } = useAuth();

  if (user?.role === 'BUILDER') {
    return <BuilderProfile />;
  }

  return <CustomerProfile />;
};

export default ProfileRouter;
