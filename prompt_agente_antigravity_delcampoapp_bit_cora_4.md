# ROL Y OBJETIVO
Actúa como un Ingeniero de Software Senior Full-Stack. Tu tarea es construir el repositorio completo y 100% funcional del prototipo **DelCampoApp** (correspondiente al entregable técnico de la Bitácora 4 del programa "Programación de Aplicaciones y Servicios para la Nube" del SENA - Centro ASTIN, Ficha 3186266, Autor: Paulo Andrés De los Reyes González).

IMPORTANTE: No dejes código con comentarios tipo `// TODO` ni archivos vacíos. Entrega e implementa todos los archivos del repositorio listos para ejecutarse localmente con un solo comando y con la base de datos embebida dentro del mismo repositorio.

---

# 1. CONTEXTO DEL PROYECTO (DelCampoApp)
**DelCampoApp** es una plataforma web orientada a servicios que conecta directamente a pequeños y medianos productores agrícolas del Valle del Cauca (campesinos) con consumidores urbanos, tiendas de barrio y restaurantes locales en Cali y alrededores, eliminando intermediarios.

Sus 3 pilares diferenciales que DEBEN verse reflejados claramente en el prototipo son:
1. **Panel Campesino de Baja Carga Cognitiva:** Interfaz ultra intuitiva, con botones grandes, iconos claros y lenguaje sencillo para que agricultores con baja alfabetización digital publiquen sus cosechas (nombre, categoría, foto/URL, unidad de medida, precio directo, stock y fecha de cosecha).
2. **Catálogo Digital con Trazabilidad de Origen:** Cada producto muestra quién lo cultivó, en qué finca, en qué vereda/municipio (ej. Tenerife - El Cerrito, Felidia - Cali, Bruselas - Dagua), fecha de recolección y sello de "0% Intermediarios - Pago Justo al Campesino".
3. **Módulo de Pedidos Programados y Puntos Aliados:** El comprador arma su canasta y programa la entrega para las rutas semanales consolidadas (ej. Miércoles o Sábados), eligiendo entre **Domicilio Urbano** o **Retiro en Tienda de Barrio Aliada** (sin costo de envío), mostrando el desglose transparente de cuánto dinero va directo al campesino (93%) y la comisión operativa de la plataforma (7%).

---

# 2. STACK TECNOLÓGICO REQUERIDO (COSTO $0 / EMBEBIDO EN EL REPO)
Usa un stack ligero, moderno y autocontenido en una sola carpeta raíz para no depender de servidores externos pagos:
- **Backend:** Node.js con Express (`server.js`).
- **Base de Datos Embebida en el Repo:** **SQLite3** (usando `better-sqlite3` o `sqlite3`) que guarde el archivo físico `database/delcampoapp.db` directamente dentro del repositorio.
- **Scripts SQL:** Incluir además los archivos `database/schema.sql` (DDL con llaves primarias y foráneas) y `database/seed.sql` (DML con datos reales del Valle del Cauca) compatibles con SQLite y PostgreSQL para evidenciar la competencia "Administrar base de datos de acuerdo con los estándares y requisitos técnicos".
- **Frontend:** SPA (Single Page Application) servida por Express en la carpeta `public/` usando HTML5 semántico, TailwindCSS (vía CDN para diseño limpio y responsivo móvil/escritorio) y JavaScript Vanilla modular (`public/js/app.js`), consumiendo la API RESTful del backend mediante `fetch()`.

---

# 3. ESTRUCTURA DE ARCHIVOS DEL REPOSITORIO A GENERAR
Crea exactamente la siguiente estructura de directorios y archivos:

```text
delcampoapp/
├── package.json
├── server.js
├── README.md
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   ├── init_db.js
│   └── delcampoapp.db        (generado automáticamente al iniciar si no existe)
└── public/
    ├── index.html
    ├── css/
    │   └── styles.css
    └── js/
        └── app.js
```

---

# 4. MODELO DE DATOS RELACIONAL (`database/schema.sql`)
Implementa estas 6 tablas relacionales con integridad referencial:

