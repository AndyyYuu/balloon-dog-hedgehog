const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../archive/solo-before-easy.html'),'utf8');
let source=html.split('<script>')[1].split('</script>')[0];
source=source.replace('loadLevel(16);requestAnimationFrame(frame);','globalThis.sim={ropeRoute,pathLength,hogScale,hogHalf,fanOn,setBloat,loadLevel,update,setHeld,setPlayerHeld,clearHeld,pop,revive,reset,setAir,render,resolve,dogTouchesSpikes,hogTouchesSpikes,dogCollisionCapsules,capsuleHitsTriangle,setActor,interact,device,powered,get charges(){return charges},get activeRole(){return activeRole},get ropeShort(){return ropeShort},get spikeTeeth(){return spikeTeeth},get solids(){return solids},get dog(){return dog},get hog(){return hog},get walls(){return walls},get stats(){return stats},get checkpoint(){return checkpoint},get win(){return win},get ropeLen(){return ropeLen},get level(){return L},get just(){return just},get hurt(){return hurt},get switches(){return switches},get gates(){return gates},get cameraX(){return cameraX}};loadLevel(0);');
const elements=new Map();
const ctx={};
const context2d=new Proxy({measureText:s=>({width:String(s).length*10})},{get:(o,k)=>o[k]||(()=>{})});
function element(id){if(!elements.has(id))elements.set(id,{id,children:[],value:0,hidden:false,textContent:'',innerHTML:'',style:{},dataset:{},classList:{remove(){},add(){}},getContext:()=>context2d,addEventListener(){},setAttribute(){},appendChild(b){this.children.push(b)},focus(){}});return elements.get(id)}
Object.assign(ctx,{document:{getElementById:element,querySelectorAll:()=>[],createElement:()=>element('new'+Math.random()),addEventListener(){}},window:{},performance:{now:()=>0},requestAnimationFrame(){},addEventListener(){},setTimeout(){},console,Math});
vm.createContext(ctx);vm.runInContext(source,ctx);const s=ctx.sim;
function action(seconds,...codes){s.clearHeld();for(const k of codes)s.setPlayerHeld(k,'test',true);for(let i=0;i<Math.round(seconds*120);i++){s.update(1/120);s.just.clear();if(s.win)break;}s.clearHeld();return snap();}
function snap(){return {hog:[s.hog.x,s.hog.y,s.hog.vx,s.hog.vy].map(Math.round),dog:[s.dog.x,s.dog.y].map(Math.round),air:+s.dog.air.toFixed(2),state:s.dog.state,ball:s.hog.ball,walls:s.walls.map(w=>w.alive),cp:s.checkpoint?.index??null,sw:s.switches.map(p=>p.on),hurt:+s.hurt.toFixed(2),stats:{...s.stats},win:s.win};}
function log(label){console.log(label,JSON.stringify(snap()));}
function settle(){action(.12)}
function walkTo(x,roll=false,max=20){let t=0;while(s.hog.x<x&&!s.win&&t<max&&!s.hurt){action(.05,'KeyD',...(roll?['ShiftLeft']:[]));t+=.05;}action(.16);return snap();}
function pumpTo(a){let t=0;while(Math.abs(s.dog.air-a)>.012&&t<7&&!s.hurt){action(.05,s.dog.air<a?'KeyW':'KeyS');t+=.05;}return snap();}
function flyTo(x,y=290,reel=false,max=20){let t=0;while(s.hog.x<x&&!s.win&&t<max&&!s.hurt&&s.dog.state==='ok'){
 const fan=s.level.fans?.find(f=>s.dog.x>f.x-5&&s.dog.x<f.x+f.w&&(f.switch===undefined||s.switches[f.switch].on));
 const p=fan?.p||0,neutral=(2250-.4*p)/(3200+p);
 const target=Math.max(.25,Math.min(.90,neutral+(s.hog.y-y)*.0022+s.hog.vy*.0012));
 const codes=[];if(s.hog.y<y+18)codes.push('KeyD');if(reel)codes.push('KeyE');if(s.dog.air<target-.012)codes.push('KeyW');else if(s.dog.air>target+.012)codes.push('KeyS');
 action(.08,...codes);t+=.08;
 }return snap();}
