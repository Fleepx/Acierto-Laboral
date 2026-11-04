(() => {
  const navWrap = document.querySelector('.nav-wrap');
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:0;height:24px;width:1px;';
  document.body.prepend(sentinel);
  new IntersectionObserver(([entry]) => navWrap.classList.toggle('is-scrolled', !entry.isIntersecting)).observe(sentinel);

  const links = [...document.querySelectorAll('.legal-toc a')];
  const setActive = (id) => links.forEach((a) => {
    const on = a.getAttribute('href') === `#${id}`;
    a.classList.toggle('is-active', on);
    if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
  });
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.id); });
  }, { rootMargin: '-30% 0px -60% 0px' });
  links.forEach((a) => {
    const section = document.querySelector(a.getAttribute('href'));
    if (section) observer.observe(section);
  });
})();
