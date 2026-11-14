// Same rule as the server: a drink's own sizes, or Small / Medium / Large from its base price.
export function sizeOptions(p) {
  if (p.sizes && p.sizes.length) return p.sizes;
  const b = Number(p.price) || 0;
  return [
    { name: 'Small', price: b },
    { name: 'Medium', price: +(b + 0.5).toFixed(2) },
    { name: 'Large', price: +(b + 1).toFixed(2) },
  ];
}
