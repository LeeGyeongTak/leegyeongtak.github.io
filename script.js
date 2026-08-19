// ---------- render helpers ----------
function el(tag, cls, html) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html !== undefined) n.innerHTML = html;
  return n;
}

function renderPubs(mountId, items) {
  const mount = document.getElementById(mountId);
  items.forEach(item => {
    const li = el('li', 'pubs__item');
    li.appendChild(el('span', 'pubs__year', item.year));
    const body = el('div', 'pubs__body');
    body.appendChild(el('p', 'pubs__text', item.text));
    const venue = el('p', 'pubs__venue', `<span>${item.venue}</span>${item.detail ? ' — ' + item.detail : ''}`);
    body.appendChild(venue);
    li.appendChild(body);
    mount.appendChild(li);
  });
}

function renderPlainList(mountId, items) {
  const mount = document.getElementById(mountId);
  items.forEach(t => mount.appendChild(el('li', 'pubs__plain-item', t)));
}

function renderProjects(mountId, items) {
  const mount = document.getElementById(mountId);
  items.forEach(p => {
    const card = el('div', 'project');
    card.appendChild(el('p', 'project__year', p.year));
    card.appendChild(el('p', 'project__title', p.title));
    card.appendChild(el('p', 'project__org', p.org));
    card.appendChild(el('p', 'project__task', p.task));
    mount.appendChild(card);
  });
}

function renderTimeline(mountId, items) {
  const mount = document.getElementById(mountId);
  items.forEach(it => {
    const li = el('li');
    li.appendChild(el('span', 'timeline__year', it.year));
    const div = el('div');
    div.appendChild(el('p', 'timeline__title', it.title));
    div.appendChild(el('p', 'timeline__meta', it.meta));
    li.appendChild(div);
    mount.appendChild(li);
  });
}

renderPubs('journalList', JOURNAL_ARTICLES);
renderPubs('confList', CONFERENCE_PAPERS);
renderPlainList('wpList', WORKING_PAPERS);
renderPubs('bookList', BOOKS);
renderProjects('projYonsei', PROJECTS_YONSEI);
renderProjects('projPersonal', PROJECTS_PERSONAL);
renderPlainList('knowhowList', KNOWHOW);
renderTimeline('awardList', AWARDS);
renderTimeline('teachList', TEACHING);
renderTimeline('talkList', TALKS);

document.getElementById('year').textContent = new Date().getFullYear();

// ---------- nav toggle (mobile) ----------
const navToggle = document.getElementById('navToggle');
const sidenav = document.getElementById('sidenav');
const navBackdrop = document.getElementById('navBackdrop');

function closeNav() {
  sidenav.classList.remove('is-open');
  navBackdrop.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}
function openNav() {
  sidenav.classList.add('is-open');
  navBackdrop.classList.add('is-open');
  navToggle.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}
navToggle.addEventListener('click', () => {
  sidenav.classList.contains('is-open') ? closeNav() : openNav();
});
navBackdrop.addEventListener('click', closeNav);
sidenav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeNav();
});

// ---------- active section highlight ----------
const sections = document.querySelectorAll('main .section, main .hero');
const navLinks = document.querySelectorAll('.sidenav__list a');
const byHref = href => [...navLinks].find(a => a.getAttribute('href') === '#' + href);

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.remove('is-active'));
      const link = byHref(entry.target.id);
      if (link) link.classList.add('is-active');
    }
  });
}, { rootMargin: '-40% 0px -50% 0px' });
sections.forEach(s => observer.observe(s));

// ---------- hero control chart (signature element, quiet version) ----------
(function drawControlChart() {
  const mount = document.getElementById('heroChart');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const W = 420, H = 64;
  const n = 28;
  const cl = H * 0.55;
  const flagIndex = 21; // the one point the line quietly settles on

  // deterministic pseudo-noise so the line looks the same on every load
  const seed = [0.5,0.46,0.58,0.42,0.6,0.44,0.52,0.4,0.56,0.48,0.62,0.44,0.5,0.4,0.54,0.46,0.6,0.42,0.52,0.38,0.48,0.5,0.5,0.5,0.5,0.5,0.5,0.5];

  let points = [];
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * W;
    let y = cl - (seed[i] - 0.5) * (H * 0.7);
    points.push([x, y]);
  }

  const pathD = points.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');

  const svgns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('class', 'chart-svg');

  const mk = (name, attrs) => {
    const n2 = document.createElementNS(svgns, name);
    Object.entries(attrs).forEach(([k, v]) => n2.setAttribute(k, v));
    return n2;
  };

  const path = mk('path', { d: pathD, class: 'signal-path' });
  svg.appendChild(path);

  const flag = points[flagIndex];
  svg.appendChild(mk('circle', { cx: flag[0], cy: flag[1], r: 2.6, class: 'signal-dot signal-dot--flag' }));

  mount.appendChild(svg);

  if (!prefersReducedMotion) {
    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    requestAnimationFrame(() => {
      path.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(.4,0,.2,1)';
      path.style.strokeDashoffset = '0';
    });
    const dot = svg.querySelector('.signal-dot--flag');
    dot.style.opacity = '0';
    dot.style.transition = 'opacity .5s ease 1.4s';
    requestAnimationFrame(() => { dot.style.opacity = '1'; });
  }
})();

// ---------- scroll reveal for sections ----------
(function revealOnScroll() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll('main .section');
  if (prefersReducedMotion) {
    targets.forEach(t => t.classList.add('is-visible'));
    return;
  }
  targets.forEach(t => t.classList.add('reveal'));
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });
  targets.forEach(t => io.observe(t));
})();
