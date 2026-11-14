import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCards from '../components/ProductCards.jsx';
import CategoryChips from '../components/CategoryChips.jsx';
import { api } from '../api.js';
import { useLang } from '../i18n/LangContext.jsx';

export default function Menu() {
  const { t, tr } = useLang();
  const [params] = useSearchParams();
  const q = (params.get('q') || '').toLowerCase();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cat, setCat] = useState('all');
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([api('/products'), api('/categories')])
      .then(([p, c]) => { setProducts(p); setCategories(c); })
      .catch((e) => setError(e.message));
  }, []);

  // search matches both the English and the Arabic text
  const shown = products
    .filter((p) => cat === 'all' || p.category?.slug === cat)
    .filter((p) => !q || `${p.name} ${p.nameAr || ''} ${p.description || ''} ${p.descriptionAr || ''}`.toLowerCase().includes(q));

  // "All" shows the menu in sections, like the printed menu; one category shows just that section
  const sections = [
    ...categories.map((c) => ({ key: c._id, title: tr(c), items: shown.filter((p) => p.category?._id === c._id) })),
    { key: 'none', title: '', items: shown.filter((p) => !p.category) },
  ].filter((s) => s.items.length);

  return (
    <section className="page light">
      <h1>{t('menuTitle')}</h1>
      {q && <p className="page-note">{t('resultsFor')} “{params.get('q')}”</p>}
      {error ? <p className="form-error">{error}</p> : (
        <>
          <CategoryChips categories={categories} products={products} value={cat} onChange={setCat} />
          {shown.length === 0 && products.length > 0 && <p className="page-note">{t('noMatches')}</p>}
          {sections.map((s) => (
            <div className="menu-section" key={`${s.key}-${cat}-${q}`}>
              {s.title && cat === 'all' && <h2 className="menu-section-title">{s.title}</h2>}
              <ProductCards products={s.items} hideCategory />
            </div>
          ))}
        </>
      )}
    </section>
  );
}
