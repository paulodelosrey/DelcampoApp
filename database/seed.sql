-- ==============================================================================
-- DELCAMPOAPP - DATOS SEMILLA OBLIGATORIOS (DML)
-- Valle del Cauca - Colombia
-- Ficha SENA ASTIN 3186266 | Bitácora 4
-- ==============================================================================

-- 1. USUARIOS (Campesinos, Compradores Urbanos y Tienda Aliada)
INSERT OR IGNORE INTO usuarios (id, nombre, email, telefono, password_hash, rol, ubicacion) VALUES
(1, 'Don José Albeiro Rengifo', 'albeiro.rengifo@campovalle.co', '3157849201', 'hash_jose_2026', 'PRODUCTOR', 'Vereda Tenerife, El Cerrito, Valle'),
(2, 'Doña María del Carmen Valencia', 'maria.valencia@felidia.org', '3184561230', 'hash_maria_2026', 'PRODUCTOR', 'Corregimiento Felidia, Cali, Valle'),
(3, 'Asociación Asocampo Dagua', 'contacto@asocampodagua.co', '3209874512', 'hash_asocampo_2026', 'PRODUCTOR', 'Vereda Bruselas, Dagua, Valle'),
(4, 'Carlos Alberto Mendoza', 'carlos.mendoza@gmail.com', '3104445566', 'hash_carlos_2026', 'COMPRADOR', 'Barrio Capri, Carrera 78 #10-45, Cali'),
(5, 'Restaurante Sabor Valluno', 'pedidos@saborvalluno.com', '3128889900', 'hash_rest_2026', 'COMPRADOR', 'Barrio Granada, Calle 15N #9N-30, Cali'),
(6, 'Minimercado La 14 de Alameda', 'alameda.la14@aliadosdelcampo.co', '3176543210', 'hash_aliado_2026', 'ALIADO', 'Barrio Alameda, Cali');

-- 2. PRODUCTORES Y FINCAS (Trazabilidad de origen campesino)
INSERT OR IGNORE INTO productores_fincas (id, usuario_id, nombre_finca, municipio_vereda, altitud_msnm, tipo_cultivo, historia_productor) VALUES
(1, 1, 'Finca La Esperanza', 'Vereda Tenerife (El Cerrito, Valle)', '2.100 msnm', 'Tradicional Limpio', 'Don José lleva más de 35 años cultivando en las faldas de la cordillera central sin pesticidas sintéticos. Su familia cuida las fuentes hídricas del páramo de Las Hermosas y lidera el relevo generacional agropecuario.'),
(2, 2, 'Finca El Rocío', 'Corregimiento de Felidia (Cali, Valle)', '1.850 msnm', 'Agroecológico', 'Doña María del Carmen es guardiana de semillas ancestrales en las cuencas de los Farallones de Cali. Produce con abonos orgánicos propios y gallinas felices en libertad de pastoreo con maíz criollo.'),
(3, 3, 'Granja Comunitaria Asocampo', 'Vereda Bruselas (Dagua, Valle)', '1.400 msnm', 'Cultivo Limpio Asociativo', 'Asociación de 18 familias campesinas de la cuenca del río Dagua dedicadas a la producción sostenible de frutales y plátano con pago equitativo y digno para las mujeres cabezas de hogar.');

