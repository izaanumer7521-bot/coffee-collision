import { Link } from 'react-router-dom';

export default function ProductCards({ products }) {
  if (!products.length) return <p className="page-note">No drinks found.</p>;
  return (
    <div className="cards">
      {products.map((p) => (
        <article className="card" key={p._id}>
          <img src={p.image} alt={p.name} loading="lazy" />
          <div className="card-body">
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <div className="card-foot">
              <span className="price">${p.price.toFixed(2)}</span>
              <Link to={`/create?drink=${p.slug}`}>Create your cup →</Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
