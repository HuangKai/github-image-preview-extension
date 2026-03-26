# GitHub Image Preview

A Chrome extension that adds a lightbox-style image preview for images in GitHub README and Wiki pages.

## Features

- Click any image in README or Wiki to open a full-screen overlay preview
- Navigate between images with left/right arrow buttons or keyboard `←` `→`
- Zoom with mouse wheel, keyboard `+`/`-`, reset with `0`
- Drag to pan when zoomed in
- Press `Esc` to close
- Image counter and zoom percentage display
- Automatically filters out SVGs and small icons/emoji
- Supports GitHub Turbo Drive and PJAX navigation

## Installation

1. Download or clone this repository
2. Open `chrome://extensions/` in Chrome
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked**
5. Select the project folder

## Usage

1. Navigate to any GitHub repository page with a README or Wiki
2. Click on any image to open the preview overlay
3. Use the controls to browse and zoom:

| Action | Control |
|--------|---------|
| Next image | `→` or right arrow button |
| Previous image | `←` or left arrow button |
| Zoom in | Mouse wheel up or `+` |
| Zoom out | Mouse wheel down or `-` |
| Reset zoom | `0` |
| Pan (when zoomed) | Click and drag |
| Close | `Esc` or click outside image |

## File Structure

```
├── manifest.json          # Chrome extension manifest (MV3)
├── content/
│   └── index.js           # Content script (all logic)
└── styles/
    └── overlay.css        # Overlay styles
```

## License

MIT
