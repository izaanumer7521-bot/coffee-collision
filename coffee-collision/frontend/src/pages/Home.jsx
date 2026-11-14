import { useCallback, useEffect, useRef, useState } from 'react';
import Hero from '../components/Hero.jsx';
import ProductCards from '../components/ProductCards.jsx';
import CategoryChips from '../components/CategoryChips.jsx';
import { Link } from 'react-router-dom';
import { Reveal } from '../hooks/useReveal.jsx';
import { useLang } from '../i18n/LangContext.jsx';
import { api, money } from '../api.js';

const STEPS = [['01', 'step1'], ['02', 'step2'], ['03', 'step3']];
const HOME_LIMIT = 6;   // the home page shows a taste of the menu; the Menu page has everything

export default function Home() {
  const { t, tr } = useLang();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cat, setCat] = useState('all');
  const [error, setError] = useState('');
  const [fresh, setFresh] = useState(() => new Set());
  const known = useRef(null);

  const load = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([api('/products'), api('/categories')]);
      if (known.current) {
        // drinks the admin added while this page was open slide in with a highlight
        const added = p.filter((x) => !known.current.has(x._id)).map((x) => x._id);
        if (added.length) setFresh((prev) => new Set([...prev, ...added]));
      }
      known.current = new Set(p.map((x) => x._id));
      setProducts(p); setCategories(c); setError('');
    } catch (e) { if (!known.current) setError(e.message); }
  }, []);

  useEffect(() => {
    load();
    const tick = setInterval(() => { if (!document.hidden) load(); }, 30000);
    const onVis = () => { if (!document.hidden) load(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(tick); document.removeEventListener('visibilitychange', onVis); };
  }, [load]);

  const inCat = cat === 'all' ? products : products.filter((p) => p.category?.slug === cat);
  const shown = cat === 'all' ? inCat.slice(0, HOME_LIMIT) : inCat;

  return (
    <>
      <Hero />

      <div className="marquee" aria-hidden="true">
        <div>
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k}>{t('marquee').map((m) => <i key={m}>{m} <b>✦</b> </i>)}</span>
          ))}
        </div>
      </div>

      <section className="pick">
        <Reveal><h2>{t('pickTitle')}</h2></Reveal>
        {error ? <p className="form-error">{error}</p> : (
          <>
            <Reveal delay={80}><CategoryChips categories={categories} products={products} value={cat} onChange={setCat} /></Reveal>
            <ProductCards key={cat} products={shown} fresh={fresh} />
            {cat === 'all' && inCat.length > HOME_LIMIT && (
              <Reveal className="see-all"><Link className="btn dark" to="/menu">{t('seeFullMenu')}</Link></Reveal>
            )}
          </>
        )}
      </section>

      <section className="steps">
        {STEPS.map(([n, key], i) => (
          <Reveal key={n} delay={i * 110} className="step">
            <span>{n}</span>
            <h3>{t(key)}</h3>
            <p>{t(`${key}Text`)}</p>
          </Reveal>
        ))}
      </section>
    </>
  );
}
