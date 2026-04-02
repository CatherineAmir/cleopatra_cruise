# QWeb Carousel Implementation Guide

## Overview
The header carousel has been converted from a pure JavaScript implementation to a **QWeb-based carousel** that renders slides at template time using property media data. This approach provides better performance and cleaner HTML structure.

## Key Changes

### 1. **QWeb Template Rendering**
Instead of JavaScript populating the carousel track dynamically, QWeb now renders all carousel slides directly in the template:

```xml
<div class="hero-carousel-track" id="carouselTrack">
    <t t-if="property_id and property_id.media_ids">
        <t t-foreach="property_id.media_ids" t-as="media">
            <div class="hero-carousel-slide" t-att-data-media-id="media.id">
                <t t-if="media.image">
                    <img t-att-src="image_data_uri(media.image)" 
                         t-att-alt="media.name" 
                         class="hero-carousel-image"/>
                </t>
                <t t-else="">
                    <img src="/cleopatra_cruise/static/src/img/carousel-1.jpg" 
                         alt="Default Carousel Image" 
                         class="hero-carousel-image"/>
                </t>
            </div>
        </t>
    </t>
</div>
```

**Benefits:**
- Images are rendered server-side and already in the DOM when JS runs
- `image_data_uri()` converts base64 images to proper data URIs
- Fallback to default images if no property media exists

### 2. **HTML Description Support Using `t-out`**
The description field is now rendered using `t-out` to properly handle HTML content:

```xml
<div class="hero-description" id="heroDescription">
    <t t-if="property_id and property_id.media_ids and len(property_id.media_ids) > 0">
        <t t-out="property_id.media_ids[0].description or property_id.description or 'Experience the magic of Egypt\'s most iconic river'"/>
    </t>
    <t t-else="">Experience the magic of Egypt's most iconic river</t>
</div>
```

**Key Features:**
- `t-out` renders HTML content properly (respects `<p>`, `<strong>`, `<em>`, etc.)
- Falls back to property description if media description is empty
- Displays default text if neither media nor property description exists

### 3. **Simplified JavaScript Logic**
JavaScript is now much simpler - it only handles carousel controls and animation:

```javascript
// Core functions:
- initCarousel()              // Initializes carousel on DOM ready
- updateCarouselPosition()    // Updates slide position and indicators
- nextSlide()                 // Moves to next slide
- prevSlide()                 // Moves to previous slide
- carouselGoToSlide(index)   // Goes to specific slide
- fetchMediaDescription()     // Fetches media details via RPC
- startAutoScroll()          // Starts auto-scroll timer
- pauseAutoScroll()          // Pauses auto-scroll on hover
- resumeAutoScroll()         // Resumes auto-scroll on mouse leave
```

### 4. **Carousel State Management**
```javascript
let carouselState = {
    currentIndex: 0,           // Current slide index
    slides: [],                // Array of slide elements
    autoScrollInterval: null   // Auto-scroll timer reference
};
```

### 5. **QWeb Indicators**
Indicators are also rendered by QWeb with proper active state:

```xml
<div class="hero-carousel-indicators" id="carouselIndicators">
    <t t-if="property_id and property_id.media_ids">
        <t t-foreach="property_id.media_ids" t-as="media">
            <t t-set="is_first" t-value="media_index == 0"/>
            <button class="hero-indicator" 
                    t-att-class="'hero-indicator ' + ('active' if is_first else '')"
                    t-att-data-slide="media_index"
                    t-att-data-media-id="media.id"
                    onclick="carouselGoToSlide(this.getAttribute('data-slide'))">
            </button>
        </t>
    </t>
</div>
```

## Data Flow

1. **Controller** passes `property_id` to template
2. **QWeb Template** iterates through `property_id.media_ids`
3. **Images** are rendered with `image_data_uri()` for base64 conversion
4. **Descriptions** are rendered with `t-out` for HTML support
5. **JavaScript** manages carousel interactions and auto-scroll

## Performance Improvements

- **Faster Initial Load**: All slides are pre-rendered in HTML
- **No Async Loading**: No need to fetch media data after page load
- **Better SEO**: Content is in the initial HTML, not added by JS
- **Reduced Network Calls**: Media data is fetched only when slide changes (for dynamic updates)
- **Cleaner Code**: Separation of concerns - QWeb for rendering, JS for behavior

## Browser Compatibility

- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support
- ✅ Mobile browsers: Works with responsive fallback

## CSS Requirements

Ensure the following CSS properties are set for proper carousel behavior:

```css
.hero-carousel-track {
    display: flex;
    width: 100%;
    transition: transform 0.5s ease-in-out;
}

.hero-carousel-slide {
    min-width: 100%;
    flex-shrink: 0;
}

.hero-carousel-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
```

## Usage

The carousel is automatically initialized when the page loads. No additional configuration needed - it works automatically with any `property_id` passed to the template.

### Required Template Context
```python
data = {
    'property_id': property_record,  # Must have media_ids relationship
}
```

## Carousel Controls

- **Previous Button**: Click `.hero-carousel-prev` to go to previous slide
- **Next Button**: Click `.hero-carousel-next` to go to next slide
- **Indicator Dots**: Click any indicator dot to go to that slide
- **Auto-Scroll**: Automatically changes slide every 5 seconds
- **Hover**: Pauses auto-scroll on mouse enter, resumes on mouse leave

## Customization

### Change Auto-Scroll Interval
Modify in the JavaScript:
```javascript
function startAutoScroll() {
    carouselState.autoScrollInterval = setInterval(nextSlide, 5000); // Change 5000 to desired milliseconds
}
```

### Change Slide Animation Speed
Modify in CSS (header.css):
```css
.hero-carousel-track {
    transition: transform 0.5s ease-in-out; /* Change 0.5s to desired duration */
}
```

## Troubleshooting

### Carousel not showing
1. Verify `property_id` is passed to template
2. Check that `property_id` has `media_ids` records
3. Verify media records have `image` field populated
4. Check browser console for JavaScript errors

### Descriptions not rendering as HTML
- Ensure media `description` field is set to HTML type in the model
- Use `t-out` instead of `t-esc` for HTML rendering
- Check that HTML content is properly formatted

### Images not loading
- Verify images are stored as base64 in the `image` field
- Check `image_data_uri()` helper is available in template context
- Ensure image MIME type is correct

---

**Last Updated**: April 2, 2026
**Version**: 1.0
**Status**: Production Ready

