# Calendly Integration Plan: Swift Appointment

This document outlines the strategic plan to integrate Calendly booking into the Newman Chiropractic website using native embeds (not the Scheduling API).

## A) Recommended Embed Approach
**Recommendation**: **Advanced JS Embed (Calendly Widget JS)**

### Reasoning:
- **Consistency**: The JS widget provides a more native-feeling experience compared to a static iframe, specially for responsive height adjustments.
- **Modal Support**: It enables the easy implementation of both inline embeds and popup/modal triggers using the same library.
- **Branding Control**: Customization parameters (`primary_color`, `background_color`) are easier to manage and pass dynamically via JS.
- **React Integration**: By using a wrapper or the standard `assets.calendly.com/assets/external/widget.js` script via a `useEffect` hook, we can ensure the widget only loads on the client side, avoiding SSR breakage on platforms like Vercel.

---

## B) Step-by-Step Tasks List

### 1. Preparation & Configuration
- [ ] Configure the Event Type in the Calendly Admin Dashboard.
- [ ] Set up "Invitee Questions" directly in Calendly.
- [ ] Obtain the Event Type URL (e.g., `https://calendly.com/newman-chiro/consultation`).

### 2. Infrastructure Setup
- [ ] Add `VITE_CALENDLY_URL` and branding hex codes to `.env` and `.env.example`.
- [ ] Add the Calendly script loading logic (safe for React).

### 3. Component Development
- [ ] **[NEW] `CalendlyLauncher.tsx`**: A utility component/hook to handle script loading and initialization.
- [ ] **[NEW] `CalendlyInline.tsx`**: A component for the 100% width inline section.
- [ ] **[NEW] `CalendlyPopupButton.tsx`**: A button component that triggers the Calendly modal.

### 4. Website Integration
- [ ] Add a "Book a Session" section to the landing page (`src/pages/Index.tsx`).
- [ ] Replace existing booking CTAs in `FinalCTA.tsx` or Header with the `CalendlyPopupButton`.
- [ ] (Optional) If a dedicated route is required, add `/book` to `src/App.tsx`.

### 5. Branding & Polish
- [ ] Apply brand colors: `primary_color` should match Newman Chiro's primary blue.
- [ ] Set `hide_gdpr_banner: true` (if company policy allows/handles it elsewhere).

---

## C) Files/Components Affected

### [NEW]
- `src/components/calendly/CalendlyInline.tsx`
- `src/components/calendly/CalendlyModal.tsx`
- `src/hooks/useCalendly.ts` (For safe script loading)

### [MODIFY]
- `.env` / `.env.example`
- `src/pages/Index.tsx` (Add inline section after Services or Logistics)
- `src/components/FinalCTA.tsx` (Update button to trigger modal)
- `src/components/StickyHeader.tsx` (Update "Book Now" button)

---

## D) Environment/Config Needed

Store these in your `.env` file (Vercel environment variables):
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_CALENDLY_URL` | Your event type link | `https://calendly.com/user/event` |
| `VITE_CALENDLY_BG_COLOR` | Widget background | `ffffff` |
| `VITE_CALENDLY_TEXT_COLOR` | Widget text | `1e293b` |
| `VITE_CALENDLY_PRIMARY_COLOR` | Progress/buttons color | `0ea5e9` |

---

## E) QA Checklist

- [ ] **Device Check**: Verify widget responsiveness on iPhone/Android and Desktop Chrome/Safari.
- [ ] **Modal Behavior**: Ensure scrolling is disabled on the main page when the Calendly modal is open.
- [ ] **Adblockers**: Confirm the widget still loads with common adblockers enabled (some block standard `widget.js`).
- [ ] **Cookie Consent**: Verify if the widget respects/triggers third-party cookie warnings.
- [ ] **Timezone**: Confirm the widget correctly defaults to the visitor's local timezone.
- [ ] **No SSR Error**: Ensure no "window is not defined" errors occur during build or initial load.

---

## F) Rollout Plan

1. **Local Dev**: Verify script loading and style matching.
2. **Staging**: Deploy to a Vercel preview branch for team testing.
3. **Production**: Merge to `main`.
4. **Fallback**: If the script fails to load (e.g., blocked by network), the components will render a elegant "Open in Calendly" button as a direct link fallback.

---

## G) Future Upgrades

- **Data Prefill**: Map `auth.user.email` and `auth.user.full_name` to Calendly params to save users time.
- **UTM Tracking**: Pass campaign source/medium to Calendly URLs for better marketing attribution.
- **Webhooks**: (Required paid plan) Set up a Supabase Edge Function to receive Calendly webhooks and update the internal `bookings` table automatically.
- **Success Events**: Use `calendly.event_scheduled` listener to trigger custom site-side analytics or pixel events.

> [!NOTE]
> **Branding Limitations**: Calendly embeds do not allow custom CSS injection via your site. We are limited to the provided `primary_color`, `text_color`, and `background_color` attributes.
