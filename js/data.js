// Catálogo de productos y configuración de tienda - Universo Descartables
const DEFAULT_CATEGORIES = [
  { id: 'todos', name: 'Todos los Productos', icon: 'grid', count: 15 },
  { id: 'envases', name: 'Envases & Viandas', icon: 'package', count: 3 },
  { id: 'vasos', name: 'Vasos & Bebidas', icon: 'coffee', count: 3 },
  { id: 'bolsas', name: 'Bolsas & Papelera', icon: 'shopping-bag', count: 3 },
  { id: 'reposteria', name: 'Repostería & Panadería', icon: 'cake', count: 3 },
  { id: 'higiene', name: 'Higiene & Limpieza', icon: 'sparkles', count: 3 }
];

const DEFAULT_PRODUCTS = [
  // 1. Envases & Viandas
  {
    id: 'env-01',
    name: 'Bandejas de Aluminio Rectangulares (Pack x50)',
    category: 'envases',
    categoryName: 'Envases & Viandas',
    price: 8500,
    promoPrice: 7650,
    badge: '10% OFF',
    badgeType: 'promo',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    description: 'Bandejas de aluminio descartables de alta resistencia, aptas para horno convencional y delivery de viandas calientes o frías.',
    packInfo: 'Pack cerrado x 50 unidades',
    sku: 'ALU-REC-50',
    isEco: false
  },
  {
    id: 'env-02',
    name: 'Potes Térmicos para Sopa/Helado 360cc (Pack x25)',
    category: 'envases',
    categoryName: 'Envases & Viandas',
    price: 4200,
    promoPrice: null,
    badge: null,
    badgeType: null,
    image: 'https://images.unsplash.com/photo-1577906096429-f73c2c312435?w=600&auto=format&fit=crop&q=80',
    description: 'Potes de polipapel térmico aislante con cierre hermético. Conservan la temperatura ideal para comidas calientes o postres.',
    packInfo: 'Pack x 25 unidades',
    sku: 'POT-TER-360',
    isEco: false
  },
  {
    id: 'env-03',
    name: 'Bols Ensalada con Tapa Transparente (Pack x50)',
    category: 'envases',
    categoryName: 'Envases & Viandas',
    price: 9800,
    promoPrice: null,
    badge: 'Más Vendido',
    badgeType: 'best-seller',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
    description: 'Bowl cristalino PET ultra rígido con tapa hermética para delivery de ensaladas gourmet, poké bowls y frutas.',
    packInfo: 'Pack x 50 unidades c/ tapa',
    sku: 'BWL-PET-50',
    isEco: false
  },

  // 2. Vasos & Bebidas
  {
    id: 'vas-01',
    name: 'Vasos Plásticos Transparentes 400cc (Pack x100)',
    category: 'vasos',
    categoryName: 'Vasos & Bebidas',
    price: 3500,
    promoPrice: null,
    badge: null,
    badgeType: null,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
    description: 'Vasos descartables transparentes de polipropileno flexible ideales para tragos, gaseosas, cerveza y eventos.',
    packInfo: 'Pack x 100 unidades',
    sku: 'VAS-PP-400',
    isEco: false
  },
  {
    id: 'vas-02',
    name: 'Vasos Térmicos Polipapel para Café 240cc (Pack x50)',
    category: 'vasos',
    categoryName: 'Vasos & Bebidas',
    price: 5100,
    promoPrice: null,
    badge: 'Eco-friendly',
    badgeType: 'eco',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    description: 'Vasos biodegradables de papel kraft virgen con recubrimiento compostable. Excelente aislación para cafetería.',
    packInfo: 'Pack x 50 unidades',
    sku: 'VAS-KFT-240',
    isEco: true
  },
  {
    id: 'vas-03',
    name: 'Copas de Acrílico para Brindis (Pack x12)',
    category: 'vasos',
    categoryName: 'Vasos & Bebidas',
    price: 6200,
    promoPrice: null,
    badge: null,
    badgeType: null,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80',
    description: 'Copas de champagne/vino en poliestireno cristal desmontable de primera calidad para fiestas, bodas y recepciones.',
    packInfo: 'Pack x 12 unidades',
    sku: 'COP-ACR-12',
    isEco: false
  },

  // 3. Bolsas & Papelera
  {
    id: 'bol-01',
    name: 'Bolsas Camiseta Reforzadas 40x50cm (Paquete x100)',
    category: 'bolsas',
    categoryName: 'Bolsas & Papelera',
    price: 2900,
    promoPrice: null,
    badge: null,
    badgeType: null,
    image: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=600&auto=format&fit=crop&q=80',
    description: 'Bolsas plásticas tipo camiseta de alta densidad, resistentes al peso y desgarros. Ideales para comercios.',
    packInfo: 'Paquete x 100 unidades',
    sku: 'BOL-CAM-4050',
    isEco: false
  },
  {
    id: 'bol-02',
    name: 'Bolsas de Papel Kraft Marrón sin Manijas (Pack x100)',
    category: 'bolsas',
    categoryName: 'Bolsas & Papelera',
    price: 4800,
    promoPrice: null,
    badge: 'Eco-friendly',
    badgeType: 'eco',
    image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
    description: 'Bolsas de fondo americano en papel kraft 100% reciclable y biodegradable. Especiales para panaderías y delivery.',
    packInfo: 'Pack x 100 unidades',
    sku: 'BOL-KFT-100',
    isEco: true
  },
  {
    id: 'bol-03',
    name: 'Cinta de Embalar Transparente Marrón 48mm x 100m',
    category: 'bolsas',
    categoryName: 'Bolsas & Papelera',
    price: 1800,
    promoPrice: null,
    badge: null,
    badgeType: null,
    image: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=600&auto=format&fit=crop&q=80',
    description: 'Cinta adhesiva acrílica de alta adherencia para sellado seguro de cajas de cartón y bultos.',
    packInfo: 'Rollo individual 48mm x 100m',
    sku: 'CIN-EMB-48',
    isEco: false
  },

  // 4. Repostería & Panadería
  {
    id: 'rep-01',
    name: 'Pirotines de Papel para Muffins Nº 10 (Pack x100)',
    category: 'reposteria',
    categoryName: 'Repostería & Panadería',
    price: 1500,
    promoPrice: null,
    badge: null,
    badgeType: null,
    image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600&auto=format&fit=crop&q=80',
    description: 'Cápsulas de papel manteca antiadherente para horneado de muffins, cupcakes y bombonería fina.',
    packInfo: 'Tubo x 100 unidades',
    sku: 'PIR-MUF-10',
    isEco: false
  },
  {
    id: 'rep-02',
    name: 'Bandejas de Cartón Oro/Plata Redondas Nº 26 (Pack x10)',
    category: 'reposteria',
    categoryName: 'Repostería & Panadería',
    price: 3200,
    promoPrice: null,
    badge: null,
    badgeType: null,
    image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&auto=format&fit=crop&q=80',
    description: 'Bases circulares laminadas metalizadas oro y plata de alto gramaje para presentación de tartas y tortas.',
    packInfo: 'Pack x 10 unidades',
    sku: 'BAN-ORO-26',
    isEco: false
  },
  {
    id: 'rep-03',
    name: 'Cajas para Torta de Cartón Blanco 25x25x12cm (Pack x10)',
    category: 'reposteria',
    categoryName: 'Repostería & Panadería',
    price: 5500,
    promoPrice: null,
    badge: null,
    badgeType: null,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
    description: 'Cajas automontables de microcorrugado blanco con pestañas de seguridad para transporte higiénico de pastelería.',
    packInfo: 'Pack x 10 unidades',
    sku: 'CAJ-TOR-25',
    isEco: false
  },

  // 5. Higiene & Limpieza
  {
    id: 'hig-01',
    name: 'Servilletas de Papel Doble Hoja 33x33cm (Pack x150)',
    category: 'higiene',
    categoryName: 'Higiene & Limpieza',
    price: 2100,
    promoPrice: null,
    badge: null,
    badgeType: null,
    image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&auto=format&fit=crop&q=80',
    description: 'Servilletas de celulosa pura doble hoja, máxima absorción y suavidad para mesas gastronómicas y catering.',
    packInfo: 'Pack x 150 unidades',
    sku: 'SER-DH-33',
    isEco: false
  },
  {
    id: 'hig-02',
    name: 'Toallas de Papel Intercaladas Blancas (Caja x2000)',
    category: 'higiene',
    categoryName: 'Higiene & Limpieza',
    price: 14500,
    promoPrice: null,
    badge: 'Destacado',
    badgeType: 'best-seller',
    image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&auto=format&fit=crop&q=80',
    description: 'Toallas de mano descartables para dispensadores institucionales de baños y cocinas comerciales.',
    packInfo: 'Caja x 2000 hojas (10 paquetes x 200)',
    sku: 'TOA-INT-2000',
    isEco: false
  },
  {
    id: 'hig-03',
    name: 'Guantes de Nitrilo Negro Talle M (Caja x100)',
    category: 'higiene',
    categoryName: 'Higiene & Limpieza',
    price: 11000,
    promoPrice: null,
    badge: null,
    badgeType: null,
    image: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=600&auto=format&fit=crop&q=80',
    description: 'Guantes descartables de nitrilo sin polvo de grado gastronómico y estético. Gran elasticidad y resistencia.',
    packInfo: 'Caja x 100 unidades (50 pares)',
    sku: 'GUA-NIT-M',
    isEco: false
  }
];

