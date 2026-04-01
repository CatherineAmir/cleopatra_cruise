# Carousel Property Media Integration Documentation

## Overview

The hero carousel has been updated to dynamically fetch and display property media images with their associated metadata. The carousel now integrates directly with the `cruise.property` model and displays media from the `media_ids` one2many relationship.

---

## How It Works

### 1. Initialization Flow

```
Page Loads
    ↓
DOMContentLoaded fires
    ↓
fetchPropertyMedia() called
    ↓
Fetch Property (limit: 1)
    ↓
Get media_ids from Property
    ↓
Fetch Media details with IDs
    ↓
Build slides with media data
    ↓
initCarousel() creates DOM elements
    ↓
Carousel starts auto-scroll
```

### 2. Data Structure

Each carousel slide contains:
```javascript
{
    id: 123,                           // Media record ID
    image: 'data:image/jpg;base64,...' // Base64 encoded image or placeholder
    title: 'Media Name',               // Media name from Property Media
    description: 'Description text'    // Media description
}
```

### 3. API Calls

#### First Request: Fetch Property
```javascript
Model: cruise.property
Method: search_read
Fields: ['id', 'name', 'description', 'media_ids']
Limit: 1 (gets first property)

Response includes:
- property.id
- property.name
- property.description
- property.media_ids: [1, 2, 3] (list of media record IDs)
```

#### Second Request: Fetch Media Details
```javascript
Model: media
Method: search_read
Filter: [['id', 'in', property.media_ids]]
Fields: ['id', 'name', 'image', 'description']

Response includes:
- media.id (used to track which media is displayed)
- media.name (carousel slide title)
- media.image (base64 encoded image data)
- media.description (carousel description text)
```

---

## Key Features

### Dynamic Media Display
✅ Carousel automatically loads media from first Property record  
✅ All media images attached to property are displayed  
✅ Media IDs are tracked in data attributes  
✅ Titles and descriptions come from Media records  

### Fallback Mechanism
✅ If no property found → uses default placeholder slides  
✅ If no media in property → uses default slides  
✅ If API error → logs error and uses defaults  
✅ No visual breaks - always shows carousel  

### Media ID Tracking
✅ Each slide element has `data-media-id` attribute  
✅ Each indicator has `data-media-id` attribute  
✅ Can be used to link carousel to media actions  
✅ Enables media-specific interactions  

### Console Logging
✅ Logs fetched property data  
✅ Logs fetched media data  
✅ Logs created slides array  
✅ Logs errors with full stack trace  

---

## Implementation Details

### JavaScript Functions

```javascript
fetchPropertyMedia()
├─ Purpose: Fetch property with media IDs
├─ Async: Yes (uses await)
├─ Returns: Calls initCarousel() or initCarouselWithDefaults()
└─ Error handling: Try/catch with console.error

initCarouselWithDefaults()
├─ Purpose: Create placeholder slides
├─ When used: If no property/media found
├─ Slides: 3 hardcoded placeholder slides
└─ Result: Calls initCarousel()

initCarousel()
├─ Purpose: Create carousel DOM elements
├─ Input: slides[] array
├─ Creates: Slide divs + Indicator buttons
├─ Attributes: data-media-id on each element
└─ Calls: startAutoScroll()
```

### API Endpoints

The carousel uses Odoo's JSON-RPC API:
```
POST /web/dataset/call_kw/MODEL/METHOD
```

Example request:
```json
{
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
        "model": "cruise.property",
        "method": "search_read",
        "args": [[], ['id', 'name', 'description', 'media_ids']],
        "kwargs": {"limit": 1}
    }
}
```

---

## HTML Structure

### Slide Element with Media ID
```html
<div class="hero-carousel-slide" data-media-id="123">
    <img src="data:image/jpg;base64,..." alt="Media Name" class="hero-carousel-image"/>
</div>
```

### Indicator with Media ID
```html
<button class="hero-indicator active" 
        data-slide="0" 
        data-media-id="123" 
        aria-label="Go to slide 1">
</button>
```

---

## Usage Examples

### Access Media ID from Slide
```javascript
// Get media ID from slide element
const slide = document.querySelector('.hero-carousel-slide');
const mediaId = slide.getAttribute('data-media-id');
console.log('Current media ID:', mediaId);
```

### Access Current Slide Media ID
```javascript
// Get currently displayed media ID
const activeSlide = document.querySelector('.hero-carousel-slide');
const activeIndicator = document.querySelector('.hero-indicator.active');
const currentMediaId = activeIndicator.getAttribute('data-media-id');
console.log('Displaying media:', currentMediaId);
```

### Handle Slide Change with Media ID
```javascript
// Extend goToSlide to track media ID
const originalGoToSlide = goToSlide;
function goToSlide(index) {
    originalGoToSlide(index);
    const mediaId = slides[currentIndex].id;
    console.log('Navigated to media ID:', mediaId);
    // Can trigger custom event or action here
}
```

---

## Browser Console Debugging

### Check Fetched Property
```javascript
// In console, after page loads:
console.log(slides);  // View all slides with media IDs
```

