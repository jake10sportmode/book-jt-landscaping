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
        // Only set/reset service if explicit serviceId provided
        if (data && data.serviceId) {
            window.BookProBooking.reset();
            window.BookProBooking.setService(data.serviceId);
        }
        
        // Verify we have a selected service
        if (window.BookProBooking.currentBooking.serviceId) {
            const now = new Date();
            this.renderCalendar(now.getFullYear(), now.getMonth());
            this.updateBookingSteps(1);
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
    
    // Trigger animation
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
    const waiverBadge = service.requiresContract ? `<span style="background: rgba(245, 158, 11, 0.15); color: #b45309; font-size: 0.75em; padding: 3px 8px; border-radius: 4px; font-weight: 600; margin-left: 8px; display: inline-block;">📜 Waiver Required</span>` : '';
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
  
  updateBookingSteps(step) {
      const container = document.querySelector('.booking-steps');
      if (!container) return;

      const bk = window.BookProBooking.currentBooking;
      const service = bk.serviceId ? window.BookProServices.getById(bk.serviceId) : null;
      const needsContract = service ? !!service.requiresContract : false;

      let steps = [
          { num: 1, label: 'Preferred Date' },
          { num: 2, label: 'Preferred Time' },
          { num: 3, label: 'Details' }
      ];

      if (needsContract) {
          steps.push({ num: 4, label: 'Contract' });
          steps.push({ num: 5, label: 'Confirm' });
      } else {
          steps.push({ num: 4, label: 'Confirm' });
      }

      let html = '';
      steps.forEach((s, idx) => {
          let classes = 'step';
          if (idx + 1 < step) classes += ' completed';
          if (idx + 1 === step) classes += ' active';

          html += `
              <div class="${classes}">
                  <div class="step-circle">${s.num}</div>
                  <span class="step-label">${s.label}</span>
              </div>
          `;
          if (idx < steps.length - 1) {
              html += `<div class="step-line"></div>`;
          }
      });

      container.innerHTML = html;
  },

  renderCalendar(year, month) {
    this.updateBookingSteps(1);
    const content = document.getElementById('booking-step-content');
    if (!content) return;
    
    const cal = window.BookProBooking.generateCalendar(year, month);
    
    let html = `
        <div class="booking-step-header">
            <h3>Choose Date</h3>
        </div>
        <div class="calendar-wrapper">
            <div class="calendar-controls">
                <button class="btn btn-icon" onclick="window.BookProApp.renderCalendar(${month === 0 ? year-1 : year}, ${month === 0 ? 11 : month-1})">&lt;</button>
                <h4 class="calendar-month">${cal.monthName} ${year}</h4>
                <button class="btn btn-icon" onclick="window.BookProApp.renderCalendar(${month === 11 ? year+1 : year}, ${month === 11 ? 0 : month+1})">&gt;</button>
            </div>
            <div class="calendar-grid">
                <div class="day-label">Sun</div><div class="day-label">Mon</div><div class="day-label">Tue</div>
                <div class="day-label">Wed</div><div class="day-label">Thu</div><div class="day-label">Fri</div><div class="day-label">Sat</div>
    `;
    
    cal.days.forEach(day => {
        if (!day) {
            html += `<div class="calendar-day empty"></div>`;
        } else {
            const isBookable = !day.isPast && window.BookProBooking.businessDays.includes(day.dayOfWeek);
            let classes = 'calendar-day';
            if (day.isToday) classes += ' today';
            if (!isBookable) classes += ' disabled';
            if (window.BookProBooking.currentBooking.date === day.date) classes += ' selected';
            
            html += `<div class="${classes}" ${isBookable ? `onclick="window.BookProApp.selectDate('${day.date}')"` : ''}>${day.dayNum}</div>`;
        }
    });
    
    html += `</div></div>`;
    content.innerHTML = html;
  },
  
  selectDate(dateStr) {
      window.BookProBooking.setDate(dateStr);
      this.renderTimeSlots(dateStr);
  },

  renderCalendarForDate(dateStr) {
    if (!dateStr) {
      const now = new Date();
      return this.renderCalendar(now.getFullYear(), now.getMonth());
    }
    const [y, m] = dateStr.split('-').map(Number);
    this.renderCalendar(y, m - 1);
  },

  renderTimeSlots(dateStr) {
    this.updateBookingSteps(2);
    const content = document.getElementById('booking-step-content');
    if (!content) return;
    
    const service = window.BookProServices.getById(window.BookProBooking.currentBooking.serviceId);
    if (!service) return this.navigateTo('services');

    const slots = window.BookProBooking.getAvailableTimeSlots(dateStr, service.duration);
    
    let html = `
        <div class="booking-step-header">
            <button class="btn btn-text" onclick="window.BookProApp.renderCalendarForDate('${dateStr}')">&larr; Back</button>
            <h3>Choose Requested Time Window</h3>
        </div>
        <p class="text-center" style="margin-bottom: 20px;">Available slots for ${dateStr}</p>
        <div class="time-slots-grid">
    `;
    
    if (slots.length === 0) {
        html += `<p class="text-center" style="grid-column: 1/-1;">No available times on this date. Please select another date.</p>`;
    } else {
        slots.forEach(slot => {
            html += `<button class="btn time-slot-btn" onclick="window.BookProApp.selectTime('${slot}')">${slot}</button>`;
        });
    }
    
    html += `</div>`;
    content.innerHTML = html;
  },

  selectTime(timeStr) {
      window.BookProBooking.setTime(timeStr);
      this.renderBookingForm();
  },
   renderBookingForm() {
    this.updateBookingSteps(3);
    const content = document.getElementById('booking-step-content');
    if (!content) return;
    
    const bk = window.BookProBooking.currentBooking;
    const service = window.BookProServices.getById(bk.serviceId);
    const needsContract = service ? !!service.requiresContract : false;
    const btnText = needsContract ? 'Continue to Service Contract →' : 'Continue to Summary →';
    
    content.innerHTML = `
        <div class="booking-step-header">
            <button class="btn btn-text" onclick="window.BookProApp.renderTimeSlots('${bk.date}')">&larr; Back</button>
            <h3>Your Contact & Location Details</h3>
        </div>
        <form id="booking-contact-form" class="booking-form" onsubmit="event.preventDefault(); window.BookProApp.handleContactSubmit()">
            <div class="form-group">
                <label>Full Name</label>
                <input type="text" id="booking-name" required placeholder="John Doe" value="${bk.customerName || ''}">
            </div>
            <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="booking-email" required placeholder="john@example.com" value="${bk.customerEmail || ''}">
            </div>
            <div class="form-group">
                <label>Phone Number</label>
                <input type="tel" id="booking-phone" required placeholder="(734) 555-0199" value="${bk.customerPhone || ''}">
            </div>
            <div class="form-group">
                <label>Service Property Address</label>
                <input type="text" id="booking-address" required placeholder="123 Main St, City, ST 12345" value="${bk.customerAddress || ''}">
            </div>
            <button type="submit" class="btn btn-primary btn-full" style="margin-top: 15px;">${btnText}</button>
        </form>
    `;
  },

  handleContactSubmit() {
    const name = document.getElementById('booking-name').value;
    const email = document.getElementById('booking-email').value;
    const phone = document.getElementById('booking-phone').value;
    const address = document.getElementById('booking-address').value;
    
    const bk = window.BookProBooking.currentBooking;
    bk.customerName = name;
    bk.customerEmail = email;
    bk.customerPhone = phone;
    bk.customerAddress = address;

    const service = window.BookProServices.getById(bk.serviceId);
    if (service && service.requiresContract) {
      this.renderContractForm();
    } else {
      bk.contractAgreed = false;
      bk.signatureName = null;
      this.renderBookingSummary();
    }
  },

  renderContractForm() {
    this.updateBookingSteps(4);
    const content = document.getElementById('booking-step-content');
    if (!content) return;
    
    const bk = window.BookProBooking.currentBooking;
    const service = window.BookProServices.getById(bk.serviceId);

    content.innerHTML = `
        <div class="booking-step-header">
            <button class="btn btn-text" onclick="window.BookProApp.renderBookingForm()">&larr; Back to Details</button>
            <h3>Service Agreement & Property Liability Waiver</h3>
        </div>
        <div class="contract-wrapper" style="background: #f8fafc; border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: 24px; margin-bottom: 24px; max-height: 320px; overflow-y: auto; font-size: 0.92rem; line-height: 1.6;">
            <h4 style="color: var(--text-primary); margin-bottom: 12px; font-size: 1.05rem;">📋 Book JT Landscaping Service Agreement (${service.name})</h4>
            
            <p><strong>1. Requested Schedule Notice:</strong> Selected dates and times are preferred request windows. Book JT Landscaping will review property location and routing, and confirm final appointment timing via phone/text.</p>
            
            <div style="background: rgba(245, 158, 11, 0.12); border-left: 4px solid var(--warning); padding: 14px; margin: 16px 0; border-radius: 4px;">
                <p style="color: #b45309; font-weight: 700; margin-bottom: 6px;">⚠️ MANDATORY UNDERGROUND OBJECT & UTILITY MARKING REQUIREMENT (Aeration & Excavation):</p>
                <p style="color: #92400e; font-size: 0.9rem;">
                    For Aeration, tilling, dethatching, or any lawn penetration services: 
                    <strong>The Customer MUST mark or plant flags on all underground items prior to the service date</strong> — including sprinkler heads, valve boxes, shallow irrigation lines, invisible dog fences, outdoor lighting wiring, and underground utility cables.
                </p>
                <p style="color: #92400e; font-size: 0.9rem; margin-top: 6px;">
                    <strong>Damages & Liability:</strong> Book JT Landscaping is <u>NOT liable or responsible</u> for damages to any unmarked underground lines, sprinkler equipment, invisible fences, or hidden objects. <strong>Any and all repair costs, parts, or labor resulting from unmarked underground items are the sole financial responsibility of the Customer.</strong>
                </p>
            </div>

            <p><strong>2. Property Access:</strong> Customer agrees to provide clear access to lawns, gates (unlocked), water spigots if required, and ensure pets are secured inside on the scheduled service day.</p>
            <p><strong>3. Payment Terms:</strong> Payment is due upon completion of requested service unless prior invoice terms have been agreed upon.</p>
        </div>

        <form id="contract-form" class="booking-form" onsubmit="event.preventDefault(); window.BookProApp.handleContractSubmit()">
            <div class="form-group" style="margin-bottom: 16px;">
                <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; font-size: 0.95rem;">
                    <input type="checkbox" id="contract-agree" required style="width: 20px; height: 20px; margin-top: 2px; accent-color: var(--primary-start);">
                    <span>I have read, understand, and agree to the Service Agreement terms and the <strong>Underground Item Flagging & Liability Waiver</strong> above.</span>
                </label>
            </div>
            
            <div class="form-group">
                <label>Digital Signature (Type your Legal Full Name to sign)</label>
                <input type="text" id="contract-signature" required placeholder="Type your Full Name to Sign" value="${bk.signatureName || bk.customerName || ''}">
                <span style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">By typing your name, you acknowledge this acts as a legally binding electronic signature.</span>
            </div>

            <button type="submit" class="btn btn-primary btn-full" style="margin-top: 15px;">Accept & Continue to Summary →</button>
        </form>
    `;
  },

  handleContractSubmit() {
    const agree = document.getElementById('contract-agree').checked;
    const signature = document.getElementById('contract-signature').value;
    
    if (!agree || !signature.trim()) {
      this.showToast('Please accept terms and provide your signature', 'warning');
      return;
    }
    
    window.BookProBooking.currentBooking.contractAgreed = true;
    window.BookProBooking.currentBooking.signatureName = signature.trim();
    window.BookProBooking.currentBooking.signatureDate = new Date().toLocaleDateString();

    this.renderBookingSummary();
  },

  renderBookingSummary() {
    const bk = window.BookProBooking.currentBooking;
    const service = window.BookProServices.getById(bk.serviceId);
    const needsContract = service ? !!service.requiresContract : false;

    const currentStep = needsContract ? 5 : 4;
    this.updateBookingSteps(currentStep);

    const content = document.getElementById('booking-step-content');
    if (!content) return;
    
    const backAction = needsContract ? "window.BookProApp.renderContractForm()" : "window.BookProApp.renderBookingForm()";
    const backText = needsContract ? "&larr; Edit Contract" : "&larr; Edit Details";

    let contractSummaryHtml = '';
    if (needsContract) {
      contractSummaryHtml = `
        <div class="summary-section" style="margin-top: 20px; border-top: 1px solid rgba(0,0,0,0.08); padding-top: 20px;">
            <h4>Signed Agreement</h4>
            <p><strong>Status:</strong> <span style="color: var(--success); font-weight: 700;">✅ Contract & Waiver Signed</span></p>
            <p><strong>Digital Signature:</strong> ${bk.signatureName} (Signed ${bk.signatureDate})</p>
            <p style="font-size: 0.85em; color: var(--text-muted); margin-top: 4px;">Includes Underground Marking & Damage Waiver Agreement</p>
        </div>
      `;
    }
    
    content.innerHTML = `
        <div class="booking-step-header">
            <button class="btn btn-text" onclick="${backAction}">${backText}</button>
            <h3>Review & Submit Request</h3>
        </div>
        <div class="summary-card">
            <div class="summary-section">
                <h4>Service Details</h4>
                <p><strong>Service:</strong> ${service.name}</p>
                <p><strong>Requested Date:</strong> ${bk.date} <span style="background: rgba(245,158,11,0.15); color: #b45309; padding: 2px 8px; border-radius: 4px; font-size: 0.8em; font-weight: 600;">Subject to Confirmation</span></p>
                <p><strong>Preferred Time:</strong> ${bk.time}</p>
                <p><strong>Est. Duration:</strong> ${service.duration} min</p>
                <p><strong>Est. Price:</strong> $${service.price}</p>
            </div>
            <div class="summary-section" style="margin-top: 20px; border-top: 1px solid rgba(0,0,0,0.08); padding-top: 20px;">
                <h4>Customer & Property Info</h4>
                <p><strong>Name:</strong> ${bk.customerName}</p>
                <p><strong>Email:</strong> ${bk.customerEmail}</p>
                <p><strong>Phone:</strong> ${bk.customerPhone}</p>
                <p><strong>Property Address:</strong> ${bk.customerAddress}</p>
            </div>
            ${contractSummaryHtml}
        </div>
        <button class="btn btn-primary btn-full btn-large" style="margin-top:20px" onclick="window.BookProApp.handleBookingSubmit()">Submit Booking Request →</button>
    `;
  },

  handleBookingSubmit() {
    const bk = window.BookProBooking.currentBooking;
    const service = window.BookProServices.getById(bk.serviceId);
    const needsContract = service ? !!service.requiresContract : false;
    
    const newBooking = window.BookProBooking.create({
        serviceId: service.id,
        serviceName: service.name,
        servicePrice: service.price,
        serviceDuration: service.duration,
        date: bk.date,
        time: bk.time,
        customerName: bk.customerName,
        customerEmail: bk.customerEmail,
        customerPhone: bk.customerPhone,
        customerAddress: bk.customerAddress,
        signatureName: needsContract ? bk.signatureName : 'N/A (Not Required)',
        signatureDate: needsContract ? bk.signatureDate : null,
        contractAgreed: needsContract
    });
    
    // Send Email notification to owner
    this.sendEmailNotification(newBooking);
    
    this.renderConfirmation(newBooking);
  },

  sendEmailNotification(booking) {
    const email = localStorage.getItem('bookpro_owner_email') || this.ownerEmail;

    const message = `🌿 BOOK JT LANDSCAPING - NEW SERVICE REQUEST!\n\n` +
      `Service: ${booking.serviceName}\n` +
      `Requested Date: ${booking.date} at ${booking.time}\n` +
      `Price: $${booking.servicePrice}\n\n` +
      `CUSTOMER INFO:\n` +
      `Name: ${booking.customerName}\n` +
      `Email: ${booking.customerEmail}\n` +
      `Phone: ${booking.customerPhone}\n` +
      `Property Address: ${booking.customerAddress || 'N/A'}\n\n` +
      `CONTRACT / WAIVER:\n` +
      `Signed: ${booking.contractAgreed ? `YES (${booking.signatureName})` : 'N/A (Standard Service)'}`;

    console.log(`Notification logged for ${email}:\n`, message);
  },

  renderConfirmation(booking) {
    this.currentPage = 'confirmation';
    document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
    
    const email = localStorage.getItem('bookpro_owner_email') || this.ownerEmail;

    const emailSubject = encodeURIComponent(`🌿 NEW BOOKING: ${booking.serviceName} - ${booking.customerName}`);
    const emailBody = encodeURIComponent(
      `🌿 BOOK JT LANDSCAPING SERVICE REQUEST\n\n` +
      `Service: ${booking.serviceName}\n` +
      `Date/Time: ${booking.date} around ${booking.time}\n` +
      `Price: $${booking.servicePrice}\n\n` +
      `CUSTOMER DETAILS:\n` +
      `Name: ${booking.customerName}\n` +
      `Email: ${booking.customerEmail}\n` +
      `Phone: ${booking.customerPhone}\n` +
      `Property Address: ${booking.customerAddress || 'N/A'}\n\n` +
      `CONTRACT & WAIVER:\n` +
      `Signed: ${booking.contractAgreed ? `YES (${booking.signatureName})` : 'N/A (Standard Service)'}`
    );
    const mailtoUrl = `mailto:${email}?subject=${emailSubject}&body=${emailBody}`;

    const pageEl = document.getElementById('page-confirmation');
    if (pageEl) {
        pageEl.classList.add('active');
        pageEl.innerHTML = `
            <div class="confirmation-content text-center">
                <div class="success-icon" style="font-size: 5rem; margin-bottom: 20px;">🌿</div>
                <h2>Service Request Submitted!</h2>
                <p style="margin-bottom: 16px; color: var(--text-secondary); font-size: 1.05rem;">
                    Thank you, <strong>${booking.customerName}</strong>. Your request for <strong>${booking.serviceName}</strong> on <strong>${booking.date} around ${booking.time}</strong> has been received!
                </p>
                
                <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); padding: 20px; border-radius: var(--radius-lg); margin: 24px auto; max-width: 540px; text-align: center; box-shadow: 0 4px 20px rgba(99, 102, 241, 0.1);">
                    <p style="margin-bottom: 8px; font-weight: 700; color: #4338ca; font-size: 1.1rem;">📧 1-Tap Email Booking Details to Owner:</p>
                    <p style="font-size: 0.92em; color: var(--text-secondary); margin-bottom: 16px; line-height: 1.5;">
                        Tap below to open your email app with pre-filled details ready to send directly to <strong>${email}</strong>:
                    </p>
                    <a href="${mailtoUrl}" class="btn btn-primary btn-full btn-large" style="text-decoration: none; font-size: 1.1rem; background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; display: inline-flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);">
                        📧 Send Email Notification to ${email} →
                    </a>
                </div>

                <div style="background: #f8fafc; border: 1px solid var(--glass-border); padding: 20px; border-radius: var(--radius-md); margin: 20px auto 30px; max-width: 540px; text-align: left;">
                    <p style="margin-bottom: 6px; font-weight: 600; color: var(--text-primary);">📅 Schedule Note:</p>
                    <p style="font-size: 0.9em; color: var(--text-secondary);">We will review our daily property routes and contact you at <strong>${booking.customerPhone}</strong> to confirm your final arrival window.</p>
                    
                    <p style="margin-top: 12px; margin-bottom: 4px; font-weight: 600; color: #b45309;">🚩 Flagging Reminder:</p>
                    <p style="font-size: 0.88em; color: var(--text-secondary);">Please remember to plant flags/markers on any sprinkler heads, invisible dog fences, or underground lines prior to service day.</p>
                </div>

                <button class="btn btn-secondary" onclick="window.BookProApp.navigateTo('home')">Return Home</button>
            </div>
        `;
    }
    this.showToast('Request submitted successfully!', 'success');
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
        
        // Setup tabs if not already done
        const tabBtns = document.querySelectorAll('.admin-tab');
        tabBtns.forEach(btn => {
            // Remove existing listener to prevent duplicates
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
        
        // Show default tab (services)
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
                            <label class="form-label">Password <span style='color:var(--text-muted);font-size:0.85em;'>(hint: admin123)</span></label>
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