const DEFAULT_STORE_CONFIG = {
  name: 'Universo Descartables',
  tagline: 'Envases, Descartables y Packaging para Gastronomía y Eventos',
  phone: '5493816604958',
  phoneFormatted: '381 660-4958',
  address: 'Envíos a Domicilio en San Miguel de Tucumán y Gran Tucumán',
  addressFull: 'San Miguel de Tucumán, Tucumán (Sólo Envíos a Domicilio)',
  transferDiscountPercent: 10,
  currency: 'ARS',
  announcements: [
    'Envíos rápidos a domicilio en San Miguel de Tucumán y alrededores',
    '10% de descuento directo abonando con Transferencia Bancaria'
  ],
  faqs: [
    {
      q: '¿Cómo coordinan los envíos a domicilio?',
      a: 'Una vez enviado tu pedido por WhatsApp, te confirmamos el stock y coordinamos la entrega. Realizamos envíos por cadetería en San Miguel de Tucumán y Gran Tucumán (Yerba Buena, Tafí Viejo, Banda del Río Salí) y por comisionista al interior de la provincia.'
    },
    {
      q: '¿Se puede retirar personalmente?',
      a: 'Actualmente operamos exclusivamente de forma online mediante envíos directos a domicilio, asegurando rapidez y comodidad para tu negocio o evento.'
    },
    {
      q: '¿Tienen descuentos por pago en transferencia?',
      a: 'Sí, aplicamos un 10% de descuento automático sobre el total de la compra si abonás mediante transferencia bancaria.'
    },
    {
      q: '¿Tienen precios especiales para comercios?',
      a: 'Sí, abastecemos a panaderías, rotiserías, restaurantes, bares y organizadores de eventos. Consultanos por WhatsApp para cotizaciones por volumen.'
    }
  ]
};

