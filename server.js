// ==============================================================================
// DELCAMPOAPP - BACKEND API RESTful (PRODUCCIÓN / AGTECH)
// "Del campo colombiano directo a tu mesa y negocio"
// ==============================================================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { getDatabase, DB_FILE } = require('./database/db');
const { initializeDatabase, printSummary } = require('./database/init_db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir frontend estático
app.use(express.static(path.join(__dirname, 'public')));

// Inicializar base de datos si no existen tablas
try {
  initializeDatabase({ force: false });
} catch (err) {
  console.error('Verificación de base de datos:', err.message);
}

const db = getDatabase();

// ==============================================================================
// 1. ENDPOINT DE SALUD Y MONITOREO TÉCNICO
// ==============================================================================
app.get('/api/health', (req, res) => {
  try {
    const tableCounts = printSummary(db);
    const stat = fs.existsSync(DB_FILE) ? fs.statSync(DB_FILE) : null;

    res.json({
      status: 'OK',
      plataforma: 'DelCampoApp API v1.0',
      eslogan: 'Del campo colombiano directo a tu mesa y negocio',
      cobertura: 'Colombia (Caribe/Atlántico, Sabana/Cundinamarca, Antioquia)',
      uptime_segundos: Math.floor(process.uptime()),
      motor_bd: db.engine,
      archivo_bd: DB_FILE,
      tamano_archivo_kb: stat ? Math.round(stat.size / 1024) : 0,
      timestamp: new Date().toISOString(),
      tablas_registros: tableCounts
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar estado del servicio', detalle: error.message });
  }
});

// Métricas de plataforma
app.get('/api/stats', (req, res) => {
  try {
    const totalProductos = db.prepare('SELECT count(*) as count FROM productos WHERE activo = 1').get().count;
    const totalCampesinos = db.prepare('SELECT count(*) as count FROM productores_fincas').get().count;
    const totalPuntosAliados = db.prepare('SELECT count(*) as count FROM puntos_aliados').get().count;
    const pedidosStats = db.prepare(`
      SELECT 
        count(*) as total_pedidos,
        COALESCE(SUM(subtotal_campesinos), 0) as total_campesinos,
        COALESCE(SUM(comision_plataforma), 0) as total_comision,
        COALESCE(SUM(total_pagar), 0) as total_ventas
      FROM pedidos
    `).get();

    const ahorroRow = db.prepare(`
      SELECT COALESCE(SUM(dp.cantidad * (p.precio_supermercado_ref - dp.precio_unitario)), 0) as ahorro_total
      FROM detalle_pedidos dp
      JOIN productos p ON dp.producto_id = p.id
    `).get();

    res.json({
      totalProductos,
      totalCampesinos,
      totalPuntosAliados,
      totalPedidos: pedidosStats.total_pedidos,
      totalCampesinosCOP: pedidosStats.total_campesinos,
      totalComisionCOP: pedidosStats.total_comision,
      totalVentasCOP: pedidosStats.total_ventas,
      totalAhorroCompradoresCOP: ahorroRow.ahorro_total
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener métricas', detalle: error.message });
  }
});

// ==============================================================================
// 2. ENDPOINTS DE PRODUCTOS Y TRAZABILIDAD DE ORIGEN
// ==============================================================================

// GET /api/productos -> Catálogo activo con trazabilidad y soporte multirregional
app.get('/api/productos', (req, res) => {
  try {
    const { categoria, region, q } = req.query;
    let sql = `
      SELECT 
        p.id,
        p.finca_id,
        p.nombre,
        p.categoria,
        p.unidad_medida,
        p.precio_campesino,
        p.precio_supermercado_ref,
        p.stock_disponible,
        p.fecha_cosecha,
        p.imagen_url,
        p.activo,
        -- Trazabilidad y región
        pf.nombre_finca,
        pf.region,
        pf.municipio_vereda,
        pf.altitud_msnm,
        pf.tipo_cultivo,
        pf.historia_productor,
        u.nombre AS nombre_campesino,
        u.telefono AS telefono_campesino,
        ROUND(((p.precio_supermercado_ref - p.precio_campesino) * 100.0 / p.precio_supermercado_ref), 0) AS porcentaje_ahorro
      FROM productos p
      JOIN productores_fincas pf ON p.finca_id = pf.id
      JOIN usuarios u ON pf.usuario_id = u.id
      WHERE p.activo = 1
    `;

    const params = [];

    if (categoria && categoria !== 'Todos') {
      sql += ' AND p.categoria = ?';
      params.push(categoria);
    }

    if (region && region !== 'Todas') {
      sql += ' AND pf.region = ?';
      params.push(region);
    }

    if (q && q.trim()) {
      sql += ' AND (p.nombre LIKE ? OR pf.municipio_vereda LIKE ? OR pf.region LIKE ? OR u.nombre LIKE ? OR p.categoria LIKE ?)';
      const term = `%${q.trim()}%`;
      params.push(term, term, term, term, term);
    }

    sql += ' ORDER BY p.id DESC';

    const productos = db.prepare(sql).all(...params);
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar productos', detalle: error.message });
  }
});

// POST /api/productos -> Portal del Productor: Publicar cosecha
app.post('/api/productos', (req, res) => {
  try {
    const {
      finca_id,
      nombre,
      categoria,
      unidad_medida,
      precio_campesino,
      precio_supermercado_ref,
      stock_disponible,
      fecha_cosecha,
      imagen_url
    } = req.body;

    if (!finca_id || !nombre || !categoria || !unidad_medida || !precio_campesino || !stock_disponible) {
      return res.status(400).json({
        error: 'Campos requeridos incompletos',
        requeridos: ['finca_id', 'nombre', 'categoria', 'unidad_medida', 'precio_campesino', 'stock_disponible']
      });
    }

    const finca = db.prepare('SELECT id FROM productores_fincas WHERE id = ?').get(finca_id);
    if (!finca) {
      return res.status(404).json({ error: 'La finca seleccionada no existe' });
    }

    const precioCampesinoNum = parseInt(precio_campesino, 10);
    const precioRefNum = precio_supermercado_ref ? parseInt(precio_supermercado_ref, 10) : Math.round(precioCampesinoNum * 1.35);
    const stockNum = parseInt(stock_disponible, 10);
    const fechaCosechaTxt = fecha_cosecha && fecha_cosecha.trim() ? fecha_cosecha.trim() : 'Hoy en la madrugada';
    const fotoFinal = imagen_url && imagen_url.trim()
      ? imagen_url.trim()
      : 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=600&auto=format&fit=crop';

    const insertStmt = db.prepare(`
      INSERT INTO productos (
        finca_id, nombre, categoria, unidad_medida,
        precio_campesino, precio_supermercado_ref,
        stock_disponible, fecha_cosecha, imagen_url, activo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const result = insertStmt.run(
      finca_id,
      nombre.trim(),
      categoria,
      unidad_medida.trim(),
      precioCampesinoNum,
      precioRefNum,
      stockNum,
      fechaCosechaTxt,
      fotoFinal
    );

    const nuevoProducto = db.prepare(`
      SELECT 
        p.*,
        pf.nombre_finca,
        pf.region,
        pf.municipio_vereda,
        pf.altitud_msnm,
        pf.tipo_cultivo,
        pf.historia_productor,
        u.nombre AS nombre_campesino
      FROM productos p
      JOIN productores_fincas pf ON p.finca_id = pf.id
      JOIN usuarios u ON pf.usuario_id = u.id
      WHERE p.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      mensaje: 'Cosecha publicada con éxito en DelCampoApp',
      producto: nuevoProducto
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al publicar cosecha', detalle: error.message });
  }
});

// PATCH /api/productos/:id/stock -> Actualización rápida de stock o precio
app.patch('/api/productos/:id/stock', (req, res) => {
  try {
    const { id } = req.params;
    const { stock_disponible, precio_campesino } = req.body;

    const producto = db.prepare('SELECT * FROM productos WHERE id = ?').get(id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const updates = [];
    const params = [];

    if (stock_disponible !== undefined) {
      updates.push('stock_disponible = ?');
      params.push(Math.max(0, parseInt(stock_disponible, 10)));
    }

    if (precio_campesino !== undefined) {
      const nuevoPrecio = parseInt(precio_campesino, 10);
      updates.push('precio_campesino = ?');
      params.push(nuevoPrecio);
      updates.push('precio_supermercado_ref = ?');
      params.push(Math.round(nuevoPrecio * 1.35));
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No se enviaron campos válidos para actualizar' });
    }

    params.push(id);
    db.prepare(`UPDATE productos SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const actualizado = db.prepare('SELECT * FROM productos WHERE id = ?').get(id);
    res.json({
      mensaje: 'Producto actualizado exitosamente',
      producto: actualizado
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar producto', detalle: error.message });
  }
});

// ==============================================================================
// 3. ENDPOINTS DE FINCAS Y PUNTOS ALIADOS
// ==============================================================================

// GET /api/fincas -> Fincas registradas y cobertura regional
app.get('/api/fincas', (req, res) => {
  try {
    const fincas = db.prepare(`
      SELECT 
        pf.*,
        u.nombre as nombre_productor,
        u.telefono,
        u.email,
        (SELECT count(*) FROM productos WHERE finca_id = pf.id AND activo = 1) as total_productos_activos
      FROM productores_fincas pf
      JOIN usuarios u ON pf.usuario_id = u.id
      ORDER BY pf.id ASC
    `).all();

    res.json(fincas);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar fincas', detalle: error.message });
  }
});

// GET /api/puntos-aliados -> Red urbana de tiendas para retiro a $0 COP
app.get('/api/puntos-aliados', (req, res) => {
  try {
    const aliados = db.prepare('SELECT * FROM puntos_aliados ORDER BY id ASC').all();
    res.json(aliados);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar puntos aliados', detalle: error.message });
  }
});

// GET /api/usuarios -> Perfiles
app.get('/api/usuarios', (req, res) => {
  try {
    const { rol } = req.query;
    let sql = 'SELECT id, nombre, email, telefono, rol, ubicacion FROM usuarios';
    const params = [];
    if (rol) {
      sql += ' WHERE rol = ?';
      params.push(rol);
    }
    sql += ' ORDER BY id ASC';
    const usuarios = db.prepare(sql).all(...params);
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar usuarios', detalle: error.message });
  }
});

// ==============================================================================
// 4. ENDPOINTS DE PEDIDOS Y RUTAS PROGRAMADAS (TRANSACCIÓN SQL)
// ==============================================================================

app.get('/api/pedidos', (req, res) => {
  try {
    const { estado } = req.query;
    let sql = `
      SELECT 
        p.*,
        u.nombre AS nombre_comprador,
        u.telefono AS telefono_comprador,
        u.ubicacion AS ubicacion_comprador,
        pa.nombre_tienda,
        pa.ciudad_departamento,
        pa.direccion AS direccion_tienda,
        pa.horario_retiro
      FROM pedidos p
      JOIN usuarios u ON p.comprador_id = u.id
      LEFT JOIN puntos_aliados pa ON p.punto_aliado_id = pa.id
    `;
    const params = [];

    if (estado) {
      sql += ' WHERE p.estado = ?';
      params.push(estado);
    }

    sql += ' ORDER BY p.id DESC';

    const pedidos = db.prepare(sql).all(...params);

    const detalleStmt = db.prepare(`
      SELECT 
        dp.*,
        pr.nombre AS nombre_producto,
        pr.unidad_medida,
        pr.imagen_url,
        pf.nombre_finca,
        pf.region,
        pf.municipio_vereda,
        u.nombre AS nombre_campesino
      FROM detalle_pedidos dp
      JOIN productos pr ON dp.producto_id = pr.id
      JOIN productores_fincas pf ON pr.finca_id = pf.id
      JOIN usuarios u ON pf.usuario_id = u.id
      WHERE dp.pedido_id = ?
    `);

    const pedidosConDetalles = pedidos.map(ped => {
      const items = detalleStmt.all(ped.id);
      return {
        ...ped,
        items
      };
    });

    res.json(pedidosConDetalles);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar pedidos', detalle: error.message });
  }
});

// POST /api/pedidos -> Creación de orden consolidada en transacción ACID
app.post('/api/pedidos', (req, res) => {
  try {
    const {
      comprador_id,
      modalidad_entrega,
      punto_aliado_id,
      direccion_entrega,
      fecha_programada,
      items
    } = req.body;

    if (!comprador_id || !modalidad_entrega || !fecha_programada || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Datos del pedido incompletos',
        detalle: 'Se requiere comprador_id, modalidad_entrega, fecha_programada y al menos un ítem'
      });
    }

    if (!['DOMICILIO', 'PUNTO_ALIADO'].includes(modalidad_entrega)) {
      return res.status(400).json({ error: 'Modalidad de entrega inválida. Debe ser DOMICILIO o PUNTO_ALIADO' });
    }

    if (modalidad_entrega === 'PUNTO_ALIADO' && !punto_aliado_id) {
      return res.status(400).json({ error: 'Debe seleccionar una tienda aliada para el retiro' });
    }

    if (modalidad_entrega === 'DOMICILIO' && (!direccion_entrega || !direccion_entrega.trim())) {
      return res.status(400).json({ error: 'Debe indicar la dirección para la entrega a domicilio' });
    }

    const comprador = db.prepare('SELECT id, nombre, email, telefono FROM usuarios WHERE id = ?').get(comprador_id);
    if (!comprador) {
      return res.status(404).json({ error: 'El comprador especificado no existe' });
    }

    const crearPedidoTx = db.transaction(() => {
      let subtotalCampesinos = 0;
      let ahorroEstimadoTotal = 0;
      const itemsVerificados = [];

      for (const item of items) {
        const prod = db.prepare('SELECT * FROM productos WHERE id = ? AND activo = 1').get(item.producto_id);
        if (!prod) {
          throw new Error(`El producto con ID ${item.producto_id} no está disponible.`);
        }

        const cantidad = parseInt(item.cantidad, 10);
        if (isNaN(cantidad) || cantidad <= 0) {
          throw new Error(`Cantidad inválida para '${prod.nombre}'.`);
        }

        if (prod.stock_disponible < cantidad) {
          throw new Error(
            `Stock insuficiente para '${prod.nombre}'. Solicitado: ${cantidad}, disponible: ${prod.stock_disponible}`
          );
        }

        const itemSubtotal = prod.precio_campesino * cantidad;
        subtotalCampesinos += itemSubtotal;
        ahorroEstimadoTotal += (prod.precio_supermercado_ref - prod.precio_campesino) * cantidad;

        itemsVerificados.push({
          producto: prod,
          cantidad,
          precio_unitario: prod.precio_campesino,
          subtotal: itemSubtotal
        });
      }

      const comisionPlataforma = Math.round(subtotalCampesinos * 0.07);
      const costoEnvio = modalidad_entrega === 'DOMICILIO' ? 4500 : 0;
      const totalPagar = subtotalCampesinos + comisionPlataforma + costoEnvio;

      const insertPedidoStmt = db.prepare(`
        INSERT INTO pedidos (
          comprador_id, modalidad_entrega, punto_aliado_id,
          direccion_entrega, fecha_programada,
          subtotal_campesinos, comision_plataforma, costo_envio, total_pagar, estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PROGRAMADO')
      `);

      const pedidoInfo = insertPedidoStmt.run(
        comprador_id,
        modalidad_entrega,
        modalidad_entrega === 'PUNTO_ALIADO' ? punto_aliado_id : null,
        modalidad_entrega === 'DOMICILIO' ? direccion_entrega.trim() : null,
        fecha_programada.trim(),
        subtotalCampesinos,
        comisionPlataforma,
        costoEnvio,
        totalPagar
      );

      const nuevoPedidoId = pedidoInfo.lastInsertRowid;

      const insertDetalleStmt = db.prepare(`
        INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `);

      const updateStockStmt = db.prepare(`
        UPDATE productos 
        SET stock_disponible = stock_disponible - ? 
        WHERE id = ?
      `);

      for (const verificado of itemsVerificados) {
        insertDetalleStmt.run(
          nuevoPedidoId,
          verificado.producto.id,
          verificado.cantidad,
          verificado.precio_unitario,
          verificado.subtotal
        );

        updateStockStmt.run(verificado.cantidad, verificado.producto.id);
      }

      return {
        pedido_id: nuevoPedidoId,
        comprador,
        modalidad_entrega,
        fecha_programada,
        desglose_transparencia: {
          subtotal_campesinos_cop: subtotalCampesinos,
          porcentaje_campesino: '93%',
          comision_plataforma_cop: comisionPlataforma,
          porcentaje_plataforma: '7%',
          costo_envio_cop: costoEnvio,
          total_pagar_cop: totalPagar,
          ahorro_estimado_supermercado_cop: ahorroEstimadoTotal
        },
        items: itemsVerificados.map(i => ({
          producto_id: i.producto.id,
          nombre: i.producto.nombre,
          unidad_medida: i.producto.unidad_medida,
          cantidad: i.cantidad,
          precio_unitario: i.precio_unitario,
          subtotal: i.subtotal
        }))
      };
    });

    const resultado = crearPedidoTx();

    res.status(201).json({
      mensaje: 'Pedido confirmado y programado exitosamente',
      pedido: resultado
    });
  } catch (error) {
    res.status(400).json({ error: 'Error al procesar pedido', detalle: error.message });
  }
});

// PATCH /api/pedidos/:id/estado
app.patch('/api/pedidos/:id/estado', (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ['PROGRAMADO', 'EN_RUTA_RURAL', 'ENTREGADO'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        error: 'Estado no válido',
        estadosValidos
      });
    }

    const pedido = db.prepare('SELECT id, estado FROM pedidos WHERE id = ?').get(id);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    db.prepare('UPDATE pedidos SET estado = ? WHERE id = ?').run(estado, id);

    const pedidoActualizado = db.prepare(`
      SELECT p.*, u.nombre AS nombre_comprador 
      FROM pedidos p 
      JOIN usuarios u ON p.comprador_id = u.id 
      WHERE p.id = ?
    `).get(id);

    res.json({
      mensaje: `Estado del pedido #${id} actualizado a '${estado}'`,
      pedido: pedidoActualizado
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar estado del pedido', detalle: error.message });
  }
});

// Fallback SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Arrancar servidor
app.listen(PORT, () => {
  console.log('============================================================');
  console.log(`🚀 [DelCampoApp] Servidor Web Express en http://localhost:${PORT}`);
  console.log(`🌾 Del campo colombiano directo a tu mesa y negocio`);
  console.log(`💾 Base de datos SQLite activa: ${DB_FILE}`);
  console.log('============================================================');
});
