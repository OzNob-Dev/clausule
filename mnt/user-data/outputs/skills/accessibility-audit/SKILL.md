---
name: accessibility-audit
description: >
  Principal accessibility audit methodology covering WCAG 2.2 structured review,
  axe-core rules mapped to React patterns, keyboard testing protocol, screen reader
  testing protocol, color contrast audit workflow, and common React/Next.js a11y failures.
  Load when performing an accessibility audit, reviewing a11y compliance, preparing
  for WCAG certification, or doing a pre-release accessibility pass.
---

# Accessibility Audit — Principal Standards

## Audit Methodology

Run in this order:

```
1. Automated scan    → axe-core / browser DevTools (catches ~30-40% of issues)
2. Keyboard audit    → tab through every interaction without touching mouse
3. Zoom audit        → 200% and 400% zoom — content must not break
4. Color audit       → contrast ratios for all text and interactive elements
5. Screen reader     → full user journey with VoiceOver/NVDA
6. Motion audit      → verify prefers-reduced-motion respected
7. Code review       → semantic HTML, ARIA correctness, focus management
```

Automated tools catch the easy stuff. Keyboard and screen reader testing catches the real issues.

## Automated Scanning

### axe-core in Tests (CI Gate)
```typescript
// vitest + @axe-core/react
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(<LoginForm />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Playwright a11y in E2E
```typescript
import { checkA11y } from 'axe-playwright';

test('dashboard is accessible', async ({ page }) => {
  await page.goto('/dashboard');
  await checkA11y(page, undefined, {
    detailedReport: true,
    detailedReportOptions: { html: true },
    axeOptions: {
      rules: { 'color-contrast': { enabled: true } },
    },
  });
});
```

### Browser Audit (Manual)
```
Chrome: DevTools → Lighthouse → Accessibility
Firefox: Accessibility Inspector (F12 → Accessibility tab)
axe DevTools extension: most comprehensive free tool
```

## Keyboard Testing Protocol

Every feature must be fully operable by keyboard alone. Test this sequence:

```
1. Tab        → moves focus forward through interactive elements
2. Shift+Tab  → moves focus backward
3. Enter      → activates links and buttons
4. Space      → activates buttons and checkboxes
5. Arrow keys → navigates within widgets (tabs, select, radio, menu, slider)
6. Escape     → closes overlays, cancels operations
7. Home/End   → jumps to first/last in list widgets

FOR EVERY PAGE, VERIFY:
□ All interactive elements reachable by Tab
□ Tab order is logical (follows visual flow)
□ Focus indicator visible at all times (no outline: none without replacement)
□ No keyboard traps (can Tab out of everything)
□ Modal dialogs trap focus correctly (Tab cycles within modal)
□ Escape closes modals, drawers, dropdowns
□ Skip navigation link appears on first Tab press
□ Dynamic content (loaded via async) receives focus or is announced
□ Drag-and-drop has keyboard alternative
```

### Common Keyboard Failures in React

```typescript
// FAILURE: onClick only (not keyboard accessible)
<div onClick={handleSelect}>Option</div>
// FIX: use button or add keyboard handler
<button type="button" onClick={handleSelect}>Option</button>

// FAILURE: focus lost after modal closes
setIsOpen(false); // focus disappears into void
// FIX: return focus to trigger
const triggerRef = useRef<HTMLButtonElement>(null);
const handleClose = () => { setIsOpen(false); triggerRef.current?.focus(); };

// FAILURE: custom dropdown with no arrow key support
// FIX: implement APG Combobox or Listbox pattern with arrow keys

// FAILURE: tab panel switching only responds to click
// FIX: tabs respond to arrow keys (left/right), Enter, Space per APG pattern

// FAILURE: focus moves to wrong element after form submit
// FIX: focus error summary or first error field after failed submit
```

## Focus Indicator Audit

```css
/* FAILURE: removed outline with no replacement */
* { outline: none; }
button:focus { outline: none; }

/* MINIMUM: browser default with offset */
:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }

/* BETTER: high visibility for all themes */
:focus-visible {
  outline: 3px solid var(--border-focus);
  outline-offset: 2px;
  border-radius: 2px;
}