function land(){action(2.3,'KeyS');return snap();}
function done(label){log(label);assert(s.win,label+' must be completable');assert.equal(s.stats.thorn,0,label+' must avoid cactus contact');assert.equal(s.stats.fall,0,label+' must avoid falling');assert.equal(s.stats.spike,0,label+' must avoid roof spikes');assert.equal(s.stats.cactus,0,label+' must keep the dog clear');assert.equal(s.stats.hog,0,label+' must avoid automatic self collisions');}
flyTo=function(x,y=280,_unused=false,max=30){let t=0;while(s.hog.x<x&&!s.win&&t<max&&!s.hurt&&s.dog.state==='ok'){
 const fanUp=(s.level.fans||[]).filter(f=>s.fanOn(f)&&s.dog.x>f.x&&s.dog.x<f.x+f.w&&s.dog.y>f.y&&s.dog.y<f.y+f.h&&!f.ductY).reduce((n,f)=>n-f.p*f.dy,0);
 const neutral=(2250-.4*fanUp)/(3200+fanUp),target=Math.max(.25,Math.min(.9,neutral+(s.hog.y-y)*.0032+s.hog.vy*.002));
 const keys=[];const bed=(s.level.beds||[]).find(b=>s.hog.x>b.x-85&&s.hog.x<b.x+b.w+25),limit=bed?Math.min(y+14,bed.base-bed.h-35):y+14;
 if(s.hog.y<limit)keys.push('KeyD');
 if(s.dog.air<target-.008)keys.push('KeyW');else if(s.dog.air>target+.008)keys.push('KeyS');action(.05,...keys);t+=.05;
 }return snap();};
function rope(short){if(s.ropeShort!==short)action(.02,'KeyE');}
function commandTo(id,{flat=false}={}){
 const p=s.device(id);rope(false);pumpTo(.54);action(.03,'Slash');assert(s.dog.task||s.dog.docked===id||p.on,'F should launch a nearby action: '+id);
 for(let t=0;t<18&&s.dog.task&&!s.hurt;t+=.05){const keys=[];
  if(flat&&s.dog.task.step>=1&&s.dog.air>.001)keys.push('KeyS');
  else if(!flat&&s.dog.air<.48)keys.push('KeyW');
  action(.05,...keys);
 }
 assert(p.on||s.dog.docked===id,'dog must physically reach '+id);return snap();
}
function recall(){if(s.dog.docked||s.dog.task)action(.03,'Slash');}
function grow(a=.85){rope(true);pumpTo(.8);action((a/(.28*1.8))+.38,'ArrowDown');assert(s.hog.bloat>a-.05,'backflow should grow the hedgehog');}
function finish(label){if(!s.win)action(1.5);log(label);assert(s.win,label+' must finish');for(const k of ['hog','over','spike','cactus','thorn','fall','timeout'])assert.equal(s.stats[k],0,label+' safe route: '+k);}

for(let n=0;n<8;n++){s.loadLevel(n);
if(n===0){commandTo('paw');walkTo(635,true);assert(s.device('pin').latched);recall();action(1.5,'KeyS');walkTo(1200);finish('01 Quick action and handoff');}
if(n===1){walkTo(395,true);walkTo(455);rope(true);flyTo(1370,270);log("wind landing approach");land();log("wind landing");walkTo(1740,true);finish('02 Wind, cactus, gap, narrow tunnel and balloon wall');}
if(n===2){walkTo(620);commandTo('window',{flat:true});walkTo(1045,true);assert(s.device('pin').latched);recall();action(.5,'KeyS');walkTo(1400);finish('03 High vent for the flat dog');}
if(n===3){walkTo(510);commandTo('high');walkTo(835,true);assert(s.device('pin').latched);recall();rope(true);pumpTo(.36);walkTo(1170);action(1.5,'KeyS');walkTo(1330);flyTo(1590,270);rope(false);pumpTo(.45);walkTo(1950);log("beam flight");land();walkTo(2240);finish('04 Routed hose, reel under spikes, lift over cactus');}
if(n===4){walkTo(395);rope(true);flyTo(930,280);log("hot crossing");land();walkTo(1010);flyTo(1590,235);log("cold crossing");land();walkTo(1990,true);finish('05 Thermal expansion, contraction and opposing wind');}
if(n===5){grow();walkTo(610);action(1.1);assert(s.device('weight').latched);walkTo(1250,true);assert(!s.walls[0].alive);action(3.4,'KeyS');walkTo(1760,true);finish('06 Backflow, heavy plate, reinforced wall, shrinking');}
if(n===6){walkTo(390);commandTo('timer');rope(true);flyTo(990,275);action(1.7,'KeyS');walkTo(1135,true);assert(s.device('pin').latched);walkTo(1310);rope(false);commandTo('exit');walkTo(1840);finish('07 Timed wind relay');}
if(n===7){walkTo(590);commandTo('window',{flat:true});walkTo(910,true);assert(s.device('pin').latched);recall();walkTo(1020);rope(true);flyTo(1900,260);log("final wind");land();rope(false);pumpTo(.45);walkTo(2405);action(2,'KeyS');log("before final grow");grow();walkTo(2405);action(1.1);walkTo(2640,true);assert(!s.walls[0].alive);action(3.5,'KeyS');walkTo(3050,true);commandTo('reunion');action(2.5);finish('08 Combined route');}
s.render();

}
// Behavioral checks complement complete keyboard-only routes.

