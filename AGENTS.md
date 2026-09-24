# Codex Master Build Prompt — Office Desk

You are the senior product engineer, product designer, QA lead, security reviewer, and release owner for this project. Take the project from its current state—whether that is an empty folder, partial repository, or rough prototype—to a complete, tested, production-ready, deployed application.

Do not stop after planning, scaffolding, or creating mockups. Inspect the environment, make the implementation decisions, write the code, run the application, test it, fix defects, improve usability, commit the work, push it to GitHub, deploy it, and verify the live result.

Ask a question only when a true external blocker exists, such as missing GitHub authentication or a permission that cannot be resolved from the environment. Otherwise, use the defaults in this prompt and continue.

---

## 1. Product Objective

Build **Office Desk**, a lightweight, zero-install browser utility for Windows office workers and administrators.

The application has one visually dominant flagship feature:

> A polished date-and-time countdown for vacations, birthdays, goal start dates, goal completion dates, project launches, and other milestones, with large days/hours/minutes/seconds and an optional celebration when the date is reached.

Around that flagship countdown, include a small set of high-value office tools:

- Timer
- Meeting timer
- Focus timer
- Quick note/checklist
- Text tools
- Date and business-day calculator
- Percentage/business calculator
- QR-code generator

This is intentionally not a full productivity suite. Keep it fast, understandable, private, and lightweight.

---

## 2. Required Final Outcome

The task is complete only when all of the following exist and have been verified:

1. A complete Git repository named `office-desk` unless an existing repository name should be preserved.
2. A production build hosted through GitHub Pages.
3. A working public URL that can be shared with a friend and opened in Edge or Chrome without installation.
4. A Progressive Web App that can work offline after the first successful hosted load.
5. A portable, network-independent `OfficeDesk.html` build that can be copied to another Windows computer and opened locally by double-clicking it.
6. All agreed features implemented—not placeholders.
7. Automated tests passing.
8. Responsive layouts verified on desktop, laptop, tablet, and phone-sized viewports.
9. Accessibility checks completed.
10. A ten-pass quality review completed, documented, and followed by corrective changes.
11. A README with setup, use, privacy, build, deployment, and update instructions.
12. A final release report containing the repository URL, live URL, test results, screenshots, known limitations, and exact deployment status.

Do not call the task complete while critical or high-severity defects remain.

---

## 3. Operating Assumptions

Use these assumptions unless the existing repository establishes a better compatible standard:

- A public GitHub repository is acceptable because this application contains no secrets or proprietary data.
- GitHub Pages is the primary hosting target.
- The primary user environment is Windows 10/11 with current Microsoft Edge or Google Chrome.
- The application must also be usable on modern mobile browsers.
- No backend, database server, login, account, analytics service, advertisement, cloud sync, or paid API is allowed.
- User content remains on the device unless the user explicitly creates a shareable configuration link.
- No company branding, confidential information, or UCT-specific information should be included.
- All built-in art, icons, and backgrounds must be locally bundled or generated with CSS/SVG. Do not depend on remote images, fonts, CDNs, or runtime APIs.
- Use the browser’s locale for date and number presentation, while storing countdown target instants unambiguously.
- Prefer reliable native browser capabilities over unnecessary dependencies.

---

## 4. Product Name, Tone, and Positioning

**Name:** Office Desk  
**Tagline:** A small place for the time and office tools you use every day.

The interface should feel:

- Friendly and slightly playful
- Professional enough for an office or conference-room display
- Calm rather than childish
- Fast and obvious
- Clean enough for nontechnical users

The primary countdown should feel emotionally rewarding for vacations and goals. The secondary utilities should feel efficient and restrained.

---

## 5. Information Architecture

Use a simple application shell with hash-based navigation so GitHub Pages refreshes do not produce routing errors.

Recommended routes:

- `#/` — Home
- `#/countdown` — Event countdowns
- `#/timer` — Timer/count-up/end-at-time
- `#/meeting` — Meeting timer
- `#/focus` — Focus timer
- `#/notes` — Quick note and checklist
- `#/text` — Text tools
- `#/dates` — Date calculator
- `#/percent` — Percentage calculator
- `#/qr` — QR-code generator
- `#/settings` — Appearance and app settings

