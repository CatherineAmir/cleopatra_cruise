# Header Architecture Reference

## File Structure

```
cleopatra_cruise/
├── templates/
│   └── header.xml ...................... Main header template (313 lines)
│       ├── Hero carousel HTML
│       ├── Navbar HTML
│       └── JavaScript for carousel & shrink
│
├── static/src/css/
│   └── header.css ...................... All header styles (940 lines)
│       ├── Hero carousel styles
│       ├── Navbar styles
│       ├── Mobile/tablet styles
│       └── CSS variables
│
├── static/src/img/
│   ├── carousel-1.jpg .................. Placeholder images
│   ├── carousel-2.jpg
│   └── carousel-3.jpg
│
└── Documentation/
    ├── HEADER_DOCUMENTATION.md
    ├── HEADER_IMPLEMENTATION_SUMMARY.md
    ├── CAROUSEL_JAVASCRIPT_GUIDE.md
    └── IMPLEMENTATION_COMPLETE.md
```

---

## Component Hierarchy

```
<header id="top" class="cleopatra-header">
│
├─ <div class="cleopatra-hero-carousel">
│  ├─ <div class="hero-carousel-container">
│  │  ├─ <div class="hero-carousel-track" id="carouselTrack">
│  │  │  ├─ <div class="hero-carousel-slide">
│  │  │  │  └─ <img class="hero-carousel-image">
│  │  │  ├─ <div class="hero-carousel-slide">
│  │  │  │  └─ <img class="hero-carousel-image">
│  │  │  └─ <div class="hero-carousel-slide">
│  │  │     └─ <img class="hero-carousel-image">
│  │  │
│  │  ├─ <button class="hero-carousel-prev" id="carouselPrev">
│  │  ├─ <button class="hero-carousel-next" id="carouselNext">
│  │  │
│  │  ├─ <div class="hero-carousel-indicators" id="carouselIndicators">
│  │  │  ├─ <button class="hero-indicator active" data-slide="0">
│  │  │  ├─ <button class="hero-indicator" data-slide="1">
│  │  │  └─ <button class="hero-indicator" data-slide="2">
│  │  │
│  │  └─ <div class="hero-overlay">
│  │     └─ <div class="hero-content">
│  │        ├─ <h1 class="hero-title" id="heroTitle">
│  │        └─ <p class="hero-description" id="heroDescription">
│  │
│  └─ [CSS styling via .cleopatra-hero-carousel in header.css]
│
├─ <nav class="cleopatra-navbar navbar navbar-expand-lg" id="mainNavbar">
│  ├─ <div class="container-fluid">
│  │  ├─ <a class="navbar-brand cleopatra-logo">
│  │  │  └─ <img class="logo-img"> OR <span class="logo-text">
│  │  │
│  │  ├─ <button class="navbar-toggler cleopatra-toggler">
│  │  │  ├─ <span class="toggler-bar">
│  │  │  ├─ <span class="toggler-bar">
│  │  │  └─ <span class="toggler-bar">
│  │  │
│  │  └─ <div class="collapse navbar-collapse" id="cleopatraNav">
│  │     ├─ <ul class="navbar-nav">
│  │     │  ├─ <li class="nav-item">
│  │     │  │  └─ <a class="nav-link cleopatra-nav-link">Home</a>
│  │     │  │
│  │     │  ├─ <li class="nav-item dropdown">
│  │     │  │  ├─ <a class="nav-link cleopatra-nav-link dropdown-toggle">
│  │     │  │  │  About Us
│  │     │  │  └─ <ul class="dropdown-menu cleopatra-dropdown">
│  │     │  │     ├─ <li><a class="dropdown-item">Our Story</a>
│  │     │  │     ├─ <li><a class="dropdown-item">Our Team</a>
│  │     │  │     ├─ <li><a class="dropdown-item">Why Choose Us</a>
│  │     │  │     └─ <li><a class="dropdown-item">Awards</a>
│  │     │  │
│  │     │  └─ [More dropdowns...]
│  │     │
│  │     └─ <a class="btn cleopatra-btn-book">Book Now</a>
│  │
│  └─ [CSS styling + scroll listener JavaScript]
│
└─ <script type="text/javascript">
   ├─ initCarousel()
   ├─ updateCarousel()
   ├─ nextSlide()
   ├─ prevSlide()
   ├─ goToSlide()
   ├─ startAutoScroll()
   ├─ resetAutoScroll()
   └─ Event listeners for carousel + navbar scroll
```

