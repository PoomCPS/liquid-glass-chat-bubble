# Liquid Glass Stream Chat Overlay (iOS 27 Optics)

A zero-backend, 100% client-side glassmorphic chat overlay for OBS Studio and streaming software. Built with physical optical refraction, chromatic dispersion bevels, directional role LED spotlights, official Twitch badge icons, and animated sticker/emote support.

---

## ✨ Features

- **Liquid Glass Optics**: Multi-variable backdrop refraction with realistic curved edge displacement mapping and chromatic aberration prism highlights.
- **Directional Corner LED Spotlight**: Conical light beam projected into the bottom-right corner of each bubble, tuned to chatter roles:
  - 👑 **Broadcaster / Host**: Radiant Amber / Gold
  - 🛡️ **Moderator**: Deep Indigo / Purple
  - 💎 **VIP**: Vivid Magenta / Rose
  - ⭐ **Subscriber**: Electric Teal / Cyan
  - 👁️ **Viewer**: Crisp Prism Glint
- **Official Twitch Badges**: High-DPI icons for Broadcaster, Moderator, VIP, custom channel Subscriber tiers, Verified Partner, Prime Gaming, and Founder badges.
- **Animated Stickers & Emotes**: Full support for Twitch native v2 animated WebP/GIF stickers & emotes via IRC tags, plus 7TV channel and global animated emotes.
- **Unified Feed**: Supports **Twitch** (read-only anonymous WebSocket connection without requiring login or bot accounts) and **YouTube Live** (via YouTube Data API v3).
- **Built-in Optical HUD**: Live adjustment of glass blur, lens depth, displacement strength, chromatic dispersion, max bubbles, and background preview modes.

---

## 🚀 Quick Start Tutorial

### Step 1: Open or Host the Overlay

You have two easy ways to run the overlay:

#### Option A: Direct Local File (Easiest)
You can directly open `index.html` in your browser or point OBS to the local file path:
```
file:///E:/stream-util/index.html
```

#### Option B: Local Web Server (Recommended)
Run a lightweight local HTTP server from the folder:
```bash
# Python
python -m http.server 8088

# Node.js / npx
npx serve -p 8088
```
Then access it at: `http://localhost:8088/index.html`

---

### Step 2: Add to OBS Studio

1. Open **OBS Studio**.
2. In your scene, click the **`+` (Add Source)** button under **Sources**.
3. Select **Browser**.
4. Name the source (e.g. `Glass Chat`) and click **OK**.
5. Configure the browser source settings:
   - **URL**: Paste your overlay URL with `obs=true` and your channel name:
     ```
     http://localhost:8088/index.html?obs=true&twitch=YOUR_TWITCH_USERNAME
     ```
     *(Or if using direct local file: check **Local file** and browse to `index.html`, or paste `file:///path/to/index.html?obs=true&twitch=YOUR_TWITCH_USERNAME`)*
   - **Width**: `480`
   - **Height**: `800`
   - **Custom CSS**: Leave blank or default.
   - **Shutdown source when not visible**: Checked (optional).
6. Click **OK**. Position and resize the chat box anywhere on your stream canvas!

---

### Step 3: Connecting Your Stream

#### Twitch Chat (Zero Login Required)
1. Open the overlay in your browser.
2. Press <kbd>H</kbd> or click the gear icon in the top-right corner to open the **Settings HUD**.
3. Under **Twitch Channel**, enter your channel username (e.g. `shroud` or your channel) and click **Connect**.
4. The overlay connects anonymously via Twitch's edge WebSocket. Incoming messages, badges, and animated stickers will begin flowing instantly.

#### YouTube Live Chat
1. In the HUD, enter your YouTube Live **Video ID** (the string after `v=` in your live stream URL).
2. Enter your **YouTube Data API v3 Key** (free from Google Cloud Console).
3. The overlay polls and unifies YouTube chat seamlessly alongside Twitch.

---

## 🎛️ Live Optical Settings HUD

Press <kbd>H</kbd> or <kbd>Esc</kbd> anytime to toggle the live configuration panel:

| Setting | Range | Description |
| :--- | :--- | :--- |
| **Glass Opacity** | `0% – 50%` | Surface tint opacity (0% gives 100% crystal-clear refraction). |
| **Backdrop Blur** | `0 – 50px` | Soft background optical blur through the glass. |
| **Lens Edge Depth**| `2 – 30px` | Thickness of the curved optical refraction border. |
| **Lens Strength** | `0 – 200` | Refraction light bending intensity. |
| **Chromatic Aberration** | `0 – 20` | Spectral prism color channel separation at the glass edges. |
| **Max Active Bubbles** | `4 – 20` | Automatically evicts older messages with a smooth slide-out fade. |

### Testing & Simulation Controls
- **Send Mockup Burst**: Generates a quick test burst of messages with varying roles, badges, and emotes to preview the layout.
- **Auto Demo**: Toggles a continuous stream of simulated chatters to test styling and animation dynamics.
- **Clear Chat**: Instantly purges all visible bubbles from the screen.
- **Test Backgrounds**: Preview how refraction looks over different streaming backdrops (*Uploaded Artwork*, *Vibrant Game*, *Cyber Neon*, *Dark Minimal*, or *Transparent OBS*).

---

## 🔗 URL Query Parameters

You can customize the overlay directly via URL parameters without opening the HUD:

| Parameter | Type | Example | Purpose |
| :--- | :--- | :--- | :--- |
| `obs` | boolean | `?obs=true` | Clean OBS mode (hides HUD toggle button and test backdrop). |
| `twitch` | string | `?twitch=ninja` | Automatically joins the specified Twitch chat on load. |
| `yt_id` | string | `?yt_id=VIDEO_ID` | Automatically connects to the YouTube live stream chat. |
| `yt_key` | string | `?yt_key=API_KEY` | YouTube Data API key for live chat polling. |
| `opacity` | number | `?opacity=0` | Glass fill opacity percentage (0–50). |
| `blur` | number | `?blur=2` | Glass backdrop blur in pixels (0–50). |
| `depth` | number | `?depth=8` | Lens displacement depth in pixels (2–30). |
| `strength`| number | `?strength=60` | Optical refraction strength (0–200). |
| `cab` | number | `?cab=2` | Chromatic aberration dispersion strength (0–20). |
| `limit` | number | `?limit=10` | Maximum visible chat bubbles (4–20). |

**Example Production OBS Browser Source Link:**
```text
http://localhost:8088/index.html?obs=true&twitch=yourchannel&blur=2&strength=60&cab=2&limit=10
```

---

## ⌨️ Keyboard Shortcuts

- <kbd>H</kbd> : Toggle Settings HUD open/close.
- <kbd>Esc</kbd> : Close Settings HUD.

---

## 🛠️ Tech Stack & Architecture

- **Vanilla HTML5 & CSS3**: Pure CSS modern layout utilizing CSS Custom Properties, hardware-accelerated transforms, and SVG filters.
- **SOMMM Lens Displacement**: Dynamic channel-separated SVG filter maps generated as self-contained data URIs for curved edge refraction without blurring chat text.
- **Twitch Anonymous IRC**: WebSocket connection to `wss://irc-ws.chat.twitch.tv:443` with `CAP REQ :twitch.tv/tags twitch.tv/commands`.
- **Twitch & 7TV CDN Services**: Direct high-DPI badge and animated WebP/GIF sticker rendering.
- **Zero Dependencies**: No frameworks, no build steps, no Node backend required.
