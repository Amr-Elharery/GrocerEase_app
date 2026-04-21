# Mobile Architecture

React Native (Expo) with Expo Router, NativeWind, and TypeScript.

---

## Development

**Important Instructions For Source Control**:

- Create a branch for every development/fix task.
- For feature development, use `feat/` prefix.
- For bug fixes, use `fix/` prefix.
- Do not push directly to `master` or `staging`; always open a Pull Request.
- Do not merge Pull Requests to `master` before review.
- Before creating a branch from `staging`, always pull latest changes.

### How to Create Branch and Start Working

1. Create a branch from `staging`.

```bash
git switch staging
git pull origin staging
git switch -c feat/your-feature-name
```

2. After completing your work, push the branch.

```bash
git add .
git commit -m "Your commit message"
git push origin feat/your-feature-name
```

3. Create a Pull Request from your branch to `staging` for review and merge.

4. After PR approval and merge, sync local `staging`.

```bash
git switch staging
git pull origin staging
```

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

## Layers (Mobile)

### 1. HTTP Service

A central network client used for all API requests.
Handles:

- base URL
- headers and auth token injection
- interceptors
- shared error handling

This layer does not contain business logic.

### 2. Feature Service

A domain layer for each feature (for example: `authService`, `productService`).
Responsibilities:

- business logic
- request/response validation (for example with Zod)
- calling the HTTP service

This keeps behavior consistent for screens, hooks, and tests.

### 3. Data Layer (Hooks / Query)

Feature hooks handle:

- screen-ready data shaping
- loading and error state mapping
- server-state integration (React Query when used)
- cache invalidation and refetch triggers

Hooks expose simple APIs for UI consumption.

### 4. View Layer (Screens/Components)

Screens and components are responsible for:

- rendering UI
- handling user interaction
- triggering hooks/actions
- basic form-level validation for instant feedback

Screens/components should not include business logic.

## Validation Strategy (Mobile)

- **Form-level validation (UI)**: inside screens/components/hooks for immediate UX feedback.
- **Business-level validation**: inside feature services before API write operations.
- **API contract validation**: in service layer when parsing backend responses.

## Architecture Rule: Feature-Based Design

All new code should follow a **feature-based design pattern**.

- Organize files by domain feature first (for example: `auth`, `products`, `stores`, `shopping-list`).
- Keep each feature self-contained with its own UI, hooks, and business logic.
- Share only truly generic code through common folders such as `components/ui`, `lib`, and `shared`.
- Avoid creating folders by technical type at the top level when the code belongs to one feature.

Example structure:

```text
features/
  auth/
    components/
    hooks/
    services/
    types/
  products/
    components/
    hooks/
    services/
```

## Final Folder Structure Hierarchy

Target structure for the project after refactoring to feature-based architecture:

```text
.
|-- app/
|   |-- _layout.tsx
|   |-- (tabs)/
|   |   |-- _layout.tsx
|   |   |-- index.tsx
|   |   |-- insights.tsx
|   |   |-- profile.tsx
|   |   |-- search.tsx
|   |   \-- shopping-list.tsx
|   |-- auth/
|   |   |-- login.tsx
|   |   |-- sign-up.tsx
|   |   |-- forgot-password.tsx
|   |   |-- verification-code.tsx
|   |   |-- reset-password.tsx
|   |   \-- change-password.tsx
|   |-- products/
|   |   |-- index.tsx
|   |   \-- [id].tsx
|   |-- optimization/
|   |   \-- index.tsx
|   \-- global.css
|
|-- features/
|   |-- auth/
|   |   |-- components/
|   |   |-- hooks/
|   |   |-- services/
|   |   \-- types/
|   |-- products/
|   |   |-- components/
|   |   |-- hooks/
|   |   |-- services/
|   |   \-- types/
|   |-- stores/
|   |   |-- components/
|   |   |-- hooks/
|   |   |-- services/
|   |   \-- types/
|   \-- shopping-list/
|       |-- components/
|       |-- hooks/
|       |-- services/
|       \-- types/
|
|-- components/
|   \-- ui/
|
|-- shared/
|   |-- api/
|   |-- constants/
|   \-- utils/
|
|-- lib/
|   |-- theme/
|   \-- i18n/
|
|-- types/
|   \-- common/
|
|-- assets/
|   \-- images/
|
\-- locales/
    |-- en.json
    \-- ar.json
```

Description:

- `app/`: Route files only (navigation and screen entry points).
- `features/`: Domain-first modules where each feature owns its components, hooks, services, and types.
- `components/ui/`: Cross-feature reusable UI primitives only.
- `shared/`: Generic non-UI code reused by many features (API clients, constants, helpers).
- `lib/`: App-wide providers/configuration (theme, localization bootstrap, global contexts).
- `types/common/`: Shared global type definitions that are not feature-specific.
- `assets/` and `locales/`: Static resources and translation files.

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
