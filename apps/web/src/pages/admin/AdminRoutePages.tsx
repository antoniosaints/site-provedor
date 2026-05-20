import { useQuery } from '@tanstack/react-query';
import { ResourcePage } from './ResourcePage';
import { SingletonPage } from './SingletonPage';
import { FieldConfig } from '../../components/admin/AdminForm';
import { api } from '../../lib/api';
import { formatMoney } from '../../lib/format';
import { highlightIconOptions } from '../../lib/highlight-icons';
import { roleLabels, type AdminRole } from '../../lib/admin-permissions';

const planTypes = [
  { label: 'Residencial', value: 'residencial' },
  { label: 'Empresarial', value: 'empresarial' },
  { label: 'Dedicado', value: 'dedicado' },
  { label: 'Outro', value: 'outro' }
];

const statuses = [
  { label: 'Rascunho', value: 'draft' },
  { label: 'Publicado', value: 'published' }
];

const carouselTypes = [
  { label: 'Formato atual', value: 'content' },
  { label: 'Imagem estática', value: 'image' }
];

const complementTypes = [
  { label: 'App', value: 'app' },
  { label: 'Serviço', value: 'servico' }
];

const userRoles = (Object.entries(roleLabels) as [AdminRole, string][])
  .map(([value, label]) => ({ value, label }));

export function BannersAdminPage() {
  return <ResourcePage title="Carrossel da Home" endpoint="/api/admin/banners" fields={[
    { name: 'title', label: 'Título / nome interno', required: true },
    { name: 'carouselType', label: 'Tipo de carrossel', type: 'select', options: carouselTypes },
    { name: 'subtitle', label: 'Subtítulo', type: 'textarea' },
    { name: 'buttonText', label: 'Texto do botão' },
    { name: 'buttonLink', label: 'Link do botão' },
    { name: 'imageUrl', label: 'Imagem', type: 'image' },
    { name: 'highlights', label: 'Destaques do slide, um por linha', type: 'array' },
    { name: 'location', label: 'Local' },
    { name: 'sortOrder', label: 'Ordem', type: 'number' },
    { name: 'active', label: 'Ativo', type: 'boolean' }
  ]} columns={[
    { key: 'title', label: 'Título' },
    { key: 'carouselType', label: 'Tipo', render: (item) => item.carouselType === 'image' ? 'Imagem estática' : 'Formato atual' },
    { key: 'sortOrder', label: 'Ordem' },
    { key: 'location', label: 'Local' },
    { key: 'active', label: 'Status', render: (item) => item.active ? 'Ativo' : 'Inativo' }
  ]} />;
}

export function HighlightsAdminPage() {
  return <ResourcePage title="Destaques" endpoint="/api/admin/highlights" fields={[
    { name: 'title', label: 'Texto do destaque', required: true },
    { name: 'icon', label: 'Ícone', type: 'select', options: highlightIconOptions },
    { name: 'sortOrder', label: 'Ordem', type: 'number' },
    { name: 'active', label: 'Ativo', type: 'boolean' }
  ]} columns={[
    { key: 'title', label: 'Destaque' },
    { key: 'icon', label: 'Ícone' },
    { key: 'sortOrder', label: 'Ordem' },
    { key: 'active', label: 'Status', render: (item) => item.active ? 'Ativo' : 'Inativo' }
  ]} />;
}

export function ComplementsAdminPage() {
  return <ResourcePage title="Complementos" endpoint="/api/admin/plan-complements" fields={[
    { name: 'name', label: 'Nome', required: true },
    { name: 'category', label: 'Tipo', type: 'select', options: complementTypes },
    { name: 'logoUrl', label: 'Logo', type: 'image' },
    { name: 'sortOrder', label: 'Ordem', type: 'number' },
    { name: 'active', label: 'Ativo', type: 'boolean' }
  ]} columns={[
    { key: 'name', label: 'Complemento' },
    { key: 'category', label: 'Tipo', render: (item) => item.category === 'servico' ? 'Serviço' : 'App' },
    { key: 'sortOrder', label: 'Ordem' },
    { key: 'active', label: 'Status', render: (item) => item.active ? 'Ativo' : 'Inativo' }
  ]} />;
}

