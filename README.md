# Scroll Progress – Obsidian Plugin

Scroll Progress is a minimalist and customizable scroll progress indicator for Obsidian.md. It adds a horizontal bar (and optional percentage) that shows how far you've scrolled through your current note, providing spatial context especially in long documents.

## Features

- Horizontal scroll progress bar at the top or bottom of the editor pane.
- Optional percentage display in the status bar.
- Supports both Reading Mode and Live Preview/Edit Mode.
- Fully configurable: height, color, position, and scroll animation duration.
- Built-in commands to scroll to the top or bottom of a note.
- Optional debug logging to assist in troubleshooting.

## Installation

[Find at Obsidian.md/plugins](https://obsidian.md/plugins?search=scroll-progress)

### From Obsidian

1. Open Obsidian Settings
2. Go to Community Plugins and disable Safe Mode
3. Click Browse and search for "Scroll Progress"
4. Install the plugin and enable it

### Manual Installation

1. Download `main.js`, `manifest.json` & `styles.css` from the latest [release](https://github.com/gapmiss/scroll-progess/releases/)
2. Create a new folder `/path/to/vault/.obsidian/plugins/scroll-progess`
3. Move all 3 files to `/path/to/vault/.obsidian/plugins/scroll-progess`
4. Settings > Community plugins > Reload plugins
5. Enable the "Scroll Progress" plugin in the community plugin list

### Via BRAT (Beta Reviewer's Auto-update Tool):

1. Ensure the [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin is installed
2. Trigger the command Obsidian42 - BRAT: Add a beta plugin for testing
3. Enter this repository, gapmiss/scroll-progess
4. Enable the "Scroll Progress" plugin in the community plugin list

## Settings

Accessible via **Settings → Scroll Progress** in Obsidian.

| Setting                          | Description                                                   |
|----------------------------------|---------------------------------------------------------------|
| Enable bar                       | Toggles the visual progress bar.                             |
| Bar height                       | Sets the height of the bar in pixels (2–20).                 |
| Bar color                        | Defines the color of the scroll bar.                         |
| Bar position                     | Sets bar position to top or bottom.                          |
| Show progress % in status bar    | Displays the scroll percentage in the status bar.            |
| Scroll animation duration        | Sets animation duration (200–2000 ms) for smooth scrolling.  |
| Enable debug logs                | Outputs scroll debug info in the browser console.            |

## Commands

Available via the command palette:

- `Scroll to top` — Smoothly scrolls to the beginning of the note.
- `Scroll to bottom` — Smoothly scrolls to the end of the note.

## Developer Notes

### Build Instructions

If you're modifying or developing this plugin:

```bash
# Clone the repository
git clone https://github.com/gapmiss/scroll-progress.git
cd scroll-progress

# Install dependencies
npm install

# Build the plugin
npm run build
```

Refer to the [Obsidian Plugin Developer Docs](https://docs.obsidian.md/Plugins) for more information.

## Why Use This?

Whether you're skimming a novel, reading long-form notes, or jumping between headers, Scroll Progress gives you spatial awareness within your documents—without breaking focus.

## Author

**[@gapmiss](https://github.com/gapmiss)**

## License

This plugin is licensed under the [MIT License](./LICENSE).