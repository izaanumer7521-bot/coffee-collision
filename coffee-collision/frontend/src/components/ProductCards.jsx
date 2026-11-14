import { Link } from 'react-router-dom';
import { Reveal } from '../hooks/useReveal.jsx';
import { assetUrl, money } from '../api.js';
import { useLang } from '../i18n/LangContext.jsx';

const isNew = (p) => Date.now() - new Date(p.createdAt).getTime() < 7 * 86400000;

export default function ProductCards({ products, fresh = new Set(), hideCategory = false }) {
  const { t, tr } = useLang();
  if (!products.length) return <p className="page-note">{t('noItems')}</p>;
  return (
    <div className="cards">
      {products.map((p, i) => {
        const hasPrice = p.price > 0;
        const multi = p.sizes?.length > 1;
        return (
          // no picture yet -> a compact card (no empty photo box); it grows a photo automatically once one is added
          <Reveal as="article" key={p._id} delay={(i % 3) * 90} className={`card ${p.image ? '' : 'no-img'} ${fresh.has(p._id) ? 'fresh' : ''}`}>
            {p.image && (
              <div className="card-img">
                <img src={assetUrl(p.image)} alt={tr(p)} loading="lazy" />
                {(isNew(p) || fresh.has(p._id)) && <span className="badge-new">{t('new')}</span>}
                {p.category && !hideCategory && <span className="badge-cat">{tr(p.category)}</span>}
              </div>
            )}
            <div className="card-body">
              <h3><Link className="card-link" to={`/menu/${p.slug}`}>{tr(p)}</Link></h3>
              {tr(p, 'description') && <p>{tr(p, 'description')}</p>}
              {multi && <p className="sizes-line">{p.sizes.map((s) => tr(s)).join(' · ')}</p>}
              {p.flavours?.length > 0 && (
                <div className="dots" aria-label={t('availableFlavours')}>
                  {p.flavours.filter((f) => f.available !== false).slice(0, 6).map((f) => (
                    <i key={f._id} title={tr(f)} style={{ background: f.color }} />
                  ))}
                </div>
              )}
              <div className="card-foot">
                <span className="price">{hasPrice ? `${multi ? `${t('from')} ` : ''}${money(p.price)}` : t('priceInStore')}</span>
                <span className="view">{t('view')}</span>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
