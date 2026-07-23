window.BookProBooking = {
  storageKey: 'bookpro_bookings',
  businessHours: { start: 8, end: 18 }, // 8am-6pm requested window
  businessDays: [1, 2, 3, 4, 5, 6], // Mon-Sat (0=Sun)
  
  currentBooking: { serviceId: null, date: null, time: null, customerName: null, customerEmail: null, customerPhone: null, customerAddress: null, signatureName: null, contractAgreed: false },

  _load() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading bookings', e);
      return [];
    }
  },

  _save(bookings) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(bookings));
    } catch (e) {
      console.error('Error saving bookings', e);
    }
  },

  getAll() {
    return this._load();
  },

  getById(id) {
    const bookings = this._load();
    return bookings.find(b => b.id === id) || null;
  },

  create(bookingData) {
    const bookings = this._load();
    const newBooking = {
      ...bookingData,
      id: crypto.randomUUID(),
      status: 'pending', // 'pending' (requested, awaiting owner confirmation), 'confirmed', 'cancelled'
      createdAt: new Date().toISOString()
    };
    bookings.push(newBooking);
    this._save(bookings);
    return newBooking;
  },

  confirmAppointment(id) {
    const bookings = this._load();
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      booking.status = 'confirmed';
      this._save(bookings);
      return true;
    }
    return false;
  },

  cancel(id) {
    const bookings = this._load();
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      booking.status = 'cancelled';
      this._save(bookings);
      return true;
    }
    return false;
  },

  getByDate(dateStr) {
    const bookings = this._load();
    return bookings.filter(b => b.date === dateStr && b.status === 'confirmed');
  },

  getUpcoming() {
    const bookings = this._load();
    const now = new Date();
    
    return bookings.filter(b => {
       if (b.status !== 'confirmed') return false;
       const bookingDate = new Date(`${b.date}T${b.time}`);
       return bookingDate >= now;
    }).sort((a, b) => new Date(`${a.date}T${b.time}`) - new Date(`${b.date}T${b.time}`));
  },

  generateCalendar(year, month) {
    const date = new Date(year, month, 1);
    const monthName = date.toLocaleString('default', { month: 'long' });
    const days = [];
    const today = new Date();
    today.setHours(0,0,0,0);

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Padding for previous month
    for (let i = 0; i < firstDay.getDay(); i++) {
       days.push(null); 
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const current = new Date(year, month, i);
      const isPast = current < today;
      const isToday = current.getTime() === today.getTime();
      const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      
      days.push({
        date: dayStr,
        dayNum: i,
        isToday,
        isPast,
        dayOfWeek: current.getDay()
      });
    }

    return { year, month, monthName, days };
  },

  getAvailableTimeSlots(dateStr, serviceDuration) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    
    // Sun = 0 (closed)
    if (dateObj.getDay() === 0) {
        return [];
    }

    const slots = [];
    let currentTime = this.businessHours.start * 60; // 8:00 AM (480 mins)
    const endTime = this.businessHours.end * 60; // 6:00 PM (1080 mins)
    
    const minToStr = (m) => {
        let hh = Math.floor(m / 60);
        const mm = String(m % 60).padStart(2, '0');
        const ampm = hh >= 12 ? 'PM' : 'AM';
        const displayH = hh > 12 ? hh - 12 : (hh === 0 ? 12 : hh);
        return `${String(displayH).padStart(2, '0')}:${mm} ${ampm}`;
    };
    
    const dailyBookings = this.getByDate(dateStr);

    while (currentTime + serviceDuration <= endTime) {
        const timeFormatted = minToStr(currentTime);
        slots.push(timeFormatted);
        currentTime += 60; // hourly requested windows
    }

    return slots;
  },

  setService(serviceId) {
    this.currentBooking.serviceId = serviceId;
  },

  setDate(dateStr) {
    this.currentBooking.date = dateStr;
  },

  setTime(timeStr) {
    this.currentBooking.time = timeStr;
  },

  reset() {
    this.currentBooking = { serviceId: null, date: null, time: null, customerName: null, customerEmail: null, customerPhone: null, customerAddress: null, signatureName: null, contractAgreed: false };
  }
};
