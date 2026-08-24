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
 */

const FINNHUB_KEY = 'd9goml9r01qq65376m60d9goml9r01qq65376m6g';
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

async function fetchQuote(symbol) {
  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`
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

  for (const symbol of SYMBOLS) {
    const quote = await fetchQuote(symbol);
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
