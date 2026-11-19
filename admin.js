/*
 * Pratiksha Makeover — Secure Admin Login & Salon Management Dashboard
 * Pure Vanilla JavaScript (Separate Owner/Admin Authentication Only)
 */

(function (global) {
  'use strict';

  function initAdminPage() {
    var gateSection = document.getElementById('adminLoginGate');
    var dashboardSection = document.getElementById('adminDashboardView');
    if (!gateSection || !dashboardSection) return;

    var esc = global.SalonUI.escapeHtml;
    var formatStatus = global.SalonUI.formatStatusBadge;

    var loginForm = document.getElementById('adminLoginForm');
    var loginAlert = document.getElementById('adminLoginAlert');
    var fillDemoBtn = document.getElementById('fillDemoAdminBtn');
    var logoutBtn = document.getElementById('adminLogoutBtn');
    var adminWhoEl = document.getElementById('adminOperatorLabel');

    var activeTab = 'appointments';

    function renderAuthState() {
      var session = global.SalonDB.getAdminSession();
      if (session) {
        gateSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        if (adminWhoEl) {
          adminWhoEl.textContent = session.name + ' (' + session.email + ')';
        }
        renderKpis();
        renderActiveTab();
      } else {
        dashboardSection.classList.add('hidden');
        gateSection.classList.remove('hidden');
      }
    }

    if (fillDemoBtn) {
      fillDemoBtn.addEventListener('click', function () {
        document.getElementById('adminEmail').value = 'admin@pratikshamakeover.in';
        document.getElementById('adminPassword').value = 'Admin@123';
      });
    }

    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        loginAlert.classList.add('hidden');
        try {
          global.SalonDB.adminLogin(
            document.getElementById('adminEmail').value,
            document.getElementById('adminPassword').value
          );
          renderAuthState();
        } catch (err) {
          loginAlert.className = 'alert alert-error mt-2';
          loginAlert.textContent = err.message;
          loginAlert.classList.remove('hidden');
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        global.SalonDB.adminLogout();
        renderAuthState();
      });
    }

    /* ======================== 8 Dashboard KPIs ======================== */
    function renderKpis() {
      var stats = global.SalonDB.getAdminOverview();
      var kpiContainer = document.getElementById('adminKpiGrid');
      if (!kpiContainer) return;

      var cards = [
        { label: 'Total Appointments', value: stats.totalAppointments, highlight: false },
        { label: 'Today’s Appointments', value: stats.todaysAppointments, highlight: true },
        { label: 'Pending Bookings', value: stats.pendingBookings, highlight: false },
        { label: 'Confirmed Bookings', value: stats.confirmedBookings, highlight: false },
        { label: 'Completed Appointments', value: stats.completedAppointments, highlight: false },
        { label: 'Cancelled Appointments', value: stats.cancelledAppointments, highlight: false },
        { label: 'Total Customers', value: stats.totalCustomers, highlight: false },
        {
          label: 'Confirmed Revenue',
          value: global.SalonDB.formatINR(stats.paidRevenue),
          sub: 'Pending: ' + global.SalonDB.formatINR(stats.pendingRevenue),
          highlight: true
        }
      ];

      kpiContainer.innerHTML = cards.map(function (c) {
        return (
          '<div class="kpi-card' + (c.highlight ? ' kpi-card-highlight' : '') + '">' +
          '  <div class="kpi-label">' + esc(c.label) + '</div>' +
          '  <div class="kpi-value tabular-nums">' + esc(c.value) + '</div>' +
          (c.sub ? '<div class="text-xs text-muted mt-1 tabular-nums">' + esc(c.sub) + '</div>' : '') +
          '</div>'
        );
      }).join('');
    }

    /* ======================== Tab Switching ======================== */
    var tabButtons = document.querySelectorAll('#adminTabBar [data-admin-tab]');
    tabButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeTab = btn.getAttribute('data-admin-tab');
        tabButtons.forEach(function (b) {
          b.classList.toggle('active', b.getAttribute('data-admin-tab') === activeTab);
        });
        renderActiveTab();
      });
    });

    function renderActiveTab() {
      var container = document.getElementById('adminTabContent');
      if (!container) return;
      if (activeTab === 'appointments') renderAppointmentsTab(container);
      else if (activeTab === 'calendar') renderCalendarTab(container);
      else if (activeTab === 'services') renderServicesTab(container);
      else if (activeTab === 'customers') renderCustomersTab(container);
      else if (activeTab === 'offers') renderOffersTab(container);
      else if (activeTab === 'payments') renderPaymentsTab(container);
      else if (activeTab === 'reports') renderReportsTab(container);
    }

    /* ======================== 1. Appointments Tab ======================== */
    var aptSearchText = '';
    var aptStatusFilter = 'All';

    function renderAppointmentsTab(container) {
      var db = global.SalonDB.loadDb();
      var q = aptSearchText.trim().toLowerCase();
      var filtered = db.appointments.filter(function (a) {
        if (aptStatusFilter !== 'All' && a.status !== aptStatusFilter) return false;
        if (q) {
          var hay = (a.customerName + ' ' + a.customerPhone + ' ' + a.bookingCode + ' ' + a.serviceName + ' ' + a.artistName).toLowerCase();
          if (hay.indexOf(q) === -1) return false;
        }
        return true;
      });

      container.innerHTML =
        '<div class="card mb-3">' +
        '  <div class="search-row">' +
        '    <div class="search-input-wrap">' +
        '      <input type="text" id="adminAptSearch" class="form-control" placeholder="Search by customer name, mobile number, or Booking ID (e.g. PM-2602)..." value="' + esc(aptSearchText) + '">' +
        '    </div>' +
        '    <select id="adminAptStatus" class="form-control" style="width:auto;min-width:170px;">' +
        ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(function (st) {
          return '<option value="' + st + '"' + (aptStatusFilter === st ? ' selected' : '') + '>' + st + ' Status</option>';
        }).join('') +
        '    </select>' +
        '  </div>' +
        '</div>' +
        '<div class="table-wrap">' +
        '  <table class="data-table">' +
        '    <thead><tr>' +
        '      <th>Booking ID</th><th>Customer</th><th>Service &amp; Artist</th><th>Date &amp; Slot</th><th>Total</th><th>Status</th><th>Actions</th>' +
        '    </tr></thead>' +
        '    <tbody>' +
        (filtered.length ? filtered.map(function (a) {
          return (
            '<tr>' +
            '  <td><span class="booking-code-pill">' + esc(a.bookingCode) + '</span></td>' +
            '  <td><strong>' + esc(a.customerName) + '</strong><div class="text-xs text-muted tabular-nums">' + esc(a.customerPhone) + '</div></td>' +
            '  <td><strong>' + esc(a.serviceName) + '</strong><div class="text-xs text-muted">' + esc(a.artistName) + '</div></td>' +
            '  <td class="tabular-nums"><strong>' + esc(a.date) + '</strong><div class="text-xs text-muted">' + esc(a.timeSlot) + '</div></td>' +
            '  <td class="tabular-nums"><strong>' + global.SalonDB.formatINR(a.finalAmount) + '</strong></td>' +
            '  <td>' + formatStatus(a.status) + '</td>' +
            '  <td>' +
            '    <div class="flex-row">' +
            (a.status === 'Pending' ? '<button type="button" class="btn btn-primary btn-sm" data-apt-act="Confirmed" data-apt-id="' + esc(a.id) + '">Accept</button>' : '') +
            (a.status === 'Confirmed' ? '<button type="button" class="btn btn-dark btn-sm" data-apt-act="Completed" data-apt-id="' + esc(a.id) + '">Complete</button>' : '') +
            (a.status === 'Pending' || a.status === 'Confirmed' ? '<button type="button" class="btn btn-danger-outline btn-sm" data-apt-act="Cancelled" data-apt-id="' + esc(a.id) + '">Reject</button>' : '') +
            '      <button type="button" class="btn btn-outline btn-sm" data-apt-remind="' + esc(a.id) + '">Remind</button>' +
            '    </div>' +
            '  </td>' +
            '</tr>'
          );
        }).join('') : '<tr><td colspan="7" class="text-muted">No matching appointments found.</td></tr>') +
        '    </tbody>' +
        '  </table>' +
        '</div>' +
        '<div id="adminRemindBanner" class="alert alert-success mt-3 hidden"></div>';

      var searchEl = document.getElementById('adminAptSearch');
      searchEl.addEventListener('input', function () {
        aptSearchText = searchEl.value;
        renderAppointmentsTab(container);
        var nextInput = document.getElementById('adminAptSearch');
        if (nextInput) {
          nextInput.focus();
          nextInput.setSelectionRange(nextInput.value.length, nextInput.value.length);
        }
      });

      document.getElementById('adminAptStatus').addEventListener('change', function (e) {
        aptStatusFilter = e.target.value;
        renderAppointmentsTab(container);
      });

      container.querySelectorAll('[data-apt-act]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          global.SalonDB.updateAppointment(btn.getAttribute('data-apt-id'), { status: btn.getAttribute('data-apt-act') }, true);
          renderKpis();
          renderAppointmentsTab(container);
        });
      });

      container.querySelectorAll('[data-apt-remind]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var notif = global.SalonDB.sendReminderNotification(btn.getAttribute('data-apt-remind'));
          var banner = document.getElementById('adminRemindBanner');
          banner.innerHTML =
            'Reminder logged for <strong>' + esc(notif.bookingCode) + '</strong>: ' + esc(notif.message) +
            ' <a href="' + esc(notif.whatsappUrl) + '" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-sm" style="margin-left:8px;">Open WhatsApp</a>';
          banner.classList.remove('hidden');
        });
      });
    }

    /* ======================== 2. Calendar Slot Matrix Tab ======================== */
    var selectedCalDate = global.SalonDB.getTodayIso();

    function renderCalendarTab(container) {
      var db = global.SalonDB.loadDb();
      var onDate = db.appointments.filter(function (a) {
        return a.date === selectedCalDate && a.status !== 'Cancelled';
      });

      container.innerHTML =
        '<div class="card mb-3 flex-between">' +
        '  <div><h3 class="card-title" style="margin:0;">Daily Artist Slot Schedule</h3><p class="text-xs text-muted">Inspect booked vs open appointment slots across all artists.</p></div>' +
        '  <div class="flex-row">' +
        '    <label for="adminCalDate" class="form-label">Date:</label>' +
        '    <input type="date" id="adminCalDate" class="form-control" style="width:auto;" value="' + esc(selectedCalDate) + '">' +
        '  </div>' +
        '</div>' +
        '<div class="table-wrap">' +
        '  <table class="data-table calendar-matrix">' +
        '    <thead><tr><th>Time Slot</th>' +
        global.SalonDB.ARTISTS.map(function (a) { return '<th>' + esc(a.name) + '</th>'; }).join('') +
        '    </tr></thead>' +
        '    <tbody>' +
        global.SalonDB.TIME_SLOTS.map(function (slot) {
          return '<tr><td class="tabular-nums"><strong>' + esc(slot) + '</strong></td>' +
            global.SalonDB.ARTISTS.map(function (art) {
              var match = onDate.find(function (b) { return b.timeSlot === slot && b.artistId === art.id; });
              if (match) {
                return '<td><div><span class="booking-code-pill">' + esc(match.bookingCode) + '</span></div><div class="text-xs mt-1"><strong>' + esc(match.customerName) + '</strong></div><div class="text-xs text-muted">' + esc(match.serviceCategory) + '</div></td>';
              }
              return '<td class="text-xs" style="color:var(--status-green);font-weight:600;">Open Slot</td>';
            }).join('') +
            '</tr>';
        }).join('') +
        '    </tbody>' +
        '  </table>' +
        '</div>';

      document.getElementById('adminCalDate').addEventListener('change', function (e) {
        selectedCalDate = e.target.value;
        renderCalendarTab(container);
      });
    }

    /* ======================== 3. Services CRUD Tab ======================== */
    var editingServiceId = null;

    function renderServicesTab(container) {
      var db = global.SalonDB.loadDb();
      var editSrv = editingServiceId ? db.services.find(function (s) { return s.id === editingServiceId; }) : null;

      container.innerHTML =
        '<div class="card mb-4">' +
        '  <h3 class="card-title" style="margin-top:0;">' + (editSrv ? 'Edit Service: ' + esc(editSrv.name) : 'Add New Salon Service') + '</h3>' +
        '  <form id="adminServiceForm" class="mt-2">' +
        '    <div class="form-grid-3">' +
        '      <div class="form-group"><label class="form-label" for="srvName">Service Title</label><input id="srvName" class="form-control" required value="' + esc(editSrv ? editSrv.name : '') + '" placeholder="e.g. Reception HD Makeover"></div>' +
        '      <div class="form-group"><label class="form-label" for="srvCat">Category</label><select id="srvCat" class="form-control">' +
        global.SalonDB.SERVICE_CATEGORIES.map(function (c) {
          return '<option value="' + esc(c) + '"' + (editSrv && editSrv.category === c ? ' selected' : '') + '>' + esc(c) + '</option>';
        }).join('') +
        '      </select></div>' +
        '      <div class="form-group"><label class="form-label" for="srvPrice">Price (₹)</label><input id="srvPrice" type="number" min="50" class="form-control" required value="' + esc(editSrv ? editSrv.price : '') + '" placeholder="2500"></div>' +
        '    </div>' +
        '    <div class="form-grid-2 mt-2">' +
        '      <div class="form-group"><label class="form-label" for="srvDuration">Duration (Minutes)</label><input id="srvDuration" type="number" min="10" class="form-control" required value="' + esc(editSrv ? editSrv.durationMinutes : 60) + '"></div>' +
        '      <div class="form-group"><label class="form-label" for="srvDesc">Service Description</label><input id="srvDesc" class="form-control" required value="' + esc(editSrv ? editSrv.description : '') + '" placeholder="Inclusions and finish details"></div>' +
        '    </div>' +
        '    <div class="flex-row mt-3">' +
        '      <button type="submit" class="btn btn-primary btn-sm">' + (editSrv ? 'Save Changes' : 'Add Service') + '</button>' +
        (editSrv ? '<button type="button" id="cancelEditSrvBtn" class="btn btn-outline btn-sm">Cancel Edit</button>' : '') +
        '    </div>' +
        '  </form>' +
        '</div>' +
        '<div class="table-wrap">' +
        '  <table class="data-table">' +
        '    <thead><tr><th>Service</th><th>Category</th><th>Duration</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>' +
        '    <tbody>' +
        db.services.map(function (s) {
          return (
            '<tr>' +
            '  <td><strong>' + esc(s.name) + '</strong><div class="text-xs text-muted">' + esc(s.description) + '</div></td>' +
            '  <td>' + esc(s.category) + '</td>' +
            '  <td class="tabular-nums">' + s.durationMinutes + ' min</td>' +
            '  <td class="tabular-nums"><strong>' + global.SalonDB.formatINR(s.price) + '</strong></td>' +
            '  <td>' + (s.active ? '<span class="status-label status-confirmed">&#10003; Active</span>' : '<span class="status-label status-cancelled">&#10005; Hidden</span>') + '</td>' +
            '  <td><div class="flex-row">' +
            '    <button type="button" class="btn btn-outline btn-sm" data-srv-edit="' + esc(s.id) + '">Edit</button>' +
            '    <button type="button" class="btn btn-outline btn-sm" data-srv-toggle="' + esc(s.id) + '">' + (s.active ? 'Hide' : 'Enable') + '</button>' +
            '    <button type="button" class="btn btn-danger-outline btn-sm" data-srv-del="' + esc(s.id) + '">Delete</button>' +
            '  </div></td>' +
            '</tr>'
          );
        }).join('') +
        '    </tbody>' +
        '  </table>' +
        '</div>';

      document.getElementById('adminServiceForm').addEventListener('submit', function (e) {
        e.preventDefault();
        global.SalonDB.saveService({
          id: editingServiceId || undefined,
          name: document.getElementById('srvName').value.trim(),
          category: document.getElementById('srvCat').value,
          price: Number(document.getElementById('srvPrice').value),
          durationMinutes: Number(document.getElementById('srvDuration').value),
          description: document.getElementById('srvDesc').value.trim(),
          popular: editSrv ? editSrv.popular : true,
          active: editSrv ? editSrv.active : true
        });
        editingServiceId = null;
        renderServicesTab(container);
      });

      var cancelEdit = document.getElementById('cancelEditSrvBtn');
      if (cancelEdit) {
        cancelEdit.addEventListener('click', function () {
          editingServiceId = null;
          renderServicesTab(container);
        });
      }

      container.querySelectorAll('[data-srv-edit]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          editingServiceId = btn.getAttribute('data-srv-edit');
          renderServicesTab(container);
        });
      });

      container.querySelectorAll('[data-srv-toggle]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-srv-toggle');
          var srv = db.services.find(function (x) { return x.id === id; });
          if (srv) global.SalonDB.saveService({ id: srv.id, active: !srv.active });
          renderServicesTab(container);
        });
      });

      container.querySelectorAll('[data-srv-del]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          global.SalonDB.deleteService(btn.getAttribute('data-srv-del'));
          if (editingServiceId === btn.getAttribute('data-srv-del')) editingServiceId = null;
          renderServicesTab(container);
        });
      });
    }

    /* ======================== 4. Customers + Booking History Tab ======================== */
    var custSearchText = '';
    var selectedCustomerId = null;

    function renderCustomersTab(container) {
      var db = global.SalonDB.loadDb();
      var q = custSearchText.trim().toLowerCase();
      var filtered = db.customers.filter(function (c) {
        if (!q) return true;
        return (c.name + ' ' + c.phone + ' ' + (c.notes || '')).toLowerCase().indexOf(q) !== -1;
      });

      var selectedCust = selectedCustomerId ? db.customers.find(function (c) { return c.id === selectedCustomerId; }) : null;
      var custHistory = selectedCust
        ? db.appointments.filter(function (a) { return a.customerId === selectedCust.id || a.customerPhone === selectedCust.phone; })
        : [];

      container.innerHTML =
        '<div class="card mb-3">' +
        '  <input type="text" id="adminCustSearch" class="form-control" placeholder="Search customers by name, mobile number, or skin/style notes..." value="' + esc(custSearchText) + '">' +
        '</div>' +
        (selectedCust ? (
          '<div class="card card-linen mb-4">' +
          '  <div class="flex-between mb-2">' +
          '    <div><h3 class="card-title" style="margin:0;">Customer Profile &amp; Booking History: ' + esc(selectedCust.name) + '</h3>' +
          '    <p class="text-xs text-muted tabular-nums">Mobile: ' + esc(selectedCust.phone) + ' · Completed Visits: ' + selectedCust.totalVisits + ' · Confirmed Spend: ' + global.SalonDB.formatINR(selectedCust.totalSpent) + '</p></div>' +
          '    <button type="button" id="closeCustHistoryBtn" class="btn btn-outline btn-sm">Close History</button>' +
          '  </div>' +
          '  <form id="adminCustEditForm" class="form-grid-3 mb-3">' +
          '    <div class="form-group"><label class="form-label">Full Name</label><input id="editCustName" class="form-control" value="' + esc(selectedCust.name) + '"></div>' +
          '    <div class="form-group"><label class="form-label">Mobile Number</label><input id="editCustPhone" class="form-control" value="' + esc(selectedCust.phone) + '"></div>' +
          '    <div class="form-group"><label class="form-label">Salon Preference Notes</label><input id="editCustNotes" class="form-control" value="' + esc(selectedCust.notes || '') + '"></div>' +
          '    <div style="grid-column:1 / -1;"><button type="submit" class="btn btn-primary btn-sm">Update Customer Record</button></div>' +
          '  </form>' +
          '  <div class="table-wrap"><table class="data-table"><thead><tr><th>Booking ID</th><th>Service</th><th>Artist</th><th>Date &amp; Slot</th><th>Total</th><th>Status</th></tr></thead><tbody>' +
          (custHistory.length ? custHistory.map(function (h) {
            return '<tr><td><span class="booking-code-pill">' + esc(h.bookingCode) + '</span></td><td>' + esc(h.serviceName) + '</td><td>' + esc(h.artistName) + '</td><td class="tabular-nums">' + esc(h.date) + ' · ' + esc(h.timeSlot) + '</td><td class="tabular-nums">' + global.SalonDB.formatINR(h.finalAmount) + '</td><td>' + formatStatus(h.status) + '</td></tr>';
          }).join('') : '<tr><td colspan="6" class="text-muted">No appointments recorded for this customer yet.</td></tr>') +
          '  </tbody></table></div>' +
          '</div>'
        ) : '') +
        '<div class="table-wrap">' +
        '  <table class="data-table">' +
        '    <thead><tr><th>Customer</th><th>Mobile</th><th>Visits</th><th>Confirmed Spend</th><th>Notes</th><th>History</th></tr></thead>' +
        '    <tbody>' +
        filtered.map(function (c) {
          var count = db.appointments.filter(function (a) { return a.customerId === c.id || a.customerPhone === c.phone; }).length;
          return (
            '<tr>' +
            '  <td><strong>' + esc(c.name) + '</strong></td>' +
            '  <td class="tabular-nums">' + esc(c.phone) + '</td>' +
            '  <td class="tabular-nums">' + count + ' booking(s)</td>' +
            '  <td class="tabular-nums"><strong>' + global.SalonDB.formatINR(c.totalSpent) + '</strong></td>' +
            '  <td class="text-xs text-muted">' + esc(c.notes || '—') + '</td>' +
            '  <td><button type="button" class="btn btn-outline btn-sm" data-view-cust="' + esc(c.id) + '">View History &amp; Edit</button></td>' +
            '</tr>'
          );
        }).join('') +
        '    </tbody>' +
        '  </table>' +
        '</div>';

      var searchEl = document.getElementById('adminCustSearch');
      searchEl.addEventListener('input', function () {
        custSearchText = searchEl.value;
        renderCustomersTab(container);
        var nextInput = document.getElementById('adminCustSearch');
        if (nextInput) {
          nextInput.focus();
          nextInput.setSelectionRange(nextInput.value.length, nextInput.value.length);
        }
      });

      container.querySelectorAll('[data-view-cust]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          selectedCustomerId = btn.getAttribute('data-view-cust');
          renderCustomersTab(container);
        });
      });

      var closeCust = document.getElementById('closeCustHistoryBtn');
      if (closeCust) {
        closeCust.addEventListener('click', function () {
          selectedCustomerId = null;
          renderCustomersTab(container);
        });
      }

      var editForm = document.getElementById('adminCustEditForm');
      if (editForm && selectedCust) {
        editForm.addEventListener('submit', function (e) {
          e.preventDefault();
          global.SalonDB.updateCustomer(selectedCust.id, {
            name: document.getElementById('editCustName').value,
            phone: document.getElementById('editCustPhone').value,
            notes: document.getElementById('editCustNotes').value
          });
          renderCustomersTab(container);
        });
      }
    }

    /* ======================== 5. Offers CRUD Tab ======================== */
    function renderOffersTab(container) {
      var db = global.SalonDB.loadDb();
      container.innerHTML =
        '<div class="card mb-4">' +
        '  <h3 class="card-title" style="margin-top:0;">Create Promotional Offer</h3>' +
        '  <div id="adminOfferAlert" class="alert alert-error mt-2 hidden"></div>' +
        '  <form id="adminOfferForm" class="mt-2">' +
        '    <div class="form-grid-3">' +
        '      <div class="form-group"><label class="form-label" for="offCode">Promo Code</label><input id="offCode" class="form-control" required placeholder="e.g. FESTIVE15"></div>' +
        '      <div class="form-group"><label class="form-label" for="offTitle">Offer Title</label><input id="offTitle" class="form-control" required placeholder="e.g. Festive Hair & Makeup Privilege"></div>' +
        '      <div class="form-group"><label class="form-label" for="offPct">Discount %</label><input id="offPct" type="number" min="1" max="75" class="form-control" required value="15"></div>' +
        '    </div>' +
        '    <div class="form-grid-2 mt-2">' +
        '      <div class="form-group"><label class="form-label" for="offCat">Eligible Category</label><select id="offCat" class="form-control">' +
        ['All Services'].concat(global.SalonDB.SERVICE_CATEGORIES).map(function (c) {
          return '<option value="' + esc(c) + '">' + esc(c) + '</option>';
        }).join('') +
        '      </select></div>' +
        '      <div class="form-group"><label class="form-label" for="offDesc">Description</label><input id="offDesc" class="form-control" placeholder="Terms and applicability"></div>' +
        '    </div>' +
        '    <button type="submit" class="btn btn-primary btn-sm mt-3">Publish Offer</button>' +
        '  </form>' +
        '</div>' +
        '<div class="grid-3">' +
        db.offers.map(function (o) {
          return (
            '<article class="card">' +
            '  <div class="flex-between">' +
            '    <span class="booking-code-pill">' + esc(o.code) + '</span>' +
            (o.active ? '<span class="status-label status-confirmed">&#10003; Active</span>' : '<span class="status-label status-cancelled">&#10005; Paused</span>') +
            '  </div>' +
            '  <h3 class="card-title mt-2">' + esc(o.title) + '</h3>' +
            '  <p class="text-sm" style="color:var(--accent-rose);font-weight:600;">' + o.discountPercent + '% off · ' + esc(o.category) + '</p>' +
            '  <p class="card-body mt-1">' + esc(o.description) + '</p>' +
            '  <div class="card-footer">' +
            '    <button type="button" class="btn btn-outline btn-sm" data-off-toggle="' + esc(o.id) + '">' + (o.active ? 'Pause' : 'Activate') + '</button>' +
            '    <button type="button" class="btn btn-danger-outline btn-sm" data-off-del="' + esc(o.id) + '">Delete</button>' +
            '  </div>' +
            '</article>'
          );
        }).join('') +
        '</div>';

      document.getElementById('adminOfferForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var alertEl = document.getElementById('adminOfferAlert');
        alertEl.classList.add('hidden');
        try {
          global.SalonDB.saveOffer({
            code: document.getElementById('offCode').value,
            title: document.getElementById('offTitle').value,
            discountPercent: document.getElementById('offPct').value,
            category: document.getElementById('offCat').value,
            description: document.getElementById('offDesc').value
          });
          renderOffersTab(container);
        } catch (err) {
          alertEl.textContent = err.message;
          alertEl.classList.remove('hidden');
        }
      });

      container.querySelectorAll('[data-off-toggle]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          global.SalonDB.toggleOffer(btn.getAttribute('data-off-toggle'));
          renderOffersTab(container);
        });
      });

      container.querySelectorAll('[data-off-del]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          global.SalonDB.deleteOffer(btn.getAttribute('data-off-del'));
          renderOffersTab(container);
        });
      });
    }

    /* ======================== 6. Payments Tab ======================== */
    function renderPaymentsTab(container) {
      var db = global.SalonDB.loadDb();
      container.innerHTML =
        '<div class="alert alert-info mb-3">Strict Payment Policy: Cash, UPI, and Online entries remain Unpaid or Pending until explicitly verified by transaction reference or desk receipt.</div>' +
        '<div class="table-wrap">' +
        '  <table class="data-table">' +
        '    <thead><tr><th>Receipt</th><th>Booking ID</th><th>Customer &amp; Service</th><th>Mode</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>' +
        '    <tbody>' +
        db.payments.map(function (p) {
          return (
            '<tr>' +
            '  <td class="font-mono text-xs">' + esc(p.receiptNumber) + '</td>' +
            '  <td><span class="booking-code-pill">' + esc(p.bookingCode) + '</span></td>' +
            '  <td><strong>' + esc(p.customerName) + '</strong><div class="text-xs text-muted">' + esc(p.serviceName) + '</div></td>' +
            '  <td>' + esc(p.method) + (p.transactionRef ? '<div class="text-xs font-mono text-muted">' + esc(p.transactionRef) + '</div>' : '') + '</td>' +
            '  <td class="tabular-nums"><strong>' + global.SalonDB.formatINR(p.finalAmount) + '</strong></td>' +
            '  <td>' + formatStatus(p.status) + '</td>' +
            '  <td>' +
            (p.status !== 'Paid'
              ? '<button type="button" class="btn btn-primary btn-sm" data-confirm-pay="' + esc(p.id) + '">Verify &amp; Mark Paid</button>'
              : '<button type="button" class="btn btn-outline btn-sm" data-admin-receipt="' + esc(p.id) + '">Receipt</button>') +
            '  </td>' +
            '</tr>'
          );
        }).join('') +
        '    </tbody>' +
        '  </table>' +
        '</div>';

      container.querySelectorAll('[data-confirm-pay]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-confirm-pay');
          var pay = db.payments.find(function (x) { return x.id === id; });
          if (!pay) return;
          var ref = pay.transactionRef || (pay.method === 'Cash' ? 'DESK-CASH-' + pay.bookingCode : 'VERIFIED-' + pay.bookingCode);
          global.SalonDB.confirmPayment(id, pay.method, ref, true, true);
          renderKpis();
          renderPaymentsTab(container);
        });
      });

      container.querySelectorAll('[data-admin-receipt]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-admin-receipt');
          var pay = db.payments.find(function (x) { return x.id === id; });
          var modal = document.getElementById('adminReceiptModal');
          if (!pay || !modal) return;
          document.getElementById('admRcpNumber').textContent = pay.receiptNumber;
          document.getElementById('admRcpCustomer').textContent = pay.customerName + ' (' + pay.customerPhone + ')';
          document.getElementById('admRcpService').textContent = pay.serviceName;
          document.getElementById('admRcpMethod').textContent = pay.method + (pay.transactionRef ? ' · Ref: ' + pay.transactionRef : '');
          document.getElementById('admRcpAmount').textContent = global.SalonDB.formatINR(pay.finalAmount);
          document.getElementById('admRcpDate').textContent = pay.confirmedAt ? new Date(pay.confirmedAt).toLocaleString('en-IN') : '-';
          modal.classList.remove('hidden');
        });
      });
    }

    /* ======================== 7. Daily & Monthly Reports + CSV Export ======================== */
    function renderReportsTab(container) {
      var db = global.SalonDB.loadDb();
      var today = global.SalonDB.getTodayIso();
      var monthPrefix = today.slice(0, 7);

      var dailyApts = db.appointments.filter(function (a) { return a.date === today && a.status !== 'Cancelled'; });
      var monthlyApts = db.appointments.filter(function (a) { return a.date.indexOf(monthPrefix) === 0 && a.status !== 'Cancelled'; });
      var paidPayments = db.payments.filter(function (p) { return p.status === 'Paid'; });

      var dailyRev = dailyApts.reduce(function (sum, a) {
        var p = paidPayments.find(function (x) { return x.appointmentId === a.id; });
        return sum + (p ? p.finalAmount : 0);
      }, 0);

      var monthlyRev = paidPayments.reduce(function (sum, p) {
        var apt = db.appointments.find(function (a) { return a.id === p.appointmentId; });
        return sum + (apt && apt.date.indexOf(monthPrefix) === 0 ? p.finalAmount : 0);
      }, 0);

      // Breakdown by category
      var catTotals = {};
      db.appointments.forEach(function (a) {
        if (a.status === 'Cancelled') return;
        catTotals[a.serviceCategory] = (catTotals[a.serviceCategory] || 0) + a.finalAmount;
      });
      var catEntries = Object.keys(catTotals).map(function (k) {
        return { category: k, amount: catTotals[k] };
      }).sort(function (a, b) { return b.amount - a.amount; });
      var maxCatAmount = catEntries.length ? catEntries[0].amount : 1;

      container.innerHTML =
        '<div class="grid-2 mb-4">' +
        '  <div class="card">' +
        '    <div class="kpi-label">Daily Salon Summary (' + esc(today) + ')</div>' +
        '    <div class="kpi-value tabular-nums">' + global.SalonDB.formatINR(dailyRev) + '</div>' +
        '    <p class="text-sm text-muted mt-1 tabular-nums">' + dailyApts.length + ' active bookings scheduled today</p>' +
        '  </div>' +
        '  <div class="card card-linen">' +
        '    <div class="kpi-label">Monthly Summary (' + esc(monthPrefix) + ')</div>' +
        '    <div class="kpi-value tabular-nums">' + global.SalonDB.formatINR(monthlyRev) + '</div>' +
        '    <p class="text-sm text-muted mt-1 tabular-nums">' + monthlyApts.length + ' active bookings this month</p>' +
        '  </div>' +
        '</div>' +
        '<div class="card mb-4">' +
        '  <div class="flex-between mb-3">' +
        '    <div><h3 class="card-title" style="margin:0;">Revenue &amp; Booking Value by Service Category</h3><p class="text-xs text-muted">Excludes cancelled appointments</p></div>' +
        '    <button type="button" id="exportCsvReportBtn" class="btn btn-dark btn-sm">Download CSV Report</button>' +
        '  </div>' +
        (catEntries.length ? catEntries.map(function (item) {
          var pct = Math.max(8, Math.round((item.amount / maxCatAmount) * 100));
          return (
            '<div class="mb-3">' +
            '  <div class="flex-between text-sm"><strong>' + esc(item.category) + '</strong><span class="tabular-nums">' + global.SalonDB.formatINR(item.amount) + '</span></div>' +
            '  <div class="bar-track"><div class="bar-fill" style="width:' + pct + '%;"></div></div>' +
            '</div>'
          );
        }).join('') : '<p class="text-muted">No booking data available yet.</p>') +
        '</div>';

      document.getElementById('exportCsvReportBtn').addEventListener('click', function () {
        var rows = [['Booking Code', 'Customer', 'Phone', 'Service', 'Category', 'Artist', 'Date', 'Time Slot', 'Final Amount (INR)', 'Status', 'Payment Status']];
        db.appointments.forEach(function (a) {
          var p = db.payments.find(function (x) { return x.appointmentId === a.id; });
          rows.push([
            a.bookingCode,
            a.customerName,
            a.customerPhone,
            a.serviceName,
            a.serviceCategory,
            a.artistName,
            a.date,
            a.timeSlot,
            a.finalAmount,
            a.status,
            p ? p.status : 'Unpaid'
          ]);
        });
        var csv = rows.map(function (r) {
          return r.map(function (cell) {
            return '"' + String(cell == null ? '' : cell).replace(/"/g, '""') + '"';
          }).join(',');
        }).join('\n');
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = 'pratiksha-makeover-report-' + today + '.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
    }

    document.querySelectorAll('[data-close-modal]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = document.getElementById(btn.getAttribute('data-close-modal'));
        if (target) target.classList.add('hidden');
      });
    });

    renderAuthState();
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (document.body.getAttribute('data-page') === 'admin') {
      initAdminPage();
    }
  });
})(window);
