import { useEffect, useState } from 'react';
import Hero from '../components/Hero.jsx';
import ProductCards from '../components/ProductCards.jsx';
import { api } from '../api.js';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { api('/products').then(setProducts).catch((e) => setError(e.message)); }, []);
  return (
    <>
      <Hero />
      <section className="pick">
        <h2>Pick your poison</h2>
        {error ? <p className="form-error">{error}</p> : <ProductCards products={products} />}
      </section>
    </>
  );
}
