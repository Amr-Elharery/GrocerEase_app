# Mobile Architecture

React Native (Expo) with Expo Router, NativeWind, and TypeScript.

---

## Current Structure

```
app/
├─ _layout.tsx       ← Root layout (Stack navigation)
├─ index.tsx         ← Home screen
└─ global.css        ← Tailwind CSS

lib/
├─ theme.ts
├─ theme-context.tsx
└─ utils.ts

components/          ← (To be created)
assets/              ← Images, icons
```

---

## Stack

- **Framework**: Expo Router (v6) - file-based routing
- **Styling**: NativeWind (Tailwind + React Native)
- **Navigation**: React Navigation (Stack, Tabs)
- **Animations**: React Native Reanimated
- **Icons**: Lucide React Native
- **Type Safety**: TypeScript

## @react-native-reusables/cli Overview

Use `@react-native-reusables/cli` to scaffold reusable mobile UI patterns quickly.

### Quick Start

```bash
npx @react-native-reusables/cli add button
```

Then import and use the generated component in your screen:

```tsx
import { Button } from '@/components/ui/button';

export default function ExampleScreen() {
  return <Button onPress={() => console.log('Pressed')}>Continue</Button>;
}
```

Visit the official docs for more details: [https://reactnativereusables.com/docs]

---

## Planned Layers (Future)

### UI Layer

- `app/` - screens via Expo Router
- `components/` - reusable UI components

### Business Logic

- `lib/` - utilities, context, hooks

### API Integration

- `services/` - API calls (to be added)

---

## Main App Flow

## Example: Product List Feature

When building a feature like "Product List", the data flow follows this pattern:

```
User Opens Products Screen
  ↓
[Navigation Layer]
app/products/index.tsx
  ↓
[UI Layer - Component]
components/ProductList.tsx
  └─ Calls useProducts() hook
  ↓
[Hooks Layer]
lib/hooks/useProducts.ts
  └─ Manages loading, data, errors
  └─ Calls API service
  ↓
[Service/Business Logic]
services/productService.ts
  └─ Fetches from API
  └─ Validates data (Zod)
  └─ Transforms response
  ↓
[HTTP Layer]
shared/http/httpService.ts
  └─ Axios instance
  └─ Handles auth headers
  └─ Retry logic
  ↓
[Backend API]
GET /api/products
  ↓
Response flows back up
  ├─ Service validates → transforms
  ├─ Hook stores in state
  ├─ Component renders
  ↓
User sees product list
```

---
