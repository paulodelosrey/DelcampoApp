-- ==============================================================================
-- DELCAMPOAPP - DATOS SEMILLA NACIONALES (DML)
-- Cobertura Multirregional: Caribe / Atlántico, Cundinamarca y Antioquia
-- ==============================================================================

-- 1. USUARIOS (Campesinos, Aliados Comerciales y Compradores Urbanos)
INSERT OR IGNORE INTO usuarios (id, nombre, email, telefono, password_hash, rol, ubicacion) VALUES
(1, 'Don Rafael Mendoza', 'rafael.mendoza@delcampoapp.co', '3158901234', 'hash_rafael_2026', 'PRODUCTOR', 'Baranoa / Polonuevo, Atlántico'),
(2, 'Doña María del Carmen Vargas', 'maria.vargas@delcampoapp.co', '3187654321', 'hash_maria_2026', 'PRODUCTOR', 'Vereda Cascadas, Subachoque, Cundinamarca'),
(3, 'Asociación Agropecuaria Tierra Viva', 'tierraviva@delcampoapp.co', '3206549871', 'hash_tierraviva_2026', 'PRODUCTOR', 'Marinilla / El Santuario, Antioquia'),
(4, 'Restaurante Fogón Caribeño', 'fogon.caribeno@gmail.com', '3104567890', 'hash_fogon_2026', 'COMPRADOR', 'Barrio El Prado, Barranquilla, Atlántico'),
(5, 'Despensa & Café Urbano', 'pedidos@despensacafe.co', '3123456789', 'hash_despensa_2026', 'COMPRADOR', 'Barrio Chapinero, Bogotá D.C.'),
(6, 'Familia Gómez Restrepo', 'familia.gomez@hotmail.com', '3169871234', 'hash_gomez_2026', 'COMPRADOR', 'Barrio Laureles, Medellín, Antioquia');

-- 2. PRODUCTORES Y FINCAS (Trazabilidad y Cobertura Multirregional)
INSERT OR IGNORE INTO productores_fincas (id, usuario_id, nombre_finca, region, municipio_vereda, altitud_msnm, tipo_cultivo, historia_productor) VALUES
(1, 1, 'Finca Villa Rosa', 'Caribe y Atlántico', 'Baranoa / Polonuevo (Atlántico)', '110 msnm', 'Tradicional Limpio', 'Don Rafael representa a la tercera generación de agricultores del centro del Atlántico. Su finca aprovecha pozos de agua dulce y abonos verdes orgánicos para cultivar tubérculos criollos y cítricos de aroma intenso sin agrotóxicos.'),
(2, 2, 'Finca El Rocío', 'Sabana y Centro', 'Subachoque (Cundinamarca)', '2.650 msnm', 'Agroecológico', 'Doña María del Carmen lidera un proyecto modelo de agricultura limpia en las faldas de la Sabana de Bogotá. Protege la microcuenca del río Subachoque y produce hortalizas y tubérculos regados con agua pura de montaña.'),
(3, 3, 'Granja Comunitaria Tierra Viva', 'Antioquia y Eje Cafetero', 'El Santuario / Marinilla (Antioquia)', '2.150 msnm', 'Orgánico Certificado', 'Asociación de 24 familias campesinas del oriente antioqueño unidas para producir aguacates, tomates y leguminosas con abonos de lombricompostaje y comercio equitativo que garantiza precios estables y dignos.');

