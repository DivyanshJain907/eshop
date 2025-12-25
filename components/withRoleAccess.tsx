import { useAuth } from '@/lib/auth-context';

export function withRoleAccess(Component) {
  return function RoleAccessWrapper(props) {
    const { user } = useAuth();
    if (!user || (user.role !== 'admin' && user.role !== 'employee')) {
      return null;
    }
    return <Component {...props} user={user} />;
  };
}
