// Particle background
(function(){
  const canvas = document.getElementById('particles');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let dpr = window.devicePixelRatio || 1;

  function resize(){
    const b = canvas.getBoundingClientRect();
    canvas.width = Math.floor(b.width * dpr);
    canvas.height = Math.floor(b.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize, {passive:true});

  const palette = ['#2CAB68','#1C7DD9','#E89239','#7AB3E8'];
  const N = 70;
  const parts = Array.from({length:N}, () => ({
    x: Math.random()*canvas.width/dpr,
    y: Math.random()*canvas.height/dpr,
    vx:(Math.random()*2-1)*0.35,
    vy:(Math.random()*2-1)*0.35,
    r: Math.random()*1.4+0.6,
    c: palette[Math.floor(Math.random()*palette.length)]
  }));

  function step(){
    const w = canvas.width/dpr, h = canvas.height/dpr;
    ctx.clearRect(0,0,w,h);

    // connecting lines
    for(let i=0;i<N;i++){
      const a = parts[i];
      for(let j=i+1;j<N;j++){
        const b = parts[j];
        const dx=a.x-b.x, dy=a.y-b.y, d=dx*dx+dy*dy;
        if(d < 130*130){
          ctx.globalAlpha = 1 - (Math.sqrt(d))/130;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
          ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 0.6; ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;
    for(const p of parts){
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = p.c; ctx.fill();
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>w) p.vx*=-1;
      if(p.y<0||p.y>h) p.vy*=-1;
    }
    requestAnimationFrame(step);
  }
  step();
})();

// Hamburger toggle for mobile (click); desktop uses hover via CSS
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('header nav');
  const icon = document.querySelector('.menu-icon');
  if (nav && icon) {
    icon.addEventListener('click', (e) => {
      e.stopPropagation();
      nav.classList.toggle('nav-open');
    });
    document.addEventListener('click', () => nav.classList.remove('nav-open'));
  }

  // Service cards fly-in (repeats on scroll) with stagger
  const cards = document.querySelectorAll('.service-card');
  if (cards.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        const index = Array.from(cards).indexOf(el); // 0,1,2…
        if (entry.isIntersecting) {
          setTimeout(() => {
            if (index === 0) el.classList.add('fly-in-left');
            if (index === 1) el.classList.add('fly-in-bottom');
            if (index === 2) el.classList.add('fly-in-right');
          }, index * 200); // 0ms, 200ms, 400ms
        } else {
          el.classList.remove('fly-in-left','fly-in-bottom','fly-in-right');
        }
      });
    }, { threshold: 0.3 });

    cards.forEach(c => io.observe(c));
  }

  // Memory Game
  const startBtn = document.getElementById('gameStart');
  const grid = document.getElementById('memoryGrid');
  const timeEl = document.getElementById('time');
  const matchesEl = document.getElementById('matches');
  const resultEl = document.getElementById('gameResult');
  const messageEl = document.getElementById('gameMessage');
  const playAgain = document.getElementById('playAgain');

  const symbols = ['📦','🚚','💻','🌐','🛒','🔒']; // trading, logistics, web, hosting, ecommerce, security
  let deck = [];
  let first = null, lock = false, timer = null, timeLeft = 30, matches = 0;

  function shuffle(a){
    for(let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]] = [a[j],a[i]];
    }
    return a;
  }

  function buildDeck(){
    deck = shuffle([...symbols, ...symbols]).map((sym, i) => ({
      id: i, sym, matched:false
    }));
  }

  function renderGrid(){
    grid.innerHTML = '';
    deck.forEach(card => {
      const el = document.createElement('div');
      el.className = 'card';
      el.dataset.id = card.id;

      const inner = document.createElement('div');
      inner.className = 'card-inner';

      const front = document.createElement('div'); front.className = 'card-face card-front'; front.textContent = '• •';
      const back  = document.createElement('div'); back.className  = 'card-face card-back';  back.textContent  = card.sym;

      inner.appendChild(front); inner.appendChild(back); el.appendChild(inner);
      grid.appendChild(el);
    });
  }

  function startTimer(){
    clearInterval(timer);
    timeLeft = 30; timeEl.textContent = timeLeft;
    timer = setInterval(() => {
      timeLeft--; timeEl.textContent = timeLeft;
      if(timeLeft <= 0){ endGame(false); }
    }, 1000);
  }

  function endGame(won){
    clearInterval(timer); lock = true;
    resultEl.hidden = false;
    messageEl.textContent = won ? 'Great job! You matched all pairs. ✅' : 'Time’s up! Try again. ⏱';
  }

  function resetGame(){
    first = null; lock = false; matches = 0;
    matchesEl.textContent = matches;
    resultEl.hidden = true;
    buildDeck();
    renderGrid();
  }

  function onCardClick(e){
    const el = e.target.closest('.card');
    if(!el || lock) return;

    const id = +el.dataset.id;
    const card = deck.find(c => c.id === id);
    if(card.matched) return;

    // flip
    if(el.classList.contains('flipped')) return;
    el.classList.add('flipped');

    if(!first){
      first = {el, card};
    }else{
      // second choice
      lock = true;
      const second = {el, card};
      if(first.card.sym === second.card.sym){
        // match
        first.card.matched = second.card.matched = true;
        first.el.classList.add('matched');
        second.el.classList.add('matched');
        matches++; matchesEl.textContent = matches;
        first = null; lock = false;
        if(matches === symbols.length){ endGame(true); }
      }else{
        // no match -> flip back
        setTimeout(() => {
          first.el.classList.remove('flipped');
          second.el.classList.remove('flipped');
          first = null; lock = false;
        }, 650);
      }
    }
  }

  if (grid && startBtn && timeEl && matchesEl && resultEl && messageEl && playAgain) {
    grid.addEventListener('click', onCardClick);
    startBtn.addEventListener('click', () => { resetGame(); startTimer(); });
    playAgain.addEventListener('click', () => { resetGame(); startTimer(); });
    // prepare initial board (not started yet)
    resetGame();
  }
});
