export function formatMoney(cents?: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((cents ?? 0) / 100);
}

export function whatsappLink(phone?: string | null, message?: string | null) {
  const digits = (phone ?? '').replace(/\D/g, '');
  return `https://wa.me/${digits || '5500000000000'}?text=${encodeURIComponent(message ?? 'Olá! Quero falar com a MEGANET.')}`;
}

export function readableDate(date?: string | null) {
  if (!date) return '';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date));
}
