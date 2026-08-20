// Manejador del Carrito de Compras - Universo Descartables
const CartManager = {
  items: [],
  storageKey: 'universo_descartables_cart_v1',

  init() {
    this.loadCart();
    this.bindEvents();
    this.render();
  },

  loadCart() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      this.items = saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error cargando carrito:', e);
      this.items = [];
    }
  },

  saveCart() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    } catch (e) {
      console.error('Error guardando carrito:', e);
    }
    this.render();
  },

  addItem(productId, quantity = 1, triggerBtn = null) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = this.items.findIndex(item => item.id === productId);
    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        category: product.categoryName,
        price: product.price,
        effectivePrice: product.promoPrice || product.price,
        promoPrice: product.promoPrice,
        image: product.image,
        packInfo: product.packInfo,
        quantity: quantity
      });
    }

    this.saveCart();
    this.triggerAddAnimation(triggerBtn);
    this.animateCartBadges();
  },

  updateQuantity(productId, delta) {
    const index = this.items.findIndex(item => item.id === productId);
    if (index === -1) return;

    this.items[index].quantity += delta;
    if (this.items[index].quantity <= 0) {
      this.items.splice(index, 1);
    }
    this.saveCart();
  },

  removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.saveCart();
  },

  clearCart() {
    this.items = [];
    this.saveCart();
  },

  getCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getTotals(paymentMethod = 'transferencia') {
    const subtotal = this.items.reduce((sum, item) => {
      const unit = item.effectivePrice || item.price;
      return sum + (unit * item.quantity);
    }, 0);

    const isWholesaleUnlocked = subtotal >= STORE_CONFIG.wholesaleThreshold;
    const missingForWholesale = Math.max(0, STORE_CONFIG.wholesaleThreshold - subtotal);
    const progressPercent = Math.min(100, Math.round((subtotal / STORE_CONFIG.wholesaleThreshold) * 100));

    // Descuento mayorista (10% si >= $40.000)
    const wholesaleDiscount = isWholesaleUnlocked 
      ? Math.round(subtotal * (STORE_CONFIG.wholesaleDiscountPercent / 100)) 
      : 0;

    const subtotalAfterWholesale = subtotal - wholesaleDiscount;

    // Descuento por transferencia (10% adicional)
    const transferDiscount = (paymentMethod === 'transferencia')
      ? Math.round(subtotalAfterWholesale * (STORE_CONFIG.transferDiscountPercent / 100))
      : 0;

    const finalTotal = subtotalAfterWholesale - transferDiscount;

    return {
      subtotal,
      isWholesaleUnlocked,
      missingForWholesale,
      progressPercent,
      wholesaleDiscount,
      transferDiscount,
      finalTotal,
      itemCount: this.getCount()
    };
  },

  triggerAddAnimation(btn) {
    if (!btn) return;
    const originalContent = btn.innerHTML;
    const originalClasses = btn.className;

    btn.disabled = true;
    btn.innerHTML = `
      <svg class="w-4 h-4 inline mr-1 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
      </svg>
      ¡Agregado! ✓
    `;
    btn.classList.add('bg-emerald-600', 'ring-2', 'ring-emerald-300');

    setTimeout(() => {
      btn.innerHTML = originalContent;
      btn.className = originalClasses;
      btn.disabled = false;
      if (window.lucide) window.lucide.createIcons();
    }, 1300);
  },

  animateCartBadges() {
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(b => {
      b.classList.remove('badge-pop');
      void b.offsetWidth;
      b.classList.add('badge-pop');
    });

    const bottomCartIcon = document.getElementById('bottom-cart-btn');
    if (bottomCartIcon) {
      bottomCartIcon.classList.add('animate-cart-bounce');
      setTimeout(() => bottomCartIcon.classList.remove('animate-cart-bounce'), 500);
    }
  },

  openDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-backdrop');
    if (drawer && backdrop) {
      drawer.classList.remove('translate-x-full');
      backdrop.classList.remove('opacity-0', 'pointer-events-none');
      document.body.classList.add('overflow-hidden');
    }
  },

  closeDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-backdrop');
    if (drawer && backdrop) {
      drawer.classList.add('translate-x-full');
      backdrop.classList.add('opacity-0', 'pointer-events-none');
      document.body.classList.remove('overflow-hidden');
    }
  },

  bindEvents() {
    document.querySelectorAll('.open-cart-btn').forEach(btn => {
      btn.addEventListener('click', () => this.openDrawer());
    });

    const closeBtn = document.getElementById('close-cart-btn');
    const backdrop = document.getElementById('cart-backdrop');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeDrawer());
    if (backdrop) backdrop.addEventListener('click', () => this.closeDrawer());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeDrawer();
    });
  },

  render() {
    const count = this.getCount();
    const totals = this.getTotals('transferencia');

    // Actualizar badges
    document.querySelectorAll('.cart-badge').forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-flex' : 'none';
    });

    const listContainer = document.getElementById('cart-items-container');
    const emptyState = document.getElementById('cart-empty-state');
    const footerContainer = document.getElementById('cart-footer');
    const discountBar = document.getElementById('cart-discount-meter');

    if (!listContainer) return;

    if (this.items.length === 0) {
      listContainer.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      if (footerContainer) footerContainer.classList.add('hidden');
      if (discountBar) discountBar.classList.add('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');
    if (footerContainer) footerContainer.classList.remove('hidden');
    if (discountBar) discountBar.classList.remove('hidden');

    this.renderDiscountMeter(totals);

    listContainer.innerHTML = this.items.map(item => `
      <div class="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition">
        <img src="${item.image}" alt="${item.name}" class="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-slate-50 border border-slate-100" loading="lazy" />
        
        <div class="flex-1 min-w-0">
          <h4 class="text-xs font-bold text-slate-900 line-clamp-1">${item.name}</h4>
          <p class="text-[11px] text-slate-500 mb-1">${item.packInfo || item.category}</p>
          <div class="flex items-baseline gap-1.5">
            <span class="text-xs font-extrabold text-slate-900">$ ${(item.effectivePrice * item.quantity).toLocaleString('es-AR')}</span>
            ${item.quantity > 1 ? `<span class="text-[10px] text-slate-400">($ ${item.effectivePrice.toLocaleString('es-AR')} c/u)</span>` : ''}
          </div>
        </div>

        <div class="flex flex-col items-end gap-1.5 flex-shrink-0">
          <div class="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
            <button onclick="CartManager.updateQuantity('${item.id}', -1)" class="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 text-xs font-bold" aria-label="Disminuir">-</button>
            <span class="w-6 text-center text-xs font-bold text-slate-800">${item.quantity}</span>
            <button onclick="CartManager.updateQuantity('${item.id}', 1)" class="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 text-xs font-bold" aria-label="Aumentar">+</button>
          </div>
          <button onclick="CartManager.removeItem('${item.id}')" class="text-[10px] text-slate-400 hover:text-rose-600 transition flex items-center gap-0.5" title="Eliminar">
            Eliminar
          </button>
        </div>
      </div>
    `).join('');

    document.getElementById('cart-subtotal-val').textContent = `$ ${totals.subtotal.toLocaleString('es-AR')}`;
    
    const wholesaleRow = document.getElementById('cart-wholesale-row');
    const wholesaleVal = document.getElementById('cart-wholesale-val');
    if (totals.wholesaleDiscount > 0) {
      wholesaleRow.classList.remove('hidden');
      wholesaleVal.textContent = `-$ ${totals.wholesaleDiscount.toLocaleString('es-AR')}`;
    } else {
      wholesaleRow.classList.add('hidden');
    }

    const transferRow = document.getElementById('cart-transfer-row');
    const transferVal = document.getElementById('cart-transfer-val');
    if (totals.transferDiscount > 0) {
      transferRow.classList.remove('hidden');
      transferVal.textContent = `-$ ${totals.transferDiscount.toLocaleString('es-AR')}`;
    } else {
      transferRow.classList.add('hidden');
    }

    document.getElementById('cart-total-val').textContent = `$ ${totals.finalTotal.toLocaleString('es-AR')}`;
  },

  renderDiscountMeter(totals) {
    const container = document.getElementById('cart-discount-meter');
    if (!container) return;

    if (totals.isWholesaleUnlocked) {
      container.innerHTML = `
        <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <div class="flex items-center gap-2 mb-1.5">
            <span class="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">✓</span>
            <p class="text-xs font-bold text-emerald-900">
              ¡Descuento Mayorista del 10% Aplicado!
            </p>
          </div>
          <div class="w-full bg-emerald-200 rounded-full h-2 overflow-hidden">
            <div class="bg-emerald-600 h-2 rounded-full w-full"></div>
          </div>
          <p class="text-[11px] text-emerald-800 mt-1 flex items-center justify-between">
            <span>Ahorro: <strong>$ ${totals.wholesaleDiscount.toLocaleString('es-AR')}</strong></span>
            <span class="font-bold text-[10px] bg-emerald-200/80 px-1.5 py-0.5 rounded text-emerald-900">10% OFF</span>
          </p>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="bg-slate-100 border border-slate-200 rounded-xl p-3">
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <p class="text-xs text-slate-700">
              Agregá <strong class="text-slate-900 font-extrabold">$ ${totals.missingForWholesale.toLocaleString('es-AR')}</strong> para <strong class="text-teal-700 font-bold">10% OFF Mayorista</strong>
            </p>
            <span class="text-xs font-bold text-slate-700">${totals.progressPercent}%</span>
          </div>
          <div class="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div class="bg-teal-600 h-2 rounded-full transition-all duration-300" style="width: ${totals.progressPercent}%"></div>
          </div>
        </div>
      `;
    }
  }
};
