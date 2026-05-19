import slugify from 'slugify';

export function makeSlug(value: string) {
  return slugify(value, { lower: true, strict: true, locale: 'pt' });
}

export async function uniqueSlug(
  baseText: string,
  exists: (slug: string) => Promise<boolean>,
  currentSlug?: string
) {
  const base = makeSlug(baseText);
  let candidate = base;
  let count = 2;

  while (await exists(candidate)) {
    if (candidate === currentSlug) return candidate;
    candidate = `${base}-${count}`;
    count += 1;
  }

  return candidate;
}
