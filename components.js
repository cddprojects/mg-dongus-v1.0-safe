/**
 * USStockEdge — Global Header & Footer
 * Include this script in every page. Place <div id="g-nav"></div> and
 * <div id="g-footer"></div> where the header and footer should appear.
 */
(function () {
  'use strict';

  /* ─── Shared CSS ──────────────────────────────────────────────────────── */
  var SHARED_CSS = '\
    /* ─── NAV ──────────────────────────────────────────────────── */\
    nav {\
      position: fixed;\
      top: 0; left: 0; right: 0;\
      z-index: 100;\
      display: flex;\
      align-items: center;\
      justify-content: space-between;\
      padding: 0 5%;\
      height: 68px;\
      background: rgba(10,22,40,0.97);\
      backdrop-filter: blur(8px);\
      border-bottom: 1px solid rgba(255,255,255,0.06);\
      transition: box-shadow 0.3s;\
    }\
    .nav-logo {\
      display: flex; align-items: center; gap: 10px; text-decoration: none;\
    }\
    .nav-logo .logo-icon svg { width: 20px; height: 20px; }\
    .nav-logo span {\
      font-weight: 700; font-size: 1.05rem; color: var(--white, #fff);\
      letter-spacing: -0.3px;\
    }\
    .nav-logo span em { color: var(--gold, #f59e0b); font-style: normal; }\
    .nav-links {\
      display: flex; align-items: center; gap: 6px;\
    }\
    .nav-links a {\
      color: rgba(255,255,255,0.65); text-decoration: none;\
      font-size: 0.875rem; font-weight: 500;\
      padding: 6px 12px; border-radius: 6px;\
      transition: color 0.15s, background 0.15s; white-space: nowrap;\
    }\
    .nav-links a:hover { color: #fff; background: rgba(255,255,255,0.08); }\
    .nav-right { display: flex; align-items: center; gap: 20px; }\
    .nav-cta {\
      display: inline-flex; align-items: center; gap: 8px;\
      background: var(--wa, #25D366); color: #fff;\
      padding: 9px 20px; border-radius: 8px;\
      font-size: 0.88rem; font-weight: 600; text-decoration: none;\
      transition: background 0.2s, transform 0.15s;\
      border: 0; cursor: pointer; font-family: inherit;\
    }\
    .nav-cta:hover { background: #1ebe5a; transform: translateY(-1px); }\
    .nav-hamburger {\
      display: none; flex-direction: column; gap: 5px; cursor: pointer;\
      padding: 6px; background: none; border: none; font-family: inherit;\
    }\
    .nav-hamburger span {\
      display: block; width: 22px; height: 2px;\
      background: rgba(255,255,255,0.8); border-radius: 2px;\
      transition: transform 0.25s, opacity 0.25s;\
    }\
    .nav-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }\
    .nav-hamburger.open span:nth-child(2) { opacity: 0; }\
    .nav-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }\
    .nav-drawer {\
      display: none; position: fixed;\
      top: 68px; left: 0; right: 0;\
      background: rgba(10,22,40,0.98); backdrop-filter: blur(10px);\
      border-bottom: 1px solid rgba(255,255,255,0.08);\
      padding: 12px 5% 18px; z-index: 99; flex-direction: column; gap: 2px;\
    }\
    .nav-drawer.open { display: flex; }\
    .nav-drawer a, .nav-drawer button {\
      color: rgba(255,255,255,0.7); text-decoration: none;\
      font-size: 0.95rem; font-weight: 500;\
      padding: 11px 14px; border-radius: 8px;\
      transition: background 0.15s, color 0.15s;\
      border: 0; font-family: inherit; cursor: pointer;\
    }\
    .nav-drawer a:hover, .nav-drawer button:hover { background: rgba(255,255,255,0.08); color: #fff; }\
    .nav-drawer .drawer-cta {\
      margin-top: 8px; background: var(--wa, #25D366); color: #fff;\
      text-align: center; font-weight: 700; border-radius: 10px; padding: 13px;\
    }\
    .nav-drawer .drawer-cta:hover { background: #1ebe5a; }\
    @media (max-width: 820px) {\
      .nav-links { display: none; }\
      .nav-hamburger { display: flex; }\
      .nav-right .nav-cta { display: none; }\
    }\
    /* ─── FOOTER ────────────────────────────────────────────────── */\
    footer {\
      background: var(--gray900, #0f172a);\
      color: rgba(255,255,255,0.45);\
      padding: 48px 5% 32px;\
      font-size: 0.82rem;\
    }\
    .footer-inner {\
      max-width: 1100px; margin: 0 auto;\
      display: grid; grid-template-columns: 1.6fr 1fr 1fr;\
      gap: 48px; margin-bottom: 40px;\
    }\
    .footer-brand .nav-logo { margin-bottom: 14px; }\
    .footer-brand p { color: rgba(255,255,255,0.38); line-height: 1.65; font-size: 0.82rem; }\
    .footer-links h5 {\
      color: rgba(255,255,255,0.7); font-size: 0.82rem; font-weight: 700;\
      letter-spacing: 0.5px; margin-bottom: 14px;\
    }\
    .footer-links ul { list-style: none; display: flex; flex-direction: column; gap: 8px; }\
    .footer-links a, .footer-links button { color: rgba(255,255,255,0.4); text-decoration: none; transition: color 0.15s; }\
    .footer-links button { padding: 0; border: 0; background: none; font: inherit; cursor: pointer; }\
    .footer-links a:hover { color: rgba(255,255,255,0.75); }\
    .disclaimer {\
      max-width: 1100px; margin: 0 auto;\
      padding-top: 28px; border-top: 1px solid rgba(255,255,255,0.07);\
      line-height: 1.7; color: rgba(255,255,255,0.28);\
    }\
    .disclaimer strong { color: rgba(255,255,255,0.4); }\
    @media (max-width: 900px) { .footer-inner { grid-template-columns: 1fr; gap: 28px; } }\
  ';

  /* ─── Nav HTML ────────────────────────────────────────────────────────── */
  var WA_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.524 5.845L0 24l6.347-1.524A11.937 11.937 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.694-.505-5.23-1.384l-.374-.222-3.878.931.931-3.791-.245-.389A9.957 9.957 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>';

  var CHART_ICON = '<img src=logo.png width=35 height=35 style="border-radius:4px;">';

  var NAV_HTML = '\
    <nav id="site-nav">\
      <a class="nav-logo" href="index.html">\
        <div class="logo-icon">' + CHART_ICON + '</div>\
        <span>US<em>StockEdge</em></span>\
      </a>\
      <div class="nav-links">\
        <a href="index.html#how">How It Works</a>\
        <a href="index.html#features">What You Get</a>\
        <a href="index.html#markets">Markets</a>\
        <a href="index.html#testimonials">Community</a>\
        <a href="index.html#faq">FAQ</a>\
      </div>\
      <div class="nav-right">\
        <a class="nav-cta" data-hz-whatsapp-cta href="/api/go-whatsapp.php" target="_blank" rel="noopener noreferrer">' + WA_ICON + '<span>Join Free</span></button>\
        <button class="nav-hamburger" id="hamburger" aria-label="Open menu">\
          <span></span><span></span><span></span>\
        </a>\
      </div>\
    </nav>\
    <div class="nav-drawer" id="navDrawer">\
      <a href="index.html#how">How It Works</a>\
      <a href="index.html#features">What You Get</a>\
      <a href="index.html#markets">Markets</a>\
      <a href="index.html#testimonials">Community</a>\
      <a href="index.html#faq">FAQ</a>\
      <a class="drawer-cta" data-hz-whatsapp-cta href="/api/go-whatsapp.php" target="_blank" rel="noopener noreferrer">Get Today\'s Free Market Briefing</button>\
    </div>\
  ';

  /* ─── Footer HTML ─────────────────────────────────────────────────────── */
  var FOOTER_HTML = '\
    <footer>\
      <div class="footer-inner">\
        <div class="footer-brand">\
          <a class="nav-logo" href="index.html" style="margin-bottom:14px; display:inline-flex;">\
            <div class="logo-icon">' + CHART_ICON + '</div>\
            <span style="color:#fff;">US<em style="color:var(--gold, #f59e0b);">StockEdge</em></span>\
          </a>\
          <p>Free daily US stock market analysis and research data delivered to investors via WhatsApp. For informational and educational purposes only.</p>\
        </div>\
        <div class="footer-links">\
          <h5>Quick Links</h5>\
          <ul>\
            <li><a href="index.html#how">How It Works</a></li>\
            <li><a href="index.html#features">What You Get</a></li>\
            <li><a type="button" data-hz-whatsapp-cta href="/api/go-whatsapp.php" target="_blank" rel="noopener noreferrer">Join Free</a></li>\
            <li><a href="index.html#faq">FAQ</a></li>\
          </ul>\
        </div>\
        <div class="footer-links">\
          <h5>Legal</h5>\
          <ul>\
            <li><a href="privacy-policy.html">Privacy Policy</a></li>\
            <li><a href="terms-of-use.html">Terms of Use</a></li>\
          </ul>\
        </div>\
      </div>\
      <div class="disclaimer">\
        <strong>Important Disclaimer:</strong> The content provided through this service is for <strong>educational and informational purposes only</strong> and does not constitute financial advice, investment advice, trading advice, or any other sort of advice. You should not treat any of the content as such. USStockEdge does not recommend that any security should be bought, sold, or held by you. Nothing on this page should be construed as a recommendation to buy or sell any financial instrument. All investing involves risk, including the possible loss of principal. Past performance of any security or analysis is not indicative of future results. Always conduct your own research and consider seeking advice from a licensed financial advisor before making any investment decisions. We are not registered investment advisors.\
      </div>\
      <div style="max-width:1100px;margin:20px auto 0;padding-top:20px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;font-size:0.78rem;color:rgba(255,255,255,0.2);">\
        &copy; 2026 USStockEdge. All rights reserved.\
      </div>\
    </footer>\
  ';

  /* ─── Inject helpers ──────────────────────────────────────────────────── */
  function injectStyles() {
    var style = document.createElement('style');
    style.id = 'g-shared-styles';
    style.textContent = SHARED_CSS;
    document.head.appendChild(style);
  }

  function injectNav() {
    var placeholder = document.getElementById('g-nav');
    if (!placeholder) return;
    var wrapper = document.createElement('div');
    wrapper.innerHTML = NAV_HTML;
    placeholder.replaceWith(wrapper.firstElementChild, wrapper.lastElementChild);

    // Sticky nav shadow on scroll
    var nav = document.getElementById('site-nav');
    window.addEventListener('scroll', function () {
      if (nav) nav.style.boxShadow = window.scrollY > 40 ? '0 4px 24px rgba(0,0,0,0.3)' : 'none';
    });

    // Hamburger toggle
    var hamburger = document.getElementById('hamburger');
    var navDrawer = document.getElementById('navDrawer');
    if (hamburger && navDrawer) {
      hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('open');
        navDrawer.classList.toggle('open');
      });
      navDrawer.querySelectorAll('a, button').forEach(function (link) {
        link.addEventListener('click', function () {
          hamburger.classList.remove('open');
          navDrawer.classList.remove('open');
        });
      });
    }
  }

  function injectFooter() {
    var placeholder = document.getElementById('g-footer');
    if (!placeholder) return;
    var wrapper = document.createElement('div');
    wrapper.innerHTML = FOOTER_HTML;
    placeholder.replaceWith(wrapper.firstElementChild);
  }

  /* ─── Boot ────────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    injectStyles();
    injectNav();
    injectFooter();
  });

}());
