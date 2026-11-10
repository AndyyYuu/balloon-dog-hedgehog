const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../archive/solo-before-easy.html'),'utf8');
let source=html.split('<script>')[1].split('</script>')[0];
source=source.replace('loadLevel(16);requestAnimationFrame(frame);','globalThis.sim={get memo(){return memo},get levels(){return LEVELS},companion,setPlayerHeld,getRoomGuide,memoTotalAir,memoDogAction,memoPigAction,ropeRoute,pathLength,hogScale,hogHalf,fanOn,setBloat,loadLevel,update,setHeld,clearHeld,pop,revive,reset,setAir,render,resolve,dogTouchesSpikes,hogTouchesSpikes,dogCollisionCapsules,capsuleHitsTriangle,setActor,interact,device,powered,get charges(){return charges},get activeRole(){return activeRole},get ropeShort(){return ropeShort},get spikeTeeth(){return spikeTeeth},get solids(){return solids},get dog(){return dog},get hog(){return hog},get walls(){return walls},get stats(){return stats},get checkpoint(){return checkpoint},get win(){return win},get ropeLen(){return ropeLen},get level(){return L},get just(){return just},get hurt(){return hurt},get switches(){return switches},get gates(){return gates},get cameraX(){return cameraX}};loadLevel(0);');
const elements=new Map();
const ctx={};
const context2d=new Proxy({measureText:s=>({width:String(s).length*10})},{get:(o,k)=>o[k]||(()=>{})});
function element(id){if(!elements.has(id))elements.set(id,{id,children:[],value:0,hidden:false,textContent:'',innerHTML:'',style:{},dataset:{},classList:{remove(){},add(){}},getContext:()=>context2d,addEventListener(){},setAttribute(){},appendChild(b){this.children.push(b)},focus(){}});return elements.get(id)}
Object.assign(ctx,{document:{getElementById:element,querySelectorAll:()=>[],createElement:()=>element('new'+Math.random()),addEventListener(){}},window:{},performance:{now:()=>0},requestAnimationFrame(){},addEventListener(){},setTimeout(){},console,Math});
vm.createContext(ctx);vm.runInContext(source,ctx);const s=ctx.sim;s.companion.enabled=false;
function action(seconds,...codes){s.clearHeld();for(const k of codes)s.setHeld(k,'test',true);for(let i=0;i<Math.round(seconds*120);i++){s.update(1/120);s.just.clear();if(s.win)break;}s.clearHeld();return snap();}
function snap(){return {hog:[s.hog.x,s.hog.y,s.hog.vx,s.hog.vy].map(Math.round),dog:[s.dog.x,s.dog.y].map(Math.round),air:+s.dog.air.toFixed(2),state:s.dog.state,ball:s.hog.ball,walls:s.walls.map(w=>w.alive),cp:s.checkpoint?.index??null,sw:s.switches.map(p=>p.on),hurt:+s.hurt.toFixed(2),stats:{...s.stats},win:s.win};}
function log(label){console.log(label,JSON.stringify(snap()));}
function settle(){action(.12)}

