/\*\*

- AUTHENTICATION FEATURE - REFACTORING GUIDE
-
- This document explains the refactored authentication feature using:
- 1.  Feature-Based Design Pattern
- 2.  Separation of concerns (Views, Logic, API)
- 3.  Shared validation helpers
- 4.  Custom hooks for form management
- 5.  Reusable UI components
      \*/

# Authentication Feature - Architecture Guide

## Overview

The authentication feature has been refactored to follow a **Feature-Based Design Pattern** with clear separation of concerns:

```
Authentication Feature
├── Views (Screens)
│   ├── app/login.tsx
│   ├── app/sign-up.tsx
│   ├── app/reset-password.tsx
│   ├── app/forgot-password.tsx
│   ├── app/verification-code.tsx
│   └── app/change-password.tsx
│
├── UI Components (Presentation Layer)
│   └── components/domain/auth/
│       ├── EmailInput.tsx          (Reusable email input)
│       ├── PasswordInput.tsx        (Reusable password input)
│       ├── TextInputField.tsx       (Generic text input)
│       ├── AuthButton.tsx           (Reusable auth button)
│       ├── AuthSuccess.tsx          (Success message component)
│       └── index.ts                 (Centralized exports)
│
├── Business Logic (Hooks)
│   └── lib/hooks/useFormValidation.ts
│       ├── useFormValidation()      (Generic form hook)
│       ├── useLoginForm()           (Login-specific hook)
│       ├── useSignUpForm()          (Signup-specific hook)
│       ├── useResetPasswordForm()   (Password reset hook)
│       ├── useChangePasswordForm()  (Password change hook)
│       ├── useForgotPasswordForm()  (Forgot password hook)
│       └── useVerificationCodeForm() (Code verification hook)
│
├── Shared Utilities
│   ├── shared/validators.ts         (All validation functions)
│   ├── shared/auth.service.ts       (API calls & business logic)
│   └── lib/auth-context.tsx         (Auth state management)
│
└── HTTP Layer
    └── shared/httpService.ts        (Axios instance & API communication)
```

## Architecture Layers

### 1. **View Layer** (Screens in `app/`)

- **Responsibility**: Render UI and handle user interactions
- **What NOT to do**:
  - ❌ No validation logic
  - ❌ No API calls
  - ❌ No complex state management
- **What to do**:
  - ✅ Call hooks for form state
  - ✅ Render components
  - ✅ Handle navigation
  - ✅ Show error/success messages

```tsx
// Example: Login Screen
export default function LoginScreen() {
  // Get form state from custom hook
  const { values, errors, touched, handleChange, handleBlur, validateAll } = useLoginForm();

  // Call API through auth context
  const handleLogin = async () => {
    if (!validateAll()) return;
    await login(values.email, values.password);
  };

  // Render UI components
  return <EmailInput value={values.email} ... />;
}
```

### 2. **UI Component Layer** (`components/domain/auth/`)

- **Responsibility**: Reusable presentation components
- **Features**:
  - Theme-aware styling
  - Error display
  - Loading states
  - Consistent look & feel
  - No business logic

```tsx
// Example: EmailInput
<EmailInput
  value={values.email}
  onChangeText={(value) => handleChange("email", value)}
  onBlur={() => handleBlur("email")}
  error={touched.email ? errors.email : undefined}
  placeholder="Enter your email"
  editable={!loading}
/>
```

### 3. **Business Logic Layer** (`lib/hooks/`)

- **Responsibility**: Form state management and validation
- **Features**:
  - Generic `useFormValidation()` hook
  - Feature-specific hooks (useLoginForm, useSignUpForm, etc.)
  - Automatic validation on change/blur
  - Touch tracking (shows errors only after user interacts)

```tsx
// Generic hook pattern
const form = useFormValidation(
  { email: "", password: "" },
  {
    email: validators.email,
    password: validators.passwordLogin,
  },
);

// or use specific hook
const form = useLoginForm();

// Hook returns
const {
  values, // Form field values
  errors, // Validation errors
  touched, // Track which fields user has interacted with
  handleChange, // Update field value
  handleBlur, // Mark field as touched
  validateAll, // Validate all fields
  reset, // Reset form to initial state
} = form;
```

### 4. **Shared Validation Layer** (`shared/validators.ts`)

- **Responsibility**: Centralized validation rules
- **Reusable across** multiple screens and forms
- **Validators available**:
  - `validators.email()` - Email format validation
  - `validators.passwordLogin()` - Basic password (6+ chars)
  - `validators.passwordStrong()` - Strong password (8+ chars, uppercase, lowercase, number)
  - `validators.passwordMatch()` - Password confirmation
  - `validators.fullName()` - Name validation
  - `validators.verificationCode()` - 6-digit code

```tsx
// Import and use
import { validators } from "@/shared/validators";

const emailError = validators.email("user@example.com");
const passwordError = validators.passwordStrong("Pass123");
```

### 5. **Auth Service Layer** (`shared/auth.service.ts`)

