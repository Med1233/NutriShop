# Internationalization (i18n)

## Overview

The app supports three languages with full RTL (right-to-left) support:

| Code | Language | Direction |
| ---- | -------- | --------- |
| `en` | English  | LTR       |
| `fr` | Français | LTR       |
| `ar` | العربية  | RTL       |

The implementation uses a custom React context — no external i18n library is needed.

---

## Files

### `frontend/src/app/i18n/translations.ts` — Translation Dictionaries

Contains all translatable strings organized as a flat key-value map per locale.

```typescript
export const translations: Record<Locale, Record<string, string>> = {
  en: {
    'app.name': 'Full Stack App',
    'nav.greeting': 'Hi, {name}',
    // ... all keys
  },
  fr: {
    /* same keys, French values */
  },
  ar: {
    /* same keys, Arabic values */
  },
};
```

#### Key Naming Convention

Keys use dot notation: `<section>.<item>`

| Prefix         | Used In                                             |
| -------------- | --------------------------------------------------- |
| `app.*`        | Global (app name — NutriShop)                       |
| `nav.*`        | Navbar (greeting, cart, orders)                     |
| `common.*`     | Shared strings (loading, add to cart, remove, etc.) |
| `home.*`       | Homepage (hero, search, catalog)                    |
| `categories.*` | Product category names                              |
| `product.*`    | Product detail page                                 |
| `cart.*`       | Shopping cart page                                  |
| `checkout.*`   | Checkout page                                       |
| `orders.*`     | Order history page                                  |
| `status.*`     | Order status labels                                 |
| `profile.*`    | User profile page (info + orders tabs)              |
| `admin.*`      | Admin panel (products, users, orders management)    |
| `login.*`      | Login page                                          |
| `register.*`   | Registration page                                   |

#### Interpolation

Dynamic values use `{placeholder}` syntax:

```typescript
'nav.greeting': 'Hi, {name}'
// Usage: t('nav.greeting', { name: 'John' }) → "Hi, John"
```

The `t()` function replaces `{key}` with the provided value.

---

### `frontend/src/app/i18n/LanguageContext.tsx` — Language Context

Provides language state and translation function to the entire app.

#### Context Value

```typescript
interface LanguageContextType {
  locale: Locale; // Current language code
  setLocale: (l: Locale) => void; // Change language
  t: (key: string, params?: Record<string, string>) => string; // Translate
  dir: 'ltr' | 'rtl'; // Text direction
}
```

#### How `t()` Works

1. Look up `key` in `translations[currentLocale]`
2. If not found, fall back to `translations.en`
3. If still not found, return the raw key string
4. Replace any `{param}` placeholders with provided values

#### Persistence

- Language preference is saved to `localStorage` under the key `"lang"`
- On load, the provider reads `localStorage` and applies the saved language
- Default is `"en"` if nothing is saved

#### RTL Support

When the locale changes, two things happen via `useEffect`:

```typescript
document.documentElement.lang = locale; // e.g., "ar"
document.documentElement.dir = dir; // "rtl" or "ltr"
```

Setting `dir="rtl"` on the `<html>` element causes:

- Flexbox layouts to reverse automatically (navbar brand goes right, actions go left)
- Text alignment to default to right
- Form inputs to align right
- All of this happens without any CSS changes because the existing styles use flexbox, which is direction-aware

#### Hydration Safety

The context defaults to `"en"` during server rendering and only reads `localStorage` in a `useEffect` (client-side only). This avoids React hydration mismatches between server HTML and client state.

---

### `frontend/src/app/components/LanguageSelector.tsx` — Language Dropdown

A `<select>` element that appears in the Navbar on every page (logged in or not).

```
┌──────────────┐
│ English    ▼ │  ← shows current language
├──────────────┤
│ English      │
│ Français     │
│ العربية      │
└──────────────┘
```

Changing the selection calls `setLocale()`, which:

1. Updates React state → all `t()` calls re-render with new translations
2. Saves to `localStorage` → persists across page reloads
3. Updates `document.documentElement.dir` → flips layout for Arabic

---

## How Components Use Translations

Every component that displays text:

1. Imports the hook:

   ```typescript
   import { useLanguage } from '../i18n/LanguageContext';
   ```

2. Destructures what it needs:

   ```typescript
   const { t, dir } = useLanguage();
   ```

3. Replaces hardcoded strings:

   ```typescript
   // Before:
   <h1>Sign In</h1>

   // After:
   <h1>{t('login.title')}</h1>
   ```

4. For dynamic text with variables:

   ```typescript
   // Before:
   <span>Hi, {user.name}</span>

   // After:
   <span>{t('nav.greeting', { name: user.name })}</span>
   ```

5. For direction-sensitive styles (e.g., icon margins):

   ```typescript
   // Before:
   style={{ marginRight: 8 }}

   // After:
   style={{ [dir === 'rtl' ? 'marginLeft' : 'marginRight']: 8 }}
   ```

---

## Adding a New Language

1. Add the locale code to the `Locale` type in `translations.ts`:

   ```typescript
   export type Locale = 'en' | 'fr' | 'ar' | 'es';
   ```

2. Add the display name in `localeNames`:

   ```typescript
   export const localeNames: Record<Locale, string> = {
     en: 'English',
     fr: 'Français',
     ar: 'العربية',
     es: 'Español',
   };
   ```

3. Add the translation dictionary with all keys:

   ```typescript
   es: {
     'app.name': 'Aplicación Full Stack',
     // ... all keys
   },
   ```

4. If the language is RTL, add it to `rtlLocales`:
   ```typescript
   export const rtlLocales: Locale[] = ['ar', 'he'];
   ```

No other files need to change — the `LanguageSelector` automatically picks up new languages, and `t()` will use the new translations.

---

## Adding a New Translatable String

1. Add the key to ALL locale dictionaries in `translations.ts`:

   ```typescript
   en: { ..., 'feature.newLabel': 'New Feature' },
   fr: { ..., 'feature.newLabel': 'Nouvelle fonctionnalité' },
   ar: { ..., 'feature.newLabel': 'ميزة جديدة' },
   ```

2. Use it in the component:
   ```typescript
   <span>{t('feature.newLabel')}</span>
   ```

If you forget to add a translation for a locale, `t()` falls back to the English version, then to the raw key — so the app won't break, it just won't be translated.
