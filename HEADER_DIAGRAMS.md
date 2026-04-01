# Header Component Diagrams

## 1. Overall Header Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLEOPATRA CRUISE HEADER                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                 HERO CAROUSEL (500px)                     │  │
│  │                                                            │  │
│  │          ◀ ┌─────────────────────────────┐ ▶             │  │
│  │            │  Beautiful Property Image   │               │  │
│  │            │       (Auto-scrolling)      │               │  │
│  │            │                             │               │  │
│  │            │     Fade to next image      │               │  │
│  │            │    Every 5 seconds auto    │               │  │
│  │            └─────────────────────────────┘               │  │
│  │                                                            │  │
│  │                  🔘 🔘 🔘  (Indicators)                  │  │
│  │                                                            │  │
│  │              Luxury Nile Cruises                          │  │
│  │         Experience the magic of Egypt...                 │  │
│  │                                                            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              STICKY NAVIGATION BAR (80px)                │  │
│  │                                                            │  │
│  │  🏛 CLEOPATRA    Home  About  Cruises  Tours  Contact    │  │
│  │                                          [Book Now Button]│  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

[Shrinks to 60px on scroll ↓]

┌─────────────────────────────────────────────────────────────────┐
│  🏛 CLEOPATRA    Home  About...                      [Book Now]│
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Carousel State Transitions

```
                    CAROUSEL STATES
                    
        ┌─────────────────────────────┐
        │    INITIAL STATE            │
        │  Slide 0: "Nile Cruises"    │
        │  Timer: 5000ms started      │
        │  Auto-advance: ENABLED      │
        └──────────────┬──────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
   [Auto-Timer           [User Interaction]
    @ 5 sec]             • Click Next
                         • Click Prev
                         • Click Indicator
                         • Hover

        │                             │
        └──────────────┬──────────────┘
                       │
                       ▼
        ┌─────────────────────────────┐
        │   ADVANCE SLIDE             │
        │  currentIndex++             │
        │  Calculate offset: -100%    │
        │  Apply transform            │
        │  Update indicator           │
        │  Update title/description   │
        └──────────────┬──────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
   [On Mouse Enter]          [Auto-advance]
   • Pause timer             • Reset timer
   • clearInterval()         • Start new 5000ms
                             • Loop

   @ Mouse Leave
   • Resume timer
   • startAutoScroll()
```

---

## 3. Carousel Slide Navigation

```
SLIDES ARRAY (Circular Loop)

Index: 0                    Index: 1                    Index: 2
┌──────────────┐           ┌──────────────┐           ┌──────────────┐
│  Slide 1     │◀─ prev ──│  Slide 2     │◀─ prev ──│  Slide 3     │
│  Nile        │           │  Cabins      │           │  Wonders     │
│  Cruises     │─ next ──▶│             │─ next ──▶│             │
└──────────────┘           └──────────────┘           └──────────────┘
      ▲                                                      │
      │                                                      │
      └──────────────── wraps around ─────────────────────┘

TRANSFORM VALUES:
Index 0: translateX(0%)     ← Slide 1 visible
Index 1: translateX(-100%)  ← Slide 2 visible
Index 2: translateX(-200%)  ← Slide 3 visible
Index 3: wraps to Index 0   ← Back to Slide 1

INDICATOR STATES:
🔘 🔘 🔘    🔘 🔘 🔘    🔘 🔘 🔘    🔘 🔘 🔘
▲               ▲                   ▲
Index 0         Index 1             Index 2
Active          Active              Active
```

---

## 4. Navbar Shrink Behavior

```
USER SCROLLS DOWN

Screen Start Position
┌─────────────────────────────────────┐
│  NAVBAR (80px height)               │
│  🏛 CLEOPATRA LUXURY CRUISE         │
│  Home About Cruises...  [Book Now]  │
│  [Logo full size]                   │
└─────────────────────────────────────┘
  ▲ Content starts below
  
  Scroll 50px ↓
  
No change yet
┌─────────────────────────────────────┐
│  NAVBAR (80px)                      │
│  🏛 CLEOPATRA LUXURY CRUISE         │
│  Home About Cruises...  [Book Now]  │
│  [Logo full size]                   │
└─────────────────────────────────────┘
  
  Scroll 100px ↓ ← TRIGGER POINT
  
NAVBAR SHRINKS!
┌─────────────────────────────────────┐
│  NAVBAR (60px)                      │  (added class='shrink')
│  🏛 CLEOPATRA  Home About... [Book]  │
│  [Logo 85% size]   [Compact]        │
└─────────────────────────────────────┘

Transition: 0.4s ease
Animation:
  • Height: 80px → 60px
  • Logo: scales to 85%
  • Font-sizes: reduced
  • Padding: reduced

SCROLL BACK UP ↑
When scrollY < 100px:
  • Remove 'shrink' class
  • Navbar expands
  • All elements restore
```

