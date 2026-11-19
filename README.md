# Pratiksha Makeover – Smart Salon Management System

**Tagline:** *Your Beauty, Our Passion*  
**Location:** Pearl Plaza, Ring Road, Navi Peth, Jalgaon, Maharashtra, India  
**Tech Stack:** 100% Pure HTML5 + CSS3 + Vanilla JavaScript (zero React, TypeScript, Tailwind, Bootstrap, or Node.js runtime dependencies)

## Project Structure

```
Pratiksha-Makeover/
  index.html          # Salon homepage, artists, featured services, offers, reviews & Smart Concierge
  services.html       # Full 11-category searchable & filterable beauty service menu
  gallery.html        # Bridal, party glam, mehndi & facial lookbook with lightbox modal
  booking.html        # Login-free direct booking form, duplicate-slot prevention, My Bookings lookup & receipts
  admin.html          # Separate secure Admin Login + 7-tab Salon Management Dashboard
  css/
    style.css         # Ivory, beige, luxury rose-pink & champagne-gold CSS3 design system
    responsive.css    # Responsive rules for desktop, tablet & mobile
  js/
    firebase.js       # SalonDB data layer (localStorage persistence + optional Firestore config hook)
    main.js           # Shared nav drawer, Smart Salon Concierge, home/services/gallery logic
    booking.js        # Direct guest booking, double-booking guard, reschedule/cancel & verified payments
    admin.js          # Admin authentication, 8 KPIs, calendar matrix, CRUD & CSV reports
  images/             # Salon photography assets
  README.md
```

## Running in Visual Studio Code (Live Server)

1. Extract `Pratiksha-Makeover.zip` or open the `Pratiksha-Makeover/` folder in **Visual Studio Code**.
2. Install the **Live Server** extension (`ritwickdey.LiveServer`).
3. Right-click `index.html` and choose **Open with Live Server**.
4. Everything works immediately with realistic Jalgaon salon data saved in browser `localStorage` (`pm_vanilla_salon_db_v1`).

## Admin Dashboard Access

- **Admin URL:** `admin.html`
- **Email:** `admin@pratikshamakeover.in` (or `wanipratiksha24@gmail.com`)
- **Password:** `Admin@123`
- Customers **never** need to register or log in to book, view, reschedule, or cancel appointments.

## Optional Online Firebase Firestore Setup

By default, `js/firebase.js` runs offline/locally using `localStorage` so no API keys or internet setup are required in VS Code Live Server. To attach your own Firebase project later, set `USE_FIRESTORE = true` and fill `FIREBASE_CONFIG` inside `js/firebase.js`.
