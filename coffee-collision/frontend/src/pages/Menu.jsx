import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCards from '../components/ProductCards.jsx';
import { api } from '../api.js';

export default function Menu() {
  const [params] = useSearchParams();
  const q = (params.get('q') || '').toLowerCase();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { api('/products').then(setProducts).catch((e) => setError(e.message)); }, []);
  const shown = products.filter((p) => !q || `${p.name} ${p.description}`.toLowerCase().includes(q));
  return (
    <section className="page light">
      <h1>Menu</h1>
      {q && <p className="page-note">Showing results for “{params.get('q')}”</p>}
      {error ? <p className="form-error">{error}</p> : <ProductCards products={shown} />}
    </section>
  );
}
