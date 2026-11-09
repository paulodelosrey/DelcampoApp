// ==============================================================================
// DELCAMPOAPP - LÓGICA FRONTEND MODULAR
// Ficha SENA ASTIN: 3186266 | Bitácora 4
// Aprendiz: Paulo Andrés De los Reyes González
// ==============================================================================

const app = {
  // Estado reactivo de la aplicación
  state: {
    currentRole: 'catalogo',
    products: [],
    fincas: [],
    puntosAliados: [],
    orders: [],
    stats: {},
    cart: [],
    selectedCategory: 'Todos',
    searchQuery: '',
    activeFarmerFincaId: 1,
    deliveryMode: 'PUNTO_ALIADO',
    health: null
  },

  // Inicialización
  async init() {
    console.log('🌱 Inicializando DelCampoApp SPA...');
    this.loadCartFromStorage();
    await this.fetchInitialData();
    this.setRole('catalogo');
    this.setupEventListeners();
  },

  // Cargar datos del backend
  async fetchInitialData() {
    try {
      const [prodsRes, fincasRes, aliadosRes, healthRes] = await Promise.all([
        fetch('/api/productos'),
        fetch('/api/fincas'),
        fetch('/api/puntos-aliados'),
        fetch('/api/health')
      ]);

      if (prodsRes.ok) this.state.products = await prodsRes.json();
      if (fincasRes.ok) this.state.fincas = await fincasRes.json();
      if (aliadosRes.ok) this.state.puntosAliados = await aliadosRes.json();
      if (healthRes.ok) this.state.health = await healthRes.json();

      this.populateFincaSelects();
      this.populatePuntoAliadoSelect();
      this.updateCartBadges();
      this.renderCatalog();
    } catch (err) {
      console.error('Error al cargar datos iniciales:', err);
      this.showToast('Error al conectar con el servidor', 'error');
    }
  },

  // Selector de roles en vivo (Modo demostración SENA)
  setRole(role) {
    this.state.currentRole = role;

    // Actualizar tabs de navegación
    ['catalogo', 'carrito', 'campesino', 'logistica'].forEach(r => {
      const btn = document.getElementById(`btn-nav-${r}`);
      const view = document.getElementById(`view-${r}`);
      if (btn) {
        if (r === role) {
          btn.className = 'nav-tab px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all bg-white text-agro-800 shadow-sm';
        } else {
          btn.className = 'nav-tab px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all text-gray-600 hover:text-gray-900';
        }
      }
      if (view) {
        if (r === role) {
          view.classList.remove('hidden');
        } else {
          view.classList.add('hidden');
        }
      }
    });

    // Sincronizar select móvil
    const mobileSelect = document.getElementById('mobile-role-select');
    if (mobileSelect) mobileSelect.value = role;

    // Acciones específicas por rol
    if (role === 'catalogo') {
      this.renderCatalog();
    } else if (role === 'carrito') {
      this.renderCart();
    } else if (role === 'campesino') {
      this.renderFarmerPanel();
    } else if (role === 'logistica') {
      this.refreshLogisticaData();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // ==============================================================================
  // VISTA 1: CATÁLOGO DIGITAL Y TRAZABILIDAD
  // ==============================================================================

  setCategory(cat) {
    this.state.selectedCategory = cat;
    const pills = document.querySelectorAll('#category-filter-container .cat-pill');
    pills.forEach(p => {
      if (p.textContent.includes(cat) || (cat === 'Todos' && p.textContent.includes('Todas'))) {
        p.className = 'cat-pill active px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-agro-800 text-white shadow-sm whitespace-nowrap';
      } else {
        p.className = 'cat-pill px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 whitespace-nowrap';
      }
    });
    this.filterProducts();
  },

  filterProducts() {
    const searchInput = document.getElementById('catalog-search');
    this.state.searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filtered = this.state.products.filter(p => {
      const matchCat = this.state.selectedCategory === 'Todos' || p.categoria === this.state.selectedCategory;
      const matchSearch = !this.state.searchQuery ||
        p.nombre.toLowerCase().includes(this.state.searchQuery) ||
        p.municipio_vereda.toLowerCase().includes(this.state.searchQuery) ||
        p.nombre_campesino.toLowerCase().includes(this.state.searchQuery) ||
        p.categoria.toLowerCase().includes(this.state.searchQuery);
      return matchCat && matchSearch;
    });

    const countEl = document.getElementById('catalog-count');
    if (countEl) countEl.textContent = filtered.length;

    this.renderProductCards(filtered);
  },

  renderCatalog() {
    this.filterProducts();
  },

  renderProductCards(items) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    if (items.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-12 text-center text-gray-500 space-y-3">
          <i class="fa-solid fa-leaf text-4xl text-gray-300"></i>
          <p class="font-bold text-base">No se encontraron cosechas con los criterios seleccionados.</p>
          <button onclick="app.setCategory('Todos'); document.getElementById('catalog-search').value='';"
            class="text-xs font-bold text-agro-700 hover:underline">Ver todas las cosechas</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = items.map(p => {
      const ahorro = p.porcentaje_ahorro || Math.round(((p.precio_supermercado_ref - p.precio_campesino) / p.precio_supermercado_ref) * 100);
      const enStock = p.stock_disponible > 0;

      return `
        <div class="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col transition-card">
          <!-- Imagen del producto -->
          <div class="relative h-48 w-full overflow-hidden bg-gray-100">
            <img src="${p.imagen_url}" alt="${p.nombre}"
              class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              onerror="this.src='https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop'" />
            
            <!-- Badges flotantes -->
            <div class="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
              <span class="badge-origen text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                <i class="fa-solid fa-handshake"></i> 0% Intermediarios
              </span>
              <span class="badge-ahorro text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md">
                Ahorras ${ahorro}% vs Supermercado
              </span>
            </div>

            <!-- Badge Categoría -->
            <div class="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              ${p.categoria}
            </div>
          </div>

          <!-- Contenido de la tarjeta -->
          <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
            
            <div class="space-y-1.5">
              <div class="flex items-start justify-between gap-2">
                <h3 class="font-extrabold text-lg text-gray-900 leading-snug">${p.nombre}</h3>
                <span class="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md whitespace-nowrap">
                  ${p.unidad_medida}
                </span>
              </div>

              <!-- Precios: Campesino vs Supermercado -->
              <div class="flex items-baseline gap-2 pt-1">
                <span class="text-2xl font-black text-agro-900">$${p.precio_campesino.toLocaleString('es-CO')}</span>
                <span class="text-xs text-gray-400 line-through">$${p.precio_supermercado_ref.toLocaleString('es-CO')}</span>
              </div>
            </div>

            <!-- ETIQUETA INTERACTIVA DE TRAZABILIDAD DE ORIGEN -->
            <div class="bg-agro-50/70 border border-agro-200/80 rounded-2xl p-3 space-y-2">
              <div class="text-[11px] text-gray-600 flex items-center justify-between">
                <span class="font-bold text-agro-900 flex items-center gap-1">
                  <i class="fa-solid fa-person-digging text-agro-700"></i> ${p.nombre_campesino}
                </span>
                <span class="text-agro-700 font-semibold">${p.altitud_msnm || 'Valle'}</span>
              </div>

              <div class="text-[11px] text-gray-500 flex items-center gap-1">
                <i class="fa-solid fa-location-dot text-red-500"></i>
                <span class="truncate">${p.nombre_finca} · ${p.municipio_vereda}</span>
              </div>

              <button onclick="app.openTraceabilityModal(${p.id})"
                class="w-full text-center py-1.5 bg-white hover:bg-agro-100 text-agro-800 font-extrabold text-xs rounded-xl border border-agro-300 transition-colors flex items-center justify-center gap-1.5 shadow-2xs">
                <i class="fa-solid fa-circle-info text-agro-600"></i>
                <span>Ver origen del cultivo</span>
              </button>
            </div>

            <!-- Disponibilidad y Botón de Canasta -->
            <div class="pt-1 flex items-center justify-between gap-3">
              <div class="text-[11px] font-bold ${enStock ? 'text-green-700' : 'text-red-600'}">
                <i class="fa-solid fa-box mr-1"></i>
                <span>${enStock ? `${p.stock_disponible} disponibles` : 'Agotado'}</span>
              </div>

              <button onclick="app.addToCart(${p.id})" ${!enStock ? 'disabled' : ''}
                class="px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all ${
                  enStock
                    ? 'bg-agro-800 hover:bg-agro-900 text-white cursor-pointer active:scale-95'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }">
                <i class="fa-solid fa-cart-plus"></i>
                <span>Agregar</span>
              </button>
            </div>

          </div>
        </div>
      `;
    }).join('');
  },

  // Modal de Trazabilidad
  openTraceabilityModal(productId) {
    const prod = this.state.products.find(p => p.id === productId);
    if (!prod) return;

    document.getElementById('modal-trace-crop-name').textContent = prod.nombre;
    document.getElementById('modal-trace-farmer').textContent = prod.nombre_campesino;
    document.getElementById('modal-trace-phone').innerHTML = `<i class="fa-solid fa-phone mr-1"></i> Contacto directo: ${prod.telefono_campesino || '315 784 9201'}`;
    document.getElementById('modal-trace-farm').textContent = prod.nombre_finca;
    document.getElementById('modal-trace-location').innerHTML = `<i class="fa-solid fa-location-dot mr-1 text-red-500"></i> ${prod.municipio_vereda}`;
    document.getElementById('modal-trace-altitude').textContent = prod.altitud_msnm || 'Cordillera Valle';
    document.getElementById('modal-trace-type').textContent = prod.tipo_cultivo || 'Agroecológico Limpio';
    document.getElementById('modal-trace-harvest').textContent = prod.fecha_cosecha || 'Cosechado hoy';
    document.getElementById('modal-trace-story').textContent = prod.historia_productor ||
      'Agricultor tradicional del departamento del Valle del Cauca comprometido con la soberanía alimentaria, el no uso de químicos tóxicos y la protección de los páramos y cuencas hídricas.';

    const modal = document.getElementById('modal-traceability');
    if (modal) modal.classList.remove('hidden');
  },

  // ==============================================================================
  // VISTA 2: CANASTA Y PROGRAMACIÓN DE PEDIDOS
  // ==============================================================================

  addToCart(productId, qty = 1) {
    const prod = this.state.products.find(p => p.id === productId);
    if (!prod) return;

    const existingIndex = this.state.cart.findIndex(item => item.productId === productId);

    if (existingIndex > -1) {
      const currentQty = this.state.cart[existingIndex].quantity;
      if (currentQty + qty > prod.stock_disponible) {
        this.showToast(`Stock máximo alcanzado (${prod.stock_disponible} ${prod.unidad_medida})`, 'warning');
        return;
      }
      this.state.cart[existingIndex].quantity += qty;
    } else {
      if (prod.stock_disponible < qty) {
        this.showToast('No hay suficiente stock disponible', 'warning');
        return;
      }
      this.state.cart.push({
        productId,
        quantity: qty
      });
    }

    this.saveCartToStorage();
    this.updateCartBadges();
    this.showToast(`¡${prod.nombre} agregado a tu canasta!`, 'success');
  },

  updateCartItemQty(productId, delta) {
    const item = this.state.cart.find(i => i.productId === productId);
    if (!item) return;

    const prod = this.state.products.find(p => p.id === productId);
    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      this.removeFromCart(productId);
      return;
    }

    if (prod && newQty > prod.stock_disponible) {
      this.showToast(`Solo hay ${prod.stock_disponible} unidades disponibles`, 'warning');
      return;
    }

    item.quantity = newQty;
    this.saveCartToStorage();
    this.updateCartBadges();
    this.renderCart();
  },

  removeFromCart(productId) {
    this.state.cart = this.state.cart.filter(i => i.productId !== productId);
    this.saveCartToStorage();
    this.updateCartBadges();
    this.renderCart();
    this.showToast('Alimento removido de tu canasta', 'info');
  },

  clearCart() {
    this.state.cart = [];
    this.saveCartToStorage();
    this.updateCartBadges();
    this.renderCart();
  },

  toggleDeliveryMode(mode) {
    this.state.deliveryMode = mode;
    const labelAliado = document.getElementById('label-mod-aliado');
    const labelDomicilio = document.getElementById('label-mod-domicilio');
    const wrapPunto = document.getElementById('select-punto-aliado-wrap');
    const wrapDir = document.getElementById('input-direccion-wrap');

    if (mode === 'PUNTO_ALIADO') {
      labelAliado.className = 'flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all border-agro-700 bg-agro-50/60';
      labelDomicilio.className = 'flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all border-gray-200 bg-white hover:border-gray-300';
      wrapPunto.classList.remove('hidden');
      wrapDir.classList.add('hidden');
    } else {
      labelDomicilio.className = 'flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all border-agro-700 bg-agro-50/60';
      labelAliado.className = 'flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all border-gray-200 bg-white hover:border-gray-300';
      wrapDir.classList.remove('hidden');
      wrapPunto.classList.add('hidden');
    }

    this.calculateTransparency();
  },

  renderCart() {
    const list = document.getElementById('cart-items-list');
    const clearWrap = document.getElementById('cart-clear-btn-wrap');
    const qtyText = document.getElementById('cart-items-qty-text');
    const btnSubmit = document.getElementById('btn-submit-order');

    if (!list) return;

    if (this.state.cart.length === 0) {
      list.innerHTML = `
        <div class="py-12 text-center text-gray-500 space-y-4">
          <i class="fa-solid fa-basket-shopping text-5xl text-gray-300"></i>
          <div>
            <p class="font-extrabold text-base text-gray-800">Tu canasta está vacía</p>
            <p class="text-xs text-gray-500">Explora el catálogo y apoya directamente a los campesinos del Valle del Cauca.</p>
          </div>
          <button onclick="app.setRole('catalogo')" class="px-5 py-2.5 bg-agro-800 text-white font-bold text-xs rounded-xl shadow-md">
            Ir al Catálogo de Cosechas
          </button>
        </div>
      `;
      if (clearWrap) clearWrap.classList.add('hidden');
      if (qtyText) qtyText.textContent = '0 ítems';
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.classList.add('opacity-50', 'cursor-not-allowed');
      }
      this.calculateTransparency();
      return;
    }

    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.classList.remove('opacity-50', 'cursor-not-allowed');
    }
    if (clearWrap) clearWrap.classList.remove('hidden');

    let totalItemsCount = 0;

    list.innerHTML = this.state.cart.map(item => {
      const prod = this.state.products.find(p => p.id === item.productId);
      if (!prod) return '';

      totalItemsCount += item.quantity;
      const subtotal = prod.precio_campesino * item.quantity;

      return `
        <div class="py-4 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <img src="${prod.imagen_url}" alt="${prod.nombre}"
              class="w-14 h-14 rounded-2xl object-cover bg-gray-100 border border-gray-200"
              onerror="this.src='https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop'" />
            <div>
              <div class="font-bold text-sm text-gray-900">${prod.nombre}</div>
              <div class="text-[11px] text-gray-500">${prod.nombre_finca} · ${prod.unidad_medida}</div>
              <div class="text-xs font-black text-agro-800">$${prod.precio_campesino.toLocaleString('es-CO')} c/u</div>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <!-- Stepper +/- -->
            <div class="flex items-center border border-gray-300 rounded-xl bg-gray-50 p-1">
              <button onclick="app.updateCartItemQty(${prod.id}, -1)" class="w-7 h-7 flex items-center justify-center text-gray-700 hover:bg-white rounded-lg font-bold">
                <i class="fa-solid fa-minus text-xs"></i>
              </button>
              <span class="w-8 text-center font-black text-xs text-gray-900">${item.quantity}</span>
              <button onclick="app.updateCartItemQty(${prod.id}, 1)" class="w-7 h-7 flex items-center justify-center text-gray-700 hover:bg-white rounded-lg font-bold">
                <i class="fa-solid fa-plus text-xs"></i>
              </button>
            </div>

            <!-- Subtotal ítem -->
            <div class="text-right min-w-[75px]">
              <div class="font-extrabold text-sm text-gray-900">$${subtotal.toLocaleString('es-CO')}</div>
              <button onclick="app.removeFromCart(${prod.id})" class="text-[10px] text-red-500 hover:underline">Eliminar</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (qtyText) qtyText.textContent = `${totalItemsCount} unidades`;
    this.calculateTransparency();
  },

  calculateTransparency() {
    let subtotalCampesinos = 0;
    let ahorroTotal = 0;

    this.state.cart.forEach(item => {
      const prod = this.state.products.find(p => p.id === item.productId);
      if (prod) {
        subtotalCampesinos += prod.precio_campesino * item.quantity;
        ahorroTotal += (prod.precio_supermercado_ref - prod.precio_campesino) * item.quantity;
      }
    });

    const comision = Math.round(subtotalCampesinos * 0.07);
    const envio = this.state.deliveryMode === 'DOMICILIO' ? 4500 : 0;
    const total = subtotalCampesinos + comision + envio;

    // Actualizar recuadro de transparencia económica
    const elCampesino = document.getElementById('transparency-campesino');
    const elComision = document.getElementById('transparency-comision');
    const elEnvio = document.getElementById('transparency-envio');
    const elTotal = document.getElementById('transparency-total');
    const elAhorro = document.getElementById('transparency-ahorro');

    if (elCampesino) elCampesino.textContent = `$${subtotalCampesinos.toLocaleString('es-CO')} COP`;
    if (elComision) elComision.textContent = `$${comision.toLocaleString('es-CO')} COP`;
    if (elEnvio) elEnvio.textContent = envio === 0 ? '$0 COP (Punto Aliado)' : '$4.500 COP (Domicilio)';
    if (elTotal) elTotal.textContent = `$${total.toLocaleString('es-CO')} COP`;
    if (elAhorro) elAhorro.textContent = `$${ahorroTotal.toLocaleString('es-CO')} COP`;
  },

  async submitOrder() {
    if (this.state.cart.length === 0) {
      this.showToast('Agrega alimentos a tu canasta antes de confirmar', 'warning');
      return;
    }

    const buyerId = parseInt(document.getElementById('checkout-buyer-select').value, 10);
    const fechaProgramadaRadio = document.querySelector('input[name="fecha_programada"]:checked');
    const fechaProgramada = fechaProgramadaRadio ? fechaProgramadaRadio.value : 'Próximo Miércoles - Ruta Valle';
    const puntoAliadoSelect = document.getElementById('checkout-punto-aliado');
    const puntoAliadoId = this.state.deliveryMode === 'PUNTO_ALIADO' ? parseInt(puntoAliadoSelect.value, 10) : null;
    const direccionInput = document.getElementById('checkout-direccion');
    const direccion = this.state.deliveryMode === 'DOMICILIO' ? (direccionInput ? direccionInput.value.trim() : '') : null;

    if (this.state.deliveryMode === 'DOMICILIO' && (!direccion || direccion.length < 5)) {
      this.showToast('Por favor ingresa la dirección de entrega en Cali', 'warning');
      if (direccionInput) direccionInput.focus();
      return;
    }

    const payload = {
      comprador_id: buyerId,
      modalidad_entrega: this.state.deliveryMode,
      punto_aliado_id: puntoAliadoId,
      direccion_entrega: direccion,
      fecha_programada: fechaProgramada,
      items: this.state.cart.map(i => ({
        producto_id: i.productId,
        cantidad: i.quantity
      }))
    };

    try {
      const btn = document.getElementById('btn-submit-order');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando en SQLite...';
      }

      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detalle || data.error || 'Error al guardar el pedido');
      }

      // Vaciar carrito
      this.state.cart = [];
      this.saveCartToStorage();
      this.updateCartBadges();

      // Recargar productos (el stock disminuyó)
      const prodsRes = await fetch('/api/productos');
      if (prodsRes.ok) this.state.products = await prodsRes.json();

      // Mostrar modal de comprobante
      this.showOrderSuccessModal(data.pedido);
    } catch (err) {
      console.error(err);
      this.showToast(err.message, 'error');
    } finally {
      const btn = document.getElementById('btn-submit-order');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> <span>Confirmar Pedido Programado</span>';
      }
    }
  },

  showOrderSuccessModal(orderData) {
    document.getElementById('receipt-order-id').textContent = `#${orderData.pedido_id}`;
    document.getElementById('receipt-date').textContent = orderData.fecha_programada;
    document.getElementById('receipt-mode').textContent = orderData.modalidad_entrega === 'PUNTO_ALIADO'
      ? 'Retiro en Tienda de Barrio ($0)'
      : 'Domicilio Urbano Agrupado';
    document.getElementById('receipt-campesino').textContent = `$${orderData.desglose_transparencia.subtotal_campesinos_cop.toLocaleString('es-CO')} COP`;
    document.getElementById('receipt-comision').textContent = `$${orderData.desglose_transparencia.comision_plataforma_cop.toLocaleString('es-CO')} COP`;
    document.getElementById('receipt-envio').textContent = `$${orderData.desglose_transparencia.costo_envio_cop.toLocaleString('es-CO')} COP`;
    document.getElementById('receipt-total').textContent = `$${orderData.desglose_transparencia.total_pagar_cop.toLocaleString('es-CO')} COP`;

    const modal = document.getElementById('modal-order-success');
    if (modal) modal.classList.remove('hidden');
  },

  // ==============================================================================
  // VISTA 3: PANEL CAMPESINO DE BAJA CARGA COGNITIVA
  // ==============================================================================

  populateFincaSelects() {
    const farmerSelect = document.getElementById('farmer-active-finca-select');
    const modalSelect = document.getElementById('np-finca-id');

    if (farmerSelect) {
      farmerSelect.innerHTML = this.state.fincas.map(f => `
        <option value="${f.id}">${f.nombre_productor} (${f.nombre_finca})</option>
      `).join('');
      if (this.state.fincas.length > 0) {
        this.state.activeFarmerFincaId = this.state.fincas[0].id;
      }
    }

    if (modalSelect) {
      modalSelect.innerHTML = this.state.fincas.map(f => `
        <option value="${f.id}">${f.nombre_finca} · ${f.municipio_vereda}</option>
      `).join('');
    }
  },

  populatePuntoAliadoSelect() {
    const select = document.getElementById('checkout-punto-aliado');
    const infoBadge = document.getElementById('punto-aliado-info-badge');
    if (!select) return;

    select.innerHTML = this.state.puntosAliados.map(p => `
      <option value="${p.id}" data-dir="${p.direccion}" data-horario="${p.horario_retiro}">
        ${p.nombre_tienda} (${p.barrio_ciudad})
      </option>
    `).join('');

    const updateInfo = () => {
      const selected = select.options[select.selectedIndex];
      if (selected && infoBadge) {
        const dir = selected.getAttribute('data-dir');
        const horario = selected.getAttribute('data-horario');
        infoBadge.innerHTML = `
          <div class="font-bold text-agro-900"><i class="fa-solid fa-location-dot text-red-500 mr-1"></i> ${dir}</div>
          <div class="text-gray-500"><i class="fa-regular fa-clock mr-1"></i> ${horario}</div>
        `;
      }
    };

    select.onchange = updateInfo;
    updateInfo();
  },

  switchFarmerFinca(fincaId) {
    this.state.activeFarmerFincaId = parseInt(fincaId, 10);
    this.renderFarmerPanel();
  },

  renderFarmerPanel() {
    const finca = this.state.fincas.find(f => f.id === this.state.activeFarmerFincaId) || this.state.fincas[0];
    if (!finca) return;

    // Métricas del agricultor
    document.getElementById('farmer-stat-vereda').textContent = `${finca.nombre_finca} · ${finca.municipio_vereda}`;
    document.getElementById('farmer-stat-altitud').textContent = finca.altitud_msnm || 'Valle';

    const farmerProds = this.state.products.filter(p => p.finca_id === finca.id);
    document.getElementById('farmer-stat-cosechas').textContent = farmerProds.length;

    // Calcular ingresos acumulados en pedidos para esta finca
    let totalIngresos = 0;
    this.state.orders.forEach(order => {
      if (order.items) {
        order.items.forEach(it => {
          const match = farmerProds.find(fp => fp.id === it.producto_id);
          if (match) {
            totalIngresos += it.subtotal;
          }
        });
      }
    });
    document.getElementById('farmer-stat-ingresos').textContent = `$${totalIngresos.toLocaleString('es-CO')} COP`;

    // Renderizar tarjetas de cosechas con botones grandes de stock
    const grid = document.getElementById('farmer-products-grid');
    if (!grid) return;

    if (farmerProds.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full bg-white rounded-3xl p-10 text-center border border-gray-200 space-y-4">
          <i class="fa-solid fa-tractor text-5xl text-gray-300"></i>
          <p class="font-extrabold text-lg text-gray-800">Aún no tienes cosechas registradas para esta finca.</p>
          <button onclick="app.openNewProductModal()" class="btn-campesino bg-agro-700 text-white">
            <i class="fa-solid fa-plus-circle"></i> Publicar mi primera cosecha
          </button>
        </div>
      `;
      return;
    }

    grid.innerHTML = farmerProds.map(p => `
      <div class="bg-white rounded-3xl p-5 border-2 border-gray-200 shadow-sm flex flex-col justify-between space-y-4">
        
        <div class="flex items-center gap-4">
          <img src="${p.imagen_url}" alt="${p.nombre}"
            class="w-20 h-20 rounded-2xl object-cover bg-gray-100 border border-gray-200"
            onerror="this.src='https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop'" />
          <div class="flex-1">
            <span class="bg-agro-100 text-agro-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">${p.categoria}</span>
            <h4 class="font-black text-lg text-gray-900 mt-1">${p.nombre}</h4>
            <div class="text-xs font-semibold text-gray-500">${p.unidad_medida}</div>
            <div class="text-lg font-black text-agro-800">$${p.precio_campesino.toLocaleString('es-CO')} COP</div>
          </div>
        </div>

        <!-- CONTROL DE STOCK DE ALTO CONTRASTE (BOTONES GRANDES) -->
        <div class="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold uppercase text-gray-600">Disponibles hoy:</span>
            <span class="text-xl font-black text-agro-900">${p.stock_disponible}</span>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <button onclick="app.quickUpdateStock(${p.id}, -5)"
              class="py-2.5 px-3 bg-white hover:bg-red-50 text-red-700 font-extrabold text-xs rounded-xl border border-red-200 transition-colors flex items-center justify-center gap-1">
              <i class="fa-solid fa-minus"></i> Reducir 5
            </button>
            <button onclick="app.quickUpdateStock(${p.id}, 10)"
              class="py-2.5 px-3 bg-white hover:bg-agro-50 text-agro-800 font-extrabold text-xs rounded-xl border border-agro-300 transition-colors flex items-center justify-center gap-1">
              <i class="fa-solid fa-plus"></i> Coseché 10 más
            </button>
          </div>
        </div>

        <div class="text-[11px] text-gray-400 text-right">
          <i class="fa-regular fa-clock mr-1"></i> ${p.fecha_cosecha}
        </div>

      </div>
    `).join('');
  },

  openNewProductModal() {
    const modalSelect = document.getElementById('np-finca-id');
    if (modalSelect && this.state.activeFarmerFincaId) {
      modalSelect.value = this.state.activeFarmerFincaId;
    }
    const modal = document.getElementById('modal-new-product');
    if (modal) modal.classList.remove('hidden');
  },

  presetCrop(nombre, categoria, unidad, precio, imagenUrl) {
    document.getElementById('np-nombre').value = nombre;
    document.getElementById('np-categoria').value = categoria;
    document.getElementById('np-unidad').value = unidad;
    document.getElementById('np-precio').value = precio;
    document.getElementById('np-stock').value = 40;
    document.getElementById('np-fecha-cosecha').value = 'Hoy a las 6:00 AM';
    document.getElementById('np-imagen-url').value = imagenUrl;
    this.showToast(`Cosecha '${nombre}' autocompletada`, 'info');
  },

  async submitNewProduct(e) {
    e.preventDefault();
    const fincaId = parseInt(document.getElementById('np-finca-id').value, 10);
    const nombre = document.getElementById('np-nombre').value.trim();
    const categoria = document.getElementById('np-categoria').value;
    const unidadMedida = document.getElementById('np-unidad').value;
    const precioCampesino = parseInt(document.getElementById('np-precio').value, 10);
    const stockDisponible = parseInt(document.getElementById('np-stock').value, 10);
    const fechaCosecha = document.getElementById('np-fecha-cosecha').value.trim();
    const imagenUrl = document.getElementById('np-imagen-url').value.trim();

    const payload = {
      finca_id: fincaId,
      nombre,
      categoria,
      unidad_medida: unidadMedida,
      precio_campesino: precioCampesino,
      stock_disponible: stockDisponible,
      fecha_cosecha: fechaCosecha || 'Hoy al amanecer',
      imagen_url: imagenUrl
    };

    try {
      const res = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar cosecha');

      this.showToast('¡Cosecha publicada con éxito en DelCampoApp!', 'success');
      this.closeModal('modal-new-product');

      // Limpiar form
      document.getElementById('form-new-product').reset();

      // Recargar productos
      const prodsRes = await fetch('/api/productos');
      if (prodsRes.ok) this.state.products = await prodsRes.json();

      this.renderFarmerPanel();
      this.renderCatalog();
    } catch (err) {
      console.error(err);
      this.showToast(err.message, 'error');
    }
  },

  async quickUpdateStock(productId, delta) {
    const prod = this.state.products.find(p => p.id === productId);
    if (!prod) return;

    const newStock = Math.max(0, prod.stock_disponible + delta);

    try {
      const res = await fetch(`/api/productos/${productId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock_disponible: newStock })
      });

      if (!res.ok) throw new Error('Error al actualizar stock');

      prod.stock_disponible = newStock;
      this.renderFarmerPanel();
      this.showToast(`Stock de '${prod.nombre}' actualizado a ${newStock}`, 'success');
    } catch (err) {
      console.error(err);
      this.showToast('Error al actualizar stock', 'error');
    }
  },

  // ==============================================================================
  // VISTA 4: HOJA DE RUTA LOGÍSTICA Y MONITOR SQLITE
  // ==============================================================================

  async refreshLogisticaData() {
    try {
      const [healthRes, ordersRes, statsRes] = await Promise.all([
        fetch('/api/health'),
        fetch('/api/pedidos'),
        fetch('/api/stats')
      ]);

      if (healthRes.ok) this.state.health = await healthRes.json();
      if (ordersRes.ok) this.state.orders = await ordersRes.json();
      if (statsRes.ok) this.state.stats = await statsRes.json();

      this.renderDbMonitor();
      this.renderOrdersTable();
    } catch (err) {
      console.error('Error al actualizar datos de logística:', err);
    }
  },

  renderDbMonitor() {
    const h = this.state.health;
    if (!h) return;

    const elEngine = document.getElementById('db-monitor-engine');
    const elFile = document.getElementById('db-monitor-file');
    const elMetrics = document.getElementById('db-table-metrics');

    if (elEngine) elEngine.textContent = `${h.motor_bd} · Uptime: ${h.uptime_segundos}s`;
    if (elFile) elFile.textContent = h.archivo_bd;

    if (elMetrics && h.tablas_registros) {
      elMetrics.innerHTML = Object.entries(h.tablas_registros).map(([table, count]) => `
        <div class="bg-gray-800/80 p-3 rounded-xl border border-gray-700/80">
          <div class="text-[10px] font-mono text-gray-400 uppercase truncate">${table}</div>
          <div class="text-xl font-black text-green-400 font-mono">${count}</div>
        </div>
      `).join('');
    }
  },

  renderOrdersTable() {
    const tbody = document.getElementById('orders-table-body');
    const filterSelect = document.getElementById('orders-filter-status');
    const filterStatus = filterSelect ? filterSelect.value : 'TODOS';

    if (!tbody) return;

    const filtered = this.state.orders.filter(o => {
      if (filterStatus === 'TODOS') return true;
      return o.estado === filterStatus;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="py-8 text-center text-gray-400 text-xs">
            No hay pedidos programados con el estado seleccionado.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(o => {
      const isAliado = o.modalidad_entrega === 'PUNTO_ALIADO';
      const itemsCount = o.items ? o.items.reduce((acc, i) => acc + i.cantidad, 0) : 0;
      const itemsList = o.items ? o.items.map(i => `${i.cantidad}x ${i.nombre_producto}`).join(', ') : '';

      let statusBadgeClass = 'bg-blue-100 text-blue-800 border-blue-200';
      if (o.estado === 'EN_RUTA_RURAL') statusBadgeClass = 'bg-amber-100 text-amber-800 border-amber-200';
      if (o.estado === 'ENTREGADO') statusBadgeClass = 'bg-green-100 text-green-800 border-green-200';

      return `
        <tr class="hover:bg-gray-50/80 transition-colors">
          <td class="py-3 px-4 font-mono font-bold text-gray-900">#${o.id}</td>
          <td class="py-3 px-4">
            <div class="font-bold text-xs text-gray-800">${o.fecha_programada}</div>
            <div class="text-[10px] text-gray-400">${o.creado_en || ''}</div>
          </td>
          <td class="py-3 px-4">
            <div class="font-bold text-xs text-gray-900">${o.nombre_comprador}</div>
            <div class="text-[10px] text-gray-500">${o.telefono_comprador || ''}</div>
          </td>
          <td class="py-3 px-4">
            <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isAliado ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}">
              ${isAliado ? '🏪 Tienda Aliada' : '🛵 Domicilio'}
            </span>
            <div class="text-xs text-gray-600 truncate max-w-[180px] mt-1">
              ${isAliado ? (o.nombre_tienda || 'Punto Aliado') : (o.direccion_entrega || o.ubicacion_comprador)}
            </div>
          </td>
          <td class="py-3 px-4">
            <div class="text-xs font-semibold text-gray-800">${itemsCount} alimentos</div>
            <div class="text-[10px] text-gray-400 truncate max-w-[160px]" title="${itemsList}">${itemsList}</div>
          </td>
          <td class="py-3 px-4">
            <div class="text-[11px] font-bold text-green-700">Campesino (93%): $${o.subtotal_campesinos.toLocaleString('es-CO')}</div>
            <div class="text-[10px] text-gray-500">DelCampo (7%): $${o.comision_plataforma.toLocaleString('es-CO')}</div>
          </td>
          <td class="py-3 px-4 font-black text-sm text-gray-900">
            $${o.total_pagar.toLocaleString('es-CO')}
          </td>
          <td class="py-3 px-4">
            <span class="text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${statusBadgeClass}">
              ${o.estado}
            </span>
          </td>
          <td class="py-3 px-4 text-center">
            ${this.renderStatusActionBtn(o.id, o.estado)}
          </td>
        </tr>
      `;
    }).join('');
  },

  renderStatusActionBtn(orderId, currentStatus) {
    if (currentStatus === 'PROGRAMADO') {
      return `
        <button onclick="app.advanceOrderStatus(${orderId}, 'EN_RUTA_RURAL')"
          class="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[11px] rounded-lg shadow-2xs flex items-center gap-1 mx-auto">
          <i class="fa-solid fa-truck"></i> Despachar
        </button>
      `;
    } else if (currentStatus === 'EN_RUTA_RURAL') {
      return `
        <button onclick="app.advanceOrderStatus(${orderId}, 'ENTREGADO')"
          class="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-extrabold text-[11px] rounded-lg shadow-2xs flex items-center gap-1 mx-auto">
          <i class="fa-solid fa-check-double"></i> Entregar
        </button>
      `;
    } else {
      return `<span class="text-gray-400 text-xs font-bold"><i class="fa-solid fa-check text-green-600"></i> Completado</span>`;
    }
  },

  async advanceOrderStatus(orderId, nextStatus) {
    try {
      const res = await fetch(`/api/pedidos/${orderId}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nextStatus })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cambiar estado');

      this.showToast(`Pedido #${orderId} actualizado a ${nextStatus}`, 'success');
      await this.refreshLogisticaData();
    } catch (err) {
      console.error(err);
      this.showToast(err.message, 'error');
    }
  },

  // ==============================================================================
  // UTILIDADES: MODALES, STORAGE Y TOASTS
  // ==============================================================================

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
  },

  saveCartToStorage() {
    try {
      localStorage.setItem('delcampo_cart', JSON.stringify(this.state.cart));
    } catch (e) {}
  },

  loadCartFromStorage() {
    try {
      const saved = localStorage.getItem('delcampo_cart');
      if (saved) {
        this.state.cart = JSON.parse(saved);
      }
    } catch (e) {
      this.state.cart = [];
    }
  },

  updateCartBadges() {
    const totalCount = this.state.cart.reduce((acc, i) => acc + i.quantity, 0);
    const badgeDesktop = document.getElementById('cart-counter-badge');
    const badgeMobile = document.getElementById('cart-counter-badge-mobile');

    [badgeDesktop, badgeMobile].forEach(b => {
      if (!b) return;
      if (totalCount > 0) {
        b.textContent = totalCount;
        b.classList.remove('hidden');
      } else {
        b.classList.add('hidden');
      }
    });
  },

  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    let bg = 'bg-agro-800 text-white';
    let icon = 'fa-circle-check';

    if (type === 'error') {
      bg = 'bg-red-700 text-white';
      icon = 'fa-circle-xmark';
    } else if (type === 'warning') {
      bg = 'bg-amber-600 text-white';
      icon = 'fa-triangle-exclamation';
    } else if (type === 'info') {
      bg = 'bg-gray-800 text-white';
      icon = 'fa-circle-info';
    }

    toast.className = `toast-item px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs sm:text-sm font-bold ${bg}`;
    toast.innerHTML = `
      <i class="fa-solid ${icon} text-lg"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  },

  setupEventListeners() {
    // Cerrar modales con tecla Escape
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        this.closeModal('modal-traceability');
        this.closeModal('modal-new-product');
        this.closeModal('modal-order-success');
      }
    });
  }
};

// Iniciar aplicación al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
