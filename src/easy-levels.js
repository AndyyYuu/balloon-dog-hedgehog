// The preserved designs above stay intact. The current campaign uses these
// explicitly easier variants; the complete previous edition remains archived.
const BASE_LEVELS=JSON.parse(JSON.stringify(LEVELS));
for(let i=0;i<LEVELS.length;i++){
 const l=JSON.parse(JSON.stringify(BASE_LEVELS[i]));LEVELS[i]=l;
 l.easy=true;l.softSky=true;l.easyNotes=['安全天花板','充气安全阀','更宽的操作范围'];
 l.easyTuning={big:.45,rollTrigger:85,appleReach:44,seatReach:108,seatAir:.35,interaction:105,workReach:90,workSpeed:24,staticGain:1.1,staticDecay:.012,clingSpeed:145};
 l.goal.w+=35;
 // Widen floor tunnels without changing the floor or the room's route.
 for(const s of l.solids)if(s.y<=26&&s.h>330){s.h-=24;l.easyNotes.push('矮洞增高 24 像素');}
 for(const b of l.beds||[]){const center=b.x+b.w/2;b.w=Math.max(75,Math.round(b.w*.65));b.x=center-b.w/2;b.h=Math.round(b.h*.38);l.easyNotes.push('刺丛更短、更低');}
 for(const p of l.switches||[]){
  if(!p.type.startsWith('dog')){const center=p.x+p.w/2;p.w+=40;p.x=center-p.w/2;}
  if(p.type==='hogWeight'){p.minBloat=.45;p.hold=.55;l.easyNotes.push('半秒即可压动重量机关');}
  if(p.duration){p.duration=32;p.label='顺风 32 秒';l.easyNotes.push('限时延长到 32 秒');}
 }
 for(const w of l.walls||[])if(w.heavy)w.minBloat=.45;
 for(const z of l.heat||[]){if(z.k)z.k*=.65;if(z.temp)z.temp=1+(z.temp-1)*.35;}
 for(const q of l.charges||[]){q.duration=.9;l.easyNotes.push('同时站稳不到一秒');}
 for(const o of l.objects||[])if(o.type==='lamp'){o.duration=.75;l.easyNotes.push('灯具作业缩短到 0.75 秒');}
 if(l.bars){for(const b of l.bars){b.x+=b.w*.18;b.w*=.64;}l.ropeBeams=l.bars.map(b=>({...b,h:8}));l.easyNotes.push('横梁和吊刺缩短');}
 if(i===0){l.switches[0].y=300;l.easyNotes.push('爪印按钮降低');}
 if(i===1){l.solids[0].w+=130;l.solids[1].x-=70;l.solids[1].w+=70;l.easyNotes.push('缺口从 310 缩到 110 像素');}
 if(i===2||i===7){const x=i===2?520:500;const upper=l.solids.find(s=>s.x===x&&s.y===26),lower=l.solids.find(s=>s.x===x&&s.y===202);upper.h-=10;lower.y+=12;lower.h-=12;l.easyNotes.push('高窗通道从 26 增到 48 像素');}
 if(i===6){for(const p of l.switches)if(p.type.startsWith('dog'))p.y+=30;}
 if(i===7){l.solids[0].w+=110;l.solids[1].x-=70;l.solids[1].w+=70;const p=l.switches.find(p=>p.id==='reunion');p.minAir=.32;p.maxAir=.82;l.easyNotes.push('缺口缩短、终点气量范围放宽');}
 if(i===8){const b=l.nailBeds[0];b.x+=90;b.w-=180;l.easyNotes.push('图钉路缩短 180 像素');}
 if(i===9){l.objects[0].apples=2;l.objects[0].y=356;l.easyNotes.push('两个苹果就够到灯泡，第三个保留');}
 if(i===10){l.solids.push({x:650,y:340,w:180,h:200});l.easyNotes.push('风道中增加落脚平台，静电更持久');}
 if(i===11){l.water.fill=60;l.water.drain=12;l.solids[1].y=300;l.goal.y=220;l.easyNotes.push('涨水更快、退水减慢、出口台面降低');}
 if(i===12)l.easyNotes.push('长刺距离放宽，钥匙落地后靠近自动捡');
 if(i===13){l.catSensitivity=.42;l.easyNotes.push('短暂误操作更不容易吵醒猫');}
 if(i===14){l.rail.speed=28;l.railReelSpeed=180;for(const p of l.railHazards){p.x+=15;p.w-=30;if(p.y===40)p.h-=35;else if(p.y===370){p.y+=35;p.h-=35;}else{p.y+=15;p.h-=30;}}l.easyNotes.push('滑轨减速三分之一，安全空隙扩大');}
 if(i===15){l.freezeSpeed=.8;l.solids.push({x:570,y:430,w:90,h:16},{x:985,y:400,w:85,h:20});l.easyNotes.push('结冰更快，冰面两侧增加台阶');}
 if(i===16){l.goal.x=820;l.width=1030;l.lessonWalk=40;l.easyNotes.push('练习距离缩短，走 40 像素即可完成第一步');}
 if(i===17){l.goal.x=920;l.width=1120;l.lessonGive=.38;l.lessonVent=.24;l.lessonReel=190;l.easyNotes.push('分气和收绳练习更短');}
 if(i===18){l.goal.x=1060;l.width=1240;l.easyNotes.push('灯具作业更快，出口更近');}
}
