# 🌾 DelCampoApp — AgTech de Comercio Justo y Rutas Programadas

![Colombia](https://img.shields.io/badge/Colombia-Cobertura_Nacional-FFCD00?style=for-the-badge&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-v22+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-Backend_REST-000000?style=for-the-badge&logo=express&logoColor=white)
![SQLite3](https://img.shields.io/badge/SQLite3-Base_de_Datos_Embebida-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Responsive_UI-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

> *"Del campo colombiano directo a tu mesa y negocio"*

**DelCampoApp** es una plataforma web y tecnológica (AgTech) orientada a servicios que conecta directamente a pequeños y medianos productores agrícolas de Colombia (**Región Caribe / Atlántico, Cundinamarca / Sabana y Antioquia / Eje Cafetero**) con consumidores urbanos, tiendas de barrio y restaurantes locales en las principales ciudades del país.

Elimina intermediarios especulativos en la cadena de suministro agroalimentario y consolida rutas semanales de distribución agrupada, garantizando un precio justo y digno para el agricultor y ahorros significativos para el comprador.

---

## 🌟 Pilares y Características Clave

1. **Trato Directo y Transparencia Económica Real:**  
   Cada pedido muestra con total claridad el desglose de costos: el **93%** del subtotal de alimentos ingresa directamente a las manos del productor campesino, con solo un **7%** destinado a la operación tecnológica y logística de la plataforma.
2. **Trazabilidad de Origen Garantizada:**  
   Cada cosecha exhibe el perfil del agricultor, finca, municipio (ej. *Baranoa - Atlántico, Subachoque - Cundinamarca, Marinilla - Antioquia*), altitud sobre el nivel del mar, tipo de cultivo (tradicional limpio, agroecológico u orgánico) y fecha exacta de recolección.
3. **Red Nacional de Tiendas Aliadas ($0 COP Envío):**  
   Los compradores pueden elegir entre entrega a domicilio o retiro sin costo de envío en una red de tiendas de barrio y minimercados urbanos aliados en Barranquilla, Soledad, Bogotá y Medellín.
4. **Portal del Productor de Alta Usabilidad:**  
   Interfaz diseñada para facilitar la publicación rápida de cosechas disponibles, ajuste de inventario en tiempo real (+10 / -5 stock) y visualización de ingresos acumulados.
5. **Centro de Operaciones y Rutas en Vivo:**  
   Gestión logística centralizada para coordinar los despachos semanales (Miércoles y Sábados), con avance de estados (`PROGRAMADO` → `EN_RUTA_RURAL` → `ENTREGADO`) y monitor de infraestructura de base de datos.

---

## 🏛️ Arquitectura del Sistema

```text
DelcampoApp/
├── package.json              # Configuración de dependencias y scripts de arranque
├── server.js                 # Servidor backend Express con API RESTful y transacciones ACID
├── README.md                 # Documentación técnica y de producto
├── database/
│   ├── db.js                 # Adaptador de base de datos SQLite3 embebida (journal DELETE)
│   ├── schema.sql            # Esquema relacional DDL (6 tablas, claves foráneas e índices)
│   ├── seed.sql              # Cosechas y productores reales de Colombia (DML)
│   ├── init_db.js            # Script de inicialización y verificación (`npm run init-db`)
│   └── delcampoapp.db        # Archivo físico de base de datos embebida
└── public/                   # Aplicación cliente SPA
    ├── index.html            # Interfaz moderna de producto AgTech
    ├── css/
    │   └── styles.css        # Estilos agroecológicos, modales y botones táctiles
    └── js/
        └── app.js            # Lógica cliente modular (Fetch API, carrito, panel)
```

---

## 🗄️ Modelo de Datos Relacional

```mermaid
erDiagram
    USUARIOS ||--o{ PRODUCTORES_FINCAS : "posee"
    USUARIOS ||--o{ PEDIDOS : "realiza"
    PRODUCTORES_FINCAS ||--o{ PRODUCTOS : "cultiva"
    PUNTOS_ALIADOS ||--o{ PEDIDOS : "despacha_en"
    PEDIDOS ||--|{ DETALLE_PEDIDOS : "contiene"
    PRODUCTOS ||--o{ DETALLE_PEDIDOS : "se_incluye_en"

    USUARIOS {
        int id PK
        string nombre
        string email
        string telefono
        string password_hash
        string rol "PRODUCTOR | COMPRADOR | ALIADO"
        string ubicacion
        datetime creado_en
    }

    PRODUCTORES_FINCAS {
        int id PK
        int usuario_id FK
        string nombre_finca
        string region
        string municipio_vereda
        string altitud_msnm
        string tipo_cultivo
        string historia_productor
    }

    PRODUCTOS {
        int id PK
        int finca_id FK
        string nombre
        string categoria "Hortalizas | Frutas | Tubérculos | Lácteos y Huevos | Granos"
        string unidad_medida
        int precio_campesino
        int precio_supermercado_ref
        int stock_disponible
        string fecha_cosecha
        string imagen_url
        int activo
    }

    PUNTOS_ALIADOS {
        int id PK
        string nombre_tienda
        string ciudad_departamento
        string barrio
        string direccion
        string horario_retiro
    }

    PEDIDOS {
        int id PK
        int comprador_id FK
        string modalidad_entrega "DOMICILIO | PUNTO_ALIADO"
        int punto_aliado_id FK
        string direccion_entrega
        string fecha_programada
        int subtotal_campesinos
        int comision_plataforma
        int costo_envio
        int total_pagar
        string estado "PROGRAMADO | EN_RUTA_RURAL | ENTREGADO"
        datetime creado_en
    }

    DETALLE_PEDIDOS {
        int id PK
        int pedido_id FK
        int producto_id FK
        int cantidad
        int precio_unitario
        int subtotal
    }
```

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- **Node.js** v20 o superior instalado en el sistema.

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone https://github.com/paulodelosrey/DelcampoApp.git
cd DelcampoApp
npm install
```

### 2. Inicializar la base de datos embebida
```bash
npm run init-db
```
*Aplica el esquema relacional (`schema.sql`) y carga las cosechas y productores de Atlántico, Cundinamarca y Antioquia (`seed.sql`).*

### 3. Iniciar la aplicación
```bash
npm start
```
Abre en tu navegador web preferido:  
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📡 Especificación de la API RESTful (`/api`)

| Método | Ruta | Descripción | Parámetros / Cuerpo |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/health` | Estado del servicio, motor de base de datos y conteo de tablas | Ninguno |
| `GET` | `/api/stats` | Métricas de ventas, productores activos y ahorro total generado | Ninguno |
| `GET` | `/api/productos` | Catálogo con JOIN de trazabilidad de origen y filtros | `?categoria=`, `?region=`, `?q=` |
| `POST` | `/api/productos` | Publica una cosecha disponible desde el Portal del Productor | JSON de cosecha y finca |
| `PATCH` | `/api/productos/:id/stock` | Ajuste rápido de stock o precio de una cosecha | `{ "stock_disponible": 40 }` |
| `GET` | `/api/fincas` | Lista de productores y fincas registradas | Ninguno |
| `GET` | `/api/puntos-aliados` | Red de tiendas de barrio aliadas para retiro | Ninguno |
| `GET` | `/api/pedidos` | Despachos y pedidos semanales programados | `?estado=` |
| `POST` | `/api/pedidos` | **Transacción ACID:** Crea orden, descuenta inventario y desglosa costos | JSON con comprador, modalidad e ítems |
| `PATCH` | `/api/pedidos/:id/estado` | Actualiza el estado de la orden (`PROGRAMADO` → `EN_RUTA_RURAL` → `ENTREGADO`) | `{ "estado": "EN_RUTA_RURAL" }` |

---

## 🌾 Cobertura de Productores Incluidos

- **Región Caribe / Atlántico:** *Don Rafael Mendoza* — Finca "Villa Rosa" (Baranoa / Polonuevo, Atlántico). Cosechas: Yuca criolla, Ñame espino sabanero, Plátano hartón maduro, Limón Tahití y Queso costeño fresco.
- **Sabana y Centro:** *Doña María del Carmen Vargas* — Finca "El Rocío" (Subachoque, Cundinamarca). Cosechas: Papa pastusa seleccionada, Cebolla junca de rama, Fresas de altura y Huevos campesinos de pastoreo.
- **Antioquia y Eje Cafetero:** *Asociación Agropecuaria Tierra Viva* (El Santuario / Marinilla, Antioquia). Cosechas: Aguacate Hass extra, Tomate chonto rojo, Lechuga hidropónica y Fríjol cargamanto fresco.

---

## 👨‍💻 Autor / Créditos

Desarrollado por **Paulo Andrés De los Reyes González**  
*Colombia — 2026*