---

## 5. Mobile Hamburger Animation

```
DEFAULT STATE                OPEN STATE
(Hamburger Menu)            (X Close Icon)

─                           ╱  (Top bar rotates 45°)
─                               (Middle bar disappears)
─                           ╲  (Bottom bar rotates -45°)


ANIMATION SEQUENCE:

Step 1: Click hamburger
    ─
    ─  → Transform begins
    ─

Step 2: Top bar rotates 45° upward
    ╱
    ─
    ╲

Step 3: Middle bar fades out
    ╱
    (gone)
    ╲

Step 4: Complete - X shape formed
    ╱✕╲
    
    
Duration: 0.3s for each bar
Transform-origin: center
Result: Smooth animated X icon
```

---

## 6. Desktop vs Mobile Layout

```
┌──── DESKTOP (≥992px) ────────────────────────────────┐
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │   HERO CAROUSEL (500px) [VISIBLE] ✅            │ │
│  │   Auto-scrolling images with navigation        │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Logo | Full Menu | Book Button [VISIBLE] ✅    │ │
│  │ Home About Cruises Tours... Gallery Contact    │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
└───────────────────────────────────────────────────────┘

┌──── TABLET (768-991px) ──────────────────────────────┐
│                                                       │
│  [NO HERO CAROUSEL] ❌                              │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Logo | ☰ Hamburger | Book [VISIBLE] ✅        │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  ┌─ MENU (On Click) ─┐                             │
│  │ Home              │                             │
│  │ About Us ▼        │                             │
│  │   ► Our Story     │                             │
│  │ Cruises ▼         │                             │
│  │ Tours ▼           │                             │
│  │ ...               │                             │
│  └───────────────────┘                             │
│                                                       │
└───────────────────────────────────────────────────────┘

┌──── MOBILE (<768px) ──────────────────────────────────┐
│                                                       │
│  [NO HERO CAROUSEL] ❌                              │
│                                                       │
│  ┌─────────────────────────────────┐               │
│  │ 🏛 | ☰ | [Book] [COMPACT] ✅   │               │
│  └─────────────────────────────────┘               │
│                                                       │
│  ┌─ MENU (Drawer) ────────────────┐               │
│  │ ✕ Close                        │               │
│  │ Home                            │               │
│  │ About Us ▼                      │               │
│  │   ► Our Story                  │               │
│  │   ► Our Team                   │               │
│  │ Cruises ▼                       │               │
│  │   ► Nile Cruise                │               │
│  │   ► Lake Nasser                │               │
│  │ ...                             │               │
│  │                                 │               │
│  └─────────────────────────────────┘               │
│                                                       │
└───────────────────────────────────────────────────────┘
```

---

## 7. CSS Transform Flow

```
USER CLICKS "Next" Button

1. nextSlide() called
   currentIndex = (currentIndex + 1) % slides.length
   
   If currentIndex was: 0
   Now currentIndex is: 1
   
   
2. updateCarousel() called
   offset = -currentIndex * 100
   offset = -1 * 100 = -100%
   
   
3. Apply Transform
   carouselTrack.style.transform = "translateX(-100%)"
   
   Track position:
   [Slide1] [Slide2] [Slide3]
   Before: ├─────────●
           0% 100% 200%
   
   After:  ├───────●
           0%-100% 100%-200%
   
   Result: Slide 2 now visible in viewport
   
   
4. CSS Transition animates
   Smooth 0.6s movement from -0% to -100%
   Using cubic-bezier easing for elegance
   
   
5. On completion
   Update indicators
   Update title text
   Update description text
```

---

## 8. Event Listener Map

