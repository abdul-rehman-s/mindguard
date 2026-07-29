/**
 * MindGuard Desktop Agent — Device Auth Manager
 * 
 * Manages the automatic pairing flow between Desktop and Web.
 * 
 * Flow:
 * 1. On startup, check for stored refresh token in electron-store
 * 2. If no token, poll /api/desktop/auth/status for pending pairing
 * 3. When pairing found, complete it and store refresh token
 * 4. Use refresh token for all subsequent API calls
 * 5. No manual login, no localhost hacks, no session cookies
 */

const Store = require('electron-store');
const crypto = require('crypto');

class DeviceAuthManager {
  constructor(settingsManager, webUrl) {
    this.settingsManager = settingsManager;
    this.webUrl = webUrl;
    this.deviceId = null;
    this.accessToken = null;
    this.accessTokenExpiry = null;
    this.paired = false;
    this.polling = false;
    
    // Encrypted store for auth tokens (separate from settings)
    this.authStore = new Store({
      name: 'mindguard-auth',
      encryptionKey: this._getEncryptionKey(),
      defaults: {
        deviceId: null,
        refreshToken: null,
        userId: null,
        pairedAt: null,
      },
    });

    // Load stored auth state
    this._loadStoredAuth();
  }

  // ─── Initialization ───

  async initialize() {
    const storedRefreshToken = this.authStore.get('refreshToken');
    const storedDeviceId = this.authStore.get('deviceId');
    
    if (storedRefreshToken && storedDeviceId) {
      console.log('[auth] Found stored credentials. Verifying...');
      this.deviceId = storedDeviceId;
      this.paired = true;
      
      // Verify the stored refresh token is still valid
      const valid = await this._verifyStoredToken(storedRefreshToken);
      if (!valid) {
        console.log('[auth] Stored token invalid. Will need to re-pair.');
        this.paired = false;
        this.deviceId = null;
        this.authStore.clear();
      } else {
        console.log('[auth] Stored credentials valid. Device is paired.');
        // Get initial access token
        await this.refreshAuth();
      }
    } else {
      console.log('[auth] No stored credentials. Waiting for web pairing...');
    }
  }

  // ─── Auth State ───

  isPaired() {
    return this.paired && this.deviceId !== null;
  }

  getAccessToken() {
    // Check if current access token is still valid (with 5 minute buffer)
    if (this.accessToken && this.accessTokenExpiry) {
      const bufferMs = 5 * 60 * 1000;
      if (Date.now() < this.accessTokenExpiry - bufferMs) {
        return this.accessToken;
      }
    }
    // Access token expired or missing — need to refresh
    // Return null, the caller should trigger a refresh
    return null;
  }

  // ─── Pairing ───

  async checkPairingStatus() {
    try {
      // If we have a stored userId, check specifically for that user
      const storedUserId = this.authStore.get('userId');
      
      const url = storedUserId 
        ? `${this.webUrl}/api/desktop/auth/status?userId=${storedUserId}`
        : `${this.webUrl}/api/desktop/auth/status`;
      
      const headers = {};
      
      // If we have a refresh token, include it
      const refreshToken = this.authStore.get('refreshToken');
      if (refreshToken) {
        headers['X-Device-Token'] = refreshToken;
      }

      const response = await fetch(url, { headers });
      
      if (response.ok) {
        return await response.json();
      }
      
      return { status: 'no_pairing' };
    } catch (err) {
      console.error('[auth] Status check failed:', err.message);
      return { status: 'no_pairing' };
    }
  }