function hTo(x,roll=false,max=15){let t=0;while(Math.abs(s.hog.x-x)>6&&!s.win&&!s.hurt&&t<max){action(.04,s.hog.x<x?'ArrowRight':'ArrowLeft',...(roll?['ShiftLeft']:[]));t+=.04;}action(.12);return msnap();}
function dTo(x,max=15){let t=0;while(Math.abs(s.dog.x-x)>6&&!s.win&&!s.hurt&&s.dog.state==='ok'&&!s.dog.riding&&t<max){action(.04,s.dog.x<x?'KeyD':'KeyA');t+=.04;}action(.12);return msnap();}
function bothTo(x,roll=false,max=25){let t=0;while(!s.win&&!s.hurt&&s.dog.state==='ok'&&t<max){const keys=[];if(s.hog.x<x-4)keys.push('ArrowRight');if(!s.dog.riding&&s.dog.x<Math.min(x-55,s.hog.x-80))keys.push('KeyD');if(roll)keys.push('ShiftLeft');if(!keys.length||keys.length===1&&keys[0]==='ShiftLeft'){action(.2);if(!s.win)break;}else action(.04,...keys);t+=.04;}action(.15);return msnap();}
function msnap(){return {...snap(),stack:s.memo?.stack,gas:[s.dog.gas,s.hog.gas].map(x=>+(x||0).toFixed(3)),bloat:+s.hog.bloat.toFixed(2),ride:s.dog.riding,charge:+(s.dog.charge||0).toFixed(2),cling:s.dog.cling,objects:s.memo?.objects.map(p=>[p.id,p.done,+(p.progress||0).toFixed(2)]),water:s.memo?.water?.y};}
function ml(label){console.log(label,JSON.stringify(msnap()));}
function memoDone(label){ml(label);assert(s.win,label+' must be completable');for(const k of ['hog','over','spike','cactus','thorn','fall','timeout','cat','rail'])assert.equal(s.stats[k],0,label+' safe: '+k);}

