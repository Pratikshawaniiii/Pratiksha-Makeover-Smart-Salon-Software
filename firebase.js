/*
 * Pratiksha Makeover — Data & Optional Firebase Firestore Adapter (Pure Vanilla JS)
 * Runs offline/locally via localStorage in VS Code Live Server out of the box,
 * and supports optional Firebase Firestore Web SDK synchronization when configured.
 */

(function (global) {
  'use strict';

  var DB_STORAGE_KEY = 'pm_vanilla_salon_db_v1';
  var ADMIN_SESSION_KEY = 'pm_vanilla_admin_session';
  var RECENT_BOOKINGS_KEY = 'pm_vanilla_recent_bookings';

  // Optional Firebase Firestore Configuration:
  // Set USE_FIRESTORE = true and paste your Firebase Web Config to sync online.
  var USE_FIRESTORE = false;
  var FIREBASE_CONFIG = {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  };

  var SALON_INFO = {
    brand: 'Pratiksha Makeover',
    tagline: 'Your Beauty, Our Passion',
    city: 'Jalgaon, Maharashtra, India',
    address: 'Shop 4, Pearl Plaza, Ring Road, Navi Peth, Jalgaon, Maharashtra 425001',
    phone: '+91 98234 56789',
    whatsappDigits: '919823456789',
    email: 'hello@pratikshamakeover.in',
    upiId: 'pratikshamakeover@okicici',
    hours: 'Tuesday – Sunday · 10:00 AM – 8:00 PM (Monday by Bridal Appointment)'
  };

  var SERVICE_CATEGORIES = [
    'Bridal Makeup',
    'Party Makeup',
    'Engagement Makeup',
    'Hairstyle',
    'Saree Draping',
    'Facial',
    'Cleanup',
    'Waxing',
    'Threading',
    'Mehndi Art',
    'Beauty Packages'
  ];

  var TIME_SLOTS = [
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:30 PM',
    '03:00 PM',
    '04:30 PM',
    '06:00 PM',
    '07:00 PM'
  ];

  var ARTISTS = [
    {
      id: 'artist-pratiksha',
      name: 'Pratiksha Wani',
      specialty: 'Lead Bridal & HD Makeup Artist',
      experience: '9+ Years · Certified MUA',
      bio: 'Founder of Pratiksha Makeover, celebrated across Jalgaon for luminous, breathable bridal artistry and traditional Maharashtrian & contemporary looks.'
    },
    {
      id: 'artist-sneha',
      name: 'Sneha Kulkarni',
      specialty: 'Hairstyling & Saree Draping Specialist',
      experience: '6+ Years · Bridal Couture Stylist',
      bio: 'Expert in Navvari, Kanjivaram, and Lehenga double-dupatta draping paired with floral buns, textured waves, and hair extensions.'
    },
    {
      id: 'artist-riya',
      name: 'Riya Deshmukh',
      specialty: 'Skincare, Facials & Bridal Mehndi Artist',
      experience: '5+ Years · Aesthetician & Henna Artist',
      bio: 'Specializes in pre-bridal skin radiance rituals, Hydra-Glow facials, gentle silk waxing, and intricate Rajasthani & Arabic mehndi.'
    }
  ];

  var ADMIN_ACCOUNTS = [
    { email: 'admin@pratikshamakeover.in', pass: 'Admin@123', name: 'Pratiksha Wani' },
    { email: 'wanipratiksha24@gmail.com', pass: 'Admin@123', name: 'Pratiksha Wani (Owner)' }
  ];

  function getTodayIso() {
    var d = new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function getOffsetIso(offsetDays) {
    var d = new Date();
    d.setDate(d.getDate() + offsetDays);
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function makeId(prefix) {
    return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
  }

  function formatINR(amount) {
    return '₹' + Number(amount || 0).toLocaleString('en-IN');
  }

  function buildWhatsAppUrl(phoneDigits, text) {
    var digits = String(phoneDigits || '').replace(/\D/g, '');
    if (digits.length === 10) digits = '91' + digits;
    if (!digits) digits = SALON_INFO.whatsappDigits;
    return 'https://wa.me/' + digits + '?text=' + encodeURIComponent(text);
  }

  function createSeedDatabase() {
    var today = getTodayIso();
    var tomorrow = getOffsetIso(1);
    var yesterday = getOffsetIso(-1);
    var twoDaysAgo = getOffsetIso(-2);
    var nowIso = new Date().toISOString();

    return {
      services: [
        {
          id: 'srv-bridal-hd',
          name: 'Royal HD Bridal Signature Makeup',
          category: 'Bridal Makeup',
          price: 16500,
          durationMinutes: 180,
          description: 'Long-wear waterproof HD bridal base, soft sculpted eyes, mink lashes, hairstyling, floral setting, and bridal saree/dupatta draping.',
          popular: true,
          active: true
        },
        {
          id: 'srv-bridal-airbrush',
          name: 'Airbrush Maharani Bridal Look',
          category: 'Bridal Makeup',
          price: 22000,
          durationMinutes: 210,
          description: 'Ultra-light silicone airbrush finish designed for 16-hour wear under wedding lights, complete with couture hairstyling and jewelry pinning.',
          popular: true,
          active: true
        },
        {
          id: 'srv-party-glam',
          name: 'Soft Glam Party Makeover',
          category: 'Party Makeup',
          price: 3800,
          durationMinutes: 90,
          description: 'Luminous evening makeup tailored to your outfit with blow-dry or soft waves and effortless saree/dupatta pinning.',
          popular: true,
          active: true
        },
        {
          id: 'srv-engagement-luxe',
          name: 'Luminous Engagement & Ring Ceremony Look',
          category: 'Engagement Makeup',
          price: 8500,
          durationMinutes: 120,
          description: 'Dewy glass-skin radiance, rose-champagne shimmer eyes, customized half-up hairstyle, and precision lehenga draping.',
          popular: true,
          active: true
        },
        {
          id: 'srv-hairstyle-floral',
          name: 'Bridal Floral Jooda & Textured Waves',
          category: 'Hairstyle',
          price: 2200,
          durationMinutes: 75,
          description: 'Custom hairstyling with fresh mogra/rose floral arrangement, hair padding, or sleek Bollywood waves.',
          popular: false,
          active: true
        },
        {
          id: 'srv-saree-draping',
          name: 'Navvari & Silk Couture Saree Draping',
          category: 'Saree Draping',
          price: 1200,
          durationMinutes: 45,
          description: 'Crisp, wrinkle-free traditional Navvari, Paithani, or Kanjivaram pleating and box-folding for effortless movement.',
          popular: false,
          active: true
        },
        {
          id: 'srv-facial-gold',
          name: '24K Gold & Rose Quartz Radiance Facial',
          category: 'Facial',
          price: 2800,
          durationMinutes: 75,
          description: 'Lymphatic rose-quartz massage, botanical gold serum infusion, ultrasonic hydration, and illuminating peel-off mask.',
          popular: true,
          active: true
        },
        {
          id: 'srv-cleanup-detox',
          name: 'Botanical Pore Detox Cleanup',
          category: 'Cleanup',
          price: 1100,
          durationMinutes: 45,
          description: 'Gentle steam exfoliation, blackhead extraction, and calming rosewater chamomile mask for instant clarity.',
          popular: false,
          active: true
        },
        {
          id: 'srv-waxing-rica',
          name: 'Rica Italian Silk Full Arms & Legs Waxing',
          category: 'Waxing',
          price: 1500,
          durationMinutes: 60,
          description: 'Low-temperature, rosin-free white chocolate & avocado Rica wax infused with soothing post-epilation oil.',
          popular: false,
          active: true
        },
        {
          id: 'srv-threading-brows',
          name: 'Precision Brow Sculpting & Upper Lip Threading',
          category: 'Threading',
          price: 150,
          durationMinutes: 20,
          description: 'Architectural eyebrow mapping and gentle organic cotton threading finished with cooling aloe gel.',
          popular: false,
          active: true
        },
        {
          id: 'srv-mehndi-bridal',
          name: 'Intricate Bridal & Festive Mehndi Art',
          category: 'Mehndi Art',
          price: 4500,
          durationMinutes: 150,
          description: '100% organic Sojat henna paste with rich deep stain guarantee—custom portrait, mandala, or floral motifs.',
          popular: true,
          active: true
        },
        {
          id: 'srv-pkg-prebridal',
          name: 'Complete Pre-Bridal Trousseau Package',
          category: 'Beauty Packages',
          price: 11900,
          durationMinutes: 240,
          description: 'Includes 24K Gold Facial, Rica Full Body Silk Waxing, Spa Manicure & Pedicure, Hair Spa Ritual, and Brow Sculpting.',
          popular: true,
          active: true
        }
      ],
      offers: [
        {
          id: 'off-bridal15',
          code: 'BRIDAL15',
          title: 'Wedding Season Bridal Privilege',
          description: 'Enjoy 15% savings on Royal HD Bridal & Airbrush Maharani Bridal bookings confirmed 14+ days ahead.',
          discountPercent: 15,
          validUntil: '2026-12-31',
          category: 'Bridal Makeup',
          active: true
        },
        {
          id: 'off-glow10',
          code: 'GLOW10',
          title: 'Weekday Skincare & Facial Glow',
          description: 'Flat 10% off on 24K Gold Radiance Facial, Detox Cleanup, and Pre-Bridal Trousseau Packages.',
          discountPercent: 10,
          validUntil: '2026-12-31',
          category: 'All Services',
          active: true
        },
        {
          id: 'off-sangeet20',
          code: 'SANGEET20',
          title: 'Bridesmaid & Family Group Glam',
          description: '20% savings on Party Makeup and Saree Draping when booking for Sangeet or Reception celebrations.',
          discountPercent: 20,
          validUntil: '2026-12-31',
          category: 'Party Makeup',
          active: true
        }
      ],
      customers: [
        {
          id: 'cust-1',
          name: 'Ananya Patil',
          phone: '9765432109',
          whatsappNumber: '9765432109',
          notes: 'Sensitive combination skin; prefers warm rose-gold tones and natural lashes.',
          totalVisits: 2,
          totalSpent: 18525,
          lastVisit: yesterday,
          createdAt: nowIso
        },
        {
          id: 'cust-2',
          name: 'Meera Chaudhari',
          phone: '9890123456',
          whatsappNumber: '9890123456',
          notes: 'Booking for sister wedding reception; loves soft Hollywood waves.',
          totalVisits: 1,
          totalSpent: 0,
          lastVisit: twoDaysAgo,
          createdAt: nowIso
        },
        {
          id: 'cust-3',
          name: 'Pooja Mahajan',
          phone: '9422112233',
          whatsappNumber: '9422112233',
          notes: 'Bride-to-be for wedding in Jalgaon. Trial completed.',
          totalVisits: 1,
          totalSpent: 0,
          lastVisit: today,
          createdAt: nowIso
        }
      ],
      appointments: [
        {
          id: 'apt-1001',
          bookingCode: 'PM-2601',
          customerId: 'cust-1',
          customerName: 'Ananya Patil',
          customerPhone: '9765432109',
          whatsappNumber: '9765432109',
          serviceId: 'srv-bridal-hd',
          serviceName: 'Royal HD Bridal Signature Makeup',
          serviceCategory: 'Bridal Makeup',
          price: 16500,
          discountAmount: 2475,
          finalAmount: 14025,
          offerCode: 'BRIDAL15',
          durationMinutes: 180,
          artistId: 'artist-pratiksha',
          artistName: 'Pratiksha Wani',
          date: yesterday,
          timeSlot: '10:00 AM',
          requirements: 'Traditional Maharashtrian Paithani look with fresh mogra gajra.',
          status: 'Completed',
          prepNote: 'Completed Royal HD Bridal Signature session with soft rose-gold tones.',
          createdAt: twoDaysAgo + 'T09:30:00.000Z'
        },
        {
          id: 'apt-1002',
          bookingCode: 'PM-2602',
          customerId: 'cust-2',
          customerName: 'Meera Chaudhari',
          customerPhone: '9890123456',
          whatsappNumber: '9890123456',
          serviceId: 'srv-party-glam',
          serviceName: 'Soft Glam Party Makeover',
          serviceCategory: 'Party Makeup',
          price: 3800,
          discountAmount: 0,
          finalAmount: 3800,
          durationMinutes: 90,
          artistId: 'artist-pratiksha',
          artistName: 'Pratiksha Wani',
          date: today,
          timeSlot: '11:00 AM',
          requirements: 'Soft champagne smokey eye and loose curls for evening reception.',
          status: 'Confirmed',
          prepNote: 'Arrive with cleansed skin and a button-down top so hairstyling remains intact.',
          createdAt: yesterday + 'T11:15:00.000Z'
        },
        {
          id: 'apt-1003',
          bookingCode: 'PM-2603',
          customerId: 'cust-3',
          customerName: 'Pooja Mahajan',
          customerPhone: '9422112233',
          whatsappNumber: '9422112233',
          serviceId: 'srv-facial-gold',
          serviceName: '24K Gold & Rose Quartz Radiance Facial',
          serviceCategory: 'Facial',
          price: 2800,
          discountAmount: 280,
          finalAmount: 2520,
          offerCode: 'GLOW10',
          durationMinutes: 75,
          artistId: 'artist-riya',
          artistName: 'Riya Deshmukh',
          date: today,
          timeSlot: '03:00 PM',
          requirements: 'Pre-wedding skin glow session; avoid harsh scrubs.',
          status: 'Pending',
          prepNote: 'Avoid active retinoids 24 hours before your facial ritual.',
          createdAt: today + 'T07:00:00.000Z'
        },
        {
          id: 'apt-1004',
          bookingCode: 'PM-2604',
          customerId: 'cust-1',
          customerName: 'Ananya Patil',
          customerPhone: '9765432109',
          whatsappNumber: '9765432109',
          serviceId: 'srv-mehndi-bridal',
          serviceName: 'Intricate Bridal & Festive Mehndi Art',
          serviceCategory: 'Mehndi Art',
          price: 4500,
          discountAmount: 0,
          finalAmount: 4500,
          durationMinutes: 150,
          artistId: 'artist-riya',
          artistName: 'Riya Deshmukh',
          date: tomorrow,
          timeSlot: '01:30 PM',
          requirements: 'Minimalist lotus mandala design on palms.',
          status: 'Confirmed',
          prepNote: 'Keep hands lotion-free before arrival for deepest organic henna stain.',
          createdAt: today + 'T08:15:00.000Z'
        }
      ],
      payments: [
        {
          id: 'pay-1001',
          receiptNumber: 'RCP-PM-2601',
          appointmentId: 'apt-1001',
          bookingCode: 'PM-2601',
          customerId: 'cust-1',
          customerName: 'Ananya Patil',
          customerPhone: '9765432109',
          serviceName: 'Royal HD Bridal Signature Makeup',
          amount: 16500,
          discountAmount: 2475,
          finalAmount: 14025,
          offerCode: 'BRIDAL15',
          method: 'UPI',
          status: 'Paid',
          transactionRef: 'UPI419820341122',
          confirmedAt: yesterday + 'T13:35:00.000Z',
          createdAt: twoDaysAgo + 'T09:30:00.000Z'
        },
        {
          id: 'pay-1002',
          receiptNumber: 'RCP-PM-2602',
          appointmentId: 'apt-1002',
          bookingCode: 'PM-2602',
          customerId: 'cust-2',
          customerName: 'Meera Chaudhari',
          customerPhone: '9890123456',
          serviceName: 'Soft Glam Party Makeover',
          amount: 3800,
          discountAmount: 0,
          finalAmount: 3800,
          method: 'Online',
          status: 'Pending',
          transactionRef: 'ORD-RAZOR-88412',
          createdAt: yesterday + 'T11:15:00.000Z'
        },
        {
          id: 'pay-1003',
          receiptNumber: 'RCP-PM-2603',
          appointmentId: 'apt-1003',
          bookingCode: 'PM-2603',
          customerId: 'cust-3',
          customerName: 'Pooja Mahajan',
          customerPhone: '9422112233',
          serviceName: '24K Gold & Rose Quartz Radiance Facial',
          amount: 2800,
          discountAmount: 280,
          finalAmount: 2520,
          offerCode: 'GLOW10',
          method: 'Cash',
          status: 'Unpaid',
          createdAt: today + 'T07:00:00.000Z'
        },
        {
          id: 'pay-1004',
          receiptNumber: 'RCP-PM-2604',
          appointmentId: 'apt-1004',
          bookingCode: 'PM-2604',
          customerId: 'cust-1',
          customerName: 'Ananya Patil',
          customerPhone: '9765432109',
          serviceName: 'Intricate Bridal & Festive Mehndi Art',
          amount: 4500,
          discountAmount: 0,
          finalAmount: 4500,
          method: 'UPI',
          status: 'Paid',
          transactionRef: 'UPI419905129044',
          confirmedAt: today + 'T08:22:00.000Z',
          createdAt: today + 'T08:15:00.000Z'
        }
      ],
      reviews: [
        {
          id: 'rev-1',
          customerName: 'Ananya Patil',
          serviceName: 'Royal HD Bridal Signature Makeup',
          rating: 5,
          comment: 'Pratiksha made me feel completely calm and radiant on my wedding morning in Jalgaon. The makeup never felt heavy and photographed flawlessly through the night.',
          outcomeNote: '16-hour crease-free bridal finish',
          date: yesterday
        },
        {
          id: 'rev-2',
          customerName: 'Shraddha Joshi',
          serviceName: 'Navvari & Silk Couture Saree Draping',
          rating: 5,
          comment: 'Sneha draped my heirloom Paithani Navvari in 20 minutes with razor-sharp pleats that stayed intact through hours of dancing.',
          outcomeNote: 'Zero pin slips during Sangeet & Pheras',
          date: twoDaysAgo
        },
        {
          id: 'rev-3',
          customerName: 'Kalyani Bhole',
          serviceName: 'Complete Pre-Bridal Trousseau Package',
          rating: 5,
          comment: 'From the rose quartz facial to the organic mehndi stain, every step felt serene, hygienic, and unhurried. Truly Jalgaon’s finest studio.',
          outcomeNote: 'Visible pre-wedding skin luminosity',
          date: getOffsetIso(-5)
        }
      ],
      notifications: [
        {
          id: 'notif-1',
          recipientRole: 'customer',
          appointmentId: 'apt-1004',
          bookingCode: 'PM-2604',
          type: 'confirmation',
          title: 'Appointment Confirmed · PM-2604',
          message: 'Your Intricate Bridal & Festive Mehndi Art with Riya Deshmukh is confirmed for ' + tomorrow + ' at 01:30 PM.',
          whatsappUrl: buildWhatsAppUrl(SALON_INFO.whatsappDigits, 'Namaste! Appointment PM-2604 at Pratiksha Makeover (Jalgaon) is CONFIRMED for ' + tomorrow + ' at 01:30 PM.'),
          createdAt: today + 'T08:20:00.000Z'
        }
      ]
    };
  }

  function loadDb() {
    try {
      var raw = localStorage.getItem(DB_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      // fallback to seed
    }
    var seeded = createSeedDatabase();
    saveDb(seeded);
    return seeded;
  }

  function saveDb(db) {
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.error('Storage save failed:', e);
    }
    if (USE_FIRESTORE && FIREBASE_CONFIG.projectId) {
      syncCollectionNote();
    }
  }

  function syncCollectionNote() {
    // Optional Firestore sync hook when USE_FIRESTORE is enabled
  }

  function getSlotAvailability(date, artistId, excludeAppointmentId) {
    var db = loadDb();
    var activeOnDate = db.appointments.filter(function (a) {
      return a.date === date && a.status !== 'Cancelled' && a.id !== excludeAppointmentId;
    });
    return TIME_SLOTS.map(function (slot) {
      var bookingsAtSlot = activeOnDate.filter(function (a) {
        return a.timeSlot === slot;
      });
      var taken = artistId
        ? bookingsAtSlot.some(function (b) { return b.artistId === artistId; })
        : bookingsAtSlot.length >= ARTISTS.length;
      return {
        timeSlot: slot,
        available: !taken
      };
    });
  }

  function saveRecentBooking(bookingCode, phone) {
    try {
      var raw = localStorage.getItem(RECENT_BOOKINGS_KEY);
      var list = raw ? JSON.parse(raw) : [];
      var next = [{ bookingCode: bookingCode, phone: phone }].concat(
        list.filter(function (i) { return i.bookingCode !== bookingCode; })
      ).slice(0, 6);
      localStorage.setItem(RECENT_BOOKINGS_KEY, JSON.stringify(next));
    } catch (e) {
      // ignore
    }
  }

  function getRecentBookings() {
    try {
      var raw = localStorage.getItem(RECENT_BOOKINGS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function createAppointment(payload) {
    var cleanName = String(payload.customerName || '').trim();
    var cleanPhone = String(payload.customerPhone || '').replace(/\D/g, '');
    var cleanWa = String(payload.whatsappNumber || '').replace(/\D/g, '') || cleanPhone;

    if (cleanName.length < 2) throw new Error('Please enter your full name.');
    if (cleanPhone.length < 10) throw new Error('Please enter a valid 10-digit mobile number.');
    if (!payload.date) throw new Error('Please select an appointment date.');
    if (!payload.timeSlot || TIME_SLOTS.indexOf(payload.timeSlot) === -1) {
      throw new Error('Please select an available time slot.');
    }

    var db = loadDb();
    var service = db.services.find(function (s) { return s.id === payload.serviceId && s.active; });
    if (!service) throw new Error('Selected salon service was not found.');

    var artist = ARTISTS.find(function (a) { return a.id === payload.artistId; }) || ARTISTS[0];

    var conflict = db.appointments.find(function (a) {
      return (
        a.date === payload.date &&
        a.timeSlot === payload.timeSlot &&
        a.artistId === artist.id &&
        a.status !== 'Cancelled'
      );
    });
    if (conflict) {
      throw new Error(artist.name + ' is already booked on ' + payload.date + ' at ' + payload.timeSlot + '. Please choose another slot.');
    }

    var discountAmount = 0;
    var appliedOfferCode = '';
    if (payload.offerCode && String(payload.offerCode).trim()) {
      var codeUpper = String(payload.offerCode).trim().toUpperCase();
      var offer = db.offers.find(function (o) {
        return o.code.toUpperCase() === codeUpper && o.active;
      });
      if (!offer) throw new Error('Promo code "' + codeUpper + '" is invalid or inactive.');
      if (offer.category !== 'All Services' && offer.category !== service.category) {
        throw new Error('Promo code "' + codeUpper + '" applies only to ' + offer.category + '.');
      }
      discountAmount = Math.round((service.price * offer.discountPercent) / 100);
      appliedOfferCode = offer.code;
    }

    var finalAmount = Math.max(0, service.price - discountAmount);
    var nowIso = new Date().toISOString();

    var customer = db.customers.find(function (c) { return c.phone === cleanPhone; });
    if (!customer) {
      customer = {
        id: makeId('cust'),
        name: cleanName,
        phone: cleanPhone,
        whatsappNumber: cleanWa,
        notes: String(payload.requirements || '').trim(),
        totalVisits: 0,
        totalSpent: 0,
        createdAt: nowIso
      };
      db.customers.push(customer);
    } else {
      customer.name = cleanName;
      customer.whatsappNumber = cleanWa;
    }

    var bookingCode = 'PM-' + (2605 + db.appointments.length);
    var appointmentId = makeId('apt');

    var appointment = {
      id: appointmentId,
      bookingCode: bookingCode,
      customerId: customer.id,
      customerName: cleanName,
      customerPhone: cleanPhone,
      whatsappNumber: cleanWa,
      serviceId: service.id,
      serviceName: service.name,
      serviceCategory: service.category,
      price: service.price,
      discountAmount: discountAmount,
      finalAmount: finalAmount,
      offerCode: appliedOfferCode,
      durationMinutes: service.durationMinutes,
      artistId: artist.id,
      artistName: artist.name,
      date: payload.date,
      timeSlot: payload.timeSlot,
      requirements: String(payload.requirements || '').trim(),
      status: 'Pending',
      prepNote: 'Scheduled ' + service.name + ' (' + service.durationMinutes + ' min) with ' + artist.name + '. Arrive 10 minutes early for your skin & styling consultation.',
      createdAt: nowIso
    };
    db.appointments.unshift(appointment);

    var method = payload.paymentMethod === 'UPI' || payload.paymentMethod === 'Online' ? payload.paymentMethod : 'Cash';
    var payment = {
      id: makeId('pay'),
      receiptNumber: 'RCP-' + bookingCode,
      appointmentId: appointmentId,
      bookingCode: bookingCode,
      customerId: customer.id,
      customerName: cleanName,
      customerPhone: cleanPhone,
      serviceName: service.name,
      amount: service.price,
      discountAmount: discountAmount,
      finalAmount: finalAmount,
      offerCode: appliedOfferCode,
      method: method,
      status: 'Unpaid',
      transactionRef: '',
      createdAt: nowIso
    };
    db.payments.unshift(payment);

    var waText = 'Namaste ' + cleanName + '! Your booking ' + bookingCode + ' at Pratiksha Makeover (Jalgaon) for ' + service.name + ' on ' + payload.date + ' at ' + payload.timeSlot + ' with ' + artist.name + ' is received. Payable: ' + formatINR(finalAmount) + '.';
    var notification = {
      id: makeId('notif'),
      recipientRole: 'customer',
      appointmentId: appointmentId,
      bookingCode: bookingCode,
      type: 'confirmation',
      title: 'Booking Received · ' + bookingCode,
      message: 'Your request for ' + service.name + ' on ' + payload.date + ' at ' + payload.timeSlot + ' with ' + artist.name + ' is saved.',
      whatsappUrl: buildWhatsAppUrl(SALON_INFO.whatsappDigits, waText),
      createdAt: nowIso
    };
    db.notifications.unshift(notification);

    saveDb(db);
    saveRecentBooking(bookingCode, cleanPhone);

    return { appointment: appointment, payment: payment, notification: notification };
  }

  function lookupBookings(query) {
    var clean = String(query || '').trim();
    if (!clean) return { appointments: [], payments: [], notifications: [] };
    var upper = clean.toUpperCase();
    var digits = clean.replace(/\D/g, '');
    var db = loadDb();

    var appointments = db.appointments.filter(function (a) {
      if (a.bookingCode.toUpperCase() === upper) return true;
      if (digits.length >= 10) {
        var tail = digits.slice(-10);
        if (a.customerPhone.slice(-10) === tail || (a.whatsappNumber && a.whatsappNumber.slice(-10) === tail)) {
          return true;
        }
      }
      return false;
    });

    var ids = appointments.map(function (a) { return a.id; });
    var payments = db.payments.filter(function (p) { return ids.indexOf(p.appointmentId) !== -1; });
    var notifications = db.notifications.filter(function (n) { return ids.indexOf(n.appointmentId) !== -1; });

    return { appointments: appointments, payments: payments, notifications: notifications };
  }

  function updateAppointment(id, updates, isAdmin) {
    var db = loadDb();
    var apt = db.appointments.find(function (a) { return a.id === id; });
    if (!apt) throw new Error('Appointment not found.');

    var nextDate = updates.date || apt.date;
    var nextSlot = updates.timeSlot || apt.timeSlot;
    var nextArtist = updates.artistId ? ARTISTS.find(function (ar) { return ar.id === updates.artistId; }) : null;
    var nextArtistId = nextArtist ? nextArtist.id : apt.artistId;
    var nextArtistName = nextArtist ? nextArtist.name : apt.artistName;

    var rescheduling = nextDate !== apt.date || nextSlot !== apt.timeSlot || nextArtistId !== apt.artistId;
    if (rescheduling && updates.status !== 'Cancelled') {
      var conflict = db.appointments.find(function (other) {
        return (
          other.id !== apt.id &&
          other.date === nextDate &&
          other.timeSlot === nextSlot &&
          other.artistId === nextArtistId &&
          other.status !== 'Cancelled'
        );
      });
      if (conflict) {
        throw new Error(nextArtistName + ' is already booked on ' + nextDate + ' at ' + nextSlot + '.');
      }
      apt.date = nextDate;
      apt.timeSlot = nextSlot;
      apt.artistId = nextArtistId;
      apt.artistName = nextArtistName;
    }

    if (typeof updates.requirements === 'string') {
      apt.requirements = updates.requirements.trim();
    }

    var prevStatus = apt.status;
    if (updates.status) {
      if (!isAdmin && updates.status !== 'Cancelled') {
        throw new Error('Only admin can confirm or complete appointments.');
      }
      apt.status = updates.status;
    }

    if (apt.status === 'Completed' && prevStatus !== 'Completed') {
      var cust = db.customers.find(function (c) { return c.id === apt.customerId; });
      if (cust) {
        cust.totalVisits += 1;
        cust.lastVisit = apt.date;
      }
    }

    if (apt.status !== prevStatus || rescheduling) {
      var notifMsg = 'Your ' + apt.serviceName + ' appointment (' + apt.bookingCode + ') is ' + apt.status + ' for ' + apt.date + ' at ' + apt.timeSlot + '.';
      db.notifications.unshift({
        id: makeId('notif'),
        recipientRole: 'customer',
        appointmentId: apt.id,
        bookingCode: apt.bookingCode,
        type: apt.status === 'Cancelled' ? 'cancellation' : 'confirmation',
        title: 'Appointment ' + apt.status + ' · ' + apt.bookingCode,
        message: notifMsg,
        whatsappUrl: buildWhatsAppUrl(apt.whatsappNumber || apt.customerPhone, 'Namaste ' + apt.customerName + '! ' + notifMsg + ' - Pratiksha Makeover, Jalgaon'),
        createdAt: new Date().toISOString()
      });
    }

    saveDb(db);
    return apt;
  }

  function confirmPayment(paymentId, method, transactionRef, gatewayVerified, isAdmin) {
    var db = loadDb();
    var pay = db.payments.find(function (p) { return p.id === paymentId; });
    if (!pay) throw new Error('Payment record not found.');

    var chosenMethod = method || pay.method;
    if (!isAdmin && chosenMethod === 'Cash') {
      throw new Error('Cash payments are confirmed by the salon administrator upon payment at desk.');
    }
    if (!isAdmin && (chosenMethod === 'UPI' || chosenMethod === 'Online')) {
      var ref = String(transactionRef || '').trim();
      if (ref.length < 6 || !gatewayVerified) {
        throw new Error('Payment confirmation not received. Enter a 6+ character reference ID and check the confirmation box.');
      }
      pay.transactionRef = ref;
    } else if (transactionRef && String(transactionRef).trim()) {
      pay.transactionRef = String(transactionRef).trim();
    }

    if (pay.status !== 'Paid') {
      pay.method = chosenMethod;
      pay.status = 'Paid';
      pay.confirmedAt = new Date().toISOString();
      var cust = db.customers.find(function (c) { return c.id === pay.customerId; });
      if (cust) cust.totalSpent += pay.finalAmount;
    }

    saveDb(db);
    return pay;
  }

  function adminLogin(email, password) {
    var cleanEmail = String(email || '').trim().toLowerCase();
    var match = ADMIN_ACCOUNTS.find(function (acc) {
      return acc.email.toLowerCase() === cleanEmail && acc.pass === password;
    });
    if (!match) {
      throw new Error('Invalid administrator email or password.');
    }
    var session = { email: match.email, name: match.name, loggedInAt: new Date().toISOString() };
    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    return session;
  }

  function getAdminSession() {
    try {
      var raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function adminLogout() {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  }

  function getAdminOverview() {
    var db = loadDb();
    var today = getTodayIso();
    var paidRev = db.payments.filter(function (p) { return p.status === 'Paid'; }).reduce(function (s, p) { return s + p.finalAmount; }, 0);
    var pendingRev = db.payments.filter(function (p) { return p.status !== 'Paid'; }).reduce(function (s, p) { return s + p.finalAmount; }, 0);

    return {
      totalAppointments: db.appointments.length,
      todaysAppointments: db.appointments.filter(function (a) { return a.date === today; }).length,
      pendingBookings: db.appointments.filter(function (a) { return a.status === 'Pending'; }).length,
      confirmedBookings: db.appointments.filter(function (a) { return a.status === 'Confirmed'; }).length,
      completedAppointments: db.appointments.filter(function (a) { return a.status === 'Completed'; }).length,
      cancelledAppointments: db.appointments.filter(function (a) { return a.status === 'Cancelled'; }).length,
      totalCustomers: db.customers.length,
      paidRevenue: paidRev,
      pendingRevenue: pendingRev
    };
  }

  function saveService(serviceObj) {
    var db = loadDb();
    if (serviceObj.id) {
      var idx = db.services.findIndex(function (s) { return s.id === serviceObj.id; });
      if (idx !== -1) {
        db.services[idx] = Object.assign({}, db.services[idx], serviceObj);
      }
    } else {
      db.services.push(Object.assign({ id: makeId('srv'), active: true }, serviceObj));
    }
    saveDb(db);
  }

  function deleteService(id) {
    var db = loadDb();
    db.services = db.services.filter(function (s) { return s.id !== id; });
    saveDb(db);
  }

  function saveOffer(offerObj) {
    var db = loadDb();
    var code = String(offerObj.code || '').trim().toUpperCase();
    if (!code || !offerObj.title) throw new Error('Offer code and title are required.');
    if (db.offers.some(function (o) { return o.code.toUpperCase() === code; })) {
      throw new Error('Offer code "' + code + '" already exists.');
    }
    db.offers.unshift({
      id: makeId('off'),
      code: code,
      title: String(offerObj.title).trim(),
      description: String(offerObj.description || '').trim(),
      discountPercent: Math.min(75, Math.max(1, Number(offerObj.discountPercent || 10))),
      category: offerObj.category || 'All Services',
      validUntil: '2026-12-31',
      active: true
    });
    saveDb(db);
  }

  function toggleOffer(id) {
    var db = loadDb();
    var offer = db.offers.find(function (o) { return o.id === id; });
    if (offer) offer.active = !offer.active;
    saveDb(db);
  }

  function deleteOffer(id) {
    var db = loadDb();
    db.offers = db.offers.filter(function (o) { return o.id !== id; });
    saveDb(db);
  }

  function updateCustomer(id, fields) {
    var db = loadDb();
    var cust = db.customers.find(function (c) { return c.id === id; });
    if (!cust) throw new Error('Customer not found.');
    if (fields.name) cust.name = fields.name.trim();
    if (fields.phone) cust.phone = fields.phone.replace(/\D/g, '');
    if (typeof fields.notes === 'string') cust.notes = fields.notes.trim();
    saveDb(db);
    return cust;
  }

  function createReview(payload) {
    var name = String(payload.customerName || '').trim();
    var comment = String(payload.comment || '').trim();
    if (name.length < 2 || comment.length < 8) {
      throw new Error('Please enter your name and write a brief review.');
    }
    var db = loadDb();
    var rev = {
      id: makeId('rev'),
      customerName: name,
      serviceName: payload.serviceName || 'Bridal Makeup',
      rating: Math.min(5, Math.max(1, Number(payload.rating || 5))),
      comment: comment,
      outcomeNote: String(payload.outcomeNote || 'Salon guest visit').trim(),
      date: getTodayIso()
    };
    db.reviews.unshift(rev);
    saveDb(db);
    return rev;
  }

  function sendReminderNotification(appointmentId) {
    var db = loadDb();
    var apt = db.appointments.find(function (a) { return a.id === appointmentId; });
    if (!apt) throw new Error('Appointment not found.');
    var msg = 'Reminder: Your ' + apt.serviceName + ' appointment (' + apt.bookingCode + ') at Pratiksha Makeover, Jalgaon is on ' + apt.date + ' at ' + apt.timeSlot + ' with ' + apt.artistName + '.';
    var notif = {
      id: makeId('notif'),
      recipientRole: 'customer',
      appointmentId: apt.id,
      bookingCode: apt.bookingCode,
      type: 'reminder',
      title: 'Appointment Reminder · ' + apt.bookingCode,
      message: msg,
      whatsappUrl: buildWhatsAppUrl(apt.whatsappNumber || apt.customerPhone, 'Namaste ' + apt.customerName + '! ' + msg),
      createdAt: new Date().toISOString()
    };
    db.notifications.unshift(notif);
    saveDb(db);
    return notif;
  }

  global.SalonDB = {
    SALON_INFO: SALON_INFO,
    SERVICE_CATEGORIES: SERVICE_CATEGORIES,
    TIME_SLOTS: TIME_SLOTS,
    ARTISTS: ARTISTS,
    USE_FIRESTORE: USE_FIRESTORE,
    FIREBASE_CONFIG: FIREBASE_CONFIG,
    getTodayIso: getTodayIso,
    formatINR: formatINR,
    buildWhatsAppUrl: buildWhatsAppUrl,
    loadDb: loadDb,
    saveDb: saveDb,
    getSlotAvailability: getSlotAvailability,
    getRecentBookings: getRecentBookings,
    createAppointment: createAppointment,
    lookupBookings: lookupBookings,
    updateAppointment: updateAppointment,
    confirmPayment: confirmPayment,
    adminLogin: adminLogin,
    getAdminSession: getAdminSession,
    adminLogout: adminLogout,
    getAdminOverview: getAdminOverview,
    saveService: saveService,
    deleteService: deleteService,
    saveOffer: saveOffer,
    toggleOffer: toggleOffer,
    deleteOffer: deleteOffer,
    updateCustomer: updateCustomer,
    createReview: createReview,
    sendReminderNotification: sendReminderNotification
  };
})(window);
