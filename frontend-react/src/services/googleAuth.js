// Google OAuth Service
class GoogleAuthService {
  constructor() {
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '945064752490-c2tuuv3rg5feeuqi1r7tpv1c4vn2h5op.apps.googleusercontent.com'
    this.redirectUri = 'http://localhost:3000/auth/google/callback'
    this.isInitialized = false
  }

  // Initialize Google Identity Services
  async initialize() {
    if (this.isInitialized) return

    return new Promise((resolve, reject) => {
      // Load Google Identity Services script
      if (!document.getElementById('google-identity-script')) {
        const script = document.createElement('script')
        script.id = 'google-identity-script'
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.onload = () => {
          this.isInitialized = true
          resolve()
        }
        script.onerror = reject
        document.head.appendChild(script)
      } else {
        this.isInitialized = true
        resolve()
      }
    })
  }

  // Start OAuth flow - redirect to Google
  startOAuthFlow() {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent'
    })

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    window.location.href = authUrl
  }

  // Initialize Google One Tap (alternative method)
  initializeOneTap(callback) {
    if (!window.google) {
      console.error('Google Identity Services not loaded')
      return
    }

    window.google.accounts.id.initialize({
      client_id: this.clientId,
      callback: callback,
      auto_select: false,
      cancel_on_tap_outside: true
    })
  }

  // Show Google One Tap prompt
  showOneTap() {
    if (!window.google) {
      console.error('Google Identity Services not loaded')
      return
    }

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        console.log('One Tap not displayed or skipped')
      }
    })
  }

  // Render Google Sign-In button
  renderSignInButton(element, callback, options = {}) {
    if (!window.google) {
      console.error('Google Identity Services not loaded')
      return
    }

    const defaultOptions = {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: '100%'
    }

    window.google.accounts.id.initialize({
      client_id: this.clientId,
      callback: callback
    })

    window.google.accounts.id.renderButton(element, {
      ...defaultOptions,
      ...options
    })
  }

  // Decode JWT token
  decodeJWT(token) {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('Error decoding JWT:', error)
      return null
    }
  }

  // Sign out
  signOut() {
    if (window.google) {
      window.google.accounts.id.disableAutoSelect()
    }
  }
}

export default new GoogleAuthService()