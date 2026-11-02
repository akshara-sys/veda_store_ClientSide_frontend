import { useEffect, useState } from 'react';

export const API = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api/store').replace(/\/$/, '').replace(/\/api$/, '/api/store');
export const CATEGORIES = ['Rudraksha', 'Karungali', 'Pyrite', 'Zodiac', 'Gemstones', 'Rings', 'Vastu', 'Gift Sets'];
const categorySlug = name => String(name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const titleCase = value => String(value || '').replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase());
export const money = paise => `₹${(Number(paise || 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const createToken = () => {
  const cryptoApi = window.crypto;
  if (typeof cryptoApi?.randomUUID === 'function') return cryptoApi.randomUUID();

  const bytes = new Uint8Array(16);
  if (typeof cryptoApi?.getRandomValues === 'function') cryptoApi.getRandomValues(bytes);
  else bytes.forEach((_, index) => { bytes[index] = Math.floor(Math.random() * 256); });
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
export const token = () => { let value = localStorage.getItem('veda-store-token'); if (!value) { value = createToken(); localStorage.setItem('veda-store-token', value); } return value; };
export const asset = url => !url ? '' : /^https?:\/\//i.test(url) ? url : `${API.replace(/\/api\/store$/, '')}${url.startsWith('/') ? url : `/${url}`}`;

export function navigate(to) { window.history.pushState({}, '', to); window.dispatchEvent(new PopStateEvent('popstate')); window.scrollTo(0, 0); }

export async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set('x-store-cart', token());
  const customerSession = localStorage.getItem('veda-customer-session');
  if (customerSession) headers.set('x-store-customer-session', customerSession);
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${API}${path.startsWith('/') ? path : `/${path}`}`, { credentials: 'include', ...options, headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success === false) throw new Error(body.message || 'The store could not complete that request.');
  return body.data;
}

export function useStoreCategories() {
  const [categories, setCategories] = useState(CATEGORIES.map(name => ({ name, slug: categorySlug(name) })));
  useEffect(() => {
    let active = true;
    api('/categories').then(rows => {
      if (active && Array.isArray(rows)) setCategories(rows);
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  return categories;
}

export function cleanHtml(input = '') {
  const source = String(input);
  const withoutUnsafe = source.replace(/<(script|style|iframe|object|embed|form|svg|math)[^>]*>[\s\S]*?<\/\1\s*>/gi, '').replace(/<!--([\s\S]*?)-->/g, '');
  return withoutUnsafe.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (match, rawTag, attrs) => {
    const tag = String(rawTag).toLowerCase(); const closing = /^<\//.test(match);
    if (!['p','br','strong','b','em','i','ul','ol','li','h2','h3','blockquote','a'].includes(tag)) return '';
    if (closing) return tag === 'br' ? '' : `</${tag}>`;
    if (tag !== 'a') return `<${tag}>`;
    const href = String(attrs).match(/href\s*=\s*["']([^"']+)["']/i)?.[1] || '';
    return /^https?:\/\//i.test(href) ? `<a href="${href.replace(/["<>]/g, '')}" rel="noopener noreferrer">` : '<a>';
  });
}

export function formatProductDescription(input = '') {
  const source = String(input);
  if (/<[a-z][\s\S]*>/i.test(source)) return cleanHtml(source);
  return source
    .split(/\n\s*\n/)
    .map(paragraph => `<p>${paragraph.trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</p>`)
    .join('');
}

export function formatStoryContent(input = '') {
  const source = String(input);
  if (/<[a-z][\s\S]*>/i.test(source)) return cleanHtml(source);
  const escape = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const output = [];
  let paragraph = [];
  let points = [];
  let currentPoint = null;
  const flushParagraph = () => { if (paragraph.length) output.push(`<p>${paragraph.map(escape).join('<br>')}</p>`); paragraph = []; };
  const flushPoints = () => { if (points.length) output.push(`<ol>${points.map(point => `<li>${escape(point.title)}${point.description.length ? `<br>${point.description.map(escape).join('<br>')}` : ''}</li>`).join('')}</ol>`); points = []; currentPoint = null; };
  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) { flushParagraph(); flushPoints(); continue; }
    const numbered = trimmed.match(/^\d+[.)]\s*(.+)$/);
    if (numbered) { flushParagraph(); currentPoint = { title: numbered[1], description: [] }; points.push(currentPoint); continue; }
    if (currentPoint) currentPoint.description.push(trimmed);
    else if (points.length) { flushParagraph(); flushPoints(); paragraph.push(trimmed); }
    else paragraph.push(trimmed);
  }
  flushParagraph(); flushPoints();
  return output.join('');
}

export function imageList(value) {
  if (Array.isArray(value)) return value.filter(url => typeof url === 'string' && url.length > 0);
  if (typeof value === 'string') { try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.filter(url => typeof url === 'string' && url.length > 0) : []; } catch { return []; } }
  return [];
}

export function useJsonLd(value) {
  useEffect(() => { const script = document.createElement('script'); script.type = 'application/ld+json'; script.dataset.storeSchema = 'true'; script.text = JSON.stringify(value); document.head.append(script); return () => script.remove(); }, [value]);
}

export function useSeo({ title, description, image, url, schema }) {
  useEffect(() => {
    document.title = title ? `${title} | Veda Sankalpa` : 'Veda Sankalpa | The Sacred Store';
    const values = { description: description || 'Thoughtful jewellery and meaningful objects for everyday rituals.', 'og:title': title || 'Veda Sankalpa', 'og:description': description || 'Shop the Veda Sankalpa collection.', 'og:image': image || '', 'og:url': url || window.location.href };
    Object.entries(values).forEach(([key, content]) => { const property = key.startsWith('og:'); let meta = document.head.querySelector(`meta[${property ? 'property' : 'name'}="${key}"]`); if (!meta) { meta = document.createElement('meta'); meta.setAttribute(property ? 'property' : 'name', key); document.head.append(meta); } meta.content = content; });
    return () => { document.head.querySelectorAll('meta[property^="og:"],meta[name="description"]').forEach(meta => meta.remove()); };
  }, [title, description, image, url]);
  useJsonLd(schema || { '@context': 'https://schema.org', '@type': 'Store', name: 'Veda Sankalpa' });
}
