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

  function showFormMessage(text, type) {
    let el = document.getElementById('contact-form-msg');
    if (!el) {
      el = document.createElement('div');
      el.id = 'contact-form-msg';
      el.style.marginTop = '8px';
      el.style.fontWeight = '600';
      contactForm.parentNode.insertBefore(el, contactForm.nextSibling);
    }
    el.textContent = text;
    el.style.color = type === 'success' ? 'limegreen' : type === 'error' ? 'salmon' : 'inherit';
  }
});
