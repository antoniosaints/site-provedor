import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ResourcePage } from './ResourcePage';
import { SingletonPage } from './SingletonPage';
import { FieldConfig } from '../../components/admin/AdminForm';
import { api } from '../../lib/api';
import { formatMoney } from '../../lib/format';
import { highlightIconOptions } from '../../lib/highlight-icons';
import { roleLabels, type AdminRole } from '../../lib/admin-permissions';
import { Card } from '../../components/ui/Card';

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

const siteTemplates = [
  { label: 'Clássico atual', value: 'classic' },
  { label: 'Hub regional', value: 'hub' },
  { label: 'Órbita fibra', value: 'orbit' }
];

export function BannersAdminPage() {
  return <ResourcePage title="Carrossel da Home" endpoint="/api/admin/banners" fields={[
    { name: 'title', label: 'Título / nome interno', required: true, placeholder: 'Ex.: Internet fibra para ir mais longe' },
    { name: 'carouselType', label: 'Tipo de carrossel', type: 'select', options: carouselTypes },
    { name: 'backgroundColor', label: 'Cor base do fundo', type: 'color', defaultValue: '#0877c8', helpText: 'Usada no Formato atual do carrossel.' },
    { name: 'textColor', label: 'Cor dos textos', type: 'color', defaultValue: '#ffffff', helpText: 'Tambem ajusta o contraste dos botoes outline do carrossel.' },
    { name: 'subtitle', label: 'Subtítulo', type: 'textarea' },
    { name: 'buttonText', label: 'Texto do botão', placeholder: 'Ex.: Ver planos' },
    { name: 'buttonLink', label: 'Link do botão', placeholder: '/planos' },
    { name: 'imageUrl', label: 'Imagem', type: 'image', imageHint: 'Formato atual: imagem lateral em PNG/WEBP por volta de 900 x 620px. Imagem estatica: banner amplo 1920 x 720px.', crop: { outputWidth: 1600, outputHeight: 900 } },
    { name: 'highlights', label: 'Destaques do slide, um por linha', type: 'array', placeholder: 'Maior velocidade\nBaixa latencia\nWi-Fi otimizado' },
    { name: 'location', label: 'Local', placeholder: 'home' },
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
    { name: 'logoUrl', label: 'Logo', type: 'image', imageHint: 'Use PNG/WEBP com fundo transparente quando possivel. Tamanho recomendado: 512 x 512px ou logo horizontal ate 800px.', crop: { outputWidth: 512, outputHeight: 512 } },
    { name: 'sortOrder', label: 'Ordem', type: 'number' },
    { name: 'active', label: 'Ativo', type: 'boolean' }
  ]} columns={[
    { key: 'name', label: 'Complemento' },
    { key: 'category', label: 'Tipo', render: (item) => item.category === 'servico' ? 'Serviço' : 'App' },
    { key: 'sortOrder', label: 'Ordem' },
    { key: 'active', label: 'Status', render: (item) => item.active ? 'Ativo' : 'Inativo' }
  ]} />;
}

function CoverageMapStatusCard() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-coverage-map'],
    queryFn: () => api.get<{ data: { coverageMapEnabled: boolean } }>('/api/admin/coverage-map')
  });
  const enabled = Boolean(data?.data?.coverageMapEnabled);
  const updateStatus = useMutation({
    mutationFn: (coverageMapEnabled: boolean) => api.put('/api/admin/coverage-map', { coverageMapEnabled }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-coverage-map'] }),
        queryClient.invalidateQueries({ queryKey: ['home'] }),
        queryClient.invalidateQueries({ queryKey: ['public-settings'] }),
        queryClient.invalidateQueries({ queryKey: ['coverage-locations'] })
      ]);
    }
  });

  return (
    <Card className="p-5">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          className="mt-1"
          type="checkbox"
          checked={enabled}
          disabled={isLoading || updateStatus.isPending}
          onChange={(event) => updateStatus.mutate(event.target.checked)}
        />
        <span>
          <strong className="block text-sm text-brand-900">Exibir mapa de cobertura no site</strong>
          <small className="mt-1 block text-sm font-semibold leading-6 text-slate-500">Quando ativo, os locais marcados como ativos aparecem na home e na pagina de cobertura.</small>
        </span>
      </label>
      {updateStatus.isError ? <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{updateStatus.error.message}</p> : null}
    </Card>
  );
}

