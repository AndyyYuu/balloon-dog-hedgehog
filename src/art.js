function artGradient(x0,y0,x1,y1,stops,fallback){const g=c.createLinearGradient?.(x0,y0,x1,y1);if(!g?.addColorStop)return fallback;for(const [p,col]of stops)g.addColorStop(p,col);return g;}
function drawRoomBackdrop(){
 const palettes={practice:['#fcf7e9','#eef0df','#d4ddc2'],living:['#f7f1e4','#e8ead9','#c9d7bf'],study:['#fbf3e4','#efe3d0','#d8c2a5'],laundry:['#f1f7f1','#dce9e0','#b4cdbd'],bath:['#f1f8f3','#dceceb','#b3d1cc'],attic:['#f9f1e5','#eae0d9','#d4bfb1'],kitchen:['#fbf5e8','#e9e6d6','#c4cbb4']};const p=palettes[L.world]||palettes.practice;
 c.fillStyle=artGradient(0,0,0,H,[[0,p[0]],[1,p[1]]],p[0]);c.fillRect(cameraX-20,-20,W+40,H+40);
 // Quiet architectural details keep the route and characters in the foreground.
 const parallax=cameraX*.18;c.save();c.globalAlpha=.5;
 for(let x=Math.floor((cameraX-parallax)/550)*550+75;x<cameraX+W+150;x+=550){
  c.fillStyle='#fffcf2';rrPath(x+parallax,140,132,161,48);c.fill();c.fillStyle=artGradient(x,140,x+140,300,[[0,'#e5eddc'],[1,'#f6f0d9']],'#e6e9d8');rrPath(x+parallax+9,150,114,142,42);c.fill();c.strokeStyle='#fffaf0';c.lineWidth=5;c.beginPath();c.moveTo(x+parallax+66,149);c.lineTo(x+parallax+66,294);c.moveTo(x+parallax+9,220);c.lineTo(x+parallax+123,220);c.stroke();
  c.fillStyle=p[2];rrPath(x+parallax-9,294,150,8,3);c.fill();c.fillStyle='#c1cba8';c.beginPath();c.moveTo(x+parallax+98,287);c.quadraticCurveTo(x+parallax+84,251,x+parallax+108,254);c.quadraticCurveTo(x+parallax+126,254,x+parallax+112,287);c.fill();c.fillStyle='#d9b79d';c.fillRect(x+parallax+99,278,15,15);
 }
 c.restore();c.fillStyle=p[2]+'4d';c.fillRect(cameraX,332,W,2);c.strokeStyle=p[2]+'36';c.lineWidth=1;for(let x=Math.floor(cameraX/96)*96;x<cameraX+W;x+=96){c.beginPath();c.moveTo(x,335);c.lineTo(x,H);c.stroke();}
 c.fillStyle='#b7bbaa';c.fillRect(cameraX,H-9,W,9);
}
function drawRoomPlatforms(){
 for(const s of statics){c.save();const overhead=s.y<=26,floor=s.y>=400;
  c.shadowColor='#6d5c3e13';c.shadowBlur=9;c.shadowOffsetY=5;c.fillStyle=artGradient(s.x,s.y,s.x,s.y+s.h,[[0,overhead?'#bfad8f':'#ddc39b'],[1,overhead?'#d4c4a9':'#ead7b6']],overhead?'#cbb99a':'#dfc6a2');c.fillRect(s.x,s.y,s.w,s.h);c.shadowColor='transparent';
  c.fillStyle=overhead?'#a99575':'#a48f68';c.fillRect(s.x,overhead?s.y+s.h-5:s.y,s.w,5);c.fillStyle=overhead?'#e7d9bc':'#f5e3bc';c.fillRect(s.x,overhead?s.y+s.h-9:s.y+5,s.w,3);
  c.strokeStyle='#aa906d29';c.lineWidth=1;const left=Math.max(cameraX-30,s.x),right=Math.min(cameraX+W+30,s.x+s.w);
  if(floor){for(let y=s.y+23;y<Math.min(H,s.y+s.h);y+=27){c.beginPath();c.moveTo(left,y);c.lineTo(right,y);c.stroke();for(let x=Math.floor(left/105)*105+(Math.floor(y/27)%2)*53;x<right;x+=105){c.beginPath();c.moveTo(x,y);c.lineTo(x-20,y+27);c.stroke();}}}
  else{for(let x=Math.floor(left/90)*90;x<right;x+=90){c.beginPath();c.moveTo(x,s.y+6);c.lineTo(x,Math.min(H,s.y+s.h-9));c.stroke();}}
  c.restore();
 }
}
function drawActorShadows(){
 c.save();for(const [b,r,col]of[[hog,20*hogScale(),'#66553d'],[dog,isFlat()?25:rr(dog.air)*.68,'#9f5862']]){const ground=groundAt(b.x);const distance=Math.max(0,ground-b.y-15);if(ground>H||distance>220)continue;c.globalAlpha=.13*Math.max(.2,1-distance/260);c.fillStyle=col;ell(b.x,ground-1,r*(1+distance/400),3.4+distance/90);}c.restore();
}
