# Setup — Read This First

## Before you unzip anything: pick the right folder

Do **not** put this project inside a OneDrive-synced folder (or Dropbox,
Google Drive, etc). Those services try to sync `node_modules` — a folder
with tens of thousands of tiny files — in real time, and on Windows this
reliably corrupts installs in confusing ways.

**Create a plain folder outside any synced drive first:**
- Windows: `C:\Dev`
- Mac: `~/Dev`

Unzip this project into `C:\Dev\hypractive` (or `~/Dev/hypractive`).

## 1. Install Node.js

[nodejs.org](https://nodejs.org) → LTS version → install with defaults.
Verify: `node -v`

## 2. Install Expo Go on your phone/tablet

App Store (iPhone) or Play Store (Android) → search "Expo Go" → install.

## 3. Open the project in VS Code

File → Open Folder → select the `hypractive` folder.

## 4. Install dependencies

```
npm install
```

This round adds a few new packages (gradient effects, local password
hashing, and the Urbanist font) — if you see a peer-dependency warning,
the project's `.npmrc` already handles it automatically, plain
`npm install` is enough.

## 5. Run it

```
npm start
```

Scan the QR code with Expo Go. Phone and computer must be on the same
Wi-Fi network.

## 6. What you should see

A Sign Up / Log In screen (this account is local-only — see the About
screen in-app for what that means), then Home / Running / Strength /
Settings tabs once you're in.

## If something breaks

Copy the exact error text (or a screenshot) and send it over.

## Building a real .apk later

When everything's finalized, a standalone installable `.apk` (for
sideloading onto specific Android phones, no Play Store needed) is built
via **EAS Build** — Expo's cloud build service. That's a separate step
from everyday development and needs a free Expo account; ask when you're
ready and I'll walk through it.

## Why the versions in package.json are what they are

This targets Expo SDK 54 (React Native 0.81, React 19.1) — whatever Expo
Go currently supports may move on eventually. If Expo Go ever reports an
"incompatible" error again: run `npx expo install expo@latest` then
`npx expo install --fix`, and share the output before installing anything
it flags as a conflict.
