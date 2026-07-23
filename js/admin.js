window.BookProAdmin = {
  isAuthenticated: false,
  password: 'sky22art',
  
  login(password) {
    if (password === this.password) {
      this.isAuthenticated = true;
      sessionStorage.setItem('bookpro_admin_auth', 'sky22art');
      return true;
    }
    return false;
  },
  
  logout() {
    this.isAuthenticated = false;
    sessionStorage.removeItem('bookpro_admin_auth');
    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (window.BookProApp) {
        window.BookProApp.navigateTo('admin');
    }
  },

  checkAuth() {
    if (sessionStorage.getItem('bookpro_admin_auth') === this.password) {
        this.isAuthenticated = true;
    } else {
        this.isAuthenticated = false;
        sessionStorage.removeItem('bookpro_admin_auth');
    }
  },
  
  getStats() {
    const services = window.BookProServices.getAll();
    const bookings = window.BookProBooking.getAll();
    const upcomingBookings = window.BookProBooking.getUpcoming();
    
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const todayBookings = window.BookProBooking.getByDate(todayStr);
    
    const revenue = bookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + (Number(b.servicePrice) || 0), 0);
        
    return {
      totalServices: services.length,
      totalBookings: bookings.length,
      upcomingBookings: upcomingBookings.length,
      todayBookings: todayBookings.length,
      revenue
    };
  },
  
  renderDashboard() {
    const statsContainer = document.getElementById('admin-stats-container');
    if (statsContainer) {
        const stats = this.getStats();
        statsContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon">📋</div>
                <div class="stat-info">
                    <div class="stat-label">Total Services</div>
                    <div class="stat-value">${stats.totalServices}</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📅</div>
                <div class="stat-info">
                    <div class="stat-label">Upcoming Bookings</div>
                    <div class="stat-value">${stats.upcomingBookings}</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">⏰</div>
                <div class="stat-info">
                    <div class="stat-label">Today's Bookings</div>
                    <div class="stat-value">${stats.todayBookings}</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">💰</div>
                <div class="stat-info">
                    <div class="stat-label">Revenue</div>
                    <div class="stat-value">$${stats.revenue}</div>
                </div>
            </div>
        `;
    }
    
    this.renderServicesTable();
    this.renderBookingsTable();
    this.renderSettings();
  },

  renderSettings() {
    const container = document.getElementById('admin-settings-container');
    if (!container) return;

    const currentEmail = localStorage.getItem('bookpro_owner_email') || 'jakemtornabene@gmail.com';
    const liveUrl = 'https://jake10sportmode.github.io/book-jt-landscaping/';
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(liveUrl)}`;

    const currentServicesJson = JSON.stringify(window.BookProServices.getAll(), null, 2);

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 24px; max-width: 700px;">
        
        <!-- QR Code & Live Site Card -->
        <div style="background: #ffffff; border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: 32px; box-shadow: var(--glass-shadow);">
          <h3 style="margin-bottom: 12px;">📱 Live Website & QR Code</h3>
          <p style="font-size: 0.9em; color: var(--text-secondary); margin-bottom: 20px;">
            This is your official live website link for customers and QR code scans:
          </p>
          
          <div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
            <div style="background: #f8fafc; padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--glass-border); text-align: center;">
              <img src="${qrUrl}" alt="Live QR Code" style="width: 180px; height: 180px; display: block; border-radius: 8px;">
              <a href="${qrUrl}" download="book-jt-landscaping-qr.png" target="_blank" style="font-size: 0.8rem; color: var(--primary-start); font-weight: 600; text-decoration: none; display: inline-block; margin-top: 8px;">📥 Download QR Code</a>
            </div>
            
            <div style="flex: 1; min-width: 240px;">
              <label style="font-weight: 600; font-size: 0.9rem;">Live Published Website URL:</label>
              <div style="display: flex; gap: 8px; margin-top: 6px;">
                <input type="text" readonly value="${liveUrl}" class="form-input" style="font-family: monospace; font-size: 0.88rem; background: #f8fafc;">
                <a href="${liveUrl}" target="_blank" class="btn btn-secondary" style="text-decoration: none; white-space: nowrap;">Open 🔗</a>
              </div>
              <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 10px; line-height: 1.4;">
                When customers scan your QR code on their phone, they will be taken to this live URL!
              </p>
            </div>
          </div>
        </div>

        <!-- Owner Email Settings Card -->
        <div style="background: #ffffff; border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: 32px; box-shadow: var(--glass-shadow);">
          <h3 style="margin-bottom: 20px;">📧 Owner Email Settings</h3>
          
          <form onsubmit="event.preventDefault(); window.BookProAdmin.saveSettings();">
            <div class="form-group" style="margin-bottom: 20px;">
              <label>Business Owner Email Address</label>
              <input type="email" id="settings-email" class="form-input" required value="${currentEmail}" placeholder="jakemtornabene@gmail.com">
              <span style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-top: 4px;">Notification email for customer booking requests, addresses, and signed waivers.</span>
            </div>

            <div style="display: flex; gap: 12px; margin-top: 24px;">
              <button type="submit" class="btn btn-primary">Save Email Settings</button>
              <button type="button" class="btn btn-secondary" onclick="window.BookProAdmin.testEmailLink()">Test Email Link</button>
            </div>
          </form>
        </div>

        <!-- Catalog Exporter Card -->
        <div style="background: #ffffff; border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: 32px; box-shadow: var(--glass-shadow);">
          <h3 style="margin-bottom: 12px;">💾 Publish Admin Edits to Live Site & QR Code</h3>
          <p style="font-size: 0.9em; color: var(--text-secondary); margin-bottom: 16px;">
            If you added, edited, or deleted services in Admin mode, click below to copy your current service catalog code so it can be published to GitHub for all QR code scans!
          </p>

          <textarea id="catalog-json-box" class="form-textarea" style="height: 120px; font-family: monospace; font-size: 0.82rem; margin-bottom: 16px;" readonly>${currentServicesJson}</textarea>
          
          <div style="display: flex; gap: 12px;">
            <button class="btn btn-primary" onclick="window.BookProAdmin.copyCatalogJson()">📋 Copy Catalog Code</button>
            <button class="btn btn-secondary" onclick="window.BookProAdmin.resetToDefaultServices()">🔄 Reset to Default Services</button>
          </div>
        </div>

      </div>
    `;
  },

  saveSettings() {
    const emailInput = document.getElementById('settings-email');
    if (!emailInput) return;

    const email = emailInput.value.trim();
    if (!email || !email.includes('@')) {
      window.BookProApp.showToast('Please enter a valid email address', 'warning');
      return;
    }

    localStorage.setItem('bookpro_owner_email', email);
    window.BookProApp.showToast('Owner email settings saved!', 'success');
  },

  testEmailLink() {
    const email = localStorage.getItem('bookpro_owner_email') || 'jakemtornabene@gmail.com';
    const subject = encodeURIComponent('🌿 TEST NOTIFICATION - Book JT Landscaping');
    const body = encodeURIComponent('This is a test notification from Book JT Landscaping Admin Settings.\n\nEverything is set up and working!');
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
  },

  copyCatalogJson() {
    const box = document.getElementById('catalog-json-box');
    if (box) {
      box.select();
      navigator.clipboard.writeText(box.value);
      window.BookProApp.showToast('Service catalog copied to clipboard!', 'success');
    }
  },

  resetToDefaultServices() {
    if (confirm('Reset services to master defaults?')) {
      localStorage.removeItem('bookpro_services');
      window.BookProServices.initDefaults();
      this.renderDashboard();
      window.BookProApp.renderServices('services-grid', window.BookProServices.getAll().slice(0, 3));
      window.BookProApp.renderServices('all-services-grid', window.BookProServices.getAll());
      window.BookProApp.showToast('Services reset to default catalog!', 'info');
    }
  },
  
  renderServicesTable() {
    const container = document.getElementById('admin-services-container');
    if (!container) return;
    
    const services = window.BookProServices.getAll();
    
    let html = `
      <div class="admin-table-header">
         <button class="btn btn-primary" onclick="window.BookProAdmin.showServiceModal(null)">Add Service</button>
      </div>
      <div class="table-responsive">
          <table class="admin-table">
            <thead>
                <tr>
                    <th>Icon</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Duration</th>
                    <th>Price</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    if (services.length === 0) {
        html += `<tr><td colspan="6">No services found.</td></tr>`;
    } else {
        services.forEach(s => {
            html += `
                <tr>
                    <td><div class="service-icon-small" style="background-color: ${s.color}20; color: ${s.color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">${s.icon}</div></td>
                    <td>
                        <strong>${s.name}</strong>
                        ${s.requiresContract ? '<span style="background: rgba(245, 158, 11, 0.15); color: #b45309; font-size: 0.75em; padding: 2px 6px; border-radius: 4px; font-weight: 600; margin-left: 6px; display: inline-block;">📜 Waiver Required</span>' : ''}
                    </td>
                    <td>${s.category}</td>
                    <td>${s.duration} min</td>
                    <td>$${s.price}</td>
                    <td>
                        <button class="btn btn-small btn-secondary" onclick="window.BookProAdmin.showServiceModal('${s.id}')">Edit</button>
                        <button class="btn btn-small btn-danger" onclick="window.BookProAdmin.handleDeleteService('${s.id}')">Delete</button>
                    </td>
                </tr>
            `;
        });
    }
    html += `</tbody></table></div>`;
    container.innerHTML = html;
  },
  
  renderBookingsTable() {
    const container = document.getElementById('admin-bookings-container');
    if (!container) return;
    
    const bookings = window.BookProBooking.getAll().sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    let html = `
      <div class="table-responsive">
          <table class="admin-table">
            <thead>
                <tr>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Requested Date/Time</th>
                    <th>Address</th>
                    <th>Contract & Waiver</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    if (bookings.length === 0) {
        html += `<tr><td colspan="7">No booking requests found.</td></tr>`;
    } else {
        bookings.forEach(b => {
            const statusLabel = b.status === 'pending' ? '⏳ Requested' : (b.status === 'confirmed' ? '✅ Confirmed' : '❌ Cancelled');
            const statusClass = b.status === 'pending' ? 'status-warning' : `status-${b.status}`;
            
            html += `
                <tr>
                    <td>
                        <div><strong>${b.customerName}</strong></div>
                        <div class="text-small">${b.customerEmail}</div>
                        <div class="text-small">📱 ${b.customerPhone}</div>
                    </td>
                    <td>${b.serviceName}</td>
                    <td>${b.date}<br>${b.time}</td>
                    <td>${b.customerAddress || 'N/A'}</td>
                    <td>
                        ${b.contractAgreed ? `<button class="btn btn-small btn-secondary" onclick="window.BookProAdmin.showContractModal('${b.id}')">📜 View Signed Waiver</button>` : '<span class="text-small">None</span>'}
                    </td>
                    <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
                    <td>
                        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                            ${b.status === 'pending' ? `<button class="btn btn-small btn-success" onclick="window.BookProAdmin.handleConfirmBooking('${b.id}')">Approve & Confirm</button>` : ''}
                            ${b.status !== 'cancelled' ? `<button class="btn btn-small btn-danger" onclick="window.BookProAdmin.handleCancelBooking('${b.id}')">Cancel</button>` : ''}
                        </div>
                    </td>
                </tr>
            `;
        });
    }
    
    html += `</tbody></table></div>`;
    container.innerHTML = html;
  },

  showContractModal(bookingId) {
    const booking = window.BookProBooking.getById(bookingId);
    if (!booking) return;

    let modal = document.getElementById('contract-view-modal');
    if (modal) modal.remove();

    const modalHtml = `
        <div id="contract-view-modal" class="modal show">
            <div class="modal-content" style="max-width: 600px;">
                <span class="close-modal" onclick="document.getElementById('contract-view-modal').remove()">&times;</span>
                <h3>📜 Signed Property & Aeration Contract</h3>
                <p style="font-size: 0.85em; color: var(--text-muted); margin-bottom: 16px;">Booking ID: ${booking.id}</p>

                <div style="background: #f8fafc; border: 1px solid var(--glass-border); padding: 16px; border-radius: var(--radius-md); font-size: 0.9em; line-height: 1.5; margin-bottom: 16px; max-height: 240px; overflow-y: auto;">
                    <p><strong>Customer Name:</strong> ${booking.customerName}</p>
                    <p><strong>Service Address:</strong> ${booking.customerAddress || 'N/A'}</p>
                    <p><strong>Service:</strong> ${booking.serviceName}</p>
                    <hr style="margin: 10px 0; border: none; border-top: 1px solid #e2e8f0;">
                    <p style="color: #b45309; font-weight: 700;">⚠️ Aeration & Underground Object Marking Clause:</p>
                    <p style="color: #92400e; font-size: 0.88em;">
                        Customer MUST plant flags on all sprinkler heads, valve boxes, invisible dog fences, and shallow utility lines. Book JT Landscaping is NOT responsible for damages to unmarked items; repair costs for unmarked items are customer liability.
                    </p>
                </div>

                <div style="border-top: 1px solid var(--glass-border); padding-top: 14px;">
                    <p><strong>Digital Signature:</strong> <span style="font-family: cursive, sans-serif; font-size: 1.2em; color: var(--primary-start);">${booking.signatureName || booking.customerName}</span></p>
                    <p><strong>Date Signed:</strong> ${booking.signatureDate || new Date(booking.createdAt).toLocaleDateString()}</p>
                    <p><strong>Terms Accepted:</strong> <span style="color: var(--success); font-weight: 700;">YES ✅</span></p>
                </div>

                <button class="btn btn-secondary btn-full" style="margin-top: 20px;" onclick="document.getElementById('contract-view-modal').remove()">Close Contract</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  handleConfirmBooking(id) {
    if (confirm('Approve and confirm this appointment request?')) {
        window.BookProBooking.confirmAppointment(id);
        window.BookProApp.showToast('Appointment approved & confirmed!', 'success');
        this.renderDashboard();
    }
  },
  
  showServiceModal(serviceId) {
    let modal = document.getElementById('service-modal');
    if (!modal) {
        const modalHtml = `
            <div id="service-modal" class="modal">
                <div class="modal-content">
                    <span class="close-modal" onclick="document.getElementById('service-modal').classList.remove('show')">&times;</span>
                    <h2 id="service-modal-title">Add Service</h2>
                    <form id="service-form" onsubmit="window.BookProAdmin.handleServiceFormSubmit(event)">
                        <input type="hidden" id="service-id" name="id">
                        <div class="form-group">
                            <label>Name</label>
                            <input type="text" id="service-name" required>
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="service-description" required></textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Price ($)</label>
                                <input type="number" id="service-price" required min="0">
                            </div>
                            <div class="form-group">
                                <label>Duration (min)</label>
                                <input type="number" id="service-duration" required min="0" step="5">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Category</label>
                                <input type="text" id="service-category" required>
                            </div>
                            <div class="form-group">
                                <label>Icon (Emoji)</label>
                                <input type="text" id="service-icon" required>
                            </div>
                            <div class="form-group">
                                <label>Color (Hex)</label>
                                <input type="color" id="service-color" required value="#6366f1">
                            </div>
                        </div>
                        <div class="form-group" style="margin-top: 10px; margin-bottom: 20px;">
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.95rem;">
                                <input type="checkbox" id="service-requires-contract" style="width: 18px; height: 18px; accent-color: var(--primary-start);">
                                <span>Require Signed Property & Aeration Contract/Waiver</span>
                            </label>
                            <span style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-top: 4px;">When checked, customers must sign the property & flagging waiver for this service.</span>
                        </div>
                        <button type="submit" class="btn btn-primary btn-full">Save Service</button>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modal = document.getElementById('service-modal');
    }
    
    const form = document.getElementById('service-form');
    
    if (serviceId) {
        const service = window.BookProServices.getById(serviceId);
        if (service) {
            document.getElementById('service-modal-title').textContent = 'Edit Service';
            document.getElementById('service-id').value = service.id;
            document.getElementById('service-name').value = service.name;
            document.getElementById('service-description').value = service.description;
            document.getElementById('service-price').value = service.price;
            document.getElementById('service-duration').value = service.duration;
            document.getElementById('service-category').value = service.category;
            document.getElementById('service-icon').value = service.icon;
            document.getElementById('service-color').value = service.color || '#6366f1';
            document.getElementById('service-requires-contract').checked = !!service.requiresContract;
        }
    } else {
        document.getElementById('service-modal-title').textContent = 'Add Service';
        form.reset();
        document.getElementById('service-id').value = '';
        document.getElementById('service-requires-contract').checked = false;
    }
    
    modal.classList.add('show');
  },
  
  handleServiceFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('service-id').value;
    const data = {
        name: document.getElementById('service-name').value,
        description: document.getElementById('service-description').value,
        price: Number(document.getElementById('service-price').value),
        duration: Number(document.getElementById('service-duration').value),
        category: document.getElementById('service-category').value,
        icon: document.getElementById('service-icon').value,
        color: document.getElementById('service-color').value,
        requiresContract: document.getElementById('service-requires-contract').checked
    };
    
    if (id) {
        window.BookProServices.update(id, data);
        window.BookProApp.showToast('Service updated successfully', 'success');
    } else {
        window.BookProServices.create(data);
        window.BookProApp.showToast('Service added successfully', 'success');
    }
    
    document.getElementById('service-modal').classList.remove('show');
    this.renderDashboard();
    // Refresh customer-facing service pages
    window.BookProApp.renderServices('services-grid', window.BookProServices.getAll().slice(0, 3));
    window.BookProApp.renderServices('all-services-grid', window.BookProServices.getAll());
  },
  
  handleDeleteService(id) {
    if (confirm('Are you sure you want to delete this service?')) {
        window.BookProServices.delete(id);
        window.BookProApp.showToast('Service deleted', 'info');
        this.renderDashboard();
        // Refresh customer-facing service pages
        window.BookProApp.renderServices('services-grid', window.BookProServices.getAll().slice(0, 3));
        window.BookProApp.renderServices('all-services-grid', window.BookProServices.getAll());
    }
  },
  
  handleCancelBooking(id) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        window.BookProBooking.cancel(id);
        window.BookProApp.showToast('Booking cancelled', 'info');
        this.renderDashboard();
    }
  }
};
