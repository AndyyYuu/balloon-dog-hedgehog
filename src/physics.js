
/* One player owns every action; the dog responds to air, tether and momentum. */
const down=new Set(),just=new Set(),heldSources=new Map();
function setHeld(code,source,on){
 let sources=heldSources.get(code);if(!sources){sources=new Set();heldSources.set(code,sources);}
 if(on){if(!sources.size)just.add(code);sources.add(source);down.add(code);}else{sources.delete(source);if(!sources.size){down.delete(code);heldSources.delete(code);}}
}
function clearHeld(){down.clear();just.clear();heldSources.clear();document.querySelectorAll('.touch .active').forEach(b=>b.classList.remove('active'));}
const held=(...keys)=>keys.some(k=>down.has(k));
const pressed=(...keys)=>keys.some(k=>just.has(k));
function start(){started=true;paused=false;document.getElementById('pauseBtn').textContent='暂停 P';startEl.hidden=true;pauseEl.hidden=true;initAudio();stageEl.focus({preventScroll:true});}
function togglePause(force){if(!started||win)return;paused=force??!paused;clearHeld();pauseEl.hidden=!paused;document.getElementById('pauseBtn').textContent=paused?'继续 P':'暂停 P';setJet(false);if(!paused){initAudio();stageEl.focus({preventScroll:true});}}
function toggleSound(){muted=!muted;if(ac&&master)master.gain.value=muted?0:.32;document.getElementById('soundBtn').textContent=muted?'声音 关':'声音 开';document.getElementById('soundBtn').setAttribute('aria-pressed',String(!muted));}
const gameKeys=['KeyA','KeyD','KeyW','KeyS','KeyE','KeyF','Space','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','ShiftLeft','ShiftRight','Slash','NumpadDivide','Digit0','Numpad0'];
addEventListener('keydown',e=>{
 const k=e.code;if(gameKeys.includes(k))e.preventDefault();
 if(k==='KeyP'||k==='Escape'){if(!e.repeat)togglePause();return;}
 if(k==='KeyM'){if(!e.repeat)toggleSound();return;}
 if(k==='KeyR'&&started){reset(true);return;}
 const m=k.match(/^Digit([1-9])$/);if(m){loadLevel(+m[1]-1);start();return;}if(k==='BracketRight'){loadLevel(nextRoomIndex());start();return;}if(k==='BracketLeft'){loadLevel((idx+LEVELS.length-1)%LEVELS.length);start();return;}
 if(win&&(k==='Enter'||k==='NumpadEnter')){loadLevel(nextRoomIndex());start();return;}
 if(!gameKeys.includes(k)||paused||win)return;
 if(!started)start();initAudio();setPlayerHeld(k,'keyboard',true);
});
addEventListener('keyup',e=>setPlayerHeld(e.code,'keyboard',false));
addEventListener('blur',()=>{clearHeld();if(started&&!win)togglePause(true);});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&started&&!win)togglePause(true);});
document.getElementById('startBtn').addEventListener('click',()=>{loadLevel(16);start();});
document.getElementById('resumeBtn').addEventListener('click',()=>togglePause(false));
document.getElementById('pauseBtn').addEventListener('click',()=>togglePause());
document.getElementById('restartBtn').addEventListener('click',()=>{reset(true);start();});
document.getElementById('soundBtn').addEventListener('click',()=>{initAudio();toggleSound();});
document.getElementById('nextBtn').addEventListener('click',()=>{loadLevel(nextRoomIndex());start();});
stageEl.addEventListener('click',e=>{if(e.target===cv){if(!started)start();else stageEl.focus({preventScroll:true});}});
LEVELS.forEach((l,i)=>{const b=document.createElement('button');b.type='button';b.id='lv'+(i+1);b.textContent=l.practice?`练习 ${i-15}  ${l.name}`:`${String(i+1).padStart(2,'0')} ${l.name}`;b.title=l.name;b.addEventListener('click',()=>{loadLevel(i);closeLevelPanel();start();});levelsEl.appendChild(b);});
document.querySelectorAll('[data-code]').forEach(b=>{
 b.addEventListener('pointerdown',e=>{e.preventDefault();if(win)return;if(!started)start();if(paused)togglePause(false);b.setPointerCapture(e.pointerId);setPlayerHeld(b.dataset.code,e.pointerId,true);b.classList.add('active');});
 const release=e=>{setPlayerHeld(b.dataset.code,e.pointerId,false);b.classList.remove('active');};b.addEventListener('pointerup',release);b.addEventListener('pointercancel',release);b.addEventListener('lostpointercapture',release);
});
function addText(x,y,txt,col,size=20){texts.push({x,y,txt,col,size,life:1.1});}
function puff(x,y,n,col){for(let i=0;i<n;i++)parts.push({x,y,vx:(Math.random()-.5)*120,vy:-40-Math.random()*80,life:.5+Math.random()*.3,max:.8,col,sz:3+Math.random()*4,rot:0,vr:0,round:true});}
function confetti(x,y,n,cols,spread){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=100+Math.random()*280;parts.push({x:x+(Math.random()-.5)*spread,y:y+(Math.random()-.5)*spread,vx:Math.cos(a)*v,vy:Math.sin(a)*v-120,life:.7+Math.random()*.5,max:1.3,col:cols[i%cols.length],sz:3+Math.random()*4,rot:Math.random()*6,vr:(Math.random()-.5)*20});}}
function resolve(b,hw,hh,isHog){
 for(const s of solids){
  if(s.bwall&&!s.alive)continue;
  const dx=b.x-(s.x+s.w/2),dy=b.y-(s.y+s.h/2),ox=hw+s.w/2-Math.abs(dx),oy=hh+s.h/2-Math.abs(dy);
  if(ox<=0||oy<=0)continue;
  if(oy<ox){
   if(dy<0){const speed=b.vy;b.y-=oy;if(b.vy>0)b.vy=0;b.ground=true;
    if(speed>240){if(isHog){hog.squash=.25;sThud();if(hog.ball&&speed>360){b.vy=-Math.min(speed*.26,230);b.ground=false;}}else if(dog.state==='ok')dog.squash=.2;}
   }else{b.y+=oy;if(b.vy<0)b.vy=0;}
  }else{
   if(s.bwall&&isHog&&(hog.ball||hog.jet)&&Math.abs(b.vx)>(s.heavy?115:155)&&(!s.heavy||(hog.bloat||0)>.65)){breakWall(s);b.vx*=.88;continue;}
   b.x+=dx<0?-ox:ox;
   if(isHog&&hog.ball){if(Math.abs(b.vx)>140)sBonk();b.vx=-b.vx*.42;}else b.vx=0;
  }
 }
}
function breakWall(s){s.alive=false;needRebuild=true;stats.breaks++;shake=Math.max(shake,.2);confetti(s.x+s.w/2,Math.max(s.y+s.h*.7,hog.y-35),28,['#76aacc','#e3b856','#78a98b','#ad92b5'],s.w);addText(s.x+s.w/2,hog.y-48,hog.jet?'喷气冲开了！':'滚得漂亮！','#9a6c42',20);[0,60,120].forEach(t=>setTimeout(sSmallPop,t));}
function setAir(next){
 if(dog.state!=='ok')return;
 const before=dog.air,oldY=dog.y,oldFlat=isFlat(),oldR=oldFlat?7:rr(before);dog.air=Math.max(0,next);
 const newFlat=isFlat(),newR=newFlat?7:rr(dog.air);
 // Preserve the feet on the ground, and when unfolding the flat skin.
 if(dog.ground||oldFlat!==newFlat)dog.y-=newR-oldR;
 if(dog.air>before){const [hw,hh]=dogDims();if(overlapAny(dog.x,dog.y,hw,hh)){dog.air=before;dog.y=oldY;dog.blocked=.25;return;}}
 if(oldFlat!==newFlat){if(newFlat){sFlat();addText(dog.x,dog.y-25,'扁扁的，也能走',DOGC,15);}else sSqueak();}
 dog.flatPrev=newFlat;dog.lastR=newR;
}
function pop(reason){
 if(dog.state!=='ok')return;const r=isFlat()?7:rr(dog.air);dog.state='skin';stats[reason]++;hit=.09;shake=.27;hog.revive=0;hog.jet=false;hog.jetGlow=0;sPop();setJet(false);
 confetti(dog.x,dog.y,24,[DOGC,DOGC,'#fffaf5'],r);
 const label={hog:'碰到刺猬的刺了',over:'充太满，撑爆了',spike:'碰到尖刺了',cactus:'碰到仙人掌了',cat:'被猫抓到了'}[reason];dog.lastPop=label;addText(dog.x,dog.y-r-15,'啪！',DOGC,30);addText(dog.x,dog.y-r+12,label,'#6e594b',15);
 dog.y+=r-6;dog.vx*=.5;dog.vy=0;dog.air=0;dog.rot=0;
}
function revive(){
 dog.state='ok';dog.lastPop='';dog.air=0;dog.inv=1.7;hog.revive=0;dog.y-=1;dog.flatPrev=true;dog.lastR=7;setAir(.12);sSqueak();addText(dog.x,dog.y-34,'又能一起走了',DOGC,17);
}
function dogHitsRect(rx,ry,rw,rh,body=dogCollisionCapsules()){const b=body.bounds;if(b.right<=rx||b.left>=rx+rw||b.bottom<=ry||b.top>=ry+rh)return false;return body.some(p=>capsuleHitsTriangle(p,[{x:rx,y:ry},{x:rx+rw,y:ry},{x:rx,y:ry+rh}])||capsuleHitsTriangle(p,[{x:rx+rw,y:ry},{x:rx+rw,y:ry+rh},{x:rx,y:ry+rh}]));}
function hogHitsRect(x,y,w,h){const r=(hog.ball?15:17)*hogScale(),cx=clamp(hog.x,x,x+w),cy=clamp(hog.y,y,y+h);return Math.hypot(hog.x-cx,hog.y-cy)<r;}
function hogHitsCactus(k){return hogHitsRect(k.x-18,k.base-k.h,36,k.h);}
function hurtHog(reason){if(hurt>0)return;stats[reason]++;hurt=.55;hurtReason=reason;shake=.35;hog.jet=false;hog.jetGlow=0;clearHeld();setJet(false);sBonk();puff(hog.x,hog.y,12,'#d6a26a');syncHUD();}
function fanOn(f){return f.rule?powered(f.rule):f.switch===undefined||switches[f.switch].on;}
function pressSwitch(p){if(p.latched||(p.requires&&!p.requires.every(powered)))return;p.on=true;p.latched=true;needRebuild=true;sGrab();sThud();confetti(p.x+p.w/2,p.y-15,16,['#cfaa67','#7aa99c','#e6cb98'],p.w);addText(p.x+p.w/2,p.y-55,'接过来了！','#8e774b',20);}
function update(dt){
 prepareCompanion(dt);
 if(L.memo){updateMemo(dt);return;}
 if(hurt>0){hurt-=dt;if(hurt<=0){const txt=hurtReason==='thorn'?'她也怕刺，要让小狗把她吊高再过':hurtReason==='timeout'?'接力超时，重新安排两位的位置':'回到蓝旗，再试一次';reset(false);addText(cameraX+W*.5,215,txt,'#9b7252',19);}return;}
 time+=dt;banner=Math.max(0,banner-dt);dog.blocked=Math.max(0,dog.blocked-dt);dog.inv=Math.max(0,dog.inv-dt);
 noticeTime=Math.max(0,noticeTime-dt);
 if(pressed('KeyE')){ropeShort=!ropeShort;sGrab();}
 if(pressed('Slash','NumpadDivide'))interact();if(pressed('KeyF'))say('F 只操作附近物品；W 给狗气，Shift 滚压铜色机关。');
 updateTransfer(dt);updateDogTask(dt);
 const move=(held('ArrowRight')?1:0)-(held('ArrowLeft')?1:0),ix=move,dogIx=(held('KeyD')?1:0)-(held('KeyA')?1:0),inflate=held('KeyW'),deflate=held('KeyS');
 const shiftHeld=held('ShiftLeft','ShiftRight'),wasJet=hog.jet;
 const wantBall=shiftHeld&&hog.ground;
 if(wantBall&&!hog.ball){hog.ball=true;hog.y+=2*hogScale();sCurl();}
 else if(!wantBall&&hog.ball&&!overlapAny(hog.x,hog.y-2*hogScale(),15*hogScale(),15*hogScale())){hog.ball=false;hog.y-=2*hogScale();}
 if(ix)hog.face=ix;
 if(hog.ground)hog.coyote=.1;else hog.coyote-=dt;
 if(pressed('ArrowUp'))hog.jbuf=.12;else hog.jbuf-=dt;
 if(hog.jbuf>0&&hog.coyote>0){hog.vy=(hog.ball?-330:-430)/(1+(hog.bloat||0)*.55);hog.jbuf=0;hog.coyote=0;hog.ground=false;hog.squash=-.18;sHop();}
 // Shift changes role at takeoff. Keep a forced crouch only inside a low tunnel.
 if(!hog.ground&&hog.ball&&!overlapAny(hog.x,hog.y-2*hogScale(),15*hogScale(),15*hogScale())){hog.ball=false;hog.y-=2*hogScale();}
 const jetRequested=shiftHeld&&!hog.ground;
 hog.jet=jetRequested&&dog.state==='ok'&&dog.air>.08;hog.jetEmpty=jetRequested&&!hog.jet;hog.jetDir=ix||hog.face;
 const hmax=(hog.ball?395:210)/(1+(hog.bloat||0)*.65),hacc=hog.ball?(hog.ground?(ix?1150:180):(ix?600:65)):(hog.ground?(ix?2600:3000):(ix?1350:650));
 hog.vx=approach(hog.vx,hog.jet?hog.jetDir*440/(1+(hog.bloat||0)):ix*hmax,(hog.jet?1800:hacc)*dt);
 hog.vy+=G*dt;
 if(!(held('ArrowUp'))&&hog.vy<0&&!hog.taut)hog.vy+=G*.8*dt;
 for(const f of fans)if(fanOn(f)&&inRect(hog.x,hog.y,f)){const q=hog.ball?.035:.12;hog.vx+=f.dx*f.p*q*dt;hog.vy+=f.dy*f.p*q*dt;}
 hog.vy=clamp(hog.vy,-380,850);hog.squash*=Math.exp(-10*dt);hog.spin+=hog.vx*dt/13;if(hog.ground&&ix)hog.bob+=dt*18;
 hog.ground=false;hog.x+=hog.vx*dt;hog.y+=hog.vy*dt;const hh=hogHalf();resolve(hog,hh,hh,true);
 if(hog.ground){hog.jet=false;hog.jetEmpty=false;}
 for(const p of switches)if(p.type==='hogRoll'&&!p.latched&&hog.ground&&hog.ball&&Math.abs(hog.vx)>140&&hog.x>p.x-3&&hog.x<p.x+p.w+3&&Math.abs(hog.y+hh-p.y)<5)pressSwitch(p);
 hog.blow=inflate&&!deflate;
 if(dog.state==='ok'){
  if(inflate&&!deflate)setAir(dog.air+.23*dt);
  if(deflate&&!hog.returnAir)setAir(dog.air-.50*dt);
  if(hog.jet)setAir(dog.air-.06*dt);
  for(const z of heat)if(inRect(dog.x,dog.y,z))setAir(dog.air+z.k*dt);
  setAir(dog.air-(L.leak??.003)*dt);
  if(dog.air>1){pop('over');}
 }else if(inflate&&!deflate){hog.revive+=dt;if(hog.revive>.85)revive();}else hog.revive=Math.max(0,hog.revive-dt*1.5);
 pumpClock-=dt;
 if(inflate&&!deflate&&pumpClock<=0){pumpClock=.32;noise(.12,.12,'bandpass',600,1200);const a=anchor();puff(a.x,a.y,2,'#fffaf5');}
 hog.jet=hog.jet&&dog.state==='ok'&&dog.air>.08;
 hog.jetGlow=hog.jet?1:Math.max(0,hog.jetGlow-dt*8);
 if(hog.jet&&!wasJet)noise(.1,.12,'bandpass',650,1600);
 hog.jetClock-=dt;
 if(hog.jet&&hog.jetClock<=0){hog.jetClock=.025;for(let i=0;i<2;i++)parts.push({x:hog.x-hog.jetDir*22,y:hog.y+3+(Math.random()-.5)*5,vx:-hog.jetDir*(130+Math.random()*110)+hog.vx*.2,vy:(Math.random()-.5)*35,life:.2+Math.random()*.1,max:.3,col:i?'#d6edf2':'#fff5db',sz:3+Math.random()*3,rot:0,vr:0,round:true});}
 setJet(hog.jet||(deflate&&dog.state==='ok'&&dog.air>.02));
 // The dog trails the walker; above the floating threshold it moves overhead.
 const flying=dog.state==='ok'&&dog.air>.38;
 const overhead=clamp((hog.y-dog.y-(dog.vy>15?150:55))/65,0,1);
 const targetX=hog.x-hog.face*(90-56*overhead),spring=flying?5.5:8;
 if(pressed('Space')&&dog.ground){dog.vy=-350;dog.ground=false;}
 if(dogIx){dog.face=dogIx;dog.vx=approach(dog.vx,dogIx*200,1500*dt);dog.task=null;dog.taskTarget=null;}
 else if(dog.taskTarget){const q=dog.taskTarget;dog.face=q.x>=dog.x?1:-1;dog.vx=approach(dog.vx,clamp((q.x-dog.x)*3,-185,185),1000*dt);}
 else dog.vx+=clamp((targetX-dog.x)*spring-dog.vx*2.8,-1000,1000)*dt;
 dog.vx=clamp(dog.vx,-440,440);
 // Brake the follower's own approach near a grounded player. The player can
 // still jump or turn into it; simply stopping must not cause an auto-pop.
 if((hog.ground||(hog.vy>=0&&dog.vy>hog.vy))&&dog.state==='ok'){
  const sx=dog.x-hog.x,sy=dog.y-hog.y,safeRadius=(isFlat()?28:rr(dog.air)*.83)+32*hogScale(),clearance=Math.sqrt(Math.max(0,safeRadius*safeRadius-sy*sy));
  if(Math.abs(sy)<safeRadius&&sx<0&&dog.vx>hog.vx)dog.vx=Math.min(dog.vx,hog.vx+Math.max(0,(-sx-clearance)*5));
  else if(Math.abs(sy)<safeRadius&&sx>0&&dog.vx<hog.vx)dog.vx=Math.max(dog.vx,hog.vx-Math.max(0,(sx-clearance)*5));
  if(sy<0&&dog.vy>hog.vy&&Math.abs(sx)<safeRadius){const verticalClearance=Math.sqrt(safeRadius*safeRadius-sx*sx);dog.vy=Math.min(dog.vy,Math.max(0,hog.vy)+Math.max(0,(-sy-verticalClearance)*5));}
 }
 let ay=G;
 if(dog.state==='ok'&&!isFlat())ay=G*(1-K*dog.air);
 dog.vy+=ay*dt;dog.vy*=Math.exp(-(dog.state==='ok'&&!isFlat()?2.7:.15)*dt);
 for(const f of fans)if(fanOn(f)&&dog.state==='ok'&&inRect(dog.x,dog.y,f)){
  if(f.ductY!==undefined){dog.vy=approach(dog.vy,clamp((f.ductY-dog.y)*5,-180,180),2200*dt);dog.vx+=f.dx*f.p*.3*dt;}
  else if(!isFlat()){const q=f.p*(.4+dog.air)*dt;dog.vx+=f.dx*q;dog.vy+=f.dy*q;}
 }
 if(dog.taskTarget&&dog.air>.34&&!dog.docked){const q=dog.taskTarget;dog.vy=approach(dog.vy,clamp((q.y-dog.y)*3,-180,180),1500*dt);}
 dog.vy=clamp(dog.vy,-285,850);dog.rot=approach(dog.rot,clamp(dog.vx*.0006,-.18,.18),dt);dog.squash*=Math.exp(-10*dt);
 const dock=device(dog.docked);
 if(dock&&dog.state==='ok'){dog.x=dock.x;dog.y=dock.y;dog.vx=dog.vy=0;dog.ground=false;}
 else{dog.ground=false;dog.x+=dog.vx*dt;dog.y+=dog.vy*dt;const [hw,dh]=dogDims();resolve(dog,hw,dh,false);}
 const safeLen=112,prevLen=ropeLen;
 ropeLen=approach(ropeLen,held('Digit0','Numpad0')?85:ropeShort?safeLen:ROPE,210*dt);hog.reel=ropeShort&&ropeLen<prevLen;
 // Iterate the tether with scenery collisions to prevent pulling through walls.
 hog.taut=false;
 for(let i=0;i<5;i++){
  const a=anchor(),route=ropeRoute(a,{x:hog.x,y:hog.y-10}),d=pathLength(route);
  if(d>ropeLen-2)hog.taut=true;if(d<=ropeLen||d<.001)break;
  const q=route[1],p=route[route.length-2],dn=Math.hypot(q.x-a.x,q.y-a.y)||1,hn=Math.hypot(p.x-hog.x,p.y-(hog.y-10))||1;
  const nx=(q.x-a.x)/dn,ny=(q.y-a.y)/dn,hx=(p.x-hog.x)/hn,hy=(p.y-(hog.y-10))/hn;
  const wd=dock?0:(dog.state==='ok'?1:1.6),wh=1/(MH*(1+(hog.bloat||0)*4)),corr=Math.min(d-ropeLen,25)/(wd+wh);
  dog.x+=nx*corr*wd;dog.y+=ny*corr*wd;hog.x+=hx*corr*wh;hog.y+=hy*corr*wh;
  const vr=-dog.vx*nx-dog.vy*ny-hog.vx*hx-hog.vy*hy;
  if(vr>0){const j=vr/(wd+wh);dog.vx+=nx*j*wd;dog.vy+=ny*j*wd;hog.vx+=hx*j*wh;hog.vy+=hy*j*wh;}
  const [dw,dh]=dogDims();if(!dock)resolve(dog,dw,dh,false);resolve(hog,hh,hh,true);
 }
 if(L.softSky&&dog.state==='ok'&&!isFlat()&&dog.y-rr(dog.air)<NAILS){dog.y=NAILS+rr(dog.air);dog.vy=Math.max(0,dog.vy);}
 if(cacti.some(hogHitsCactus)||hogTouchesSpikes()){hurtHog('thorn');return;}
 if(dog.state==='ok'){
  const hR=(hog.ball?16:19)*hogScale();
  const damageBody=dogCollisionCapsules();
  if(isFlat()){const cx=clamp(hog.x,dog.x-28,dog.x+28),cy=clamp(hog.y,dog.y-7,dog.y+7);dog.near=Math.hypot(hog.x-cx,hog.y-cy)-hR;}
  else dog.near=Math.hypot(dog.x-hog.x,dog.y-hog.y)-(rr(dog.air)*.83+hR);
  if(dog.near<0&&dog.inv<=0)pop('hog');
  else if(dogTouchesSpikes(damageBody))pop('spike');
  else for(const k of cacti)if(dogHitsRect(k.x-18,k.base-k.h,36,k.h,damageBody)){pop('cactus');break;}
 }
 updateDevices(dt);if(needRebuild)rebuildSolids();
 L.checkpoints.forEach((cp,i)=>{if((!checkpoint||i>checkpoint.index)&&(!cp.requires||cp.requires.every(powered))&&!dog.docked&&hog.ground&&hog.x>=cp.x&&dog.state==='ok'&&dog.x>cp.dogX-35){checkpoint={index:i,walls:walls.map(w=>w.alive),switches:switches.map(s=>s.latched),charges:charges.map(p=>p.done)};sGrab();addText(cp.x,groundAt(cp.x)-55,'在这里等你','#61969e',17);}});
 if(hog.y>H+55||dog.y>H+70){sFall();hurtHog('fall');return;}
 const g=L.goal;
 const arrived=g.pair?(!!charges.find(p=>p.id===g.pair)?.done&&(!g.requires||g.requires.every(powered))):(hog.ground&&hog.x>=g.x&&hog.x<=g.x+g.w+16&&hog.y>g.y&&hog.y<g.y+g.h&&dog.x>g.x-115&&(!g.requires||g.requires.every(powered)));
 if(!win&&dog.state==='ok'&&arrived&&walls.every(w=>!w.alive)){
  win=true;clearHeld();setJet(false);sWin();syncHUD();rememberCompletion();
  winTitle.textContent=idx===LEVELS.length-1?'我们一起走完了！':'一起到了！';
  const pops=stats.hog+stats.over+stats.spike+stats.cactus;
  winBody.innerHTML=`第 ${idx+1} 关 · ${L.name}<br>${time.toFixed(1)} 秒 · 狗行动 ${stats.commands} 次<br>小狗爆掉 ${pops} 次 · 接力超时 ${stats.timeout} 次<br>一个人，也把两位都照顾到了。`;
  document.getElementById('nextBtn').textContent=idx===LEVELS.length-1?'再走一遍 ↻':'下一关 →';winNext.textContent=idx===LEVELS.length-1?'选择关卡继续冒险 · R 再试这一关':'Enter 下一关 · R 再试一次';winEl.hidden=false;
 }
 hudClock+=dt;if(hudClock>.1){syncHUD();hudClock=0;}
 updateExperience(dt);
 const camTarget=clamp((activeRole==='hog'?hog.x*.7+dog.x*.3:dog.x*.7+hog.x*.3)-W*.38,0,L.width-W);cameraX=approach(cameraX,camTarget,Math.max(90,Math.abs(camTarget-cameraX)*7)*dt);
}
function syncHUD(){
 if(L?.memo&&memo){syncMemoHUD();return;}
 airMeter.value=dog.state==='ok'?clamp(dog.air,0,1):0;airText.textContent=`${Math.round(airMeter.value*100)}%`;
 stateText.textContent=win?'两位都到了！':hurt>0?'回蓝旗，重新接应':dog.state==='skin'?`${dog.lastPop} · W 吹回来`:noticeTime>0?interactNotice:hog.backflow?'倒灌中：狗变小，刺猬变大':hog.returnAir?'把气还给狗：刺猬缩小':dog.docked?`狗留在 ${device(dog.docked)?.letter} · / 叫回来`:dog.task?'狗正在行动 · W/S 调气量 · / 取消':hog.jet?'喷气中 · W 补气':hog.bloat>.05?`刺猬体型 ${Math.round(hog.bloat*100)}% · S 还气`:'A/D 控制刺猬 · 狗自动跟随 · ↓ 倒灌气';
 saveText.textContent=`${ropeShort?'短绳':'长绳'} · ${devicesSummary()}`;syncExperience();
}
function effects(dt){for(const p of parts){p.vy+=(p.round?-30:600)*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;p.rot+=p.vr*dt;}parts=parts.filter(p=>p.life>0);for(const t of texts){t.y-=26*dt;t.life-=dt;}texts=texts.filter(t=>t.life>0);shake=Math.max(0,shake-dt);}

document.getElementById('memoChapter').addEventListener('click',()=>selectChapter('memo'));
document.getElementById('classicChapter').addEventListener('click',()=>selectChapter('classic'));
