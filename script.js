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
navToggle.addEventListener('click', () => {
  const open = sidenav.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', open);
});
sidenav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  sidenav.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
}));

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

// ---------- hero control chart (signature element) ----------
(function drawControlChart() {
  const mount = document.getElementById('heroChart');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const W = 640, H = 300;
  const n = 42;
  const cl = H * 0.56;      // center line
  const ucl = H * 0.24;     // upper control limit
  const lcl = H * 0.86;     // lower control limit
  const flagIndex = 33;     // out-of-control point

  // deterministic pseudo-noise so the chart looks the same on every load
  const seed = [0.31,0.62,0.44,0.7,0.28,0.5,0.66,0.36,0.58,0.4,0.72,0.3,0.48,0.6,0.34,0.56,0.42,0.68,0.38,0.52,0.46,0.64,0.32,0.54,0.4,0.6,0.36,0.5,0.44,0.62,0.3,0.58,0.48,0.06,0.5,0.4,0.56,0.34,0.6,0.42,0.52,0.46];

  let points = [];
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * W;
    let y = cl - (seed[i] - 0.5) * (H * 0.5);
    if (i === flagIndex) y = ucl - 10; // breach point
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

  svg.appendChild(mk('line', { x1: 0, x2: W, y1: ucl, y2: ucl, class: 'limit-line' }));
  svg.appendChild(mk('line', { x1: 0, x2: W, y1: lcl, y2: lcl, class: 'limit-line' }));
  svg.appendChild(mk('line', { x1: 0, x2: W, y1: cl, y2: cl, class: 'center-line' }));

  svg.appendChild(mk('text', { x: 6, y: ucl - 8, class: 'chart-label' })).textContent = 'UCL';
  svg.appendChild(mk('text', { x: 6, y: lcl + 16, class: 'chart-label' })).textContent = 'LCL';

  const path = mk('path', { d: pathD, class: 'signal-path' });
  svg.appendChild(path);

  points.forEach((p, i) => {
    const isFlag = i === flagIndex;
    svg.appendChild(mk('circle', {
      cx: p[0], cy: p[1], r: isFlag ? 4.5 : 2.4,
      class: isFlag ? 'signal-dot signal-dot--flag' : 'signal-dot'
    }));
  });

  mount.appendChild(svg);

  if (!prefersReducedMotion) {
    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    requestAnimationFrame(() => {
      path.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(.4,0,.2,1)';
      path.style.strokeDashoffset = '0';
    });
    svg.querySelectorAll('.signal-dot').forEach((dot, i) => {
      dot.style.opacity = '0';
      dot.style.transition = `opacity .4s ease ${0.3 + i * 0.03}s`;
      requestAnimationFrame(() => { dot.style.opacity = '1'; });
    });
  }
})();