export function PlansAdminPage() {
  const complements = useQuery({ queryKey: ['admin-resource', '/api/admin/plan-complements'], queryFn: () => api.get<any>('/api/admin/plan-complements?take=100') });
  const complementOptions = complements.data?.data?.map((item: any) => ({ label: item.name, value: item.id })) ?? [];

  return <ResourcePage title="Planos" endpoint="/api/admin/plans" fields={[
    { name: 'name', label: 'Nome', required: true },
    { name: 'downloadMbps', label: 'Download Mbps', type: 'number', required: true },
    { name: 'uploadMbps', label: 'Upload Mbps', type: 'number' },
    { name: 'priceCents', label: 'Preço em centavos', type: 'number', required: true },
    { name: 'type', label: 'Tipo', type: 'select', options: planTypes },
    { name: 'description', label: 'Descrição', type: 'textarea' },
    { name: 'benefits', label: 'Benefícios, um por linha', type: 'array' },
    { name: 'complementIds', label: 'Complementos inclusos', type: 'multi-select', options: complementOptions },
    { name: 'legalNotes', label: 'Observações legais', type: 'textarea' },
    { name: 'sortOrder', label: 'Ordem', type: 'number' },
    { name: 'featured', label: 'Plano recomendado', type: 'boolean' },
    { name: 'showOnHome', label: 'Exibir na home', type: 'boolean' },
    { name: 'active', label: 'Ativo', type: 'boolean' }
  ]} columns={[
    { key: 'name', label: 'Plano' },
    { key: 'downloadMbps', label: 'Velocidade', render: (item) => `${item.downloadMbps} Mega` },
    { key: 'priceCents', label: 'Preço', render: (item) => formatMoney(item.priceCents) },
    { key: 'type', label: 'Tipo' },
    { key: 'complementIds', label: 'Complementos', render: (item) => {
      try {
        const selected = Array.isArray(item.complementIds) ? item.complementIds : JSON.parse(item.complementIds ?? '[]');
        return `${Array.isArray(selected) ? selected.length : 0} selecionado(s)`;
      } catch {
        return '0 selecionados';
      }
    } },
    { key: 'active', label: 'Status', render: (item) => item.active ? 'Ativo' : 'Inativo' }
  ]} />;
}

export function CategoriesAdminPage() {
  return <ResourcePage title="Categorias do blog" endpoint="/api/admin/blog/categories" fields={[
    { name: 'name', label: 'Nome', required: true },
    { name: 'slug', label: 'Slug' },
    { name: 'description', label: 'Descrição', type: 'textarea' },
    { name: 'active', label: 'Ativa', type: 'boolean' }
  ]} columns={[
    { key: 'name', label: 'Nome' },
    { key: 'slug', label: 'Slug' },
    { key: 'active', label: 'Status', render: (item) => item.active ? 'Ativa' : 'Inativa' }
  ]} />;
}

export function PostsAdminPage() {
  const categories = useQuery({ queryKey: ['admin-resource', '/api/admin/blog/categories'], queryFn: () => api.get<any>('/api/admin/blog/categories?take=100') });
  const fields: FieldConfig[] = [
    { name: 'title', label: 'Título', required: true },
    { name: 'slug', label: 'Slug' },
    { name: 'summary', label: 'Resumo', type: 'textarea' },
    { name: 'content', label: 'Conteúdo', type: 'richtext', required: true },
    { name: 'coverImageUrl', label: 'Imagem de capa', type: 'image' },
    { name: 'author', label: 'Autor' },
    { name: 'status', label: 'Status', type: 'select', options: statuses },
    { name: 'categoryId', label: 'Categoria', type: 'select', options: categories.data?.data?.map((item: any) => ({ label: item.name, value: item.id })) ?? [] },
    { name: 'seoTitle', label: 'Título SEO' },
    { name: 'seoDescription', label: 'Descrição SEO', type: 'textarea' }
  ];
  return <ResourcePage title="Posts do blog" endpoint="/api/admin/blog/posts" fields={fields} columns={[
    { key: 'title', label: 'Título' },
    { key: 'category', label: 'Categoria', render: (item) => item.category?.name ?? '-' },
    { key: 'status', label: 'Status', render: (item) => item.status === 'published' ? 'Publicado' : 'Rascunho' },
    { key: 'updatedAt', label: 'Atualizado', render: (item) => new Date(item.updatedAt).toLocaleDateString('pt-BR') }
  ]} />;
}

export function TestimonialsAdminPage() {
  return <ResourcePage title="Depoimentos" endpoint="/api/admin/testimonials" fields={[
    { name: 'name', label: 'Cliente', required: true },
    { name: 'text', label: 'Depoimento', type: 'textarea', required: true },
    { name: 'location', label: 'Cidade/bairro' },
    { name: 'avatarUrl', label: 'Foto/avatar', type: 'image' },
    { name: 'rating', label: 'Nota', type: 'number' },
    { name: 'sortOrder', label: 'Ordem', type: 'number' },
    { name: 'active', label: 'Ativo', type: 'boolean' }
  ]} columns={[
    { key: 'name', label: 'Cliente' },
    { key: 'location', label: 'Local' },
    { key: 'rating', label: 'Nota' },
    { key: 'active', label: 'Status', render: (item) => item.active ? 'Ativo' : 'Inativo' }
  ]} />;
}

