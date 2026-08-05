# Hypractive

**New here? Start with `SETUP.md`** — step-by-step install and run instructions.

**Want the full design?** See `ARCHITECTURE.md` — product spec, data model,
screen map, and the phased build plan this project follows. (Note: written
under the project's original working name; content still applies, naming
in that doc hasn't been fully swept for the rebrand yet.)

## Build status

Delivery 8 — rebrand to Hypractive: pearl-white/dark-black visual redesign,
Urbanist typeface, local (cosmetic, no-backend) email/password login, About
screen, Nutrition Tracking placeholder.

**12 of 13 required modules built** (Running Plans still deferred, as planned).

### What's new this delivery
- Full visual redesign: strict two-tone pearl-white/dark-black palette,
  no third accent color anywhere — functional states (form errors,
  progressive-overload deltas, destructive actions) now use symbols and
  weight instead of color
- Urbanist typeface throughout (Google Fonts, SIL Open Font License)
- Glossy gradient touches on primary buttons and headline stat cards
- Local email/password Sign Up / Log In / Log Out — genuinely local only,
  no backend, no password recovery; this is disclosed plainly in the new
  About screen so it's never misleading
- About screen (Settings → About Hypractive)
- Nutrition Tracking placeholder (Settings) — not built, just flagged as upcoming

### Still working (built in earlier deliveries)
Exercise Library, Custom Workout Templates, Active Workout logging with
Progressive Overload, Rest Timer, Exercise History + PR detection,
Run/Workout History, Log Run with Pace/Running Analysis, Running &
Workout Statistics with Progress Charts, Backup Export/Import.

### Not yet built
Running Plans, app-lock, Workout Programs, repository-level test coverage
(calculation logic is tested; DB read/write isn't), the final `.apk` build
(deliberately saved for last).

## Everyday commands

```
npm start          # run the app
npm test            # run the test suite
npm run typecheck   # check TypeScript types
```
