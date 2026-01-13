# Last.fm to Slack Status Sync 🎵

Display your currently playing Last.fm track as your Slack status in real-time!

## Features

- 🎧 Automatically updates Slack status with your currently playing track
- ⏱️ Configurable polling interval
- 🎨 Customizable status emoji
- 🧹 Optionally clears status when not playing
- 🚀 Lightweight with no heavy dependencies

## Prerequisites

- Node.js 18+ (for native fetch support)
- Last.fm account and API key
- Slack workspace with a custom app

## Setup

### 1. Get Last.fm API Key

1. Go to [Last.fm API Account](https://www.last.fm/api/account/create)
2. Create a new application
3. Copy your **API Key**

### 2. Create Slack App & Get Token

1. Go to [Slack API Apps](https://api.slack.com/apps)
2. Click **Create New App** → **From scratch**
3. Name it (e.g., "Now Playing") and select your workspace
4. Go to **OAuth & Permissions**
5. Under **User Token Scopes**, add: `users.profile:write`
6. Click **Install to Workspace** and authorize
7. Copy the **User OAuth Token** (starts with `xoxp-`)

### 3. Configure the App

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your credentials:
   ```env
   LASTFM_API_KEY=your_lastfm_api_key
   LASTFM_USERNAME=your_lastfm_username
   SLACK_USER_TOKEN=xoxp-your-slack-token
   ```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

## Configuration Options

| Variable | Description | Default |
|----------|-------------|---------|
| `LASTFM_API_KEY` | Your Last.fm API key | Required |
| `LASTFM_USERNAME` | Your Last.fm username | Required |
| `SLACK_USER_TOKEN` | Slack User OAuth Token | Required |
| `POLL_INTERVAL` | How often to check (seconds) | `30` |
| `STATUS_EMOJI` | Slack status emoji | `:musical_note:` |
| `CLEAR_WHEN_NOT_PLAYING` | Clear status when nothing plays | `true` |

## Running as a Background Service

### macOS (launchd)

Create `~/Library/LaunchAgents/com.lastfm-slack-status.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.lastfm-slack-status</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/Users/YOUR_USERNAME/Code/lastfm-slack-status/index.js</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/Users/YOUR_USERNAME/Code/lastfm-slack-status</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/lastfm-slack-status.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/lastfm-slack-status.error.log</string>
</dict>
</plist>
```

Then load it:
```bash
launchctl load ~/Library/LaunchAgents/com.lastfm-slack-status.plist
```

### Linux (systemd)

Create `/etc/systemd/user/lastfm-slack-status.service`:

```ini
[Unit]
Description=Last.fm to Slack Status Sync
After=network.target

[Service]
Type=simple
WorkingDirectory=/home/YOUR_USERNAME/Code/lastfm-slack-status
ExecStart=/usr/bin/node index.js
Restart=always

[Install]
WantedBy=default.target
```

Then enable it:
```bash
systemctl --user enable lastfm-slack-status
systemctl --user start lastfm-slack-status
```

## Troubleshooting

### "Missing required environment variables"
Make sure you've created a `.env` file with all required values.

### "Last.fm API error"
- Verify your API key is correct
- Check your username exists on Last.fm

### "Slack API error: missing_scope"
Make sure your Slack app has the `users.profile:write` scope and you're using the **User** token (not Bot token).

### Status not updating
- Check if you're actually scrobbling to Last.fm
- Try reducing the poll interval
- Check the console for any error messages

## License

MIT
