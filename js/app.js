window.BookProApp = {
  currentPage: 'home',
  ownerEmail: 'jakemtornabene@gmail.com',
  
  toggleMenu() {
    const nav = document.querySelector('.nav-links');
    if (nav) nav.classList.toggle('open');
  },

  init() {
    window.BookProServices.initDefaults();
    window.BookProAdmin.checkAuth();
    
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-page]');
      if (target) {
        e.preventDefault();
        this.navigateTo(target.getAttribute('data-page'));
      }
    });

    const menuBtn = document.getElementById('mobile-menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenu();
        });
    }

    window.addEventListener('hashchange', () => {
      if (this.isNavigating) return;
      let hash = window.location.hash.substring(1) || 'home';
      if (this.currentPage !== hash) this.navigateTo(hash);
    });

    this.navigateTo(window.location.hash.substring(1) || 'home');
  },

  navigateTo(page, data = null) {
    this.currentPage = page;
    
    document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
    const pageEl = document.getElementById(`page-${page}`);
    if (pageEl) pageEl.classList.add('active');

    document.querySelectorAll('[data-page]').forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-page') === page);
    });

    window.scrollTo(0, 0);

    if (window.location.hash.substring(1) !== page) {
        this.isNavigating = true;
        window.location.hash = page;
        setTimeout(() => { this.isNavigating = false; }, 50);
    }

    const nav = document.querySelector('.nav-links');
    if (nav && nav.classList.contains('open')) nav.classList.remove('open');

    if (page === 'home') {
        this.renderServices('services-grid', window.BookProServices.getAll().slice(0, 3));
    } else if (page === 'services') {
        this.renderServices('all-services-grid', window.BookProServices.getAll());
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
    setTimeout(() => toast.classList.add('show'), 10);
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
        container.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">No services available.</p>';
        return;
    }
    
    container.innerHTML = services.map(s => this.renderServiceCard(s)).join('');
  },

  renderServiceCard(service) {
    return `
      <div class="service-card" style="--accent-color: ${service.color}">
        <div class="service-icon-wrapper" style="background-color: ${service.color}20; color: ${service.color}">
            <span class="service-icon">${service.icon}</span>
        </div>
        <h3 class="service-title">${service.name}</h3>
        <p class="service-desc">${service.description}</p>
        <div class="service-details">
            <span class="service-price">$${service.price}</span>
        </div>
        <button class="btn btn-primary btn-full book-btn" onclick="window.BookProApp.navigateTo('booking', {serviceId: '${service.id}'})">Book Now</button>
      </div>
    `;
  },

  renderBookingPage() {
    const content = document.getElementById('booking-step-content');
    const stepsContainer = document.querySelector('.booking-steps');
    if (stepsContainer) stepsContainer.innerHTML = '';
    if (!content) return;

    const bk = window.BookProBooking.currentBooking;
    const service = window.BookProServices.getById(bk.serviceId);
    if (!service) return this.navigateTo('services');
    const needsContract = !!service.requiresContract;

    content.innerHTML = `
        <div style="background: ${service.color}10; border: 1px solid ${service.color}30; border-radius: var(--radius-md); padding: 16px 20px; margin-bottom: 28px; display: flex; align-items: center; gap: 14px;">
            <div style="background: ${service.color}20; color: ${service.color}; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0;">${service.icon}</div>
            <div>
                <strong style="font-size: 1.1rem;">${service.name}</strong>
                <div style="color: var(--text-secondary); font-size: 0.95rem;">$${service.price}</div>
            </div>
        </div>

        <form id="booking-main-form" onsubmit="event.preventDefault(); window.BookProApp.handleSubmit();">
            <div class="form-group">
                <label>Name</label>
                <input type="text" id="booking-name" required placeholder="Your full name">
            </div>

            <div class="form-group">
                <label>Phone</label>
                <input type="tel" id="booking-phone" required placeholder="(734) 555-0199">
            </div>

            <div class="form-group">
                <label>Email</label>
                <input type="email" id="booking-email" required placeholder="you@email.com">
            </div>

            <div class="form-group">
                <label>Property Address</label>
                <input type="text" id="booking-address" required placeholder="123 Main St, City, MI 48000">
            </div>

            ${needsContract ? `
            <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: var(--radius-md); padding: 20px; margin-top: 8px;">
                <p style="font-weight: 700; color: #b45309; margin-bottom: 8px;">⚠️ Property Marking Required</p>
                <p style="font-size: 0.88rem; color: #92400e; line-height: 1.5; margin-bottom: 12px;">
                    You <strong>must plant flags</strong> on all sprinkler heads, invisible dog fences, underground wiring, and utility lines <strong>before service day</strong>. 
                    Book JT Landscaping is not responsible for damage to unmarked items. All repair costs for unmarked items are the customer's responsibility.
                </p>
                <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; font-size: 0.92rem; margin-bottom: 10px;">
                    <input type="checkbox" id="contract-agree" required style="width: 20px; height: 20px; margin-top: 2px; accent-color: #b45309; flex-shrink: 0;">
                    <span>I understand. I will mark all underground items before service day.</span>
                </label>
                <div class="form-group" style="margin-bottom: 0;">
                    <label style="font-size: 0.88rem;">Sign your name</label>
                    <input type="text" id="contract-signature" required placeholder="Type your full name">
                </div>
            </div>
            ` : ''}

            <button type="submit" id="submit-btn" class="btn btn-primary btn-full btn-large" style="margin-top: 24px;">
                Submit Request
            </button>
        </form>
    `;
  },

  handleSubmit() {
    const bk = window.BookProBooking.currentBooking;
    const service = window.BookProServices.getById(bk.serviceId);
    const needsContract = service ? !!service.requiresContract : false;

    const name = document.getElementById('booking-name').value.trim();
    const phone = document.getElementById('booking-phone').value.trim();
    const email = document.getElementById('booking-email').value.trim();
    const address = document.getElementById('booking-address').value.trim();

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

    const btn = document.getElementById('submit-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }

    const data = {
        serviceName: service.name,
        servicePrice: service.price,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        customerAddress: address,
        signatureName: needsContract ? signature : 'N/A',
        contractAgreed: needsContract,
        status: 'pending'
    };

    const newBooking = window.BookProBooking.create(data);
    this.sendEmail(data, newBooking);
  },

  sendEmail(data, booking) {
    const ownerEmail = localStorage.getItem('bookpro_owner_email') || this.ownerEmail;

    const formData = new FormData();
    formData.append('name', data.customerName);
    formData.append('email', data.customerEmail);
    formData.append('phone', data.customerPhone);
    formData.append('_subject', `🌿 NEW BOOKING: ${data.serviceName} - ${data.customerName}`);
    formData.append('Service', data.serviceName);
    formData.append('Price', `$${data.servicePrice}`);
    formData.append('Property Address', data.customerAddress);
    formData.append('Waiver Signed', data.contractAgreed ? `YES (${data.signatureName})` : 'Not required');
    formData.append('_captcha', 'false');
    formData.append('_template', 'table');

    fetch(`https://formsubmit.co/ajax/${ownerEmail}`, {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(() => this.renderConfirmation(booking))
    .catch(() => this.renderConfirmation(booking));
  },

  renderConfirmation(booking) {
    this.currentPage = 'confirmation';
    document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));

    const pageEl = document.getElementById('page-confirmation');
    if (pageEl) {
        pageEl.classList.add('active');
        pageEl.innerHTML = `
            <div class="confirmation-content text-center" style="padding-top: 100px;">
                <div style="font-size: 3.5rem; margin-bottom: 20px;">✅</div>
                <h2 style="margin-bottom: 12px;">Got it!</h2>
                <p style="color: var(--text-secondary); font-size: 1.05rem; max-width: 400px; margin: 0 auto 28px; line-height: 1.6;">
                    Thanks <strong>${booking.customerName}</strong>. We'll call or text you at <strong>${booking.customerPhone}</strong> to set up your appointment.
                </p>
                <button class="btn btn-primary" onclick="window.BookProApp.navigateTo('home')">Done</button>
            </div>
        `;
    }
    this.showToast('Request sent!', 'success');
  },

  renderAdmin() {
    const loginSection = document.getElementById('admin-login-section');
    const dashboardSection = document.getElementById('admin-dashboard-section');
    
    if (window.BookProAdmin.isAuthenticated) {
        if(loginSection) loginSection.style.display = 'none';
        if(dashboardSection) dashboardSection.style.display = 'block';
        const logoutBtn = document.getElementById('admin-logout-btn');
        if(logoutBtn) logoutBtn.style.display = 'inline-flex';
        window.BookProAdmin.renderDashboard();
        
        const tabBtns = document.querySelectorAll('.admin-tab');
        tabBtns.forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', (e) => {
                document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const tabId = e.target.getAttribute('data-tab');
                ['services', 'bookings', 'settings'].forEach(t => {
                    const el = document.getElementById(`admin-${t}-container`);
                    if (el) el.style.display = tabId === t ? 'block' : 'none';
                });
            });
        });
        
        ['services', 'bookings', 'settings'].forEach(t => {
            const el = document.getElementById(`admin-${t}-container`);
            if (el) el.style.display = t === 'services' ? 'block' : 'none';
        });

    } else {
        if(loginSection) loginSection.style.display = 'block';
        if(dashboardSection) dashboardSection.style.display = 'none';
        if(loginSection) {
            loginSection.innerHTML = `
                <div class="login-card" style="max-width: 400px; margin: 40px auto; padding: 2rem; border-radius: var(--radius-lg); background: var(--glass-bg); backdrop-filter: var(--glass-blur); border: 1px solid var(--glass-border); box-shadow: var(--glass-shadow);">
                    <h3 class="text-center" style="margin-bottom: 1.5rem;">🔐 Admin Login</h3>
                    <form onsubmit="event.preventDefault(); const p = document.getElementById('admin-pass').value; if(window.BookProAdmin.login(p)){ window.BookProApp.renderAdmin(); document.getElementById('admin-logout-btn').style.display='inline-flex'; } else { window.BookProApp.showToast('Wrong password', 'error'); }">
                        <div class="form-group">
                            <label class="form-label">Password</label>
                            <input type="password" id="admin-pass" class="form-input" required placeholder="Enter password">
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