// Variables globales para ser consumidas por la app
let CATEGORIES = [];
let PRODUCTS = [];
let STORE_CONFIG = {};

// Administrador de Datos reactivo con localStorage
const DataManager = {
  storageKeys: {
    products: 'universo_admin_products_v1',
    categories: 'universo_admin_categories_v1',
    config: 'universo_admin_config_v1'
  },

  init() {
    this.loadData();
  },

  loadData() {
    try {
      const savedProducts = localStorage.getItem(this.storageKeys.products);
      const savedCategories = localStorage.getItem(this.storageKeys.categories);
      const savedConfig = localStorage.getItem(this.storageKeys.config);

      PRODUCTS = savedProducts ? JSON.parse(savedProducts) : DEFAULT_PRODUCTS;
      CATEGORIES = savedCategories ? JSON.parse(savedCategories) : DEFAULT_CATEGORIES;
      STORE_CONFIG = savedConfig ? JSON.parse(savedConfig) : DEFAULT_STORE_CONFIG;
    } catch (e) {
      console.error('Error cargando datos desde localStorage, usando defaults', e);
      PRODUCTS = DEFAULT_PRODUCTS;
      CATEGORIES = DEFAULT_CATEGORIES;
      STORE_CONFIG = DEFAULT_STORE_CONFIG;
    }
  },

  saveData() {
    try {
      localStorage.setItem(this.storageKeys.products, JSON.stringify(PRODUCTS));
      localStorage.setItem(this.storageKeys.categories, JSON.stringify(CATEGORIES));
      localStorage.setItem(this.storageKeys.config, JSON.stringify(STORE_CONFIG));
    } catch (e) {
      console.error('Error guardando datos en localStorage', e);
    }
  },

  resetDefaults() {
    localStorage.removeItem(this.storageKeys.products);
    localStorage.removeItem(this.storageKeys.categories);
    localStorage.removeItem(this.storageKeys.config);
    this.loadData();
    
    // Si estamos en el lado del cliente (app.js), recargamos
    if(window.App && typeof window.App.init === 'function'){
      window.location.reload();
    }
  }
};

// Inicializamos el DataManager al cargar el script
DataManager.init();