### Monitor API Calls
```javascript
// Network tab (F12 → Network)
Look for: POST /web/dataset/call_kw/cruise.property/search_read
Look for: POST /web/dataset/call_kw/media/search_read
```

### Inspect Carousel State
```javascript
// In console:
currentIndex              // Current slide index
slides.length             // Total slides
slides[currentIndex].id   // Current media ID
slides[currentIndex].title // Current title
```

---

## Configuration

### Change Property Fetch Limit
In header.xml, find:
```javascript
kwargs: {limit: 1}
```
Change to:
```javascript
kwargs: {limit: 5}  // Get first 5 properties
```

### Fetch Specific Property
In header.xml, find:
```javascript
args: [[], ['id', 'name', 'description', 'media_ids']]
```
Change to:
```javascript
args: [[['id', '=', PROPERTY_ID]], ['id', 'name', 'description', 'media_ids']]
```

### Add More Media Fields
In header.xml, find media fetch:
```javascript
['id', 'name', 'image', 'description']
```
Change to:
```javascript
['id', 'name', 'image', 'description', 'file_path', 'property_id']
```

---

## Error Handling

### Scenario: No Properties
```
Fallback activated
↓
Default 3 placeholder slides shown
↓
Carousel functions normally
↓
Console shows: "No property media found, using defaults"
```

### Scenario: Property has no media_ids
```
Property fetched successfully
↓
media_ids array is empty
↓
Fallback activated (no media fetch)
↓
Default slides shown
```

### Scenario: Network Error
```
Try block catches error
↓
Error logged to console
↓
Catch block calls initCarouselWithDefaults()
↓
Carousel still works with placeholders
```

---

## Data Flow Diagram

```
┌─────────────────────────────┐
│   Carousel Loads (Frontend) │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│ fetchPropertyMedia()                        │
│ └─ Async function starts                    │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│ POST /web/dataset/call_kw/cruise.property   │
│ ├─ search_read()                            │
│ ├─ limit: 1                                 │
│ └─ fields: id, name, description, media_ids│
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│ Response: Property + media_ids: [1, 2, 3]  │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│ POST /web/dataset/call_kw/media             │
│ ├─ search_read()                            │
│ ├─ filter: id IN [1, 2, 3]                 │
│ └─ fields: id, name, image, description    │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│ Response: Media records with images         │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│ Build slides[] with media data and IDs      │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│ initCarousel()                              │
│ ├─ Clear existing slides                    │
│ ├─ Create slide DIVs with data-media-id     │
│ ├─ Create indicators with data-media-id     │
│ └─ Start auto-scroll                        │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│ Carousel Ready with Property Media          │
│ ├─ Slides display media images              │
│ ├─ Titles from media.name                   │
│ ├─ Descriptions from media.description      │
│ └─ All media IDs tracked                    │
└─────────────────────────────────────────────┘
```

---

## Integration with Property Model

### Property Model Relationship
```
Property (cruise.property)
├─ media_ids: One2many('media', 'property_id')
├─ name: Char
├─ description: Text
└─ facilities: Many2many
```

### Media Model Expected Fields
```
Media (media)
├─ id: Integer (auto)
├─ name: Char
├─ image: Binary (base64)
├─ description: Text
└─ property_id: Many2one (cruise.property)
```

---

## Testing Checklist

- [ ] Property record exists with media_ids
- [ ] Media records exist and have images
- [ ] Images are base64 encoded
- [ ] API calls return data (check Network tab)
- [ ] Carousel loads media instead of placeholders
- [ ] Titles and descriptions display correctly
- [ ] data-media-id attributes present on elements
- [ ] Console shows logged property and media data
- [ ] Carousel functions normally (scroll, pause, etc.)

---

## Troubleshooting

### Carousel shows default placeholders
1. Check if Property record exists
2. Check if Property has media_ids
3. Check if Media records exist
4. Open console (F12) and check logs
5. Check Network tab for API response

### Images not displaying
1. Check if media.image field has base64 data
2. Check browser console for image load errors
3. Verify image format (JPEG, PNG supported)
4. Try placeholder image path

### Media IDs not in HTML
1. Ensure slides[] array has id field
2. Check initCarousel() sets data-media-id
3. Inspect element (F12) and verify attribute exists
4. Check browser console for JavaScript errors

### Carousel stuck on first slide
1. Check if slides array is empty
2. Check if auto-scroll timer started
3. Open console and check for errors
4. Try clicking next/prev buttons

---

## Future Enhancements

1. **Dynamic Property Selection**
   - Allow selecting which property to display
   - Add dropdown to choose property
   - Update carousel on selection change

2. **Media Actions**
   - Click slide to open media details
   - Add "View More" button
   - Link to full media page

3. **Advanced Filtering**
   - Filter by room type
   - Filter by media type (image/video)
   - Show only featured media

4. **Caching**
   - Cache property/media data locally
   - Reduce API calls
   - Faster carousel load

---

## Support & Questions

For questions about the carousel-property integration:
- Check browser console for logs
- Verify API responses in Network tab
- Ensure Property model has required relationships
- Test Media model has image data

**All carousel functionality remains the same - auto-scroll, manual navigation, pause/resume, etc.**

