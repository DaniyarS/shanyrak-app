/**
 * Persistent logger for authentication and token refresh events
 * Stores critical auth events in localStorage so they survive page reloads
 */

const MAX_LOGS = 50; // Keep last 50 logs
const STORAGE_KEY = 'auth_debug_logs';

class AuthLogger {
  constructor() {
    this.logs = this._loadLogs();
  }

  _loadLogs() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load auth logs:', error);
      return [];
    }
  }

  _saveLogs() {
    try {
      // Keep only the last MAX_LOGS entries
      const logsToSave = this.logs.slice(-MAX_LOGS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logsToSave));
    } catch (error) {
      console.error('Failed to save auth logs:', error);
    }
  }

  _addLog(level, category, message, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      url: window.location.href,
    };

    this.logs.push(logEntry);
    this._saveLogs();

    // Also log to console with color coding
    const prefix = `[${category}]`;
    const fullMessage = `${prefix} ${message}`;

    switch (level) {
      case 'error':
        console.error(fullMessage, data);
        break;
      case 'warn':
        console.warn(fullMessage, data);
        break;
      case 'success':
        console.log(`✓ ${fullMessage}`, data);
        break;
      default:
        console.log(fullMessage, data);
    }
  }

  info(category, message, data) {
    this._addLog('info', category, message, data);
  }

  success(category, message, data) {
    this._addLog('success', category, message, data);
  }

  warn(category, message, data) {
    this._addLog('warn', category, message, data);
  }

  error(category, message, data) {
    this._addLog('error', category, message, data);
  }

  /**
   * Get all stored logs
   */
  getLogs() {
    return this._loadLogs();
  }

  /**
   * Clear all stored logs
   */
  clearLogs() {
    this.logs = [];
    localStorage.removeItem(STORAGE_KEY);
    console.log('[AuthLogger] Logs cleared');
  }

  /**
   * Print recent logs to console (useful after page reload)
   */
  printRecentLogs(count = 10) {
    const logs = this._loadLogs();
    const recentLogs = logs.slice(-count);

    console.group(`📋 Last ${recentLogs.length} Auth Events (from localStorage)`);
    recentLogs.forEach((log) => {
      const time = new Date(log.timestamp).toLocaleTimeString();
      console.log(`[${time}] [${log.level.toUpperCase()}] [${log.category}] ${log.message}`, log.data);
    });
    console.groupEnd();

    return recentLogs;
  }

  /**
   * Export logs as JSON for debugging
   */
  exportLogs() {
    const logs = this._loadLogs();
    const dataStr = JSON.stringify(logs, null, 2);
    console.log('Auth Debug Logs:', dataStr);
    return logs;
  }
}

// Singleton instance
const authLogger = new AuthLogger();

// Make it globally accessible for debugging
if (typeof window !== 'undefined') {
  window.authLogger = authLogger;
}

export default authLogger;
