import { useLang } from '../i18n/LangContext.jsx';

export default function CategoryChips({ categories, products, value, onChange }) {
  const { t, tr } = useLang();
  const withItems = categories.filter((c) => products.some((p) => p.category?.slug === c.slug));
  if (!withItems.length) return null;
  return (
    <div className="chips" role="tablist" aria-label={t('categories')}>
      <button className={value === 'all' ? 'on' : ''} onClick={() => onChange('all')}>{t('all')}</button>
      {withItems.map((c) => (
        <button key={c._id} className={value === c.slug ? 'on' : ''} onClick={() => onChange(c.slug)}>{tr(c)}</button>
      ))}
    </div>
  );
}
