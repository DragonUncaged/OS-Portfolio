# OS Portfolio

My portfolio, built as three operating systems that boot in a browser tab.

The first screen is a startup manager. Pick macOS, Windows or Linux and it boots, shows a login or
lock screen and lands on a desktop with real windows. Make the window narrow, or open the site on a
phone, and the desktop turns into that system's phone with the same apps still open.

| On a wide screen      | On a phone-sized screen   |
| --------------------- | ------------------------- |
| macOS-style desktop   | iPhone-style phone        |
| Windows-style desktop | Windows Phone-style phone |
| Ubuntu-style desktop  | Pixel-style Android phone |

![The startup manager with macOS, Windows and Linux](docs/screenshots/picker.jpg)

The portfolio itself is in the apps. About, Projects, Experience, Skills, Resume and Contact hold the
content. A terminal reads the same content through commands, a file browser shows it as folders and
files, and a browser opens the live projects. The system you pick is remembered, and restarting any
of them brings the startup manager back.

## Screenshots

### macOS

The desktop follows macOS 27: glass materials over the wallpaper, a menu bar with no background,
sidebars that run the full height of a window and toolbar buttons in glass capsules.

![macOS desktop with the About window](docs/screenshots/macos-desktop.jpg)
![Several windows open in dark mode](docs/screenshots/macos-windows.jpg)
![Spotlight searching for a project](docs/screenshots/macos-spotlight.jpg)
![The app browser inside Spotlight](docs/screenshots/macos-apps.jpg)
![Control Centre](docs/screenshots/macos-control-centre.jpg)
![Notification Centre with widgets](docs/screenshots/macos-notification-centre.jpg)
![Mission Control](docs/screenshots/macos-mission-control.jpg)
![System Settings with the Liquid Glass slider](docs/screenshots/macos-settings.jpg)
![Login window](docs/screenshots/macos-login.jpg)

### iPhone

Lock screen, home screen, App Library, search and Control Centre:

![iPhone system screens](docs/screenshots/iphone.jpg)

Home screen in dark mode, Projects, a project page, Terminal and the app switcher:

![iPhone apps](docs/screenshots/iphone-apps.jpg)

### Windows

![Windows desktop](docs/screenshots/windows-desktop.jpg)
![Start menu in dark mode](docs/screenshots/windows-start.jpg)
![Search from the Start menu](docs/screenshots/windows-search.jpg)
![Quick settings](docs/screenshots/windows-quick-settings.jpg)
![Task view](docs/screenshots/windows-task-view.jpg)
![Lock screen](docs/screenshots/windows-lock.jpg)

### Windows Phone

Lock screen, Start tiles, the app list, search and the action centre:

![Windows Phone system screens](docs/screenshots/windows-phone.jpg)

Start in dark mode, Projects, a project page, Settings and the app switcher:

![Windows Phone apps](docs/screenshots/windows-phone-apps.jpg)

### Ubuntu

![Ubuntu desktop](docs/screenshots/ubuntu-desktop.jpg)
![Windows open in dark mode](docs/screenshots/ubuntu-windows.jpg)
![Activities overview with search](docs/screenshots/ubuntu-activities.jpg)
![App grid](docs/screenshots/ubuntu-app-grid.jpg)
![System menu](docs/screenshots/ubuntu-system-menu.jpg)
![Login screen](docs/screenshots/ubuntu-login.jpg)

### Android

Lock screen, home screen, app drawer, search and the notification shade:

![Android system screens](docs/screenshots/android.jpg)

Home screen in dark mode, Projects, Terminal, Settings and recents:

![Android apps](docs/screenshots/android-apps.jpg)

## What each system has

Every system has a boot screen, a login or lock screen, a live clock, its own wallpapers, light, dark
and automatic appearance, eight accent colours, notifications, brightness and night light, and a way
to lock, log out, shut down and restart.