The home screen should remain compact and include:

1. A prominent primary-countdown hero card.
2. A **Time** section with four cards:
   - Countdown
   - Timer
   - Meeting
   - Focus
3. A **Tools** section with five cards:
   - Quick Note
   - Text Tools
   - Dates
   - % Calculator
   - QR Code

Do not create a crowded analytics dashboard.

---

## 6. Visual Design Direction

### 6.1 Core palette

Use CSS custom properties and support light, dark, and system modes.

Suggested light palette:

- Page background: `#F6F7FB`
- Main surface: `#FFFFFF`
- Primary text: `#172033`
- Secondary text: `#667085`
- Primary accent: `#6C63FF` (soft indigo)
- Secondary accent: `#2FB7A8` (teal)
- Success: `#22A06B`
- Warning: `#F59E0B`
- Danger/overtime: `#D64550`
- Border: `#E5E7EF`

Suggested dark palette:

- Page background: `#0F131A`
- Main surface: `#181D27`
- Elevated surface: `#202635`
- Primary text: `#F6F7FB`
- Secondary text: `#AAB2C0`

Use the palette as a starting point. Refine it after contrast and visual review.

### 6.2 Typography

- Use a native system font stack. Do not load Google Fonts or external font files.
- Use `font-variant-numeric: tabular-nums` for timers and countdowns.
- Countdown digits should be visually dominant and scale with `clamp()`.
- Headings should be clear and moderate, not oversized everywhere.

### 6.3 Frames and components

- Rounded cards in the 18–24 px range.
- Soft, restrained shadows.
- Clear focus rings.
- Large click targets.
- Simple labeled icons; do not rely on icon-only controls for critical actions.
- Use a consistent spacing scale.
- Use drawers, sheets, or focused modals for creation/editing rather than long cluttered forms on the main view.
- Use toasts for actions such as copied, saved, deleted, or invalid input.

### 6.4 Built-in countdown themes

Create six lightweight themes using CSS gradients and original inline SVG/CSS decoration rather than downloaded stock images:

1. **Minimal** — clean, neutral, office-appropriate.
2. **Vacation** — warm sky gradient, abstract sun, waves, subtle palm silhouette.
3. **Birthday** — balloons and restrained confetti.
4. **Goal** — mountain/path/flag concept.
5. **Project Launch** — subtle grid, orbit, or rocket motif.
6. **Celebration** — colorful but readable party design.

Each theme must preserve text contrast. Add a dark overlay or text shadow when a custom image would otherwise reduce readability.

### 6.5 App branding

Create a simple original Office Desk mark suitable for:

- Favicon
- PWA icon
- Home-screen header
- GitHub README

A reasonable concept is a rounded desk tile combining a small clock/countdown symbol with a subtle sparkle. Generate local SVG and required PNG sizes. Do not use copyrighted logos.

---

## 7. Feature Scope and Acceptance Criteria

## 7.1 Flagship Event Countdown

This is the hero feature and should receive the most design attention.

### Required capabilities

- Create, edit, duplicate, and delete multiple countdown events.
- Designate one countdown as the **Primary Countdown**.
- Fields:
  - Event title
  - Optional short subtitle
  - Event type: Vacation, Birthday, Goal Start, Goal Finish, Project Launch, Custom
  - Target date
  - Target time
  - Theme
  - Optional custom background image
  - Start/reference date for progress; default to creation date
  - Completion behavior: show complete or count since
  - Celebration level: none, subtle, celebrate, party
  - Sound on/off
- Display a large live countdown with:
  - Days
  - Hours
  - Minutes
  - Seconds
- Days must be the dominant number for long event countdowns.
- Show the target date/time and originating device timezone label.
- Store the target as an exact timestamp so shared users see the same instant.
- Support full-screen display through a user-triggered control.
- Show an optional progress bar between the reference date and target date.
- After the target:
  - Display a completion state, or
  - Automatically count elapsed time since the target, according to the saved setting.
