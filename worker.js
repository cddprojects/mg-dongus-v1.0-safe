/**
 * USStockEdge — Cloudflare Worker
 *
 * Fetches all 20 stock quotes from Finnhub ONCE every 90 seconds,
 * caches the result, and serves all users from cache.
 *
 * Result: Finnhub only receives ~20 calls/90s regardless of user count.
 * 100+ concurrent users served for free.
 *
 * Deploy: https://workers.cloudflare.com (free tier = 100,000 req/day)
 * Preferred secret: `wrangler secret put FINNHUB_KEY`
 * Encrypted fallback below is used only when that Worker secret is unset.
 */

const FINNHUB_KEY_ENC =
  'hjNIspQPlHmmb1u2Pko6hpOMIkeJ/SO9oE9xMwkD9ABmOnMunI+hFgevNL6wKHrDurB+0btAyYVkyxgMNb/gygdz4Wg=';
const FINNHUB_WRAP = ['USStockEdge', 'finnhub', 'v1', 'wrap'].join('/');
const FINNHUB_SALT = 'stockedge-finnhub-salt-v1';
const CACHE_SECONDS = 300;
const CACHE_KEY = 'quotes';

const SYMBOLS = [
  'AAPL','NVDA','MSFT','AMZN','GOOGL','META','TSLA',
  'BRK.B','AVGO','JPM','LLY','UNH','V','XOM','MA',
  'COST','HD','WMT','NFLX','AMD'
];

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function decryptFinnhubKey() {
  const raw = b64ToBytes(FINNHUB_KEY_ENC);
  const iv = raw.slice(0, 12);
  const tagAndData = raw.slice(12);
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(FINNHUB_WRAP),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  const aesKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(FINNHUB_SALT),
      iterations: 120000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
  const buf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    tagAndData
  );
  return new TextDecoder().decode(buf);
}

async function resolveFinnhubKey(env) {
  if (env && typeof env.FINNHUB_KEY === 'string' && env.FINNHUB_KEY.trim()) {
    return env.FINNHUB_KEY.trim();
  }
  return decryptFinnhubKey();
}

async function fetchQuote(symbol, token) {
  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${token}`
    );
    const data = await response.json();
    return data?.c > 0 ? data : null;
  } catch {
    return null;
  }
}

async function refreshQuotes(env) {
  // Start from the previous cache. A rate-limited symbol therefore retains its
  // last valid quote instead of becoming null and disappearing in the UI.
  const prior = await env.STOCK_CACHE.get(CACHE_KEY, 'json');
  const quotes = prior && typeof prior === 'object' ? prior : {};
  const token = await resolveFinnhubKey(env);

  for (const symbol of SYMBOLS) {
    const quote = await fetchQuote(symbol, token);
    if (quote) quotes[symbol] = quote;
    // Finnhub free tier throttles bursts; cron executes this in the background.
    await sleep(1200);
  }

  await env.STOCK_CACHE.put(CACHE_KEY, JSON.stringify(quotes), {
    expirationTtl: CACHE_SECONDS,
  });

  return quotes;
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const cached = await env.STOCK_CACHE.get(CACHE_KEY);
    if (cached) {
      return new Response(cached, {
        headers: { ...corsHeaders, 'X-Cache': 'HIT' },
      });
    }

    // Never make visitors wait for the slow upstream refresh. The first
    // request returns an empty-but-valid payload while the worker warms KV.
    ctx.waitUntil(refreshQuotes(env));
    return new Response('{}', {
      status: 202,
      headers: { ...corsHeaders, 'X-Cache': 'WARMING' },
    });
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(refreshQuotes(env));
  },
};