for(let i=0;i<8;i++){s.loadLevel(i);action(.35);s.render();assert.equal(s.activeRole,'hog');assert.equal(s.stats.hog,0);assert.equal(s.stats.fall,0);}
s.loadLevel(0);pumpTo(.54);action(.03,'Slash');assert(s.dog.task);const before=s.hog.x;action(.25,'KeyD');assert(s.hog.x>before+20,'F must never transfer movement controls to the dog');assert.equal(s.activeRole,'hog');assert.equal(s.stats.swaps,0);action(.03,'Slash');assert(!s.dog.task&&!s.dog.docked,'F again recalls/cancels');
s.loadLevel(0);rope(true);action(.03,'Slash');assert(!s.dog.task,'short hose must not silently extend to reach a high target');assert(s.ropeShort);
s.loadLevel(2);walkTo(620);rope(false);pumpTo(.54);action(.03,'Slash');action(4);assert(!s.device('window').on,'a full-sized dog must not bypass the narrow high vent');assert(s.dog.x<520,'the physical wall must block the dog');action(1.2,'KeyS');action(4);assert(s.dog.docked==='window','a flat dog must fit through the high vent');
s.loadLevel(3);const a={x:600,y:185},b={x:620,y:445},route=s.ropeRoute(a,b);assert(route.length>2,'the hose must wrap around the crossbeam');assert(s.pathLength(route)>Math.hypot(b.x-a.x,b.y-a.y)+10);
s.loadLevel(5);const feet=s.hog.y+s.hogHalf();pumpTo(.8);const air=s.dog.air;action(1,'ArrowDown');assert(s.hog.bloat>.25&&s.hogScale()>1.3);assert(s.dog.air<air-.15,'growing must consume actual balloon air');assert(Math.abs(s.hog.y+s.hogHalf()-feet)<1,'growing must preserve ground contact');const size=s.hog.bloat;action(.5,'KeyS');assert(s.hog.bloat<size-.2,'S must shrink the hedgehog');
// Ordinary rolling cannot open the counterweight press or reinforced wall.
s.loadLevel(5);Object.assign(s.hog,{x:610,y:445,vx:0,vy:0,ground:true});action(1.2);assert(!s.device('weight').on);
Object.assign(s.hog,{x:1080,y:447,vx:250,vy:0,ground:true,ball:true});Object.assign(s.dog,{x:990,y:453,air:0,ground:true});action(.4,'KeyD','ShiftLeft');assert(s.walls[0].alive,'reinforced walls require giant rolling');
// Identical initial air changes in opposite directions in the two climates.
function climate(x){s.loadLevel(4);Object.assign(s.hog,{x,y:445,vx:0,vy:0,ground:true});Object.assign(s.dog,{x:x-60,y:270,air:.55,vx:0,vy:0,ground:false});action(.3);return s.dog.air;}
assert(climate(540)>.57);assert(climate(1120)<.53);
// Timed commands start only upon arrival, and expiry recovers safely.
s.loadLevel(6);walkTo(390);commandTo('timer');assert(s.device('timer').remaining>11);action(12.1);assert.equal(s.stats.timeout,1);action(.7);assert(!s.hurt&&!s.device('pin').latched&&!s.gates[0].on);
// A completed checkpoint restores durable progress and clears temporary tasks.
s.loadLevel(0);commandTo('paw');walkTo(635,true);recall();action(1.4,'KeyS');walkTo(850);assert(s.checkpoint);s.reset(false);assert(s.device('pin').latched&&s.gates[0].on);assert(!s.dog.task&&!s.dog.docked);assert.equal(s.hog.bloat,0);
console.log('Fixed controls, contextual F, real vent collision, routed rope, conserved transfer, mass locks, climates, timer recovery and checkpoint restoration passed');

