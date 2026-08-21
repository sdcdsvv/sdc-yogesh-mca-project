# Visual Design Guide - Uttarakhand Tourism AI

## 🎨 Color Palette

### Primary Colors (Natural Uttarakhand Theme)

#### Mountain & Forest Tones
```
Emerald-700:  #047857  ████  (Primary buttons, links)
Emerald-800:  #065f46  ████  (Logo, headings)
Emerald-900:  #064e3b  ████  (Hero gradients)
Teal-700:     #0f766e  ████  (Accents)
Teal-800:     #115e59  ████  (Gradients)
Green-800:    #166534  ████  (Nature elements)
```

#### Earth & Stone Tones
```
Stone-50:     #fafaf9  ████  (Page background)
Stone-100:    #f5f5f4  ████  (Card backgrounds)
Stone-200:    #e7e5e4  ████  (Borders)
Stone-600:    #57534e  ████  (Secondary text)
Stone-700:    #44403c  ████  (Primary text)
Stone-800:    #292524  ████  (Dark text)
```

#### Sky & Water Tones
```
Sky-700:      #0369a1  ████  (Links, info)
Sky-900:      #0c4a6e  ████  (Hero gradients)
Blue-800:     #1e40af  ████  (Accents)
Cyan-900:     #164e63  ████  (Water themes)
```

#### Sunset & Temple Tones
```
Amber-700:    #b45309  ████  (Warm accents)
Amber-900:    #78350f  ████  (Earth tones)
Orange-800:   #9a3412  ████  (Temple themes)
```

---

## 📐 Layout Structure

### Navbar
```
┌─────────────────────────────────────────────────────────┐
│  Uttarakhand Tourism    Home Services Explore Official  │
│                                          [Lang] [Login]  │
└─────────────────────────────────────────────────────────┘
Height: 64px (h-16)
Background: white/95 with backdrop-blur
Border: border-b border-stone-200
```

### Hero Section (Landing Page)
```
┌─────────────────────────────────────────────────────────┐
│                                                           │
│                    KEDARNATH TEMPLE                       │
│                 Sacred Himalayan Pilgrimage               │
│         One of the twelve Jyotirlingas at 3,583m        │
│                                                           │
│         [Explore Services] [Discover Destinations]       │
│                                                           │
│                      ●━━━━━━━━━━                         │
└─────────────────────────────────────────────────────────┘
Height: 85vh (min 600px)
Background: Animated gradient with mountain pattern
```

### Services Grid (Services Page)
```
┌──────────────────┐  ┌──────────────────┐
│  💬               │  │  📸               │
│  AI Travel Guide │  │  Place Recognition│
│  Description...  │  │  Description...   │
│  Launch Service→ │  │  Launch Service→  │
└──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐
│  🗺️               │  │  🚨               │
│  Trip Planning   │  │  Emergency        │
│  Description...  │  │  Description...   │
│  Launch Service→ │  │  Launch Service→  │
└──────────────────┘  └──────────────────┘
Grid: 2x2 on desktop, 1 column on mobile
Gap: 24px (gap-6)
```

---

## 🎯 Component Styles

### Button Styles

#### Primary Button
```css
Background: gradient from-emerald-700 to-teal-700
Text: white, font-semibold
Padding: px-8 py-4
Border Radius: rounded-lg (12px)
Hover: from-emerald-800 to-teal-800
Shadow: shadow-md → shadow-lg on hover
```

#### Secondary Button
```css
Background: white
Text: emerald-800, font-semibold
Padding: px-8 py-4
Border Radius: rounded-lg
Hover: bg-stone-100
Shadow: shadow-lg
```

#### Ghost Button
```css
Background: white/10 with backdrop-blur
Text: white, font-semibold
Border: border-white/20
Padding: px-8 py-4
Border Radius: rounded-lg
Hover: bg-white/20, border-white/30
```

### Card Styles

#### Service Card
```css
Background: white
Padding: p-8 (32px)
Border Radius: rounded-xl (16px)
Border: border-stone-200
Shadow: shadow-sm → shadow-lg on hover
Transition: 300ms ease
Hover: border-stone-300, -translate-y-1
```

#### Category Card
```css
Background: gradient (varies by category)
Padding: p-6 (24px)
Border Radius: rounded-xl
Shadow: shadow-md → shadow-xl on hover
Hover: -translate-y-1
```

#### Feature Card
```css
Background: stone-50
Padding: p-8
Border Radius: rounded-xl
Border: border-stone-200
```

---

## 📝 Typography Scale

### Headings
```
Hero Title:     text-6xl/7xl (60-72px) font-bold
Section Title:  text-4xl (36px) font-bold
Card Title:     text-2xl (24px) font-bold
Subtitle:       text-xl (20px) font-semibold
```

### Body Text
```
Large:    text-lg (18px) leading-relaxed
Regular:  text-base (16px) leading-relaxed
Small:    text-sm (14px) leading-normal
Caption:  text-xs (12px) leading-tight
```

### Font Weights
```
Bold:      font-bold (700)
Semibold:  font-semibold (600)
Medium:    font-medium (500)
Regular:   font-normal (400)
Light:     font-light (300)
```

---

## 🎭 Animation Specifications

### Transitions
```css
Fast:    duration-200 (200ms)
Normal:  duration-300 (300ms)
Slow:    duration-500 (500ms)
Hero:    duration-1000 (1000ms)
```

