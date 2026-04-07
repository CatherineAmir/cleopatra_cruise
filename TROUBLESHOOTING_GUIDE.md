# 🔧 Carousel & Amenities Troubleshooting Guide

## Issue: Carousel Not Working & Features Not Viewing

### ✅ Fixes Applied

1. **Added Carousel Initialization** ✅
   - Added `DOMContentLoaded` event listener
   - Automatically initializes all carousels on page load
   - Sets first slide as active
   - Logs to console for debugging

2. **Verified Amenities Rendering** ✅
   - Template uses Qweb-compatible `in` operator
   - Font Awesome icon detection working
   - Emoji/text icon fallback in place
   - Bootstrap accordion for expand/collapse

3. **Fixed JavaScript Logic** ✅
   - Matrix transform parsing uses correct index (4 for translateX)
   - Carousel movement functions are in place
   - Navigation arrows set up correctly

---

## 🧪 Debugging Steps

### Step 1: Check Browser Console
```
1. Open page with cabin cards
2. Press F12 to open Developer Tools
3. Click "Console" tab
4. Look for messages like:
   ✅ "Initializing cabin card carousels..."
   ✅ "Found X cabin cards"
   ✅ "Carousel 0 has X slides"
   ✅ "Carousel initialization complete"
```

If you see these messages → Carousel initialized successfully ✅

If you see errors → Note the error message and check below

---

### Step 2: Test Carousel Manually
```
1. Right-click on cabin card
2. Click "Inspect" to open DevTools
3. In Elements tab, find <div class="carousel-track">
4. Check the style attribute
5. It should show: style="transform: translateX(0%)"

If it shows:
   - translateX(0%) → First slide (correct!)
   - translateX(-100%) → Second slide
   - translateY(...) → WRONG! Bug still present
```

---

### Step 3: Test Navigation Arrows
```
1. Click RIGHT arrow on carousel
2. In DevTools, check carousel-track style again
3. It should change to: style="transform: translateX(-100%)"
4. Image should move left, next image appears
5. Indicator dots should update (active state changes)

If arrows don't work → Check console for errors
If movement is vertical → Check if CSS is loading
```

---

### Step 4: Test Amenities Display
```
1. Find cabin card on page
2. Scroll down to "✨ Amenities" section
3. Click to expand accordion
4. Check if facilities list appears

If empty:
   - Room type may not have facilities linked
   - Check in Odoo admin: cruise.room_type form
   - Add facilities using Many2many field
   - Refresh page

If shows with icons:
   - Gold Font Awesome icons → Working! ✅
   - Emoji icons → Working! ✅
   - Text names → Working! ✅
```

---

## 🐛 Common Issues & Fixes

### Issue: Console shows "Carousel not initialized"
**Cause:** DOMContentLoaded not firing
**Fix:**
```javascript
// Check if page is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousel);
} else {
    initCarousel();  // Run immediately if already loaded
}
```

---

### Issue: Carousel shows no slides
**Cause:** No media linked to room_type
**Fix:**
1. Go to Odoo admin → cruise.room_type
2. Select a room type
3. Add media using One2many field (media_ids)
4. Save and refresh page

---

### Issue: Carousel moves up/down instead of left/right
**Cause:** CSS not loading or JavaScript still using old code
**Fix:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh page (Ctrl+Shift+R)
3. Check F12 console for CSS load errors
4. Verify cabin_card.css is loading (look for .cabin-card styles)

---

### Issue: Amenities accordion collapsed and won't expand
**Cause:** Bootstrap JS not loaded or conflict
**Fix:**
1. Check page includes Bootstrap 5 CSS & JS
2. Verify in browser console:
   ```javascript
   console.log(typeof bootstrap.Collapse);
   ```
   Should show: "function"

---

### Issue: Features/Amenities section completely missing
**Cause:** Room type has no facilities linked
**Fix:**
```python
# In Odoo Python console, verify facilities linked:
room_type = env['cruise.room_type'].browse([1])
print(room_type.facilities)  # Should show list
```

---

## 📊 Expected Behavior (After Fix)

### Carousel
```
✅ Page loads
   ↓
✅ Console shows "Initializing cabin card carousels..."
   ↓
✅ First image displays (translateX(0%))
   ↓
✅ Click RIGHT arrow
   ↓
✅ Image slides LEFT, next image appears (translateX(-100%))
   ↓
✅ Indicator dots update (second dot becomes active)
   ↓
✅ Click LEFT arrow
   ↓
✅ Image slides RIGHT, previous image appears (translateX(0%))
```

