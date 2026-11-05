// The painted triangles are the hazards; their eight-pixel backing is solid.
function downwardTeeth(x,y,width,pitch,depth,kind){
 const teeth=[];
 for(let offset=0;offset<width;offset+=pitch){const w=Math.min(pitch,width-offset);teeth.push({x:x+offset,y,w,h:depth,kind,points:[{x:x+offset,y},{x:x+offset+w/2,y:y+depth},{x:x+offset+w,y}]});}
 return teeth;
}
function cross2(a,b,p){return(b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x);}
function pointInTriangle(p,t){const a=cross2(t[0],t[1],p),b=cross2(t[1],t[2],p),d=cross2(t[2],t[0],p);return(a>=0&&b>=0&&d>=0)||(a<=0&&b<=0&&d<=0);}
function pointSegmentD2(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,n=dx*dx+dy*dy,u=n?clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/n,0,1):0;return(p.x-a.x-u*dx)**2+(p.y-a.y-u*dy)**2;}
function segmentD2(a,b,p,q){
 const intersects=Math.max(Math.min(a.x,b.x),Math.min(p.x,q.x))<=Math.min(Math.max(a.x,b.x),Math.max(p.x,q.x))+1e-9&&Math.max(Math.min(a.y,b.y),Math.min(p.y,q.y))<=Math.min(Math.max(a.y,b.y),Math.max(p.y,q.y))+1e-9&&cross2(a,b,p)*cross2(a,b,q)<=0&&cross2(p,q,a)*cross2(p,q,b)<=0;
 return intersects?0:Math.min(pointSegmentD2(a,p,q),pointSegmentD2(b,p,q),pointSegmentD2(p,a,b),pointSegmentD2(q,a,b));
}
function capsuleHitsTriangle(body,triangle){
 const minX=Math.min(triangle[0].x,triangle[1].x,triangle[2].x),maxX=Math.max(triangle[0].x,triangle[1].x,triangle[2].x),minY=Math.min(triangle[0].y,triangle[1].y,triangle[2].y),maxY=Math.max(triangle[0].y,triangle[1].y,triangle[2].y);
 if(Math.max(body.a.x,body.b.x)+body.r<=minX||Math.min(body.a.x,body.b.x)-body.r>=maxX||Math.max(body.a.y,body.b.y)+body.r<=minY||Math.min(body.a.y,body.b.y)-body.r>=maxY)return false;
 if(pointInTriangle(body.a,triangle)||pointInTriangle(body.b,triangle))return true;
 return triangle.some((p,i)=>segmentD2(body.a,body.b,p,triangle[(i+1)%3])<body.r*body.r);
}
function dogCollisionCapsules(){
 const flat=isFlat(),s=flat?1:rr(dog.air)/57,sx=dog.face*s*(flat?1:1+dog.squash),sy=s*(flat?1:1-dog.squash),rot=flat?0:dog.rot,co=Math.cos(rot),si=Math.sin(rot);
 function world(x,y){const px=(x-(flat?0:5))*sx,py=(y+(flat?0:17))*sy;return{x:dog.x+px*co-py*si,y:dog.y+px*si+py*co};}
 const parts=flat?[[1,1,56,10,0],[22,-7,6,10,17],[17,-7,6,10,-17]]:DOG_PARTS;
 const body=parts.map(([x,y,w,h,deg])=>{
  if(!flat){const thickness=.8+.45*dog.air;if(w<h)w*=thickness;else h*=thickness;}
  const radius=Math.min(w,h)/2,half=Math.max(w,h)/2-radius,angle=deg*Math.PI/180+(w>=h?0:Math.PI/2),dx=Math.cos(angle)*half,dy=Math.sin(angle)*half;
  return{a:world(x-dx,y-dy),b:world(x+dx,y+dy),r:Math.max(.25,radius*Math.min(Math.abs(sx),Math.abs(sy))-.8)};
 });
 body.bounds={left:Infinity,right:-Infinity,top:Infinity,bottom:-Infinity};
 for(const p of body){body.bounds.left=Math.min(body.bounds.left,p.a.x-p.r,p.b.x-p.r);body.bounds.right=Math.max(body.bounds.right,p.a.x+p.r,p.b.x+p.r);body.bounds.top=Math.min(body.bounds.top,p.a.y-p.r,p.b.y-p.r);body.bounds.bottom=Math.max(body.bounds.bottom,p.a.y+p.r,p.b.y+p.r);}
 return body;
}
function dogTouchesSpikes(body=dogCollisionCapsules()){const box=body.bounds;return spikeTeeth.some(t=>t.x+t.w>box.left&&t.x<box.right&&t.y+t.h>box.top&&t.y<box.bottom&&body.some(p=>capsuleHitsTriangle(p,t.points)));}
function hogTouchesSpikes(){const p={x:hog.x,y:hog.y},r=(hog.ball?12:14)*hogScale(),body={a:p,b:p,r};return spikeTeeth.some(t=>t.x+t.w>p.x-r&&t.x<p.x+r&&t.y+t.h>p.y-r&&t.y<p.y+r&&capsuleHitsTriangle(body,t.points));}
function paintSpikeTooth(t){c.beginPath();c.moveTo(t.points[0].x,t.points[0].y);c.lineTo(t.points[1].x,t.points[1].y);c.lineTo(t.points[2].x,t.points[2].y);c.closePath();c.fill();}
