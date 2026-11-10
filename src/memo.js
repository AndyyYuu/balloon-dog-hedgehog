// Design-memo chapter: finite air, two independent actors, material interactions.
let memo=null;
const memoOn=()=>!!L?.memo;
const memoObj=id=>memo?.objects.find(p=>p.id===id);
function initMemo(){
 memo=null;if(!memoOn())return;
 memo={level:idx,apples:(L.apples||[]).map(p=>({...p,vy:0,ignore:0})),stack:0,objects:(L.objects||[]).map(p=>({...p,done:false,progress:0})),cats:(L.cats||[]).map(p=>({...p,vx:0,alert:0,awake:false,flee:0})),water:L.water?{...L.water,frozen:false,freeze:0,plugged:false}:null,rail:L.rail?{...L.rail,done:false}:null,keys:0,noise:0,work:null,slashContext:false,slashClock:0,pigContext:false};
 dog.gas=L.dogGas??.15;hog.gas=Math.max(0,L.budget-dog.gas);dog.temp=1;dog.air=dog.gas;hog.bloat=clamp((hog.gas-.16)/.64,0,1);dog.riding=false;dog.seatOptOut=false;dog.cling=null;dog.charge=0;
 dog.x=L.dogX;dog.y=L.dogY??((L.world==='bath'?500:460)-rr(dog.air));hog.x=L.hogX;hog.y=L.hogY??((L.world==='bath'?500:460)-hogHalf());
 dog.ground=hog.ground=true;ropeLen=L.rail?.long??300;ropeShort=false;
 Object.assign(stats,{apples:0,scares:0,cat:0,rail:0,spent:0});rebuildSolids();
}
function memoExtraSolids(){
 if(!memoOn()||memo?.level!==idx)return[];const a=[];
 if(memo.water?.frozen)a.push({x:memo.water.x,y:memo.water.y,w:memo.water.w,h:12,ice:true});
 for(const p of memo.objects)if(p.type==='cage'&&!p.done)a.push({x:p.x-15,y:355,w:10,h:105,cage:true});
 return a;
}
function memoTotalAir(){return memoOn()?dog.gas+hog.gas:dog.air+(hog.bloat||0)/1.8;}
function memoHogMass(){return MH*(1-.58*(hog.bloat||0))+.2*(memo?.stack||0);}
function memoSeatY(){return hog.y-17*hogScale()-22*(memo?.stack||0);}
function leaveAppleSeat(vx=0){dog.riding=false;dog.seatOptOut=true;dog.seatCooldown=.65;dog.vx=vx;dog.vy=-180;dog.inv=.3;memo.work=null;}
function autoAppleSeat(dx,dt){
 dog.seatCooldown=Math.max(0,(dog.seatCooldown||0)-dt);
 if(dog.riding){if(!dx)dog.seatInputReleased=true;return;}
 if(dog.seatOptOut||!memo.stack||!hog.ground||hog.ball||dog.state!=='ok'||dog.cling||dog.seatCooldown>0||dog.air>=.29||pressed('Space'))return;
 if(Math.abs(dog.x-hog.x)>86||dog.y<memoSeatY()-80||dog.y>hog.y+30||Math.abs(dog.vy)>210)return;
 const [hw,hh]=dogDims(),seatY=memoSeatY()-hh;if(overlapAny(hog.x,seatY,hw,hh))return;
 dog.seatOptOut=false;dog.riding=true;dog.x=hog.x;dog.y=seatY;dog.vx=dog.vy=0;dog.ground=true;dog.inv=.2;dog.seatInputReleased=!dx;
 say('狗坐好了。现在用 → 慢慢驮它走；/ 让狗下座。');
}
function dropApples(){
 if(!memo?.stack)return;for(let i=0;i<memo.stack;i++)memo.apples.push({x:hog.x+(i-(memo.stack-1)/2)*25,y:memoSeatY()+i*16,vy:-100,ignore:.6});memo.stack=0;dog.riding=false;memo.work=null;say('苹果掉了，座位也没了！');
}
function nearestCling(){let best=null;for(let j=0;j<(L.clingPaths||[]).length;j++){const path=L.clingPaths[j];let dist=0;for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),t=clamp(((dog.x-a.x)*dx+(dog.y-a.y)*dy)/(len*len),0,1),x=a.x+dx*t,y=a.y+dy*t,d=Math.hypot(dog.x-x,dog.y-y);if(!best||d<best.d)best={j,s:dist+len*t,d};dist+=len;}}return best;}
function clingPoint(j,s){const path=L.clingPaths[j];for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],len=Math.hypot(b.x-a.x,b.y-a.y);if(s<=len)return{x:a.x+(b.x-a.x)*s/len,y:a.y+(b.y-a.y)*s/len};s-=len;}return path[path.length-1];}
function clingLength(j){const p=L.clingPaths[j];return p.slice(1).reduce((n,q,i)=>n+Math.hypot(q.x-p[i].x,q.y-p[i].y),0);}
function memoDogAction(){
 memo.slashClock=0;memo.slashContext=true;
 const work=memo.objects.find(p=>p.type==='lamp'&&!p.done&&Math.hypot(p.x-dog.x,p.y-dog.y)<75);
 if(work){memo.work=work.id;say('狗按住 / 作业；刺猬必须停稳，苹果座位要够高。');return;}
 if(dog.riding){leaveAppleSeat(-hog.face*180);say('狗下来了。小狗会在地面跟随；再按 / 可以重新上座。');return;}
 if(dog.seatOptOut&&memo.stack){dog.seatOptOut=false;say('小狗准备重新上座，停稳等它靠近。');return;}
 if(dog.cling){dog.cling=null;dog.inv=.2;say('松开静电，重新受风和重力影响。');return;}
 const cling=nearestCling();if(dog.air<.16&&dog.charge>.08&&cling&&cling.d<60){dog.cling={path:cling.j,s:cling.s};dog.riding=false;dog.vx=dog.vy=0;say('贴住了。小狗会自己往上爬，/ 让它松开；电量会减少。');return;}
 memo.slashContext=false;say('↓ 把气给刺猬。狗会自己跟随；带电墙边按 / 让它贴住。');
}
function memoPigAction(){
 memo.pigContext=false;
 const p=memo.objects.filter(p=>!p.done||p.type==='drain').find(p=>Math.hypot(p.x-hog.x,p.y-hog.y)<(p.type==='cage'?78:78));
 if(p){memo.pigContext=true;
  if(p.type==='drain'){if(memo.water.plugged){memo.water.plugged=false;hog.plugged=false;say('松开了！水正在退，趁现在一起登上毛巾架。');}else if(hog.bloat>.65){memo.water.plugged=true;hog.plugged=true;say('刺豚堵住排水口。留一点气给狗，让它随水位上升。');}else say('普通身体堵不住。狗先倒灌，让刺猬鼓成刺豚。');return;}
  if(p.type==='cage'){const reach=22+42*hog.bloat;if(hog.bloat>.65&&Math.hypot(p.x-hog.x,p.y-hog.y)<reach){p.done=true;p.key={x:p.keyX,y:p.y,vy:0};needRebuild=true;sSmallPop();say('长刺扎破了吊钥匙的气球！钥匙正在落下。');}else say('身体被笼栏挡住了。再大一点，用长刺够进去。');return;}
  if(p.type==='fridge'){p.done=true;say('冰箱打开了。等水面结冰，再分别跳上去。');sGrab();return;}
  if(p.type==='keylock'){if(memo.keys){p.done=true;memo.keys--;say('锁打开了，两位一起出去。');needRebuild=true;sGrab();}else say('钥匙还没拿到。');return;}
 }
 const key=memo.objects.find(p=>p.key&&Math.hypot(p.key.x-hog.x,p.key.y-hog.y)<70);
 if(key){memo.pigContext=true;key.key=null;memo.keys++;sGrab();say('刺猬拿到钥匙了，去门边按 F。');return;}
 const pump=(L.pumps||[]).find(p=>Math.hypot(hog.x-p.x,hog.y-(p.y-15))<75);
 if(pump){memo.pigContext=true;say('按住 F 用打气筒补总气量。W 只把已有的气给狗。');return;}
 say('这里没有可操作的物品。W 给狗输气；F 只操作附近的物品。');
}
function memoTransfer(dt){
 const before=memoTotalAir();hog.blow=false;hog.backflow=false;hog.returnAir=false;memo.ventThrust=false;
 const pump=(L.pumps||[]).find(p=>Math.hypot(hog.x-p.x,hog.y-(p.y-15))<75);
 if(held('KeyF')&&memo.pigContext&&pump){const q=Math.min(.24*dt,Math.max(0,pump.cap-memoTotalAir()));hog.gas+=q;memo.noise=Math.max(memo.noise,.9);}
 if(held('KeyW')&&dog.state==='ok'){const q=Math.min(hog.gas,.28*dt,1.05-dog.gas);hog.gas-=q;dog.gas+=q;hog.blow=q>0;if(q>0)memo.noise=Math.max(memo.noise,.8);}
 if(held('Slash','NumpadDivide'))memo.slashClock+=dt;else{memo.slashClock=0;memo.slashContext=false;memo.work=null;}
 if(held('ArrowDown')&&dog.state==='ok'){const q=Math.min(dog.gas,.33*dt,1-hog.gas);dog.gas-=q;hog.gas+=q;hog.backflow=q>0;}
 if(held('KeyS')&&dog.state==='ok'){const q=Math.min(dog.gas,.34*dt);dog.gas-=q;stats.spent+=q;memo.ventThrust=q>0;if(q>0)memo.noise=Math.max(memo.noise,.9);}
 if(dog.state==='skin'&&held('KeyW')&&hog.gas>.045){hog.revive+=dt;if(hog.revive>.7){dog.state='ok';dog.gas=Math.min(.12,hog.gas);hog.gas-=dog.gas;dog.inv=1;dog.lastPop='';hog.revive=0;}}
 const oldHalf=hogHalf();hog.bloat=clamp((hog.gas-.16)/.64,0,1);if(hog.ground)hog.y-=hogHalf()-oldHalf;
 let temp=1;for(const z of heat)if(inRect(dog.x,dog.y,z)&&(!z.until||!memoObj(z.until)?.done)&&(!z.when||memoObj(z.when)?.done))temp=z.temp??1;
 dog.temp=approach(dog.temp,temp,dt*.7);const oldR=isFlat()?7:rr(dog.air),oldFlat=isFlat();dog.air=dog.gas*dog.temp;const newR=isFlat()?7:rr(dog.air);if(dog.ground||oldFlat!==isFlat())dog.y-=newR-oldR;
 if(dog.air>1)popMemo('over');
 if(memoTotalAir()>before+.001&&!pump)throw new Error('Air was created outside a pump');
}
function popMemo(reason){if(dog.state!=='ok')return;stats.spent+=dog.gas;dog.gas=0;dog.riding=false;dog.cling=null;dog.charge=0;memo.work=null;pop(reason);}
function updateMemoWater(dt){
 const w=memo.water;if(!w)return;
 if(w.freezeBy&&memoObj(w.freezeBy)?.done){w.freeze=Math.min(1,w.freeze+dt*.5);if(w.freeze>=1&&!w.frozen){w.frozen=true;needRebuild=true;say('水面冻好了。两位分别跳上冰面。');}}
 if(!w.frozen)w.y=clamp(w.y+(w.plugged?-w.fill:w.drain)*dt,w.min,w.bottom-20);
 for(const b of L.bubbles||[])if(Math.hypot(hog.x-b.x,hog.y-b.y)<120&&Math.hypot(dog.x-b.x,dog.y-b.y)<120){const q=Math.min(.14*dt,Math.max(0,L.budget-memoTotalAir()));hog.gas+=q;}
}
function memoCats(dt){for(const cat of memo.cats){
 const dist=Math.abs(dog.x-cat.x),fear=60+95*hog.bloat;
 if(cat.awake&&Math.hypot(hog.x-cat.x,hog.y-cat.y)<fear){cat.flee=1.5;cat.vx=220;stats.scares++;}
 if(!cat.awake){if(dist<360)cat.alert=clamp(cat.alert+Math.max(0,memo.noise-.22)*dt*.9-dt*.025,0,1);if(cat.alert>.85){cat.awake=true;say('猫醒了！它怕刺猬，靠近也要留出刺的距离。');}}
 else if(cat.flee>0){cat.flee-=dt;cat.x+=cat.vx*dt;}
 else if(dog.air>.045){cat.vx=approach(cat.vx,Math.sign(dog.x-cat.x)*220,800*dt);cat.x+=cat.vx*dt;cat.y=approach(cat.y,dog.y,220*dt);if(Math.hypot(cat.x-dog.x,cat.y-dog.y)<32)popMemo('cat');}
 cat.x=clamp(cat.x,80,L.width-70);
 }}
