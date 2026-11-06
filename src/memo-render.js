function classicControlHint(t){return(t||'').replaceAll('F','/').replaceAll('A / D 始终移动刺猬','方向键移动刺猬');}
function memoHint(){
 if(win)return'';if(hurt>0)return'回房间入口，再分一次气。物品和房间初始气量会恢复。';
 if(dog.state==='skin')return'狗破了。刺猬留着气时，按 W / F 能把它吹回来；入口打气筒可以补气。';
 if(noticeTime>0)return interactNotice;
 if(memo.rail&&!memo.rail.done)return held('Digit0','Numpad0')?'收绳：狗下降，刺猬上升。上下一起看。':'松开：绳子放长，狗上升，刺猬下降。提前看下一组障碍。';
 if(dog.cling)return`狗正在贴墙 · 电量 ${Math.round(dog.charge*100)}% · A / D 沿墙走，/ 松开`;
 if(dog.riding)return memo.work?'狗按住 / 作业，刺猬停稳。跳或滚都会让苹果掉下来。':'苹果座位上很安全；刺猬慢慢走，别跳、别滚，狗别充大。';
 if(hog.plugged)return'刺豚留在水底堵住口子，狗随水位上升；F 松开以后要一起走。';
 return currentZone().hint;
}
function syncMemoHUD(){
 airMeter.value=dog.state==='ok'?clamp(dog.air,0,1):0;airText.textContent=`${Math.round(dog.air*100)}%`;
 const total=Math.round(memoTotalAir()*100);
 stateText.textContent=win?'两位一起出来了':hurt>0?'回房间入口':dog.state==='skin'?'狗破了 · W / F 用剩余的气吹回来':noticeTime>0?interactNotice:dog.riding?`苹果座位 ${memo.stack} 层 · 刺猬别跳或滚`:dog.cling?`静电 ${Math.round(dog.charge*100)}% · A/D 爬墙`:hog.plugged?'刺豚堵住排水口 · F 松开':`狗的气 ${Math.round(dog.gas*100)}% · 猬的气 ${Math.round(hog.gas*100)}%`;
 saveText.textContent=`总气 ${total}% / ${Math.round(L.budget*100)}% · ${L.kind}`;
}
function drawApple(x,y,r=10){c.save();c.fillStyle='#ce6352';ell(x-3,y,r*.65,r);ell(x+3,y,r*.65,r);c.fillStyle='#efb086';ell(x-4,y-4,2,4);c.strokeStyle='#886745';c.lineWidth=2;c.beginPath();c.moveTo(x,y-r+2);c.lineTo(x+1,y-r-5);c.stroke();c.fillStyle='#7fa17a';ell(x+5,y-r-3,5,2.5);c.restore();}
function drawMemoSeat(){if(!memoOn()||!memo)return;for(let i=0;i<memo.stack;i++)drawApple(hog.x,hog.y-17*hogScale()-11-i*22,11);}
function drawMemoBackdrop(){
 if(!memoOn()||!memo)return;
 const tint={living:'#e7e4cf44',study:'#d6c5a638',laundry:'#c6dce638',bath:'#bce1e844',attic:'#d8bfd638',kitchen:'#dfc9b433'}[L.world];c.fillStyle=tint;c.fillRect(cameraX,8,W,H-8);
 for(const carpet of L.carpets||[]){c.fillStyle='#b18c9c';c.fillRect(carpet.x,carpet.y-6,carpet.w,7);c.strokeStyle='#dcc6d2';c.lineWidth=1;for(let x=carpet.x;x<carpet.x+carpet.w;x+=9){c.beginPath();c.moveTo(x,carpet.y-6);c.lineTo(x+5,carpet.y);c.stroke();}c.font=FONT(11);c.fillStyle='#98748c';c.textAlign='center';c.fillText('毛衣毯 · 小狗蹭电',carpet.x+carpet.w/2,carpet.y+34);}
 for(const p of L.clingPaths||[]){c.strokeStyle='#b4a9b5';c.lineWidth=7;c.lineJoin='round';c.beginPath();c.moveTo(p[0].x,p[0].y);for(const q of p.slice(1))c.lineTo(q.x,q.y);c.stroke();c.strokeStyle='#e2d5e5';c.lineWidth=2;c.setLineDash([4,8]);c.stroke();c.setLineDash([]);}
 if(memo.water){const w=memo.water;c.save();c.fillStyle=w.frozen?'#acd4e5':'#83c7d580';c.fillRect(w.x,w.y,w.w,w.bottom-w.y);c.strokeStyle=w.frozen?'#e4f6fa':'#589ead';c.lineWidth=w.frozen?5:2;c.beginPath();c.moveTo(w.x,w.y);for(let x=w.x;x<w.x+w.w;x+=8)c.lineTo(x,w.y+(w.frozen?0:Math.sin(x*.06+time*3)*2));c.stroke();if(w.frozen){c.strokeStyle='#edf9fc';c.lineWidth=1;for(let x=w.x+25;x<w.x+w.w;x+=90){c.beginPath();c.moveTo(x,w.y+5);c.lineTo(x+30,w.y+28);c.lineTo(x+13,w.y+47);c.stroke();}}c.font=FONT(12);c.textAlign='center';c.fillStyle='#4e8d9c';c.fillText(w.frozen?'水面已结冰':w.plugged?'堵住了 · 水位上涨':w.freeze>0?'水面正在结冰…':'排水中 · 水位下降',w.x+w.w/2,w.y+32);c.restore();}
 for(const b of L.bubbles||[]){c.strokeStyle='#73bccb';c.lineWidth=2;for(let i=0;i<4;i++){c.beginPath();c.arc(b.x+Math.sin(time+i)*8,b.y-((time*35+i*18)%75),3+i*.6,0,Math.PI*2);c.stroke();}}
 if(memo.rail){const r=memo.rail;c.strokeStyle='#9c8b76';c.lineWidth=7;c.beginPath();c.moveTo(150,r.y);c.lineTo(r.end+30,r.y);c.stroke();c.strokeStyle='#e9d3b5';c.lineWidth=2;c.stroke();c.fillStyle='#c49a68';ell(r.x,r.y,13,13);c.strokeStyle='#7f6951';c.lineWidth=3;c.beginPath();c.arc(r.x,r.y,8,0,Math.PI*2);c.stroke();}
}
function drawMemoObjects(){
 if(!memoOn()||!memo)return;
 for(const a of memo.apples)drawApple(a.x,a.y,10);
 for(const b of L.nailBeds||[]){c.fillStyle='#9ba7a6';c.fillRect(b.x,b.y+8,b.w,b.h-8);for(let x=b.x;x<b.x+b.w;x+=15){c.beginPath();c.moveTo(x,b.y+10);c.lineTo(x+7,b.y);c.lineTo(x+14,b.y+10);c.fill();}c.fillStyle='#8a9894';c.font=FONT(11);c.textAlign='center';c.fillText('图钉地板 · 只扎气球',b.x+b.w/2,b.y+40);}
 for(const pump of L.pumps||[]){c.strokeStyle='#a57e5e';c.lineWidth=5;c.beginPath();c.moveTo(pump.x,pump.y-5);c.lineTo(pump.x,pump.y-38);c.stroke();c.fillStyle='#d8ad78';c.fillRect(pump.x-17,pump.y-9,34,8);c.fillRect(pump.x-15,pump.y-44,30,6);c.font=FONT(10);c.fillStyle='#977b5b';c.textAlign='center';c.fillText(`F 补气 · 上限 ${Math.round(pump.cap*100)}%`,pump.x,pump.y+27);}
 for(const p of memo.objects){c.save();c.font=FONT(11);c.textAlign='center';
  if(p.type==='lamp'){c.strokeStyle='#9b9387';c.lineWidth=2;c.beginPath();c.moveTo(p.x,8);c.lineTo(p.x,p.y-25);c.stroke();c.fillStyle=p.done?'#b3bab0':'#e6af58';ell(p.x,p.y-9,13,18);c.fillStyle=p.done?'#a1b3a2':'#ffe1a0';ell(p.x,p.y,8,6);c.fillStyle='#8d7761';c.fillText(p.done?'灯已拧掉':'狗 / · 三层苹果 · 停稳',p.x,p.y+35);c.fillStyle='#cfaa68';c.fillRect(p.x-35,p.y+43,70*Math.min(1,p.progress/p.duration),4);}
  if(p.type==='drain'){c.fillStyle='#7d9195';ell(p.x,p.y,28,6);c.strokeStyle='#cee5e7';c.lineWidth=2;for(let x=-16;x<=16;x+=8){c.beginPath();c.moveTo(p.x+x,p.y-4);c.lineTo(p.x+x,p.y+4);c.stroke();}c.fillStyle='#597d83';c.fillText('刺豚 F · 堵住 / 松开',p.x,p.y+32);}
  if(p.type==='cage'){c.strokeStyle='#a29883';c.lineWidth=3;c.strokeRect(p.x-15,355,145,98);for(let x=p.x-15;x<p.x+130;x+=20){c.beginPath();c.moveTo(x,355);c.lineTo(x,453);c.stroke();}if(!p.done){c.fillStyle='#d98989';ell(p.x,p.y,10,15);c.strokeStyle='#b88f78';c.lineWidth=1;c.beginPath();c.moveTo(p.x,p.y+15);c.lineTo(p.x,p.y+29);c.stroke();}c.fillStyle='#8e795d';c.fillText(p.done?'气球锁已破':'F 用长刺够进去',p.x+58,333);}
  if(p.key){c.fillStyle='#c8a451';ell(p.key.x,p.key.y,6,6);c.fillRect(p.key.x+4,p.key.y-2,17,4);c.fillRect(p.key.x+15,p.key.y,4,8);}
  if(p.type==='keylock'){c.fillStyle=p.done?'#8aa98a':'#b0935c';rrPath(p.x-12,p.y-5,24,28,4);c.fill();c.strokeStyle='#b0935c';c.lineWidth=3;c.beginPath();c.arc(p.x,p.y-5,8,Math.PI,Math.PI*2);c.stroke();c.fillStyle='#816c4d';c.fillText(p.done?'已开锁':'F 刺猬用钥匙',p.x,p.y+43);}
  if(p.type==='fridge'){c.fillStyle=p.done?'#a9cbd6':'#d9e4df';rrPath(p.x-34,p.y-104,68,110,5);c.fill();c.strokeStyle='#859ea4';c.lineWidth=2;c.strokeRect(p.x-34,p.y-104,68,110);c.fillStyle='#859ea4';c.fillRect(p.x+18,p.y-65,4,27);c.fillStyle='#678b97';c.fillText(p.done?'冰箱已打开':'F 刺猬打开冰箱',p.x,p.y+28);}
  c.restore();}
 for(const p of L.railHazards||[]){c.save();c.fillStyle=p.target==='dog'?'#a3a7a0':'#b99b80';c.fillRect(p.x,p.y,p.w,p.h);c.fillStyle='#d4c2ad';for(let x=p.x;x<p.x+p.w;x+=20){c.beginPath();if(p.y<100){c.moveTo(x,p.y+p.h);c.lineTo(x+10,p.y+p.h+12);c.lineTo(x+20,p.y+p.h);}else{c.moveTo(x,p.y);c.lineTo(x+10,p.y-12);c.lineTo(x+20,p.y);}c.fill();}c.font=FONT(11);c.textAlign='center';c.fillStyle='#8c765e';c.fillText(p.label,p.x+p.w/2,p.y<100?p.y+p.h+30:p.y+p.h+28);c.restore();}
 for(const cat of memo.cats){c.save();c.translate(cat.x,cat.y);c.fillStyle=cat.awake?'#a47e64':'#c0a38c';ell(0,4,32,18);ell(-22,-6,17,16);c.beginPath();c.moveTo(-36,-12);c.lineTo(-35,-29);c.lineTo(-22,-18);c.moveTo(-21,-20);c.lineTo(-10,-28);c.lineTo(-8,-10);c.fill();c.strokeStyle='#725441';c.lineWidth=2;for(const x of[-28,-17]){c.beginPath();if(cat.awake)c.arc(x,-7,2,0,Math.PI*2);else{c.moveTo(x-3,-7);c.lineTo(x+3,-7);}c.stroke();}c.strokeStyle='#ad8c74';c.lineWidth=9;c.beginPath();c.moveTo(26,5);c.quadraticCurveTo(56,-15,35,-24);c.stroke();c.font=FONT(13);c.textAlign='center';c.fillStyle='#8a735d';c.fillText(cat.awake?(cat.flee>0?'怕刺！':'气球！'):'Z z z',0,-43);if(!cat.awake&&cat.alert>0){c.fillStyle='#d6c3ae';c.fillRect(-30,-35,60,4);c.fillStyle='#c47f6d';c.fillRect(-30,-35,60*cat.alert,4);}c.restore();}
}
function drawMemoHUD(){if(!memoOn()||!memo)return;c.save();c.textAlign='center';c.font=FONT(10);if(dog.charge>0){c.fillStyle='#a58bb5';c.fillText(`静电 ${Math.round(dog.charge*100)}%`,dog.x,dog.y-dogDims()[1]-30);}if(memo.keys){c.fillStyle='#b18a43';c.fillText('拿着钥匙',hog.x,hog.y-hogHalf()-43);}c.restore();}
