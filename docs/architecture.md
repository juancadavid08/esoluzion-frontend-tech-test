# Arquitectura y funcionamiento del frontend

Este documento explica visualmente cómo está organizada la SPA, cómo circulan los datos y cómo se separan la presentación, la aplicación, el dominio y la infraestructura.

## 1. Vista general

La interfaz depende de contratos y modelos propios. Los detalles de `fetch` y `localStorage` quedan en infraestructura, fuera de los componentes React.

```mermaid
flowchart LR
    User[Usuario]

    subgraph PRESENTATION[Presentación]
        Router[React Router]
        App[App / Header]
        PLP[ProductListPage]
        PDP[ProductDetailPage]
        Components[ProductItem / Search<br/>Loader / Toast]
    end

    subgraph APPLICATION[Aplicación]
        Repository[[ProductRepository<br/>Puerto de salida]]
        Facade[api.ts<br/>Composición de aplicación]
    end

    subgraph DOMAIN[Dominio]
        Product[Product]
        Selection[CartSelection]
    end

    subgraph INFRASTRUCTURE[Infraestructura]
        Http[HttpProductRepository]
        Cache[LocalCache]
        BrowserStorage[(localStorage)]
        Fetch[fetch]
    end

    External[API externa ITX]

    User --> Router
    Router --> App
    App --> PLP
    App --> PDP
    PLP --> Components
    PDP --> Components
    PLP --> Facade
    PDP --> Facade
    Facade --> Repository
    Repository -. implementado por .-> Http
    Http --> Product
    Http --> Selection
    Http --> Cache
    Cache --> BrowserStorage
    Http --> Fetch
    Fetch --> External
```

### Dirección de dependencias

```text
Presentación → Aplicación → Dominio
                       ↑
              Infraestructura
```

`ProductRepository` define lo que necesita la aplicación. `HttpProductRepository` aporta la implementación concreta usando HTTP y caché local.

## 2. Módulos y responsabilidades

```mermaid
classDiagram
    direction LR

    class Product {
        <<domain>>
        +id
        +brand
        +model
        +price
        +options
    }

    class CartSelection {
        <<domain>>
        +id
        +colorCode
        +storageCode
    }

    class ProductRepository {
        <<output port>>
        +findAll() Promise~Product[]~
        +findById(id) Promise~Product~
        +addToCart(selection) Promise~count~
    }

    class HttpProductRepository {
        <<output adapter>>
        -baseUrl string
        +findAll()
        +findById(id)
        +addToCart(selection)
    }

    class LocalCache {
        <<storage adapter>>
        +readCache(key)
        +writeCache(key, data)
    }

    class App {
        <<presentation>>
        +CartContext
        +Routes
    }

    class ProductListPage {
        <<presentation>>
        +products
        +query
        +loading
        +error
    }

    class ProductDetailPage {
        <<presentation>>
        +product
        +color
        +storage
        +submitting
    }

    ProductRepository <|.. HttpProductRepository : implements
    HttpProductRepository --> Product : maps
    HttpProductRepository --> CartSelection : sends
    HttpProductRepository --> LocalCache : uses
    App --> ProductListPage : routes
    App --> ProductDetailPage : routes
    ProductListPage --> ProductRepository : through api.ts
    ProductDetailPage --> ProductRepository : through api.ts
```

| Capa            | Elemento                | Responsabilidad                                                |
| --------------- | ----------------------- | -------------------------------------------------------------- |
| Dominio         | `Product`               | Definir los datos de producto usados por la aplicación         |
| Dominio         | `CartSelection`         | Definir el comando para añadir una variante al carrito         |
| Aplicación      | `ProductRepository`     | Especificar las operaciones requeridas sin depender de `fetch` |
| Aplicación      | `api.ts`                | Crear el adaptador y exponer operaciones sencillas a la UI     |
| Infraestructura | `HttpProductRepository` | Consumir la API REST y traducir sus respuestas                 |
| Infraestructura | `LocalCache`            | Leer, escribir y expirar datos después de una hora             |
| Presentación    | `App`                   | Definir rutas, cabecera, breadcrumb y contexto del carrito     |
| Presentación    | `ProductListPage`       | Gestionar listado, búsqueda, carga, error y estado vacío       |
| Presentación    | `ProductDetailPage`     | Gestionar detalle, opciones, envío y resultado del carrito     |
| Presentación    | Componentes             | Presentar unidades reutilizables y accesibles                  |

## 3. Flujo de la página de productos — PLP

