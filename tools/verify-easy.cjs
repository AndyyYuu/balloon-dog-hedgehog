const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const s=require('./simulation.cjs')();
const round=Number(process.argv[2]||1),step=[.04,.07,.09][round-1],pause=[.12,.25,.4][round-1];
assert(step,'choose round 1, 2 or 3');
const results=[];
function state(){return {hog:[s.hog.x,s.hog.y].map(Math.round),dog:[s.dog.x,s.dog.y].map(Math.round),air:+s.dog.air.toFixed(2),gas:[s.dog.gas,s.hog.gas],bloat:s.hog.bloat,ride:s.dog.riding,hurt:s.hurt,stats:{...s.stats},objects:s.memo?.objects.map(p=>[p.id,p.done,p.progress]),win:s.win};}
function action(seconds,...codes){s.clearHeld();for(const k of codes)s.setPlayerHeld(k,'route',true);for(let i=0;i<Math.round(seconds*120);i++){s.update(1/120);s.just.clear();if(s.hurt||s.dog.state!=='ok')throw new Error(`Room ${s.idx+1}, keys ${codes.join("+")}: ${JSON.stringify(state())}`);if(s.win)break;}s.clearHeld();}
function until(test,keys,max=30){let time=0;while(!test()&&!s.win&&!s.hurt&&s.dog.state==='ok'&&time<max){action(step,...keys());time+=step;}return test()||s.win;}
function walkTo(x,roll=false,max=30){until(()=>Math.abs(s.hog.x-x)<Math.max(7,step*180),()=>[s.hog.x<x?'KeyD':'KeyA',...(roll?['ShiftLeft']:[])],max);action(pause);}
function rope(short){if(s.ropeShort!==short)action(.02,'KeyE');}
function pumpTo(target){until(()=>Math.abs(s.dog.air-target)<.015,()=>[s.dog.air<target?'KeyW':'KeyS'],8);}
function flyTo(x,y=270,max=40){let t=0;while(s.hog.x<x&&!s.win&&!s.hurt&&s.dog.state==='ok'&&t<max){
 const up=(s.level.fans||[]).filter(f=>s.fanOn(f)&&s.dog.x>f.x&&s.dog.x<f.x+f.w&&s.dog.y>f.y&&s.dog.y<f.y+f.h&&!f.ductY).reduce((v,f)=>v-f.p*f.dy,0);
 const neutral=(2250-.4*up)/(3200+up),target=Math.max(.25,Math.min(.82,neutral+(s.hog.y-y)*.0032+s.hog.vy*.002));
 const bed=(s.level.beds||[]).find(b=>s.hog.x>b.x-85&&s.hog.x<b.x+b.w+25),limit=bed?Math.min(y+14,bed.base-bed.h-35):y+14;
 const keys=[];if(s.hog.y<limit)keys.push('KeyD');if(s.dog.air<target-.008)keys.push('KeyW');else if(s.dog.air>target+.008)keys.push('KeyS');action(step,...keys);t+=step;
 }}