for(let n=8;n<16;n++){s.loadLevel(n);action(.1);
if(n===8){hTo(355,true);ml('picked');dTo(s.hog.x-50);assert(s.dog.riding);ml('seated');bothTo(1320);memoDone('09 Apple carry over thumbtacks');}
if(n===9){hTo(412,true);assert.equal(s.memo.stack,3);dTo(s.hog.x-50);assert(s.dog.riding);hTo(755);action(1.5,'Slash');ml('lamp job');assert(s.memo.objects[0].done);action(.03,'Slash');hTo(960);action(1,'KeyS');bothTo(1370,true);memoDone('10 Three-apple stable high work');}
if(n===10){action(2.7,'ArrowDown');ml('puffer');for(let t=0;t<1.3;t+=.04)action(.04,'ArrowRight','KeyD');ml('at cling wall');action(.03,'Slash');assert(s.dog.cling);for(let t=0;t<12&&!s.win&&!s.hurt;t+=.04)action(.04,'KeyD','ArrowRight');ml('wind climb');memoDone('11 Puffer in wind, flat dog on static wall');}
if(n===11){action(1.9,'ArrowDown');bothTo(630);action(.03,'KeyF');ml('drain plugged');assert(s.memo.water.plugged);action(8.5);ml('water high');dTo(760);action(.03,'KeyF');action(.3,'Digit0');for(let t=0;t<8&&!s.win&&!s.hurt;t+=.04){const keys=[];if(s.hog.x<1320)keys.push('ArrowRight');if(s.dog.x<Math.min(1360,s.hog.x+155))keys.push('KeyD');action(.04,...keys);}memoDone('12 Water elevator, drain plug and escape');}
if(n===12){action(2.4,'ArrowDown');bothTo(700);ml('cage approach');action(.03,'KeyF');ml('cage popped');assert(s.memo.objects[0].done);action(.5);action(.03,'KeyF');assert(s.memo.keys);bothTo(1100);action(.03,'KeyF');bothTo(1340);memoDone('13 Long puffer spines and falling key');}
if(n===13){action(.8,'ArrowDown');bothTo(1470);memoDone('14 Quiet flat dog past sleeping cat');assert(!s.memo.cats[0].awake);}
if(n===14){for(let t=0;t<40&&!s.win&&!s.hurt;t+=.04){const x=s.memo.rail.x,keys=[];if(x>350&&x<630||x>990&&x<1270)keys.push('Digit0');if(s.memo.rail.done)break;action(.04,...keys);}action(.9,'KeyD','KeyS');hTo(1580);memoDone('15 Moving pulley and alternating clearances');}
if(n===15){bothTo(420);ml('fridge approach');action(.03,'KeyF');action(2.2);assert(s.memo.water.frozen);bothTo(550);ml('ice takeoff');action(.8,'ArrowRight','ArrowUp');action(.65,'KeyD','Space');ml('on ice');bothTo(1050);action(.6,'ArrowRight','ArrowUp');action(.65,'KeyD','Space');action(.6,'ArrowDown');bothTo(1500,true);memoDone('16 Freeze the water, distribute air before oven');}
s.render();


}
assert.equal(s.levels.length,19,'three practice rooms append after the existing sixteen');
for(let i=8;i<16;i++){s.loadLevel(i);action(.1);s.render();assert(Number.isFinite(s.dog.x)&&Number.isFinite(s.hog.y));assert(Math.abs(s.memoTotalAir()-s.level.budget)<1e-7);}
s.loadLevel(8);const hx=s.hog.x,dx=s.dog.x;action(.15,'KeyD');assert(s.dog.x>dx+10);assert(Math.abs(s.hog.x-hx)<2,'A/D belongs only to the dog');
s.loadLevel(8);const x=s.dog.x;action(.15,'ArrowRight');assert(s.hog.x>260);assert(Math.abs(s.dog.x-x)<2,'arrow keys belong only to the hedgehog');
hTo(440);let total=s.memoTotalAir(),old=s.dog.gas;action(.25,'KeyF');assert.equal(s.dog.gas,old,'F must not transfer gas');action(.25,'KeyW');assert(s.dog.gas>old);assert(Math.abs(s.memoTotalAir()-total)<1e-8);old=s.hog.gas;action(.65,'ArrowDown');assert(s.hog.gas>old,'dog down arrow returns air to hedgehog');assert(Math.abs(s.memoTotalAir()-total)<1e-8);
s.loadLevel(8);action(4,'KeyW');assert(s.dog.gas<=.24+1e-9,'low-air room cannot manufacture enough air to fly');assert(Math.abs(s.memoTotalAir()-.24)<1e-8);action(.2,'KeyS');assert(s.memoTotalAir()<.24,'venting must spend air');
s.loadLevel(9);s.memo.stack=3;Object.assign(s.hog,{x:700,y:445,ground:true});Object.assign(s.dog,{x:700,y:335,ground:true,riding:true});total=s.memoTotalAir();old=s.dog.air;action(1.5);assert(s.dog.air>old+.05,'heat changes volume');assert(Math.abs(s.memoTotalAir()-total)<1e-8,'temperature does not create air');
s.loadLevel(9);hTo(412,true);dTo(s.hog.x-50);assert(s.dog.riding);assert(s.dog.riding);hTo(755);action(.5,'Slash');assert(s.memo.objects[0].progress>.3&&!s.memo.objects[0].done);action(.1,'Slash','ArrowRight');assert.equal(s.memo.objects[0].progress,0,'moving resets precision work');
action(.03,'ArrowUp');assert.equal(s.memo.stack,0,'jumping must drop the apples');assert(!s.dog.riding,'the seat is a physical point, not immunity');
s.loadLevel(12);Object.assign(s.hog,{x:700,y:445,gas:.16,bloat:0});Object.assign(s.dog,{x:600,y:430,gas:.25,air:.25});action(.03,'KeyF');assert(!s.memo.objects[0].done,'ordinary hedgehog cannot reach the cage balloon');
s.loadLevel(11);Object.assign(s.dog,{x:650,y:465,gas:0,air:0,charge:1,cling:{path:0,s:0}});action(.03);assert.equal(s.dog.charge,0);assert(!s.dog.cling,'water immediately discharges static');
s.loadLevel(13);Object.assign(s.hog,{x:600,y:445});Object.assign(s.dog,{x:500,y:453,gas:0,air:0});action(2,'ShiftLeft','ArrowRight');assert(s.memo.cats[0].awake,'loud rolling must wake the sleeping cat');
s.loadLevel(14);action(.1);const dogY=s.dog.y,hogY=s.hog.y;action(1.8,'Digit0');assert(s.dog.y>dogY+70&&s.hog.y<hogY-100,'reeling changes both sides of the pulley');assert(Math.hypot(s.dog.x-s.hog.x,s.dog.y-s.hog.y)>85);
console.log('Independent F and / controls, fixed air, thermal volume, apple fragility, stable work, long spines, static discharge, cat noise and pulley coupling passed');


