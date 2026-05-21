import type { CSSProperties } from 'react';
import { MessageCircle } from 'lucide-react';
import { assetUrl } from '../../lib/api';
import { whatsappLink } from '../../lib/format';
import { hexToRgb, normalizeHex, readableText } from '../../lib/site-theme';

function rgba(color: string, opacity: number) {
  return `rgba(${hexToRgb(color).join(', ')}, ${opacity})`;
}

export function WhatsAppFloat({ phone, message, color, iconUrl }: { phone?: string | null; message?: string | null; color?: string | null; iconUrl?: string | null }) {
  const backgroundColor = normalizeHex(color, '#20c7a5');
  const trimmedIconUrl = String(iconUrl ?? '').trim();
  const style = {
    backgroundColor,
    color: readableText(backgroundColor),
    '--whatsapp-float-shadow': rgba(backgroundColor, 0.28)
  } as CSSProperties;

  return (
    <a
      href={whatsappLink(phone, message)}
      target="_blank"
      rel="noreferrer"
      className="motion-pulse-soft motion-press fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center overflow-hidden rounded-full shadow-soft"
      style={style}
      aria-label="Falar no WhatsApp"
    >
      {trimmedIconUrl ? (
        <img src={assetUrl(trimmedIconUrl)} alt="" className="h-8 w-8 object-contain" />
      ) : (
        <MessageCircle size={26} />
      )}
    </a>
  );
}
