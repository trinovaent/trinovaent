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
  resize(); window.addEventListener('resize', resize, {passive:true});

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
    for(let i=0;i<N;i++){
      const a = parts[i];
      for(let j=i+1;j<N;j++){
        const b = parts[j];
        const dx=a.x-b.x, dy=a.y-b.y, d=dx*dx+dy*dy;
        if(d< 130*130){
          ctx.globalAlpha = 1 - (d**0.5)/130;
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