-- 3. PRODUCTOS DISPONIBLES (Cosechas frescas del Valle del Cauca)
-- Finca 1: El Cerrito (Tenerife)
INSERT OR IGNORE INTO productos (id, finca_id, nombre, categoria, unidad_medida, precio_campesino, precio_supermercado_ref, stock_disponible, fecha_cosecha, imagen_url, activo) VALUES
(1, 1, 'Tomate Chonto Maduro', 'Hortalizas', 'Kilo', 3200, 4800, 65, 'Hoy a las 5:30 AM', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop', 1),
(2, 1, 'Cebolla Larga Junca', 'Hortalizas', 'Atado 1kg', 2800, 4200, 40, 'Ayer en la tarde', 'https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?w=600&auto=format&fit=crop', 1),
(3, 1, 'Papa Criolla Amarilla', 'Tubérculos', 'Bolsa 2kg', 5500, 7800, 80, 'Hoy a las 6:00 AM', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop', 1),

-- Finca 2: Felidia (Cali)
(4, 2, 'Aguacate Papelillo Extra', 'Frutas', 'Kilo', 6000, 8900, 50, 'Hoy al amanecer', 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&auto=format&fit=crop', 1),
(5, 2, 'Lulo de Monte La Selva', 'Frutas', 'Kilo', 4800, 6900, 35, 'Hoy a las 7:00 AM', 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop', 1),
(6, 2, 'Lechuga Crespa Hidroecológica', 'Hortalizas', 'Unidad', 2200, 3600, 45, 'Hoy a las 5:00 AM', 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=600&auto=format&fit=crop', 1),
(7, 2, 'Huevos Criollos de Pastoreo', 'Lácteos y Huevos', 'Cubeta x30', 17500, 23900, 28, 'Recolección del día', 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop', 1),

-- Finca 3: Dagua (Bruselas)
(8, 3, 'Plátano Hartón Verde', 'Tubérculos', 'Kilo', 3000, 4500, 90, 'Ayer al atardecer', 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=600&auto=format&fit=crop', 1),
(9, 3, 'Piña Oro Miel Dulce', 'Frutas', 'Unidad 2kg', 4500, 6800, 40, 'Hoy a las 6:30 AM', 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&auto=format&fit=crop', 1),
(10, 3, 'Queso Campesino Semiduro', 'Lácteos y Huevos', 'Bloque 500g', 8500, 12000, 22, 'Elaborado hoy fresco', 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&auto=format&fit=crop', 1);

-- 4. PUNTOS ALIADOS (Tiendas de barrio en Cali)
INSERT OR IGNORE INTO puntos_aliados (id, nombre_tienda, barrio_ciudad, direccion, horario_retiro) VALUES
(1, 'Minimercado La 14 de Alameda', 'Barrio Alameda, Cali', 'Calle 8 #26-15', 'Miércoles y Sábados 8:00 AM a 6:00 PM'),
(2, 'Tienda Doña Martha', 'Barrio San Fernando, Cali', 'Carrera 34 #4-22', 'Miércoles y Sábados 7:30 AM a 7:00 PM'),
(3, 'Fruver y Abarrotes El Vecino', 'Barrio Valle del Lili, Cali', 'Carrera 98 #42-10', 'Miércoles y Sábados 8:00 AM a 8:00 PM');

-- 5. PEDIDOS PROGRAMADOS DE EJEMPLO (Historial para pruebas y evaluador SENA)
-- Pedido 1: Hogar Urbano (Retiro en Punto Aliado Alameda)
INSERT OR IGNORE INTO pedidos (id, comprador_id, modalidad_entrega, punto_aliado_id, direccion_entrega, fecha_programada, subtotal_campesinos, comision_plataforma, costo_envio, total_pagar, estado) VALUES
(1, 4, 'PUNTO_ALIADO', 1, NULL, 'Próximo Sábado - Ruta Campesina', 33700, 2359, 0, 36059, 'PROGRAMADO'),
(2, 5, 'DOMICILIO', NULL, 'Barrio Granada, Calle 15N #9N-30, Restaurante Sabor Valluno', 'Próximo Miércoles - Ruta Valle', 84000, 5880, 4500, 94380, 'EN_RUTA_RURAL');

-- 6. DETALLE DE PEDIDOS
-- Detalle Pedido 1 (Hogar urbano: Huevos criollos + Aguacate + Papa criolla + Tomate)
INSERT OR IGNORE INTO detalle_pedidos (id, pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
(1, 1, 7, 1, 17500, 17500),
(2, 1, 4, 1, 6000, 6000),
(3, 1, 3, 1, 5500, 5500),
(4, 1, 1, 1, 3200, 3200),

-- Detalle Pedido 2 (Restaurante: Plátano Hartón x10kg, Tomate chonto x10kg, Queso campesino x4)
(5, 2, 8, 10, 3000, 30000),
(6, 2, 1, 10, 3200, 32000),
(7, 2, 10, 4, 8500, 34000);
