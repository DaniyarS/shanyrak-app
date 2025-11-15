# Authentication Debugging Guide

## Problem Solved

This document explains how to debug authentication and token refresh issues, especially when the page redirects and console logs disappear.

## Quick Start - Preserve Logs in Browser

### Chrome/Edge/Brave
1. Open DevTools (`F12` or `Cmd+Option+I`)
2. **Console tab**: Check ✅ **"Preserve log"** (top toolbar)
3. **Network tab**: Check ✅ **"Preserve log"** (top toolbar)

### Firefox
1. Open DevTools (`F12`)
2. **Console tab**: Settings ⚙️ → Check ✅ **"Persist Logs"**
3. **Network tab**: Settings ⚙️ → Check ✅ **"Persist Logs"**

## Persistent Auth Logger

We've added a **persistent authentication logger** that survives page reloads by storing events in `localStorage`.

### View Logs in Console

All auth events are automatically logged to the browser console with categorized prefixes:

```
✓ [Token Refresh] Access token refreshed successfully
⚠ [Auth Interceptor] 401 error detected
✗ [Token Refresh] Refresh failed
ℹ [Proactive Refresh] Attempting scheduled token refresh
```

### Access Logs After Page Reload

Even if the console clears, you can access the last 50 auth events:

```javascript
// In browser console:

// View recent logs (last 10 by default)
window.authLogger.printRecentLogs()

// View last 20 logs
window.authLogger.printRecentLogs(20)

// Get all logs as array
window.authLogger.getLogs()

// Export logs as JSON
window.authLogger.exportLogs()

// Clear all logs
window.authLogger.clearLogs()
```

### Example Usage

1. **After getting redirected to login**, open console and type:
   ```javascript
   window.authLogger.printRecentLogs(20)
   ```

2. You'll see something like:
   ```
   📋 Last 20 Auth Events (from localStorage)
   [2:45:30 PM] [INFO] [Token Refresh] Attempting to refresh access token
   [2:45:30 PM] [ERROR] [Token Refresh] Refresh failed {status: 401, message: "Invalid refresh token"}
   [2:45:30 PM] [WARN] [Auth Interceptor] Token refresh failed - triggering logout
   ```

## What Gets Logged

The system logs:
- ✅ Token refresh attempts (both proactive and reactive)
- ✅ 401 errors and interceptor actions
- ✅ Session expiry events
- ✅ Login/logout events
- ✅ Request URLs that triggered token refresh
- ✅ Error details (status codes, messages)
- ✅ Timestamps and page URLs

## Understanding the Flow

### When Access Token Expires

1. **API request** gets 401 error
2. **Auth Interceptor** catches it → logs `[Auth Interceptor] 401 error detected`
3. **Token Refresh** starts → logs `[Token Refresh] Attempting to refresh access token`
4. **Two outcomes**:

   **✅ Refresh Succeeds:**
   ```
   ✓ [Token Refresh] Access token refreshed successfully
   ✓ [Auth Interceptor] Token refresh successful, retrying original request
   ```
   → Request automatically retries with new token

   **✗ Refresh Fails:**
   ```
   ✗ [Token Refresh] Refresh failed {status: 401, message: "..."}
   ⚠ [Auth Interceptor] Token refresh failed - triggering logout
   ⚠ [Session Handler] Session expired event received
   ```
   → User redirected to login page

### Proactive Token Refresh

Every 14 minutes (while user is active):
```
ℹ [Proactive Refresh] Attempting scheduled token refresh
✓ [Proactive Refresh] Token refreshed successfully
```

## Common Issues

### Issue: CORS error when refreshing token
**Symptoms:**
```
Access to XMLHttpRequest at 'https://api.shanyrak.group//api/v1/auth/refresh'
has been blocked by CORS policy
```

**Solution:**
This happens when the refresh request bypasses the Vite proxy in development.

**Fixed by:**
1. Created `.env.local` with development API server URL
2. Updated refresh logic to use `createRefreshAxios()` which respects BASE_URL config
3. Configured separate backend servers for dev and production

**In development**: Direct requests to `http://185.197.194.111:8080/api/*`
**In production**: Direct requests to `https://api.shanyrak.group/api/*`

**Note**: If you get CORS errors in development, the dev server (`185.197.194.111:8080`) needs to allow `localhost:5173` origin.

### Issue: Immediately redirected to login
**Check:**
```javascript
window.authLogger.printRecentLogs()
```

Look for:
- `[Token Refresh] Refresh failed` - Check the error details
- `status: 401` - Refresh token expired or invalid
- `status: 500` - Backend error
- `No refresh token available` - Token missing from localStorage
- `CORS policy` - Refresh is bypassing proxy (should be fixed now)

### Issue: Token refresh keeps failing
**Check:**
```javascript
// Check if tokens exist
localStorage.getItem('authToken')
localStorage.getItem('refreshToken')

// View full error details
window.authLogger.exportLogs()
```

### Issue: Need to see network requests
1. Enable "Preserve log" in **Network tab**
2. Filter by `/auth/refresh` to see refresh requests
3. Check request payload and response

## Development Tips

### Clear Auth State
```javascript
// Clear everything and start fresh
window.authLogger.clearLogs()
localStorage.clear()
window.location.reload()
```

### Monitor Token Refresh in Real-Time
Keep console open and watch for logs every 14 minutes when logged in.

### Test Token Expiration
1. Log in
2. Wait for access token to expire (15 minutes)
3. Make any API request
4. Watch the automatic refresh happen in console

## Technical Details

### Files Modified
- `src/utils/authLogger.js` - Persistent logger utility
- `src/services/api.js` - Axios interceptors with logging
- `src/services/authService.js` - Auth service with logging
- `src/context/AuthContext.jsx` - React context with session handling

### How It Works
1. **Persistent Storage**: Logs stored in `localStorage` under key `auth_debug_logs`
2. **Graceful Navigation**: Uses React Router for navigation (preserves console)
3. **Fallback Redirect**: If event not handled in 100ms, falls back to hard redirect
4. **Auto-printing**: Recent logs printed on app startup for easy debugging

## Need Help?

If you're still having issues:
1. Run `window.authLogger.exportLogs()` in console
2. Copy the JSON output
3. Share with the development team along with:
   - What action triggered the issue
   - Expected vs actual behavior
   - Browser and version
