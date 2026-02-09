# GrocerEase Mobile App

This is the mobile application for GrocerEase, built using React Native with Expo.

---

# Development

**Important Instructions For Source Control**:

- Create **branch** for every development/fixes tasks
  - For feature development create a branch with prefix `feat/`
  - For bug fixes create a branch with prefix `fix/`
- DO NOT push on **master or staging** branches directly, instead create a PRs.
- DO NOT merge any PRs into **master** before review.
- Before any branch creation from **staging** branch, make sure to pull the latest changes

## Start Development

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo Go app (for testing on physical device)
- Android Studio (for Android emulator) or Xcode (for iOS simulator)

### Clone the Repository

```bash
git clone https://github.com/Amr-Elharery/GrocerEase_app.git
cd GrocerEase_app/prototype/grocerease_app
```

### Install Dependencies

```bash
npm install
```

### I18n Setup

We use `i18next` + `react-i18next` + `expo-localization`.

Install the packages:

```bash
npm install i18next react-i18next expo-localization
```

Translations are stored in [locales/en.json](locales/en.json) and [locales/ar.json](locales/ar.json) using namespaces (e.g., `common`, `home`).

Switch language in code with `setLanguage('en')` / `setLanguage('ar')` from [lib/i18n/index.ts](lib/i18n/index.ts).

### Add new screen (i18n)

1. Create the screen file under [app/](app/) (Expo Router uses file-based routing). Example: [app/profile.tsx](app/profile.tsx).
2. Add translation keys to [locales/en.json](locales/en.json) and [locales/ar.json](locales/ar.json) under a namespace for the screen (e.g., `profile`).
3. Use the keys in the screen with `t('profile.title')` or similar.

### Start Development Server

```bash
npm start
# or
npx expo start
# or
yarn start
```

This will open the Expo Dev Tools. From there you can:

- Press `a` to open in Android emulator
- Press `i` to open in iOS simulator
- Press `w` to open in web browser
- Scan the QR code with Expo Go app on your phone

### Run on Specific Platform

```bash
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
```

---

# How to create branch and start working

1. Create branch from staging branch
   ```bash
   git switch staging
   git pull origin staging
   git switch -c feat/your-feature-name
   ```
2. After completing your work, push your branch to remote
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin feat/your-feature-name
   ```
3. Create a Pull Request (PR) from your branch to staging branch on GitHub for review and merging.

4. After PR is approved and merged, switch back to staging branch and pull the latest changes
   ```bash
   git switch staging
   git pull origin staging
   ```

---

# Notes

- Please make sure to follow the above instructions carefully to maintain a clean and organized workflow.

- Feel free to reach out if you have any questions or need assistance!

- Good luck Team!

---

Best Regards,
Amr Elharery
