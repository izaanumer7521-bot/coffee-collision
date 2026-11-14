export default function CategoryChips({ categories, products, value, onChange }) {
  const withItems = categories.filter((c) => products.some((p) => p.category?.slug === c.slug));
  if (!withItems.length) return null;
  return (
    <div className="chips" role="tablist" aria-label="Categories">
      <button className={value === 'all' ? 'on' : ''} onClick={() => onChange('all')}>All</button>
      {withItems.map((c) => (
        <button key={c._id} className={value === c.slug ? 'on' : ''} onClick={() => onChange(c.slug)}>{c.name}</button>
      ))}
    </div>
  );
}
