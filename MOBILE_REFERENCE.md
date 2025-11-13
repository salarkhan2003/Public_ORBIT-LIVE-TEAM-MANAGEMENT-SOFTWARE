# 📱 Quick Mobile Responsiveness Reference

## Breakpoints Used

```css
/* Mobile First */
default:  0px - 639px   (Mobile phones)
sm:      640px+         (Large phones / Small tablets)
md:      768px+         (Tablets)
lg:      1024px+        (Laptops / Small desktops)
xl:      1280px+        (Desktops)
2xl:     1536px+        (Large desktops)
```

## Common Responsive Patterns

### 1. Padding/Spacing
```jsx
// Mobile: 12px, Tablet: 16px, Desktop: 24px
className="p-3 sm:p-4 md:p-6"

// Mobile: 16px gap, Tablet: 24px gap
className="gap-4 sm:gap-6"
```

### 2. Text Sizes
```jsx
// Mobile: 14px, Tablet: 16px, Desktop: 18px
className="text-sm sm:text-base md:text-lg"

// Headings: Mobile: 24px, Tablet: 30px, Desktop: 36px
className="text-2xl sm:text-3xl md:text-4xl"
```

### 3. Grid Layouts
```jsx
// Mobile: 1 col, Tablet: 2 cols, Desktop: 4 cols
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"

// Mobile: 2 cols, Desktop: 4 cols (for stats)
className="grid grid-cols-2 lg:grid-cols-4"
```

### 4. Flex Layouts
```jsx
// Stack on mobile, row on desktop
className="flex flex-col sm:flex-row"

// Wrap on small screens
className="flex flex-wrap"
```

### 5. Visibility
```jsx
// Hide on mobile, show on desktop
className="hidden lg:block"

// Show on mobile, hide on desktop
className="lg:hidden"

// Show only on specific breakpoints
className="hidden sm:block lg:hidden"
```

### 6. Icon/Image Sizes
```jsx
// Mobile: 16px, Desktop: 20px
className="w-4 h-4 sm:w-5 sm:h-5"

// Mobile: 32px, Desktop: 40px
className="w-8 h-8 sm:w-10 sm:h-10"
```

### 7. Button Sizes
```jsx
// Mobile: smaller padding, Desktop: normal
className="px-3 sm:px-4 py-2 sm:py-3"

// Full width on mobile, auto on desktop
className="w-full sm:w-auto"
```

### 8. Border Radius
```jsx
// Mobile: 8px, Desktop: 12px
className="rounded-lg sm:rounded-xl"
```

### 9. Overflow Protection
```jsx
// Prevent horizontal scroll
className="overflow-x-hidden max-w-full"

// Truncate text
className="truncate max-w-[120px] sm:max-w-[200px]"

// Flexible with minimum width
className="min-w-0 flex-1"
```

### 10. Touch Targets
```jsx
// Minimum 44x44px for accessibility
className="min-h-[44px] min-w-[44px] touch-manipulation"
```

## Component-Specific Examples

### Container
```jsx
<div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
  {/* Content */}
</div>
```

### Card
```jsx
<div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6">
  {/* Content */}
</div>
```

### Hero Section
```jsx
<div className="py-12 sm:py-16 md:py-20 lg:py-24">
  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
    {/* Title */}
  </h1>
  <p className="text-base sm:text-lg md:text-xl">
    {/* Subtitle */}
  </p>
</div>
```

### Stats Grid
```jsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
  {stats.map(stat => (
    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
      {/* Stat card */}
    </div>
  ))}
</div>
```

### Form
```jsx
<form className="space-y-4 sm:space-y-6">
  <input className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base" />
  <button className="w-full sm:w-auto px-6 py-3">Submit</button>
</form>
```

### Navigation
```jsx
{/* Mobile Menu */}
<div className={`
  ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  lg:translate-x-0
  fixed lg:static
  w-64 sm:w-72
`}>
  {/* Menu items */}
</div>
```

## Testing Checklist

### Visual
- [ ] No horizontal scroll at any breakpoint
- [ ] All text is readable (min 14px)
- [ ] Buttons are touch-friendly (min 44x44px)
- [ ] Images scale properly
- [ ] Cards don't overlap
- [ ] Spacing looks good

### Functional
- [ ] Forms work on mobile
- [ ] Navigation opens/closes properly
- [ ] Modals fit on screen
- [ ] Dropdowns work
- [ ] Touch gestures work

### Performance
- [ ] Page loads quickly on 3G
- [ ] Animations are smooth
- [ ] No layout shifts
- [ ] Images are optimized

## Common Issues & Fixes

### Issue: Horizontal Scroll
```jsx
// Add to root element
className="overflow-x-hidden"

// Or to containers
className="max-w-full"
```

### Issue: Text Overflow
```jsx
// Truncate long text
className="truncate"

// Or wrap text
className="break-words"
```

### Issue: Small Touch Targets
```jsx
// Increase padding
className="p-3 sm:p-4"

// Add minimum dimensions
className="min-h-[44px] min-w-[44px]"
```

### Issue: Elements Too Close
```jsx
// Add spacing
className="space-y-3 sm:space-y-4"

// Or gap for grid/flex
className="gap-3 sm:gap-4"
```

---

**Quick Tip**: Always test on actual devices, not just browser dev tools!

