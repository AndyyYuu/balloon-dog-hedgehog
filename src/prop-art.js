// Generated, transparent painted sprites. Geometry and state remain in the game simulation.
const PROP_BOUNDS={"apple":[0,9,1242,1236],"cage":[0,0,1483,1061],"cat":[0,0,1284,1199],"door":[55,33,717,1715],"fan":[0,0,1253,1254],"fridge":[95,0,1133,1230],"lamp":[0,17,1234,1204],"paw":[0,17,1251,1237],"plate":[30,27,2126,677],"pump":[0,16,1242,1238]};
const propArt={};
function drawProp(name,x,y,w,h,options={}){
 if(typeof Image==='undefined')return false;let img=propArt[name];if(!img){img=new Image();img.decoding='async';img.src=`assets/props/${name}.png`;propArt[name]=img;}if(!img?.complete||!img.naturalWidth)return false;
 const [sx,sy,sw,sh]=PROP_BOUNDS[name]||[0,0,img.naturalWidth,img.naturalHeight];
 const fit=Math.min(w/sw,h/sh),dw=options.stretch?w:sw*fit,dh=options.stretch?h:sh*fit;
 c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.globalAlpha*=options.alpha??1;
 if(options.flip){c.translate(x,y);c.scale(-1,1);x=0;y=0;}
 c.drawImage(img,sx,sy,sw,sh,x-dw*(options.anchorX??.5),y-dh*(options.anchorY??1),dw,dh);c.restore();return true;
}
function propIndicator(x,y,on,col='#75b49a'){
 c.save();c.fillStyle=on?col:'#c6bfa8';if(on){c.shadowColor=col;c.shadowBlur=12;}
 ell(x,y,3.5,3.5);c.shadowBlur=0;c.fillStyle='#fff9e9';ell(x-1,y-1,1,1);c.restore();
}
