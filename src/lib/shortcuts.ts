import type { Platform } from "@/types";

export interface Shortcut {
  keys: string;
  does: string;
}

export const SHORTCUTS: Record<Platform, Shortcut[]> = {
  macos: [
    { keys: "⌘K  or  ⌃Space", does: "Open Spotlight search" },
    { keys: "⌥W", does: "Close the front window" },
    { keys: "⌥M", does: "Minimise the front window" },
    { keys: "⌥↩", does: "Zoom the front window" },
    { keys: "⌥`", does: "Cycle through windows" },
    { keys: "⌃↑  or  F3", does: "Mission Control" },
    { keys: "F4", does: "Launchpad" },
    { keys: "esc", does: "Dismiss search, Launchpad or Mission Control" },
    { keys: "Double-click a title bar", does: "Zoom the window" },
    { keys: "Right-click", does: "Context menus on the desktop, the Dock and files" },
  ],
  windows: [
    { keys: "Ctrl+K  or  ⊞ (where the browser sees it)", does: "Open Start and search" },
    { keys: "Alt+W", does: "Close the active window" },
    { keys: "Alt+M", does: "Minimise the active window" },
    { keys: "Alt+Enter", does: "Maximise or restore" },
    { keys: "Alt+`", does: "Switch between windows" },
    { keys: "Ctrl+Alt+Tab", does: "Task view" },
    { keys: "Ctrl+Alt+D", does: "Show the desktop" },
    { keys: "Drag a window to an edge", does: "Snap it to that half, or to the top to maximise" },
    { keys: "Esc", does: "Close Start, search or task view" },
    { keys: "Right-click", does: "Context menus on the desktop, taskbar icons and files" },
  ],
  ubuntu: [
    { keys: "Ctrl+K  or  Super (where the browser sees it)", does: "Open the Activities overview" },
    { keys: "Ctrl+Alt+T", does: "Open a terminal" },
    { keys: "Ctrl+Alt+A", does: "Show the app grid" },
    { keys: "Alt+W", does: "Close the focused window" },
    { keys: "Alt+M", does: "Minimise the focused window" },
    { keys: "Alt+Enter", does: "Maximise or restore" },
    { keys: "Alt+`", does: "Switch between windows" },
    { keys: "Drag a window to an edge", does: "Tile it to that half, or to the top to maximise" },
    { keys: "Esc", does: "Leave the overview" },
    { keys: "Right-click", does: "Context menus on the desktop, the dock and files" },
  ],
  ios: [
    { keys: "Tap the bar at the bottom", does: "Go home" },
    { keys: "Hold the bar, or swipe it up", does: "Open the app switcher" },
    { keys: "Swipe a card up", does: "Close that app" },
    { keys: "Tap the right of the status bar", does: "Control Centre" },
    { keys: "Tap the left of the status bar", does: "Notifications" },
    { keys: "Swipe the home screen", does: "Change page. The last page is the App Library" },
    { keys: "Search pill above the Dock", does: "Search apps and content" },
    { keys: "Power tile in Control Centre", does: "Power off, or restart into another system" },
  ],
  wp: [
    { keys: "⊞ Start button", does: "Go to the Start screen" },
    { keys: "← Back button", does: "Go back; hold it for the app switcher" },
    { keys: "Search button", does: "Search apps and content" },
    { keys: "Swipe the Start screen left, or tap the arrow", does: "The full app list" },
    { keys: "Tap the status bar", does: "Action centre and quick settings" },
    { keys: "Swipe a card up, or tap ✕", does: "Close that app" },
  ],
  android: [
    { keys: "○ Home", does: "Go to the home screen" },
    { keys: "◁ Back", does: "Go back inside an app, or leave it" },
    { keys: "□ Recents", does: "Open the recent-apps switcher" },
    { keys: "Swipe the home screen up", does: "Open the app drawer" },
    { keys: "Tap or pull down the status bar", does: "Notifications and quick settings" },
    { keys: "Search bar on the home screen", does: "Search apps and content" },
    { keys: "Swipe a card up", does: "Close that app" },
    { keys: "Power button in quick settings", does: "Power off or restart" },
  ],
};
