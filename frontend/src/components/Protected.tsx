import { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { getToken, getUser, homePath } from '../api/client';
import { AppShell } from './AppShell';

type Role = 'TEACHER' | 'PARENT' | 'STUDENT';

export function Protected({ children, allow, noShell }: { children: ReactElement; allow: Role[]; noShell?: boolean }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) return <Navigate to={homePath(user.role)} replace />;
  return noShell ? children : <AppShell>{children}</AppShell>;
}