1. `usuarios`:
   - `id` INTEGER PRIMARY KEY AUTOINCREMENT
   - `nombre` TEXT NOT NULL
   - `email` TEXT UNIQUE NOT NULL
   - `telefono` TEXT NOT NULL
   - `password_hash` TEXT NOT NULL
   - `rol` TEXT NOT NULL CHECK(rol IN ('PRODUCTOR', 'COMPRADOR', 'ALIADO'))
   - `ubicacion` TEXT NOT NULL
   - `creado_en` DATETIME DEFAULT CURRENT_TIMESTAMP

2. `productores_fincas` (Trazabilidad de origen):
   - `id` INTEGER PRIMARY KEY AUTOINCREMENT
   - `usuario_id` INTEGER NOT NULL REFERENCES usuarios(id)
   - `nombre_finca` TEXT NOT NULL
   - `municipio_vereda` TEXT NOT NULL
   - `altitud_msnm` TEXT
   - `tipo_cultivo` TEXT NOT NULL (ej. 'Agroecológico', 'Tradicional Limpio', 'Orgánico')
   - `historia_productor` TEXT

3. `productos` (Cosechas disponibles):
   - `id` INTEGER PRIMARY KEY AUTOINCREMENT
   - `finca_id` INTEGER NOT NULL REFERENCES productores_fincas(id)
   - `nombre` TEXT NOT NULL
   - `categoria` TEXT NOT NULL CHECK(categoria IN ('Hortalizas', 'Frutas', 'Tubérculos', 'Lácteos y Huevos', 'Granos'))
   - `unidad_medida` TEXT NOT NULL (ej. 'Kilo', 'Libra', 'Atado', 'Cubeta x30', 'Bulto 25kg')
   - `precio_campesino` INTEGER NOT NULL (en COP)
   - `precio_supermercado_ref` INTEGER NOT NULL (para mostrar el ahorro al comprador)
   - `stock_disponible` INTEGER NOT NULL
   - `fecha_cosecha` TEXT NOT NULL
   - `imagen_url` TEXT NOT NULL
   - `activo` INTEGER DEFAULT 1

4. `puntos_aliados` (Tiendas de barrio para recogida programada):
   - `id` INTEGER PRIMARY KEY AUTOINCREMENT
   - `nombre_tienda` TEXT NOT NULL
   - `barrio_ciudad` TEXT NOT NULL
   - `direccion` TEXT NOT NULL
   - `horario_retiro` TEXT NOT NULL

5. `pedidos` (Pedidos programados):
   - `id` INTEGER PRIMARY KEY AUTOINCREMENT
   - `comprador_id` INTEGER NOT NULL REFERENCES usuarios(id)
   - `modalidad_entrega` TEXT NOT NULL CHECK(modalidad_entrega IN ('DOMICILIO', 'PUNTO_ALIADO'))
   - `punto_aliado_id` INTEGER REFERENCES puntos_aliados(id)
   - `direccion_entrega` TEXT
   - `fecha_programada` TEXT NOT NULL (ej. 'Sábado - Ruta Consolidada Valle')
   - `subtotal_campesinos` INTEGER NOT NULL
   - `comision_plataforma` INTEGER NOT NULL (7%)
   - `costo_envio` INTEGER NOT NULL
   - `total_pagar` INTEGER NOT NULL
   - `estado` TEXT DEFAULT 'PROGRAMADO' CHECK(estado IN ('PROGRAMADO', 'EN_RUTA_RURAL', 'ENTREGADO'))
   - `creado_en` DATETIME DEFAULT CURRENT_TIMESTAMP

6. `detalle_pedidos`:
   - `id` INTEGER PRIMARY KEY AUTOINCREMENT
   - `pedido_id` INTEGER NOT NULL REFERENCES pedidos(id)
   - `producto_id` INTEGER NOT NULL REFERENCES productos(id)
   - `cantidad` INTEGER NOT NULL
   - `precio_unitario` INTEGER NOT NULL
   - `subtotal` INTEGER NOT NULL

---

