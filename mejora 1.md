# Prompt de Transformación a Producto Real (Startup AgTech Nacional)

Copia y pega este prompt en tu agente de código en **Antigravity**. Está diseñado para limpiar todos los errores técnicos del repositorio actual, quitar cualquier rastro de "tarea del SENA" de la interfaz y convertir **DelCampoApp** en un producto comercial con cobertura en **Colombia (incluyendo el Caribe/Atlántico y diversas regiones agrícolas del país)**:

```markdown
# OBJETIVO: TRANSFORMAR EL REPOSITORIO EN UN PRODUCTO COMERCIAL REAL (SIN RASTROS DE TAREA ACADÉMICA)

Revisa todo el repositorio actual de **DelCampoApp** y aplica de forma estricta las siguientes correcciones técnicas, de datos y de diseño de producto:

---

## 1. CERO APARIENCIA DE "TAREA ESCOLAR" EN LA INTERFAZ Y EL CÓDIGO
- **Elimina de inmediato** el archivo `prompt_agente_antigravity_delcampoapp_bit_cora_4.md` de la raíz del proyecto.
- **En `public/index.html` y `public/js/app.js`:** Elimina ABSOLUTAMENTE TODA mención a "SENA", "Bitácora 4", "Ficha 3186266", "Centro ASTIN", "Modo Demostración SENA", "Evaluador SENA" o el nombre del estudiante dentro de la aplicación web.
- La aplicación debe verse 100% como una **Startup AgTech comercial real en producción** llamada **DelCampoApp** (*"Del campo colombiano directo a tu mesa y negocio"*).
- En lugar de "Selector de Rol SENA", la barra de navegación superior debe tener una navegación de producto real y limpia:
  1. **Mercado Campesino** (Catálogo e Historias del Origen)
  2. **Mi Canasta Programada** (Carrito y Checkout con Puntos Aliados)
  3. **Portal del Productor** (Publicación fácil de cosechas e inventario)
  4. **Centro de Operaciones y Rutas** (Gestión de despachos semanales)

---

## 2. ALCANCE NACIONAL / MULTIRREGIONAL (NO EXCLUSIVO DE CALI)
- **DelCampoApp** conecta el campo colombiano con las ciudades y comercios locales en distintas regiones del país (Caribe / Atlántico, Antioquia, Cundinamarca/Sabana, Eje Cafetero, etc.).
- **Actualiza `database/seed.sql` y los textos del frontend** para eliminar el sesgo exclusivo hacia Cali y reemplazarlo por datos diversos de **Colombia (con presencia destacada de la Región Caribe / Atlántico y el interior del país)**:
  - **Productor 1 (Región Caribe / Atlántico):** *Don Rafael Mendoza* — Finca "Villa Rosa", Municipio de Baranoa / Polonuevo (Atlántico), Cultivo Tradicional Limpio (Yuca criolla, Ñame espino, Plátano hartón, Limón Tahití, Queso costeño fresco).
  - **Productor 2 (Sabana / Cundinamarca):** *Doña María del Carmen Vargas* — Finca "El Rocío", Subachoque (Cundinamarca), Cultivo Agroecológico (Papa pastusa, Cebolla junca, Fresas frescas, Huevos campesinos de pastoreo).
  - **Productor 3 (Antioquia / Eje Cafetero):** *Asociación Agropecuaria Tierra Viva* — El Santuario / Marinilla (Antioquia), Cultivo Orgánico (Aguacate Hass/Papelillo, Tomate chonto, Lechuga hidropónica, Fríjol cargamanto).
- **Actualiza los Puntos Aliados de Retiro (`puntos_aliados` en `seed.sql`)** para que representen comercios y tiendas de barrio reales en distintas zonas urbanas (ej. Barranquilla / Área Metropolitana del Atlántico, Bogotá y Medellín):
  1. *Abastos y Tienda La Esquina Real* — Barrio El Prado / Norte (Barranquilla, Atlántico)
  2. *Minimercado Los Robles* — Soledad / Área Metropolitana (Atlántico)
  3. *Fruver y Despensa La Cosecha* — Chapinero (Bogotá D.C.)
  4. *Mercadito Campesino Laureles* — Laureles (Medellín, Antioquia)
- Agrega en la barra superior o en el catálogo un **filtro opcional por Región / Zona** (*Todas las regiones, Caribe y Atlántico, Sabana y Centro, Antioquia y Eje*) para que el producto se sienta como una plataforma escalable en toda Colombia.

---

## 3. CORRECCIÓN DE ARCHIVOS DE BASE DE DATOS Y `.gitignore`
- **Corrige el archivo `.gitignore`:** Cambia el error `jnode_modules/` por `node_modules/` y añade:
  ```
  node_modules/
  database/*.db-shm
  database/*.db-wal
  .env
  *.log
  .DS_Store
  ```
- **Consolida SQLite (`database/db.js` e `init_db.js`):**
  - Configura `PRAGMA journal_mode = DELETE;` (o haz checkpoint completo al inicializar) para que no se generen ni queden abiertos los archivos residuales `delcampoapp.db-shm` y `delcampoapp.db-wal`.
  - Elimina `database/delcampoapp.db-shm` y `database/delcampoapp.db-wal` del repositorio y regenera `database/delcampoapp.db` limpio con los nuevos datos nacionales de `seed.sql`.

---

## 4. PULIDO DE EXPERIENCIA DE USUARIO (UI/UX DE PRODUCTO FINAL)
- **Tarjetas de Producto:** Deben lucir como un e-commerce moderno: foto nítida (con `onerror` de respaldo para que ninguna imagen se rompa), badge de región/municipio (ej. *"Baranoa, Atlántico"*), sello *"Trato Directo - 93% para el productor"*, comparativa de ahorro frente a grandes superficies y botón *"Conocer la finca"* (modal con la historia del agricultor, tipo de cultivo y fecha de cosecha).
- **Portal del Productor:** Debe verse como una herramienta real para agricultores (*"Publicar cosecha disponible"*), con selector rápido de fotografías reales de alimentos para que al publicar un producto nuevo en vivo se vea inmediatamente con una foto profesional en el catálogo.
- **README.md:** Mantén un `README.md` limpio y profesional de proyecto de software open-source / startup (descripción del producto, características clave, arquitectura técnica, modelo de datos en Mermaid, guía de instalación con `npm install` y `npm start`, y referencia sobria al final en la sección "Autor / Créditos: Paulo Andrés De los Reyes González").

---

## 5. VERIFICACIÓN FINAL OBLIGATORIA
1. Ejecuta `node database/init_db.js` para recrear `database/delcampoapp.db` con los nuevos datos de Atlántico/Colombia.
2. Verifica que no existan los archivos `prompt_agente_antigravity...`, `*.db-shm` ni `*.db-wal`.
3. Inicia el servidor y verifica que todos los endpoints REST (`/api/productos`, `/api/fincas`, `/api/puntos-aliados`, `/api/pedidos`) funcionen sin errores.
```