export function SocialLinksAdminPage() {
  return <ResourcePage title="Redes sociais" endpoint="/api/admin/social-links" fields={[
    { name: 'name', label: 'Nome', required: true },
    { name: 'url', label: 'URL', required: true },
    { name: 'sortOrder', label: 'Ordem', type: 'number' },
    { name: 'active', label: 'Ativa', type: 'boolean' }
  ]} columns={[
    { key: 'name', label: 'Rede' },
    { key: 'url', label: 'URL' },
    { key: 'active', label: 'Status', render: (item) => item.active ? 'Ativa' : 'Inativa' }
  ]} />;
}

export function UsersAdminPage() {
  return <ResourcePage title="Usuários" endpoint="/api/admin/users" fields={(editing) => [
    { name: 'name', label: 'Nome', required: true },
    { name: 'email', label: 'E-mail', required: true },
    { name: 'password', label: editing ? 'Nova senha (opcional)' : 'Senha inicial', type: 'password', required: !editing },
    { name: 'role', label: 'Permissão', type: 'select', options: userRoles, required: true }
  ]} columns={[
    { key: 'name', label: 'Nome' },
    { key: 'email', label: 'E-mail' },
    { key: 'role', label: 'Permissão', render: (item) => roleLabels[item.role as AdminRole] ?? item.role },
    { key: 'createdAt', label: 'Criado em', render: (item) => new Date(item.createdAt).toLocaleDateString('pt-BR') }
  ]} />;
}

export function SettingsAdminPage() {
  return <SingletonPage title="Configurações gerais" endpoint="/api/admin/settings" fields={[
    { name: 'siteTitle', label: 'Título do site' },
    { name: 'adminSidebarTitle', label: 'Nome no topo do admin' },
    { name: 'seoDescription', label: 'Descrição SEO padrão', type: 'textarea' },
    { name: 'logoUrl', label: 'Logo', type: 'image' },
    { name: 'faviconUrl', label: 'Favicon', type: 'image' },
    { name: 'primaryColor', label: 'Cor principal', type: 'color' },
    { name: 'secondaryColor', label: 'Cor secundária', type: 'color' },
    { name: 'headerBackgroundColor', label: 'Cor de fundo do header', type: 'color' },
    { name: 'headerTextColor', label: 'Cor dos textos do header', type: 'color' },
    { name: 'footerBackgroundColor', label: 'Cor de fundo do footer', type: 'color' },
    { name: 'footerTextColor', label: 'Cor dos textos do footer', type: 'color' },
    { name: 'ctaPlansText', label: 'Texto CTA planos' },
    { name: 'ctaWhatsappText', label: 'Texto CTA WhatsApp' },
    { name: 'whatsappContractMessage', label: 'Mensagem contratação', type: 'textarea' },
    { name: 'whatsappSupportMessage', label: 'Mensagem suporte', type: 'textarea' },
    { name: 'whatsappCoverageMessage', label: 'Mensagem cobertura', type: 'textarea' },
    { name: 'subscriberCenterUrl', label: 'Link da central do assinante' },
    { name: 'careersUrl', label: 'Link trabalhe conosco' },
    { name: 'animationsEnabled', label: 'Ativar animações no site público', type: 'boolean' },
    { name: 'externalScripts', label: 'Scripts externos', type: 'textarea' }
  ]} />;
}

export function AboutAdminPage() {
  return <div className="grid gap-8">
    <SingletonPage title="Sobre nós" endpoint="/api/admin/company" fields={[
      { name: 'companyName', label: 'Nome da empresa' },
      { name: 'shortDescription', label: 'Descrição curta', type: 'textarea' },
      { name: 'phone', label: 'Telefone' },
      { name: 'whatsapp', label: 'WhatsApp' },
      { name: 'email', label: 'E-mail' },
      { name: 'address', label: 'Endereço' },
      { name: 'city', label: 'Cidade' },
      { name: 'state', label: 'Estado' },
      { name: 'businessHours', label: 'Horário de atendimento' },
      { name: 'mapsEmbedUrl', label: 'Google Maps embed/link' },
      { name: 'cnpj', label: 'CNPJ' },
      { name: 'aboutTitle', label: 'Título institucional' },
      { name: 'aboutText', label: 'Texto sobre a empresa', type: 'textarea' },
      { name: 'history', label: 'História', type: 'textarea' },
      { name: 'differentials', label: 'Diferenciais, um por linha', type: 'array' },
      { name: 'institutionalImageUrl', label: 'Imagem institucional', type: 'image' },
      { name: 'yearsInBusiness', label: 'Anos de atuação', type: 'number' },
      { name: 'customerCount', label: 'Número de clientes', type: 'number' },
      { name: 'citiesServed', label: 'Cidades atendidas' }
    ]} />
    <SingletonPage title="Missão, visão e valores" endpoint="/api/admin/mission-vision-values" fields={[
      { name: 'mission', label: 'Missão', type: 'textarea' },
      { name: 'vision', label: 'Visão', type: 'textarea' },
      { name: 'values', label: 'Valores', type: 'textarea' },
      { name: 'complement', label: 'Texto complementar', type: 'textarea' }
    ]} />
  </div>;
}
