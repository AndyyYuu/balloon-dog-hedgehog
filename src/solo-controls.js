// Physical single-player keys map to the simulation's established action names.
const PLAYER_KEYS={KeyA:'ArrowLeft',KeyD:'ArrowRight',Space:'ArrowUp',ArrowLeft:'KeyA',ArrowRight:'KeyD',ArrowUp:'Space'};
function setPlayerHeld(code,source,on){setHeld(PLAYER_KEYS[code]||code,source,on);}
const companion={enabled:true,level:-1,jumpDelay:0,jumpTime:0};
function prepareCompanion(dt){
 if(companion.level!==idx){companion.level=idx;companion.jumpDelay=companion.jumpTime=0;}
 if(!companion.enabled||hurt>0)return;
 const manual=k=>{const sources=heldSources.get(k);return sources&&[...sources].some(s=>s!=='companion');};
 const command=(k,on)=>setHeld(k,'companion',on);
 command('KeyA',false);command('KeyD',false);command('Space',false);
 if(pressed('ArrowUp'))companion.jumpDelay=.16;
 if(companion.jumpDelay>0){companion.jumpDelay-=dt;if(companion.jumpDelay<=0)companion.jumpTime=.22;}
 if(companion.jumpTime>0){companion.jumpTime-=dt;if(!dog.riding&&!dog.cling&&dog.ground&&!manual('Space'))command('Space',true);}
 if(!L.memo||dog.state!=='ok'||dog.task||dog.docked||dog.riding||manual('KeyA')||manual('KeyD'))return;
 if(memo.rail&&!memo.rail.done)return;
 const side=dog.x<hog.x?-1:1,gap=95+Math.max(0,hogScale()-1)*22;
 let target=hog.x+side*gap;
 if(memo.stack&&!dog.seatOptOut&&!hog.ball)target=hog.x;
 if(dog.air>.42&&dog.y<hog.y-90)target=hog.x-25;
 if(memo.water&&!memo.water.frozen&&memo.water.y<300)target=hog.x+155;
 if(dog.cling)target=dog.x+100;
 const delta=target-dog.x,dir=Math.abs(delta)>10?Math.sign(delta):0;
 command('KeyA',dir<0);command('KeyD',dir>0);
 // Jump at an actual ledge or low obstacle; do not teleport or bypass hazards.
 if(dir&&dog.ground&&!dog.cling&&!dog.riding&&!memo.stack){
  const [hw,hh]=dogDims(),ahead=dog.x+dir*(hw+15),floor=groundAt(ahead);
  const step=solids.some(s=>s.y<dog.y+hh-8&&s.y>dog.y-85&&ahead>s.x&&ahead<s.x+s.w);
  if((floor>dog.y+hh+35||step)&&Math.abs(hog.x-dog.x)>90)command('Space',true);
 }
}
