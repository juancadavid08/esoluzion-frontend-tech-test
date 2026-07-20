# Front-End Test - ITX Shop

Mini SPA para compra de dispositivos moviles, implementada con React + TypeScript.

## Objetivo de la prueba

Aplicacion con dos vistas:

- PLP (Product List Page): listado de productos con filtro en tiempo real por marca/modelo.
- PDP (Product Detail Page): detalle de producto, seleccion de color y almacenamiento, y accion de anadir al carrito.

## Stack tecnico

- React 18
- TypeScript
- Vite
- React Router DOM
- ESLint
- Vitest + Testing Library
- Playwright (Chromium desktop y móvil)
- Prettier + ESLint
- localStorage para cache y persistencia

## API utilizada

Base URL:

`https://itx-frontend-test.onrender.com/`

Endpoints:

- `GET /api/product`
- `GET /api/product/:id`
- `POST /api/cart`

## Requisitos

- Node.js 20.19+ recomendado
- npm 9+ recomendado

## Instalacion

```bash
git clone https://github.com/juancadavid08/frontend-tech-test.git
cd frontend-tech-test
npm install
```

## Scripts

El proyecto incluye scripts en minuscula y alias en mayuscula para ajustarse al enunciado:

```bash
npm run start
npm run build
npm run test
npm run lint
```

```bash
npm run START
npm run BUILD
npm run TEST
npm run LINT
```

## Flujo recomendado antes de entregar

```bash
npm run lint
npm run test -- --run
npm run build
```

## Funcionalidades implementadas

- SPA con rutas cliente (`/` y `/product/:id`).
- Header con link a home, breadcrumbs y contador de carrito.
- Grid responsive de productos (maximo 4 por fila).
- Filtro por marca/modelo en tiempo real.
- Vista de detalle con informacion principal y tecnica.
- Selectores de color y almacenamiento con seleccion por defecto.
- Boton de anadir que envia `{ id, colorCode, storageCode }`.
- Persistencia del contador de carrito entre vistas y recargas.

## Decisión sobre TypeScript

El PDF original indica una preferencia por JavaScript ES6 sin TypeScript. Las recomendaciones complementarias de esta convocatoria, sin embargo, valoran positivamente TypeScript. Se ha priorizado esta última indicación para aportar contratos explícitos entre dominio, aplicación e infraestructura, detección temprana de errores y mejor mantenibilidad, sin añadir lógica funcional no solicitada.

## Cache en cliente (1 hora)

Se implementa cache en `localStorage` para:

- listado de productos
- detalle por producto

Cada entrada almacena timestamp y datos, con expiracion de 1 hora. Al expirar, se revalida contra API.

## Nota sobre el contador del carrito

Durante las pruebas se ha observado una limitación en el backend externo proporcionado por el ejercicio: el endpoint `POST /api/cart` devuelve `count = 1` de forma constante, aunque se realicen varias operaciones de añadido correctamente.

El frontend trata al backend como fuente de verdad y muestra exactamente el valor `count` de su respuesta. Por tanto, el contador permanece en `1`. No se acumula artificialmente en cliente porque eso podría desincronizar la interfaz respecto al servidor y modificar el significado de su contrato.

La aplicación persiste el último valor confirmado en `localStorage` para conservarlo entre navegación y recargas. En un backend productivo, `count` debería representar el total actual del carrito del usuario.

## Estructura principal

La explicación visual completa, con diagramas de capas, componentes, navegación, caché, carrito y pruebas, está disponible en [docs/architecture.md](docs/architecture.md).

```text
front/
  src/
    domain/                       # Entidades y tipos de negocio
    application/ports/            # Contratos independientes de React/fetch
    infrastructure/http/          # Adaptador de API REST
    infrastructure/storage/       # Adaptador de cache local
    components/
      Loader.tsx
      ProductItem.tsx
      Search.tsx
      Toast.tsx
    pages/
      ProductDetailPage.tsx
      ProductListPage.tsx
    tests/
      App.test.tsx
    api.ts
    App.tsx
    index.css
    main.tsx
  e2e/                             # Flujos completos Playwright
  index.html
  package.json
  tsconfig.json
  vite.config.js
```

## Testing

- 9 tests unitarios/de integración con Vitest.
- 7 escenarios E2E ejecutados en desktop y móvil (14 casos).
- `npm run test:e2e` ejecuta navegación, filtro, estado vacío, errores, PDP, carrito y persistencia.
- CI ejecuta lint, TypeScript, unitarios, build y Playwright.

## Linting

- ESLint configurado para TypeScript/React.

## Verificacion funcional

Entorno de prueba:

- SO: Windows
- Node.js: 20.19+
- npm: 9+

### Caso 1 - Carga de productos (PLP)

Pasos:

1. Ejecutar `npm run start`.
2. Abrir la aplicacion en el navegador.

Resultado esperado:

- Se muestra el listado de productos en grid responsive.

Resultado obtenido:

- OK.

### Caso 2 - Filtro por marca/modelo

Pasos:

1. Escribir texto en el input de busqueda (por ejemplo: `Acer`).

Resultado esperado:

- La lista se filtra en tiempo real por marca/modelo.

Resultado obtenido:

- OK.

### Caso 3 - Navegacion a detalle (PDP)

Pasos:

1. Hacer click en un producto del listado.

Resultado esperado:

- Navega a `/product/:id` y muestra detalle del producto.

Resultado obtenido:

- OK.

### Caso 4 - Selectores de color y almacenamiento

Pasos:

1. En la vista PDP, revisar los selectores de almacenamiento y color.

Resultado esperado:

- Se muestran opciones y queda una seleccion por defecto.

Resultado obtenido:

- OK.

### Caso 5 - Anadir al carrito y persistencia

Pasos:

1. Pulsar `Anadir`.
2. Verificar contador en cabecera.
3. Recargar pagina.

Resultado esperado:

- El contador muestra el valor confirmado por el backend y persiste tras recarga.

Resultado obtenido:

- El flujo finaliza correctamente. Debido a la limitación conocida del backend externo, actualmente el valor confirmado siempre es `1`.

### Caso 6 - Cache cliente (TTL 1 hora)

Pasos:

1. Cargar PLP/PDP al menos una vez.
2. Revisar claves de cache en `localStorage`.

Resultado esperado:

- Datos cacheados con timestamp y expiracion logica de 1 hora.

Resultado obtenido:

- OK.

## Evidencias (imagenes)

Si, se pueden poner imagenes en el README y es recomendable para una prueba tecnica.

Sugerencia de estructura:

```text
front/
  docs/
    images/
      actions.png
      plp.png
      pdp.png
      cart-counter.png
```

Ejemplo en Markdown:

```md
![PLP](docs/images/plp.png)
![PDP](docs/images/pdp.png)
![Cart Counter](docs/images/cart-counter.png)
![GitHub Actions](docs/images/actions.png)
```

Evidencias incluidas:

![PLP](docs/images/plp.png)
![PDP](docs/images/pdp.png)
![Cart Counter](docs/images/cart-counter.png)
![GitHub Actions](docs/images/actions.png)

## Mejoras futuras sugeridas

- Skeletons de carga por card.
- Internacionalización si se incorporan más idiomas.
