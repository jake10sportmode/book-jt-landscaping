window.BookProApp = {
  currentPage: 'home',
  ownerEmail: 'jakemtornabene@gmail.com',
  
  toggleMenu() {
    const nav = document.querySelector('.nav-links');
    if (nav) {
        nav.classList.toggle('open');
    }
  },

  init() {
    window.BookProServices.initDefaults();
    window.BookProAdmin.checkAuth();
    
    // Global event delegation for all [data-page] navigation links and buttons
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-page]');
      if (target) {
        e.preventDefault();
        const page = target.getAttribute('data-page');
        this.navigateTo(page);
      }
    });

    // Mobile menu toggle
    const menuBtn = document.getElementById('mobile-menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenu();
        });
    }

    // Hash routing
    window.addEventListener('hashchange', () => {
      if (this.isNavigating) return;
      let hash = window.location.hash.substring(1);
      if (!hash) hash = 'home';
      if (this.currentPage !== hash) {
          this.navigateTo(hash);
      }
    });

    // Initial page load
    let initialPage = window.location.hash.substring(1) || 'home';
    this.navigateTo(initialPage);
  },

  navigateTo(page, data = null) {
    this.currentPage = page;
    
    // Hide all pages, show active
    document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
    const pageEl = document.getElementById(`page-${page}`);
    if (pageEl) {
        pageEl.classList.add('active');
    }

    // Update nav links
    document.querySelectorAll('[data-page]').forEach(link => {
        if (link.getAttribute('data-page') === page) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    window.scrollTo(0, 0);

    // Prevent hashchange event listener from re-entering navigateTo
    if (window.location.hash.substring(1) !== page) {
        this.isNavigating = true;
        window.location.hash = page;
        setTimeout(() => { this.isNavigating = false; }, 50);
    }

    // Close mobile menu if open
    const nav = document.querySelector('.nav-links');
    if (nav && nav.classList.contains('open')) {
        nav.classList.remove('open');
    }

    // Handle page-specific setups
    if (page === 'home') {
        const services = window.BookProServices.getAll().slice(0, 3);
        this.renderServices('services-grid', services);
    } else if (page === 'services') {
        const services = window.BookProServices.getAll();
        this.renderServices('all-services-grid', services);
    } else if (page === 'booking') {
        if (data && data.serviceId) {
            window.BookProBooking.reset();
            window.BookProBooking.setService(data.serviceId);
        }
        
        if (window.BookProBooking.currentBooking.serviceId) {
            this.renderBookingPage();
        } else {
            this.showToast('Please select a service first', 'info');
            this.navigateTo('services');
        }
    } else if (page === 'admin') {
        this.renderAdmin();
    }
  },

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  renderServices(containerId, services) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!services || services.length === 0) {
        window.BookProServices.initDefaults();
        services = (containerId === 'services-grid') ? window.BookProServices.getAll().slice(0, 3) : window.BookProServices.getAll();
    }

    if (!services || services.length === 0) {
        container.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">No services currently available.</p>';
        return;
    }
    
    container.innerHTML = services.map(s => this.renderServiceCard(s)).join('');
  },

  renderServiceCard(service) {
    const waiverBadge = service.requiresContract ? `<span style="background: rgba(245, 158, 11, 0.15); color: #b45309; font-size: 0.75em; padding: 3px 8px; border-radius: 4px; font-weight: 600; margin-left: 8px; display: inline-block;">📜 Waiver</span>` : '';
    return `
      <div class="service-card" style="--accent-color: ${service.color}">
        <div class="service-icon-wrapper" style="background-color: ${service.color}20; color: ${service.color}">
            <span class="service-icon">${service.icon}</span>
        </div>
        <h3 class="service-title">${service.name} ${waiverBadge}</h3>
        <p class="service-desc">${service.description}</p>
        <div class="service-details">
            <span class="service-price">$${service.price}</span>
            <span class="service-duration">⏱ ${service.duration} min</span>
        </div>
        <button class="btn btn-primary btn-full book-btn" onclick="window.BookProApp.navigateTo('booking', {serviceId: '${service.id}'})">Book Now</button>
      </div>
    `;
  },

  // ============================
  // SIMPLIFIED BOOKING FLOW
  // ============================

  renderBookingPage() {
    const content = document.getElementById('booking-step-content');
    if (!content) return;

    const bk = window.BookProBooking.currentBooking;
    const service = window.BookProServices.getById(bk.serviceId);
    if (!service) return this.navigateTo('services');
    const needsContract = !!service.requiresContract;

    // Build the step indicator
    const stepsContainer = document.querySelector('.booking-steps');
    if (stepsContainer) {
        let stepsHtml = '';
        const stepLabels = needsContract 
            ? ['Your Info', 'Waiver', 'Done'] 
            : ['Your Info', 'Done'];
        stepLabels.forEach((label, i) => {
            stepsHtml += `<div class="step ${i === 0 ? 'active' : ''}"><div class="step-circle">${i+1}</div><span class="step-label">${label}</span></div>`;
            if (i < stepLabels.length - 1) stepsHtml += '<div class="step-line"></div>';
        });
        stepsContainer.innerHTML = stepsHtml;
    }

    // Get today's date for min attribute
    const today = new Date().toISOString().split('T')[0];

    content.innerHTML = `
        <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: var(--radius-md); padding: 16px 20px; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <div style="background: ${service.color}20; color: ${service.color}; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; flex-shrink: 0;">${service.icon}</div>
            <div style="flex: 1;">
                <strong style="font-size: 1.1rem;">${service.name}</strong>
                <div style="color: var(--text-secondary); font-size: 0.9rem;">$${service.price} · ${service.duration} min</div>
            </div>
            <button class="btn btn-text" style="font-size: 0.85rem;" onclick="window.BookProApp.navigateTo('services')">Change Service</button>
        </div>

        <form id="booking-main-form" class="booking-form" onsubmit="event.preventDefault(); window.BookProApp.handleBookingFormSubmit();">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div class="form-group" style="margin-bottom: 0;">
                    <label>Full Name *</label>
                    <input type="text" id="booking-name" required placeholder="Your name">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label>Phone Number *</label>
                    <input type="tel" id="booking-phone" required placeholder="(734) 555-0199">
                </div>
            </div>

            <div class="form-group">
                <label>Email (optional)</label>
                <input type="email" id="booking-email" placeholder="you@email.com">
            </div>

            <div class="form-group">
                <label>Property Address *</label>
                <input type="text" id="booking-address" required placeholder="123 Main St, City, MI 48000">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div class="form-group" style="margin-bottom: 0;">
                    <label>Preferred Date *</label>
                    <input type="date" id="booking-date" required min="${today}">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label>Preferred Time *</label>
                    <select id="booking-time" required style="width: 100%; padding: 10px 12px; border: 1px solid var(--glass-border); border-radius: var(--radius-md); font-size: 1rem; background: #fff;">
                        <option value="">Select time...</option>
                        <option value="Morning (8am-11am)">Morning (8am-11am)</option>
                        <option value="Midday (11am-1pm)">Midday (11am-1pm)</option>
                        <option value="Afternoon (1pm-4pm)">Afternoon (1pm-4pm)</option>
                        <option value="Late Afternoon (4pm-6pm)">Late Afternoon (4pm-6pm)</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label>Notes (optional)</label>
                <textarea id="booking-notes" rows="2" placeholder="Gate code, special instructions, etc." style="width: 100%; padding: 10px 12px; border: 1px solid var(--glass-border); border-radius: var(--radius-md); font-size: 1rem; resize: vertical;"></textarea>
            </div>

            ${needsContract ? `
            <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: var(--radius-md); padding: 20px; margin-top: 8px;">
                <p style="font-weight: 700; color: #b45309; margin-bottom: 8px;">⚠️ Property Marking Required for ${service.name}</p>
                <p style="font-size: 0.88rem; color: #92400e; line-height: 1.5; margin-bottom: 12px;">
                    You <strong>MUST plant flags</strong> on all sprinkler heads, invisible dog fences, underground wiring, and utility lines <strong>before service day</strong>. 
                    Book JT Landscaping is NOT responsible for damage to unmarked underground items. All repair costs for unmarked items are the customer's responsibility.
                </p>
                <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; font-size: 0.92rem; margin-bottom: 8px;">
                    <input type="checkbox" id="contract-agree" required style="width: 20px; height: 20px; margin-top: 2px; accent-color: #b45309; flex-shrink: 0;">
                    <span>I understand and accept. I will mark all underground items before service day.</span>
                </label>
                <div class="form-group" style="margin-bottom: 0; margin-top: 10px;">
                    <label style="font-size: 0.88rem;">Type your name to sign *</label>
                    <input type="text" id="contract-signature" required placeholder="Your full name as signature">
                </div>
            </div>
            ` : ''}

            <button type="submit" id="submit-booking-btn" class="btn btn-primary btn-full btn-large" style="margin-top: 20px; font-size: 1.05rem;">
                Submit Booking Request
            </button>
        </form>
    `;
  },

  handleBookingFormSubmit() {
    const bk = window.BookProBooking.currentBooking;
    const service = window.BookProServices.getById(bk.serviceId);
    const needsContract = service ? !!service.requiresContract : false;

    const name = document.getElementById('booking-name').value.trim();
    const phone = document.getElementById('booking-phone').value.trim();
    const email = document.getElementById('booking-email').value.trim();
    const address = document.getElementById('booking-address').value.trim();
    const date = document.getElementById('booking-date').value;
    const time = document.getElementById('booking-time').value;
    const notes = document.getElementById('booking-notes').value.trim();

    let signature = '';
    if (needsContract) {
        const agreeEl = document.getElementById('contract-agree');
        const sigEl = document.getElementById('contract-signature');
        if (!agreeEl.checked || !sigEl.value.trim()) {
            this.showToast('Please accept the waiver and sign your name', 'warning');
            return;
        }
        signature = sigEl.value.trim();
    }

    // Disable the submit button to prevent double-clicks
    const btn = document.getElementById('submit-booking-btn');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending...';
    }

    // Build the booking record
    const bookingData = {
        serviceId: service.id,
        serviceName: service.name,
        servicePrice: service.price,
        serviceDuration: service.duration,
        date: date,
        time: time,
        customerName: name,
        customerEmail: email || 'Not provided',
        customerPhone: phone,
        customerAddress: address,
        notes: notes || 'None',
        signatureName: needsContract ? signature : 'N/A',
        contractAgreed: needsContract,
        status: 'pending'
    };

    // Save locally
    const newBooking = window.BookProBooking.create(bookingData);

    // Send real email via Formsubmit.co
    this.sendBookingEmail(bookingData, newBooking);
  },

  sendBookingEmail(data, booking) {
    const ownerEmail = localStorage.getItem('bookpro_owner_email') || this.ownerEmail;

    const formData = new FormData();
    formData.append('name', data.customerName);
    formData.append('email', data.customerEmail);
    formData.append('phone', data.customerPhone);
    formData.append('_subject', `🌿 NEW BOOKING: ${data.serviceName} - ${data.customerName}`);
    formData.append('Service', data.serviceName);
    formData.append('Price', `$${data.servicePrice}`);
    formData.append('Preferred Date', data.date);
    formData.append('Preferred Time', data.time);
    formData.append('Property Address', data.customerAddress);
    formData.append('Notes', data.notes);
    formData.append('Waiver Signed', data.contractAgreed ? `YES (${data.signatureName})` : 'Not required');
    formData.append('_captcha', 'false');
    formData.append('_template', 'table');

    fetch(`https://formsubmit.co/ajax/${ownerEmail}`, {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(response => {
      console.log('Email sent:', response);
      this.renderConfirmation(booking);
    })
    .catch(err => {
      console.error('Email send error:', err);
      // Still show confirmation even if email fails
      this.renderConfirmation(booking);
    });
  },

  renderConfirmation(booking) {
    this.currentPage = 'confirmation';
    document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));

    const pageEl = document.getElementById('page-confirmation');
    if (pageEl) {
        pageEl.classList.add('active');
        pageEl.innerHTML = `
            <div class="confirmation-content text-center" style="padding-top: 100px;">
                <div style="width: 80px; height: 80px; background: rgba(16, 185, 129, 0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 2.5rem;">✅</div>
                <h2 style="margin-bottom: 12px;">Request Received!</h2>
                <p style="color: var(--text-secondary); font-size: 1.05rem; max-width: 480px; margin: 0 auto 28px; line-height: 1.5;">
                    Thank you, <strong>${booking.customerName}</strong>. Your request for <strong>${booking.serviceName}</strong> on <strong>${booking.date}</strong> has been sent to us.
                </p>
                
                <div style="background: #f8fafc; border: 1px solid var(--glass-border); padding: 20px; border-radius: var(--radius-md); max-width: 440px; margin: 0 auto 28px; text-align: left;">
                    <p style="font-weight: 600; margin-bottom: 10px;">📞 What happens next?</p>
                    <p style="font-size: 0.92rem; color: var(--text-secondary); line-height: 1.5;">
                        We will call or text you at <strong>${booking.customerPhone}</strong> to confirm your appointment date and arrival window.
                    </p>
                </div>

                <button class="btn btn-primary" onclick="window.BookProApp.navigateTo('home')">Back to Home</button>
            </div>
        `;
    }
    this.showToast('Request submitted!', 'success');
  },
  
  // ============================
  // ADMIN
  // ============================

  renderAdmin() {
    const loginSection = document.getElementById('admin-login-section');
    const dashboardSection = document.getElementById('admin-dashboard-section');
    
    if (window.BookProAdmin.isAuthenticated) {
        if(loginSection) loginSection.style.display = 'none';
        if(dashboardSection) dashboardSection.style.display = 'block';
        const logoutBtn = document.getElementById('admin-logout-btn');
        if(logoutBtn) logoutBtn.style.display = 'inline-flex';
        window.BookProAdmin.renderDashboard();
        
        // Setup tabs
        const tabBtns = document.querySelectorAll('.admin-tab');
        tabBtns.forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', (e) => {
                document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const tabId = e.target.getAttribute('data-tab');
                const servicesEl = document.getElementById('admin-services-container');
                const bookingsEl = document.getElementById('admin-bookings-container');
                const settingsEl = document.getElementById('admin-settings-container');

                if (servicesEl) servicesEl.style.display = tabId === 'services' ? 'block' : 'none';
                if (bookingsEl) bookingsEl.style.display = tabId === 'bookings' ? 'block' : 'none';
                if (settingsEl) settingsEl.style.display = tabId === 'settings' ? 'block' : 'none';
            });
        });
        
        const servicesEl = document.getElementById('admin-services-container');
        const bookingsEl = document.getElementById('admin-bookings-container');
        const settingsEl = document.getElementById('admin-settings-container');
        if (servicesEl) servicesEl.style.display = 'block';
        if (bookingsEl) bookingsEl.style.display = 'none';
        if (settingsEl) settingsEl.style.display = 'none';

    } else {
        if(loginSection) loginSection.style.display = 'block';
        if(dashboardSection) dashboardSection.style.display = 'none';
        
        if(loginSection) {
            loginSection.innerHTML = `
                <div class="login-card" style="max-width: 400px; margin: 40px auto; padding: 2rem; border-radius: var(--radius-lg); background: var(--glass-bg); backdrop-filter: var(--glass-blur); border: 1px solid var(--glass-border); box-shadow: var(--glass-shadow);">
                    <h3 class="text-center" style="margin-bottom: 1.5rem;">🔐 Admin Login</h3>
                    <form onsubmit="event.preventDefault(); const p = document.getElementById('admin-pass').value; if(window.BookProAdmin.login(p)){ window.BookProApp.renderAdmin(); document.getElementById('admin-logout-btn').style.display='inline-flex'; } else { window.BookProApp.showToast('Invalid password', 'error'); }">
                        <div class="form-group">
                            <label class="form-label">Password</label>
                            <input type="password" id="admin-pass" class="form-input" required placeholder="Enter admin password">
                        </div>
                        <button type="submit" class="btn btn-primary btn-full" style="margin-top: 1rem;">Login</button>
                    </form>
                </div>
            `;
        }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.BookProApp.init();
});
