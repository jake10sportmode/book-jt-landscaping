# JT Landscaping — Online Booking & Scheduling Website

A modern, premium booking website for **JT Landscaping** where customers can browse lawn care and landscaping services, schedule appointments with their home address, and you (the admin) can manage everything from a built-in dashboard.

![JT Landscaping](https://img.shields.io/badge/JT%20Landscaping-Online%20Booking-10b981?style=for-the-badge)

## ✨ Features

### For Customers
- **Browse Services** — View all available services with descriptions, prices, and durations
- **Easy Booking** — Select a service → pick a date → choose a time → enter details → confirm
- **Real-time Availability** — Calendar shows available days and time slots
- **Instant Confirmation** — Get a booking confirmation immediately

### For Admins
- **Service Management** — Add, edit, and delete services (name, price, duration, category, icon, color)
- **Booking Dashboard** — View all bookings, see today's appointments, track revenue
- **Cancel Bookings** — Cancel any confirmed booking with one click
- **Stats Overview** — Quick stats for total services, upcoming bookings, and revenue

## 🚀 Quick Start

### Option 1: Just Open It
Simply open `index.html` in your browser. That's it!

```bash
open index.html
```

### Option 2: Use a Local Server
For the best experience, use a simple HTTP server:

```bash
# Python
python3 -m http.server 8000

# Node.js
npx serve .
```

Then visit `http://localhost:8000`

### Option 3: Deploy to GitHub Pages
1. Push this folder to a GitHub repository
2. Go to **Settings → Pages**
3. Set source to **main branch** / root
4. Your site will be live at `https://yourusername.github.io/your-repo/`

## 🔐 Admin Access

- Navigate to the **Admin** tab
- Enter your admin password to log in and manage services, bookings, and email notification settings.

## 📁 Project Structure

```
bookpro/
├── index.html          # Main entry point
├── css/
│   └── styles.css      # Complete design system (1400+ lines)
├── js/
│   ├── services.js     # Service CRUD with localStorage
│   ├── booking.js      # Booking flow & calendar logic
│   ├── admin.js        # Admin panel & dashboard
│   └── app.js          # Main app controller & routing
└── README.md           # This file
```

## 🎨 Design

- **Dark mode** with glassmorphism cards
- **Gradient accents** (indigo → violet)
- **Smooth animations** and hover effects
- **Fully responsive** (mobile, tablet, desktop)
- **Google Fonts** (Inter)

## 💾 Data Storage

All data is stored in your browser's **localStorage**:
- `bookpro_services` — Your services
- `bookpro_bookings` — Customer bookings

> **Note:** Data persists in your browser but isn't shared across devices. Clear localStorage to reset all data.

## 🛠 Customization

- **Business Name**: Edit the brand text in `index.html`
- **Business Hours**: Change `businessHours` in `js/booking.js`
- **Colors**: Update CSS variables in `css/styles.css`
- **Default Services**: Modify the seed data in `js/services.js`

## License

MIT — Use it however you'd like!