The desktops have real window management. Windows drag, resize from any edge or corner, minimise to
their dock icon, maximise, restore and stack on click.

- **macOS.** Menu bar with working menus, a magnifying Dock, Spotlight with app, file and action
  views, Ask Siri, Mission Control, Control Centre, Notification Centre with widgets, desktop icons
  and context menus. Ask Siri answers from the portfolio data with a small set of rules in
  `src/shells/macos/answers.ts`, so it only says what the rest of the site says.
- **Windows.** Centred taskbar, Start menu with search, Task View, quick settings, a notification
  and calendar flyout, edge snapping with a preview, show desktop and desktop icons.
- **Ubuntu.** Top bar, dock, Activities overview with search, app grid, system menu, a calendar and
  notifications popover, edge tiling and desktop icons.

The phones each have a status bar, a home screen, open and close animations and that system's own
navigation.

- **iPhone.** Paged home screen with widgets, Dock, App Library, a home bar that opens the app
  switcher when held, swipe back from the left edge, Control Centre, Notification Centre and search.
- **Windows Phone.** Live tiles that flip, an alphabetical app list, Back, Start and Search keys,
  pivots and an action centre.
- **Android.** Pixel-style lock screen and launcher, app drawer, search, a notification shade with
  quick settings tiles, recents, gesture navigation with a back gesture from either edge and a power
  menu.

## Apps

There are 22 apps. They read the same data everywhere and take the name each system would give them.

| App | macOS | Windows | Ubuntu |
| --- | ----- | ------- | ------ |
| About, Projects, Experience, Skills, Resume, Contact | same names | same names | same names |
| Terminal | Terminal | Terminal | Terminal |
| File browser | Finder | File Explorer | Files |
| Web browser | Safari | Edge | Web |
| Settings | System Settings | Settings | Settings |
| Notes | Notes | Sticky Notes | Notes |
| Calculator, Calendar, Clock | same names | same names | same names |
| Music | Music | Media Player | Music |
| Photos | Photos | Photos | Photos |
| Drawing | Freeform | Paint | Drawing |
| Mines | Mines | Minesweeper | Mines |
| Snake | Snake | Snake | Snake |
| Tips | Tips | Tips | Help |
| System monitor | Activity Monitor | Task Manager | System Monitor |
| Document viewer | Preview | Notepad | Document Viewer |

The terminal has `help`, `ls`, `cd`, `cat`, `tree`, `open`, `neofetch`, `theme`, `wallpaper`, `reboot`
and more, with tab completion and history. A few things are hidden on purpose, and `help` is a good
place to start looking.

## Stack

Next.js 16 with the App Router, React 19, TypeScript, Tailwind CSS 4, Motion and Zustand. There is no
backend, no database and no environment variable to set.

Each of the six shells and each of the 22 apps is its own chunk. Picking one system downloads only
that system, and an app's code arrives the first time it opens. The page also carries the content as
plain HTML for search engines, screen readers and browsers without JavaScript.

## Run it locally

You need Node.js 22 or newer.

```bash
git clone https://github.com/DragonUncaged/OS-Portfolio.git
cd OS-Portfolio
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm run start      # serve the production build
npm run lint       # ESLint
npm run typecheck  # TypeScript, no emit
```

## Project structure

```
src/
  app/          routes, metadata, error pages, robots, sitemap and the global stylesheet
  apps/         one file per app, plus the registry of names, icons and window sizes
  components/   shared UI: windows, the app frame, menus, icons, wallpapers, the phone host
  shells/       the startup manager and one folder per system
    macos/        macOS desktop and iPhone, with their stylesheets
    windows/      Windows desktop and Windows Phone
    linux/        Ubuntu desktop and Android phone
  stores/       Zustand stores: session, settings, window manager, phone, music player
  lib/          logic with no UI: terminal commands, virtual file system, search, synth, formatting
  hooks/        React hooks
  types/        shared types
  data/         portfolio.ts, the content
docs/
  screenshots/  the images in this README
```

