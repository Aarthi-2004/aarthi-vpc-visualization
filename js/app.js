(() => {
'use strict';
const NS = 'http://www.w3.org/2000/svg';
const $ = s => document.querySelector(s);
const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a || {}) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
const C = { blue: '#4aa3ff', teal: '#2dd4bf', gold: '#f5c04a', purple: '#b190ff', red: '#ff5d5d', green: '#4ade80', ink: '#e8eefc', mut: '#b8c4e0' };
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- Step data: [title, button subtitle, plain words, technical name, watch the picture]
const STEPS = [
  ['The fenced plot', 'Your own private land',
   'Aarthi runs a shop. She buys a big plot inside a huge city and puts a fence around it. Only she decides who may come in.',
   'AWS Cloud Region and a VPC (Virtual Private Cloud) with the address range 10.0.0.0/16.',
   'The blue box is the city (the cloud). The teal box inside it is her fenced plot.'],
  ['Two buildings', 'Availability Zones',
   'She builds two identical buildings on the plot. If one building loses power, the other keeps the shop running.',
   'Availability Zones A and B: separate data centres inside one region.',
   'Two dashed blue buildings now sit side by side inside the plot.'],
  ['Lobby and flats', 'Subnets',
   'Each building has a lobby that visitors may enter, and private flats for residents only. The gold lobby is public, the purple flats are private.',
   'Public subnet and private subnet in every Availability Zone.',
   'Gold boxes (lobbies) on top, purple boxes (flats) below, in both buildings.'],
  ['The main gate', 'Internet Gateway',
   'The only door between the plot and the street is the main gate. A signboard (the route table) tells traffic: anything for the outside goes through the gate.',
   'Internet Gateway and a route table with the route 0.0.0.0/0 to the gateway.',
   'A visitor envelope travels from Visitors, past the Internet, into the gate.'],
  ['The receptionist', 'Load Balancer',
   'A receptionist greets every visitor and sends them to whichever counter is free, so no single counter is overloaded.',
   'Application Load Balancer spreading requests across web servers in both zones.',
   'Envelopes leave the bar and go down to the web server in building A, then building B.'],
  ['Kitchen and vault', 'App servers and database',
   'The shop counter (web) passes orders to the back office (app), which writes them in a locked record room (database). A photocopy of the record room sits in the other building.',
   'Web tier, application tier, database tier, with Multi-AZ database replication.',
   'Floppy disks move web, then app, then database. Repeat arrows copy data between buildings.'],
  ['Delivery counter', 'NAT Gateway',
   'Residents in the flats may send for deliveries, such as software updates, but strangers cannot walk in the same way. The delivery counter fetches parcels for them.',
   'NAT Gateway in the public subnet: private servers reach the internet, but the internet cannot start a connection to them.',
   'A package leaves the app server, passes the NAT counter, then leaves by the main gate.'],
  ['Guards at every door', 'Security Group and NACL',
   'Every server has its own door guard (Security Group). Each floor also has a gate guard (NACL) checking everyone who enters or leaves. A stranger is turned away.',
   'Security Groups (per server, stateful) and Network ACLs (per subnet, stateless).',
   'The devil walks toward the private flats and is stopped with a red cross: Blocked!'],
  ['Tunnel and road', 'VPN and Peering',
   "Aarthi's office reaches the flats through a secret tunnel, safe from the street. A neighbouring society is joined by a private road.",
   'Site-to-Site VPN with a VPN Gateway, and VPC Peering to a partner VPC.',
   'A lock travels the green tunnel from the office. A handshake crosses the private road.']
];
const LEGEND = [['✉️', 'Visitor request'], ['💾', 'Data'], ['🔁', 'Database copy'], ['📦', 'Software update'], ['😈', 'Intruder'], ['🔒', 'Office VPN'], ['🤝', 'Partner peering']];

// ---- SVG setup
const svg = $('#diagram');
const defs = el('defs', {}, svg);
const gr = el('linearGradient', { id: 'sky', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
el('stop', { offset: 0, 'stop-color': '#0a1740' }, gr); el('stop', { offset: 1, 'stop-color': '#050a1c' }, gr);
const pat = el('pattern', { id: 'dots', width: 24, height: 24, patternUnits: 'userSpaceOnUse' }, defs);
el('circle', { cx: 2, cy: 2, r: 1, fill: '#fff', 'fill-opacity': .1 }, pat);
el('rect', { width: 1100, height: 620, fill: 'url(#sky)' }, svg);
el('rect', { width: 1100, height: 620, fill: 'url(#dots)' }, svg);
const W = el('g', {}, svg), B = el('g', {}, svg), P = el('g', {}, svg);   // wires, boxes, packets

// ---- Helpers
const pc = (layer, s) => el('g', { class: 'piece off', 'data-s': s }, layer);
const txt = (p, x, y, t, o = {}) => {
  const e = el('text', { x, y, fill: o.c || C.ink, 'font-size': o.f || 12, 'font-weight': o.w || 500, 'text-anchor': o.a || 'start' }, p);
  if (o.m) e.setAttribute('dominant-baseline', 'central');
  e.textContent = t; return e;
};
const box = (s, x, y, w, h, c, t, o = {}) => {
  const g = pc(B, s);
  el('rect', { x, y, width: w, height: h, rx: 8, fill: o.solid ? '#14213d' : c, 'fill-opacity': o.solid ? 1 : .1, stroke: c, 'stroke-width': 1.6, 'stroke-dasharray': o.d || 'none' }, g);
  if (o.top) txt(g, x + 12, y + 18, t, { c, f: 12, w: 700 });
  else {
    const L = t.split('|'), y0 = o.ty != null ? o.ty : y + h / 2 - (L.length - 1) * 6.25;
    L.forEach((l, i) => txt(g, x + w / 2, y0 + i * 12.5, l, { a: 'middle', m: 1, f: i ? 9.5 : 10.5, w: i ? 500 : 700, c: i ? C.mut : C.ink }));
  }
  return g;
};
const tag = (s, x, y, w, t) => {
  const g = pc(B, s);
  el('rect', { x, y, width: w, height: 16, rx: 4, fill: '#2a1218', stroke: C.red, 'stroke-width': 1.2 }, g);
  txt(g, x + w / 2, y + 8.5, t, { a: 'middle', f: 9, w: 700, c: '#ffb4b4', m: 1 });
};
const wire = (s, id, d, c) => { el('path', { id, d, class: 'wire', stroke: c }, pc(W, s)); };
const f3 = n => +n.toFixed(3);
const pk = (s, emoji, id, dur, a, b) => {
  const g = pc(P, s);
  const t = el('text', { 'font-size': 17, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, g);
  t.textContent = emoji;
  if (RM) {   // reduced motion: show the packet parked mid-wire
    const p = document.getElementById(id), pt = p.getPointAtLength(p.getTotalLength() / 2);
    t.setAttribute('x', pt.x); t.setAttribute('y', pt.y); return;
  }
  t.setAttribute('opacity', 0);
  const m = el('animateMotion', { dur: dur + 's', repeatCount: 'indefinite', calcMode: 'linear', keyPoints: '0;0;1;1', keyTimes: `0;${a};${b};1` }, t);
  el('mpath', { href: '#' + id }, m);
  el('animate', { attributeName: 'opacity', dur: dur + 's', repeatCount: 'indefinite', values: '0;0;1;1;0;0', keyTimes: `0;${a};${f3(a + .02)};${f3(b - .02)};${b};1` }, t);
};

// ---- Build the diagram (positions are in the 1100x620 viewBox)
box(1, 165, 15, 835, 597, C.blue, 'AWS Cloud (Region)', { top: 1 });
box(1, 180, 45, 805, 555, C.teal, 'VPC  10.0.0.0/16', { top: 1 });
[0, 1].forEach(i => {
  const zx = 260 + i * 370, sx = zx + 15, L = 'AB'[i];
  box(2, zx, 80, 350, 510, C.blue, `Availability Zone ${L} (building ${i + 1})`, { top: 1, d: '6 4' });
  box(3, sx, 160, 320, 140, C.gold, 'Public subnet', { top: 1 });
  box(3, sx, 325, 320, 250, C.purple, 'Private subnet', { top: 1 });
  // servers
  box(5, sx, 215, 100, 44, C.gold, 'Web server', { solid: 1 });
  box(6, sx, 360, 100, 44, C.purple, 'App server', { solid: 1 });
  box(6, sx, 480, 100, 44, C.purple, i ? 'Database|(live copy)' : 'Database', { solid: 1 });
  // wires and packets inside the zone
  const wx = sx + 25;
  wire(5, 'w-l' + i, `M${i ? 745 : 378},142 V215`, C.gold);
  wire(6, 'w-wa' + i, `M${wx},259 V360`, C.purple);
  wire(6, 'w-ad' + i, `M${wx},404 V480`, C.purple);
  pk(6, '💾', 'w-wa' + i, 6, 0, .2); pk(6, '💾', 'w-ad' + i, 6, .2, .4);
  // security tags
  [[215], [360], [480]].forEach(([y]) => tag(8, sx + 45, y + 48, 55, 'SG guard'));
  tag(8, sx + 266, 166, 46, 'NACL'); tag(8, sx + 266, 331, 46, 'NACL');
});

// Step 4: gate, internet, visitors, route table
box(4, 10, 25, 140, 40, C.blue, 'Visitors', { solid: 1 });
box(4, 10, 105, 140, 40, C.blue, 'The Internet', { solid: 1 });
box(4, 10, 160, 140, 40, C.gold, 'Route table|0.0.0.0/0 → IGW', { solid: 1 });
box(4, 165, 107, 90, 36, C.gold, 'Internet|Gateway', { solid: 1 });
wire(4, 'w-vi', 'M80,65 V105', C.blue);
wire(4, 'w-in', 'M150,45 H157 V125 H165', C.gold);
pk(4, '✉️', 'w-in', 8, 0, .2);

// Step 5: load balancer
wire(5, 'w-gate', 'M255,125 H280', C.gold);
box(5, 280, 108, 680, 34, C.teal, 'Load Balancer (the receptionist)', { solid: 1 });
pk(5, '✉️', 'w-gate', 8, .2, .3); pk(5, '✉️', 'w-l0', 8, .3, .5);
pk(5, '✉️', 'w-in', 8, .5, .7); pk(5, '✉️', 'w-gate', 8, .7, .8); pk(5, '✉️', 'w-l1', 8, .8, 1);

// Step 6: replication
wire(6, 'w-rep', 'M390,502 H660', C.purple);
pk(6, '🔁', 'w-rep', 6, .4, .8);

// Step 7: NAT and software update
box(7, 470, 215, 100, 44, C.gold, 'NAT Gateway', { solid: 1 });
wire(7, 'w-u1', 'M390,382 H535 V259', C.gold);
wire(7, 'w-u2', 'M505,259 V290 H222 V143', C.gold);
wire(7, 'w-u3', 'M165,135 H150', C.gold);
pk(7, '📦', 'w-u1', 7, 0, .35); pk(7, '📦', 'w-u2', 7, .35, .8); pk(7, '📦', 'w-u3', 7, .8, 1);

// Step 8: intruder
wire(8, 'w-bad', 'M172,143 V312 H395', C.red);
pk(8, '😈', 'w-bad', 6, 0, .6);
const x = pc(P, 8);
const xg = el('g', {}, x);
el('path', { d: 'M398,305 l14,14 m0,-14 l-14,14', stroke: C.red, 'stroke-width': 3.5, 'stroke-linecap': 'round', fill: 'none' }, xg);
txt(xg, 420, 312, 'Blocked!', { c: C.red, f: 11, w: 800, m: 1 });
if (!RM) { xg.setAttribute('opacity', 0); el('animate', { attributeName: 'opacity', dur: '6s', repeatCount: 'indefinite', values: '0;0;1;1;0', keyTimes: '0;.6;.65;.95;1' }, xg); }

// Step 9: office VPN and partner peering
box(9, 10, 470, 110, 50, C.green, 'Office|(Aarthi HQ)', { solid: 1 });
txt(pc(B, 9), 10, 540, 'Secret tunnel (VPN)', { c: C.green, f: 10, w: 600 });
box(9, 165, 470, 90, 36, C.green, 'VPN Gateway', { solid: 1, ty: 483 });
wire(9, 'w-vpn', 'M120,494 H282', C.green);
pk(9, '🔒', 'w-vpn', 5, 0, 1);
box(9, 1010, 300, 80, 100, C.teal, 'Partner VPC|172.16.0.0/16', { solid: 1 });
txt(pc(B, 9), 1050, 416, 'VPC peering', { a: 'middle', c: C.teal, f: 9.5, w: 600 });
wire(9, 'w-peer', 'M965,400 H1010', C.teal);
pk(9, '🤝', 'w-peer', 4, 0, 1);

// ---- Sidebar, legend, caption
const nav = $('#steps');
const btns = STEPS.map((s, i) => {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'step';
  b.innerHTML = `<span class="n">${i + 1}</span><span><b></b><small></small></span>`;
  b.querySelector('b').textContent = s[0]; b.querySelector('small').textContent = s[1];
  b.addEventListener('click', () => { stopAuto(); show(i + 1); });
  nav.appendChild(b); return b;
});
LEGEND.forEach(([e, t]) => { const li = document.createElement('li'); li.innerHTML = '<span></span> '; li.firstChild.textContent = e; li.appendChild(document.createTextNode(t)); $('#legend').appendChild(li); });

let cur = 0, timer = null;
function show(n) {
  cur = n;
  svg.querySelectorAll('.piece').forEach(p => {
    const was = !p.classList.contains('off'), on = +p.dataset.s <= n;
    p.classList.toggle('off', !on);
    if (on && !was) { p.classList.add('new'); setTimeout(() => p.classList.remove('new'), 1800); }
  });
  btns.forEach((b, i) => { if (i + 1 === n) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
  const s = STEPS[n - 1];
  $('#cap-title').textContent = `Step ${n}: ${s[0]}`;
  $('#cap-plain').textContent = s[2]; $('#cap-tech').textContent = s[3]; $('#cap-watch').textContent = s[4];
}
const auto = $('#auto');
function stopAuto() { clearInterval(timer); timer = null; auto.textContent = 'Auto-play'; }
auto.addEventListener('click', () => {
  if (timer) return stopAuto();
  if (cur >= STEPS.length) show(1);
  auto.textContent = 'Pause';
  timer = setInterval(() => { if (cur >= STEPS.length) stopAuto(); else show(cur + 1); }, 5000);
});
$('#reset').addEventListener('click', () => { stopAuto(); show(1); });
show(1);
})();
