
// Gradient text (requires bg-clip-text)
className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent"

// Icon backgrounds
className="bg-indigo-500/10"  // 10% opacity for subtle backgrounds
```

### Animation Examples
```typescript
// Hover rotation
whileHover={{ scale: 1.1, rotate: 5 }}
transition={{ duration: 0.3, type: "spring", stiffness: 300 }}

// Continuous pulse
animate={{ scale: [1, 1.2, 1] }}
transition={{ duration: 2, repeat: Infinity }}

// Arrow movement
animate={{ x: [0, 4, 0] }}
transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
```

---

## 📐 Custom Icon Integration

### Adding Custom SVG Icons

If you need brand-specific icons:

```typescript
// Create a custom icon component
const CustomIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Your SVG paths here */}
    <path d="M..." />
  </svg>
);

// Use in features array
{
  icon: CustomIcon,
  title: 'Your Feature',
  // ...
}
```

### Icon Design Specifications

For custom icons to match Lucide style:
- **Viewbox:** 24x24
- **Stroke width:** 2px
- **Stroke linecap:** round
- **Stroke linejoin:** round
- **No fill** (outline style)
- **Consistent weight** across all icons

---

## 🌈 Color Palette for Icons

### Brand Colors
```css
Primary: #4F46E5    /* Indigo-600 */
Hover:   #4338CA    /* Indigo-700 */
Light:   #818CF8    /* Indigo-400 */
```

### Feature-Specific Gradients
```css
AI/Brain:      from-[#4F46E5] to-[#7C3AED]  /* Indigo to Purple */
Speed/Zap:     from-[#4F46E5] to-[#06B6D4]  /* Indigo to Cyan */
Team/Users:    from-[#7C3AED] to-[#EC4899]  /* Purple to Pink */
Analytics:     from-[#EC4899] to-[#F43F5E]  /* Pink to Rose */
Security:      from-[#10B981] to-[#059669]  /* Emerald gradient */
Integration:   from-[#F59E0B] to-[#EF4444]  /* Orange to Red */
```

### Background Tints (10% opacity)
```css
Indigo:   bg-indigo-500/10
Cyan:     bg-cyan-500/10
Purple:   bg-purple-500/10
Pink:     bg-pink-500/10
Emerald:  bg-emerald-500/10
Orange:   bg-orange-500/10
```

---

## 🎯 Icon Selection Guidelines

### When choosing icons, consider:

1. **Clarity:** Is the meaning immediately obvious?
2. **Consistency:** Does it match the visual weight of other icons?
3. **Scalability:** Does it look good at 16px and 32px?
4. **Metaphor:** Does it represent the concept well?
5. **Culture:** Is it universally understood?

### Icon Do's and Don'ts

✅ **DO:**
- Use outline style for consistency
- Maintain 2px stroke weight
- Choose recognizable symbols
- Test at multiple sizes
- Use semantic colors (green = success, red = error)

❌ **DON'T:**
- Mix solid and outline styles
- Use overly detailed icons
- Choose obscure metaphors
- Ignore accessibility
- Use brand logos as icons

---

## 🔧 Implementation Code Snippets

### Feature Card Icon Container
```typescript
<motion.div
  className="inline-flex items-center justify-center w-14 h-14 bg-indigo-500/10 rounded-2xl mb-6"
  whileHover={{ scale: 1.1, rotate: 5 }}
  transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
>
  <Brain className="w-7 h-7 text-[#4F46E5]" />
</motion.div>
```

### Animated CTA Icon
```typescript
<motion.div
  animate={{ x: [0, 4, 0] }}
  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
>
  <ArrowRight className="w-5 h-5" />
</motion.div>
```

### Badge Icon
```typescript
<Sparkles className="w-4 h-4 text-[#4F46E5]" />
```

---

## 📱 Responsive Icon Sizing

```typescript
// Responsive classes
className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"

// Breakpoints:
// Mobile (<640px):   24x24px (w-6 h-6)
// Tablet (640px+):   28x28px (w-7 h-7)
// Desktop (768px+):  32x32px (w-8 h-8)
```

---

## 🎨 Icon Resources

### Free Icon Libraries
1. **Lucide** - https://lucide.dev
2. **Heroicons** - https://heroicons.com
3. **Feather Icons** - https://feathericons.com
4. **Phosphor** - https://phosphoricons.com
5. **Tabler** - https://tabler-icons.io

### Premium Icon Sets
1. **Streamline** - https://streamlinehq.com
2. **Nucleo** - https://nucleoapp.com
3. **Icon8** - https://icons8.com
4. **Iconfinder** - https://iconfinder.com

### Icon Customization Tools
1. **Figma** - Edit SVGs directly
2. **Illustrator** - Professional editing
3. **SVGOMG** - Optimize SVG files
4. **Inkscape** - Free vector editor

---

## ✅ Accessibility Checklist

When using icons:
- ✅ Include `aria-label` for icon-only buttons
- ✅ Ensure sufficient color contrast (4.5:1 minimum)
- ✅ Use semantic HTML (`<button>`, not `<div>`)
- ✅ Add tooltips for unclear icons
- ✅ Test with screen readers
- ✅ Don't rely solely on color to convey meaning

Example:
```typescript
<button aria-label="Start free trial">
  <ArrowRight className="w-5 h-5" />
</button>
```

---

## 🚀 Performance Tips

### Icon Optimization
1. **Tree-shaking:** Only import icons you use
2. **SVG sprites:** Consider for many icons
3. **Lazy loading:** For below-fold icons
4. **Caching:** Icons load once, cached forever

### Bundle Size
```typescript
// ✅ Good: Named imports
import { Brain, Zap, Users } from 'lucide-react'

// ❌ Bad: Default import (imports all icons)
import * as Icons from 'lucide-react'
```

---

This guide ensures your icon usage remains consistent, accessible, and performant across the entire application! 🎨✨
# 🎨 Icon & Design Assets Reference Guide

## 📦 Current Icon Set (Lucide React)

All icons are from the **Lucide React** library - a beautiful, consistent icon set used by modern SaaS companies.

### Icons Used in Features Section

| Feature | Icon | Import | Usage |
|---------|------|--------|-------|
| AI Task Automation | `Brain` | `import { Brain } from 'lucide-react'` | Represents intelligence, AI, automation |
| Real-Time Sync | `Zap` | `import { Zap } from 'lucide-react'` | Represents speed, instant, power |
| Unified Workspace | `Users` | `import { Users } from 'lucide-react'` | Represents team, collaboration, people |
| Actionable Analytics | `BarChart` | `import { BarChart } from 'lucide-react'` | Represents data, metrics, insights |
| Enterprise Security | `Shield` | `import { Shield } from 'lucide-react'` | Represents protection, security, safety |
| Seamless Integrations | `Layers` | `import { Layers } from 'lucide-react'` | Represents connections, stack, integration |

### Additional Icons in Landing Page

| Element | Icon | Purpose |
|---------|------|---------|
| Hero Badge | `Sparkles` | Visual interest, premium feel |
| Section Badge | `Star` | Quality indicator |
| Success Indicator | `CheckCircle` | Confirmation, benefit callout |
| Growth Metric | `TrendingUp` | Performance, improvement |
| CTA Arrow | `ArrowRight` | Call-to-action, next step |
| Trust Badge | `Award` | Recognition, quality |
| Time Indicator | `Clock` | Time-saving, scheduling |
| Security | `Lock` | Privacy, protection |
| Navigation | `Rocket` | Launch, speed, innovation |
| Global | `Globe` | Worldwide, scale |
| Precision | `Target` | Accuracy, goals |

---

## 🎨 Alternative Icon Recommendations

If you want to explore other icon sets or replace specific icons:

### Alternative Icon Libraries

1. **Heroicons** (by Tailwind Labs)
   ```bash
   npm install @heroicons/react
   ```
   - Similar style to Lucide
   - Excellent for professional SaaS
   - 24x24 outline and solid variants

2. **Phosphor Icons**
   ```bash
   npm install phosphor-react
   ```
   - More playful, modern style
   - Great for creative products
   - Multiple weights available

3. **Tabler Icons**
   ```bash
   npm install @tabler/icons-react
   ```
   - Clean, minimal style
   - 1000+ icons
   - Consistent stroke width

### Feature-Specific Icon Alternatives

#### AI Task Automation
- Current: `Brain`
- Alternatives:
  - `Cpu` - Technical/processing focus
  - `Sparkles` - Magic/automation
  - `Wand2` - Magical automation
  - `Activity` - Active processing

#### Real-Time Sync
- Current: `Zap`
- Alternatives:
  - `RefreshCw` - Synchronization
  - `Wifi` - Connectivity
  - `Radio` - Broadcasting
  - `Gauge` - Speed/performance

#### Unified Workspace
- Current: `Users`
- Alternatives:
  - `UserCircle` - Individual focus
  - `UsersRound` - Team circle
  - `MessageSquare` - Communication
  - `Layout` - Workspace view

#### Actionable Analytics
- Current: `BarChart`
- Alternatives:
  - `LineChart` - Trends
  - `PieChart` - Distribution
  - `TrendingUp` - Growth
  - `Activity` - Pulse/monitoring

#### Enterprise Security
- Current: `Shield`
- Alternatives:
  - `ShieldCheck` - Verified security
  - `Lock` - Encryption
  - `Key` - Access control
  - `UserCheck` - Authentication

#### Seamless Integrations
- Current: `Layers`
- Alternatives:
  - `Puzzle` - Connections
  - `Blocks` - Building blocks
  - `Link` - Direct connection
  - `Box` - Package/plugin

---

## 🎭 Icon Styling Best Practices

### Size Guidelines
```typescript
// Feature card icons
className="w-7 h-7"  // 28x28px - Perfect for feature cards

// Section badge icons
className="w-4 h-4"  // 16x16px - Small accents

// CTA button icons
className="w-5 h-5"  // 20x20px - Button companions

// Stat icons
className="w-8 h-8"  // 32x32px - Emphasized metrics
```

### Color Application
```typescript
// Brand color
className="text-[#4F46E5]"

