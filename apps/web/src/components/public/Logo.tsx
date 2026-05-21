import { Wifi } from 'lucide-react';
import { assetUrl } from '../../lib/api';

export function Logo({
  logoUrl,
  name = 'MEGANET',
  compact = false,
  textColor
}: {
  logoUrl?: string | null;
  name?: string;
  compact?: boolean;
  textColor?: string;
}) {
  if (logoUrl) {
    return <img src={assetUrl(logoUrl)} alt={name} className={compact ? 'h-9' : 'h-[4.5rem]'} />;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-600 text-white shadow-soft">
        <Wifi size={21} />
      </div>
      <div className={compact ? 'hidden sm:block' : ''}>
        <p className="font-display text-xl font-bold tracking-normal text-brand-900" style={textColor ? { color: textColor } : undefined}>{name}</p>
        <p className="-mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-signal">Fibra optica</p>
      </div>
    </div>
  );
}
