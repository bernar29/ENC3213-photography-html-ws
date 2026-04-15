// Site-wide JS: dark mode toggle and contact form handler
document.addEventListener('DOMContentLoaded', function () {
  // Dark mode setup
  const body = document.body;
  const toggle = document.getElementById('dark-mode-toggle');
  const saved = localStorage.getItem('darkMode');
  if (saved === 'true') body.classList.add('dark');

  if (toggle) {
    toggle.addEventListener('click', () => {
      const isDark = body.classList.toggle('dark');
      localStorage.setItem('darkMode', isDark);
      toggle.setAttribute('aria-pressed', isDark);
    });
  }

  // Contact form handler: if form.action is '#' or empty, open mail client (mailto)
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      const action = (contactForm.getAttribute('action') || '').trim();
      const name = contactForm.querySelector('[name="name"]').value || '';
      const email = contactForm.querySelector('[name="email"]').value || '';
      const message = contactForm.querySelector('[name="message"]').value || '';

      if (!action || action === '#') {
        // open mail client
        const subject = encodeURIComponent('Contact form message from ' + name);
        const bodyText = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\n' + message);
        const mailto = `mailto:?subject=${subject}&body=${bodyText}`;
        window.location.href = mailto;
        showFormMessage('Opening mail client...', 'info');
        return;
      }

      // If an action is provided (e.g., Formspree), try to POST via fetch
      fetch(action, {
        method: (contactForm.method || 'POST').toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ name, email, message })
      }).then(res => {
        if (res.ok) {
          showFormMessage('Message sent — thank you!', 'success');
          contactForm.reset();
        } else {
          return res.text().then(t => { throw new Error(t || res.statusText); });
        }
      }).catch(err => {
        console.error(err);
        showFormMessage('There was a problem sending your message. You can also use mail client (default).', 'error');
      });
    });
  }

  // mail-client fallback button — builds mailto from current form values
  const mailButton = document.getElementById('contact-open-mail');
  if (mailButton) {
    mailButton.addEventListener('click', function () {
      const form = document.getElementById('contact-form');
      if (!form) return;
      const name = form.querySelector('[name="name"]').value || '';
      const email = form.querySelector('[name="email"]').value || '';
      const subject = form.querySelector('[name="subject"]').value || '';
      const message = form.querySelector('[name="message"]').value || '';
      const subjectEnc = encodeURIComponent(subject || 'Contact from ' + name);
      const bodyEnc = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\n' + message);
      window.location.href = `mailto:?subject=${subjectEnc}&body=${bodyEnc}`;
    });
  }

  /* Floating label helper: mark filled fields */
  (function attachFloatingLabels(){
    const controls = document.querySelectorAll('.form-control');
    controls.forEach(ctrl => {
      const input = ctrl.querySelector('input, textarea, select');
      if (!input) return;
      const update = () => {
        if (input.value && input.value.trim() !== '') ctrl.classList.add('filled'); else ctrl.classList.remove('filled');
      };
      input.addEventListener('input', update);
      input.addEventListener('blur', update);
      // initial
      update();
    });
  })();

  /* Lightbox: open image in almost-fullscreen overlay */
  (function installLightbox(){
    function openLightbox(src, alt){
      // create overlay
      const overlay = document.createElement('div');
      overlay.className = 'lb-overlay open';
      overlay.tabIndex = -1;

      const panel = document.createElement('div');
      panel.className = 'lb-panel';

      const img = document.createElement('img');
      img.src = src;
      img.alt = alt || '';
      panel.appendChild(img);

      const close = document.createElement('button');
      close.className = 'lb-close';
      close.innerHTML = '✕';
      close.addEventListener('click', closeAll);
      panel.appendChild(close);

      overlay.appendChild(panel);

      overlay.addEventListener('click', function(ev){
        if (ev.target === overlay) closeAll();
      });

      document.addEventListener('keydown', onKey);

      function onKey(e){ if (e.key === 'Escape') closeAll(); }

      function closeAll(){
        document.removeEventListener('keydown', onKey);
        overlay.classList.remove('open');
        overlay.remove();
      }

      document.body.appendChild(overlay);
      // force a tiny scale for effect
      requestAnimationFrame(() => { img.style.transform = 'scale(1)'; });
    }

    // delegate clicks on images inside .photo-box
    document.addEventListener('click', function(ev){
      const img = ev.target.closest && ev.target.closest('.photo-box img');
      if (img) {
        openLightbox(img.src, img.alt);
      }
    });
  })();

  function showFormMessage(text, type) {
    let el = document.getElementById('contact-form-msg');
    if (!el) {
      el = document.createElement('div');
      el.id = 'contact-form-msg';
      el.className = 'form-msg';
      contactForm.parentNode.insertBefore(el, contactForm.nextSibling);
    }
    el.textContent = text;
    el.classList.remove('form-msg--success', 'form-msg--error', 'form-msg--info');
    if (type === 'success') el.classList.add('form-msg--success');
    else if (type === 'error') el.classList.add('form-msg--error');
    else el.classList.add('form-msg--info');
  }
});
