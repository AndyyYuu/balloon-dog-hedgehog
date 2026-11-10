function ell(x,y,rx,ry){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
function rrPath(x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function capsule(cx,cy,w,h,ang){
  c.save();c.translate(cx,cy);c.rotate(ang);const r=Math.min(w,h)/2;c.beginPath();
  if(w>=h){c.moveTo(-w/2+r,-h/2);c.lineTo(w/2-r,-h/2);c.arc(w/2-r,0,r,-Math.PI/2,Math.PI/2);c.lineTo(-w/2+r,h/2);c.arc(-w/2+r,0,r,Math.PI/2,Math.PI*1.5);}
  else{c.moveTo(w/2,-h/2+r);c.lineTo(w/2,h/2-r);c.arc(0,h/2-r,r,0,Math.PI);c.lineTo(-w/2,-h/2+r);c.arc(0,-h/2+r,r,Math.PI,0);}
  c.closePath();c.fill();c.restore();
}
const DOG_PARTS=[[-46,-19,12,30,-25],[-4,1,72,26,0],[-31,23,14,34,0],[-15,23,14,34,0],[13,23,14,34,0],[27,23,14,34,0],[27,-24,14,36,18],[43,-46,38,20,0],[31,-63,11,22,-15],[41,-63,11,22,12]];
function drawDog(){
  const r=rr(dog.air),s=r/57,t=.8+.45*dog.air;
  const scared=dog.near<26||dog.air>.86;
  const shv=scared?Math.sin(time*70)*1.6:0;
  const alpha=dog.inv>0&&Math.floor(time*12)%2?.45:1;
  c.save();c.globalAlpha=alpha;c.translate(dog.x+shv,dog.y);c.rotate(dog.rot);
  c.scale(dog.face*s*(1+dog.squash),s*(1-dog.squash));c.translate(-5,17);
  c.fillStyle=artGradient(-20,-75,30,50,[[0,'#f998a4'],[.45,'#ed748c'],[1,'#d85c79']],DOGC);c.shadowColor='#bf5c6c20';c.shadowBlur=3;
  for(const p of DOG_PARTS){let[px,py,w,h,a]=p;if(w<h)w*=t;else h*=t;capsule(px,py,w,h,a*Math.PI/180);}
  c.shadowColor='transparent';c.fillStyle='rgba(126,52,66,.16)';ell(23,-6,4,4);ell(33,-38,3.5,3.5);ell(-38,-7,3.5,3.5);
  c.fillStyle='rgba(255,255,255,.6)';ell(-16,-5,14,3.5*t);ell(38,-51,7,2.5*t);
  c.fillStyle='#2b2b2b';
  if(dog.near<12){c.font=FONT(12);c.textAlign='center';c.fillText('>',50,-42);c.fillText('<',62,-42);}
  else{ell(50,-46,2.6,2.6);ell(62,-46,2.2,2.2);}
  c.restore();
  warnMarks(dog.y-r);
}
function warnMarks(topY){
  if(dog.near<26){
    const sx=dog.x+dog.face*8,sy=topY-4;
    c.fillStyle='#7cc4f0';c.beginPath();c.moveTo(sx,sy-9);c.quadraticCurveTo(sx+6,sy,sx,sy+4);c.quadraticCurveTo(sx-6,sy,sx,sy-9);c.fill();
  }
  if(dog.near<12){c.font=FONT(26);c.textAlign='center';c.lineWidth=4;c.strokeStyle='#ffffff';c.strokeText('！',dog.x,topY-14);c.fillStyle=DOGC;c.fillText('！',dog.x,topY-14);}
}
function flatPath(){
  c.beginPath();c.moveTo(-28,6);c.bezierCurveTo(-24,-4,-14,0,-8,-4);c.bezierCurveTo(0,-9,8,-2,14,-6);c.bezierCurveTo(20,-9,26,-2,30,6);c.closePath();c.fill();
}
function drawFlatDog(){
  const alpha=dog.inv>0&&Math.floor(time*12)%2?.45:1;
  c.save();c.globalAlpha=alpha;c.translate(dog.x+(dog.near<26?Math.sin(time*70)*1.4:0),dog.y);c.scale(dog.face,1);
  c.fillStyle=DOGC;flatPath();capsule(22,-7,6,10,.3);capsule(17,-7,6,10,-.3);
  c.fillStyle='rgba(255,255,255,.5)';ell(-6,-1,8,1.5);
  c.fillStyle='#2b2b2b';ell(16,1,1.8,1.8);ell(23,1,1.6,1.6);
  c.restore();
  warnMarks(dog.y-10);
}
function drawSkin(){
  c.save();c.translate(dog.x,dog.y);c.fillStyle=DOGC;flatPath();
  c.fillStyle='rgba(255,255,255,.5)';ell(-6,-1,8,1.5);
  c.fillStyle='#2b2b2b';c.font=FONT(11);c.textAlign='center';c.fillText('x x',13,3);
  c.restore();
}
function drawHog(){
  c.save();c.translate(hog.x,hog.y);c.scale(hogScale(),hogScale());
  if(hog.ball){
    c.rotate(hog.spin);c.fillStyle='#5e3a26';
    for(let i=0;i<14;i++){const a=i*Math.PI*2/14,a0=a-.18,a1=a+.18;c.beginPath();c.moveTo(Math.cos(a0)*11,Math.sin(a0)*11);c.lineTo(Math.cos(a)*19,Math.sin(a)*19);c.lineTo(Math.cos(a1)*11,Math.sin(a1)*11);c.closePath();c.fill();}
    c.fillStyle='#8b5a3c';ell(0,0,13,13);
    c.fillStyle='#f3d7b4';ell(5,4,5,4);c.fillStyle='#2b2b2b';ell(9,4,1.8,1.8);
    c.restore();return;
  }
  if(hog.ground&&Math.abs(hog.vx)>30)c.translate(0,-Math.abs(Math.sin(hog.bob))*2.5);
  c.scale(hog.face*(1+hog.squash),1-hog.squash);
  c.fillStyle='#715337';
  for(let i=0;i<9;i++){const a=-Math.PI-.35+i*(Math.PI-.25)/8,a0=a-.2,a1=a+.2;c.beginPath();c.moveTo(Math.cos(a0)*14,Math.sin(a0)*13);c.lineTo(Math.cos(a)*24,Math.sin(a)*22);c.lineTo(Math.cos(a1)*14,Math.sin(a1)*13);c.closePath();c.fill();}
  c.fillStyle=artGradient(0,-18,0,18,[[0,'#b18b5e'],[1,'#8f653e']],'#9f754a');ell(0,0,17,15);
  c.fillStyle='#5e3a26';ell(-7,14,5,3);ell(7,14,5,3);
  c.fillStyle=artGradient(5,-8,18,15,[[0,'#f7e6c7'],[1,'#ebcca4']],'#f3d7b4');ell(9,3,10,9);
  c.fillStyle='rgba(242,140,140,.55)';ell(6,8,3,2);
  c.fillStyle='#2b2b2b';ell(19,2,2.6,2.6);ell(10,-3,2.2,2.2);
  if(hog.blow){c.fillStyle='#2b2b2b';ell(20,6,2.4,2.4);}
  c.fillStyle='#f3d7b4';ell(2,-14,4,4);if(hog.reel)ell(-4,-12,3.5,3.5);
  c.restore();
  if(hog.revive>0){
    c.strokeStyle='#ffffff';c.lineWidth=6;c.beginPath();c.arc(hog.x,hog.y-36,12,0,Math.PI*2);c.stroke();
    c.strokeStyle=DOGC;c.lineWidth=4;c.beginPath();c.arc(hog.x,hog.y-36,12,-Math.PI/2,-Math.PI/2+Math.PI*2*hog.revive);c.stroke();
  }
}
function drawCactus(k){
  const top=k.base-k.h;
  c.fillStyle='#4f9e62';
  c.fillRect(k.x-9,top+9,18,k.h-9);ell(k.x,top+9,9,9);
  const ay=top+k.h*.45;c.fillRect(k.x-20,ay,12,7);capsule(k.x-17,ay-6,7,20,0);
  if(k.h>70){const by=top+k.h*.62;c.fillRect(k.x+8,by,12,7);capsule(k.x+17,by-7,7,22,0);}
  c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=1.2;
  for(let y=top+14;y<k.base-6;y+=11){c.beginPath();c.moveTo(k.x-9,y);c.lineTo(k.x-13,y-2);c.moveTo(k.x+9,y+5);c.lineTo(k.x+13,y+3);c.stroke();}
  c.fillStyle='#f28cb1';ell(k.x,top+1,4.5,3.5);
}
function drawWall(w){
  if(!w.alive)return;
  const cols=['#4c9be8','#f6c343','#5cc48a','#b07ce8'],rad=w.w/2;let i=0;
  for(let y=w.y+w.h-rad;y>w.y-rad/2;y-=rad*1.55){
    c.fillStyle=cols[i%4];ell(w.x+rad,y,rad,rad*1.05);
    c.fillStyle='rgba(255,255,255,.55)';ell(w.x+rad*.65,y-rad*.4,rad*.28,rad*.16);i++;
  }
}
function drawFan(f){
  c.save();
  c.strokeStyle='rgba(110,160,215,.4)';c.lineWidth=2;c.lineCap='round';
  for(let i=0;i<7;i++){const x=f.x+(i+.5)*f.w/7,y=f.y+f.h-((time*280+i*73)%f.h);c.beginPath();c.moveTo(x,y);c.lineTo(x,y+20);c.stroke();}
  c.fillStyle='#8d96a0';c.fillRect(f.x+12,(f.base??H)-18,f.w-24,18);
  c.fillStyle='#6c7580';const cx=f.x+f.w/2,sp=Math.sin(time*30)*.5+.5;ell(cx,(f.base??H)-18,(f.w/2-18)*sp+6,4);
  c.restore();
}
function drawHeat(z){
  if(z.k>0){
    c.fillStyle='rgba(255,170,60,.14)';c.fillRect(z.x,z.y,z.w,z.h);
    if(!z.until){const cx=z.x+z.w/2;c.strokeStyle='#8d96a0';c.lineWidth=2;c.beginPath();c.moveTo(cx,10);c.lineTo(cx,z.y+18);c.stroke();
    if(!drawProp('lamp',cx,z.y+49,76,65)){c.fillStyle='#e8814c';c.beginPath();c.moveTo(cx-22,z.y+40);c.lineTo(cx-10,z.y+18);c.lineTo(cx+10,z.y+18);c.lineTo(cx+22,z.y+40);c.closePath();c.fill();
    c.fillStyle='#ffd36b';ell(cx,z.y+42,9,5);}
    c.fillStyle='#e8814c';c.font=FONT(13);c.textAlign='center';c.fillText('热灯',cx,z.y+66);}
  }else{
    c.fillStyle='rgba(120,190,255,.15)';c.fillRect(z.x,z.y,z.w,z.h);
    c.fillStyle='rgba(255,255,255,.9)';
    for(let i=0;i<14;i++){const x=z.x+((i*53+Math.sin(time+i)*12)%z.w+z.w)%z.w,y=z.y+((time*40+i*61)%z.h);ell(x,y,2,2);}
    c.fillStyle='#4c88c9';c.font=FONT(13);c.textAlign='center';c.fillText('冷风',z.x+z.w/2,z.y+18);
  }
}

