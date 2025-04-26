export function formatPrice(price: number): string {
  return `$ ${Math.round(price).toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}
