/*
 * Pratiksha Makeover — Direct Login-Free Appointment Booking & My Bookings Manager
 * Pure Vanilla JavaScript (zero registration or customer login required)
 */

(function (global) {
  'use strict';

  function initBookingPage() {
    var form = document.getElementById('directBookingForm');
    if (!form) return;

    var esc = global.SalonUI.escapeHtml;
    var formatStatus = global.SalonUI.formatStatusBadge;

    var serviceSelect = document.getElementById('bookingService');
    var artistSelect = document.getElementById('bookingArtist');
    var dateInput = document.getElementById('bookingDate');
    var slotGrid = document.getElementById('bookingSlotGrid');
    var slotHiddenInput = document.getElementById('bookingTimeSlot');
    var offerInput = document.getElementById('bookingOfferCode');
    var applyOfferBtn = document.getElementById('applyOfferBtn');
    var offerFeedback = document.getElementById('offerFeedback');
    var formAlert = document.getElementById('bookingFormAlert');
    var confirmationPanel = document.getElementById('bookingConfirmationPanel');
    var bookingFormWrapper = document.getElementById('bookingFormWrapper');

    var lookupForm = document.getElementById('lookupBookingsForm');
    var lookupInput = document.getElementById('lookupQueryInput');
    var lookupResults = document.getElementById('lookupResultsContainer');
    var recentPillsWrap = document.getElementById('recentBookingsRow');

    var paymentModal = document.getElementById('customerPaymentModal');
    var rescheduleModal = document.getElementById('customerRescheduleModal');
    var receiptModal = document.getElementById('receiptModal');

    var appliedOffer = null;
    var activeLookupQuery = '';

    // Parse query params (?service=...&artist=...&offer=...&date=...)
    var params = new URLSearchParams(global.location.search);
    var todayIso = global.SalonDB.getTodayIso();

    function populateSelectors() {
      var db = global.SalonDB.loadDb();
      var activeServices = db.services.filter(function (s) { return s.active; });

      serviceSelect.innerHTML = activeServices.map(function (s) {
        return '<option value="' + esc(s.id) + '">' + esc(s.category + ' — ' + s.name + ' (' + global.SalonDB.formatINR(s.price) + ')') + '</option>';
      }).join('');

      var preService = params.get('service');
      if (preService && activeServices.some(function (s) { return s.id === preService; })) {
        serviceSelect.value = preService;
      }

      artistSelect.innerHTML = global.SalonDB.ARTISTS.map(function (a) {
        return '<option value="' + esc(a.id) + '">' + esc(a.name + ' — ' + a.specialty) + '</option>';
      }).join('');

      var preArtist = params.get('artist');
      if (preArtist && global.SalonDB.ARTISTS.some(function (a) { return a.id === preArtist; })) {
        artistSelect.value = preArtist;
      }

      dateInput.min = todayIso;
      dateInput.value = params.get('date') || todayIso;

      var preOffer = params.get('offer');
      if (preOffer) {
        offerInput.value = preOffer.toUpperCase();
        validateAndApplyOffer(true);
      }
    }

    function getSelectedService() {
      var db = global.SalonDB.loadDb();
      return db.services.find(function (s) { return s.id === serviceSelect.value; }) || db.services[0];
    }

    function getSelectedArtist() {
      return global.SalonDB.ARTISTS.find(function (a) { return a.id === artistSelect.value; }) || global.SalonDB.ARTISTS[0];
    }

    function renderSlotGrid() {
      var date = dateInput.value || todayIso;
      var artistId = artistSelect.value;
      var slots = global.SalonDB.getSlotAvailability(date, artistId);

      // Keep selected slot only if still available
      var currentSelected = slotHiddenInput.value;
      var stillAvailable = slots.some(function (s) { return s.timeSlot === currentSelected && s.available; });
      if (!stillAvailable) {
        var firstOpen = slots.find(function (s) { return s.available; });
        slotHiddenInput.value = firstOpen ? firstOpen.timeSlot : '';
      }

      slotGrid.innerHTML = slots.map(function (s) {
        var isSelected = s.timeSlot === slotHiddenInput.value && s.available;
        var cls = isSelected ? 'slot-btn selected' : 'slot-btn';
        return '<button type="button" class="' + cls + '" data-slot="' + esc(s.timeSlot) + '"' + (s.available ? '' : ' disabled title="Already booked for this artist"') + '>' + esc(s.timeSlot) + '</button>';
      }).join('');

      slotGrid.querySelectorAll('.slot-btn:not(:disabled)').forEach(function (btn) {
        btn.addEventListener('click', function () {
          slotHiddenInput.value = btn.getAttribute('data-slot');
          renderSlotGrid();
          updateSummary();
        });
      });
    }

    function validateAndApplyOffer(silent) {
      var code = offerInput.value.trim().toUpperCase();
      offerFeedback.className = 'text-xs mt-1';
      if (!code) {
        appliedOffer = null;
        offerFeedback.textContent = '';
        updateSummary();
        return;
      }
      var db = global.SalonDB.loadDb();
      var service = getSelectedService();
      var offer = db.offers.find(function (o) { return o.code.toUpperCase() === code && o.active; });

      if (!offer) {
        appliedOffer = null;
        offerFeedback.style.color = 'var(--status-rose)';
        offerFeedback.textContent = 'Promo code "' + code + '" is invalid or expired.';
      } else if (offer.category !== 'All Services' && offer.category !== service.category) {
        appliedOffer = null;
        offerFeedback.style.color = 'var(--status-amber)';
        offerFeedback.textContent = 'Code "' + code + '" applies only to ' + offer.category + '.';
      } else {
        appliedOffer = offer;
        offerFeedback.style.color = 'var(--status-green)';
        offerFeedback.textContent = 'Applied ' + offer.code + ': ' + offer.discountPercent + '% off (' + offer.title + ')';
      }

      if (!silent || appliedOffer) {
        updateSummary();
      }
    }

    function updateSummary() {
      var srv = getSelectedService();
      var art = getSelectedArtist();
      var date = dateInput.value || todayIso;
      var slot = slotHiddenInput.value || 'No slot selected';
      var payMethod = document.getElementById('bookingPaymentMethod').value;

      var subtotal = srv ? srv.price : 0;
      var discount = 0;
      if (appliedOffer && srv) {
        if (appliedOffer.category === 'All Services' || appliedOffer.category === srv.category) {
          discount = Math.round((subtotal * appliedOffer.discountPercent) / 100);
        } else {
          appliedOffer = null;
          offerFeedback.textContent = '';
        }
      }
      var total = Math.max(0, subtotal - discount);

      document.getElementById('sumServiceName').textContent = srv ? srv.name : '-';
      document.getElementById('sumArtistName').textContent = art ? art.name : '-';
      document.getElementById('sumDateTime').textContent = date + ' · ' + slot;
      document.getElementById('sumDuration').textContent = srv ? srv.durationMinutes + ' min' : '-';
      document.getElementById('sumPaymentMode').textContent = payMethod;
      document.getElementById('sumSubtotal').textContent = global.SalonDB.formatINR(subtotal);
      document.getElementById('sumDiscount').textContent = discount > 0 ? '-' + global.SalonDB.formatINR(discount) : '₹0';
      document.getElementById('sumTotal').textContent = global.SalonDB.formatINR(total);
    }

    serviceSelect.addEventListener('change', function () {
      validateAndApplyOffer(true);
      updateSummary();
    });
    artistSelect.addEventListener('change', function () {
      renderSlotGrid();
      updateSummary();
    });
    dateInput.addEventListener('change', function () {
      renderSlotGrid();
      updateSummary();
    });
    document.getElementById('bookingPaymentMethod').addEventListener('change', updateSummary);
    applyOfferBtn.addEventListener('click', function () {
      validateAndApplyOffer(false);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      formAlert.classList.add('hidden');

      try {
        var result = global.SalonDB.createAppointment({
          customerName: document.getElementById('customerName').value,
          customerPhone: document.getElementById('customerPhone').value,
          whatsappNumber: document.getElementById('customerWhatsapp').value,
          serviceId: serviceSelect.value,
          artistId: artistSelect.value,
          date: dateInput.value,
          timeSlot: slotHiddenInput.value,
          requirements: document.getElementById('bookingRequirements').value,
          offerCode: appliedOffer ? appliedOffer.code : '',
          paymentMethod: document.getElementById('bookingPaymentMethod').value
        });

        var apt = result.appointment;
        var pay = result.payment;
        var notif = result.notification;

        document.getElementById('confBookingCode').textContent = apt.bookingCode;
        document.getElementById('confServiceSummary').textContent =
          apt.serviceName + ' with ' + apt.artistName + ' on ' + apt.date + ' at ' + apt.timeSlot;
        document.getElementById('confPayable').textContent =
          global.SalonDB.formatINR(pay.finalAmount) + ' (' + pay.method + ' · ' + pay.status + ')';
        document.getElementById('confPrepNote').textContent = apt.prepNote;
        document.getElementById('confWhatsAppBtn').href = notif.whatsappUrl;

        var viewInLookupBtn = document.getElementById('confViewBookingBtn');
        viewInLookupBtn.onclick = function () {
          lookupInput.value = apt.bookingCode;
          runLookup(apt.bookingCode);
          document.getElementById('myBookingsSection').scrollIntoView({ behavior: 'smooth' });
        };

        bookingFormWrapper.classList.add('hidden');
        confirmationPanel.classList.remove('hidden');

        renderSlotGrid();
        renderRecentPills();
        lookupInput.value = apt.bookingCode;
        runLookup(apt.bookingCode);
      } catch (err) {
        formAlert.className = 'alert alert-error mb-3';
        formAlert.textContent = err.message;
        formAlert.classList.remove('hidden');
      }
    });

    document.getElementById('bookAnotherBtn').addEventListener('click', function () {
      form.reset();
      dateInput.value = todayIso;
      appliedOffer = null;
      offerFeedback.textContent = '';
      confirmationPanel.classList.add('hidden');
      bookingFormWrapper.classList.remove('hidden');
      renderSlotGrid();
      updateSummary();
    });

    /* ======================== My Bookings Lookup, Reschedule, Cancel & Pay ======================== */
    function renderRecentPills() {
      if (!recentPillsWrap) return;
      var recent = global.SalonDB.getRecentBookings();
      if (!recent.length) {
        recentPillsWrap.innerHTML =
          '<span class="text-xs text-muted">Try demo lookup codes:</span> ' +
          '<button type="button" class="btn btn-outline btn-sm" data-quick-lookup="PM-2602">PM-2602</button> ' +
          '<button type="button" class="btn btn-outline btn-sm" data-quick-lookup="PM-2603">PM-2603</button> ' +
          '<button type="button" class="btn btn-outline btn-sm" data-quick-lookup="9765432109">9765432109</button>';
      } else {
        recentPillsWrap.innerHTML =
          '<span class="text-xs text-muted">Recent bookings on this device:</span> ' +
          recent.map(function (r) {
            return '<button type="button" class="btn btn-outline btn-sm" data-quick-lookup="' + esc(r.bookingCode) + '">' + esc(r.bookingCode) + '</button>';
          }).join(' ');
      }

      recentPillsWrap.querySelectorAll('[data-quick-lookup]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var q = btn.getAttribute('data-quick-lookup');
          lookupInput.value = q;
          runLookup(q);
        });
      });
    }

    function openReceiptModal(apt, pay) {
      if (!receiptModal) return;
      document.getElementById('rcpNumber').textContent = pay.receiptNumber;
      document.getElementById('rcpBookingCode').textContent = apt.bookingCode;
      document.getElementById('rcpCustomer').textContent = apt.customerName + ' (' + apt.customerPhone + ')';
      document.getElementById('rcpService').textContent = apt.serviceName + ' · ' + apt.artistName;
      document.getElementById('rcpSlot').textContent = apt.date + ' at ' + apt.timeSlot;
      document.getElementById('rcpMethod').textContent = pay.method + (pay.transactionRef ? ' · Ref: ' + pay.transactionRef : '');
      document.getElementById('rcpStatus').innerHTML = formatStatus(pay.status);
      document.getElementById('rcpAmount').textContent = global.SalonDB.formatINR(pay.finalAmount);
      document.getElementById('rcpConfirmedAt').textContent = pay.confirmedAt ? new Date(pay.confirmedAt).toLocaleString('en-IN') : 'Awaiting payment confirmation';
      receiptModal.classList.remove('hidden');
    }

    function openPaymentModal(apt, pay) {
      if (!paymentModal) return;
      document.getElementById('payModalBookingInfo').textContent =
        apt.bookingCode + ' · ' + apt.serviceName + ' — Payable: ' + global.SalonDB.formatINR(pay.finalAmount);
      document.getElementById('payModalMethod').value = pay.method === 'Cash' ? 'UPI' : pay.method;
      document.getElementById('payModalRef').value = pay.transactionRef || '';
      document.getElementById('payModalCheck').checked = false;
      document.getElementById('payModalAlert').classList.add('hidden');
      document.getElementById('payModalUpiId').textContent = global.SalonDB.SALON_INFO.upiId;

      var submitBtn = document.getElementById('payModalSubmitBtn');
      submitBtn.onclick = function () {
        var alertEl = document.getElementById('payModalAlert');
        try {
          global.SalonDB.confirmPayment(
            pay.id,
            document.getElementById('payModalMethod').value,
            document.getElementById('payModalRef').value,
            document.getElementById('payModalCheck').checked,
            false
          );
          paymentModal.classList.add('hidden');
          runLookup(activeLookupQuery || apt.bookingCode);
        } catch (err) {
          alertEl.className = 'alert alert-error';
          alertEl.textContent = err.message;
          alertEl.classList.remove('hidden');
        }
      };

      paymentModal.classList.remove('hidden');
    }

    function openRescheduleModal(apt) {
      if (!rescheduleModal) return;
      var rDate = document.getElementById('reschedDate');
      var rArtist = document.getElementById('reschedArtist');
      var rSlot = document.getElementById('reschedSlot');
      var rAlert = document.getElementById('reschedAlert');
      rAlert.classList.add('hidden');

      document.getElementById('reschedBookingTitle').textContent = 'Reschedule ' + apt.bookingCode + ' (' + apt.serviceName + ')';
      rDate.min = todayIso;
      rDate.value = apt.date;
      rArtist.innerHTML = global.SalonDB.ARTISTS.map(function (a) {
        return '<option value="' + esc(a.id) + '">' + esc(a.name) + '</option>';
      }).join('');
      rArtist.value = apt.artistId;

      function populateReschedSlots() {
        var avail = global.SalonDB.getSlotAvailability(rDate.value, rArtist.value, apt.id);
        rSlot.innerHTML = avail.map(function (s) {
          return '<option value="' + esc(s.timeSlot) + '"' + (s.available ? '' : ' disabled') + '>' + esc(s.timeSlot) + (s.available ? '' : ' (Booked)') + '</option>';
        }).join('');
        if (avail.some(function (s) { return s.timeSlot === apt.timeSlot && s.available; })) {
          rSlot.value = apt.timeSlot;
        }
      }

      populateReschedSlots();
      rDate.onchange = populateReschedSlots;
      rArtist.onchange = populateReschedSlots;

      document.getElementById('reschedSaveBtn').onclick = function () {
        try {
          global.SalonDB.updateAppointment(apt.id, {
            date: rDate.value,
            artistId: rArtist.value,
            timeSlot: rSlot.value
          }, false);
          rescheduleModal.classList.add('hidden');
          renderSlotGrid();
          runLookup(activeLookupQuery || apt.bookingCode);
        } catch (err) {
          rAlert.className = 'alert alert-error';
          rAlert.textContent = err.message;
          rAlert.classList.remove('hidden');
        }
      };

      rescheduleModal.classList.remove('hidden');
    }

    function runLookup(query) {
      activeLookupQuery = String(query || '').trim();
      if (!activeLookupQuery) {
        lookupResults.innerHTML = '';
        return;
      }

      var res = global.SalonDB.lookupBookings(activeLookupQuery);
      if (!res.appointments.length) {
        lookupResults.innerHTML = '<div class="alert alert-info">No bookings found for "' + esc(activeLookupQuery) + '". Double-check your Booking ID (e.g., PM-2602) or 10-digit mobile number.</div>';
        return;
      }

      lookupResults.innerHTML = res.appointments.map(function (apt) {
        var pay = res.payments.find(function (p) { return p.appointmentId === apt.id; });
        var latestNotif = res.notifications.find(function (n) { return n.appointmentId === apt.id; });
        var canModify = apt.status === 'Pending' || apt.status === 'Confirmed';

        var actionsHtml = '';
        if (canModify) {
          actionsHtml += '<button type="button" class="btn btn-outline btn-sm" data-resched-id="' + esc(apt.id) + '">Reschedule</button>';
          actionsHtml += '<button type="button" class="btn btn-danger-outline btn-sm" data-cancel-id="' + esc(apt.id) + '">Cancel</button>';
        }
        if (pay && pay.status !== 'Paid' && apt.status !== 'Cancelled') {
          actionsHtml += '<button type="button" class="btn btn-primary btn-sm" data-pay-id="' + esc(apt.id) + '">Confirm UPI / Online Payment</button>';
        }
        if (pay && pay.status === 'Paid') {
          actionsHtml += '<button type="button" class="btn btn-dark btn-sm" data-receipt-id="' + esc(apt.id) + '">View Receipt</button>';
        }
        if (latestNotif && latestNotif.whatsappUrl) {
          actionsHtml += '<a href="' + esc(latestNotif.whatsappUrl) + '" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-sm">WhatsApp Update</a>';
        }

        return (
          '<article class="card mb-3">' +
          '  <div class="flex-between">' +
          '    <div class="flex-row">' +
          '      <span class="booking-code-pill">' + esc(apt.bookingCode) + '</span>' +
          '      ' + formatStatus(apt.status) +
          (pay ? '<span>&middot;</span>' + formatStatus(pay.status) : '') +
          '    </div>' +
          '    <span class="price-text tabular-nums">' + global.SalonDB.formatINR(apt.finalAmount) + '</span>' +
          '  </div>' +
          '  <h3 class="card-title mt-2">' + esc(apt.serviceName) + '</h3>' +
          '  <div class="meta-line">' +
          '    <span>Customer: <strong>' + esc(apt.customerName) + '</strong> (' + esc(apt.customerPhone) + ')</span>' +
          '    <span>&middot;</span>' +
          '    <span>Artist: <strong>' + esc(apt.artistName) + '</strong></span>' +
          '    <span>&middot;</span>' +
          '    <span class="tabular-nums">' + esc(apt.date) + ' · ' + esc(apt.timeSlot) + '</span>' +
          '  </div>' +
          (apt.requirements ? '<p class="text-sm mt-2"><strong>Special Notes:</strong> ' + esc(apt.requirements) + '</p>' : '') +
          (apt.prepNote ? '<p class="text-xs text-muted mt-1">' + esc(apt.prepNote) + '</p>' : '') +
          '  <div class="flex-row mt-3">' + actionsHtml + '</div>' +
          '</article>'
        );
      }).join('');

      lookupResults.querySelectorAll('[data-resched-id]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-resched-id');
          var apt = res.appointments.find(function (a) { return a.id === id; });
          if (apt) openRescheduleModal(apt);
        });
      });

      lookupResults.querySelectorAll('[data-cancel-id]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-cancel-id');
          global.SalonDB.updateAppointment(id, { status: 'Cancelled' }, false);
          renderSlotGrid();
          runLookup(activeLookupQuery);
        });
      });

      lookupResults.querySelectorAll('[data-pay-id]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-pay-id');
          var apt = res.appointments.find(function (a) { return a.id === id; });
          var pay = res.payments.find(function (p) { return p.appointmentId === id; });
          if (apt && pay) openPaymentModal(apt, pay);
        });
      });

      lookupResults.querySelectorAll('[data-receipt-id]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-receipt-id');
          var apt = res.appointments.find(function (a) { return a.id === id; });
          var pay = res.payments.find(function (p) { return p.appointmentId === id; });
          if (apt && pay) openReceiptModal(apt, pay);
        });
      });
    }

    if (lookupForm) {
      lookupForm.addEventListener('submit', function (e) {
        e.preventDefault();
        runLookup(lookupInput.value);
      });
    }

    // Wire modal close buttons
    document.querySelectorAll('[data-close-modal]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = document.getElementById(btn.getAttribute('data-close-modal'));
        if (target) target.classList.add('hidden');
      });
    });

    populateSelectors();
    renderSlotGrid();
    updateSummary();
    renderRecentPills();
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (document.body.getAttribute('data-page') === 'booking') {
      initBookingPage();
    }
  });
})(window);
