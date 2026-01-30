# NexoShop – Mini Ecommerce Challenge

Este proyecto es una aplicación de ecommerce desarrollada como parte de la **Prueba Técnica NotChatbot**. El objetivo principal es evaluar la experiencia de usuario (UX) y la funcionalidad del checkout, especialmente el cálculo dinámico del costo de envío según el código postal (CP).

---

## 🛒 Descripción General

**NexoShop** es un mini ecommerce donde los usuarios pueden:

- Visualizar productos cargados en una base de datos PostgreSQL.
- Agregar productos al carrito.
- Realizar un checkout con formulario de datos personales y selección de método de envío.
- Ver el costo de envío actualizado dinámicamente según el CP ingresado.
- Obtener envío gratis a partir de un monto mínimo de compra.
- Ver el resumen de la orden al finalizar la compra.

No se incluye integración con medios de pago ni backoffice para la carga de productos (los productos se cargan manualmente en la base de datos).

---

## 🚀 Tecnologías Utilizadas

- **React** – Librería principal para la UI.
- **Next.js** – Framework para React, routing y SSR.
- **ShadcnUI** – Librería de componentes UI accesibles y personalizables.
- **PostgreSQL** – Base de datos relacional (hosteada en Neon).
- **Drizzle ORM** – ORM para TypeScript y PostgreSQL.
- **Vercel** – Hosting y despliegue serverless.
- **pnpm** – Gestor de paquetes rápido y eficiente.
- **Tailwind CSS** – Utilidades CSS para estilos rápidos y consistentes.
- **create-t3-app** – Scaffolding inicial recomendado para proyectos modernos con Next.js.
- **Herramientas de productividad:**
  - Cursor
  - AI Front (v0.dev)

---

## 📦 Estructura del Proyecto

```
.
├── src/
│   ├── app/
│   │   ├── components/        # Componentes UI y de negocio (ProductCard, CartModal, CheckoutForm, etc.)
│   │   ├── context/           # Contexto global para el carrito
│   │   ├── api/               # Rutas API (orders, products, shipping-costs)
│   │   ├── checkout/          # Página de checkout
│   │   ├── success/           # Página de éxito post-compra
│   │   └── page.tsx           # Landing principal
│   ├── server/db/             # Configuración y schema de Drizzle ORM
│   ├── utils/                 # Utilidades (formateo de precios, etc.)
│   └── styles/                # Estilos globales
├── public/                    # Recursos estáticos
├── drizzle.config.ts          # Configuración de Drizzle ORM
├── next.config.js             # Configuración de Next.js
├── package.json
├── README.md
└── ...
```

---

## 🧩 Funcionalidades Principales

### 1. Visualización de Productos

- Los productos se obtienen desde la base de datos PostgreSQL usando Drizzle ORM.
- Se muestran en la landing principal mediante el componente ProductCard.

### 2. Carrito de Compras

- Estado global gestionado con React Context.
- Permite agregar, quitar y modificar cantidades de productos.
- Persistencia en `localStorage` para mantener el carrito entre sesiones.

### 3. Checkout

- Formulario de datos personales y dirección, validado con Zod y React Hook Form.
- Selección de método de envío:
  - **Envío a domicilio:** requiere código postal y calcula el costo dinámicamente.
  - **Retiro en tienda:** sin costo.
- Envío gratis a partir de un monto configurable.
- UX inspirada en tiendas como Shopify y Tiendanube.

### 4. Cálculo Dinámico de Envío

- El costo de envío depende del CP ingresado.
- Se consulta una tabla en la base de datos donde cada CP tiene un costo asociado.
- El usuario puede cambiar el CP y el costo se actualiza en tiempo real.

### 5. Resumen y Confirmación de Orden

- Al finalizar la compra, se muestra un resumen de la orden y los productos adquiridos.
- No hay integración con medios de pago (la orden queda en estado "pendiente").

---

## 🛠️ Instalación y Ejecución Local

1. **Clonar el repositorio:**

   ```sh
   git clone https://github.com/gabrieloporto/notchatbot-ecommerce
   cd notchatbot-ecommerce
   ```

2. **Instalar dependencias:**

   ```sh
   pnpm install
   ```

3. **Configurar variables de entorno:**

   - Copiar `.env.example` a `.env` y completar los valores necesarios (conexión a PostgreSQL, etc).

4. **Migrar la base de datos y cargar productos:**

   - Configurar la conexión en `drizzle.config.ts`.
   - Ejecutar migraciones y cargar productos manualmente en la tabla `products`.

5. **Ejecutar la app en desarrollo:**

   ```sh
   pnpm dev
   ```

6. **Abrir en el navegador:**  
   [http://localhost:3000](http://localhost:3000)

---

## 🌐 Despliegue

- El proyecto está preparado para ser desplegado en Vercel.
- Solo es necesario conectar el repositorio y configurar las variables de entorno en el dashboard de Vercel.

---

## 📋 Consideraciones y Decisiones Técnicas

- **Sin backoffice:** Los productos y costos de envío se cargan directamente en la base de datos.
- **Checkout enfocado en UX:** Validaciones claras, feedback inmediato y navegación sencilla.
- **Persistencia del carrito:** El carrito se guarda en `localStorage` para mejorar la experiencia del usuario.
- **Cálculo de envío:** Basado únicamente en el CP, pero fácilmente extensible para otros factores.
- **Inspiración:** Checkout y UX inspirados en Shopify y Tiendanube.

---

## 📚 Recursos y Créditos

- [ShadcnUI](https://ui.shadcn.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Neon PostgreSQL](https://neon.tech/)
- [create-t3-app](https://create.t3.gg/)
- [Vercel](https://vercel.com/)
- [Cursor](https://www.cursor.com/)
- [v0.dev](https://v0.dev/)

---

¡Gracias por revisar el proyecto! 🚀
