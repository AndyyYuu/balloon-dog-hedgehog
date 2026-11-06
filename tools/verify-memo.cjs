const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
let source=html.split('<script>')[1].split('</script>')[0];
source=source.replace('loadLevel(0);requestAnimationFrame(frame);','globalThis.sim={get memo(){return memo},get levels(){return LEVELS},memoTotalAir,memoDogAction,memoPigAction,ropeRoute,pathLength,hogScale,hogHalf,fanOn,setBloat,loadLevel,update,setHeld,clearHeld,pop,revive,reset,setAir,render,resolve,dogTouchesSpikes,hogTouchesSpikes,dogCollisionCapsules,capsuleHitsTriangle,setActor,interact,device,powered,get charges(){return charges},get activeRole(){return activeRole},get ropeShort(){return ropeShort},get spikeTeeth(){return spikeTeeth},get solids(){return solids},get dog(){return dog},get hog(){return hog},get walls(){return walls},get stats(){return stats},get checkpoint(){return checkpoint},get win(){return win},get ropeLen(){return ropeLen},get level(){return L},get just(){return just},get hurt(){return hurt},get switches(){return switches},get gates(){return gates},get cameraX(){return cameraX}};loadLevel(0);');
const elements=new Map();
const ctx={};
const context2d=new Proxy({measureText:s=>({width:String(s).length*10})},{get:(o,k)=>o[k]||(()=>{})});
function element(id){if(!elements.has(id))elements.set(id,{id,children:[],value:0,hidden:false,textContent:'',innerHTML:'',style:{},dataset:{},classList:{remove(){},add(){}},getContext:()=>context2d,addEventListener(){},setAttribute(){},appendChild(b){this.children.push(b)},focus(){}});return elements.get(id)}
Object.assign(ctx,{document:{getElementById:element,querySelectorAll:()=>[],createElement:()=>element('new'+Math.random()),addEventListener(){}},window:{},performance:{now:()=>0},requestAnimationFrame(){},addEventListener(){},setTimeout(){},console,Math});
vm.createContext(ctx);vm.runInContext(source,ctx);const s=ctx.sim;
function action(seconds,...codes){s.clearHeld();for(const k of codes)s.setHeld(k,'test',true);for(let i=0;i<Math.round(seconds*120);i++){s.update(1/120);s.just.clear();if(s.win)break;}s.clearHeld();return snap();}
function snap(){return {hog:[s.hog.x,s.hog.y,s.hog.vx,s.hog.vy].map(Math.round),dog:[s.dog.x,s.dog.y].map(Math.round),air:+s.dog.air.toFixed(2),state:s.dog.state,ball:s.hog.ball,walls:s.walls.map(w=>w.alive),cp:s.checkpoint?.index??null,sw:s.switches.map(p=>p.on),hurt:+s.hurt.toFixed(2),stats:{...s.stats},win:s.win};}
function log(label){console.log(label,JSON.stringify(snap()));}
function settle(){action(.12)}

