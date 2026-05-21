import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BarChart3, FileText, Home, Image, LayoutDashboard, LogOut, MapPinned, MessageSquare, PackagePlus, Settings, Sparkles, Star, UserCog, Users, Wifi } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { adminOnlyRoles, allAdminRoles, hasAdminRole, managerAdminRoles } from '../../lib/admin-permissions';
import { Logo } from '../public/Logo';

const links = [
  { to: '/admin', label: 'Dashboard', Icon: LayoutDashboard, roles: allAdminRoles },
  { to: '/admin/carrossel', label: 'Carrossel', Icon: Image, roles: managerAdminRoles },
  { to: '/admin/destaques', label: 'Destaques', Icon: Sparkles, roles: managerAdminRoles },
  { to: '/admin/complementos', label: 'Complementos', Icon: PackagePlus, roles: managerAdminRoles },
  { to: '/admin/planos', label: 'Planos', Icon: Wifi, roles: managerAdminRoles },
  { to: '/admin/blog/posts', label: 'Posts', Icon: FileText, roles: managerAdminRoles },
  { to: '/admin/blog/categorias', label: 'Categorias', Icon: BarChart3, roles: managerAdminRoles },
  { to: '/admin/depoimentos', label: 'Depoimentos', Icon: Star, roles: managerAdminRoles },
  { to: '/admin/contatos', label: 'Contatos', Icon: MessageSquare, roles: allAdminRoles },
  { to: '/admin/cobertura', label: 'Solic. cobertura', Icon: Home, roles: allAdminRoles },
  { to: '/admin/mapa-cobertura', label: 'Mapa cobertura', Icon: MapPinned, roles: managerAdminRoles },
  { to: '/admin/sobre', label: 'Sobre', Icon: Users, roles: managerAdminRoles },
  { to: '/admin/redes-sociais', label: 'Redes sociais', Icon: Users, roles: managerAdminRoles },
  { to: '/admin/usuarios', label: 'Usuários', Icon: UserCog, roles: adminOnlyRoles },
  { to: '/admin/configuracoes', label: 'Configurações', Icon: Settings, roles: adminOnlyRoles }
];

export function AdminLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get<{ user: { role: string } }>('/api/auth/me'),
    retry: false
  });
  const { data: publicSettings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: () => api.get<{ settings?: any }>('/api/public/settings')
  });
  const role = me?.user?.role;
  const visibleLinks = links.filter((link) => hasAdminRole(role, link.roles));
  const adminName = publicSettings?.settings?.adminSidebarTitle || publicSettings?.settings?.siteTitle || 'MEGANET';

  async function logout() {
    await api.post('/api/auth/logout');
    queryClient.clear();
    navigate('/admin/login');
  }

  return (
    <div className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="border-r border-slate-200 bg-white p-4 lg:min-h-screen">
        <div className="mb-2"><Logo logoUrl={publicSettings?.settings?.logoUrl} name={adminName} /></div>
        <nav className="grid gap-1">
          {visibleLinks.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <button onClick={logout} className="mt-6 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
          <LogOut size={18} /> Sair
        </button>
      </aside>
      <main className="min-w-0 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
