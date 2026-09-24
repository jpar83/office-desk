# Architecture

Office Desk is a static React single-page application. Vite builds both the hosted PWA and a single-file portable output. Hash routing keeps paths valid below the `/office-desk/` GitHub Pages repository prefix and allows a share payload to travel in the URL fragment.

Application state is a versioned `DeskData` value under `officeDesk.v1` in localStorage. Countdown target instants are ISO timestamps; timer displays are recalculated from timestamps on each render tick. Date-only calculations use local noon to avoid midnight timezone shifts. Shared countdown payloads are validated, size-limited by field lengths, and omit local images.

The hosted build uses a generated service worker and precaches local application assets. The portable build uses `vite-plugin-singlefile` to inline scripts, styles, SVG, and other build assets into `OfficeDesk.html`.
