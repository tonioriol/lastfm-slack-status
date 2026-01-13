import 'dotenv/config';

// Configuration
const config = {
  lastfm: {
    apiKey: process.env.LASTFM_API_KEY,
    username: process.env.LASTFM_USERNAME,
    baseUrl: 'https://ws.audioscrobbler.com/2.0/'
  },
  slack: {
    userToken: process.env.SLACK_USER_TOKEN,
    baseUrl: 'https://slack.com/api/'
  },
  pollInterval: parseInt(process.env.POLL_INTERVAL || '30', 10) * 1000,
  statusEmoji: process.env.STATUS_EMOJI || ':musical_note:',
  clearWhenNotPlaying: process.env.CLEAR_WHEN_NOT_PLAYING !== 'false'
};

// Validate configuration
function validateConfig() {
  const missing = [];
  if (!config.lastfm.apiKey) missing.push('LASTFM_API_KEY');
  if (!config.lastfm.username) missing.push('LASTFM_USERNAME');
  if (!config.slack.userToken) missing.push('SLACK_USER_TOKEN');

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('   Please copy .env.example to .env and fill in your credentials.');
    process.exit(1);
  }
}

// Fetch currently playing track from Last.fm
async function getNowPlaying() {
  const params = new URLSearchParams({
    method: 'user.getrecenttracks',
    user: config.lastfm.username,
    api_key: config.lastfm.apiKey,
    format: 'json',
    limit: '1'
  });

  try {
    const response = await fetch(`${config.lastfm.baseUrl}?${params}`);
    const data = await response.json();

    if (data.error) {
      console.error('❌ Last.fm API error:', data.message);
      return null;
    }

    const tracks = data.recenttracks?.track;
    if (!tracks || tracks.length === 0) {
      return null;
    }

    const track = Array.isArray(tracks) ? tracks[0] : tracks;

    // Check if currently playing (has @attr.nowplaying)
    const isNowPlaying = track['@attr']?.nowplaying === 'true';

    if (!isNowPlaying) {
      return null;
    }

    return {
      artist: track.artist?.['#text'] || track.artist,
      track: track.name,
      album: track.album?.['#text'],
      image: track.image?.find(img => img.size === 'medium')?.['#text']
    };
  } catch (error) {
    console.error('❌ Error fetching from Last.fm:', error.message);
    return null;
  }
}

// Update Slack status
async function updateSlackStatus(statusText, statusEmoji = '') {
  try {
    const profile = {
      status_text: statusText,
      status_emoji: statusEmoji,
      status_expiration: 0 // Never expire (we'll clear it manually)
    };

    const response = await fetch(`${config.slack.baseUrl}users.profile.set`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.slack.userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ profile })
    });

    const data = await response.json();

    if (!data.ok) {
      console.error('❌ Slack API error:', data.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error updating Slack status:', error.message);
    return false;
  }
}

// Format status text
function formatStatusText(nowPlaying) {
  if (!nowPlaying) return '';

  const { artist, track } = nowPlaying;
  let status = `${track} - ${artist}`;

  // Slack status text has a 100 character limit
  if (status.length > 100) {
    status = status.substring(0, 97) + '...';
  }

  return status;
}

// Main loop
let lastStatus = null;

async function checkAndUpdate() {
  const nowPlaying = await getNowPlaying();
  const statusText = formatStatusText(nowPlaying);

  // Only update if status changed
  if (statusText === lastStatus) {
    return;
  }

  if (nowPlaying) {
    console.log(`🎵 Now playing: ${nowPlaying.track} - ${nowPlaying.artist}`);
    const success = await updateSlackStatus(statusText, config.statusEmoji);
    if (success) {
      console.log('✅ Slack status updated');
      lastStatus = statusText;
    }
  } else if (config.clearWhenNotPlaying && lastStatus !== '') {
    console.log('⏸️  Nothing playing, clearing status...');
    const success = await updateSlackStatus('', '');
    if (success) {
      console.log('✅ Slack status cleared');
      lastStatus = '';
    }
  }
}

// Graceful shutdown
function shutdown() {
  console.log('\n👋 Shutting down...');
  if (config.clearWhenNotPlaying) {
    updateSlackStatus('', '').then(() => {
      console.log('✅ Status cleared on exit');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start the application
async function main() {
  console.log('🎧 Last.fm to Slack Status Sync');
  console.log('================================');

  validateConfig();

  console.log(`📡 Monitoring Last.fm user: ${config.lastfm.username}`);
  console.log(`⏱️  Poll interval: ${config.pollInterval / 1000} seconds`);
  console.log(`${config.statusEmoji} Status emoji: ${config.statusEmoji}`);
  console.log('');
  console.log('Press Ctrl+C to stop\n');

  // Initial check
  await checkAndUpdate();

  // Start polling
  setInterval(checkAndUpdate, config.pollInterval);
}

main();
