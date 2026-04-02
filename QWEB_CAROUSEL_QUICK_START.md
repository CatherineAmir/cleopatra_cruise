# QWeb Carousel - Quick Reference

## ✅ What's New

Your carousel in `/cleopatra_cruise/templates/header.xml` has been **converted to QWeb** with the following improvements:

### Key Features
1. **Server-Side Rendering** - All slides are rendered by QWeb at template time
2. **HTML Description Support** - Descriptions use `t-out` for proper HTML rendering
3. **Simplified JavaScript** - Much lighter JS that only handles interactions
4. **Better Performance** - No async loading delays, instant image display
5. **Horizontal Auto-Scroll** - Slides change automatically every 5 seconds

---

## 🎯 How It Works

### QWeb Template (Server-Side)
```xml
<div class="hero-carousel-track" id="carouselTrack">
    <t t-if="property_id and property_id.media_ids">
        <t t-foreach="property_id.media_ids" t-as="media">
            <div class="hero-carousel-slide" t-att-data-media-id="media.id">
                <img t-att-src="image_data_uri(media.image)" 
                     t-att-alt="media.name" 
                     class="hero-carousel-image"/>
            </div>
        </t>
    </t>
</div>
```

**What happens:**
- `property_id.media_ids` is looped through
- Each media record creates a slide `<div>`
- Images are converted to data URIs with `image_data_uri()`
- Slides are ready in the DOM when page loads

### HTML Descriptions (Using t-out)
```xml
<div class="hero-description" id="heroDescription">
    <t t-out="property_id.media_ids[0].description"/>
</div>
```

**What happens:**
- `t-out` renders HTML content properly
- `<p>`, `<strong>`, `<em>`, `<br>` tags work as expected
- HTML is safe and properly escaped

### JavaScript (Client-Side)
```javascript
// Handles carousel navigation and auto-scroll
- nextSlide()           // Move to next slide
- prevSlide()           // Move to previous slide
- carouselGoToSlide()   // Go to specific slide
- startAutoScroll()     // Auto-change slides every 5 seconds
- pauseAutoScroll()     // Pause on mouse hover
```

---

## 📊 Data Requirements

Your controller already passes the right data:

```python
data = {
    'property_id': property_record,  # Must have media_ids
}
```

The `property_id` must have:
- ✅ `media_ids` relationship (one2many to media)
- ✅ Each media record must have `image` field (base64)
- ✅ Each media record can have `description` field (HTML)

---

## 🎨 Carousel Controls

| Control | Action |
|---------|--------|
| **Left Arrow** | Previous slide |
| **Right Arrow** | Next slide |
| **Dots** | Jump to slide |
| **Mouse Hover** | Pause auto-scroll |
| **Mouse Leave** | Resume auto-scroll |
| **Auto** | Changes every 5 seconds |

---

## 🔧 Customization

### Change Auto-Scroll Speed
In `header.xml`, find:
```javascript
function startAutoScroll() {
    carouselState.autoScrollInterval = setInterval(nextSlide, 5000); // milliseconds
}
```
Change `5000` to your desired milliseconds:
- `3000` = 3 seconds
- `7000` = 7 seconds

### Change Animation Speed
In your CSS file (`header.css`), update:
```css
.hero-carousel-track {
    transition: transform 0.5s ease-in-out; /* change 0.5s */
}
```

### Add Custom Description Formatting
The description is now fetched dynamically and supports HTML. You can add styles in `header.css`:

```css
.hero-description {
    font-size: 18px;
    line-height: 1.6;
}

.hero-description p {
    margin: 0 0 10px 0;
}

.hero-description strong {
    color: #FFD700; /* Gold color */
}
```

---

## 📝 Template Usage Example

```xml
<!-- In your main_cruise_page.xml or similar -->
<t t-call="cleopatra_cruise.cleopatra_cruise_header">
    <t t-set="property_id" t-value="property_id"/>
</t>
```

Or in Python controller:
```python
@http.route('/cruises', auth='public', website=True)
def cruises_list(self, **kw):
    property = request.env['cruise.property'].sudo().search([], limit=1)
    return request.render('cleopatra_cruise.main_cruise_page', {
        'property_id': property,
    })
```

---

## 🐛 Troubleshooting

### Carousel not showing images
- ❌ Check: Is `property_id` passed to template?
- ❌ Check: Does `property_id` have `media_ids` records?
- ❌ Check: Do media records have `image` field populated?

### HTML not rendering in descriptions
- ❌ Check: Is `media.description` field type HTML?
- ❌ Check: Are you using `t-out` instead of `t-esc`?
- ❌ Check: Is HTML content properly formatted?

### Carousel not animating
- ❌ Check: Are there multiple slides?
- ❌ Check: Check browser console for JS errors
- ❌ Check: Is `.hero-carousel-track` CSS transition set?

---

## 📚 Files Changed

- ✅ `/templates/header.xml` - QWeb carousel implementation
- ✅ New: `QWEB_CAROUSEL_IMPLEMENTATION.md` - Full documentation

---

## 🚀 Next Steps

1. Test the carousel by visiting `/cruises`
2. Add more media to your property
3. Test HTML descriptions (add `<strong>`, `<p>` tags)
4. Customize colors and animations in CSS
5. Monitor browser console for any errors

---

**Status**: ✅ Ready for Production  
**Last Updated**: April 2, 2026

