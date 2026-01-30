import { Truck } from "lucide-react";

export function ShippingBanner() {
  return (
    <div className="bg-black text-white flex justify-center items-center">
      <div className="container mx-auto flex h-10 max-w-7xl items-center justify-center px-4 text-sm sm:px-6 lg:px-8">
        <Truck className="mr-2 h-4 w-4" />
        <p>Envío gratis en compras superiores a $100.000</p>
      </div>
    </div>
  );
}
