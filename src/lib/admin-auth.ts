// Admin credentials
const ADMIN_USERNAME = 'ozgurazap'
// Pre-computed SHA256 hash of 'AdminKDS2025!'
const ADMIN_PASSWORD_HASH = '17c474057476331601f29333a1e4aceedd727be53523163dc8f1ffb4482730a3'

// Browser-compatible SHA-256 hashing function
async function sha256(message: string): Promise<string> {
  if (typeof window === 'undefined') {
    // Server-side: use Node.js crypto
    const { createHash } = await import('crypto')
    return createHash('sha256').update(message).digest('hex')
  } else {
    // Browser-side: use Web Crypto API
    const msgBuffer = new TextEncoder().encode(message)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
}

export interface AdminSession {
  isAuthenticated: boolean
  username?: string
  loginTime?: number
}

// Check if admin credentials are valid
export async function validateAdminCredentials(username: string, password: string): Promise<boolean> {
  const passwordHash = await sha256(password)
  return username === ADMIN_USERNAME && passwordHash === ADMIN_PASSWORD_HASH
}

// Get admin session from localStorage
export function getAdminSession(): AdminSession {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false }
  }

  try {
    const session = localStorage.getItem('admin_session')
    if (!session) {
      return { isAuthenticated: false }
    }

    const parsed: AdminSession = JSON.parse(session)
    
    // Check if session is expired (24 hours)
    const now = Date.now()
    const sessionAge = now - (parsed.loginTime || 0)
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours
    
    if (sessionAge > maxAge) {
      clearAdminSession()
      return { isAuthenticated: false }
    }

    return parsed
  } catch {
    return { isAuthenticated: false }
  }
}

// Save admin session to localStorage
export function saveAdminSession(username: string): void {
  if (typeof window === 'undefined') return

  const session: AdminSession = {
    isAuthenticated: true,
    username,
    loginTime: Date.now()
  }

  localStorage.setItem('admin_session', JSON.stringify(session))
}

// Clear admin session
export function clearAdminSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('admin_session')
}

// Check if current user is admin (for components)
export function useAdminAuth() {
  const session = getAdminSession()
  return {
    isAdmin: session.isAuthenticated,
    username: session.username,
    logout: clearAdminSession
  }
}
