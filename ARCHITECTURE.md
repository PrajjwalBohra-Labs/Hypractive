# Hybrid Fitness App — Full Product & System Design

Status: Design complete. Code generation begins in follow-up messages (per section 11).

---

## 1. Assumptions

Every assumption below exists because the source brief did not specify it. Nothing here invents *content* (plans, exercises, advice) — only engineering/product decisions needed to make the requested modules function. Each is marked so you can override any of them.

| # | Assumption | Why it was needed | Status |
|---|---|---|---|
| A1 | Platform: **React Native (Expo, TypeScript)**, targeting iOS + Android from one codebase | You said "runs on my phone," "VS Code," and "scalable." Expo is the fastest path to a real device build without native Xcode/Android Studio config. | Default chosen — confirm or override |
| A2 | This is a **single-user-per-device app**. Each friend installs their own copy with their own local data. There is no shared backend, no social feed, no leaderboard, no friend-to-friend visibility, because none of these were listed as required modules. | "Friend / group member" entity was requested in the data model, but no group/social module was requested in the feature list. | **Needs user input**: confirm friends only means "each of us uses this app individually," not "we see each other's stats." Data model below supports a *future* group layer without requiring it now. |
| A3 | Units: **metric (km, kg)** as default, with a per-user setting to switch to miles/lbs. | Not specified. | Needs user input if you want a fixed unit instead of a toggle |
| A4 | No authentication for MVP. App opens straight to the local profile. An optional PIN/biometric app-lock is deferred to V2. | "Private use," offline-first, no login flow requested. | Default chosen |
| A5 | Rest timer runs **in-app with a foreground notification fallback**, not a full background push service (no server). | No backend requested; offline-first constraint. | Default chosen |
| A6 | Exercise library and running plans start **empty**. You build them yourself via the in-app builder screens (as you specified). No seed content beyond structural examples (e.g., one placeholder row to show the schema) will be treated as real content. | You explicitly forbade invented training content. | Confirmed per your instruction |
| A7 | "Progressive overload" logic is **generic-mechanical**, not advice-based: it compares session N to session N-1/best for the same exercise on metrics you log (weight, reps, sets, distance, pace) and flags increases/decreases/stagnation. It does not recommend *how much* to increase. | You forbade "best practices" and generic fitness recommendations; overload must still be *computed* since it's a required module — the computation is math on your logged numbers, not advice. | Confirmed interpretation — flag if wrong |
| A8 | Sync/backup: **local-first with manual export/import (JSON file)** in MVP. No cloud account. Optional cloud sync (e.g., Supabase) is a V2/future item, off by default. | "Prefer offline-first ... unless a cloud feature is absolutely necessary." Nothing here is absolutely necessary. | Default chosen |
| A9 | Charting library: **`react-native-chart-kit`** (plain SVG-based, works directly in Expo Go). `victory-native`'s current version requires Skia + Reanimated + a custom development build, which is incompatible with the plain-Expo-Go workflow this project uses. | Needed to satisfy "progress charts" and "statistics" modules concretely, without requiring EAS/dev-build setup. | Default chosen — revisit only if you later move off Expo Go to a development build |
| A10 | Local database: **SQLite via `expo-sqlite`**, accessed through a typed data-access layer (not raw AsyncStorage), because the module list requires relational queries (history by exercise, PRs, trends, joins across sessions/exercises). | AsyncStorage does not scale to this data shape; needed for "scalable but not overcomplicated." | Default chosen |
| A11 | GPS/route tracking for runs is **out of scope** unless you say otherwise — "Running analysis" and "Pace analysis" are computed from **manually logged run data** (distance, duration, splits you enter) rather than live GPS capture, because GPS was never mentioned. | Not specified. | **Needs user input**: do you want live GPS tracking during a run (requires location permissions, background tracking, map rendering) or manual/imported entry of distance+time+splits? MVP below assumes manual entry; GPS is listed as a clearly separated future upgrade. |
| A12 | "Running plan" structure: a plan is a **user-defined sequence of planned run sessions** (date/week, target distance, target pace, notes) that you create yourself — no prebuilt plan content is included. | You must build your own content. | Confirmed |
| A13 | App name: not decided by you. I'll propose candidates in section 2; final pick is yours. | Requested as "app name idea," not a mandate. | Needs your pick |

If any assumption is wrong, tell me and I'll revise the affected sections before code generation.

---

## 2. App Overview

**Name candidates** (pick one, or none — this is cosmetic and easy to change later):
- **Ledger** — reflects that this is fundamentally a personal logging/record system, not a coach.
- **Splits** — nods to running pace splits and to strength "split" routines.
- **Circuit** — neutral, covers both running and lifting.
- **Basecamp** — implies a private, personal home base for training data.

**Mission (one sentence):** A private, offline-first logging and analysis tool that records exactly the running and strength training data you and your friends enter, and turns it into statistics and charts — nothing more.

**Who it's for:** You and a small, known group of friends who each want a fast, no-nonsense personal training log on their own phone, with full control over the content (their own plans, their own exercise library).

**Core use cases:**
1. Log a completed run (distance, duration, splits) and see pace/running analysis.
2. Log a completed strength workout (exercises, sets, reps, weight) using a custom-built exercise library.
3. Build and follow a personal running plan.
4. Build and reuse custom workout templates.
5. Review history, PRs, and trends for any exercise or run metric over time.
6. Use a rest timer between sets during a logged workout.

**Problem it solves:** Generic fitness apps impose someone else's plans, exercise databases, and advice. This app is a blank, structured system that only reflects what you and your friends explicitly put into it, with fast logging and clear statistics.

---

## 3. Feature Specification

For each module: what it does, screens, data, interaction, dependencies.

### 3.1 Running Plans
- **What it does:** Lets a user create a named plan containing an ordered list of planned run sessions (target date, target distance, target pace/time, notes).
- **Screens:** Plan List, Plan Detail, Plan Session Editor (create/edit a planned session).
- **Data stored:** `RunningPlan`, `PlannedRunSession` (see Data Model).
- **Interaction:** User taps "+ New Plan" → names it → adds planned sessions one at a time → can mark a planned session as "completed" by linking it to a logged `RunSession`.
- **Dependencies:** Feeds "Workout Logging"/"Run Session" flow (a planned session can pre-fill a run log entry). Feeds Running Statistics (planned vs actual).

### 3.2 Pace Analysis
- **What it does:** Computes pace (min/km or min/mi) per run and per split, shows pace consistency (variance across splits) and pace vs. plan target if the run was linked to a planned session.
- **Screens:** Embedded in Run Session Detail screen (no separate screen needed) + a dedicated "Pace Trends" chart screen.
- **Data stored:** Derived/computed from `RunSession` + `PaceSplit`; no separate storage beyond splits.
- **Interaction:** Automatically calculated the moment a run + its splits are logged; user views it, does not input it.
- **Dependencies:** Requires Workout Logging (run entry) and Pace Split data.

### 3.3 Running Analysis
- **What it does:** Aggregates a single run's data into a readable summary: total distance, total time, average pace, split table, pace trend within the run (negative/positive split detection based on your logged numbers only), comparison to the user's prior run of similar distance.
- **Screens:** Run Session Detail screen.
- **Data stored:** Derived from `RunSession`, `PaceSplit`.
- **Interaction:** Opens automatically after logging a run, or from Run History.
- **Dependencies:** Workout Logging, Pace Analysis, Exercise History pattern (same "compare to past" logic reused).

