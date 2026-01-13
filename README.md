# Last.fm to Slack Status Sync

Display your currently playing Last.fm track as your Slack status in real-time.

## Features

- Automatically updates Slack status with your currently playing track
- Configurable polling interval
- Customizable status emoji
- Optionally clears status when not playing

## Prerequisites

- Node.js 18+
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

### 3. Configure

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
LASTFM_API_KEY=your_lastfm_api_key
LASTFM_USERNAME=your_lastfm_username
SLACK_USER_TOKEN=xoxp-your-slack-token
```

### 4. Run

```bash
npm install
npm start
```

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `LASTFM_API_KEY` | Your Last.fm API key | Required |
| `LASTFM_USERNAME` | Your Last.fm username | Required |
| `SLACK_USER_TOKEN` | Slack User OAuth Token | Required |
| `POLL_INTERVAL` | How often to check (seconds) | `30` |
| `STATUS_EMOJI` | Slack status emoji | `:musical_note:` |
| `CLEAR_WHEN_NOT_PLAYING` | Clear status when nothing plays | `true` |

