import { useState } from 'react';
import { api, assetUrl } from '../../lib/api';
import { Button } from '../ui/Button';
import { FieldWrap, Input, Select, Textarea } from '../ui/Field';
import { RichTextEditor } from '../ui/RichTextEditor';

export type FieldConfig = {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'textarea' | 'select' | 'multi-select' | 'boolean' | 'image' | 'array' | 'richtext' | 'color' | 'password';
  options?: { label: string; value: string }[];
  required?: boolean;
};

function parseListValue(value: any) {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value.split('\n').map((item) => item.trim()).filter(Boolean);
  }
}

function normalizeValue(value: any, field: FieldConfig) {
  if (field.type === 'number') return value === '' || value === undefined ? null : Number(value);
  if (field.type === 'boolean') return Boolean(value);
  if (field.type === 'array') {
    if (Array.isArray(value)) return value;
    return String(value ?? '').split('\n').map((item) => item.trim()).filter(Boolean);
  }
  if (field.type === 'multi-select') return parseListValue(value);
  return value ?? '';
}

export function AdminForm({ fields, initial, onSubmit, onCancel }: { fields: FieldConfig[]; initial?: any; onSubmit: (values: any) => Promise<void>; onCancel: () => void }) {
  const [values, setValues] = useState<Record<string, any>>(() => {
    const seed: Record<string, any> = {};
    fields.forEach((field) => {
      const current = initial?.[field.name];
      if (field.type === 'array' && Array.isArray(current)) {
        seed[field.name] = current.join('\n');
      } else if (field.type === 'array' && typeof current === 'string') {
        try {
          const parsed = JSON.parse(current);
          seed[field.name] = Array.isArray(parsed) ? parsed.join('\n') : current;
        } catch {
          seed[field.name] = current;
        }
      } else if (field.type === 'multi-select') {
        seed[field.name] = parseListValue(current);
      } else {
        seed[field.name] = current ?? (field.type === 'boolean' ? false : '');
      }
    });
    return seed;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function upload(field: FieldConfig, file: File) {
    const formData = new FormData();
    formData.append('image', file);
    const result = await api.post<{ url: string }>('/api/admin/uploads/image', formData);
    setValues((current) => ({ ...current, [field.name]: result.url }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = Object.fromEntries(fields.map((field) => [field.name, normalizeValue(values[field.name], field)]));
      await onSubmit(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5" onSubmit={submit}>
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => {
          if (field.type === 'textarea' || field.type === 'array' || field.type === 'richtext') {
            return (
              <div className="md:col-span-2" key={field.name}>
                <FieldWrap label={field.label}>
                  {field.type === 'richtext'
                    ? <RichTextEditor value={values[field.name] ?? ''} onChange={(value) => setValues((current) => ({ ...current, [field.name]: value }))} />
                    : <Textarea required={field.required} value={values[field.name] ?? ''} onChange={(e) => setValues((current) => ({ ...current, [field.name]: e.target.value }))} />}
                </FieldWrap>
              </div>
            );
          }
          if (field.type === 'select') {
            return (
              <FieldWrap key={field.name} label={field.label}>
                <Select value={values[field.name] ?? ''} onChange={(e) => setValues((current) => ({ ...current, [field.name]: e.target.value }))}>
                  <option value="">Selecione</option>
                  {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </Select>
              </FieldWrap>
            );
          }
          if (field.type === 'multi-select') {
            const selected = parseListValue(values[field.name]);
            return (
              <div className="md:col-span-2" key={field.name}>
                <FieldWrap label={field.label}>
                  <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
                    {field.options?.length ? field.options.map((option) => (
                      <label key={option.value} className="flex items-center gap-3 rounded-lg bg-white px-3 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-100">
                        <input
                          type="checkbox"
                          checked={selected.includes(option.value)}
                          onChange={(event) => setValues((current) => {
                            const next = event.target.checked
                              ? [...selected, option.value]
                              : selected.filter((value) => value !== option.value);
                            return { ...current, [field.name]: next };
                          })}
                        />
                        {option.label}
                      </label>
                    )) : <p className="text-sm font-semibold text-slate-500">Nenhuma opção cadastrada.</p>}
                  </div>
                </FieldWrap>
              </div>
            );
          }
          if (field.type === 'boolean') {
            return (
              <label key={field.name} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-700">
                <input type="checkbox" checked={Boolean(values[field.name])} onChange={(e) => setValues((current) => ({ ...current, [field.name]: e.target.checked }))} />
                {field.label}
              </label>
            );
          }
          if (field.type === 'image') {
            return (
              <FieldWrap key={field.name} label={field.label}>
                <div className="grid gap-2">
                  <Input value={values[field.name] ?? ''} onChange={(e) => setValues((current) => ({ ...current, [field.name]: e.target.value }))} />
                  <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] ? upload(field, e.target.files[0]) : undefined} />
                  {values[field.name] ? <img src={assetUrl(values[field.name])} alt="" className="h-20 w-32 rounded-lg object-cover" /> : null}
                </div>
              </FieldWrap>
            );
          }
          return (
            <FieldWrap key={field.name} label={field.label}>
              <Input type={field.type === 'number' ? 'number' : field.type === 'color' ? 'color' : field.type === 'password' ? 'password' : 'text'} required={field.required} value={values[field.name] ?? ''} onChange={(e) => setValues((current) => ({ ...current, [field.name]: e.target.value }))} />
            </FieldWrap>
          );
        })}
      </div>
      {error ? <p className="rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  );
}