/* AUDIT CHECK: every interactive element */
/* Tab through the entire page. At no point should focus be invisible. */
```

Contrast requirement for focus indicators: 3:1 against adjacent colors (WCAG 2.2 — new requirement).

## Color Contrast Audit

### Tools
```
Browser DevTools → Elements panel → Computed → color (shows contrast ratio)
Colour Contrast Analyser (desktop app) — pick colors from screen
axe DevTools — automated contrast checking
```

### Requirements
```
Normal text (<18px or <14px bold):   4.5:1 minimum (AA), 7:1 (AAA)
Large text (≥18px or ≥14px bold):   3:1 minimum (AA), 4.5:1 (AAA)
UI components and icons:             3:1 minimum (AA)
Disabled elements:                   No requirement (but don't rely on color alone)
Focus indicators:                    3:1 against adjacent colors (WCAG 2.2)
```

### Common Failures
```
- Placeholder text (typically gray on white — usually fails)
- Disabled button text (often too light)
- Secondary/muted text in dark mode
- Brand color on white background (check your primary blue/green/etc.)
- Error red text (some reds fail on white)
- Success green text (most greens fail on white)
- Text on gradient backgrounds (check multiple points)
- Icon-only buttons (icon must meet 3:1, not just color)
```

## Screen Reader Testing Protocol

### Tools
```
macOS:       VoiceOver (Cmd+F5 to toggle)
iOS:         VoiceOver (Settings → Accessibility → VoiceOver)
Windows:     NVDA (free) + Chrome or Firefox
Android:     TalkBack
```

### VoiceOver Quick Reference (macOS)
```
VO = Ctrl+Option

VO+Right      → next element
VO+Left       → previous element
VO+Space      → activate
VO+U          → rotor (headings, links, landmarks)
VO+Cmd+H      → next heading
Tab           → next interactive element
Escape        → close dialogs
```

### Screen Reader Audit Checklist
```
PAGE STRUCTURE:
□ Page has exactly one <h1>
□ Heading hierarchy is logical (h1 → h2 → h3, no skips)
□ Landmark regions present: header, nav, main, footer
□ Navigation landmark labeled (aria-label="Main navigation")
□ Multiple nav landmarks have distinct labels
□ Page title (document.title) is descriptive and unique

INTERACTIVE ELEMENTS:
□ All buttons have accessible names (visible text or aria-label)
□ Icon-only buttons have aria-label
□ All inputs have labels (not just placeholder)
□ Select elements have labels
□ Links have descriptive text (not "click here" or "read more")
□ Links that open in new tab warn users (aria-label="... opens in new tab")

DYNAMIC CONTENT:
□ Loading states announced (aria-live region or aria-busy)
□ Success messages announced (role="status" or aria-live="polite")
□ Error messages announced (role="alert" or aria-live="assertive")
□ Route changes announced (see navigation skill)
□ Toast notifications announced

IMAGES:
□ Meaningful images have descriptive alt text
□ Decorative images have alt=""
□ Icon SVGs: aria-hidden="true" when decorative, aria-label when meaningful
□ Charts/graphs have text alternatives or descriptions

FORMS:
□ Field errors associated with field (aria-describedby)
□ aria-invalid="true" on invalid fields
□ Error summary at top of form after failed submit
□ Required fields indicated (aria-required or visible indicator)
□ Groups of related inputs wrapped in fieldset/legend

MODALS:
□ Modal title announced on open (aria-labelledby)
□ Focus moves into modal on open
□ Escape closes modal
□ Focus returns to trigger on close
□ Background content inert (not read while modal open)
```

## Common React/Next.js A11y Failures

### Pattern Failures Ranked by Frequency

```
P0 — Breaks screen reader completely:
  - Modal without focus trap (user gets lost)
  - Form errors with no SR announcement
  - Route changes with no announcement

P1 — Major degradation:
  - Interactive elements not keyboard accessible
  - Missing form labels
  - No skip navigation
  - Insufficient color contrast
  - Focus indicator invisible

P2 — Meaningful degradation:
  - Icon buttons without aria-label
  - Decorative images with meaningful alt text (read as noise)
  - Heading hierarchy skipped
  - Links with generic text ("click here")
  - aria-label that duplicates visible text (double-read)

P3 — Minor issues:
  - Missing landmark regions
  - Placeholder used as label
  - Table missing th scope
  - Animation without reduced-motion fallback
```

### ARIA Misuse Patterns
```typescript
// WRONG: role conflicts with native element
<button role="link">Go back</button>  // use <a> or <Link>
<a role="button">Submit</a>           // use <button>

// WRONG: aria-label duplicates visible text
<button aria-label="Save">Save</button>  // redundant, aria-label overrides text

// WRONG: aria-hidden on focusable element
<button aria-hidden="true">Close</button>  // hidden from SR but still focusable

// WRONG: aria-describedby points to hidden element
<input aria-describedby="hint" />
<span id="hint" hidden>Must be 8 chars</span>  // hidden elements not read

// WRONG: live region added dynamically
// aria-live regions must exist in DOM before content is injected
// CORRECT: render live region empty, then populate it

// WRONG: role="button" on div without keyboard handler
<div role="button" onClick={fn}>Click me</div>
// Missing: onKeyDown for Enter/Space, tabIndex={0}
```

## WCAG 2.2 New Requirements

New in WCAG 2.2 — check these specifically:
```
2.4.11 Focus Appearance (AA): Focus indicator meets minimum size and contrast
2.4.12 Focus Appearance (AAA): Enhanced focus indicator requirements  
2.4.13 Focus Appearance: 3:1 contrast for focus indicator (NEW — commonly missed)
2.5.3 Label in Name: accessible name contains visible label text
2.5.7 Dragging Movements: alternative to drag for all drag operations
2.5.8 Target Size Minimum: 24x24px minimum (AA) — weaker than our 44px standard
3.2.6 Consistent Help: help mechanisms in same location across pages
3.3.7 Redundant Entry: don't re-ask for info already provided in same process
3.3.8 Accessible Authentication: no cognitive function test for auth (no CAPTCHAs without alternatives)
```

## Audit Report Format
```
WCAG Criterion: 1.4.3 Contrast (Minimum)
Level: AA
Severity: P1
Component: PrimaryButton (src/shared/components/ui/Button/Button.tsx)
Issue: Button text (#ffffff) on disabled background (#94a3b8) — ratio 2.1:1, requires 4.5:1
Reproduction: Render <Button disabled>Save</Button>
Fix: Increase disabled background to #6b7280 or darker, or use opacity with sufficient base contrast
```