// Regression: landing animation must not leave either character flattened.
s.loadLevel(8);
action(.08,'ArrowUp');
for(let i=0;i<240&&!s.hog.ground;i++)action(1/120);
assert(s.hog.ground&&s.hog.squash>.1,'landing should still have a brief squash');
action(.65);
assert(Math.abs(s.hog.squash)<.001,'hedgehog must recover its normal proportions after landing');
s.loadLevel(8);Object.assign(s.dog,{y:320,vy:350,ground:false});
for(let i=0;i<240&&!s.dog.ground;i++)action(1/120);
assert(s.dog.ground&&s.dog.squash>.1,'dog landing should still animate');
action(.65);
assert(Math.abs(s.dog.squash)<.001,'dog must recover its proportions after landing');
s.loadLevel(14);s.hog.squash=.25;s.dog.squash=.2;action(.65);
assert(Math.abs(s.hog.squash)<.001&&Math.abs(s.dog.squash)<.001,'pulley motion must also recover the animation');
console.log('Landing squash recovers for both characters, including pulley motion');

// The three safe lessons must be completable through the advertised keyboard actions.
s.loadLevel(16);action(.6,'ArrowRight');action(.6,'KeyD');
action(.08,'ArrowUp');action(.8);action(.5,'ShiftLeft','ArrowRight');action(.8);
assert(s.memo.objects.every(p=>p.done),'movement lesson records each separate character action');
bothTo(1130);memoDone('Practice 1: independent movement and jumps');
s.loadLevel(17);action(1.3,'KeyW');assert(s.memo.objects[0].done);
action(.9,'KeyS');assert(s.memo.objects[1].done);
action(.9,'ArrowDown');assert(s.memo.objects[2].done);
action(1.8,'Digit0');assert(s.memo.objects[3].done);
bothTo(1190);memoDone('Practice 2: transfer, vent, return and reel');
s.loadLevel(18);hTo(365,true);action(1.2,'KeyD');
assert(s.dog.riding,'approaching an apple seat mounts without pressing /');
action(.5,'KeyD');assert(s.dog.riding,'holding the approach key does not immediately undo boarding');
action(.1);hTo(725);action(1.3,'Slash');assert(s.memo.objects[0].done);
action(.08,'Space');assert(!s.dog.riding,'Space gets the dog off the seat');
hTo(980);action(.03,'KeyF');assert(s.memo.objects[1].done);
bothTo(1260);memoDone('Practice 3: automatic apple seat and separate object controls');
s.loadLevel(0);const beforeF=s.dog.air;action(.3,'KeyF');
assert(s.dog.air<=beforeF,'F cannot inflate the dog in classic rooms either');
console.log('All three safe practice routes, automatic boarding, intentional dismount and F action isolation passed');

