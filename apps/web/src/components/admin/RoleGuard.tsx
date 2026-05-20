import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { hasAdminRole, type AdminRole } from '../../lib/admin-permissions';
import { Loading } from '../ui/Status';

export function RoleGuard({ roles, children }: { roles: AdminRole[]; children: ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get<{ user: { role: string } }>('/api/auth/me'),
    retry: false
  });

  if (isLoading) return <main className="p-8"><Loading /></main>;
  if (!hasAdminRole(data?.user?.role, roles)) return <Navigate to="/admin" replace />;

  return children;
}