- Use drift-resistant calculations based on the current timestamp, not repeated subtraction from a counter.
- Update the browser tab title with the primary active countdown when appropriate.

### Celebration behavior

At zero, support:

- None: clean completion message.
- Subtle: small animation and optional soft chime.
- Celebrate: confetti and completion message.
- Party: full-screen celebratory overlay, richer confetti, and generated chime.

Requirements:

- No strobe effect.
- Honor `prefers-reduced-motion`.
- Provide a visible dismiss button and Escape-key support.
- Celebration must not repeatedly trigger every second.
- A completed countdown reopened later may show its completed state without trapping the user in the celebration.
- Generate sound with the Web Audio API or local bundled assets. No network audio.

### Custom background images

- Accept common image formats.
- Process locally.
- Downscale/compress oversized images before storage.
- Store locally, preferably in IndexedDB, with a graceful fallback if storage is unavailable.
- Provide remove/replace controls.
- Never upload the image.
- Do not include the custom image in a share URL.

### Sharing

Provide a **Share Countdown** action that generates a compact URL containing the safe countdown configuration:

- Title
- Subtitle when present
- Target timestamp
- Source timezone label
- Event type
- Theme
- Reference date
- Completion behavior
- Celebration level
- Sound preference

Do not include local custom images or unrelated saved data.

The receiving user should see a preview and choose either:

- Open temporarily
- Save to My Countdowns

Handle malformed or outdated share payloads safely.

---

## 7.2 Timer

Support three modes:

1. Countdown duration
2. Count up
3. End at a selected clock time

Required controls:

- Start
- Pause/resume
- Reset
- Add 1 minute
- Add 5 minutes
- Add 10 minutes
- Full screen

Quick presets:

- 5 minutes
- 10 minutes
- 15 minutes
- 25 minutes
- 30 minutes
- 45 minutes
- 60 minutes

Additional requirements:

- Optional sound at completion.
- Browser notification when permitted and useful.
- Do not request notification permission on first load; request only after a user action.
- Update document title while running.
- Maintain accurate time when the tab is backgrounded.

---

## 7.3 Meeting Timer

Keep this useful but simple.

Required capabilities:

- Meeting title
- Duration or hard-stop clock time
- Large remaining-time display
- Default warning states:
  - Normal
  - Yellow at five minutes remaining
  - Red at one minute remaining
  - Overtime after zero
- Overtime display in `+HH:MM:SS` or appropriate compact format
- Full-screen mode
- Optional sound at zero

Simple agenda segments:

- Add up to ten named agenda segments with minute durations.
- Reorder and remove segments.
- Show current segment and next segment.
- Auto-advance when a segment expires.
- Allow manual previous/next.
- Warn when agenda total differs from the meeting duration, but do not block use.

---

## 7.4 Focus Timer

Required presets:

- 25-minute focus / 5-minute break
- 50-minute focus / 10-minute break
- 90-minute focus / 15-minute break
- Custom focus and break durations

Required behavior:

- Focus and break states are clearly differentiated.
- Start, pause, reset, skip break.
- Optional auto-start break.
- Optional browser notification and sound.
- No productivity analytics, history dashboards, accounts, or gamification in V1.

---

## 7.5 Quick Note and Checklist

Provide one lightweight local scratchpad with two simple tabs or modes:

### Note

- Plain text area
- Autosave locally
- Copy all
- Clear with confirmation
- Insert current timestamp

### Checklist

- Add checklist item
- Check/uncheck
- Edit
- Reorder
- Delete
- Clear completed
- Copy as plain-text checklist

Do not add notebooks, tags, folders, cloud sync, rich-text editing, or collaboration.

---

## 7.6 Text Tools

Provide input and output areas with clear copy/swap/clear controls.

Required transformations:

- Trim leading/trailing whitespace
- Collapse repeated spaces
- Remove blank lines
- Remove duplicate lines
- Sort lines A–Z
- Sort lines Z–A
- Uppercase
- Lowercase
- Title case
- Sentence case
- Add bullets
- Remove bullets
- Add line numbers
- Remove common line numbers
- Convert comma-separated values to one item per line
- Convert lines to comma-separated values

