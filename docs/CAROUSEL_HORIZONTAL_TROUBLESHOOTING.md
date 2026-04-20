# Carousel Horizontal Scrolling - Troubleshooting Guide

## Issue: Carousel Not Scrolling Horizontally

If your carousel is not scrolling horizontally, follow this guide to diagnose and fix the issue.

---

## Quick Checklist

- [ ] Carousel container is visible (height: 500px)
- [ ] Slides are being created by JavaScript
- [ ] Console shows no JavaScript errors
- [ ] Browser zoom is 100% (not zoomed in/out)
- [ ] Cache cleared and page refreshed
- [ ] Desktop view (carousel hidden on mobile)

---

## Step 1: Check If Carousel Is Visible

### Open Browser DevTools
```
Press: F12
Tab: Elements
Find: <div class="cleopatra-hero-carousel">
```

### Verify Carousel Exists
```
✓ Should be visible in DOM
✓ Should have class "d-none d-lg-block" (hidden on mobile)
✓ Should be full width (width: 100%)
✓ Should have height: 500px
```

---

## Step 2: Verify Slides Are Created

### Check Console for Logs
```
Press: F12
Tab: Console
Look for:
├─ "Property fetched: {...}"
├─ "Media fetched: [...]"
└─ "Slides created: [...]"
```

### If No Logs Appear
```
❌ Property media not being fetched
→ Check if Property record exists
→ Check if Property has media_ids
→ Check browser Network tab for API errors
```

### If Logs Show Empty Slides
```
❌ Slides array is empty
→ Check if media records have images
→ Check if images are base64 encoded
→ Use default fallback slides (check initCarouselWithDefaults)
```

---

## Step 3: Inspect Carousel Slides

### Check if Slides Exist
```
Press: F12
Tab: Elements
Find: <div class="hero-carousel-track">
├─ Should contain <div class="hero-carousel-slide">
├─ Each slide should have <img> with src
└─ Multiple slides (one per media)
```

### If No Slides in DOM
```
❌ initCarousel() not being called
→ Check console for JavaScript errors
→ Verify fetchPropertyMedia() is running
→ Check if slides array is being populated
```

---

## Step 4: Verify CSS Properties

### Check Hero Carousel CSS
```
Press: F12
Tab: Elements
Find: <div class="cleopatra-hero-carousel">
Right-click: Inspect
Check Styles panel for:
├─ position: relative ✓
├─ width: 100% ✓
├─ height: 500px ✓
└─ overflow: hidden ✓
```

### Check Hero Track CSS
```
Find: <div class="hero-carousel-track">
Check Styles for:
├─ display: flex ✓
├─ flex-direction: row ✓
├─ width: 100% ✓
├─ height: 100% ✓
└─ transition: transform 0.6s... ✓
```

### If Styles Are Wrong
```
❌ CSS not loading properly
→ Clear browser cache (Ctrl+Shift+Del)
→ Hard refresh page (Ctrl+F5)
→ Check Network tab for CSS file (200 status)
```

---

## Step 5: Test Carousel Transform

### Check Transform Value
```
Press: F12
Tab: Elements
Find: <div class="hero-carousel-track">
Look in Styles for: transform: translateX(Xpx) or translateX(X%)
```

### Manual Test
```
1. Open Console (F12 → Console)
2. Type: document.getElementById('carouselTrack').style.transform
3. Should show: translateX(-0%) or translateX(-100%) etc.
```

### If Transform Not Changing
```
❌ updateCarousel() not being called
→ Check if carousel buttons are clickable
→ Try clicking "next" button and check transform
→ Verify auto-scroll interval is running
```

---

## Step 6: Test Manual Navigation

### Try Clicking Buttons
```
1. Find carousel Previous button (left arrow)
2. Click it
3. Should slide to previous image
4. Check DevTools → Transform should change
5. Try clicking Next button
6. Should slide forward
```

### If Buttons Don't Work
```
❌ JavaScript event listeners not attached
→ Check console for errors
→ Verify prevBtn and nextBtn elements exist
→ Check if addEventListener is working
```

---

## Step 7: Monitor Auto-Scroll

### Check if Auto-Scroll Works
```
1. Wait 5 seconds
2. Carousel should advance automatically
3. Title and description should update
4. Check if transform changes
```

### If Auto-Scroll Not Working
```
❌ startAutoScroll() not running
→ Check console for JavaScript errors
→ Verify setInterval is being called
→ Try clicking next manually to verify carousel works
```

---

## Common Issues & Solutions

### Issue 1: Carousel Shows But Doesn't Scroll
**Symptoms:** Carousel visible, but slides don't change  
**Cause:** JavaScript error or slides not created  
**Solution:**
```
1. Open Console (F12)
2. Look for errors
3. Check if "Slides created" message appears
4. If not, check Property/Media data
```