// Physical single-player controls: these routes never move the dog with arrow keys.
s.companion.enabled=true;
function playerAction(seconds,...codes){s.clearHeld();for(const code of codes)s.setPlayerHeld(code,'player-test',true);for(let i=0;i<Math.round(seconds*120);i++){s.update(1/120);s.just.clear();if(s.win)break;}s.clearHeld();}
function playerWalk(x,roll=false,max=30){let t=0;while(Math.abs(s.hog.x-x)>7&&!s.hurt&&!s.win&&s.dog.state==='ok'&&t<max){playerAction(.04,s.hog.x<x?'KeyD':'KeyA',...(roll?['ShiftLeft']:[]));t+=.04;}playerAction(.3);}
function playerDone(label){ml(label);assert(s.win,label+' must be completable with the dog following');assert.equal(s.stats.hog,0);assert.equal(s.stats.fall,0);}
s.loadLevel(16);const begin=s.dog.x;playerAction(.65,'KeyD');assert(s.hog.x>430);playerAction(.08,'Space');playerAction(.8);playerAction(.5,'ShiftLeft','KeyD');
assert(s.dog.x>begin+20,'dog follows without its own movement input');assert(s.memo.objects.every(p=>p.done));playerWalk(1130);playerAction(2);playerDone('Solo practice 1: D, Space, Shift; automatic dog');
s.loadLevel(17);playerAction(1.3,'KeyW');playerAction(.9,'KeyS');playerAction(.9,'ArrowDown');playerAction(1.8,'Digit0');playerWalk(1190);playerAction(2);playerDone('Solo practice 2: W/S, down arrow and 0');
s.loadLevel(18);playerWalk(365,true);playerAction(2);assert(s.dog.riding,'dog follows and automatically boards');playerWalk(725);playerAction(1.3,'Slash');assert(s.memo.objects[0].done);playerAction(.05,'Slash');playerWalk(980);playerAction(.03,'KeyF');playerWalk(1260);playerAction(2);playerDone('Solo practice 3: automatic seat, Slash job, F object');
s.loadLevel(8);playerWalk(355,true);playerAction(2);assert(s.dog.riding);playerWalk(1320);playerDone('Solo 09: carry without dog steering');
s.loadLevel(9);playerWalk(412,true);playerAction(2);assert(s.dog.riding);playerWalk(755);playerAction(1.5,'Slash');playerAction(.04,'Slash');playerWalk(960);playerAction(1,'KeyS');playerWalk(1370,true);playerAction(2);playerDone('Solo 10: high work and automatic follow');
s.loadLevel(10);playerAction(2.7,'ArrowDown');playerWalk(575);playerAction(.3);ml('Solo 11 at wall');playerAction(.04,'Slash');assert(s.dog.cling);playerWalk(1320);playerAction(2);playerDone('Solo 11: dog climbs automatically');
s.loadLevel(12);playerAction(2.4,'ArrowDown');playerWalk(700);playerAction(.04,'KeyF');playerAction(.5);playerAction(.04,'KeyF');playerWalk(1100);playerAction(.04,'KeyF');playerWalk(1340);playerAction(2);playerDone('Solo 13: cage, key and following');
s.loadLevel(13);playerAction(.8,'ArrowDown');playerWalk(1470);playerAction(2);playerDone('Solo 14: quiet automatic follower');assert(!s.memo.cats[0].awake);
s.loadLevel(11);playerAction(1.65,'ArrowDown');playerWalk(630);playerAction(.04,'KeyF');assert(s.memo.water.plugged);playerAction(8.5);playerAction(.04,'KeyF');playerAction(.3,'Digit0');playerWalk(1320);playerAction(2);playerDone('Solo 12: dog swims ahead, water exit');
s.loadLevel(14);for(let t=0;t<40&&!s.win&&!s.hurt;t+=.04){const x=s.memo.rail.x;playerAction(.04,...((x>350&&x<630||x>990&&x<1270)?['Digit0']:[]));if(s.memo.rail.done)break;}playerAction(.9,'KeyS');playerWalk(1580);playerAction(2);playerDone('Solo 15: pulley and automatic exit');
s.loadLevel(15);playerWalk(420);playerAction(.04,'KeyF');playerAction(2.2);playerWalk(550);playerAction(.8,'KeyD','Space');playerAction(.6);ml('Solo 16 on ice');playerWalk(1050);playerAction(.6,'KeyD','Space');playerAction(.6,'ArrowDown');playerWalk(1500,true);playerAction(2);playerDone('Solo 16: dog follows jumps onto ice');
console.log('Single-player physical controls and all eight automatic companion routes passed');