# 5. DATOS SEMILLA OBLIGATORIOS (`database/seed.sql`)
Puebla la base de datos automáticamente al arrancar con datos realistas de Cali y el Valle del Cauca:
- **3 Productores Campesinos con sus Fincas:**
  1. *Don José Albeiro Rengifo* — Finca "La Esperanza", Vereda Tenerife (El Cerrito, Valle), 2.100 msnm, Cultivo Tradicional Limpio (Cebolla larga, Papa amarilla, Tomate chonto).
  2. *Doña María del Carmen Valencia* — Finca "El Rocío", Corregimiento de Felidia (Cali, Valle), 1.850 msnm, Cultivo Agroecológico (Aguacate Papelillo, Lulo de monte, Lechuga crespa, Huevos criollos de pastoreo).
  3. *Asociación Campesina Asocampo Dagua* — Vereda Bruselas (Dagua, Valle), 1.400 msnm, Cultivo Limpio (Piña Oro Miel, Plátano Hartón, Queso fresco campesino).
- **Al menos 8 productos frescos** con precios reales en pesos colombianos ($ COP), precio de referencia de supermercado un 20-30% más caro, fechas de cosecha recientes e imágenes válidas de Unsplash de alimentos frescos.
- **3 Puntos Aliados en Cali:**
  1. *Minimercado La 14 de Alameda* (Barrio Alameda, Cali)
  2. *Tienda Doña Martha* (Barrio San Fernando, Cali)
  3. *Fruver y Abarrotes El Vecino* (Barrio Valle del Lili, Cali)
- **2 Compradores de prueba** (un hogar urbano y un restaurante local) y **2 pedidos programados de ejemplo** para que las tablas de órdenes y estadísticas nunca se vean vacías al iniciar.

---

# 6. ESPECIFICACIÓN DE LA API REST (`server.js`)
Construye y documenta los siguientes endpoints bajo el prefijo `/api`:
- `GET /api/health` -> Devuelve estado del servidor, motor SQLite activo y conteo de tablas.
- `GET /api/productos` -> Lista todos los productos activos haciendo `JOIN` con `productores_fincas` y `usuarios` para incluir toda la trazabilidad de origen (finca, vereda, altitud, nombre del campesino, historia). Soporta filtro por `?categoria=` y búsqueda `?q=`.
- `POST /api/productos` -> Permite a un campesino publicar una nueva cosecha en la base de datos y actualiza el catálogo en tiempo real.
- `PATCH /api/productos/:id/stock` -> Permite al campesino actualizar el stock o precio rápidamente.
- `GET /api/fincas` -> Lista los productores/fincas registrados para el selector del panel campesino.
- `GET /api/puntos-aliados` -> Lista las tiendas de barrio aliadas disponibles para retiro.
- `GET /api/pedidos` -> Lista los pedidos programados con sus ítems y datos del comprador/punto aliado.
- `POST /api/pedidos` -> Crea un nuevo pedido programado en una transacción SQL: inserta en `pedidos`, inserta cada ítem en `detalle_pedidos` y descuenta el `stock_disponible` en `productos`.
- `PATCH /api/pedidos/:id/estado` -> Permite cambiar el estado del pedido (`PROGRAMADO` -> `EN_RUTA_RURAL` -> `ENTREGADO`).

---

# 7. INTERFACES Y FUNCIONALIDADES DEL FRONTEND (`public/index.html` + `public/js/app.js`)
Diseña una interfaz moderna, cálida y agroecológica (tonos verde campo `#1B5E20`, tierra suave y crema, tipografía legible) que incluya una barra superior con un **Selector Rápido de Rol en Vivo (Modo Demostración SENA)** para alternar sin recargar la página entre las 4 vistas clave del prototipo:

