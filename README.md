# NexoShop – E-commerce con IA Conversacional

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> Plataforma de e-commerce moderna con chatbot inteligente powered by Google Gemini AI y búsqueda semántica con Pinecone Vector Database.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#️-stack-tecnológico)
- [Arquitectura](#-arquitectura)
- [Instalación](#-instalación)
- [Configuración](#️-configuración)
- [Scripts Disponibles](#-scripts-disponibles)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [Base de Datos](#️-base-de-datos)
- [Testing](#-testing)
- [Despliegue](#-despliegue)

---

## ✨ Características

### 🛒 E-commerce Core

- **Catálogo de Productos**: Visualización de productos con imágenes, precios y stock en tiempo real
- **Carrito de Compras**: Gestión completa con persistencia en localStorage
- **Checkout Inteligente**: Formulario validado con React Hook Form + Zod
- **Cálculo Dinámico de Envío**: Basado en código postal con envío gratis a partir de cierto monto
- **Búsqueda de Productos**: Búsqueda en tiempo real con debouncing
- **Navegación por Categorías**: Filtrado rápido por categorías de productos
- **Gestión de Stock**: Control de disponibilidad y límites de cantidad
- **Órdenes**: Sistema completo de creación y visualización de pedidos

### 🤖 Chatbot con IA

- **Asistente Conversacional**: Powered by Google Gemini AI (gemini-2.5-flash)
- **RAG (Retrieval Augmented Generation)**: Búsqueda semántica con Pinecone Vector Database
- **Recomendaciones Inteligentes**: Sugerencias de productos basadas en consultas naturales
- **Contexto Conversacional**: Mantiene el historial de mensajes para respuestas coherentes
- **Tool Calling**: Búsqueda de productos en tiempo real durante la conversación
- **UI Interactiva**: Widget flotante con tarjetas de productos clickeables

### 🎨 UX/UI

- **Diseño Responsivo**: Mobile-first con optimizaciones para tablet y desktop
- **Componentes Accesibles**: Usando Radix UI para máxima accesibilidad
- **Animaciones Suaves**: Transiciones fluidas con Tailwind CSS
- **Dark Mode Ready**: Sistema de color tokens configurado
- **Loading States**: Indicadores visuales para todas las operaciones async
- **Error Handling**: Mensajes de error claros y toasts informativos
- **Optimización de Imágenes**: Next.js Image con lazy loading

### 📦 Features Técnicas

- **TypeScript Strict**: Type safety en todo el proyecto
- **Server Components**: Aprovecha RSC de Next.js 16
- **API Routes**: 8 endpoints RESTful bien estructurados
- **ORM Type-Safe**: Drizzle ORM con PostgreSQL
- **Validación**: Zod schemas para runtime validation
- **Testing Completo**: Unit tests (Vitest) + E2E (Playwright)
- **Code Quality**: ESLint, Prettier, TypeScript compiler
- **CI/CD Ready**: Scripts de build, test y deploy

---

## 🛠️ Stack Tecnológico

### Frontend

- **Framework**: [Next.js 16](https://nextjs.org/) - React framework con App Router
- **UI Library**: [React 19](https://react.dev/) - Biblioteca de componentes
- **Lenguaje**: [TypeScript 5.8](https://www.typescriptlang.org/) - Type safety
- **Estilos**: [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS
- **Componentes UI**: [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Iconos**: [Lucide React](https://lucide.dev/) - Icon library con 1000+ iconos
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Utilidades**: clsx, tailwind-merge, class-variance-authority

### Backend

- **Runtime**: [Node.js](https://nodejs.org/) - JavaScript runtime
- **Database**: [PostgreSQL](https://www.postgresql.org/) - Base de datos relacional
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) - Type-safe ORM
- **API**: Next.js App Router API Routes - Serverless functions
- **Validación**: [Zod](https://zod.dev/) - Schema validation
- **Env Management**: [@t3-oss/env-nextjs](https://env.t3.gg/) - Type-safe env vars

### IA & Machine Learning

- **LLM**: [Google Gemini AI](https://ai.google.dev/) - gemini-2.5-flash
- **Vector Database**: [Pinecone](https://www.pinecone.io/) - Serverless vector DB
- **Embeddings**: Google Generative AI - gemini-embedding-001
- **RAG**: Custom implementation con Pinecone + Gemini

### DevOps & Testing

- **Package Manager**: [pnpm](https://pnpm.io/) - Fast, disk space efficient
- **Testing Framework**: [Vitest](https://vitest.dev/) - Unit testing
- **E2E Testing**: [Playwright](https://playwright.dev/) - Browser automation
- **Mocking**: [MSW](https://mswjs.io/) - API mocking para tests
- **Linting**: [ESLint](https://eslint.org/) + [TypeScript ESLint](https://typescript-eslint.io/)
- **Formatting**: [Prettier](https://prettier.io/) - Code formatter
- **Build Tool**: [Turbopack](https://turbo.build/pack) - Next-gen bundler

---

## 🏗 Arquitectura

### Estructura de Capas

```
┌─────────────────────────────────────────┐
│           UI Layer (React)              │
│  Components | Pages | Context | Hooks   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│        API Layer (Next.js Routes)       │
│   Product | Order | Chat | Search       │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Service Layer (lib/)            │
│   LLM | Embeddings | Pinecone | Utils   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      Database Layer (Drizzle ORM)       │
│   Products | Orders | Shipping Costs    │
└─────────────────────────────────────────┘
```

### Flujo de Datos del Chatbot

```mermaid
graph LR
    A[Usuario] -->|Mensaje| B[ChatWidget]
    B --> C[API /chat]
    C --> D{Necesita búsqueda?}
    D -->|Sí| E[Pinecone Search]
    E --> F[Vector Results]
    F --> G[Gemini AI]
    D -->|No| G
    G --> H[Respuesta]
    H --> B
    B --> A
```

---

## 🚀 Instalación

### Prerequisitos

- **Node.js** >= 20.x
- **pnpm** >= 10.x (recomendado) o npm
- **PostgreSQL** >= 14.x
- **Cuentas de servicios**:
  - [Google AI Studio](https://makersuite.google.com/app/apikey) - API key de Gemini
  - [Pinecone](https://www.pinecone.io/) - API key para vector DB

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/gabrieloporto/nexoshop-ecommerce.git
cd nexoshop-ecommerce
```

### Paso 2: Instalar dependencias

```bash
pnpm install
# o
npm install
```

### Paso 3: Configurar variables de entorno

Copia el archivo de ejemplo y completa los valores:

```bash
cp .env.example .env
```

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nexoshop-ecommerce"

# Google Gemini AI
GOOGLE_GEMINI_API_KEY="tu_api_key_aqui"

# Pinecone Vector Database
PINECONE_API_KEY="tu_pinecone_api_key"
PINECONE_INDEX_NAME="products"
```

### Paso 4: Configurar la base de datos

```bash
# Crear la base de datos en PostgreSQL
createdb nexoshop-ecommerce

# Generar migraciones
pnpm db:generate

# Ejecutar migraciones
pnpm db:push

# (Opcional) Seed de datos de ejemplo
pnpm tsx src/scripts/seed.ts
```

### Paso 5: Sincronizar productos con Pinecone

```bash
# Subir embeddings de productos a Pinecone
pnpm sync:pinecone
```

### Paso 6: Ejecutar en desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## ⚙️ Configuración

### Variables de Entorno

| Variable                | Descripción                   | Ejemplo                          | Obligatoria |
| ----------------------- | ----------------------------- | -------------------------------- | ----------- |
| `DATABASE_URL`          | URL de conexión a PostgreSQL  | `postgresql://user:pass@host/db` | ✅          |
| `GOOGLE_GEMINI_API_KEY` | API key de Google AI Studio   | `AIzaSy...`                      | ✅          |
| `PINECONE_API_KEY`      | API key de Pinecone           | `pcsk_...`                       | ✅          |
| `PINECONE_INDEX_NAME`   | Nombre del índice en Pinecone | `products`                       | ✅          |

### Configuración de Pinecone

El proyecto espera un índice de Pinecone con las siguientes características:

- **Dimensiones**: 3072 (para gemini-embedding-001)
- **Métrica**: cosine
- **Regiones**: us-east-1 (o tu región preferida)

Crear índice:

```bash
# Desde la consola de Pinecone o usando su CLI
pinecone create-index products --dimension 3072 --metric cosine
```

---

## 📜 Scripts Disponibles

### Desarrollo

```bash
pnpm dev          # Inicia dev server con Turbopack
pnpm dev:debug    # Dev server con inspector de Node.js
```

### Build & Deploy

```bash
pnpm build        # Build de producción
pnpm start        # Inicia servidor de producción
pnpm preview      # Build + Start
```

### Database

```bash
pnpm db:generate  # Genera migraciones de Drizzle
pnpm db:push      # Aplica cambios al schema (sin migraciones)
pnpm db:migrate   # Ejecuta migraciones
pnpm db:studio    # Abre Drizzle Studio (DB GUI)
```

### Testing

```bash
pnpm test              # Tests unitarios en watch mode
pnpm test:ui           # Vitest UI dashboard
pnpm test:coverage     # Tests con coverage report
pnpm test:e2e          # Tests E2E con Playwright
pnpm test:e2e:ui       # Playwright UI mode
```

### AI/ML Scripts

```bash
pnpm sync:pinecone     # Sincroniza productos a Pinecone
pnpm test:rag          # Prueba el sistema RAG
```

### Code Quality

```bash
pnpm lint              # ESLint check
pnpm lint:fix          # ESLint fix automático
pnpm typecheck         # TypeScript compiler check
pnpm format:check      # Prettier verification
pnpm format:write      # Prettier fix
pnpm check             # Lint + typecheck
```

---

## 📁 Estructura del Proyecto

```
nexoshop-ecommerce/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API Routes
│   │   │   ├── chat/                 # Chatbot endpoint
│   │   │   ├── orders/               # Órdenes CRUD
│   │   │   ├── products/             # Productos CRUD
│   │   │   ├── search/               # Búsqueda semántica
│   │   │   └── shipping-costs/       # Costos de envío
│   │   ├── components/               # Componentes de React
│   │   │   ├── CartModal.tsx         # Modal del carrito
│   │   │   ├── ChatWidget.tsx        # Widget del chatbot
│   │   │   ├── CheckoutForm.tsx      # Formulario de checkout
│   │   │   ├── Header.tsx            # Header principal
│   │   │   ├── ProductCard.tsx       # Tarjeta de producto
│   │   │   └── ...                   # 14 componentes más
│   │   ├── context/                  # React Context
│   │   │   ├── CartContext.tsx       # Estado global del carrito
│   │   │   └── ChatContext.tsx       # Estado del chat
│   │   ├── hooks/                    # Custom hooks
│   │   │   └── useProductSearch.ts   # Hook de búsqueda
│   │   ├── checkout/                 # Página de checkout
│   │   ├── products/[id]/            # Detalle de producto
│   │   ├── success/                  # Página de éxito
│   │   ├── layout.tsx                # Layout raíz
│   │   └── page.tsx                  # Home page
│   ├── components/                   # UI components (shadcn)
│   │   └── ui/                       # Componentes base
│   ├── lib/                          # Librerías y servicios
│   │   ├── embedding-service.ts      # Servicio de embeddings
│   │   ├── llm-service.ts            # Servicio de Gemini AI
│   │   ├── pinecone-client.ts        # Cliente de Pinecone
│   │   └── utils.ts                  # Utilidades
│   ├── scripts/                      # Scripts de utilidad
│   │   ├── seed.ts                   # Seed de DB
│   │   ├── sync-products-to-pinecone.ts
│   │   └── test-rag.ts               # Test de RAG
│   ├── server/                       # Backend
│   │   └── db/                       # Database
│   │       ├── index.ts              # DB client
│   │       └── schema.ts             # Drizzle schema
│   ├── styles/                       # Estilos globales
│   │   └── globals.css               # CSS global
│   ├── utils/                        # Utilidades compartidas
│   │   └── formatPrice.ts            # Formateador de precios
│   └── env.js                        # Validación de env vars
├── tests/                            # Tests
│   ├── e2e/                          # Tests E2E (Playwright)
│   │   ├── flows/                    # User flows
│   │   └── smoke.spec.ts             # Smoke tests
│   ├── integration/                  # Tests de integración
│   ├── unit/                         # Tests unitarios
│   │   ├── components/               # Tests de componentes
│   │   ├── context/                  # Tests de context
│   │   └── hooks/                    # Tests de hooks
│   ├── mocks/                        # Mocks (MSW)
│   └── setup/                        # Test setup
├── public/                           # Archivos estáticos
├── .env.example                      # Variables de entorno ejemplo
├── .gitignore                        # Git ignore
├── components.json                   # shadcn/ui config
├── drizzle.config.ts                 # Drizzle config
├── eslint.config.js                  # ESLint config
├── next.config.js                    # Next.js config
├── package.json                      # Dependencies
├── playwright.config.ts              # Playwright config
├── postcss.config.js                 # PostCSS config
├── prettier.config.js                # Prettier config
├── README.md                         # Este archivo
├── tsconfig.json                     # TypeScript config
└── vitest.config.ts                  # Vitest config
```

---

## 🔌 API Endpoints

### Products

#### `GET /api/products`

Obtiene todos los productos con stock disponible.

**Response:**

```json
[
  {
    "id": 1,
    "name": "Zapatillas Urbanas",
    "description": "Zapatillas cómodas para uso diario",
    "price": "24999.00",
    "image": "https://...",
    "category": "Calzado",
    "stock": 10
  }
]
```

#### `GET /api/products/[id]`

Obtiene un producto por ID.

**Response:**

```json
{
  "id": 1,
  "name": "Zapatillas Urbanas",
  "description": "...",
  "price": "24999.00",
  "image": "https://...",
  "category": "Calzado",
  "stock": 10
}
```

#### `GET /api/products/search?q=zapatillas`

Búsqueda de productos por nombre.

**Query params:**

- `q` (string, required): Término de búsqueda

**Response:**

```json
[
  {
    "id": 1,
    "name": "Zapatillas Urbanas",
    "price": "24999.00",
    ...
  }
]
```

### Orders

#### `POST /api/orders`

Crea una nueva orden.

**Request body:**

```json
{
  "customerEmail": "user@example.com",
  "customerName": "Juan Pérez",
  "customerPhone": "+54 9 11 1234-5678",
  "shippingAddress": "Av. Corrientes 1234",
  "shippingCity": "Buenos Aires",
  "shippingProvince": "Buenos Aires",
  "shippingPostalCode": "1043",
  "shippingMethod": "delivery",
  "shippingPrice": 1500,
  "subtotal": 50000,
  "total": 51500,
  "items": [
    {
      "product": { "id": 1, "name": "...", "price": 25000, "image": "..." },
      "quantity": 2
    }
  ]
}
```

**Response:**

```json
{
  "id": 42,
  "status": "pending",
  "createdAt": "2026-02-04T18:00:00.000Z",
  ...
}
```

#### `GET /api/orders/[id]`

Obtiene una orden por ID.

**Response:**

```json
{
  "id": 42,
  "customerEmail": "user@example.com",
  "customerName": "Juan Pérez",
  "total": 51500,
  "status": "pending",
  "items": [...],
  ...
}
```

### Shipping

#### `GET /api/shipping-costs/[cp]`

Obtiene el costo de envío para un código postal.

**Params:**

- `cp` (string): Código postal

**Response:**

```json
{
  "price": 1500,
  "estimatedDays": 3
}
```

### Chat

#### `POST /api/chat`

Endpoint del chatbot con Gemini AI.

**Request body:**

```json
{
  "message": "Busco zapatillas deportivas",
  "conversationHistory": []
}
```

**Response:** Stream de texto con la respuesta del LLM.

### Semantic Search

#### `POST /api/search/semantic`

Búsqueda semántica con Pinecone.

**Request body:**

```json
{
  "query": "zapatillas cómodas para correr"
}
```

**Response:**

```json
{
  "results": [
    {
      "id": "1",
      "name": "Zapatillas Running Pro",
      "description": "...",
      "price": 35000,
      "category": "Calzado",
      "score": 0.89
    }
  ]
}
```

---

## 🗄️ Base de Datos

### Schema

#### `products`

| Campo       | Tipo          | Constraints          |
| ----------- | ------------- | -------------------- |
| id          | serial        | PRIMARY KEY          |
| name        | text          | NOT NULL             |
| description | text          | nullable             |
| price       | numeric(10,2) | NOT NULL             |
| image       | text          | nullable             |
| category    | text          | NOT NULL             |
| stock       | integer       | NOT NULL, DEFAULT 10 |

#### `shipping_costs`

| Campo       | Tipo          | Constraints |
| ----------- | ------------- | ----------- |
| postal_code | text          | PRIMARY KEY |
| price       | numeric(10,2) | NOT NULL    |

#### `orders`

| Campo                | Tipo          | Constraints                 |
| -------------------- | ------------- | --------------------------- |
| id                   | serial        | PRIMARY KEY                 |
| customer_email       | text          | NOT NULL                    |
| customer_name        | text          | NOT NULL                    |
| customer_phone       | text          | NOT NULL                    |
| shipping_address     | text          | NOT NULL                    |
| shipping_city        | text          | NOT NULL                    |
| shipping_province    | text          | NOT NULL                    |
| shipping_postal_code | text          | nullable                    |
| shipping_method      | text          | NOT NULL                    |
| shipping_price       | numeric(10,2) | NOT NULL                    |
| subtotal             | numeric(10,2) | NOT NULL                    |
| total                | numeric(10,2) | NOT NULL                    |
| status               | text          | NOT NULL, DEFAULT 'pending' |
| created_at           | timestamp     | NOT NULL, DEFAULT NOW()     |
| items                | jsonb         | NOT NULL                    |

### Migraciones

El proyecto usa Drizzle ORM para gestión de schema. Para crear migraciones:

```bash
# 1. Modifica src/server/db/schema.ts
# 2. Genera la migración
pnpm db:generate

# 3. Aplica la migración
pnpm db:push
```

Para explorar la DB visualmente:

```bash
pnpm db:studio
```

---

## 🧪 Testing

### Tests Unitarios (Vitest)

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test -- --watch

# Coverage report
pnpm test:coverage

# UI mode
pnpm test:ui
```

**Coverage actual:**

- **Test Files**: 23 archivos
- **Tests**: 252 pasados
- **Statements**: 76.43% (506/662)
- **Branches**: 64.97% (256/394)
- **Functions**: 73.93% (156/211)
- **Lines**: 76.62% (482/629)

### Tests de Integración (Vitest + MSW)

Los tests de integración verifican la interacción entre componentes y APIs:

```bash
# Run integration tests (incluidos en pnpm test)
pnpm test tests/integration

# Los tests usan MSW para mockear las APIs
```

**Test suites de integración:**

- `shopping-flow.test.tsx`: Flujo completo de compra con APIs mockeadas
  - Fetch de productos desde `/api/products`
  - Obtención de producto individual
  - Creación de órdenes
  - Cálculo de costos de envío
  - Búsqueda semántica

**Características:**

- ✅ MSW (Mock Service Worker) para mockear APIs
- ✅ Verificación de respuestas de API
- ✅ Validación de estructura de datos
- ✅ Manejo de errores (404, validaciones)

### Tests E2E (Playwright)

```bash
# Run E2E tests
pnpm test:e2e

# UI mode (debugging)
pnpm test:e2e:ui

# Specific browser
pnpm test:e2e -- --project=chromium
```

**Test suites:**

- `smoke.spec.ts`: Tests básicos de carga
- `purchase-flow.spec.ts`: Flujo completo de compra
- `search.spec.ts`: Funcionalidad de búsqueda

### Estructura de Tests

```
tests/
├── unit/
│   ├── components/       # 22 archivos de tests
│   ├── context/          # CartContext, ChatContext
│   └── hooks/            # useProductSearch, etc.
├── e2e/
│   ├── flows/            # User flows completos
│   └── smoke.spec.ts     # Smoke tests
├── mocks/
│   ├── handlers.ts       # MSW handlers
│   └── setup.ts          # MSW setup
└── setup/
    └── vitest.setup.ts   # Vitest config global
```

---

## 🚢 Despliegue

### Vercel (Recomendado)

1. **Push a GitHub**

```bash
git push origin main
```

2. **Conecta con Vercel**

   - Ve a [vercel.com](https://vercel.com)
   - Importa el repositorio
   - Configura las variables de entorno

3. **Variables de entorno en Vercel**

```
DATABASE_URL=postgresql://...
GOOGLE_GEMINI_API_KEY=...
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=products
```

4. **Deploy automático**
   - Cada push a `main` despliega automáticamente

### Railway / Render

Similar a Vercel:

1. Conecta el repositorio
2. Configura variables de entorno
3. Deploy

### Docker (Opcional)

```bash
# Build
docker build -t nexoshop-ecommerce .

# Run
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e GOOGLE_GEMINI_API_KEY="..." \
  nexoshop-ecommerce
```

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👨‍💻 Autor

**Gabriel Porto**

- GitHub: [@gabrieloporto](https://github.com/gabrieloporto)
- Email: gabrieloporto@ejemplo.com

---

## 🔧 Herramientas Clave

- [create-t3-app](https://create.t3.gg/) - Scaffolding inicial
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [Google AI](https://ai.google.dev/) - Gemini API
- [Pinecone](https://www.pinecone.io/) - Vector Database
- [Vercel](https://vercel.com/) - Hosting & Deploy

---

## 📚 Recursos Adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Google Gemini API](https://ai.google.dev/docs)
- [Pinecone Documentation](https://docs.pinecone.io/)
- [React Hook Form](https://react-hook-form.com/get-started)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

<p align="center">
  Hecho con ❤️ y ☕ por Gabriel Porto
</p>