- **Responsibility**: API communication and authentication logic
- **Separates** API calls from components
- **Methods available**:
  - `login(payload)` - Login user
  - `signup(payload)` - Create new account
  - `forgotPassword(payload)` - Request password reset
  - `verifyResetCode(payload)` - Verify reset code
  - `resetPassword(payload)` - Reset password
  - `changePassword(payload)` - Change password for authenticated user

```tsx
// Usage in components
import { authService } from "@/shared/auth.service";

try {
  const response = await authService.resetPassword({
    email,
    code,
    newPassword: values.newPassword,
  });
  setSuccess(true);
} catch (error) {
  console.error(error.message);
}
```

## Implementation Pattern

### Step 1: Create or Use Custom Hook

```tsx
import { useLoginForm } from "@/lib/hooks/useFormValidation";

const { values, errors, touched, handleChange, handleBlur, validateAll } =
  useLoginForm();
```

### Step 2: Create Form Components

```tsx
import {
  EmailInput,
  PasswordInput,
  AuthButton,
} from "@/components/domain/auth";

// Use components with hook values
<EmailInput
  value={values.email}
  onChangeText={(value) => handleChange("email", value)}
  onBlur={() => handleBlur("email")}
  error={touched.email ? errors.email : undefined}
/>;
```

### Step 3: Handle Form Submission

```tsx
const handleLogin = async () => {
  // Validate all fields
  if (!validateAll()) {
    return;
  }

  // Make API call
  await login(values.email, values.password);
};
```

## Key Benefits

### 1. **Separation of Concerns**

- Views don't know about validation logic
- Components are reusable and testable
- Services handle API communication

### 2. **DRY (Don't Repeat Yourself)**

- Validation rules defined once in `shared/validators.ts`
- Reused across all forms
- Components shared across multiple screens

### 3. **Maintainability**

- Change validation rule in one place → applies everywhere
- Update component design → all screens updated
- Easy to add new validators or form types

### 4. **Testability**

- Validators are pure functions → easy to test
- Hooks can be tested in isolation
- Components can be tested with different props

### 5. **Feature-Based Organization**

- Related code grouped together
- Easy to find auth-related files
- Scales well as app grows

## Adding New Auth Features

### Example: Adding a new form field to signup

1. **Update validator** in `shared/validators.ts`:

```tsx
phone: (phone: string): string => {
  if (!phone) return "Phone is required";
  if (!/^\d{10}$/.test(phone.replace(/\D/g, ""))) return "Invalid phone number";
  return "";
};
```

2. **Update form hook** in `lib/hooks/useFormValidation.ts`:

```tsx
export function useSignUpForm() {
  return useFormValidation(
    { fullName: "", email: "", password: "", confirmPassword: "", phone: "" },
    {
      // ... existing validators
      phone: validators.phone,
    },
  );
}
```

3. **Create input component** if needed (or reuse existing):

```tsx
<TextInputField
  value={values.phone}
  onChangeText={(value) => handleChange("phone", value)}
  onBlur={() => handleBlur("phone")}
  error={touched.phone ? errors.phone : undefined}
  label="Phone"
  placeholder="Enter phone number"
  keyboardType="phone-pad"
/>
```

4. **Update screen** to include new field:

```tsx
// In app/sign-up.tsx
<PhoneInput
  value={values.phone}
  onChangeText={(value) => handleChange("phone", value)}
  onBlur={() => handleBlur("phone")}
  error={touched.phone ? errors.phone : undefined}
/>
```

## Best Practices

### ✅ DO

- ✅ Keep components simple and focused
- ✅ Use custom hooks for form logic
- ✅ Put validation in `shared/validators.ts`
- ✅ Use theme tokens for styling consistency
- ✅ Export reusable components from `components/domain/auth/index.ts`
- ✅ Keep API calls in service layer

### ❌ DON'T

- ❌ Put validation logic in components
- ❌ Make API calls directly from components
- ❌ Duplicate validation rules
- ❌ Create one-time-use components
- ❌ Mix UI logic with business logic
- ❌ Import components directly (use index.ts exports)

## File Reference

| File                             | Purpose                | Export                |
| -------------------------------- | ---------------------- | --------------------- |
| `shared/validators.ts`           | All validation rules   | `validators` object   |
| `shared/auth.service.ts`         | Auth API calls         | `authService` object  |
| `lib/hooks/useFormValidation.ts` | Form state management  | Specific hooks        |
| `components/domain/auth/`        | Reusable UI components | Individual components |
| `app/login.tsx`                  | Login screen           | Screen component      |
| `app/sign-up.tsx`                | Sign up screen         | Screen component      |
| `app/reset-password.tsx`         | Password reset screen  | Screen component      |
| `lib/auth-context.tsx`           | Global auth state      | Auth context          |

## Migration Guide (If applying to existing screens)

For other auth screens (forgot-password, verification-code, change-password):

1. Extract validation logic → `shared/validators.ts`
2. Create custom hook → `lib/hooks/useFormValidation.ts`
3. Extract API calls → `shared/auth.service.ts`
4. Replace inline components with reusable ones
5. Update screen to use new architecture

---

**Version**: 1.0  
**Last Updated**: 2026-04-23  
**Pattern**: Feature-Based Design with Separation of Concerns
