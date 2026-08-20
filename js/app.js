// Controlador de Interfaz y Lógica de Tienda Nube - Universo Descartables
const App = {
  activeCategory: 'todos',
  searchQuery: '',
  tickerIndex: 0,
  tickerInterval: null,

  init() {
    this.renderCategoryChips();
    this.renderProducts();
    this.initTicker();
    this.bindSearch();
    this.bindBottomNav();
    this.initQuickViewModal();
    this.renderFaqs();

    // Inicializar módulos dependientes
    CartManager.init();
    CheckoutManager.init();

    // Renderizar iconos de Lucide
    this.refreshIcons();
  },

  refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  initTicker() {
    const tickerEl = document.getElementById('ticker-text');
    if (!tickerEl) return;

    const messages = STORE_CONFIG.announcements;
    tickerEl.textContent = messages[0];

    this.tickerInterval = setInterval(() => {
      this.tickerIndex = (this.tickerIndex + 1) % messages.length;
      tickerEl.style.opacity = '0';
      tickerEl.style.transform = 'translateY(-4px)';
      
      setTimeout(() => {
        tickerEl.textContent = messages[this.tickerIndex];
        tickerEl.style.opacity = '1';
        tickerEl.style.transform = 'translateY(0)';
      }, 200);
    }, 5000);
  },

  renderCategoryChips() {
    const container = document.getElementById('category-chips-container');
    if (!container) return;

    container.innerHTML = CATEGORIES.map(cat => {
      const isActive = this.activeCategory === cat.id;
      return `
        <button 
          onclick="App.setCategory('${cat.id}')"
          class="category-chip flex-shrink-0 px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-200 flex items-center gap-2 border ${
            isActive 
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
          }"
        >
          <i data-lucide="${cat.icon}" class="w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-500'}"></i>
          <span>${cat.name}</span>
          <span class="text-[11px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'}">
            ${cat.id === 'todos' ? PRODUCTS.length : cat.count}
          </span>
        </button>
      `;
    }).join('');

    this.refreshIcons();
  },

  setCategory(categoryId) {
    this.activeCategory = categoryId;
    this.renderCategoryChips();
    this.renderProducts();

    // Desplazamiento suave al inicio de la sección de productos si está abajo
    const catalogHeader = document.getElementById('catalog-title');
    if (catalogHeader && window.scrollY > 400) {
      catalogHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  },

  bindSearch() {
    const searchInput = document.getElementById('search-input');
    const clearBtn = document.getElementById('clear-search-btn');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        if (clearBtn) {
          if (this.searchQuery.length > 0) {
            clearBtn.classList.remove('hidden');
          } else {
            clearBtn.classList.add('hidden');
          }
        }
        this.renderProducts();
      });
    }

    if (clearBtn && searchInput) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        this.searchQuery = '';
        clearBtn.classList.add('hidden');
        this.renderProducts();
        searchInput.focus();
      });
    }
  },

  getFilteredProducts() {
    return PRODUCTS.filter(product => {
      const matchCategory = this.activeCategory === 'todos' || product.category === this.activeCategory;
      const matchSearch = this.searchQuery === '' || 
        product.name.toLowerCase().includes(this.searchQuery) ||
        product.categoryName.toLowerCase().includes(this.searchQuery) ||
        product.description.toLowerCase().includes(this.searchQuery) ||
        product.sku.toLowerCase().includes(this.searchQuery);

      return matchCategory && matchSearch;
    });
  },

  renderProducts() {
    const grid = document.getElementById('products-grid');
    const emptyState = document.getElementById('no-products-state');
    const resultsCount = document.getElementById('results-count');
    const filtered = this.getFilteredProducts();

    if (resultsCount) {
      resultsCount.textContent = `${filtered.length} producto${filtered.length === 1 ? '' : 's'} disponible${filtered.length === 1 ? '' : 's'}`;
    }

    if (!grid) return;

    if (filtered.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    grid.innerHTML = filtered.map(product => {
      const isPromo = Boolean(product.promoPrice);
      const effectivePrice = product.promoPrice || product.price;
      const transferPrice = Math.round(effectivePrice * 0.9);

      return `
        <div class="product-card flex flex-col justify-between overflow-hidden group">
          
          <div>
            <!-- Contenedor Imagen 1:1 -->
            <div class="relative w-full pt-[100%] bg-slate-50 overflow-hidden cursor-pointer border-b border-slate-100" onclick="App.openQuickView('${product.id}')">
              <img 
                src="${product.image}" 
                alt="${product.name}" 
                class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              
              <!-- Badges de Producto -->
              <div class="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                ${this.renderBadge(product)}
              </div>

              <!-- Botón Ver Detalle en Desktop -->
              <div class="hidden md:flex absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity justify-center">
                <span class="bg-white/95 text-slate-800 text-xs font-bold py-1 px-3 rounded-full shadow-sm flex items-center gap-1">
                  <i data-lucide="eye" class="w-3.5 h-3.5 text-teal-600"></i>
                  Vista Rápida
                </span>
              </div>
            </div>

            <!-- Información del Producto -->
            <div class="p-3.5 md:p-4">
              <div class="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span class="font-semibold text-teal-700 uppercase tracking-wider">${product.categoryName}</span>
                <span class="font-mono">${product.sku}</span>
              </div>

              <h3 
                onclick="App.openQuickView('${product.id}')"
                class="font-heading text-sm md:text-base font-bold text-slate-900 hover:text-teal-700 cursor-pointer line-clamp-2 leading-snug mb-1.5 transition-colors"
                title="${product.name}"
              >
                ${product.name}
              </h3>

              <p class="text-xs text-slate-500 line-clamp-1 mb-2">${product.packInfo}</p>
            </div>
          </div>

          <!-- Precios y Botón de Compra -->
          <div class="p-3.5 md:p-4 pt-0">
            <div class="mb-3 pt-2.5 border-t border-slate-100">
              <div class="flex items-baseline gap-2">
                <span class="font-heading text-lg md:text-xl font-black text-slate-900">$ ${effectivePrice.toLocaleString('es-AR')}</span>
                ${isPromo ? `<span class="text-xs text-slate-400 line-through">$ ${product.price.toLocaleString('es-AR')}</span>` : ''}
              </div>
              <div class="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                <i data-lucide="percent" class="w-3 h-3"></i>
                <span>$ ${transferPrice.toLocaleString('es-AR')} con Transferencia</span>
              </div>
            </div>

            <button 
              onclick="CartManager.addItem('${product.id}', 1, this)"
              class="w-full btn-primary text-xs md:text-sm py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <i data-lucide="shopping-cart" class="w-4 h-4"></i>
              <span>Agregar al carrito</span>
            </button>
          </div>

        </div>
      `;
    }).join('');

    this.refreshIcons();
  },

  renderBadge(product) {
    if (product.badge === 'Eco-friendly' || product.isEco) {
      return `
        <span class="badge-eco inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs">
          <i data-lucide="leaf" class="w-3 h-3 text-emerald-700"></i>
          Eco-friendly
        </span>
      `;
    }
    if (product.badge === '10% OFF' || product.badgeType === 'promo') {
      return `
        <span class="badge-promo inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
          <i data-lucide="tag" class="w-3 h-3"></i>
          10% OFF
        </span>
      `;
    }
    if (product.badge === 'Más Vendido' || product.badgeType === 'best-seller') {
      return `
        <span class="badge-best-seller inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
          <i data-lucide="star" class="w-3 h-3 text-amber-600 fill-amber-500"></i>
          Más Vendido
        </span>
      `;
    }
    if (product.badge === 'Mayorista' || product.badgeType === 'wholesale') {
      return `
        <span class="badge-wholesale inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs">
          <i data-lucide="building-2" class="w-3 h-3 text-slate-300"></i>
          Mayorista
        </span>
      `;
    }
    return '';
  },

  openQuickView(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('quickview-modal');
    const content = document.getElementById('quickview-content');
    if (!modal || !content) return;

    const effectivePrice = product.promoPrice || product.price;
    const transferPrice = Math.round(effectivePrice * 0.9);

    content.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div class="relative rounded-2xl overflow-hidden bg-slate-100 aspect-square border border-slate-200">
          <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover" />
          <div class="absolute top-3 left-3 flex flex-col gap-1">
            ${this.renderBadge(product)}
          </div>
        </div>

        <div class="flex flex-col justify-between h-full">
          <div>
            <span class="text-xs font-bold text-teal-700 tracking-wider uppercase">${product.categoryName}</span>
            <h2 class="font-heading text-xl md:text-2xl font-bold text-slate-900 mt-1 mb-1">${product.name}</h2>
            <p class="text-xs text-slate-400 font-mono mb-3">SKU: ${product.sku} | Presentación: ${product.packInfo}</p>
            
            <p class="text-sm text-slate-600 leading-relaxed mb-4">${product.description}</p>

            <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-5">
              <div class="flex items-baseline gap-2">
                <span class="font-heading text-2xl md:text-3xl font-black text-slate-900">$ ${effectivePrice.toLocaleString('es-AR')}</span>
                ${product.promoPrice ? `<span class="text-sm text-slate-400 line-through">$ ${product.price.toLocaleString('es-AR')}</span>` : ''}
              </div>
              <p class="text-xs text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
                10% OFF abonando por Transferencia: <strong>$ ${transferPrice.toLocaleString('es-AR')}</strong>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button 
              onclick="CartManager.addItem('${product.id}', 1, this); App.closeQuickView();"
              class="flex-1 btn-primary py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <i data-lucide="shopping-cart" class="w-4 h-4"></i>
              <span>Agregar al Carrito</span>
            </button>
            <a 
              href="https://wa.me/${STORE_CONFIG.phone}?text=${encodeURIComponent(`Hola Universo Descartables! Me interesa consultar disponibilidad por: ${product.name} (SKU: ${product.sku})`)}" 
              target="_blank"
              class="w-12 h-12 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors border border-emerald-200"
              title="Consultar por WhatsApp"
            >
              <i data-lucide="message-circle" class="w-5 h-5"></i>
            </a>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.classList.add('overflow-hidden');
    this.refreshIcons();
  },

  closeQuickView() {
    const modal = document.getElementById('quickview-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.classList.remove('overflow-hidden');
    }
  },

  initQuickViewModal() {
    const closeBtn = document.getElementById('close-quickview-btn');
    const backdrop = document.getElementById('quickview-backdrop');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeQuickView());
    if (backdrop) backdrop.addEventListener('click', () => this.closeQuickView());
  },

  renderFaqs() {
    const container = document.getElementById('faqs-container');
    if (!container || !STORE_CONFIG.faqs) return;

    container.innerHTML = STORE_CONFIG.faqs.map((faq, idx) => `
      <div class="faq-item bg-white border border-slate-200 rounded-xl overflow-hidden transition">
        <button 
          onclick="App.toggleFaq(this)"
          class="w-full text-left p-4 flex items-center justify-between gap-3 text-slate-800 font-bold text-sm hover:text-teal-700 cursor-pointer"
        >
          <span>${faq.q}</span>
          <i data-lucide="chevron-down" class="faq-chevron w-4 h-4 text-slate-400 transition-transform duration-300 flex-shrink-0"></i>
        </button>
        <div class="faq-content px-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
          <p class="py-3">${faq.a}</p>
        </div>
      </div>
    `).join('');

    this.refreshIcons();
  },

  toggleFaq(btn) {
    const item = btn.closest('.faq-item');
    if (!item) return;
    const isActive = item.classList.contains('active');

    // Cerrar otros
    document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active'));

    if (!isActive) {
      item.classList.add('active');
    }
  },

  bindBottomNav() {
    const homeBtn = document.getElementById('bottom-nav-home');
    const categoriesBtn = document.getElementById('bottom-nav-categories');
    const contactBtn = document.getElementById('bottom-nav-contact');

    if (homeBtn) {
      homeBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    if (categoriesBtn) {
      categoriesBtn.addEventListener('click', () => {
        const chipsSection = document.getElementById('categories-section');
        if (chipsSection) {
          chipsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }

    if (contactBtn) {
      contactBtn.addEventListener('click', () => {
        const msg = encodeURIComponent('Hola Universo Descartables! Tengo una consulta sobre sus productos y envíos.');
        window.open(`https://wa.me/${STORE_CONFIG.phone}?text=${msg}`, '_blank');
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