function command(id,{flat=false}={}){const p=s.device(id);rope(false);pumpTo(.54);action(.04,'Slash');assert(s.dog.task||s.dog.docked===id||p.on,`launch ${id}: ${JSON.stringify(state())}`);until(()=>!s.dog.task,()=>flat&&s.dog.task?.step>=1?['KeyS']:s.dog.air<.48?['KeyW']:[],22);assert(p.on||s.dog.docked===id,`reach ${id}: ${JSON.stringify(state())}`);action(pause);}
function recall(){if(s.dog.docked||s.dog.task)action(.04,'Slash');}
function grow(){rope(true);pumpTo(.8);until(()=>s.hog.bloat>.49,()=>['ArrowDown'],5);action(pause);assert(s.hog.bloat>.45,'inflate hedgehog');}
function collect(count){until(()=>s.memo.stack>=count,()=>['KeyD','ShiftLeft'],8);action(1.8+pause);assert(s.dog.riding,`automatic apple seat: ${JSON.stringify(state())}`);}
function finish(){action(2);s.render();assert(s.win,`room ${s.idx+1} failed: ${JSON.stringify(state())}`);for(const k of ['hog','over','spike','cactus','thorn','fall','timeout','cat','rail'])assert.equal(s.stats[k]||0,0,`room ${s.idx+1}: ${k}`);results.push({room:s.idx+1,name:s.level.name,passed:true,stats:{...s.stats}});console.log(`PASS ${s.idx+1} ${s.level.name}`);}
assert.equal(s.levels.length,19);for(let i=0;i<19;i++){assert(s.levels[i].easy);assert(s.levels[i].easyNotes.length>=4);assert.notEqual(JSON.stringify(s.levels[i]),JSON.stringify(s.base[i]));}
for(let n=0;n<19;n++){s.loadLevel(n);action(.1);
 if(n===0){command('paw');walkTo(655,true);recall();action(1.5,'KeyS');walkTo(1220);}
 if(n===1){walkTo(395,true);walkTo(455);rope(true);flyTo(1370);action(2.3,'KeyS');walkTo(1740,true);}
 if(n===2){walkTo(620);command('window',{flat:true});walkTo(1045,true);recall();action(.6,'KeyS');walkTo(1400);}
 if(n===3){walkTo(510);command('high');walkTo(835,true);recall();rope(true);pumpTo(.36);walkTo(1170);action(1.5,'KeyS');walkTo(1330);flyTo(1590);rope(false);pumpTo(.45);walkTo(1950);action(2.3,'KeyS');walkTo(2240);}
 if(n===4){walkTo(395);rope(true);flyTo(930,280);action(2.3,'KeyS');walkTo(1010);flyTo(1590,235);action(2.3,'KeyS');walkTo(1990,true);}
 if(n===5){grow();walkTo(610);action(.7);walkTo(1250,true);action(3.4,'KeyS');walkTo(1760,true);}
 if(n===6){walkTo(390);command('timer');rope(true);flyTo(990,275);action(1.7,'KeyS');walkTo(1135,true);walkTo(1310);rope(false);command('exit');walkTo(1840);}
 if(n===7){walkTo(590);command('window',{flat:true});walkTo(910,true);recall();walkTo(1020);rope(true);flyTo(1900,260);action(2.3,'KeyS');rope(false);pumpTo(.45);walkTo(2405);action(2,'KeyS');grow();walkTo(2405);action(.7);walkTo(2640,true);action(3.5,'KeyS');walkTo(3050,true);command('reunion');action(1.2);}
 if(n===8){collect(1);walkTo(1320);}
 if(n===9){collect(2);walkTo(s.memo.objects[0].x);action(.3,'Slash');const partial=s.memo.objects[0].progress;assert(partial>.15,'work actually started');action(.1,'KeyD');assert(s.memo.objects[0].progress>partial-.1,'brief movement preserves work');action(1,'Slash');assert(s.memo.objects[0].done);action(.04,'Slash');walkTo(960);action(1,'KeyS');walkTo(1370,true);}
 if(n===10){until(()=>s.dog.air<=.12,()=>['ArrowDown'],5);walkTo(575);action(.3);action(.04,'Slash');assert(s.dog.cling);walkTo(1320);}
 if(n===11){until(()=>s.hog.bloat>.49,()=>['ArrowDown'],5);walkTo(630);action(.04,'KeyF');assert(s.memo.water.plugged);action(6);action(.04,'KeyF');action(.3,'Digit0');walkTo(1320);}
 if(n===12){until(()=>s.hog.bloat>.49,()=>['ArrowDown'],5);walkTo(700);action(.04,'KeyF');action(.7);assert(s.memo.keys,'key auto-pickup');walkTo(1100);action(.04,'KeyF');walkTo(1340);}
 if(n===13){action(.8,'ArrowDown');walkTo(1470);assert(!s.memo.cats[0].awake);}
 if(n===14){until(()=>s.memo.rail.done,()=>{return s.getRoomGuide().keys.includes('0')?['Digit0']:[];},65);action(1,'KeyS');walkTo(1580);}
 if(n===15){walkTo(420);action(.04,'KeyF');action(1.5);walkTo(550);action(.8,'KeyD','Space');action(.6);walkTo(1050);action(.6,'KeyD','Space');action(.6,'ArrowDown');walkTo(1500,true);}
 if(n===16){action(.5,'KeyD');action(.08,'Space');action(1);action(.45,'ShiftLeft','KeyD');walkTo(s.level.goal.x+35);}
 if(n===17){action(1.05,'KeyW');action(.7,'KeyS');action(.7,'ArrowDown');action(1.2,'Digit0');walkTo(s.level.goal.x+35);}
 if(n===18){collect(1);walkTo(s.memo.objects[0].x);action(1,'Slash');assert(s.memo.objects[0].done);action(.04,'Slash');walkTo(980);action(.04,'KeyF');walkTo(s.level.goal.x+35);}
 finish();
}
// Long W presses are forgiving, but actual hazards and finite gas still exist.
s.loadLevel(0);action(12,'KeyW');assert.equal(s.stats.over,0);assert(s.dog.air<=.94);s.loadLevel(8);const total=s.memoTotalAir();action(8,'KeyW');assert(Math.abs(s.memoTotalAir()-total)<1e-8);assert(s.dog.gas<.25);
const report={round,builtGameSha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,'../index.html'))).digest('hex'),controlInterval:step,idlePause:pause,completed:results.length,results};
if(process.argv[3])fs.writeFileSync(process.argv[3],JSON.stringify(report,null,2)+'\n');
console.log(`Round ${round}: ${results.length}/19 easy rooms passed, all with physical single-player keys and automatic dog.`);
