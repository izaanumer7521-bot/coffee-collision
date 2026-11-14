import { useCallback, useEffect, useRef, useState } from 'react';
import Hero from '../components/Hero.jsx';
import ProductCards from '../components/ProductCards.jsx';
import CategoryChips from '../components/CategoryChips.jsx';
import { Reveal } from '../hooks/useReveal.jsx';
import { api, money } from '../api.js';

const STEPS = [
  ['01', 'Pick your drink', 'Choose a classic or something new from the menu.'],
  ['02', 'Create your cup', 'Set the size, milk, sweetness and add a flavour.'],
  ['03', 'We brew it', 'Track your order and find every cup in your Archives.'],
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [flavours, setFlavours] = useState([]);
  const [cat, setCat] = useState('all');
  const [error, setError] = useState('');
  const [fresh, setFresh] = useState(() => new Set());
  const known = useRef(null);

  const load = useCallback(async () => {
    try {
      const [p, c, f] = await Promise.all([api('/products'), api('/categories'), api('/flavours')]);
      if (known.current) {
        // drinks the admin added while this page was open slide in with a highlight
        const added = p.filter((x) => !known.current.has(x._id)).map((x) => x._id);
        if (added.length) setFresh((prev) => new Set([...prev, ...added]));
      }
      known.current = new Set(p.map((x) => x._id));
      setProducts(p); setCategories(c); setFlavours(f); setError('');
    } catch (e) { if (!known.current) setError(e.message); }
  }, []);

  useEffect(() => {
    load();
    const tick = setInterval(() => { if (!document.hidden) load(); }, 30000);
    const onVis = () => { if (!document.hidden) load(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(tick); document.removeEventListener('visibilitychange', onVis); };
  }, [load]);

  const shown = cat === 'all' ? products : products.filter((p) => p.category?.slug === cat);

  return (
    <>
      <Hero />

      <div className="marquee" aria-hidden="true">
        <div>
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k}>Roasted coffee <b>✦</b> Cold milk <b>✦</b> Pure obsession <b>✦</b> Let flavor collide <b>✦</b> </span>
          ))}
        </div>
      </div>

      <section className="pick">
        <Reveal><h2>Pick your poison</h2></Reveal>
        {error ? <p className="form-error">{error}</p> : (
          <>
            <Reveal delay={80}><CategoryChips categories={categories} products={products} value={cat} onChange={setCat} /></Reveal>
            <ProductCards key={cat} products={shown} fresh={fresh} />
          </>
        )}
      </section>

      {flavours.length > 0 && (
        <section className="flavours">
          <Reveal><h2>Make it yours</h2></Reveal>
          <Reveal delay={80}><p className="lead">Add a flavour to any drink when you create your cup.</p></Reveal>
          <div className="flavour-pills">
            {flavours.map((f, i) => (
              <Reveal as="span" key={f._id} delay={i * 70} className="flavour-pill">
                <i style={{ background: f.color }} />{f.name}
                {f.extraPrice > 0 && <small>+{money(f.extraPrice)}</small>}
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section className="steps">
        {STEPS.map(([n, title, text], i) => (
          <Reveal key={n} delay={i * 110} className="step">
            <span>{n}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </Reveal>
        ))}
      </section>
    </>
  );
}