### 3.4 Workout Tracking
- **What it does:** The active-session experience for strength workouts: user works through a list of exercises, entering sets/reps/weight as they go, with the Rest Timer available inline.
- **Screens:** Active Workout screen (session-in-progress), Workout Summary screen (post-finish).
- **Data stored:** `WorkoutSession`, `LoggedSet` (child of session), timestamps.
- **Interaction:** Start from a `WorkoutProgram`/`CustomWorkoutTemplate` or blank session → for each exercise, add sets (weight × reps) → mark set complete → optional rest timer auto-starts → finish session.
- **Dependencies:** Exercise Library (source of exercises), Rest Timer, Custom Workout Creation, Progressive Overload (reads while logging to show last time's numbers), Workout Logging (this *is* the logging flow), Exercise History (writes to it).

### 3.5 Progressive Overload
- **What it does:** Purely computational: for each exercise being logged, shows the user's previous best/most-recent numbers for that exercise (weight, reps, volume = weight×reps×sets) and flags whether the new entry is higher, equal, or lower. No suggestions, no target numbers invented.
- **Screens:** Inline indicator inside Active Workout screen (next to each exercise) + a dedicated "Exercise Progress" view within Exercise History Detail.
- **Data stored:** No new entity — computed from `ExerciseHistoryEntry` records.
- **Interaction:** Passive — shown automatically as the user logs; no separate input.
- **Dependencies:** Exercise History, Workout Tracking.

### 3.6 Exercise History
- **What it does:** For any exercise in the library, shows every past logged instance (date, sets, reps, weight, volume) in chronological order, plus PR markers.
- **Screens:** Exercise History List (per exercise, accessed from Exercise Library), Exercise History Detail (chart + table for one exercise).
- **Data stored:** `ExerciseHistoryEntry` (one row per set logged, linked to `Exercise` and `WorkoutSession`).
- **Interaction:** User taps an exercise from the library or from a past workout to view its full history.
- **Dependencies:** Exercise Library, Workout Logging (source of entries), Progress Charts (renders this data).

### 3.7 Rest Timer
- **What it does:** A countdown timer between sets, with user-defined presets (e.g., "90s", "3m") that can be saved and reused. Auto-suggest-starts after a set is marked complete during Workout Tracking (user can dismiss/skip).
- **Screens:** Rest Timer overlay/modal (invoked from Active Workout), Rest Timer Presets screen (manage presets, under Settings or Exercise Library builder).
- **Data stored:** `RestTimerPreset` (label, duration). Timer *state* itself is transient/in-memory, not persisted history.
- **Interaction:** User taps a preset or enters a custom duration → timer counts down → sound/vibration on completion → auto-dismiss or manual dismiss.
- **Dependencies:** Workout Tracking (primary trigger point). Can also be launched standalone from a Tools/Settings entry.

### 3.8 Exercise Library (user-built)
- **What it does:** Lets the user create, edit, delete their own exercises (name, category/muscle group tag, equipment tag, optional notes). This is the source list used everywhere else that references "an exercise."
- **Screens:** Exercise Library List, Exercise Editor (create/edit), Exercise Detail (view + link to its History).
- **Data stored:** `Exercise`.
- **Interaction:** "+ New Exercise" → fill name + tags + notes → save. Edit/delete from list (delete blocked or warns if history exists, to protect logged data integrity).
- **Dependencies:** Feeds Workout Tracking, Custom Workout Creation, Exercise History, Progressive Overload. Nothing depends on it being pre-filled — it starts empty per your instruction.

### 3.9 Custom Workout Creation
- **What it does:** Lets the user assemble a reusable `CustomWorkoutTemplate` — a named list of exercises with target sets/reps (no weight, since weight is decided at log time) — that can be launched into an Active Workout session repeatedly.
- **Screens:** Template List, Template Editor (add/remove/reorder exercises, set target sets/reps per exercise), Template Detail (preview before starting).
- **Data stored:** `CustomWorkoutTemplate`, `TemplateExerciseEntry` (child rows).
- **Interaction:** "+ New Template" → name it → add exercises from Exercise Library → set target sets/reps for each → save → later, "Start Workout" from this template pre-fills an Active Workout session.
- **Dependencies:** Exercise Library (must pick from it), Workout Tracking (consumes templates), Workout Program (a program can be a sequence of templates — see data model note).

### 3.10 Running Statistics
- **What it does:** Aggregate views across all logged runs: total distance (week/month/all-time), average pace trend over time, run frequency, longest run, planned-vs-actual completion rate (if plans are used).
- **Screens:** Running Statistics screen (tab within Running section).
- **Data stored:** Derived/aggregated from `RunSession` + `PaceSplit`; no separate storage (computed on read, optionally cached).
- **Interaction:** Read-only dashboard with filter by date range.
- **Dependencies:** Workout Logging (run entries), Running Plans (for planned-vs-actual), Progress Charts.

### 3.11 Workout Statistics
- **What it does:** Aggregate views across all logged strength workouts: total volume over time, sessions per week, most-trained exercises, PR count over time.
- **Screens:** Workout Statistics screen (tab within Strength section).
- **Data stored:** Derived from `WorkoutSession` + `ExerciseHistoryEntry`.
- **Interaction:** Read-only dashboard with filter by date range and by exercise/category.
- **Dependencies:** Workout Logging, Exercise History, Progress Charts.

### 3.12 Workout Logging
- **What it does:** This is the underlying write-path shared by both domains: creating a `RunSession` (with splits) or a `WorkoutSession` (with logged sets), timestamped, and persisted. It is not a separate screen so much as the data-entry contract implemented inside the Running log flow and the Active Workout screen.
- **Screens:** Log Run screen (manual entry form + optional splits), Active Workout screen (see 3.4).
- **Data stored:** `RunSession`, `PaceSplit`, `WorkoutSession`, `LoggedSet`, `ExerciseHistoryEntry` (auto-derived from `LoggedSet` on save).
- **Interaction:** Manual form entry for runs; incremental set-by-set entry for workouts.
- **Dependencies:** Everything in Running and Strength domains reads from this.

### 3.13 Progress Charts
- **What it does:** Renders time-series charts for: pace over time, distance over time, exercise weight/volume over time, workout frequency over time. A single reusable chart component fed by different `ChartDataSource` queries.
- **Screens:** Embedded within Running Statistics, Workout Statistics, and Exercise History Detail (no separate top-level screen — charts live inside their relevant context).
- **Data stored:** No new persisted entity; a `ChartDataSource` is a **query shape/config**, not stored data (see Data Model note).
- **Interaction:** Read-only, with date-range and metric toggles.
- **Dependencies:** Running Statistics, Workout Statistics, Exercise History.

---

## 4. Screen Map (Information Architecture)

### 4.1 Full screen list (grouped)

**Onboarding / Root**
1. First Launch / Create Local Profile (name + unit preference) — one-time
2. Home Dashboard (tab root)

**Running**
3. Running Dashboard
4. Running Plans List
5. Running Plan Detail
6. Plan Session Editor (create/edit planned session)
7. Log Run (manual entry + splits)
8. Run Session Detail (analysis + splits + pace)
9. Run History (list of all past runs)
10. Running Statistics

**Strength**
11. Strength Dashboard
12. Exercise Library List
13. Exercise Editor (create/edit)
14. Exercise Detail (info + link to history)
15. Exercise History Detail (chart + table, per exercise)
16. Custom Workout Templates List
17. Template Editor (create/edit)
18. Template Detail (preview)
19. Active Workout (session in progress)
20. Rest Timer (modal/overlay, launched from Active Workout or standalone)
21. Workout Summary (post-session)
22. Workout History (list of all past workout sessions)
23. Workout Session Detail (view a single past session)
24. Workout Statistics

**Shared / Cross-cutting**
25. Rest Timer Presets (manage presets)
26. Settings (units, profile, data export/import, app lock toggle [V2])
27. Notes (optional personal notes screen — see 4.4)
28. Empty state variants (not separate routes — see UI/UX section)
29. Error state variants (not separate routes — see UI/UX section)

### 4.2 Navigation structure

**Bottom Tab Bar** (primary navigation — 4 tabs, matches "simple, fast"):

```
[ Home ]   [ Running ]   [ Strength ]   [ Settings ]
```

- **Home** → Home Dashboard (today/this-week snapshot pulled from both domains, plus quick-log buttons)
- **Running** → stack navigator rooted at Running Dashboard, with child screens 4–10 pushed on top
- **Strength** → stack navigator rooted at Strength Dashboard, with child screens 12–24 pushed on top
- **Settings** → Settings screen, with Rest Timer Presets and Notes as pushed children

Each tab is its own **native stack navigator** (React Navigation), so back-navigation stays within the domain and switching tabs preserves each stack's position (standard mobile pattern, not a custom invention — this is structural, not "advice").

### 4.3 How the user moves between running and lifting

They are peer domains, not nested — a single tab switch moves between them. No cross-domain screen requires the other domain to function. The only cross-link is:
- Home Dashboard surfaces both a "Log Run" quick action and a "Start Workout" quick action side by side.
- Running Statistics and Workout Statistics are separate screens (not merged), per the two distinct required modules ("Running statistics" and "Workout statistics" were listed separately).

### 4.4 Notes — flagged as needs user input

The brief lists "Personal notes if needed" as conditional. There is no module requirement for notes anywhere in section 1's list. **Needs user input:** do you want a general free-text notes screen (not tied to a specific run/workout), or notes only as a field *within* run/workout entries (already included as `notes` fields on `RunSession` and `WorkoutSession` in the data model below)? Default assumption: field-level notes only; the standalone Notes screen (item 27) is deferred/optional until you confirm.

---

## 5. Data Model

Local relational schema (SQLite). All IDs are UUID strings (`TEXT PRIMARY KEY`) unless noted. All timestamps are ISO-8601 strings stored as `TEXT`, treated as UTC.

### 5.1 `User`
| Field | Type | Required | Purpose | Relationships |
|---|---|---|---|---|
| id | TEXT (UUID) | yes | Primary key | referenced by all other entities via `user_id` |
| display_name | TEXT | yes | Shown in-app | — |
| unit_preference | TEXT enum('metric','imperial') | yes | Drives display formatting only; storage is always metric internally | — |
| created_at | TEXT (ISO date) | yes | Record creation | — |
| app_lock_enabled | INTEGER (bool) | no (default 0) | V2 feature flag | — |

Since this is single-user-per-device (A2), there will typically be exactly one `User` row, but the schema supports more than one local profile if you later want that on a shared family device — not required now.

### 5.2 `FriendGroupMember` *(placeholder entity for future group features — not wired into any MVP screen; needs user input per A2 before it's used for anything beyond storage)*
| Field | Type | Required | Purpose | Relationships |
|---|---|---|---|---|
| id | TEXT (UUID) | yes | Primary key | — |
| owner_user_id | TEXT (UUID) | yes | Which local user recorded this friend | FK → User.id |
| display_name | TEXT | yes | Friend's name | — |
| created_at | TEXT | yes | Record creation | — |

No screen in section 4 writes to this table yet. It exists only because you asked for it in the data model; it is inert until you confirm what "friends" should actually do in-app (A2).

### 5.3 `RunningPlan`
| Field | Type | Required | Purpose | Relationships |
|---|---|---|---|---|
| id | TEXT (UUID) | yes | Primary key | — |
| user_id | TEXT (UUID) | yes | Owner | FK → User.id |
| name | TEXT | yes | Plan title | — |
| description | TEXT | no | Free text | — |
| start_date | TEXT (ISO date) | no | Optional plan start | — |
| created_at | TEXT | yes | — | — |
| archived | INTEGER (bool) | yes (default 0) | Soft-hide completed plans | — |

### 5.4 `PlannedRunSession`
| Field | Type | Required | Purpose | Relationships |
|---|---|---|---|---|
| id | TEXT (UUID) | yes | Primary key | — |
| plan_id | TEXT (UUID) | yes | Parent plan | FK → RunningPlan.id |
| planned_date | TEXT (ISO date) | yes | Target date | — |
| target_distance_m | REAL | no | Meters (stored metric always) | — |
| target_duration_s | INTEGER | no | Seconds | — |
| target_pace_s_per_km | REAL | no | Seconds per km | — |
| notes | TEXT | no | User's own notes | — |
| linked_run_session_id | TEXT (UUID) | no | Set once completed | FK → RunSession.id |
| sort_order | INTEGER | yes | Ordering within plan | — |

### 5.5 `RunSession`
| Field | Type | Required | Purpose | Relationships |
|---|---|---|---|---|
| id | TEXT (UUID) | yes | Primary key | — |
| user_id | TEXT (UUID) | yes | Owner | FK → User.id |
| date | TEXT (ISO date) | yes | When the run happened | — |
| distance_m | REAL | yes | Total distance, meters | — |
| duration_s | INTEGER | yes | Total duration, seconds | — |
| avg_pace_s_per_km | REAL | yes (computed on save) | duration_s / (distance_m/1000) | — |
| notes | TEXT | no | Free text | — |
| planned_session_id | TEXT (UUID) | no | Link back if this fulfilled a plan | FK → PlannedRunSession.id |
| created_at | TEXT | yes | — | — |

### 5.6 `PaceSplit`
| Field | Type | Required | Purpose | Relationships |
|---|---|---|---|---|
| id | TEXT (UUID) | yes | Primary key | — |
| run_session_id | TEXT (UUID) | yes | Parent run | FK → RunSession.id |
| split_index | INTEGER | yes | 1-based order (e.g., km 1, km 2) | — |
| distance_m | REAL | yes | Length of this split (usually 1000) | — |
| duration_s | INTEGER | yes | Time for this split | — |
| pace_s_per_km | REAL | yes (computed) | duration_s / (distance_m/1000) | — |

### 5.7 `WorkoutProgram` *(an optional higher-level grouping: an ordered sequence of `CustomWorkoutTemplate`s, e.g., "Week A" → Push/Pull/Legs templates in order)*
| Field | Type | Required | Purpose | Relationships |
|---|---|---|---|---|
| id | TEXT (UUID) | yes | Primary key | — |
| user_id | TEXT (UUID) | yes | Owner | FK → User.id |
| name | TEXT | yes | Program title | — |
| created_at | TEXT | yes | — | — |
| archived | INTEGER (bool) | yes (default 0) | — | — |

### 5.8 `ProgramTemplateEntry` (join table: order of templates within a program)
| Field | Type | Required | Purpose | Relationships |
|---|---|---|---|---|
| id | TEXT (UUID) | yes | Primary key | — |
| program_id | TEXT (UUID) | yes | Parent | FK → WorkoutProgram.id |
| template_id | TEXT (UUID) | yes | Which template | FK → CustomWorkoutTemplate.id |
| sort_order | INTEGER | yes | Position in program | — |

### 5.9 `CustomWorkoutTemplate`
| Field | Type | Required | Purpose | Relationships |
|---|---|---|---|---|
| id | TEXT (UUID) | yes | Primary key | — |
| user_id | TEXT (UUID) | yes | Owner | FK → User.id |
| name | TEXT | yes | Template title | — |
| notes | TEXT | no | Free text | — |
| created_at | TEXT | yes | — | — |
| archived | INTEGER (bool) | yes (default 0) | — | — |

### 5.10 `TemplateExerciseEntry`
| Field | Type | Required | Purpose | Relationships |
|---|---|---|---|---|
| id | TEXT (UUID) | yes | Primary key | — |
| template_id | TEXT (UUID) | yes | Parent template | FK → CustomWorkoutTemplate.id |
| exercise_id | TEXT (UUID) | yes | Which exercise | FK → Exercise.id |
| target_sets | INTEGER | no | User-defined target | — |
| target_reps | INTEGER | no | User-defined target | — |
| sort_order | INTEGER | yes | Order in the workout | — |

### 5.11 `Exercise`
| Field | Type | Required | Purpose | Relationships |
|---|---|---|---|---|
| id | TEXT (UUID) | yes | Primary key | — |
| user_id | TEXT (UUID) | yes | Owner (each user builds their own) | FK → User.id |
| name | TEXT | yes | Exercise name | — |
| category | TEXT | no | User-defined tag (e.g., "Push") — free text, not a fixed enum, since content is user-defined | — |
| equipment | TEXT | no | User-defined tag | — |
| notes | TEXT | no | Free text | — |
| created_at | TEXT | yes | — | — |
| archived | INTEGER (bool) | yes (default 0) | Soft-delete to preserve history integrity | — |

### 5.12 `WorkoutSession`
| Field | Type | Required | Purpose | Relationships |
|---|---|---|---|---|
| id | TEXT (UUID) | yes | Primary key | — |
| user_id | TEXT (UUID) | yes | Owner | FK → User.id |
| date | TEXT (ISO date) | yes | When performed | — |
| source_template_id | TEXT (UUID) | no | If launched from a template | FK → CustomWorkoutTemplate.id |
| started_at | TEXT | yes | Timestamp | — |
| finished_at | TEXT | no | Null while in progress | — |
| notes | TEXT | no | Free text | — |

### 5.13 `LoggedSet` (the atomic unit of strength logging)
| Field | Type | Required | Purpose | Relationships |
|---|---|---|---|---|
| id | TEXT (UUID) | yes | Primary key | — |
| workout_session_id | TEXT (UUID) | yes | Parent session | FK → WorkoutSession.id |
| exercise_id | TEXT (UUID) | yes | Which exercise | FK → Exercise.id |
| set_index | INTEGER | yes | Order within the exercise for this session | — |
| weight_kg | REAL | no | Null for bodyweight-only sets | — |
| reps | INTEGER | yes | — | — |
| rpe | REAL | no | Only if user chooses to log it — no default scale imposed | — |
| completed_at | TEXT | yes | Timestamp of set completion | — |

### 5.14 `ExerciseHistoryEntry` (denormalized read-optimized record, auto-generated 1:1 from each `LoggedSet` on save, to make history/PR/trend queries fast without recomputing joins)
| Field | Type | Required | Purpose | Relationships |
|---|---|---|---|---|
| id | TEXT (UUID) | yes | Primary key | — |
| user_id | TEXT (UUID) | yes | Owner | FK → User.id |
| exercise_id | TEXT (UUID) | yes | Which exercise | FK → Exercise.id |
| logged_set_id | TEXT (UUID) | yes | Source set | FK → LoggedSet.id |
| date | TEXT (ISO date) | yes | Copied from parent session's date | — |
| weight_kg | REAL | no | Copied | — |
| reps | INTEGER | yes | Copied | — |
| volume_kg | REAL | yes (computed) | weight_kg × reps (0 if bodyweight) | — |
| is_pr_weight | INTEGER (bool) | yes (computed) | True if weight_kg is a new max for this exercise at save time | — |
| is_pr_volume | INTEGER (bool) | yes (computed) | True if volume_kg (single-set) is a new max | — |

### 5.15 `ProgressRecord` (per-exercise all-time PR cache — one row per exercise per metric, overwritten as new PRs occur, so the UI can show "current PR" without scanning full history)
| Field | Type | Required | Purpose | Relationships |
|---|---|---|---|---|
| id | TEXT (UUID) | yes | Primary key | — |
| user_id | TEXT (UUID) | yes | Owner | FK → User.id |
| exercise_id | TEXT (UUID) | yes | Which exercise | FK → Exercise.id |
| metric | TEXT enum('max_weight','max_volume_single_set','max_reps_at_bodyweight') | yes | Which PR type | — |
| value | REAL | yes | The PR value | — |
| achieved_date | TEXT (ISO date) | yes | When achieved | — |
| source_history_entry_id | TEXT (UUID) | yes | Which entry set this PR | FK → ExerciseHistoryEntry.id |

### 5.16 `RestTimerPreset`
| Field | Type | Required | Purpose | Relationships |
|---|---|---|---|---|
| id | TEXT (UUID) | yes | Primary key | — |
| user_id | TEXT (UUID) | yes | Owner | FK → User.id |
| label | TEXT | yes | e.g. "Compound lifts" | — |
| duration_s | INTEGER | yes | Countdown length | — |
| sort_order | INTEGER | yes | Display order | — |

### 5.17 `ChartDataSource` *(not a persisted table — a typed query-config object used by the app's chart service to describe what to fetch/aggregate; documented here because it was requested as an entity)*
```
type ChartDataSource =
  | { kind: 'pace_over_time'; userId: string; dateFrom: string; dateTo: string }
  | { kind: 'distance_over_time'; userId: string; dateFrom: string; dateTo: string; granularity: 'day'|'week'|'month' }
  | { kind: 'exercise_weight_over_time'; userId: string; exerciseId: string }
  | { kind: 'exercise_volume_over_time'; userId: string; exerciseId: string }
  | { kind: 'workout_frequency'; userId: string; dateFrom: string; dateTo: string; granularity: 'week'|'month' }
```
Each variant maps to one function in `services/statsService.ts` that queries SQLite and returns `{ x: string; y: number }[]` for the chart component. No separate table is needed because this is a *shape of a query*, not stored data.

### 5.18 Personal Notes — deferred pending 4.4 answer
If confirmed as a standalone feature: `Note { id, user_id, body, linked_entity_type?, linked_entity_id?, created_at }`. Not built until you confirm scope.

### 5.19 Entity-relationship summary

```
User 1—* RunningPlan 1—* PlannedRunSession 0..1—0..1 RunSession 1—* PaceSplit
User 1—* WorkoutProgram 1—* ProgramTemplateEntry *—1 CustomWorkoutTemplate 1—* TemplateExerciseEntry *—1 Exercise
User 1—* Exercise
User 1—* WorkoutSession 0..1—1 CustomWorkoutTemplate
WorkoutSession 1—* LoggedSet *—1 Exercise
LoggedSet 1—1 ExerciseHistoryEntry
Exercise 1—* ExerciseHistoryEntry
Exercise 1—* ProgressRecord
User 1—* RestTimerPreset
User 1—* FriendGroupMember (inert placeholder)
```

---

## 6. Logic and Calculations

All formulas below operate only on data the user has entered. No thresholds, targets, or "good/bad" judgments are invented — only comparisons between the user's own numbers.

### 6.1 Progressive overload
For a given `exercise_id`, on each new `LoggedSet` save:
1. Fetch the user's prior `ExerciseHistoryEntry` rows for that exercise, most recent first.
2. Compute `previous_best_weight = max(weight_kg)` and `previous_best_volume = max(volume_kg)` from history *before* this new entry.
3. Compare: `delta_weight = new.weight_kg - previous_best_weight`, `delta_volume = new.volume_kg - previous_best_volume`.
4. Classify: `increase` if delta > 0, `equal` if delta == 0, `decrease` if delta < 0, `first_time` if no prior history exists.
5. Display the classification and raw delta next to the set as it's logged. No suggested next target is generated.

### 6.2 Workout logging
- Creating a `WorkoutSession` sets `started_at = now()`.
- Each `LoggedSet` insert is immediate (not batched) so data isn't lost if the app closes mid-workout.
- Finishing sets `finished_at = now()`.
- On finish, the system generates one `ExerciseHistoryEntry` per `LoggedSet` in that session (see 6.3), then recomputes `ProgressRecord` rows for any exercise touched (see 6.10).

### 6.3 Exercise history tracking
- One `ExerciseHistoryEntry` per `LoggedSet`, created at session-finish time (not per-set), to avoid partial/duplicate entries if a set is edited mid-session.
- `volume_kg = weight_kg * reps` (0 if `weight_kg` is null, i.e., bodyweight movement — reps still tracked separately).
- History queries default-sort by `date DESC`.

### 6.4 Pace analysis
- `avg_pace_s_per_km = duration_s / (distance_m / 1000)` for the whole run.
- Per split: `pace_s_per_km = split.duration_s / (split.distance_m / 1000)`.
- Consistency: `pace_variance = stddev(all split paces in the run)`. Displayed as a number (e.g., "±8s/km"); no qualitative label attached (no "good/bad") since that would be an invented judgment.
- If the run is linked to a `PlannedRunSession` with a `target_pace_s_per_km`, show `actual - target` as a signed delta. No verdict text.

### 6.5 Running analysis
- Negative/positive split detection: compare average pace of the first half of splits vs. second half. `negative_split = true` if second half average pace is faster (lower s/km) than first half. This is a factual label describing the data, not advice.
- Comparison to prior run: find the user's most recent prior `RunSession` with `distance_m` within ±10% of the current one; show pace delta. If none exists, show "no prior comparable run" (not an error).

### 6.6 Running statistics
- Total distance in range = `SUM(distance_m)` over `RunSession` where `date BETWEEN dateFrom AND dateTo`.
- Average pace in range = `SUM(duration_s) / (SUM(distance_m)/1000)` (weighted, not a simple average of per-run paces).
- Run frequency = `COUNT(RunSession)` in range, grouped by week for the frequency chart.
- Planned-vs-actual completion rate = `COUNT(PlannedRunSession WHERE linked_run_session_id IS NOT NULL) / COUNT(PlannedRunSession)` for a given plan.

### 6.7 Workout statistics
- Total volume in range = `SUM(volume_kg)` over `ExerciseHistoryEntry` where date in range.
- Sessions per week = `COUNT(WorkoutSession)` grouped by ISO week.
- Most-trained exercises = `COUNT(LoggedSet) GROUP BY exercise_id ORDER BY count DESC` in range.
- PR count over time = `COUNT(ExerciseHistoryEntry WHERE is_pr_weight=1 OR is_pr_volume=1)` grouped by month.

### 6.8 Progress chart generation
- Each `ChartDataSource` variant (5.17) maps to a pure function `(db, params) => {x,y}[]`.
- All chart functions live in `services/statsService.ts`, are unit-tested independently of any UI, and return plain arrays consumed by the shared `<TrendChart />` component.
- Date bucketing (day/week/month) uses ISO week (Mon-start) for consistency.

### 6.9 Rest timer behavior
- On "start rest," store `{ endsAt: now() + durationS*1000 }` in memory (React state / Zustand slice), not in SQLite (transient).
- Countdown re-derives remaining time from `endsAt - now()` on every tick (not by decrementing a counter), so it stays correct if the app is backgrounded and resumed.
- On completion: trigger a local notification (via `expo-notifications`) *if* the app is backgrounded, plus haptic/sound if foregrounded.
- User can add/subtract 15s during an active timer (simple UI convenience, not a new module).

### 6.10 PR detection
On `WorkoutSession` finish, for each distinct `exercise_id` touched in that session:
1. Compute `max_weight_this_session` and `max_volume_single_set_this_session` from the session's `LoggedSet`s.
2. Compare against the existing `ProgressRecord` row for `(exercise_id, metric)`. If none exists or the new value is strictly greater, upsert `ProgressRecord` and mark the corresponding `ExerciseHistoryEntry.is_pr_* = 1`.
3. For bodyweight exercises where `weight_kg IS NULL`, track `max_reps_at_bodyweight` instead of `max_weight`.

### 6.11 Trend detection over time
- Defined narrowly as **linear direction over the selected date range**, computed via simple least-squares slope on the `{x,y}` series already produced for charts (x = day index, y = metric value).
- Output: `{ slope: number, direction: 'up' | 'down' | 'flat' }` where `flat` is `|slope| < epsilon` (epsilon = 1% of the y-range, a numerical stability choice, not a fitness judgment).
- Used only to draw a trend line on charts and to label the chart's direction arrow — never to generate advice text.

---

## 7. UI / UX

### 7.1 Main dashboard (Home)
Sections top-to-bottom: (1) This week's snapshot — total distance run + total volume lifted + session count, computed via 6.6/6.7 over a fixed "current ISO week" range; (2) two quick-action buttons: "Log Run" and "Start Workout"; (3) "Upcoming planned runs" (next 3 `PlannedRunSession` rows, if any exist); (4) "Recent activity" — interleaved last 5 `RunSession`/`WorkoutSession` by date, tappable to detail.

### 7.2 Running dashboard
Sections: current plan progress (if an active plan exists) → "Log Run" primary button → recent runs list (last 5, "See all" → Run History) → link into Running Statistics.

### 7.3 Strength dashboard
Sections: "Start Workout" primary button (opens template picker or blank session) → recent workout sessions (last 5, "See all" → Workout History) → link into Workout Statistics → link into Exercise Library.

### 7.4 Logging flows
**Run:** Log Run screen → numeric inputs for distance/duration (unit-aware per user preference, stored converted to metric) → optional "Add Splits" expandable section (repeatable split rows) → optional notes → Save → navigates to Run Session Detail (analysis auto-shown).

**Workout:** Strength dashboard → "Start Workout" → choose blank / template / program-next-template → Active Workout screen: exercise list, each expandable to add sets (weight, reps inputs, "Add Set" button) → progressive-overload delta shown per exercise the moment 2+ history points exist → Rest Timer button available per completed set → "Finish Workout" → Workout Summary screen (session totals + any PRs hit, per 6.10).

### 7.5 Chart screens
Shared `<TrendChart />` component: line chart, x-axis = date, y-axis = metric, toggle for date range (7d/30d/90d/all/custom), optional trend line overlay (6.11). Used inside Running Statistics, Workout Statistics, Exercise History Detail — never as a standalone screen.

### 7.6 History screens
Run History / Workout History: reverse-chronological list, each row shows date + headline metric (distance+pace, or exercise count+volume) + tap-through to detail. Supports basic date-range filter and (Workout History only) filter by exercise via search.

### 7.7 Custom workout builder
Template Editor: name field → "Add Exercise" opens a searchable picker over the user's `Exercise` library → each added row gets target sets/reps inputs and drag-to-reorder → Save.

### 7.8 Exercise library builder
Exercise Library List: search/filter bar (by name/category/equipment) → grid or list of exercise cards → "+ New Exercise" → Exercise Editor (name, category, equipment, notes, all free text/optional except name) → Save. Delete requires confirmation; if the exercise has history, delete is blocked with a message and an "archive instead" option (archived exercises are hidden from pickers but history remains intact).

### 7.9 Settings screen
Profile (display name), unit preference toggle, Rest Timer Presets (link to management screen), Data export (writes a JSON file of all tables, share sheet), Data import (pick a JSON file, validated then merged/replaced — user chooses), App version/info. App-lock toggle shown but disabled/labeled "Coming in a future version" (V2, per A4).

### 7.10 Empty states
- Exercise Library empty: "No exercises yet. Add your first exercise to start building your library." + button.
- Run History empty: "No runs logged yet." + "Log Run" button.
- Workout History empty: "No workouts logged yet." + "Start Workout" button.
- Running Plans empty: "No plans yet." + "New Plan" button.
- Chart with insufficient data (<2 points): render axes with a centered message "Not enough data yet" instead of a broken/empty chart.
- Exercise History Detail with 0 entries: "No history for this exercise yet."

### 7.11 Error states
- Form validation errors: inline, field-level, red border + message beneath field (see 8.10 for rules); Save button disabled until resolved.
- SQLite write failure: non-blocking toast "Couldn't save — try again" and the in-progress form data is preserved in memory (not cleared), so the user can retry without re-typing.
- Data import failure (malformed file): modal explaining the file couldn't be read, no partial import applied (all-or-nothing transaction).
- Delete-blocked (exercise with history): modal explaining why, offering "Archive instead."

### 7.12 Edit states
- All list screens support edit via tap → pushes the same Editor screen used for creation, pre-filled, with a "Delete" action in the header (subject to 7.11 blocking rule where relevant).
- `LoggedSet` rows inside an already-finished `WorkoutSession` are editable from Workout Session Detail (tap a set → inline edit weight/reps) — on save, the app re-runs 6.3/6.10 (history + PR recompute) for consistency, since editing a past set could change PR status.
- `RunSession` is editable the same way from Run Session Detail; editing recomputes 6.4/6.5 outputs live.

---

## 8. Technical Architecture

### 8.1 Frontend structure
React Native + Expo (TypeScript, strict mode). Functional components only, hooks-based. Navigation via `@react-navigation/native` with a bottom tab navigator (4 tabs) and one native stack navigator nested per tab, matching section 4.2.

### 8.2 State management
**Zustand** for app-level/UI state (active workout session in progress, rest timer state, current user/profile, unit preference). Chosen over Redux Toolkit for lower boilerplate given the "keep it simple" constraint — this app doesn't need Redux's middleware ecosystem. Server/remote state is not applicable (no backend in MVP). All *persisted* data goes through the SQLite data-access layer (8.4), not through Zustand persistence — Zustand only holds transient UI/session state.

### 8.3 Data storage
SQLite via `expo-sqlite`, wrapped in a typed repository layer (`db/repositories/*.ts`) — one repository per entity from section 5, each exposing typed CRUD + the specific query methods needed by section 6's calculations. Migrations handled via a simple versioned migration runner (`db/migrations/*.ts`, applied in order on app start, tracked via a `schema_version` table).

### 8.4 Optional sync / backup approach
MVP: manual JSON export/import (8.9/7.9), no network calls, no accounts. This satisfies "offline-first ... unless a cloud feature is absolutely necessary" — nothing here required it. A future cloud-sync layer (e.g., Supabase or Firebase) is documented only as a V2+ option in section 9 and is not built now.

### 8.5 Charting approach
`react-native-chart-kit` for all line charts, wrapped in a single shared `<TrendChart />` component (props: data points, y-label, optional trend line, date-range control) so every statistics screen reuses one implementation instead of one-off chart code. Chosen over `victory-native` specifically because it's SVG-based and needs no Skia/Reanimated native setup — it runs in plain Expo Go.

### 8.6 Timer handling
Rest timer state lives in a Zustand slice (`timerStore.ts`) holding `endsAt` (epoch ms), not a decrementing counter, per 6.9. A single `useRestTimer()` hook derives remaining seconds via `useEffect` + `setInterval(1000)`, recalculated from `endsAt` each tick so background/foreground transitions self-correct. `expo-notifications` schedules a local notification at `endsAt` when the timer starts, canceled if the timer is stopped early.

### 8.7 Local persistence
Covered by 8.3. Additionally: `expo-secure-store` is reserved for the future app-lock PIN (V2), not used in MVP.

### 8.8 Authentication
None in MVP (A4). The "User" row is created once on first launch via a simple local profile form (7.1's onboarding screen), no credentials.

### 8.9 Folder structure

```
app/
  App.tsx
  navigation/
    RootNavigator.tsx
    RunningStackNavigator.tsx
    StrengthStackNavigator.tsx
    SettingsStackNavigator.tsx
  screens/
    home/HomeDashboardScreen.tsx
    running/
      RunningDashboardScreen.tsx
      RunningPlansListScreen.tsx
      RunningPlanDetailScreen.tsx
      PlanSessionEditorScreen.tsx
      LogRunScreen.tsx
      RunSessionDetailScreen.tsx
      RunHistoryScreen.tsx
      RunningStatisticsScreen.tsx
    strength/
      StrengthDashboardScreen.tsx
      ExerciseLibraryListScreen.tsx
      ExerciseEditorScreen.tsx
      ExerciseDetailScreen.tsx
      ExerciseHistoryDetailScreen.tsx
      TemplateListScreen.tsx
      TemplateEditorScreen.tsx
      TemplateDetailScreen.tsx
      ActiveWorkoutScreen.tsx
      WorkoutSummaryScreen.tsx
      WorkoutHistoryScreen.tsx
      WorkoutSessionDetailScreen.tsx
      WorkoutStatisticsScreen.tsx
    settings/
      SettingsScreen.tsx
      RestTimerPresetsScreen.tsx
  components/
    charts/TrendChart.tsx
    forms/FormField.tsx
    forms/NumericInput.tsx
    lists/EmptyState.tsx
    lists/ListRow.tsx
    timer/RestTimerModal.tsx
    common/Button.tsx
    common/Card.tsx
  db/
    client.ts
    migrations/
      001_init.ts
    repositories/
      userRepository.ts
      runningPlanRepository.ts
      runSessionRepository.ts
      exerciseRepository.ts
      workoutSessionRepository.ts
      templateRepository.ts
      exerciseHistoryRepository.ts
      progressRecordRepository.ts
      restTimerPresetRepository.ts
  services/
    paceService.ts
    runningAnalysisService.ts
    overloadService.ts
    prService.ts
    statsService.ts
    trendService.ts
    exportImportService.ts
    unitConversionService.ts
  state/
    timerStore.ts
    userStore.ts
    activeWorkoutStore.ts
  types/
    entities.ts
    chartDataSource.ts
  utils/
    validation.ts
    dateUtils.ts
    idGenerator.ts
  __tests__/
    services/*.test.ts
    utils/*.test.ts
```

### 8.10 Reusable components
`TrendChart`, `FormField`, `NumericInput` (unit-aware, converts display↔storage), `EmptyState`, `ListRow`, `RestTimerModal`, `Button`, `Card`. All presentational components accept data via props only — no direct DB or service calls inside components (enforced separation, see 8.11/8.12).

### 8.11 Services and utilities
Business logic (sections 6.1–6.11) lives entirely in `services/*.ts` as pure or near-pure functions taking a DB handle + params, independent of any React component. Screens call services/repositories via hooks (e.g., `useRunStats(dateRange)`), never embed calculation logic inline.

### 8.12 Validation layer
`utils/validation.ts` exports typed validator functions per form (e.g., `validateRunEntry`, `validateExercise`, `validateLoggedSet`). Rules are structural only (required fields present, numeric fields non-negative, dates well-formed) — no content-based validation (e.g., no "reps must be under X" cap, since that would be an invented rule). All Editor screens run validation before enabling Save, and re-run it on edit.

### 8.13 Testing strategy
Jest for unit tests on every function in `services/` and `utils/` (pure logic, section 6 formulas — highest priority for correctness since they're the app's actual value). React Native Testing Library for a small set of critical-path component/integration tests (Log Run form validation, Active Workout add-set flow, Rest Timer countdown derivation). No E2E framework in MVP (Detox deferred to V2 if needed) — kept proportional to a private multi-user app, not a public product.

---

## 9. Implementation Plan

### MVP (build now)
- Local profile creation (no auth)
- Exercise Library (full CRUD)
- Custom Workout Templates (full CRUD)
- Active Workout logging (sets, weight, reps) + Workout Summary
- Log Run (manual entry + splits)
- Run Session Detail (pace + running analysis, 6.4/6.5)
- Exercise History + Progressive Overload indicator (6.1, 6.3)
- PR detection (6.10)
- Rest Timer + presets (6.9)
- Run History, Workout History (lists)
- Running Statistics, Workout Statistics (6.6/6.7) with Progress Charts (6.8)
- Settings: units, JSON export/import
- All empty/error/edit states from section 7

**Deferred out of MVP:** Running Plans module (whole module — needs your confirmation on A11 GPS question first, since plan targets and run linking touch that decision), Workout Programs (5.7/5.8 — schema included for forward-compat, but no screen wires it up yet), FriendGroupMember usage beyond storage, standalone Notes screen, app-lock.

### Version 1 (next)
- Running Plans module fully wired (screens 4–6 from the map): plan creation, planned sessions, linking to logged runs, planned-vs-actual stat.
- Workout Programs: sequencing multiple templates (Program List/Detail screens), "next workout in program" surfaced on Strength Dashboard.
- Personal notes screen, if confirmed needed (4.4).
- App-lock (PIN via `expo-secure-store` + biometric via `expo-local-authentication`).

### Version 2
- GPS-based run tracking (if you confirm A11 wants it): live map, background location, auto-splits — this is a substantial scope addition requiring its own permissions/UX design, deferred until explicitly requested.
- Optional cloud backup/sync (Supabase), still opt-in, still offline-first by default.
- Any friend-to-friend visibility features, once A2 is resolved — e.g., shared plan viewing, would require a backend and is not assumed.

### Explicitly deferred / future upgrades (not scheduled)
- Wearable integration (any smartwatch data import) — not requested.
- Social/leaderboard features — not requested, and would contradict the "private use" framing unless you ask for it.
- Any AI-generated coaching/recommendation text — explicitly excluded by your constraints, permanently out of scope unless you change that instruction.

---

## 10. File Structure

See 8.9 for the full annotated tree — this is the authoritative file structure and will be created exactly as shown when code generation begins.

---

## 11. Code Generation Plan

Given the size, code will be delivered in this sequence across follow-up messages, each a complete, runnable increment:

1. **Project scaffold**: `package.json`, `app.json`, `tsconfig.json`, Expo entry point, navigation shell (empty screens), install/run instructions for your phone via Expo Go.
2. **Database layer**: `db/client.ts`, migration `001_init.ts` (full schema from section 5), all repositories.
3. **Types & utils**: `types/entities.ts`, `utils/validation.ts`, `utils/dateUtils.ts`, `utils/idGenerator.ts`, `services/unitConversionService.ts`.
4. **Exercise Library module**: screens + repository wiring (first vertical slice, end-to-end, so you can verify the pattern before the rest is generated).
5. **Custom Workout Templates module**.
6. **Active Workout + Workout Summary + Rest Timer** (services: `overloadService.ts`, `prService.ts`, `state/timerStore.ts`, `state/activeWorkoutStore.ts`).
7. **Running module**: Log Run, Run Session Detail (`paceService.ts`, `runningAnalysisService.ts`).
8. **History screens** (Run History, Workout History, Exercise History Detail).
9. **Statistics + Charts** (`statsService.ts`, `trendService.ts`, `TrendChart.tsx`, both Statistics screens).
10. **Settings + export/import** (`exportImportService.ts`).
11. **Test suite** for all `services/` functions.
12. **Final run-on-phone instructions** (Expo Go QR flow) + smoke-test checklist.

Each step will include exact file paths (matching 8.9), full file contents (no pseudocode), and note any new dependency to `npm install`.

---

## 12. Acceptance Checklist

| Requirement | Covered where | Status |
|---|---|---|
| Running plans | §3.1, §5.3–5.4, §7 (Running dashboard), V1 phase | ✅ designed (MVP defers build, per §9) |
| Pace analysis | §3.2, §6.4 | ✅ |
| Running analysis | §3.3, §6.5 | ✅ |
| Workout tracking | §3.4, §5.12–5.13, §7.4 | ✅ |
| Progressive overload | §3.5, §6.1 | ✅ |
| Exercise history | §3.6, §5.14 | ✅ |
| Rest timer | §3.7, §5.16, §6.9, §8.6 | ✅ |
| Exercise library (user-built) | §3.8, §5.11, §7.8 | ✅ |
| Custom workout creation | §3.9, §5.9–5.10, §7.7 | ✅ |
| Running statistics | §3.10, §6.6 | ✅ |
| Workout statistics | §3.11, §6.7 | ✅ |
| Workout logging | §3.12, §6.2 | ✅ |
| Progress charts | §3.13, §6.8, §8.5 | ✅ |
| Every screen has a data source and a route | §4, §5 | ✅ |
| Every entity requested (User, Friend, RunningPlan, RunSession, PaceSplit, WorkoutProgram, WorkoutSession, Exercise, ExerciseHistoryEntry, ProgressRecord, RestTimerPreset, CustomWorkoutTemplate, ChartDataSource, Notes) | §5.1–5.18 | ✅ all present, notes conditional pending §4.4 |
| Create → log → review workflow, running | Plan (§3.1) → Log Run (§7.4) → Run Session Detail (§3.3) → Running Statistics (§3.10) | ✅ |
| Create → log → review workflow, strength | Exercise Library (§3.8) → Template (§3.9) → Active Workout (§3.4) → Exercise History/PR (§3.6/6.10) → Workout Statistics (§3.11) | ✅ |
| No invented training content | §1 A6/A12/A13, §3 throughout | ✅ enforced |
| No generic fitness advice/recommendations in logic | §6 formulas are comparative/descriptive only | ✅ enforced |
| Offline-first | §8.3–8.4 | ✅ |
| Runnable in VS Code / on phone | §11 step 1, Expo | ✅ (instructions delivered with scaffold) |

**Open items requiring your input before code generation starts** (repeated from §1 for convenience):
1. A2 — Do "friends" need any shared/visible functionality, or is this strictly per-person private data on separate devices?
2. A11 — Manual run entry (as designed) or live GPS tracking (bigger scope, V2 candidate)?
3. A13 — Pick an app name (or provide your own).
4. §4.4 — Standalone Notes screen, or field-level notes only (as currently designed)?
5. A3 — Confirm metric default with imperial toggle is acceptable.

Reply with answers to the above (or "go with your assumptions") and I'll start generating code per the section 11 sequence, beginning with the project scaffold.

---

## 13. Post-MVP Amendment — Hypractive Rebrand & Tone Overhaul

This section documents everything decided and built *after* the original MVP (§9) shipped, kept here so this document stays a trustworthy single source of truth rather than going stale. Items are tracked with a status so multi-session work ("one by one, no hurry") stays visible across conversations.

### 13.1 What already changed from the original design (factual record — all delivered)

| Area | Original | Now |
|---|---|---|
| App name | Hybrid Fitness | **Hypractive** |
| Palette | Dark brown/gold, Indian-art influenced | Strict two-tone **pearl-white / dark-black**, no third accent hue anywhere |
| Typography | System font | **Urbanist** (Google Fonts, SIL Open Font License) |
| Auth (§1 A4) | None | Local-only, cosmetic **email/password Sign Up / Log In / Log Out** — explicitly not a real backend: no password recovery, no cross-device sync, disclosed plainly in-app |
| New screens | — | **About**, **Nutrition Tracking placeholder** (Settings) |
| Signature motif | `RangoliMotif` (radial Indian-art pattern) | `GlossSheen` (gradient sheen), matching the new palette |
| Functional color states | Green/red for deltas, red for errors/danger | Monochrome — symbols and weight (▲ ▼ ✕ ⚠) instead of color, everywhere |

### 13.2 Tone & Copy Rewrite — **planned, not yet implemented**

**Design principle:** the brutal/roasting/dark-humor voice applies to branding, navigation labels, section headers, empty states, and achievement/completion moments. **Functional action buttons keep clear, literal labels** (Save, Delete, Cancel, Merge, Replace, form field labels) — a joke on a button that deletes something risks a real mistake, so clarity wins there regardless of tone elsewhere.

**Label rewrite map:**

| Location | Current | New |
|---|---|---|
| Home greeting | "Hi, {name}" | "Ah yes, {name}. Your excuses are waiting." |
| Home tab | Home | The Void |
| Running tab | Running | Escape Consequences |
| Running Statistics | Statistics | Evidence of Suffering |
| Recent Runs (section label) | Recent Runs | Recent Escapes |
| Log Run (button) | Log Run | File Your Escape |
| Start Workout (button) | Start Workout | Delay Your Decay |
| Start Blank Workout (button) | Start Blank Workout | Build Your Own Regret |
| Exercise Library | Exercise Library | Methods of Suffering |
| Workout History | Workout History | Trauma Archive |
| Workout Statistics | Statistics | Damage Report |
| Strength tab | Strength | Gravity Negotiations |
| Settings tab | Settings | Self-Sabotage |
| Profile (section label) | Profile | Victim Profile |
| About screen | About | Who Built This? |
| About subsections | (single page) | The Cult Manifesto · Why This Exists · Meet Your Tormentor · Terms of Suffering |

Additional labels not explicitly specified will get a matching pass at implementation time (e.g. Templates, Rest Timer, list "+ New" buttons) — logged here as decided, not guessed silently.

**Empty states** (one picked at random each time the empty state renders, for variety):

*No workouts yet:*
- "Your muscles are still theoretical."
- "Even your couch misses you."
- "Nothing here. Like your motivation."

*No runs yet:*
- "You've successfully avoided cardio."
- "Your legs remain unemployed."
- "Zero escapes recorded."

**Achievement-style messages** (shown on workout/run completion, picked at random):
- "Congratulations. Gravity almost lost."
- "You disappointed your couch today."
- "Your excuses burned fewer calories than you did."
- "Your future self is mildly less disappointed."
- "Even your knees are questioning your decisions."

**New component:** `RoastCard` — a reusable card showing one random dark-humor line from a shared pool, placed between sections on dashboard screens (Home, Running, Strength).

### 13.3 Dashboard Redesign — **planned, not yet implemented**

Scope: Home screen restructure plus supporting reusable components, inspired by Nike Run Club / Hevy / Gentler Streak while keeping Hypractive's own identity (pearl-white/black, monochrome, Urbanist, roast humor).

- Large hero section at the top of Home
- Primary CTA prominently displayed
- Horizontal-scrolling "Recent Activity" cards
- Quick-action grid
- `RoastCard` placed between sections
- Bottom nav, 4 tabs (exists — labels updated per §13.2)
- Smooth micro-interactions / subtle animations — RN's built-in `Animated` API first, no new dependency unless something genuinely needs more
- Glassmorphism treatment consistent with the pearl-white/black palette — **needs `expo-blur`, a new dependency** (lightweight, Expo-native, Expo Go-safe — not the risky native-SDK-matching kind)
- Consistent 8pt spacing — audit existing usage against `theme/tokens.ts`'s `spacing` scale, which is already 8pt-based
- Large touch targets (48px+) — audit existing buttons/rows, some may need padding increases
- Responsive across screen sizes
- Reusable Card/Button/Stat components — mostly exist, extend as needed rather than duplicate
- Loading skeletons — new component
- Empty-state templates — extend the existing `EmptyState` component to support random-pick copy variants
- Icons for every section — **`@expo/vector-icons`**, already bundled with Expo core, zero new install cost

### 13.4 Tracking checklist

| Item | Status |
|---|---|
| Navigation label rewrite (§13.2 table) | **Done** |
| Empty state copy + random-pick logic | **Done** — `app/content/roastCopy.ts` holds the shared pools; wired into Run History, Workout History, and the Running dashboard's inline preview. Exercise Library's empty state was deliberately left alone — the provided copy is about *workouts*/*runs*, not an empty library, and would read oddly there. Search-no-results states also stay functional/clear, not randomized, since that's a different situation (you have data, the search just didn't match) |
| Achievement messages wired into Workout Summary + Run Session Detail | **Done** — verified both screens correctly pick a random line; Run Session Detail only shows it right after logging (via a `justSaved` route param), not on every revisit |
| `RoastCard` component + placement | **Done** — new evergreen `ROAST_LINES` pool (distinct from the state-specific empty/achievement lines) added to `roastCopy.ts`; placed on Home, Running dashboard, and Strength dashboard |
| About screen restructure (4 subsections) | **Done** — "The Cult Manifesto" (mission), "Why This Exists" (rationale), "Meet Your Tormentor" (the local-login disclosure, tone reframed but the factual disclosure kept intact and accurate), "Terms of Suffering" (data/backup policy). Font credit kept as a small 5th "The Fine Print" footer since it's a license attribution, not one of the four requested sections |
| Home dashboard redesign (hero, quick actions, horizontal recent activity) | **Done** — hero (greeting + This Week stat card), primary CTA row, `RoastCard`, horizontal-scrolling Recent Activity row mixing runs and workouts by date (new `getRecentActivity` in `statsService.ts`, new `RecentActivityCard`/`QuickActionCard` components), quick-action grid linking to Statistics/History/Library. Screen is now scrollable (was a fixed View before), needed once regardless of the separate responsive-audit item |
| Glassmorphism treatment (`expo-blur`) | **Done** — scoped to two places where blur genuinely reads as "glass": the Rest Timer modal backdrop (real content visible behind it) and the bottom tab bar (frosted tint). Deliberately did **not** make the tab bar float over content (`position: absolute`) — that would require auditing bottom padding on every scrollable screen in the app to stop content being hidden behind it, which is a bigger, separate job than "add glass," so it's flagged here rather than done partially |
| Home page restructure (unplanned, requested mid-task) | **Done** — Home was getting cluttered (hero stats, activity feed, and a quick-action grid all inline). Restructured into: Home is now its own stack navigator, the dashboard itself fetches no data and shows nothing but the greeting + primary actions + a link out, and "This Week" / "Recent Activity" are now their own dedicated pushed screens. Removed the quick-action grid entirely rather than relocating it — its destinations (Statistics, History, Library) were already one tap away via the Running/Strength tabs, so it was pure duplication |
| Icon system (`@expo/vector-icons`) | **Done** — tab bar icons (moon/footsteps/barbell/settings, filled when active), `Button` now supports an optional leading icon and the danger variant auto-shows a close icon, `EmptyState` got a moon icon. While wiring this up I found and fixed a real bug: 4 places had corrupted unicode escapes rendering literal text like "2715 Remove split" and "26A0 {error}" instead of a symbol, left over from an earlier session's edit. Replaced all of them with real icons rather than just fixing the escape — removes that whole bug class going forward |
| Color scheme update (user-provided 4-color palette) | **Done** — `#000000`/`#464646`/`#9C9A9A` became the text/border grayscale hierarchy, `#A35E47` became the new accent (previously the accent was plain black, matching the old strict-two-color rule — that rule is superseded now that there's a real accent color by design). Factual deltas/errors still use symbols and weight rather than color, since that choice was about accessibility, not just "no color was available" |
| Loading skeletons | **Done** — new `Skeleton` primitive (pulsing opacity via RN's built-in `Animated`, no new dependency) plus two composed shapes, `SkeletonListRow` and `SkeletonStatCard`. Wired into Exercise Library, Templates, Workout History, Recent Activity (all had a `loading` flag that previously just rendered blank), and Running/Workout Statistics (previously `return null`'d entirely during their fetch — the most jarring gap, now shows a real skeleton instead). Not wired into every remaining detail screen (Run/Workout Session Detail, Exercise Detail/History Detail, Template Detail) — those load near-instantly from a single row lookup rather than a multi-query fetch, so the blank-frame window is much smaller; flagging as a possible follow-up rather than silently skipping it. **Caught a real bug while doing this**: my own edit to Workout Statistics initially left a duplicate `const unit` declaration (a genuine compile error) — caught by a second verification pass before packaging, not shipped |
| Micro-interactions/animations | Not started |
| 8pt spacing + touch-target audit | Not started |
| Responsive layout audit | Not started |

