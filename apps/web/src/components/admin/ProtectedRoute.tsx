import { Navigate, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Loading } from '../ui/Status';

export function ProtectedRoute() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/api/auth/me'),
    retry: false
  });

  if (isLoading) return <main className="p-8"><Loading /></main>;
  if (isError || !data) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}
