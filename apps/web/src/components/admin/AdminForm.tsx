import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { api, assetUrl } from '../../lib/api';
import { Button } from '../ui/Button';
import { FieldWrap, Input, Select, Textarea } from '../ui/Field';
import { Modal } from '../ui/Modal';
import { RichTextEditor } from '../ui/RichTextEditor';

type ImageCropConfig = {
  aspectRatio?: number;
  outputWidth?: number;
  outputHeight?: number;
  outputType?: 'image/jpeg' | 'image/png' | 'image/webp';
};

export type FieldConfig = {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'textarea' | 'select' | 'multi-select' | 'boolean' | 'image' | 'array' | 'richtext' | 'color' | 'password';
  options?: { label: string; value: string }[];
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  imageHint?: string;
  accept?: string;
  uploadEndpoint?: string;
  defaultValue?: any;
  crop?: ImageCropConfig;
};

type CropEditorState = {
  field: FieldConfig;
  file: File;
  sourceUrl: string;
  imageWidth: number;
  imageHeight: number;
  x: number;
  y: number;
  width: number;
  height: number;
  outputWidth: number;
  outputHeight: number;
  outputType: 'image/jpeg' | 'image/png' | 'image/webp';
  busy?: boolean;
};

const editableImageTypes = ['image/jpeg', 'image/png', 'image/webp'];

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

function defaultValueForField(field: FieldConfig) {
  if (field.defaultValue !== undefined) return field.defaultValue;
  if (field.type === 'boolean') return false;
  if (field.type === 'color') return '#0877c8';
  return '';
}

function normalizeValue(value: any, field: FieldConfig) {
  if (field.type === 'number') return value === '' || value === undefined ? null : Number(value);
  if (field.type === 'boolean') return Boolean(value);
  if (field.type === 'array') {
    if (Array.isArray(value)) return value;
    return String(value ?? '').split('\n').map((item) => item.trim()).filter(Boolean);
  }
  if (field.type === 'multi-select') return parseListValue(value);
  if (field.type === 'color') return value || field.defaultValue || '#0877c8';
  return value ?? '';
}

function placeholderFor(field: FieldConfig) {
  if (field.placeholder) return field.placeholder;
  if (field.type === 'array') return 'Digite um item por linha';
  if (field.type === 'textarea') return `Escreva ${field.label.toLowerCase()}...`;
  if (field.type === 'number') return '0';
  if (field.type === 'image') return 'Cole uma URL ou envie uma imagem';
  if (field.type === 'password') return 'Digite uma senha segura';
  if (field.name.toLowerCase().includes('email')) return 'contato@empresa.com.br';
  if (field.name.toLowerCase().includes('phone') || field.name.toLowerCase().includes('whatsapp')) return '(00) 00000-0000';
  if (field.name.toLowerCase().includes('url') || field.name.toLowerCase().includes('link')) return 'https://...';
  return `Informe ${field.label.toLowerCase()}`;
}

function imageHintFor(field: FieldConfig) {
  return field.imageHint ?? 'Use JPG, PNG ou WEBP otimizados. Voce pode cortar e redimensionar antes de enviar.';
}

function acceptsPngOnly(field: FieldConfig) {
  const accept = field.accept ?? '';
  return accept.includes('image/png') || accept.includes('.png');
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}

function normalizeCropState(state: CropEditorState, changed?: 'width' | 'height' | 'outputWidth' | 'outputHeight') {
  const aspectRatio = state.field.crop?.aspectRatio;
  let width = clamp(Math.round(state.width), 1, state.imageWidth);
  let height = clamp(Math.round(state.height), 1, state.imageHeight);

  if (aspectRatio) {
    if (changed === 'height') {
      width = Math.round(height * aspectRatio);
    } else {
      height = Math.round(width / aspectRatio);
    }

    if (width > state.imageWidth) {
      width = state.imageWidth;
      height = Math.round(width / aspectRatio);
    }

    if (height > state.imageHeight) {
      height = state.imageHeight;
      width = Math.round(height * aspectRatio);
    }
  }

  width = clamp(width, 1, state.imageWidth);
  height = clamp(height, 1, state.imageHeight);

  const x = clamp(Math.round(state.x), 0, Math.max(0, state.imageWidth - width));
  const y = clamp(Math.round(state.y), 0, Math.max(0, state.imageHeight - height));
  let outputWidth = clamp(Math.round(state.outputWidth), 16, 4000);
  let outputHeight = clamp(Math.round(state.outputHeight), 16, 4000);

  if (aspectRatio) {
    if (changed === 'outputHeight') {
      outputWidth = Math.round(outputHeight * aspectRatio);
    } else if (changed === 'outputWidth') {
      outputHeight = Math.round(outputWidth / aspectRatio);
    }
  }

  return { ...state, x, y, width, height, outputWidth, outputHeight };
}

