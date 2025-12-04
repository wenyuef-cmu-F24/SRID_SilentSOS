# SilentSOS Style Guide

## Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Primary Red** | `#FF7B7B` | SOS button, alerts |
| **Accent Green** | `#C8E6A0` | Success states |
| **Background** | `#F5F5F7` | Page background |
| **White** | `#FFFFFF` | Cards |
| **Gray 900** | `#111827` | Primary text |
| **Gray 500** | `#6B7280` | Secondary text |
| **Green 500** | `#22C55E` | Toggle on |
| **Orange 500** | `#F97316` | Location accent |

## Typography

- **Font:** Inter (Google Fonts)
- **Headings:** 30-48px, Bold (700)
- **Body:** 14-16px, Medium (500)
- **Caption:** 12px, Medium (500)

## Components

### Buttons
- **SOS Button:** 192x192px, rounded-full, gradient red
- **Standard:** rounded-2xl, py-4, font-semibold
- **Icon Button:** 48x48px, rounded-full, bg-gray-300

### Cards
- **Standard:** bg-white, rounded-2xl, shadow-sm, p-4
- **Large:** bg-white, rounded-3xl, shadow-sm

### Toggle Switch
- Width: 56px, Height: 32px
- On: bg-green-500
- Off: bg-gray-300

### Inputs
- bg-gray-100, rounded-2xl, px-4 py-3

## Spacing

- **Page padding:** px-6 pt-4 pb-24
- **Section gap:** mb-6 to mb-8
- **Card padding:** p-4 to p-6

## Border Radius

| Size | Value | Tailwind |
|------|-------|----------|
| Medium | 16px | rounded-2xl |
| Large | 24px | rounded-3xl |
| Full | 9999px | rounded-full |

## Animations

- `animate-pulse` - Listening state
- `animate-ping` - SOS active rings
- `animate-float` - Contact avatars
- `animate-glow` - SOS button glow

## Layout

```
max-width: 448px (max-w-md)
centered: mx-auto
min-height: 100vh
```

---

*SilentSOS © 2024*

