# 🛠️ Animation Troubleshooting Guide

## Issues Fixed ✅

### 1. **Background Color Not Showing**
**Problem:** MainLayout had `bg-transparent` preventing dark background  
**Fix:** Changed to inline style with `#07060C` color

```jsx
// Before
<div className="min-h-screen flex flex-col relative bg-transparent">

// After
<div className="min-h-screen flex flex-col relative" style={{ background: '#07060C' }}>
```

### 2. **Progress Bar Not Updating**
**Problem:** Progress bar width was calculated on render but not updated on scroll  
**Fix:** Added scroll event listener to update progress bar dynamically

```jsx
// Added scroll listener
const handleScroll = () => {
  setScrolled(window.scrollY > 50);
  
  // Update progress bar
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = (window.scrollY / maxScroll) * 100;
    progressBar.style.width = `${scrollPercent}%`;
  }
};
```

### 3. **Stats Counter Animation Not Working**
**Problem:** No IntersectionObserver to trigger animation when stats section scrolls into view  
**Fix:** Added IntersectionObserver with counter animation

```jsx
// Stats animation observer
useEffect(() => {
  const statsObserver = new IntersectionObserver(
    (entries) => {
      if (!entries[0].isIntersecting) return;
      
      const statElements = document.querySelectorAll('.stat-item');
      statElements.forEach((el, idx) => {
        setTimeout(() => {
          el.classList.add('in');
          // Animate numbers...
        }, idx * 120);
      });
    },
    { threshold: 0.4 }
  );
  
  const statsSection = document.querySelector('.stats-section');
  if (statsSection) statsObserver.observe(statsSection);
}, []);
```

### 4. **Features Cards Not Animating**
**Problem:** Missing class name and observer for feature cards  
**Fix:** Added `feat-card` class and IntersectionObserver

```jsx
// Added class
className="feat-card p-10 rounded-2xl ..."

// Features observer
useEffect(() => {
  const featureObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const delay = parseFloat(entry.target.dataset.delay || 0) * 120;
        setTimeout(() => entry.target.classList.add('in'), delay);
      });
    },
    { threshold: 0.15 }
  );
  
  document.querySelectorAll('.feat-card').forEach((el) => featureObserver.observe(el));
}, []);
```

### 5. **Canvas Background Not Visible**
**Problem:** Canvas didn't have explicit background color  
**Fix:** Added inline style with dark background

```jsx
<canvas 
  ref={canvasRef} 
  className="fixed inset-0 z-0 pointer-events-none" 
  style={{ background: '#07060C' }} 
/>
```

---

## How to Test Animations

### 1. **Canvas Particle Animation**
- Start the app: `npm run dev`
- Go to homepage
- Move your mouse around - particles should follow/flee from cursor
- Look for:
  - ✨ Golden and white particles floating upward
  - ✨ Twinkling stars in background
  - ✨ Particles reacting to mouse movement

### 2. **Hero Entrance Animation**
- Refresh the page
- Watch for staggered text reveal:
  1. Eyebrow tagline (300ms delay)
  2. "Your Next" (600ms)
  3. "Unforgettable" (760ms, in gold)
  4. "Experience" (920ms)
  5. Subtitle text (1100ms)
  6. CTA buttons (1300ms)

### 3. **Scroll Progress Bar**
- Scroll down the page
- Look at top of screen
- Golden gradient bar should grow from left to right as you scroll

### 4. **Stats Counter Animation**
- Scroll down to stats section
- Numbers should count up when they come into view:
  - 12K+ Events
  - 180+ Cities
  - 4M Fans
  - 0% Hidden Fees

### 5. **Features Cards**
- Continue scrolling to features grid
- Cards should fade in one by one with slight delay
- Each card has 120ms stagger delay

### 6. **Navbar Glass Effect**
- Scroll down past 50px
- Navbar should become semi-transparent with blur effect
- Border should appear at bottom

---

## Common Issues & Solutions

### Issue: Canvas not showing
**Check:**
1. Browser console for errors
2. Make sure WebGL is enabled
3. Try different browser

**Solution:**
```bash
# Clear browser cache
Ctrl + Shift + Delete

# Or restart dev server
Ctrl + C
npm run dev
```

### Issue: Animations too slow or fast
**Adjust:** Change duration values in HomeNew.jsx

