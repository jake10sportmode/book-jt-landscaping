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
      { id: 'service-aeration', name: 'Lawn Core Aeration', description: 'Deep soil core aeration to pull plugs and relieve compaction. Overseeding available for an additional quote.', price: 50, duration: 60, category: 'Lawn Care', color: '#10b981', icon: '🚜', requiresContract: true },
      { id: 'service-vacation', name: 'Vacation Lawn Care', description: 'Complete lawn cut, perimeter edging, and driveway blow-clean while you\'re away.', price: 35, duration: 45, category: 'Lawn Care', color: '#059669', icon: '🌱', requiresContract: false },
      { id: 'service-cleanup', name: 'Spring / Fall Yard Cleanup', description: 'Leaf removal, debris pickup. Get your yard clear of leaves and looking sharp.', price: 50, duration: 60, category: 'Seasonal', color: '#f59e0b', icon: '🍂', requiresContract: false },
      { id: 'service-yearlong', name: 'Year-Long Lawn Service', description: 'Weekly cut, blow, edge, and weed whip. Edging every other week.', price: 35, duration: 30, category: 'Maintenance', color: '#6366f1', icon: '🏡', requiresContract: false },
      { id: 'service-flowers', name: 'Flower Care', description: 'Daily watering and flower maintenance. Price is per day.', price: 10, duration: 15, category: 'Garden', color: '#22d3ee', icon: '🌻', requiresContract: false }
    ];

    const currentVersion = 2;
    const savedVersion = parseInt(localStorage.getItem('bookpro_services_version') || '0');
    const services = this._load();

    if (services.length === 0 || savedVersion < currentVersion) {
      this._save(landscapingDefaults);
      localStorage.setItem('bookpro_services_version', currentVersion.toString());
    }
  }
};
