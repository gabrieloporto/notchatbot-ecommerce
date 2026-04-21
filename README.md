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
- [Automatización](#-automatización)
- [Testing](#-testing)
- [Despliegue](#-despliegue)

---

## ✨ Características

### 🛒 E-commerce Core

- **Catálogo de Productos**: Visualización de productos con imágenes, precios y stock en tiempo real
- **Carrito de Compras**: Gestión completa con persistencia en localStorage
- **Checkout Inteligente**: Formulario validado con React Hook Form + Zod
- **Pagos Integrados**: Creación de preferencias y checkout con Mercado Pago
- **Cálculo Dinámico de Envío**: Basado en código postal con envío gratis a partir de cierto monto
- **Búsqueda de Productos**: Búsqueda en tiempo real con debouncing
- **Navegación por Categorías**: Filtrado rápido por categorías de productos
- **Gestión de Stock**: Control de disponibilidad y límites de cantidad
- **Órdenes**: Sistema completo de creación y visualización de pedidos

### 🔐 Autenticación

- **Login Social**: Autenticación con Google usando NextAuth
- **Login con Credenciales**: Acceso con email y contraseña
- **Registro de Usuarios**: Creación de cuenta con validación y hash de contraseñas
- **Sesiones Persistentes**: Manejo de sesión con JWT y callbacks de NextAuth
- **Roles de Usuario**: Soporte para roles persistidos en base de datos

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

### 🤖 Automatización Operativa

- **Order-to-Fulfillment Bot**: Automatiza el post-pago cuando Mercado Pago confirma una orden
- **Validación de Stock**: Verifica disponibilidad real antes de reservar inventario
- **Descuento Automático**: Actualiza stock al aprobarse el pago
- **Gestión de Excepciones**: Marca órdenes como `manual_review` cuando falta stock o hay inconsistencias
- **Auditoría del Bot**: Registra eventos operativos en `automation_events`
- **Notificaciones Operativas**: Envía alertas a Slack vía webhook o a un endpoint demo interno
- **Demo Controlada**: Permite disparar el flujo completo con `simulate-payment` sin depender del webhook real

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
- **Auth**: [NextAuth.js](https://next-auth.js.org/) v5 beta con Google + Credentials
- **Payments**: [Mercado Pago](https://www.mercadopago.com.ar/developers/) - Checkout Pro + Webhooks
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

### Flujo de Automatización de Órdenes

```mermaid
graph TD
    A[Cliente finaliza compra] --> B[POST /api/orders]
    B --> C[Orden creada con status pending]
    C --> D[Mercado Pago Checkout]
    D --> E[Webhook /api/webhooks/mercadopago]
    E --> F[processOrderPaymentAutomation]
    F --> G{Stock suficiente?}
    G -->|Sí| H[Descuenta stock]
    H --> I[Orden ready_for_fulfillment]
    I --> J[Registra automation_events]
    J --> K[Notifica a Slack o endpoint demo]
    G -->|No| L[Orden manual_review]
    L --> M[Registra exception en automation_events]
    M --> K
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
  - [Google Cloud Console](https://console.cloud.google.com/) - OAuth client para login con Google
  - [Mercado Pago Developers](https://www.mercadopago.com.ar/developers/panel/app) - Access Token para pagos
  - [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks) - Webhook opcional para alertas operativas

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

# Auth.js
AUTH_SECRET=""
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""

# MercadoPago
MP_ACCESS_TOKEN=""

# Google Gemini AI
GOOGLE_GENERATIVE_AI_API_KEY="tu_api_key_aqui"

# Pinecone Vector Database
PINECONE_API_KEY="tu_pinecone_api_key"
PINECONE_INDEX_NAME="products"

# Automation
AUTOMATION_WEBHOOK_URL=""
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

| Variable                       | Descripción                         | Ejemplo                          | Obligatoria |
| ------------------------------ | ----------------------------------- | -------------------------------- | ----------- |
| `DATABASE_URL`                 | URL de conexión a PostgreSQL        | `postgresql://user:pass@host/db` | ✅          |
| `AUTH_SECRET`                  | Secreto de NextAuth                 | `random-secret`                  | ⚠️          |
| `AUTH_GOOGLE_ID`               | OAuth Client ID de Google           | `123.apps.googleusercontent...`  | ⚠️          |
| `AUTH_GOOGLE_SECRET`           | OAuth Client Secret                 | `GOCSPX-...`                     | ⚠️          |
| `MP_ACCESS_TOKEN`              | Access token de Mercado Pago        | `APP_USR-...`                    | ⚠️          |
| `GOOGLE_GENERATIVE_AI_API_KEY` | API key de Google AI Studio         | `AIzaSy...`                      | ✅          |
| `PINECONE_API_KEY`             | API key de Pinecone                 | `pcsk_...`                       | ✅          |
| `PINECONE_INDEX_NAME`          | Nombre del índice en Pinecone       | `products`                       | ✅          |
| `AUTOMATION_WEBHOOK_URL`       | Webhook de Slack o endpoint externo | `https://hooks.slack.com/...`    | ❌          |

`⚠️` Algunas variables son opcionales para correr localmente, pero necesarias para habilitar login social o pagos reales.

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

### Automatización

```bash
# Demo controlada del bot (via endpoint)
POST /api/orders/:id/simulate-payment

# Endpoint demo para recibir eventos operativos
GET /api/automation-demo-events
POST /api/automation-demo-events
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
│   │   │   ├── auth/                 # NextAuth + registro de usuarios
│   │   │   ├── automation-demo-events/ # Endpoint demo de notificaciones del bot
│   │   │   ├── chat/                 # Chatbot endpoint
│   │   │   ├── orders/               # Órdenes CRUD
│   │   │   ├── products/             # Productos CRUD
│   │   │   ├── search/               # Búsqueda semántica
│   │   │   ├── shipping-costs/       # Costos de envío
│   │   │   └── webhooks/mercadopago/ # Webhook de pagos de Mercado Pago
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
│   │   ├── automation-notifier.ts    # Notificaciones operativas
│   │   ├── embedding-service.ts      # Servicio de embeddings
│   │   ├── llm-service.ts            # Servicio de Gemini AI
│   │   ├── mercadopago.ts            # Cliente de Mercado Pago
│   │   ├── order-automation.ts       # Motor de automatización post-pago
│   │   ├── order-status.ts           # Etiquetas y estados de órdenes
│   │   ├── pinecone-client.ts        # Cliente de Pinecone
│   │   └── password.ts               # Hash y verificación de contraseñas
│   ├── auth.ts                       # Configuración principal de NextAuth
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

Crea una nueva orden y, si `MP_ACCESS_TOKEN` está configurado, genera una preferencia de Mercado Pago.

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
  "preferenceId": "123456789-abc",
  "init_point": "https://www.mercadopago.com.ar/checkout/...",
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
  "automationEvents": [],
  "automationSummary": {
    "totalEvents": 0,
    "lastEvent": null,
    "automated": false
  },
  "items": [...],
  ...
}
```

#### `POST /api/orders/[id]/simulate-payment`

Dispara el mismo flujo del bot de automatización que usa el webhook real, pero en modo controlado para demos.

**Request body:**

```json
{
  "paymentStatus": "approved",
  "paymentId": "sim-123"
}
```

**Response:**

```json
{
  "outcome": "ready_for_fulfillment",
  "orderId": 42,
  "orderStatus": "ready_for_fulfillment",
  "paymentStatus": "approved",
  "notificationDelivered": true
}
```

### Auth

#### `POST /api/auth/register`

Crea una cuenta con email y contraseña.

#### `GET|POST /api/auth/[...nextauth]`

Endpoints administrados por NextAuth para login, logout, sesión y callbacks OAuth.

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
      "product": {
        "id": 1,
        "name": "Zapatillas Running Pro",
        "description": "...",
        "price": 35000,
        "category": "Calzado",
        "stock": 8,
        "image": "https://..."
      },
      "score": 0.89
    }
  ],
  "query": "zapatillas cómodas para correr",
  "count": 1
}
```

### Payments & Automation

#### `POST /api/webhooks/mercadopago`

Webhook de Mercado Pago. Consulta el pago real, actualiza la orden y dispara el bot de automatización si corresponde.

#### `GET /api/automation-demo-events`

Devuelve los eventos de demo recibidos por el endpoint interno del bot.

#### `POST /api/automation-demo-events`

Recibe notificaciones operativas de prueba cuando no se usa Slack o como respaldo para demos locales.

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
| payment_id           | text          | nullable                    |
| preference_id        | text          | nullable                    |
| payment_status       | text          | nullable                    |
| created_at           | timestamp     | NOT NULL, DEFAULT NOW()     |
| items                | jsonb         | NOT NULL                    |

#### `automation_events`

| Campo      | Tipo      | Constraints             |
| ---------- | --------- | ----------------------- |
| id         | serial    | PRIMARY KEY             |
| order_id   | integer   | FK -> orders.id         |
| event_type | text      | NOT NULL                |
| status     | text      | NOT NULL                |
| message    | text      | NOT NULL                |
| payload    | jsonb     | nullable                |
| created_at | timestamp | NOT NULL, DEFAULT NOW() |

#### `users`

Tabla de usuarios usada por NextAuth y registro propio.

#### `accounts`, `sessions`, `verification_tokens`

Tablas auxiliares de NextAuth para OAuth, sesiones y verificación.

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

## 🤖 Automatización

### Order-to-Fulfillment Bot

La aplicación incluye una automatización orientada a operaciones que corre cuando una orden recibe confirmación de pago.

**Qué hace el bot:**

1. Recibe un evento de pago desde Mercado Pago o desde el endpoint de simulación
2. Busca la orden y valida su estado
3. Verifica stock real de cada ítem
4. Si hay stock:
   - descuenta inventario
   - mueve la orden a `ready_for_fulfillment`
   - registra eventos en `automation_events`
   - envía notificación operativa
5. Si falta stock o hay inconsistencia:
   - mueve la orden a `manual_review`
   - registra la excepción
   - envía alerta operativa

### Estados de orden usados por la automatización

- `pending`
- `paid`
- `ready_for_fulfillment`
- `manual_review`
- `cancelled`

### Formas de ejecutarlo

**Webhook real de Mercado Pago**

- Se activa automáticamente desde `POST /api/webhooks/mercadopago`

**Demo controlada**

- Se activa manualmente con `POST /api/orders/[id]/simulate-payment`
- Ideal para entrevistas, demos y pruebas locales sin depender del proveedor externo

### Diagrama visual del flujo del bot

```mermaid
sequenceDiagram
    participant U as Usuario
    participant S as NexoShop
    participant MP as Mercado Pago
    participant BOT as Order Automation Bot
    participant DB as PostgreSQL
    participant N as Slack / Demo Endpoint

    U->>S: Finaliza compra
    S->>DB: Crea orden pending
    S->>MP: Genera preferencia de pago
    MP-->>S: Webhook payment approved
    S->>BOT: processOrderPaymentAutomation()
    BOT->>DB: Lee orden e items
    BOT->>DB: Valida stock
    alt Stock suficiente
        BOT->>DB: Descuenta stock
        BOT->>DB: Orden ready_for_fulfillment
        BOT->>DB: Inserta automation_events
        BOT->>N: Notifica orden lista
    else Sin stock / error operativo
        BOT->>DB: Orden manual_review
        BOT->>DB: Inserta automation_events
        BOT->>N: Notifica excepción
    end
```

### Casos de uso de demo

- **Demo local controlada**: crear orden y disparar `simulate-payment`
- **Demo con Slack**: configurar `AUTOMATION_WEBHOOK_URL`
- **Demo end-to-end**: exponer la app públicamente y usar el webhook real de Mercado Pago

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
  - Base para pruebas de checkout y automatización

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

### Tests del Bot de Automatización

El proyecto incluye tests unitarios para el flujo de automatización:

- orden aprobada con stock suficiente
- orden aprobada sin stock suficiente
- prevención de doble procesamiento
- trazabilidad y notificaciones del bot

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
AUTH_SECRET=...
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
MP_ACCESS_TOKEN=...
GOOGLE_GENERATIVE_AI_API_KEY=...
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=products
AUTOMATION_WEBHOOK_URL=https://hooks.slack.com/services/...
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
  -e AUTH_SECRET="..." \
  -e MP_ACCESS_TOKEN="..." \
  -e GOOGLE_GENERATIVE_AI_API_KEY="..." \
  -e PINECONE_API_KEY="..." \
  -e PINECONE_INDEX_NAME="products" \
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
