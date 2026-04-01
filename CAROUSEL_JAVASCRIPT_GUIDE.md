# Carousel JavaScript Behavior Guide

## How the Carousel Works

### 1. Initialization on Page Load

```javascript
document.addEventListener('DOMContentLoaded', function() {
    // Waits for all DOM elements to load
    // Then initializes the carousel
```

### 2. Slide Data Structure

```javascript
const slides = [
    {
        image: '/cleopatra_cruise/static/src/img/carousel-1.jpg',
        title: 'Luxury Nile Cruises',
        description: 'Experience the magic of Egypt\'s most iconic river'
    },
    {
        image: '/cleopatra_cruise/static/src/img/carousel-2.jpg',
        title: 'Premium Cabins',
        description: 'Elegantly designed suites with breathtaking river views'
    },
    {
        image: '/cleopatra_cruise/static/src/img/carousel-3.jpg',
        title: 'Ancient Wonders',
        description: 'Discover temples, tombs, and archaeological marvels'
    }
];
```

### 3. State Variables

```javascript
let currentIndex = 0;              // Current slide index (0, 1, 2)
let autoScrollInterval;            // ID of auto-scroll timer
```

### 4. DOM Elements Referenced

```javascript
const carousel = document.getElementById('heroCarousel');           // Main container
const carouselTrack = document.getElementById('carouselTrack');     // Slides container
const carouselIndicators = document.getElementById('carouselIndicators');  // Dots
const prevBtn = document.getElementById('carouselPrev');            // Previous button
const nextBtn = document.getElementById('carouselNext');            // Next button
const heroTitle = document.getElementById('heroTitle');             // Title text
const heroDescription = document.getElementById('heroDescription'); // Description text
```

---

## Function Behaviors

### `initCarousel()`
**What it does:** Sets up the carousel on page load

**Steps:**
1. Loop through each slide in `slides` array
2. For each slide:
   - Create a `<div class="hero-carousel-slide">`
   - Add `<img>` with slide image
   - Append to `carouselTrack`
3. For each slide:
   - Create indicator dot button
   - Set as active if index === 0
   - Add click handler to jump to that slide
   - Append to `carouselIndicators`
4. Call `startAutoScroll()`

**HTML Generated:**
```html
<!-- In carouselTrack -->
<div class="hero-carousel-slide">
    <img src="/cleopatra_cruise/static/src/img/carousel-1.jpg" alt="Slide 1">
</div>
<div class="hero-carousel-slide">
    <img src="/cleopatra_cruise/static/src/img/carousel-2.jpg" alt="Slide 2">
</div>
<!-- etc -->

<!-- In carouselIndicators -->
<button class="hero-indicator active" data-slide="0"></button>
<button class="hero-indicator" data-slide="1"></button>
<button class="hero-indicator" data-slide="2"></button>
```

### `updateCarousel()`
**What it does:** Updates visual display when slide changes

**Steps:**
1. Calculate offset: `offset = -currentIndex * 100` (%)
   - Slide 0: translateX(0%)     → Shows slide 0
   - Slide 1: translateX(-100%)  → Shows slide 1
   - Slide 2: translateX(-200%)  → Shows slide 2
2. Apply transform: `carouselTrack.style.transform = translateX(offset%)`
3. Update indicators:
   - Remove "active" class from all
   - Add "active" class to current index
4. Update text content:
   - `heroTitle.textContent = slides[currentIndex].title`
   - `heroDescription.textContent = slides[currentIndex].description`

### `nextSlide()`
**What it does:** Move to next slide

```javascript
function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    // Example: if currentIndex=2, then (2 + 1) % 3 = 0 (wraps to first)
    updateCarousel();
    resetAutoScroll();  // Restart the 5s timer
}
```

### `prevSlide()`
**What it does:** Move to previous slide

```javascript
function prevSlide() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    // Example: if currentIndex=0, then (0 - 1 + 3) % 3 = 2 (wraps to last)
    updateCarousel();
    resetAutoScroll();  // Restart the 5s timer
}
```

### `goToSlide(index)`
**What it does:** Jump to specific slide by indicator click

```javascript
function goToSlide(index) {
    currentIndex = index % slides.length;  // Validate index
    updateCarousel();
    resetAutoScroll();  // Restart timer
}
```

### `startAutoScroll()`
**What it does:** Start 5-second auto-advance timer

```javascript
function startAutoScroll() {
    autoScrollInterval = setInterval(nextSlide, 5000);
    // Calls nextSlide() every 5000 milliseconds (5 seconds)
}
```

### `resetAutoScroll()`
**What it does:** Restart the auto-scroll timer

```javascript
function resetAutoScroll() {
    clearInterval(autoScrollInterval);  // Cancel existing timer
    startAutoScroll();                  // Start new timer
}
```

---

## Event Listeners

### Carousel Navigation
```javascript
prevBtn.addEventListener('click', prevSlide);
nextBtn.addEventListener('click', nextSlide);
```
User clicks Previous/Next button → Calls `prevSlide()` or `nextSlide()`

### Indicator Dots
```javascript
indicator.onclick = () => goToSlide(index);
```
User clicks indicator → Jumps to that slide

### Hover to Pause
```javascript
carousel.addEventListener('mouseenter', () => clearInterval(autoScrollInterval));
```
When mouse enters carousel → Timer pauses

### Resume on Mouse Leave
```javascript
carousel.addEventListener('mouseleave', startAutoScroll);
```
When mouse leaves carousel → Timer resumes