function updateMemoRail(dt){
 const r=memo.rail;if(!r||r.done)return false;r.x=Math.min(r.end,r.x+r.speed*dt);
 const reel=held('Digit0','Numpad0');ropeLen=approach(ropeLen,reel?110:r.long,130*dt);ropeShort=reel;hog.reel=reel;
 dog.x=hog.x=r.x;dog.y=r.y-ropeLen*.43;hog.y=r.y+ropeLen*.57;dog.ground=hog.ground=false;dog.vx=hog.vx=r.speed;dog.vy=hog.vy=0;
 for(const p of L.railHazards||[]){const hit=p.target==='dog'?dogHitsRect(p.x,p.y,p.w,p.h):hogHitsRect(p.x,p.y,p.w,p.h);if(hit){hurtHog('rail');return true;}}
 if(r.x>=r.end){r.done=true;hog.vx=dog.vx=0;say('滑出横梁了。两位向右，落到最后的台面。');}
 return true;
}
function updateMemo(dt){
 if(hurt>0){hurt-=dt;if(hurt<=0){reset(false);say('回到房间入口，气量和物品都已恢复。');}return;}
 time+=dt;noticeTime=Math.max(0,noticeTime-dt);dog.inv=Math.max(0,dog.inv-dt);memo.noise=0;
 // Landing deformation is transient, including while riding or on the pulley.
 hog.squash*=Math.exp(-10*dt);dog.squash*=Math.exp(-10*dt);
 if(pressed('KeyF'))memoPigAction();if(pressed('Slash','NumpadDivide'))memoDogAction();memoTransfer(dt);updateMemoWater(dt);
 const hx=(held('ArrowRight')?1:0)-(held('ArrowLeft')?1:0),dx=(held('KeyD')?1:0)-(held('KeyA')?1:0),wasBall=hog.ball;
 if(updateMemoRail(dt)){finishMemoFrame(dt);return;}
 const ball=held('ShiftLeft','ShiftRight');if(ball&&!wasBall){dropApples();hog.ball=true;hog.y+=2*hogScale();}else if(!ball&&wasBall&&!overlapAny(hog.x,hog.y-2*hogScale(),15*hogScale(),15*hogScale())){hog.ball=false;hog.y-=2*hogScale();}
 if(hx)hog.face=hx;if(dx)dog.face=dx;
 if(pressed('ArrowUp')&&hog.ground&&!hog.plugged){dropApples();hog.vy=-420/(1+hog.bloat*.45);hog.ground=false;memo.noise=1;}
 if(pressed('Space')){if(dog.cling){dog.cling=null;dog.vy=-180;}else if(dog.riding){leaveAppleSeat(dog.face*100);dog.vy=-300;}else if(dog.ground){dog.vy=-350;dog.ground=false;}}
 if(dog.riding&&((dx&&dog.seatInputReleased)||dog.air>.29||hog.ball||!memo.stack))leaveAppleSeat(dx*140);
 const w=memo.water,hWater=w&&!w.frozen&&hog.x>w.x&&hog.x<w.x+w.w&&hog.y+hogHalf()>w.y,dWater=w&&!w.frozen&&dog.x>w.x&&dog.x<w.x+w.w&&dog.y+dogDims()[1]>w.y;
 hog.vx=approach(hog.vx,hx*(hog.ball?350:185)/(1+hog.bloat*.4),dt*(hx?1800:2600));hog.vy+=G*(hWater?(hog.bloat>.35?-.4-2*hog.bloat:1.2):1-.22*hog.bloat)*dt;
 if(hWater){hog.vx*=Math.exp(-dt);hog.vy*=Math.exp(-dt*2.5);}
 for(const f of fans)if(fanOn(f)&&inRect(hog.x,hog.y,f)){hog.vx+=f.dx*f.p*(.08+1.2*hog.bloat)*dt;hog.vy+=f.dy*f.p*(.08+1.2*hog.bloat)*dt;}
 hog.vy=clamp(hog.vy,-340,750);hog.spin+=hog.vx*dt/13;hog.bob+=Math.abs(hog.vx)*dt*.1;
 if(hog.plugged){hog.x=w.plugX;hog.y=w.bottom-hogHalf();hog.vx=hog.vy=0;hog.ground=true;}else{hog.ground=false;hog.x+=hog.vx*dt;hog.y+=hog.vy*dt;resolve(hog,hogHalf(),hogHalf(),true);}
 if(Math.abs(hog.vx)>20)memo.noise=Math.max(memo.noise,hog.ball?.9:.14);if(hog.ball&&Math.abs(hog.vx)>25)memo.noise=.9;
 for(const a of memo.apples){a.ignore=Math.max(0,a.ignore-dt);a.vy+=G*dt;a.y+=a.vy*dt;const g=groundAt(a.x);if(a.y>g-10){a.y=g-10;a.vy=0;}if(hog.ball&&hog.ground&&memo.stack<3&&a.ignore<=0&&Math.hypot(hog.x-a.x,hog.y-a.y)<30){a.taken=true;memo.stack++;stats.apples++;sGrab();}}
 memo.apples=memo.apples.filter(a=>!a.taken);
 for(const c of L.carpets||[])if(dog.x>c.x&&dog.x<c.x+c.w&&dog.air<.16&&dog.ground&&dx)dog.charge=Math.min(1,dog.charge+dt*.8);
 dog.charge=Math.max(0,dog.charge-dt*.045);if(dWater){dog.charge=0;dog.cling=null;}
 if(dog.cling&&(dog.charge<=0||dog.air>=.16))dog.cling=null;
 autoAppleSeat(dx,dt);
 if(dog.riding){dog.x=hog.x;dog.y=memoSeatY()-dogDims()[1];dog.vx=hog.vx;dog.vy=hog.vy;dog.ground=true;}
 else if(dog.cling){dog.cling.s=clamp(dog.cling.s+dx*120*dt,0,clingLength(dog.cling.path));const p=clingPoint(dog.cling.path,dog.cling.s);dog.x=p.x;dog.y=p.y;dog.vx=dog.vy=0;dog.ground=false;}
 else{dog.vx=approach(dog.vx,dx*(heldSources.get('KeyA')?.has('companion')||heldSources.get('KeyD')?.has('companion')?Math.max(165,Math.abs(hog.vx)+35):165)+(memo.ventThrust?dog.face*65:0),dt*(dx?1300:1800));let ay=G*(1-K*dog.air);if(dWater)ay=dog.air>.04?-G*(1+Math.min(1.8,dog.air*4)):650;dog.vy+=ay*dt;if(memo.ventThrust)dog.vy+=Math.sin(time*19)*55*dt;dog.vy*=Math.exp(-dt*(dWater?4:2.5));for(const f of fans)if(fanOn(f)&&inRect(dog.x,dog.y,f)&&dog.air>.04){dog.vx+=f.dx*f.p*dog.air*1.4*dt;dog.vy+=f.dy*f.p*dog.air*1.4*dt;}dog.vy=clamp(dog.vy,-360,750);dog.ground=false;dog.x+=dog.vx*dt;dog.y+=dog.vy*dt;const[a,b]=dogDims();resolve(dog,a,b,false);}
 ropeLen=approach(ropeLen,held('Digit0','Numpad0')?85:300,180*dt);ropeShort=held('Digit0','Numpad0');hog.reel=ropeShort;
 if(!dog.riding){for(let i=0;i<5;i++){const a=anchor(),x=hog.x-a.x,y=hog.y-10-a.y,d=Math.hypot(x,y);if(d<=ropeLen)break;const wd=dog.cling?0:1,wh=hog.plugged?0:1/memoHogMass();if(!wd&&!wh)break;const c=Math.min(24,d-ropeLen)/(wd+wh),nx=x/d,ny=y/d;dog.x+=nx*c*wd;dog.y+=ny*c*wd;hog.x-=nx*c*wh;hog.y-=ny*c*wh;const v=(hog.vx-dog.vx)*nx+(hog.vy-dog.vy)*ny;if(v>0){dog.vx+=nx*v*wd/(wd+wh);dog.vy+=ny*v*wd/(wd+wh);hog.vx-=nx*v*wh/(wd+wh);hog.vy-=ny*v*wh/(wd+wh);}if(!dog.cling){const[a,b]=dogDims();resolve(dog,a,b,false);}if(!hog.plugged)resolve(hog,hogHalf(),hogHalf(),true);}}
 if(L.softSky&&dog.y-dogDims()[1]<26){dog.y=26+dogDims()[1];dog.vy=Math.max(0,dog.vy);}
 if(!dog.riding&&dog.state==='ok'&&dog.inv<=0&&Math.hypot(dog.x-hog.x,dog.y-hog.y)<rr(dog.air)*.65+18*hogScale())popMemo('hog');
 if(dog.state==='ok'){if(dogTouchesSpikes())popMemo('spike');else if((L.nailBeds||[]).some(p=>dogHitsRect(p.x,p.y,p.w,p.h)))popMemo('spike');}
 for(const p of memo.objects){if(p.key){p.key.vy+=G*dt;p.key.y=Math.min(448,p.key.y+p.key.vy*dt);}if(p.type==='lamp'&&!p.done){const ok=memo.work===p.id&&held('Slash','NumpadDivide')&&dog.riding&&memo.stack>=p.apples&&hog.ground&&Math.abs(hog.vx)<4&&Math.hypot(p.x-dog.x,p.y-dog.y)<65;p.progress=ok?p.progress+dt:0;if(p.progress>=p.duration){p.done=true;memo.work=null;needRebuild=true;sGrab();say('灯泡拧掉了。体积会缩小，总气量没有改变。');}}}
 memoCats(dt);if(needRebuild)rebuildSolids();if(hog.y>H+70||dog.y>H+70){hurtHog('fall');return;}
 finishMemoFrame(dt);
}
function finishMemoFrame(dt){
 updateExperience(dt);
 // Material jobs power only their room's supporting doors.
 for(const g of gates){const on=powered(g.rule);if(on!==g.on){g.on=on;needRebuild=true;}g.open=approach(g.open,g.on?1:0,dt*2.4);}if(needRebuild)rebuildSolids();
 const g=L.goal;if(dog.state==='ok'&&hog.ground&&hog.x>=g.x&&hog.x<=g.x+g.w+20&&dog.x>g.x-115&&(!g.requires||g.requires.every(powered))){win=true;clearHeld();sWin();rememberCompletion();winTitle.textContent='两位一起出来了！';winBody.innerHTML=`第 ${idx+1} 关 · ${L.name}<br>${time.toFixed(1)} 秒 · 总气量 ${Math.round(memoTotalAir()*100)}%<br>苹果 ${memo.stack} 个 · 猫醒了 ${memo.cats.some(c=>c.awake)?'是':'否'}`;winEl.hidden=false;document.getElementById('nextBtn').textContent=L.practice?(idx===18?'开始房间冒险 →':'下一个练习 →'):idx===15?'练习与更多关卡 →':'下一关 →';}
 const target=clamp((hog.x+dog.x)/2-W*.4,0,L.width-W);cameraX=approach(cameraX,target,Math.max(100,Math.abs(target-cameraX)*7)*dt);hudClock+=dt;if(hudClock>.1){syncHUD();hudClock=0;}
}