export function CoverageLocationsAdminPage() {
  return (
    <div className="grid gap-6">
      <CoverageMapStatusCard />
      <ResourcePage title="Locais de atuacao" endpoint="/api/admin/coverage-locations" fields={[
        { name: 'name', label: 'Nome do local', required: true, placeholder: 'Ex.: Centro, Bacabal, Arari' },
        { name: 'latitude', label: 'Latitude', type: 'number', required: true, step: 'any', placeholder: '-4.22492' },
        { name: 'longitude', label: 'Longitude', type: 'number', required: true, step: 'any', placeholder: '-44.78355' },
        { name: 'markerIconUrl', label: 'Icone do marcador', type: 'image', imageHint: 'Opcional. Use PNG/WEBP quadrado, de preferencia com fundo transparente. Tamanho recomendado: 128 x 128px.', crop: { aspectRatio: 1, outputWidth: 128, outputHeight: 128 } },
        { name: 'address', label: 'Endereco', type: 'textarea', required: true, placeholder: 'Rua, numero, bairro, cidade - UF' },
        { name: 'sortOrder', label: 'Ordem', type: 'number' },
        { name: 'active', label: 'Ativo', type: 'boolean' }
      ]} columns={[
        { key: 'name', label: 'Local' },
        { key: 'markerIconUrl', label: 'Icone', render: (item) => item.markerIconUrl ? 'Imagem' : 'Padrao' },
        { key: 'address', label: 'Endereco' },
        { key: 'coordinates', label: 'Coordenadas', render: (item) => `${Number(item.latitude).toFixed(5)}, ${Number(item.longitude).toFixed(5)}` },
        { key: 'sortOrder', label: 'Ordem' },
        { key: 'active', label: 'Status', render: (item) => item.active ? 'Ativo' : 'Inativo' }
      ]} />
    </div>
  );
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
    { name: 'coverImageUrl', label: 'Imagem de capa', type: 'image', imageHint: 'Tamanho recomendado: 1200 x 630px para capa e compartilhamento.', crop: { aspectRatio: 1200 / 630, outputWidth: 1200, outputHeight: 630 } },
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
    { name: 'avatarUrl', label: 'Foto/avatar', type: 'image', imageHint: 'Tamanho recomendado: 512 x 512px, rosto centralizado.', crop: { aspectRatio: 1, outputWidth: 512, outputHeight: 512 } },
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
    { name: 'siteTemplate', label: 'Template visual do site', type: 'select', options: siteTemplates },
    { name: 'seoDescription', label: 'Descrição SEO padrão', type: 'textarea' },
    { name: 'logoUrl', label: 'Logo', type: 'image', imageHint: 'Use PNG/WEBP com fundo transparente. Tamanho recomendado: 600 x 200px para logo horizontal.', crop: { aspectRatio: 3, outputWidth: 600, outputHeight: 200 } },
    { name: 'faviconUrl', label: 'Favicon', type: 'image', imageHint: 'Use PNG ou ICO quadrado. Tamanho recomendado: 64 x 64px.', crop: { aspectRatio: 1, outputWidth: 64, outputHeight: 64, outputType: 'image/png' } },
    { name: 'primaryColor', label: 'Cor principal', type: 'color' },
    { name: 'secondaryColor', label: 'Cor secundária', type: 'color' },
    { name: 'headerBackgroundColor', label: 'Cor de fundo do header', type: 'color' },
    { name: 'headerTextColor', label: 'Cor dos textos do header', type: 'color' },
    { name: 'footerBackgroundColor', label: 'Cor de fundo do footer', type: 'color' },
    { name: 'footerTextColor', label: 'Cor dos textos do footer', type: 'color' },
    { name: 'whatsappFloatColor', label: 'Cor do botao flutuante', type: 'color', defaultValue: '#20c7a5' },
    { name: 'whatsappFloatIconUrl', label: 'Icone do botao flutuante (PNG)', type: 'image', accept: 'image/png,.png', uploadEndpoint: '/api/admin/uploads/png', imageHint: 'Envie obrigatoriamente um PNG quadrado com fundo transparente. Tamanho recomendado: 96 x 96px.', crop: { aspectRatio: 1, outputWidth: 96, outputHeight: 96, outputType: 'image/png' } },
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
      { name: 'institutionalImageUrl', label: 'Imagem institucional', type: 'image', imageHint: 'Tamanho recomendado: 1200 x 800px, com boa margem para cortes responsivos.', crop: { aspectRatio: 1.5, outputWidth: 1200, outputHeight: 800 } },
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
