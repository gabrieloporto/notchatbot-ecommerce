import { Truck } from "lucide-react";

export function ShippingBanner() {
  return (
    <div className="bg-black text-white flex justify-center items-center">
      <div className="container flex h-10 items-center justify-center text-sm">
        <Truck className="mr-2 h-4 w-4" />
        <p>Envío gratis en compras superiores a $100.000</p>
      </div>
    </div>
  );
}
