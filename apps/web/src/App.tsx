import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { PublicLayout } from './components/public/PublicLayout';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { AdminLayout } from './components/admin/AdminLayout';
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
  TestimonialsAdminPage
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
          { path: 'carrossel', element: <BannersAdminPage /> },
          { path: 'banners', element: <BannersAdminPage /> },
          { path: 'destaques', element: <HighlightsAdminPage /> },
          { path: 'complementos', element: <ComplementsAdminPage /> },
          { path: 'planos', element: <PlansAdminPage /> },
          { path: 'blog/posts', element: <PostsAdminPage /> },
          { path: 'blog/categorias', element: <CategoriesAdminPage /> },
          { path: 'depoimentos', element: <TestimonialsAdminPage /> },
          { path: 'contatos', element: <MessagesPage title="Mensagens de contato" endpoint="/api/admin/contact-messages" type="contact" /> },
          { path: 'cobertura', element: <MessagesPage title="Solicitações de cobertura" endpoint="/api/admin/coverage-requests" type="coverage" /> },
          { path: 'configuracoes', element: <SettingsAdminPage /> },
          { path: 'sobre', element: <AboutAdminPage /> },
          { path: 'redes-sociais', element: <SocialLinksAdminPage /> }
        ]
      }
    ]
  }
]);

export function App() {
  return <RouterProvider router={router} />;
}
