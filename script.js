(() => {
  'use strict';
  document.body.classList.add('js');
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('menu');
  const mobile = window.matchMedia('(max-width: 760px)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const setMenu = (open, restoreFocus = false) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.classList.toggle('is-open', open);
    header.classList.remove('is-hidden');
    if (mobile.matches) menu.inert = !open;
    if (restoreFocus) toggle.focus();
  };
  const syncMenu = () => {
    setMenu(false);
    menu.inert = mobile.matches;
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    if (mobile.matches) setMenu(false, true);
  }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setMenu(false, true);
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target) && toggle.getAttribute('aria-expanded') === 'true') setMenu(false);
  });
  mobile.addEventListener('change', syncMenu);
  syncMenu();
  let previousY = window.scrollY;
  let scheduled = false;
  const updateHeader = () => {
    const y = window.scrollY;
    const menuOpen = toggle.getAttribute('aria-expanded') === 'true';
    const focused = header.contains(document.activeElement);
    header.classList.toggle('scrolled', y > 20);
    if (y < 100 || menuOpen || focused || y < previousY - 2) header.classList.remove('is-hidden');
    else if (y > previousY + 4 && y > 160) header.classList.add('is-hidden');
    previousY = y;
    scheduled = false;
  };
  window.addEventListener('scroll', () => {
    if (!scheduled) {
      requestAnimationFrame(updateHeader);
      scheduled = true;
    }
  }, { passive: true });
  header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
  updateHeader();
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  const panels = Array.from(document.querySelectorAll('.campaign-panel'));
  const selectTab = (index, focus = false) => {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    if (focus) tabs[index].focus();
  };
  document.querySelector('.campaign-tabs').hidden = false;
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(index));
    tab.addEventListener('keydown', event => {
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      selectTab(next, true);
    });
  });
  selectTab(0);
  const privacy = document.getElementById('privacy-modal');
  const imageDialog = document.getElementById('image-modal');
  const expandedImage = document.getElementById('expanded-image');
  const imageViewport = document.querySelector('.image-viewport');
  const imageZoom = document.querySelector('[data-zoom-image]');
  const caption = document.getElementById('image-caption');
  const triggers = new WeakMap();
  const openDialog = (dialog, trigger) => {
    triggers.set(dialog, trigger);
    header.classList.remove('is-hidden');
    dialog.showModal();
    document.documentElement.classList.add('no-scroll');
    dialog.querySelector('[data-close-dialog]').focus();
  };
  document.querySelector('[data-open-privacy]').addEventListener('click', event => openDialog(privacy, event.currentTarget));
  document.querySelectorAll('[data-image]').forEach(button => button.addEventListener('click', () => {
    imageViewport.classList.remove('is-zoomed');
    imageViewport.scrollLeft = 0;
    imageZoom.setAttribute('aria-pressed', 'false');
    imageZoom.textContent = 'Ampliar detalhes';
    expandedImage.src = button.dataset.image;
    expandedImage.alt = button.dataset.caption;
    caption.textContent = button.dataset.caption;
    openDialog(imageDialog, button);
  }));
  imageZoom.addEventListener('click', () => {
    const zoomed = imageViewport.classList.toggle('is-zoomed');
    imageZoom.setAttribute('aria-pressed', String(zoomed));
    imageZoom.textContent = zoomed ? 'Ver imagem inteira' : 'Ampliar detalhes';
    if (zoomed) imageViewport.focus();
  });
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('[data-close-dialog]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
    dialog.addEventListener('close', () => {
      if (!document.querySelector('dialog[open]')) document.documentElement.classList.remove('no-scroll');
      const trigger = triggers.get(dialog);
      if (trigger && document.contains(trigger)) trigger.focus({ preventScroll: true });
    });
  });
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('pending');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06 });
    document.querySelectorAll('.about-layout, .section-heading, .service-card, .contact-card').forEach(element => {
      if (element.getBoundingClientRect().top > window.innerHeight) {
        element.classList.add('reveal', 'pending');
        observer.observe(element);
      }
    });
  }
})();
