'use strict';
/* Rolagem nativa: rodas, carroceria e contêiner compartilham o mesmo movimento.
   As três faces compartilham os mesmos vértices e a mesma câmera 3D. */
(() => {
  const story = document.querySelector('.scroll-story');
  const stage = document.getElementById('story-stage');
  const canvas = document.getElementById('equipment-canvas');
  if (!story || !canvas) return;
  const ctx = canvas.getContext('2d', {alpha: true});
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const select = id => document.getElementById(id);
  const intro = select('story-intro'), chapter = select('story-chapter');
  const door = select('story-door'), results = select('story-results');
  const topLine = document.querySelector('.story-topline');
  const clamp = x => Math.max(0, Math.min(1, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, x) => { const t = clamp((x-a)/(b-a)); return t*t*t*(t*(t*6-15)+10); };
  let width = 0, height = 0, current = 0, target = 0, frame = 0, ready = false;
  let lastTime = 0, previousPhase = -1, doorTarget = null;
  let sceneFrame = {left:0,right:0,width:0,introBottom:0};
  const images = {};
  const sources = {
    truck: 'assets/container-truck.webp',
    cargo: 'assets/container-cargo.webp', door: 'assets/container-door.webp'
  };

  function opacity(element, value) {
    element.style.opacity = String(value);
    const hidden = value < .05;
    element.setAttribute('aria-hidden', String(hidden));
    element.inert = hidden;
  }
  function shadow(x, y, rx, ry, alpha) {
    ctx.save(); ctx.translate(x, y); ctx.scale(rx, ry);
    const gradient = ctx.createRadialGradient(0, 0, .1, 0, 0, 1);
    gradient.addColorStop(0, `rgba(16,35,52,${alpha})`);
    gradient.addColorStop(1, 'rgba(16,35,52,0)');
    ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(0, 0, 1, 0, Math.PI*2); ctx.fill(); ctx.restore();
  }
  const truckDeparture = p => smooth(.055, .40, p);
  const TRUCK = {
    width: 1600, height: 694, wheelRadius: 82,
    cargo: [[398,41],[1547,41],[1547,454],[398,454]],
    wheels: [{x:253,y:566,r:68}, {x:1017,y:565,r:68}, {x:1197,y:565,r:68}]
  };
  function truckPose(p, travel=p) {
    const mobile = width <= 680;
    const full = smooth(.025, .16, p);
    const aspect = images.truck.height / images.truck.width;
    const floor = height - (mobile ? 108 : 105);
    const initialWidth = mobile
      ? Math.min(sceneFrame.width * .98, Math.max(96, floor - sceneFrame.introBottom - 18) / aspect)
      : Math.min(sceneFrame.width * .56, height * .43 / aspect);
    const expandedWidth = Math.min(sceneFrame.width * .92, height * .48 / aspect);
    const w = lerp(initialWidth, expandedWidth, full), h = w * aspect;
    const restX = lerp(sceneFrame.right - w, sceneFrame.left + (sceneFrame.width - w) / 2, full);
    // A cabine aponta para a esquerda: o conjunto avança até sair por inteiro.
    const x = lerp(restX, -w - 48, truckDeparture(travel));
    const y = floor - h * .93;
    return {x,y,w,h,floor,scale:w/TRUCK.width,distance:(x-restX)/(w/TRUCK.width)};
  }
  function drawTruck(p) {
    const truck = truckPose(p);
    shadow(truck.x + truck.w * .53, truck.floor - 1, truck.w * .43, Math.max(8, truck.h * .055), .16);
    ctx.save();
    ctx.translate(truck.x,truck.y); ctx.scale(truck.scale,truck.scale);
    ctx.save();
    // O contêiner é desenhado como volume separado desde o primeiro quadro.
    // A carroceria pode continuar avançando sem deixar outra carga para trás.
    ctx.beginPath();
    ctx.rect(0,0,TRUCK.width,TRUCK.height);
    ctx.rect(395,0,1160,455);
    ctx.clip('evenodd');
    ctx.drawImage(images.truck,0,0);
    ctx.restore();
    // Gira apenas o disco de cada roda; pneus, paralamas e sombras ficam alinhados.
    // Distância / raio liga o giro à viagem e também inverte o giro ao voltar.
    for(const wheel of TRUCK.wheels) {
      ctx.save();
      ctx.translate(wheel.x,wheel.y);
      ctx.beginPath(); ctx.arc(0,0,wheel.r,0,Math.PI*2); ctx.clip();
      ctx.rotate(truck.distance/TRUCK.wheelRadius);
      ctx.drawImage(images.truck,-wheel.x,-wheel.y);
      ctx.restore();
    }
    ctx.restore();
  }
  function pose() {
    const mobile = width <= 680;
    const frameWidth = sceneFrame.width || width;
    const floor = height * .82;
    // Mantém o enquadramento original do giro e sua chegada à porta frontal.
    const scale = Math.max(.001, Math.min((frameWidth - (mobile ? 0 : 32)) / 1600,
      (floor - (mobile ? height * .38 : Math.max(86, height * .10))) / 1070));
    const x = sceneFrame.left + (frameWidth - 1600 * scale) / 2;
    const y = floor - 850 * scale;
    return {
      mobile,
      centerX: (width*.5-x)/scale,
      centerY: (height*.5-y)/scale,
      scale,
      screenX: width*.5,
      screenY: height*.5,
      move: 0,
      cargoY: -120
    };
  }
  function toScreen(point, view) {
    return [view.screenX+(point[0]-view.centerX)*view.scale, view.screenY+(point[1]-view.centerY)*view.scale];
  }
  // Volume fechado: porta, lateral e teto usam os mesmos cantos projetados.
  const BOX={width:1,height:1.063,length:2.49};
  const CAMERA={focal:3485.6244,x:683.7275,y:418.4264,distance:5.9670927,yaw:.6557454,pitch:.1951831,roll:-.0019284};
  const VERTICES=[
    [-.5,BOX.height/2,BOX.length/2],[.5,BOX.height/2,BOX.length/2],
    [.5,-BOX.height/2,BOX.length/2],[-.5,-BOX.height/2,BOX.length/2],
    [-.5,BOX.height/2,-BOX.length/2],[.5,BOX.height/2,-BOX.length/2],
    [-.5,-BOX.height/2,-BOX.length/2]
  ];
  const PHOTO_CORNERS=[[947,218],[1456,166],[1457,848],[947,968],[74,79],[496,50],[77,592]];
  function project3D([x,y,z],turn) {
    const yaw=CAMERA.yaw*(1-turn),pitch=CAMERA.pitch*(1-turn),roll=CAMERA.roll*(1-turn);
    const rx=x*Math.cos(yaw)+z*Math.sin(yaw),rz=-x*Math.sin(yaw)+z*Math.cos(yaw);
    const ry=y*Math.cos(pitch)-rz*Math.sin(pitch),depth=y*Math.sin(pitch)+rz*Math.cos(pitch);
    const px=rx*Math.cos(roll)-ry*Math.sin(roll),py=rx*Math.sin(roll)+ry*Math.cos(roll);
    const perspective=CAMERA.focal/(CAMERA.distance-depth);
    return [CAMERA.x+px*perspective,CAMERA.y-py*perspective];
  }
  const PHOTO_CORRECTION=VERTICES.map((v,i)=>project3D(v,0).map((n,axis)=>PHOTO_CORNERS[i][axis]-n));
  function containerPose(p,view) {
    const turn=smooth(.52,.88,p),focus=smooth(.51,.89,p);
    const photoScale=650/1536*view.scale;
    const [baseX,baseY]=toScreen([825+view.move*.15,view.cargoY],view);
    const neutralScale=CAMERA.focal/(CAMERA.distance-BOX.length/2);
    const destination=doorTarget||{left:baseX,top:baseY,w:650*view.scale,h:650*view.scale};
    const scaleX=lerp(photoScale,destination.w/neutralScale,focus);
    const scaleY=lerp(photoScale,destination.h/(neutralScale*BOX.height),focus);
    const originX=lerp(baseX+CAMERA.x*photoScale,destination.left+destination.w/2,focus);
    const originY=lerp(baseY+CAMERA.y*photoScale,destination.top+destination.h/2,focus);
    const screen=([x,y])=>[originX+(x-CAMERA.x)*scaleX,originY+(y-CAMERA.y)*scaleY];
    const corners=VERTICES.map((v,i)=>screen(project3D(v,turn).map((n,axis)=>n+PHOTO_CORRECTION[i][axis]*(1-turn))));
    // O giro inteiro respeita as margens do cabeçalho. No celular, a câmera
    // também acompanha o centro do volume até o enquadramento frontal.
    const xs=corners.map(v=>v[0]),ys=corners.map(v=>v[1]);
    const minX=Math.min(...xs),maxX=Math.max(...xs);
    const centerX=(minX+maxX)/2,centerY=(Math.min(...ys)+Math.max(...ys))/2;
    const fit=Math.min(1,sceneFrame.width/(maxX-minX));
    let shiftX=view.mobile?(sceneFrame.left+sceneFrame.width/2-centerX)*smooth(.50,.63,p):0;
    const fittedLeft=centerX+(minX-centerX)*fit+shiftX;
    const fittedRight=centerX+(maxX-centerX)*fit+shiftX;
    shiftX+=Math.max(sceneFrame.left-fittedLeft,Math.min(0,sceneFrame.right-fittedRight));
    const frame=([x,y])=>[centerX+(x-centerX)*fit+shiftX,centerY+(y-centerY)*fit];
    return {turn,corners:corners.map(frame),project:point=>frame(screen(project3D(point,turn)))};
  }
  function cargoPose(p,view) {
    // A carga acompanha a carroceria e desacelera gradualmente para o foco.
    // Todos os vértices partem da lateral real da imagem do caminhão.
    const follow = p<=.12 ? p : .12+.04*(1-Math.exp(-(p-.12)/.04));
    const truck = truckPose(p,follow);
    const [a,b,c,d] = TRUCK.cargo;
    const side = [b,b,c,c,a,a,d].map(([x,y])=>[truck.x+x*truck.scale,truck.y+y*truck.scale]);
    const focus = smooth(.12,.52,p);
    const destination = containerPose(p,view);
    return {
      ...destination,
      corners:side.map((point,i)=>point.map((n,axis)=>lerp(n,destination.corners[i][axis],focus)))
    };
  }
  // Homografia por face; a textura acompanha o giro do sólido.
  function projectiveMap(q) {
    const [[x0,y0],[x1,y1],[x2,y2],[x3,y3]] = q;
    const dx1=x1-x2, dx2=x3-x2, dx3=x0-x1+x2-x3;
    const dy1=y1-y2, dy2=y3-y2, dy3=y0-y1+y2-y3;
    const denominator=dx1*dy2-dx2*dy1;
    let g=0, h=0;
    if (Math.abs(denominator)>1e-5) {
      g=(dx3*dy2-dx2*dy3)/denominator;
      h=(dx1*dy3-dx3*dy1)/denominator;
    }
    const a=x1-x0+g*x1, b=x3-x0+h*x3, d=y1-y0+g*y1, e=y3-y0+h*y3;
    return (u,v) => { const k=g*u+h*v+1; return [(a*u+b*v+x0)/k,(d*u+e*v+y0)/k]; };
  }
  function textureTriangle(texture, source, destination) {
    const [[u0,v0],[u1,v1],[u2,v2]]=source;
    const [[x0,y0],[x1,y1],[x2,y2]]=destination;
    const den=u0*(v1-v2)+u1*(v2-v0)+u2*(v0-v1);
    if (Math.abs(den)<1e-10) return;
    const coefficients=(p0,p1,p2)=>[
      (p0*(v1-v2)+p1*(v2-v0)+p2*(v0-v1))/den,
      (p0*(u2-u1)+p1*(u0-u2)+p2*(u1-u0))/den,
      (p0*(u1*v2-u2*v1)+p1*(u2*v0-u0*v2)+p2*(u0*v1-u1*v0))/den
    ];
    const [a,c,e]=coefficients(x0,x1,x2), [b,d,f]=coefficients(y0,y1,y2);
    // Pequena expansão da máscara elimina frestas entre os triângulos.
    const mx=(x0+x1+x2)/3, my=(y0+y1+y2)/3;
    ctx.save(); ctx.beginPath();
    destination.forEach(([x,y],i)=>{
      const len=Math.hypot(x-mx,y-my)||1;
      const xx=x+(x-mx)/len, yy=y+(y-my)/len;
      i ? ctx.lineTo(xx,yy) : ctx.moveTo(xx,yy);
    });
    ctx.closePath(); ctx.clip(); ctx.transform(a,b,c,d,e,f);
    ctx.drawImage(texture,0,0); ctx.restore();
  }
  function drawFace(texture,source,quad,columns,rows) {
    const area=quad.reduce((sum,[x,y],i)=>{const next=quad[(i+1)%4];return sum+x*next[1]-next[0]*y;},0)/2;
    // Faces voltadas para trás deixam de ser desenhadas durante a rotação.
    if(area<.4)return;
    const sourceMap=projectiveMap(source),destinationMap=projectiveMap(quad);
    ctx.save();ctx.beginPath();
    quad.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.clip();
    for(let row=0;row<rows;row++) for(let col=0;col<columns;col++) {
      const a=[col/columns,row/rows],b=[(col+1)/columns,row/rows],c=[(col+1)/columns,(row+1)/rows],d=[col/columns,(row+1)/rows];
      textureTriangle(texture,[sourceMap(...a),sourceMap(...b),sourceMap(...c)],[destinationMap(...a),destinationMap(...b),destinationMap(...c)]);
      textureTriangle(texture,[sourceMap(...a),sourceMap(...c),sourceMap(...d)],[destinationMap(...a),destinationMap(...c),destinationMap(...d)]);
    }
    ctx.restore();
  }
  function drawContainer(body,mobile) {
    const face=indices=>indices.map(i=>body.corners[i]);
    const photo=indices=>indices.map(i=>PHOTO_CORNERS[i]);
    const n=mobile?5:8;
    drawFace(images.truck,TRUCK.cargo,face([4,0,3,6]),n,4);
    drawFace(images.cargo,photo([4,5,1,0]),face([4,5,1,0]),n,3);
    drawFace(images.door,[[0,0],[1254,0],[1254,1254],[0,1254]],face([0,1,2,3]),n,n);
  }
  function updateDOM(p) {
    const full=smooth(.025,.20,p);
    opacity(intro,1-smooth(.02,.11,p));
    intro.style.transform=`translate3d(0,${-30*full}px,0)`;
    topLine.style.transform=`translate3d(0,${-88*full}px,0)`;
    const chapterEnd = width <= 680 ? [.50,.59] : [.63,.73];
    opacity(chapter,smooth(.16,.24,p)*(1-smooth(...chapterEnd,p)));
    const phase=p<.40?0:p<.86?1:2;
    if(phase!==previousPhase) {
      previousPhase=phase; stage.dataset.phase=String(phase);
      select('chapter-number').textContent=phase===0?'01 / TRANSPORTE':'02 / CONTÊINER';
      select('chapter-title').innerHTML=phase===0?'O caminhão segue.<br>A leitura começa.':'Contêiner em foco.<br>Pronto para identificar.';
      select('chapter-description').textContent='A câmera registra a área de identificação.';
      select('story-view-label').textContent=['01 — TRANSPORTE','02 — CONTÊINER','03 — IDENTIFICAÇÃO'][phase];
      document.querySelectorAll('[data-story-to]').forEach((button,i)=>{
        button.classList.toggle('active',i===phase);
        if(i===phase)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
      });
    }
    opacity(door,smooth(.89,.93,p));
    opacity(results,smooth(.86,.94,p));
    results.style.transform=`translate3d(0,${12*(1-smooth(.86,.94,p))}px,0)`;
    stage.classList.toggle('door-ready',p>.93);
    select('story-progress').style.transform=`scaleX(${p})`;
    stage.dataset.progress=p.toFixed(3);
  }
  function render(time=performance.now()) {
    frame=0;
    const dt=lastTime?Math.min(40,time-lastTime):16; lastTime=time;
    current=reduce.matches?target:lerp(current,target,1-Math.exp(-dt/65));
    if(Math.abs(target-current)<.00005)current=target;
    const p=reduce.matches?(current<.40?0:current<.86?.65:.96):current;
    updateDOM(p);
    ctx.clearRect(0,0,width,height);
    if(ready) {
      if(p<.40)drawTruck(p);
      if(p<.935) {
        const view=pose(),body=cargoPose(p,view);
        drawContainer(body,view.mobile);
      }
    }
    if(current!==target)frame=requestAnimationFrame(render); else lastTime=0;
  }
  function requestRender() { if(!frame)frame=requestAnimationFrame(render); }
  function readScroll() {
    const rect=story.getBoundingClientRect();
    target=clamp(-rect.top/Math.max(1,story.offsetHeight-stage.offsetHeight));
    requestRender();
  }
  function resize() {
    width=stage.clientWidth; height=stage.clientHeight;
    const dpr=Math.min(window.devicePixelRatio||1,1.7);
    canvas.width=Math.round(width*dpr); canvas.height=Math.round(height*dpr);
    canvas.style.width=width+'px'; canvas.style.height=height+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const r=door.getBoundingClientRect(), s=stage.getBoundingClientRect();
    const header=document.querySelector('.header').getBoundingClientRect();
    sceneFrame={left:header.left-s.left,right:header.right-s.left,width:header.width,introBottom:intro.offsetTop+intro.offsetHeight};
    doorTarget={left:r.left-s.left,top:r.top-s.top,w:r.width,h:r.height};
    readScroll();
  }
  function goTo(value) {
    const top=window.scrollY+story.getBoundingClientRect().top;
    const span=story.offsetHeight-stage.offsetHeight;
    window.scrollTo({top:top+span*value,behavior:reduce.matches?'instant':'smooth'});
  }
  document.querySelectorAll('[data-story-to]').forEach(button=>button.addEventListener('click',()=>goTo(Number(button.dataset.storyTo))));
  document.querySelector('.story-start').addEventListener('click',event=>{event.preventDefault();goTo(.27);});
  window.addEventListener('scroll',readScroll,{passive:true});
  window.addEventListener('resize',resize,{passive:true});
  reduce.addEventListener('change',resize);
  document.fonts.ready.then(resize);
  Promise.all(Object.entries(sources).map(([key,src])=>new Promise((resolve,reject)=>{
    const image=new Image(); image.onload=()=>{images[key]=image;resolve();}; image.onerror=reject; image.src=src;
  }))).then(()=>{
    ready=true;select('scene-loading').hidden=true;stage.classList.add('assets-ready');resize();
  }).catch(()=>{
    select('scene-loading').textContent='Não foi possível carregar a sequência. Recarregue a página.';
    stage.classList.add('asset-error');
  });
  resize();
})();
