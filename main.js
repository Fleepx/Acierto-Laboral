(() => {
  const root = document.documentElement;
  root.classList.remove('no-js');

  const navWrap = document.querySelector('.nav-wrap');
  const burger = document.querySelector('.burger');
  const menu = document.getElementById('menu');

  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  };

  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:0;height:24px;width:1px;';
  document.body.prepend(sentinel);
  new IntersectionObserver(([entry]) => {
    navWrap.classList.toggle('is-scrolled', !entry.isIntersecting);
  }).observe(sentinel);

  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  reveals.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 80}ms`;
    revealObserver.observe(el);
  });

  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = [...navLinks].map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => {
        const active = a.getAttribute('href') === `#${entry.target.id}`;
        a.classList.toggle('is-active', active);
        if (active) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => sectionObserver.observe(s));

  const statement = document.querySelector('[data-words]');
  if (statement) {
    const accents = new Set(['rigurosa']);
    const words = statement.textContent.trim().split(/\s+/);
    statement.textContent = '';
    const spans = words.map((word, i) => {
      const span = document.createElement('span');
      span.className = 'w';
      if (accents.has(word.replace(/[.,]/g, '').toLowerCase())) span.classList.add('accent');
      span.textContent = word;
      statement.append(span);
      if (i < words.length - 1) statement.append(' ');
      return span;
    });

    let ticking = false;
    const update = () => {
      ticking = false;
      const rect = statement.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.85;
      const end = vh * 0.35;
      const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end + rect.height * 0.5)));
      const lit = Math.round(progress * spans.length);
      spans.forEach((s, i) => s.classList.toggle('on', i < lit));
    };
    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        window.addEventListener('scroll', onScroll, { passive: true });
        update();
      } else {
        window.removeEventListener('scroll', onScroll);
        update();
      }
    }).observe(statement);
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const reports = [
    { role: 'Jefe de Operaciones', id: '0147', ok: true, items: [['Liderazgo', 4.2], ['Tolerancia a la presión', 3.8], ['Orientación a resultados', 4.4], ['Trabajo en equipo', 3.5]] },
    { role: 'Analista Contable', id: '0213', ok: true, items: [['Rigurosidad', 4.6], ['Pensamiento analítico', 4.3], ['Manejo del tiempo', 3.7], ['Comunicación', 3.2]] },
    { role: 'Ejecutiva Comercial', id: '0298', ok: false, items: [['Orientación al cliente', 4.5], ['Negociación', 4.1], ['Tolerancia a la frustración', 2.9], ['Autonomía', 3.9]] },
    { role: 'Supervisor de Bodega', id: '0331', ok: true, items: [['Liderazgo', 3.6], ['Apego a normas de seguridad', 4.7], ['Resolución de problemas', 3.9], ['Trabajo en equipo', 4.2]] },
    { role: 'Asistente Administrativa', id: '0356', ok: false, items: [['Organización', 4.4], ['Atención al detalle', 4.0], ['Adaptación al cambio', 2.8], ['Orientación al servicio', 3.8]] },
  ];

  const report = document.querySelector('.report');
  if (report) {
    const title = report.querySelector('.report-title');
    const code = report.querySelector('.report-id');
    const rows = [...report.querySelectorAll('.report-bars li')];
    const verdict = report.querySelector('.verdict');
    const verdictIcon = verdict.querySelector('.ph');
    const verdictText = verdict.querySelector('.verdict-text');
    [title, code, verdict, ...rows.flatMap((li) => [li.querySelector('span'), li.querySelector('em')])].forEach((el) => el.classList.add('report-swap'));

    const dots = document.createElement('div');
    dots.className = 'report-dots';
    dots.setAttribute('aria-hidden', 'true');
    reports.forEach(() => dots.append(document.createElement('span')));
    report.append(dots);

    const fill = (r) => {
      title.textContent = r.role;
      code.textContent = `N.º ${r.id}`;
      rows.forEach((li, i) => {
        const [label, score] = r.items[i];
        li.querySelector('span').textContent = label;
        li.querySelector('em').textContent = score.toFixed(1).replace('.', ',');
        li.querySelector('b').style.setProperty('--v', (score / 5).toFixed(2));
      });
      verdict.classList.toggle('is-warn', !r.ok);
      verdictIcon.className = `ph ${r.ok ? 'ph-seal-check' : 'ph-warning-circle'}`;
      verdictText.textContent = r.ok ? 'Recomendable para el cargo' : 'Recomendable con observaciones';
    };

    let index = 0;
    try {
      const last = Number(localStorage.getItem('al-report'));
      index = Number.isInteger(last) && last >= 0 ? (last + 1) % reports.length : 0;
      localStorage.setItem('al-report', String(index));
    } catch (e) { index = 0; }

    const markDots = () => [...dots.children].forEach((d, i) => d.classList.toggle('on', i === index));
    fill(reports[index]);
    markDots();
    setTimeout(() => report.classList.add('is-ready'), 2200);

    const next = () => {
      index = (index + 1) % reports.length;
      markDots();
      if (reduceMotion.matches) { fill(reports[index]); return; }
      report.classList.add('is-swapping');
      setTimeout(() => {
        fill(reports[index]);
        report.classList.remove('is-swapping');
      }, 350);
    };

    let timer = null;
    let inView = false;
    const start = () => { if (!timer && inView && !document.hidden) timer = setInterval(next, 5000); };
    const stop = () => { clearInterval(timer); timer = null; };
    new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; if (inView) start(); else stop(); }).observe(report);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  }
  const faqItems = [...document.querySelectorAll('.faq details')];
  const faqTiming = { duration: 520, easing: 'cubic-bezier(0.32, 0.72, 0, 1)' };

  const setFaq = (item, open) => {
    const body = item.querySelector('.faq-body');
    const current = item._anim;
    const from = item.open ? body.getBoundingClientRect().height : 0;
    if (current) current.cancel();
    item.classList.toggle('is-open', open);
    item.querySelector('summary').setAttribute('aria-expanded', String(open));

    if (open) item.open = true;
    const to = open ? body.scrollHeight : 0;
    if (reduceMotion.matches) {
      if (!open) item.open = false;
      return;
    }
    const anim = body.animate([{ height: `${from}px` }, { height: `${to}px` }], faqTiming);
    item._anim = anim;
    anim.onfinish = () => {
      item._anim = null;
      if (!open) item.open = false;
    };
  };

  faqItems.forEach((item) => {
    const summary = item.querySelector('summary');
    summary.setAttribute('aria-expanded', 'false');
    summary.addEventListener('click', (e) => {
      e.preventDefault();
      const open = !item.classList.contains('is-open');
      if (open) faqItems.forEach((other) => { if (other !== item && other.classList.contains('is-open')) setFaq(other, false); });
      setFaq(item, open);
    });
  });

  const form = document.getElementById('contact-form');
  const serviceSelect = document.getElementById('f-service');
  document.querySelectorAll('[data-service]').forEach((link) => {
    link.addEventListener('click', () => { serviceSelect.value = link.dataset.service; });
  });

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const messages = {
    name: 'Ingresa tu nombre.',
    company: 'Ingresa el nombre de tu empresa.',
    email: 'Ingresa un correo válido, por ejemplo nombre@empresa.cl.',
    phone: 'Ingresa un teléfono válido.',
    service: 'Elige el servicio que necesitas.',
    message: 'Cuéntanos brevemente qué necesitas.',
  };

  const validateField = (field) => {
    const value = field.value.trim();
    let ok = true;
    if (field.required && !value) ok = false;
    else if (field.type === 'email' && value && !emailPattern.test(value)) ok = false;
    else if (field.type === 'tel' && value && value.replace(/\D/g, '').length < 8) ok = false;
    const wrap = field.closest('.field');
    wrap.classList.toggle('has-error', !ok);
    wrap.querySelector('.field-error').textContent = ok ? '' : messages[field.name];
    field.setAttribute('aria-invalid', String(!ok));
    return ok;
  };

  const fields = [...form.querySelectorAll('input, select, textarea')];
  fields.forEach((f) => {
    f.addEventListener('blur', () => validateField(f));
    f.addEventListener('input', () => { if (f.closest('.field').classList.contains('has-error')) validateField(f); });
  });

  const status = form.querySelector('.form-status');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const results = fields.map(validateField);
    if (results.includes(false)) {
      status.textContent = 'Revisa los campos marcados.';
      status.classList.add('is-error');
      fields[results.indexOf(false)].focus();
      return;
    }
    status.classList.remove('is-error');
    const data = Object.fromEntries(new FormData(form));
    const body = [
      `Nombre: ${data.name}`,
      `Empresa: ${data.company}`,
      `Correo: ${data.email}`,
      data.phone ? `Teléfono: ${data.phone}` : '',
      `Servicio: ${data.service}`,
      '',
      data.message,
    ].filter((l) => l !== null).join('\n');
    const subject = `Solicitud de ${data.service} · ${data.company}`;
    window.location.href = `mailto:contacto@aciertolaboral.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Abrimos tu correo con la solicitud lista para enviar.';
  });
})();