```jsx
// Hero animations - adjust setTimeout delays
setTimeout(() => {...}, 300) // Change this number

// Stats animation - adjust interval speed
const increment = targetNum / 60; // Higher = slower
setInterval(() => {...}, 20); // Lower = faster
```

### Issue: Progress bar jumpy
**Fix:** Add CSS smooth transition
```css
#progress-bar {
  transition: width 0.1s ease-out;
}
```

### Issue: Text not revealing
**Check:**
1. Element IDs match (`hl1`, `hl2`, `hl3`)
2. Classes are being added (check DevTools)

**Debug:**
```jsx
console.log('Element found:', document.getElementById('hl1'));
```

### Issue: IntersectionObserver not triggering
**Check:**
1. Element has correct class (`stat-item`, `feat-card`)
2. Threshold value (try 0.1 to 0.5)
3. Element is actually entering viewport

**Debug:**
```jsx
const featureObserver = new IntersectionObserver(
  (entries) => {
    console.log('Observer triggered:', entries);
    // ... rest of code
  }
);
```

---

## Performance Tips

### Optimize Canvas
- Reduce particle count if laggy
- Use `requestAnimationFrame` (already implemented)
- Limit canvas size on mobile

```jsx
// In setupCanvas()
for (let i = 0; i < Math.floor(canvas.width / 20); i++) {
  // Fewer particles (was /12)
}
```

### Debounce Scroll Events
```jsx
import { useCallback } from 'react';

const handleScroll = useCallback(() => {
  // ... scroll logic
}, []);

// Debounced version
const debouncedScroll = useMemo(
  () => debounce(handleScroll, 10),
  [handleScroll]
);
```

### Lazy Load Images
Add to TicketCard components:
```jsx
<img loading="lazy" ... />
```

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Canvas | ✅ | ✅ | ✅ | ✅ |
| IntersectionObserver | ✅ | ✅ | ✅ | ✅ |
| requestAnimationFrame | ✅ | ✅ | ✅ | ✅ |
| CSS Grid | ✅ | ✅ | ✅ | ✅ |
| Backdrop Filter | ✅ | ⚠️ | ✅ | ✅ |

⚠️ Firefox may need `layout.css.backdrop-filter.enabled` set to `true`

---

## Quick Debug Commands

### Check if canvas is rendering:
```javascript
// In browser console
const canvas = document.querySelector('canvas');
console.log('Canvas size:', canvas.width, canvas.height);
console.log('Has context:', !!canvas.getContext('2d'));
```

### Check animation classes:
```javascript
// In browser console
document.querySelectorAll('.stat-item').forEach((el, i) => {
  console.log(`Stat ${i}:`, el.classList.contains('in'));
});
```

### Check scroll position:
```javascript
// In browser console
window.addEventListener('scroll', () => {
  console.log('Scroll Y:', window.scrollY);
});
```

---

## Files Modified in This Fix

1. ✅ `MainLayout.jsx` - Added dark background
2. ✅ `HomeNew.jsx` - Added all animation observers
3. ✅ `index.css` - Added marquee animation keyframes

---

## Expected Behavior

✅ **On Page Load:**
- Dark background appears immediately
- Canvas starts animating (particles floating)
- Hero text reveals in sequence
- Noise overlay visible on close inspection

✅ **On Scroll:**
- Progress bar grows smoothly
- Navbar becomes glassy at 50px
- Stats count up when scrolled into view
- Feature cards fade in with stagger effect
- Marquee scrolls continuously

✅ **On Mouse Move:**
- Particles react to cursor position
- Smooth 60fps animation maintained

---

## Still Not Working?

### Try These Steps:

1. **Hard Refresh**
   ```
   Ctrl + Shift + R (Windows)
   Cmd + Shift + R (Mac)
   ```

2. **Clear Cache & Restart**
   ```bash
   # Stop server
   Ctrl + C
   
   # Clear node_modules cache
   rm -rf node_modules/.vite
   
   # Restart
   npm run dev
   ```

3. **Check Console for Errors**
   ```
   F12 → Console tab
   Look for red errors
   ```

4. **Verify React is Running**
   ```
   Check terminal for:
   "Local: http://localhost:5173/"
   ```

5. **Test in Different Browser**
   - Chrome recommended
   - Firefox developer edition
   - Safari (Mac)

---

**Last Updated:** March 26, 2026  
**Status:** ✅ All Animations Working  
**Tested On:** Chrome, Edge
