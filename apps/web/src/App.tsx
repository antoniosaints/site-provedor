import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { PublicLayout } from './components/public/PublicLayout';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { RoleGuard } from './components/admin/RoleGuard';
import { AdminLayout } from './components/admin/AdminLayout';
import { adminOnlyRoles, managerAdminRoles } from './lib/admin-permissions';
import { HomePage } from './pages/public/HomePage';
import { PlansPage } from './pages/public/PlansPage';
import { BlogPage } from './pages/public/BlogPage';
import { BlogPostPage } from './pages/public/BlogPostPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { CoveragePage } from './pages/public/CoveragePage';
import { LoginPage } from './pages/admin/LoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { MessagesPage } from './pages/admin/MessagesPage';
import {
  AboutAdminPage,
  BannersAdminPage,
  CategoriesAdminPage,
  ComplementsAdminPage,
  HighlightsAdminPage,
  PlansAdminPage,
  PostsAdminPage,
  SettingsAdminPage,
  SocialLinksAdminPage,
  TestimonialsAdminPage,
  UsersAdminPage
} from './pages/admin/AdminRoutePages';

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/planos', element: <PlansPage /> },
      { path: '/blog', element: <BlogPage /> },
      { path: '/blog/:slug', element: <BlogPostPage /> },
      { path: '/sobre', element: <AboutPage /> },
      { path: '/contato', element: <ContactPage /> },
      { path: '/cobertura', element: <CoveragePage /> }
    ]
  },
  { path: '/admin/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'carrossel', element: <RoleGuard roles={managerAdminRoles}><BannersAdminPage /></RoleGuard> },
          { path: 'banners', element: <RoleGuard roles={managerAdminRoles}><BannersAdminPage /></RoleGuard> },
          { path: 'destaques', element: <RoleGuard roles={managerAdminRoles}><HighlightsAdminPage /></RoleGuard> },
          { path: 'complementos', element: <RoleGuard roles={managerAdminRoles}><ComplementsAdminPage /></RoleGuard> },
          { path: 'planos', element: <RoleGuard roles={managerAdminRoles}><PlansAdminPage /></RoleGuard> },
          { path: 'blog/posts', element: <RoleGuard roles={managerAdminRoles}><PostsAdminPage /></RoleGuard> },
          { path: 'blog/categorias', element: <RoleGuard roles={managerAdminRoles}><CategoriesAdminPage /></RoleGuard> },
          { path: 'depoimentos', element: <RoleGuard roles={managerAdminRoles}><TestimonialsAdminPage /></RoleGuard> },
          { path: 'contatos', element: <MessagesPage title="Mensagens de contato" endpoint="/api/admin/contact-messages" type="contact" /> },
          { path: 'cobertura', element: <MessagesPage title="Solicitações de cobertura" endpoint="/api/admin/coverage-requests" type="coverage" /> },
          { path: 'usuarios', element: <RoleGuard roles={adminOnlyRoles}><UsersAdminPage /></RoleGuard> },
          { path: 'configuracoes', element: <RoleGuard roles={adminOnlyRoles}><SettingsAdminPage /></RoleGuard> },
          { path: 'sobre', element: <RoleGuard roles={managerAdminRoles}><AboutAdminPage /></RoleGuard> },
          { path: 'redes-sociais', element: <RoleGuard roles={managerAdminRoles}><SocialLinksAdminPage /></RoleGuard> }
        ]
      }
    ]
  }
]);

export function App() {
  return <RouterProvider router={router} />;
}
