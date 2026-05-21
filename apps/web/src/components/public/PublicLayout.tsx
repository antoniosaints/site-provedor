import { Link, NavLink, Outlet } from 'react-router-dom';
import { Mail, MapPin, Menu, Phone, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { api } from '../../lib/api';
import { whatsappLink } from '../../lib/format';
import { ButtonLink } from '../ui/Button';
import { Logo } from './Logo';
import { WhatsAppFloat } from './WhatsAppFloat';

type SettingsResponse = {
  settings?: any;
  company?: any;
  socialLinks?: any[];
};

const nav = [
  ['/', 'Home'],
  ['/planos', 'Planos'],
  ['/blog', 'Blog'],
  ['/sobre', 'Sobre'],
  ['/contato', 'Contato']
];

function normalizeHex(value: unknown, fallback: string) {
  const color = String(value ?? '').trim();
  if (/^#[0-9a-fA-F]{3}$/.test(color)) {
    return `#${color.slice(1).split('').map((digit) => digit + digit).join('')}`;
  }
  if (/^#[0-9a-fA-F]{6}$/.test(color)) return color;
  return fallback;
}

function hexToRgb(color: string) {
  const hex = normalizeHex(color, '#0877c8').slice(1);
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16)
  ] as const;
}

function readableText(color: string) {
  const [r, g, b] = hexToRgb(color);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? '#102133' : '#ffffff';
}

function alpha(color: string, opacity: number) {
  return `rgb(${hexToRgb(color).join(' ')} / ${opacity})`;
}

