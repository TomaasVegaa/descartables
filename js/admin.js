// Lógica del Panel de Administración - Universo Descartables
const ADMIN_PIN = '1234';

const AdminApp = {
  isLoggedIn: false,

  init() {
    this.checkLogin();
    this.bindEvents();
    
    if (this.isLoggedIn) {
      this.loadDashboard();
    }
  },

  checkLogin() {
    const session = sessionStorage.getItem('universo_admin_auth');
    if (session === 'true') {
      this.isLoggedIn = true;
      document.getElementById('modal-login').classList.add('hidden');
      document.getElementById('admin-body').classList.remove('hidden');
    } else {
      document.getElementById('modal-login').classList.remove('hidden');
      document.getElementById('admin-body').classList.remove('hidden'); // Para mostrar el login
    }
  },

  login(e) {
    e.preventDefault();
    const pin = document.getElementById('login-pin').value;
    const errorEl = document.getElementById('login-error');
    
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem('universo_admin_auth', 'true');
      this.isLoggedIn = true;
      document.getElementById('modal-login').classList.add('hidden');
      errorEl.classList.add('hidden');
      this.loadDashboard();
    } else {
      errorEl.classList.remove('hidden');
    }
  },

  logout() {
    sessionStorage.removeItem('universo_admin_auth');
    window.location.reload();
  },

  bindEvents() {
    document.getElementById('login-form').addEventListener('submit', (e) => this.login(e));
    
    const searchInput = document.getElementById('admin-search-product');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.renderProducts(e.target.value));
    }

    const prodForm = document.getElementById('product-form');
    if (prodForm) {
      prodForm.addEventListener('submit', (e) => this.saveProduct(e));
    }

    const setForm = document.getElementById('settings-form');
    if (setForm) {
      setForm.addEventListener('submit', (e) => this.saveSettings(e));
    }
  },

  switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(`tab-${tabId}`).classList.remove('hidden');

    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('bg-teal-600', 'text-white');
      btn.classList.add('text-slate-400', 'hover:text-white', 'hover:bg-slate-800');
    });

    const activeBtn = document.getElementById(`nav-${tabId}`);
    if (activeBtn) {
      activeBtn.classList.add('bg-teal-600', 'text-white');
      activeBtn.classList.remove('text-slate-400', 'hover:text-white', 'hover:bg-slate-800');
    }

    const titles = {
      'dashboard': 'Dashboard',
      'products': 'Catálogo de Productos',
      'settings': 'Configuración'
    };
    document.getElementById('header-title').textContent = titles[tabId];

    if (tabId === 'dashboard') this.renderDashboard();
    if (tabId === 'products') this.renderProducts();
    if (tabId === 'settings') this.renderSettings();
  },

  loadDashboard() {
    if (window.lucide) window.lucide.createIcons();
    this.renderDashboard();
  },

  renderDashboard() {
    document.getElementById('stat-products').textContent = PRODUCTS.length;
    document.getElementById('stat-promos').textContent = PRODUCTS.filter(p => p.promoPrice).length;
    document.getElementById('stat-phone').textContent = STORE_CONFIG.phoneFormatted;
  },

  renderProducts(query = '') {
    const tbody = document.getElementById('admin-products-tbody');
    if (!tbody) return;

    const lowerQuery = query.toLowerCase();
    const filtered = PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) || 
      p.sku.toLowerCase().includes(lowerQuery)
    );

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-slate-500">No se encontraron productos.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(p => `
      <tr class="hover:bg-slate-50 transition">
        <td class="p-4">
          <div class="flex items-center gap-3">
            <img src="${p.image}" class="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200" />
            <div>
              <p class="font-bold text-slate-900">${p.name}</p>
              <p class="text-xs text-slate-500 font-mono">SKU: ${p.sku}</p>
            </div>
          </div>
        </td>
        <td class="p-4 text-slate-600">${p.categoryName}</td>
        <td class="p-4">
          <p class="font-bold text-slate-900">$${(p.promoPrice || p.price).toLocaleString('es-AR')}</p>
          ${p.promoPrice ? `<p class="text-[10px] text-slate-400 line-through">$${p.price.toLocaleString('es-AR')}</p>` : ''}
        </td>
        <td class="p-4 text-center">
          ${p.badge ? `<span class="px-2 py-1 bg-teal-100 text-teal-800 text-[10px] font-bold rounded-md">${p.badge}</span>` : '-'}
        </td>
        <td class="p-4 text-right">
          <div class="flex items-center justify-end gap-2">
            <button onclick="AdminApp.editProduct('${p.id}')" class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Editar">
              <i data-lucide="edit-2" class="w-4 h-4"></i>
            </button>
            <button onclick="AdminApp.deleteProduct('${p.id}')" class="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Eliminar">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  openProductModal() {
    document.getElementById('product-form').reset();
    document.getElementById('prod-id').value = '';
    document.getElementById('modal-product-title').textContent = 'Nuevo Producto';
    document.getElementById('modal-product').classList.remove('hidden');
  },

  closeProductModal() {
    document.getElementById('modal-product').classList.add('hidden');
  },

  editProduct(id) {
    const prod = PRODUCTS.find(p => p.id === id);
    if (!prod) return;

    document.getElementById('prod-id').value = prod.id;
    document.getElementById('prod-name').value = prod.name;
    document.getElementById('prod-category').value = prod.category;
    document.getElementById('prod-sku').value = prod.sku;
    document.getElementById('prod-price').value = prod.price;
    document.getElementById('prod-promo').value = prod.promoPrice || '';
    
    let badgeVal = '';
    if (prod.badge === '10% OFF' || prod.badgeType === 'promo') badgeVal = '10% OFF';
    else if (prod.badge === 'Más Vendido' || prod.badgeType === 'best-seller') badgeVal = 'Más Vendido';
    else if (prod.badge === 'Eco-friendly' || prod.isEco) badgeVal = 'Eco-friendly';
    document.getElementById('prod-badge').value = badgeVal;
    
    document.getElementById('prod-pack').value = prod.packInfo;
    document.getElementById('prod-desc').value = prod.description;
    document.getElementById('prod-image').value = prod.image;

    document.getElementById('modal-product-title').textContent = 'Editar Producto';
    document.getElementById('modal-product').classList.remove('hidden');
  },

  saveProduct(e) {
    e.preventDefault();
    const id = document.getElementById('prod-id').value;
    const catId = document.getElementById('prod-category').value;
    const catName = document.querySelector(`#prod-category option[value="${catId}"]`).textContent;
    
    const badgeVal = document.getElementById('prod-badge').value;
    let badgeType = null;
    let isEco = false;
    
    if(badgeVal === '10% OFF') badgeType = 'promo';
    if(badgeVal === 'Más Vendido') badgeType = 'best-seller';
    if(badgeVal === 'Eco-friendly') { badgeType = 'eco'; isEco = true; }

    const newProd = {
      id: id || 'prod-' + Date.now(),
      name: document.getElementById('prod-name').value,
      category: catId,
      categoryName: catName,
      price: parseInt(document.getElementById('prod-price').value) || 0,
      promoPrice: parseInt(document.getElementById('prod-promo').value) || null,
      badge: badgeVal || null,
      badgeType: badgeType,
      image: document.getElementById('prod-image').value,
      description: document.getElementById('prod-desc').value,
      packInfo: document.getElementById('prod-pack').value,
      sku: document.getElementById('prod-sku').value,
      isEco: isEco
    };

    if (id) {
      const idx = PRODUCTS.findIndex(p => p.id === id);
      if (idx > -1) PRODUCTS[idx] = newProd;
    } else {
      PRODUCTS.push(newProd);
    }

    DataManager.saveData();
    this.closeProductModal();
    this.renderProducts();
    alert('Producto guardado correctamente.');
  },

  deleteProduct(id) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      PRODUCTS = PRODUCTS.filter(p => p.id !== id);
      DataManager.saveData();
      this.renderProducts();
    }
  },

  renderSettings() {
    document.getElementById('cfg-name').value = STORE_CONFIG.name;
    document.getElementById('cfg-phone').value = STORE_CONFIG.phone;
    document.getElementById('cfg-phoneFormatted').value = STORE_CONFIG.phoneFormatted;
    document.getElementById('cfg-transferDiscount').value = STORE_CONFIG.transferDiscountPercent;
    document.getElementById('cfg-announcements').value = STORE_CONFIG.announcements.join('\n');
  },

  saveSettings(e) {
    e.preventDefault();
    STORE_CONFIG.name = document.getElementById('cfg-name').value;
    STORE_CONFIG.phone = document.getElementById('cfg-phone').value;
    STORE_CONFIG.phoneFormatted = document.getElementById('cfg-phoneFormatted').value;
    STORE_CONFIG.transferDiscountPercent = parseInt(document.getElementById('cfg-transferDiscount').value) || 0;
    
    const anns = document.getElementById('cfg-announcements').value;
    STORE_CONFIG.announcements = anns.split('\n').map(s => s.trim()).filter(s => s.length > 0);

    DataManager.saveData();
    alert('Configuración guardada correctamente.');
    this.renderDashboard();
  },

  exportData() {
    const data = {
      PRODUCTS,
      CATEGORIES,
      STORE_CONFIG
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_tienda_${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  resetDefaults() {
    if (confirm('⚠️ PELIGRO: Esto borrará todos los productos y cambios, y restaurará el catálogo original. ¿Continuar?')) {
      DataManager.resetDefaults();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AdminApp.init();
});
