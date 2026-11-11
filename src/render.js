function currentZone(){return [...L.zones].reverse().find(z=>Math.max(hog.x,dog.x-60)>=z.x)||L.zones[0];}
function hint(){
 if(L.memo)return memoHint();
 if(win)return'';
 if(hurt>0)return hurtReason==='timeout'?'接力超时。回到蓝旗，先安排位置，再让狗出发。':'两位都怕刺，回蓝旗再试一次。';
 if(dog.state==='skin')return`${dog.lastPop}。W 沿气管把它重新吹起来。`;
 if(dog.blocked>0)return'这里太窄：S 放扁狗，再让它钻过去。';
 if(dog.air>.90)return'快撑爆了！按住 S，把气还给刺猬。';
 if(hog.backflow)return'倒灌中：狗变小、刺猬变重。松开 S 保留体型，W 把气给狗。';
 if(hog.returnAir)return'把气还给狗，刺猬正在缩小。继续 W，狗会变大，刺猬会缩小。';
 if(noticeTime>0)return interactNotice;
 if(dog.docked)return device(dog.docked)?.on?'狗正在留守。你去接管机关；/ 叫狗回来。':'气量不合适，W / S 调整；/ 叫回来。';
 if(dog.task){const p=device(dog.task.id);return p.flatOK?'狗走高处，你走下面。到窄窗用 S 放扁，别急着收短绳。':'狗正在行动。W / S 调气量，E 调绳长；/ 取消。';}
 if(hog.bloat>.65)return'巨大刺猬更重：能压重机关、撞厚墙。按 Shift 缩球滚过矮洞，W 能让刺猬变小。';
 if(hog.jet)return'喷气消耗狗的气量；A / D 转向，W 补气。';
 return classicControlHint(currentZone().hint);
}
function drawCheckpoint(){
 L.checkpoints.forEach((p,i)=>{const y=groundAt(p.x),saved=checkpoint&&checkpoint.index>=i;
 c.fillStyle=saved?'#67a2aa':'#b6c4bd';c.fillRect(p.x-1,y-47,2,47);c.beginPath();c.moveTo(p.x+1,y-47);c.lineTo(p.x+22,y-39);c.lineTo(p.x+1,y-30);c.fill();
 c.font=FONT(10);c.textAlign='center';c.fillText(saved?'已存档':'存档',p.x,y+29);});
}
function drawMechanisms(){
 const sources=rule=>typeof rule==='string'?[rule]:rule?.any?rule.any.flatMap(sources):rule?.all?rule.all.flatMap(sources):rule?.charge?charges.find(p=>p.id===rule.charge)?.all||[]:[];
 for(const g of gates){
  sources(g.rule).forEach((id,i)=>{const p=device(id);if(!p)return;const q=interactionPoint(p),y=g.y+g.h+15+i*5;c.save();c.strokeStyle=p.type.startsWith('dog')?'#dc9c9d':'#bc9459';c.globalAlpha=p.on?.8:.35;c.lineWidth=p.on?2:1.5;c.setLineDash(p.on?[]:[5,5]);c.beginPath();c.moveTo(q.x,q.y);c.lineTo(q.x+34,q.y);c.lineTo(q.x+34,y);c.lineTo(g.x+g.w/2,y);c.lineTo(g.x+g.w/2,g.y+g.h);c.stroke();c.restore();});
  c.save();c.font=FONT(10);c.textAlign='center';
  if(g.kind==='bridge'){c.strokeStyle=g.on?'#6c9d9b':'#b3a496';c.lineWidth=2;c.setLineDash(g.on?[]:[8,6]);c.strokeRect(g.x,g.y,g.w,g.h);c.setLineDash([]);if(g.on){c.fillStyle='#a7c7bf';c.fillRect(g.x,g.y,g.w,g.h);c.fillStyle='#769e97';for(let x=g.x+12;x<g.x+g.w;x+=30)c.fillRect(x,g.y,3,g.h);}c.fillStyle='#7a9a91';c.fillText(g.on?'桥有人撑着':'桥已收回',g.x+g.w/2,g.y+g.h+30);}
  else{const remaining=g.h*(1-g.open);c.strokeStyle='#b09063';c.lineWidth=2;c.strokeRect(g.x-5,g.y,g.w+10,g.h);if(remaining>1){c.save();c.beginPath();c.rect(g.x-3,g.y,g.w+6,remaining);c.clip();if(!drawProp('door',g.x+g.w/2,g.y+remaining,g.w+6,g.h,{stretch:true})){c.fillStyle='#c6a573';c.fillRect(g.x,g.y,g.w,remaining);}c.restore();}propIndicator(g.x+g.w/2,g.y+g.h+12,g.on);c.fillStyle=g.on?'#6c9987':'#987342';c.fillText(g.on?'已接通':g.label,g.x+g.w/2,g.y+g.h+34);}
  c.restore();
 }
 for(const p of switches){const dogOnly=p.type.startsWith('dog');c.save();
  if(dogOnly){c.strokeStyle='#b6aaa0';c.lineWidth=2;c.beginPath();c.moveTo(p.x,8);c.lineTo(p.x,p.y-24);c.stroke();if(!drawProp('paw',p.x,p.y+26,57,57)){c.fillStyle=p.on?'#f5b5b4':'#f5ded5';c.strokeStyle=p.on?'#d96973':'#ccaaa0';c.lineWidth=3;c.beginPath();c.arc(p.x,p.y,24,0,Math.PI*2);c.fill();c.stroke();c.fillStyle=p.on?'#b84e5b':'#ba8684';ell(p.x,p.y+5,8,6);for(const [x,y]of[[-10,-5],[-4,-11],[4,-11],[10,-5]])ell(p.x+x,p.y+y,3,4);}propIndicator(p.x,p.y-24,p.on,'#d97588');c.font=FONT(12);c.textAlign='center';c.fillStyle='#ae6970';c.fillText(p.label,p.x,p.y+45);c.font=FONT(10);c.fillText(p.on?(dog.docked===p.id?'/ 松开':p.remaining>0?`${p.remaining.toFixed(1)} 秒`:'已按下'):'/ 狗操作',p.x,p.y+61);if(p.flatOK)c.fillText('放扁穿过高窗',p.x,p.y+77);else if(p.minAir)c.fillText('气量 45%–68%',p.x,p.y+77);}
  else{if(!drawProp('plate',p.x+p.w/2,p.y+3+(p.on?2:0),p.w+7,27,{stretch:true})){c.fillStyle=p.on?'#73a28a':'#ba8b4b';rrPath(p.x,p.y-7,p.w,8,3);c.fill();c.fillStyle=p.on?'#99c1a9':'#e4c282';c.fillRect(p.x+7,p.y-10+(p.on?5:0),p.w-14,5);}propIndicator(p.x+p.w-5,p.y-5,p.on);c.font=FONT(11);c.textAlign='center';c.fillStyle=p.on?'#618875':'#937048';c.fillText(p.label,p.x+p.w/2,p.y+31);if(p.type==='hogWeight'){c.fillStyle='#b38949';c.font=FONT(10);c.fillText('刺猬鼓大 · 站稳等亮灯',p.x+p.w/2,p.y+46);c.fillRect(p.x,p.y+52,p.w*(p.progress||0)/(p.hold??1),3);}if(p.requires&&!p.requires.every(powered)&&!p.on){c.font=FONT(9);c.fillText('需要 A 先供电',p.x+p.w/2,p.y+45);}}
  c.restore();
 }
 for(const p of charges){const points=p.all.map(id=>interactionPoint(device(id))),x=points.reduce((n,p)=>n+p.x,0)/points.length,y=Math.min(...points.map(p=>p.y))-67;c.save();c.fillStyle='#fffaf5df';rrPath(x-94,y-24,188,42,7);c.fill();c.font=FONT(10);c.textAlign='center';c.fillStyle='#967757';c.fillText(p.done?'同步已锁定':p.label,x,y-9);c.fillStyle='#e5d4bf';c.fillRect(x-78,y,156,5);c.fillStyle=p.done?'#79a68d':'#d1997a';c.fillRect(x-78,y,156*p.progress/p.duration,5);c.restore();}
}
function drawOverview(){
 const x=265,y=74,w=460,scale=w/L.width;c.fillStyle='#ead9c8';c.fillRect(x,y,w,3);
 for(const s of statics){if(s.y>40){c.fillStyle='#b9a18a';c.fillRect(x+Math.max(0,s.x)*scale,y,(Math.min(L.width,s.x+s.w)-Math.max(0,s.x))*scale,3);}else{c.fillStyle='#c5ac94';c.fillRect(x+s.x*scale,y-8,s.w*scale,4);}}
 for(const b of L.beds||[]){c.fillStyle='#88a484';c.fillRect(x+b.x*scale,y-6,b.w*scale,6);}
 for(const p of L.checkpoints){c.fillStyle='#7da5a6';c.fillRect(x+p.x*scale,y-12,2,11);}
 for(const g of gates){c.fillStyle=g.on?'#75a28b':'#b39562';c.fillRect(x+g.x*scale,y-12,3,12);}
 for(const p of switches){c.fillStyle=p.type.startsWith('dog')?'#dd858d':'#ad874c';ell(x+interactionPoint(p).x*scale,y-9,2.5,2.5);}
 c.strokeStyle='#a88a6b77';c.strokeRect(x+cameraX*scale,y-17,W*scale,23);c.fillStyle=DOGC;ell(x+dog.x*scale,y-3,3.2,3.2);c.fillStyle='#80563c';ell(x+hog.x*scale,y-3,3.2,3.2);
 c.font=FONT(10);c.textAlign='left';c.fillStyle='#99816b';c.fillText('前路',x,y+19);c.textAlign='right';c.fillText('绿旗',x+w,y+19);
}
function drawHogJet(){
 if(!hog.jet&&hog.jetGlow<=0)return;
 c.save();c.globalAlpha=hog.jet?1:hog.jetGlow;c.translate(hog.x-hog.jetDir*16,hog.y+3);c.scale(hog.jetDir,1);
 const length=27+Math.sin(time*63)*5;
 c.fillStyle='#99d1deaa';c.beginPath();c.moveTo(-3,-5);c.quadraticCurveTo(-15,-10,-length,0);c.quadraticCurveTo(-16,9,-3,5);c.closePath();c.fill();
 c.fillStyle='#fff7df';c.beginPath();c.moveTo(-3,-2.5);c.quadraticCurveTo(-11,-5,-length*.7,0);c.quadraticCurveTo(-10,5,-3,2.5);c.closePath();c.fill();
 c.fillStyle='#937357';c.fillRect(-6,-4,9,8);c.fillStyle='#d9ba8c';c.fillRect(-7,-3,3,6);c.fillStyle='#6c8990';ell(2,0,4,5);c.restore();
}
function drawRoleFocus(){
 c.save();c.font=FONT(10);c.textAlign='center';for(const [b,name,keys,col,r]of[[hog,'你','A D','#89613e',25*hogScale()],[dog,'狗',dog.riding?'坐好了':dog.docked?'按着按钮':dog.cling?'自动爬墙':'自动跟随','#c45f77',isFlat()?17:rr(dog.air)+9]]){c.fillStyle='#fffcf2df';rrPath(b.x-33,b.y-r-29,66,18,8);c.fill();c.fillStyle=col;c.fillText(`${name} · ${keys}`,b.x,b.y-r-16);}c.restore();
}
function drawFan(f){
 c.save();const duct=f.ductY!==undefined;c.fillStyle=duct?'#a5cdd419':'#9ac4e811';c.fillRect(f.x,f.y,f.w,f.h);c.strokeStyle=duct?'#88b5c18c':'#8caec77a';c.lineWidth=1.5;
 if(duct){c.setLineDash([8,6]);c.strokeRect(f.x,f.y,f.w,f.h);c.setLineDash([]);c.font=FONT(10);c.fillStyle='#5f98a3';c.textAlign='center';c.fillText('高位风管 · 放扁也能被托住',f.x+f.w/2,f.y-8);}
 for(let i=0;i<(f.active===false?0:12);i++){const t=(time*.5+i*.113)%1,x=f.x+((i*.173+(f.dx||0)*t)%1+1)%1*f.w,y=f.y+((i*.271+(f.dy||0)*t)%1+1)%1*f.h;c.beginPath();c.moveTo(x,y);c.lineTo(x-f.dx*22,y-f.dy*22);c.stroke();}
 const cx=f.x+f.w/2,cy=duct?f.y+f.h-8:Math.min(f.base??H,H)-14;if(drawProp('fan',cx,cy+14,duct?58:85,duct?58:85,{alpha:f.active===false?.6:1})){propIndicator(cx,cy+7,f.active!==false);c.restore();return;}c.fillStyle='#809ba8';ell(cx,cy,19,8);c.save();c.translate(cx,cy);c.rotate(time*14);c.fillStyle='#accbd4';for(let i=0;i<3;i++){c.rotate(Math.PI*2/3);ell(9,0,11,3);}c.restore();c.fillStyle='#68828d';ell(cx,cy,4,4);c.restore();
}
function drawAdventureWall(w){
 if(!w.heavy){drawWall(w);return;}if(!w.alive)return;c.save();c.fillStyle='#a78362';c.fillRect(w.x,w.y,w.w,w.h);c.strokeStyle='#e5be7e';c.lineWidth=3;for(let y=w.y+15;y<w.y+w.h;y+=36){c.strokeRect(w.x+5,y,w.w-10,24);c.fillStyle='#775b48';ell(w.x+9,y+12,2,2);ell(w.x+w.w-9,y+12,2,2);}c.translate(w.x+w.w/2,w.y+w.h/2);c.rotate(-Math.PI/2);c.font=FONT(11);c.fillStyle='#fff0d2';c.textAlign='center';c.fillText('巨大刺猬 · 滚动撞开',0,4);c.restore();
}
function drawHose(){
 const a=anchor(),b={x:hog.x,y:hog.y-10},path=L.memo&&memo?.rail&&!memo.rail.done?[a,{x:memo.rail.x,y:memo.rail.y},b]:ropeRoute(a,b),d=pathLength(path),sag=Math.max(0,ropeLen-d)*.45;
 c.strokeStyle=hog.backflow?'#bc984e':hog.blow?'#cc8c65':hog.reel?'#789ca7':'#8d796a';c.lineWidth=(hog.blow||hog.backflow)?3.5:2.5;c.lineCap='round';c.beginPath();c.moveTo(a.x,a.y);
 if(path.length===2)c.quadraticCurveTo((a.x+b.x)/2,(a.y+b.y)/2+sag,b.x,b.y);else for(const p of path.slice(1))c.lineTo(p.x,p.y);c.stroke();
 for(const p of path.slice(1,-1)){c.fillStyle='#c9ae7b';ell(p.x,p.y,3,3);}
 if(hog.blow||hog.backflow||hog.returnAir){for(let i=0;i<4;i++){let t=(time*1.2+i/4)%1;if(hog.blow||hog.returnAir)t=1-t;let dist=t*d;for(let j=1;j<path.length;j++){const p=path[j-1],q=path[j],len=Math.hypot(q.x-p.x,q.y-p.y);if(dist<=len){const u=dist/(len||1);c.fillStyle=hog.backflow?'#ffe2a3':'#fff4d7';ell(p.x+(q.x-p.x)*u,p.y+(q.y-p.y)*u,3,3);break;}dist-=len;}}}
 if(dog.taskTarget){c.save();c.setLineDash([4,6]);c.strokeStyle='#dc969eaa';c.lineWidth=1;c.beginPath();c.moveTo(dog.x,dog.y);c.lineTo(dog.taskTarget.x,dog.taskTarget.y);c.stroke();c.restore();}
}
function render(){
 const dpr=Math.min(3,Math.max(2,window.devicePixelRatio||1)),w=Math.round(cv.clientWidth*dpr),h=Math.round(cv.clientHeight*dpr);
 if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;}const sc=cv.width/W;c.setTransform(sc,0,0,sc,-cameraX*sc,0);
 if(shake>0)c.translate((Math.random()-.5)*shake*18,(Math.random()-.5)*shake*18);
 drawRoomBackdrop();
 drawMemoBackdrop();for(const z of heat)if(!L.memo||(!z.until||!memoObj(z.until)?.done)&&(!z.when||memoObj(z.when)?.done))drawHeat(L.memo?{...z,k:(z.temp??1)>1?.1:-.1}:z);for(const f of fans)drawFan({...f,active:fanOn(f),base:Math.min(H,groundAt(f.x+f.w/2))});
 c.fillStyle=L.softSky?'#d1bd9f':'#9da29e';c.fillRect(cameraX,0,W,8);c.fillStyle=L.softSky?'#e6d1b3':'#bcc2bc';if(L.softSky){for(let x=Math.floor(cameraX/24)*24;x<cameraX+W;x+=24){c.beginPath();c.arc(x+12,8,12,0,Math.PI);c.fill();}}else for(const t of spikeTeeth)if(t.kind==='ceiling'&&t.x+t.w>cameraX&&t.x<cameraX+W)paintSpikeTooth(t);
 bars.forEach((b,i)=>{c.strokeStyle='#9da29e';c.lineWidth=2;for(let x=b.x+20;x<b.x+b.w;x+=85){c.beginPath();c.moveTo(x,8);c.lineTo(x,b.y);c.stroke();}c.fillStyle='#9da29e';c.fillRect(b.x,b.y,b.w,8);c.fillStyle='#bcc2bc';for(const t of spikeTeeth)if(t.kind===i)paintSpikeTooth(t);});
 drawRoomPlatforms();
 drawMemoObjects();for(const wl of walls)drawAdventureWall(wl);drawMechanisms();for(const b of L.beds||[]){c.fillStyle='#698b6050';c.fillRect(b.x,b.base-4,b.w,5);c.font=FONT(11);c.textAlign='center';c.fillStyle='#78936c';c.fillText('她也得从上面过',b.x+b.w/2,b.base+26);}for(const k of cacti)drawCactus(k);drawCheckpoint();
 const g=L.goal,fx=g.x+g.w-24,fy=g.y+g.h;
 c.fillStyle='#7e8979';c.fillRect(fx-2,fy-80,3,80);c.fillStyle='#70a48a';c.beginPath();c.moveTo(fx+1,fy-79);c.lineTo(fx+31,fy-67);c.lineTo(fx+1,fy-53);c.fill();c.font=FONT(10);c.textAlign='center';c.fillText('一起到这里',fx,fy+26);
 drawHose();drawActorShadows();drawGuideTarget();
 if(hog.ball&&Math.abs(hog.vx)>220&&hog.ground){c.fillStyle='#c7aa8e55';for(let i=0;i<3;i++)ell(hog.x-hog.face*(23+i*12),hog.y+9,5-i,3-i*.5);}
 c.save();if(hurt>0)c.globalAlpha=.5+Math.sin(hurt*50)*.3;drawHogJet();if(dog.state==='ok'){drawHog();drawMemoSeat();if(isFlat())drawFlatDog();else drawDog();}else{drawSkin();drawHog();}c.restore();drawRoleFocus();drawMemoHUD();
 for(const p of parts){c.save();c.globalAlpha=clamp(p.life/p.max*1.6,0,1);c.fillStyle=p.col;c.translate(p.x,p.y);c.rotate(p.rot);if(p.round)ell(0,0,p.sz,p.sz);else c.fillRect(-p.sz/2,-p.sz/4,p.sz,p.sz/2);c.restore();}
 for(const t of texts){c.save();c.globalAlpha=Math.min(1,t.life*2);c.font=FONT(t.size);c.textAlign='center';c.lineWidth=4;c.strokeStyle='#fffaf5';c.strokeText(t.txt,t.x,t.y);c.fillStyle=t.col;c.fillText(t.txt,t.x,t.y);c.restore();}
 c.setTransform(sc,0,0,sc,0,0);if(hurt>0){c.fillStyle='#a4512920';c.fillRect(0,0,W,H);}
 drawSimpleHUD(sc);
}
let last=performance.now(),acc=0;
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;
 if(started&&!paused&&!win){if(hit>0)hit-=dt;else{acc+=dt;while(acc>=1/120){update(1/120);acc-=1/120;just.clear();if(hit>0||win)break;}}effects(dt);}else{just.clear();acc=0;}
 render();requestAnimationFrame(frame);
}
loadLevel(16);requestAnimationFrame(frame);
})();
</script></body></html>
