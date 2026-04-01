# Carousel Property Media Integration - Quick Start

## What Changed
✅ Carousel now displays property media dynamically
✅ Media IDs are tracked in HTML elements
✅ Automatically fetches from cruise.property model
✅ Uses media_ids one2many relationship
✅ Shows media images, names, and descriptions

---

## How to Test

### Step 1: Create Test Data
```
Go to: Cruises → Properties
Click: Create
Field: Name = "Test Property"
Field: Description = "Beautiful property"
Field: Media = Create 2-3 media records with images
Click: Save
```

### Step 2: Create Media Records
```
Go to: Cruises → Media
Click: Create
Field: Name = "Room Photo"
Field: Image = Upload/Select image
Field: Description = "Bedroom with view"
Field: Property = Select "Test Property"
Click: Save
```

### Step 3: View Carousel
```
Go to: Main page (home)
Header should show:
├─ First media image as slide 1
├─ Second media image as slide 2
├─ Media names as titles
├─ Media descriptions as descriptions
└─ Auto-scroll every 5 seconds
```

### Step 4: Verify Media IDs
```
Open: Browser DevTools (F12)
Tab: Elements
Find: <div class="hero-carousel-slide">
Check: data-media-id="123" attribute
Value: Should match Media record ID
```

### Step 5: Check Console
```
Open: Browser DevTools (F12)
Tab: Console
Look for:
├─ "Property fetched: {...}"
├─ "Media fetched: [...]"
└─ "Slides created: [...]"
```

---

## File Modified
- `templates/header.xml` ← Updated with dynamic fetching

## Files Created
- `CAROUSEL_PROPERTY_INTEGRATION.md` ← Complete documentation
- `CAROUSEL_MEDIA_UPDATE_SUMMARY.md` ← Summary

---

## What the Code Does

### On Page Load
```
1. Fetch first Property record
2. Get its media_ids list
3. Fetch Media records for those IDs
4. Build carousel slides
5. Display carousel with media images
```

### Media ID Tracking
```
Each slide has: data-media-id="123"
Each indicator has: data-media-id="123"
Allows future features to know which media is shown
```

### If No Media Found
```
Falls back to 3 placeholder images
Carousel still works perfectly
No errors or broken display
```

---

## API Calls Made

### Call 1: Fetch Property
```
GET cruise.property (limit: 1, first property only)
Returns: Property with media_ids list
```

### Call 2: Fetch Media
```
GET media WHERE id IN [123, 124, 125]
Returns: Media records with images and descriptions
```

---

## Carousel Features (Unchanged)
✅ Auto-scrolls every 5 seconds
✅ Previous/Next buttons
✅ Indicator dots (clickable)
✅ Pause on hover
✅ Responsive design

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Carousel shows placeholder slides | Property has no media linked |
| Images not showing | Media records missing images |
| Console errors | Check browser Network tab for API errors |
| data-media-id missing | Inspect element, should be on all slides |

---

## Next Steps

1. ✅ Create Property + Media records
2. ✅ Clear browser cache (Ctrl+Shift+Del)
3. ✅ Reload page
4. ✅ Verify carousel shows media
5. ✅ Check console logs

---

## Need Help?
See: `CAROUSEL_PROPERTY_INTEGRATION.md` for detailed documentation