---

## Data Flow

### 1. Page Load
```
DOMContentLoaded event fires
│
├─ initCarousel() executes
│  ├─ Loops through slides array
│  ├─ Creates slide HTML elements
│  ├─ Creates indicator dots
│  └─ Calls startAutoScroll()
│
├─ startAutoScroll() starts 5s timer
│  └─ Sets autoScrollInterval
│
└─ Scroll event listener added
   └─ Monitors window.scrollY
```

### 2. Auto-Advance (Every 5 seconds)
```
setInterval timer fires (5000ms)
│
└─ nextSlide() called
   ├─ Increment currentIndex
   ├─ updateCarousel() called
   │  ├─ Calculate transform offset
   │  ├─ Apply CSS transform
   │  ├─ Update indicator dots
   │  └─ Update title & description
   └─ resetAutoScroll() called
      ├─ Clear old timer
      └─ Start new 5s timer
```

### 3. User Click Next
```
User clicks nextBtn
│
└─ nextSlide() called (same as auto-advance)
   └─ resetAutoScroll() ensures timer restarts
```

### 4. User Hovers Carousel
```
mouseenter event fires
│
└─ clearInterval(autoScrollInterval)
   └─ Timer paused (no more auto-advances)
```

### 5. User Leaves Carousel
```
mouseleave event fires
│
└─ startAutoScroll() called
   └─ Timer resumes (5s countdown starts)
```

### 6. User Scrolls 100px
```
scroll event fires (repeatedly)
│
└─ Check window.scrollY > 100?
   ├─ YES: navbar.classList.add('shrink')
   │       ├─ Height: 80px → 60px
   │       ├─ Logo: scales down
   │       └─ Text: font-size reduced
   │
   └─ NO: navbar.classList.remove('shrink')
         └─ Restore to normal size
```

---

## CSS Cascade & Specificity

### Root Variables
```css
:root {
    --nav-height: 80px;
    --nav-height-shrink: 60px;
    --cleo-gold: #C8973A;
    /* ... 10 more variables */
}
```

### Main Classes
```css
.cleopatra-hero-carousel        /* 500px carousel container */
.cleopatra-navbar               /* Sticky navbar (80px) */
.cleopatra-navbar.shrink        /* Shrink state (60px) */
.hero-carousel-track            /* Flex container for slides */
.hero-carousel-slide            /* Individual slides */
.hero-indicator                 /* Indicator dots */
.hero-indicator.active          /* Active indicator */
.cleopatra-nav-link             /* Navigation links */
.cleopatra-nav-link:hover       /* Link hover state */
.cleopatra-dropdown             /* Dropdown menu */
.cleopatra-btn-book             /* CTA button */
```

### Responsive Breakpoints
```css
/* Desktop: ≥992px */
No special overrides needed

/* Tablet: 768px - 991.98px */
@media (max-width: 991.98px) {
    .cleopatra-hero-carousel { display: none !important; }
    #cleopatraNav { /* Mobile menu styles */ }
}

/* Small Mobile: <576px */
@media (max-width: 575.98px) {
    .logo-sub { display: none; }  /* Hide subtitle on small screen */
    .toggler-bar { width: 18px; }  /* Smaller hamburger */
}
```

---

## JavaScript State Management

### Global Variables
```javascript
let currentIndex = 0;              // Which slide is visible (0, 1, or 2)
let autoScrollInterval;            // ID of the setInterval timer
```

### Key Functions
```javascript
initCarousel()          // Initialize on page load
updateCarousel()        // Update display when slide changes
nextSlide()            // Move forward
prevSlide()            // Move backward
goToSlide(index)       // Jump to specific index
startAutoScroll()      // Start/restart 5s timer
resetAutoScroll()      // Clear and restart timer
```

### Event Handlers
```javascript
prevBtn.addEventListener('click', prevSlide)
nextBtn.addEventListener('click', nextSlide)
indicator.addEventListener('click', () => goToSlide(index))
carousel.addEventListener('mouseenter', () => clearInterval(...))
carousel.addEventListener('mouseleave', startAutoScroll)
window.addEventListener('scroll', () => { /* shrink logic */ })
```

---

## CSS Animation Definitions

