import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { strings } from './strings.js';
import { setMoneyLang } from '../api.js';

const LangContext = createContext(null);
export const useLang = () => useContext(LangContext);

const KEY = 'evara_lang';
const initial = () => {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'ar' || saved === 'en') return saved;
  } catch {}
  return (navigator.language || '').toLowerCase().startsWith('ar') ? 'ar' : 'en';
};

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(initial);
  const { pathname } = useLocation();
  // the admin panel is English only (and left-to-right)
  const effective = pathname.startsWith('/admin') ? 'en' : lang;

  setMoneyLang(effective);
  useEffect(() => {
    const el = document.documentElement;
    el.lang = effective;
    el.dir = effective === 'ar' ? 'rtl' : 'ltr';
    document.title = effective === 'ar' ? 'إيفارا | Evara' : 'Evara';
  }, [effective]);

  const setLang = useCallback((l) => {
    setLangState(l);
    try { localStorage.setItem(KEY, l); } catch {}
  }, []);

  const value = useMemo(() => {
    const dict = strings[effective];
    const t = (k) => dict[k] ?? strings.en[k] ?? k;
    // pick the Arabic version of a field (name -> nameAr) when the site is in Arabic and it exists
    const tr = (obj, field = 'name') => (obj && effective === 'ar' && obj[`${field}Ar`]) || obj?.[field] || '';
    return { lang: effective, isAr: effective === 'ar', setLang, toggle: () => setLang(lang === 'ar' ? 'en' : 'ar'), t, tr };
  }, [effective, lang, setLang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}