Show live counts for:

- Characters
- Characters without spaces
- Words
- Lines

All processing must occur locally.

---

## 7.7 Date and Business-Day Calculator

Provide two modes:

### Difference between dates

- Start date
- End date
- Calendar days
- Weeks plus days
- Weekdays/business days

### Add or subtract

- Start date
- Number
- Unit: calendar days, weeks, business days
- Add or subtract
- Result date

Business-day rules in V1:

- Monday through Friday are business days.
- Saturday and Sunday are excluded.
- Federal/company holidays are not excluded.
- State that limitation clearly in the interface.

Treat selected dates as date-only values so timezone conversion does not create off-by-one errors.

---

## 7.8 Percentage and Business Calculator

Include separate, clearly labeled calculators for:

- Percent of total
- Percent increase/decrease
- Variance percent
- Margin
- Markup

Requirements:

- Show formulas or concise explanations.
- Handle zero, negative values, empty input, and invalid input safely.
- Clearly distinguish margin from markup.
- Include a reset action for each calculator.

---

## 7.9 QR-Code Generator

Required capabilities:

- Paste or type text/URL.
- Generate QR locally.
- Adjustable output size.
- Save as PNG.
- Copy image when the browser supports it.
- Print-friendly view.
- Clear and regenerate.
- Display a concise warning that users should verify sensitive links before sharing.

Do not send QR content to a server.

---

## 7.10 Settings

Keep settings minimal:

- Appearance: light, dark, system
- Optional compact/comfortable density if it remains simple
- Default sound on/off
- Reset application data with a clear confirmation
- App version
- Privacy statement: data stays on this device except user-created share links
- Install-PWA instructions or install action where supported

---

## 8. Technical Architecture

Use a modern, maintainable, lightweight frontend stack.

### Required baseline

- React
- TypeScript in strict mode
- Vite
- Hash-based routing
- Plain CSS/CSS Modules with CSS variables; do not introduce Tailwind, Bootstrap, Material UI, Chakra, or another large design framework.
- ESLint
- Prettier
- Vitest
- React Testing Library
- Playwright
- `@axe-core/playwright` or equivalent automated accessibility checks
- `vite-plugin-pwa` or a comparable lightweight PWA implementation

Use the current stable supported versions available at execution time and commit the lockfile.

### Dependency discipline

Use very few runtime dependencies. Reasonable examples:

- A small QR-code library
- A small confetti library
- A tree-shakeable icon package such as Lucide, or local SVG icons

Avoid adding date libraries unless native Date/Intl logic cannot safely meet the requirements. Do not add a state-management framework unless the actual implementation clearly justifies it.

### Suggested source structure

```text
src/
  app/
  components/
  features/
    countdown/
    timer/
    meeting/
    focus/
    notes/
    text-tools/
    date-tools/
    percent-tools/
    qr/
  hooks/
  services/
    storage/
    sharing/
    notifications/
    audio/
  styles/
  utils/
  tests/
public/
scripts/
docs/
```

Use feature-oriented modules. Keep timer/date math separated from UI components and covered by unit tests.

### State and storage

- Use a versioned local data schema.
- Prefix storage keys consistently, such as `officeDesk.v1`.
- Store ordinary state in localStorage or a small storage adapter.
- Store custom background images in IndexedDB when practical.
- Provide schema migration logic so future releases do not silently destroy saved data.
- Handle quota/storage failure with a visible message.
- Never use `dangerouslySetInnerHTML` for user-provided content.

### Timer correctness

All live timers must calculate from timestamps rather than trusting interval counts. Intervals should trigger rendering only; elapsed/remaining values must be derived from `Date.now()` or an equivalent monotonic approach.

### Routing and GitHub Pages

Use hash routing or another proven static-host-compatible approach. Configure Vite base paths correctly for the repository name. Direct refreshes and share URLs must work on GitHub Pages.

---