  async completePairing(pairingToken, deviceId) {
    try {
      const platform = process.platform === 'darwin' ? 'mac' 
        : process.platform === 'win32' ? 'win' : 'linux';
      
      const deviceName = this._getDeviceName();

      const response = await fetch(`${this.webUrl}/api/desktop/auth/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pairingToken,
          deviceName,
          platform,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store credentials
        this.authStore.set('deviceId', data.deviceId);
        this.authStore.set('refreshToken', data.refreshToken);
        this.authStore.set('userId', data.user.id);
        this.authStore.set('pairedAt', new Date().toISOString());
        
        this.deviceId = data.deviceId;
        this.accessToken = data.accessToken;
        this.accessTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
        this.paired = true;
        
        console.log('[auth] Pairing completed! Device:', data.deviceId);
        console.log('[auth] User:', data.user.email);
        return true;
      } else {
        const error = await response.json();
        console.error('[auth] Pairing failed:', error.error);
        return false;
      }
    } catch (err) {
      console.error('[auth] Complete pairing failed:', err.message);
      return false;
    }
  }

  // ─── Token Refresh ───

  async refreshAuth() {
    const refreshToken = this.authStore.get('refreshToken');
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.webUrl}/api/desktop/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        
        this.accessToken = data.accessToken;
        this.accessTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
        
        // Store new refresh token (token rotation)
        this.authStore.set('refreshToken', data.refreshToken);
        
        console.log('[auth] Token refreshed successfully');
        return true;
      } else {
        console.error('[auth] Token refresh failed');
        // Token might be completely invalid — need re-pair
        this.paired = false;
        this.authStore.clear();
        return false;
      }
    } catch (err) {
      console.error('[auth] Refresh request failed:', err.message);
      return false;
    }
  }

  // ─── Data Sync ───

  async syncData() {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      // Try refreshing first
      const refreshed = await this.refreshAuth();
      if (!refreshed) return null;
    }

    const token = this.getAccessToken();
    if (!token || !this.deviceId) return null;

    try {
      const response = await fetch(`${this.webUrl}/api/desktop/sync`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Device-Id': this.deviceId,
        },
      });

      if (response.ok) {
        return await response.json();
      } else if (response.status === 401) {
        // Refresh and retry
        const refreshed = await this.refreshAuth();
        if (refreshed) {
          const newToken = this.getAccessToken();
          const retryResponse = await fetch(`${this.webUrl}/api/desktop/sync`, {
            headers: {
              'Authorization': `Bearer ${newToken}`,
              'X-Device-Id': this.deviceId,
            },
          });
          if (retryResponse.ok) {
            return await retryResponse.json();
          }
        }
        return null;
      }
      return null;
    } catch (err) {
      console.error('[auth] Sync failed:', err.message);
      return null;
    }
  }

  // ─── Disconnect ───

  disconnect() {
    this.paired = false;
    this.deviceId = null;
    this.accessToken = null;
    this.accessTokenExpiry = null;
    this.authStore.clear();
    console.log('[auth] Device disconnected. Auth store cleared.');
  }

  // ─── Polling Control ───

  stopPolling() {
    this.polling = false;
  }

  // ─── Private Helpers ───

  _getEncryptionKey() {
    // Generate a machine-specific encryption key for electron-store
    // This key is derived from the machine ID and app name
    const machineId = this._getMachineId();
    const key = crypto.createHash('sha256')
      .update(`mindguard-auth-${machineId}`)
      .digest('hex');
    return key;
  }

  _getMachineId() {
    // Simple machine identification — use username + hostname
    try {
      const os = require('os');
      return `${os.hostname()}-${os.username()}`;
    } catch {
      return 'default-machine';
    }
  }

  _getDeviceName() {
    try {
      const os = require('os');
      return `${os.hostname()} — MindGuard Desktop`;
    } catch {
      return 'MindGuard Desktop';
    }
  }

  _loadStoredAuth() {
    const storedDeviceId = this.authStore.get('deviceId');
    const storedRefreshToken = this.authStore.get('refreshToken');
    
    if (storedDeviceId && storedRefreshToken) {
      this.deviceId = storedDeviceId;
      this.paired = true;
    }
  }

  async _verifyStoredToken(refreshToken) {
    try {
      const response = await fetch(`${this.webUrl}/api/desktop/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.accessToken;
        this.accessTokenExpiry = Date.now() + 60 * 60 * 1000;
        this.authStore.set('refreshToken', data.refreshToken);
        return true;
      }
      return false;
    } catch {
      // Network error — assume token is still valid (offline resilience)
      console.log('[auth] Network error during token verification. Assuming stored token is valid.');
      return true;
    }
  }
}

module.exports = { DeviceAuthManager };