### Hover Effects
```css
Lift:       hover:-translate-y-1
Lift More:  hover:-translate-y-2
Scale:      hover:scale-105
Scale More: hover:scale-110
```

### Fade In Up
```css
@keyframes fadeInUp {
  from: opacity-0, translateY(20px)
  to:   opacity-1, translateY(0)
}
Duration: 600ms
Easing: ease-out
```

---

## 📱 Responsive Breakpoints

### Mobile (< 768px)
```
- Single column layouts
- Hamburger menu
- Reduced font sizes
- Stacked buttons
- Full-width cards
```

### Tablet (768px - 1024px)
```
- 2 column grids
- Reduced spacing
- Medium font sizes
- Side-by-side buttons
```

### Desktop (> 1024px)
```
- 3-4 column grids
- Full spacing
- Large font sizes
- Horizontal layouts
- Max width containers (6xl/7xl)
```

---

## 🎨 Gradient Combinations

### Hero Gradients
```css
Kedarnath:    from-slate-800/90 via-stone-700/85 to-slate-800/90
Valley:       from-emerald-900/90 via-teal-800/85 to-green-900/90
Nainital:     from-sky-900/90 via-blue-800/85 to-cyan-900/90
Corbett:      from-amber-900/90 via-orange-800/85 to-yellow-900/90
```

### Service Gradients
```css
AI Guide:      from-emerald-700 to-teal-800
Recognition:   from-sky-700 to-blue-800
Planning:      from-amber-700 to-orange-800
Emergency:     from-stone-700 to-slate-800
```

### Category Gradients
```css
Spiritual:     from-amber-700 to-orange-800
Adventure:     from-sky-700 to-blue-800
Wildlife:      from-emerald-700 to-green-800
Hill Station:  from-teal-700 to-cyan-800
Cultural:      from-purple-700 to-indigo-800
Flowers:       from-pink-700 to-rose-800
Winter:        from-slate-700 to-gray-800
Wellness:      from-stone-700 to-zinc-800
```

---

## 🔲 Spacing System

### Container Padding
```
Mobile:   px-6 (24px)
Desktop:  px-6 (24px)
```

### Section Spacing
```
Vertical:   py-20 (80px)
Between:    space-y-12 (48px)
```

### Card Spacing
```
Small:   p-6 (24px)
Medium:  p-8 (32px)
```

### Grid Gaps
```
Tight:   gap-4 (16px)
Normal:  gap-6 (24px)
Loose:   gap-8 (32px)
```

---

## 🎯 Icon Usage

### Service Icons
```
AI Guide:          💬 (Speech bubble)
Recognition:       📸 (Camera)
Trip Planning:     🗺️ (Map)
Emergency:         🚨 (Siren)
```

### Category Icons (Not in Navbar)
```
Spiritual:   🛕 (Temple)
Adventure:   🏔️ (Mountain)
Wildlife:    🐅 (Tiger)
Hill:        🏞️ (Landscape)
Cultural:    🎭 (Arts)
Flowers:     🌸 (Blossom)
Winter:      ⛷️ (Skiing)
Wellness:    🧘 (Yoga)
```

---

## 🎨 Shadow System

### Elevation Levels
```
Level 0:  shadow-none
Level 1:  shadow-sm   (Subtle)
Level 2:  shadow-md   (Default)
Level 3:  shadow-lg   (Elevated)
Level 4:  shadow-xl   (Floating)
Level 5:  shadow-2xl  (Modal)
```

### Usage
```
Cards:      shadow-sm → shadow-lg (hover)
Buttons:    shadow-md → shadow-lg (hover)
Modals:     shadow-2xl
Dropdowns:  shadow-xl
```

---

## 🎯 Border Radius System

### Sizes
```
Small:   rounded-md (6px)   - Badges, tags
Medium:  rounded-lg (8px)   - Buttons
Large:   rounded-xl (12px)  - Cards
XLarge:  rounded-2xl (16px) - Sections
Full:    rounded-full       - Avatars, pills
```

---

## ✨ Special Effects

### Glass Morphism
```css
background: white/10
backdrop-filter: blur(md)
border: border-white/20
```

### Text Shadow (Hero)
```css
text-shadow: 0 4px 20px rgba(0,0,0,0.4)  /* Title */
text-shadow: 0 2px 10px rgba(0,0,0,0.3)  /* Subtitle */
```

### Pattern Overlay
```css
opacity: 10%
SVG pattern with mountain/geometric shapes
```

---

## 📊 Accessibility

### Color Contrast
```
Text on White:     stone-700 (4.5:1 ratio)
Text on Dark:      white (7:1 ratio)
Links:             emerald-800 (underline on focus)
```

### Focus States
```css
focus:outline-none
focus:ring-2
focus:ring-emerald-500
focus:ring-offset-2
```

### Touch Targets
```
Minimum: 44x44px
Buttons: 48px height
Links: 40px height
```

---

## 🎯 Best Practices

### Do's ✅
- Use natural earth tones
- Maintain consistent spacing
- Apply subtle animations
- Keep text readable
- Use semantic HTML
- Test on mobile devices

### Don'ts ❌
- No bright neon colors
- No heavy gradients
- No cluttered layouts
- No tiny text
- No missing alt text
- No keyboard traps

---

**Design System Version**: 2.0
**Last Updated**: November 2024