## 9. PWA and Offline Requirements

The hosted build must:

- Have a valid manifest.
- Include 192x192 and 512x512 icons plus a maskable icon.
- Include correct name, short name, theme color, and background color.
- Register a service worker.
- Cache the application shell and required local assets.
- Work offline after one successful hosted visit.
- Avoid caching bugs that permanently trap users on an outdated build.
- Show a small, nonintrusive update-available prompt when a new version is ready.

No feature should require an internet connection after assets have been cached, except opening a newly shared hosted URL for the first time.

---

## 10. Portable Single-HTML Build

Generate a separate production artifact named exactly:

```text
OfficeDesk.html
```

Requirements:

- Inline required JavaScript, CSS, SVG, and other assets.
- No runtime network requests.
- Open by double-clicking on a Windows computer.
- Support all core tools.
- Gracefully explain when a browser security limitation prevents a hosted-only capability such as notifications or PWA installation.
- The file must not require Node, Python, an installer, administrator access, or a local server.
- Test the file through a `file://` URL in Chromium/Playwright where possible.
- Include it as a GitHub Actions artifact and, if release permissions are available, attach it to the `v1.0.0` GitHub release.

Use a dedicated Vite configuration or build script for the single-file output. Do not compromise the normal PWA build to achieve this.

---

## 11. Security and Privacy Requirements

- No analytics or tracking.
- No cookies except browser-internal behavior required by the platform.
- No secrets in source or workflow files.
- No remote script injection.
- No untrusted HTML rendering.
- Validate and safely decode shared configuration data.
- Limit uploaded image type and size.
- Use safe download filenames.
- Run a dependency audit and resolve all high/critical runtime vulnerabilities.
- Confirm that normal app use makes no third-party network requests.
- Add a concise privacy section to the application and README.

---

## 12. Accessibility Requirements

- Full keyboard navigation.
- Visible focus indicators.
- Proper labels and field descriptions.
- Semantic headings and landmarks.
- Sufficient contrast in every theme.
- Screen-reader-friendly timer values using meaningful labels rather than a stream of unexplained digits.
- `aria-live` must be used carefully; do not announce every second and overwhelm users.
- Honor `prefers-reduced-motion`.
- Avoid strobing and rapid flashing.
- Touch targets should generally be at least 44x44 CSS pixels.
- Validate at 200% browser zoom.

Automated accessibility testing is required, followed by manual keyboard review.

---

## 13. Testing Requirements

Create meaningful automated tests rather than superficial snapshots.

### Unit-test coverage must include

- Countdown math before, at, and after zero
- Past-date/count-since behavior
- Leap-year boundaries
- Date-only arithmetic
- Business-day calculations across weekends
- Timer pause/resume/reset and drift resistance
- Agenda segment advancement
- Share-payload serialization, validation, and malformed input
- Storage schema migration
- Text transformations
- Percentage formulas, including divide-by-zero cases
- QR input state where appropriate
- Celebration one-time trigger behavior

### Component/integration tests must include

- Creating and saving a countdown
- Selecting a primary countdown
- Editing and deleting countdowns
- Starting/pausing/resetting timer modes
- Meeting overtime transition
- Focus-to-break transition
- Autosaving quick notes
- Checklist operations
- Text tool copy-ready output
- Date and percentage result rendering
- QR generation interaction

### End-to-end tests must include

- First-run home screen
- Create a vacation countdown and make it primary
- Reload and confirm persistence
- Generate and open a share link
- Run a short timer to completion
- Run a meeting timer into overtime
- Add and check a checklist item
- Use at least three text transformations
- Calculate business days
- Calculate margin and markup
- Generate and download/copy a QR code where supported
- Navigate entirely by keyboard through a core flow
- Offline reload of the hosted build after caching
- Portable `OfficeDesk.html` smoke test

Run Playwright at minimum in Chromium. Also run core smoke tests in Firefox when the environment supports it.

### Visual verification

Capture and review screenshots for at least:

- Home — desktop
- Primary vacation countdown — desktop
- Party completion state
- Home — mobile
- Countdown editor — mobile
- Dark mode
- Meeting overtime
- Text tools

