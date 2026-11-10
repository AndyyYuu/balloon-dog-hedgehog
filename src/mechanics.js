function device(id){return switches.find(p=>p.id===id);}
function powered(rule){if(!rule)return true;if(typeof rule==='string')return !!device(rule)?.on||!!(L?.memo&&memoObj(rule)?.done);if(rule.any)return rule.any.some(powered);if(rule.all)return rule.all.every(powered);if(rule.charge)return !!charges.find(p=>p.id===rule.charge)?.done;return false;}
function say(t){interactNotice=t;noticeTime=2.6;syncHUD();}
function syncRoleUI(){} // Movement always belongs to the hedgehog.
function setActor(){activeRole='hog';}
function hogScale(){return 1+1.35*(hog.bloat||0);}
function hogHalf(){return(hog.ball?13:15)*hogScale();}
function setBloat(n){const old=hog.bloat||0,next=clamp(n,0,1),y=hog.y,hh=hogHalf();hog.bloat=next;if(hog.ground)hog.y-=hogHalf()-hh;if(next>old&&overlapAny(hog.x,hog.y,hogHalf(),hogHalf())){hog.bloat=old;hog.y=y;return false;}return true;}
function interactionPoint(p){return p.type.startsWith('dog')?{x:p.x,y:p.y}:{x:p.x+p.w/2,y:p.y-12};}
function nearDevice(p,role='dog'){const b=role==='dog'?dog:hog,q=interactionPoint(p);return Math.hypot(b.x-q.x,b.y-q.y)<72;}
function availableDogAction(){return switches.filter(p=>p.type.startsWith('dog')&&!p.latched&&(!p.requires||p.requires.every(powered))&&Math.hypot(p.x-hog.x,p.y-hog.y)<380).sort((a,b)=>Math.hypot(a.x-hog.x,a.y-hog.y)-Math.hypot(b.x-hog.x,b.y-hog.y))[0];}
function activateDog(p){
 if(p.type==='dogDock'){dog.docked=p.id;dog.x=p.x;dog.y=p.y;dog.vx=dog.vy=0;dog.ground=false;say(`${p.letter} 已接通。狗会留守，你可以继续走；/ 叫回来。`);}
 else{p.remaining=p.duration||0;p.latched=!p.duration;p.on=true;say(p.duration?`${p.letter} 已按到，${p.duration} 秒接力开始。`:`${p.letter} 接力完成。`);}
 dog.task=null;dog.taskTarget=null;dog.inv=Math.max(dog.inv,.4);stats.commands++;sGrab();needRebuild=true;
}
function interact(){
 dog.fContext=false;dog.fClock=0;
 if(dog.docked){const p=device(dog.docked);dog.docked='';if(p)p.on=false;dog.task=null;dog.inv=Math.max(dog.inv,.5);dog.fContext=true;say('回来啦。绳子和浮力会重新把两位连起来。');return;}
 if(dog.task){dog.task=null;dog.taskTarget=null;dog.fContext=true;say('取消这次行动，狗回来跟随。');return;}
 const p=availableDogAction();
 if(p){dog.fContext=true;if(dog.state!=='ok'){say('先 W 把狗吹回来。');return;}if(ropeShort&&Math.hypot(p.x-hog.x,p.y-hog.y)>140){say('目标够得着，但绳子太短：E 放长，再按 /。');return;}
  dog.task={id:p.id,step:0,clock:0};say(p.flatOK?'狗出发走高窗。到窄缝前用 S 放扁，风管会托着它。':'狗出发。你继续控制刺猬，W / S 仍能调它的气量。');return;
 }
 say('↓ 把狗的气给刺猬；S 把刺猬缩小。');
}
function updateDogTask(dt){
 dog.taskTarget=null;
 if(!dog.task)return;
 const p=device(dog.task.id);if(!p||dog.state!=='ok'){dog.task=null;return;}
 dog.task.clock+=dt;const route=[...(p.waypoints||[]),{x:p.x,y:p.y}];let q=route[dog.task.step];
 if(Math.hypot(dog.x-q.x,dog.y-q.y)<23&&dog.task.step<route.length-1){dog.task.step++;q=route[dog.task.step];}
 dog.taskTarget=q;
 if(dog.task.step===route.length-1&&Math.hypot(dog.x-p.x,dog.y-p.y)<32&&(p.flatOK||dog.air>=.12)){activateDog(p);return;}
 if(dog.task.clock>22){dog.task=null;say('路线被挡住了。调整气量、绳长或位置，再按 /。');}
}
function updateTransfer(dt){
 hog.backflow=false;hog.returnAir=false;
 if(held('Slash','NumpadDivide'))dog.fClock=(dog.fClock||0)+dt;else{dog.fClock=0;dog.fContext=false;}
 if(held('ArrowDown')&&dog.state==='ok'&&dog.air>.06&&(hog.bloat||0)<1){
  const amount=Math.min(.28*dt,dog.air-.06,(1-(hog.bloat||0))/1.8);if(amount>0&&setBloat((hog.bloat||0)+amount*1.8)){setAir(dog.air-amount);hog.backflow=true;stats.transfer+=amount;}
 }
 if(held('KeyS')&&(hog.bloat||0)>0){const amount=Math.min(.8*dt,hog.bloat);setBloat(hog.bloat-amount);if(dog.state==='ok')setAir(dog.air+amount*.3);hog.returnAir=true;}
}
function devicesSummary(){const t=switches.find(p=>p.remaining>0);if(t)return `${t.letter} ${t.remaining.toFixed(1)} 秒`;if(dog.task)return'狗正在行动 · / 取消';if(hog.backflow)return`倒灌中 · 体型 ${Math.round((hog.bloat||0)*100)}%`;return switches.map(p=>`${p.letter}${p.on?'●':'○'}`).join('  ')||'风 / 温度 / 绳长';}
function updateDevices(dt){
 if(dog.docked&&(dog.state!=='ok'||(!device(dog.docked)?.flatOK&&dog.air<.04)))dog.docked='';
 for(const p of switches){
  if(p.type==='dogDock')p.on=dog.state==='ok'&&dog.docked===p.id&&(p.flatOK||dog.air>=(p.minAir??.12))&&dog.air<=(p.maxAir??1);
  else if(p.type==='dogTap'){const before=p.remaining;p.remaining=Math.max(0,p.remaining-dt);p.on=p.latched||p.remaining>0;if(p.lockBy&&before>0&&p.remaining===0&&!device(p.lockBy)?.latched){hurtHog('timeout');return;}}
  else if(p.type==='hogWeight'){const down=hog.ground&&hog.x>p.x&&hog.x<p.x+p.w&&hog.bloat>=p.minBloat;p.progress=down?Math.min(1,(p.progress||0)+dt):0;if(p.progress>=1&&!p.latched)pressSwitch(p);p.on=p.latched;}
  else if(p.type==='hogPlate')p.on=hog.ground&&hog.x>p.x&&hog.x<p.x+p.w&&Math.abs(hog.y+hogHalf()-p.y)<5;
  else p.on=p.latched;
 }
 for(const p of charges){if(p.done)continue;p.progress=p.all.every(id=>device(id)?.on)&&(!p.requires||p.requires.every(powered))?Math.min(p.duration,p.progress+dt):0;if(p.progress>=p.duration){p.done=true;sGrab();say('两位同时到场，这次默契完成了。');}}
 for(const g of gates){let next=powered(g.rule);if(!next&&g.on&&g.kind!=='bridge'){const[dw,dh]=dogDims(),block=(b,hw,hh)=>b.x+hw>g.x&&b.x-hw<g.x+g.w&&b.y+hh>g.y&&b.y-hh<g.y+g.h;if(block(hog,hogHalf(),hogHalf())||block(dog,dw,dh))next=true;}if(next!==g.on){g.on=next;needRebuild=true;}g.open=approach(g.open,g.on?1:0,dt*2.4);}
}
// Only marked crossbeams route the hose. Corners form a tiny visibility graph.
function ropeRoute(a,b){
 const rects=(L.ropeBeams||[]).map(r=>({x:r.x-3,y:r.y-3,w:r.w+6,h:r.h+6}));
 const clear=(p,q)=>!rects.some(r=>{let lo=0,hi=1;for(const[k,min,max]of[['x',r.x+.01,r.x+r.w-.01],['y',r.y+.01,r.y+r.h-.01]]){const d=q[k]-p[k];if(Math.abs(d)<1e-9){if(p[k]<=min||p[k]>=max)return false;}else{let u=(min-p[k])/d,v=(max-p[k])/d;if(u>v)[u,v]=[v,u];lo=Math.max(lo,u);hi=Math.min(hi,v);if(lo>=hi)return false;}}return lo<hi&&hi>0&&lo<1;});
 if(!rects.length||clear(a,b))return[a,b];const pts=[a,b];for(const r of rects)pts.push({x:r.x,y:r.y},{x:r.x+r.w,y:r.y},{x:r.x,y:r.y+r.h},{x:r.x+r.w,y:r.y+r.h});
 const dist=pts.map(()=>Infinity),prev=[],seen=new Set();dist[0]=0;
 for(let n=0;n<pts.length;n++){let u=-1;for(let i=0;i<pts.length;i++)if(!seen.has(i)&&(u<0||dist[i]<dist[u]))u=i;if(u<0||!Number.isFinite(dist[u]))break;if(u===1)break;seen.add(u);for(let v=0;v<pts.length;v++)if(!seen.has(v)&&clear(pts[u],pts[v])){const d=dist[u]+Math.hypot(pts[u].x-pts[v].x,pts[u].y-pts[v].y);if(d<dist[v]){dist[v]=d;prev[v]=u;}}}
 if(!Number.isFinite(dist[1]))return[a,b];const path=[b];for(let u=1;prev[u]!==undefined;){u=prev[u];path.unshift(pts[u]);}return path;
}
function pathLength(p){return p.slice(1).reduce((n,q,i)=>n+Math.hypot(q.x-p[i].x,q.y-p[i].y),0);}
