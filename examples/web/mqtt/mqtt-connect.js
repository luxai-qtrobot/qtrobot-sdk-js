// Shared Connection card helpers for all MQTT examples.
// Requires the Connection card HTML with ids:
//   auth-mode, auth-user-wrap, auth-pass-wrap, auth-username, auth-password

function onAuthModeChange() {
  const show = document.getElementById('auth-mode').value !== 'none'
  document.getElementById('auth-user-wrap').style.display = show ? 'block' : 'none'
  document.getElementById('auth-pass-wrap').style.display = show ? 'block' : 'none'
}

function buildMqttConnectOptions() {
  const opts = { connectTimeoutSec: 15 }

  const authMode = document.getElementById('auth-mode').value
  if (authMode !== 'none') {
    opts.auth = {
      mode: authMode,
      username: document.getElementById('auth-username').value.trim(),
      password: document.getElementById('auth-password').value,
    }
  }

  return opts
}