Store representative screenshots under `docs/screenshots/` and use selected screenshots in the README.

---

## 14. Performance Targets

Aim for:

- Fast initial load on a normal connection.
- Smooth one-second countdown updates without rerendering the entire application.
- No layout shift caused by changing timer digits.
- No unnecessary polling or background work.
- Hosted production bundle kept lean; investigate any unexpectedly large dependency.
- Lighthouse or equivalent local audit targets:
  - Accessibility: 95 or higher
  - Best Practices: 90 or higher
  - Performance: 85 or higher on desktop, unless a documented local-audit limitation exists

Do not chase a score by breaking functionality. Document any justified exception.

---

## 15. GitHub, CI, and Deployment

### Repository

- If already inside the intended repository, preserve it.
- Otherwise create `office-desk` under the authenticated GitHub account using GitHub CLI if available.
- Use a public repository unless permissions or an existing configuration dictate otherwise.
- Add a suitable `.gitignore`, license, README, and version metadata.

### Scripts

At minimum provide:

```text
npm run dev
npm run lint
npm run typecheck
npm run test
npm run test:coverage
npm run test:e2e
npm run build
npm run build:portable
npm run verify
```

`npm run verify` should execute the complete practical quality gate: lint, typecheck, unit/integration tests, production builds, and the appropriate end-to-end/smoke tests.

### GitHub Actions

Create workflows that:

1. Run CI on pull requests and pushes.
2. Install dependencies from the lockfile.
3. Run lint, typecheck, unit/integration tests, builds, and relevant end-to-end tests.
4. Upload test reports and the portable `OfficeDesk.html` artifact.
5. Deploy the production PWA to GitHub Pages on pushes to the main branch.
6. Use current official GitHub Pages actions and required permissions.
7. Prevent overlapping Pages deployments through concurrency control.

### Release

When permissions allow:

- Tag the completed version as `v1.0.0`.
- Create a GitHub release.
- Attach `OfficeDesk.html` and, optionally, a checksum.

### Deployment verification

After deployment:

- Open the live URL.
- Confirm all assets load from the Pages base path.
- Confirm no console errors.
- Create and save a countdown on the live site.
- Refresh and verify persistence.
- Test a share URL.
- Test offline reload after the service worker caches the app.
- Record the exact live URL in the final report and README.

Do not claim the application is deployed until the public URL is actually reachable.

---

## 16. Ten-Pass Quality and Improvement Loop

Complete all ten passes after the first full implementation. This is not a request for ten arbitrary redesigns. Each pass has a specific purpose and must produce evidence, findings, fixes, or a documented reason no change was required.

Create `docs/quality-report.md`. For each pass, record:

- What was reviewed
- Tests or checks run
- Findings
- Changes made
- Remaining risk
- Result

After every pass, rerun the relevant tests. After Pass 10, run the full `npm run verify` gate again.

### Pass 1 — Scope and feature completeness

Compare the running app against every acceptance criterion in this prompt. Implement missing or incomplete items. Remove placeholders and dead controls.

### Pass 2 — Time and date correctness

Attack countdowns, timers, pause/resume, background tabs, target-time conversion, leap dates, past dates, zero transitions, and date-only/business-day calculations. Fix drift and off-by-one behavior.

### Pass 3 — Persistence and sharing

Test refreshes, browser restarts where possible, schema versioning, duplicate/delete flows, primary countdown state, custom images, invalid storage, share URLs, and malformed payloads.

### Pass 4 — Utility correctness

Review text transformations, percentage formulas, margin versus markup, note/checklist behavior, QR output, copy/download/print behavior, and error messages.

### Pass 5 — Visual polish

Review hierarchy, spacing, typography, themes, custom-image legibility, empty states, buttons, icons, animations, celebration behavior, full-screen views, dark mode, and consistency. Capture screenshots before and after meaningful fixes.

### Pass 6 — Responsive and Windows usability

