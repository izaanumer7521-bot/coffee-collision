// A drink either has its own sizes (set in the admin panel / menu import) or falls back to
// Small / Medium / Large derived from its base price (the old behaviour).
const r2 = (n) => +Number(n).toFixed(2);
module.exports = function sizeOptions(product) {
  if (product.sizes && product.sizes.length) return product.sizes.map((s) => ({ name: s.name, price: r2(s.price) }));
  return [
    { name: 'Small', price: r2(product.price) },
    { name: 'Medium', price: r2(product.price + 0.5) },
    { name: 'Large', price: r2(product.price + 1) },
  ];
};
