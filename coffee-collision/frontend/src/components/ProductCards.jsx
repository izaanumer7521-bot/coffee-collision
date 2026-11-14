import { Link } from 'react-router-dom';
import { Reveal } from '../hooks/useReveal.jsx';
import { assetUrl, money } from '../api.js';

const isNew = (p) => Date.now() - new Date(p.createdAt).getTime() < 7 * 86400000;

export default function ProductCards({ products, fresh = new Set() }) {
  if (!products.length) return <p className="page-note">No drinks here yet.</p>;
  return (
    <div className="cards">
      {products.map((p, i) => (
        <Reveal as="article" key={p._id} delay={(i % 3) * 90} className={`card ${fresh.has(p._id) ? 'fresh' : ''}`}>
          <div className="card-img">
            {p.image ? <img src={assetUrl(p.image)} alt={p.name} loading="lazy" /> : <div className="card-img-empty">Evara</div>}
            {(isNew(p) || fresh.has(p._id)) && <span className="badge-new">New</span>}
            {p.category && <span className="badge-cat">{p.category.name}</span>}
          </div>
          <div className="card-body">
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            {p.sizes?.length > 1 && <p className="sizes-line">{p.sizes.map((s) => s.name).join(' · ')}</p>}
            {p.flavours?.length > 0 && (
              <div className="dots" aria-label="Available flavours">
                {p.flavours.filter((f) => f.available !== false).slice(0, 6).map((f) => (
                  <i key={f._id} title={f.name} style={{ background: f.color }} />
                ))}
              </div>
            )}
            <div className="card-foot">
              <span className="price">{p.sizes?.length > 1 ? 'From ' : ''}{money(p.price)}</span>
              <Link to={`/create?drink=${p.slug}`}>Create your cup →</Link>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