Review at 1440px, 1024px, 768px, and approximately 390px widths. Test Edge/Chromium behavior, browser zoom, mouse, touch-sized targets, keyboard shortcuts, and the local HTML file.

### Pass 7 — Accessibility

Run automated axe checks and perform a manual keyboard-only pass. Review focus order, labels, landmarks, contrast, reduced motion, screen-reader phrasing, modal focus trapping, Escape behavior, and error identification.

### Pass 8 — Offline, PWA, and portable build

Verify manifest, service worker, update behavior, offline reload, installability, cached assets, no stale-release trap, and fully offline single-file execution.

### Pass 9 — Performance, security, and maintainability

Review bundle size, rerender behavior, dependency count, network requests, uploaded-image handling, untrusted input, audit results, console warnings, code duplication, module boundaries, tests, and documentation.

### Pass 10 — Adversarial final bug bash and deployment verification

Use the product like an impatient nontechnical user. Try invalid inputs, rapid clicks, refreshes mid-timer, multiple tabs, deleted primary countdowns, dates at midnight, very long titles, empty states, denied notifications, blocked storage, malformed share links, and direct live URLs. Fix all critical/high findings and reasonable medium findings. Then deploy and perform the live-site smoke test.

Rules for the review loop:

- Do not fabricate findings or claim a pass occurred without evidence.
- Do not add broad V2 features merely to make each pass look busy.
- Small usability improvements such as clearer empty states, undoable deletion, better defaults, or safer validation are acceptable.
- No unresolved critical or high-severity issue may remain at final delivery.
- Any remaining medium/low limitation must be listed honestly.

---

## 17. Explicit Non-Goals for V1

Do not add:

- User accounts or login
- Cloud database or sync
- AI features
- Outlook, Teams, Slack, or calendar integrations
- PDF tools
- Image editing beyond local countdown-background preparation
- General task/project management
- Multi-user collaboration
- Usage analytics
- Ads
- Payments
- Electron
- Native Windows installers
- Browser extensions
- Complex productivity statistics
- International holiday calendars

These are out of scope even if they seem interesting. Quality and completion matter more than feature count.

---

## 18. Documentation Deliverables

Create or update:

- `README.md`
- `docs/architecture.md`
- `docs/quality-report.md`
- `docs/privacy.md`
- `docs/user-guide.md`
- `docs/screenshots/`

The README should include:

- What Office Desk is
- Main features
- Hosted link
- Screenshots
- Privacy statement
- How to use the portable file
- Local development commands
- Build commands
- Deployment architecture
- Browser support
- Known limitations

Keep documentation accurate to the delivered code.

---

## 19. Definition of Done

The project is done only when:

- Every V1 feature is implemented and usable.
- No placeholder buttons or unfinished screens remain.
- TypeScript builds with no errors.
- Lint passes.
- Unit/integration tests pass.
- End-to-end smoke tests pass.
- Production PWA build succeeds.
- Portable single-file build succeeds and opens locally.
- Accessibility review is complete with no critical/high findings.
- No high/critical runtime dependency vulnerability remains.
- Ten quality passes are documented.
- Git working tree is clean.
- Changes are committed and pushed.
- GitHub Pages deployment is successful.
- The live URL has been opened and smoke-tested.
- Final documentation matches reality.

---

## 20. Required Final Response

When the work is complete, return a concise release report in this order:

1. **Result** — one-paragraph status.
2. **Live application URL**.
3. **GitHub repository URL**.
4. **Portable download/release location**.
5. **Implemented scope** — compact checklist.
6. **Validation evidence**:
   - Lint result
   - Typecheck result
   - Unit/integration test count and result
   - End-to-end test count and result
   - Accessibility result
   - Build result
   - Offline/PWA result
   - Portable-file result
7. **Ten-pass review summary** — one line per pass with the most important improvement.
8. **Known limitations** — factual and specific.
9. **Repository status** — branch, final commit hash, release tag, and whether the working tree is clean.

Do not provide only code snippets or instructions for someone else to finish. Complete the build, verification, push, deployment, and live smoke test yourself to the maximum extent allowed by the available credentials and environment.