### Window Scroll
```javascript
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('mainNavbar');
    if (window.scrollY > 100) {
        navbar.classList.add('shrink');    // Shrink navbar
    } else {
        navbar.classList.remove('shrink');  // Restore navbar
    }
});
```
User scrolls down 100px+ → Navbar shrinks

---

## Example Scenario: User Interaction

### Scenario 1: Auto-Advance (No User Action)

```
Time    Event                   currentIndex    Display
─────────────────────────────────────────────────────
0s      Page loads              0               Slide 1 visible
        initCarousel() runs
        startAutoScroll() starts

5s      Timer fires             1               Slides to Slide 2
        nextSlide() called       1               (0.6s transition)

10s     Timer fires             2               Slides to Slide 3
        nextSlide() called       2               (0.6s transition)

15s     Timer fires             0               Slides back to Slide 1
        nextSlide() called       0               (wraps around, 0.6s transition)
        (pattern repeats)
```

### Scenario 2: User Clicks Next Button

```
Time    Event                           currentIndex    Display
─────────────────────────────────────────────────────────────────
5.2s    Auto-scroll fires               1               Showing Slide 2
        nextSlide() called

5.3s    User clicks Next button         2               Slides to Slide 3
        nextSlide() called
        resetAutoScroll() called         2
        ⚠️ Timer is RESET (restarts)

10.3s   Timer fires again               0               Slides back to Slide 1
        nextSlide() called               0
```

### Scenario 3: User Hovers During Auto-Scroll

```
Time    Event                           currentIndex    Display
─────────────────────────────────────────────────────────────────
3s      Auto-scroll timer active        1               Showing Slide 2

4s      User hovers over carousel       1               Showing Slide 2
        mouseenter event fires           1               ⏸️ PAUSED
        clearInterval() called
        ⚠️ Timer is STOPPED

6s      Timer would have fired          1               Showing Slide 2
        ❌ Timer disabled - no change    1               (no auto-advance)

7s      User moves mouse away           1               Showing Slide 2
        mouseleave event fires           1               ▶️ RESUMED
        startAutoScroll() called
        ✅ New 5s timer started

12s     New timer fires                 2               Slides to Slide 3
        nextSlide() called               2
```

---

## CSS Transform Behavior

### How Slides Move

The carousel uses CSS `transform: translateX()` for smooth movement:

```
Carousel width: 100% (full width)
Each slide width: 100%
Track contains: 3 slides (300% total width)

Visual representation:

Track:  [Slide 1] [Slide 2] [Slide 3]
         100%      100%      100%
        ←────────────────────────→
         300% total width

Position tracking:
- currentIndex = 0: translateX(0%)     ← Slide 1 visible in window
- currentIndex = 1: translateX(-100%)  ← Slide 2 visible in window  
- currentIndex = 2: translateX(-200%)  ← Slide 3 visible in window
```

### Transition Animation

```javascript
transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
```

**Timing Function:** `cubic-bezier(0.4, 0, 0.2, 1)`
- Starts: Slow acceleration
- Middle: Quick movement
- End: Slight deceleration
- Effect: Smooth, elegant slide

---

## Text Content Update

When slide changes, three things happen:

1. **Image moves** via CSS transform (0.6s)
2. **Text fades** (implied - content changes)
3. **Indicators update** (active dot moves)

```javascript
// These happen instantly:
heroTitle.textContent = slides[currentIndex].title;
heroDescription.textContent = slides[currentIndex].description;
```

**Result:** New text appears as image slides into view

---

## Timer Management

### Why Reset Timer?

If user clicks Next at 4.8s (0.2s before auto-advance):
- **Without reset:** Auto-advance fires at 5s anyway
- **With reset:** Timer restarts from 0s, fires at 5.2s (more predictable)

This prevents "double-advances" and gives users better control.

---

## Performance Optimizations

1. **No External Libraries** - Vanilla JavaScript only
2. **CSS Transitions** - GPU-accelerated animations
3. **Event Delegation** - Minimal listener overhead
4. **Interval Management** - Properly clears timers to prevent memory leaks
5. **Lazy DOM Updates** - Only updates when necessary

---

## Troubleshooting Guide

### Carousel not advancing
- Check: Is `startAutoScroll()` being called?
- Check: Browser console for errors
- Check: Is `autoScrollInterval` being set?

### Text not updating
- Check: Are `heroTitle` and `heroDescription` elements present?
- Check: Element IDs match (`heroTitle`, `heroDescription`)
- Check: Browser console for DOM errors

### Clicking indicators does nothing
- Check: Are indicator buttons being created?
- Check: Is `onClick` handler attached?
- Check: Element class `hero-indicator`

### Navbar not shrinking
- Check: Is scroll event listener attached?
- Check: Are you scrolling > 100px?
- Check: CSS class `.shrink` exists in header.css
- Check: `mainNavbar` element ID exists

### Images not loading
- Check: Image paths are correct
- Check: Browser network tab for 404 errors
- Check: Images exist in `/cleopatra_cruise/static/src/img/`

---

## Future Enhancement Ideas

```javascript
// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
});

// Add touch swipe support
carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
});

carousel.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].clientX;
    if (touchEndX < touchStartX) nextSlide();
    if (touchEndX > touchStartX) prevSlide();
});

// Add indicator animation
carousel.addEventListener('transitionend', () => {
    // Add animation after slide completes
});
```