-- 3. PRODUCTOS DISPONIBLES (Cosechas frescas por región)
-- Finca 1: Caribe / Atlántico (Don Rafael Mendoza)
INSERT OR IGNORE INTO productos (id, finca_id, nombre, categoria, unidad_medida, precio_campesino, precio_supermercado_ref, stock_disponible, fecha_cosecha, imagen_url, activo) VALUES
(1, 1, 'Yuca Criolla Blanca', 'Tubérculos', 'Bolsa 2kg', 2800, 4200, 85, 'Hoy a las 5:00 AM', 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=600&auto=format&fit=crop', 1),
(2, 1, 'Ñame Espino Sabanero', 'Tubérculos', 'Kilo', 3800, 5600, 60, 'Ayer al atardecer', 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=600&auto=format&fit=crop', 1),
(3, 1, 'Plátano Hartón Maduro', 'Tubérculos', 'Kilo', 3000, 4600, 95, 'Hoy al amanecer', 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=600&auto=format&fit=crop', 1),
(4, 1, 'Limón Tahití de Exportación', 'Frutas', 'Kilo', 3500, 5200, 70, 'Hoy a las 6:30 AM', 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=600&auto=format&fit=crop', 1),
(5, 1, 'Queso Costeño Campesino', 'Lácteos y Huevos', 'Bloque 500g', 9500, 13800, 40, 'Elaborado hoy fresco', 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&auto=format&fit=crop', 1),

-- Finca 2: Sabana / Cundinamarca (Doña María del Carmen Vargas)
(6, 2, 'Papa Pastusa Seleccionada', 'Tubérculos', 'Bolsa 2kg', 5200, 7600, 110, 'Hoy a las 6:00 AM', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop', 1),
(7, 2, 'Cebolla Junca de Rama', 'Hortalizas', 'Atado 1kg', 2600, 3900, 55, 'Ayer en la tarde', 'https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?w=600&auto=format&fit=crop', 1),
(8, 2, 'Fresas de Altura Seleccionadas', 'Frutas', 'Canastilla 500g', 5800, 8500, 45, 'Hoy a las 7:00 AM', 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&auto=format&fit=crop', 1),
(9, 2, 'Huevos Campesinos de Pastoreo', 'Lácteos y Huevos', 'Cubeta x30', 18500, 24900, 35, 'Recolección del día', 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop', 1),

-- Finca 3: Antioquia y Eje Cafetero (Asociación Tierra Viva)
(10, 3, 'Aguacate Hass Extra', 'Frutas', 'Kilo', 6500, 9800, 65, 'Hoy a las 6:00 AM', 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&auto=format&fit=crop', 1),
(11, 3, 'Tomate Chonto Rojo', 'Hortalizas', 'Kilo', 3400, 4900, 80, 'Hoy a las 5:30 AM', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop', 1),
(12, 3, 'Lechuga Crespa Hidropónica', 'Hortalizas', 'Unidad', 2400, 3800, 50, 'Hoy a las 6:00 AM', 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=600&auto=format&fit=crop', 1),
(13, 3, 'Fríjol Cargamanto Rojo Fresco', 'Granos', 'Kilo', 7800, 11500, 40, 'Desgranado ayer', 'https://images.unsplash.com/photo-1551462147-37885acc36f1?w=600&auto=format&fit=crop', 1);

-- 4. PUNTOS ALIADOS DE RETIRO (Red Urbana Nacional a $0 COP de Envío)
INSERT OR IGNORE INTO puntos_aliados (id, nombre_tienda, ciudad_departamento, barrio, direccion, horario_retiro) VALUES
(1, 'Abastos y Tienda La Esquina Real', 'Barranquilla (Atlántico)', 'Barrio El Prado / Norte', 'Carrera 54 #72-35', 'Miércoles y Sábados 8:00 AM a 6:00 PM'),
(2, 'Minimercado Los Robles', 'Soledad / AM Barranquilla (Atlántico)', 'Barrio Los Robles', 'Calle 77 #23B-10', 'Miércoles y Sábados 7:30 AM a 7:00 PM'),
(3, 'Fruver y Despensa La Cosecha', 'Bogotá D.C.', 'Barrio Chapinero', 'Carrera 13 #58-20', 'Miércoles y Sábados 8:00 AM a 7:00 PM'),
(4, 'Mercadito Campesino Laureles', 'Medellín (Antioquia)', 'Barrio Laureles', 'Transversal 39B #74B-12', 'Miércoles y Sábados 8:00 AM a 6:30 PM');

-- 5. PEDIDOS PROGRAMADOS DE EJEMPLO
INSERT OR IGNORE INTO pedidos (id, comprador_id, modalidad_entrega, punto_aliado_id, direccion_entrega, fecha_programada, subtotal_campesinos, comision_plataforma, costo_envio, total_pagar, estado) VALUES
(1, 4, 'PUNTO_ALIADO', 1, NULL, 'Próximo Sábado - Ruta Caribe', 34600, 2422, 0, 37022, 'PROGRAMADO'),
(2, 5, 'DOMICILIO', NULL, 'Carrera 13 #58-20, Despensa & Café Urbano, Bogotá D.C.', 'Próximo Miércoles - Ruta Sabana', 47700, 3339, 4500, 55539, 'EN_RUTA_RURAL');

-- 6. DETALLE DE PEDIDOS
-- Pedido 1 (Restaurante Fogón Caribeño: Yuca x4, Ñame x3, Queso costeño x2)
INSERT OR IGNORE INTO detalle_pedidos (id, pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
(1, 1, 1, 4, 2800, 11200),
(2, 1, 2, 3, 3800, 11400),
(3, 1, 5, 2, 9500, 19000),

-- Pedido 2 (Despensa & Café Urbano: Fresas x3, Huevos criollos x1, Papa pastusa x2)
(4, 2, 8, 3, 5800, 17400),
(5, 2, 9, 1, 18500, 18500),
(6, 2, 6, 2, 5200, 10400);
