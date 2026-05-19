import { Link, NavLink, Outlet } from 'react-router-dom';
import { Mail, MapPin, Menu, Phone, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
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

export function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { data } = useQuery({
    queryKey: ['public-settings'],
    queryFn: () => api.get<SettingsResponse>('/api/public/settings')
  });
  const settings = data?.settings;
  const company = data?.company;
  const companyName = company?.companyName ?? settings?.siteTitle ?? 'MEGANET';
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
          <nav className="hidden items-center gap-7 lg:flex">
            {nav.map(([to, label]) => (
              <NavLink key={to} to={to} className={({ isActive }) => `text-sm font-bold ${isActive ? 'opacity-100' : 'opacity-75 hover:opacity-100'}`}>
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <ButtonLink href="/planos" variant="secondary">Ver planos</ButtonLink>
            <ButtonLink href={whatsappLink(company?.whatsapp, settings?.whatsappContractMessage)} target="_blank" rel="noreferrer">WhatsApp</ButtonLink>
          </div>
          <button className="grid h-10 w-10 place-items-center rounded-lg border border-current/20 lg:hidden" onClick={() => setOpen(!open)} aria-label="Abrir menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {open ? (
          <div className="border-t border-white/15 px-4 py-4 lg:hidden" style={headerStyle}>
            <div className="grid gap-3">
              {nav.map(([to, label]) => <Link key={to} to={to} onClick={() => setOpen(false)} className="font-bold opacity-85">{label}</Link>)}
              <ButtonLink href={whatsappLink(company?.whatsapp, settings?.whatsappContractMessage)} target="_blank" rel="noreferrer">Falar no WhatsApp</ButtonLink>
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
              {data?.socialLinks?.map((link) => <a key={link.id} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700" href={link.url} target="_blank" rel="noreferrer">{link.name}</a>)}
            </div>
          </div>
        </div>
        <div className="border-t border-current/10 px-4 py-5 text-center text-xs font-semibold opacity-70">
          © {new Date().getFullYear()} {companyName}. Todos os direitos reservados. {company?.cnpj ? `CNPJ ${company.cnpj}` : ''}
        </div>
      </footer>
      <WhatsAppFloat phone={company?.whatsapp} message={settings?.whatsappSupportMessage} />
    </div>
  );
}
