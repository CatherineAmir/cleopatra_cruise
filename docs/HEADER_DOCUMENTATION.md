# Cleopatra Cruise - New Header Documentation

## Overview
The header has been completely redesigned with modern features inspired by https://cleopatracruise.com/, including:

1. **Hero Carousel Section** - Desktop-only auto-scrolling carousel of property images
2. **Shrinking Navbar** - Responsive navbar that shrinks on scroll
3. **Mobile Burger Menu** - Clean hamburger menu with animated icon
4. **Luxury Design** - Gold accents, sophisticated typography, and smooth animations

---

## Features

### 1. Hero Carousel Section (Desktop Only)

**Display:** Desktop screens only (hidden on tablets/mobile)

**Dimensions:**
- Height: 500px
- Full width
- Auto-scrolling every 5 seconds

**Components:**
- **Carousel Track**: Horizontally scrolling image slides
- **Navigation Buttons**: Previous/Next arrow buttons
- **Indicators**: Dot indicators at the bottom showing current slide
- **Overlay Text**: Title and description overlay at the bottom

**Features:**
- ✅ Auto-scrolls every 5 seconds
- ✅ Pauses on hover
- ✅ Manual navigation with arrow buttons
- ✅ Click indicators to jump to specific slide
- ✅ Smooth transitions (0.6s cubic-bezier)
- ✅ Hover zoom effect on images

**Images:**
Currently configured to use:
- `/cleopatra_cruise/static/src/img/carousel-1.jpg`
- `/cleopatra_cruise/static/src/img/carousel-2.jpg`
- `/cleopatra_cruise/static/src/img/carousel-3.jpg`

To use property images from your Odoo database, modify the JavaScript in `header.xml` to fetch from your Property model API.

### 2. Sticky & Shrinking Navbar

**Behavior:**
- **Normal State**: Full height (80px) with full-size logo and navigation
- **Scrolled State**: Shrinks to 60px on scroll down
- **Stays Fixed**: Always visible at top of page

**Shrink Trigger:** Scrolls down 100px

**Animation Duration:** 0.4s ease transition

**Changes on Shrink:**
- Navbar height: 80px → 60px
- Logo size: Scales down to ~85%
- Logo image: 56px → 40px
- Nav links: Font size reduced
- Button size: Slightly smaller

### 3. Mobile Burger Menu

**Trigger:** Screen width < 992px (Bootstrap lg breakpoint)

**Style:** 
- Three horizontal gold bars
- Animated X on click
- Smooth transitions

**Collapse Menu Animation:**
- Bar 1: Rotates 45° and moves down
- Bar 2: Fades out
- Bar 3: Rotates -45° and moves up

### 4. Navigation Structure

```
Home
├── About Us
│   ├── Our Story
│   ├── Our Team
│   ├── Why Choose Us
│   └── Awards & Recognition
├── Our Cruises
│   ├── Nile Cruise
│   ├── Lake Nasser Cruise
│   ├── Felucca Sailing
│   ├── Dahabiya Cruise
│   └── Our Fleet
├── Tours & Excursions
│   ├── Luxor Tours
│   ├── Aswan Tours
│   ├── Abu Simbel
│   ├── Valley of the Kings
│   └── Karnak Temple
├── Destinations
│   ├── Luxor
│   ├── Aswan
│   ├── Edfu
│   └── Kom Ombo
├── Gallery
└── Contact
```

**CTA Button:** "Book Now" - Leads to `/booking`

---

## Color Palette

All colors are defined as CSS variables in `:root`:

```css
--cleo-gold:       #C8973A      /* Main gold accent */
--cleo-gold-light: #E6B96A      /* Lighter gold for highlights */
--cleo-gold-dark:  #9A6F22      /* Darker gold for borders */
--cleo-dark:       #0F0F0F      /* Very dark background */
--cleo-dark-2:     #1A1410      /* Dark brown */
--cleo-dark-3:     #261E14      /* Darker brown */
--cleo-text:       #F5EDD8      /* Light cream text */
--cleo-text-muted: #A89070      /* Muted brownish text */
--cleo-border:     rgba(200, 151, 58, 0.25)  /* Border color */
--cleo-shadow:     0 4px 30px rgba(0, 0, 0, 0.6)  /* Box shadow */
```

