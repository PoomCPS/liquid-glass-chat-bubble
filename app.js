/* ==========================================================================
   Liquid Glass Stream Chat Overlay Engine (iOS 27 Optics)
   ========================================================================== */

(function () {
  'use strict';

  // State Management
  const state = {
    twitchChannel: '',
    twitchWs: null,
    ytVideoId: '',
    ytApiKey: '',
    ytChatId: null,
    ytPollTimer: null,
    maxBubbles: 10,
    glassOpacity: 0.00,
    glassBlur: 2,
    glassDepth: 8,
    glassStrength: 60,
    glassChromaticAberration: 2,
    resizeObserver: null,
    isObsMode: false,
    autoDemoTimer: null,
    sevenTvEmotes: new Map(), // name -> { id, url }
    twitchGlobalEmotes: new Map(),
    twitchBadges: new Map(), // set_id/version or set_id -> { url, title }
    twitchChannelBadges: new Map(), // channel-specific badge overrides
    activeBubbles: []
  };

  // Built-in official Twitch Badge CDN fallbacks (instant display without waiting for network)
  const DEFAULT_BADGE_ICONS = {
    'broadcaster': {
      url: 'https://static-cdn.jtvnw.net/badges/v1/5527c58c-fb7d-422d-b71b-f309dcb85cc1/2',
      title: 'Broadcaster'
    },
    'moderator': {
      url: 'https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/2',
      title: 'Moderator'
    },
    'mod': {
      url: 'https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/2',
      title: 'Moderator'
    },
    'vip': {
      url: 'https://static-cdn.jtvnw.net/badges/v1/b817aba4-fad8-49e2-b88a-7cc744dfa6ec/2',
      title: 'VIP'
    },
    'subscriber': {
      url: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/2',
      title: 'Subscriber'
    },
    'sub': {
      url: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/2',
      title: 'Subscriber'
    },
    'partner': {
      url: 'https://static-cdn.jtvnw.net/badges/v1/d12a2e27-16f6-41d0-ab77-b780518f00a3/2',
      title: 'Verified Partner'
    },
    'premium': {
      url: 'https://static-cdn.jtvnw.net/badges/v1/bbbe0db0-a598-423e-86d0-f9fb98ca1933/2',
      title: 'Prime Gaming'
    },
    'founder': {
      url: 'https://static-cdn.jtvnw.net/badges/v1/09d93036-e7ce-431c-9a9e-7044297133f2/2',
      title: 'Founder'
    },
    'turbo': {
      url: 'https://static-cdn.jtvnw.net/badges/v1/bd444ec6-8771-4a70-87af-21c0022ec470/2',
      title: 'Turbo'
    }
  };

  // DOM Elements
  const els = {
    body: document.body,
    chatStack: document.getElementById('chat-stack'),
    hudToggleBtn: document.getElementById('hud-toggle-btn'),
    settingsHud: document.getElementById('settings-hud'),
    hudCloseBtn: document.getElementById('hud-close-btn'),
    btnTestBurst: document.getElementById('btn-test-burst'),
    btnToggleDemo: document.getElementById('btn-toggle-demo'),
    btnClearChat: document.getElementById('btn-clear-chat'),
    inputTwitch: document.getElementById('input-twitch-channel'),
    btnConnectTwitch: document.getElementById('btn-connect-twitch'),
    inputYtVideo: document.getElementById('input-yt-video'),
    inputYtKey: document.getElementById('input-yt-key'),
    sliderOpacity: document.getElementById('slider-opacity'),
    valOpacity: document.getElementById('val-opacity'),
    sliderBlur: document.getElementById('slider-blur'),
    valBlur: document.getElementById('val-blur'),
    sliderDepth: document.getElementById('slider-depth'),
    valDepth: document.getElementById('val-depth'),
    sliderStrength: document.getElementById('slider-strength'),
    valStrength: document.getElementById('val-strength'),
    sliderCab: document.getElementById('slider-cab'),
    valCab: document.getElementById('val-cab'),
    sliderLimit: document.getElementById('slider-limit'),
    valLimit: document.getElementById('val-limit'),
    obsUrlDisplay: document.getElementById('obs-url-display'),
    btnCopyObs: document.getElementById('btn-copy-obs'),
    bgChips: document.querySelectorAll('.bg-chip')
  };

  // ==========================================================================
  // Initialization & URL Parameters
  // ==========================================================================

  function init() {
    if ('ResizeObserver' in window) {
      state.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target) applyBubbleLens(entry.target);
        }
      });
    }

    parseUrlParams();
    setupEventListeners();
    load7TVEmotes();
    loadGlobalBadges();
    updateObsUrlDisplay();

    // Default to transparent background
    els.body.classList.add('bg-transparent');

    if (state.isObsMode) {
      els.body.classList.add('obs-mode');
    } else {
      // In standalone browser preview, show initial greeting after brief delay
      setTimeout(() => {
        simulateMockMessage('system');
        simulateMockMessage('sub');
      }, 400);
    }

    // Auto connect Twitch if channel param passed
    if (state.twitchChannel) {
      els.inputTwitch.value = state.twitchChannel;
      connectTwitch(state.twitchChannel);
    }
  }

  function parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    
    // Auto-detect OBS Studio browser source environment or explicit flags
    if (window.obsstudio || params.get('obs') === 'true' || params.get('clean') === 'true') {
      state.isObsMode = true;
    }
    if (params.has('twitch')) {
      state.twitchChannel = params.get('twitch').toLowerCase().trim();
    }
    if (params.has('yt_id')) {
      state.ytVideoId = params.get('yt_id').trim();
      els.inputYtVideo.value = state.ytVideoId;
    }
    if (params.has('yt_key')) {
      state.ytApiKey = params.get('yt_key').trim();
      els.inputYtKey.value = state.ytApiKey;
    }
    if (params.has('opacity')) {
      const op = parseInt(params.get('opacity'), 10);
      if (!isNaN(op) && op >= 0 && op <= 50) {
        state.glassOpacity = op / 100;
        els.sliderOpacity.value = op;
        els.valOpacity.textContent = `${op}%`;
      }
    }
    if (params.has('blur')) {
      const bl = parseInt(params.get('blur'), 10);
      if (!isNaN(bl) && bl >= 0 && bl <= 50) {
        state.glassBlur = bl;
        if (els.sliderBlur) els.sliderBlur.value = bl;
        if (els.valBlur) els.valBlur.textContent = `${bl}px`;
      }
    }
    if (params.has('depth')) {
      const dp = parseInt(params.get('depth'), 10);
      if (!isNaN(dp) && dp >= 2 && dp <= 30) {
        state.glassDepth = dp;
        if (els.sliderDepth) els.sliderDepth.value = dp;
        if (els.valDepth) els.valDepth.textContent = `${dp}px`;
      }
    }
    if (params.has('strength')) {
      const st = parseInt(params.get('strength'), 10);
      if (!isNaN(st) && st >= 0 && st <= 200) {
        state.glassStrength = st;
        if (els.sliderStrength) els.sliderStrength.value = st;
        if (els.valStrength) els.valStrength.textContent = `${st}`;
      }
    }
    if (params.has('cab')) {
      const cb = parseInt(params.get('cab'), 10);
      if (!isNaN(cb) && cb >= 0 && cb <= 20) {
        state.glassChromaticAberration = cb;
        if (els.sliderCab) els.sliderCab.value = cb;
        if (els.valCab) els.valCab.textContent = `${cb}`;
      }
    }
    if (params.has('limit')) {
      const lim = parseInt(params.get('limit'), 10);
      if (!isNaN(lim) && lim >= 3 && lim <= 30) {
        state.maxBubbles = lim;
        els.sliderLimit.value = lim;
        els.valLimit.textContent = lim;
      }
    }

    applyOpticalVariables();
  }

  function applyOpticalVariables() {
    document.documentElement.style.setProperty('--glass-opacity', state.glassOpacity);
    document.documentElement.style.setProperty('--glass-blur', `${state.glassBlur}px`);
    reapplyAllBubbleLenses();
  }

  // ==========================================================================
  // SOMMM Lens Displacement & Chromatic Aberration Pipeline
  // ==========================================================================

  function getDisplacementMap({ height, width, radius, depth }) {
    const y1 = Math.ceil((radius / height) * 15);
    const y2 = Math.floor(100 - (radius / height) * 15);
    const x1 = Math.ceil((radius / width) * 15);
    const x2 = Math.floor(100 - (radius / width) * 15);
    const innerH = Math.max(1, height - 2 * depth);
    const innerW = Math.max(1, width - 2 * depth);

    const svg = `<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .mix { mix-blend-mode: screen; }
      </style>
      <defs>
        <linearGradient id="Y" x1="0" x2="0" y1="${y1}%" y2="${y2}%">
          <stop offset="0%" stop-color="#0F0" />
          <stop offset="100%" stop-color="#000" />
        </linearGradient>
        <linearGradient id="X" x1="${x1}%" x2="${x2}%" y1="0" y2="0">
          <stop offset="0%" stop-color="#F00" />
          <stop offset="100%" stop-color="#000" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" height="${height}" width="${width}" fill="#808080" />
      <g filter="blur(2px)">
        <rect x="0" y="0" height="${height}" width="${width}" fill="#000080" />
        <rect x="0" y="0" height="${height}" width="${width}" fill="url(#Y)" class="mix" />
        <rect x="0" y="0" height="${height}" width="${width}" fill="url(#X)" class="mix" />
        <rect x="${depth}" y="${depth}" height="${innerH}" width="${innerW}" fill="#808080" rx="${radius}" ry="${radius}" filter="blur(${depth}px)" />
      </g>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  function getDisplacementFilter({ height, width, radius, depth, strength, chromaticAberration }) {
    const mapUri = getDisplacementMap({ height, width, radius, depth });
    const scaleR = strength + chromaticAberration * 2;
    const scaleG = strength + chromaticAberration;
    const scaleB = strength;

    const svg = `<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="displace" color-interpolation-filters="sRGB">
          <feImage x="0" y="0" height="${height}" width="${width}" href="${mapUri}" result="displacementMap" />
          <feDisplacementMap transform-origin="center" in="SourceGraphic" in2="displacementMap" scale="${scaleR}" xChannelSelector="R" yChannelSelector="G" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="displacedR" />
          <feDisplacementMap in="SourceGraphic" in2="displacementMap" scale="${scaleG}" xChannelSelector="R" yChannelSelector="G" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="displacedG" />
          <feDisplacementMap in="SourceGraphic" in2="displacementMap" scale="${scaleB}" xChannelSelector="R" yChannelSelector="G" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="displacedB" />
          <feBlend in="displacedR" in2="displacedG" mode="screen" />
          <feBlend in2="displacedB" mode="screen" />
        </filter>
      </defs>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg) + '#displace';
  }

  function applyBubbleLens(bubble) {
    if (!bubble || !bubble.isConnected) return;
    const refract = bubble.querySelector('.glass-refract');
    if (!refract) return;
    const rect = bubble.getBoundingClientRect();
    const width = Math.round(rect.width || bubble.offsetWidth);
    const height = Math.round(rect.height || bubble.offsetHeight);
    if (!width || !height) return;

    const radius = 18;
    const depth = state.glassDepth;
    const strength = state.glassStrength;
    const cab = state.glassChromaticAberration;
    const blur = state.glassBlur;

    const filterUrl = getDisplacementFilter({
      height,
      width,
      radius,
      depth,
      strength,
      chromaticAberration: cab
    });

    refract.style.backdropFilter = `blur(${blur / 2}px) url('${filterUrl}') blur(${blur}px) brightness(1.08) saturate(1.45)`;
    refract.style.webkitBackdropFilter = `blur(${blur / 2}px) url('${filterUrl}') blur(${blur}px) brightness(1.08) saturate(1.45)`;
  }

  function reapplyAllBubbleLenses() {
    state.activeBubbles.forEach(b => applyBubbleLens(b));
  }

  // ==========================================================================
  // Optical HUD Controls & Events
  // ==========================================================================

  function setupEventListeners() {
    // HUD Toggle
    els.hudToggleBtn.addEventListener('click', toggleHud);
    els.hudCloseBtn.addEventListener('click', closeHud);
    
    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key.toLowerCase() === 'h') {
        if (!['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
          toggleHud();
        }
      }
    });

    // Optical Sliders
    els.sliderOpacity.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      state.glassOpacity = val / 100;
      els.valOpacity.textContent = `${val}%`;
      applyOpticalVariables();
      updateObsUrlDisplay();
    });

    els.sliderBlur.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      state.glassBlur = val;
      els.valBlur.textContent = `${val}px`;
      applyOpticalVariables();
      updateObsUrlDisplay();
    });

    if (els.sliderDepth) {
      els.sliderDepth.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        state.glassDepth = val;
        els.valDepth.textContent = `${val}px`;
        reapplyAllBubbleLenses();
        updateObsUrlDisplay();
      });
    }

    if (els.sliderStrength) {
      els.sliderStrength.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        state.glassStrength = val;
        els.valStrength.textContent = `${val}`;
        reapplyAllBubbleLenses();
        updateObsUrlDisplay();
      });
    }

    if (els.sliderCab) {
      els.sliderCab.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        state.glassChromaticAberration = val;
        els.valCab.textContent = `${val}`;
        reapplyAllBubbleLenses();
        updateObsUrlDisplay();
      });
    }

    els.sliderLimit.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      state.maxBubbles = val;
      els.valLimit.textContent = val;
      trimBubbleStack();
      updateObsUrlDisplay();
    });

    // Background switcher (for browser preview testing)
    els.bgChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        els.bgChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const bg = chip.getAttribute('data-bg');
        els.body.className = els.body.className.replace(/\bbg-\w+/g, '');
        els.body.classList.add(`bg-${bg}`);
      });
    });

    // Twitch Connect Button
    els.btnConnectTwitch.addEventListener('click', () => {
      const ch = els.inputTwitch.value.toLowerCase().trim();
      if (ch) {
        connectTwitch(ch);
        updateObsUrlDisplay();
      }
    });

    // YouTube inputs change
    els.inputYtVideo.addEventListener('change', () => {
      state.ytVideoId = els.inputYtVideo.value.trim();
      updateObsUrlDisplay();
      if (state.ytVideoId && state.ytApiKey) connectYouTube();
    });
    els.inputYtKey.addEventListener('change', () => {
      state.ytApiKey = els.inputYtKey.value.trim();
      updateObsUrlDisplay();
      if (state.ytVideoId && state.ytApiKey) connectYouTube();
    });

    // Simulation Buttons
    els.btnTestBurst.addEventListener('click', sendTestBurst);
    els.btnToggleDemo.addEventListener('click', toggleAutoDemo);
    els.btnClearChat.addEventListener('click', clearAllBubbles);

    // Copy OBS Link
    els.btnCopyObs.addEventListener('click', copyObsUrl);
  }

  function toggleHud() {
    els.settingsHud.classList.toggle('is-open');
    const isOpen = els.settingsHud.classList.contains('is-open');
    if (isOpen) {
      els.settingsHud.removeAttribute('inert');
      els.hudToggleBtn.setAttribute('aria-expanded', 'true');
    } else {
      els.settingsHud.setAttribute('inert', '');
      els.hudToggleBtn.setAttribute('aria-expanded', 'false');
    }
  }

  function closeHud() {
    els.settingsHud.classList.remove('is-open');
    els.settingsHud.setAttribute('inert', '');
    els.hudToggleBtn.setAttribute('aria-expanded', 'false');
  }

  function updateObsUrlDisplay() {
    const url = new URL(window.location.href);
    url.searchParams.set('obs', 'true');
    if (els.inputTwitch.value.trim()) {
      url.searchParams.set('twitch', els.inputTwitch.value.trim().toLowerCase());
    }
    if (state.ytVideoId) {
      url.searchParams.set('yt_id', state.ytVideoId);
    }
    if (state.ytApiKey) {
      url.searchParams.set('yt_key', state.ytApiKey);
    }
    url.searchParams.set('opacity', Math.round(state.glassOpacity * 100));
    url.searchParams.set('blur', state.glassBlur);
    url.searchParams.set('depth', state.glassDepth);
    url.searchParams.set('strength', state.glassStrength);
    url.searchParams.set('cab', state.glassChromaticAberration);
    url.searchParams.set('limit', state.maxBubbles);

    els.obsUrlDisplay.value = url.toString();
  }

  function copyObsUrl() {
    updateObsUrlDisplay();
    els.obsUrlDisplay.select();
    navigator.clipboard.writeText(els.obsUrlDisplay.value).then(() => {
      const originalText = els.btnCopyObs.textContent;
      els.btnCopyObs.textContent = 'Copied! ✓';
      setTimeout(() => {
        els.btnCopyObs.textContent = originalText;
      }, 1800);
    });
  }

  // ==========================================================================
  // Twitch Badges & Emotes Service (Global + Channel + Stickers)
  // ==========================================================================

  async function loadGlobalBadges() {
    try {
      const res = await fetch('https://api.ivr.fi/v2/twitch/badges/global');
      if (res.ok) {
        const badgeSets = await res.json();
        if (Array.isArray(badgeSets)) {
          badgeSets.forEach(set => {
            if (set && set.set_id && Array.isArray(set.versions)) {
              set.versions.forEach(v => {
                const badgeUrl = v.image_url_2x || v.image_url_1x || v.image_url_4x;
                const title = v.title || set.set_id;
                state.twitchBadges.set(`${set.set_id}/${v.id}`, { url: badgeUrl, title });
                if (!state.twitchBadges.has(set.set_id)) {
                  state.twitchBadges.set(set.set_id, { url: badgeUrl, title });
                }
              });
            }
          });
        }
      }
    } catch (err) {
      console.warn('Could not fetch global Twitch badges, using built-in defaults:', err);
    }
  }

  async function loadChannelBadges(channelName) {
    if (!channelName) return;
    try {
      const res = await fetch(`https://api.ivr.fi/v2/twitch/badges/channel?login=${encodeURIComponent(channelName)}`);
      if (res.ok) {
        const channelSets = await res.json();
        if (Array.isArray(channelSets)) {
          channelSets.forEach(set => {
            if (set && set.set_id && Array.isArray(set.versions)) {
              set.versions.forEach(v => {
                const badgeUrl = v.image_url_2x || v.image_url_1x || v.image_url_4x;
                const title = v.title || `${channelName} ${set.set_id}`;
                state.twitchChannelBadges.set(`${set.set_id}/${v.id}`, { url: badgeUrl, title });
                state.twitchChannelBadges.set(set.set_id, { url: badgeUrl, title });
              });
            }
          });
        }
      }
    } catch (err) {
      console.warn(`Could not load channel badges for #${channelName}:`, err);
    }
  }

  function resolveBadgeInfo(badgeItem) {
    if (!badgeItem) return null;
    if (typeof badgeItem === 'object') {
      if (badgeItem.url) return badgeItem;
      const set = badgeItem.set || '';
      const version = badgeItem.version || '1';
      const key = `${set}/${version}`;
      const found = state.twitchChannelBadges.get(key) ||
                    state.twitchBadges.get(key) ||
                    state.twitchChannelBadges.get(set) ||
                    state.twitchBadges.get(set) ||
                    DEFAULT_BADGE_ICONS[set];
      if (found) {
        return {
          url: found.url,
          title: badgeItem.title || found.title || set,
          role: set
        };
      }
      return { url: null, title: badgeItem.title || set, role: set };
    }

    const raw = String(badgeItem).trim();
    let norm = raw;
    if (norm === 'mod') norm = 'moderator/1';
    else if (norm === 'sub') norm = 'subscriber/1';
    else if (norm === 'broadcaster') norm = 'broadcaster/1';
    else if (norm === 'vip') norm = 'vip/1';

    const [set, ver] = norm.split('/');
    const key = ver ? `${set}/${ver}` : set;
    const found = state.twitchChannelBadges.get(key) ||
                  state.twitchBadges.get(key) ||
                  state.twitchChannelBadges.get(set) ||
                  state.twitchBadges.get(set) ||
                  DEFAULT_BADGE_ICONS[set];
    if (found) {
      return { url: found.url, title: found.title || set, role: set };
    }
    return { url: null, title: set, role: set };
  }

  async function load7TVEmotes(channelName) {
    try {
      // 1. Fetch Global 7TV Emotes
      const res = await fetch('https://7tv.io/v3/emote-sets/global');
      if (res.ok) {
        const data = await res.json();
        if (data && data.emotes) {
          data.emotes.forEach(item => {
            state.sevenTvEmotes.set(item.name, {
              id: item.id,
              url: `https://cdn.7tv.app/emote/${item.id}/2x.webp`
            });
          });
        }
      }
    } catch (err) {
      console.warn('7TV Global emotes offline or blocked, using built-in cache:', err);
    }

    // Seed popular Twitch/7TV standard emotes as local guaranteed fallbacks with direct CDN URLs
    const fallbackEmotes = [
      { name: 'Kappa', url: 'https://static-cdn.jtvnw.net/emoticons/v2/25/default/dark/2.0' },
      { name: 'LUL', url: 'https://static-cdn.jtvnw.net/emoticons/v2/425618/default/dark/2.0' },
      { name: 'HeyGuys', url: 'https://static-cdn.jtvnw.net/emoticons/v2/30259/default/dark/2.0' },
      { name: 'PETPET', url: 'https://cdn.7tv.app/emote/01FE3XY508000AA32JP519W2EW/2x.webp' },
      { name: 'PepePls', url: 'https://cdn.7tv.app/emote/01GAFTZ9K80003DHH026MC7JW0/2x.webp' },
      { name: 'peepoHappy', url: 'https://cdn.7tv.app/emote/01GAZ199Z8000FEWHS6AT5QZV0/2x.webp' },
      { name: 'peepoSad', url: 'https://cdn.7tv.app/emote/01GAZ4SBX80007YCE2RXBT44B2/2x.webp' },
      { name: 'FeelsDankMan', url: 'https://cdn.7tv.app/emote/01GB9W8JN80004CKF2H1TWA99H/2x.webp' },
      { name: 'Clap', url: 'https://cdn.7tv.app/emote/01GAM8EFQ00004MXFXAJYKA859/2x.webp' },
      { name: 'RainTime', url: 'https://cdn.7tv.app/emote/01FCY771D800007PQ2DF3GDTN6/2x.webp' }
    ];

    fallbackEmotes.forEach(e => {
      if (!state.sevenTvEmotes.has(e.name)) {
        state.sevenTvEmotes.set(e.name, {
          id: e.name,
          url: e.url
        });
      }
    });

    if (channelName) {
      load7TVChannelEmotes(channelName);
    }
  }

  async function load7TVChannelEmotes(channelName) {
    if (!channelName) return;
    try {
      const userRes = await fetch(`https://api.ivr.fi/v2/twitch/user?login=${encodeURIComponent(channelName)}`);
      if (!userRes.ok) return;
      const userData = await userRes.json();
      if (!userData || !userData[0] || !userData[0].id) return;
      const twitchId = userData[0].id;

      const emRes = await fetch(`https://7tv.io/v3/users/twitch/${twitchId}`);
      if (!emRes.ok) return;
      const emData = await emRes.json();
      if (emData && emData.emote_set && Array.isArray(emData.emote_set.emotes)) {
        emData.emote_set.emotes.forEach(item => {
          state.sevenTvEmotes.set(item.name, {
            id: item.id,
            url: `https://cdn.7tv.app/emote/${item.id}/2x.webp`
          });
        });
      }
    } catch (err) {
      console.warn(`Could not load 7TV emotes for #${channelName}:`, err);
    }
  }

  // ==========================================================================
  // Liquid Glass Bubble Rendering Engine
  // ==========================================================================

  /**
   * Renders a message into the floating bubble stack
   * @param {Object} msg
   * @param {string} msg.platform - 'twitch' | 'youtube' | 'system'
   * @param {string} msg.author - Username
   * @param {string} msg.color - Hex color or fallback
   * @param {string} msg.text - Message content
   * @param {Array<string|Object>} msg.badges - ['sub', 'vip', 'mod', 'broadcaster/1', 'subscriber/12']
   * @param {string} msg.twitchEmotes - Raw IRC emotes tag (e.g. '25:0-4,12-16')
   */
  function addMessageToStack(msg) {
    // Determine primary role for Specular Corner LED Spotlight
    let primaryRole = 'default';
    if (Array.isArray(msg.badges)) {
      const badgeKeys = msg.badges.map(b => (typeof b === 'object' && b ? b.set || '' : String(b)).toLowerCase());
      if (badgeKeys.some(k => k.includes('broadcaster'))) primaryRole = 'broadcaster';
      else if (badgeKeys.some(k => k.includes('moderator') || k === 'mod')) primaryRole = 'mod';
      else if (badgeKeys.some(k => k.includes('vip'))) primaryRole = 'vip';
      else if (badgeKeys.some(k => k.includes('subscriber') || k === 'sub')) primaryRole = 'sub';
    }

    // Create Bubble Element
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble role-${primaryRole}`;

    // 1. Role Badges (Twitch official badge icons with pill fallbacks)
    let badgesHtml = '';
    if (Array.isArray(msg.badges) && msg.badges.length > 0) {
      badgesHtml = msg.badges.map(b => {
        const info = resolveBadgeInfo(b);
        if (!info) return '';
        if (info.url) {
          return `<img class="chat-badge-icon" src="${escapeHtml(info.url)}" alt="${escapeHtml(info.title)}" title="${escapeHtml(info.title)}" loading="lazy">`;
        }
        const roleClass = (info.role === 'moderator' || info.role === 'mod') ? 'badge-mod' :
                          (info.role === 'subscriber' || info.role === 'sub') ? 'badge-sub' :
                          (info.role === 'broadcaster') ? 'badge-broadcaster' :
                          (info.role === 'vip') ? 'badge-vip' : 'badge-sub';
        return `<span class="badge-tag ${roleClass}">${escapeHtml(info.title)}</span>`;
      }).join('');
    }

    // 2. Author Name with custom or fallback vibrant color
    const authorColor = msg.color || generatePastelColor(msg.author);
    const authorHtml = `<span class="author-name" style="color: ${escapeHtml(authorColor)};">${escapeHtml(msg.author)}:</span>`;

    // 3. Formatted Message with Emotes (Twitch Native Animated/Static Stickers + 7TV)
    const formattedText = parseMessageContent(msg.text, msg.twitchEmotes);

    // Assemble Stream-Native Inline Layout with Refraction Underlay & Corner LED Spotlight
    bubble.innerHTML = `
      <span class="glass-refract" aria-hidden="true"></span>
      <span class="corner-led-spotlight" aria-hidden="true"></span>
      <div class="bubble-content">
        ${badgesHtml}
        ${authorHtml}
        <span class="message-text">${formattedText}</span>
      </div>
    `;

    // Append to stack and manage eviction
    els.chatStack.appendChild(bubble);
    state.activeBubbles.push(bubble);
    if (state.resizeObserver) {
      state.resizeObserver.observe(bubble);
    }
    requestAnimationFrame(() => applyBubbleLens(bubble));
    trimBubbleStack();
  }

  /**
   * Enforces max active bubbles limit by gracefully sliding out oldest cards
   */
  function trimBubbleStack() {
    while (state.activeBubbles.length > state.maxBubbles) {
      const oldest = state.activeBubbles.shift();
      if (oldest && oldest.parentElement) {
        if (state.resizeObserver) state.resizeObserver.unobserve(oldest);
        oldest.classList.add('is-evicting');
        setTimeout(() => {
          if (oldest.parentElement) oldest.remove();
        }, 320);
      }
    }
  }

  function clearAllBubbles() {
    state.activeBubbles.forEach(b => {
      if (state.resizeObserver) state.resizeObserver.unobserve(b);
    });
    els.chatStack.innerHTML = '';
    state.activeBubbles = [];
  }

  // ==========================================================================
  // Emote & Text Parsing (Twitch Native Stickers + 7TV WebP)
  // ==========================================================================

  function parseMessageContent(rawText, twitchEmoteTag) {
    if (!rawText) return '';

    // Step 1: Parse Twitch Native IRC Emotes if present
    const emoteRanges = [];
    if (twitchEmoteTag && typeof twitchEmoteTag === 'string') {
      const emoteSets = twitchEmoteTag.split('/');
      for (const set of emoteSets) {
        if (!set) continue;
        const [emoteId, occurrences] = set.split(':');
        if (!emoteId || !occurrences) continue;
        const ranges = occurrences.split(',');
        for (const range of ranges) {
          const [startStr, endStr] = range.split('-');
          const start = parseInt(startStr, 10);
          const end = parseInt(endStr, 10);
          if (!isNaN(start) && !isNaN(end) && start <= end) {
            emoteRanges.push({ id: emoteId, start, end });
          }
        }
      }
    }

    // If no native Twitch emotes, run 7TV & HTML formatting directly
    if (emoteRanges.length === 0) {
      return formatTextAnd7TV(rawText);
    }

    // Sort ranges ascending by start position
    emoteRanges.sort((a, b) => a.start - b.start);

    let htmlResult = '';
    let lastIndex = 0;

    for (const em of emoteRanges) {
      if (em.start < lastIndex || em.end >= rawText.length) continue;

      // Text slice before this emote
      if (em.start > lastIndex) {
        htmlResult += formatTextAnd7TV(rawText.substring(lastIndex, em.start));
      }

      // Emote name from original text
      const emoteName = rawText.substring(em.start, em.end + 1);
      // Official Twitch v2 CDN (automatically serves animated stickers and static emotes)
      const emoteUrl = `https://static-cdn.jtvnw.net/emoticons/v2/${encodeURIComponent(em.id)}/default/dark/2.0`;
      htmlResult += `<img class="chat-emote" src="${emoteUrl}" alt="${escapeHtml(emoteName)}" title="${escapeHtml(emoteName)}" loading="lazy">`;

      lastIndex = em.end + 1;
    }

    // Remaining text slice after last emote
    if (lastIndex < rawText.length) {
      htmlResult += formatTextAnd7TV(rawText.substring(lastIndex));
    }

    return htmlResult;
  }

  function formatTextAnd7TV(text) {
    if (!text) return '';
    const escaped = escapeHtml(text);
    const words = escaped.split(' ');
    const parsedWords = words.map(word => {
      if (state.sevenTvEmotes.has(word)) {
        const em = state.sevenTvEmotes.get(word);
        return `<img class="chat-emote" src="${em.url}" alt="${word}" title="${word}" loading="lazy">`;
      }
      return word;
    });
    return parsedWords.join(' ');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function generatePastelColor(str) {
    if (!str) return '#38bdf8';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 85%, 72%)`;
  }

  // ==========================================================================
  // Twitch Anonymous IRC WebSocket Client
  // ==========================================================================

  function connectTwitch(channel) {
    if (!channel) return;
    state.twitchChannel = channel.toLowerCase();

    // Fetch channel-specific custom badges & 7TV channel emotes/stickers
    loadChannelBadges(state.twitchChannel);
    load7TVChannelEmotes(state.twitchChannel);

    // Close previous connection if active
    if (state.twitchWs) {
      try {
        state.twitchWs.close();
      } catch (e) {}
    }

    addMessageToStack({
      platform: 'twitch',
      author: 'Twitch Edge',
      color: '#a855f7',
      badges: ['moderator/1'],
      text: `Connecting to #${state.twitchChannel} chat...`
    });

    try {
      state.twitchWs = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
    } catch (err) {
      console.error('Failed to create Twitch WebSocket', err);
      return;
    }

    state.twitchWs.onopen = () => {
      // Connect as read-only anonymous JustinFan client
      state.twitchWs.send('CAP REQ :twitch.tv/tags twitch.tv/commands');
      state.twitchWs.send('PASS oauth:justinfan12345');
      state.twitchWs.send('NICK justinfan12345');
      state.twitchWs.send(`JOIN #${state.twitchChannel}`);

      addMessageToStack({
        platform: 'twitch',
        author: 'System',
        color: '#00f2fe',
        badges: ['subscriber/1'],
        text: `Connected to #${state.twitchChannel}! Liquid Glass ready.`
      });
    };

    state.twitchWs.onmessage = (event) => {
      const raw = event.data;
      const lines = raw.split('\r\n');

      for (const line of lines) {
        if (!line.trim()) continue;

        // Respond to PING to keep connection alive
        if (line.startsWith('PING')) {
          state.twitchWs.send('PONG :tmi.twitch.tv');
          continue;
        }

        // Parse PRIVMSG
        if (line.includes('PRIVMSG')) {
          parseTwitchPrivmsg(line);
        }
      }
    };

    state.twitchWs.onerror = (err) => {
      console.warn('Twitch WebSocket Error:', err);
    };

    state.twitchWs.onclose = () => {
      console.log('Twitch WebSocket closed.');
    };
  }

  function parseTwitchPrivmsg(line) {
    try {
      let tags = {};
      let messagePart = line;

      if (line.startsWith('@')) {
        const spaceIdx = line.indexOf(' ');
        const rawTags = line.substring(1, spaceIdx).split(';');
        rawTags.forEach(pair => {
          const [k, v] = pair.split('=');
          tags[k] = v;
        });
        messagePart = line.substring(spaceIdx + 1);
      }

      // Extract author & text
      const privmsgIdx = messagePart.indexOf('PRIVMSG');
      if (privmsgIdx === -1) return;

      const textColonIdx = messagePart.indexOf(' :', privmsgIdx);
      if (textColonIdx === -1) return;

      const chatText = messagePart.substring(textColonIdx + 2);
      const author = tags['display-name'] || messagePart.substring(1, messagePart.indexOf('!'));
      const color = tags['color'] || null;

      // Extract badges (preserves specific tier/versions like 'subscriber/12', 'premium/1', 'partner/1')
      const badges = [];
      if (tags['badges']) {
        const bList = tags['badges'].split(',');
        bList.forEach(b => {
          const trimmed = b.trim();
          if (trimmed) badges.push(trimmed);
        });
      }

      addMessageToStack({
        platform: 'twitch',
        author,
        color,
        badges,
        text: chatText,
        twitchEmotes: tags['emotes']
      });
    } catch (e) {
      console.error('Error parsing IRC line', e);
    }
  }

  // ==========================================================================
  // YouTube Live Chat Poller
  // ==========================================================================

  async function connectYouTube() {
    if (!state.ytVideoId || !state.ytApiKey) return;

    if (state.ytPollTimer) clearInterval(state.ytPollTimer);

    try {
      // 1. Get Live Chat ID for video
      const url = `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${encodeURIComponent(state.ytVideoId)}&key=${encodeURIComponent(state.ytApiKey)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`YouTube API returned ${res.status}`);
      const data = await res.json();

      if (!data.items || data.items.length === 0 || !data.items[0].liveStreamingDetails) {
        throw new Error('Video is not an active livestream or has no live chat.');
      }

      state.ytChatId = data.items[0].liveStreamingDetails.activeLiveChatId;
      addMessageToStack({
        platform: 'youtube',
        author: 'YouTube Live',
        color: '#ff4444',
        badges: ['broadcaster/1'],
        text: 'Connected to YouTube Live Chat!'
      });

      pollYouTubeChat();
    } catch (err) {
      console.warn('YouTube connection error:', err);
      addMessageToStack({
        platform: 'youtube',
        author: 'YouTube Error',
        color: '#ff4444',
        badges: [],
        text: `Failed: ${err.message}`
      });
    }
  }

  async function pollYouTubeChat() {
    if (!state.ytChatId || !state.ytApiKey) return;

    try {
      const url = `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${encodeURIComponent(state.ytChatId)}&part=snippet,authorDetails&key=${encodeURIComponent(state.ytApiKey)}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();

      if (data.items && data.items.length > 0) {
        data.items.forEach(item => {
          const author = item.authorDetails.displayName;
          const text = item.snippet.displayMessage;
          const badges = [];
          if (item.authorDetails.isChatOwner) badges.push('broadcaster/1');
          if (item.authorDetails.isChatModerator) badges.push('moderator/1');
          if (item.authorDetails.isChatSponsor) badges.push('subscriber/1');

          addMessageToStack({
            platform: 'youtube',
            author,
            badges,
            text
          });
        });
      }

      const pollMs = Math.max(data.pollingIntervalMillis || 4000, 3000);
      state.ytPollTimer = setTimeout(pollYouTubeChat, pollMs);
    } catch (err) {
      console.warn('YouTube poll error', err);
      state.ytPollTimer = setTimeout(pollYouTubeChat, 6000);
    }
  }

  // ==========================================================================
  // Mockup Simulation & Demo Suite
  // ==========================================================================

  const mockUsers = [
    { platform: 'twitch', author: 'CyberSamurai', badges: ['subscriber/12', 'premium/1'], text: 'That clutch was insane! PETPET PepePls' },
    { platform: 'twitch', author: 'NeonValkyrie', badges: ['vip/1'], text: 'Liquid glass looks so clean on stream! peepoHappy' },
    { platform: 'twitch', author: 'PixelKnight', badges: ['moderator/1', 'partner/1'], text: 'Welcome everyone! Drop a follow if you enjoy the stream 💜' },
    { platform: 'youtube', author: 'AlexStreams', badges: ['subscriber/1'], text: 'Watching on YouTube, 60fps crystal clear! 🔥' },
    { platform: 'twitch', author: 'StreamerGod', badges: ['broadcaster/1', 'partner/1'], text: 'Thanks for the 10 gifted subs! Let\'s go Clap' },
    { platform: 'twitch', author: 'TwitchNativeFan', badges: ['subscriber/6', 'premium/1'], text: 'Kappa classic Twitch sticker vibes Kappa', twitchEmotes: '25:0-4,38-42' },
    { platform: 'youtube', author: 'GamerGirl99', badges: ['vip/1'], text: 'The teal and magenta rims are gorgeous!' },
    { platform: 'twitch', author: 'MemeLord', badges: [], text: 'LUL that timing was unreal FeelsDankMan' }
  ];

  let mockIndex = 0;

  function simulateMockMessage(type) {
    if (type === 'system') {
      addMessageToStack({
        platform: 'twitch',
        author: 'Liquid Glass',
        badges: ['broadcaster/1', 'partner/1'],
        text: 'iOS 27 Optics engine initialized with Twitch Badge & Sticker support.'
      });
      return;
    }

    const sample = mockUsers[mockIndex % mockUsers.length];
    mockIndex++;

    addMessageToStack({
      platform: sample.platform,
      author: sample.author,
      badges: sample.badges,
      text: sample.text,
      twitchEmotes: sample.twitchEmotes
    });
  }

  function sendTestBurst() {
    let delay = 0;
    const count = 4;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        simulateMockMessage();
      }, delay);
      delay += 240;
    }
  }

  function toggleAutoDemo() {
    if (state.autoDemoTimer) {
      clearInterval(state.autoDemoTimer);
      state.autoDemoTimer = null;
      els.btnToggleDemo.textContent = 'Auto Demo: Off';
      els.btnToggleDemo.classList.remove('btn-primary');
      els.btnToggleDemo.classList.add('btn-secondary');
    } else {
      els.btnToggleDemo.textContent = 'Auto Demo: Running';
      els.btnToggleDemo.classList.remove('btn-secondary');
      els.btnToggleDemo.classList.add('btn-primary');
      sendTestBurst();
      state.autoDemoTimer = setInterval(() => {
        simulateMockMessage();
      }, 2800);
    }
  }

  // Bootstrap when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
