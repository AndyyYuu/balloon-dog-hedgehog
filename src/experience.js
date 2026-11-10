let experience={ticks:0,walkHog:0,walkDog:0,peakDog:0,jumpSeen:false,done:new Set(),guide:null};
const experienceEl=id=>document.getElementById(id);
function completedRooms(){try{return JSON.parse(localStorage.getItem('balloon-rooms-complete')||'[]');}catch{return[];}}
function rememberCompletion(){try{const v=completedRooms();if(!v.includes(idx))v.push(idx);localStorage.setItem('balloon-rooms-complete',JSON.stringify(v));}catch{}refreshLevelProgress();}
function refreshLevelProgress(){const done=completedRooms();[...levelsEl.children].forEach((b,i)=>{b.dataset.complete=done.includes(i)?'true':'false';});}
function initExperience(){companion.level=-1;experience={ticks:0,walkHog:0,walkDog:0,peakDog:0,jumpSeen:false,done:new Set(),guide:null};syncExperience();}
function guide(title,action,keys,who,target,step,total){return{title,action,keys,who,target,step,total};}
function getRoomGuide(){
 if(!L||!dog||!hog)return null;
 const at=(x,y=440,w=60,h=45)=>({x,y,w,h});
 const task=(title,action,keys,who='hog',target=null,step=1,total=3)=>guide(title,action,keys,who,target,step,total);
 const exit=()=>task('往右走，到绿色旗子旁','按住 D 往右走。狗会自己跟着你；两位到旗子旁就过关。',['D'],'hog',at(L.goal.x+L.goal.w-24,L.goal.y+L.goal.h-40,55,80),3,3);
 const grow=()=>!experience.backflowReady?task('先按 W，把狗充到 80%','停下来，按住 W。气量到 80% 左右，松开 W，再看下一步。',['W'],'dog',at(dog.x,dog.y-30,75,80)):task('松开 W，按住 ↓ 鼓大刺猬','只按住向下方向键 ↓，把狗的气给刺猬。等提示变成走路后松开。',['↓'],'hog',at(hog.x,hog.y,85,85));
 const apples=()=>!memo.stack?task('先捡地上的苹果','同时按住 Shift 和 D，滚到圈出的苹果旁。捡到以后松开两个键。',['Shift','D'],'hog',at(memo.apples[0]?.x??hog.x+60,445,35,35),1,L.practice?6:4):task('停下来，等狗坐上苹果','松开 A、D 和 Shift。狗会自己走过来、坐上苹果，不用按键。',[],'dog',at(hog.x,memoSeatY(),65,70),2,L.practice?6:4);
 if(win)return task('过关了！','点「下一关」继续，或点「选择关卡」回去练习。',[],'hog');
 if(hurt>0)return task('碰到危险了，马上回安全处','等一下，会自动重新开始。按 R 也可以立刻重来。',['R']);
 if(dog.state==='skin')return task('狗破了，先把它吹回来',L.memo&&hog.gas<.05?'按 R 重来。这次少放一点气，留些气救狗。':'停下来，按住 W，直到粉色小狗重新鼓起来。',['W'],'dog',at(dog.x,dog.y,65,50));
 if(dog.air>.89)return task('快充爆了，立刻放一点气','松开 W，按住 S。气量降到 80% 以下就松开。',['S'],'dog',at(dog.x,dog.y,75,80));
 if(L.practice){
  if(L.lesson==='move'){
   if(!memoObj('walkHog').done)return task('按 D，让刺猬走到圈里','你只负责棕色刺猬。按住 D 往右走，狗会自己跟上。',['D'],'hog',at(450),1,4);
   if(!memoObj('jumpHog').done)return task('按空格，让刺猬跳一下','松开 D，按一下空格。等刺猬落地，再做下一步。',['Space'],'hog',at(hog.x,hog.y-80,55,70),2,4);
   if(!memoObj('jumpDog').done)return task('Shift + D，让刺猬滚起来','同时按住 Shift 和 D，向右滚一小段。完成后松开 Shift。',['Shift','D'],'hog',at(hog.x+95),3,4);
   return{...exit(),step:4,total:4};
  }
  if(L.lesson==='air'){
   if(!memoObj('give').done)return task('按住 W，把狗充大','按住 W。气量到 47% 就松开；画面下方能看到百分比。',['W'],'dog',at(dog.x,dog.y-40,70,75),1,5);
   if(!memoObj('vent').done)return task('按住 S，把狗放小','先松开 W，再按住 S。气量降到 27% 就松开。',['S'],'dog',at(dog.x,dog.y,70,75),2,5);
   if(!memoObj('return').done)return task('按住 ↓，把气还给刺猬','用键盘右边的向下方向键 ↓。狗会缩小，刺猬会鼓大。',['↓'],'hog',at(hog.x,hog.y,80,75),3,5);
   if(!memoObj('reel').done)return task('按住数字 0，把绳子收短','按住数字键 0 一小会儿。两位靠近后松开，绳子会重新变长。',['0'],'hog',at((hog.x+dog.x)/2,(hog.y+dog.y)/2,70,70),4,5);
   return{...exit(),step:5,total:5};
  }
  if(!memoObj('lamp').done){if(!memo.stack||!dog.riding)return apples();if(Math.abs(hog.x-725)>40)return task('按 D，把狗送到灯下面','按住 D 慢慢走，到圈出的灯下面停住。不要跳，也不要滚。',['D'],'hog',at(725),3,6);return task('停住，按住 / 关灯','松开 A 和 D，按住键盘的 /。灯下面的小条填满后松开。',['/'],'dog',at(725,378,55,60),4,6);}
  if(!memoObj('fridge').done){if(dog.riding)return task('按一下 /，让狗下来','灯已经关好了。按一下 / 让狗下座，再按 D 走向冰箱。',['/'],'dog',at(dog.x,dog.y,60,60),5,6);return task('按 D 走到冰箱旁，再按 F','先走到圈出的冰箱旁边，停住，按一下 F 开启冷气。',['D','F'],'hog',at(980,400,75,115),5,6);}
  return{...exit(),step:6,total:6};
 }
 if(!L.memo){
  const pin=switches.find(p=>p.type==='hogRoll'&&!p.latched&&(!p.requires||p.requires.every(powered)));
  const p=switches.find(p=>p.type.startsWith('dog')&&!p.latched&&!switches.some(q=>q.latched&&q.requires?.includes(p.id))&&(!p.requires||p.requires.every(powered)));
  if(dog.task)return task('狗正在去按粉色按钮',device(dog.task.id)?.flatOK&&dog.task.step>0?'按住 S，把狗放扁。狗会自己钻过上面的窄缝。':'先停住。狗会自己去按钮；暂时不要再按 /。',device(dog.task.id)?.flatOK&&dog.task.step>0?['S']:[],'dog',at(dog.taskTarget?.x??dog.x,dog.taskTarget?.y??dog.y,55,60));
  const dock=device(dog.docked);if(dock&&(dog.air<(dock.minAir??.04)||dog.air>(dock.maxAir??1)))return task('先调整狗的气量，按钮才会通电',`只按住 ${dog.air>(dock.maxAir??1)?'S 放气':'W 充气'}，把气量调到 ${Math.round((dock.minAir??.12)*100)}%–${Math.round((dock.maxAir??1)*100)}% 之间。`,[dog.air>(dock.maxAir??1)?'S':'W'],'dog',at(dog.x,dog.y,70,75));
  if(dog.docked&&pin)return task('狗撑着门，你滚到铜踏板上','同时按住 Shift 和 D，滚过圈出的铜色踏板。看到它亮绿灯就松开。',['Shift','D'],'hog',at(pin.x+pin.w/2,pin.y-8,pin.w+12,35),2,4);
  const sync=charges.find(q=>!q.done),plate=sync?.all.map(device).find(q=>q?.type==='hogPlate');
  if(dog.docked&&plate)return task('站到铜踏板中央，别动','按 D 走到圈出的铜盘中央，松开所有键，等进度条填满。',['D'],'hog',at(plate.x+plate.w/2,plate.y,plate.w,35));
  if(dog.docked)return task('门固定了，按 / 叫狗回来','按一下 /。然后按 S 把狗放小，再按 D 继续向右。',['/'],'dog',at(dog.x,dog.y,60,65),3,4);
  if(p&&!p.on&&Math.hypot(p.x-hog.x,p.y-hog.y)>=380)return task('先走近粉色爪印按钮','按住 D 向右走，走到圈出的地方后松开。先不用充气。',['D'],'hog',at(p.x-220));
  if(p&&Math.hypot(p.x-hog.x,p.y-hog.y)<380&&!p.on){if(dog.air<.44)return task('先按 W，给狗充到 45%','停下来，按住 W。下方气量到 45% 左右就松开。',['W'],'dog',at(dog.x,dog.y-35,70,75));if(ropeShort)return task('先把绳子放长','松开数字 0；如果仍是短绳，按一下 E，再按 /。',['E'],'hog',at(hog.x,hog.y-25,60,70));return task('按一下 /，派狗去粉色按钮','按一下键盘的 /，然后松手。狗会自己飞到圈出的爪印按钮。',['/'],'dog',at(p.x,p.y,60,65));}
  if(pin&&!pin.requires)return task('先滚过铜踏板，打开风扇','同时按住 Shift 和 D，滚过圈出的铜盘。亮灯后松开 Shift。',['Shift','D'],'hog',at(pin.x+pin.w/2,pin.y,pin.w,35));
  const bed=(L.beds||[]).find(b=>hog.x<b.x+b.w+40&&hog.x>b.x-250);
  if(bed){if(hog.y+hogHalf()>bed.base-bed.h-12)return task('先停住，让狗把刺猬吊过刺尖','停在刺丛前。按住 0 收绳，再按 W 充气；刺猬的脚高过尖刺后松开 W。',['0','W'],'hog',at(hog.x,bed.base-bed.h-55,65,70));return task('保持高度，按 D 越过刺丛','继续按住 0，再按 D 往右。过完整片绿色刺丛后，再松开 0。',['0','D'],'hog',at(bed.x+bed.w/2,bed.base-bed.h-45,bed.w,70));}
  const tunnel=statics.find(q=>q.y<=26&&q.y+q.h>360&&hog.x<q.x+q.w&&hog.x>q.x-230);
  if(tunnel)return task('把狗放扁，刺猬滚过矮洞','先按 S 把狗放到 0%，再按住 Shift 和 D 滚进洞。狗会跟上。',['S','Shift','D'],'hog',at(tunnel.x+tunnel.w/2,tunnel.y+tunnel.h+14,tunnel.w,30));
  if(pin&&Math.abs(pin.x-hog.x)<250)return task('滚过铜踏板，把门固定住','同时按住 Shift 和 D，滚过圈出的铜盘；亮绿灯后松开 Shift。',['Shift','D'],'hog',at(pin.x+pin.w/2,pin.y,pin.w,35));
  const wall=walls.find(q=>q.alive&&q.x-hog.x<230&&q.x>hog.x);
  if(wall){if(wall.heavy&&hog.bloat<.65)return grow();return task('Shift + D，滚动撞开这堵墙','同时按住 Shift 和 D，朝圈出的墙滚过去。',['Shift','D'],'hog',at(wall.x,Math.min(400,wall.y+wall.h-45),wall.w+15,85));}
  const weight=switches.find(q=>q.type==='hogWeight'&&!q.on);
  if(weight){if(hog.bloat<.65)return grow();return task('走到铜盘中央，停一秒','按 D 走到圈出的铜盘中央，松开方向键，等它亮绿灯。',['D'],'hog',at(weight.x+weight.w/2,weight.y,weight.w,30));}
  return exit();
 }
 if(idx===8)return dog.riding?task('只按 D，慢慢驮狗过图钉','按住 D 往右走。不要跳，也不要按 Shift；狗会坐在苹果上。',['D'],'hog',at(1170),3,4):apples();
 if(idx===9){const lamp=memoObj('lamp');if(lamp.done){if(dog.riding)return task('按 / 让狗下来，再过右边矮洞','按一下 /。接着按 S 放气，按住 Shift 和 D 滚过矮洞。',['/'],'dog',at(dog.x,dog.y,60,60));return task('Shift + D，滚过右边的矮洞','狗保持小小的，自动跟着你。按住 Shift 和 D 从洞下通过。',['Shift','D'],'hog',at(1080,445,160,30));}if(memo.stack<3)return task('先滚过三个苹果，全部捡起来','同时按住 Shift 和 D，捡齐地上的三个苹果，再松开 Shift。',['Shift','D'],'hog',at(memo.apples[0]?.x??360,445,35,35));if(!dog.riding)return apples();if(Math.abs(hog.x-lamp.x)>40)return task('按 D，把狗送到灯下面','慢慢走到圈出的灯下面，松开 D 停住。不要跳或滚。',['D'],'hog',at(lamp.x));return task('停住，按住 / 拧掉灯泡','刺猬站稳以后，按住 /，直到灯下方的小进度条填满。',['/'],'dog',at(lamp.x,lamp.y,55,60));}
 if(idx===10){if(hog.bloat<.65)return task('按住 ↓，把刺猬鼓大','停下来，按住向下方向键 ↓。等刺猬鼓成大圆球后松开。',['↓'],'hog',at(hog.x,hog.y,85,85));if(!dog.cling&&dog.charge<.15)return task('按 D 慢慢走，让狗蹭过紫色地毯','狗会自己跟着你，在紫色地毯上蹭出静电。先别跳。',['D'],'hog',at(400));if(!dog.cling&&(nearestCling()?.d??999)>55)return task('继续按 D，等狗走到灰墙脚下','慢慢往右走。等小狗跟到灰色墙旁边，再按 /。',['D'],'hog',at(575));if(!dog.cling)return task('按一下 /，让狗贴住灰色墙','到灰色墙脚附近，按一下 /。狗会自己往上爬。',['/'],'dog',at(450,410,40,75));return task('按 D，进入风里并落上右边台面','狗会自己沿墙爬。你按 D，让鼓大的刺猬借风上去。',['D'],'hog',at(880,215,80,70));}
 if(idx===11){if(hog.bloat<.65&&!hog.plugged)return task('按住 ↓，先让刺猬鼓大','按住 ↓，直到刺猬鼓成大圆球。留一点气在狗身上。',['↓'],'hog',at(hog.x,hog.y,85,80));if(!memo.water.plugged&&memo.water.y>320)return task('走到排水口，再按 F 堵住','按 D 到圈出的排水口旁边，停住，按一下 F。',['D','F'],'hog',at(630,492,70,25));if(memo.water.plugged&&memo.water.y>190)return task('现在不要动，等水涨上去','松开所有键。刺猬正在堵水，狗会浮起来；水涨好后提示会变。',[],'hog',at(630,470,75,55));if(hog.plugged)return task('按一下 F，松开排水口','狗已往右边游。按 F 松开塞子，然后按 D 往右走。',['F'],'hog',at(630,470,75,55));return task('按 D，赶快上右边的平台','水正在退。按住 D 往右；刺猬上不去时，短按住 0 收绳。',['D','0'],'hog',at(1020,230,100,65));}
 if(idx===12){const cage=memoObj('cage');if(!cage.done){if(hog.bloat<.65)return task('按 ↓，让刺猬的刺变长','按住 ↓ 把气给刺猬，等身体明显鼓大后松开。',['↓'],'hog',at(hog.x,hog.y,85,85));return task('走近鸟笼左边，按 F 扎气球锁','按 D 走到鸟笼左边的圈内，停住，按一下 F。',['D','F'],'hog',at(cage.x,cage.y,45,55));}if(cage.key)return task('走到金钥匙旁，按 F 捡起来','等钥匙落到地面，按 D 靠近它，再按一下 F。',['D','F'],'hog',at(cage.key.x,cage.key.y,45,30));if(!memoObj('exitlock').done)return task('带钥匙去门边，再按 F','按 D 到圈出的门锁旁，停住，按一下 F 开锁。',['D','F'],'hog',at(1120,420,50,75));return exit();}
 if(idx===13){if(dog.air>.04)return task('先按 ↓，把狗完全放扁','停在猫很远的地方，按住 ↓。狗的气量到 0% 就松手。',['↓'],'dog',at(dog.x,dog.y,65,55));return task('只按 D，轻轻走过睡猫旁边','不要跳、不要滚、不要充气。狗会安静地跟着你。',['D'],'hog',at(1200));}
 if(idx===14){const x=memo.rail.x,next=(L.railHazards||[]).find(q=>q.x+q.w>x-20);if(memo.rail.done)return task('按 S 把狗放小，再按 D 下平台','先按 S 放到 40% 以下，再按 D 往右走。',['S','D'],'hog',at(1560,430,95,50));const reel=next&&next.y<100;return task(reel?'按住 0，让两位靠拢':'松开 0，让两位上下分开',reel?'按住数字 0：狗下降、刺猬上升。穿过这组障碍前保持按住。':'松开数字 0：狗上升、刺猬下降。滑轮会自己往前走。',reel?['0']:['松开 0'],'hog',next?at(next.x+next.w/2,280,next.w+12,120):null);}
 if(idx===15){if(!memoObj('fridge').done)return task('先到冰箱旁，按 F 开冷气','按 D 走到圈出的冰箱旁边，停住，按一下 F。',['D','F'],'hog',at(430,380,80,120));if(!memo.water.frozen)return task('等一下，让水面结冰','先松开按键。蓝色水面变成实心冰板以后，提示会变。',[],'hog',at(790,400,430,20));if(hog.x<1040)return task('D + 空格，跳到冰面上','走到冰边，同时按 D 和空格跳过去。狗会自己跟着跳。',['D','Space'],'hog',at(650,400,100,30));return task('先按 ↓ 缩小狗，再滚过烤箱下方','按住 ↓ 把狗的气给刺猬；狗变小后，按住 Shift 和 D 通过矮洞。',['↓','Shift','D'],'hog',at(1230,350,175,65));}
 return exit();
}
function updateExperience(dt){
 if(!experience)return;experience.ticks+=dt;if(!L.memo){if(dog.air>=.77)experience.backflowReady=true;if(hog.bloat>=.65)experience.backflowReady=false;}
 if(L.practice){
  const mark=id=>{const p=memoObj(id);if(p)p.done=true;};
  if(L.lesson==='move'){if(held('ArrowLeft','ArrowRight'))experience.walkHog+=Math.abs(hog.vx)*dt;if(held('KeyA','KeyD'))experience.walkDog+=Math.abs(dog.vx)*dt;if(experience.walkHog>75){mark('walkHog');mark('walkDog');}if(memoObj('walkHog').done&&experience.walkDog>70)mark('walkDog');if(memoObj('walkDog').done&&pressed('ArrowUp'))experience.jumpSeen=true;if(experience.jumpSeen&&hog.ground)mark('jumpHog');if(memoObj('jumpHog').done&&hog.ball&&Math.abs(hog.vx)>80)mark('jumpDog');}
  if(L.lesson==='air'){experience.peakDog=Math.max(experience.peakDog,dog.gas);if(dog.gas>.46)mark('give');if(memoObj('give').done&&held('KeyS')&&dog.gas<.28)mark('vent');if(memoObj('vent').done&&held('ArrowDown')&&dog.gas<.09)mark('return');if(memoObj('return').done&&held('Digit0','Numpad0')&&ropeLen<145)mark('reel');}
 }
 syncExperience();
}
function syncExperience(){
 if(!L||!dog||!hog)return;const g=getRoomGuide();if(!g)return;experience.guide=g;
 experienceEl('missionTitle').textContent=g.title;experienceEl('missionAction').textContent=g.action;experienceEl('missionStep').textContent=`${L.practice?'练习':'当前目标'} · ${g.step} / ${g.total}`;
 experienceEl('missionKeys').innerHTML=g.keys.map(k=>`<kbd>${k}</kbd>`).join('');experienceEl('mission').dataset.who=g.who;
 experienceEl('roomName').textContent=L.practice?`练习 ${idx-15} · ${L.name}`:`${String(idx+1).padStart(2,'0')} · ${L.name}`;
 experienceEl('dogState').textContent=dog.state==='skin'?'破了，W 吹回来':dog.riding?'坐在苹果上':dog.cling?'正在自动爬墙':dog.docked?'正在留守':isFlat()?'放扁了':dog.air>.7?'可以吊起朋友':dog.air>.32?'正在飘':'自动跟随刺猬';
 experienceEl('hogState').textContent=hog.ball?'缩球滚动':hog.plugged?'堵住排水口':hog.bloat>.65?'鼓成刺豚':memo?.stack?`背着 ${memo.stack} 个苹果`:'你控制这位 · A/D 走路';
}
function selectChapter(which){[...levelsEl.children].forEach((b,i)=>b.hidden=which==='practice'?i<16:which==='classic'?i>=8:i<8||i>=16);for(const id of ['practiceChapter','classicChapter','memoChapter'])experienceEl(id).setAttribute('aria-pressed',String(id===which+'Chapter'));}
function openLevelPanel(){togglePause(true);experienceEl('levelPanel').hidden=false;refreshLevelProgress();selectChapter(L.practice?'practice':idx<8?'classic':'memo');}
function closeLevelPanel(){experienceEl('levelPanel').hidden=true;}
experienceEl('levelMenu').addEventListener('click',openLevelPanel);
experienceEl('closeLevels').addEventListener('click',()=>{closeLevelPanel();if(started&&!win)togglePause(false);else if(!started)startEl.hidden=false;});
experienceEl('practiceChapter').addEventListener('click',()=>selectChapter('practice'));
experienceEl('practiceBtn').addEventListener('click',()=>{loadLevel(16);closeLevelPanel();start();});
experienceEl('chooseStart').addEventListener('click',()=>{startEl.hidden=true;openLevelPanel();});
experienceEl('helpBtn').addEventListener('click',()=>{const panel=experienceEl('helpPanel');panel.hidden=!panel.hidden;});
experienceEl('focusBtn').addEventListener('click',()=>{const stage=document.getElementById('stage');if(document.fullscreenElement){document.exitFullscreen?.();}else stage.requestFullscreen?.();});
function nextRoomIndex(){return L.practice&&idx===18?8:(idx+1)%LEVELS.length;}
function targetVisible(t){return t&&t.x+t.w/2>cameraX&&t.x-t.w/2<cameraX+W;}
function drawGuideTarget(){
 const g=getRoomGuide(),t=g?.target;if(!t||win)return;const col=g.who==='dog'?'#dc5c72':g.who==='hog'?'#8c5a37':'#588e7c',pulse=1+Math.sin(time*3.8)*.07;
 c.save();c.strokeStyle=col;c.lineWidth=2.5;c.setLineDash([7,5]);c.globalAlpha=.7+.2*Math.sin(time*3.8);const w=Math.max(36,t.w)*pulse,h=Math.max(28,t.h)*pulse;rrPath(t.x-w/2-7,t.y-h/2-7,w+14,h+14,10);c.stroke();c.setLineDash([]);c.globalAlpha=1;
 c.fillStyle=col;ell(t.x,t.y-h/2-21,12,12);c.font=`700 12px ${FONT(12).split('px ')[1]}`;c.textAlign='center';c.fillStyle='#fffaf5';c.fillText(String(g.step),t.x,t.y-h/2-17);
 const b=g.who==='dog'?dog:hog;if(Math.abs(b.x-t.x)>75){c.strokeStyle=col;c.globalAlpha=.28;c.lineWidth=2;c.setLineDash([4,7]);c.beginPath();c.moveTo(b.x,b.y-35);c.quadraticCurveTo((b.x+t.x)/2,Math.min(b.y,t.y)-80,t.x,t.y-h/2-35);c.stroke();}c.restore();
}
function drawSimpleHUD(sc){
 c.setTransform(sc,0,0,sc,0,0);const g=getRoomGuide();if(g?.target&&!targetVisible(g.target)){const right=g.target.x>cameraX+W,x=right?W-29:29;c.save();c.fillStyle=g.who==='dog'?'#da6278':'#7b9d89';ell(x,H*.5,20,20);c.fillStyle='#fffaf5';c.font=FONT(20);c.textAlign='center';c.fillText(right?'›':'‹',x,H*.5+6);c.restore();}
 c.save();c.fillStyle='#ffffffd9';rrPath(18,17,155,30,9);c.fill();c.fillStyle='#526d60';c.font=FONT(12);c.textAlign='left';c.fillText(L.practice?'安全练习 · 没有尖刺':`房间 ${idx+1} · 两位一起到终点`,30,37);c.restore();
}
