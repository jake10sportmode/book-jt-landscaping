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
    const services = this._load();
    const landscapingDefaults = [
      { name: 'Lawn Core Aeration & Overseeding', description: 'Deep soil core aeration to pull plugs, relieve compaction, and overseed for thick green lawn.', price: 140, duration: 60, category: 'Lawn Care', color: '#10b981', icon: '🚜', requiresContract: true },
      { name: 'Lawn Mowing & Edging', description: 'Complete lawn cut, perimeter edging, and driveway blow-clean.', price: 50, duration: 45, category: 'Lawn Care', color: '#059669', icon: '🌱', requiresContract: false },
      { name: 'Hedge & Bush Trimming', description: 'Precision trimming and shaping of hedges, shrubs, and bushes.', price: 75, duration: 60, category: 'Maintenance', color: '#6366f1', icon: '✂️', requiresContract: false },
      { name: 'Spring / Fall Yard Cleanup', description: 'Leaf removal, debris pickup, bed clearing, and property prep.', price: 120, duration: 90, category: 'Seasonal', color: '#f59e0b', icon: '🍂', requiresContract: false },
      { name: 'Mulch Spreading & Delivery', description: 'Fresh premium mulch delivery and professional garden bed installation.', price: 150, duration: 120, category: 'Bed Care', color: '#8b5cf6', icon: '🪵', requiresContract: false },
      { name: 'Garden Bed Maintenance', description: 'Weeding, soil turning, plant pruning, and fertilizer application.', price: 65, duration: 45, category: 'Garden', color: '#22d3ee', icon: '🌻', requiresContract: false },
      { name: 'Property & Landscape Consultation', description: 'On-site evaluation, landscape design ideas, and service estimate.', price: 40, duration: 30, category: 'Consultation', color: '#3b82f6', icon: '🏡', requiresContract: false }
    ];

    // Seed or update if old defaults exist without requiresContract property
    if (services.length === 0 || services.some(s => s.name === 'Consultation' || s.name === 'Haircut & Style' || s.requiresContract === undefined)) {
      const defaultServices = landscapingDefaults.map(s => ({ ...s, id: crypto.randomUUID() }));
      this._save(defaultServices);
    }
  }
};
