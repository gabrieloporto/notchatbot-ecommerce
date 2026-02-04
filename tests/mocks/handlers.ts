import { http, HttpResponse } from 'msw';

// Mock product data
const mockProducts = [
  {
    id: 1,
    name: 'Zapatillas Running Pro',
    description: 'Zapatillas de alto rendimiento para correr',
    price: 15000,
    stock: 10,
    category: 'Calzado',
    image: '/images/product-1.jpg',
  },
  {
    id: 2,
    name: 'Remera Deportiva',
    description: 'Remera transpirable para entrenamientos',
    price: 5000,
    stock: 20,
    category: 'Indumentaria',
    image: '/images/product-2.jpg',
  },
  {
    id: 3,
    name: 'Medias de Compresión',
    description: 'Medias de compresión para mejor circulación',
    price: 3000,
    stock: 15,
    category: 'Accesorios',
    image: '/images/product-3.jpg',
  },
];

export const handlers = [
  // Get all products
  http.get('/api/products', ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');

    if (category) {
      const filtered = mockProducts.filter(p => p.category === category);
      return HttpResponse.json(filtered);
    }

    return HttpResponse.json(mockProducts);
  }),

  // Get product by ID
  http.get('/api/products/:id', ({ params }) => {
    const id = parseInt(params.id as string);
    const product = mockProducts.find(p => p.id === id);

    if (!product) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(product);
  }),

  // Create order
  http.post('/api/orders', async ({ request }) => {
    const body = await request.json() as {
      email: string;
      firstName: string;
      lastName: string;
      phone: string;
      address: string;
      city: string;
      province: string;
      postalCode?: string;
      shippingMethod: string;
      shippingPrice: number;
      subtotal: number;
      total: number;
      items: Array<{
        product: {
          id: number;
          name: string;
          price: number;
          image: string;
        };
        quantity: number;
      }>;
    };

    const order = {
      id: 12345,
      customerEmail: body.email,
      customerName: `${body.firstName} ${body.lastName}`,
      customerPhone: body.phone,
      shippingAddress: body.address,
      shippingCity: body.city,
      shippingProvince: body.province,
      shippingPostalCode: body.postalCode,
      shippingMethod: body.shippingMethod,
      shippingPrice: body.shippingPrice,
      subtotal: body.subtotal,
      total: body.total,
      status: 'pending',
      createdAt: new Date().toISOString(),
      items: body.items,
    };

    return HttpResponse.json(order);
  }),

  // Get shipping costs by postal code
  http.get('/api/shipping-costs/:cp', ({ params }) => {
    const cp = params.cp as string;
    
    // Simple mock logic based on postal code
    const postalCode = parseInt(cp);
    
    if (postalCode < 1001 || postalCode > 9431) {
      return new HttpResponse(null, { status: 404 });
    }

    // Mock shipping prices based on ranges
    let price = 2000; // Default shipping
    
    if (postalCode >= 1000 && postalCode < 2000) {
      price = 1500; // CABA - cheaper
    } else if (postalCode >= 8000) {
      price = 3500; // Far provinces - more expensive
    }

    return HttpResponse.json({ price });
  }),

  // Search products
  http.get('/api/search/semantic', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q')?.toLowerCase() || '';

    const results = mockProducts.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );

    return HttpResponse.json(results);
  }),
];
