import { useCart } from "@/app/context/CartContext";
import { formatPrice } from "@/utils/formatPrice";

export function OrderSummary() {
  const { items, getTotal, shippingMethod, shippingPrice } = useCart();

  const subtotal = getTotal();
  const isFreeShipping = subtotal >= 100000;
  const total =
    Number(subtotal) +
    (isFreeShipping || shippingMethod === "pickup" ? 0 : Number(shippingPrice));

  return (
    <div className="bg-card rounded-lg border p-6">
      <h2 className="mb-4 text-lg font-semibold">Resumen del pedido</h2>

      {/* Items */}
      <div className="mb-6 space-y-4">
        {items.map((item) => (
          <div
            key={item.product.id}
            className="flex items-center justify-between border-b pb-4"
          >
            <div className="flex items-center gap-4">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="h-16 w-16 rounded-md object-cover"
              />
              <div>
                <h3 className="font-medium">{item.product.name}</h3>
                <p className="text-sm text-gray-500">
                  {item.quantity} x {formatPrice(item.product.price)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Subtotal</span>
          <span className="text-sm">{formatPrice(subtotal)}</span>
        </div>
        {shippingMethod === "delivery" && !isFreeShipping && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Envío</span>
            <span className="text-sm">{formatPrice(shippingPrice)}</span>
          </div>
        )}
        {(isFreeShipping || shippingMethod === "pickup") && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Envío</span>
            <span className="text-sm text-green-600">Gratis</span>
          </div>
        )}
        <div className="flex items-center justify-between border-t pt-2">
          <span className="font-medium">Total</span>
          <span className="text-lg font-semibold">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
