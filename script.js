/* Portfolio Book — repaired page-turn logic.
   Existing HTML IDs, content, links, and design assets are preserved. */
(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.querySelector('.wrapper');
    const book = document.querySelector('.book');
    const coverRight = document.querySelector('.cover.cover-right');
    const coverLeft = document.querySelector('.cover.cover-left');
    const pages = Array.from(document.querySelectorAll('.book-page.page-right'));
    const pageButtons = Array.from(document.querySelectorAll('.nextprev-btn'));
    const backProfile = document.querySelector('.back-profile');
    const profilePage = document.querySelector('.book-page.page-left');

    if (!wrapper || !book || !pages.length) {
      console.error('Portfolio Book: required .wrapper, .book, or .book-page.page-right elements are missing.');
      return;
    }

    let mobileMode = false;
    let mobilePanels = [];
    let mobileIndex = 0;
    let mobileNav;
    const mobileQuery = window.matchMedia('(max-width: 700px)');

    // Desktop: keep all leaves facing forward. The first leaf sits on top,
    // so the Education page is visible immediately after the front cover opens.
    function setupDesktop() {
      wrapper.classList.remove('mobile-layout');
      if (mobileNav) mobileNav.hidden = true;
      if (profilePage) profilePage.classList.remove('mobile-current');

      pages.forEach((page, index) => {
        page.classList.remove('mobile-current');
        page.querySelectorAll('.page-front, .page-back').forEach(side => {
          side.classList.remove('mobile-side-active');
          side.style.display = '';
        });
        page.classList.remove('turn');
        page.style.zIndex = String(100 - index);
      });

      if (coverRight) {
        // Start with the cover closed, then open it. Its original styling is retained.
        coverRight.classList.remove('turn');
        coverRight.style.zIndex = '200';
        window.requestAnimationFrame(() => {
          window.setTimeout(() => {
            if (!mobileMode && coverRight.isConnected) {
              coverRight.classList.add('turn');
              coverRight.style.zIndex = '0';
            }
          }, 120);
        });
      }
      if (coverLeft) coverLeft.classList.remove('turn');
    }

    // Every arrow targets its own page by the existing data-page ID.
    function turnPage(page) {
      if (!page || !page.classList.contains('book-page')) return;
      const index = pages.indexOf(page);
      if (index < 0) return;

      const isTurningToLeft = !page.classList.contains('turn');
      page.classList.toggle('turn', isTurningToLeft);
      // A turned leaf goes behind the leaves still on the right; an unturned
      // leaf returns to the top. This keeps later pages reachable.
      page.style.zIndex = isTurningToLeft
        ? String(index + 1)
        : String(100 - index);
    }

    pageButtons.forEach(button => {
      button.addEventListener('click', event => {
        const pageId = button.getAttribute('data-page');
        const page = pageId ? document.getElementById(pageId) : null;
        if (!page || !page.classList.contains('book-page')) return;
        event.preventDefault();
        if (mobileMode) {
          // Desktop arrows are replaced by simple, accessible mobile navigation.
          const panel = button.closest('.page-front, .page-back');
          const panelIndex = mobilePanels.findIndex(item => item.panel === panel);
          if (panelIndex >= 0) {
            if (panel.classList.contains('page-front')) showMobilePanel(Math.min(panelIndex + 1, mobilePanels.length - 1));
            else showMobilePanel(Math.min(panelIndex + 1, mobilePanels.length - 1));
          }
          return;
        }
        turnPage(page);
      });
    });

    // Return to the profile spread from the final page.
    if (backProfile) {
      backProfile.addEventListener('click', event => {
        event.preventDefault();
        if (mobileMode) {
          showMobilePanel(0);
          return;
        }
        pages.forEach((page, index) => {
          page.classList.add('turn');
          page.style.zIndex = String(10 + index);
        });
        if (coverRight) {
          coverRight.classList.add('turn');
          coverRight.style.zIndex = '0';
        }
      });
    }

    // Mobile: use a single readable page at a time instead of squeezing a two-page
    // spread into a phone. The original content elements are reused, not duplicated.
    function buildMobilePanels() {
      mobilePanels = [];
      if (profilePage) mobilePanels.push({ owner: profilePage, panel: profilePage, label: 'Profile' });
      pages.forEach((page, index) => {
        const front = page.querySelector('.page-front');
        const back = page.querySelector('.page-back');
        if (front) mobilePanels.push({ owner: page, panel: front, label: front.querySelector('.title')?.textContent?.trim() || `Page ${index * 2 + 1}` });
        if (back) mobilePanels.push({ owner: page, panel: back, label: back.querySelector('.title')?.textContent?.trim() || `Page ${index * 2 + 2}` });
      });
    }

    function ensureMobileNav() {
      if (mobileNav) return;
      mobileNav = document.createElement('nav');
      mobileNav.className = 'mobile-book-nav';
      mobileNav.setAttribute('aria-label', 'Portfolio book navigation');
      mobileNav.innerHTML = `
        <button type="button" class="mobile-book-prev" aria-label="Previous page">‹ Previous</button>
        <span class="mobile-book-count" aria-live="polite"></span>
        <button type="button" class="mobile-book-next" aria-label="Next page">Next ›</button>`;
      wrapper.appendChild(mobileNav);
      mobileNav.querySelector('.mobile-book-prev').addEventListener('click', () => showMobilePanel(Math.max(0, mobileIndex - 1)));
      mobileNav.querySelector('.mobile-book-next').addEventListener('click', () => showMobilePanel(Math.min(mobilePanels.length - 1, mobileIndex + 1)));
    }

    function showMobilePanel(index) {
      if (!mobilePanels.length) return;
      mobileIndex = Math.max(0, Math.min(index, mobilePanels.length - 1));
      pages.forEach(page => {
        page.classList.remove('mobile-current');
        page.querySelectorAll('.page-front, .page-back').forEach(side => side.classList.remove('mobile-side-active'));
      });
      if (profilePage) profilePage.classList.remove('mobile-current');
      const item = mobilePanels[mobileIndex];
      item.owner.classList.add('mobile-current');
      if (item.panel !== item.owner) item.panel.classList.add('mobile-side-active');
      if (mobileNav) {
        mobileNav.hidden = false;
        mobileNav.querySelector('.mobile-book-count').textContent = `${mobileIndex + 1} / ${mobilePanels.length} · ${item.label}`;
        mobileNav.querySelector('.mobile-book-prev').disabled = mobileIndex === 0;
        mobileNav.querySelector('.mobile-book-next').disabled = mobileIndex === mobilePanels.length - 1;
      }
      if (coverRight) coverRight.style.display = 'none';
      if (coverLeft) coverLeft.style.display = 'none';
    }

    function setupMobile() {
      wrapper.classList.add('mobile-layout');
      if (coverRight) coverRight.style.display = 'none';
      if (coverLeft) coverLeft.style.display = 'none';
      pages.forEach(page => {
        page.classList.remove('turn');
        page.style.zIndex = '1';
      });
      buildMobilePanels();
      ensureMobileNav();
      showMobilePanel(Math.min(mobileIndex, mobilePanels.length - 1));
    }

    function updateLayout() {
      const shouldUseMobile = mobileQuery.matches;
      if (shouldUseMobile === mobileMode) return;
      mobileMode = shouldUseMobile;
      if (mobileMode) setupMobile();
      else {
        if (coverRight) coverRight.style.display = '';
        if (coverLeft) coverLeft.style.display = '';
        setupDesktop();
      }
    }

    // EmailJS contact form helper retained from the original project.
    window.sendMail = function sendMail() {
      const emailClient = window.emailjs;
      if (!emailClient || typeof emailClient.send !== 'function') {
        alert('The email service is unavailable. Please try again later or email me directly.');
        return;
      }
      const params = {
        fname: document.getElementById('fname')?.value || '',
        subject: document.getElementById('subject')?.value || '',
        country: document.getElementById('country')?.value || ''
      };
      emailClient.send('service_bkkgswf', 'template_93cuddc', params)
        .then(() => alert('Email sent!'))
        .catch(error => {
          console.error('EmailJS send failed:', error);
          alert('Email could not be sent. Please try again.');
        });
    };

    // Initialize responsive mode before opening the cover.
    mobileMode = mobileQuery.matches;
    if (mobileMode) setupMobile();
    else setupDesktop();
    if (typeof mobileQuery.addEventListener === 'function') mobileQuery.addEventListener('change', updateLayout);
    else if (typeof mobileQuery.addListener === 'function') mobileQuery.addListener(updateLayout);
  });
})();
