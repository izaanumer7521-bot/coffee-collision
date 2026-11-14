// Turns typed menu text into categories > products (sizes, prices, flavours).
//
//   # Hot                                   <- category
//   flavours: Caramel +0.5, Vanilla          <- default flavours for this category (optional)
//   sizes: Small, Medium +0.5, Large +1      <- default sizes as add-ons to a single price (optional)
//   Espresso | 3.5 | Black with crema        <- name | price | description
//   Latte | Small 4, Large 5 | flavours: Hazelnut +0.5, Mocha +0.75 | desc: Smooth and milky
//   Americano - 3                            <- "name - price" also works
const PRICE_ONLY = /^\$?\s*\d+(\.\d+)?$/;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const clean = (s) => s.replace(/[:=\-–$\s]+$/, '').trim();

function parseSizes(token) {
  const out = [];
  for (const part of token.split(',')) {
    const m = part.trim().match(/^(.*?)[\s:=\-–$]*\$?\s*(\d+(?:\.\d+)?)$/);
    if (!m || !clean(m[1])) return null;
    out.push({ name: cap(clean(m[1])), price: Number(m[2]) });
  }
  return out.length ? out : null;
}
function parseAddOns(token) {
  return token.split(',').map((p) => p.trim()).filter(Boolean).map((p) => {
    const m = p.match(/^(.*?)\s*\(?\+\s*\$?(\d+(?:\.\d+)?)\)?$/);
    return m && clean(m[1]) ? { name: cap(clean(m[1])), add: Number(m[2]) } : { name: cap(clean(p)), add: 0 };
  });
}
function parseFlavours(token) {
  return token.split(',').map((p) => p.trim()).filter(Boolean).map((p) => {
    const m = p.match(/^(.*?)\s*\(?\+\s*\$?(\d+(?:\.\d+)?)\)?$/);
    return m && clean(m[1]) ? { name: cap(clean(m[1])), extraPrice: Number(m[2]) } : { name: cap(clean(p)), extraPrice: null };
  });
}

function parseMenu(text = '') {
  const categories = [];
  const warnings = [];
  let cat = null;
  const ensureCat = () => cat || (cat = categories[categories.push({ name: '', defaults: {}, products: [] }) - 1]);

  String(text).split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    const n = i + 1;
    if (!line || line.startsWith('//')) return;

    const head = line.match(/^#{1,3}\s*(.+)$/);
    if (head) { cat = { name: cap(head[1].trim()), defaults: {}, products: [] }; categories.push(cat); return; }

    const lab = line.match(/^(flavou?rs?|sizes?)\s*:\s*(.*)$/i);
    if (lab) {
      const c = ensureCat();
      if (/^size/i.test(lab[1])) c.defaults.sizes = parseAddOns(lab[2]);
      else c.defaults.flavours = parseFlavours(lab[2]);
      return;
    }

    const p = { name: '', description: '', price: null, sizes: null, flavours: null, line: n };
    if (line.includes('|')) {
      const [name, ...rest] = line.split('|').map((t) => t.trim());
      p.name = name;
      for (const t of rest) {
        if (!t) continue;
        let m;
        if ((m = t.match(/^flavou?rs?\s*:\s*(.*)$/i))) p.flavours = parseFlavours(m[1]);
        else if ((m = t.match(/^desc(?:ription)?\s*:\s*(.*)$/i))) p.description = m[1];
        else if ((m = t.match(/^sizes?\s*:\s*(.*)$/i))) p.sizes = parseSizes(m[1]);
        else if (PRICE_ONLY.test(t)) p.price = Number(t.replace(/[^0-9.]/g, ''));
        else if (/\d/.test(t) && parseSizes(t)) p.sizes = parseSizes(t);
        else p.description = p.description ? `${p.description} ${t}` : t;
      }
    } else {
      const m = line.match(/^(.*?)[\s\-–:]+\$?(\d+(?:\.\d+)?)$/);
      if (m && m[1].trim()) { p.name = m[1].trim(); p.price = Number(m[2]); } else p.name = line;
    }
    if (!p.name) { warnings.push(`Line ${n}: no drink name, skipped.`); return; }

    const c = ensureCat();
    if (!p.flavours && c.defaults.flavours) p.flavours = c.defaults.flavours;
    if (!p.sizes && p.price !== null && c.defaults.sizes && c.defaults.sizes.length) {
      p.sizes = c.defaults.sizes.map((s) => ({ name: s.name, price: +(p.price + s.add).toFixed(2) }));
    }
    if (p.sizes) p.price = Math.min(...p.sizes.map((s) => s.price));
    if (p.price === null) { warnings.push(`Line ${n}: “${p.name}” has no price, skipped.`); return; }
    if (c.products.some((x) => x.name.toLowerCase() === p.name.toLowerCase())) warnings.push(`Line ${n}: “${p.name}” appears twice in “${c.name || 'no category'}”; the later one is used.`);
    c.products = c.products.filter((x) => x.name.toLowerCase() !== p.name.toLowerCase());
    c.products.push(p);
  });

  const list = categories.filter((c) => c.products.length);
  return {
    categories: list.map(({ name, products }) => ({ name, products })),
    warnings,
    totals: { categories: list.filter((c) => c.name).length, products: list.reduce((a, c) => a + c.products.length, 0) },
  };
}

module.exports = { parseMenu };