export function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { data } = useQuery({
    queryKey: ['public-settings'],
    queryFn: () => api.get<SettingsResponse>('/api/public/settings')
  });
  const settings = data?.settings;
  const company = data?.company;
  const companyName = company?.companyName ?? settings?.siteTitle ?? 'MEGANET';
  const subscriberCenterUrl = String(settings?.subscriberCenterUrl ?? '').trim();
  const careersUrl = String(settings?.careersUrl ?? '').trim();
  const primaryColor = normalizeHex(settings?.primaryColor, '#0877c8');
  const secondaryColor = normalizeHex(settings?.secondaryColor, '#20c7a5');
  const primaryButtonStyle: CSSProperties = {
    backgroundColor: primaryColor,
    color: readableText(primaryColor)
  };
  const secondaryButtonStyle: CSSProperties = {
    backgroundColor: '#ffffff',
    color: primaryColor,
    boxShadow: `inset 0 0 0 1px ${alpha(primaryColor, 0.22)}`
  };
  const headerStyle = {
    backgroundColor: settings?.headerBackgroundColor ?? '#ffffff',
    color: settings?.headerTextColor ?? '#102133'
  };
  const footerStyle = {
    backgroundColor: settings?.footerBackgroundColor ?? '#ffffff',
    color: settings?.footerTextColor ?? '#102133'
  };

  return (
    <div className={`${settings?.animationsEnabled === false ? 'motion-disabled' : 'motion-enabled'} min-h-screen bg-[#f6faff] text-ink`}>
      <header className="sticky top-0 z-40 border-b border-white/15 backdrop-blur" style={headerStyle}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
          <Link to="/" aria-label={`${companyName} home`}>
            <Logo logoUrl={settings?.logoUrl} name={companyName} textColor={settings?.headerTextColor} />
          </Link>
          <nav className="hidden items-center gap-6 xl:flex">
            {nav.map(([to, label]) => (
              <NavLink key={to} to={to} className={({ isActive }) => `text-sm font-bold ${isActive ? 'opacity-100' : 'opacity-75 hover:opacity-100'}`}>
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden flex-wrap items-center justify-end gap-2 xl:flex">
            {subscriberCenterUrl ? <ButtonLink href={subscriberCenterUrl} target="_blank" rel="noreferrer" variant="secondary" className="h-10 px-3" style={secondaryButtonStyle}>Central do assinante</ButtonLink> : null}
            {careersUrl ? <ButtonLink href={careersUrl} target="_blank" rel="noreferrer" variant="secondary" className="h-10 px-3" style={secondaryButtonStyle}>Trabalhe conosco</ButtonLink> : null}
            <ButtonLink href="/planos" variant="secondary" className="h-10 px-3" style={secondaryButtonStyle}>{settings?.ctaPlansText ?? 'Ver planos'}</ButtonLink>
            <ButtonLink href={whatsappLink(company?.whatsapp, settings?.whatsappContractMessage)} target="_blank" rel="noreferrer" style={primaryButtonStyle}>WhatsApp</ButtonLink>
          </div>
          <button className="grid h-10 w-10 place-items-center rounded-lg border border-current/20 xl:hidden" onClick={() => setOpen(!open)} aria-label="Abrir menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {open ? (
          <div className="border-t border-white/15 px-4 py-4 xl:hidden" style={headerStyle}>
            <div className="grid gap-3">
              {nav.map(([to, label]) => <Link key={to} to={to} onClick={() => setOpen(false)} className="font-bold opacity-85">{label}</Link>)}
              {subscriberCenterUrl ? <ButtonLink href={subscriberCenterUrl} target="_blank" rel="noreferrer" variant="secondary" style={secondaryButtonStyle}>Central do assinante</ButtonLink> : null}
              {careersUrl ? <ButtonLink href={careersUrl} target="_blank" rel="noreferrer" variant="secondary" style={secondaryButtonStyle}>Trabalhe conosco</ButtonLink> : null}
              <ButtonLink href={whatsappLink(company?.whatsapp, settings?.whatsappContractMessage)} target="_blank" rel="noreferrer" style={primaryButtonStyle}>Falar no WhatsApp</ButtonLink>
            </div>
          </div>
        ) : null}
      </header>

      <Outlet />

      <footer className="border-t border-slate-200" style={footerStyle}>
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_1fr] lg:px-8">
          <div>
            <Logo logoUrl={settings?.logoUrl} name={companyName} textColor={settings?.footerTextColor} />
            <p className="mt-4 max-w-md text-sm leading-6 opacity-75">{company?.shortDescription}</p>
          </div>
          <div>
            <h3 className="font-display font-bold">Links rapidos</h3>
            <div className="mt-4 grid gap-2 text-sm font-semibold opacity-75">
              {nav.map(([to, label]) => <Link key={to} to={to} className="hover:opacity-100">{label}</Link>)}
              <Link to="/cobertura" className="hover:opacity-100">Consultar cobertura</Link>
              {subscriberCenterUrl ? <a href={subscriberCenterUrl} target="_blank" rel="noreferrer" className="hover:opacity-100">Central do assinante</a> : null}
              {careersUrl ? <a href={careersUrl} target="_blank" rel="noreferrer" className="hover:opacity-100">Trabalhe conosco</a> : null}
            </div>
          </div>
          <div>
            <h3 className="font-display font-bold">Atendimento</h3>
            <div className="mt-4 grid gap-3 text-sm opacity-75">
              {company?.phone ? <span className="flex gap-2"><Phone size={17} /> {company.phone}</span> : null}
              {company?.email ? <span className="flex gap-2"><Mail size={17} /> {company.email}</span> : null}
              {company?.address ? <span className="flex gap-2"><MapPin size={17} /> {company.address}</span> : null}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {data?.socialLinks?.map((link) => <a key={link.id} className="rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: alpha(secondaryColor, 0.14), color: secondaryColor }} href={link.url} target="_blank" rel="noreferrer">{link.name}</a>)}
            </div>
          </div>
        </div>
        <div className="border-t border-current/10 px-4 py-5 text-center text-xs font-semibold opacity-70">
          © {new Date().getFullYear()} {companyName}. Todos os direitos reservados. {company?.cnpj ? `CNPJ ${company.cnpj}` : ''}
        </div>
      </footer>
      <WhatsAppFloat phone={company?.whatsapp} message={settings?.whatsappSupportMessage} color={settings?.whatsappFloatColor} iconUrl={settings?.whatsappFloatIconUrl} />
    </div>
  );
}
