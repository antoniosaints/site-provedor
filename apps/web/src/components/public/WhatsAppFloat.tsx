import { MessageCircle } from 'lucide-react';
import { whatsappLink } from '../../lib/format';

export function WhatsAppFloat({ phone, message }: { phone?: string | null; message?: string | null }) {
  return (
    <a
      href={whatsappLink(phone, message)}
      target="_blank"
      rel="noreferrer"
      className="motion-pulse-soft motion-press fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-signal text-white shadow-soft"
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle size={26} />
    </a>
  );
}
