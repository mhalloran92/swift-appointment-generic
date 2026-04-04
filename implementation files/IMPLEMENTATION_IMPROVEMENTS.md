## Front-End Improvement Implementation Plan

This document tracks implementation of front-end improvements only. No backend work is included here.

---

## 1. Global UX, Navigation, and Structure

- [ ] **Audit existing layout**
  - [ ] Confirm section order: Hero → Appointment Types → Trust/Doctor → Patient Results → Logistics/What to Expect → Final CTA.
  - [ ] Verify each main section uses a consistent heading level (`h2`) with a short subtitle.
  - [ ] Ensure `main` and `footer` structure is semantically correct and accessible.

- [ ] **Add section-based navigation (optional, nice-to-have)**
  - [ ] Decide whether navigation lives in `StickyHeader` or a separate component.
  - [ ] Define anchor IDs for all major sections (Hero, Services, Trust, Testimonials, Logistics, Final CTA).
  - [ ] Add nav items that smooth-scroll to each section.
  - [ ] Ensure nav items are keyboard accessible and have visible focus states.

- [ ] **Clarify audience and conditions**
  - [ ] Brainstorm and finalize a concise list of “Conditions treated” and/or “Who we help.”
  - [ ] Decide where to place this information (near `ServicesSection` or `LogisticsSection`).
  - [ ] Implement visually as chips, list, or a compact card.
  - [ ] Check copy for medical accuracy and plain-language readability.

---

## 2. Hero & Sticky Header

- [ ] **Refine hero messaging**
  - [ ] Keep or adjust main headline (“End the Pain. Restore Your Movement.”) based on final brand voice.
  - [ ] Add a supporting line with social proof or specificity (e.g., local focus, professional audience).
  - [ ] Ensure text scales well across mobile, tablet, and desktop (line lengths, font sizes).

- [ ] **Improve primary and secondary CTAs**
  - [ ] Decide on primary CTA label (e.g., “Book Your Appointment”).
  - [ ] Add a secondary CTA (e.g., “See Appointment Types”) that scrolls to `ServicesSection`.
  - [ ] Ensure button hierarchy is clear (primary vs secondary).
  - [ ] Confirm consistent CTA labels across hero, header, services, and final CTA.

- [ ] **Handle “Booking coming soon” gracefully**
  - [ ] Finalize microcopy for pre-launch booking state (timeline, alternative contact).
  - [ ] Decide whether CTA opens a toast, modal/drawer, or dedicated placeholder section.
  - [ ] Provide a clear alternative: phone, email, or simple contact form.
  - [ ] Make sure the temporary behavior is clearly distinguishable from a real booking flow.

- [ ] **Polish sticky header behavior**
  - [ ] Verify scroll threshold for “scrolled” state feels natural.
  - [ ] Adjust condensed header styling (height, logo text size, button size) for a deliberate compact look.
  - [ ] Review mobile header layout to avoid crowding (logo text vs CTA button).
  - [ ] Confirm header contrast and shadow provide enough separation from content when scrolled.

---

## 3. Services / Appointment Types

- [ ] **Enhance card content**
  - [ ] Decide whether to surface price ranges or “Starting at” information.
  - [ ] Add optional “Recommended frequency” or “Ideal visit cadence” to cards.
  - [ ] Keep copy concise while clearly differentiating each appointment type.

- [ ] **Refine layout and hierarchy**
  - [ ] Verify grid behavior on small, medium, and large breakpoints (2-column vs 4-column).
  - [ ] Standardize card height or allow natural height based on copy length (choose intentionally).
  - [ ] Confirm consistent use of typography (title, subtitle, meta text).
  - [ ] Ensure `Book This Session` CTA visually stands out but doesn’t compete with main page CTA.

- [ ] **Interaction and animation polish**
  - [ ] Review hover/focus states for cards and buttons (color, border, scale).
  - [ ] Validate `useScrollFadeIn` timing and stagger feel smooth (no late or jarring triggers).
  - [ ] Confirm cards are accessible with keyboard navigation and screen readers.

---

## 4. Trust / Doctor Section

- [ ] **Improve visual representation of the doctor**
  - [ ] Decide whether to use a real photo, a stylized placeholder, or a logo/initials treatment.
  - [ ] Design a more human-feeling card for the portrait area (frame, background, subtle overlays).
  - [ ] Ensure image or illustration is responsive and looks good on all breakpoints.

- [ ] **Strengthen credentials and positioning**
  - [ ] List 2–4 key credentials (degrees, training, techniques) in concise bullet form.
  - [ ] Emphasize local angle (“Pittsburgh-based,” neighborhood, etc.) where appropriate.
  - [ ] Review bullets for clarity and avoid overly technical language unless necessary.

- [ ] **Layout and animation**
  - [ ] Confirm the two-column layout behaves well on tablet and mobile (stacking order, spacing).
  - [ ] Check that scroll animation is not too aggressive (opacity, distance, easing).
  - [ ] Ensure text contrast remains strong on the chosen background.

