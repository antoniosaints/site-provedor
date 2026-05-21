import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { api, assetUrl } from '../../lib/api';

type SettingsResponse = {
  settings?: {
    faviconUrl?: string | null;
    updatedAt?: string | null;
  };
};

function withVersion(url: string, version?: string | null) {
  if (!version) return url;
  return `${url}${url.includes('?') ? '&' : '?'}v=${encodeURIComponent(version)}`;
}

function faviconType(url: string) {
  const cleanUrl = url.toLowerCase().split('?')[0];
  if (cleanUrl.endsWith('.ico')) return 'image/x-icon';
  if (cleanUrl.endsWith('.svg')) return 'image/svg+xml';
  if (cleanUrl.endsWith('.webp')) return 'image/webp';
  return 'image/png';
}

export function SiteHead() {
  const { data } = useQuery({
    queryKey: ['public-settings'],
    queryFn: () => api.get<SettingsResponse>('/api/public/settings')
  });
  const faviconUrl = String(data?.settings?.faviconUrl ?? '').trim();
  const href = faviconUrl ? withVersion(assetUrl(faviconUrl), data?.settings?.updatedAt) : '';

  return (
    <Helmet>
      {href ? <link rel="icon" type={faviconType(href)} href={href} /> : null}
      {href ? <link rel="shortcut icon" type={faviconType(href)} href={href} /> : null}
      {href ? <link rel="apple-touch-icon" href={href} /> : null}
    </Helmet>
  );
}