function hTo(x,roll=false,max=15){let t=0;while(Math.abs(s.hog.x-x)>6&&!s.win&&!s.hurt&&t<max){action(.04,s.hog.x<x?'ArrowRight':'ArrowLeft',...(roll?['ShiftLeft']:[]));t+=.04;}action(.12);return msnap();}
function dTo(x,max=15){let t=0;while(Math.abs(s.dog.x-x)>6&&!s.win&&!s.hurt&&s.dog.state==='ok'&&t<max){action(.04,s.dog.x<x?'KeyD':'KeyA');t+=.04;}action(.12);return msnap();}
function bothTo(x,roll=false,max=25){let t=0;while(!s.win&&!s.hurt&&s.dog.state==='ok'&&t<max){const keys=[];if(s.hog.x<x-4)keys.push('ArrowRight');if(!s.dog.riding&&s.dog.x<Math.min(x-55,s.hog.x-80))keys.push('KeyD');if(roll)keys.push('ShiftLeft');if(!keys.length||keys.length===1&&keys[0]==='ShiftLeft'){action(.2);if(!s.win)break;}else action(.04,...keys);t+=.04;}action(.15);return msnap();}
function msnap(){return {...snap(),stack:s.memo?.stack,gas:[s.dog.gas,s.hog.gas].map(x=>+(x||0).toFixed(3)),bloat:+s.hog.bloat.toFixed(2),ride:s.dog.riding,charge:+(s.dog.charge||0).toFixed(2),cling:s.dog.cling,objects:s.memo?.objects.map(p=>[p.id,p.done,+(p.progress||0).toFixed(2)]),water:s.memo?.water?.y};}
function ml(label){console.log(label,JSON.stringify(msnap()));}
function memoDone(label){ml(label);assert(s.win,label+' must be completable');for(const k of ['hog','over','spike','cactus','thorn','fall','timeout','cat','rail'])assert.equal(s.stats[k],0,label+' safe: '+k);}