### Carousel Slide Animation
```css
.hero-carousel-track {
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Image Hover Effect
```css
.hero-carousel-image {
    transition: transform 0.8s ease;
}
.hero-carousel-slide:hover .hero-carousel-image {
    transform: scale(1.05);
}
```

### Navbar Shrink
```css
.cleopatra-navbar {
    transition: all 0.4s ease;
}
```

### Button Hover
```css
.cleopatra-btn-book {
    transition: all 0.4s ease;
}
.cleopatra-btn-book:hover {
    transform: translateY(-2px);
}
```

### Navigation Link Underline
```css
.cleopatra-nav-link::after {
    transition: transform 0.3s ease;
    transform: scaleX(0);
}
.cleopatra-nav-link:hover::after {
    transform: scaleX(1);
}
```

---

## DOM Manipulation Pattern

### Creating Slides
```javascript
// For each slide in array:
const slideEl = document.createElement('div');
slideEl.className = 'hero-carousel-slide';
slideEl.innerHTML = `
    <img src="${slide.image}" alt="..." class="hero-carousel-image"/>
`;
carouselTrack.appendChild(slideEl);
```

### Creating Indicators
```javascript
// For each slide:
const indicator = document.createElement('button');
indicator.className = 'hero-indicator' + (index === 0 ? ' active' : '');
indicator.setAttribute('data-slide', index);
indicator.onclick = () => goToSlide(index);
carouselIndicators.appendChild(indicator);
```

### Updating Active Indicator
```javascript
document.querySelectorAll('.hero-indicator').forEach((ind, i) => {
    ind.classList.toggle('active', i === currentIndex);
});
```

### Applying Transform
```javascript
const offset = -currentIndex * 100;  // -0%, -100%, -200%
carouselTrack.style.transform = `translateX(${offset}%)`;
```

### Toggling Navbar Shrink
```javascript
if (window.scrollY > 100) {
    navbar.classList.add('shrink');      // Add shrink class
} else {
    navbar.classList.remove('shrink');   // Remove shrink class
}
```

---

## Performance Considerations

### Why CSS Transforms?
```
✅ GPU-accelerated
✅ Smooth 60fps animation
✅ Minimal layout recalculations
✅ No repaints needed
```

### Why Vanilla JavaScript?
```
✅ No external library overhead
✅ Smaller bundle size
✅ Faster initial load
✅ Easier to customize
```

### Optimization Opportunities
```
1. Lazy load carousel images
2. Compress images to <100KB each
3. Use WebP format with fallback
4. Minify CSS and JavaScript
5. Add image loading="lazy"
6. Cache static assets
7. Use CDN for images
8. Debounce scroll event
```

---

## Browser DevTools Debugging

### Check Carousel State
```javascript
// In Console:
currentIndex              // Which slide (0, 1, 2)
autoScrollInterval        // Timer ID
carouselTrack.style       // Current transform
document.querySelectorAll('.hero-indicator')  // All dots
```

### Monitor Shrink
```javascript
// In Console:
window.scrollY            // Current scroll position
document.getElementById('mainNavbar').className  // Check for 'shrink'
```

### Manual Slide Control
```javascript
// In Console:
nextSlide()               // Force next slide
prevSlide()               // Force previous slide
goToSlide(1)              // Go to slide index 1
```

### Check Active Elements
```javascript
// In Console:
document.querySelector('.hero-indicator.active')  // Active dot
document.getElementById('heroTitle').textContent   // Current title
```

---

## Integration Checklist

- [ ] Both files deployed (header.xml + header.css)
- [ ] Images added to `/static/src/img/`
- [ ] Browser cache cleared
- [ ] Carousel auto-scrolls on desktop
- [ ] Carousel hidden on mobile
- [ ] Navbar shrinks on scroll
- [ ] Burger menu opens/closes
- [ ] All links navigate
- [ ] Responsive on all devices
- [ ] No console errors

---

## Quick Reference Commands

```bash
# Clear cache and reload
Ctrl+Shift+Delete (browser cache)
Ctrl+F5 (page hard refresh)

# Open DevTools
F12 or Ctrl+Shift+I

# Console debugging
nextSlide()
prevSlide()
goToSlide(1)
window.scrollY

# Check elements
Ctrl+Shift+C (element inspector)
```

This structure ensures maintainability, performance, and easy customization!
