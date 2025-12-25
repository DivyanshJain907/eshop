
import { ComponentType } from 'react';

export function withRoleAccess<P extends { user?: any }>(Component: ComponentType<P>) {
  return function RoleAccessWrapper(props: Omit<P, 'user'>) {
    const { user } = useAuth();
    if (!user || (user.role !== 'admin' && user.role !== 'employee')) {
      return null;
    }
    return <Component {...(props as P)} user={user} />;
  };
}