function imageFileName(fileName: string, type: CropEditorState['outputType']) {
  const ext = type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg';
  const base = fileName.replace(/\.[^.]+$/, '');
  return `${base || 'imagem'}.${ext}`;
}

function loadImage(sourceUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Nao foi possivel carregar a imagem.'));
    image.src = sourceUrl;
  });
}

function CropPreview({ editor }: { editor: CropEditorState }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const aspectRatio = `${editor.outputWidth} / ${editor.outputHeight}`;

  useEffect(() => {
    let canceled = false;
    loadImage(editor.sourceUrl).then((image) => {
      if (canceled) return;
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');
      if (!canvas || !context) return;
      canvas.width = editor.outputWidth;
      canvas.height = editor.outputHeight;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        image,
        editor.x,
        editor.y,
        editor.width,
        editor.height,
        0,
        0,
        editor.outputWidth,
        editor.outputHeight
      );
    });

    return () => {
      canceled = true;
    };
  }, [editor]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-lg border border-slate-200 bg-slate-100 object-contain"
      style={{ aspectRatio, maxHeight: 280 } as CSSProperties}
    />
  );
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
        seed[field.name] = current ?? defaultValueForField(field);
      }
    });
    return seed;
  });
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState('');
  const [cropEditor, setCropEditor] = useState<CropEditorState | null>(null);
  const [error, setError] = useState('');

  function closeCropEditor() {
    if (cropEditor?.sourceUrl) URL.revokeObjectURL(cropEditor.sourceUrl);
    setCropEditor(null);
  }

  async function upload(field: FieldConfig, file: File) {
    setUploadingField(field.name);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const result = await api.post<{ url: string }>(field.uploadEndpoint ?? '/api/admin/uploads/image', formData);
      setValues((current) => ({ ...current, [field.name]: result.url }));
    } finally {
      setUploadingField('');
    }
  }

  async function openCropEditor(field: FieldConfig, file: File) {
    const sourceUrl = URL.createObjectURL(file);
    try {
      const image = await loadImage(sourceUrl);
      const aspectRatio = field.crop?.aspectRatio;
      let width = image.naturalWidth;
      let height = image.naturalHeight;

      if (aspectRatio) {
        if (width / height > aspectRatio) {
          width = Math.round(height * aspectRatio);
        } else {
          height = Math.round(width / aspectRatio);
        }
      }

      const outputWidth = field.crop?.outputWidth ?? Math.min(width, 1600);
      const outputHeight = field.crop?.outputHeight ?? (aspectRatio ? Math.round(outputWidth / aspectRatio) : Math.min(height, 1200));
      setCropEditor(normalizeCropState({
        field,
        file,
        sourceUrl,
        imageWidth: image.naturalWidth,
        imageHeight: image.naturalHeight,
        x: Math.round((image.naturalWidth - width) / 2),
        y: Math.round((image.naturalHeight - height) / 2),
        width,
        height,
        outputWidth,
        outputHeight,
        outputType: field.crop?.outputType ?? (file.type === 'image/png' ? 'image/png' : file.type === 'image/webp' ? 'image/webp' : 'image/jpeg')
      }));
    } catch (err) {
      URL.revokeObjectURL(sourceUrl);
      throw err;
    }
  }

  async function handleFileSelect(field: FieldConfig, file?: File | null) {
    if (!file) return;
    setError('');
    try {
      if (acceptsPngOnly(field) && file.type !== 'image/png' && !file.name.toLowerCase().endsWith('.png')) {
        throw new Error('Envie um arquivo PNG para este campo.');
      }

      if (!editableImageTypes.includes(file.type)) {
        await upload(field, file);
        return;
      }

      await openCropEditor(field, file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao preparar imagem.');
    }
  }

  async function confirmCrop() {
    if (!cropEditor) return;
    setCropEditor((current) => current ? { ...current, busy: true } : current);
    try {
      const image = await loadImage(cropEditor.sourceUrl);
      const canvas = document.createElement('canvas');
      canvas.width = cropEditor.outputWidth;
      canvas.height = cropEditor.outputHeight;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Nao foi possivel editar a imagem.');
      context.drawImage(
        image,
        cropEditor.x,
        cropEditor.y,
        cropEditor.width,
        cropEditor.height,
        0,
        0,
        cropEditor.outputWidth,
        cropEditor.outputHeight
      );
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => result ? resolve(result) : reject(new Error('Nao foi possivel gerar a imagem.')), cropEditor.outputType, 0.9);
      });
      const editedFile = new File([blob], imageFileName(cropEditor.file.name, cropEditor.outputType), { type: cropEditor.outputType });
      await upload(cropEditor.field, editedFile);
      URL.revokeObjectURL(cropEditor.sourceUrl);
      setCropEditor(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar imagem.');
      setCropEditor((current) => current ? { ...current, busy: false } : current);
    }
  }

  async function uploadOriginalFromEditor() {
    if (!cropEditor) return;
    const editor = cropEditor;
    setCropEditor((current) => current ? { ...current, busy: true } : current);
    try {
      await upload(editor.field, editor.file);
      URL.revokeObjectURL(editor.sourceUrl);
      setCropEditor(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar imagem.');
      setCropEditor((current) => current ? { ...current, busy: false } : current);
    }
  }

  function updateCrop(patch: Partial<CropEditorState>, changed?: 'width' | 'height' | 'outputWidth' | 'outputHeight') {
    setCropEditor((current) => current ? normalizeCropState({ ...current, ...patch }, changed) : current);
  }

  async function submit(event: FormEvent) {
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
    <form className="grid gap-4" onSubmit={submit}>
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => {
          if (field.type === 'textarea' || field.type === 'array' || field.type === 'richtext') {
            return (
              <div className="md:col-span-2" key={field.name}>
                <FieldWrap label={field.label}>
                  {field.helpText ? <p className="text-xs font-semibold text-slate-500">{field.helpText}</p> : null}
                  {field.type === 'richtext'
                    ? <RichTextEditor value={values[field.name] ?? ''} placeholder={placeholderFor(field)} onChange={(value) => setValues((current) => ({ ...current, [field.name]: value }))} />
                    : <Textarea placeholder={placeholderFor(field)} required={field.required} value={values[field.name] ?? ''} onChange={(e) => setValues((current) => ({ ...current, [field.name]: e.target.value }))} />}
                </FieldWrap>
              </div>
            );
          }
          if (field.type === 'select') {
            return (
              <FieldWrap key={field.name} label={field.label}>
                {field.helpText ? <p className="text-xs font-semibold text-slate-500">{field.helpText}</p> : null}
                <Select value={values[field.name] ?? ''} onChange={(e) => setValues((current) => ({ ...current, [field.name]: e.target.value }))}>
                  <option value="">{field.placeholder ?? 'Selecione'}</option>
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
                  {field.helpText ? <p className="text-xs font-semibold text-slate-500">{field.helpText}</p> : null}
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
                    )) : <p className="text-sm font-semibold text-slate-500">Nenhuma opcao cadastrada.</p>}
                  </div>
                </FieldWrap>
              </div>
            );
          }
          if (field.type === 'boolean') {
            return (
              <label key={field.name} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-700">
                <input type="checkbox" checked={Boolean(values[field.name])} onChange={(e) => setValues((current) => ({ ...current, [field.name]: e.target.checked }))} />
                <span>
                  {field.label}
                  {field.helpText ? <small className="mt-1 block text-xs font-semibold text-slate-500">{field.helpText}</small> : null}
                </span>
              </label>
            );
          }
          if (field.type === 'image') {
            return (
              <FieldWrap key={field.name} label={field.label}>
                <div className="grid gap-2">
                  <p className="text-xs font-semibold text-slate-500">{imageHintFor(field)}</p>
                  <Input value={values[field.name] ?? ''} placeholder={placeholderFor(field)} onChange={(e) => setValues((current) => ({ ...current, [field.name]: e.target.value }))} />
                  <input
                    className="text-sm font-semibold text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-bold file:text-brand-700"
                    type="file"
                    accept={field.accept ?? 'image/*'}
                    onChange={(e) => {
                      void handleFileSelect(field, e.target.files?.[0]);
                      e.currentTarget.value = '';
                    }}
                  />
                  {uploadingField === field.name ? <p className="text-xs font-bold text-brand-700">Enviando imagem...</p> : null}
                  {values[field.name] ? <img src={assetUrl(values[field.name])} alt="" className="h-20 w-32 rounded-lg object-cover ring-1 ring-slate-200" /> : null}
                </div>
              </FieldWrap>
            );
          }
          const inputType = field.type === 'number' ? 'number' : field.type === 'color' ? 'color' : field.type === 'password' ? 'password' : 'text';
          return (
            <FieldWrap key={field.name} label={field.label}>
              {field.helpText ? <p className="text-xs font-semibold text-slate-500">{field.helpText}</p> : null}
              <Input
                type={inputType}
                required={field.required}
                placeholder={inputType === 'color' ? undefined : placeholderFor(field)}
                value={field.type === 'color' ? (values[field.name] || field.defaultValue || '#0877c8') : values[field.name] ?? ''}
                onChange={(e) => setValues((current) => ({ ...current, [field.name]: e.target.value }))}
              />
            </FieldWrap>
          );
        })}
      </div>
      <Modal open={Boolean(cropEditor)} title="Ajustar imagem antes do upload" description="Corte a area util e defina o tamanho final em pixels." size="xl" onClose={closeCropEditor}>
        {cropEditor ? (
          <div className="grid gap-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <div>
                <img src={cropEditor.sourceUrl} alt="" className="max-h-72 w-full rounded-lg border border-slate-200 bg-white object-contain" />
                <p className="mt-2 text-xs font-semibold text-slate-500">Imagem original: {cropEditor.imageWidth} x {cropEditor.imageHeight}px</p>
              </div>
              <div>
                <CropPreview editor={cropEditor} />
                <p className="mt-2 text-xs font-semibold text-slate-500">Previa final: {cropEditor.outputWidth} x {cropEditor.outputHeight}px</p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-4">
              <FieldWrap label="X"><Input type="number" value={cropEditor.x} onChange={(e) => updateCrop({ x: Number(e.target.value) })} /></FieldWrap>
              <FieldWrap label="Y"><Input type="number" value={cropEditor.y} onChange={(e) => updateCrop({ y: Number(e.target.value) })} /></FieldWrap>
              <FieldWrap label="Largura corte"><Input type="number" value={cropEditor.width} onChange={(e) => updateCrop({ width: Number(e.target.value) }, 'width')} /></FieldWrap>
              <FieldWrap label="Altura corte"><Input type="number" value={cropEditor.height} onChange={(e) => updateCrop({ height: Number(e.target.value) }, 'height')} /></FieldWrap>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <FieldWrap label="Largura final"><Input type="number" value={cropEditor.outputWidth} onChange={(e) => updateCrop({ outputWidth: Number(e.target.value) }, 'outputWidth')} /></FieldWrap>
              <FieldWrap label="Altura final"><Input type="number" value={cropEditor.outputHeight} onChange={(e) => updateCrop({ outputHeight: Number(e.target.value) }, 'outputHeight')} /></FieldWrap>
              <FieldWrap label="Formato">
                <Select value={cropEditor.outputType} onChange={(e) => updateCrop({ outputType: e.target.value as CropEditorState['outputType'] })}>
                  <option value="image/png">PNG</option>
                  {!acceptsPngOnly(cropEditor.field) ? <option value="image/jpeg">JPG</option> : null}
                  {!acceptsPngOnly(cropEditor.field) ? <option value="image/webp">WEBP</option> : null}
                </Select>
              </FieldWrap>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
              <Button type="button" disabled={cropEditor.busy} onClick={confirmCrop}>{cropEditor.busy ? 'Enviando...' : 'Cortar e enviar'}</Button>
              <Button type="button" variant="secondary" disabled={cropEditor.busy} onClick={() => void uploadOriginalFromEditor()}>Enviar original</Button>
            </div>
          </div>
        ) : null}
      </Modal>
      {error ? <p className="rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  );
}
