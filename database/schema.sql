-- ==============================================================================
-- DELCAMPOAPP - ESQUEMA DE BASE DE DATOS RELACIONAL (DDL)
-- Plataforma AgTech de Comercio Justo y Rutas Programadas Nacionales
-- ==============================================================================

PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS detalle_pedidos;
DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS puntos_aliados;
DROP TABLE IF EXISTS productores_fincas;
DROP TABLE IF EXISTS usuarios;

-- 1. TABLA DE USUARIOS
-- Productores agrícolas, compradores urbanos y aliados comerciales
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefono TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    rol TEXT NOT NULL CHECK(rol IN ('PRODUCTOR', 'COMPRADOR', 'ALIADO')),
    ubicacion TEXT NOT NULL,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA DE FINCAS Y PRODUCTORES (Trazabilidad y Cobertura Multirregional)
CREATE TABLE productores_fincas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre_finca TEXT NOT NULL,
    region TEXT NOT NULL,
    municipio_vereda TEXT NOT NULL,
    altitud_msnm TEXT,
    tipo_cultivo TEXT NOT NULL,
    historia_productor TEXT
);

-- 3. TABLA DE PRODUCTOS (Cosechas disponibles para despacho semanal)
CREATE TABLE productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    finca_id INTEGER NOT NULL REFERENCES productores_fincas(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL CHECK(categoria IN ('Hortalizas', 'Frutas', 'Tubérculos', 'Lácteos y Huevos', 'Granos')),
    unidad_medida TEXT NOT NULL,
    precio_campesino INTEGER NOT NULL,
    precio_supermercado_ref INTEGER NOT NULL,
    stock_disponible INTEGER NOT NULL,
    fecha_cosecha TEXT NOT NULL,
    imagen_url TEXT NOT NULL,
    activo INTEGER DEFAULT 1
);

-- 4. TABLA DE PUNTOS ALIADOS (Tiendas de barrio urbanas para retiro a $0 COP)
CREATE TABLE puntos_aliados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_tienda TEXT NOT NULL,
    ciudad_departamento TEXT NOT NULL,
    barrio TEXT NOT NULL,
    direccion TEXT NOT NULL,
    horario_retiro TEXT NOT NULL
);

-- 5. TABLA DE PEDIDOS (Órdenes consolidadas con desglose 93% campesino / 7% plataforma)
CREATE TABLE pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comprador_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    modalidad_entrega TEXT NOT NULL CHECK(modalidad_entrega IN ('DOMICILIO', 'PUNTO_ALIADO')),
    punto_aliado_id INTEGER REFERENCES puntos_aliados(id) ON DELETE SET NULL,
    direccion_entrega TEXT,
    fecha_programada TEXT NOT NULL,
    subtotal_campesinos INTEGER NOT NULL,
    comision_plataforma INTEGER NOT NULL,
    costo_envio INTEGER NOT NULL,
    total_pagar INTEGER NOT NULL,
    estado TEXT DEFAULT 'PROGRAMADO' CHECK(estado IN ('PROGRAMADO', 'EN_RUTA_RURAL', 'ENTREGADO')),
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLA DE DETALLE DE PEDIDOS
CREATE TABLE detalle_pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL,
    precio_unitario INTEGER NOT NULL,
    subtotal INTEGER NOT NULL
);

-- Índices de consulta frecuente
CREATE INDEX idx_productos_finca ON productos(finca_id);
CREATE INDEX idx_productos_categoria ON productos(categoria);
CREATE INDEX idx_fincas_region ON productores_fincas(region);
CREATE INDEX idx_pedidos_comprador ON pedidos(comprador_id);
CREATE INDEX idx_detalle_pedidos_pedido ON detalle_pedidos(pedido_id);
