const body = document.getElementById('body');
const dayContent = document.getElementById('dayContent');
const nightContent = document.getElementById('nightContent');
const modeIcon = document.getElementById('modeIcon');
const modeLabel = document.getElementById('modeLabel');

let isNight = false;

document.getElementById('modeToggle').addEventListener('click', () => {
  isNight = !isNight;
  
  if (isNight) {
    body.classList.replace('day-mode', 'night-mode');
    dayContent.style.display = 'none';
    nightContent.style.display = 'block';
    modeIcon.textContent = '☀️';
    modeLabel.textContent = 'DAY MODE';
    spawnParticles();
    setupPlayHover();
  } else {
    body.classList.replace('night-mode', 'day-mode');
    nightContent.style.display = 'none';
    dayContent.style.display = 'block';
    modeIcon.textContent = '🌙';
    modeLabel.textContent = 'NIGHT MODE';
  }
});

function spawnParticles() {
  const c = document.getElementById('nightParticles');
  if (!c || c.children.length > 0) return;
  
  for(let i=0; i<40; i++) {
    const p = document.createElement('div');
    p.className = 'night-particle';
    const s = Math.random() * 5 + 1.5;
    const colors = [
      'rgba(232,120,32,0.7)',
      'rgba(212,146,10,0.6)',
      'rgba(200,55,0,0.55)',
      'rgba(255,180,60,0.5)',
      'rgba(220,90,5,0.65)',
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    p.style.cssText = [
      `width:${s}px`,
      `height:${s}px`,
      `left:${Math.random() * 100}%`,
      `animation-duration:${7 + Math.random() * 16}s`,
      `animation-delay:${Math.random() * -22}s`,
      `background:${color}`,
      `border-radius:50%`,
    ].join(';');
    c.appendChild(p);
  }
}

let playHoverSetup = false;
function setupPlayHover() {
  if (playHoverSetup) return;
  playHoverSetup = true;

  const btn = document.getElementById('playBtn');
  const fireBase = document.getElementById('nightFireBase');
  const particles = document.getElementById('nightParticles');
  
  if (!btn) return;

  let hoverParticles = [];
  
  function addHoverParticles() {
    const c = particles;
    for (let i = 0; i < 25; i++) {
      const p = document.createElement('div');
      p.className = 'night-particle hover-particle';
      const s = Math.random() * 4 + 2;
      const colors = ['rgba(232,120,32,0.85)','rgba(255,160,40,0.8)','rgba(200,55,0,0.75)','rgba(255,200,80,0.7)'];
      p.style.cssText = [
        `width:${s}px`,`height:${s}px`,
        `left:${Math.random() * 100}%`,
        `animation-duration:${3 + Math.random() * 5}s`,
        `animation-delay:${Math.random() * -6}s`,
        `background:${colors[Math.floor(Math.random()*colors.length)]}`,
        `border-radius:50%`,
      ].join(';');
      c.appendChild(p);
      hoverParticles.push(p);
    }
  }

  function removeHoverParticles() {
    hoverParticles.forEach(p => {
      p.addEventListener('animationiteration', () => p.remove(), { once: true });
    });
    hoverParticles = [];
  }

  btn.addEventListener('mouseenter', () => {
    btn.classList.add('burning');
    fireBase.classList.add('fire-intense');
    addHoverParticles();
  });
  
  btn.addEventListener('mouseleave', () => {
    btn.classList.remove('burning');
    fireBase.classList.remove('fire-intense');
    removeHoverParticles();
  });
}

const starImg = new Image();
starImg.src = './fnaf6assets/star.png';

const starSystems = [];
let starRafRunning = false;

function fitCanvas(canvas) {
  const p = canvas.parentElement;
  if (!p) return;
  const r = p.getBoundingClientRect();
  const w = Math.round(r.width)  || canvas.offsetWidth  || 400;
  const h = Math.round(r.height) || canvas.offsetHeight || 150;
  
  if (canvas.id === 'dayBannerStars') {
    canvas.width  = w * 3;
    canvas.height = h;
    canvas.style.left   = '-100%';
    canvas.style.width  = '300%';
    canvas.style.height = '100%';
  } else {
    canvas.width  = w;
    canvas.height = h;
  }
}

function registerStarSystem(canvas, originFn, spawnHz, maxStars) {
  if (!canvas) return;
  fitCanvas(canvas);
  starSystems.push({ canvas, ctx: canvas.getContext('2d'), stars: [], originFn, spawnHz, maxStars });
}

function burstStar(sys) {
  const o = sys.originFn(sys.canvas);
  if (!o) return;
  
  const angle = Math.random() * Math.PI * 2;
  const speed = 0.18 + Math.random() * 0.52;
  const sizePick = Math.random();
  const size = sizePick < 0.3 ? 28 + Math.random() * 20
             : sizePick < 0.7 ? 55 + Math.random() * 40
             :                  100 + Math.random() * 60;

  const isBanner = sys.canvas.id === 'dayBannerStars';
  const isPanel  = sys.canvas.id === 'panelStars';

  const horizFactor = Math.abs(Math.cos(angle));
  let maxLife;
  if (isBanner) {
    maxLife = 500 + horizFactor * 900 + Math.random() * 200;
  } else {
    maxLife = 500 + Math.random() * 300;
  }

  const maxOpacity = isPanel ? 0.48 : isBanner ? 0.58 : 0.82;

  sys.stars.push({
    x: o.x, y: o.y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.025,
    size, maxLife, life: 0, maxOpacity, isPanel,
  });
}

function runStarLoop() {
  starSystems.forEach(sys => {
    const { canvas, ctx, stars, spawnHz, maxStars } = sys;
    const pw = Math.round(canvas.parentElement?.getBoundingClientRect().width || 0);
    if (pw && Math.abs(pw - canvas.width) > 2) fitCanvas(canvas);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (Math.random() < spawnHz && stars.length < maxStars) burstStar(sys);

    for (let i = stars.length - 1; i >= 0; i--) {
      const s = stars[i];
      s.life++;
      s.x += s.vx;
      s.y += s.vy;
      s.rot += s.rotSpeed;

      const t = s.life / s.maxLife;
      let opacity = t < 0.08 ? t / 0.08
                  : t > 0.88 ? (1 - t) / 0.12
                  : 1;
      opacity = Math.min(opacity, s.maxOpacity ?? 0.82);

      if (s.isPanel) {
        const margin = s.size;
        const edgeFadeX = Math.min(s.x / margin, (canvas.width - s.x) / margin, 1);
        const edgeFadeY = Math.min(s.y / margin, (canvas.height - s.y) / margin, 1);
        const edgeFade = Math.max(0, Math.min(edgeFadeX, edgeFadeY));
        opacity *= edgeFade;
        if (edgeFade <= 0) { stars.splice(i, 1); continue; }
      }

      if (s.life >= s.maxLife) { stars.splice(i, 1); continue; }

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot);

      if (starImg.complete && starImg.naturalWidth > 0) {
        ctx.drawImage(starImg, -s.size / 2, -s.size / 2, s.size, s.size);
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = 'rgba(255,255,255,1)';
        ctx.fillRect(-s.size / 2, -s.size / 2, s.size, s.size);
      } else {
        ctx.fillStyle = 'rgba(255,255,255,1)';
        ctx.beginPath();
        for (let j = 0; j < 10; j++) {
          const a = (j * Math.PI) / 5 - Math.PI / 2;
          const r = j % 2 === 0 ? s.size / 2 : s.size / 4.5;
          j === 0 ? ctx.moveTo(r * Math.cos(a), r * Math.sin(a))
                  : ctx.lineTo(r * Math.cos(a), r * Math.sin(a));
        }
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  });
  requestAnimationFrame(runStarLoop);
}

function initDayStars() {
  registerStarSystem(
    document.getElementById('dayBannerStars'),
    c => ({ x: c.width / 2, y: c.height * 0.48 }),
    0.025, 6
  );
  registerStarSystem(
    document.getElementById('panelStars'),
    c => ({ x: c.width / 2, y: c.height * 0.50 }),
    0.022, 5
  );
  registerStarSystem(
    document.getElementById('dayPlayStars'),
    c => ({ x: c.width / 2, y: c.height / 2 }),
    0, 0
  );
  
  if (!starRafRunning) { 
    starRafRunning = true; 
    requestAnimationFrame(runStarLoop); 
  }
}

function setupDayPlayStarHover() {
  const bar = document.getElementById('dayPlayBar');
  const barSys = starSystems.find(s => s.canvas.id === 'dayPlayStars');
  if (!bar || !barSys) return;
  
  bar.addEventListener('mouseenter', () => { barSys.spawnHz = 0.07; barSys.maxStars = 5; });
  bar.addEventListener('mouseleave', () => { barSys.spawnHz = 0; barSys.maxStars = 0; });
}

window.addEventListener('resize', () => starSystems.forEach(s => fitCanvas(s.canvas)));
initDayStars();
setupDayPlayStarHover();

const catalogs = {
  dumpster: [
    { name:"Bucket Bob",       price:10,    condition:"Very Good", img:"./fnaf6assets/bucketbob.webp",     atm:0, health:0, ent:1, rev:0, risk:0 },
    { name:"Mr. Can-Do",       price:10,    condition:"Very Good", img:"./fnaf6assets/mrcando.webp",       atm:0, health:0, ent:1, rev:0, risk:0 },
    { name:"Mr. Hugs",         price:15,    condition:"Very Good", img:"./fnaf6assets/mrhugs.webp",        atm:0, health:0, ent:3, rev:0, risk:1 },
    { name:"No. 1 Crate",      price:10,    condition:"Very Good", img:"./fnaf6assets/no1crate.webp",      atm:0, health:0, ent:2, rev:0, risk:0 },
    { name:"Pan Stan",         price:10,    condition:"Very Good", img:"./fnaf6assets/panstan.webp",       atm:0, health:0, ent:1, rev:0, risk:0 },
  ],
  stans: [
    { name:"Happy Frog",         price:200,  condition:"Good",      img:"./fnaf6assets/happyfrog.webp",        atm:0, health:0, ent:4, rev:0, risk:0 },
    { name:"Mr. Hippo",          price:190,  condition:"Good",      img:"./fnaf6assets/mrhippo.webp",          atm:0, health:0, ent:4, rev:0, risk:0 },
    { name:"Nedd Bear",          price:260,  condition:"Fair",      img:"./fnaf6assets/neddbear.webp",         atm:0, health:0, ent:5, rev:0, risk:1 },
    { name:"Pigpatch",           price:230,  condition:"Good",      img:"./fnaf6assets/pigpatch.webp",         atm:0, health:0, ent:4, rev:0, risk:0 },
    { name:"Orville Elephant",   price:4100, condition:"Excellent", img:"./fnaf6assets/orvilleelephant.webp", atm:1, health:0, ent:7, rev:1, risk:0 },
  ],
  smiles: [
    { name:"Rockstar Freddy", price:2000, condition:"Excellent", img:"./fnaf6assets/rockstarfreddy.webp", atm:0, health:0, ent:7, rev:0, risk:1 },
    { name:"Rockstar Bonnie", price:2000, condition:"Excellent", img:"./fnaf6assets/rockstarbonnie.webp", atm:0, health:0, ent:7, rev:0, risk:1 },
    { name:"Rockstar Chica",  price:2000, condition:"Excellent", img:"./fnaf6assets/rockstarchica.webp",  atm:0, health:0, ent:7, rev:0, risk:1 },
    { name:"Rockstar Foxy",   price:2500, condition:"Excellent", img:"./fnaf6assets/rockstarfoxy.webp",   atm:0, health:0, ent:8, rev:0, risk:1 },
    { name:"Lefty",           price:5,    condition:"Poor",      img:"./fnaf6assets/lefty.webp",          atm:0, health:0, ent:9, rev:0, risk:9 },
  ],
  rare: [
    { name:"Music Man",     price:19000, condition:"Good",      img:"./fnaf6assets/musicman.webp",     atm:0, health:0, ent:9, rev:0, risk:1 },
    { name:"El Chip",       price:32000, condition:"Excellent", img:"./fnaf6assets/elchip.webp",       atm:7, health:0, ent:7, rev:0, risk:0 },
    { name:"Funtime Chica", price:71000, condition:"Pristine",  img:"./fnaf6assets/funtimechica.webp", atm:9, health:0, ent:9, rev:9, risk:0 },
  ],
};

let curCatalog = 'dumpster';
let curIndex = 0;
let activeTile = document.querySelector('.menu-tile.active');

function selectCatalog(id, tile) {
  curCatalog = id; 
  curIndex = 0;
  
  if (activeTile) activeTile.classList.remove('active');
  tile.classList.add('active');
  activeTile = tile;

  const bg = {
    dumpster: 'rgba(100,130,210,0.62) radial-gradient(ellipse at center,transparent 30%,rgba(40,60,130,0.38) 100%)',
    stans:    'rgba(120,165,130,0.62) radial-gradient(ellipse at center,transparent 30%,rgba(50,85,60,0.38) 100%)',
    smiles:   'rgba(185,115,155,0.62) radial-gradient(ellipse at center,transparent 30%,rgba(105,50,85,0.38) 100%)',
    rare:     'rgba(135,115,175,0.62) radial-gradient(ellipse at center,transparent 30%,rgba(70,50,105,0.38) 100%)',
  };
  
  document.getElementById('itemPanel').style.background = bg[id];
  document.getElementById('statsPanel').style.background = bg[id];
  updateItem();
}

function updateItem() {
  const item = catalogs[curCatalog][curIndex];
  const img = document.getElementById('itemImage');
  const wrap = document.querySelector('.item-img-wrap');
  const riskRow = document.querySelector('.stat-row-risk');
  
  document.getElementById('itemName').textContent = item.name;
  document.getElementById('priceVal').textContent = item.price;
  document.getElementById('costVal').textContent = item.price;
  document.getElementById('itemCondition').textContent = 'Item condition: ' + item.condition;

  img.style.visibility = 'hidden';
  img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

  requestAnimationFrame(() => {
    img.style.transform = '';
    img.style.width = '100%';
    img.style.height = '100%';
    wrap.style.top = '14%';
    wrap.style.bottom = '5%';
    wrap.style.left = '-10%';
    wrap.style.right = '-10%';

    if (item.name === 'Funtime Chica') {
      wrap.style.left = 'calc(-10% + 5%)';
      wrap.style.right = 'calc(-10% - 5%)';
    } else if (item.name === 'Rockstar Bonnie') {
      img.style.width = '105%';
      img.style.height = '105%';
      wrap.style.top = '8%';
    } else if (item.name === 'Rockstar Chica') {
      wrap.style.left = 'calc(-3% - 3%)';
      wrap.style.right = 'calc(-10% + 4%)';
    } else if (item.name === 'No. 1 Crate') {
      img.style.width = '55%';
      img.style.height = '55%';
      wrap.style.top = '30%';
      wrap.style.bottom = '0%';
    } else if (item.name === 'Bucket Bob') {
      wrap.style.left = 'calc(-4% - 4%)';
      wrap.style.right = 'calc(-10% + 6%)';
    } else if (item.name === 'Rockstar Freddy') {
      wrap.style.left = 'calc(-3% - 3%)';
      wrap.style.right = 'calc(-10% + 9%)';
    }

    img.src = item.img;
    img.style.visibility = '';
  });

  setBar('atmosphere', item.atm, 9);
  setBar('health', item.health, 5);
  setBar('entertainment', item.ent, 9);
  setBar('revenue', item.rev, 9);
  setBar('risk', item.risk, 9);
  
  if (riskRow) {
    riskRow.style.display = item.name === 'Lefty' ? '' : 'none';
  }
}

function setBar(stat, val, max) {
  document.getElementById('stat-' + stat).textContent = val;
  document.getElementById('bar-' + stat).style.width = (val / max * 100) + '%';
}

document.getElementById('prevBtn').addEventListener('click', () => {
  curIndex = (curIndex - 1 + catalogs[curCatalog].length) % catalogs[curCatalog].length;
  updateItem();
});

document.getElementById('nextBtn').addEventListener('click', () => {
  curIndex = (curIndex + 1) % catalogs[curCatalog].length;
  updateItem();
});

updateItem();

const salvages = [
  {
    name: "MOLTEN FREDDY",
    img: "./fnaf6assets/moltenfreddy.webp",
    link: "https://freddy-fazbears-pizza.fandom.com/wiki/Molten_Freddy",
    condition: "CRITICAL",
    desc: "A twisted knot of wires and shattered endoskeleton frames with far too many eyes. Multiple personalities speak through it at once. Whatever you recovered from the back alley on the first night, it was not alone inside.",
  },
  {
    name: "SCRAPTRAP",
    img: "./fnaf6assets/scraptrap.webp",
    link: "https://freddy-fazbears-pizza.fandom.com/wiki/Scraptrap",
    condition: "COMPROMISED",
    desc: "A ruined animatronic suit with a man's silhouette visible through the gaps. He survived a building fire and walked out. He has survived worse than you. He was aware of this appointment before you were told about it.",
  },
  {
    name: "SCRAP BABY",
    img: "./fnaf6assets/scrapbaby.webp",
    link: "https://freddy-fazbears-pizza.fandom.com/wiki/Scrap_Baby",
    condition: "UNSTABLE",
    desc: "A rebuilt female animatronic with a large claw grafted onto one arm and a wide, practiced smile. She speaks clearly and patiently. She listened to all five prompts without interrupting. That is the part you should be afraid of.",
  },
  {
    name: "LEFTY",
    img: "./fnaf6assets/lefty2.webp",
    link: "https://freddy-fazbears-pizza.fandom.com/wiki/Lefty",
    condition: "UNKNOWN",
    desc: "A black bear animatronic in rough condition, sent by an anonymous buyer through the catalog. The name on the shipping form is not one you will recognize. Something ancient is contained inside.",
  },
];

let nIdx = 0;

function updateNightChar() {
  const c = salvages[nIdx];
  const total = salvages.length;
  const padded = String(nIdx + 1).padStart(2, '0');
  const paddedTotal = String(total).padStart(2, '0');
  const img = document.getElementById('nightCharImg');

  document.getElementById('nightCharName').textContent = c.name;
  document.getElementById('nightCharDesc').textContent = c.desc;
  document.getElementById('nightCharLink').href = c.link;
  document.getElementById('nightCharCondition').textContent = 'CONDITION: ' + c.condition;
  document.getElementById('nightTerminalId').textContent = 'SUBJECT ' + padded + ' / ' + paddedTotal;
  document.getElementById('nightCounter').textContent = padded + ' / ' + paddedTotal;
  
  img.src = c.img;
}

document.getElementById('nightPrev').addEventListener('click', () => {
  nIdx = (nIdx - 1 + salvages.length) % salvages.length;
  updateNightChar();
});

document.getElementById('nightNext').addEventListener('click', () => {
  nIdx = (nIdx + 1) % salvages.length;
  updateNightChar();
});

updateNightChar();