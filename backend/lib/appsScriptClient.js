const fetch = globalThis.fetch ? globalThis.fetch : (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const DEFAULT_URL = 'https://script.google.com/macros/s/AKfycbzKiAiR2gRpcVB1c7gUD6X1giJ07zY54-52xMgHb1up0sINoMsFQNtwfptnMfx5Ig5RKg/exec';
const DEFAULT_SECRET = 'rl2-_6YmNCydDptxVvgt1Kvmk6aDSshRcvCBFWdEds-SXGsUx68lkCbnEObDNd_k';

const APPS_SCRIPT_URL = () => {
  let url = process.env.APPS_SCRIPT_URL;
  if (typeof url === 'string') {
    url = url.trim().replace(/^["']|["']$/g, '');
  }
  if (!url || url.includes('YOUR_DEPLOYMENT_ID')) {
    return DEFAULT_URL;
  }
  return url;
};

const API_SECRET = () => {
  let secret = process.env.APPS_SCRIPT_API_SECRET;
  if (typeof secret === 'string') {
    secret = secret.trim().replace(/^["']|["']$/g, '');
  }
  if (!secret || secret.includes('your-secret-key') || secret.includes('change-this')) {
    return DEFAULT_SECRET;
  }
  return secret;
};

/**
 * Call the Google Apps Script Web App (server-to-server only).
 * Handles Google's 302/303 redirect cycle to ensure POST bodies are never dropped.
 *
 * @param {string} action  - The Apps Script action name
 * @param {object} params  - Action parameters (merged into POST body)
 * @returns {Promise<object>} - Parsed JSON response from Apps Script
 */
async function callAppsScript(action, params = {}) {
  const baseUrl = APPS_SCRIPT_URL();
  const apiSecret = API_SECRET();

  const body = JSON.stringify({
    action,
    apiSecret,
    ...params
  });

  // Attach query params on the initial URL as backup for redirect scenarios
  const queryParams = new URLSearchParams();
  queryParams.append('action', action);
  queryParams.append('apiSecret', apiSecret);
  if (params && params.sessionId) queryParams.append('sessionId', params.sessionId);
  if (params && params.userId) queryParams.append('userId', params.userId);

  const url = `${baseUrl}?${queryParams.toString()}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);

  try {
    let response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      redirect: 'manual', // Explicitly handle Google Apps Script 302 redirect
      signal: controller.signal
    });

    // Follow redirect if Google Apps Script returns 301, 302, 303, 307, 308
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const redirectLocation = response.headers.get('location');
      if (redirectLocation) {
        response = await fetch(redirectLocation, {
          method: 'GET',
          signal: controller.signal
        });
      }
    }

    clearTimeout(timeoutId);

    if (!response.ok && response.status !== 302) {
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
        error: { code: 'TIMEOUT', message: 'Apps Script request timed out after 35 seconds.' }
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
