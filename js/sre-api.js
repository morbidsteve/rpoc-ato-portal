/**
 * SRE Platform API Client
 *
 * Provides a unified interface for fetching live data from the SRE Platform
 * dashboard API. Falls back to static demo data when the API is unreachable.
 *
 * Configuration:
 *   - Set API URL via localStorage key 'sre_api_url'
 *   - Default: https://dashboard.apps.sre.example.com
 */
(function (root) {
  'use strict';

  var DEFAULT_API_URL = 'https://dashboard.apps.sre.example.com';
  var TIMEOUT_MS = 8000;

  /**
   * Get the configured API base URL (no trailing slash).
   */
  function getApiUrl() {
    var stored = null;
    try { stored = localStorage.getItem('sre_api_url'); } catch (e) { /* private browsing */ }
    var url = (stored || DEFAULT_API_URL).replace(/\/+$/, '');
    return url;
  }

  /**
   * Set the API base URL.
   */
  function setApiUrl(url) {
    try { localStorage.setItem('sre_api_url', url.replace(/\/+$/, '')); } catch (e) { /* noop */ }
  }

  /**
   * Fetch from the SRE Platform API with credential include and timeout.
   * Returns { ok: true, data: ... } on success, { ok: false, error: ... } on failure.
   */
  function fetchFromSRE(path) {
    var url = getApiUrl() + (path.charAt(0) === '/' ? path : '/' + path);
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timeoutId = null;

    if (controller) {
      timeoutId = setTimeout(function () { controller.abort(); }, TIMEOUT_MS);
    }

    var opts = {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    };
    if (controller) { opts.signal = controller.signal; }

    return fetch(url, opts)
      .then(function (resp) {
        if (timeoutId) clearTimeout(timeoutId);
        if (!resp.ok) {
          return { ok: false, error: 'HTTP ' + resp.status + ' ' + resp.statusText, status: resp.status };
        }
        return resp.json().then(function (data) {
          return { ok: true, data: data };
        });
      })
      .catch(function (err) {
        if (timeoutId) clearTimeout(timeoutId);
        return { ok: false, error: err.message || 'Network error' };
      });
  }

  // ── Data-source status tracking ────────────────────────────────────────────

  var _dataSource = 'unknown'; // 'live', 'offline', 'unknown'

  function setDataSource(status) {
    _dataSource = status;
    renderDataSourceIndicator();
  }

  function getDataSource() {
    return _dataSource;
  }

  /**
   * Render or update the data-source indicator in the page footer area.
   * Creates the element if it does not exist.
   */
  function renderDataSourceIndicator() {
    var el = document.getElementById('sre-data-source');
    if (!el) {
      el = document.createElement('div');
      el.id = 'sre-data-source';
      el.style.cssText = 'position:fixed;bottom:12px;left:12px;display:flex;align-items:center;gap:6px;padding:5px 12px;border-radius:6px;font-size:11px;font-weight:600;z-index:9999;border:1px solid;cursor:pointer;transition:all .2s;';
      el.title = 'Click to configure SRE API URL';
      el.addEventListener('click', function () { showSettingsModal(); });
      document.body.appendChild(el);
    }

    if (_dataSource === 'live') {
      el.style.background = 'rgba(52,211,153,0.12)';
      el.style.color = '#34d399';
      el.style.borderColor = 'rgba(52,211,153,0.3)';
      el.innerHTML = '<span style="width:8px;height:8px;border-radius:50%;background:#34d399;display:inline-block;animation:sre-pulse 2s infinite"></span> Live from SRE Platform';
    } else if (_dataSource === 'offline') {
      el.style.background = 'rgba(251,191,36,0.12)';
      el.style.color = '#fbbf24';
      el.style.borderColor = 'rgba(251,191,36,0.3)';
      el.innerHTML = '<span style="width:8px;height:8px;border-radius:50%;background:#fbbf24;display:inline-block"></span> Offline / Demo Data';
    } else {
      el.style.background = 'rgba(100,116,139,0.12)';
      el.style.color = '#94a3b8';
      el.style.borderColor = 'rgba(100,116,139,0.3)';
      el.innerHTML = '<span style="width:8px;height:8px;border-radius:50%;background:#94a3b8;display:inline-block"></span> Checking...';
    }

    // Inject pulse animation if not already present
    if (!document.getElementById('sre-api-styles')) {
      var style = document.createElement('style');
      style.id = 'sre-api-styles';
      style.textContent = '@keyframes sre-pulse{0%,100%{opacity:1}50%{opacity:.3}}';
      document.head.appendChild(style);
    }
  }

  // ── Settings modal ────────────────────────────────────────────────────────

  function showSettingsModal() {
    // Remove any existing modal
    var existing = document.getElementById('sre-settings-modal');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.id = 'sre-settings-modal';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;';

    var card = document.createElement('div');
    card.style.cssText = 'background:#1e293b;border:1px solid #475569;border-radius:12px;padding:24px;width:440px;max-width:90vw;color:#e2e8f0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;';

    card.innerHTML =
      '<h3 style="margin:0 0 16px;font-size:16px;font-weight:700;">SRE Platform API Settings</h3>' +
      '<label style="display:block;font-size:12px;font-weight:600;color:#94a3b8;margin-bottom:6px;">API Base URL</label>' +
      '<input id="sre-api-url-input" type="url" value="' + getApiUrl() + '" style="width:100%;padding:8px 12px;border-radius:6px;border:1px solid #475569;background:#0f172a;color:#e2e8f0;font-size:13px;outline:none;box-sizing:border-box;" placeholder="https://dashboard.apps.sre.example.com">' +
      '<p style="font-size:11px;color:#64748b;margin:8px 0 16px;">The SRE Dashboard API URL. Credentials are sent via cookies (SSO).</p>' +
      '<div style="display:flex;gap:8px;justify-content:flex-end;">' +
        '<button id="sre-settings-test" style="padding:6px 14px;border-radius:6px;border:1px solid #475569;background:#334155;color:#e2e8f0;font-size:12px;cursor:pointer;">Test</button>' +
        '<button id="sre-settings-cancel" style="padding:6px 14px;border-radius:6px;border:1px solid #475569;background:transparent;color:#94a3b8;font-size:12px;cursor:pointer;">Cancel</button>' +
        '<button id="sre-settings-save" style="padding:6px 14px;border-radius:6px;border:1px solid #38bdf8;background:#38bdf8;color:#0f172a;font-size:12px;font-weight:600;cursor:pointer;">Save</button>' +
      '</div>' +
      '<div id="sre-settings-status" style="margin-top:12px;font-size:12px;display:none;"></div>';

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.remove(); });
    document.getElementById('sre-settings-cancel').addEventListener('click', function () { overlay.remove(); });

    document.getElementById('sre-settings-save').addEventListener('click', function () {
      var val = document.getElementById('sre-api-url-input').value.trim();
      if (val) {
        setApiUrl(val);
        overlay.remove();
        // Re-check connectivity
        SreApi.checkConnection();
      }
    });

    document.getElementById('sre-settings-test').addEventListener('click', function () {
      var statusEl = document.getElementById('sre-settings-status');
      statusEl.style.display = 'block';
      statusEl.style.color = '#94a3b8';
      statusEl.textContent = 'Testing connection...';

      var testUrl = document.getElementById('sre-api-url-input').value.trim().replace(/\/+$/, '');
      fetch(testUrl + '/api/health', { credentials: 'include', signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined })
        .then(function (r) {
          if (r.ok) {
            statusEl.style.color = '#34d399';
            statusEl.textContent = 'Connected successfully.';
          } else {
            statusEl.style.color = '#fbbf24';
            statusEl.textContent = 'Reachable but returned HTTP ' + r.status + '.';
          }
        })
        .catch(function () {
          statusEl.style.color = '#f87171';
          statusEl.textContent = 'Connection failed. Check URL and network.';
        });
    });
  }

  // ── Connection check ──────────────────────────────────────────────────────

  function checkConnection() {
    return fetchFromSRE('/api/health').then(function (result) {
      setDataSource(result.ok ? 'live' : 'offline');
      return result.ok;
    });
  }

  // ── Public API ────────────────────────────────────────────────────────────

  var SreApi = {
    getApiUrl: getApiUrl,
    setApiUrl: setApiUrl,
    fetchFromSRE: fetchFromSRE,
    checkConnection: checkConnection,
    setDataSource: setDataSource,
    getDataSource: getDataSource,
    showSettingsModal: showSettingsModal
  };

  root.SreApi = SreApi;

})(typeof window !== 'undefined' ? window : this);
