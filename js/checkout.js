// Manejador del Checkout y Redirección a WhatsApp para Universo Descartables (Tucumán)
const CheckoutManager = {
  customerStorageKey: 'universo_descartables_customer_v1',

  init() {
    this.bindEvents();
    this.loadSavedCustomer();
  },

  loadSavedCustomer() {
    try {
      const saved = localStorage.getItem(this.customerStorageKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.name) document.getElementById('checkout-name').value = data.name;
        if (data.phone) document.getElementById('checkout-phone').value = data.phone;
        if (data.address) document.getElementById('checkout-address').value = data.address;
      }
    } catch (e) {
      console.warn('No se pudo recuperar datos de cliente previos:', e);
    }
  },

  saveCustomerData(data) {
    try {
      localStorage.setItem(this.customerStorageKey, JSON.stringify(data));
    } catch (e) {
      console.warn('No se pudo guardar datos de cliente:', e);
    }
  },

  openModal() {
    if (CartManager.items.length === 0) {
      alert('Tu carrito está vacío. ¡Agregá productos antes de iniciar la compra!');
      return;
    }

    CartManager.closeDrawer();
    const modal = document.getElementById('checkout-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.classList.add('overflow-hidden');
      this.updateCheckoutSummary();
    }
  },

  closeModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.classList.remove('overflow-hidden');
    }
  },

  getSelectedDelivery() {
    const deliveryRadio = document.querySelector('input[name="delivery-method"]:checked');
    return deliveryRadio ? deliveryRadio.value : 'retiro';
  },

  getSelectedPayment() {
    const paymentRadio = document.querySelector('input[name="payment-method"]:checked');
    return paymentRadio ? paymentRadio.value : 'transferencia';
  },

  updateDeliveryFields() {
    const isRetiro = this.getSelectedDelivery() === 'retiro';
    const addressWrapper = document.getElementById('address-wrapper');
    const addressInput = document.getElementById('checkout-address');
    const pickupInfo = document.getElementById('pickup-info-box');

    if (isRetiro) {
      addressInput.disabled = true;
      addressInput.classList.add('bg-slate-100', 'text-slate-400', 'cursor-not-allowed');
      addressInput.placeholder = 'No requerida para Retiro en Local';
      addressInput.value = '';
      if (addressWrapper) addressWrapper.classList.add('opacity-50');
      if (pickupInfo) pickupInfo.classList.remove('hidden');
    } else {
      addressInput.disabled = false;
      addressInput.classList.remove('bg-slate-100', 'text-slate-400', 'cursor-not-allowed');
      addressInput.placeholder = 'Calle, número, piso/depto, barrio (Tucumán)';
      if (addressWrapper) addressWrapper.classList.remove('opacity-50');
      if (pickupInfo) pickupInfo.classList.add('hidden');
    }
    this.updateCheckoutSummary();
  },

  updateCheckoutSummary() {
    const paymentMethod = this.getSelectedPayment();
    const totals = CartManager.getTotals(paymentMethod);

    const subtotalEl = document.getElementById('checkout-subtotal');
    const discountEl = document.getElementById('checkout-discounts');
    const totalEl = document.getElementById('checkout-total');
    const discountRow = document.getElementById('checkout-discount-row');

    if (subtotalEl) subtotalEl.textContent = `$ ${totals.subtotal.toLocaleString('es-AR')}`;

    const totalDiscounts = totals.wholesaleDiscount + totals.transferDiscount;
    if (discountRow && discountEl) {
      if (totalDiscounts > 0) {
        discountRow.classList.remove('hidden');
        discountEl.textContent = `-$ ${totalDiscounts.toLocaleString('es-AR')}`;
      } else {
        discountRow.classList.add('hidden');
      }
    }

    if (totalEl) totalEl.textContent = `$ ${totals.finalTotal.toLocaleString('es-AR')}`;
  },

  generateWhatsAppMessage(formData) {
    const totals = CartManager.getTotals(formData.paymentMethod);
    const deliveryText = formData.deliveryMethod === 'retiro' 
      ? 'Retiro en Local (Calle Raúl Colombres 123, San Miguel de Tucumán)' 
      : 'Envío a Domicilio';
    
    const addressText = formData.deliveryMethod === 'retiro' ? 'N/A (Retiro en Sucursal)' : formData.address;
    const paymentText = formData.paymentMethod === 'transferencia' 
      ? 'Transferencia Bancaria (10% OFF)' 
      : 'Efectivo al recibir';

    // Formateo de lista de productos
    const productLines = CartManager.items.map(item => {
      const unit = item.effectivePrice || item.price;
      const subtotalItem = unit * item.quantity;
      return `• ${item.quantity}x ${item.name}\n  Precio unit.: $ ${unit.toLocaleString('es-AR')} | Subtotal: $ ${subtotalItem.toLocaleString('es-AR')}`;
    }).join('\n');

    // Desglose de descuentos
    const appliedDiscounts = [];
    if (totals.wholesaleDiscount > 0) {
      appliedDiscounts.push(`Descuento Mayorista 10% (-$ ${totals.wholesaleDiscount.toLocaleString('es-AR')})`);
    }
    if (totals.transferDiscount > 0) {
      appliedDiscounts.push(`Descuento Transferencia 10% (-$ ${totals.transferDiscount.toLocaleString('es-AR')})`);
    }

    const discountSummary = appliedDiscounts.length > 0 ? appliedDiscounts.join(' + ') : 'Ninguno';

    const message = 
`*NUEVO PEDIDO - UNIVERSO DESCARTABLES* 📦✨

*Cliente:* ${formData.name}
*Contacto:* ${formData.phone}
*Entrega:* ${deliveryText}
*Dirección:* ${addressText}
*Pago:* ${paymentText}
${formData.notes ? `*Notas adicionales:* ${formData.notes}\n` : ''}
----------------------------------
*Detalle del Pedido:*
${productLines}
----------------------------------
*Subtotal:* $ ${totals.subtotal.toLocaleString('es-AR')}
*Descuentos Aplicados:* ${discountSummary}
*TOTAL A ABONAR:* $ ${totals.finalTotal.toLocaleString('es-AR')}

_Muchas gracias. Aguardo la confirmación de stock y los datos para realizar el pago._`;

    return message;
  },

  handleSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('checkout-name').value.trim();
    const phone = document.getElementById('checkout-phone').value.trim();
    const deliveryMethod = this.getSelectedDelivery();
    const address = document.getElementById('checkout-address').value.trim();
    const paymentMethod = this.getSelectedPayment();
    const notes = document.getElementById('checkout-notes')?.value.trim() || '';

    if (!name) {
      alert('Por favor, ingresá tu Nombre y Apellido.');
      document.getElementById('checkout-name').focus();
      return;
    }

    if (!phone || phone.length < 8) {
      alert('Por favor, ingresá un número de celular válido.');
      document.getElementById('checkout-phone').focus();
      return;
    }

    if (deliveryMethod === 'envio' && !address) {
      alert('Por favor, ingresá la dirección completa para el envío.');
      document.getElementById('checkout-address').focus();
      return;
    }

    this.saveCustomerData({ name, phone, address });

    const formData = {
      name,
      phone,
      deliveryMethod,
      address,
      paymentMethod,
      notes
    };

    const message = this.generateWhatsAppMessage(formData);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${STORE_CONFIG.phone}?text=${encodedMessage}`;

    const submitBtn = document.getElementById('btn-submit-order');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Abriendo WhatsApp...
      `;
    }

    setTimeout(() => {
      window.open(whatsappUrl, '_blank');

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <i data-lucide="message-circle" class="w-4 h-4"></i>
          <span>Enviar Pedido por WhatsApp</span>
        `;
        if (window.lucide) window.lucide.createIcons();
      }
      this.closeModal();
    }, 400);
  },

  bindEvents() {
    const checkoutStartBtn = document.getElementById('btn-start-checkout');
    if (checkoutStartBtn) {
      checkoutStartBtn.addEventListener('click', () => this.openModal());
    }

    const closeModalBtn = document.getElementById('close-checkout-btn');
    const cancelModalBtn = document.getElementById('cancel-checkout-btn');
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => this.closeModal());
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', () => this.closeModal());

    document.querySelectorAll('input[name="delivery-method"]').forEach(radio => {
      radio.addEventListener('change', () => this.updateDeliveryFields());
    });

    document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
      radio.addEventListener('change', () => this.updateCheckoutSummary());
    });

    const form = document.getElementById('checkout-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }
};