```mermaid
sequenceDiagram
    autonumber
    actor User as Usuario
    participant PLP as ProductListPage
    participant API as api.ts
    participant Repo as HttpProductRepository
    participant Cache as LocalCache
    participant Backend as API ITX

    User->>PLP: Abre /
    PLP->>API: getProducts()
    API->>Repo: findAll()
    Repo->>Cache: readCache("cache:products")

    alt Caché válida
        Cache-->>Repo: Product[]
    else Sin caché o expirada
        Repo->>Backend: GET /api/product
        Backend-->>Repo: Product[]
        Repo->>Cache: writeCache(products)
    end

    Repo-->>PLP: Product[]
    PLP-->>User: Grid responsive
    User->>PLP: Escribe marca o modelo
    PLP->>PLP: Filtrado en memoria

    alt Hay coincidencias
        PLP-->>User: Productos filtrados
    else No hay coincidencias
        PLP-->>User: Estado "Sin resultados"
    end
```

## 4. Flujo de detalle y carrito — PDP

```mermaid
sequenceDiagram
    autonumber
    actor User as Usuario
    participant PDP as ProductDetailPage
    participant API as api.ts
    participant Repo as HttpProductRepository
    participant Backend as API ITX
    participant Storage as localStorage
    participant Header as CartContext / Header

    User->>PDP: Abre /product/:id
    PDP->>API: getProductById(id)
    API->>Repo: findById(id)
    Repo->>Backend: GET /api/product/:id
    Backend-->>Repo: Product
    Repo-->>PDP: Product
    PDP->>PDP: Seleccionar primeras opciones por defecto
    PDP-->>User: Información, color y almacenamiento

    User->>PDP: Cambia opciones y pulsa Añadir
    PDP->>PDP: Deshabilitar botón
    PDP->>API: addToCart(selection)
    API->>Repo: addToCart(selection)
    Repo->>Backend: POST /api/cart
    Backend-->>Repo: { count }
    Repo-->>API: count confirmado
    API->>Storage: Persistir count
    API-->>PDP: count
    PDP->>Header: setCount(count)
    Header-->>User: Actualizar contador y mostrar toast
```

## 5. Estados de pantalla

```mermaid
stateDiagram-v2
    [*] --> Loading
    Loading --> Content: API correcta
    Loading --> Error: Red, 4xx o 5xx
    Error --> Loading: Reintentar
    Content --> Empty: Filtro sin coincidencias
    Empty --> Content: Limpiar búsqueda

    state Content {
        [*] --> Ready
        Ready --> Submitting: Añadir al carrito
        Submitting --> Ready: Éxito o error
    }
```

Los estados están representados explícitamente:

- `loading`: indicador accesible de carga.
- `error`: mensaje persistente y botón de reintento.
- `empty`: mensaje sin resultados y limpieza del filtro.
- `submitting`: botón deshabilitado mientras se envía el carrito.
- `success`: actualización del contador y notificación mediante `aria-live`.

## 6. Caché de una hora

```mermaid
flowchart TD
    Read[Solicitar producto o listado]
    Stored{¿Existe entrada<br/>en localStorage?}
    Valid{¿timestamp menor<br/>a una hora?}
    Return[Devolver dato cacheado]
    Remove[Eliminar entrada expirada]
    Fetch[Consultar API]
    Save[Guardar timestamp + datos]
    Result[Devolver resultado]

    Read --> Stored
    Stored -->|No| Fetch
    Stored -->|Sí| Valid
    Valid -->|Sí| Return
    Valid -->|No| Remove
    Remove --> Fetch
    Fetch --> Save
    Save --> Result
```

El contador del carrito utiliza otra clave de `localStorage`, pero conserva siempre el último `count` confirmado por el backend.

## 7. Rutas y componentes

```mermaid
flowchart TD
    Root[App]
    Header[Header<br/>Logo + breadcrumb + carrito]
    Routes{React Router}
    List["/ → ProductListPage"]
    Detail["/product/:id → ProductDetailPage"]

    Root --> Header
    Root --> Routes
    Routes --> List
    Routes --> Detail
    List --> Search
    List --> ProductItem
    List --> Loader
    List --> Toast
    Detail --> Loader
    Detail --> Toast
```

## 8. Estrategia de pruebas

```mermaid
flowchart LR
    Unit[Vitest<br/>API, caché y componentes]
    Browser[Playwright desktop<br/>7 escenarios]
    Mobile[Playwright móvil<br/>7 escenarios]
    CI[GitHub Actions]

    Unit --> CI
    Browser --> CI
    Mobile --> CI
    CI --> Checks[Lint + TypeScript<br/>Tests + Build]
```

Los E2E simulan la API mediante rutas de Playwright. Así comprueban el flujo del navegador de forma determinista y no dependen de la disponibilidad del backend externo.

Los escenarios cubren:

1. Carga del listado y breadcrumb.
2. Filtro en tiempo real.
3. Estado sin resultados.
4. Navegación al detalle.
5. Selección y payload del carrito.
6. Estado de error y reintento.
7. Persistencia del contador.

Cada escenario se ejecuta en Chromium de escritorio y en un viewport móvil.
