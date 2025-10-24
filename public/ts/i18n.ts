const locales: Record<string, Record<string, string>> = {};
let current = 'en';

export const loadLocale = async (locale: string) => {
  if (locales[locale]) return locales[locale];
  try {
    const resp = await fetch(`/static/locales/${locale}.json`);
    if (!resp.ok) throw new Error('Locale not found');
    const data = await resp.json();
    locales[locale] = data;
    return data;
  } catch (e) {
    console.error('loadLocale', e);
    return {};
  }
}

// add DOM translation helper (HTML translation)
export const translateDOM = () => {
  if (typeof document === 'undefined') return;
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key) el.textContent = t(key);
  });
  document.querySelectorAll<HTMLInputElement>('[data-i18n-placeholder]').forEach(inp => {
    const key = inp.getAttribute('data-i18n-placeholder');
    if (key) inp.placeholder = t(key);
  });
}

export const setLocale = async (locale: string) => {
  await loadLocale(locale);
  current = locale;
  localStorage.setItem('locale', locale);
  translateDOM();
}

export const getLocale = () => current;

export const t = (key: string, vars?: Record<string, string|number>) => {
  const str = locales[current]?.[key] ?? locales['en']?.[key] ?? key;
  if (!vars) return str;
  return Object.keys(vars).reduce((s, k) => s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(vars[k])), str);
}

export const initI18n = async () => {
  const stored = localStorage.getItem('locale') || 'en';
  await loadLocale('en');
  await setLocale(stored);
}