---

## Typography

**Font Family:** 'Cinzel', 'Trajan Pro', 'Times New Roman', serif

**Logo:**
- Main: 1.55rem, 700 weight, 0.18em letter-spacing
- Subtitle: 0.58rem, 400 weight, 0.35em letter-spacing

**Hero Title:**
- Size: 3rem
- Weight: 700
- Letter-spacing: 0.15em

**Hero Description:**
- Size: 1.1rem
- Weight: 300
- Letter-spacing: 0.1em

**Navigation Links:**
- Size: 0.78rem (0.7rem on mobile)
- Weight: 600
- Letter-spacing: 0.12em
- Text-transform: uppercase

---

## Responsive Breakpoints

### Desktop (≥992px)
- ✅ Hero carousel visible
- ✅ Full navigation menu
- ✅ Full logo
- ✅ Navbar shrink on scroll

### Tablet (768px - 991.98px)
- ❌ Hero carousel hidden
- ✅ Hamburger menu
- ✅ Navbar minimal

### Small Mobile (<576px)
- ❌ Hero carousel hidden
- ✅ Hamburger menu
- ⚠️ Logo text hidden (icon only)
- ✅ Compact navigation

---

## Customization

### Change Carousel Images
Edit the `slides` array in the JavaScript section of `header.xml`:

```javascript
const slides = [
    {
        image: '/path/to/image.jpg',
        title: 'Slide Title',
        description: 'Slide Description'
    },
    // ... more slides
];
```

### Change Carousel Auto-Scroll Speed
In `header.xml`, find `setInterval(nextSlide, 5000)` and change 5000 (milliseconds) to desired value.

### Change Hero Carousel Height
In `header.css`, modify:
```css
.cleopatra-hero-carousel {
    height: 500px;  /* Change this value */
}
```

### Change Shrink Trigger
In JavaScript section of `header.xml`, modify:
```javascript
if (window.scrollY > 100) {  // Change 100 to desired pixels
```

### Change Navbar Shrink Height
In `header.css`:
```css
:root {
    --nav-height-shrink: 60px;  /* Change this */
}
```

---

## Integration with Property Model

To display actual property images instead of static placeholders:

1. **Update the backend API call** in JavaScript to fetch from your Property model
2. **Example** (modify the `initCarousel` function):

```javascript
// Fetch properties from API
fetch('/api/property/list')
    .then(res => res.json())
    .then(properties => {
        const slides = properties.map(prop => ({
            image: prop.image_url,
            title: prop.name,
            description: prop.description
        }));
        // Initialize carousel with fetched data
    });
```

---

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## Performance Notes

- Uses CSS transitions for smooth animations (GPU-accelerated)
- No external carousel libraries (vanilla JS)
- Lightweight CSS (~400 lines)
- Optimized for mobile (hero carousel hidden)
- Lazy-load images if needed (add loading="lazy" to img tags)

---

## Files Modified

1. **`templates/header.xml`** - Main header template with carousel and navbar
2. **`static/src/css/header.css`** - Complete header styling with responsive design

---

## Future Enhancements

Consider adding:
- [ ] Image lazy loading
- [ ] Touch/swipe gestures for mobile carousel
- [ ] API integration for dynamic property images
- [ ] Accessibility improvements (ARIA labels)
- [ ] Dark/light mode toggle
- [ ] Search functionality in navbar
- [ ] Mega menu for dropdown navigation

---

## Support

For issues or questions about the header, check:
1. Browser console for JavaScript errors
2. CSS cascade and specificity
3. Responsive breakpoints
4. Image file paths

