const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const APPS_SCRIPT_URL = () => {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) throw new Error('APPS_SCRIPT_URL is not configured in environment variables.');
  return url;
};

const API_SECRET = () => {
  const secret = process.env.APPS_SCRIPT_API_SECRET;
  if (!secret) throw new Error('APPS_SCRIPT_API_SECRET is not configured in environment variables.');
  return secret;
};

/**
 * Call the Google Apps Script Web App (server-to-server only).
 * Always uses POST so the API secret stays in the request body, never in the URL.
 *
 * @param {string} action  - The Apps Script action name
 * @param {object} params  - Action parameters (merged into POST body)
 * @returns {Promise<object>} - Parsed JSON response from Apps Script
 */
async function callAppsScript(action, params = {}) {
  const url = APPS_SCRIPT_URL();
  const apiSecret = API_SECRET();

  const body = JSON.stringify({
    action,
    apiSecret,
    ...params
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      redirect: 'follow',   // Apps Script web apps redirect on first hit
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Apps Script HTTP error: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Apps Script returned non-JSON: ${text.substring(0, 200)}`);
    }

    return data;

  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw {
        success: false,
        error: { code: 'TIMEOUT', message: 'Apps Script request timed out after 30 seconds.' }
      };
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw {
        success: false,
        error: { code: 'APPS_SCRIPT_UNAVAILABLE', message: 'Cannot reach Google Apps Script. Check APPS_SCRIPT_URL.' }
      };
    }

    console.error(`Apps Script Call Error (action=${action}):`, error.message || error);

    throw {
      success: false,
      error: {
        code: 'APPS_SCRIPT_ERROR',
        message: error.message || 'Unknown Apps Script error'
      }
    };
  }
}

module.exports = { callAppsScript };