```
┌─ CAROUSEL CONTAINER ────────────────────────────┐
│                                                  │
│  mouseenter ──→ clearInterval(autoScrollInterval)│
│  Event         (PAUSE auto-scroll)               │
│                                                  │
│  mouseleave ──→ startAutoScroll()               │
│  Event         (RESUME auto-scroll)             │
│                                                  │
└─────────────────────────────────────────────────┘

┌─ PREVIOUS BUTTON ───────────────────────────────┐
│                                                  │
│  click ──→ prevSlide()                          │
│  Event    ├─ currentIndex--                     │
│           ├─ updateCarousel()                   │
│           └─ resetAutoScroll()                  │
│                                                  │
└─────────────────────────────────────────────────┘

┌─ NEXT BUTTON ───────────────────────────────────┐
│                                                  │
│  click ──→ nextSlide()                          │
│  Event    ├─ currentIndex++                     │
│           ├─ updateCarousel()                   │
│           └─ resetAutoScroll()                  │
│                                                  │
└─────────────────────────────────────────────────┘

┌─ INDICATOR DOTS ────────────────────────────────┐
│                                                  │
│  click ──→ goToSlide(index)                     │
│  Event    ├─ currentIndex = index               │
│           ├─ updateCarousel()                   │
│           └─ resetAutoScroll()                  │
│                                                  │
└─────────────────────────────────────────────────┘

┌─ WINDOW (Global) ───────────────────────────────┐
│                                                  │
│  scroll ──→ Check window.scrollY                │
│  Event    ├─ If > 100px: add 'shrink' class   │
│           ├─ If ≤ 100px: remove 'shrink'      │
│           └─ Navbar transitions smoothly        │
│                                                  │
└─────────────────────────────────────────────────┘

┌─ DOCUMENT ──────────────────────────────────────┐
│                                                  │
│  DOMContentLoaded ──→ initCarousel()            │
│  Event              ├─ Create slides            │
│                     ├─ Create indicators        │
│                     └─ Start auto-scroll        │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 9. Data Structure: Slides Array

```
SLIDES ARRAY (3 objects)

┌────────────────────────────────────────────┐
│ slides = [                                 │
│   {                                        │
│     image: '/carousel-1.jpg',              │
│     title: 'Luxury Nile Cruises',          │
│     description: 'Experience the magic...' │
│   },                                       │
│   {                                        │
│     image: '/carousel-2.jpg',              │
│     title: 'Premium Cabins',               │
│     description: 'Elegantly designed...'   │
│   },                                       │
│   {                                        │
│     image: '/carousel-3.jpg',              │
│     title: 'Ancient Wonders',              │
│     description: 'Discover temples...'     │
│   }                                        │
│ ]                                          │
└────────────────────────────────────────────┘

ACCESSING DATA:
slides[0]                    → First slide object
slides[0].image              → '/carousel-1.jpg'
slides[0].title              → 'Luxury Nile Cruises'
slides[currentIndex]         → Current slide
slides[currentIndex].title   → Current title
slides.length                → 3 (total slides)
```

---

## 10. Performance Timeline

```
Page Load Timeline:

0ms ─────────────────────────────────────────────────
    ↓ HTML parsing

100ms ─────────────────────────────────────────────
    ↓ CSS loading

300ms ─────────────────────────────────────────────
    ↓ Images start loading

400ms ─────────────────────────────────────────────
    ↓ JavaScript executes

500ms ─────────────────────────────────────────────
    ↓ DOMContentLoaded event
    ├─ initCarousel() runs
    ├─ Slides DOM created
    ├─ Indicators created
    └─ startAutoScroll() begins

600ms ─────────────────────────────────────────────
    ↓ Scroll listener added

700ms ─────────────────────────────────────────────
    ↓ Page interactive

5000ms ────────────────────────────────────────────
    ↓ First auto-advance (5 seconds)
    ├─ nextSlide() called
    ├─ Transform applied (0.6s animation)
    └─ New text displayed

5600ms ────────────────────────────────────────────
    ↓ Slide 2 fully visible

10000ms ───────────────────────────────────────────
    ↓ Second auto-advance (10 seconds total)
    └─ Pattern repeats...

USER INTERACTION:
- Click button: ~200ms response
- Hover: Instant (no delay)
- Scroll: Continuous updates
- Mobile tap: ~300ms response

CPU USAGE:
- Idle: <1%
- Scrolling: 2-3%
- Carousel animate: 5-8% (GPU offloaded)
```

These diagrams provide a visual understanding of how each component works and interacts together!
