/* ─── NORD Fire Shared JS ─── */

(function () {
  'use strict';

  /* ─── Header HTML ─── */
  const headerHTML = `
<header class="site-header" id="siteHeader">
  <div class="header-topbar">
    <div class="container">
      <div class="d-flex justify-between align-center">
        <div class="header-topbar__info">
          <a href="tel:+441414331934">📞 +44 (0)141 433 1934</a>
          <a href="mailto:info@nordfire.co.uk">✉ info@nordfire.co.uk</a>
          <a href="about.html">About NORD</a>
          <a href="contact.html">Contact Us</a>
        </div>
        <div class="header-topbar__info">
          <a href="https://www.instagram.com/nordfire" target="_blank" rel="noopener">Instagram</a>
          <a href="portal.html" style="background:rgba(230,51,41,0.15);color:#e63329;padding:3px 10px;border-radius:3px;font-weight:700;">Trade Portal ↗</a>
        </div>
      </div>
    </div>
  </div>
  <div class="header-main">
    <div class="container">
      <div class="d-flex justify-between align-center">
        <a href="index.html" class="nord-logo-text">NORD<span>●</span>FIRE</a>
        <nav class="header-nav" id="mainNav">
          <a href="products.html">Extinguishers</a>
          <a href="products.html#storage">Storage</a>
          <a href="products.html#signage">Signage</a>
          <a href="products.html#ancillaries">Ancillaries</a>
          <a href="products.html#detection">Detection</a>
          <a href="products.html#specialist">Specialist</a>
          <a href="products.html#maus">MAUS</a>
          <div class="nav-dropdown" id="portalDropdown">
            <button class="nav-dropdown__trigger" id="portalTrigger">Trade Portal ▾</button>
            <div class="nav-dropdown__menu" id="portalMenu">
              <a href="portal.html" class="nav-dropdown__item">
                <span class="nav-dropdown__icon">🏢</span>
                <span>
                  <strong>Trade Portal Overview</strong>
                  <small>Features, pricing bands &amp; how it works</small>
                </span>
              </a>
              <a href="portal.html#apply" class="nav-dropdown__item">
                <span class="nav-dropdown__icon">📋</span>
                <span>
                  <strong>Apply for Trade Account</strong>
                  <small>Credit application with dual approval</small>
                </span>
              </a>
              <a href="portal.html#catalogue" class="nav-dropdown__item">
                <span class="nav-dropdown__icon">📦</span>
                <span>
                  <strong>Trade Catalogue</strong>
                  <small>8,354 products at your band price</small>
                </span>
              </a>
              <a href="portal.html#quote-builder" class="nav-dropdown__item">
                <span class="nav-dropdown__icon">📄</span>
                <span>
                  <strong>Quote Builder</strong>
                  <small>Build &amp; export branded PDF quotes</small>
                </span>
              </a>
              <a href="portal.html#client-portal" class="nav-dropdown__item">
                <span class="nav-dropdown__icon">👤</span>
                <span>
                  <strong>Client Portal</strong>
                  <small>Orders, payments &amp; resources</small>
                </span>
              </a>
              <div class="nav-dropdown__divider"></div>
              <a href="https://nordquote-jrbfpxgk.manus.space/" target="_blank" rel="noopener" class="nav-dropdown__item nav-dropdown__item--cta">
                <span class="nav-dropdown__icon">🔑</span>
                <span>
                  <strong>Login to Portal →</strong>
                  <small>Access your trade account</small>
                </span>
              </a>
            </div>
          </div>
          <a href="contact.html" class="header-cta">Get a Quote →</a>
        </nav>
        <button class="hamburger" id="hamburger" aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </div>
</header>`;

  /* ─── Footer HTML ─── */
  const footerHTML = `
<section class="newsletter-one">
  <div class="container">
    <div class="grid-2" style="align-items:center;">
      <div class="reveal">
        <h2 class="newsletter-one__title">Let's Stay Connected</h2>
        <p class="newsletter-one__text">Get updates on new products, compliance changes, and fire safety guidance direct to your inbox.</p>
      </div>
      <div class="reveal">
        <form class="newsletter-form" id="newsletterForm">
          <input type="email" placeholder="Enter your email address" required />
          <button type="submit">Subscribe</button>
        </form>
        <p style="font-family:'Space Grotesk',sans-serif;font-size:13px;color:rgba(255,255,255,0.4);margin-top:12px;">By subscribing you agree to our <a href="privacy.html" style="color:rgba(255,255,255,0.6);">privacy policy</a>.</p>
      </div>
    </div>
  </div>
</section>

<footer class="site-footer">
  <div class="container">
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:40px;" class="footer-grid-5">
      <div>
        <a href="index.html" class="nord-logo-text" style="font-size:24px;display:block;margin-bottom:20px;">NORD<span>●</span>FIRE</a>
        <p class="footer-widget__text">Specialist fire safety solutions for professionals. On demand. Without endless choice.</p>
        <div class="footer-social">
          <a href="https://www.instagram.com/nordfire" target="_blank" rel="noopener" aria-label="Instagram">📷</a>
          <a href="tel:+441414331934" aria-label="Phone">📞</a>
          <a href="mailto:info@nordfire.co.uk" aria-label="Email">✉</a>
        </div>
      </div>
      <div>
        <h4 class="footer-widget__title">Our Range</h4>
        <ul class="footer-widget__links">
          <li><a href="products.html">Extinguishers</a></li>
          <li><a href="products.html#storage">Storage</a></li>
          <li><a href="products.html#signage">Signage</a></li>
          <li><a href="products.html#ancillaries">Ancillaries</a></li>
          <li><a href="products.html#detection">Detection</a></li>
          <li><a href="products.html#specialist">Specialist</a></li>
          <li><a href="products.html#maus">MAUS</a></li>
        </ul>
      </div>
      <div>
        <h4 class="footer-widget__title">Trade Portal</h4>
        <ul class="footer-widget__links">
          <li><a href="portal.html">Portal Overview</a></li>
          <li><a href="portal.html#apply">Apply for Account</a></li>
          <li><a href="portal.html#catalogue">Trade Catalogue</a></li>
          <li><a href="portal.html#quote-builder">Quote Builder</a></li>
          <li><a href="portal.html#client-portal">Client Portal</a></li>
          <li><a href="https://nordquote-jrbfpxgk.manus.space/" target="_blank" rel="noopener" style="color:#e63329;">Login →</a></li>
        </ul>
      </div>
      <div>
        <h4 class="footer-widget__title">Company</h4>
        <ul class="footer-widget__links">
          <li><a href="about.html">About NORD</a></li>
          <li><a href="contact.html">Contact Us</a></li>
          <li><a href="privacy.html">Privacy Policy</a></li>
          <li><a href="terms.html">Terms of Service</a></li>
        </ul>
      </div>
      <div>
        <h4 class="footer-widget__title">Contact</h4>
        <ul class="footer-contact-info">
          <li><i>📞</i><span><a href="tel:+441414331934" style="color:rgba(255,255,255,0.6);text-decoration:none;">+44 (0)141 433 1934</a></span></li>
          <li><i>✉</i><span><a href="mailto:info@nordfire.co.uk" style="color:rgba(255,255,255,0.6);text-decoration:none;">info@nordfire.co.uk</a></span></li>
          <li><i>🌐</i><span>nordfire.co.uk</span></li>
          <li><i>🇬🇧</i><span>United Kingdom</span></li>
        </ul>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="container">
      <div class="d-flex justify-between align-center" style="flex-wrap:wrap;gap:12px;">
        <p class="footer-bottom__text">© 2026 NORD Fire. All rights reserved. Registered in Scotland.</p>
        <p class="footer-bottom__text">
          <a href="privacy.html" style="color:rgba(255,255,255,0.4);text-decoration:none;margin-right:16px;">Privacy</a>
          <a href="terms.html" style="color:rgba(255,255,255,0.4);text-decoration:none;">Terms</a>
        </p>
      </div>
    </div>
  </div>
</footer>`;

  /* ─── Inject header ─── */
  const headerEl = document.getElementById('header-placeholder');
  if (headerEl) headerEl.outerHTML = headerHTML;

  /* ─── Inject footer ─── */
  const footerEl = document.getElementById('footer-placeholder');
  if (footerEl) footerEl.outerHTML = footerHTML;

  /* ─── Init behaviours after DOM is ready ─── */
  function init() {
    /* Header scroll */
    const siteHeader = document.getElementById('siteHeader');
    if (siteHeader) {
      window.addEventListener('scroll', function () {
        siteHeader.classList.toggle('scrolled', window.scrollY > 60);
      });
    }

    /* Hamburger */
    const hamburger = document.getElementById('hamburger');
    const mainNav = document.getElementById('mainNav');
    if (hamburger && mainNav) {
      hamburger.addEventListener('click', function () {
        mainNav.classList.toggle('open');
      });
    }

    /* Portal dropdown toggle */
    const portalTrigger = document.getElementById('portalTrigger');
    const portalMenu = document.getElementById('portalMenu');
    if (portalTrigger && portalMenu) {
      portalTrigger.addEventListener('click', function (e) {
        e.stopPropagation();
        portalMenu.classList.toggle('open');
        portalTrigger.classList.toggle('active');
      });
      document.addEventListener('click', function () {
        portalMenu.classList.remove('open');
        portalTrigger.classList.remove('active');
      });
      portalMenu.addEventListener('click', function (e) { e.stopPropagation(); });
    }

    /* Newsletter form */
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const btn = newsletterForm.querySelector('button');
        btn.textContent = '✓ Subscribed!';
        btn.style.background = '#1a7a4a';
        setTimeout(function () {
          btn.textContent = 'Subscribe';
          btn.style.background = '';
          newsletterForm.reset();
        }, 3000);
      });
    }

    /* Scroll reveal */
    const reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
          }
        });
      }, { threshold: 0.1 });
      reveals.forEach(function (r) { observer.observe(r); });
    } else {
      reveals.forEach(function (r) { r.classList.add('visible'); });
    }

    /* Highlight active nav link */
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.header-nav a').forEach(function (a) {
      const href = a.getAttribute('href') || '';
      if (href === path || (path === '' && href === 'index.html')) {
        a.style.color = '#e63329';
      }
    });

    /* Footer 5-col responsive */
    const footerGrid = document.querySelector('.footer-grid-5');
    if (footerGrid) {
      function updateFooterGrid() {
        if (window.innerWidth < 992) {
          footerGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        } else if (window.innerWidth < 1200) {
          footerGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
        } else {
          footerGrid.style.gridTemplateColumns = 'repeat(5, 1fr)';
        }
      }
      updateFooterGrid();
      window.addEventListener('resize', updateFooterGrid);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