for(let n=8;n<16;n++){s.loadLevel(n);action(.1);
if(n===8){hTo(355,true);ml('picked');dTo(s.hog.x-90);action(.03,'Slash');ml('seated');bothTo(1320);memoDone('09 Apple carry over thumbtacks');}
if(n===9){hTo(412,true);assert.equal(s.memo.stack,3);dTo(s.hog.x-90);action(.03,'Slash');hTo(755);action(1.5,'Slash');ml('lamp job');assert(s.memo.objects[0].done);action(.03,'Slash');hTo(960);action(1,'KeyS');bothTo(1370,true);memoDone('10 Three-apple stable high work');}
if(n===10){action(2.7,'Slash');ml('puffer');for(let t=0;t<1.3;t+=.04)action(.04,'ArrowRight','KeyD');ml('at cling wall');action(.03,'Slash');assert(s.dog.cling);for(let t=0;t<12&&!s.win&&!s.hurt;t+=.04)action(.04,'KeyD','ArrowRight');ml('wind climb');memoDone('11 Puffer in wind, flat dog on static wall');}
if(n===11){action(1.9,'Slash');bothTo(630);action(.03,'KeyF');ml('drain plugged');assert(s.memo.water.plugged);action(8.5);ml('water high');dTo(760);action(.03,'KeyF');action(.3,'Digit0');for(let t=0;t<8&&!s.win&&!s.hurt;t+=.04){const keys=[];if(s.hog.x<1320)keys.push('ArrowRight');if(s.dog.x<Math.min(1360,s.hog.x+155))keys.push('KeyD');action(.04,...keys);}memoDone('12 Water elevator, drain plug and escape');}
if(n===12){action(2.4,'Slash');bothTo(700);ml('cage approach');action(.03,'KeyF');ml('cage popped');assert(s.memo.objects[0].done);action(.5);action(.03,'KeyF');assert(s.memo.keys);bothTo(1100);action(.03,'KeyF');bothTo(1340);memoDone('13 Long puffer spines and falling key');}
if(n===13){action(.8,'Slash');bothTo(1470);memoDone('14 Quiet flat dog past sleeping cat');assert(!s.memo.cats[0].awake);}
if(n===14){for(let t=0;t<40&&!s.win&&!s.hurt;t+=.04){const x=s.memo.rail.x,keys=[];if(x>350&&x<630||x>990&&x<1270)keys.push('Digit0');if(s.memo.rail.done)break;action(.04,...keys);}action(.9,'KeyD','KeyS');hTo(1580);memoDone('15 Moving pulley and alternating clearances');}
if(n===15){bothTo(420);ml('fridge approach');action(.03,'KeyF');action(2.2);assert(s.memo.water.frozen);bothTo(550);ml('ice takeoff');action(.8,'ArrowRight','ArrowUp');action(.65,'KeyD','Space');ml('on ice');bothTo(1050);action(.6,'ArrowRight','ArrowUp');action(.65,'KeyD','Space');action(.6,'Slash');bothTo(1500,true);memoDone('16 Freeze the water, distribute air before oven');}
s.render();


}
assert.equal(s.levels.length,16,'new rooms must append to the original eight');
for(let i=8;i<16;i++){s.loadLevel(i);action(.1);s.render();assert(Number.isFinite(s.dog.x)&&Number.isFinite(s.hog.y));assert(Math.abs(s.memoTotalAir()-s.level.budget)<1e-7);}
s.loadLevel(8);const hx=s.hog.x,dx=s.dog.x;action(.15,'KeyD');assert(s.dog.x>dx+10);assert(Math.abs(s.hog.x-hx)<2,'A/D belongs only to the dog');
s.loadLevel(8);const x=s.dog.x;action(.15,'ArrowRight');assert(s.hog.x>260);assert(Math.abs(s.dog.x-x)<2,'arrow keys belong only to the hedgehog');
hTo(440);let total=s.memoTotalAir(),old=s.dog.gas;action(.25,'KeyF');assert(s.dog.gas>old);assert(Math.abs(s.memoTotalAir()-total)<1e-8);old=s.hog.gas;action(.65,'Slash');assert(s.hog.gas>old,'dog / returns air to hedgehog');assert(Math.abs(s.memoTotalAir()-total)<1e-8);
s.loadLevel(8);action(4,'KeyW');assert(s.dog.gas<=.24+1e-9,'low-air room cannot manufacture enough air to fly');assert(Math.abs(s.memoTotalAir()-.24)<1e-8);action(.2,'KeyS');assert(s.memoTotalAir()<.24,'venting must spend air');
s.loadLevel(9);s.memo.stack=3;Object.assign(s.hog,{x:700,y:445,ground:true});Object.assign(s.dog,{x:700,y:335,ground:true,riding:true});total=s.memoTotalAir();old=s.dog.air;action(1.5);assert(s.dog.air>old+.05,'heat changes volume');assert(Math.abs(s.memoTotalAir()-total)<1e-8,'temperature does not create air');
s.loadLevel(9);hTo(412,true);dTo(s.hog.x-90);action(.03,'Slash');assert(s.dog.riding);hTo(755);action(.5,'Slash');assert(s.memo.objects[0].progress>.3&&!s.memo.objects[0].done);action(.1,'Slash','ArrowRight');assert.equal(s.memo.objects[0].progress,0,'moving resets precision work');
action(.03,'ArrowUp');assert.equal(s.memo.stack,0,'jumping must drop the apples');assert(!s.dog.riding,'the seat is a physical point, not immunity');
s.loadLevel(12);Object.assign(s.hog,{x:700,y:445,gas:.16,bloat:0});Object.assign(s.dog,{x:600,y:430,gas:.25,air:.25});action(.03,'KeyF');assert(!s.memo.objects[0].done,'ordinary hedgehog cannot reach the cage balloon');
s.loadLevel(11);Object.assign(s.dog,{x:650,y:465,gas:0,air:0,charge:1,cling:{path:0,s:0}});action(.03);assert.equal(s.dog.charge,0);assert(!s.dog.cling,'water immediately discharges static');
s.loadLevel(13);Object.assign(s.hog,{x:600,y:445});Object.assign(s.dog,{x:500,y:453,gas:0,air:0});action(2,'ShiftLeft','ArrowRight');assert(s.memo.cats[0].awake,'loud rolling must wake the sleeping cat');
s.loadLevel(14);action(.1);const dogY=s.dog.y,hogY=s.hog.y;action(1.8,'Digit0');assert(s.dog.y>dogY+70&&s.hog.y<hogY-100,'reeling changes both sides of the pulley');assert(Math.hypot(s.dog.x-s.hog.x,s.dog.y-s.hog.y)>85);
console.log('Independent F and / controls, fixed air, thermal volume, apple fragility, stable work, long spines, static discharge, cat noise and pulley coupling passed');

