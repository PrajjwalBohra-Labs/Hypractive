# Hypractive

A simple, local-first fitness app for tracking workouts and runs. Everything stays on your phone, no account, no cloud sync, just you and your fitness data.

## About

Hypractive is a mobile fitness app designed to help you track and optimize your workouts and running activities. Whether you're hitting the gym or logging miles on the road, Hypractive gives you the tools to log exercises, monitor your progress, and watch yourself get stronger over time.

The app tracks your personal records, analyzes your running pace, and shows you trends through charts so you can see real progress. You can save your favorite workout templates, use the built-in rest timer between sets, and export your data for backup or analysis. Everything stays on your phone, no account or internet required, just solid local tracking that you control completely.

Built with a focus on clarity and simplicity, Hypractive cuts through the noise with a clean two-tone design and straightforward functionality. It's your personal fitness companion, nothing more, nothing less.

## What's included

- **Exercise Tracking**: Log workouts with sets, reps, and weight; track your personal records automatically
- **Running Analysis**: Track pace, distance, and time; get running statistics and trends
- **Progressive Overload**: See when you've lifted more weight or done more reps than before
- **Workout Templates**: Save your favorite workouts and reuse them with one tap
- **Rest Timer**: Configurable rest timer between sets to keep your workout flowing
- **History & Stats**: View past workouts, runs, and detailed statistics with progress charts
- **Backup & Export**: Export your data for safekeeping or analysis elsewhere
- **Clean Design**: Two-tone pearl-white/dark-black interface with Urbanist typeface

## Technical

Hypractive is built as a React Native app using TypeScript, ensuring type safety and a smooth development experience. Here's what powers it:

**Tech Stack:**
- **React Native**: cross-platform mobile framework
- **TypeScript**: for type-safe code and better developer experience
- **SQLite**: local database for storing workouts, exercises, and personal records
- **Zustand**: lightweight state management for app state
- **React Navigation**: native navigation handling across screens

**Architecture:**
The app is organized into clear layers: screens for UI, services for business logic, repositories for database access, and a state layer for global app state. This separation makes it easy to test, maintain, and add new features. Navigation is handled through stack-based routing, keeping the user flow intuitive and predictable.

**Testing:**
We test the core calculation logic and services to make sure everything works reliably. The test suite covers exercises, running analysis, progressive overload calculations, and data import/export.

## Current build status

Delivery 8: rebrand to Hypractive with pearl-white/dark-black visual redesign, Urbanist typeface, local email/password login, and About screen.

**12 of 13 modules complete.** Running Plans are deferred as planned. The only major feature not yet built is app-lock, workout programs, and the final `.apk` build.

## Getting started

**New here?** Start with [`SETUP.md`](SETUP.md) — step-by-step install and run instructions...

### Everyday commands

```bash
npm start          # run the app
npm test           # run the test suite
npm run typecheck  # check TypeScript types
```
