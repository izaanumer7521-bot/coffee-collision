import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCards from '../components/ProductCards.jsx';
import CategoryChips from '../components/CategoryChips.jsx';
import { api } from '../api.js';

export default function Menu() {
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
  const shown = products
    .filter((p) => cat === 'all' || p.category?.slug === cat)
    .filter((p) => !q || `${p.name} ${p.description}`.toLowerCase().includes(q));
  return (
    <section className="page light">
      <h1>Menu</h1>
      {q && <p className="page-note">Showing results for “{params.get('q')}”</p>}
      {error ? <p className="form-error">{error}</p> : (
        <>
          <CategoryChips categories={categories} products={products} value={cat} onChange={setCat} />
          <ProductCards key={`${cat}-${q}`} products={shown} />
        </>
      )}
    </section>
  );
}
