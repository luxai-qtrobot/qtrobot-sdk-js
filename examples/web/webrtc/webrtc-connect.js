// Shared Connection card helpers for all WebRTC examples.
// Requires the Connection card HTML with ids:
//   auth-mode, auth-user-wrap, auth-pass-wrap, auth-username, auth-password,
//   stun-url, turn-url, turn-user, turn-pass

function onAuthModeChange() {
  const show = document.getElementById('auth-mode').value !== 'none'
  document.getElementById('auth-user-wrap').style.display = show ? 'block' : 'none'
  document.getElementById('auth-pass-wrap').style.display = show ? 'block' : 'none'
}

function buildConnectOptions() {
  const opts = { connectTimeoutSec: 30 }

  const authMode = document.getElementById('auth-mode').value
  if (authMode !== 'none') {
    opts.mqttOptions = {
      auth: {
        mode: authMode,
        username: document.getElementById('auth-username').value.trim(),
        password: document.getElementById('auth-password').value,
      }
    }
  }

  const stunUrl  = document.getElementById('stun-url').value.trim()
  const turnUrl  = document.getElementById('turn-url').value.trim()
  const turnUser = document.getElementById('turn-user').value.trim()
  const turnPass = document.getElementById('turn-pass').value
  const webrtcOptions = {}
  if (stunUrl) webrtcOptions.stunServers = [stunUrl]
  if (turnUrl) webrtcOptions.turnServers = [{ url: turnUrl, username: turnUser || undefined, credential: turnPass || undefined }]
  if (Object.keys(webrtcOptions).length) opts.webrtcOptions = webrtcOptions

  return opts
}
