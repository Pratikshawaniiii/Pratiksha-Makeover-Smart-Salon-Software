/*
 * Pratiksha Makeover — Shared UI, Home, Services, Gallery & Smart Salon Concierge
 * Pure Vanilla JavaScript (ES5/ES6 compatible without build steps)
 */

(function (global) {
  'use strict';

  var GALLERY_LOOKS = [
    {
      id: 'gal-1',
      title: 'Royal Maharashtrian Bridal Couture',
      category: 'Bridal Makeup',
      artist: 'Pratiksha Wani',
      serviceId: 'srv-bridal-hd',
      image: 'images/bridal-look.jpg',
      alt: 'Indian bride in crimson and gold Paithani saree with luminous HD bridal makeup and fresh mogra floral bun',
      caption: 'Waterproof HD bridal base with sculpted kohl eyes, fresh mogra floral jooda, and classic gold jewelry setting.'
    },
    {
      id: 'gal-2',
      title: 'Champagne Rose Evening Reception Glam',
      category: 'Party Makeup',
      artist: 'Pratiksha Wani',
      serviceId: 'srv-party-glam',
      image: 'images/party-glam.jpg',
      alt: 'Woman with soft champagne shimmer party makeup and glossy Hollywood waves in rose silk attire',
      caption: 'Luminous glass-skin foundation, rose-gold shimmer lids, and voluminous soft Hollywood waves.'
    },
    {
      id: 'gal-3',
      title: 'Bridal Organic Mehndi & Paithani Draping',
      category: 'Mehndi Art',
      artist: 'Riya Deshmukh & Sneha Kulkarni',
      serviceId: 'srv-mehndi-bridal',
      image: 'images/mehndi-draping.jpg',
      alt: 'Close-up of intricate dark organic bridal henna mehndi design paired with silk saree pleats and gold bangles',
      caption: '100% organic Sojat henna mandala design paired with razor-sharp Navvari and silk saree box-pleating.'
    },
    {
      id: 'gal-4',
      title: '24K Gold & Rose Quartz Pre-Bridal Facial',
      category: 'Facial',
      artist: 'Riya Deshmukh',
      serviceId: 'srv-facial-gold',
      image: 'images/facial-spa.jpg',
      alt: 'Serene facial treatment room with warm botanical oils, rose petals, and radiant skincare glow',
      caption: 'Lymphatic rose-quartz sculpting ritual and ultrasonic hydration for radiant pre-wedding skin.'
    },
    {
      id: 'gal-5',
      title: 'Signature Jalgaon Luxury Bridal Suite',
      category: 'Hairstyle',
      artist: 'Sneha Kulkarni',
      serviceId: 'srv-hairstyle-floral',
      image: 'images/hero-salon.jpg',
      alt: 'Luxury Pratiksha Makeover beauty studio interior in Jalgaon with warm cream and rose-gold vanity mirrors',
      caption: 'Private bridal dressing suite at Pearl Plaza, Ring Road, Jalgaon designed for calm morning prep.'
    },
    {
      id: 'gal-6',
      title: 'Airbrush Maharani Engagement Radiance',
      category: 'Bridal Makeup',
      artist: 'Pratiksha Wani',
      serviceId: 'srv-bridal-airbrush',
      image: 'images/bridal-look.jpg',
      alt: 'Bride wearing heirloom bridal look with airbrush foundation finish and traditional gold matha patti',
      caption: 'Weightless 16-hour silicone airbrush bridal makeup tailored for high-definition wedding photography.'
    }
  ];

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatStatusBadge(status) {
    var clean = String(status || 'Pending');
    var cls = 'status-pending';
    var icon = '&#9679;';
    if (clean === 'Confirmed' || clean === 'Paid') {
      cls = clean === 'Paid' ? 'status-paid' : 'status-confirmed';
      icon = '&#10003;';
    } else if (clean === 'Completed') {
      cls = 'status-completed';
      icon = '&#9733;';
    } else if (clean === 'Cancelled' || clean === 'Unpaid') {
      cls = clean === 'Unpaid' ? 'status-unpaid' : 'status-cancelled';
      icon = '&#10005;';
    }
    return '<span class="status-label ' + cls + '">' + icon + ' ' + escapeHtml(clean) + '</span>';
  }

  function setupNavigation() {
    var menuBtn = document.getElementById('mobileMenuBtn');
    var nav = document.getElementById('mainNav');
    if (menuBtn && nav) {
      menuBtn.addEventListener('click', function () {
        var isOpen = nav.classList.toggle('open');
        menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    }
  }

  /* ======================== Smart Salon Concierge Drawer ======================== */
  function setupConciergeDrawer() {
    var openBtns = document.querySelectorAll('[data-open-concierge]');
    if (!openBtns.length) return;

    var drawer = document.getElementById('conciergeDrawer');
    if (!drawer) {
      drawer = document.createElement('div');
      drawer.id = 'conciergeDrawer';
      drawer.className = 'drawer-backdrop hidden';
      drawer.setAttribute('role', 'dialog');
      drawer.setAttribute('aria-label', 'Smart Salon Concierge');
      drawer.innerHTML =
        '<div class="drawer-panel">' +
        '  <div class="modal-header">' +
        '    <div>' +
        '      <h3 class="font-display" style="font-size:1.35rem;">Smart Salon Concierge</h3>' +
        '      <p class="text-xs text-muted">Instant service advice, offers &amp; live Jalgaon slot availability</p>' +
        '    </div>' +
        '    <button type="button" class="btn btn-outline btn-sm" id="closeConciergeBtn" aria-label="Close concierge">Close</button>' +
        '  </div>' +
        '  <div class="chat-messages" id="conciergeMessages"></div>' +
        '  <div class="chat-quick-row">' +
        '    <button type="button" class="btn btn-outline btn-sm" data-quick-ask="Suggest a bridal makeup package">Bridal Packages</button>' +
        '    <button type="button" class="btn btn-outline btn-sm" data-quick-ask="What time slots are open today?">Today’s Open Slots</button>' +
        '    <button type="button" class="btn btn-outline btn-sm" data-quick-ask="Show active discount promo codes">Active Offers</button>' +
        '    <button type="button" class="btn btn-outline btn-sm" data-quick-ask="Pre-bridal skincare & facial advice">Pre-Bridal Skin</button>' +
        '  </div>' +
        '  <form class="chat-input-row" id="conciergeForm">' +
        '    <input type="text" class="form-control" id="conciergeInput" placeholder="Ask about services, prices, or slots..." required>' +
        '    <button type="submit" class="btn btn-primary btn-sm">Ask</button>' +
        '  </form>' +
        '</div>';
      document.body.appendChild(drawer);
    }

    var messagesBox = document.getElementById('conciergeMessages');
    var form = document.getElementById('conciergeForm');
    var input = document.getElementById('conciergeInput');
    var closeBtn = document.getElementById('closeConciergeBtn');

    function appendMessage(role, htmlText) {
      var div = document.createElement('div');
      div.className = 'chat-bubble ' + role;
      div.innerHTML = htmlText;
      messagesBox.appendChild(div);
      messagesBox.scrollTop = messagesBox.scrollHeight;
    }

    function generateSmartReply(query) {
      var q = String(query || '').toLowerCase();
      var db = global.SalonDB.loadDb();
      var today = global.SalonDB.getTodayIso();
      var activeOffers = db.offers.filter(function (o) { return o.active; });

      if (q.indexOf('slot') !== -1 || q.indexOf('today') !== -1 || q.indexOf('time') !== -1 || q.indexOf('available') !== -1) {
        var avail = global.SalonDB.getSlotAvailability(today, 'artist-pratiksha');
        var openSlots = avail.filter(function (s) { return s.available; }).map(function (s) { return s.timeSlot; });
        var reply = openSlots.length
          ? '<strong>Pratiksha Wani’s open slots today (' + escapeHtml(today) + '):</strong><br>' + escapeHtml(openSlots.join(', '))
          : 'Pratiksha Wani is fully booked today, but Sneha Kulkarni or Riya Deshmukh may have openings.';
        return reply + '<div class="mt-2"><a href="booking.html?date=' + encodeURIComponent(today) + '" class="btn btn-primary btn-sm">Book Available Slot</a></div>';
      }

      if (q.indexOf('offer') !== -1 || q.indexOf('discount') !== -1 || q.indexOf('promo') !== -1 || q.indexOf('code') !== -1) {
        if (!activeOffers.length) {
          return 'No promotional codes are active at the moment. Standard studio rates apply.';
        }
        var items = activeOffers.map(function (o) {
          return '<li><strong>' + escapeHtml(o.code) + '</strong> (' + o.discountPercent + '% off · ' + escapeHtml(o.category) + '): ' + escapeHtml(o.title) + '</li>';
        }).join('');
        return '<strong>Active Pratiksha Makeover Offers:</strong><ul style="margin:6px 0 8px 18px;padding:0;">' + items + '</ul><a href="booking.html" class="btn btn-primary btn-sm">Apply in Booking Form</a>';
      }

      if (q.indexOf('bridal') !== -1 || q.indexOf('wedding') !== -1 || q.indexOf('maharani') !== -1) {
        var bridal = db.services.filter(function (s) { return s.active && (s.category === 'Bridal Makeup' || s.category === 'Beauty Packages'); });
        var list = bridal.map(function (s) {
          return '<li><strong>' + escapeHtml(s.name) + '</strong> — ' + global.SalonDB.formatINR(s.price) + ' (' + s.durationMinutes + ' min) <a href="booking.html?service=' + encodeURIComponent(s.id) + '" style="color:var(--accent-rose);font-weight:600;">Select &rarr;</a></li>';
        }).join('');
        return '<strong>Recommended Bridal &amp; Pre-Bridal Services:</strong><ul style="margin:6px 0 8px 18px;padding:0;">' + list + '</ul>Tip: Use code <strong>BRIDAL15</strong> for 15% savings on Bridal Makeup!';
      }

      if (q.indexOf('skin') !== -1 || q.indexOf('facial') !== -1 || q.indexOf('cleanup') !== -1 || q.indexOf('wax') !== -1) {
        var skin = db.services.filter(function (s) {
          return s.active && (s.category === 'Facial' || s.category === 'Cleanup' || s.category === 'Beauty Packages');
        });
        var skinList = skin.map(function (s) {
          return '<li><strong>' + escapeHtml(s.name) + '</strong> — ' + global.SalonDB.formatINR(s.price) + ' <a href="booking.html?service=' + encodeURIComponent(s.id) + '" style="color:var(--accent-rose);font-weight:600;">Book &rarr;</a></li>';
        }).join('');
        return '<strong>Pre-Bridal &amp; Radiance Skincare Menu:</strong><ul style="margin:6px 0 8px 18px;padding:0;">' + skinList + '</ul>Use promo code <strong>GLOW10</strong> for 10% savings.';
      }

      if (q.indexOf('party') !== -1 || q.indexOf('engagement') !== -1 || q.indexOf('hair') !== -1 || q.indexOf('saree') !== -1 || q.indexOf('mehndi') !== -1) {
        var matched = db.services.filter(function (s) {
          var hay = (s.name + ' ' + s.category).toLowerCase();
          return s.active && (
            (q.indexOf('party') !== -1 && hay.indexOf('party') !== -1) ||
            (q.indexOf('engagement') !== -1 && hay.indexOf('engagement') !== -1) ||
            (q.indexOf('hair') !== -1 && hay.indexOf('hair') !== -1) ||
            (q.indexOf('saree') !== -1 && hay.indexOf('saree') !== -1) ||
            (q.indexOf('mehndi') !== -1 && hay.indexOf('mehndi') !== -1)
          );
        });
        if (matched.length) {
          var mHtml = matched.map(function (s) {
            return '<li><strong>' + escapeHtml(s.name) + '</strong> — ' + global.SalonDB.formatINR(s.price) + ' (' + s.durationMinutes + ' min) <a href="booking.html?service=' + encodeURIComponent(s.id) + '" style="color:var(--accent-rose);font-weight:600;">Book &rarr;</a></li>';
          }).join('');
          return '<strong>Matching Salon Services:</strong><ul style="margin:6px 0 8px 18px;padding:0;">' + mHtml + '</ul>';
        }
      }

      if (q.indexOf('location') !== -1 || q.indexOf('address') !== -1 || q.indexOf('jalgaon') !== -1 || q.indexOf('hour') !== -1 || q.indexOf('contact') !== -1) {
        return '<strong>Visit Pratiksha Makeover:</strong><br>' + escapeHtml(global.SalonDB.SALON_INFO.address) + '<br>Hours: ' + escapeHtml(global.SalonDB.SALON_INFO.hours) + '<br>Phone / WhatsApp: ' + escapeHtml(global.SalonDB.SALON_INFO.phone);
      }

      var topThree = db.services.filter(function (s) { return s.active && s.popular; }).slice(0, 3).map(function (s) {
        return '<li><strong>' + escapeHtml(s.name) + '</strong> (' + escapeHtml(s.category) + ') — ' + global.SalonDB.formatINR(s.price) + '</li>';
      }).join('');
      return 'I can help you pick a service, check today’s open slots, or apply promo codes without creating an account.<br><strong>Popular choices right now:</strong><ul style="margin:6px 0 8px 18px;padding:0;">' + topThree + '</ul><a href="booking.html" class="btn btn-primary btn-sm">Open Direct Booking</a>';
    }

    if (!messagesBox.children.length) {
      appendMessage('bot', 'Namaste! Welcome to <strong>Pratiksha Makeover</strong> in Jalgaon. Tell me your occasion (wedding, engagement, party, facial, or mehndi) and I will recommend the best service and open slots.');
    }

    openBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        drawer.classList.remove('hidden');
        input.focus();
      });
    });

    closeBtn.addEventListener('click', function () {
      drawer.classList.add('hidden');
    });

    drawer.addEventListener('click', function (e) {
      if (e.target === drawer) drawer.classList.add('hidden');
    });

    drawer.querySelectorAll('[data-quick-ask]').forEach(function (qBtn) {
      qBtn.addEventListener('click', function () {
        var text = qBtn.getAttribute('data-quick-ask');
        appendMessage('user', escapeHtml(text));
        appendMessage('bot', generateSmartReply(text));
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text) return;
      input.value = '';
      appendMessage('user', escapeHtml(text));
      appendMessage('bot', generateSmartReply(text));
    });
  }

  /* ======================== Home Page Initializer ======================== */
  function initHomePage() {
    var featuredGrid = document.getElementById('featuredServicesGrid');
    var artistsGrid = document.getElementById('artistsGrid');
    var offersGrid = document.getElementById('homeOffersGrid');
    var reviewsGrid = document.getElementById('homeReviewsGrid');
    var reviewForm = document.getElementById('guestReviewForm');
    var reviewAlert = document.getElementById('reviewAlert');
    var reviewServiceSelect = document.getElementById('reviewServiceSelect');

    var db = global.SalonDB.loadDb();

    if (featuredGrid) {
      var featured = db.services.filter(function (s) { return s.active && s.popular; }).slice(0, 6);
      featuredGrid.innerHTML = featured.map(function (srv) {
        return (
          '<article class="card card-linen card-hover">' +
          '  <div class="meta-line">' +
          '    <span class="meta-highlight">' + escapeHtml(srv.category) + '</span>' +
          '    <span>&middot;</span>' +
          '    <span class="tabular-nums">' + srv.durationMinutes + ' min</span>' +
          '  </div>' +
          '  <h3 class="card-title">' + escapeHtml(srv.name) + '</h3>' +
          '  <p class="card-body">' + escapeHtml(srv.description) + '</p>' +
          '  <div class="card-footer">' +
          '    <span class="price-text tabular-nums">' + global.SalonDB.formatINR(srv.price) + '</span>' +
          '    <a href="booking.html?service=' + encodeURIComponent(srv.id) + '" class="btn btn-primary btn-sm">Book Service</a>' +
          '  </div>' +
          '</article>'
        );
      }).join('');
    }

    if (artistsGrid) {
      artistsGrid.innerHTML = global.SalonDB.ARTISTS.map(function (art) {
        return (
          '<article class="card">' +
          '  <div class="meta-line">' +
          '    <span class="meta-highlight">' + escapeHtml(art.experience) + '</span>' +
          '  </div>' +
          '  <h3 class="card-title">' + escapeHtml(art.name) + '</h3>' +
          '  <p class="text-sm" style="color:var(--accent-rose);font-weight:600;margin-bottom:8px;">' + escapeHtml(art.specialty) + '</p>' +
          '  <p class="card-body">' + escapeHtml(art.bio) + '</p>' +
          '  <div class="card-footer">' +
          '    <span class="text-xs text-muted">Available Tue – Sun</span>' +
          '    <a href="booking.html?artist=' + encodeURIComponent(art.id) + '" class="btn btn-outline btn-sm">Book Artist</a>' +
          '  </div>' +
          '</article>'
        );
      }).join('');
    }

    if (offersGrid) {
      var offers = db.offers.filter(function (o) { return o.active; });
      offersGrid.innerHTML = offers.map(function (o) {
        return (
          '<article class="card card-linen">' +
          '  <div class="meta-line">' +
          '    <span class="booking-code-pill">' + escapeHtml(o.code) + '</span>' +
          '    <span class="meta-highlight tabular-nums">' + o.discountPercent + '% OFF</span>' +
          '    <span>&middot;</span>' +
          '    <span>' + escapeHtml(o.category) + '</span>' +
          '  </div>' +
          '  <h3 class="card-title">' + escapeHtml(o.title) + '</h3>' +
          '  <p class="card-body">' + escapeHtml(o.description) + '</p>' +
          '  <div class="card-footer">' +
          '    <span class="text-xs text-muted">Valid until ' + escapeHtml(o.validUntil) + '</span>' +
          '    <a href="booking.html?offer=' + encodeURIComponent(o.code) + '" class="btn btn-dark btn-sm">Apply Code</a>' +
          '  </div>' +
          '</article>'
        );
      }).join('');
    }

    if (reviewServiceSelect) {
      reviewServiceSelect.innerHTML = db.services.filter(function (s) { return s.active; }).map(function (s) {
        return '<option value="' + escapeHtml(s.name) + '">' + escapeHtml(s.name) + '</option>';
      }).join('');
    }

    function renderReviews() {
      if (!reviewsGrid) return;
      var latestDb = global.SalonDB.loadDb();
      reviewsGrid.innerHTML = latestDb.reviews.slice(0, 6).map(function (r) {
        var stars = '&#9733;'.repeat(r.rating) + '&#9734;'.repeat(5 - r.rating);
        return (
          '<article class="card">' +
          '  <div class="meta-line">' +
          '    <span style="color:var(--accent-gold);font-size:0.95rem;">' + stars + '</span>' +
          '    <span>&middot;</span>' +
          '    <span>' + escapeHtml(r.serviceName) + '</span>' +
          '  </div>' +
          '  <p class="card-body mt-2">“' + escapeHtml(r.comment) + '”</p>' +
          '  <div class="card-footer">' +
          '    <div>' +
          '      <strong class="text-sm">' + escapeHtml(r.customerName) + '</strong>' +
          '      <div class="text-xs text-muted">' + escapeHtml(r.outcomeNote || 'Verified salon visit') + '</div>' +
          '    </div>' +
          '    <span class="text-xs text-muted tabular-nums">' + escapeHtml(r.date) + '</span>' +
          '  </div>' +
          '</article>'
        );
      }).join('');
    }

    renderReviews();

    if (reviewForm) {
      reviewForm.addEventListener('submit', function (e) {
        e.preventDefault();
        try {
          global.SalonDB.createReview({
            customerName: document.getElementById('reviewName').value,
            serviceName: document.getElementById('reviewServiceSelect').value,
            rating: document.getElementById('reviewRating').value,
            comment: document.getElementById('reviewComment').value,
            outcomeNote: 'Jalgaon Studio Visit'
          });
          reviewForm.reset();
          renderReviews();
          if (reviewAlert) {
            reviewAlert.className = 'alert alert-success mt-2';
            reviewAlert.textContent = 'Thank you! Your review is now featured on Pratiksha Makeover.';
            reviewAlert.classList.remove('hidden');
          }
        } catch (err) {
          if (reviewAlert) {
            reviewAlert.className = 'alert alert-error mt-2';
            reviewAlert.textContent = err.message;
            reviewAlert.classList.remove('hidden');
          }
        }
      });
    }

    var waHeroBtn = document.getElementById('homeWhatsAppBtn');
    if (waHeroBtn) {
      waHeroBtn.href = global.SalonDB.buildWhatsAppUrl(
        global.SalonDB.SALON_INFO.whatsappDigits,
        'Namaste Pratiksha Makeover! I would like to inquire about bridal/salon appointments in Jalgaon.'
      );
    }
  }

  /* ======================== Services Page Initializer ======================== */
  function initServicesPage() {
    var filterBar = document.getElementById('servicesFilterBar');
    var searchInput = document.getElementById('servicesSearchInput');
    var grid = document.getElementById('allServicesGrid');
    var countLabel = document.getElementById('servicesCountLabel');
    if (!grid || !filterBar) return;

    var activeCategory = 'All';
    var categories = ['All'].concat(global.SalonDB.SERVICE_CATEGORIES);

    function renderFilters() {
      filterBar.innerHTML = categories.map(function (cat) {
        var cls = cat === activeCategory ? 'filter-tab active' : 'filter-tab';
        return '<button type="button" class="' + cls + '" data-cat="' + escapeHtml(cat) + '">' + escapeHtml(cat) + '</button>';
      }).join('');

      filterBar.querySelectorAll('.filter-tab').forEach(function (btn) {
        btn.addEventListener('click', function () {
          activeCategory = btn.getAttribute('data-cat');
          renderFilters();
          renderGrid();
        });
      });
    }

    function renderGrid() {
      var db = global.SalonDB.loadDb();
      var q = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var filtered = db.services.filter(function (s) {
        if (!s.active) return false;
        if (activeCategory !== 'All' && s.category !== activeCategory) return false;
        if (q) {
          var hay = (s.name + ' ' + s.category + ' ' + s.description).toLowerCase();
          if (hay.indexOf(q) === -1) return false;
        }
        return true;
      });

      if (countLabel) {
        countLabel.textContent = filtered.length + ' service' + (filtered.length === 1 ? '' : 's') + ' shown';
      }

      if (!filtered.length) {
        grid.innerHTML = '<div class="card"><p class="text-muted">No services match your filter. Try selecting "All" or clearing the search box.</p></div>';
        return;
      }

      grid.innerHTML = filtered.map(function (srv) {
        return (
          '<article class="card card-hover">' +
          '  <div class="meta-line">' +
          '    <span class="meta-highlight">' + escapeHtml(srv.category) + '</span>' +
          '    <span>&middot;</span>' +
          '    <span class="tabular-nums">' + srv.durationMinutes + ' min</span>' +
          (srv.popular ? '<span>&middot;</span><span>Signature Pick</span>' : '') +
          '  </div>' +
          '  <h3 class="card-title">' + escapeHtml(srv.name) + '</h3>' +
          '  <p class="card-body">' + escapeHtml(srv.description) + '</p>' +
          '  <div class="card-footer">' +
          '    <span class="price-text tabular-nums">' + global.SalonDB.formatINR(srv.price) + '</span>' +
          '    <a href="booking.html?service=' + encodeURIComponent(srv.id) + '" class="btn btn-primary btn-sm">Book Directly</a>' +
          '  </div>' +
          '</article>'
        );
      }).join('');
    }

    renderFilters();
    renderGrid();

    if (searchInput) {
      searchInput.addEventListener('input', renderGrid);
    }
  }

  /* ======================== Gallery Page Initializer ======================== */
  function initGalleryPage() {
    var filterBar = document.getElementById('galleryFilterBar');
    var grid = document.getElementById('galleryGrid');
    var lightbox = document.getElementById('galleryLightbox');
    if (!grid || !filterBar) return;

    var categories = ['All', 'Bridal Makeup', 'Party Makeup', 'Mehndi Art', 'Hairstyle', 'Facial'];
    var activeCategory = 'All';

    function openLightbox(item) {
      if (!lightbox) return;
      document.getElementById('lightboxTitle').textContent = item.title;
      document.getElementById('lightboxMeta').textContent = item.category + ' · By ' + item.artist;
      var img = document.getElementById('lightboxImg');
      img.src = item.image;
      img.alt = item.alt;
      document.getElementById('lightboxCaption').textContent = item.caption;
      document.getElementById('lightboxBookBtn').href = 'booking.html?service=' + encodeURIComponent(item.serviceId);
      lightbox.classList.remove('hidden');
    }

    function renderFilters() {
      filterBar.innerHTML = categories.map(function (cat) {
        var cls = cat === activeCategory ? 'filter-tab active' : 'filter-tab';
        return '<button type="button" class="' + cls + '" data-cat="' + escapeHtml(cat) + '">' + escapeHtml(cat) + '</button>';
      }).join('');

      filterBar.querySelectorAll('.filter-tab').forEach(function (btn) {
        btn.addEventListener('click', function () {
          activeCategory = btn.getAttribute('data-cat');
          renderFilters();
          renderGrid();
        });
      });
    }

    function renderGrid() {
      var list = activeCategory === 'All'
        ? GALLERY_LOOKS
        : GALLERY_LOOKS.filter(function (g) { return g.category === activeCategory; });

      grid.innerHTML = list.map(function (item) {
        return (
          '<article class="gallery-card" data-look-id="' + escapeHtml(item.id) + '" tabindex="0" role="button" aria-label="View ' + escapeHtml(item.title) + '">' +
          '  <div class="gallery-thumb">' +
          '    <img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.alt) + '" referrerpolicy="no-referrer">' +
          '  </div>' +
          '  <div class="gallery-caption">' +
          '    <div class="meta-line">' +
          '      <span class="meta-highlight">' + escapeHtml(item.category) + '</span>' +
          '      <span>&middot;</span>' +
          '      <span>' + escapeHtml(item.artist) + '</span>' +
          '    </div>' +
          '    <h3 class="card-title" style="font-size:1.3rem;">' + escapeHtml(item.title) + '</h3>' +
          '    <p class="card-body">' + escapeHtml(item.caption) + '</p>' +
          '  </div>' +
          '</article>'
        );
      }).join('');

      grid.querySelectorAll('.gallery-card').forEach(function (card) {
        function handleOpen() {
          var id = card.getAttribute('data-look-id');
          var item = GALLERY_LOOKS.find(function (g) { return g.id === id; });
          if (item) openLightbox(item);
        }
        card.addEventListener('click', handleOpen);
        card.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpen();
          }
        });
      });
    }

    if (lightbox) {
      var closeLb = document.getElementById('closeLightboxBtn');
      if (closeLb) {
        closeLb.addEventListener('click', function () {
          lightbox.classList.add('hidden');
        });
      }
      lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) lightbox.classList.add('hidden');
      });
    }

    renderFilters();
    renderGrid();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupConciergeDrawer();

    var page = document.body.getAttribute('data-page');
    if (page === 'home') initHomePage();
    if (page === 'services') initServicesPage();
    if (page === 'gallery') initGalleryPage();
  });

  global.SalonUI = {
    escapeHtml: escapeHtml,
    formatStatusBadge: formatStatusBadge
  };
})(window);