---

## 5. Testimonials / Patient Results

- [ ] **Enrich testimonial context**
  - [ ] Add short tags or captions (e.g., “Back pain · 6 weeks”) under each testimonial.
  - [ ] Ensure names and roles/ages feel realistic and align with target audience.
  - [ ] Decide whether to highlight one “featured story” with slightly different styling.

- [ ] **Card design and layout**
  - [ ] Review grid layout across breakpoints (1-column on mobile, 2–3 on desktop).
  - [ ] Align heights and internal spacing of testimonial cards for a cohesive row.
  - [ ] Confirm quote styling (size, italics, icon) is readable and visually consistent.

- [ ] **Motion and accessibility**
  - [ ] Tune `useScrollFadeIn` stagger and duration for testimonials.
  - [ ] Ensure testimonials are still readable with reduced motion preferences (if supported).
  - [ ] Check color contrast for text over card backgrounds.

---

## 6. Logistics / “What to Expect”

- [ ] **Clarify visit journey**
  - [ ] Convert the “Your First Visit” bullets into a clear 3–5 step sequence.
  - [ ] Emphasize outcomes and patient experience, not just procedures.
  - [ ] Make sure “Best For” vs “Not Ideal For” is visually and textually obvious.

- [ ] **Chips, badges, and icon usage**
  - [ ] Standardize badge size, color, and radius for “Best For” tags.
  - [ ] Confirm icons (MapPin, Stethoscope, UserCheck, AlertTriangle) are sized consistently.
  - [ ] Verify spacing between icon, heading, and body text is even across all blocks.

- [ ] **Layout and readability**
  - [ ] Validate two-column grid behavior on tablet and desktop; stacked layout on mobile.
  - [ ] Keep line lengths reasonable (no overly long single-line paragraphs).
  - [ ] Check that background and text colors meet accessibility contrast guidelines.

---

## 7. Final CTA / Footer

- [ ] **Strengthen final CTA**
  - [ ] Align wording with hero CTA and header button (“Book Your Appointment” vs “Schedule Your Visit”).
  - [ ] Consider adding a micro line under the button with reassurance (e.g., “No long-term contracts. Flexible scheduling.”).
  - [ ] Verify CTA alignment and spacing on all breakpoints.

- [ ] **Fallback contact options**
  - [ ] Add a visible line near the final CTA or in the footer for phone/email contact.
  - [ ] Ensure these are clickable/tappable (tel: and mailto:).
  - [ ] Include small copy clarifying response time expectations.

- [ ] **Footer polish**
  - [ ] Confirm footer typography (size, color) is legible but unobtrusive.
  - [ ] Decide whether to add minimal navigation or links (e.g., Privacy, Terms, Contact).
  - [ ] Keep footer visually light to avoid competing with final CTA.

---

## 8. Visual System, Motion, and Accessibility Pass

- [ ] **Spacing and rhythm**
  - [ ] Standardize vertical spacing scale between headings, body text, and CTAs.
  - [ ] Ensure section paddings are consistent and align with design tokens.
  - [ ] Fix any inconsistent margins that cause visual “jumps” between sections.

- [ ] **Color, typography, and components**
  - [ ] Verify color usage (primary, secondary, muted) is consistent across all sections.
  - [ ] Confirm typography scale (h1–h4, body, small) is applied uniformly.
  - [ ] Align card design system (border radius, shadow, borders) across services, testimonials, and logistics.

- [ ] **Animation and motion system**
  - [ ] Audit all uses of `useScrollFadeIn` for consistency (easing, duration, distance, delay).
  - [ ] Avoid over-animating; limit heavy motion to first appearances of each pattern.
  - [ ] Consider honoring reduced-motion preferences where possible.

- [ ] **Accessibility and semantics**
  - [ ] Review heading hierarchy (`h1` in hero, `h2` for main sections, `h3`/`h4` inside cards).
  - [ ] Ensure all interactive elements (buttons, links, cards if clickable) have visible focus states.
  - [ ] Run a contrast check on text and icons against their backgrounds.
  - [ ] Test keyboard navigation flow from top to bottom of the page.

---

## 9. QA Checklist Before Release

- [ ] **Cross-device testing**
  - [ ] Test layout and interactions on at least one small phone, one large phone, one tablet, and desktop viewport.
  - [ ] Verify sticky header behavior and section scrolling on touch devices.

- [ ] **Content review**
  - [ ] Proofread all copy for typos, clarity, and tone.
  - [ ] Confirm that all references to booking status (live vs coming soon) are accurate and consistent.

- [ ] **Performance and polish**
  - [ ] Confirm animations do not noticeably jank on scroll.
  - [ ] Check that images/illustrations are optimized and load quickly.
  - [ ] Ensure no console errors or obvious front-end warnings related to these changes.