### Issue 2: Carousel Not Visible
**Symptoms:** No carousel section visible  
**Cause:** Mobile view or CSS not loading  
**Solution:**
```
1. Check if on desktop (≥992px width)
2. Check browser window width
3. Clear cache and refresh
4. Verify CSS file loaded (Network tab)
```

### Issue 3: Images Not Loading
**Symptoms:** Carousel visible but images are blank  
**Cause:** Image path or encoding issue  
**Solution:**
```
1. Check Network tab for 404 errors
2. Verify image URLs in Console: slides[0].image
3. Check if base64 images are valid
4. Try uploading new media with images
```

### Issue 4: Carousel Flickers or Jumps
**Symptoms:** Slides jump instead of smooth transition  
**Cause:** CSS transition removed or transform timing issue  
**Solution:**
```
1. Check CSS has transition: 0.6s
2. Verify no JavaScript is removing transition
3. Check for will-change CSS property
4. Ensure no other CSS overrides transform
```

---

## JavaScript Console Commands

### Check Carousel State
```javascript
// In Console (F12):

// Check if slides exist
console.log(slides);

// Check current index
console.log('Current index:', currentIndex);

// Check total slides
console.log('Total slides:', slides.length);

// Check current media ID
console.log('Current media ID:', slides[currentIndex]?.id);

// Check auto-scroll timer
console.log('Auto-scroll interval:', autoScrollInterval);

// Manually advance slide
nextSlide();

// Manually go to specific slide
goToSlide(1);

// Check transform
console.log(document.getElementById('carouselTrack').style.transform);
```

### Test API Calls
```javascript
// Fetch Property manually
fetch('/web/dataset/call_kw/cruise.property/search_read', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
            model: 'cruise.property',
            method: 'search_read',
            args: [[], ['id', 'name', 'media_ids']],
            kwargs: {limit: 1}
        }
    })
})
.then(r => r.json())
.then(d => console.log(d));
```

---

## Network Tab Debugging

### Check API Calls
```
1. Open DevTools (F12) → Network tab
2. Reload page
3. Look for requests to:
   ├─ /web/dataset/call_kw/cruise.property/search_read
   ├─ /web/dataset/call_kw/media/search_read
   └─ header.css
4. All should return 200 status
5. Check response to verify data returned
```

### Check CSS File
```
1. Look for: /cleopatra_cruise/static/src/css/header.css
2. Status should be: 200 ✓
3. Size should be: ~25KB
4. If 404: CSS file not found
5. If 0 bytes: CSS file empty
```

---

## Browser Compatibility

### Tested Browsers
- ✅ Chrome 95+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 95+

### If Not Working in Specific Browser
```
1. Try another browser to isolate issue
2. Clear cache in current browser
3. Disable browser extensions
4. Try private/incognito mode
5. Check browser console for compatibility errors
```

---

## Fix Checklist

After diagnosis, use this checklist to fix issues:

- [ ] Clear browser cache (Ctrl+Shift+Del)
- [ ] Hard refresh page (Ctrl+F5)
- [ ] Verify Property record exists
- [ ] Verify Media records exist
- [ ] Verify Media has images
- [ ] Check console for errors
- [ ] Check Network tab for API 200s
- [ ] Verify CSS loaded (header.css)
- [ ] Test manual navigation (click buttons)
- [ ] Wait for auto-scroll (5 seconds)
- [ ] Check carousel transform changes
- [ ] Verify slides display correctly

---

## Still Not Working?

### Collect Debug Information
```
1. Screenshot of carousel area
2. Browser console output (copy all logs)
3. Browser Network tab API responses
4. DevTools Elements inspector view
5. Browser and OS version
```

### Check Fallback
```
1. Console should show if fallback activated
2. Should see 3 default carousel slides
3. If fallback not working, check JavaScript syntax
4. Verify initCarouselWithDefaults() function exists
```

---

## Key Files

```
/templates/header.xml
├─ HTML structure
└─ JavaScript carousel logic

/static/src/css/header.css
└─ Carousel styling

Important CSS classes:
├─ .cleopatra-hero-carousel (container)
├─ .hero-carousel-container (inner wrapper)
├─ .hero-carousel-track (slides container)
├─ .hero-carousel-slide (individual slide)
└─ transform: translateX() (horizontal movement)

Important JS functions:
├─ fetchPropertyMedia() (fetch data)
├─ initCarousel() (create slides)
├─ updateCarousel() (move slides)
├─ nextSlide() (advance)
└─ prevSlide() (go back)
```

---

## Summary

For horizontal carousel scrolling to work:
1. ✓ CSS: `display: flex` + `flex-direction: row`
2. ✓ Slides: Each 100% width
3. ✓ Track: Full width container
4. ✓ Transform: `translateX(-currentIndex * 100%)`
5. ✓ Transition: `0.6s` smooth animation
6. ✓ JavaScript: Properly calculating offset

If any of these are missing, carousel won't scroll horizontally!

