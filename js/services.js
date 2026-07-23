window.BookProServices = {
  storageKey: 'bookpro_services',
  
  _load() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading services', e);
      return [];
    }
  },
  
  _save(services) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(services));
    } catch (e) {
      console.error('Error saving services', e);
    }
  },

  getAll() {
    return this._load();
  },

  getById(id) {
    const services = this._load();
    return services.find(s => s.id === id) || null;
  },

  create(serviceData) {
    const services = this._load();
    const newService = {
      ...serviceData,
      id: crypto.randomUUID()
    };
    services.push(newService);
    this._save(services);
    return newService;
  },

  update(id, data) {
    const services = this._load();
    const index = services.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    services[index] = { ...services[index], ...data };
    this._save(services);
    return services[index];
  },

  delete(id) {
    const services = this._load();
    const filtered = services.filter(s => s.id !== id);
    if (filtered.length === services.length) return false;
    
    this._save(filtered);
    return true;
  },

  getCategories() {
    const services = this._load();
    const categories = new Set(services.map(s => s.category).filter(Boolean));
    return Array.from(categories);
  },

  initDefaults() {
    const landscapingDefaults = [
      { id: 'service-aeration', name: 'Lawn Core Aeration & Overseeding', description: 'Deep soil core aeration to pull plugs, relieve compaction. Grass seed is for extra price quote needed.', price: 50, duration: 60, category: 'Lawn Care', color: '#10b981', icon: '🚜', requiresContract: true },
      { id: 'service-vacation', name: 'Vacation Lawn care', description: 'Complete lawn cut, perimeter edging, and driveway blow-clean.', price: 35, duration: 45, category: 'Lawn Care', color: '#059669', icon: '🌱', requiresContract: false },
      { id: 'service-cleanup', name: 'Spring / Fall Yard Cleanup', description: 'Leaf removal, debris pickup.', price: 50, duration: 60, category: 'Seasonal', color: '#f59e0b', icon: '🍂', requiresContract: false },
      { id: 'service-yearlong', name: 'Year long lawn service.', description: 'cut blow and edge and weedwip.', price: 35, duration: 30, category: 'Maintenance', color: '#6366f1', icon: '🏡', requiresContract: false },
      { id: 'service-flowers', name: 'Flowers.', description: 'Complete Flower care. Price=per day.', price: 10, duration: 15, category: 'Garden', color: '#22d3ee', icon: '🌻', requiresContract: false }
    ];

    const services = this._load();
    if (services.length === 0 || services.some(s => s.name === 'Consultation' || s.name === 'Haircut & Style' || s.price === 140 || s.requiresContract === undefined || s.name === 'Mulch Spreading & Delivery')) {
      this._save(landscapingDefaults);
    }
  }
};