All the content is in `src/data/portfolio.ts`: name, bio, roles, projects, skills, experience,
education and links. Every shell, app, terminal command, file, search result and the page metadata
read from it, so an edit there shows up everywhere.

## Deploying on Vercel

No configuration is needed.

1. Import the repository in Vercel with **Add New, Project**.
2. Keep the detected settings: framework Next.js, build command `next build`.
3. Deploy.

Or run `npx vercel` in this folder for a preview and `npx vercel --prod` for production.

Link previews, the sitemap and the canonical URL use `VERCEL_PROJECT_PRODUCTION_URL`, which Vercel
sets by itself. `next.config.ts` sends a Content-Security-Policy and the usual security headers. The
policy allows scripts from the site only, so Vercel's preview toolbar does not load on preview
deployments.

## Keyboard shortcuts

Each system lists its shortcuts and gestures in its Tips app. The browser keeps some keys for itself,
so a few are remapped.

| Action | Keys |
| ------ | ---- |
| Search and launcher | `Ctrl+K` everywhere, `⌘K` on macOS |
| Close, minimise, zoom a window | `Alt+W`, `Alt+M`, `Alt+Enter` |
| Cycle windows | ``Alt+` `` |
| Window overview | `F3` on macOS, `Ctrl+Alt+Tab` on Windows, `Ctrl+K` on Ubuntu |
| Browse apps on macOS | `F4`, or the Apps icon in the Dock |
| Terminal on Ubuntu | `Ctrl+Alt+T` |

On Windows and Ubuntu, drag a window to a screen edge to tile it.

## Credits and licences

No wallpaper, icon file or logo from Apple, Microsoft, Canonical or Google is used. The wallpapers,
the app icons, the system marks, the window chrome, the avatar monogram, the project covers and the
music are all drawn or synthesised in this repository's code. The fonts and icon sets that ship with
the site are these:

| Asset | Used for | Licence |
| ----- | -------- | ------- |
| [Phosphor Icons](https://phosphoricons.com) (`@phosphor-icons/react`) | Interface glyphs, and app icons on Windows, Ubuntu and Android | MIT |
| [Simple Icons](https://simpleicons.org) (`simple-icons`) | Technology logos and the GitHub and CodeChef marks | CC0 1.0 |
| [Inter](https://rsms.me/inter/) (`@fontsource-variable/inter`) | Startup manager, fallback face on macOS and iPhone | SIL OFL 1.1 |
| [JetBrains Mono](https://www.jetbrains.com/lp/mono/) (`@fontsource-variable/jetbrains-mono`) | Terminals and other monospaced text | SIL OFL 1.1 |
| [Open Sans](https://fonts.google.com/specimen/Open+Sans) (`@fontsource-variable/open-sans`) | Fallback face on Windows and Windows Phone | SIL OFL 1.1 |
| [Ubuntu](https://design.ubuntu.com/font) (`@fontsource/ubuntu`) | Ubuntu desktop | Ubuntu Font Licence 1.0 |
| [Google Sans Flex](https://fonts.google.com/specimen/Google+Sans+Flex) (`@fontsource-variable/google-sans-flex`) | Android phone | SIL OFL 1.1 |

Where a device already has the real system font, such as San Francisco or Segoe UI, the shells use
it through an ordinary CSS font stack. No such font is shipped.

Code dependencies: Next.js, React, Tailwind CSS, Motion and Zustand, all MIT.

## Trademarks

The brand marks in Simple Icons belong to their owners. macOS, iPhone, Safari, Finder, Spotlight and
Siri are trademarks of Apple. Windows, Windows Phone and Edge are trademarks of Microsoft. Ubuntu is
a trademark of Canonical. Android and Pixel are trademarks of Google. This is an independent
portfolio that imitates the feel of those systems. It is not affiliated with or endorsed by any of
them.