### Amenities
```
✅ Cabin card displays
   ↓
✅ "✨ Amenities" accordion header visible (gold text)
   ↓
✅ Click to expand
   ↓
✅ List of facilities appears in 2-column grid
   ↓
✅ Each facility shows:
   - Icon (Font Awesome or emoji) in gold color
   - Facility name
   - Proper spacing and formatting
```

---

## 🔍 Console Debug Output

### Enable Advanced Debugging
Add this to `cabin_card.js` for more detailed logging:

```javascript
// Add to moveToSlide function
function moveToSlide(element, slideIndex) {
    const card = element.closest('.cabin-card-horizontal') || element.closest('.cabin-card');
    if (!card) {
        console.error('No card found for element:', element);
        return;
    }

    const track = card.querySelector('.carousel-track');
    const slides = card.querySelectorAll('.carousel-slide');

    if (!track || slides.length === 0) {
        console.error('Track or slides not found', {track, slides});
        return;
    }

    console.log('Moving to slide:', slideIndex, 'out of', slides.length);
    
    slideIndex = Math.max(0, Math.min(slideIndex, slides.length - 1));
    const offset = -slideIndex * 100;
    
    console.log('Setting transform to:', `translateX(${offset}%)`);
    track.style.transform = `translateX(${offset}%)`;

    const indicators = card.querySelectorAll('.indicator');
    indicators.forEach((indicator, index) => {
        if (index === slideIndex) {
            indicator.classList.add('active');
            console.log('Activated indicator:', index);
        } else {
            indicator.classList.remove('active');
        }
    });
}
```

---

## ✅ Verification Checklist

- [ ] Console shows "Initializing cabin card carousels..."
- [ ] Carousel starts at first image
- [ ] RIGHT arrow moves to next image (left slide movement)
- [ ] LEFT arrow moves to previous image (right slide movement)
- [ ] Indicator dots update with each slide
- [ ] Images display without errors
- [ ] "✨ Amenities" accordion visible
- [ ] Amenities section expands on click
- [ ] Facilities list displays with icons
- [ ] No console errors (F12)

---

## 🆘 If Still Not Working

### Collect This Information
```
1. Screenshot of F12 Console tab (capture any errors)
2. Screenshot of page showing cabin card
3. Verify in Odoo:
   - Room type has media_ids linked ✓
   - Room type has facilities linked ✓
   - Media has images ✓
   - Facilities have names ✓
4. Check file modification times:
   - cabin_card.js (should be recent)
   - cabin_card.xml (should be recent)
   - cabin_card.css (verify present)
```

### Quick Fix Checklist
1. [ ] Clear cache and restart Odoo service
2. [ ] Hard refresh browser (Ctrl+Shift+R)
3. [ ] Check DevTools Console for errors (F12)
4. [ ] Verify data exists in database
5. [ ] Check file permissions in production
6. [ ] Verify correct module version deployed

---

## 📝 Console Commands to Test

### Test Carousel Initialization
```javascript
// Check if carousels found
document.querySelectorAll('.cabin-card-horizontal').length
// Should return: number > 0

// Check carousel track
document.querySelector('.carousel-track')
// Should return: HTMLElement

// Check current transform
getComputedStyle(document.querySelector('.carousel-track')).transform
// Should return: matrix(...) or translateX value

// Test slide movement
nextSlide(document.querySelector('.cabin-card-horizontal'))
// Should move carousel
```

### Test Amenities
```javascript
// Check facilities rendered
document.querySelectorAll('.feature-item').length
// Should return: number > 0

// Check if icons present
document.querySelectorAll('.fa-snowflake-o').length
// Should return: number of FA icons

// Check amenities accordion
document.querySelector('.accordion-header')
// Should return: HTMLElement
```

---

## 🎯 Next Steps

1. **Verify Fixes Applied**
   - Refresh page
   - Open browser console (F12)
   - Check for initialization messages

2. **Test Carousel**
   - Click navigation arrows
   - Verify horizontal movement
   - Check indicator updates

3. **Test Amenities**
   - Click accordion header
   - Verify facilities display
   - Check icon rendering

4. **Monitor Logs**
   - Check Odoo server logs for errors
   - Check browser console (F12)
   - Report any errors

5. **Report Results**
   - Share console output
   - Share screenshots
   - Note any errors seen

---

## 🚀 If Everything Works!

✅ Congratulations! Your carousel and amenities are now fully functional!

Next steps:
- Deploy to production
- Monitor user feedback
- Consider adding auto-play feature
- Add keyboard navigation (optional)


