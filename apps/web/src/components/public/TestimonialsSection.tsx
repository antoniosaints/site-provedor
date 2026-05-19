import { Star } from 'lucide-react';
import { assetUrl } from '../../lib/api';
import { Card } from '../ui/Card';
import { Logo } from './Logo';

type Testimonial = {
  id: string;
  name: string;
  text: string;
  location?: string | null;
  avatarUrl?: string | null;
  rating?: number | null;
};

export function TestimonialsSection({
  testimonials,
  companyName,
  logoUrl
}: {
  testimonials?: Testimonial[];
  companyName: string;
  logoUrl?: string | null;
}) {
  if (!testimonials?.length) return null;

  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="motion-reveal max-w-2xl">
          <p className="font-bold text-brand-700">Depoimentos</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-brand-900">Clientes que confiam na {companyName}</h2>
        </div>
        <div className="motion-stagger mt-8 grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => {
            const rating = Math.min(Math.max(item.rating ?? 5, 1), 5);
            return (
              <Card key={item.id} className="grid min-h-64 content-between p-6">
                <div>
                  <div className="flex gap-1 text-amber-400">
                    {Array.from({ length: rating }).map((_, index) => <Star key={index} size={18} fill="currentColor" />)}
                  </div>
                  <p className="mt-5 text-base leading-7 text-slate-600">"{item.text}"</p>
                </div>
                <div className="mt-8 flex items-center gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-brand-500 text-white">
                    {item.avatarUrl ? (
                      <img src={assetUrl(item.avatarUrl)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Logo logoUrl={logoUrl} name={companyName} compact />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-950">{item.name}</p>
                    {item.location ? <p className="text-sm text-slate-500">{item.location}</p> : null}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
