import {
  Activity,
  Building2,
  Clock3,
  Gamepad2,
  Gauge,
  Headphones,
  Rocket,
  Router,
  ShieldCheck,
  Star,
  Wifi,
  Zap,
  type LucideIcon
} from 'lucide-react';

const icons: Record<string, LucideIcon> = {
  Activity,
  Building2,
  Clock3,
  Gamepad2,
  Gauge,
  Headphones,
  Rocket,
  Router,
  ShieldCheck,
  Star,
  Wifi,
  Zap
};

export const highlightIconOptions = [
  { label: 'Velocidade', value: 'Gauge' },
  { label: 'Segurança', value: 'ShieldCheck' },
  { label: 'Relógio', value: 'Clock3' },
  { label: 'Roteador', value: 'Router' },
  { label: 'Wi-Fi', value: 'Wifi' },
  { label: 'Gamer', value: 'Gamepad2' },
  { label: 'Foguete', value: 'Rocket' },
  { label: 'Atendimento', value: 'Headphones' },
  { label: 'Empresa', value: 'Building2' },
  { label: 'Energia', value: 'Zap' },
  { label: 'Atividade', value: 'Activity' },
  { label: 'Estrela', value: 'Star' }
];

export function getHighlightIcon(icon?: string | null) {
  return icons[icon ?? ''] ?? Gauge;
}