1. **Vista 1: Catálogo Digital y Trazabilidad (Rol: Comprador Urbano / Restaurante)**
   - Banner principal destacando el ahorro sin intermediarios y la próxima fecha de despacho semanal.
   - Filtros por categoría (*Todos, Hortalizas, Frutas, Tubérculos, Lácteos y Huevos*) y buscador en tiempo real.
   - Tarjetas de producto mostrando: foto, nombre, precio por unidad en COP, porcentaje de ahorro frente a supermercado, stock disponible y **Etiqueta Interactiva de Trazabilidad** (Nombre del campesino, Finca, Vereda/Municipio y botón *"Ver origen del cultivo"* que abre un modal con la historia del productor, altitud y fecha de cosecha).
   - Botón para agregar al carrito de pedido programado.

2. **Vista 2: Carrito y Programación de Pedido (Rol: Comprador)**
   - Drawer o sección de carrito interactivo.
   - Selector de comprador de prueba (o ingreso de nombre/teléfono).
   - Selector de **Fecha de Entrega Programada** (ej. *Próximo Miércoles - Ruta Valle* o *Próximo Sábado - Ruta Campesina*).
   - Selector de **Modalidad de Entrega**:
     - *Retiro en Tienda de Barrio Aliada ($0 COP envío)* con desplegable de los `puntos_aliados`.
     - *Domicilio Urbano Agrupado ($4.500 COP)*.
   - **Recuadro de Transparencia Económica:** Muestra cuánto recibe directamente el campesino (93%), la tarifa de servicio cloud de DelCampoApp (7%) y el ahorro total obtenido.
   - Botón *"Confirmar Pedido Programado"* que guarda en SQLite vía `POST /api/pedidos` y muestra comprobante de orden.

3. **Vista 3: Panel Campesino de Baja Carga Cognitiva (Rol: Productor Agrícola)**
   - Diseño especial con botones grandes, iconos claros y texto de alto contraste pensado para el agricultor.
   - Formulario simplificado paso a paso para **Publicar Nueva Cosecha** (Seleccionar mi finca, ¿Qué cosechó hoy?, Categoría, Unidad de medida, Precio justo por unidad, Cantidad disponible, Fecha de cosecha, URL de foto o selector de fotos predefinidas de productos del campo).
   - Lista de *"Mis Cosechas Publicadas"* con botón rápido para ajustar stock y resumen de ganancias acumuladas en pedidos programados.

4. **Vista 4: Hoja de Ruta Logística y Monitor de Base de Datos (Rol: Aliado / Evaluador SENA)**
   - Tabla en vivo de todos los **Pedidos Programados** almacenados en SQLite, con filtro por ruta/estado y botones para avanzar el estado de la orden (`PROGRAMADO` -> `EN_RUTA_RURAL` -> `ENTREGADO`).
   - Indicador técnico en vivo que muestre el estado de conexión con la base de datos SQLite (`database/delcampoapp.db`) y los endpoints REST activos, ideal para mostrar durante el video de evidencia de la Bitácora 4.

---

# 8. DOCUMENTACIÓN (`README.md`)
Incluye un `README.md` profesional y bien estructurado para el repositorio de GitHub con:
- Encabezado institucional SENA - Centro ASTIN (Ficha 3186266, Programa: Programación de Aplicaciones y Servicios para la Nube, Aprendiz: Paulo Andrés De los Reyes González).
- Descripción del prototipo funcional (Bitácora 4) y las 4 competencias del programa aplicadas.
- Arquitectura del sistema y diagrama Entidad-Relación en formato Mermaid.
- Instrucciones de instalación y ejecución en 3 comandos (`npm install`, `npm run init-db`, `npm start`).
- Tabla de endpoints de la API REST.

---

# CRITERIOS DE ACEPTACIÓN ANTES DE TERMINAR
1. Ejecuta `npm install` y verifica que la base de datos `database/delcampoapp.db` se cree y se pueble sin errores con `schema.sql` y `seed.sql`.
2. Inicia el servidor y comprueba que todos los endpoints (`/api/productos`, `/api/pedidos`, `/api/fincas`, `/api/puntos-aliados`) respondan con código HTTP 200 y datos JSON reales.
3. Asegúrate de que al publicar un producto en el Panel Campesino o al confirmar un Pedido Programado en el Carrito, los cambios persistan realmente en el archivo SQLite `delcampoapp.db`.