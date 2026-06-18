import { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { getToken, getUser, homePath } from '../api/client';
import { AppShell } from './AppShell';

type Role = 'TEACHER' | 'PARENT' | 'STUDENT';

export function Protected({ children, allow }: { children: ReactElement; allow: Role[] }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) return <Navigate to={homePath(user.role)} replace />;
  return <AppShell>{children}</AppShell>;
}
